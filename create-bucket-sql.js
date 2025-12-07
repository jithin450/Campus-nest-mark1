import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucketWithSQL() {
  try {
    console.log('🔧 Creating avatars bucket using SQL...');
    
    // Execute the SQL from the migration file
    const createBucketSQL = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'avatars',
        'avatars', 
        true,
        2097152,
        ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    
    const { data: bucketResult, error: bucketError } = await supabase.rpc('exec_sql', {
      sql: createBucketSQL
    });
    
    if (bucketError) {
      console.log('Direct SQL failed, trying alternative approach...');
      
      // Try using a stored procedure approach
      const { data: procResult, error: procError } = await supabase.rpc('create_avatars_bucket');
      
      if (procError) {
        console.error('❌ Stored procedure failed:', procError);
      } else {
        console.log('✅ Stored procedure succeeded');
      }
    } else {
      console.log('✅ Direct SQL succeeded');
    }
    
    // Create RLS policies
    console.log('🔐 Setting up RLS policies...');
    
    const policies = [
      {
        name: 'Avatar images are publicly accessible',
        sql: `CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');`
      },
      {
        name: 'Users can upload their own avatar',
        sql: `CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
      },
      {
        name: 'Users can update their own avatar',
        sql: `CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
      },
      {
        name: 'Users can delete their own avatar',
        sql: `CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`
      }
    ];
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });
      
      if (policyError) {
        console.log(`⚠️ Policy '${policy.name}' may already exist or failed:`, policyError.message);
      } else {
        console.log(`✅ Policy '${policy.name}' created`);
      }
    }
    
    // Verify the bucket exists
    console.log('🔍 Verifying bucket creation...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('📋 Available buckets:', buckets.map(b => b.name));
      const avatarsBucket = buckets.find(b => b.name === 'avatars');
      
      if (avatarsBucket) {
        console.log('🎉 SUCCESS: Avatars bucket is now available!');
        return true;
      } else {
        console.log('❌ Avatars bucket still not found');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

createBucketWithSQL();