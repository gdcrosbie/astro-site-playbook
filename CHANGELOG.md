# Changelog

All notable changes to Astro Site Playbook are recorded here. The repository follows semantic versioning for tagged template releases, even though it is not published as an npm package.

## [Unreleased]

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

[Unreleased]: https://github.com/gdcrosbie/astro-site-playbook/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/gdcrosbie/astro-site-playbook/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/gdcrosbie/astro-site-playbook/releases/tag/v1.0.0
