import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewAuthSystem() {
  console.log('🧪 Testing New Authentication System');
  console.log('=====================================\n');

  try {
    // Test 1: Check if profiles table exists and is accessible
    console.log('1. Testing profiles table access...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table is accessible');
      console.log(`   Current profiles count: ${profilesData?.length || 0}`);
    }

    // Test 2: Test user signup
    console.log('\n2. Testing user signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testFullName = 'Test User';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
        },
      },
    });

    if (signUpError) {
      console.error('❌ Signup error:', signUpError.message);
      if (signUpError.message.includes('rate limit')) {
        console.log('   This is expected if testing frequently');
      }
    } else {
      console.log('✅ User signup successful');
      console.log(`   User ID: ${signUpData.user?.id}`);
      console.log(`   Email: ${signUpData.user?.email}`);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test 3: Check if profile was created automatically
      console.log('\n3. Testing automatic profile creation...');
      if (signUpData.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Profile creation failed:', profileError.message);
        } else {
          console.log('✅ Profile created automatically');
          console.log('   Profile data:', {
            id: profileData.id,
            full_name: profileData.full_name,
            email: profileData.email,
            created_at: profileData.created_at
          });
        }
      }
    }

    // Test 4: Test user signin (if signup was successful)
    if (signUpData?.user && !signUpError) {
      console.log('\n4. Testing user signin...');
      
      // First sign out
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.error('❌ Signin error:', signInError.message);
      } else {
        console.log('✅ User signin successful');
        console.log(`   User ID: ${signInData.user?.id}`);
        console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
      }
    }

    // Test 5: Test profile update
    if (signUpData?.user && !signUpError) {
      console.log('\n5. Testing profile update...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_number: '+1234567890',
          address: '123 Test Street, Test City'
        })
        .eq('id', signUpData.user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Profile update failed:', updateError.message);
      } else {
        console.log('✅ Profile update successful');
        console.log('   Updated profile:', {
          phone_number: updateData.phone_number,
          address: updateData.address
        });
      }
    }

    // Test 6: Test RLS policies
    console.log('\n6. Testing Row Level Security policies...');
    
    // Try to access profiles without authentication
    await supabase.auth.signOut();
    
    const { data: unauthorizedData, error: unauthorizedError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (unauthorizedError) {
      console.log('✅ RLS is working - unauthorized access blocked');
      console.log(`   Error: ${unauthorizedError.message}`);
    } else {
      console.log('⚠️  RLS might not be properly configured');
      console.log(`   Unauthorized access returned ${unauthorizedData?.length || 0} records`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n=====================================');
  console.log('🏁 Authentication system test completed');
  console.log('\nNext steps:');
  console.log('1. Run the development server: npm run dev');
  console.log('2. Navigate to http://localhost:8081/auth');
  console.log('3. Test signup and signin in the browser');
  console.log('4. Check the browser console for any errors');
}

// Run the test
testNewAuthSystem().catch(console.error);