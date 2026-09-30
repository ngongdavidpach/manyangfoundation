# Finish the seven program pages

Four remaining items from the programs work.

## 1. Starter wording for the seven programs

Write drafted text into the site content for each program: a one-line summary, an overview paragraph, a "What we do" list, and a "Who it benefits" paragraph — plus the web address for each:

- Disability Funding & Support Advocacy — `funding-advocacy`
- Cultural & Language Education — `culture-language`
- Health Awareness & Prevention — `health-awareness`
- Sport & Talent Development — `sport-talent`
- Government & Community Liaison — `liaison`
- Community Fundraising & Micro-Projects — `fundraising`
- Gender Equality, Rights & Transparency — `equality-transparency`

This wording is my draft, not yours — everything is editable in the admin area afterwards, so please read it through and correct anything that isn't accurate (especially names, places and any claims about what the foundation has already done).

## 2. Rename the admin tab

"Focus Areas" becomes "Programs" in the admin sidebar and on the editor heading.

## 3. Sitemap and program feed

The seven program pages get added to the site map so search engines find them, and the programs feed links to each program's own page instead of a jump-link on the Programs page.

## 4. Check the preview

Load the home page, the Programs page and each of the seven program pages in the preview, confirm each shows its own wording and links work, and check nothing errors.

## Technical notes

- Seed the drafted content into the existing `page_settings` row with `page_key = 'programs'` via a data update that preserves `programs`, `successStories`, `crossCutting`, `seo`, `structuredData`, `intro`, `heading`, and `showFocusAreasOnHome`; only `focusAreas` gains `slug`, `overview`, `activities[]`, `benefits`.
- Update the tab label where `FocusAreasManager` is registered in `AdminDashboardView.tsx`, plus the heading inside `FocusAreasManager.tsx`.
- `src/routes/sitemap[.]xml.ts`: read published program slugs from the same `page_settings` row in the existing dynamic block and push `/programs/<slug>` entries (priority 0.7, monthly).
- `src/routes/programs.rss[.]xml.ts`: item `link` becomes `${BASE_URL}/programs/${slug}`; source items from `focusAreas` (normalized) so the feed matches the new pages.
- Verify with a typecheck and Playwright/curl checks of `/`, `/programs`, and all seven `/programs/<slug>` routes.
