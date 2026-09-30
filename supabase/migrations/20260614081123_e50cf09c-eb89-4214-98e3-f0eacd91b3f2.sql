
CREATE POLICY "receipts_admin_all_objects" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'receipts' AND public.has_role(auth.uid(),'admin'))
WITH CHECK (bucket_id = 'receipts' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "receipts_self_read_objects" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'receipts'
  AND EXISTS (
    SELECT 1 FROM public.receipts r
    JOIN public.donations d ON d.id = r.donation_id
    WHERE r.storage_path = storage.objects.name
      AND d.user_id = auth.uid()
  )
);
