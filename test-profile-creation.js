import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://umiyiwixfkkadtnnehmz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testProfileCreation() {
  console.log('🔍 Testing profile creation issues...');
  
  try {
    // Test 1: Check profiles table structure
    console.log('\n1. Checking profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accessing profiles table:', tableError.message);
      console.log('   This could indicate RLS policy issues or table doesn\'t exist');
    } else {
      console.log('✅ Profiles table accessible');
    }
    
    // Test 2: Check current user session
    console.log('\n2. Checking current user session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else if (session?.user) {
      console.log('✅ User session found:', session.user.email);
      
      // Test 3: Check if profile exists for current user
      console.log('\n3. Checking if profile exists for current user...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile lookup error:', profileError.message);
        console.log('   Error details:', profileError);
        
        if (profileError.code === 'PGRST116') {
          console.log('   → No profile found for this user');
          
          // Test 4: Try to create profile
          console.log('\n4. Attempting to create profile...');
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'Test User',
              mobile_number: session.user.phone || '',
              email: session.user.email || '',
            })
            .select();
          
          if (insertError) {
            console.error('❌ Profile creation failed:', insertError.message);
            console.log('   Error details:', insertError);
          } else {
            console.log('✅ Profile created successfully:', insertData);
          }
        }
      } else {
        console.log('✅ Profile found:', profile);
      }
    } else {
      console.log('ℹ️  No user session found');
    }
    
    // Test 5: Check RLS policies by trying to read profiles without auth
    console.log('\n5. Testing RLS policies...');
    await supabase.auth.signOut();
    
    const { data: publicProfiles, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      console.log('✅ RLS is working - profiles protected when not authenticated');
      console.log('   Error:', rlsError.message);
    } else {
      console.log('⚠️  RLS might not be properly configured - profiles accessible without auth');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileCreation();