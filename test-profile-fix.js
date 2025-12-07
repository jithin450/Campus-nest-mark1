import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Profile Fix...');
console.log('==================================================');

async function testProfileFix() {
  try {
    // Test 1: Check profiles table structure
    console.log('\n1. Checking profiles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError.message);
      return;
    }
    console.log('✅ Profiles table accessible');
    
    // Test 2: Check existing profiles
    console.log('\n2. Checking existing profiles...');
    const { data: existingProfiles, error: existingError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, created_at')
      .limit(5);
    
    if (existingError) {
      console.error('❌ Error fetching profiles:', existingError.message);
      return;
    }
    
    console.log(`✅ Found ${existingProfiles.length} existing profiles`);
    if (existingProfiles.length > 0) {
      console.log('📋 Sample profiles:');
      existingProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.id}, User ID: ${profile.user_id}, Name: ${profile.full_name}`);
      });
    }
    
    // Test 3: Test profile creation (simulate what the UI does)
    console.log('\n3. Testing profile creation...');
    const testUserId = randomUUID(); // Generate a proper UUID
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        full_name: 'Test User',
        phone_number: '+1234567890'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Profile creation failed:', createError.message);
      console.error('   Details:', createError);
      return;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('📋 New profile:', {
      id: newProfile.id,
      user_id: newProfile.user_id,
      full_name: newProfile.full_name,
      phone_number: newProfile.phone_number
    });
    
    // Test 4: Test profile fetching (simulate what useAuth does)
    console.log('\n4. Testing profile fetching...');
    const { data: fetchedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (fetchError) {
      console.error('❌ Profile fetch failed:', fetchError.message);
    } else {
      console.log('✅ Profile fetched successfully!');
      console.log('📋 Fetched profile:', {
        id: fetchedProfile.id,
        user_id: fetchedProfile.user_id,
        full_name: fetchedProfile.full_name,
        phone_number: fetchedProfile.phone_number
      });
    }
    
    // Test 5: Clean up test data
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', testUserId);
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProfileFix().then(() => {
  console.log('\n==================================================');
  console.log('🏁 Profile fix test complete');
});