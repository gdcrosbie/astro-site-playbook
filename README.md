# Astro Starter (Production Template)

A lightweight, accessible, high-performance static starter template for Astro projects, engineered for seamless collaboration with AI coding agents (Antigravity, Claude Code, Cursor, Windsurf) and human developers alike.

---

## Key Features

- **100/100 Core Web Vitals Ready**: Font preloads, zero-layout-shift patterns, and responsive image configurations.
- **Two-Tier Fluid Design Tokens**:
  - **Tier 1 (Canvas / Viewport `vw`)**: Fluid scaling for site landmarks, page headings, and layout gutters (`--text-*`, `--h1`–`--h6`, `--space-*`).
  - **Tier 2 (Component / Container `cqi`)**: Fluid scaling for modular cards, widgets, and dialogs (`--cq-text-*`, `--cq-h1`–`--cq-h4`, `--cq-gap`, `--cq-card-padding`).
- **Auto-Enabling Container Queries**: Components self-declare container context on parents via `:has(> .c-component) { container-type: inline-size; }` without manual wrapper classes.
- **CSS Logical Properties**: Strictly flow-relative properties throughout (`padding-block`, `margin-inline`, `inset`, `inline-size`).
- **Astro Content Layer & 4-Tier Strategy**: Clear heuristics for Editorial Prose (Markdown), Entity Records (YAML), In-Page Repeaters (JSON), and Global Singletons, backed by strict Zod schemas and alphabetical sorting protection (`order: number`).
- **Production-Ready Contact Form**: Accessible `ContactForm.astro` with 3-layer anti-spam (honeypot, timestamp heuristic, Turnstile) and Cloudflare Pages Functions (`functions/api/contact.ts`) + Mailgun integration.
- **Automated RSS 2.0 Feed**: Turnkey `@astrojs/rss` feed generation at `/rss.xml` for Pattern A editorial content with auto-discovery in `BaseLayout.astro`.
- **WCAG 2.2 AA Out-of-the-Box**: Semantic landmarks, skip links, accessible components, and automated `axe-core` CI tests.
- **GDPR-Safe**: Zero runtime third-party tracking or CDN requests. All fonts and assets are local/self-hosted.
- **Multi-Agent Rails**: Built-in `AGENTS.md` and `CLAUDE.md` providing instant context and strict architectural guardrails to AI pair programmers.

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

## Project Structure

```
astro-starter/
├── .github/workflows/
│   └── ci.yml                 # CI pipeline running lint, build, and a11y tests
├── functions/
│   └── api/
│       └── contact.ts         # Cloudflare Pages edge function (Mailgun + anti-spam)
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
│   │   └── BaseLayout.astro   # Root HTML shell with font preloads, skip link & RSS
│   ├── pages/
│   │   ├── posts/
│   │   │   └── [slug].astro   # Dynamic route for Pattern A posts
│   │   ├── index.astro        # Demonstration page
│   │   └── rss.xml.ts         # Automated RSS 2.0 XML feed endpoint
│   ├── styles/
│   │   ├── tokens.css         # Two-tier fluid design token system
│   │   ├── reset.css          # Modern CSS Logical Properties reset
│   │   └── global.css         # Global typography & layout rules
│   └── content.config.ts      # Astro Content Layer schemas with Zod validation
├── AGENTS.md                  # Unified AI coding agent guidelines
├── CLAUDE.md                  # Claude Code / Anthropic specific guidelines
├── astro.config.mjs           # Astro configuration (static output)
└── tsconfig.json              # Strict TypeScript config with @/* path aliases
```

---

## Design Token Architecture

Tokens are authored in `src/styles/tokens.css` using native `oklch()` color formulas and fluid `clamp()` scales:

- **Color Tokens (Native OKLCH)**: All raw primitives use `oklch(L C H)` for wide Display P3 gamut support and predictable perceptual contrast matching WCAG 2.2 Level AA. Derived tones leverage CSS Relative Colors (`oklch(from var(...) calc(l - 0.05) c h)`).
- **Scale Tokens (Two-Tier Fluid System)**:

### 1. Viewport Tokens (Tier 1)
Used on layout landmarks, page wrappers, and primary section headings:
```css
.l-section__title {
  font-size: var(--h1);
  margin-block-end: var(--space-m);
}
```

### 2. Container Query Tokens (Tier 2)
Used within reusable components placed in dynamic grid columns:
```css
:has(> .c-card) {
  container-type: inline-size;
}

.c-card {
  padding: var(--cq-card-padding);
  gap: var(--cq-gap);
}

.c-card__title {
  font-size: var(--cq-h3);
}
```

### 3. "Bring Your Own Tokens" (BYOT) & Semantic Alias Bridge

Already have an established `tokens.css` from Automatic.css (ACSS), Utopia, Open Props, or a brand system?
1. Replace `src/styles/tokens.css` with your file.
2. Append a **Semantic Alias Bridge** at the bottom of `tokens.css` mapping your custom primitives to the semantic schema:
   ```css
   :root {
     --color-primary: var(--primary);
     --color-bg:      var(--base-light);
     --color-surface: var(--base-light);
     --color-text:    var(--base-dark);
     --font-display:  var(--font-heading);
   }
   ```
3. Modular components (`src/components/*.astro`) always consume semantic aliases (`--color-primary`, `--color-text`, `--space-m`), ensuring 100% portability across projects and instant compatibility with `npm run test:tokens` and `npm run test:contrast`.

---

## Forms & Submissions (Cloudflare Pages + Mailgun)

This starter provides a production-grade form handling architecture designed specifically for static Astro sites:

- **Zero SSR Overhead**: Astro stays 100% static (`output: 'static'`). Cloudflare Pages automatically mounts `functions/api/contact.ts` as an edge Worker on `/api/contact`.
- **3-Layer Anti-Spam Architecture**:
  1. **Honeypot (`_hp`)**: Hidden input field. If populated, silently returns fake success to discard bots.
  2. **Timestamp (`_timestamp`)**: Hidden Unix timestamp. Discards instant submissions (< 2s).
  3. **Cloudflare Turnstile**: Optional non-intrusive challenge verifying against Cloudflare's API via `TURNSTILE_SECRET_KEY`. Zero Google reCAPTCHA tracking cookies.
- **Dual Response (Progressive Enhancement)**:
  - If JS is disabled: Issues a standard `303 See Other` redirect to `/contact/success` or `/contact/error`.
  - If JS is enabled: Submits via `fetch()` with `Accept: application/json` for in-place UI updates and screen reader announcements (`role="status" aria-live="polite"`).

### Required Cloudflare Environment Variables

Configure these in the Cloudflare Dashboard under **Workers & Pages** → **[Your Project]** → **Settings** → **Environment Variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MAILGUN_API_KEY` | Mailgun Sending API Key (Secret) | `key-xxxxxxxxxxxx` |
| `MAILGUN_DOMAIN` | Verified Mailgun Sending Domain | `mg.yourdomain.com` |
| `MAILGUN_REGION` | Mailgun Datacenter region | `us` or `eu` |
| `CONTACT_TO_EMAIL` | Destination mailbox for incoming enquiries | `hello@yourdomain.com` |
| `TURNSTILE_SECRET_KEY` | *(Optional)* Cloudflare Turnstile Secret Key | `0x4AAAAAA...` |

> [!TIP]
> **Not deploying to Cloudflare Pages?** You can easily switch to hosted static form endpoints like Formspree or Web3Forms by passing `<ContactForm action="https://formspree.io/f/YOUR_ID" />`.

---

## Content Modeling & RSS Syndication (Pattern A)

Long-form editorial articles (blog posts, case studies, writing) are managed via **Pattern A (Editorial Prose)** using Astro 7 Content Collections:

1. **Storage**: Markdown files in `src/content/posts/*.md`.
2. **Schema & Loader**: Configured with `glob({ pattern: '**/*.md', base: 'src/content/posts' })` in `src/content.config.ts`.
3. **Dynamic Routes**: Static detail pages pre-rendered at `src/pages/posts/[slug].astro`.
4. **Automated RSS 2.0 XML Feed**:
   - Generated automatically at `/rss.xml` via `src/pages/rss.xml.ts` using `@astrojs/rss`.
   - Update your canonical domain in `astro.config.mjs` (`site: 'https://example.com'`).
   - Auto-discovery `<link rel="alternate" type="application/rss+xml" ... />` is built into `BaseLayout.astro`.

---

## Working with AI Agents

This repository includes both `AGENTS.md` and `CLAUDE.md` at the root directory. AI pair-programming tools (such as Antigravity, Claude Code, Cursor, Windsurf, or Codex) will read these rules automatically and adhere to:
1. Strict BEM class naming conventions.
2. CSS Logical Properties (no physical `margin-top` / `padding-left`).
3. 4-Tier content modeling strategy and "Stop & Ask" gate for ambiguous dynamic data.
4. Content Collections sorting protection (`order: number`).
5. Form handling heuristics (Cloudflare Pages Function + Mailgun baseline and Stop & Ask gate).
6. Automated RSS 2.0 feed syndication for Pattern A editorial content.
7. WCAG 2.2 AA accessibility requirements.

---

## License

This project is licensed under the [MIT License](LICENSE).

