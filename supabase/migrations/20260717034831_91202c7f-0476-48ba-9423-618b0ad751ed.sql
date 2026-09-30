CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE public.email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  receipts boolean NOT NULL DEFAULT true,
  events boolean NOT NULL DEFAULT true,
  coordinators boolean NOT NULL DEFAULT true,
  fundraisers boolean NOT NULL DEFAULT true,
  account boolean NOT NULL DEFAULT true,
  unsubscribed_all boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.email_preferences TO authenticated;
GRANT ALL ON public.email_preferences TO service_role;

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own email preferences"
ON public.email_preferences FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Users insert own email preferences"
ON public.email_preferences FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Users update own email preferences"
ON public.email_preferences FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
WITH CHECK (
  user_id = auth.uid()
  OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE TRIGGER email_preferences_set_updated_at
BEFORE UPDATE ON public.email_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX email_preferences_user_id_idx ON public.email_preferences(user_id);