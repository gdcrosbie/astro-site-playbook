# Changelog

All notable changes to Astro Site Playbook are recorded here. The repository follows semantic versioning for tagged template releases, even though it is not published as an npm package.

## [Unreleased]

## [2.0.5] - 2026-10-07

### Changed

- Renamed the contact recipe to `docs/recipes/cloudflare-workers-turnstile-mailgun-contact.md` and made Workers Static Assets the primary runtime, retaining an existing Pages wrapper. Required server-side Turnstile verification, corrected browser timing/reset and JavaScript-disabled contact guidance, and replaced fake-success heuristic drops with recoverable errors. Updated copyable provider and router tests and all recipe links.

- `docs/hosting.md` adds **Choose one deploy path per Worker**: Git-connected Workers Builds and manual `wrangler deploy` must not be mixed, because the deployment that finishes last goes live and a late build of an older commit can silently roll back a newer one. It lists the three paths (Git builds only, manual only, GitHub Actions with a concurrency group) and how to check which commit is live. **Verify the live deployment** notes Cloudflare's placeholder 404 in the first seconds after a deploy and asks for the live commit to be confirmed.

## [2.0.4] - 2026-09-30

### Added

- `docs/recipes/sveltia-cms.md` documents an optional, zero-dependency Git-based CMS at `/admin` mapping onto the four content patterns in `docs/content-modeling.md`, including an `astro:assets` image glob helper, local File System Access API editing, Personal Access Token sign-in, and a self-contained Cloudflare Workers GitHub OAuth handler (`src/worker.js` + `wrangler.jsonc` `run_worker_first`). **No CMS** remains the starter's default.

### Changed

- Updated `astro` to `^7.3.3` (`7.3.3` in `package-lock.json`).
- `docs/hosting.md` and `public/_headers` cover **Cloudflare Workers (Static Assets)** alongside Cloudflare Pages, Netlify, and Vercel, including the required `wrangler.jsonc` configuration (`assets.directory: "./dist"`, `html_handling: "auto-trailing-slash"`, `not_found_handling: "404-page"`, `workers_dev: true`, and no `main` entry for purely static sites) so Wrangler 4.68+ does not trigger `@astrojs/cloudflare` SSR autoconfig.
- `docs/design-system.md` documents contextual section surface tokens (`.c-surface-*`) that re-alias semantic text, surface, and border tokens on dark or inverted bands on light-first pages, and recommends verifying every distinct section surface in `scripts/check-contrast.cjs`.
- `docs/quality.md` adds guidance on progressive-enhancement fallbacks and viewport/tab lifecycle pausing for decorative WebGL/`<canvas>` scenes (`html.gl` class gate), and on providing a Node-based `sharp` fallback whenever `predev`/`prebuild` asset scripts call system CLI binaries such as `cwebp`.
- `.gitignore` and `scripts/test-template-copy.cjs` ignore `.wrangler/` and `.cache/`.

## [2.0.3] - 2026-09-17

### Changed

- `docs/customization.md` adds **Starter documentation and updates**. Projects created from the template record the starter release in `.starter-version`, keep their own project record, remove local copies of the generic guides, `docs/recipes/`, the repository-local skill and `CHANGELOG.md`, and link to the guides upstream at that release. `.starter-version` is treated as the last release reviewed, with skipped items logged in `.starter-version.log`, and changes that originated in the project are not copied back. Later sections are renumbered, and the pre-launch checklist gains an item.
- `docs/getting-started.md` explains that the guides are reference material in a derived project and points to the new section.

## [2.0.2] - 2026-09-17

### Fixed

- `scripts/test-discovery.cjs` no longer hard-codes the sample post and feed. Article, sitemap and feed checks are derived from `src/content/posts` and the RSS route, so removing the sample post or RSS no longer requires rewriting the test. It checks two things it did not before: **every** post is checked (not only `posts/welcome`), and while the RSS route exists an RSS auto-discovery link is **required** in the built homepage. When the RSS route is removed, it asserts that no `rss.xml` or auto-discovery link remains.

### Changed

- `public/_headers` states that it applies to Cloudflare Pages and Netlify only, and that Vercel publishes it as a public file without applying it.
- `docs/quality.md` adds a manual viewport test matrix and notes that the jsdom-based checks do not cover layout.
- `docs/design-system.md` covers styling classes passed to child components, matching inside strokes with inset outlines, and `em` letter spacing for fluid headings.
- `docs/customization.md` reflects the adaptive discovery test.

## [2.0.1] - 2026-09-16

### Added

- `docs/hosting.md` covers confirming the deployment host, per-host header and redirect configuration (Cloudflare Pages, Netlify, Vercel), verifying the live deployment, and a layered approach for sites that must not be indexed.

### Changed

- Architecture, customization, quality, design-system, playbook, README, agent adapter, and skill documentation now link the hosting guide. They warn that `public/_headers` is published as a public file on Vercel, clarify that `test:forms` exists only after the contact form recipe is added, and add guidance on placeholder routes and link integrity, `<picture>` sizing in fixed frames, `text-wrap` on display headings, and design files without variables.

### Fixed

- CI now runs `npm test` instead of listing individual scripts. The workflow still called the `test:forms` script removed in v2.0.0, so CI failed on the default branch and on the first push of every project created from the template.

## [2.0.0] - 2026-09-16

### Removed

- Pre-bundled contact form components (`ContactForm.astro`, `FormResult.astro`), Cloudflare Pages Function (`functions/api/contact.ts`), outcome pages (`/contact/success`, `/contact/error`), shared validation module (`src/lib/contact-validation.ts`), and form test script (`scripts/test-contact-form.mjs`) from the starter to keep new projects lean and static-first.

### Changed

- Documented the Cloudflare Pages and Mailgun contact flow as a complete, self-contained recipe in `docs/recipes/cloudflare-mailgun-contact.md` with full code snippets, configuration, and verification instructions.
- Updated forms, architecture, getting-started, customization, and agent documentation to reflect that the starter has no pre-bundled form and links directly to the recipe when forms are needed.
- Simplified `astro.config.mjs` and `scripts/test-discovery.cjs` sitemap/discovery checks.

## [1.0.1] - 2026-09-15

### Changed

- Clarified that new sites should be created with GitHub's template workflow, while direct clones are for evaluation and forks are for contributing changes upstream.
- Added a restrained path for agencies that want help adapting the public Playbook into a bespoke delivery system.
- Defined the licensing and ownership boundary between MIT-licensed Playbook scaffolding and adopter-created design tokens, components, schemas, content, brand assets, finished sites, and client deliverables.

## [1.0.0] - 2026-09-13

### Added

- A runnable static Astro starter with validated content examples, semantic design tokens, local fonts, metadata, RSS, sitemap, and an optional contact flow.
- A canonical human-readable playbook with focused architecture, design-system, content, forms, quality, setup, customization, and provider-recipe guides.
- Thin adapters for coding agents and a reusable Astro site-builder skill.
- Automated checks for documentation, tokens, contrast, Astro diagnostics, production builds, discovery metadata, social images, forms, and accessibility.
- An isolated clean-copy test for validating template adoption before releases.

### Changed

- Renamed and repositioned the original Astro starter as Astro Site Playbook.
- Separated universal principles and repository conventions from replaceable implementation defaults.
- Hardened form validation, keyboard focus, reduced-motion handling, list semantics, discovery metadata, and production cache guidance for the first stable release.

[Unreleased]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.5...HEAD
[2.0.5]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/gdcrosbie/astro-site-playbook/releases/tag/v1.0.0

