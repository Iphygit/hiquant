# HiQuant Consulting Web Application — Implementation Plan

## 1. Project Overview

Build a simple, professional, low-cost web application for **HiQuant Consulting LLC** that supports:

- Public client intake
- Meeting scheduling
- Secure admin login
- Intake and appointment management
- Custom branding and domain
- Free-tier hosting and backend services

The application should remain lightweight, easy to maintain, and inexpensive to operate during the early stage of the business.

## 2. Business Context

HiQuant Consulting LLC will primarily provide consulting services across:

- Biotech
- Pharmaceutical / Life Sciences
- Information Technology
- Data / Digital Transformation
- Strategy / Advisory

The website should therefore avoid looking like a healthcare clinic portal. It should feel like a professional consulting company serving scientific, regulated, and technology-focused clients.

## 3. MVP Goals

The first production version should allow a prospective client to:

1. Visit the public website.
2. Learn what HiQuant Consulting offers.
3. Submit a consulting inquiry through an intake form.
4. Request or schedule a meeting.
5. Receive a submission confirmation.

The business owner should be able to:

1. Log in securely.
2. View client intake submissions.
3. View appointment requests.
4. Update appointment status.
5. Update lead/intake status.
6. Add internal admin notes.
7. Log out securely.

## 4. Cost-Effective Technology Stack

| Layer | Recommended Tool | Initial Cost |
|---|---|---:|
| Source control | GitHub | Free |
| Frontend | HTML, CSS, JavaScript | Free |
| Hosting | GitHub Pages | Free |
| Database | Supabase PostgreSQL | Free tier |
| Authentication | Supabase Auth | Free tier |
| API/Data Access | Supabase JavaScript SDK | Free tier |
| SSL | GitHub Pages | Free |
| Domain | Porkbun / Namecheap / IONOS | Paid annually |
| Email notifications | Optional later | Depends on provider |

> **Important:** Hosting and the initial backend can be zero-cost, but a custom domain itself is normally not free.

## 5. Recommended Architecture

```text
                         PUBLIC INTERNET
                               |
                        Custom Domain
                    www.hiquantconsulting.com
                               |
                               v
                       GitHub Pages
                     Static Frontend
                  HTML + CSS + JavaScript
                     /              \
                    /                \
                   v                  v
         Public Intake Form      Admin Dashboard
                   |                  |
                   |            Supabase Auth
                   |                  |
                   +---------> Supabase <---------+
                              PostgreSQL
                                  |
                         Row Level Security
```

No traditional backend server is required for the MVP.

The frontend communicates directly with Supabase using the public anonymous key. Security is enforced through **Row Level Security (RLS)** rather than by hiding the Supabase public key.

## 6. Application Pages

### 6.1 Home Page — `/index.html`

Recommended sections:

- HiQuant logo
- Hero section
- Short company description
- Services
- Industries
- Why HiQuant
- Contact / consultation CTA
- Footer

Suggested services:

- Pharma & Biotech Consulting
- Quality / GMP Consulting
- Analytical & Laboratory Consulting
- IT Consulting
- Digital Transformation
- Data & Automation
- Technology Strategy
- Business Process Improvement

### 6.2 Client Intake Page — `/intake.html`

Fields:

**Contact Information**

- First Name
- Last Name
- Company
- Job Title
- Email
- Phone

**Consulting Need**

- Service Category
- Industry
- Project Description
- Expected Start Date
- Estimated Project Duration
- Budget Range
- Preferred Contact Method

**Service Category Options**

- Biotech Consulting
- Pharmaceutical Consulting
- Quality / GMP Consulting
- Laboratory / Analytical Consulting
- IT Consulting
- Data / Automation
- Digital Transformation
- Strategy / Advisory
- Other

**Final Fields**

- How did you hear about us?
- Consent checkbox
- Submit button

After submission:

```text
Thank you for contacting HiQuant Consulting.
Your request has been received and we will review it shortly.
```

### 6.3 Scheduling Page — `/schedule.html`

For the MVP, allow clients to submit an appointment request rather than building complex live calendar synchronization immediately.

Fields:

- Name
- Email
- Company
- Meeting Type
- Preferred Date
- Preferred Time
- Time Zone
- Consultation Topic
- Additional Notes

Meeting Type examples:

- Initial Consultation — 30 minutes
- Project Discovery — 45 minutes
- Technical Consultation — 60 minutes

Appointment status starts as:

```text
requested
```

Admin can change it to:

```text
confirmed
rescheduled
completed
cancelled
```

