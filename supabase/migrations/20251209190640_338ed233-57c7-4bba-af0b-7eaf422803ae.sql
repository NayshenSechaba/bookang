-- Add INSERT policy for profile-avatars bucket (authenticated users can upload their own images)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid() IS NOT NULL);

-- Add UPDATE policy for profile-avatars bucket (authenticated users can update their own images)
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-avatars' AND auth.uid() IS NOT NULL);

-- Add DELETE policy for profile-avatars bucket (authenticated users can delete their own images)
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-avatars' AND auth.uid() IS NOT NULL);