# Astro Site Playbook

This playbook is the human-readable source of truth for building and adapting sites from this repository. It records the reasoning that should remain stable across projects, the conventions that make this starter coherent, and the current implementation choices that may be replaced.

`AGENTS.md` and `CLAUDE.md` are agent entry points, not independent specifications. If an adapter conflicts with this playbook, follow this playbook. A direct project requirement or an explicit user decision takes precedence over a default documented here, provided the resulting site still meets its accessibility, security, and quality obligations.

## Three layers of guidance

The repository deliberately separates three kinds of guidance:

1. **Principles** describe the outcomes every site should protect. They are independent of a particular hosting or form provider.
2. **Repository conventions** keep work in this Astro starter consistent. Change them deliberately and update the playbook and automated checks together.
3. **Implementation defaults** are replaceable starting points, such as Cloudflare Pages, Mailgun, Turnstile, the sample fonts, and the example domain. They are not universal requirements.

The current boundaries and replacement points are listed in [Architecture and implementation defaults](architecture.md).

## Principles

### Start with the smallest viable architecture

- Prefer static output and build-time work when the requirements do not need a server.
- Add browser JavaScript as progressive enhancement, not as a prerequisite for reading content or completing a core task.
- Introduce a framework runtime, server rendering, or an external service only when a named requirement justifies it.

### Make semantics and accessibility part of the design

- Use native HTML landmarks and controls before recreating their behaviour.
- Preserve keyboard operation, visible focus, useful labels, meaningful heading order, and assistive-technology feedback.
- Treat WCAG 2.2 Level AA as the minimum acceptance target, not a final audit added after implementation.

### Express the design as a system

- Separate visual primitives from semantic design roles.
- Make components consume semantic tokens so a brand or token source can change without rewriting components.
- Use a consistent naming and layout methodology so component boundaries remain legible to both people and tools.

See [Design system and CSS](design-system.md) for the repository contract.

### Model content by meaning and lifecycle

- Choose storage based on how editors maintain content, whether entries need individual URLs, and whether rich prose is required.
- Validate structured content at build time.
- Make editorial ordering explicit whenever sequence affects meaning or presentation.

See [Content modelling](content-modeling.md) for the decision model and required human decision gate.

### Protect performance and privacy by default

- Keep the browser payload and third-party runtime requests intentional and reviewable.
- Prevent avoidable layout shifts and make the likely largest-contentful asset discoverable early.
- Self-host production media and fonts unless a project decision establishes a different privacy and performance policy.
- Measure production output rather than drawing conclusions from the development server.

See [Quality, accessibility, performance, and privacy](quality.md).

### Keep consequential choices visible

Do not silently turn ambiguous design content into a permanent information architecture or connect a form to a delivery provider. Pause at the decision gates in the content and forms guides when requirements do not settle the choice. Record a chosen departure from the starter defaults in project documentation.

### Finish with evidence

A change is complete only when the relevant behaviour has been inspected and the full repository verification pipeline passes. If a check cannot run, report the exact command, reason, and remaining risk rather than treating the check as passed.

## Delivery workflow

### 1. Discover

- Read the project brief, existing implementation, and this playbook before changing architecture.
- Identify the content types, interactive features, external services, likely performance-critical assets, and accessibility risks.
- Distinguish an explicit requirement from an assumption inherited from the starter.

### 2. Decide

- Classify content with the model in [Content modelling](content-modeling.md).
- Resolve any ambiguous entity and form-handling decisions with the project owner.
- Confirm which implementation defaults remain appropriate.

### 3. Model

- Establish content schemas and ordering before building repeated interfaces.
- Establish or ingest design tokens before styling components.
- Define the no-JavaScript path before adding enhanced browser behaviour.

### 4. Build

- Create semantic Astro markup with scoped component styles.
- Follow the BEM, semantic-token, and logical-property contracts.
- Keep assets local and dimensions explicit.
- Add only the client-side behaviour needed to improve the baseline experience.

### 5. Verify

Run the full pipeline from the repository root:

```bash
npm test
```

This covers the token contract, semantic colour contrast, Astro/TypeScript diagnostics, the static production build, and the automated accessibility audit. Review the generated experience manually when a change affects interaction, content structure, responsive layout, or visual output; automation is necessary but not sufficient.

## Definition of done

- Requirements and any consequential architecture decisions are recorded.
- Content is stored and validated according to its editorial purpose.
- Markup remains semantic and the core journey works without client-side JavaScript unless the requirement makes that impossible.
- Components use semantic tokens, BEM naming, and logical properties.
- Keyboard, focus, labelling, validation, status messaging, and heading structure have been considered.
- Production assets are local, dimensioned, and appropriately prioritised.
- External runtime services are intentional and documented.
- `npm test` passes, and relevant manual checks are complete.
- Documentation changes with the architecture, so the playbook, starter, and adapters do not drift.

## Supporting guides

- [Getting started](getting-started.md)
- [Customising a project](customization.md)
- [Architecture and implementation defaults](architecture.md)
- [Design system and CSS](design-system.md)
- [Content modelling](content-modeling.md)
- [Forms and submissions](forms.md)
- [Quality, accessibility, performance, and privacy](quality.md)
- [Cloudflare Pages and Mailgun contact form](recipes/cloudflare-mailgun-contact.md)
- [Releasing](releasing.md)
