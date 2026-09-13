# Cloudflare Pages and Mailgun contact form

This recipe is an optional implementation of the provider-independent contract in [Forms and submissions](../forms.md). The files ship in the reference project so the interaction, endpoint, and tests remain inspectable, but no provider account or production destination is configured automatically.

## Choose this recipe when

- the site is deployed to Cloudflare Pages;
- submissions should arrive by email through Mailgun;
- a small host-native endpoint is preferable to a separate application server;
- the project accepts Cloudflare and Mailgun as explicit runtime data processors.

Choose another option when the deployment host, data destination, retention requirements, or operational ownership point elsewhere.

## Included files

- `src/components/ContactForm.astro` — accessible HTML form and progressive enhancement.
- `src/lib/contact-validation.ts` — validation shared by browser and endpoint.
- `functions/api/contact.ts` — Cloudflare Pages Function and Mailgun request.
- `src/pages/contact/success.astro` and `error.astro` — non-JavaScript outcomes.
- `scripts/test-contact-form.mjs` — built markup and endpoint-contract tests.

## Required configuration

Configure secrets and variables in the deployment environment, not in committed files:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MAILGUN_API_KEY` | Yes | Mailgun sending credential. |
| `MAILGUN_DOMAIN` | Yes | Verified sending domain. |
| `CONTACT_TO_EMAIL` | Yes for production | Destination mailbox. Do not rely on the example fallback. |
| `MAILGUN_REGION` | No | Set to `eu` for the EU API; otherwise the US API is used. |
| `TURNSTILE_SECRET_KEY` | Only when Turnstile is enabled | Server-side challenge verification secret. |

When Turnstile is enabled, pass the matching public site key to `ContactForm`. The site key may be present in browser-rendered markup; the secret key must never be.

## Behaviour

The baseline form posts to `/api/contact`. Standard HTML submissions receive a `303` redirect to a success or error page. Browser JavaScript enhances the same form with in-place status messaging and field-specific errors.

Abuse protection is layered:

1. a visually hidden honeypot;
2. an elapsed-time heuristic;
3. optional Turnstile verification.

The endpoint validates all trusted inputs again before contacting Mailgun. Honeypot and implausibly fast submissions return an indistinguishable success response so bots do not learn which rule they triggered.

## Before production

1. Replace the example recipient fallback in `functions/api/contact.ts` or make the destination mandatory.
2. Configure Mailgun credentials, region, verified domain, and destination for preview and production environments.
3. Decide whether Turnstile is necessary and document the privacy implications.
4. Customise the fields, consent copy, success page, error page, sender identity, and operational alerts.
5. Test valid, invalid, provider-failure, no-JavaScript, keyboard, and abuse-protection paths in the deployed environment.

`npm run test:forms` exercises the local contract with a mocked provider. Astro's static preview does not reproduce host-native function routing, so it is not a substitute for a deployed integration test.

## Replacing or removing the recipe

When switching to another provider, keep semantic form markup, server-side or trusted-endpoint validation, accessible errors, progressive outcomes, safe secret handling, and proportionate abuse protection.

When removing forms entirely, remove the UI, endpoint, outcome pages, validation module, provider-specific tests, and related documentation in the same change so the project does not advertise an inactive integration.
