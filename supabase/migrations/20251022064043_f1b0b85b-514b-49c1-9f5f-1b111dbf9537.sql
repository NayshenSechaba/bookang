-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Authenticated users can upload salon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update salon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete salon images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for salon images" ON storage.objects;

-- Recreate policies with correct permissions
CREATE POLICY "Authenticated users can upload salon images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'salon-images');

CREATE POLICY "Users can update salon images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'salon-images');

CREATE POLICY "Users can delete salon images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'salon-images');

CREATE POLICY "Public read access for salon images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'salon-images');