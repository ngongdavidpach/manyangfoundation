
-- 1) Remove public read on base staff_members table (exposed email column)
DROP POLICY IF EXISTS staff_public_read_active ON public.staff_members;

-- Make sure anon has no direct access; public site reads via staff_members_public view
REVOKE SELECT ON public.staff_members FROM anon;

-- Ensure the safe view is readable
GRANT SELECT ON public.staff_members_public TO anon, authenticated;

-- 2) Harden has_role with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