## 7. Admin Portal

Recommended URL:

```text
/admin/
```

The admin page must not display business data unless the user has authenticated successfully through Supabase Auth.

### 7.1 Admin Login

Use:

- Email
- Password

Do not create public admin registration. Create administrators manually through Supabase Authentication and authorize each one with a separate active `admin_profiles` record.

Existing administrators use their same account for routine sign-in. The Supabase setup steps are required only once for each new employee who needs dashboard access; administrators must never share accounts or passwords.

### 7.2 Admin Dashboard

Dashboard summary cards:

```text
New Leads
Pending Appointments
Confirmed Meetings
Active Projects
```

Main navigation:

```text
Dashboard
Client Intakes
Appointments
Settings
Logout
```

### 7.3 Client Intakes Screen

| Date | Client | Company | Service | Status | Action |
|---|---|---|---|---|---|

Possible statuses:

```text
new
reviewing
contacted
qualified
proposal_sent
converted
closed
declined
```

Lead detail should show:

- Full contact information
- Project description
- Requested service
- Budget
- Timeline
- Internal notes
- Submission date
- Status

### 7.4 Appointment Screen

| Date | Client | Meeting Type | Requested Time | Status | Action |
|---|---|---|---|---|---|

Admin actions:

- Confirm
- Reschedule
- Mark Complete
- Cancel
- Add notes

## 8. Supabase Database Design

### 8.1 `intakes`

```sql
create table public.intakes (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  company text,
  job_title text,
  email text not null,
  phone text,
  service_category text not null,
  industry text,
  project_description text not null,
  expected_start_date date,
  project_duration text,
  budget_range text,
  preferred_contact_method text,
  referral_source text,
  status text not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.2 `appointments`

```sql
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  company text,
  meeting_type text not null,
  preferred_date date not null,
  preferred_time time not null,
  timezone text,
  consultation_topic text,
  client_notes text,
  status text not null default 'requested',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 8.3 Optional `admin_profiles`

```sql
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
```

## 9. Supabase Security

### 9.1 Enable RLS

```sql
alter table public.intakes enable row level security;
alter table public.appointments enable row level security;
alter table public.admin_profiles enable row level security;
```

### 9.2 Public Intake Insert Policy

```sql
create policy "Public can submit intake"
on public.intakes
for insert
to anon
with check (true);
```

Do **not** create anonymous SELECT, UPDATE, or DELETE policies.

### 9.3 Public Appointment Insert Policy

```sql
create policy "Public can request appointment"
on public.appointments
for insert
to anon
with check (true);
```

### 9.4 Admin Authorization

For the initial owner:

1. Create one Supabase Auth account manually.
2. Create one matching `admin_profiles` record.
3. Permit reads/updates only when the authenticated user exists in `admin_profiles`.

Example:

```sql
create policy "Admins can view intakes"
on public.intakes
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);
```

Create similar policies for:

```text
SELECT intakes
UPDATE intakes
SELECT appointments
UPDATE appointments
```

Avoid public DELETE operations.

### 9.5 Future Employee Administrator Access

For every additional employee who needs the admin dashboard:

1. Create a separate user in Supabase Dashboard → Authentication → Users.
2. Give the employee a unique temporary password and require them to replace it through the approved recovery flow.
3. Run `sql/create-admin-profile.sql` with that employee's email to create the matching active `admin_profiles` record.
4. Confirm the employee can sign in and that an authenticated user without an active profile is denied.
5. Enable MFA when supported by the selected Supabase plan and account configuration.

This is one-time enrollment per employee, not a step repeated on every login. Do not add public administrator registration and do not place a Supabase service-role key in browser code. A future self-service invitation workflow must run only in a trusted server or Supabase Edge Function.

When an employee leaves, first set their `admin_profiles.is_active` value to `false`, then remove the Supabase Auth user or revoke their sessions as appropriate. This preserves the database authorization block while any previously issued access token reaches expiry.

## 10. Suggested Project Structure

```text
hiquant-consulting/
│
├── index.html
├── intake.html
├── schedule.html
├── privacy.html
├── terms.html
│
├── admin/
│   ├── index.html
│   ├── dashboard.html
│   ├── intakes.html
│   ├── appointments.html
│   └── login.html
│
├── css/
│   ├── main.css
│   └── admin.css
│
├── js/
│   ├── config.js
│   ├── supabase.js
│   ├── intake.js
│   ├── schedule.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── intakes.js
│   └── appointments.js
│
├── assets/
│   ├── logo/
│   │   ├── hiquant-primary.png
│   │   ├── hiquant-transparent.png
│   │   └── hiquant-white.png
│   └── images/
│
├── sql/
│   ├── schema.sql
│   └── rls-policies.sql
│
├── README.md
└── .gitignore
```

