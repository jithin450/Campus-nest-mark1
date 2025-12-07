-- Fix RLS policies for profiles table to allow user signup
-- This fixes the 500 error during signup caused by missing INSERT policy

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