
-- Admin access audit log
CREATE TABLE public.admin_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint text,
  role_result boolean NOT NULL DEFAULT false,
  reason text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_access_log TO authenticated;
GRANT ALL ON public.admin_access_log TO service_role;

ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read admin access log"
  ON public.admin_access_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX admin_access_log_created_at_idx ON public.admin_access_log (created_at DESC);

-- Events calendar enhancements
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS rsvp_url text;
