# Architecture and implementation defaults

This guide makes the boundary between durable playbook principles, repository conventions, and replaceable technology choices explicit.

## Current architecture

The starter builds an Astro site as static files. Astro components render at build time, content is validated through the Astro Content Layer, and browser scripts are limited to progressive enhancement. A host may add endpoints alongside the static output; the included contact endpoint uses a Cloudflare Pages Function and does not turn the Astro build into a server-rendered application.

## Repository conventions

These conventions are binding while working in this starter because its components, tests, and documentation rely on them:

- Use `npm` and keep `package-lock.json` authoritative.
- Keep Astro UI components in `src/components/*.astro`, with component styles scoped in the component unless a rule is genuinely global.
- Keep the site static-first and use vanilla browser APIs for progressive enhancement.
- Use the design-system contract in `src/styles/tokens.css` and [Design system and CSS](design-system.md).
- Use Astro Content Collections for validated repeatable content and direct imports for simple global singletons.
- Meet the quality gates in [Quality, accessibility, performance, and privacy](quality.md).

Changing one of these conventions is an architecture change. Make the reason explicit and update affected checks and documentation in the same change.

## Implementation defaults

These choices demonstrate a complete deployment path, but they are replaceable when project requirements point elsewhere.

| Concern | Current default | What must remain true if replaced |
| --- | --- | --- |
| Rendering | Astro static output | Choose the smallest architecture that supports the required behaviour and retain appropriate verification. |
| Deployment | Cloudflare Pages-compatible static output and `_headers` | Preserve equivalent routing, caching, and security-header behaviour on the chosen host. |
| Form endpoint | Cloudflare Pages Function in `functions/api/contact.ts` | Keep server-side validation, safe secret handling, progressive responses, and accessible failure paths. |
| Email delivery | Mailgun REST API | Document configuration, handle provider failures safely, and never expose credentials to the browser. |
| Bot mitigation | Honeypot, elapsed-time check, and optional Cloudflare Turnstile | Keep layered abuse protection proportionate, accessible, and privacy-conscious. |
| Fonts | Self-hosted Fraunces and DM Sans via Fontsource | Keep fonts local where possible, minimise subsets and weights, and avoid layout shift. |
| Colours and scales | The sample OKLCH palette and two-tier fluid scales | Preserve the semantic alias contract and automated token and contrast checks. |
| Canonical site URL | `https://example.com` | Replace it before launch in `astro.config.mjs` and `public/robots.txt`. |
| Discovery | Astro sitemap plus RSS for editorial prose | Keep canonical metadata and the discovery formats required by the site's content strategy. |

## Adding runtime behaviour

Before adding a client framework or persistent browser script, establish:

1. Which user requirement cannot be met with HTML, CSS, or a small vanilla enhancement.
2. Whether the core task still has a useful baseline when JavaScript fails.
3. The accessibility, privacy, performance, and maintenance cost of the added runtime.
4. How the new behaviour will be verified against a production build.

## Configuration that must change before launch

The starter intentionally contains placeholders. At minimum, replace:

- `site` in `astro.config.mjs`;
- the sitemap origin in `public/robots.txt`;
- default titles, descriptions, social image, and feed metadata;
- the example contact recipient and all provider configuration;
- sample content, brand tokens, and fonts as required.

The included `/contact/success` and `/contact/error` pages complete the default non-JavaScript redirect flow. Customise their copy and destinations alongside the rest of the form before launch.

Use [Getting started](getting-started.md) for a new project and [Customising a project](customization.md) for the complete launch checklist. Provider-specific setup for the included form lives in the [Cloudflare Pages and Mailgun recipe](recipes/cloudflare-mailgun-contact.md).
