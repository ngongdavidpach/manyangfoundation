DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;