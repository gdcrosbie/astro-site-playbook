---
name: astro-site-builder
description: Build or adapt static Astro sites derived from this repository using its canonical playbook. Use for design translation, component construction, content modelling, forms, accessibility, performance, or verification work in the Astro starter; do not use as generic Astro documentation for unrelated architectures.
---

# Astro Site Builder

Apply this repository's playbook without duplicating it.

## Start with the source of truth

Read [the Astro Site Playbook](../../docs/playbook.md), then read only the supporting guides relevant to the task:

- architecture or provider changes: [architecture.md](../../docs/architecture.md)
- tokens, styling, or design translation: [design-system.md](../../docs/design-system.md)
- collections, schemas, or editorial structure: [content-modeling.md](../../docs/content-modeling.md)
- forms or external submission services: [forms.md](../../docs/forms.md)
- accessibility, performance, privacy, or completion checks: [quality.md](../../docs/quality.md)

The guides own the rules. If this skill and the playbook diverge, follow the playbook and repair the skill link or summary rather than copying the missing rule here.

## Apply the playbook

1. Inspect the brief and current implementation. Separate explicit requirements from starter defaults.
2. Resolve the content and form decision gates when the requirements leave a consequential choice open.
3. Preserve the repository contracts relevant to the work: static-first delivery, progressive enhancement, semantic Astro markup, scoped BEM styles, logical properties, semantic tokens, validated content, and accessible interaction.
4. Treat Cloudflare Pages, Mailgun, Turnstile, sample fonts, colours, and the example domain as replaceable defaults. Replace them only for a stated project reason and retain equivalent security, privacy, accessibility, and verification outcomes.
5. Keep the core journey useful without browser JavaScript unless the requirement makes that impossible.
6. Update the canonical guide when an architecture decision changes the methodology. Keep agent adapters and this skill short.
7. Run `npm test` before reporting completion, plus relevant manual checks from the quality guide. Report any check that cannot run and its remaining risk.

Do not rename the project, change providers, introduce a client framework, or add dependencies incidentally. Those are visible project decisions, not implementation shortcuts.
