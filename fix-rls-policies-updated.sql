-- Updated SQL script to fix RLS policies (handles existing policies)
-- Run this in your Supabase dashboard SQL editor

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view profiles" ON public.profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow service role to insert profiles" 
ON public.profiles 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Allow authenticated users to view all profiles (for hostel owner info, etc.)
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow anonymous users to view profiles (for public hostel listings)
CREATE POLICY "Anonymous users can view profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test if the trigger function can now insert profiles
SELECT 'RLS policies updated successfully' as status;