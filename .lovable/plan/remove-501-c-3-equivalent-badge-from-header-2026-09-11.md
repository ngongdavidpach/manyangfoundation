# Remove 501(c)(3) equivalent badge from header

## Goal
Remove the "Non-Profit 501(c)(3) Equivalent" text/badge from the top micro-bar of the site header.

## Change
- File: `src/ported/components/Navbar.tsx`
- Remove the `<span>` containing "Non-Profit 501(c)(3) Equivalent" in the top blue micro-bar (currently around lines 107–110), while keeping the rest of the header layout intact.

## Verification
- Build/typecheck passes.
- Preview shows the header without the badge.
