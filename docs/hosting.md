# Hosting, headers, and indexing

The starter's static output runs on any host, but response headers, redirects, trailing-slash behaviour, and serverless functions do not transfer between hosts. Each platform reads its own configuration and ignores the rest. This guide covers choosing a host, translating the starter's defaults, verifying the live deployment, and keeping a site out of search when that is a requirement.

## Confirm the host before launch work

The starter's defaults are written for Cloudflare (Workers with Static Assets or Cloudflare Pages):

- `public/_headers` defines caching and security headers;
- the [contact form recipe](recipes/cloudflare-mailgun-contact.md) uses a Cloudflare Pages Function (or a Worker handler).

Treat the host as a project decision and record it. Then keep only the configuration that host reads:

| Host | Headers and redirects | Functions / Worker entry |
| --- | --- | --- |
| **Cloudflare Workers (Static Assets)** | `wrangler.jsonc` + `public/_headers`, `public/_redirects` | Optional `main` in `wrangler.jsonc` (`assets.run_worker_first`) |
| **Cloudflare Pages (Legacy)** | `public/_headers`, `public/_redirects` | `functions/` |
| **Netlify** | `public/_headers` and `public/_redirects`, or `netlify.toml` | `netlify/functions/` |
| **Vercel** | `vercel.json` | `api/` |
| **Other static hosts or CDNs** | Host or CDN configuration outside the repository | Host-specific |

Remove configuration files the chosen host does not use. **Vercel does not apply `public/_headers`: it publishes it as an ordinary file at `/_headers`**, so the site loses its security headers while exposing the intended policy.

## Cloudflare Workers (Static Assets)

Cloudflare's current Git integration (**Compute (Workers) → Workers & Pages → Create application**) deploys Astro sites as **Workers with Static Assets** rather than legacy Cloudflare Pages.

When deploying to Cloudflare Workers, add `wrangler.jsonc` at the repository root (and keep `.wrangler/` in `.gitignore`):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-project-name",
  "compatibility_date": "2026-09-30",
  "workers_dev": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
```

- **Do not omit `wrangler.jsonc`:** When a repository with `"astro"` in `package.json` has no `wrangler.jsonc`, Wrangler 4.68+ runs framework autoconfig during `wrangler deploy`, installs `@astrojs/cloudflare` (converting the static site to SSR), opens a pull request instead of deploying `main`, and leaves the Worker with no active routes (`workers.dev: Disabled`).
- **Omit `main` for purely static sites:** Static Assets natively applies `public/_headers` and `public/_redirects` at the edge without a Worker script. If you add a Worker entrypoint (for example, `src/worker.js` for the [Sveltia CMS GitHub OAuth recipe](recipes/sveltia-cms.md)), scope it with `assets.run_worker_first` (such as `["/auth", "/callback", "/oauth/*"]`) and `binding: "ASSETS"` so static pages continue to be served directly from the edge.

## Translating the default headers

Preserve the behaviour described in [Architecture and implementation defaults](architecture.md): baseline security headers on every response, and long-lived immutable caching for versioned `/_astro/` assets only.

For Vercel, remove `public/_headers` (and any `wrangler.jsonc`) and add an equivalent `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "trailingSlash": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

`trailingSlash: true` redirects `/about` to `/about/`. That matches Astro's directory output and the canonical URLs in `BaseLayout.astro`, so the same page isn't served at two addresses. Vercel serves `dist/404.html` for unknown routes.

If you add a form, keep the provider-independent contract in [Forms and submissions](forms.md) and port the recipe's endpoint to the host's function convention. Don't add a Cloudflare `functions/` directory to a site deployed elsewhere.

## Verify the live deployment

A successful build does not prove that headers, redirects, or error routes behave as intended. After the first production deployment, request the real responses:

```bash
U=https://your-production-domain
for p in / /about /about/ /_headers /robots.txt /does-not-exist/; do
  printf '%-18s ' "$p"
  curl -s -o /dev/null -D - "$U$p" | tr -d '\r' \
    | grep -iE '^HTTP|^location|^x-robots-tag|^x-frame-options|^x-content-type|^cache-control' | tr '\n' '|'
  echo
done
```

Confirm that:

- security headers are present on pages and assets;
- a configuration file for another host, such as `/_headers` on Vercel, returns 404;
- URLs without a trailing slash redirect to the canonical form;
- unknown routes return 404 with the custom page;
- `/_astro/` assets are cached as immutable.

Check the production domain itself. Preview or deployment URLs protected by the host's authentication return a login redirect and hide the site's real headers.

## Sites that must not be indexed

Demonstrations, staging environments, and client previews often must stay out of search. Treat that as a requirement enforced by checks, not a single meta tag, and apply every layer:

1. **Every page is `noindex`.** Add a site-level flag, such as `"indexable": false` in `src/data/site.json`, and have `BaseLayout.astro` emit `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">` whenever the flag is false, not only when a page passes `noindex`.
2. **The response header matches.** Send `X-Robots-Tag` with the same directives from the host configuration, so images, PDFs, and other non-HTML files are covered.
3. **`robots.txt` disallows crawling:**

   ```text
   User-agent: *
   Disallow: /
   ```

4. **No discovery surfaces are published.** Remove `@astrojs/sitemap` and `@astrojs/rss`, their generated files, and their auto-discovery links.

Extend `scripts/test-discovery.cjs` so removing any layer fails the build.

These signals only bind well-behaved crawlers, and they interact. `Disallow: /` stops compliant crawlers from fetching pages, so they never read the page-level `noindex`, and a URL linked from elsewhere can still be listed without content. **None of this makes a site private.** If content must not be seen, use the host's access control, such as deployment protection or password protection applied to the production domain, and state that distinction to the project owner.

For an ordinary public site, keep the starter's defaults: a sitemap, `robots.txt` pointing to it, and `noindex` only on the 404 page and any placeholder routes.
