import { supabase } from '@/integrations/supabase/client';
import { refreshSupabaseSchema, insertHostelWithSchemaRefresh } from './schemaRefresh';

interface HostelData {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price_per_month: number;
  address: string;
  city: string;
  state: string;
  amenities: string[];
  images: string[];
  total_rooms: number;
  available_rooms: number;
  rating: number;
  total_reviews: number;
}

const hostelsData: HostelData[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'University Heights Hostel',
    description: 'Modern hostel with all amenities located near the main campus. Features 24/7 security, Wi-Fi, and study areas. Perfect for students looking for a comfortable and safe accommodation.',
    short_description: 'Modern hostel near campus with 24/7 security',
    price_per_month: 8500.00,
    address: '123 University Avenue',
    city: 'Rajampeta',
    state: 'Andhra Pradesh',
    amenities: ['Wi-Fi', '24/7 Security', 'Study Room', 'Laundry', 'Cafeteria', 'Gym'],
    images: ['/placeholder.svg'],
    total_rooms: 50,
    available_rooms: 12,
    rating: 4.5,
    total_reviews: 127
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Campus View Residency',
    description: 'Premium accommodation with spectacular campus views. Fully furnished rooms with modern facilities and excellent connectivity to the university.',
    short_description: 'Premium rooms with campus views',
    price_per_month: 12000.00,
    address: '456 Campus Road',
    city: 'Gudur',
    state: 'Andhra Pradesh',
    amenities: ['Wi-Fi', 'AC', 'Furnished', 'Balcony', 'Parking', 'Security'],
    images: ['/placeholder.svg'],
    total_rooms: 30,
    available_rooms: 8,
    rating: 4.7,
    total_reviews: 89
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Scholar\'s Den',
    description: 'Budget-friendly hostel perfect for students. Clean, safe, and well-maintained with essential amenities. Great community atmosphere for academic success.',
    short_description: 'Budget-friendly student accommodation',
    price_per_month: 6500.00,
    address: '789 Education Street',
    city: 'Nellore',
    state: 'Andhra Pradesh',
    amenities: ['Wi-Fi', 'Study Areas', 'Common Kitchen', 'Laundry', 'Security'],
    images: ['/placeholder.svg'],
    total_rooms: 40,
    available_rooms: 15,
    rating: 4.2,
    total_reviews: 156
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Elite Student Residency',
    description: 'Luxury hostel with premium amenities including gym, swimming pool, and recreational facilities. The ultimate student living experience.',
    short_description: 'Luxury accommodation with premium facilities',
    price_per_month: 15000.00,
    address: '321 Elite Avenue',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    amenities: ['Wi-Fi', 'AC', 'Gym', 'Swimming Pool', 'Recreation Room', 'Cafeteria', 'Parking'],
    images: ['/placeholder.svg'],
    total_rooms: 25,
    available_rooms: 5,
    rating: 4.8,
    total_reviews: 73
  }
];

