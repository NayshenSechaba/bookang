-- Fix: Restrict hairdresser business data to authenticated users only
-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Everyone can view hairdressers" ON public.hairdressers;

-- Create new policy requiring authentication to view hairdresser data
CREATE POLICY "Authenticated users can view hairdressers" 
ON public.hairdressers
FOR SELECT 
TO authenticated
USING (true);

-- Note: Hairdressers can still manage their own data via the existing policy:
-- "Hairdressers can manage their own data" (already in place)