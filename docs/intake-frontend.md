# Phase 3 intake frontend

## Scope

Phase 3 implements the complete browser-side consultation inquiry experience without transmitting or storing submitted information. The submission boundary remains mocked until the Supabase schema, grants, and Row Level Security policies are implemented and independently verified.

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

- Required fields are checked before the mock submission begins.
- Email, telephone, minimum-length, maximum-length, and past-date errors receive specific messages.
- Invalid controls receive `aria-invalid="true"` and linked inline error text.
- An error summary links keyboard and screen-reader users back to each invalid control.
- The project description displays a live character count.
- The submit button prevents repeat submission while the mock request is active.
- Submitted values are not echoed into the document or written to browser storage.

## Mock states

A successful check resets the form and displays an explicit notice that nothing was transmitted or stored.

For manual error-state testing, load:

```text
intake.html?mockError=1
```

Valid input will then produce the recoverable submission-error message. This query switch is for frontend testing only and should be removed when Phase 5 connects the real data submission function.

## Phase 5 integration boundary

Phase 5 should replace only `mockSubmit()` in `js/intake.js`. Existing validation, loading state, consent behavior, error summary, and success handling should remain intact unless backend requirements make a focused change necessary.

