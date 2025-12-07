import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Users, Wifi, Shield, Car, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { getHostelsWithFallback, HostelData, showConnectionStatus } from '@/utils/fallbackData';
import { useLocationContext } from '@/context/LocationContext';
import { getHostelSourceByLocation } from '@/utils/tableRouting';

const Hostels = () => {
  const [hostels, setHostels] = useState<HostelData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const { location } = useLocationContext();

  useEffect(() => {
    if (!location) {
      setHostels([]);
      
      setTotalCount(0);
      setIsOfflineMode(false);
      setLoading(false);
      return;
    }
    fetchHostels(currentPage, searchTerm);
  }, [currentPage, searchTerm, location]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    setLoading(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchHostels = async (page = 1, search = '', retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 Starting hostels fetch:', { page, search, retryCount, timestamp: new Date().toISOString() });
      
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      if (!location) {
        setHostels([]);
        setCardHostels([]);
        setTotalCount(0);
        setIsOfflineMode(false);
        setLoading(false);
        return;
      }

      

      if (location === 'Bengaluru') {
        const { schema, table } = getHostelSourceByLocation(location);
        console.log('Fetching from schema-aware source:', { schema, table });
        const startTime = Date.now();
        const sb = supabase as unknown as { schema?: (name: string) => typeof supabase };
        const client = sb.schema ? sb.schema(schema) : supabase;
        const query = client
          .from(table as never)
          .select('*', { count: 'exact' })
          .order('rating', { ascending: false })
          .range(from, to);
        const { data, error, count } = await query as unknown as { data: HostelData[] | null; error: unknown; count: number | null };
        const queryTime = Date.now() - startTime;
        console.log('Dynamic table query result', { length: data?.length || 0, count: count || 0, queryTime });
        if (error) {
          console.error('Dynamic table query error:', error);
        } else if (data && data.length > 0) {
          setHostels(data);
          setTotalCount(data.length);
          setIsOfflineMode(false);
          return;
        }
      }

      if (location !== 'Bengaluru') {
        let query = supabase
          .from('hostels')
          .select('*', { count: 'exact' })
          .order('rating', { ascending: false })
          .range(from, to);

        if (search.trim()) {
          query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
        }

        const startTime = Date.now();
        const { data, error, count } = await query as unknown as { data: HostelData[] | null; error: unknown; count: number | null };
        const queryTime = Date.now() - startTime;
        console.log('Public hostels query result', { length: data?.length || 0, count: count || 0, queryTime });
        if (!error && data && data.length > 0) {
          const list = data;
          setHostels(list);
          setTotalCount(list.length);
          setIsOfflineMode(false);
          return;
        }
      }

      // Try to get hostels with fallback
      const data = location === 'Bengaluru' ? (await import('@/utils/fallbackData')).mockHostels : await getHostelsWithFallback();
      
      // Apply search filter if provided
      let filteredData = data;
      if (search.trim()) {
        filteredData = data.filter(hostel => 
          hostel.name.toLowerCase().includes(search.toLowerCase()) ||
          hostel.city.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (location === 'Bengaluru') {
        const loc = (h: HostelData) => (h.city || h.state || '').toLowerCase();
        filteredData = filteredData.filter(h => {
          const s = loc(h);
          return s.includes('bengaluru') || s.includes('bangalore');
        });
      } else {
        filteredData = filteredData.filter(h => (h.city || h.state || '').toLowerCase().includes('rajampeta'));
      }
      
      // Apply pagination
      const paginatedData = filteredData.slice(from, to + 1);
      const totalCount = filteredData.length;
      
      // Check if we're using fallback data
      const isUsingFallback = data.some(hostel => hostel.id.startsWith('550e8400'));
      setIsOfflineMode(isUsingFallback);
      
      console.log('✅ Hostels fetched successfully:', { 
        dataLength: paginatedData.length, 
        totalCount, 
        page, 
        search,
        isUsingFallback,
        timestamp: new Date().toISOString()
      });
      
      setHostels(paginatedData);
      setTotalCount(totalCount);
      
      showConnectionStatus(!isUsingFallback);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      
      // Enhanced retry logic with better error messages
      if (retryCount < maxRetries && (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network') || error.message.includes('Database error')))) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setError(`Connection issue. Retrying... (${retryCount + 1}/${maxRetries})`);
        
        // Progressive backoff
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return fetchHostels(page, search, retryCount + 1);
      }
      
      console.error('Query details:', { page, search, from: (page - 1) * itemsPerPage, to: (page - 1) * itemsPerPage + itemsPerPage - 1 });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load hostels: ${errorMessage}. ${retryCount > 0 ? `Tried ${retryCount + 1} times.` : 'Click "Try Again" to retry.'}`);
      setHostels([]);
      setTotalCount(0);
      setIsOfflineMode(true);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Remove client-side filtering since we're using server-side filtering

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return Wifi;
    if (lowerAmenity.includes('security')) return Shield;
    if (lowerAmenity.includes('parking')) return Car;
    return Users;
  };

  

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Please select the Location</h3>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Discover Hostels</h1>
          <p className="text-xl text-muted-foreground">
            Find the perfect student accommodation near your campus
          </p>
          {isOfflineMode && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Offline Mode:</strong> Showing sample data. Database connection unavailable.
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hostels by name or city..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {hostels.length} of {totalCount} hostel{totalCount !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
          </p>
        </div>

        {/* Hostels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hostels.map((hostel) => (
            <Card 
              key={hostel.id} 
              className="card-elegant hover-lift cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/hostels/${hostel.id}`)}
            >
              <div className="relative">
                {hostel.images && hostel.images.length > 0 ? (
                  <img 
                    src={hostel.images[0]} 
                    alt={hostel.name} 
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Building className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
                    {hostel.available_rooms} available
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {hostel.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hostel.city}, {hostel.state}
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-semibold">{hostel.rating}</span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({hostel.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₹{hostel.price_per_month.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {hostel.short_description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(hostel.amenities || []).slice(0, 3).map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />
                        {amenity}
                      </Badge>
                    );
                  })}
                  {(hostel.amenities || []).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(hostel.amenities || []).length - 3} more
                    </Badge>
                  )}
                </div>

                <Button variant="default" className="w-full group-hover:variant-hero transition-all duration-300" onClick={() => navigate(`/hostels/${hostel.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {hostels.length === 0 && cardHostels.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">No hostels found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all hostels
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Hostels;
