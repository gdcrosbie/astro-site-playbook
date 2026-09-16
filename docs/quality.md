# Quality, accessibility, performance, and privacy

Quality is a continuous constraint in this playbook. Automated checks protect known contracts; targeted manual review covers behaviour and visual outcomes those checks cannot prove.

## Accessibility baseline

- Target WCAG 2.2 Level AA.
- Use semantic landmarks, a logical heading structure, native controls, and a skip link where repeated navigation warrants one.
- Ensure all interactive behaviour works from a keyboard and has a visible focus state.
- Give controls accessible names and relationships; announce dynamic status changes appropriately.
- Provide text alternatives for meaningful images and hide decorative imagery from assistive technology.
- Respect reduced-motion preferences when motion is introduced.
- Apply the detailed form requirements in [Forms and submissions](forms.md).

## Performance baseline

- Treat a Lighthouse score as a diagnostic signal, not the definition of performance. Aim for strong Core Web Vitals on representative devices and networks.
- Always assess production output from `npm run build` and `npm run preview`, never the development server.
- Give every image intrinsic `width` and `height` and reserve its aspect ratio in layout.
- Preload only the likely LCP image and set its priority deliberately; do not preload every prominent asset.
- Self-host and subset fonts, preload only critical WOFF2 files, and avoid unnecessary weights.
- Keep client JavaScript minimal and scoped to interactions that need it.
- For overlapping interfaces such as carousels, reserve a stable layout area—for example, stack slides in one CSS Grid area—to avoid cumulative layout shift.
- When an image fills a fixed-height or absolutely positioned frame, size the `<picture>` wrapper as well as the image and clip the frame. The reset makes `<picture>` a block with automatic height, so an image with `block-size: 100%` otherwise renders at its natural height and can overflow onto the next section.

The playbook does not promise a universal 95–100 score. Pages, devices, content, and third-party requirements vary; record and investigate regressions against an agreed project baseline.

## Privacy and external assets

- Store production images in `public/images/` or process them through an equivalent local asset pipeline; do not hotlink third-party media.
- Prefer modern, appropriately compressed formats such as WebP or AVIF where browser and content requirements allow.
- Self-host fonts rather than loading them from a third-party CDN.
- Treat every external runtime request—including analytics, embeds, form providers, and bot protection—as an explicit project decision.
- Keep secrets in the deployment platform's environment configuration, never in committed files or client bundles.

## Automated verification

Use standard `npm`; do not switch package managers without an explicit project decision.

| Command | Purpose |
| --- | --- |
| `npm run test:docs` | Checks that local documentation links resolve. |
| `npm run test:tokens` | Checks the required token contract. |
| `npm run test:contrast` | Checks configured semantic colour pairs for WCAG AA contrast. |
| `npm run check` | Runs Astro content, TypeScript, and template diagnostics. |
| `npm run build` | Produces the static site and catches build-time integration failures. |
| `npm run test:discovery` | Checks canonical, article, noindex, sitemap, and RSS metadata. |
| `npm run test:social-image` | Checks the built default Open Graph image and its dimensions. |
| `npm run test:forms` | Checks built form semantics and the submission endpoint contract. Available only after adding the [contact form recipe](recipes/cloudflare-mailgun-contact.md); not part of the default `npm test`. |
| `npm run test:a11y` | Audits the built HTML with axe-core. |
| `npm run test:template` | Installs and tests an isolated copy for release-level adoption checks. |
| `npm test` | Runs the default checks above in repository order (excluding `test:template`, and `test:forms` unless a project adds it). |

Run `npm test` before reporting a build or refactor complete. If a failure predates the current change, do not hide it: identify the failure, show that the change did not worsen it where possible, and record the remaining risk.

Run `npm run test:template` before releases or substantial changes to the repository's starter structure. It is intentionally separate from the ordinary suite because it performs a second clean dependency installation and complete test run.

## Manual verification

Add focused manual checks when a change affects:

- keyboard order, focus movement, validation, or live announcements;
- responsive or container-query layout;
- image loading, font loading, or likely LCP content;
- no-JavaScript journeys;
- provider-backed forms and their success, error, and abuse-protection paths;
- canonical, sitemap, RSS, or social metadata;
- deployment headers, redirects, 404 behaviour, or indexing controls. Verify these against the live production domain as described in [Hosting, headers, and indexing](hosting.md#verify-the-live-deployment).

Use the repeatable project-level process in [Releasing](releasing.md) before publishing a repository release.
