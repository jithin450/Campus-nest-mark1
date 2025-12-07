-- Fix security warnings by setting proper search_path for functions

-- Update the create_user_with_phone function with proper search_path
CREATE OR REPLACE FUNCTION public.create_user_with_phone(
  phone_number TEXT,
  full_name TEXT
)
RETURNS TABLE(user_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id UUID;
  existing_profile profiles%ROWTYPE;
BEGIN
  -- Check if user with this phone already exists
  SELECT * INTO existing_profile 
  FROM public.profiles 
  WHERE phone_number = create_user_with_phone.phone_number;
  
  IF existing_profile.id IS NOT NULL THEN
    RETURN QUERY SELECT existing_profile.user_id, FALSE, 'User with this phone number already exists';
    RETURN;
  END IF;
  
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id,
    full_name,
    phone_number,
    mobile_number
  ) VALUES (
    new_user_id,
    create_user_with_phone.full_name,
    create_user_with_phone.phone_number,
    create_user_with_phone.phone_number
  );
  
  RETURN QUERY SELECT new_user_id, TRUE, 'User created successfully';
END;
$$;

-- Update the verify_user_phone function with proper search_path  
CREATE OR REPLACE FUNCTION public.verify_user_phone(
  phone_number TEXT
)
RETURNS TABLE(user_data JSON)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE phone_number = verify_user_phone.phone_number;
  
  IF user_profile.id IS NOT NULL THEN
    RETURN QUERY SELECT row_to_json(user_profile);
  ELSE
    RETURN QUERY SELECT NULL::JSON;
  END IF;
END;
$$;