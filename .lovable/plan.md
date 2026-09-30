# Show pledges and public form submissions in the Admin Dashboard

## What you'll get
A new **Submissions** tab in the Admin Dashboard with sub-tabs:
- **Pledges** — reference, donor name/email/phone/country, amount, payment method (bank/PayID), message, date, status. Search by reference or name so bank transfers can be matched. Buttons: mark as *Received* (creates a record in Donations so receipts work as today) or *Cancelled*.
- **Aid requests**, **Volunteers**, **Partner inquiries**, **Event RSVPs**, **Contact messages** — list newest first, open to view full details, change status (new / in review / done).
- A count badge for new items on each sub-tab.

## Technical details
- New `src/ported/components/admin/SubmissionsManager.tsx`, registered in `AdminDashboardView.tsx`.
- Reads via server functions in `src/lib/submissions.functions.ts` guarded by the existing admin middleware (`admin-middleware.ts`), using `context.supabase` so RLS applies; confirm/add admin SELECT/UPDATE policies on `donation_intents`, `aid_requests`, `volunteer_applications`, `partner_inquiries`, `event_rsvps`, `contact_messages` via `has_role(auth.uid(),'admin')`.
- "Mark received" inserts into `donations` (method bank_transfer, status completed, designation = pledge reference) and sets intent status `received`.
- Pagination 50 rows; status updates validated with zod.
