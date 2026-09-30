
DROP POLICY IF EXISTS "page_settings_public_read" ON public.page_settings;
DROP POLICY IF EXISTS "Authenticated can read all page settings" ON public.page_settings;

CREATE POLICY "Admins can read all page settings"
  ON public.page_settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read published pages"
  ON public.page_settings
  FOR SELECT
  TO authenticated
  USING (published = true);
