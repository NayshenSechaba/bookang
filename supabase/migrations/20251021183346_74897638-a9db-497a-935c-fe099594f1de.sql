-- Remove redundant contact information columns from bookings table
-- Contact info should be fetched via JOINs with profiles/hairdressers/salons tables

ALTER TABLE public.bookings 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS saloon_email,
  DROP COLUMN IF EXISTS hairdresser_email,
  DROP COLUMN IF EXISTS hairdresser_contact_number,
  DROP COLUMN IF EXISTS saloon_phone_number;

-- Add comment to document the security fix
COMMENT ON TABLE public.bookings IS 'Booking records. Contact information is retrieved via foreign key relationships with profiles, hairdressers, and salons tables to prevent contact harvesting.';