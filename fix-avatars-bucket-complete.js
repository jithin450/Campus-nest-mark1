import { createClient } from '@supabase/supabase-js';

// Use the credentials from .env
const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAvatarsBucket() {
  try {
    console.log('🔧 Fixing avatars bucket setup...');
    
    // First, let's check current buckets
    console.log('📋 Checking current buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('Available buckets:', buckets.map(b => b.name));
    }

    // Try to create the bucket using SQL approach
    console.log('🛠️ Creating bucket via SQL...');
    
    const { data: sqlResult, error: sqlError } = await supabase.rpc('create_avatars_bucket_if_not_exists');
    
    if (sqlError) {
      console.log('SQL approach failed, trying direct creation...');
      
      // Try direct bucket creation
      const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      });

      if (createError) {
        if (createError.message.includes('already exists')) {
          console.log('✅ Bucket already exists');
        } else {
          console.error('❌ Error creating bucket:', createError);
        }
      } else {
        console.log('✅ Bucket created successfully');
      }
    } else {
      console.log('✅ SQL bucket creation successful');
    }

    // Verify bucket exists now
    console.log('🔍 Verifying bucket creation...');
    const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets();
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log('📋 Final bucket list:', finalBuckets.map(b => b.name));
      const avatarsBucket = finalBuckets.find(b => b.name === 'avatars');
      
      if (avatarsBucket) {
        console.log('✅ SUCCESS: Avatars bucket is now available!');
        console.log('📊 Bucket details:', avatarsBucket);
        
        // Test upload capability
        console.log('🧪 Testing upload capability...');
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload('test/test.txt', testFile, { upsert: true });
          
        if (uploadError) {
          console.error('❌ Upload test failed:', uploadError);
        } else {
          console.log('✅ Upload test successful!');
          
          // Clean up test file
          await supabase.storage.from('avatars').remove(['test/test.txt']);
        }
      } else {
        console.log('❌ Avatars bucket still not found');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAvatarsBucket();