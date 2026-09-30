
DROP POLICY IF EXISTS "aid_requests_public_insert" ON public.aid_requests;
DROP POLICY IF EXISTS "event_rsvps_public_insert" ON public.event_rsvps;
DROP POLICY IF EXISTS "volunteer_applications_public_insert" ON public.volunteer_applications;
DROP POLICY IF EXISTS "partner_inquiries_public_insert" ON public.partner_inquiries;
DROP POLICY IF EXISTS "donation_intents_public_insert" ON public.donation_intents;

REVOKE INSERT ON public.aid_requests FROM anon, authenticated;
REVOKE INSERT ON public.event_rsvps FROM anon, authenticated;
REVOKE INSERT ON public.volunteer_applications FROM anon, authenticated;
REVOKE INSERT ON public.partner_inquiries FROM anon, authenticated;
REVOKE INSERT ON public.donation_intents FROM anon, authenticated;
