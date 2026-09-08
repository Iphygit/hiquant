# HiQuant Consulting Web Application

The official website and lightweight client-intake application for **HiQuant Consulting LLC**.

The MVP will provide:

- A responsive public consulting website
- A prospective-client intake form
- Consultation appointment requests
- Secure, single-administrator access
- Intake and appointment status management

## Technology

- Semantic HTML5
- Responsive CSS3
- Modular vanilla JavaScript
- Supabase PostgreSQL, Authentication, and Row Level Security
- GitHub Pages hosting

The project deliberately avoids a traditional application server for the MVP. Public pages will communicate with Supabase using its browser-safe anonymous key. Database access will be enforced with PostgreSQL privileges and Row Level Security.

## Project structure

```text
.
|-- admin/          Admin pages (implemented in a later phase)
|-- assets/
|   |-- images/     Site photography and supporting imagery
|   `-- logo/       Original HiQuant logo variants and brand notes
|-- css/            Public and admin stylesheets
|-- docs/           Product plan and implementation documentation
|-- js/             Public and admin JavaScript modules
|-- sql/            Database schema, policies, and verification scripts
|-- .env.example    Local configuration template
|-- .gitignore
`-- README.md
```

## Security rules

1. Never store a Supabase service-role key in this repository or browser code.
2. Enable Row Level Security on every table containing business or client data.
3. Anonymous visitors may submit approved intake and appointment fields only.
4. Anonymous visitors may not read, update, or delete submissions.
5. Admin access requires both a Supabase Auth session and an approved `admin_profiles` record.
6. Do not collect confidential, proprietary, patient-identifiable, clinical, or regulated data in public forms.

## Implementation status

- [x] Phase 0: project foundation and source asset organization
- [x] Phase 1: shared design system and responsive page shell
- [x] Phase 2: public marketing pages
- [x] Phase 3: client-side intake workflow
- [x] Phase 4: Supabase database and security foundation (initial admin enrollment pending)
- [x] Phase 5: live intake integration
- [x] Phase 6: administrator authentication (initial administrator enrollment pending)
- [x] Phase 7: intake administration (successful admin-path testing pending enrollment)
- [x] Phase 8: scheduling and appointment administration (successful admin-path testing pending enrollment)
- [ ] Phase 9: security, accessibility, and browser verification
- [ ] Phase 10: production deployment and domain launch

See [the detailed project plan](docs/HiQuant_Web_Application_Project_Plan.md) for the complete MVP scope.

## Local development

No build system or runtime dependency is required for the vanilla frontend. To preview the public site, open `index.html` directly or serve the project directory with any local static-file server.

Current public pages:

- `index.html` — company positioning, services, industries, approach, and consultation call to action
- `intake.html` — live consultation inquiry form with frontend validation and secure Supabase submission
- `schedule.html` — live appointment-request form with date, time-zone, and consent validation
- `privacy.html` — website privacy notice draft
- `terms.html` — website terms draft

Administrator routes:

- admin/login.html — approved-account sign-in and password recovery
- admin/index.html — session- and allowlist-protected portal entry
- admin/intakes.html — protected intake list, detail review, status, and notes
- admin/appointments.html — protected appointment list, detail review, status, and notes
- admin/reset-password.html — recovery-link password update

The privacy and terms pages require review and verified business contact details before production launch. See `docs/public-content.md` for the content assumptions and launch checklist.

## Database setup

The versioned Supabase schema and RLS policies live in `sql/`. See `docs/database-security.md` for the security model, administrator setup, and verification checklist. Never expose a service-role key in this static website.

The browser connection uses the public configuration in `js/config.js`. Its publishable key is safe to expose by design; access is restricted by PostgreSQL privileges and Row Level Security. See `docs/intake-integration.md` for the Phase 5 integration and smoke-test procedure.

See docs/admin-authentication.md for the Phase 6 security model, recovery redirect configuration, and one-time administrator enrollment steps.

See docs/intake-administration.md for the Phase 7 intake workflow, optimistic update protection, and verification boundaries.

See docs/scheduling-and-appointments.md for the Phase 8 appointment-request flow, protected administration, and live API smoke test.
