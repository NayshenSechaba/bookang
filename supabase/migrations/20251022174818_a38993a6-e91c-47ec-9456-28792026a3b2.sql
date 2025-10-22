-- Make hairdresser_id optional in bookings table
ALTER TABLE public.bookings 
ALTER COLUMN hairdresser_id DROP NOT NULL;

-- Make service_id optional as well for flexibility
ALTER TABLE public.bookings 
ALTER COLUMN service_id DROP NOT NULL;