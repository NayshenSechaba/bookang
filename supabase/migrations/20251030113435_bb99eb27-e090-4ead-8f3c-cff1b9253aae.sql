-- Create view for booking status summary
CREATE OR REPLACE VIEW public.vw_booking_status AS
SELECT 
  b.id as booking_id,
  b.status,
  b.appointment_date,
  b.created_at,
  s.id as salon_id,
  s.name as salon_name,
  h.id as hairdresser_id,
  cp.full_name as client_name,
  sr.name as service_name,
  b.total_price
FROM public.bookings b
LEFT JOIN public.salons s ON b.saloon = s.id
LEFT JOIN public.hairdressers h ON b.hairdresser_id = h.id
LEFT JOIN public.client_profiles cp ON b.customer_id = cp.profile_id
LEFT JOIN public.services sr ON b.service_id = sr.id;

-- Grant select to authenticated users
GRANT SELECT ON public.vw_booking_status TO authenticated;

-- Create view for performer ratings (using bookings as proxy for now)
CREATE OR REPLACE VIEW public.vw_performer_ratings AS
SELECT 
  h.id as hairdresser_id,
  p.full_name as hairdresser_name,
  s.name as salon_name,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as total_completed_bookings,
  COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as total_cancellations,
  COUNT(CASE WHEN b.status = 'no-show' THEN 1 END) as total_no_shows,
  COUNT(*) as total_bookings,
  ROUND(
    (COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as completion_rate
FROM public.hairdressers h
INNER JOIN public.profiles p ON h.profile_id = p.id
LEFT JOIN public.salons s ON h.salon_id = s.id
LEFT JOIN public.bookings b ON h.id = b.hairdresser_id
GROUP BY h.id, p.full_name, s.name;

-- Grant select to authenticated users
GRANT SELECT ON public.vw_performer_ratings TO authenticated;

-- Create view for onboarding status
CREATE OR REPLACE VIEW public.vw_onboarding_status AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.full_name,
  p.email,
  p.role,
  p.onboarding_completed,
  p.verification_status,
  p.email_verified,
  p.phone_verified,
  p.payment_verified,
  p.created_at,
  CASE 
    WHEN p.onboarding_completed = true THEN 'Complete'
    WHEN p.payment_verified = true THEN 'Bank Details Added'
    WHEN p.verification_status = 'approved' THEN 'Verification Approved'
    WHEN p.verification_status = 'pending' THEN 'Verification Pending'
    WHEN p.full_name IS NOT NULL AND p.phone IS NOT NULL THEN 'Profile Complete'
    ELSE 'Just Started'
  END as onboarding_stage,
  CASE
    WHEN p.verification_status = 'approved' THEN true
    ELSE false
  END as is_verified
FROM public.profiles p
WHERE p.role IN ('hairdresser', 'salon_owner');

-- Grant select to authenticated users
GRANT SELECT ON public.vw_onboarding_status TO authenticated;

-- Create view for commission data
CREATE OR REPLACE VIEW public.vw_commission_data AS
SELECT 
  b.id as booking_id,
  b.appointment_date,
  b.status,
  h.id as hairdresser_id,
  p.full_name as hairdresser_name,
  p.email as hairdresser_email,
  s.id as salon_id,
  s.name as salon_name,
  b.total_price as service_cost,
  15.0 as commission_rate_percent,
  ROUND((b.total_price * 0.15), 2) as commission_amount,
  TO_CHAR(b.appointment_date, 'YYYY-MM') as month_year,
  EXTRACT(YEAR FROM b.appointment_date) as year,
  EXTRACT(MONTH FROM b.appointment_date) as month
FROM public.bookings b
INNER JOIN public.hairdressers h ON b.hairdresser_id = h.id
INNER JOIN public.profiles p ON h.profile_id = p.id
LEFT JOIN public.salons s ON h.salon_id = s.id
WHERE b.status = 'completed';

-- Grant select to authenticated users
GRANT SELECT ON public.vw_commission_data TO authenticated;

-- Add RLS policies for views (employees can view all data)
ALTER VIEW public.vw_booking_status SET (security_invoker = true);
ALTER VIEW public.vw_performer_ratings SET (security_invoker = true);
ALTER VIEW public.vw_onboarding_status SET (security_invoker = true);
ALTER VIEW public.vw_commission_data SET (security_invoker = true);