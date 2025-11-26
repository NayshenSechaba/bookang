-- Create verification email logs table
CREATE TABLE IF NOT EXISTS public.verification_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  sent_to TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  sent_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.verification_email_logs ENABLE ROW LEVEL SECURITY;

-- Super users can view all logs
CREATE POLICY "Super users can view all email logs"
  ON public.verification_email_logs
  FOR SELECT
  USING (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- Employees can view all logs
CREATE POLICY "Employees can view email logs"
  ON public.verification_email_logs
  FOR SELECT
  USING (
    has_employee_role(auth.uid(), 'employee'::employee_role) OR 
    has_employee_role(auth.uid(), 'super_user'::employee_role)
  );

-- Businesses can view their own email logs
CREATE POLICY "Businesses can view their own email logs"
  ON public.verification_email_logs
  FOR SELECT
  USING (profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Create index for faster queries
CREATE INDEX idx_verification_email_logs_profile_id ON public.verification_email_logs(profile_id);
CREATE INDEX idx_verification_email_logs_sent_at ON public.verification_email_logs(sent_at DESC);

-- Add comment
COMMENT ON TABLE public.verification_email_logs IS 'Tracks all verification status change emails sent to businesses';