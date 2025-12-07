import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAuthCompletely() {
  console.log('🔧 Fixing Authentication Issues Completely\n');
  
  console.log('📋 ISSUE IDENTIFIED:');
  console.log('- The trigger function is trying to insert into an "email" column that doesn\'t exist');
  console.log('- The profiles table has: id, user_id, full_name, mobile_number, phone_number, created_at, updated_at');
  console.log('- The trigger function needs to be updated to match the actual schema\n');
  
  console.log('🛠️  MANUAL FIX REQUIRED:');
  console.log('Since we cannot execute SQL directly via the API, you need to apply this fix manually in the Supabase Dashboard:\n');
  
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the following SQL script:\n');
  
  console.log('```sql');
  console.log('-- Fix the handle_new_user trigger function to match actual table schema');
  console.log('-- This resolves the "Unexpected status code returned from hook: 500" error');
  console.log('');
  console.log('-- Drop the existing trigger first');
  console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
  console.log('');
  console.log('-- Update the function to match the current profiles table schema');
  console.log('-- Table has: id, user_id, full_name, mobile_number, phone_number, created_at, updated_at');
  console.log('CREATE OR REPLACE FUNCTION public.handle_new_user()');
  console.log('RETURNS TRIGGER AS $$');
  console.log('BEGIN');
  console.log('  INSERT INTO public.profiles (');
  console.log('    user_id,');
  console.log('    full_name,');
  console.log('    mobile_number');
  console.log('  ) VALUES (');
  console.log('    NEW.id,');
  console.log('    COALESCE(NEW.raw_user_meta_data->>\'\'full_name\'\', \'\'User\'\'),');
  console.log('    COALESCE(NEW.raw_user_meta_data->>\'\'phone_number\'\', NEW.phone, \'\'\'\')');
  console.log('  )');
  console.log('  ON CONFLICT (user_id) DO UPDATE SET');
  console.log('    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),');
  console.log('    mobile_number = COALESCE(EXCLUDED.mobile_number, profiles.mobile_number),');
  console.log('    updated_at = now();');
  console.log('  ');
  console.log('  RETURN NEW;');
  console.log('EXCEPTION');
  console.log('  WHEN unique_violation THEN');
  console.log('    -- Profile already exists, ignore the error');
  console.log('    RETURN NEW;');
  console.log('  WHEN OTHERS THEN');
  console.log('    -- Log the error but don\'\'t fail the user creation');
  console.log('    RAISE WARNING \'\'Failed to create profile for user %: %\'\', NEW.id, SQLERRM;');
  console.log('    RETURN NEW;');
  console.log('END;');
  console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
  console.log('');
  console.log('-- Recreate the trigger');
  console.log('CREATE TRIGGER on_auth_user_created');
  console.log('  AFTER INSERT ON auth.users');
  console.log('  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();');
  console.log('');
  console.log('-- Grant necessary permissions');
  console.log('GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;');
  console.log('');
  console.log('-- Fix RLS policies to allow the trigger to work');
  console.log('-- Drop existing policies that might conflict');
  console.log('DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Anonymous users can view profiles" ON public.profiles;');
  console.log('DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;');
  console.log('');
  console.log('-- Create new RLS policies');
  console.log('CREATE POLICY "Users can view their own profile" ON public.profiles');
  console.log('  FOR SELECT USING (auth.uid() = user_id);');
  console.log('');
  console.log('CREATE POLICY "Users can insert their own profile" ON public.profiles');
  console.log('  FOR INSERT WITH CHECK (auth.uid() = user_id);');
  console.log('');
  console.log('CREATE POLICY "Users can update their own profile" ON public.profiles');
  console.log('  FOR UPDATE USING (auth.uid() = user_id);');
  console.log('');
  console.log('CREATE POLICY "Users can delete their own profile" ON public.profiles');
  console.log('  FOR DELETE USING (auth.uid() = user_id);');
  console.log('');
  console.log('-- Allow service role to manage profiles (needed for triggers)');
  console.log('CREATE POLICY "Service role can manage profiles" ON public.profiles');
  console.log('  FOR ALL TO service_role USING (true) WITH CHECK (true);');
  console.log('');
  console.log('-- Allow authenticated users to view profiles for public features');
  console.log('CREATE POLICY "Authenticated users can view profiles" ON public.profiles');
  console.log('  FOR SELECT TO authenticated USING (true);');
  console.log('');
  console.log('-- Allow anonymous users to view profiles for public listings');
  console.log('CREATE POLICY "Anonymous users can view profiles" ON public.profiles');
  console.log('  FOR SELECT TO anon USING (true);');
  console.log('```');
  console.log('');
  console.log('4. Click "Run" to execute the SQL');
  console.log('5. Wait for the success message');
  console.log('');
  
  // Test current state
  console.log('🧪 Testing Current State (before fix)...');
  
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
      console.log('❌ Still getting 500 error - SQL fix needs to be applied');
      console.log('Error:', signUpError.message);
    } else {
      console.log('ℹ️  Different error (might be rate limiting):', signUpError.message);
    }
  } else {
    console.log('✅ Signup successful! The fix may already be applied.');
    console.log('User ID:', signUpData.user?.id);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Apply the SQL fix in Supabase Dashboard');
  console.log('2. Test signup again');
  console.log('3. Verify that profiles are created automatically');
  console.log('4. Test login functionality');
  console.log('');
  console.log('After applying the fix, both signup and login should work correctly!');
}

fixAuthCompletely();