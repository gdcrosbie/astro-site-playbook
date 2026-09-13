# Customising a project

Use this guide after creating a repository from Astro Site Playbook. It identifies the sample-specific decisions that should be reviewed before real content or production deployment.

## 1. Project identity

Replace the package name and description in `package.json`, then update the lockfile with npm. Search page titles, feed metadata, sample content, and visible copy for “Astro Site Playbook” and replace only the product-facing instances that belong to the new site.

Keep references to the upstream methodology when you still want agents and contributors to know where the project conventions came from.

## 2. Canonical URL and discovery

Replace `https://example.com` in:

- `astro.config.mjs`;
- `public/robots.txt`;
- any project-specific tests or fixtures that intentionally assert absolute URLs.

Confirm the resulting canonical URLs, sitemap, RSS links, and social metadata in the production build.

## 3. Titles, descriptions, and social image

- Replace the defaults in `src/layouts/BaseLayout.astro`.
- Update page-level titles and descriptions.
- Replace `public/favicon.svg` and provide meaningful social-image alternative text.
- Replace `public/images/og-default.jpg` with a real 1200×630 JPEG, or update the layout and corresponding test when the project uses another format or size.
- Update the RSS title and description when editorial syndication remains enabled.

## 4. Design tokens and fonts

Choose one token-ingestion path from [Design system and CSS](design-system.md): bring your own tokens, translate a design source, or retain the template baseline temporarily.

When replacing fonts:

- update the Fontsource dependencies or local font files;
- update imports and preloads in `BaseLayout.astro`;
- update `--font-display` and `--font-body`;
- retain only the subsets and weights the site uses;
- rebuild and check for layout shift.

Run `npm run test:tokens` and `npm run test:contrast` after token changes.

## 5. Content and routes

- Remove or rewrite the sample post and sample card data.
- Model real content using [Content modelling](content-modeling.md).
- Keep schemas aligned with the fields templates actually consume.
- Keep explicit editorial ordering wherever sequence matters.
- Remove RSS and its auto-discovery link if the finished site has no syndicated editorial content.

## 6. Forms and external services

Choose the form delivery architecture before collecting real submissions. The included Cloudflare Pages, Mailgun, and optional Turnstile implementation is a reference recipe, not a requirement.

- To keep it, follow [Cloudflare Pages and Mailgun contact form](recipes/cloudflare-mailgun-contact.md).
- To replace it, retain the provider-independent and accessibility contracts in [Forms and submissions](forms.md).
- To remove it, delete the form UI, result routes, endpoint, shared validation, provider-specific tests, and related documentation together.

Review every analytics script, embed, CAPTCHA, form provider, and other external runtime request as an explicit privacy and performance decision.

## 7. Deployment behaviour

`public/_headers` is a Cloudflare Pages-compatible reference for security and cache headers. If the project uses another host, translate those policies into that platform's configuration rather than assuming the file will be applied.

Confirm:

- HTTPS and security headers;
- immutable caching only for versioned or intentionally stable assets;
- custom 404 behaviour;
- function routing if the form recipe remains;
- environment variables and secrets in each deployment environment.

## Pre-launch checklist

- [ ] Project identity and package metadata belong to the new site.
- [ ] Canonical domain and `robots.txt` sitemap URL are correct.
- [ ] Titles, descriptions, social images, sitemap, and RSS output are intentional.
- [ ] Sample content and fallback email addresses are gone.
- [ ] Tokens, fonts, and production media match the approved design.
- [ ] Form handling and every external runtime request have an owner and privacy basis.
- [ ] Success, error, keyboard, no-JavaScript, and responsive journeys have been checked.
- [ ] Deployment headers, caching, routes, and secrets are configured on the chosen host.
- [ ] `npm test` passes against the final production build.
