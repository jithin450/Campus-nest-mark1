import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      }
    },
    persistSession: true,
    autoRefreshToken: true,
  }
});

async function testAuthenticationIssues() {
  console.log('🔍 Testing Authentication Issues\n');
  
  try {
    // Test 1: Basic Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }
    console.log('✅ Supabase connection successful');
    console.log(`Current session: ${session ? 'Active' : 'None'}\n`);
    
    // Test 2: Test signup with a unique email
    console.log('2️⃣ Testing signup functionality...');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });
    
    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
      console.error('Error code:', signUpError.code);
      console.error('Error status:', signUpError.status);
      
      // Check if it's a rate limit issue
      if (signUpError.code === 'over_email_send_rate_limit') {
        console.log('⚠️  This is a rate limit issue, not a fundamental auth problem');
      }
    } else {
      console.log('✅ Signup successful');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Test 3: Check if profile was created
      if (signUpData.user?.id) {
        console.log('\n3️⃣ Testing profile creation...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', signUpData.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError.message);
        } else {
          console.log('✅ Profile created successfully:', profile);
        }
      }
    }
    
    // Test 4: Test signin with existing credentials (if any)
    console.log('\n4️⃣ Testing signin functionality...');
    
    // Try to sign in with a test account that might exist
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.log('❌ Signin failed (expected for non-existent user):', signInError.message);
      console.log('Error code:', signInError.code);
      
      // This is expected if the user doesn't exist
      if (signInError.code === 'invalid_credentials') {
        console.log('✅ Signin error handling works correctly');
      }
    } else {
      console.log('✅ Signin successful');
      console.log('User ID:', signInData.user?.id);
    }
    
    // Test 5: Check auth state management
    console.log('\n5️⃣ Testing auth state management...');
    
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      console.log('Session:', session ? 'Active' : 'None');
    });
    
    console.log('✅ Auth state listener set up successfully');
    
    // Test 6: Check database permissions
    console.log('\n6️⃣ Testing database permissions...');
    
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Database access failed:', profilesError.message);
    } else {
      console.log('✅ Database access successful');
    }
    
    console.log('\n🎯 Authentication test completed');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAuthenticationIssues();