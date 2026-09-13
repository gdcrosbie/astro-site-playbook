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

## 4. Content Modeling Strategy (Astro Content Layer)

Dynamic content must be modeled according to the **4-Tier Content Decision Tree**:

| Pattern | Storage Structure | Astro 7 Loader | When to Use |
| :--- | :--- | :--- | :--- |
| **Pattern A: Editorial Prose** | `src/content/<name>/*.md` | `glob({ pattern: '**/*.md' })` | Articles, blog posts, case studies, rich documentation with Markdown body and dedicated URLs (`/writing/[slug]`). |
| **Pattern B: Entity Records** | `src/content/<name>/*.yaml` | `glob({ pattern: '**/*.yaml' })` | Modular entities (Services, Case Studies, Team) that have dedicated detail pages (`/services/[slug]`) or will be managed individually via a Git CMS. Prefer YAML for clean multiline text without JSON escaping. |
| **Pattern C: In-Page Repeaters** | `src/content/<name>.json` | `file('src/content/<name>.json')` | Cohesive, in-page repetitive components (stats tickers, feature grids, pricing tiers, FAQs) that live on a single page and do **not** have individual URLs. |
| **Pattern D: Global Singletons** | `src/data/site.json` | Direct ESM import (`import site from '../data/site.json'`) | Static site identity, company number, phone, navigation hierarchy, social links that don't need Zod collection querying. |

### The "Stop & Ask" Decision Gate
Before authoring `src/content.config.ts` or creating content files:
1. **Auto-classify** obvious repeaters (stats, trust badges) as Pattern C, and global settings (phone, nav) as Pattern D.
2. **Ambiguous Entities Gate**: When encountering **Services, Projects, Case Studies, Testimonials, or Team Members**, you MUST stop and ask the user:
   > *"I detected [Services] in the design. Should we implement these as:*
   > *1. (Recommended) Pattern B (`src/content/services/*.yaml`) with dedicated detail pages / CMS compatibility?*
   > *2. Pattern C (`src/content/services.json`) as in-page data only?*
   > *3. Pattern A (`src/content/services/*.md`) with full long-form markdown bodies?"*

### Ordering Rule (Crucial)
Astro's internal store indexes entries by ID and sorts alphabetically by default. Where visual order matters:
1. Always provide `"order": number` in JSON entries or `order: number` in YAML records.
2. Always add `order: z.number().default(0)` to the Zod schema in `src/content.config.ts`.
3. Sort explicitly in components:
   ```astro
   const items = (await getCollection('<name>')).map(e => e.data).sort((a, b) => a.order - b.order);
   ```

### RSS Syndication for Pattern A
When implementing **Pattern A (Editorial Prose)**:
1. Always provide an automated RSS 2.0 feed using `@astrojs/rss` at `src/pages/rss.xml.ts`.
2. Ensure `site: 'https://example.com'` is set in `astro.config.mjs` for absolute canonical URLs.
3. Include auto-discovery in `BaseLayout.astro`: `<link rel="alternate" type="application/rss+xml" title={title} href={new URL('rss.xml', Astro.site)} />`.

---

## 5. Forms & Submissions Architecture

Astro static builds (`output: 'static'`) have no server backend. Form handling must follow these rules:

1. **Recommended Baseline**: Cloudflare Pages Native Functions (`functions/api/contact.ts`) + Mailgun REST API:
   - Astro remains 100% static; Cloudflare automatically mounts `functions/api/*` as an edge Worker.
   - Mailgun credentials (`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_REGION`) are stored securely in Cloudflare Pages environment variables.
2. **3-Layer Anti-Spam Architecture**:
   - **Layer 1 (Honeypot `_hp`)**: Hidden from users and assistive tech (`aria-hidden="true"`, `tabindex="-1"`). If populated, silently drop and return a fake success response.
   - **Layer 2 (Timestamp `_timestamp`)**: Compare submission time against page render time. If `< 2` seconds, silently drop.
   - **Layer 3 (Cloudflare Turnstile)**: Privacy-preserving challenge. Zero Google reCAPTCHA scripts or tracking cookies.
3. **Dual Response (Progressive Enhancement)**:
   - Baseline HTML `<form method="POST" action="/api/contact">` responds with `303 See Other` redirect to `/contact/success` or `/contact/error`.
   - Client JS submits via `fetch()` with `Accept: application/json` for in-place JSON response `{ success: true }`.
4. **The Form "Stop & Ask" Decision Gate**:
   When encountering a form in a design, STOP and ask the user:
   > *"I detected a [Contact Form] in the design. How would you like submissions handled?*
   > *1. (Recommended) Cloudflare Pages Function + Mailgun (`functions/api/contact.ts` with 3-layer anti-spam)?*
   > *2. Hosted Static Endpoint (Formspree / Web3Forms / Basin)?*
   > *3. Webhook to CRM / Automation (Make / Zapier / n8n / HubSpot)?*
   > *4. UI-Only / Mock (accessible frontend with simulated submission)?"*
5. **Accessibility Standards (WCAG 2.2 AA)**:
   - Explicit `<label for="...">` on every field (never placeholder-only).
   - Validation states: `aria-invalid="true"` and `aria-describedby="[field]-error"`.
   - On failed submission, programmatic keyboard focus moves to the first invalid input.
   - Live announcements via `<div role="status" aria-live="polite">`.

---

## 6. Performance & GDPR Rules

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

## 7. Verification Checklist

Before reporting completion on any build or refactor, you MUST execute:
- [ ] `npm run test:tokens` (Conforms to token contract)
- [ ] `npm run test:contrast` (0 WCAG 2.2 AA contrast violations)
- [ ] `npm run check` (0 errors, 0 warnings, 0 hints)
- [ ] `npm run build` (Successful static pre-render)
- [ ] `npm run test:a11y` (0 WCAG 2.2 AA violations)
