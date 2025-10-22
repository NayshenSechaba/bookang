-- Add verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS business_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_submitted_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_approved_at timestamp with time zone DEFAULT NULL;

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for verification documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create verification_documents table to track uploads
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  verified boolean DEFAULT false
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own verification documents"
ON public.verification_documents
FOR ALL
USING (profile_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));