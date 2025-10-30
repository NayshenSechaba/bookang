-- Add verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected', 'outstanding');

-- Add status column to verification_documents
ALTER TABLE public.verification_documents 
ADD COLUMN status public.verification_status DEFAULT 'pending' NOT NULL;

-- Add reviewed_by and reviewed_at columns
ALTER TABLE public.verification_documents 
ADD COLUMN reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN reviewed_at timestamp with time zone,
ADD COLUMN rejection_reason text;

-- Create RLS policy for super users to view all documents
CREATE POLICY "Super users can view all verification documents"
ON public.verification_documents
FOR SELECT
TO authenticated
USING (
  has_employee_role(auth.uid(), 'super_user'::employee_role)
);

-- Create RLS policy for super users to update document status
CREATE POLICY "Super users can update verification documents"
ON public.verification_documents
FOR UPDATE
TO authenticated
USING (
  has_employee_role(auth.uid(), 'super_user'::employee_role)
)
WITH CHECK (
  has_employee_role(auth.uid(), 'super_user'::employee_role)
);