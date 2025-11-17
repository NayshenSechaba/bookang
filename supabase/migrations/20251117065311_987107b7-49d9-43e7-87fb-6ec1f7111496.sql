-- Create reviews table for tracking customer reviews of businesses
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hairdresser_id uuid NOT NULL REFERENCES public.hairdressers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  flagged boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can create reviews for their bookings"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (
    customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super users can update any review"
  ON public.reviews
  FOR UPDATE
  USING (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- Create index for faster queries
CREATE INDEX idx_reviews_hairdresser ON public.reviews(hairdresser_id);
CREATE INDEX idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Create updated_at trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for business rankings
CREATE OR REPLACE VIEW public.vw_business_rankings AS
SELECT 
  h.id as hairdresser_id,
  COALESCE(p.business_name, p.full_name, 'Unknown') as business_name,
  COUNT(r.id) as total_reviews,
  ROUND(AVG(r.rating)::numeric, 2) as average_rating,
  COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star_count,
  COUNT(CASE WHEN r.flagged = true THEN 1 END) as flagged_reviews,
  MAX(r.created_at) as last_review_date,
  (
    SELECT COUNT(*) 
    FROM public.bookings b 
    WHERE b.hairdresser_id = h.id AND b.status = 'completed'
  ) as total_completed_bookings,
  ROUND(
    (COUNT(r.id)::numeric / NULLIF(
      (SELECT COUNT(*) FROM public.bookings b WHERE b.hairdresser_id = h.id AND b.status = 'completed'), 
      0
    ) * 100), 
    2
  ) as review_response_rate
FROM public.hairdressers h
JOIN public.profiles p ON h.profile_id = p.id
LEFT JOIN public.reviews r ON r.hairdresser_id = h.id
GROUP BY h.id, p.business_name, p.full_name
HAVING COUNT(r.id) > 0
ORDER BY average_rating DESC, total_reviews DESC;

-- Create view for customer rankings  
CREATE OR REPLACE VIEW public.vw_customer_rankings AS
SELECT 
  c.id as customer_id,
  c.full_name as customer_name,
  c.email,
  COUNT(r.id) as total_reviews_given,
  ROUND(AVG(r.rating)::numeric, 2) as average_rating_given,
  COUNT(CASE WHEN r.rating <= 2 THEN 1 END) as low_ratings_given,
  COUNT(CASE WHEN r.flagged = true THEN 1 END) as flagged_reviews_given,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COUNT(CASE WHEN b.status = 'no_show' THEN 1 END) as no_show_count,
  MAX(r.created_at) as last_review_date,
  ROUND(
    (COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::numeric / NULLIF(COUNT(b.id), 0) * 100),
    2
  ) as completion_rate
FROM public.profiles c
LEFT JOIN public.reviews r ON r.customer_id = c.id
LEFT JOIN public.bookings b ON b.customer_id = c.id
WHERE c.role = 'customer'
GROUP BY c.id, c.full_name, c.email
HAVING COUNT(b.id) > 0
ORDER BY completion_rate DESC, average_rating_given DESC;