# Programs & Focus Areas — admin-editable

Add a "Programs & Focus Areas" list that appears on both the Programs page and the Home page, fully editable from the admin dashboard, seeded with your seven areas.

## Content to seed

1. Advocacy for formal funding and support structures for people with disabilities
2. Cultural and language education — preserving Dinka traditions, customs, and language
3. Health awareness — education on disease prevention (including HIV/AIDS) and substance abuse
4. Sport and talent development for people with disabilities
5. Liaison with Australian authorities on disability-related matters
6. Fundraising for community activities and micro-projects at state level
7. Advocacy for gender equality, human rights, and financial transparency

Each item has a title, optional short description, and an icon choice, so the list can grow or be reworded later without code changes.

## What visitors see

- **Programs page**: a new "Programs & Focus Areas" section near the top (below the heading/intro), rendered as a responsive card grid with icons.
- **Home page**: the same list in a condensed form (title-only cards) with a link through to the Programs page, shown under the existing sections and controlled by a show/hide toggle.

Both render nothing at all if an admin empties the list.

## Admin editing

New "Focus Areas" editor inside the admin dashboard's Site Content section:

- Add, edit, reorder (move up/down), and delete items
- Fields per item: title (required), short description (optional), icon
- Toggle for showing the condensed list on the home page
- Single Save button with success/error feedback, matching the existing editors' look

## Technical notes

- Storage: `page_settings` row with `page_key = 'programs'`, new `focusAreas` array plus a `showFocusAreasOnHome` boolean in the same JSON `content` object. No schema migration needed.
- Seeding: the seven items are written into that existing row as a data update (not a migration), preserving current `programs`, `successStories`, `crossCutting`, `seo`, and `structuredData` keys.
- New component `src/ported/components/admin/FocusAreasManager.tsx`, wired as a sub-tab under Site Content in `AdminDashboardView.tsx` (same `SubTabs` pattern already used there).
- `ProgramsView.tsx` reads `focusAreas` from the existing `usePageSettings("programs")` call; `HomeView.tsx` reads the same `programs` page settings row for the condensed list.
- Icons come from a small allow-list of lucide icons already imported in `ProgramsView`, so no new dependencies.
