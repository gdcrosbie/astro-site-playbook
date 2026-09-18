# Design system and CSS

This is the styling contract for the starter. It turns the broader playbook principles into repository-specific rules.

## Source and layers

`src/styles/tokens.css`, imported by `src/styles/global.css`, is the token source of truth.

Keep two layers distinct:

- **Primitives** describe raw choices such as palette values, typefaces, radii, and scale steps.
- **Semantic aliases** describe intent, such as `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-primary`, `--color-accent`, `--color-success`, `--color-error`, and `--border-subtle`.

Components must consume semantic aliases and shared scale tokens. They must not depend directly on brand-system primitive names such as `--primary` or `--base-dark`, or introduce one-off colour literals where a semantic role is needed.

## Colour contract

- Author colour primitives in native `oklch(L C H)` form.
- Do not introduce hex or RGB colour definitions in token or component stylesheets.
- Derive related tones with relative colour syntax where appropriate.
- Maintain WCAG 2.2 AA contrast: at least 4.5:1 for normal text and 3:1 for large text and applicable UI graphics.
- Run `npm run test:tokens` and `npm run test:contrast` immediately after token changes.

OKLCH improves the predictability of lightness adjustments, but the colour format alone does not guarantee accessible contrast; the automated check remains authoritative for the token pairs it covers.

## Fluid scales

The starter uses two responsive tiers:

1. **Viewport scales (`vw`)** for page sections, layout gutters, document text, and page headings: `--text-*`, `--h1` through `--h4`, `--space-*`, and `--gutter`.
2. **Container scales (`cqi`)** for reusable components inside grids, sidebars, and other variable-width contexts: `--cq-text-*`, `--cq-h3`, `--cq-card-padding`, and `--cq-gap`.

Components using container units must establish or inherit a deliberate query container. The existing card establishes that context with `:has(> .c-card) { container-type: inline-size; }`; use the pattern only where the parent relationship is appropriate.

## Pointer targets

Standalone controls draw their minimum size from the target scale rather than from
padding alone, so the hit area survives changes to type size and spacing:

- `--target-touch` (44px) for icon buttons, toggles, and other isolated controls.
- `--target-touch-large` (48px) for stacked rows whose neighbours are immediately
  adjacent, such as drawer and menu items.

Apply them with `min-block-size` and `min-inline-size`, not fixed sizing, so a
control can still grow with its content. Links inline in running text are exempt
from WCAG 2.2 SC 2.5.8 and take no minimum; adding one breaks the line box.

## CSS architecture

- Use BEM names for component and layout classes: `.c-block`, `.c-block__element`, `.c-block--modifier`, `.l-section`, and `.l-container`.
- Keep component styles in the component's scoped `<style>` block. Put resets, global element defaults, shared layout objects, and truly global behaviour in `src/styles/`.
- Do not add Tailwind-style utility markup or inline `style` attributes.
- Prefer shared tokens to unexplained magic numbers. A one-off value is acceptable when it represents intrinsic behaviour rather than a missing design decision.
- Prefer `text-wrap: pretty` for large display headings translated from a design. `text-wrap: balance` shortens every line and can break headings differently from the approved layout; reserve it for short, centred headings.
- A class passed to a child component (`<ButtonGroup class="c-hero__actions">`) lands on the child's root element, which does not carry the parent's style scope, so a rule for it in the parent's `<style>` never applies. Target it from the parent with `:global()` (for example `.c-hero__text > :global(.c-hero__actions)`) or expose a prop.
- A design tool's inside stroke does not change an element's size, but a CSS `border` does. Where the rendered size must match, draw the stroke as an inset outline (`outline: 2px solid; outline-offset: -2px`) and keep the width in a token.
- Convert design letter spacing given in pixels to `em` for headings whose size is fluid, so the tracking scales with the text. Small labels with fixed sizes can keep pixel values.

## Logical properties

Use flow-relative CSS so layouts continue to work across writing modes and directions:

- `padding-block` and `padding-inline` instead of physical padding sides;
- `margin-block` and `margin-inline` instead of physical margin sides;
- `inline-size`, `block-size`, `max-inline-size`, and `min-block-size` instead of physical sizing;
- `inset`, `inset-block-start`, and `inset-inline-start` instead of physical positioning.

A physical direction is acceptable only when the design requirement is genuinely physical rather than flow-relative; document that exception near the rule.

## Token ingestion paths

Choose one path before styling components.

### Bring your own tokens

1. Place the supplied token file at `src/styles/tokens.css`.
2. Add a semantic alias bridge mapping its primitives to this starter's semantic roles.
3. Run `npm run test:tokens` and `npm run test:contrast`.

### Translate a design source

- If an export provides both rendered HTML and a React implementation, use the HTML as the primary reference for document structure and layout, then reproduce the behaviour in Astro. Do not retain React solely because the export used it.
- Convert incoming sRGB or hex palette values to OKLCH primitives.
- A design file may define no variables or styles. Derive primitives from the fills and text styles actually used, record each source value beside its OKLCH equivalent, and state that the tokens were extracted rather than imported.
- Confirm typefaces from supplied font files and their licences rather than from names reported by design tooling, which can be truncated or mis-encoded.
- Establish viewport and container scales appropriate to the actual layout before building components.

### Use the template baseline

Keep the included `src/styles/tokens.css` unchanged until project branding is available.
