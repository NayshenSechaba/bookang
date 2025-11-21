-- Add business location and contact information fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_province TEXT,
ADD COLUMN IF NOT EXISTS business_postal_code TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "09:00", "close": "13:00", "closed": false},
  "sunday": {"open": "00:00", "close": "00:00", "closed": true}
}'::jsonb;