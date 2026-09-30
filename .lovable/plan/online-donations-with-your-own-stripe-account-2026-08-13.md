# Online donations with your own Stripe account

You chose to connect your own Stripe account rather than Lovable's built-in payments, and no keys were pasted in the chat — so the first step is a secure form where you enter your Stripe secret key yourself. Keys never travel through chat.

## About HTTPS

No change is needed. The site is already served over HTTPS with a valid certificate on `manyangdisabilityfoundation.org`, `www.manyangdisabilityfoundation.org`, and the Lovable URL, and HTTP requests are redirected automatically. Stripe's requirement for HTTPS checkout is already satisfied. If you later see a "not secure" notice on a specific page, that would be mixed content (an `http://` image or script) and I can hunt it down separately.

## Step 1 — Connect your Stripe account

I open the Stripe connection form. You paste:

- Secret key (`sk_live_...` or `sk_test_...`) — stored encrypted, server-side only.

Your publishable key (`pk_...`) is safe in the frontend code, so you can paste that one straight into chat if you want to use Stripe Elements. If we use Stripe's hosted Checkout page instead (recommended below), the publishable key isn't even needed.

Start with test keys if you want to run fake-card donations first, then swap to live keys when ready.

## Step 2 — Donation checkout flow

Recommended approach: **Stripe Checkout (hosted page)**. It handles cards, Apple Pay and Google Pay, 3D Secure and receipts, with no card data touching your site.

On the donation page:

- Preset amounts (AUD 25 / 50 / 100 / 250) plus a custom amount.
- One-time or monthly toggle (monthly creates a Stripe subscription).
- Optional designation dropdown reusing your existing donation designations.
- Optional name/email and an "keep my donation anonymous" checkbox.
- Consent copy linking to the existing privacy policy.

Clicking Donate calls a server function that creates a Stripe Checkout Session server-side and redirects to Stripe. After payment Stripe returns the donor to a thank-you page.

## Step 3 — Recording donations reliably

Payments are confirmed by a Stripe webhook, not by the browser redirect (people close tabs).

- A public webhook endpoint receives `checkout.session.completed`, `invoice.paid` (monthly renewals) and refund/failure events.
- Every event's signature is verified against a Stripe webhook signing secret before anything is processed.
- Verified payments are written into your existing `donations` table with `method: 'stripe'`, the amount in cents, currency, designation, donor details and Stripe IDs so nothing is double-counted on retries.
- Existing receipt emails and the admin donations view then work on Stripe donations exactly as they do on manually entered ones.

## Step 4 — Admin visibility

The admin donations list gains a Stripe indicator and the Stripe payment reference, plus filtering by method so manual/bank donations stay distinguishable from card donations.

## Technical notes

- Secret key stored via the Stripe integration form; read only inside `.handler()` bodies of server functions.
- Checkout Session creation and refund handling live in a new `src/lib/payments/stripe.server.ts`, called from thin `createServerFn` wrappers in `src/lib/payments/stripe.functions.ts` (module scope stays imports + exported server fns only).
- Webhook at `src/routes/api/public/stripe-webhook.ts` using `createFileRoute` with a `server.handlers.POST` block; raw body read with `request.text()` before signature verification.
- Webhook signing secret is a shared secret: you generate it in the Stripe dashboard when adding the endpoint URL, then paste the same value into a secure form. I will deploy the endpoint first so you can configure the URL and secret in one visit.
- New migration adds Stripe reference columns (`stripe_session_id`, `stripe_payment_intent_id`, `stripe_subscription_id`) plus a unique index for idempotency, and a `processed_stripe_events` table so replayed events are ignored. GRANTs and RLS included; only `service_role` touches these paths.
- Amounts validated server-side (min AUD 2, max AUD 100,000) — client values are never trusted.
- No Stripe tax automation, since charitable donations are not a taxable product sale; deductibility stays with your existing receipt system.
