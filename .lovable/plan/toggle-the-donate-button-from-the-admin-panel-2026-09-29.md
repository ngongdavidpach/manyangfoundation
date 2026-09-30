# Toggle the Donate button from the admin panel

## What changes

- **Admin Dashboard → Page Settings → Donate** gains a new checkbox: **"Show Donate Now button"** (saved as `showDonateButton` in the existing `donate` page settings, alongside the bank details already editable there).
- The setting controls every public "Donate Now" button:
  - Header button (desktop)
  - Header button (mobile)
  - Footer "Donate Now" button
- Default is **on** (shown), so nothing changes for visitors until an admin turns it off.
- Turning it off hides the buttons site-wide; the `/donate` page itself still exists and donation records in the admin panel are unaffected.

## Technical details

- `src/ported/components/admin/PageSettingsEditor.tsx`: add `{ path: "showDonateButton", label: "Show Donate Now button", type: "bool" }` to the `donate` page fields.
- `src/ported/components/Navbar.tsx`: read the `donate` page settings (same pattern as the existing `navigation` settings fetch) and render the desktop + mobile Donate buttons only when `showDonateButton !== false`.
- `src/ported/components/Footer.tsx`: same check for the footer Donate Now button.

## Verification

- Build clean; toggle off in admin → buttons disappear on desktop, mobile, and footer; toggle on → they return.
