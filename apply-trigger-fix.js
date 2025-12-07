import { createClient } from '@supabase/supabase-js';

// Use the actual remote Supabase instance
const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function applyTriggerFix() {
  console.log('🔧 Applying Trigger Function Fix...');
  
  try {
    // Note: We cannot execute DDL statements (CREATE/DROP) through the JavaScript client
    // The SQL fix needs to be applied through the Supabase Dashboard or CLI
    
    console.log('❌ Cannot apply SQL DDL statements through JavaScript client');
    console.log('\n📋 Manual Fix Required:');
    console.log('\n1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project: umiyiwixfkkadtnnehmz');
    console.log('3. Go to SQL Editor');
    console.log('4. Run the following SQL:');
    console.log('\n```sql');
    console.log('-- Fix the handle_new_user trigger function');
    console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    console.log('');
    console.log('CREATE OR REPLACE FUNCTION public.handle_new_user()');
    console.log('RETURNS TRIGGER AS $$');
    console.log('BEGIN');
    console.log('  INSERT INTO public.profiles (');
    console.log('    user_id,');
    console.log('    full_name,');
    console.log('    mobile_number');
    console.log('  ) VALUES (');
    console.log('    NEW.id,');
    console.log('    COALESCE(NEW.raw_user_meta_data->>\\"full_name\\", \\"User\\"),');
    console.log('    COALESCE(NEW.raw_user_meta_data->>\\"mobile_number\\", NEW.phone, \\"\\")');
    console.log('  );');
    console.log('  RETURN NEW;');
    console.log('EXCEPTION');
    console.log('  WHEN unique_violation THEN');
    console.log('    RETURN NEW;');
    console.log('  WHEN OTHERS THEN');
    console.log('    RAISE WARNING \\"Failed to create profile for user %: %\\", NEW.id, SQLERRM;');
    console.log('    RETURN NEW;');
    console.log('END;');
    console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
    console.log('');
    console.log('CREATE TRIGGER on_auth_user_created');
    console.log('  AFTER INSERT ON auth.users');
    console.log('  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();');
    console.log('```');
    console.log('\n5. Click "Run" to execute the SQL');
    
    // Test current state
    console.log('\n🔍 Testing Current State...');
    
    // Check if we can access profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, mobile_number')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table access error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
    }
    
    // Test signup (this will likely still fail until SQL is applied)
    console.log('\n🧪 Testing Signup (will likely fail until SQL fix is applied)...');
    const testEmail = `test${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('500')) {
        console.log('❌ Still getting 500 error - SQL fix needs to be applied manually');
      } else {
        console.log('ℹ️ Different error (might be rate limiting):', signUpError.message);
      }
    } else {
      console.log('✅ Signup successful! The trigger fix may already be applied.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- The 500 error is caused by the handle_new_user trigger function');
  console.log('- The function tries to insert into non-existent \'email\' column');
  console.log('- Manual SQL execution in Supabase Dashboard is required');
  console.log('- After applying the fix, signup should work without 500 errors');
}

applyTriggerFix();