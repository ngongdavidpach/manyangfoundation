# Remove the Stripe integration

Remove online card donations via Stripe and return the Donate page to manual/bank donation instructions. Past Stripe donations already recorded in the database are kept as history.

## What gets removed

- **Donate page** (`src/ported/components/views/DonateView.tsx`): remove the card-checkout form and the `createDonationCheckout` call; restore the bank-transfer / manual donation presentation (amounts, designations, and contact details stay).
- **Thank-you page** (`src/routes/donation-complete.tsx`): delete the route, since it only exists to confirm Stripe payments.
- **Webhook endpoint** (`src/routes/api/public/stripe-webhook.ts`): delete the file.
- **Stripe server code**: delete `src/lib/payments/stripe.functions.ts` and `src/lib/payments/stripe.server.ts`.
- **Security headers** (`src/server.ts`): remove the Stripe entries from the content security policy (`api.stripe.com`, `js.stripe.com`, `hooks.stripe.com`, `checkout.stripe.com`).
- **Stripe secrets**: remove the stored `STRIPE_SECRET_KEY` (and `STRIPE_WEBHOOK_SECRET` if present) from the project's secrets.

## What stays

- **Donation history**: existing donations recorded with method "stripe" remain in the database and still show in the admin donations list and dashboard. The admin method filter keeps "stripe" as an option so old records remain filterable.
- **Database columns**: the `stripe_*` columns and `processed_stripe_events` table are left in place so historical records keep their references. (Optionally I can drop them with a migration — say the word.)
- Everything else: manual donation recording, receipts, donor emails for non-Stripe donations.

## Verification

- Build passes, no remaining Stripe imports.
- Preview check: `/donate` loads with manual donation options; `/donation-complete` returns the 404 page; admin donations list still shows past Stripe gifts.
