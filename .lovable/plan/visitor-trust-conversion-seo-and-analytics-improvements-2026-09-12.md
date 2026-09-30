# Visitor trust, conversion, SEO, and analytics improvements

## Goal
Improve the public site’s clarity, trust, search presentation, and conversion paths while preserving the existing design and admin-managed content.

## What will change

1. **Strengthen the first screen and mobile actions**
   - Keep the existing home-page Donate and Get Involved actions prominently visible without scrolling.
   - Add a compact, accessible mobile-only sticky action bar for Donate and Contact/Get Help, with safe spacing so it never covers page content or cookie controls.

2. **Improve navigation and internal links**
   - Add contextual links between the home page, programs, assistance request, donation, contact, news, events, and relevant guides.
   - Add accessible visual breadcrumbs to meaningful inner pages and detail pages, plus matching `BreadcrumbList` structured data.
   - Avoid breadcrumbs on the home page, account pages, and other places where they add no value.

3. **Polish visitor completion and error states**
   - Upgrade the existing custom 404 page with clear links to Home, Programs, Request Support, and Contact, and prevent it from being indexed.
   - Keep the existing donation thank-you page and improve its next-step links.
   - Give successful contact enquiries a dedicated thank-you state/page with the promised response time and useful next actions.

4. **Add trust content without inventing endorsements**
   - Reuse only existing, approved success stories as the reviews/testimonials section; do not create names, quotes, ratings, or outcomes.
   - Add five concise FAQs to the Contact page and matching FAQ structured data.
   - Change the contact response promise to **within 2 business days** wherever that promise appears.

5. **Complete page-level search and sharing details**
   - Audit every public content route and give each one a unique title, meta description, Open Graph title/description, `og:type`, and Twitter card metadata.
   - Keep canonical URLs self-referencing and leave private, account, completion, and error pages excluded from search where appropriate.
   - Move social-image ownership out of the shared root metadata and onto leaf pages so page metadata is not overridden.
   - Create a correctly sized 1200×630 social-share image using the existing foundation logo, store it locally, and reference its absolute public URL on relevant public pages.

6. **Accessibility and image text**
   - Audit public-facing images and replace empty, vague, or duplicated alt text with concise descriptions.
   - Preserve empty alt text only for genuinely decorative images.

7. **Structured data and privacy**
   - Extend the existing organization schema with the real admin-managed address, contact details, service area, and nonprofit identity where data exists; do not invent a street address or opening details.
   - Keep the existing full Privacy Policy and email addendum, and ensure forms, footer links, analytics disclosure, and cookie controls point to the right privacy information.

8. **Robots and crawl controls**
   - Preserve the existing `robots.txt` allowances, protected-path blocks, and sitemap declaration.
   - Check it against current public/private routes and make only necessary corrections.

9. **Google Analytics with consent**
   - Connect GA4 through Lovable’s Google Analytics connector.
   - Load analytics only after the visitor accepts the Analytics cookie category; do not track rejected or undecided visitors.
   - Track client-side page changes and focused conversion events: successful contact enquiry, assistance request, volunteer/fundraiser submission, and confirmed donation.
   - Prevent duplicate events on refresh or repeated rendering.

10. **Verification**
    - Check public routes at desktop and mobile sizes, including the 404, contact submission state, donation completion state, breadcrumbs, sticky actions, metadata, structured data, social image, and analytics consent behavior.
    - Confirm no public image has an unexplained missing alt attribute and no protected route is exposed through robots or internal links.

## Existing work that will be preserved
- The site already has a custom 404, home-page calls to action, internal navigation, a donation completion page, privacy pages, `robots.txt`, route metadata, organization/FAQ/event/article schema, and many useful alt attributes.
- These will be refined rather than replaced.

## Technical notes
- Use TanStack route `head()` metadata on each leaf route.
- Use the project’s existing content records for reviews, contact details, and structured data.
- Analytics initialization will live in a consent-aware client helper, using the connector-provided GA4 measurement ID.
- No publishing is included; metadata and analytics changes reach the live domain after the next publish.
