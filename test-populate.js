import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function testHostelPopulation() {
  console.log('Testing hostel population...');
  
  try {
    // Check current hostels
    const { data: currentHostels, error: selectError } = await supabase
      .from('hostels')
      .select('id, name')
      .limit(5);
    
    if (selectError) {
      console.error('Error reading hostels:', selectError);
      return;
    }
    
    console.log('Current hostels in database:', currentHostels?.length || 0);
    if (currentHostels && currentHostels.length > 0) {
      console.log('Existing hostels:', currentHostels.map(h => h.name));
    }
    
    // Test inserting a single hostel
    const testHostel = {
      id: '550e8400-e29b-41d4-a716-446655440099',
      name: 'Test Hostel',
      description: 'Test description',
      short_description: 'Test short description',
      price_per_month: 5000,
      state: 'Karnataka',
      amenities: ['Wi-Fi'],
      images: ['/placeholder.svg'],
      total_rooms: 10,
      available_rooms: 5,
      rating: 4.0,
      total_reviews: 10
    };
    
    console.log('Attempting to insert test hostel...');
    const { data: insertData, error: insertError } = await supabase
      .from('hostels')
      .insert(testHostel)
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Insert successful:', insertData);
      
      // Clean up - delete the test hostel
      await supabase
        .from('hostels')
        .delete()
        .eq('id', testHostel.id);
      console.log('Test hostel cleaned up');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testHostelPopulation();