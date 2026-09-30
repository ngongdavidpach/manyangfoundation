# Simplify the donation form

## Changes

- Remove the **One-Time Gift** and **Monthly Sustainer** selector from the Donate page.
- Keep each recorded donation as a one-time gift internally, since recurring payments are not collected on the site.
- Remove the automatic **$150** selection so the form opens with no amount chosen.
- Keep the existing impact amounts and custom amount field; donors must actively choose or enter an amount before submitting.
- Start the **Country** field empty and add a clear country placeholder for donors to complete themselves.
- Remove the entire **Pledge Summary** sidebar, including the amount recap, impact estimate, and stewardship panel.
- Let the donation form use the available page width after the sidebar is removed.
- Update the submit button and completed confirmation so they no longer mention monthly giving.

## Verification

- Confirm the Donate page opens without a selected amount or country.
- Confirm the submit button remains unavailable until a donor selects or enters a valid amount.
- Confirm there is no gift-frequency selector or Pledge Summary panel.
- Submit a test donation and verify the confirmation still shows the reference and payment instructions correctly.
- Check the page on desktop and mobile and confirm it builds without errors.
