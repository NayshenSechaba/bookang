-- Add payment onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paystack_status text DEFAULT 'Not Started',
ADD COLUMN IF NOT EXISTS paystack_public_key text DEFAULT NULL;