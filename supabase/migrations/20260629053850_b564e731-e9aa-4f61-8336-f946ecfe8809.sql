
-- Coordinator registrations (East Africa)
CREATE TABLE public.coordinator_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text NOT NULL,
  region text,
  organisation text,
  role_title text,
  years_experience integer,
  languages text,
  aid_types text[] DEFAULT '{}',
  estimated_beneficiaries integer,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.coordinator_registrations TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.coordinator_registrations TO authenticated;
ALTER TABLE public.coordinator_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coordinator registrations"
  ON public.coordinator_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_coordinator_registrations_updated_at
  BEFORE UPDATE ON public.coordinator_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Fundraiser registrations (AU)
CREATE TABLE public.fundraiser_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  state text NOT NULL,
  city text,
  postcode text,
  event_type text,
  event_date date,
  expected_participants integer,
  fundraising_goal_cents integer,
  prior_experience text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.fundraiser_registrations TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.fundraiser_registrations TO authenticated;
ALTER TABLE public.fundraiser_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fundraiser registrations"
  ON public.fundraiser_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_fundraiser_registrations_updated_at
  BEFORE UPDATE ON public.fundraiser_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
