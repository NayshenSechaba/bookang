-- Add banner_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banner_url text;

COMMENT ON COLUMN public.profiles.banner_url IS 'URL of the user profile banner/cover image';