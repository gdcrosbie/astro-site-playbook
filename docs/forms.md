# Forms and submissions

Forms cross a system boundary: they combine accessible UI, server-side validation, abuse prevention, secret management, and an external destination. The playbook therefore requires an explicit delivery decision before a form is wired up.

## Required decision gate

When a design contains a form and the handling requirements are not already explicit, ask the project owner to choose:

1. A host-native endpoint plus an email provider. The playbook provides a reference recipe for a Cloudflare Workers plus Turnstile and Mailgun.
2. A hosted static-form endpoint such as Formspree, Web3Forms, or Basin.
3. A webhook to a CRM or automation platform.
4. An accessible UI-only mock with no real submission.

Confirm data destination, retention, consent, expected response, and operational ownership where relevant. The starter deliberately ships without a bundled form so projects do not send production data to an unconfigured or unintended provider.

## Provider-independent contract

Whichever option is chosen:

- use a real `<form>` with an appropriate method and action;
- validate on the server or trusted endpoint even when client validation improves feedback;
- keep credentials and provider secrets out of browser code and version control;
- provide native HTML success/error responses; when security verification requires JavaScript, provide an approved contact alternative in `<noscript>`;
- enhance submission in the browser only after the baseline path works;
- make abuse protection proportionate and avoid inaccessible challenges;
- do not log message bodies, credentials, or unnecessary personal data;
- document configuration, failure behaviour, and ownership.

## Accessibility contract

- Give every field a persistent, explicit `<label for="...">`.
- Do not use placeholders as labels.
- Mark invalid fields with `aria-invalid="true"` and associate the relevant error using `aria-describedby`.
- Put useful text in field-level error containers; do not rely on colour alone.
- Move focus to the first invalid field after a failed validation attempt.
- Announce form-level progress and results with an appropriate live status region.
- Preserve the user's entered values when a recoverable error occurs.

## Reference contact recipe

The starter intentionally ships without a pre-bundled form so new sites start clean without unused assets or provider assumptions.

When a project requires a host-native contact form deployed to Cloudflare Workers (or an existing Pages project), use the [Contact forms with Cloudflare Workers, Turnstile and Mailgun recipe](recipes/cloudflare-workers-turnstile-mailgun-contact.md). It demonstrates the complete provider-independent and accessibility contracts:

- an accessible `<ContactForm />` component posting to `/api/contact` by default;
- shared validation rules between browser and server;
- a shared `src/contact.ts` handler with `src/worker.ts` routing, or `functions/api/contact.ts` for existing Pages;
- required server-side Turnstile verification, with supplementary honeypot/timing heuristics;
- Mailgun delivery via server-side environment variables;
- JSON responses for enhanced `fetch()` submission and `303` redirects to `/contact/success` and `/contact/error` for standard HTML submissions;
- automated contract tests using `node:test` and `jsdom`.

See [Contact forms with Cloudflare Workers, Turnstile and Mailgun](recipes/cloudflare-workers-turnstile-mailgun-contact.md) for the complete implementation files, environment variables, and pre-production checklist.