## 11. Frontend Configuration

Create `/js/config.js`:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

The Supabase anonymous key can exist in browser JavaScript.

**Never place the Supabase service-role key in GitHub or frontend JavaScript.**

## 12. Intake Submission Flow

```text
User opens intake page
        |
        v
Completes form
        |
        v
Browser validates required fields
        |
        v
Supabase INSERT
        |
        v
RLS verifies INSERT is permitted
        |
        v
Record saved
        |
        v
Display confirmation message
```

## 13. Admin Authentication Flow

```text
Admin opens /admin/
        |
        v
No active session?
        |
       YES
        |
        v
Show login
        |
        v
Supabase Auth signInWithPassword()
        |
        v
Session created
        |
        v
Load admin dashboard
        |
        v
Authenticated RLS policies allow data access
```

## 14. MVP UI Design

Use the selected HiQuant branding.

Recommended approximate palette:

```text
Navy:       #071F45
Teal:       #12B7B1
White:      #FFFFFF
Light Gray: #F5F7FA
Dark Text:  #162033
```

Use:

- White page background
- Navy headings
- Teal buttons and accents
- Large whitespace
- Minimal corporate layout

Avoid making the site look overly technology-specific or overly healthcare-specific.

## 15. GitHub Setup

Suggested repository:

```text
hiquant-consulting-web
```

Commands:

```bash
git init
git add .
git commit -m "Initial HiQuant Consulting website"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 16. GitHub Pages Deployment

In GitHub:

```text
Repository
→ Settings
→ Pages
→ Deploy from branch
→ main
→ /root
```

Test the GitHub Pages URL before connecting the custom domain.

## 17. Custom Domain

Example:

```text
hiquantconsulting.com
```

Recommended setup:

```text
www.hiquantconsulting.com
```

points to GitHub Pages, while the root domain redirects to `www`.

Enable HTTPS after DNS propagation.

## 18. Security Requirements

The application must:

- Use HTTPS.
- Use Supabase Auth for admin login.
- Enable RLS on every table containing client data.
- Never expose the service-role key.
- Never store admin passwords in JavaScript.
- Never rely only on hiding `/admin`.
- Validate form fields.
- Limit text input lengths.
- Avoid rendering submitted text using unsafe `innerHTML`.
- Add CAPTCHA/anti-spam protection if bot submissions become a problem.
- Keep dependencies updated.

## 19. Privacy Considerations

Because HiQuant may serve biotech and pharma companies, intake forms should explicitly instruct clients **not to submit confidential, proprietary, patient, clinical, trade-secret, or regulated information** through the initial public inquiry form.

Suggested statement:

> Please do not include confidential, proprietary, patient-identifiable, clinical, or other regulated information in this initial inquiry form. Detailed project information can be exchanged through an appropriate secure channel after engagement.

The initial MVP should **not** be presented as a HIPAA-compliant portal.

## 20. Implementation Phases

### Phase 1 — Accounts and Infrastructure

- [ ] Create GitHub account/repository.
- [ ] Create Supabase account/project.
- [x] Purchase custom domain (`hiquant.co`).
- [ ] Create project folder structure.
- [ ] Add HiQuant branding assets.

### Phase 2 — Database

- [ ] Create `intakes`.
- [ ] Create `appointments`.
- [ ] Create `admin_profiles`.
- [ ] Enable RLS.
- [ ] Add anonymous INSERT policies.
- [ ] Add authenticated admin policies.
- [ ] Create initial admin user.
- [ ] Test anonymous vs authenticated access.

### Phase 3 — Public Website

- [ ] Build homepage.
- [ ] Build services section.
- [ ] Build industries section.
- [ ] Build intake form.
- [ ] Add form validation.
- [ ] Connect form to Supabase.
- [ ] Build scheduling form.
- [ ] Connect appointment requests to Supabase.
- [ ] Add success/error messages.
- [ ] Build privacy page.
- [ ] Build terms page.

### Phase 4 — Admin Portal

- [ ] Build admin login.
- [ ] Implement Supabase authentication.
- [ ] Protect dashboard views.
- [ ] Build dashboard summary cards.
- [ ] Build intake table.
- [ ] Build intake detail view.
- [ ] Add intake status updates.
- [ ] Add admin notes.
- [ ] Build appointments table.
- [ ] Add appointment status management.
- [ ] Implement logout.

### Phase 5 — Testing

- [ ] Public user can submit intake.
- [ ] Public user cannot read intakes.
- [ ] Public user can submit appointment.
- [ ] Public user cannot read appointments.
- [ ] Invalid login is rejected.
- [ ] Admin can log in.
- [ ] Admin can read submissions.
- [ ] Admin can update status.
- [ ] Admin can add notes.
- [ ] Logout removes session.
- [ ] Mobile layout works.
- [ ] Forms work in Chrome, Edge, Safari, and mobile browsers.

### Phase 6 — Deployment

- [ ] Push production code to GitHub.
- [ ] Enable GitHub Pages.
- [ ] Test GitHub Pages URL.
- [x] Add custom domain (`hiquant.co`).
- [ ] Configure DNS.
- [x] Enable HTTPS.
- [ ] Perform production security tests.
- [ ] Launch website.

## 21. Recommended MVP Enhancements After Launch

Do not build all of these initially.

### Level 1

- Email notification when a new intake arrives
- Email acknowledgement to prospective client
- Lead filtering/search
- Appointment filtering
- Dashboard analytics
- CSV export

### Level 2

- Real-time calendar availability
- Google Calendar integration
- Microsoft Outlook integration
- Automated confirmation emails
- Reminder emails
- Rescheduling links

### Level 3

- Proposal generation
- Client accounts
- Client portal
- Project tracking
- Secure document upload
- Contract/e-signature integration
- Invoice generation
- Payment collection

## 22. Recommended Development Order

```text
1. Supabase project
2. Database schema
3. RLS security
4. Basic public intake
5. Test database submission
6. Admin authentication
7. Admin intake viewer
8. Scheduling form
9. Appointment admin screen
10. Homepage branding
11. Responsive design
12. Security testing
13. GitHub Pages deployment
14. Custom domain
15. Production launch
```

## 23. Definition of Done for MVP

The MVP is complete when:

- HiQuant has a professional branded website.
- Prospective clients can submit an intake.
- Prospective clients can request consultations.
- Submissions are stored securely.
- Anonymous visitors cannot read stored records.
- Only the approved administrator can access the dashboard.
- The administrator can manage intake and appointment statuses.
- The application works on desktop and mobile.
- The site runs over HTTPS.
- The custom domain resolves correctly.
- No paid server is required.

## 24. Codex / AI Coding Agent Implementation Instructions

```text
PROJECT: HiQuant Consulting Web Application

