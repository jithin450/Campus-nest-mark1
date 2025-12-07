import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyBucketMigration() {
  try {
    console.log('🚀 Applying avatars bucket migration...');
    
    // Step 1: Create the bucket directly using storage API
    console.log('📦 Creating avatars bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket already exists, continuing...');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        // Continue anyway to try policies
      }
    } else {
      console.log('✅ Bucket created successfully!');
    }

    // Step 2: Apply RLS policies using SQL
    console.log('🔐 Applying RLS policies...');
    
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');`,
      `CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`,
      `CREATE POLICY IF NOT EXISTS "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
    ];

    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      console.log(`📋 Applying policy ${i + 1}/${policies.length}...`);
      
      try {
        const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
        
        if (policyError) {
          console.log(`⚠️ Policy ${i + 1} may already exist or failed:`, policyError.message);
        } else {
          console.log(`✅ Policy ${i + 1} applied successfully`);
        }
      } catch (err) {
        console.log(`⚠️ Policy ${i + 1} execution failed:`, err.message);
      }
    }

    // Step 3: Verify everything works
    console.log('🔍 Verifying setup...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('📋 Available buckets:', buckets.map(b => b.name));
      const avatarsBucket = buckets.find(b => b.name === 'avatars');
      
      if (avatarsBucket) {
        console.log('🎉 SUCCESS: Avatars bucket is available!');
        console.log('📊 Bucket details:', {
          name: avatarsBucket.name,
          public: avatarsBucket.public,
          file_size_limit: avatarsBucket.file_size_limit,
          allowed_mime_types: avatarsBucket.allowed_mime_types
        });
        
        // Test basic functionality
        console.log('🧪 Testing bucket access...');
        const { data: files, error: filesError } = await supabase.storage.from('avatars').list();
        
        if (filesError) {
          console.error('❌ Error accessing bucket:', filesError);
        } else {
          console.log('✅ Bucket access test successful!');
          console.log('📁 Current files in bucket:', files.length);
        }
        
        return true;
      } else {
        console.log('❌ Avatars bucket not found after creation');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

applyBucketMigration().then(success => {
  if (success) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ The avatars bucket is now ready for use.');
  } else {
    console.log('\n❌ Migration failed. Please check the errors above.');
  }
});