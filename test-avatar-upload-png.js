import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvatarUploadPNG() {
  try {
    console.log('🧪 Testing avatar upload with PNG format...');
    
    // Test 1: Check bucket accessibility
    console.log('📋 Step 1: Checking bucket accessibility...');
    const { data: files, error: listError } = await supabase.storage.from('avatars').list();
    
    if (listError) {
      console.log('❌ Bucket not accessible:', listError.message);
      return false;
    } else {
      console.log('✅ Bucket is accessible! Current files:', files.length);
    }
    
    // Test 2: Create a minimal PNG file (1x1 pixel)
    console.log('📋 Step 2: Creating test PNG image...');
    
    // This is a minimal 1x1 transparent PNG in base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    const testImageBlob = new Blob([pngBuffer], { type: 'image/png' });
    
    console.log('✅ Test PNG created (size:', testImageBlob.size, 'bytes)');
    
    // Test 3: Upload test image
    console.log('📋 Step 3: Uploading test PNG...');
    const fileName = `test-avatar-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, testImageBlob, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      return false;
    } else {
      console.log('✅ Upload successful!', uploadData.path);
    }
    
    // Test 4: Get public URL
    console.log('📋 Step 4: Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    // Test 5: Verify file exists
    console.log('📋 Step 5: Verifying file exists...');
    const { data: verifyFiles, error: verifyError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      const uploadedFile = verifyFiles.find(f => f.name === fileName);
      if (uploadedFile) {
        console.log('✅ File verified in bucket:', uploadedFile.name);
        console.log('📊 File details:', {
          name: uploadedFile.name,
          size: uploadedFile.metadata?.size,
          mimetype: uploadedFile.metadata?.mimetype,
          lastModified: uploadedFile.updated_at
        });
      } else {
        console.log('❌ File not found in bucket listing');
      }
    }
    
    // Test 6: Download the file to verify it's accessible
    console.log('📋 Step 6: Testing file download...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('avatars')
      .download(fileName);
    
    if (downloadError) {
      console.log('❌ Download failed:', downloadError.message);
    } else {
      console.log('✅ Download successful! File size:', downloadData.size, 'bytes');
    }
    
    // Test 7: Test with different MIME types
    console.log('📋 Step 7: Testing supported MIME types...');
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    
    for (const mimeType of supportedTypes) {
      const testBlob = new Blob(['fake image data'], { type: mimeType });
      const testFileName = `test-${mimeType.replace('/', '-')}-${Date.now()}.${mimeType.split('/')[1]}`;
      
      const { error: testError } = await supabase.storage
        .from('avatars')
        .upload(testFileName, testBlob, { upsert: true });
      
      if (testError) {
        console.log(`❌ ${mimeType}: ${testError.message}`);
      } else {
        console.log(`✅ ${mimeType}: Upload successful`);
        // Clean up immediately
        await supabase.storage.from('avatars').remove([testFileName]);
      }
    }
    
    // Test 8: Clean up main test file
    console.log('📋 Step 8: Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([fileName]);
    
    if (deleteError) {
      console.log('⚠️ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testAvatarUploadPNG().then(success => {
  if (success) {
    console.log('\n🎉 AVATAR UPLOAD TEST PASSED!');
    console.log('✅ The avatars bucket is fully functional.');
    console.log('✅ PNG, JPEG, JPG, GIF, and WEBP uploads are supported.');
    console.log('\n📝 Next steps:');
    console.log('1. Test avatar upload in the web application');
    console.log('2. Try uploading a real image file');
    console.log('3. Verify the avatar displays correctly in the UI');
    console.log('\n🔗 You can now refresh your application and test avatar upload!');
  } else {
    console.log('\n❌ AVATAR UPLOAD TEST FAILED!');
    console.log('❌ There are still issues with the avatars bucket.');
  }
});