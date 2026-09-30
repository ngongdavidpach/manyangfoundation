# Add a copy button for the account name

## Current state (verified)
- On `/donate`, the payment details card already shows copy buttons for BSB, account number, and PayID (icon buttons with a "Copied" confirmation and a clipboard fallback).
- The **Account name** row ("Manyang M Manyang") has no copy button.

## Change
1. In `src/ported/components/views/DonateView.tsx`, restructure the Bank transfer list rows so the "Account name" row uses the same layout as BSB / account number (value on the left, copy button on the right).
2. Add a copy button for the account name using the existing `copyButton` helper, so it matches the others: same icon, same "Copied" feedback, same clipboard fallback.
3. Bank name stays as plain text (not requested as copyable).

## Verification
- Build passes.
- Playwright check on `http://localhost:8080/donate`: all four copy buttons render (account name, BSB, account number, PayID), and clicking the account-name copy button shows the copied confirmation. Also confirm the compact payment details in the post-pledge confirmation show the same buttons.
