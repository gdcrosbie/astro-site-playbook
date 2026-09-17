# Getting started

Astro Site Playbook is both a working Astro project and a delivery methodology. Start from the repository, confirm the baseline passes, then replace its decisions deliberately rather than stripping files at random.

## Prerequisites

- Node.js 22.13 or newer
- npm
- Git

The repository includes `.nvmrc`; run `nvm use` if you manage Node versions with nvm.

## Create a site from the template

On GitHub, select **Use this template**, then **Create a new repository**. Clone the new repository GitHub creates, then install and verify it:

```bash
git clone https://github.com/YOUR-ACCOUNT/my-astro-site.git
cd my-astro-site
npm install
npm test
npm run dev
```

Alternatively, create and clone the new repository with the GitHub CLI:

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

Choose `--public` instead if the new repository should be public.

To explore the playbook without starting a new project, clone it directly:

```bash
git clone https://github.com/gdcrosbie/astro-site-playbook.git
cd astro-site-playbook
npm ci
npm test
```

Fork the repository only when you intend to contribute a change back to Astro Site Playbook.

## Understand the three parts

1. `src/` and `public/` are the runnable reference implementation.
2. `docs/playbook.md` and its supporting guides explain the decisions behind it.
3. `AGENTS.md`, `CLAUDE.md`, and `skills/astro-site-builder/SKILL.md` help coding agents apply the same source of truth.

The playbook is authoritative. The agent files should remain concise adapters.

In a site created from the template, the guides are reference material rather than part of your project. [Customising a project](customization.md#2-starter-documentation-and-updates) records the starter release you began from, removes the local copies, and links your agent files to the guides at that release. Your repository then keeps only its own decisions.

## Make the first decisions

Before building pages, decide:

- the production domain and deployment host;
- whether the included content patterns match the site's editorial needs;
- whether a contact form is required and which delivery model from [Forms and submissions](forms.md) fits (such as the [Cloudflare Pages and Mailgun recipe](recipes/cloudflare-mailgun-contact.md));
- whether to bring an existing token system, translate a design source, or start with the sample tokens;
- which content, fonts, media, and metadata are placeholders.

Use the decision gates in [Content modelling](content-modeling.md) and [Forms and submissions](forms.md) rather than inferring permanent architecture from a mock-up.

## Replace the launch placeholders

Follow [Customising a project](customization.md). It covers identity, starter documentation and updates, canonical URLs, metadata, tokens, fonts, content, forms, external services, and deployment behaviour.

## Verify continuously

Run focused checks while working and the complete suite before declaring a milestone complete:

```bash
npm test
```

The suite checks documentation links, design tokens, semantic contrast, Astro and TypeScript diagnostics, the production build, the default social image, and built-page accessibility.

Before a release or substantial template restructuring, also verify the adoption path in an isolated temporary copy:

```bash
npm run test:template
```
