import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Phone, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/context/LocationContext';
import { getPlacesSourceByLocation } from '@/utils/tableRouting';
import { useToast } from '@/hooks/use-toast';

interface Place {
  id: string;
  name: string;
  description: string;
  short_description: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  category: string;
  entry_fee: string;
  opening_hours: string;
  rating: number;
  total_reviews: number;
  contact_number: string;
}

const PlacesToVisit = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { location } = useLocationContext();

  useEffect(() => {
    if (!location) {
      setPlaces([]);
      
      setTotalCount(0);
      setLoading(false);
      return;
    }

    fetchPlaces(currentPage, searchTerm, categoryFilter);
  }, [currentPage, searchTerm, categoryFilter, location]);

  const fetchPlaces = async (page = 1, search = '', category = 'all', retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Starting places fetch:', { page, search, category, retryCount, timestamp: new Date().toISOString() });
      
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      if (!location) {
        setPlaces([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      if (location === 'Bengaluru') {
        const { schema, table } = getPlacesSourceByLocation(location);
        console.log('Fetching from schema-aware source:', { schema, table });
        const startTime = Date.now();
        const sb = supabase as unknown as { schema?: (name: string) => typeof supabase };
        const client = sb.schema ? sb.schema(schema) : supabase;
        const query = client
          .from(table as never)
          .select('id,name,description,short_description,address,city,state,images,category,entry_fee,opening_hours,rating,total_reviews,contact_number')
          .order('rating', { ascending: false })
          .range(from, to);
        const { data, error } = await query as unknown as { data: Place[] | null; error: unknown };
        const queryTime = Date.now() - startTime;
        console.log('Dynamic table query result', { length: data?.length || 0, queryTime });
        if (!error && data && data.length > 0) {
          const rows = (data ?? []) as Place[];
          let list: Place[] = rows;
          if (location === 'Bengaluru') {
            list = rows.filter(p => ((p.city || p.state || '').toLowerCase().includes('bengaluru')));
          }
          setPlaces(list);
          setTotalCount(list.length);
          return;
        }
      }

      // Single query to get both data and count
      let query = supabase
        .from('places_to_visit')
        .select('id,name,description,short_description,address,city,state,images,category,entry_fee,opening_hours,rating,total_reviews,contact_number');

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply category filter
      if (category !== 'all') {
        query = query.eq('category', category);
      }

      console.log('Executing Supabase query...');
      const startTime = Date.now();
      
      // Add timeout to the query
      const { data, error, count } = await query
        .order('rating', { ascending: false })
        .range(from, to);
      const queryTime = Date.now() - startTime;
      console.log(`Query completed in ${queryTime}ms`);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log('Places fetched successfully:', { 
        dataLength: data?.length || 0, 
        totalCount: count || 0, 
        page, 
        search, 
        category,
        queryTime,
        timestamp: new Date().toISOString()
      });
      
      let list = data || [];
      if (location === 'Bengaluru') {
        list = list.filter(p => {
          const s = (p.city || p.state || '').toLowerCase();
          return s.includes('bengaluru') || s.includes('bangalore');
        });
      }
      setPlaces(list);
      setTotalCount(list.length);
    } catch (error) {
      console.error('Error fetching places:', error);
      
      // Retry logic
      if (retryCount < maxRetries && (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network')))) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setError(`Connection issue. Retrying... (${retryCount + 1}/${maxRetries})`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchPlaces(page, search, category, retryCount + 1);
      }
      
      console.error('Query details:', { page, search, category, from: (page - 1) * itemsPerPage, to: (page - 1) * itemsPerPage + itemsPerPage - 1 });
      setError(`Failed to load places: ${error instanceof Error ? error.message : 'Unknown error'}. ${retryCount > 0 ? `Tried ${retryCount + 1} times.` : 'Click "Try Again" to retry.'}`);
      setPlaces([]);
      setTotalCount(0);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      }
  };

  

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    setLoading(true);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
    setLoading(true);
  };

  const getCategories = () => {
    const categories = places.map(p => p.category).filter(Boolean);
    return [...new Set(categories)];
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Places</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchPlaces(currentPage, searchTerm, categoryFilter)} variant="outline">
              Try Again
            </Button>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Places to Visit in Rajampet
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the best tourist attractions, historical sites, and recreational spots 
            around Rajampet. Discover amazing places perfect for weekend outings and cultural exploration.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search places by name or category..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {places.length} of {totalCount} place{totalCount !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
          </p>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => (
            <Card 
              key={place.id} 
              className="card-elegant hover-lift cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/places/${place.id}`)}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={place.images?.[0] || '/placeholder.svg'} 
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {place.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{place.rating}</span>
                    <span className="text-xs text-muted-foreground">({place.total_reviews})</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{place.category}</Badge>
                  <Badge variant="outline">{place.entry_fee}</Badge>
                </div>
                
                <CardDescription className="line-clamp-2">
                  {place.short_description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{place.address}</span>
                  </div>
                  
                  {place.opening_hours && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{place.opening_hours}</span>
                    </div>
                  )}
                  
                  {place.contact_number && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{place.contact_number}</span>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => navigate(`/places/${place.id}`)}>
                  Learn More →
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

        {places.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No places found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlacesToVisit;
