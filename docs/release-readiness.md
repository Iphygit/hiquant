# Phase 9: Security, accessibility, and browser verification

Phase 9 establishes the pre-deployment quality gate for the static HiQuant website and its Supabase-backed workflows.

## Security hardening

- Every page declares a restrictive Content Security Policy allowing local assets, the pinned jsDelivr Supabase library, and connections only to the HiQuant Supabase project.
- Every page declares `strict-origin-when-cross-origin` referrer handling.
- The Supabase browser library remains pinned to `2.111.0` and now includes a SHA-384 Subresource Integrity value calculated from that exact file, with anonymous CORS enabled for integrity validation.
- The browser configuration contains a publishable key only. No service-role or secret key is present.
- Client-submitted database values continue to be rendered with `textContent`; the static quality test rejects common unsafe HTML and code-execution sinks.
- Administrator pages remain protected by both current Supabase identity validation and an active `admin_profiles` allowlist. Database RLS remains the security boundary.

GitHub Pages cannot provide application-controlled HSTS or all recommended response headers. HTTPS and production response behavior must be verified on the GitHub Pages URL and custom domain during Phase 10. The meta-delivered CSP provides browser enforcement for this static build, but a response-header CSP is preferable if hosting changes later.

## Automated static quality gate

Run:

```powershell
node tests/static-quality.mjs
```

The test currently covers all 10 HTML pages and 12 JavaScript files. It checks:

- Page language, encoding, viewport, titles/descriptions, referrer policy, and CSP.
- Exactly one main landmark and one primary heading per page.
- Unique IDs, valid label targets, and valid `aria-describedby` references.
- Alternative text and intrinsic dimensions for images.
- Explicit button types and resolvable local links/assets.
- `noindex, nofollow` on administrator pages.
- Exact Supabase script version, integrity value, and CORS attribute.
- Absence of unsafe DOM sinks and browser-exposed secret/service-role keys.

All JavaScript files also pass `node --check`, and `git diff --check` reports no patch-format errors.

## Browser verification completed

Automated browser checks ran against installed Google Chrome and Microsoft Edge at 1440 × 900 and emulated 390 × 844 viewports. Seven directly accessible pages were exercised in each browser and viewport: home, intake, scheduling, privacy, terms, administrator login, and password reset.

Both browsers passed:

- No horizontal page overflow.
- No page or console runtime errors.
- One primary heading and one main landmark per page.
- Mobile navigation opens, closes with Escape, updates `aria-expanded`, and returns focus to its control.
- Empty intake and scheduling submissions expose visible validation summaries.
- Browser time-zone detection populates the scheduling form.

The design already includes persistent keyboard focus indicators, skip links, labelled controls, live form messages, responsive layouts, 44-pixel-class touch targets, and reduced-motion behavior.

## Live Supabase verification completed

- Anonymous intake insert: HTTP 201.
- Anonymous intake read and update: HTTP 401.
- Anonymous protected intake-column insert: HTTP 401.
- Anonymous appointment insert: HTTP 201.
- Anonymous appointment read, update, and protected-column insert: HTTP 401.
- Invalid password login: HTTP 400.
- Anonymous administrator-membership read: HTTP 401.
- All three client-data tables have RLS enabled and all seven expected policies are present.
- Anonymous and authenticated roles have no forbidden table or protected-column privileges.
- Supabase security advisor: no findings.
- Synthetic smoke-test rows were removed and a follow-up count confirmed zero remain.

The performance advisor reports the four intended intake/appointment sorting indexes as unused. This is expected while the production tables are empty; the application queries by status and creation/request time, so the indexes should remain.

## Required launch-environment checks

Complete these before declaring production launch:

- Enroll the initial administrator and verify successful login, protected reads, status/note updates, logout, password recovery, and session expiry.
- Test Safari on macOS and iOS, plus Chrome on a physical Android device. Confirm keyboard focus, zoom to 200%, form controls, date/time inputs, and no horizontal scrolling.
- Verify the deployed GitHub Pages URL, HTTPS, custom domain, recovery redirect URL, CSP behavior, and absence of mixed content.
- Replace provisional business-contact/legal wording and obtain the appropriate legal review.
- Monitor submission abuse after launch and add CAPTCHA or rate limiting if bot traffic appears.

Phase 9 is complete at the source-code level. The items above depend on administrator enrollment, physical platforms, legal decisions, or the Phase 10 production environment.
