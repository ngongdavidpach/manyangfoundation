
CREATE TABLE public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext,
  event_type text NOT NULL CHECK (event_type IN ('cookie_consent_updated','email_preferences_updated')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_activity_log_user_id_created_at_idx
  ON public.user_activity_log (user_id, created_at DESC);
CREATE INDEX user_activity_log_email_created_at_idx
  ON public.user_activity_log (email, created_at DESC);

GRANT SELECT ON public.user_activity_log TO authenticated;
GRANT ALL ON public.user_activity_log TO service_role;

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own activity"
  ON public.user_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
