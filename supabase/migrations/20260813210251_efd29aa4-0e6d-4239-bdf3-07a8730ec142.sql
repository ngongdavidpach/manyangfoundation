ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS stripe_invoice_id text;

CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_session_id_key
  ON public.donations (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_payment_intent_id_key
  ON public.donations (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_invoice_id_key
  ON public.donations (stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.processed_stripe_events TO service_role;

ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view processed stripe events"
  ON public.processed_stripe_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));