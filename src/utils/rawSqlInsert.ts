import { supabase } from '@/integrations/supabase/client';

// Alternative approach using only standard Supabase client methods
export const rawSqlHostelInsert = async () => {
  try {
    console.log('Starting alternative hostel insertion...');
    
    // First, try to delete existing hostels
    const { error: deleteError } = await supabase
      .from('hostels')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.warn('Delete operation failed, continuing with insert:', deleteError);
    } else {
      console.log('Existing hostels deleted successfully');
    }
    
    // Define hostels data with explicit field mapping
    const hostelsData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'University Heights Hostel',
        description: 'Modern hostel with all amenities located near the main campus. Features 24/7 security, Wi-Fi, and study areas. Perfect for students looking for a comfortable and safe accommodation.',
        short_description: 'Modern hostel near campus with 24/7 security',
        price_per_month: 8500.00,
        address: '123 University Avenue',
        city: 'Bangalore',
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
        address: '456 Campus Road',
        city: 'Bangalore',
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
        address: '789 Education Street',
        city: 'Bangalore',
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
        address: '321 Elite Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        amenities: ['Wi-Fi', 'AC', 'Gym', 'Swimming Pool', 'Recreation Room', 'Cafeteria', 'Parking'],
        images: ['/placeholder.svg'],
        total_rooms: 25,
        available_rooms: 5,
        rating: 4.8,
        total_reviews: 73
      }
    ];
    
    console.log('Attempting bulk upsert...');
    
    // Try bulk upsert first
    const { data, error } = await supabase
      .from('hostels')
      .upsert(hostelsData, { onConflict: 'id' })
      .select();
    
    if (!error) {
      console.log('Bulk upsert successful');
      return { success: true, data, method: 'bulk_upsert' };
    }
    
    console.warn('Bulk upsert failed, trying individual inserts:', error);
    
    // Fallback: Individual inserts with basic insert (no upsert)
    const insertedHostels = [];
    const errors = [];
    
    for (const hostel of hostelsData) {
      console.log(`Attempting to insert: ${hostel.name}`);
      
      // Try basic insert
      const { data: insertData, error: insertError } = await supabase
        .from('hostels')
        .insert(hostel)
        .select();
      
      if (insertError) {
        console.error(`Failed to insert ${hostel.name}:`, insertError);
        errors.push({ hostel: hostel.name, error: insertError });
      } else {
        console.log(`Successfully inserted: ${hostel.name}`);
        insertedHostels.push(insertData[0]);
      }
    }
    
    if (insertedHostels.length > 0) {
      return { 
        success: true, 
        data: insertedHostels, 
        method: 'individual_insert',
        errors: errors.length > 0 ? errors : undefined
      };
    }
    
    return { 
      success: false, 
      error: 'All insertion attempts failed', 
      errors 
    };
    
  } catch (error) {
    console.error('Error in rawSqlHostelInsert:', error);
    return { success: false, error };
  }
};