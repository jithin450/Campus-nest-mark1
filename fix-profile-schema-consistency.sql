-- Fix profile schema consistency issues
-- The main issue is that the profiles table uses 'id' as primary key but some policies reference 'user_id'

-- First, let's check the current table structure and fix any inconsistencies
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;

-- Ensure the table structure is correct
-- The profiles table should use 'id' as the primary key that references auth.users(id)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_id;

-- Recreate RLS policies using the correct column name 'id'
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Allow service role to manage profiles (needed for triggers)
CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view profiles for public features
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Fix the trigger function to use correct column names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile using 'id' column (not user_id)
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing functions that reference user_id
DROP FUNCTION IF EXISTS public.create_user_with_phone(text, text);
DROP FUNCTION IF EXISTS public.create_missing_profile(UUID);

-- Create a function to manually create missing profiles using correct schema
CREATE OR REPLACE FUNCTION public.create_missing_profile(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_data RECORD;
BEGIN
  -- Get user data from auth.users
  SELECT id, email, raw_user_meta_data, phone 
  INTO user_data 
  FROM auth.users 
  WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert profile using 'id' column
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number
  ) VALUES (
    user_data.id,
    COALESCE(user_data.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(user_data.email, ''),
    COALESCE(user_data.raw_user_meta_data->>'phone_number', user_data.phone, '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.create_missing_profile(UUID) TO authenticated, service_role;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);