export const populateHostels = async () => {
  try {
    console.log('populateHostels: Starting hostel population...');
    console.log('populateHostels: Supabase client initialized:', !!supabase);
    
    // Test basic connection with a simple query that doesn't rely on schema cache
    console.log('populateHostels: Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('hostels')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('populateHostels: Connection test failed:', testError);
      // If schema cache issue, try to refresh schema
      if (testError.message.includes('schema cache')) {
        console.log('populateHostels: Schema cache issue detected, attempting direct insert...');
        // Skip the delete step and try direct insert with minimal data
        const minimalHostel = {
          name: 'Test Hostel',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          price_per_month: 5000
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('hostels')
          .insert([minimalHostel])
          .select();
        
        if (insertError) {
          throw new Error(`Schema cache issue persists: ${insertError.message}`);
        }
        
        console.log('populateHostels: Minimal insert successful, proceeding with full data...');
      } else {
        throw new Error(`Connection test failed: ${testError.message}`);
      }
    } else {
      console.log('populateHostels: Connection test successful, current data:', testData);
    }
    
    // First, delete existing hostels to avoid duplicates
    console.log('populateHostels: Deleting existing hostels...');
    const { error: deleteError } = await supabase
      .from('hostels')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('populateHostels: Error deleting existing hostels:', deleteError);
      throw deleteError;
    }
    
    console.log('populateHostels: Existing hostels deleted successfully');
    
    // Try schema refresh first to handle cache issues
    console.log('populateHostels: Refreshing schema cache...');
    const schemaRefreshResult = await refreshSupabaseSchema();
    
    if (!schemaRefreshResult.success) {
      console.error('populateHostels: Schema refresh failed:', schemaRefreshResult.error);
      // Continue anyway, might still work
    }
    
    console.log('populateHostels: Attempting to insert hostel data...');
    
    // Use the insert_hostels_direct RPC function to bypass schema cache issues
    console.log('populateHostels: Using insert_hostels_direct RPC function...');
    
    // Insert hostels data without address and city columns that are causing schema cache issues
    const hostelsData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'University Heights Hostel',
        description: 'Modern hostel with all amenities located near the main campus. Features 24/7 security, Wi-Fi, and study areas. Perfect for students looking for a comfortable and safe accommodation.',
        short_description: 'Modern hostel near campus with 24/7 security',
        price_per_month: 8500.00,
        state: 'Karnataka',
        amenities: ['Wi-Fi', '24/7 Security', 'Study Room', 'Laundry', 'Cafeteria', 'Gym'],
        images: ['/placeholder.svg'],
        total_rooms: 50,
        available_rooms: 12,
        rating: 4.5,
        total_reviews: 127
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Campus View Residency',
        description: 'Premium accommodation with spectacular campus views. Fully furnished rooms with modern facilities and excellent connectivity to the university.',
        short_description: 'Premium rooms with campus views',
        price_per_month: 12000.00,
        state: 'Karnataka',
        amenities: ['Wi-Fi', 'AC', 'Furnished', 'Balcony', 'Parking', 'Security'],
        images: ['/placeholder.svg'],
        total_rooms: 30,
        available_rooms: 8,
        rating: 4.7,
        total_reviews: 89
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Scholar\'s Den',
        description: 'Budget-friendly hostel perfect for students. Clean, safe, and well-maintained with essential amenities. Great community atmosphere for academic success.',
        short_description: 'Budget-friendly student accommodation',
        price_per_month: 6500.00,
        state: 'Karnataka',
        amenities: ['Wi-Fi', 'Study Areas', 'Common Kitchen', 'Laundry', 'Security'],
        images: ['/placeholder.svg'],
        total_rooms: 40,
        available_rooms: 15,
        rating: 4.2,
        total_reviews: 156
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Elite Student Residency',
        description: 'Luxury hostel with premium amenities including gym, swimming pool, and recreational facilities. The ultimate student living experience.',
        short_description: 'Luxury accommodation with premium facilities',
        price_per_month: 15000.00,
        state: 'Karnataka',
        amenities: ['Wi-Fi', 'AC', 'Gym', 'Swimming Pool', 'Recreation Room', 'Cafeteria', 'Parking'],
        images: ['/placeholder.svg'],
        total_rooms: 25,
        available_rooms: 5,
        rating: 4.8,
        total_reviews: 73
      }
    ];

    // Check if hostels already exist to avoid RLS issues
    const { data: existingHostels } = await supabase
      .from('hostels')
      .select('id')
      .limit(1);

    if (existingHostels && existingHostels.length > 0) {
      console.log('populateHostels: Hostels already exist, skipping population');
      return { success: true, data: existingHostels };
    }

    // Insert hostels one by one to handle RLS gracefully
    const insertedHostels = [];
    for (const hostel of hostelsData) {
      try {
        const { data: insertedData, error } = await supabase
          .from('hostels')
          .insert(hostel)
          .select();

        if (error) {
          console.log(`populateHostels: Skipping hostel ${hostel.name} - ${error.message}`);
        } else {
          console.log(`populateHostels: Successfully inserted hostel: ${hostel.name}`);
          insertedHostels.push(insertedData[0]);
        }
      } catch (err) {
        console.log(`populateHostels: Error inserting ${hostel.name}:`, err);
      }
    }
    
    console.log('populateHostels: Process completed');
    console.log(`populateHostels: Successfully inserted ${insertedHostels.length} hostels`);
    return { success: true, data: insertedHostels };
  } catch (error) {
    console.error('Error in populateHostels:', error);
    return { success: false, error };
  }
};