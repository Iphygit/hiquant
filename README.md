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
- [ ] Phase 1: shared design system and responsive page shell
- [ ] Phase 2: public marketing pages
- [ ] Phase 3: client-side intake workflow
- [ ] Phase 4: Supabase database and security foundation
- [ ] Phase 5: live intake integration
- [ ] Phase 6: administrator authentication
- [ ] Phase 7: intake administration
- [ ] Phase 8: scheduling and appointment administration
- [ ] Phase 9: security, accessibility, and browser verification
- [ ] Phase 10: production deployment and domain launch

See [the detailed project plan](docs/HiQuant_Web_Application_Project_Plan.md) for the complete MVP scope.

## Local development

No build system or runtime dependency is required for the initial vanilla frontend. Development and preview instructions will be added when the first HTML pages are implemented.

