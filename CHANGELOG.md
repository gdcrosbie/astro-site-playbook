# Changelog

All notable changes to Astro Site Playbook are recorded here. The repository follows semantic versioning for tagged template releases, even though it is not published as an npm package.

## [Unreleased]

### Added

- Pointer target tokens `--target-touch` (44px) and `--target-touch-large` (48px) in section 6 of `src/styles/tokens.css`, documented against WCAG 2.2 SC 2.5.8 (AA) and SC 2.5.5 (AAA).
- A "Pointer targets" section in `docs/design-system.md` covering which step to use, applying them as minimums rather than fixed sizes, and the inline-link exemption.
- A pointer-target bullet in the accessibility baseline in `docs/quality.md`.

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

[Unreleased]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.3...HEAD
[2.0.3]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/gdcrosbie/astro-site-playbook/releases/tag/v1.0.0
