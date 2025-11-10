-- Update the sync function to ensure phone numbers are saved
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

-- Add a column to bookings table to store customer phone for SMS fallback
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_phone text;