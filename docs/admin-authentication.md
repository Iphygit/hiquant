# Phase 6 administrator authentication

## Implemented routes

- admin/login.html provides email/password sign-in and password-recovery requests.
- admin/index.html is the protected portal entry point.
- admin/reset-password.html completes a Supabase password-recovery flow.

There is no public registration route. Administrator accounts must be created manually.

## Authorization flow

1. Supabase Auth verifies the email and password and creates a browser session.
2. The application calls auth.getUser() to validate the session with the Auth server.
3. The browser queries its own admin_profiles row.
4. Access is granted only when that row has role = admin and is_active = true.
5. Row Level Security independently enforces the same membership rule whenever protected business data is queried.

The JavaScript guard improves the route experience, but it is not the data-security boundary. Static HTML can always be downloaded; protected records remain safe because unauthorized queries fail the database policies.

## Initial administrator enrollment

Initial enrollment was completed on September 9, 2026. The confirmed Supabase Auth user is linked to one active `admin_profiles` row with the `admin` role. The administrator email is intentionally not stored in this repository. The enrollment procedure was:

1. Open the Supabase Dashboard for Hiquant Web Project.
2. Go to Authentication → Users and create the administrator manually.
3. Use the administrator’s real business email, a strong unique temporary password, and confirm the account according to the project’s email policy.
4. Edit the placeholder email in sql/create-admin-profile.sql.
5. Run that script once in the Supabase SQL editor.
6. Sign in at admin/login.html and immediately replace any temporary password through the recovery workflow.
7. Enable MFA after enrollment when the chosen Supabase plan and account configuration support it.

Never place an administrator password, secret key, or service-role key in this repository.

The owner should now sign in at `https://hiquant.co/admin/login.html`, verify the dashboard and protected intake/appointment workflows, and use the recovery flow to confirm the production redirect.

## Routine sign-in and additional employees

An existing administrator does not repeat the enrollment process. They use their own email and password at `https://hiquant.co/admin/login.html` for every routine sign-in.

Each additional employee who needs the dashboard must be enrolled once:

1. In Supabase Dashboard, go to Authentication → Users and create a separate Auth user for the employee.
2. Use the employee's business email and a strong unique temporary password; never reuse or share the owner's account.
3. Edit the email placeholder in `sql/create-admin-profile.sql`, then run the script once in the Supabase SQL Editor to create the matching active administrator profile.
4. Have the employee replace the temporary password through the approved recovery workflow.
5. Verify that the employee can sign in and access the dashboard, then enable MFA when available.

The two records serve different purposes: the Supabase Auth user proves identity, while the active `admin_profiles` row grants HiQuant administrator authorization. Creating only one of them is insufficient.

The current MVP intentionally uses this manual process because there is no public admin registration. If employee invitations are automated later, user creation must run only in trusted server-side code or a Supabase Edge Function; the service-role key must never be exposed in this static website.

## Administrator offboarding

When an employee no longer needs access:

1. Set their `admin_profiles.is_active` value to `false` first so the RLS authorization check rejects protected data requests.
2. Remove the employee's Supabase Auth user, or revoke their sessions according to the organization's retention policy.
3. Confirm the employee can no longer reach protected intake or appointment data.

Deleting an Auth user prevents new sessions and refreshes, but an already-issued access token can remain valid until it expires. Keeping the database membership inactive provides the immediate authorization check used by this application.

## Recovery redirect configuration

Supabase accepts password-recovery redirects only when the destination is allowlisted in Authentication → URL Configuration. Add the URLs used by the project, for example:

- http://localhost:8000/admin/reset-password.html
- https://hiquant.co/admin/reset-password.html

Recovery emails cannot return to a file:// page. Use a local static server during development.

## Session behavior

- Supabase stores and refreshes the browser session using its client defaults.
- Every protected-page load revalidates the user and active administrator membership.
- A removed or inactive membership is rejected on the next verification and by RLS immediately.
- Logout uses local scope, removing the session from the current browser without signing out other administrator devices.
- Login and recovery errors avoid revealing whether an email address exists.

## Verification

tests/auth-api-smoke.mjs uses the same publishable key as the website and verifies that:

- Invalid credentials do not create a session.
- Anonymous administrator-membership access is rejected or returns zero rows.

Full successful-login, recovery-email, and logout testing requires the owner to use the enrolled account. Do not share the password or add credentials to automated test files.

## Phase 6 live verification result

On September 7, 2026, the connected Supabase project returned:

- HTTP 400 for an invalid email/password login, with no session created.
- HTTP 401 for an anonymous request to read admin_profiles.
- Zero Auth users and zero active administrator profiles before owner enrollment.
- One confirmed Auth user and one active administrator profile after owner enrollment.
- Anonymous administrator-membership reads remain rejected with HTTP 401.

The post-enrollment Security Advisor reports that leaked-password protection is disabled. Enable it in Supabase Auth settings when available for the selected plan.
