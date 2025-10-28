-- Create secure booking tokens table
CREATE TABLE IF NOT EXISTS public.secure_booking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create index for faster token lookups
CREATE INDEX idx_secure_booking_tokens_token ON public.secure_booking_tokens(token);
CREATE INDEX idx_secure_booking_tokens_booking_id ON public.secure_booking_tokens(booking_id);

-- Enable RLS
ALTER TABLE public.secure_booking_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read valid tokens (needed for public booking management)
CREATE POLICY "Anyone can read valid unexpired tokens"
  ON public.secure_booking_tokens
  FOR SELECT
  USING (expires_at > now() AND used_at IS NULL);