
-- aid_requests
CREATE TABLE public.aid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  country TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  is_caregiver TEXT,
  caregiver_name TEXT,
  disability_category TEXT,
  requested_aid TEXT,
  has_existing_device TEXT,
  device_condition TEXT,
  urgency_level TEXT,
  story TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.aid_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.aid_requests TO authenticated;
GRANT ALL ON public.aid_requests TO service_role;
ALTER TABLE public.aid_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aid_requests_public_insert" ON public.aid_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "aid_requests_admin_all" ON public.aid_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER aid_requests_updated_at BEFORE UPDATE ON public.aid_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- event_rsvps
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_external_id TEXT,
  event_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.event_rsvps TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_rsvps_public_insert" ON public.event_rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "event_rsvps_admin_all" ON public.event_rsvps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER event_rsvps_updated_at BEFORE UPDATE ON public.event_rsvps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- volunteer_applications
CREATE TABLE public.volunteer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.volunteer_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.volunteer_applications TO authenticated;
GRANT ALL ON public.volunteer_applications TO service_role;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteer_applications_public_insert" ON public.volunteer_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "volunteer_applications_admin_all" ON public.volunteer_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER volunteer_applications_updated_at BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- partner_inquiries
CREATE TABLE public.partner_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  org_type TEXT,
  partnership_type TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.partner_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.partner_inquiries TO authenticated;
GRANT ALL ON public.partner_inquiries TO service_role;
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_inquiries_public_insert" ON public.partner_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "partner_inquiries_admin_all" ON public.partner_inquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER partner_inquiries_updated_at BEFORE UPDATE ON public.partner_inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- donation_intents
CREATE TABLE public.donation_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  donor_country TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'one-time',
  channel TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donation_intents TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.donation_intents TO authenticated;
GRANT ALL ON public.donation_intents TO service_role;
ALTER TABLE public.donation_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donation_intents_public_insert" ON public.donation_intents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "donation_intents_admin_all" ON public.donation_intents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER donation_intents_updated_at BEFORE UPDATE ON public.donation_intents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
