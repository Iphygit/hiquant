# Intake form behavior

## Scope

Phase 3 implemented the complete browser-side consultation inquiry experience. Phase 5 retained that validation and accessibility behavior and connected the validated form to the protected Supabase `intakes` table.

## Fields

The form captures:

- First and last name
- Company and job title
- Business email and optional phone
- Service category and industry
- High-level project description
- Expected start date, duration, and budget range
- Preferred contact method
- Referral source
- Required consent and sensitive-information acknowledgement

## Validation behavior

- Required fields are checked before submission begins.
- Email, telephone, minimum-length, maximum-length, and past-date errors receive specific messages.
- Invalid controls receive `aria-invalid="true"` and linked inline error text.
- An error summary links keyboard and screen-reader users back to each invalid control.
- The project description displays a live character count.
- The submit button prevents repeat submission while the network request is active.
- Submitted values are not echoed into the document or written to browser storage.

## Submission behavior

- Valid values are trimmed and optional empty values are normalized to `null`.
- Only the approved client-owned columns are inserted; workflow status, timestamps, IDs, and administrator notes are never sent by the browser.
- A successful insert resets the form and displays a receipt confirmation.
- A failed insert leaves the visitor’s values in place and displays a generic retry message without exposing database details.
- The hidden honeypot quietly absorbs basic automated submissions. Stronger anti-abuse controls remain a Phase 9 task.

See `docs/intake-integration.md` for configuration, security boundaries, and live Data API verification.
