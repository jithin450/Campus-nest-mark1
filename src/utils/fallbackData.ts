// Fallback data for when Supabase is unavailable

export interface HostelData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price_per_month: number;
  amenities: string[] | null;
  description: string | null;
  short_description?: string | null;
  images: string[] | null;
  available_rooms: number | null;
  total_rooms: number | null;
  rating: number | null;
  total_reviews: number | null;
  created_at: string;
  updated_at: string;
}

export const mockHostels: HostelData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Campus View Hostel",
    address: "123 University Avenue",
    city: "Bangalore",
    state: "Karnataka",
    price_per_month: 8000,
    amenities: ["WiFi", "Laundry", "Mess", "Study Room"],
    description: "A comfortable hostel with all basic amenities, located close to the main campus.",
    short_description: "Comfortable hostel near campus",
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400"],
    available_rooms: 15,
    total_rooms: 50,
    rating: 4.2,
    total_reviews: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Green Valley Residence",
    address: "456 Campus Road",
    city: "Bangalore",
    state: "Karnataka",
    price_per_month: 12000,
    amenities: ["WiFi", "Gym", "Cafeteria", "Parking", "Security"],
    description: "Premium hostel with modern facilities and excellent security.",
    short_description: "Premium hostel with modern facilities",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"],
    available_rooms: 8,
    total_rooms: 30,
    rating: 4.5,
    total_reviews: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Student Haven",
    address: "789 Education Street",
    city: "Bangalore",
    state: "Karnataka",
    price_per_month: 6500,
    amenities: ["WiFi", "Mess", "Common Room"],
    description: "Budget-friendly option with basic amenities in the heart of the city.",
    short_description: "Budget-friendly student accommodation",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
    available_rooms: 22,
    total_rooms: 40,
    rating: 3.8,
    total_reviews: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Tech Hub Hostel",
    address: "321 Elite Avenue",
    city: "Bangalore",
    state: "Karnataka",
    price_per_month: 10000,
    amenities: ["High-Speed WiFi", "Co-working Space", "Cafeteria", "Laundry"],
    description: "Perfect for tech students with high-speed internet and co-working spaces.",
    short_description: "Tech-focused hostel with co-working spaces",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"],
    available_rooms: 12,
    total_rooms: 25,
    rating: 4.3,
    total_reviews: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Peaceful Retreat",
    address: "654 Garden Lane",
    city: "Bangalore",
    state: "Karnataka",
    price_per_month: 7500,
    amenities: ["WiFi", "Garden", "Mess", "Study Hall", "Sports Facility"],
    description: "Quiet environment perfect for focused studying with recreational facilities.",
    short_description: "Peaceful hostel with recreational facilities",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"],
    available_rooms: 18,
    total_rooms: 35,
    rating: 4.1,
    total_reviews: 54,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    return response.ok;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
};

export const getHostelsWithFallback = async (): Promise<HostelData[]> => {
  const isConnected = await checkSupabaseConnection();
  
  if (!isConnected) {
    console.warn('Supabase unavailable, using fallback data');
    return mockHostels;
  }
  
  try {
    // Try to fetch from Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('hostels')
      .select('*');
    
    if (error) throw error;
    
    return data && data.length > 0 ? data : mockHostels;
  } catch (error) {
    console.warn('Failed to fetch from Supabase, using fallback data:', error);
    return mockHostels;
  }
};

export const showConnectionStatus = (isConnected: boolean) => {
  if (isConnected) {
    console.log('✅ Connected to Supabase successfully');
  } else {
    console.warn('⚠️ Using offline mode with mock data');
  }
};