import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://umiyiwixfkkadtnnehmz.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRestaurantsTable() {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching data from restaurants table:', error);
    } else {
      console.log('Sample data from restaurants table:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkRestaurantsTable();
