-- Create business verification checklist table
CREATE TABLE public.business_verification_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  documents_uploaded BOOLEAN NOT NULL DEFAULT false,
  documents_verified_by UUID REFERENCES public.profiles(id),
  documents_verified_at TIMESTAMP WITH TIME ZONE,
  paystack_code_added BOOLEAN NOT NULL DEFAULT false,
  paystack_code_verified_by UUID REFERENCES public.profiles(id),
  paystack_code_verified_at TIMESTAMP WITH TIME ZONE,
  paystack_business_name TEXT,
  paystack_business_verified BOOLEAN NOT NULL DEFAULT false,
  paystack_business_verified_by UUID REFERENCES public.profiles(id),
  paystack_business_verified_at TIMESTAMP WITH TIME ZONE,
  final_approval BOOLEAN NOT NULL DEFAULT false,
  final_approved_by UUID REFERENCES public.profiles(id),
  final_approved_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_verification_checklist ENABLE ROW LEVEL SECURITY;

-- Only employees and super users can view verification checklists
CREATE POLICY "Employees can view verification checklists"
ON public.business_verification_checklist
FOR SELECT
USING (
  has_employee_role(auth.uid(), 'employee'::employee_role) 
  OR has_employee_role(auth.uid(), 'super_user'::employee_role)
);

-- Only employees and super users can create verification checklists
CREATE POLICY "Employees can create verification checklists"
ON public.business_verification_checklist
FOR INSERT
WITH CHECK (
  has_employee_role(auth.uid(), 'employee'::employee_role) 
  OR has_employee_role(auth.uid(), 'super_user'::employee_role)
);

-- Only employees and super users can update verification checklists
CREATE POLICY "Employees can update verification checklists"
ON public.business_verification_checklist
FOR UPDATE
USING (
  has_employee_role(auth.uid(), 'employee'::employee_role) 
  OR has_employee_role(auth.uid(), 'super_user'::employee_role)
)
WITH CHECK (
  has_employee_role(auth.uid(), 'employee'::employee_role) 
  OR has_employee_role(auth.uid(), 'super_user'::employee_role)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_verification_checklist_updated_at
BEFORE UPDATE ON public.business_verification_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_business_verification_checklist_profile_id 
ON public.business_verification_checklist(profile_id);