-- Update the handle_new_user function to save phone from registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    phone,
    role,
    username,
    preferred_language,
    business_name,
    city,
    province,
    country,
    email_verified,
    marketing_consent,
    sms_marketing_consent
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role),
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'province',
    COALESCE(NEW.raw_user_meta_data->>'country', 'ZA'),
    COALESCE((NEW.raw_user_meta_data->>'email_verified')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'sms_marketing_consent')::boolean, false)
  );
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (profile_id)
  VALUES ((SELECT id FROM public.profiles WHERE user_id = NEW.id));
  
  RETURN NEW;
END;
$$;