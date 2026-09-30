# Real programs with their own pages

Turn the seven focus areas into seven real programs, each with its own page, and show them as a card grid on the home page.

## The seven programs

Each gets a page at its own web address:

1. Disability Funding & Support Advocacy — `/programs/funding-advocacy`
2. Cultural & Language Education — `/programs/culture-language`
3. Health Awareness & Prevention — `/programs/health-awareness`
4. Sport & Talent Development — `/programs/sport-talent`
5. Government & Community Liaison — `/programs/liaison`
6. Community Fundraising & Micro-Projects — `/programs/fundraising`
7. Gender Equality, Rights & Transparency — `/programs/equality-transparency`

## What each program page shows

- Title, short summary and icon
- Overview paragraph
- "What we do" list of activities
- "Who it benefits" paragraph
- Optional cover image
- Links to donate and to get involved
- Link back to all programs

I will draft starter wording for all seven (overview, activities, who it benefits) so the pages read well from day one. All of it is editable afterwards in the admin area, so you can correct anything that isn't quite right — I'll flag that the drafted text is my wording, not yours.

## Programs page

The current "Programs & Focus Areas" cards become links: each card opens its program page, with a "Learn more" arrow.

## Home page

A "Our Programs" section with a card grid of all seven (icon, title, one-line summary), each card linking to its page, plus one link to the full Programs page. The existing show/hide toggle keeps working.

## Admin editing

The existing "Focus Areas" editor is extended into a "Programs" editor:

- Same add / edit / reorder / delete controls
- New fields per program: web address slug (auto-filled from the title, editable), overview, activities list, who it benefits, cover image
- Warning if two programs share the same slug
- Home-page visibility toggle stays

## Technical notes

- Storage stays in the `page_settings` row `page_key = 'programs'`; the `focusAreas` array gains `slug`, `overview`, `activities[]`, `benefits`, `image`. `normalizeFocusAreas` in `src/ported/lib/focusAreas.ts` is extended (and slug-derives from the title when absent) so old rows keep working.
- New route `src/routes/programs.$slug.tsx` with a loader reading the published `page_settings` row server-side (via a new server function in `src/lib/publicContent.functions.ts`) so each page is server-rendered with its own title, description, og tags, canonical, and `Service`/`WebPage` JSON-LD; unknown slug throws `notFound()`.
- Seeded starter content written into the existing `page_settings` row as a data update, preserving `programs`, `successStories`, `crossCutting`, `seo`, and `structuredData`.
- `ProgramsView.tsx` cards become `<Link to="/programs/$slug" params={...}>`; `HomeView.tsx` renders the same list as a linked card grid.
- `src/routes/sitemap[.]xml.ts` gains the seven program URLs; `programs.rss[.]xml.ts` item links point at the new pages instead of hash anchors.
- `FocusAreasManager.tsx` gains the new fields and slug validation.
