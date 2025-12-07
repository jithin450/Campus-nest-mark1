import { createClient } from '@supabase/supabase-js';

// Hardcode the credentials for this test
const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAvatarsBucket() {
  try {
    console.log('Creating avatars bucket...');
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Avatars bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', error);
        return;
      }
    } else {
      console.log('✅ Avatars bucket created successfully');
    }

    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('📋 Available buckets:', buckets.map(b => b.name));
      const avatarsBucket = buckets.find(b => b.name === 'avatars');
      if (avatarsBucket) {
        console.log('✅ Avatars bucket confirmed in list');
      } else {
        console.log('❌ Avatars bucket not found in list');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAvatarsBucket();