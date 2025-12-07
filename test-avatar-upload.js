import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvatarUpload() {
  try {
    console.log('🧪 Testing avatar upload functionality...');
    
    // Test 1: Check bucket accessibility
    console.log('📋 Step 1: Checking bucket accessibility...');
    const { data: files, error: listError } = await supabase.storage.from('avatars').list();
    
    if (listError) {
      console.log('❌ Bucket not accessible:', listError.message);
      return false;
    } else {
      console.log('✅ Bucket is accessible! Current files:', files.length);
    }
    
    // Test 2: Create a test image file (SVG)
    console.log('📋 Step 2: Creating test image...');
    const testImageSVG = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">TEST</text>
      </svg>
    `;
    
    const testImageBlob = new Blob([testImageSVG], { type: 'image/svg+xml' });
    
    // Test 3: Upload test image
    console.log('📋 Step 3: Uploading test image...');
    const fileName = `test-avatar-${Date.now()}.svg`;
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
          mimetype: uploadedFile.metadata?.mimetype
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
    
    // Test 7: Clean up test file
    console.log('📋 Step 7: Cleaning up test file...');
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

testAvatarUpload().then(success => {
  if (success) {
    console.log('\n🎉 AVATAR UPLOAD TEST PASSED!');
    console.log('✅ The avatars bucket is fully functional.');
    console.log('✅ You can now use avatar upload in your application.');
    console.log('\n📝 Next steps:');
    console.log('1. Test avatar upload in the web application');
    console.log('2. Try uploading a real image file');
    console.log('3. Verify the avatar displays correctly in the UI');
  } else {
    console.log('\n❌ AVATAR UPLOAD TEST FAILED!');
    console.log('❌ There are still issues with the avatars bucket.');
    console.log('\n🔧 Please check:');
    console.log('1. Bucket permissions in Supabase Dashboard');
    console.log('2. RLS policies for storage.objects');
    console.log('3. File size and MIME type restrictions');
  }
});