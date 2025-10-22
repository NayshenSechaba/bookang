-- Add latitude and longitude columns to salons table for geolocation
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add index for faster geolocation queries
CREATE INDEX IF NOT EXISTS idx_salons_location ON public.salons(latitude, longitude);