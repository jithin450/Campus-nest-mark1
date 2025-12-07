// Script to fix Annamacharya statue images with working URLs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAnnamacharyaImages() {
  try {
    // Working image URLs for Annamacharya statue (statue/monument themed)
    const newImages = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', // Statue/monument
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400', // Historical statue
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400', // Monument view
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73d1e?w=400'  // Cultural site
    ];

    console.log('Updating Annamacharya statue images...');
    
    const { data, error } = await supabase
      .from('places_to_visit')
      .update({ images: newImages })
      .eq('id', '70143080-4b2f-4ecc-b50c-ab34b13a247e')
      .select();

    if (error) {
      console.error('Error updating images:', error);
      return;
    }

    console.log('Successfully updated Annamacharya statue images!');
    console.log('Updated data:', data);
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixAnnamacharyaImages();