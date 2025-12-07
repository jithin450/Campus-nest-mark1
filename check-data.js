import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database data...');
  
  try {
    // Check hostels table
    const { data: hostels, error: hostelError } = await supabase
      .from('hostels')
      .select('*')
      .limit(5);
    
    if (hostelError) {
      console.error('Hostels error:', hostelError);
    } else {
      console.log('Hostels count:', hostels?.length || 0);
      console.log('Sample hostel:', hostels?.[0] || 'None');
    }
    
    // Check restaurants table
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(5);
    
    if (restaurantError) {
      console.error('Restaurants error:', restaurantError);
    } else {
      console.log('Restaurants count:', restaurants?.length || 0);
      console.log('Sample restaurant:', restaurants?.[0] || 'None');
    }
    
    // Check places_to_visit table
    const { data: places, error: placesError } = await supabase
      .from('places_to_visit')
      .select('*')
      .limit(5);
    
    if (placesError) {
      console.error('Places error:', placesError);
    } else {
      console.log('Places count:', places?.length || 0);
      console.log('Sample place:', places?.[0] || 'None');
    }
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkData();