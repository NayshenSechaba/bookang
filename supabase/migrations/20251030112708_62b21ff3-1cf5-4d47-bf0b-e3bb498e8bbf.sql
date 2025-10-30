-- Create employee roles enum
CREATE TYPE public.employee_role AS ENUM ('employee', 'super_user');

-- Create employee_roles table
CREATE TABLE public.employee_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role employee_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on employee_roles
ALTER TABLE public.employee_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check employee role
CREATE OR REPLACE FUNCTION public.has_employee_role(_user_id UUID, _role employee_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employee_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policy: Users can view their own employee roles
CREATE POLICY "Users can view their own employee roles"
ON public.employee_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create client_profiles table
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  last_booking_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on client_profiles
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view all client profiles
CREATE POLICY "Employees can view all client profiles"
ON public.client_profiles
FOR SELECT
TO authenticated
USING (
  public.has_employee_role(auth.uid(), 'employee') OR 
  public.has_employee_role(auth.uid(), 'super_user')
);

-- Policy: Only super users can directly update client profiles
CREATE POLICY "Super users can update client profiles"
ON public.client_profiles
FOR UPDATE
TO authenticated
USING (public.has_employee_role(auth.uid(), 'super_user'))
WITH CHECK (public.has_employee_role(auth.uid(), 'super_user'));

-- Create amendment_requests table
CREATE TABLE public.amendment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_employee UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_client UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on amendment_requests
ALTER TABLE public.amendment_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own requests and super users can view all
CREATE POLICY "Employees can view amendment requests"
ON public.amendment_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id_employee OR 
  public.has_employee_role(auth.uid(), 'super_user')
);

-- Policy: Employees can create amendment requests
CREATE POLICY "Employees can create amendment requests"
ON public.amendment_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id_employee AND 
  (public.has_employee_role(auth.uid(), 'employee') OR public.has_employee_role(auth.uid(), 'super_user'))
);

-- Policy: Super users can update amendment requests
CREATE POLICY "Super users can update amendment requests"
ON public.amendment_requests
FOR UPDATE
TO authenticated
USING (public.has_employee_role(auth.uid(), 'super_user'))
WITH CHECK (public.has_employee_role(auth.uid(), 'super_user'));

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false);

-- Storage policy: Employees can view client documents
CREATE POLICY "Employees can view client documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' AND 
  (public.has_employee_role(auth.uid(), 'employee') OR public.has_employee_role(auth.uid(), 'super_user'))
);

-- Storage policy: Super users can upload client documents
CREATE POLICY "Super users can upload client documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' AND 
  public.has_employee_role(auth.uid(), 'super_user')
);

-- Create trigger for updating client_profiles updated_at
CREATE TRIGGER update_client_profiles_updated_at
BEFORE UPDATE ON public.client_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating amendment_requests updated_at
CREATE TRIGGER update_amendment_requests_updated_at
BEFORE UPDATE ON public.amendment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();