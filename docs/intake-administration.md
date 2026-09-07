# Phase 7 intake administration

## Protected routes

- admin/index.html provides exact pipeline counts and the five newest inquiries.
- admin/intakes.html provides the intake list, filters, detail review, status management, and administrator notes.

Both routes wait for the Phase 6 session and active administrator-membership check before loading any business data. Supabase Row Level Security remains the authorization boundary for every query.

## Intake workspace

The workspace loads up to the latest 500 intakes ordered by receipt time. The administrator can:

- Search the loaded records by client name, company, email, or service.
- Filter by workflow status.
- Review all client-provided fields and consent-related business context.
- Update the approved lead status.
- Add or revise internal notes up to 5,000 characters.
- Refresh the list without leaving the page.

There is no delete action. Public-submission fields, IDs, consent timestamps, and record timestamps cannot be changed through the administrator browser role.

## Safe rendering and updates

- Every database value is placed into the page with textContent or an equivalent text node.
- User-submitted content is never rendered with innerHTML.
- Status values come from the fixed database-approved list.
- Updates send only status and admin_notes.
- The update includes the record’s previous updated_at value. If another session changed the record first, the save is rejected as stale and the newest version is loaded.
- Success and failure messages are accessible status/alert regions and never expose database internals.

## Verification

The Phase 7 implementation is checked at three layers:

1. JavaScript syntax and repository whitespace checks.
2. Source inspection confirms no client-side delete operation, no secret key, and no innerHTML rendering.
3. tests/intake-admin-api-smoke.mjs verifies through the live Data API that an anonymous browser cannot read or update intakes.

Successful administrator reading and updating requires the manually enrolled Auth user and matching admin_profiles row described in docs/admin-authentication.md. Those credentials must never be stored in this repository or automated test files.

## Phase 7 live verification result

On September 7, 2026:

- An anonymous intake read was rejected with HTTP 401.
- An anonymous intake status/notes update was rejected with HTTP 401.
- The connected project contained zero intake records, so the smoke test changed no data.
- The Supabase Security Advisor reported no findings.
- Successful administrator-path verification remains pending the one-time owner enrollment.
