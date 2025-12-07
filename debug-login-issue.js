import { createClient } from '@supabase/supabase-js';

// Use the actual remote Supabase instance
const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function debugLoginIssue() {
  console.log('🔍 Debugging Login Issue...');
  
  try {
    // Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session?.session ? 'Active' : 'None');
    if (sessionError) {
      console.error('Session error:', sessionError);
    }
    
    // Check if we can access profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table access error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible, found', profiles?.length || 0, 'profiles');
    }
    
    // Test login with a dummy account (this will fail but show us the error)
    console.log('\n🔐 Testing login flow...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (loginError) {
      console.log('Expected login error (dummy credentials):', loginError.message);
    } else {
      console.log('Unexpected: Login succeeded with dummy credentials');
    }
    
    // Check auth configuration
    console.log('\n⚙️ Auth Configuration Check...');
    const { data: user } = await supabase.auth.getUser();
    console.log('Current user:', user?.user ? 'Logged in' : 'Not logged in');
    
    // Test if we can create a profile (this will show RLS issues)
    console.log('\n📝 Testing profile creation access...');
    const { data: testProfile, error: testProfileError } = await supabase
      .from('profiles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        full_name: 'Test User',
        mobile_number: '+1234567890'
      })
      .select()
      .single();
    
    if (testProfileError) {
      console.log('Profile creation test error (expected):', testProfileError.message);
    } else {
      console.log('⚠️ Profile creation succeeded without auth - RLS may be disabled');
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
  
  console.log('\n🏁 Debug complete. Check the logs above for issues.');
}

debugLoginIssue();