GOAL:
Build a lightweight static consulting website with Supabase as the backend.

TECH STACK:
- HTML5
- CSS3
- Vanilla JavaScript
- Supabase JavaScript SDK
- Supabase PostgreSQL
- Supabase Authentication
- GitHub Pages

RULES:
1. Do not introduce React, Next.js, Node.js backend, Express, or other frameworks unless specifically requested.
2. Keep the MVP deployable as a static GitHub Pages website.
3. Never place a Supabase service-role key in frontend code.
4. Enforce authorization using Supabase Row Level Security.
5. Anonymous users may INSERT intake and appointment records only.
6. Anonymous users must not SELECT, UPDATE, or DELETE business data.
7. Only authenticated administrators may view or update submissions.
8. Keep JavaScript modular.
9. Keep CSS responsive.
10. Use semantic HTML.
11. Avoid unsafe innerHTML for user-supplied values.
12. Validate all public form input.
13. Keep the implementation simple and maintainable.
14. Build one phase at a time and test before moving forward.
15. Do not add paid services to the MVP.
```

## 25. First Coding Milestone

The first milestone should produce:

```text
index.html
intake.html
css/main.css
js/config.js
js/supabase.js
js/intake.js
sql/schema.sql
sql/rls-policies.sql
README.md
```

Acceptance test:

```text
A prospective client opens intake.html,
completes the form,
clicks Submit,
and a new record appears in Supabase.

The same anonymous browser must NOT be able to query
or retrieve any intake records.
```

Only after this milestone passes should development proceed to the admin portal.

## 26. Final Recommended MVP Architecture

```text
GitHub Pages
     +
Vanilla HTML/CSS/JS
     +
Supabase Database
     +
Supabase Authentication
     +
Supabase RLS
     +
Custom Domain
```

This is sufficient for the initial intake + scheduling + admin use case and avoids paying for an application server during the MVP stage.
