# Astro Starter (Production Template)

A lightweight, accessible, high-performance static starter template for Astro projects, engineered for seamless collaboration with AI coding agents (Antigravity, Claude Code, Cursor, Windsurf) and human developers alike.

---

## Table of Contents

- [Quick Start](#quick-start)
- [The Playbook](#the-playbook)
- [Available Scripts](#available-scripts)
- [Installed Packages & Core Stack](#installed-packages--core-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Architecture & Guides](#architecture--guides)
- [Working with AI Agents](#working-with-ai-agents)
- [License](#license)

---

## Quick Start

### Use as a Template

```bash
# Using GitHub CLI
gh repo create my-astro-site --template gdcrosbie/astro-starter --public --clone
cd my-astro-site

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## The Playbook

The starter is backed by a human-readable delivery methodology in [`docs/playbook.md`](docs/playbook.md). It separates:

- durable principles, such as static-first delivery, progressive enhancement, accessibility, performance, privacy, and evidence-based completion;
- repository conventions, such as BEM, CSS logical properties, semantic tokens, and the four-pattern content model;
- replaceable implementation defaults, such as Cloudflare Pages, Mailgun, Turnstile, the sample fonts, and the example domain.

Read the playbook before adapting the starter. Supporting guides cover architecture, design tokens, content modelling, forms, and verification without duplicating those rules across agent files.

---

## Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server at `http://localhost:4321` |
| `npm run build` | Builds static production bundle into `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run check` | Runs Astro and TypeScript diagnostics |
| `npm run test:tokens` | Verifies Tier 1 and Tier 2 tokens in `src/styles/tokens.css` |
| `npm run test:contrast` | Verifies WCAG 2.2 AA contrast on semantic tokens (Hex, OKLCH, relative colors) |
| `npm run test:a11y` | Runs headless `axe-core` WCAG 2.2 AA audit on `dist/` |
| `npm test` | Runs the full verification pipeline (`test:tokens` + `test:contrast` + `check` + `build` + `test:a11y`) |

---

## Installed Packages & Core Stack

This template maintains a lean, performance-first dependency footprint with zero runtime framework overhead:

| Package | Version | Purpose |
| :--- | :--- | :--- |
| [`astro`](https://astro.build/) | `^7.3.1` | Static pre-rendering framework with zero runtime JS by default and the Astro 7 Content Layer. |
| [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | `^3.7.4` | Automated XML sitemap generation (`/sitemap-index.xml`) on build, excluding `404.astro` (`noindex={true}`). |
| [`@astrojs/rss`](https://docs.astro.build/en/recipes/rss/) | `^4.0.19` | Automated RSS 2.0 XML feed endpoint generation at `/rss.xml` for editorial prose and articles. |
| [`@fontsource-variable/fraunces`](https://fontsource.org/fonts/fraunces) | `^5.3.0` | Self-hosted variable serif display font with zero third-party tracking or CDN overhead. |
| [`@fontsource-variable/dm-sans`](https://fontsource.org/fonts/dm-sans) | `^5.3.0` | Self-hosted variable sans-serif body font preloaded in `BaseLayout.astro` to eliminate FOUT and CLS. |

---

## Project Structure

```
astro-starter/
├── .github/workflows/
│   └── ci.yml                 # CI pipeline running lint, build, and a11y tests
├── docs/
│   ├── playbook.md            # Canonical human-readable methodology
│   ├── architecture.md        # Conventions versus replaceable defaults
│   ├── design-system.md       # Tokens, BEM, and logical-property contract
│   ├── content-modeling.md    # Four-pattern content decision model
│   ├── forms.md               # Provider-neutral form contract and default stack
│   └── quality.md             # Accessibility, performance, privacy, and checks
├── functions/
│   └── api/
│       └── contact.ts         # Cloudflare Pages edge function (Mailgun + anti-spam)
├── public/
│   ├── _headers               # Cloudflare Pages security & immutable cache policies
│   ├── favicon.svg
│   └── robots.txt             # Crawl policy and sitemap index declaration
├── scripts/
│   ├── test-tokens.cjs        # Token schema validation script
│   ├── test-contrast.cjs      # Automated WCAG 2.2 color contrast validator
│   └── run-axe.cjs            # Headless axe-core a11y runner using JSDOM
├── src/
│   ├── components/
│   │   ├── Card.astro         # Modular component with container query tokens
│   │   └── ContactForm.astro  # Accessible contact form with anti-spam
│   ├── content/
│   │   ├── posts/             # Pattern A: Editorial Prose (Markdown)
│   │   │   └── welcome.md
│   │   └── sample.json        # Pattern C: In-page repeater data
│   ├── layouts/
│   │   └── BaseLayout.astro   # Root HTML shell with font preloads, skip link, sitemap & RSS
│   ├── pages/
│   │   ├── posts/
│   │   │   └── [slug].astro   # Dynamic route for Pattern A posts
│   │   ├── 404.astro          # Accessible, token-compliant 404 error page (noindex)
│   │   ├── index.astro        # Demonstration page
│   │   └── rss.xml.ts         # Automated RSS 2.0 XML feed endpoint
│   ├── styles/
│   │   ├── tokens.css         # Two-tier fluid design token system
│   │   ├── reset.css          # Modern CSS Logical Properties reset
│   │   └── global.css         # Global typography & layout rules
│   └── content.config.ts      # Astro Content Layer schemas with Zod validation
├── AGENTS.md                  # Concise agent adapter pointing to the playbook
├── CLAUDE.md                  # Symlink to AGENTS.md to prevent instruction drift
├── astro.config.mjs           # Astro configuration (static output, sitemap integration)
└── tsconfig.json              # Strict TypeScript config with @/* path aliases
```

---

## Key Features

- **Performance-Oriented Baseline**: Local font preloads, layout-shift prevention patterns, and production-build verification guidance.
- **Two-Tier Fluid Design Tokens**:
  - **Tier 1 (Canvas / Viewport `vw`)**: Fluid scaling for site landmarks, page headings, and layout gutters (`--text-*`, `--h1`–`--h4`, `--space-*`).
  - **Tier 2 (Component / Container `cqi`)**: Fluid scaling for modular cards, widgets, and dialogs (`--cq-text-*`, `--cq-h3`, `--cq-gap`, `--cq-card-padding`).
- **Auto-Enabling Container Queries**: Components self-declare container context on parents via `:has(> .c-component) { container-type: inline-size; }` without manual wrapper classes.
- **CSS Logical Properties**: Strictly flow-relative properties throughout (`padding-block`, `margin-inline`, `inset`, `inline-size`).
- **Astro Content Layer & 4-Tier Strategy**: Clear heuristics for Editorial Prose (Markdown), Entity Records (YAML), In-Page Repeaters (JSON), and Global Singletons, backed by strict Zod schemas and alphabetical sorting protection (`order: number`).
- **Form Delivery Reference**: `ContactForm.astro` and `functions/api/contact.ts` demonstrate progressive enhancement, layered anti-spam, optional Turnstile, and Mailgun delivery. Production configuration and redirect destinations remain project setup tasks.
- **Automated RSS 2.0 Feed**: Turnkey `@astrojs/rss` feed generation at `/rss.xml` for Pattern A editorial content with auto-discovery in `BaseLayout.astro`.
- **Automated XML Sitemap**: Turnkey `@astrojs/sitemap` integration generating `/sitemap-index.xml` and `/sitemap-0.xml` during static pre-rendering, with auto-discovery in `BaseLayout.astro`.
- **SEO & Social Sharing Baseline**: Dynamic absolute canonical URLs, full Open Graph and Twitter Card tags, `public/robots.txt`, and Cloudflare Pages `_headers` (security policies and 1-year immutable caching).
- **Accessible 404 Error Handling**: Built-in `404.astro` error page styled with semantic tokens, skip-link support, and automatic exclusion from the XML sitemap via `noindex={true}`.
- **WCAG 2.2 AA Baseline**: Semantic landmarks, skip links, accessible component patterns, and automated `axe-core` CI tests.
- **Privacy-Minded Defaults**: Fonts and production media are self-hosted; runtime services remain explicit project decisions.
- **Playbook-Backed Agent Rails**: `AGENTS.md` and its `CLAUDE.md` symlink are concise adapters to one canonical methodology in `docs/`.

---

## Architecture & Guides

[`docs/playbook.md`](docs/playbook.md) is the canonical guide. Its focused supporting documents are:

- [`docs/architecture.md`](docs/architecture.md) — the static-first architecture, repository conventions, replaceable implementation defaults, and pre-launch placeholders.
- [`docs/design-system.md`](docs/design-system.md) — OKLCH primitives, semantic aliases, fluid scales, BEM, logical properties, and token ingestion.
- [`docs/content-modeling.md`](docs/content-modeling.md) — the four-pattern content model, decision gate, schemas, ordering, and RSS guidance.
- [`docs/forms.md`](docs/forms.md) — the provider-independent form contract and the included Cloudflare Pages, Mailgun, and Turnstile reference path.
- [`docs/quality.md`](docs/quality.md) — WCAG 2.2 AA, production performance, privacy, automated checks, and manual verification.

The README introduces the starter; these documents own the methodology and detailed operating rules.

---

## Working with AI Agents

`AGENTS.md` is a concise operational adapter that tells coding agents how to enter the project, which contracts are mandatory, and how to validate their work. `CLAUDE.md` is a relative symlink to the same adapter. Both defer to `docs/playbook.md`, so methodology is maintained in one place instead of copied into tool-specific files.

---

## License

This project is licensed under the [MIT License](LICENSE).
