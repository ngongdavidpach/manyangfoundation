# Change donation bank account name

## Goal
Display "Manyang M Manyang" as the bank account name wherever donation payment details are shown, instead of "Manyang Disability Foundation".

## Current state (verified)
- The only place the account name value exists in code is the default payment details in `src/ported/components/views/DonateView.tsx` (line 45).
- The saved `donate` page settings row in the database has empty content, so the site currently displays this default.

## Changes
1. In `src/ported/components/views/DonateView.tsx`, change the default `accountName` from "Manyang Disability Foundation" to "Manyang M Manyang".
2. This automatically updates both display spots: the "Donation payment details" card before the pledge form and the post-pledge confirmation.

## Verification
- Build passes.
- Open `/donate` and confirm the account name reads "Manyang M Manyang" (before pledging and in the confirmation after a test pledge).
