# Sveltia CMS (Git-based editorial UI)

This recipe adds an optional, zero-dependency browser CMS at `/admin` backed directly by the repository's Git history. It maps onto the four storage patterns in [Content modelling](../content-modeling.md) without changing Astro's build-time validation or introducing a runtime content API.

The starter ships with **no CMS** by default so projects can keep content in Git/IDE workflows or choose a different editorial tool when requirements call for one.

## Choose this recipe when

- non-technical editors need a browser UI to edit posts, structured entities, in-page repeaters, or site settings;
- content should remain committed as Markdown, YAML, and JSON in `src/content/` and `src/data/`, validated at build time by `src/content.config.ts`;
- you want zero npm package overhead or client bundle impact on public pages (the CMS loads only on `/admin`);
- editors working locally in a Chromium-based browser want direct disk editing via the File System Access API during `npm run dev`.

Choose another option when the project requires no editorial UI (keep plain Git/IDE editing), an embedded Astro integration with bespoke React fields (consider Keystatic), or real-time multi-user database workflows and custom editorial roles (consider a hosted headless CMS such as Sanity).

## Implementation

### 1. Admin route

Create `src/pages/admin/index.astro`. Using an `.astro` route rather than a static `public/admin/index.html` file ensures the route works cleanly across every host's trailing-slash and clean-URL settings and passes the repository's `test:a11y` and `test:discovery` checks out of the box:

```astro
---
/**
 * Sveltia CMS admin entry point (/admin).
 * Excluded from search indexing via meta robots and response headers.
 */
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Content Manager</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <main id="nc-root" aria-label="Content Manager">
      <h1 class="sr-only">Content Manager</h1>
    </main>
    <style>
      .sr-only {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    </style>
    <script
      is:inline
      src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"
      type="module"
    ></script>
  </body>
</html>
```

