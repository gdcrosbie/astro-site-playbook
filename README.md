# Astro Site Playbook

An opinionated system for delivering accessible, high-performance, content-led Astro websites—with people and coding agents working from the same source of truth.

It combines a runnable static starter, a human-readable delivery playbook, a repository-local agent skill, and automated quality gates. The goal is not simply to start an Astro project quickly; it is to keep design translation, content architecture, accessibility, performance, privacy, and implementation decisions coherent through delivery.

## What this repository contains

| Part | Role |
| --- | --- |
| **Starter** | A working Astro site with static output, content collections, semantic tokens, accessible components, SEO metadata, RSS, sitemap, and a reference contact flow. |
| **Playbook** | `docs/playbook.md` defines the principles, workflow, decision gates, and definition of done. |
| **Focused guides** | Detailed contracts for architecture, design systems, content modelling, forms, quality, setup, and customisation. |
| **Agent adapters** | `AGENTS.md`, its `CLAUDE.md` symlink, and `skills/astro-site-builder/SKILL.md` route agents to the canonical guidance. |
| **Verification** | CI and local checks cover documentation, tokens, contrast, types, builds, social metadata, forms, and accessibility. |

## Who it is for

Astro Site Playbook is suited to developers, designers, freelancers, and small teams delivering mostly static marketing, editorial, portfolio, brochure, documentation, or content-rich sites—especially when coding agents participate in the work.

It is intentionally opinionated: static-first Astro, progressive enhancement, BEM, CSS logical properties, semantic OKLCH tokens, structured content, WCAG 2.2 AA, local production assets, and explicit human decision gates.

## When not to use it

Choose another foundation when the primary requirement is a highly stateful application, authenticated dashboard, real-time collaboration product, server-rendered personalisation system, or a client-framework architecture that deliberately conflicts with these conventions.

The playbook can still inform those projects, but this starter should not be forced into a role it was not designed to fill.

## Start a new site

Requirements: Node.js 22.13 or newer, npm, and Git.

On GitHub, select **Use this template**, then **Create a new repository**. This creates a separate project from the playbook without carrying its development history into the new site.

The equivalent GitHub CLI workflow is:

```bash
gh repo create my-astro-site \
  --template gdcrosbie/astro-site-playbook \
  --private \
  --clone
cd my-astro-site
npm install
npm test
npm run dev
```

Use `--public` if the new repository should be public. See [Getting started](docs/getting-started.md) for the first architecture decisions, then work through [Customising a project](docs/customization.md) before launch.

Clone this repository directly when you only want to evaluate the playbook locally. Fork it when you intend to contribute a change back to Astro Site Playbook.

## How the playbook works

Guidance is deliberately split into three layers:

1. **Principles** protect outcomes such as accessibility, progressive enhancement, privacy, performance, and evidence-based completion.
2. **Repository conventions** keep this implementation coherent: Astro static output, BEM, logical properties, semantic tokens, validated content, and npm-based verification.
3. **Implementation defaults** are replaceable examples: Cloudflare Pages, Mailgun, Turnstile, the sample fonts and palette, and `example.com`.

The [Astro Site Playbook](docs/playbook.md) is canonical. Agent files are adapters, not parallel copies.

## Documentation

| Guide | Use it for |
| --- | --- |
| [Getting started](docs/getting-started.md) | Creating a site and making the first decisions. |
| [Customising a project](docs/customization.md) | Replacing identity, content, tokens, metadata, services, and launch placeholders. |
| [Architecture and defaults](docs/architecture.md) | Distinguishing binding conventions from replaceable technology choices. |
| [Design system and CSS](docs/design-system.md) | Tokens, OKLCH, BEM, logical properties, container scales, and design ingestion. |
| [Content modelling](docs/content-modeling.md) | Choosing among editorial prose, entities, repeaters, and global singletons. |
| [Forms and submissions](docs/forms.md) | Provider-independent form and accessibility contracts. |
| [Quality](docs/quality.md) | Accessibility, performance, privacy, automated checks, and manual verification. |
| [Cloudflare Pages and Mailgun recipe](docs/recipes/cloudflare-mailgun-contact.md) | Configuring, replacing, or removing the included contact delivery reference. |
| [Releasing](docs/releasing.md) | Running the release audit, publishing a tag, and creating release notes. |

