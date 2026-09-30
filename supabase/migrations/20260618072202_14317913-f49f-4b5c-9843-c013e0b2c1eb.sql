
-- 1. Wipe seeded data
TRUNCATE TABLE
  public.contact_interactions,
  public.event_rsvps,
  public.volunteer_applications,
  public.partner_inquiries,
  public.contact_messages,
  public.contacts,
  public.donations,
  public.donation_intents,
  public.news_articles,
  public.events,
  public.media_assets,
  public.staff_members,
  public.expenses,
  public.budgets,
  public.page_settings
RESTART IDENTITY CASCADE;

-- 2. Add published column to page_settings
ALTER TABLE public.page_settings
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- 3. Refresh public read policy: anon can only read published pages
DROP POLICY IF EXISTS "Anyone can read page settings" ON public.page_settings;
DROP POLICY IF EXISTS "Public read page_settings" ON public.page_settings;
DROP POLICY IF EXISTS "Public can read published pages" ON public.page_settings;
DROP POLICY IF EXISTS "Authenticated can read all page settings" ON public.page_settings;

CREATE POLICY "Public can read published pages"
  ON public.page_settings FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Authenticated can read all page settings"
  ON public.page_settings FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.page_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_settings TO authenticated;
GRANT ALL ON public.page_settings TO service_role;
