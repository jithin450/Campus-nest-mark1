// Debug script to check places_to_visit data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

// You'll need to replace these with actual values from your .env file
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlacesData() {
  try {
    const { data, error } = await supabase
      .from('places_to_visit')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching places:', error);
      return;
    }

    console.log('Total places found:', data?.length || 0);
    
    data?.forEach((place, index) => {
      console.log(`\n--- Place ${index + 1} ---`);
      console.log('Name:', place.name);
      console.log('ID:', place.id);
      console.log('Images:', place.images);
      console.log('Images type:', typeof place.images);
      console.log('Images length:', place.images?.length || 0);
      
      if (place.name.toLowerCase().includes('annamacharya')) {
        console.log('*** FOUND ANNAMACHARYA STATUE ***');
        console.log('Full data:', JSON.stringify(place, null, 2));
      }
    });
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkPlacesData();