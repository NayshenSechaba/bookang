-- Create table for sensitive business payment settings
CREATE TABLE public.business_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  paystack_subaccount_code TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_payment_settings ENABLE ROW LEVEL SECURITY;

-- Only super users can view payment settings
CREATE POLICY "Super users can view all payment settings"
ON public.business_payment_settings
FOR SELECT
USING (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- Only super users can insert payment settings
CREATE POLICY "Super users can insert payment settings"
ON public.business_payment_settings
FOR INSERT
WITH CHECK (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- Only super users can update payment settings
CREATE POLICY "Super users can update payment settings"
ON public.business_payment_settings
FOR UPDATE
USING (has_employee_role(auth.uid(), 'super_user'::employee_role))
WITH CHECK (has_employee_role(auth.uid(), 'super_user'::employee_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_payment_settings_updated_at
BEFORE UPDATE ON public.business_payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_business_payment_settings_profile_id ON public.business_payment_settings(profile_id);