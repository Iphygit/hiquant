# Phase 5 live intake integration

## Browser connection

`intake.html` loads the pinned Supabase JavaScript browser client, followed by:

1. `js/config.js` — the project URL and browser-safe publishable key.
2. `js/supabase.js` — the shared Supabase client.
3. `js/intake.js` — validation, payload normalization, and the `intakes` insert.

The publishable key is intentionally visible in the static site and source repository. It identifies the public application but does not grant elevated database access. Never replace it with an `sb_secret_...` or legacy `service_role` key.

## Security boundary

The browser sends only these client-owned columns:

- Contact and company fields
- Consulting category and high-level project details
- Timing, budget, and contact preferences
- Referral source
- The required consent acknowledgement

Record IDs, timestamps, status, and administrator notes remain server-controlled. Anonymous users receive no `SELECT`, `UPDATE`, or `DELETE` privilege. Row Level Security adds a second enforcement layer.

## Live smoke test

Run:

```powershell
node tests/public-api-smoke.mjs
```

The test uses the same publishable configuration as the website and verifies:

- An approved anonymous intake insert returns HTTP 201.
- Anonymous intake selection is rejected.
- An anonymous insert containing the protected `status` column is rejected.

The successful check creates one clearly marked temporary row. Delete rows whose email matches `phase5-smoke-%@example.invalid` immediately after the test by using an owner-level database session; the public API intentionally cannot delete them.

## Operational notes

- The page must have internet access to load the pinned client from jsDelivr and reach Supabase.
- Browser errors are intentionally generic; inspect the Supabase logs for operational diagnosis.
- The current honeypot is only a basic anti-bot measure. Add the Phase 9 abuse-control layer before a broad public launch.
