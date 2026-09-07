# Phase 4 database and security foundation

## Connected project

- Supabase project: `Hiquant Web Project`
- Region: `us-west-2`
- Database: PostgreSQL 17
- Applied migration: `20260907061001_create_hiquant_mvp_schema`

Do not add the project database password or a service-role key to this repository. Browser code will use a publishable key in Phase 5; authorization does not depend on hiding that key.

## Files

- `sql/schema.sql` creates the tables, checks, indexes, comments, and automatic `updated_at` triggers.
- `sql/rls-policies.sql` enables RLS and grants only the minimum table or column privileges needed by each API role.
- `sql/create-admin-profile.sql` adds an already-created Supabase Auth user to the explicit administrator allowlist.
- `sql/verify-security.sql` checks RLS, policy presence, and the most important role and column privileges.

## Security model

### Anonymous website visitors

The `anon` role can insert only the client-owned columns used by the intake and appointment forms. It cannot select, update, or delete either table. It cannot provide record IDs, timestamps, workflow status, consent timestamps, or administrator notes.

RLS adds a second boundary:

- New intake status must remain `new`.
- Intake admin notes must remain null.
- Consent must be acknowledged.
- An expected start date cannot be in the past when submitted.
- New appointment status must remain `requested`.
- Appointment admin notes must remain null.
- The requested appointment date cannot be in the past.

### Authenticated administrators

Authentication alone is insufficient. An authenticated user must have an active `admin` row in `public.admin_profiles`. Qualified administrators can read intake and appointment records and update only `status` and `admin_notes`. They cannot delete client submissions through the application role.

Only the database owner or server-only service role can create or change administrator membership. The service-role key must never be used by the static website.

## Initial administrator setup

1. In Supabase Authentication, manually create the administrator account with a strong temporary password.
2. Require the administrator to replace the temporary password through the approved recovery process.
3. Edit the email placeholder in `sql/create-admin-profile.sql` and run it once in the SQL editor.
4. Confirm the administrator can read their own `admin_profiles` row.
5. Enable MFA for the administrator before production use when the account configuration is available.

## Verification layers

1. Run `sql/verify-security.sql` in the Supabase SQL editor.
2. Run the Supabase security and performance advisors.
3. In Phase 5, test the actual Data API with the browser publishable key:
   - approved anonymous intake insert succeeds;
   - anonymous select, update, and delete fail;
   - attempts to set `status`, `admin_notes`, or timestamps fail;
   - an authenticated non-admin receives no business records;
   - the approved administrator can read records and update only status and notes.

## Phase 4 verification result

The migration was applied to the connected project on September 7, 2026. Live database checks confirmed:

- `intakes`, `appointments`, and `admin_profiles` exist with RLS enabled.
- All seven expected RLS policies are installed.
- A valid anonymous intake insert succeeds inside a rolled-back transaction.
- A valid anonymous appointment insert succeeds inside a rolled-back transaction.
- Anonymous selection from `intakes` is denied at the privilege layer.
- An anonymous attempt to provide the protected intake `status` column is denied.
- An authenticated user without an admin profile sees no intake records.
- All verification records were rolled back; the three tables remain empty.
- The Supabase security advisor reports no findings.
- The performance advisor reports only unused-index informational notices, which are expected before the empty tables receive production queries.

No Supabase Auth user exists yet. The business owner must create the initial administrator before `sql/create-admin-profile.sql` can be run and the administrator policy path can be tested end to end.

## Operational notes

- No delete policy exists for application roles. Records should be retained or removed only under a deliberate owner-level process.
- Public forms still require anti-spam protection before launch. RLS is authorization, not rate limiting or bot prevention.
- Initial inquiries must not be treated as a HIPAA-compliant or regulated document-exchange channel.
