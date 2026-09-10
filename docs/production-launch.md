# Phase 10: Production deployment and domain launch

## GitHub Pages deployment

The production source is the repository's `main` branch at the root directory. GitHub Pages publishes the exact static files without a separate application build. The canonical launch URL is:

`https://hiquant.co/`

Production-root assets include:

- `.nojekyll` to publish the repository as a plain static site.
- `404.html` for a branded not-found experience.
- `robots.txt` to allow public indexing while discouraging admin-route crawling.
- `sitemap.xml` with all indexable public routes.
- Canonical URLs on every public page.
- Open Graph and X/Twitter preview metadata on the homepage.
- `assets/images/og-hiquant.png` as the branded social preview.

## Deployment status

GitHub Pages is publishing the repository root from `main`, and HTTPS is enforced. The public routes, branded 404 page, responsive browser behavior, and live Supabase intake and appointment submissions have passed production checks. Synthetic verification records were removed after the submission test.

The custom-domain launch and initial administrator enrollment are complete. Owner sign-in and recovery-flow confirmation remain.

## Required Supabase Auth setting

Before testing password recovery on the live site, add this exact URL to the Supabase Auth redirect allowlist:

`https://hiquant.co/admin/reset-password.html`

Set the Supabase Auth Site URL to the production homepage when the site becomes the primary environment. Keep only intentional local and production redirect entries.

## Custom domain

The owner confirmed `hiquant.co` is registered with Spaceship. The apex points to GitHub Pages using its four `A` records, `www` is a `CNAME` to `iphygit.github.io`, and the GitHub ownership-verification TXT record is active. GitHub Pages has issued the TLS certificate and enforces HTTPS.

Production checks confirm that HTTP redirects to HTTPS, `www` redirects to the apex domain, all public routes and assets return successfully, and the desktop/mobile browser smoke suite passes.

## Launch verification

After each production publication, verify:

- Homepage, intake, scheduling, privacy, terms, robots, sitemap, social image, and 404 behavior return successfully over HTTPS.
- CSS, JavaScript, images, and the integrity-locked Supabase dependency load without mixed content or CSP violations.
- Intake and appointment submissions succeed while anonymous reads and privileged writes remain rejected.
- Mobile navigation, keyboard focus, validation summaries, and responsive layout behave as tested in Phase 9.
- Administrator sign-in and recovery work after the initial Auth user and active admin profile are created.

The protected admin success path remains pending the owner's first production sign-in.
