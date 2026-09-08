# Phase 10: Production deployment and domain launch

## GitHub Pages deployment

The production source is the repository's `main` branch at the root directory. GitHub Pages publishes the exact static files without a separate application build. The canonical launch URL is:

`https://iphygit.github.io/hiquant/`

Production-root assets include:

- `.nojekyll` to publish the repository as a plain static site.
- `404.html` for a branded not-found experience.
- `robots.txt` to allow public indexing while discouraging admin-route crawling.
- `sitemap.xml` with all indexable public routes.
- Canonical URLs on every public page.
- Open Graph and X/Twitter preview metadata on the homepage.
- `assets/images/og-hiquant.png` as the branded social preview.

## Required Supabase Auth setting

Before testing password recovery on the live site, add this exact URL to the Supabase Auth redirect allowlist:

`https://iphygit.github.io/hiquant/admin/reset-password.html`

Set the Supabase Auth Site URL to the production homepage when the site becomes the primary environment. Keep only intentional local and production redirect entries.

## Custom domain

No custom domain was supplied during implementation. When the business domain is ready:

1. Verify the domain in GitHub account settings to reduce takeover risk.
2. Configure the Pages custom domain, then add the required DNS records at the registrar.
3. Wait for GitHub's TLS certificate to become approved and enforce HTTPS.
4. Replace the GitHub Pages hostname in canonical, Open Graph, sitemap, robots, and Supabase redirect URLs.
5. Add the generated `CNAME` file to the repository and repeat the production smoke tests.

Do not create DNS records or a `CNAME` file until the exact owned domain is confirmed.

## Launch verification

After each production publication, verify:

- Homepage, intake, scheduling, privacy, terms, robots, sitemap, social image, and 404 behavior return successfully over HTTPS.
- CSS, JavaScript, images, and the integrity-locked Supabase dependency load without mixed content or CSP violations.
- Intake and appointment submissions succeed while anonymous reads and privileged writes remain rejected.
- Mobile navigation, keyboard focus, validation summaries, and responsive layout behave as tested in Phase 9.
- Administrator sign-in and recovery work after the initial Auth user and active admin profile are created.

The public site can launch on its GitHub Pages URL independently of administrator enrollment. The protected admin success path and custom-domain cutover remain owner-controlled launch tasks.
