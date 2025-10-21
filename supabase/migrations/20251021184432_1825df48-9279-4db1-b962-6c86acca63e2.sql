-- Add missing profile fields for profile completion check
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS business_description text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false;

-- Add comment to document the profile completion fields
COMMENT ON COLUMN public.profiles.business_description IS 'Business description for hairdressers and salon owners';
COMMENT ON COLUMN public.profiles.address IS 'Business or user address';
COMMENT ON COLUMN public.profiles.payment_verified IS 'Whether the user has verified their payment method';