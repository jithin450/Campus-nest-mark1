import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with actual config
const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

// Test function to simulate sign-up
async function testSignUp() {
  console.log('🧪 Testing user sign-up flow...');
  
  try {
    // Use actual Supabase config
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test data
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test User',
      mobileNumber: `+1234567${Math.floor(Math.random() * 1000)}`
    };
    
    console.log('📧 Attempting to sign up with:', testUser.email);
    
    // Step 1: Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.fullName,
          mobile_number: testUser.mobileNumber
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth sign-up failed:', authError);
      return;
    }
    
    console.log('✅ Auth sign-up successful:', {
      user: authData.user?.id,
      email: authData.user?.email,
      confirmed: authData.user?.email_confirmed_at
    });
    
    // Step 2: Check if user was created in auth.users
    if (!authData.user) {
      console.error('❌ No user returned from auth sign-up');
      return;
    }
    
    // Step 3: Try to create profile manually (simulating the createUserProfile function)
    console.log('👤 Creating user profile...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: testUser.fullName,
        email: testUser.email,
        mobile_number: testUser.mobileNumber
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      console.error('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      return;
    }
    
    console.log('✅ Profile created successfully:', profileData);
    
    // Step 4: Verify profile exists
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Profile verification failed:', verifyError);
    } else {
      console.log('✅ Profile verified in database:', verifyData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during sign-up test:', error);
  }
}

// Test Supabase connection
async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

// Run tests
async function runTests() {
  await testConnection();
  await testSignUp();
}

runTests().catch(console.error);