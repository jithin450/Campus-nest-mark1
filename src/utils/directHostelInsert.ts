import { supabase } from '@/integrations/supabase/client';

interface MinimalHostel {
  id: string;
  name: string;
  price_per_month: number;
  address: string;
  city: string;
  state: string;
}

export const directHostelInsert = async () => {
  try {
    console.log('Starting direct hostel insertion with field isolation...');
    
    // First, delete existing hostels
    const { error: deleteError } = await supabase
      .from('hostels')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.warn('Delete operation failed, continuing with insert:', deleteError);
    } else {
      console.log('Existing hostels deleted successfully');
    }
    
    // Try inserting with a minimal hostel record first to test basic insertion
     const minimalHostel = {
       id: '550e8400-e29b-41d4-a716-446655440001',
       name: 'University Heights Hostel',
       price_per_month: 8500.00,
       address: '123 University Avenue', // Include address as required by schema
       city: 'Bangalore',
       state: 'Karnataka'
     };
     
     console.log('Attempting to insert minimal hostel record...');
     const { data: minimalData, error: minimalError } = await supabase
       .from('hostels')
       .insert(minimalHostel)
       .select();
     
     if (minimalError) {
       console.error('Failed to insert minimal hostel:', minimalError);
       
       // Try using type assertion to bypass schema cache issues
       console.log('Trying with type assertion...');
       const { data: assertionData, error: assertionError } = await supabase
         .from('hostels')
         .insert(minimalHostel as MinimalHostel)
         .select();
       
       if (assertionError) {
         console.error('Failed with type assertion:', assertionError);
         return { success: false, error: assertionError, method: 'type_assertion_failed' };
       }
       
       return { success: true, data: assertionData, method: 'type_assertion' };
     }
     
     console.log('Successfully inserted minimal hostel');
     
     // Now try to update with full data
     const fullUpdateData = {
       description: 'Modern hostel with all amenities located near the main campus. Features 24/7 security, Wi-Fi, and study areas. Perfect for students looking for a comfortable and safe accommodation.',
       short_description: 'Modern hostel near campus with 24/7 security',
       amenities: ['Wi-Fi', '24/7 Security', 'Study Room', 'Laundry', 'Cafeteria', 'Gym'],
       images: ['/placeholder.svg'],
       total_rooms: 50,
       available_rooms: 12,
       rating: 4.5,
       total_reviews: 127
     };
     
     console.log('Attempting to update with full data...');
     const { data: updateData, error: updateError } = await supabase
       .from('hostels')
       .update(fullUpdateData)
       .eq('id', '550e8400-e29b-41d4-a716-446655440001')
       .select();
     
     if (updateError) {
       console.error('Failed to update with full data:', updateError);
       return { success: true, data: minimalData, method: 'minimal_insert_only', warning: 'Full data could not be updated' };
     }
     
     console.log('Successfully updated with full data');
     return { success: true, data: updateData, method: 'minimal_then_update' };
    
  } catch (error) {
    console.error('Error in directHostelInsert:', error);
    throw error;
  }
};