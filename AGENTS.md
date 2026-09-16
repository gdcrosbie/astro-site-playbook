# Agent adapter: Astro Site Playbook

This file is the short operational entry point for coding agents. The canonical human-readable methodology is [docs/playbook.md](docs/playbook.md); read it and the relevant linked guide before making changes. `CLAUDE.md` intentionally points to this same adapter so agent-specific instructions cannot drift.

## Instruction order

1. Follow explicit project requirements and user decisions.
2. Follow [docs/playbook.md](docs/playbook.md) and its supporting guides.
3. Treat documented implementation defaults as replaceable only when requirements justify a change.
4. Keep this adapter concise; put durable methodology in `docs/`, not here.

Do not weaken accessibility, security, privacy, or validation obligations when replacing a default. Record consequential architecture decisions and update affected documentation and checks with the implementation.

## Repository workflow

- Use `npm`; `package-lock.json` is authoritative.
- Inspect the relevant implementation and documentation before editing.
- Preserve static output and vanilla progressive enhancement unless an explicit requirement calls for another architecture.
- Keep components in `src/components/*.astro` with scoped styles; reserve global styles for resets, document defaults, tokens, and shared layout objects.
- Keep secrets out of source and browser bundles.
- Do not change the project identity, providers, or dependencies as an incidental part of another task.

## Required contracts

- Follow [docs/design-system.md](docs/design-system.md): BEM classes, CSS logical properties, OKLCH primitives, semantic aliases in components, and the two-tier fluid scale. Do not add Tailwind-style utility markup or inline styles.
- Follow [docs/content-modeling.md](docs/content-modeling.md): use the four-pattern content model, validate schemas, add explicit ordering where sequence matters, and stop at the ambiguous-entity decision gate.
- Follow [docs/forms.md](docs/forms.md): stop at the form-handling decision gate, preserve a non-JavaScript path, validate server-side, and implement accessible field and status feedback.
- Follow [docs/quality.md](docs/quality.md): WCAG 2.2 AA, local production assets, intentional external requests, production-build performance checks, and manual verification where automation is insufficient.
- Use [docs/architecture.md](docs/architecture.md) to distinguish repository conventions from replaceable defaults such as Cloudflare Pages, Mailgun, Turnstile, sample fonts, and the example domain.
- Follow [docs/hosting.md](docs/hosting.md): confirm the deployment host, keep only the configuration that host reads, verify headers against the live deployment, and apply every layer when a site must not be indexed.

## Commands

```bash
npm run dev          # local development server
npm run preview      # preview the production build
npm run test:docs    # local documentation links
npm run test:tokens  # token contract
npm run test:contrast
npm run check
npm run build
npm run test:discovery
npm run test:social-image
npm run test:a11y
npm run test:template # isolated release/adoption check
npm test             # complete verification pipeline
```

Before reporting a build or refactor complete, run `npm test`. If any check cannot run or fails, report the exact failure and remaining risk.
