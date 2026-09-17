# Customising a project

Use this guide after creating a repository from Astro Site Playbook. It identifies the sample-specific decisions that should be reviewed before real content or production deployment.

## 1. Project identity

Replace the package name and description in `package.json`, then update the lockfile with npm. Search page titles, feed metadata, sample content, and visible copy for “Astro Site Playbook” and replace only the product-facing instances that belong to the new site.

Keep references to the upstream methodology when you still want agents and contributors to know where the project conventions came from.

### License and ownership in derivative projects

The Playbook's MIT License covers the starter scaffolding, verification scripts, and documentation inherited from this repository. It does not claim ownership of original project work created by an adopter, agency, or client.

When preparing a client or derivative project:

- keep the upstream MIT copyright and permission notice with copies or substantial portions of the Playbook material retained in the project, either in `LICENSE` or in an appropriate third-party notices file;
- distinguish inherited or modified Playbook scaffolding from original project work in repository documentation when that boundary would otherwise be unclear;
- treat original design tokens, custom components, schemas, editorial content, and brand assets as the property of their creator or client according to the project's own agreement;
- apply whatever proprietary or open-source licence the project owner chooses to the finished site and its original work; and
- if `package.json` or another project-level file names a licence, update it to describe the finished project's chosen terms without removing the upstream MIT notice that still applies to retained Playbook material.

Building on this foundation does not require a finished site or client deliverable to be released under the MIT License.

## 2. Canonical URL and discovery

Replace `https://example.com` in:

- `astro.config.mjs`;
- `public/robots.txt`;
- any project-specific tests or fixtures that intentionally assert absolute URLs.

Confirm the resulting canonical URLs, sitemap, RSS links, and social metadata in the production build.

If the site must not appear in search, such as a demonstration, staging environment, or client preview, remove the sitemap and RSS integrations and apply every layer in [Hosting, headers, and indexing](hosting.md#sites-that-must-not-be-indexed). Treat that as distinct from privacy, which needs access control on the host.

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
- Remove RSS and its auto-discovery link if the finished site has no syndicated editorial content. `scripts/test-discovery.cjs` derives its article, sitemap and feed checks from `src/content/posts` and `src/pages/rss.xml.ts`: remove the sample post, or the RSS route and its layout link, and the test adapts, including asserting that no feed or auto-discovery link remains.
- Every link in navigation, footers, and calls to action must resolve. When a design links to pages outside the current scope, generate `noindex` placeholder pages from a single data file rather than using `href="#"` or inventing copy. Delete each entry when its real page ships, and add a check that every root-relative link in the built HTML resolves to a file in `dist/`.

## 6. Forms and external services

The starter intentionally ships without a bundled contact form so new sites begin with a lean, purely static foundation.

If your site requires a contact form, choose an architecture using the decision gate in [Forms and submissions](forms.md):

- To add a host-native Cloudflare Pages Function with Mailgun delivery, follow the [Cloudflare Pages and Mailgun contact form recipe](recipes/cloudflare-mailgun-contact.md).
- To use an external hosted endpoint (e.g. Formspree, Basin) or webhook, retain the provider-independent and accessibility contracts in [Forms and submissions](forms.md).

Review every analytics script, embed, CAPTCHA, form provider, and other external runtime request as an explicit privacy and performance decision.

## 7. Deployment behaviour

`public/_headers` is a Cloudflare Pages-compatible reference for security and cache headers. If the project uses another host, translate those policies into that platform's configuration rather than assuming the file will be applied, and remove files the host does not read. On Vercel, `_headers` is not applied and is published as a public file. [Hosting, headers, and indexing](hosting.md) gives per-host equivalents and a live verification routine.

Confirm:

- HTTPS and security headers;
- immutable caching only for versioned or intentionally stable assets;
- custom 404 behaviour;
- function routing if a host-native form function is added;
- environment variables and secrets in each deployment environment;
- headers, redirects, and 404 behaviour against the live production domain, not only the build.

## Pre-launch checklist

- [ ] Project identity and package metadata belong to the new site.
- [ ] Canonical domain and `robots.txt` sitemap URL are correct.
- [ ] Titles, descriptions, social images, sitemap, and RSS output are intentional.
- [ ] Sample content and placeholder metadata are replaced.
- [ ] Tokens, fonts, and production media match the approved design.
- [ ] Form handling and every external runtime request have an owner and privacy basis.
- [ ] Success, error, keyboard, no-JavaScript, and responsive journeys have been checked.
- [ ] Deployment headers, caching, routes, and secrets are configured on the chosen host, and host-irrelevant configuration files are removed.
- [ ] Response headers, trailing-slash redirects, and 404s are verified against the live production domain.
- [ ] Indexing intent is explicit: discovery is configured for a public site, or every layer in the hosting guide is applied for a site that must not be indexed.
- [ ] Every internal link resolves in the production build.
- [ ] `npm test` passes against the final production build.
