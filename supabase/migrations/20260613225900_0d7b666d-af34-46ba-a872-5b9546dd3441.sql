
-- 1) Restrict profiles SELECT to the owner only (no more public exposure)
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Clean any email accidentally stored in full_name
UPDATE public.profiles
SET full_name = split_part(full_name, '@', 1)
WHERE full_name ILIKE '%@%.%';

-- 2) Restrict staff_members read to authenticated users (removes public email exposure)
DROP POLICY IF EXISTS staff_public_read ON public.staff_members;
DROP POLICY IF EXISTS staff_members_public_read ON public.staff_members;

CREATE POLICY staff_members_admin_all ON public.staff_members
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public-safe view excluding email for anonymous/site visitors
CREATE OR REPLACE VIEW public.staff_members_public
WITH (security_invoker=on) AS
SELECT id, full_name, role_title, bio, photo_url, sort_order, is_active, created_at, updated_at
FROM public.staff_members
WHERE is_active = true;

GRANT SELECT ON public.staff_members_public TO anon, authenticated;

-- 3) Lock down user_roles inserts/updates/deletes to admins only via a restrictive policy
CREATE POLICY user_roles_admin_only_write ON public.user_roles
  AS RESTRICTIVE
  FOR ALL TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
