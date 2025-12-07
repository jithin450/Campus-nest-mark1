import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('=== Testing Complete Authentication Flow ===\n');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testFullName = 'Test User';
  
  try {
    // Test 1: Sign up a new user
    console.log('1. Testing user signup...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
        },
        emailRedirectTo: undefined // Disable email confirmation
      }
    });
    
    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
      console.error('Error details:', signUpError);
      return;
    }
    
    console.log('✓ Signup successful');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Test 2: Create user profile
    if (signUpData.user) {
      console.log('\n2. Testing profile creation...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: signUpData.user.id,
          full_name: testFullName,
          mobile_number: '',
          email: testEmail,
        });
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
        console.error('Profile error details:', profileError);
      } else {
        console.log('✓ Profile created successfully');
      }
    }
    
    // Test 3: Sign out
    console.log('\n3. Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✓ Sign out successful');
    }
    
    // Test 4: Sign in with the created account
    console.log('\n4. Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.error('Sign in error details:', signInError);
    } else {
      console.log('✓ Sign in successful');
      console.log('User email:', signInData.user?.email);
    }
    
    // Test 5: Check profile access
    if (signInData.user) {
      console.log('\n5. Testing profile access...');
      const { data: profileData, error: profileAccessError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .single();
      
      if (profileAccessError) {
        console.error('❌ Profile access failed:', profileAccessError.message);
      } else {
        console.log('✓ Profile access successful');
        console.log('Profile data:', profileData);
      }
    }
    
    // Clean up: Delete the test user profile
    console.log('\n6. Cleaning up test data...');
    if (signUpData.user) {
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', signUpData.user.id);
      
      if (deleteError) {
        console.error('❌ Cleanup failed:', deleteError.message);
      } else {
        console.log('✓ Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n=== Authentication Flow Test Complete ===');
}

testAuthFlow();