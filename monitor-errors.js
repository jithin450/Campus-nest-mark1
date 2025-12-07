// Error monitoring script to help debug 500 status code issues
// Run this script to monitor for API errors and network issues

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://umiyiwixfkkadtnnehmz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('places_to_visit')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ Network or connection error:', err);
    return false;
  }
}

async function testSpecificPlace() {
  console.log('\nTesting specific place (Annamacharya statue)...');
  
  try {
    const { data, error } = await supabase
      .from('places_to_visit')
      .select('*')
      .eq('id', '70143080-4b2f-4ecc-b50c-ab34b13a247e')
      .single();
    
    if (error) {
      console.error('❌ Error fetching Annamacharya statue:', error);
      return false;
    }
    
    console.log('✅ Successfully fetched Annamacharya statue');
    console.log('Images:', data.images);
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

async function testImageUrls() {
  console.log('\nTesting image URL accessibility...');
  
  const testUrls = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    'https://umiyiwixfkkadtnnehmz.supabase.co/storage/v1/object/sign/places/annamacharya_statue_1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwbGFjZXMvYW5uYW1hY2hhcnlhX3N0YXR1ZV8xLmpwZyIsImlhdCI6MTczNzEwNzQ4MSwiZXhwIjoxNzM3MTk0ODgxfQ.example'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '❌'} ${url} - Status: ${response.status}`);
    } catch (err) {
      console.log(`❌ ${url} - Error: ${err.message}`);
    }
  }
}

async function monitorErrors() {
  console.log('🔍 Campus Nest Error Monitor');
  console.log('============================\n');
  
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Basic connection failed. Check your internet connection and Supabase status.');
    return;
  }
  
  const placeOk = await testSpecificPlace();
  if (!placeOk) {
    console.log('\n❌ Failed to fetch specific place. This might be the source of 500 errors.');
  }
  
  await testImageUrls();
  
  console.log('\n📊 Monitor complete. If you see any ❌ errors above, they might be causing 500 status codes.');
  console.log('\nCommon causes of 500 errors:');
  console.log('- Expired Supabase tokens');
  console.log('- RLS policy restrictions');
  console.log('- Network connectivity issues');
  console.log('- Invalid image URLs');
  console.log('- Database schema mismatches');
}

monitorErrors().catch(console.error);