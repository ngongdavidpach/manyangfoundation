-- 1. password_history: hashes are only touched by SECURITY DEFINER functions.
--    Remove all client-role privileges and make the deny-all intent explicit.
REVOKE ALL ON public.password_history FROM anon, authenticated;
GRANT ALL ON public.password_history TO service_role;

DROP POLICY IF EXISTS "password_history_no_client_access" ON public.password_history;
CREATE POLICY "password_history_no_client_access"
  ON public.password_history
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 2. site-images: files are delivered through signed URLs (which bypass RLS),
--    so bucket-wide public SELECT is unnecessary. Restrict direct reads to admins.
DROP POLICY IF EXISTS "site_images_public_read" ON storage.objects;

DROP POLICY IF EXISTS "site_images_admin_read" ON storage.objects;
CREATE POLICY "site_images_admin_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'::app_role));