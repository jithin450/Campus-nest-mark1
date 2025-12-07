import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthAfterFix() {
  console.log('🧪 Testing Authentication After SQL Fix\n');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testFullName = 'Test User';
  
  console.log('📝 Test Details:');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log(`Full Name: ${testFullName}\n`);
  
  // Test 1: Sign Up
  console.log('1️⃣ Testing Sign Up...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testFullName
      }
    }
  });
  
  if (signUpError) {
    console.log('❌ Sign Up Failed:', signUpError.message);
    return;
  } else {
    console.log('✅ Sign Up Successful!');
    console.log(`User ID: ${signUpData.user?.id}`);
    console.log(`Email: ${signUpData.user?.email}`);
  }
  
  // Wait a moment for the trigger to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Check if profile was created
  console.log('\n2️⃣ Testing Profile Creation...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', signUpData.user?.id)
    .single();
  
  if (profileError) {
    console.log('❌ Profile Check Failed:', profileError.message);
  } else {
    console.log('✅ Profile Created Successfully!');
    console.log('Profile Data:', profileData);
  }
  
  // Test 3: Sign Out
  console.log('\n3️⃣ Testing Sign Out...');
  const { error: signOutError } = await supabase.auth.signOut();
  
  if (signOutError) {
    console.log('❌ Sign Out Failed:', signOutError.message);
  } else {
    console.log('✅ Sign Out Successful!');
  }
  
  // Test 4: Sign In
  console.log('\n4️⃣ Testing Sign In...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    console.log('❌ Sign In Failed:', signInError.message);
  } else {
    console.log('✅ Sign In Successful!');
    console.log(`User ID: ${signInData.user?.id}`);
    console.log(`Email: ${signInData.user?.email}`);
  }
  
  // Test 5: Get current session
  console.log('\n5️⃣ Testing Session Management...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Session Check Failed:', sessionError.message);
  } else if (sessionData.session) {
    console.log('✅ Session Active!');
    console.log(`Session User: ${sessionData.session.user.email}`);
  } else {
    console.log('ℹ️  No active session');
  }
  
  console.log('\n🎉 Authentication Test Complete!');
  console.log('\nIf all tests passed, your authentication system is working correctly.');
  console.log('Users should now be able to:');
  console.log('- Create new accounts');
  console.log('- Log in with existing accounts');
  console.log('- Have profiles automatically created');
  console.log('- Maintain sessions properly');
}

testAuthAfterFix();