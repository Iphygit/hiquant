# Phase 8: Scheduling and appointment administration

Phase 8 adds a public appointment-request flow and a protected administrator workspace while preserving the static GitHub Pages architecture.

## Public workflow

`schedule.html` collects only the nine appointment fields granted to the anonymous database role. `js/schedule.js` supplies the browser time zone, prevents past dates, validates required fields, uses a honeypot for basic bot friction, and inserts through the browser-safe Supabase publishable key.

A submission is a request, not a confirmed meeting. The page, acknowledgement, success state, privacy notice, and terms state that HiQuant must confirm availability separately. Public users cannot read, update, or delete appointment records and cannot set `status` or `admin_notes`.

## Administrator workflow

`admin/appointments.html` uses the existing authentication guard and active `admin_profiles` allowlist. An approved administrator can search and filter the latest 500 requests, review details, change status, and maintain internal notes.

Updates include the record's `updated_at` value in the filter. If another session changed the record, the latest version is reloaded before another save. Submitted values are rendered with `textContent` rather than HTML injection.

The dashboard now summarizes inquiries and appointments and shows recent records from both workflows.

## Verification

Run `node tests/appointment-api-smoke.mjs` from the repository root. Expect HTTP 201 for the approved public insert and HTTP 4xx for anonymous read, protected-field insert, and update attempts. The test creates a uniquely marked synthetic row; delete it through an owner-level SQL session immediately afterward.

Successful signed-in administrator reads and updates require the one-time administrator enrollment described in `docs/admin-authentication.md`. That success-path verification remains pending until the owner account is enrolled.