If `@astrojs/sitemap` is enabled in `astro.config.mjs`, exclude `/admin` from the generated sitemap:

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
});
```

Add an explicit `X-Robots-Tag` header for `/admin/*` in `public/_headers` (or the equivalent host configuration in [Hosting, headers, and indexing](../hosting.md)):

```text
/admin/*
  X-Robots-Tag: noindex, nofollow
```

### 2. CMS configuration

Create `public/admin/config.yml` and map each collection to its corresponding pattern in [Content modelling](../content-modeling.md) and schema in `src/content.config.ts`. Always include an explicit `order` field (`widget: number`) on ordered entities and repeaters so editorial sequence remains deterministic:

```yaml
# yaml-language-server: $schema=https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json

backend:
  name: github
  repo: owner/repo-name
  branch: main
  # Omit base_url when using local workflows or Personal Access Token (PAT) sign-in.
  # Set base_url to the site origin when using the Cloudflare Worker OAuth handler below:
  # base_url: https://example.com

media_folder: src/assets/images
public_folder: /src/assets/images

collections:
  # Pattern D — Global singletons (src/data/site.json)
  - name: site_data
    label: Site Configuration
    files:
      - name: site
        label: Global Site Settings
        file: src/data/site.json
        fields:
          - { label: Site Name, name: name, widget: string }
          - { label: Description, name: description, widget: text }

  # Pattern C — In-page repeaters (top-level JSON array via root: true)
  - name: repeaters
    label: Page Sections
    files:
      - name: cards
        label: Feature Cards
        file: src/content/cards.json
        fields:
          - label: Cards
            name: items
            widget: list
            root: true
            summary: '{{fields.order}}. {{fields.title}}'
            fields:
              - { label: ID (Slug), name: id, widget: string }
              - { label: Order, name: order, widget: number, value_type: int, min: 1 }
              - { label: Title, name: title, widget: string }
              - { label: Summary, name: summary, widget: text }

  # Pattern B — Entity records (src/content/<name>/*.yaml)
  # - name: services
  #   label: Services
  #   folder: src/content/services
  #   extension: yaml
  #   create: true
  #   slug: '{{slug}}'
  #   identifier_field: title
  #   summary: '{{order}}. {{title}}'
  #   fields:
  #     - { label: Order, name: order, widget: number, value_type: int, min: 1 }
  #     - { label: Title, name: title, widget: string }
  #     - { label: Summary, name: summary, widget: text }

  # Pattern A — Editorial prose (src/content/posts/*.md)
  - name: posts
    label: Posts
    folder: src/content/posts
    extension: md
    create: true
    slug: '{{slug}}'
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Description, name: description, widget: text }
      - { label: Publish Date, name: pubDate, widget: datetime }
      - { label: Body, name: body, widget: markdown }
```

### 3. Bridging `src/assets/` uploads with Astro `<Image />`

When `media_folder` points inside `src/assets/` so uploaded images benefit from Astro's build-time optimisation, resolve image paths stored in YAML or JSON entries through `import.meta.glob`:

```typescript
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

export function resolveAssetImage(assetPath: string): ImageMetadata {
  const mod = images[assetPath];
  if (!mod) {
    throw new Error(`Missing image in src/assets/images: ${assetPath}`);
  }
  return mod.default;
}
```

## Authentication options

### Option A: Local development (zero configuration)

1. Run `npm run dev` and open `http://localhost:4321/admin/` in a Chromium-based browser (Chrome, Edge, Brave, or Arc).
2. Click **Work with Local Repository** and select the project's root directory.
3. Edits read and write directly to disk and trigger Astro's hot reload immediately.

### Option B: GitHub Personal Access Token (no OAuth server)

For solo maintainers or small technical teams, editors can sign in at `https://<domain>/admin/` using **Sign in with GitHub Using Token** and a fine-grained GitHub Personal Access Token scoped to the single repository with `Contents: Read and write` permission. This requires no Worker or server-side secrets.

### Option C: Cloudflare Workers GitHub OAuth handler

When non-technical editors need one-click **Sign in with GitHub** on a site deployed to Cloudflare Workers (Static Assets):

1. Set `base_url` in `public/admin/config.yml` to your production origin (e.g. `https://example.com`).
2. Create `src/worker.js` to handle `/auth` and `/callback` while delegating all other requests to static assets:

```javascript
const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function randomHex(bytes = 16) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function renderPopupPage(provider, status, content) {
  const message = `authorization:${provider}:${status}:${JSON.stringify(content)}`;
  const safeMessageLiteral = JSON.stringify(message);
  const safeProviderLiteral = JSON.stringify(provider);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Authorizing…</title>
  </head>
  <body>
    <p>Completing sign-in…</p>
    <script>
      (function () {
        const message = ${safeMessageLiteral};
        const provider = ${safeProviderLiteral};
        function sendMessage(e) {
          window.opener.postMessage(message, e.origin);
          window.removeEventListener('message', sendMessage, false);
        }
        window.addEventListener('message', sendMessage, false);
        window.opener.postMessage('authorizing:' + provider, '*');
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'github';
  if (provider !== 'github') {
    return new Response('Unsupported OAuth provider.', { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response(
      'OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Worker secrets.',
      { status: 500 },
    );
  }

  const state = randomHex(16);
  const scope = url.searchParams.get('scope') || 'repo,user';
  const redirectUri = `${url.origin}/callback`;

  const authUrl = new URL(GITHUB_AUTHORIZE_URL);
  authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `cms_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return renderPopupPage('github', 'error', {
      error,
      error_description: url.searchParams.get('error_description') || 'OAuth authorization failed.',
    });
  }

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (!code || !state || !cookies.cms_oauth_state || cookies.cms_oauth_state !== state) {
    return renderPopupPage('github', 'error', {
      error: 'invalid_state',
      error_description: 'Missing or invalid OAuth state cookie. Please try signing in again.',
    });
  }

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'sveltia-cms-oauth-worker',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
      state,
    }),
  });

  const data = await tokenResponse.json();
  if (!tokenResponse.ok || data.error || !data.access_token) {
    return renderPopupPage('github', 'error', {
      error: data.error || 'token_exchange_failed',
      error_description: data.error_description || 'Failed to exchange authorization code.',
    });
  }

  return renderPopupPage('github', 'success', {
    token: data.access_token,
    provider: 'github',
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth' || url.pathname === '/oauth/authorize') {
      return handleAuth(request, env);
    }
    if (url.pathname === '/callback' || url.pathname === '/oauth/redirect') {
      return handleCallback(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
```

3. Update `wrangler.jsonc` so the Worker handles `/auth` and `/callback` while serving `dist/` for all other routes:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "your-project-name",
  "compatibility_date": "2026-04-15",
  "main": "./src/worker.js",
  "workers_dev": true,
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
    "run_worker_first": ["/auth", "/callback", "/oauth/*"]
  }
}
```

4. Register a **GitHub OAuth App** (*Settings → Developer settings → OAuth Apps → New OAuth App*) with **Authorization callback URL** set to `https://<domain>/callback` (leave Device Flow unchecked) and store its credentials in Cloudflare Worker secrets:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```
