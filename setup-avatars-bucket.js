import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2NDM5OCwiZXhwIjoyMDcwNzQwMzk4fQ.YOUR_SERVICE_ROLE_KEY_HERE';

// For now, we'll use the anon key since service role key is not available
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAvatarsBucket() {
  console.log('Setting up avatars storage bucket...');
  
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name) || []);
    
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('Avatars bucket already exists!');
      return;
    }
    
    // Create the avatars bucket
    console.log('Creating avatars bucket...');
    const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
    });
    
    if (createError) {
      console.error('Error creating avatars bucket:', createError);
      
      // If we get a permission error, provide instructions
      if (createError.message.includes('permission') || createError.message.includes('policy')) {
        console.log('\n=== MANUAL SETUP REQUIRED ===');
        console.log('Please create the avatars bucket manually in Supabase Dashboard:');
        console.log('1. Go to https://supabase.com/dashboard/project/umiyiwixfkkadtnnehmz/storage/buckets');
        console.log('2. Click "New bucket"');
        console.log('3. Name: avatars');
        console.log('4. Make it public: Yes');
        console.log('5. File size limit: 2MB');
        console.log('6. Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp');
        console.log('================================');
      }
      
      return;
    }
    
    console.log('Avatars bucket created successfully:', createData);
    
    // Set up RLS policies for the bucket (if needed)
    console.log('Bucket setup completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupAvatarsBucket();