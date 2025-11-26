-- Add RLS policies for client-documents bucket to allow file uploads

-- Allow employees to upload client documents
CREATE POLICY "Employees can upload client documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' 
  AND (has_employee_role(auth.uid(), 'employee'::employee_role) 
       OR has_employee_role(auth.uid(), 'super_user'::employee_role))
);

-- Allow employees to update client documents
CREATE POLICY "Employees can update client documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-documents' 
  AND (has_employee_role(auth.uid(), 'employee'::employee_role) 
       OR has_employee_role(auth.uid(), 'super_user'::employee_role))
);

-- Allow super users to delete client documents
CREATE POLICY "Super users can delete client documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents' 
  AND has_employee_role(auth.uid(), 'super_user'::employee_role)
);