## Included implementation

- Astro static output with no client-framework runtime.
- Astro Content Layer examples for Markdown prose and JSON repeaters.
- Two-tier fluid design tokens: viewport scales for the page and container scales for components.
- Scoped Astro component styles using BEM and logical properties.
- Self-hosted variable fonts and a verified 1200×630 default social image.
- Canonical, Open Graph, Twitter Card, sitemap, RSS, robots, and 404 foundations.
- Accessible contact UI with shared browser/server validation and non-JavaScript outcomes.
- A Cloudflare Pages Function, Mailgun delivery, and optional Turnstile as a reference recipe.

The contact provider and deployment host are not universal requirements. No production destination or provider credentials are configured automatically.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run preview` | Preview the production build. |
| `npm run check` | Run Astro and TypeScript diagnostics. |
| `npm run build` | Build the static production output. |
| `npm run test:docs` | Verify local documentation links. |
| `npm run test:tokens` | Verify the design-token contract. |
| `npm run test:contrast` | Check configured semantic colour pairings. |
| `npm run test:discovery` | Check canonical, article, noindex, sitemap, and RSS metadata. |
| `npm run test:social-image` | Check the built default social image and dimensions. |
| `npm run test:forms` | Test built form semantics and endpoint behaviour. |
| `npm run test:a11y` | Run the axe-core audit against built HTML. |
| `npm run test:template` | Install and test a clean temporary copy of the repository. |
| `npm test` | Run the complete verification pipeline. |

## Project shape

```text
astro-site-playbook/
├── docs/                       # Canonical playbook, guides, and recipes
├── functions/api/contact.ts    # Optional Cloudflare Pages contact endpoint
├── public/                     # Local assets, robots, and host header reference
├── scripts/                    # Deterministic quality checks
├── skills/astro-site-builder/  # Thin repository-local agent skill
├── src/
│   ├── components/             # Astro components with scoped styles
│   ├── content/                # Example editorial and repeater content
│   ├── layouts/                # Root document shell and metadata
│   ├── lib/                    # Shared implementation logic
│   ├── pages/                  # Static routes, RSS, and form outcomes
│   └── styles/                 # Reset, tokens, and global layout rules
├── AGENTS.md                   # Concise agent adapter
└── CLAUDE.md                   # Relative symlink to AGENTS.md
```

## Working with coding agents

Agents should begin with `AGENTS.md`. Skill-aware environments can use `skills/astro-site-builder/SKILL.md`. Both route into the same human-readable playbook and supporting guides, preventing tool-specific instruction drift.

When adapting this repository, keep universal principles separate from project conventions and replaceable defaults. Record consequential choices, use the content and form decision gates, and run `npm test` before reporting completion.

## Adapting it for an agency

The public template may be all your agency needs. If you want to turn existing conventions, review practices, and delivery constraints into a bespoke playbook and working foundation, I can help you establish and test that system with your team.

[See how I adapt Astro Site Playbook for agencies](https://grahamcrosbie.com/astro-site-playbook/).

## License

The Astro Site Playbook's starter framework, verification scripts, and playbook documentation are licensed under the [MIT License](LICENSE). When a project retains copies or substantial portions of that material, it must also retain the upstream copyright and permission notice required by the MIT License.

Anything original that adopters, agencies, or their clients create while building on this foundation belongs 100% to them, subject to their own agreements. This includes original design tokens, custom components, schemas, editorial content, and brand assets. The Playbook claims no ownership over that project-specific work.

Adopters have full freedom to license finished sites and client deliverables under any proprietary or open-source terms they choose. Using the Playbook does not require the finished site, or original work created for it, to be released under the MIT License; the upstream MIT notice only continues to apply to Playbook material retained in the project.

Release history is recorded in [CHANGELOG.md](CHANGELOG.md).
