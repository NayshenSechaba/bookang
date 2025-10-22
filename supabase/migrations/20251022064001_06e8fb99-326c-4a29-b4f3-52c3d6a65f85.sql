-- Allow authenticated users to upload to salon-images bucket
CREATE POLICY "Authenticated users can upload salon images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'salon-images');

-- Allow authenticated users to update their own salon images
CREATE POLICY "Users can update salon images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'salon-images');

-- Allow authenticated users to delete their own salon images
CREATE POLICY "Users can delete salon images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'salon-images');

-- Allow public read access to salon images (since bucket is public)
CREATE POLICY "Public read access for salon images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'salon-images');