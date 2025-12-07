import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Phone, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { populateRestaurants } from '@/utils/populateRestaurants';
import { getRestaurantsSourceByLocation } from '@/utils/tableRouting';
import { useLocationContext } from '@/context/LocationContext';
 
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  short_description: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  cuisine_type: string;
  price_range: string;
  rating: number;
  total_reviews: number;
  opening_hours: string;
  contact_number: string;
}

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { location } = useLocationContext();

  useEffect(() => {
    if (!location) {
      setRestaurants([]);
      
      setTotalCount(0);
      setLoading(false);
      return;
    }

    fetchRestaurants(currentPage, searchTerm, cuisineFilter, priceFilter);
  }, [currentPage, searchTerm, cuisineFilter, priceFilter, location]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setLoading(true);
  };

  const handleFilterChange = (type: 'cuisine' | 'price', value: string) => {
    if (type === 'cuisine') {
      setCuisineFilter(value);
    } else {
      setPriceFilter(value);
    }
    setCurrentPage(1);
    setLoading(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchRestaurants = async (page = 1, search = '', cuisine = 'all', priceRange = 'all', retryCount = 0) => {
    const maxRetries = 2;

    try {
      setLoading(true);
      setError(null);
      console.log('Starting restaurants fetch:', { page, search, cuisine, priceRange, retryCount, timestamp: new Date().toISOString() });

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      if (!location) {
        setRestaurants([]);
        setCardRestaurants([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('restaurants')
        .select('id,name,short_description,address,city,state,images,cuisine_type,price_range,rating,total_reviews,opening_hours,contact_number');

      // Apply search filter if provided
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
      }

      // Apply cuisine filter
      if (cuisine !== 'all') {
        query = query.eq('cuisine_type', cuisine);
      }

      // Apply price range filter
      if (priceRange !== 'all') {
        query = query.eq('price_range', priceRange);
      }

      console.log('Executing Supabase query with filters:', { search, cuisine, priceRange });
      const startTime = Date.now();

      const { data, error } = await query
        .order('rating', { ascending: false })
        .range(from, to);

      const queryTime = Date.now() - startTime;
      console.log(`Query completed in ${queryTime}ms`);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Restaurants fetched successfully:', {
        dataLength: data?.length || 0,
        page,
        search,
        cuisine,
        priceRange,
        queryTime,
        timestamp: new Date().toISOString()
      });

      setRestaurants(data || []);
      setTotalCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching restaurants:', error);

      if (retryCount < maxRetries && (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network')))) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setError(`Connection issue. Retrying... (${retryCount + 1}/${maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchRestaurants(page, search, cuisine, priceRange, retryCount + 1);
      }

      setError(`Failed to load restaurants: ${error instanceof Error ? error.message : 'Unknown error'}.`);
    } finally {
      setLoading(false);
    }
  };

  

  // Remove client-side filtering since we're using server-side filtering

  const getCuisineTypes = () => {
    const types = restaurants.map(r => r.cuisine_type).filter(Boolean);
    return [...new Set(types)];
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
            <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Restaurants</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchRestaurants(currentPage, searchTerm, cuisineFilter, priceFilter)} variant="outline">
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
            Restaurants Near You
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover amazing restaurants and dining options around your campus. 
            From quick bites to fine dining, find the perfect place for every craving.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants by name or city..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={cuisineFilter} onValueChange={(value) => handleFilterChange('cuisine', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Cuisine Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {getCuisineTypes().map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={(value) => handleFilterChange('price', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="₹100">Budget (₹100-300)</SelectItem>
                <SelectItem value="₹300">Mid-range (₹300-600)</SelectItem>
                <SelectItem value="₹600">Premium (₹600+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {restaurants.length} of {totalCount} restaurant{totalCount !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
          </p>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className="card-elegant hover-lift cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={restaurant.images?.[0] || '/placeholder.svg'} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                    <span className="text-xs text-muted-foreground">({restaurant.total_reviews})</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                  <Badge variant="outline">{restaurant.price_range}</Badge>
                </div>
                
                <CardDescription className="line-clamp-2">
                  {restaurant.short_description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  {restaurant.opening_hours && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{restaurant.opening_hours}</span>
                    </div>
                  )}
                  
                  {restaurant.contact_number && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{restaurant.contact_number}</span>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Details →
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

        {restaurants.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Restaurants;
