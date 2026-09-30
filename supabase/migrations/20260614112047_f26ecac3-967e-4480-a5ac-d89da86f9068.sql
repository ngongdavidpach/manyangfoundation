
-- =====================================================================
-- 1. Rate limiter
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rate_limits_key_bucket_window_idx
  ON public.rate_limits(key, bucket, window_start);
CREATE INDEX IF NOT EXISTS rate_limits_window_idx
  ON public.rate_limits(window_start);

-- Service role only; the function is SECURITY DEFINER so callers don't need direct grants
REVOKE ALL ON public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies → no access for anon/authenticated. Service role bypasses RLS.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key text,
  _bucket text,
  _max integer,
  _window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start timestamptz;
  _current_count integer;
BEGIN
  _window_start := to_timestamp(
    floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds
  );

  INSERT INTO public.rate_limits (key, bucket, window_start, count)
  VALUES (_key, _bucket, _window_start, 1)
  ON CONFLICT (key, bucket, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO _current_count;

  -- Opportunistic cleanup of old windows (cheap with the index)
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits
     WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN _current_count <= _max;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer)
  TO authenticated, service_role;

-- =====================================================================
-- 2. RLS tightening
-- =====================================================================

-- user_roles: drop redundant policy that included anon
DROP POLICY IF EXISTS user_roles_admin_only_write ON public.user_roles;

-- contacts: CRM is admin-only per product decision
DROP POLICY IF EXISTS contacts_self_read ON public.contacts;

-- profiles: admins should see all profiles for CRM lookups
DROP POLICY IF EXISTS profiles_admin_read ON public.profiles;
CREATE POLICY profiles_admin_read ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Defensive: ensure anon has no access to sensitive tables
REVOKE ALL ON public.donations          FROM anon;
REVOKE ALL ON public.receipts           FROM anon;
REVOKE ALL ON public.contacts           FROM anon;
REVOKE ALL ON public.contact_interactions FROM anon;
REVOKE ALL ON public.expenses           FROM anon;
REVOKE ALL ON public.expense_categories FROM anon;
REVOKE ALL ON public.budgets            FROM anon;
REVOKE ALL ON public.user_roles         FROM anon;
REVOKE ALL ON public.profiles           FROM anon;
REVOKE ALL ON public.staff_members      FROM anon;

-- page_settings: anon read only (site reads it before login)
REVOKE INSERT, UPDATE, DELETE ON public.page_settings FROM anon;
GRANT  SELECT ON public.page_settings TO anon;

-- Re-affirm service_role full access (idempotent)
GRANT ALL ON public.donations,
             public.receipts,
             public.contacts,
             public.contact_interactions,
             public.expenses,
             public.expense_categories,
             public.budgets,
             public.user_roles,
             public.profiles,
             public.staff_members,
             public.page_settings,
             public.media_assets,
             public.news_articles,
             public.events
       TO service_role;

-- =====================================================================
-- 3. Receipts storage policies (bucket already exists, private)
-- =====================================================================
DROP POLICY IF EXISTS receipts_admin_all ON storage.objects;
CREATE POLICY receipts_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS receipts_donor_read ON storage.objects;
CREATE POLICY receipts_donor_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND EXISTS (
      SELECT 1 FROM public.donations d
      WHERE d.user_id = auth.uid()
        AND storage.objects.name LIKE 'donations/' || d.id::text || '/%'
    )
  );

-- =====================================================================
-- 4. Ensure receipt-number trigger is attached to donations
-- =====================================================================
DROP TRIGGER IF EXISTS donations_assign_receipt_number ON public.donations;
CREATE TRIGGER donations_assign_receipt_number
  BEFORE INSERT OR UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.assign_receipt_number();
