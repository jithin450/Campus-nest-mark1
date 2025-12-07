import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function testAvatarsBucket() {
  console.log('Testing avatars bucket...');
  
  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name) || []);
    
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket found!');
      console.log('Bucket details:', avatarsBucket);
      
      // Test uploading a simple file
      const testFile = new Blob(['test content'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;
      
      console.log('Testing file upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, testFile);
      
      if (uploadError) {
        console.log('Upload test failed (expected due to RLS):', uploadError.message);
      } else {
        console.log('✅ Upload test successful:', uploadData);
        
        // Clean up test file
        await supabase.storage.from('avatars').remove([fileName]);
      }
    } else {
      console.log('❌ Avatars bucket not found');
      console.log('Available buckets:', buckets?.map(b => b.name) || 'None');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAvatarsBucket();