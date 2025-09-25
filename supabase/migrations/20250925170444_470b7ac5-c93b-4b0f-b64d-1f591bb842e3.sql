-- Enhanced customer registration schema for Bookang
-- Add new fields to profiles table for comprehensive customer registration

-- Add username field (unique identifier for social features)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add language preference (11 SA official languages + international)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add business information for SME customers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

-- Add location information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'ZA';

-- Add profile verification status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add marketing preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_marketing_consent BOOLEAN DEFAULT FALSE;

-- Create consent tracking table for POPIA/GDPR compliance
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on consent_records
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Create policy for consent records (users can only see their own)
CREATE POLICY "Users can view their own consent records" 
ON public.consent_records 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create policy for inserting consent records
CREATE POLICY "Users can create their own consent records" 
ON public.consent_records 
FOR INSERT 
WITH CHECK (profile_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create OTP verification table for phone verification
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on otp_verifications
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for OTP verifications
CREATE POLICY "Users can manage their own OTP verifications" 
ON public.otp_verifications 
FOR ALL 
USING (profile_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON public.otp_verifications(phone_number, expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_profile_type ON public.consent_records(profile_id, consent_type);

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
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
$function$