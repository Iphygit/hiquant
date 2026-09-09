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

The connected project currently has no Supabase Auth users and no active administrator profile. To enroll the owner:

1. Open the Supabase Dashboard for Hiquant Web Project.
2. Go to Authentication → Users and create the administrator manually.
3. Use the administrator’s real business email, a strong unique temporary password, and confirm the account according to the project’s email policy.
4. Edit the placeholder email in sql/create-admin-profile.sql.
5. Run that script once in the Supabase SQL editor.
6. Sign in at admin/login.html and immediately replace any temporary password through the recovery workflow.
7. Enable MFA before production launch when the chosen Supabase plan and account configuration support it.

Never place an administrator password, secret key, or service-role key in this repository.

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

Full successful-login, recovery-email, and logout testing requires the manually enrolled administrator account. Do not add those credentials to automated test files.

## Phase 6 live verification result

On September 7, 2026, the connected Supabase project returned:

- HTTP 400 for an invalid email/password login, with no session created.
- HTTP 401 for an anonymous request to read admin_profiles.
- Zero Auth users and zero active administrator profiles before owner enrollment.
- No findings from the Supabase Security Advisor.
