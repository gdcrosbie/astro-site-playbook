# Content modelling

Choose content storage by editorial meaning and lifecycle, not by whichever file format is quickest during implementation.

## Decision model

| Pattern | Storage | Astro loader | Use when |
| --- | --- | --- | --- |
| **A: Editorial prose** | `src/content/<name>/*.md` | `glob({ pattern: '**/*.md' })` | Entries contain rich prose and have dedicated URLs, such as articles, case studies, or documentation. |
| **B: Entity records** | `src/content/<name>/*.yaml` | `glob({ pattern: '**/*.yaml' })` | Structured entities have dedicated pages or are likely to be managed individually in a Git-based CMS, such as services, projects, or team members. |
| **C: In-page repeaters** | `src/content/<name>.json` | `file('src/content/<name>.json')` | A cohesive repeated set belongs to one page and its items do not need individual URLs, such as stats, feature grids, pricing tiers, or FAQs. |
| **D: Global singletons** | `src/data/site.json` | Direct ESM import | One site-wide record contains identity, contact details, navigation, or social links and does not benefit from collection queries. |

File formats are conventions, not goals. If a project's editing workflow requires another supported source, retain the same semantic distinction and schema validation.

## Required decision gate

Classify obvious repeaters as Pattern C and obvious global settings as Pattern D.

When a design includes ambiguous entities—especially services, projects, case studies, testimonials, or team members—and the requirements do not say whether they need detail pages or long-form bodies, ask the project owner to choose among:

1. Pattern B records with dedicated pages and CMS-friendly structured fields (the usual recommendation).
2. Pattern C in-page data only.
3. Pattern A entries with long-form Markdown bodies.

Do not create a permanent route or content architecture from visual repetition alone.

## Schema and ordering rules

- Define every collection in `src/content.config.ts` and validate the fields the UI relies on.
- Add `order: z.number().default(0)` wherever editorial sequence matters.
- Store an explicit `order` value in JSON or YAML entries.
- Sort explicitly at the point where entries are prepared for display:

```astro
const items = (await getCollection('<name>'))
  .map((entry) => entry.data)
  .sort((a, b) => a.order - b.order);
```

Do not rely on filesystem or collection-store ordering.

## Editorial prose and syndication

When Pattern A represents public editorial content:

- provide static detail routes;
- provide an RSS 2.0 feed with `@astrojs/rss` when syndication is part of the content strategy;
- set the production `site` value in `astro.config.mjs` so canonical and feed URLs are absolute;
- include RSS auto-discovery in the base layout.

The included `posts` collection, `[slug].astro`, and `rss.xml.ts` demonstrate this default. RSS is a content-strategy choice for a new collection, not a universal requirement for every structured record.
