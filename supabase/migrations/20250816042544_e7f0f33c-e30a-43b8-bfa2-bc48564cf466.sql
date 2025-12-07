-- Sanitize verify_user_phone to avoid exposing phone numbers
CREATE OR REPLACE FUNCTION public.verify_user_phone(phone_number text)
 RETURNS TABLE(user_data json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles p
  WHERE p.phone_number = verify_user_phone.phone_number;
  
  IF user_profile.id IS NOT NULL THEN
    -- Return only non-sensitive fields; do NOT include phone numbers
    RETURN QUERY SELECT json_build_object(
      'user_id', user_profile.user_id,
      'full_name', user_profile.full_name
    );
  ELSE
    RETURN QUERY SELECT NULL::JSON;
  END IF;
END;
$function$;