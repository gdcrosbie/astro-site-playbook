# Astro Starter (Production Template)

A lightweight, accessible, high-performance static starter template for Astro projects, engineered for seamless collaboration with AI coding agents (Antigravity, Claude Code, Cursor, Windsurf).

---

## Features

- **Zero-JS Baseline**: Pure static HTML output by default; tiny vanilla modules for progressive enhancement.
- **Two-Tier Fluid Design Tokens**:
  - **Tier 1 (Canvas / Viewport `vw`)**: Fluid scaling for site sections, page headings, and layout gutters.
  - **Tier 2 (Component / Container `cqi`)**: Fluid scaling for modular cards, widgets, and dialogs.
- **CSS Logical Properties**: Strictly flow-relative properties (`padding-block`, `margin-inline`, `inset`, `inline-size`).
- **Astro Content Layer**: Strict Zod schemas with alphabetical sorting protection (`order: number`).
- **WCAG 2.2 AA Out-of-the-Box**: Skip links, landmark architecture, accessible components, and automated `axe-core` CI tests.
- **100/100 Core Web Vitals Ready**: Font preloads, responsive image patterns, and layout shift locks.
- **GDPR-Safe**: Zero runtime third-party tracking or CDN requests.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Verify types and content schemas
npm run check

# 4. Build static production bundle
npm run build

# 5. Run full test suite (tokens + check + build + a11y)
npm test
```

---

## Agent Instructions

This template includes `AGENTS.md` and `CLAUDE.md` at the root. When working with AI coding agents, the agent will automatically adhere to the **Astro Build Playbook** conventions without requiring custom prompt engineering.
