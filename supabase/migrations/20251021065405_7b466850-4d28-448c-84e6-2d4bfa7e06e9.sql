-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('salon-images', 'salon-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('hairdresser-portfolios', 'hairdresser-portfolios', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

-- Create policies for salon images
CREATE POLICY "Salon images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'salon-images');

CREATE POLICY "Salon owners can upload salon images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'salon-images' 
  AND auth.uid() IN (
    SELECT s.owner_id 
    FROM salons s
    JOIN profiles p ON p.id = s.owner_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Salon owners can update their salon images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'salon-images' 
  AND auth.uid() IN (
    SELECT s.owner_id 
    FROM salons s
    JOIN profiles p ON p.id = s.owner_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Salon owners can delete their salon images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'salon-images' 
  AND auth.uid() IN (
    SELECT s.owner_id 
    FROM salons s
    JOIN profiles p ON p.id = s.owner_id
    WHERE p.user_id = auth.uid()
  )
);

-- Create policies for hairdresser portfolios
CREATE POLICY "Portfolio images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hairdresser-portfolios');

CREATE POLICY "Hairdressers can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'hairdresser-portfolios' 
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM hairdressers h
    JOIN profiles p ON p.id = h.profile_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Hairdressers can update their portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'hairdresser-portfolios' 
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM hairdressers h
    JOIN profiles p ON p.id = h.profile_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Hairdressers can delete their portfolio images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'hairdresser-portfolios' 
  AND auth.uid() IN (
    SELECT p.user_id 
    FROM hairdressers h
    JOIN profiles p ON p.id = h.profile_id
    WHERE p.user_id = auth.uid()
  )
);

-- Create policies for profile avatars
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);