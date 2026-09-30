# Fix broken pages, then restructure public page content

## What's wrong right now (verified)

Loading `/` and `/donate` in a test browser returns a **completely blank page**. The browser reports:

```text
Refused to execute inline script ... violates Content Security Policy
Invariant failed: Expected to find bootstrap data on window.$_TSR
```

Cause: `src/server.ts` builds a nonce-based Content Security Policy and stamps that nonce onto inline `<script>` tags using Cloudflare's `HTMLRewriter`. `HTMLRewriter` only exists in the production Worker runtime, so in the preview environment the stamping is skipped while the strict CSP header is still sent. Every inline script — including the one carrying the app's startup data — gets blocked, so React never hydrates and the page renders empty. This is why both the homepage and the payment/donate page appear broken.

Second, separate payment issue: the donation webhook secret (`STRIPE_WEBHOOK_SECRET`) is not configured, so `/api/public/stripe-webhook` rejects every Stripe callback. Card donations can be paid but are never recorded and no receipt email is sent.

## Fix 1 — pages render again

Make nonce stamping work in every environment:

- Keep the `HTMLRewriter` path for production.
- Add a fallback for the preview/Node runtime that reads the HTML and injects the nonce into inline `<script>` tags before returning the response.
- Only stamp HTML responses; leave streamed non-HTML untouched.
- Verify `/`, `/donate`, `/programs`, `/events`, `/get-involved`, `/csr-sponsorship` all render with no console CSP errors.

Also widen the policy where the app legitimately needs it (Stripe redirect/return, Turnstile widget frame) so nothing else silently breaks.

## Fix 2 — payment recording

- Once the webhook signing secret is stored, the webhook verifies and records donations. I'll request it through the secure secret form as part of this work.
- Until it exists, the webhook route will log a clear, non-sensitive warning instead of failing silently, and `/donation-complete` will still confirm the payment to the donor from the Stripe session directly (already the case) so the donor never sees a broken page.

## Restructure page layout (all public pages)

Moving content out of oversized hero/top blocks and into the body of each page, so the first screen is a short headline plus one call to action and the detail lives in readable sections below:

- **Home** — trim hero to headline, one line of supporting text, two buttons. Mission/vision copy, focus areas, impact numbers and news move into ordered body sections.
- **CSR & Sponsorship** — shorten the top block; sponsorship tiers, partnership benefits and downloads become body sections.
- **Events calendar** — compact header; the intro copy, category filter and legend move above the events list in the body.
- **Get Involved** — short header; volunteer / fundraise / coordinate paths become clearly separated body sections rather than stacked hero text.
- **Programs, About, News, Gallery, Donate, Contact, Request** — same treatment: one-line hero, detail moved into body sections.

Rules applied throughout: one `<h1>` per page, correct heading order, existing design tokens only (no new colours), no copy deleted — only relocated, and all admin-editable content keeps reading from its current source so nothing you edit in the dashboard stops working.

## Then a full page sweep

After the changes I'll load every public route in a test browser and report: blank/failed renders, console errors, broken links or images, and any layout breakage at mobile and desktop widths.

## Technical notes

- `src/server.ts`: environment-agnostic nonce stamping, plus CSP allowances for Stripe and Turnstile.
- Layout work stays in `src/ported/components/views/*` and the matching `src/routes/*` head metadata; no data-layer or business-logic changes.
- No database migration needed.
