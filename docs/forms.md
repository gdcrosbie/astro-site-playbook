# Forms and submissions

Forms cross a system boundary: they combine accessible UI, server-side validation, abuse prevention, secret management, and an external destination. The playbook therefore requires an explicit delivery decision before a form is wired up.

## Required decision gate

When a design contains a form and the handling requirements are not already explicit, ask the project owner to choose:

1. A host-native endpoint plus an email provider. In this starter, the default is a Cloudflare Pages Function plus Mailgun with layered anti-spam.
2. A hosted static-form endpoint such as Formspree, Web3Forms, or Basin.
3. A webhook to a CRM or automation platform.
4. An accessible UI-only mock with no real submission.

Confirm data destination, retention, consent, expected response, and operational ownership where relevant. Do not silently send production data to the starter's default provider.

## Provider-independent contract

Whichever option is chosen:

- use a real `<form>` with an appropriate method and action;
- validate on the server or trusted endpoint even when client validation improves feedback;
- keep credentials and provider secrets out of browser code and version control;
- provide useful success and error outcomes without JavaScript;
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

## Included reference recipe

The starter includes:

- `ContactForm.astro`, posting to `/api/contact` by default;
- a Cloudflare Pages Function at `functions/api/contact.ts`;
- a honeypot and elapsed-time heuristic;
- optional Cloudflare Turnstile verification when configured;
- Mailgun delivery via server-side environment variables;
- JSON responses for enhanced `fetch()` submission and `303` redirects for standard HTML submission.

Required environment variables are `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and normally `CONTACT_TO_EMAIL`. `MAILGUN_REGION` selects the US or EU endpoint. `TURNSTILE_SECRET_KEY` enables server verification and the matching site key must be passed to the form component.

Before using this path in production:

- customise and test the included `/contact/success` and `/contact/error` destinations;
- replace the example fallback recipient;
- configure and test the chosen Mailgun region and domain;
- test the Turnstile-enabled and Turnstile-disabled paths as applicable;
- review the form fields and handling against the project's privacy obligations.

See [Cloudflare Pages and Mailgun contact form](recipes/cloudflare-mailgun-contact.md) for the complete setup and replacement boundaries.
