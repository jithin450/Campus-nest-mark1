import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function manualBucketCreation() {
  try {
    console.log('🔧 Manual bucket creation approach...');
    
    // Try to insert directly into storage.buckets table
    console.log('📦 Inserting bucket record directly...');
    
    const { data, error } = await supabase
      .from('storage.buckets')
      .insert({
        id: 'avatars',
        name: 'avatars',
        public: true,
        file_size_limit: 2097152,
        allowed_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      })
      .select();
    
    if (error) {
      console.log('❌ Direct insert failed:', error.message);
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying raw SQL approach...');
      
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('sql', {
          query: `
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
              'avatars',
              'avatars', 
              true,
              2097152,
              ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
            )
            ON CONFLICT (id) DO NOTHING
            RETURNING *;
          `
        });
      
      if (sqlError) {
        console.log('❌ Raw SQL also failed:', sqlError.message);
        
        // Final attempt: Use PostgreSQL REST API directly
        console.log('🔄 Trying PostgreSQL REST API...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/storage.buckets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id: 'avatars',
            name: 'avatars',
            public: true,
            file_size_limit: 2097152,
            allowed_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ REST API insertion successful:', result);
        } else {
          const errorText = await response.text();
          console.log('❌ REST API failed:', response.status, errorText);
        }
      } else {
        console.log('✅ Raw SQL successful:', sqlData);
      }
    } else {
      console.log('✅ Direct insert successful:', data);
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
        console.log('🎉 SUCCESS: Avatars bucket found!');
        console.log('📊 Bucket details:', avatarsBucket);
        return true;
      } else {
        console.log('❌ Avatars bucket still not found');
        
        // Let's check what's in the storage.buckets table directly
        console.log('🔍 Checking storage.buckets table directly...');
        const { data: directBuckets, error: directError } = await supabase
          .from('storage.buckets')
          .select('*');
        
        if (directError) {
          console.log('❌ Cannot access storage.buckets table:', directError.message);
        } else {
          console.log('📋 Direct table query results:', directBuckets);
        }
        
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

manualBucketCreation().then(success => {
  if (success) {
    console.log('\n🎉 Manual bucket creation completed successfully!');
  } else {
    console.log('\n❌ Manual bucket creation failed.');
    console.log('\n💡 SOLUTION: You need to create the bucket manually in Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Storage > Buckets');
    console.log('4. Click "New bucket"');
    console.log('5. Name: avatars');
    console.log('6. Make it public: YES');
    console.log('7. File size limit: 2MB');
    console.log('8. Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp');
  }
});