-- ========================================
-- Security Fix: Separate User Roles Table (Fixed)
-- ========================================

-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('customer', 'hairdresser', 'employee', 'salon_owner', 'admin');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Migrate existing roles from profiles to user_roles (with text conversion)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::text::app_role
FROM public.profiles
WHERE role IS NOT NULL
  AND role::text IN ('customer', 'hairdresser', 'employee', 'salon_owner', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Update profiles RLS policy to prevent role modification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (no role changes)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- 7. Create RLS policy for user_roles (read-only for users)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 8. Only admins can modify roles (will be implemented via service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- ========================================
-- Security Fix: Storage Bucket Policies
-- ========================================

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload salon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete salon images" ON storage.objects;

-- Create user-scoped storage policies for salon-images
CREATE POLICY "Users can upload to their own folder in salon-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in salon-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'salon-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in salon-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view salon images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'salon-images');

-- Apply same pattern to hairdresser-portfolios
DROP POLICY IF EXISTS "Anyone can view hairdresser portfolios" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload hairdresser portfolios" ON storage.objects;

CREATE POLICY "Users can upload to their own folder in hairdresser-portfolios"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hairdresser-portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in hairdresser-portfolios"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hairdresser-portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in hairdresser-portfolios"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hairdresser-portfolios' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view hairdresser portfolios"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hairdresser-portfolios');

-- Apply same pattern to profile-avatars
DROP POLICY IF EXISTS "Users can upload profile avatars" ON storage.objects;

CREATE POLICY "Users can upload to their own folder in profile-avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in profile-avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in profile-avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view profile avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-avatars');