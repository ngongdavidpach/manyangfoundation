# Project Architecture Rules

- Store public donation payment details in the `donate` row of `page_settings`, with safe display defaults in the Donate view, so staff can update them through the existing page editor.
- Treat `payid` as a valid donation-intent channel alongside bank transfer so donor references preserve the selected payment method.