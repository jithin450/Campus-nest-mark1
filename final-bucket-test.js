import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

async function finalBucketTest() {
  try {
    console.log('🔍 Final comprehensive bucket test...');
    console.log('🌐 Supabase URL:', supabaseUrl);
    console.log('🔑 Using anon key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
    
    // Create multiple client instances to test different approaches
    const clients = [
      {
        name: 'Standard Client',
        client: createClient(supabaseUrl, supabaseKey)
      },
      {
        name: 'Client with Auth',
        client: createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false
          }
        })
      },
      {
        name: 'Client with Storage Options',
        client: createClient(supabaseUrl, supabaseKey, {
          storage: {
            allowedMimeTypes: ['image/*']
          }
        })
      }
    ];
    
    for (const { name, client } of clients) {
      console.log(`\n📋 Testing with ${name}...`);
      
      try {
        // Test 1: List buckets
        const { data: buckets, error: listError } = await client.storage.listBuckets();
        
        if (listError) {
          console.log(`❌ ${name} - List buckets error:`, listError.message);
        } else {
          console.log(`✅ ${name} - Buckets found:`, buckets.map(b => b.name));
          
          const avatarsBucket = buckets.find(b => b.name === 'avatars');
          if (avatarsBucket) {
            console.log(`🎉 ${name} - AVATARS BUCKET FOUND!`);
            console.log('📊 Bucket details:', {
              name: avatarsBucket.name,
              public: avatarsBucket.public,
              file_size_limit: avatarsBucket.file_size_limit,
              allowed_mime_types: avatarsBucket.allowed_mime_types
            });
            
            // Test 2: Try to access the bucket
            console.log(`🧪 ${name} - Testing bucket access...`);
            const { data: files, error: filesError } = await client.storage.from('avatars').list();
            
            if (filesError) {
              console.log(`❌ ${name} - Bucket access error:`, filesError.message);
            } else {
              console.log(`✅ ${name} - Bucket access successful! Files:`, files.length);
              
              // Test 3: Try to upload a test file
              console.log(`🧪 ${name} - Testing file upload...`);
              const testFile = new Blob(['test content'], { type: 'text/plain' });
              const { data: uploadData, error: uploadError } = await client.storage
                .from('avatars')
                .upload('test/test.txt', testFile, { upsert: true });
              
              if (uploadError) {
                console.log(`❌ ${name} - Upload test failed:`, uploadError.message);
              } else {
                console.log(`✅ ${name} - Upload test successful!`);
                
                // Clean up test file
                await client.storage.from('avatars').remove(['test/test.txt']);
                console.log(`🧹 ${name} - Test file cleaned up`);
              }
            }
          } else {
            console.log(`❌ ${name} - Avatars bucket not found in list`);
          }
        }
        
        // Test 4: Try direct bucket access
        console.log(`🧪 ${name} - Testing direct bucket access...`);
        const { data: directFiles, error: directError } = await client.storage.from('avatars').list();
        
        if (directError) {
          console.log(`❌ ${name} - Direct access error:`, directError.message);
        } else {
          console.log(`✅ ${name} - Direct access successful! Files:`, directFiles.length);
        }
        
      } catch (clientError) {
        console.log(`❌ ${name} - Client error:`, clientError.message);
      }
    }
    
    // Test 5: Check if it's a timing/cache issue
    console.log('\n⏰ Testing with delay (cache refresh)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const freshClient = createClient(supabaseUrl, supabaseKey);
    const { data: freshBuckets, error: freshError } = await freshClient.storage.listBuckets();
    
    if (freshError) {
      console.log('❌ Fresh client error:', freshError.message);
    } else {
      console.log('📋 Fresh client buckets:', freshBuckets.map(b => b.name));
      if (freshBuckets.find(b => b.name === 'avatars')) {
        console.log('🎉 FRESH CLIENT FOUND AVATARS BUCKET!');
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

finalBucketTest().then(success => {
  if (success) {
    console.log('\n🎉 SUCCESS: Avatars bucket is working!');
    console.log('✅ You can now test the avatar upload in your application.');
  } else {
    console.log('\n❌ ISSUE PERSISTS: Avatars bucket is not accessible.');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Verify the bucket exists in Supabase Dashboard');
    console.log('2. Check if RLS policies are blocking access');
    console.log('3. Ensure the bucket is set to public');
    console.log('4. Try refreshing your Supabase project');
    console.log('5. Check if there are any service outages');
  }
});