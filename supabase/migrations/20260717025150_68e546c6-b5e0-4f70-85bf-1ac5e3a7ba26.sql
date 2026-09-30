
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =========================
-- account_deletion_requests
-- =========================
CREATE TABLE public.account_deletion_requests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  purge_after timestamptz NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cancelled','purged')),
  cancel_token text NOT NULL,
  cancel_token_used_at timestamptz,
  cancelled_at timestamptz,
  purged_at timestamptz
);
CREATE UNIQUE INDEX account_deletion_requests_cancel_token_key
  ON public.account_deletion_requests(cancel_token);
CREATE INDEX account_deletion_requests_purge_idx
  ON public.account_deletion_requests(status, purge_after);

GRANT SELECT, INSERT, UPDATE ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.account_deletion_requests TO service_role;

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own deletion request"
  ON public.account_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own deletion request"
  ON public.account_deletion_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own deletion request"
  ON public.account_deletion_requests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =========================
-- password_history
-- =========================
CREATE TABLE public.password_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX password_history_user_created_idx
  ON public.password_history(user_id, created_at DESC);

GRANT ALL ON public.password_history TO service_role;
-- No authenticated grants: only server-role code touches this table.

ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role can read/write.

-- =========================
-- Password history helpers
-- =========================
CREATE OR REPLACE FUNCTION public.check_password_reuse(_user_id uuid, _new_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM (
      SELECT password_hash FROM public.password_history
       WHERE user_id = _user_id
       ORDER BY created_at DESC
       LIMIT 5
    ) recent
    WHERE recent.password_hash = extensions.crypt(_new_password, recent.password_hash)
  );
$$;

REVOKE ALL ON FUNCTION public.check_password_reuse(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_password_reuse(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.record_password_hash(_user_id uuid, _new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.password_history(user_id, password_hash)
  VALUES (_user_id, extensions.crypt(_new_password, extensions.gen_salt('bf', 10)));

  DELETE FROM public.password_history
   WHERE user_id = _user_id
     AND id NOT IN (
       SELECT id FROM public.password_history
        WHERE user_id = _user_id
        ORDER BY created_at DESC
        LIMIT 5
     );
END;
$$;

REVOKE ALL ON FUNCTION public.record_password_hash(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_password_hash(uuid, text) TO service_role;

-- =========================
-- Daily purge cron
-- =========================
SELECT cron.schedule(
  'purge-deleted-accounts',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--b11f2ede-4baf-42ba-8d4c-06cc21dd4aa8.lovable.app/api/public/hooks/purge-deleted-accounts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZnJ0eXVjaG9icWtxZXd3dGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzQ2MTYsImV4cCI6MjA5Njk1MDYxNn0.8d1kwY5oDnSXrETlUcnoXK3jNVACKoDUbDAM-jdjNUw'
    ),
    body := '{}'::jsonb
  );
  $$
);
