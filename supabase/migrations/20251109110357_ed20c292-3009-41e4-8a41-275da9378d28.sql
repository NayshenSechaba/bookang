-- Add unique constraint to profile_id if it doesn't exist
ALTER TABLE public.client_profiles 
ADD CONSTRAINT client_profiles_profile_id_key UNIQUE (profile_id);

-- Function to sync customer profiles to client_profiles
CREATE OR REPLACE FUNCTION public.sync_customer_to_client_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only sync if the profile is a customer
  IF NEW.role = 'customer' THEN
    -- Insert or update client_profile
    INSERT INTO public.client_profiles (
      profile_id,
      full_name,
      email,
      phone,
      address,
      city,
      province,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.full_name,
      NEW.email,
      NEW.phone,
      NEW.address,
      NEW.city,
      NEW.province,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (profile_id) 
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      province = EXCLUDED.province,
      updated_at = EXCLUDED.updated_at;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new customer profiles
DROP TRIGGER IF EXISTS sync_customer_profile_on_insert ON public.profiles;
CREATE TRIGGER sync_customer_profile_on_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_to_client_profile();

-- Create trigger for updated customer profiles
DROP TRIGGER IF EXISTS sync_customer_profile_on_update ON public.profiles;
CREATE TRIGGER sync_customer_profile_on_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_to_client_profile();

-- Sync existing customer profiles to client_profiles
INSERT INTO public.client_profiles (
  profile_id,
  full_name,
  email,
  phone,
  address,
  city,
  province,
  created_at,
  updated_at
)
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.address,
  p.city,
  p.province,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.role = 'customer'
ON CONFLICT (profile_id) 
DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  updated_at = EXCLUDED.updated_at;