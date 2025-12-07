import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://umiyiwixfkkadtnnehmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupStorage() {
  try {
    console.log('Setting up storage bucket...');
    
    // First, let's check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', buckets.map(b => b.name));
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✓ Avatars bucket already exists');
    } else {
      console.log('Creating avatars bucket...');
      
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('✓ Avatars bucket created successfully:', data);
      }
    }
    
    // Test upload to verify bucket is working
    console.log('Testing bucket access...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload('test/test.txt', testFile);
    
    if (uploadError) {
      console.error('Bucket test failed:', uploadError);
    } else {
      console.log('✓ Bucket is working correctly');
      
      // Clean up test file
      await supabase.storage.from('avatars').remove(['test/test.txt']);
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupStorage();