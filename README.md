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
- **Astro Content Layer**: Strict Zod schemas with alphabetical sorting protection (`order: number`).
- **WCAG 2.2 AA Out-of-the-Box**: Semantic landmarks, skip links, accessible components, and automated `axe-core` CI tests.
- **GDPR-Safe**: Zero runtime third-party tracking or CDN requests. All fonts and assets are local/self-hosted.
- **Multi-Agent Rails**: Built-in `AGENTS.md` and `CLAUDE.md` providing instant context to AI pair programmers.

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
| `npm run test:a11y` | Runs headless `axe-core` WCAG 2.2 AA audit on `dist/` |
| `npm test` | Runs the full verification pipeline (`test:tokens` + `check` + `build` + `test:a11y`) |

---

## Project Structure

```
astro-starter/
├── .github/workflows/
│   └── ci.yml                 # CI pipeline running lint, build, and a11y tests
├── scripts/
│   ├── test-tokens.cjs        # Token schema validation script
│   └── run-axe.cjs            # Headless axe-core a11y runner using JSDOM
├── src/
│   ├── components/
│   │   └── Card.astro         # Modular component with container query tokens
│   ├── content/
│   │   └── sample.json        # Sample Content Layer data with "order": number
│   ├── layouts/
│   │   └── BaseLayout.astro   # Root HTML shell with font preloads & skip link
│   ├── pages/
│   │   └── index.astro        # Demonstration page
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

Tokens are authored in `src/styles/tokens.css` using fluid `clamp()` formulas:

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

---

## Working with AI Agents

This repository includes both `AGENTS.md` and `CLAUDE.md` at the root directory. AI pair-programming tools (such as Antigravity, Claude Code, Cursor, Windsurf, or Codex) will read these rules automatically and adhere to:
1. Strict BEM class naming conventions.
2. CSS Logical Properties (no physical `margin-top` / `padding-left`).
3. Content Collections sorting protection.
4. WCAG 2.2 AA accessibility requirements.
