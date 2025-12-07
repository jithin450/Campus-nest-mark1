import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function testBucketAccess() {
  console.log('Testing bucket access...');
  
  try {
    // Try to access the avatars bucket directly
    const { data, error } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Bucket access failed:', error.message);
      if (error.message.includes('not found')) {
        console.log('The bucket does not exist or is not accessible.');
      }
    } else {
      console.log('✅ Bucket is accessible!');
      console.log('Bucket contents (first item):', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testBucketAccess();