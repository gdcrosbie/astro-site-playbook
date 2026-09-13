# Project Guidelines & Agent Instructions (Astro Starter)

> [!IMPORTANT]
> **This is a standalone, performance-first Astro project.**
> - Zero runtime framework overhead (vanilla progressive enhancement only).
> - All components live in `src/components/*.astro` with scoped `<style>` blocks.
> - Data is managed via Astro Content Collections in `src/content/` and `src/content.config.ts`.
> - Strict BEM CSS architecture and flow-relative CSS Logical Properties.

---

## 1. Development & Build Commands

Always use standard `npm` (never pnpm or yarn unless explicitly instructed):

```bash
# Run local dev server
npm run dev

# Typecheck and validate content schemas
npm run check

# Build static production bundle to dist/
npm run build

# Preview static production bundle
npm run preview

# Run automated WCAG 2.2 AA accessibility audit
npm run test:a11y

# Verify tokens contract
npm run test:tokens

# Verify WCAG 2.2 AA color contrast on semantic tokens
npm run test:contrast
```

---

## 2. Design Tokens & Styling Contract

- **Token Source**: `src/styles/tokens.css` (imported via `src/styles/global.css`).
- **Color Format: Native OKLCH (Mandatory)**:
  - All color primitives in `src/styles/tokens.css` must be authored in native `oklch(L C H)` format.
  - Never use raw Hex or RGB in component stylesheets or token definitions.
  - **Perceptual Uniformity**: OKLCH lightness `L` predictably correlates with visual contrast, ensuring compliance with WCAG 2.2 AA (normal text ≥ 4.5:1, large/UI ≥ 3.0:1).
  - **Wide Gamut**: Leverages Display P3 on modern screens without color clipping.
  - **Derived Tones**: Use CSS Relative Color syntax: `oklch(from var(--c-surface) calc(l - 0.05) c h)`.
- **Token Schema**: All components must consume semantic tokens:
  - Colors: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--border-subtle`.
- **Two-Tier Fluid Scale System**:
  - **Tier 1 (Canvas/Viewport `vw`)**: Used for page sections, layout gutters (`--gutter`), site headers, and page titles (`--h1` to `--h4`, `--space-3xs` to `--space-3xl`, `--text-xs` to `--text-xl`).
  - **Tier 2 (Component/Container `cqi`)**: Used for modular components (cards, badges, teasers, dialogs) that live inside multi-column grids or sidebars (`--cq-text-*`, `--cq-card-padding`, `--cq-gap`). Components carry their container context via `:has(> &) { container-type: inline-size; }`.
- **No Utility Soup**: Never use Tailwind or inline `style=""` attributes.
- **Methodology**: Strict BEM (`.c-block`, `.c-block__element`, `.c-block--modifier`, `.l-section`, `.l-container`).
- **Mandatory: CSS Logical Properties**:
  - Padding: `padding-block`, `padding-inline` (never top/bottom/left/right).
  - Margins: `margin-block`, `margin-inline` (never top/bottom/left/right).
  - Sizing: `inline-size`, `block-size`, `max-inline-size`, `min-block-size`.
  - Positioning: `inset`, `inset-block-start`, `inset-inline-start`.

---

## 3. Ingesting Designs (Figma, Paper.design, Claude Design)

1. **HTML-First Rule**:
   - If a Figma Make export contains both `*.html` and `App.tsx`, **always use the `*.html` file as the primary source of truth for markup and layout**.
   - Do not unwind React JSX/hooks. Only look at `App.tsx` to extract raw data arrays for JSON files.
2. **Tokens First**:
   - Before building components, ensure `src/styles/tokens.css` satisfies the schema.
   - Run `npm run test:tokens`.
3. **Color Conversion**:
   - Always convert incoming Hex/sRGB colors from Figma or Paper into native `oklch(L C H)` primitives in `src/styles/tokens.css`.
   - Verify semantic contrast immediately with `npm run test:contrast`.

---

## 4. Content Modeling (Astro Content Layer)

1. Define collections in `src/content.config.ts` using `file()` loaders and Zod schemas:
   ```typescript
   import { defineCollection } from 'astro:content';
   import { z } from 'astro/zod';
   import { file } from 'astro/loaders';
   ```
2. Store data in `src/content/<name>.json` as an array of objects.
3. **Ordering Rule**: Always provide `"order": number` in JSON entries and `order: z.number().default(0)` in schemas where display order matters. Astro sorts collections by ID alphabetically by default.
4. Sort explicitly in components:
   ```astro
   const items = (await getCollection('<name>')).map(e => e.data).sort((a, b) => a.order - b.order);
   ```

---

## 5. Performance & GDPR Rules

1. **Zero External Runtime Media**:
   - Download all images to `public/images/` as WebP files. Never load external CDNs (Unsplash, etc.) in production.
2. **Core Web Vitals (95–100 Target)**:
   - **Hero/LCP Image**: Preload in `BaseLayout.astro` (`<link rel="preload" as="image" ... fetchpriority="high">`).
   - Provide `width` and `height` on every `<img>`.
   - Set `aspect-ratio` on image wrappers.
   - Preload Latin WOFF2 variable fonts in `BaseLayout.astro`.
   - Stack carousel slides in CSS Grid (`grid-template-areas: "slide"`) to eliminate CLS.
3. **Audit Rule**:
   - Never audit Core Web Vitals on `npm run dev`. Always test against `npm run build` / `npm run preview`.

---

## 6. Verification Checklist

Before reporting completion on any build or refactor, you MUST execute:
- [ ] `npm run test:contrast` (0 WCAG 2.2 AA contrast violations)
- [ ] `npm run check` (0 errors, 0 warnings, 0 hints)
- [ ] `npm run build` (Successful static pre-render)
- [ ] `npm run test:a11y` (0 WCAG 2.2 AA violations)
