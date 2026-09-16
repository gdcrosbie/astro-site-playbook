# Cloudflare Pages and Mailgun contact form

This recipe is an implementation of the provider-independent contract in [Forms and submissions](../forms.md). It provides an accessible, progressively enhanced contact form with server-side validation, layered anti-spam, non-JavaScript fallback pages, and email delivery via Mailgun on Cloudflare Pages.

## Choose this recipe when

- the site is deployed to Cloudflare Pages;
- submissions should arrive by email through Mailgun;
- a small host-native endpoint is preferable to a separate application server;
- the project accepts Cloudflare and Mailgun as explicit runtime data processors.

Choose another option when the deployment host, data destination, retention requirements, or operational ownership point elsewhere (see the decision gate in [Forms and submissions](../forms.md)).

## Implementation

To add this contact form to your site, create the following files in your repository.

### 1. Shared validation logic

Create `src/lib/contact-validation.ts` to share field limits and validation rules between browser JavaScript and the Cloudflare Pages Function:

```typescript
export interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export type ContactField = keyof ContactFields;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAK_PATTERN = /[\r\n]/;

export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

export function validateContactFields(fields: ContactFields): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  const name = fields.name.trim();
  if (!name) {
    errors.name = 'Enter your name.';
  } else if (name.length > CONTACT_FIELD_LIMITS.name) {
    errors.name = `Name must be ${CONTACT_FIELD_LIMITS.name} characters or fewer.`;
  } else if (LINE_BREAK_PATTERN.test(name)) {
    errors.name = 'Enter your name without line breaks.';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Enter your email address.';
  } else if (email.length > CONTACT_FIELD_LIMITS.email) {
    errors.email = `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const message = fields.message.trim();
  if (!message) {
    errors.message = 'Enter a message.';
  } else if (message.length > CONTACT_FIELD_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_FIELD_LIMITS.message} characters or fewer.`;
  }

  return errors;
}
```

### 2. Form result component

Create `src/components/FormResult.astro` for rendering standard non-JavaScript outcome pages:

```astro
---
interface Props {
  eyebrow: string;
  title: string;
  message: string;
  linkText: string;
  linkHref: string;
}

const { eyebrow, title, message, linkText, linkHref } = Astro.props;
---

<main id="main-content" class="l-section c-form-result">
  <div class="l-container l-container--narrow c-form-result__container">
    <p class="c-form-result__eyebrow">{eyebrow}</p>
    <h1 class="c-form-result__title">{title}</h1>
    <p class="c-form-result__message">{message}</p>
    <a class="c-form-result__link" href={linkHref}>{linkText}</a>
  </div>
</main>

<style>
  .c-form-result {
    min-block-size: 70vh;
    display: flex;
    align-items: center;
  }

  .c-form-result__container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .c-form-result__eyebrow {
    margin-block-end: var(--space-s);
    color: var(--color-accent);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .c-form-result__title {
    margin-block-end: var(--space-m);
    color: var(--color-primary);
    font-family: var(--font-display);
    font-size: var(--h1);
    line-height: 1.1;
  }

  .c-form-result__message {
    max-inline-size: 48ch;
    margin-block-end: var(--space-xl);
    color: var(--color-muted);
    font-size: var(--text-l);
    line-height: 1.6;
  }

  .c-form-result__link {
    display: inline-flex;
    padding-block: var(--space-s);
    padding-inline: var(--space-l);
    border-radius: var(--radius-m);
    background-color: var(--color-primary);
    color: var(--color-bg);
    font-weight: 500;
    text-decoration: none;
  }

  .c-form-result__link:hover {
    opacity: 0.9;
  }
</style>
```

### 3. Contact form component

Create `src/components/ContactForm.astro`. It renders semantic HTML controls, links labels and errors with ARIA, includes honeypot and timestamp inputs, and progressively enhances with `fetch()` when JavaScript is enabled:

```astro
---
import { CONTACT_FIELD_LIMITS } from '../lib/contact-validation';

interface Props {
  action?: string;
  turnstileSiteKey?: string;
}

const { action = '/api/contact', turnstileSiteKey } = Astro.props;
const timestamp = Math.floor(Date.now() / 1000);
---

<form class="c-contact-form" method="POST" action={action}>
  <!-- Anti-spam: Honeypot & Timestamp -->
  <div class="c-contact-form__honey" aria-hidden="true">
    <label for="contact-form-hp">Do not fill this out if human</label>
    <input type="text" id="contact-form-hp" name="_hp" tabindex="-1" autocomplete="off" />
    <input type="hidden" name="_timestamp" value={timestamp} />
  </div>

  <div class="c-contact-form__field">
    <label for="contact-form-name" class="c-contact-form__label">
      Name <span class="c-contact-form__required" aria-hidden="true">*</span>
    </label>
    <input
      type="text"
      id="contact-form-name"
      name="name"
      required
      maxlength={CONTACT_FIELD_LIMITS.name}
      aria-required="true"
      aria-describedby="name-error"
      autocomplete="name"
      class="c-contact-form__input"
    />
    <span class="c-contact-form__error" id="name-error"></span>
  </div>

  <div class="c-contact-form__field">
    <label for="contact-form-email" class="c-contact-form__label">
      Email <span class="c-contact-form__required" aria-hidden="true">*</span>
    </label>
    <input
      type="email"
      id="contact-form-email"
      name="email"
      required
      maxlength={CONTACT_FIELD_LIMITS.email}
      aria-required="true"
      aria-describedby="email-error"
      autocomplete="email"
      class="c-contact-form__input"
    />
    <span class="c-contact-form__error" id="email-error"></span>
  </div>

  <div class="c-contact-form__field">
    <label for="contact-form-message" class="c-contact-form__label">
      Message <span class="c-contact-form__required" aria-hidden="true">*</span>
    </label>
    <textarea
      id="contact-form-message"
      name="message"
      rows="5"
      required
      maxlength={CONTACT_FIELD_LIMITS.message}
      aria-required="true"
      aria-describedby="message-error"
      class="c-contact-form__textarea"
    ></textarea>
    <span class="c-contact-form__error" id="message-error"></span>
  </div>

  {turnstileSiteKey && (
    <div class="c-contact-form__turnstile">
      <div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light"></div>
    </div>
  )}

  <div class="c-contact-form__actions">
    <button type="submit" class="c-contact-form__submit">
      <span class="c-contact-form__submit-text">Send Message</span>
    </button>
  </div>

  <div class="c-contact-form__status" role="status" aria-live="polite" aria-atomic="true"></div>
</form>

{turnstileSiteKey && (
  <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
)}

<script>
  import {
    validateContactFields,
    type ContactField,
    type ContactFieldErrors,
  } from '../lib/contact-validation';

  function initContactForm() {
    const forms = document.querySelectorAll<HTMLFormElement>('.c-contact-form');

    forms.forEach((form) => {
      if (form.dataset.initialized === 'true') return;
      form.dataset.initialized = 'true';
      form.noValidate = true;

      const submitBtn = form.querySelector<HTMLButtonElement>('.c-contact-form__submit');
      const submitText = form.querySelector<HTMLElement>('.c-contact-form__submit-text');
      const statusEl = form.querySelector<HTMLElement>('.c-contact-form__status');
      const fields = {
        name: form.elements.namedItem('name') as HTMLInputElement | null,
        email: form.elements.namedItem('email') as HTMLInputElement | null,
        message: form.elements.namedItem('message') as HTMLTextAreaElement | null,
      };

      const setFieldError = (field: ContactField, message?: string) => {
        const input = fields[field];
        const error = form.querySelector<HTMLElement>(`#${field}-error`);
        if (!input || !error) return;

        if (message) {
          input.setAttribute('aria-invalid', 'true');
          error.textContent = message;
        } else {
          input.removeAttribute('aria-invalid');
          error.textContent = '';
        }
      };

      const renderFieldErrors = (errors: ContactFieldErrors) => {
        (Object.keys(fields) as ContactField[]).forEach((field) => {
          setFieldError(field, errors[field]);
        });
      };

      (Object.keys(fields) as ContactField[]).forEach((field) => {
        fields[field]?.addEventListener('input', () => setFieldError(field));
      });

      form.addEventListener('submit', async (e) => {
        const fieldErrors = validateContactFields({
          name: fields.name?.value ?? '',
          email: fields.email?.value ?? '',
          message: fields.message?.value ?? '',
        });
        renderFieldErrors(fieldErrors);

        if (Object.keys(fieldErrors).length > 0) {
          e.preventDefault();
          if (statusEl) {
            statusEl.textContent = 'Check the highlighted fields and try again.';
            statusEl.className = 'c-contact-form__status c-contact-form__status--error';
          }
          const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
          firstInvalid?.focus();
          return;
        }

        // Progressive enhancement: submit via fetch
        e.preventDefault();

        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Sending...';
        form.setAttribute('aria-busy', 'true');

        if (statusEl) {
          statusEl.textContent = 'Sending message...';
          statusEl.className = 'c-contact-form__status c-contact-form__status--pending';
        }

        try {
          const formData = new FormData(form);
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json',
            },
          });

          const data = (await response.json().catch(() => null)) as {
            success?: boolean;
            error?: string;
            fieldErrors?: ContactFieldErrors;
          } | null;

          if (response.ok && data?.success !== false) {
            form.reset();
            if (statusEl) {
              statusEl.textContent = 'Thank you! Your message has been sent successfully.';
              statusEl.className = 'c-contact-form__status c-contact-form__status--success';
            }
          } else {
            if (data?.fieldErrors) {
              renderFieldErrors(data.fieldErrors);
              const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
              firstInvalid?.focus();
            }
            const errorMsg = data?.error || 'Unable to send your message. Please try again later.';
            if (statusEl) {
              statusEl.textContent = errorMsg;
              statusEl.className = 'c-contact-form__status c-contact-form__status--error';
            }
          }
        } catch {
          if (statusEl) {
            statusEl.textContent = 'Network error. Please check your connection and try again.';
            statusEl.className = 'c-contact-form__status c-contact-form__status--error';
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
          if (submitText) submitText.textContent = 'Send Message';
          form.removeAttribute('aria-busy');
        }
      });
    });
  }

  initContactForm();
  document.addEventListener('astro:page-load', initContactForm);
</script>

<style>
  .c-contact-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
    max-inline-size: 600px;
    inline-size: 100%;
  }

  .c-contact-form__honey {
    position: absolute;
    inset-inline-start: -9999px;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
  }

  .c-contact-form__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-3xs);
  }

  .c-contact-form__label {
    font-size: var(--text-s);
    font-weight: 500;
    color: var(--color-text);
  }

  .c-contact-form__required {
    color: var(--color-primary);
  }

  .c-contact-form__input,
  .c-contact-form__textarea {
    font-family: inherit;
    font-size: var(--text-base);
    color: var(--color-text);
    background: var(--color-surface);
    border: var(--border-subtle);
    border-radius: var(--radius-s);
    padding-block: var(--space-2xs);
    padding-inline: var(--space-xs);
    inline-size: 100%;
    box-sizing: border-box;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .c-contact-form__input:focus-visible,
  .c-contact-form__textarea:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 3px;
    border-color: var(--color-primary);
  }

  .c-contact-form__input[aria-invalid="true"],
  .c-contact-form__textarea[aria-invalid="true"] {
    border-color: var(--color-error-border);
  }

  .c-contact-form__textarea {
    resize: vertical;
    min-block-size: 130px;
  }

  .c-contact-form__turnstile {
    min-block-size: 65px;
  }

  .c-contact-form__actions {
    display: flex;
    align-items: center;
    gap: var(--space-s);
  }

  .c-contact-form__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--space-2xs);
    padding-inline: var(--space-m);
    font-family: inherit;
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-surface);
    background: var(--color-primary);
    border: none;
    border-radius: var(--radius-s);
    cursor: pointer;
    transition: opacity 140ms ease, transform 140ms ease;
  }

  .c-contact-form__submit:hover:not(:disabled) {
    opacity: 0.92;
  }

  .c-contact-form__submit:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 3px;
  }

  .c-contact-form__submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .c-contact-form__status {
    font-size: var(--text-s);
    line-height: 1.5;
    padding-block: var(--space-2xs);
    padding-inline: var(--space-xs);
    border-radius: var(--radius-s);
    empty-cells: hide;
  }

  .c-contact-form__status:empty {
    display: none;
  }

  .c-contact-form__status--pending {
    color: var(--color-muted);
    background: var(--color-bg);
  }

  .c-contact-form__status--success {
    color: var(--color-success);
    background: var(--color-success-surface);
    border: 1px solid var(--color-success-border);
  }

  .c-contact-form__status--error {
    color: var(--color-error);
    background: var(--color-error-surface);
    border: 1px solid var(--color-error-border);
  }

  .c-contact-form__error {
    font-size: var(--text-xs);
    color: var(--color-error);
  }

  .c-contact-form__error:empty {
    display: none;
  }
</style>
```

### 4. Non-JavaScript outcome pages

Create `src/pages/contact/success.astro`:

```astro
---
import FormResult from '../../components/FormResult.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Message sent — Astro Site Playbook"
  description="Your message was sent successfully."
  noindex={true}
>
  <FormResult
    eyebrow="Message sent"
    title="Thank you"
    message="Your message has been sent successfully."
    linkText="Return home"
    linkHref="/"
  />
</BaseLayout>
```

Create `src/pages/contact/error.astro`:

```astro
---
import FormResult from '../../components/FormResult.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Message not sent — Astro Site Playbook"
  description="Your message could not be sent."
  noindex={true}
>
  <FormResult
    eyebrow="Message not sent"
    title="Please try again"
    message="We could not send your message. Your details have not been saved, so please return to the form and try again."
    linkText="Return to the form"
    linkHref="/#contact"
  />
</BaseLayout>
```

### 5. Cloudflare Pages Function endpoint

Create `functions/api/contact.ts`. This endpoint runs on Cloudflare Pages without altering Astro's static build output:

```typescript
import { validateContactFields } from '../../src/lib/contact-validation.ts';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;
  MAILGUN_REGION?: string; // 'us' or 'eu'
  CONTACT_TO_EMAIL?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  return Response.redirect(new URL('/#contact', context.request.url).toString(), 302);
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const { request, env } = context;
  const wantsJson = request.headers.get('Accept')?.includes('application/json');

  const redirectOrJson = (path: string, status = 303, jsonError?: string) => {
    if (wantsJson) {
      if (jsonError) {
        return new Response(JSON.stringify({ success: false, error: jsonError }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return Response.redirect(new URL(path, request.url).toString(), status);
  };

  try {
    const formData = await request.formData();

    // 1. Honeypot check: if filled, quietly drop request without alerting bots
    const honeypot = formData.get('_hp');
    if (honeypot && String(honeypot).trim() !== '') {
      return redirectOrJson('/contact/success');
    }

    // 2. Timestamp check: if submitted under 2 seconds, quietly drop
    const timestampStr = formData.get('_timestamp');
    if (timestampStr) {
      const formTime = parseInt(String(timestampStr), 10);
      const now = Math.floor(Date.now() / 1000);
      if (!isNaN(formTime) && now - formTime < 2) {
        return redirectOrJson('/contact/success');
      }
    }

    // 3. Cloudflare Turnstile verification (if secret key configured)
    if (env.TURNSTILE_SECRET_KEY) {
      const turnstileToken = formData.get('cf-turnstile-response');
      if (!turnstileToken || String(turnstileToken).trim() === '') {
        console.error('Turnstile token missing');
        return redirectOrJson('/contact/error', 303, 'Turnstile verification token missing');
      }

      const clientIp = request.headers.get('CF-Connecting-IP') || '';
      const verifyFormData = new FormData();
      verifyFormData.append('secret', env.TURNSTILE_SECRET_KEY);
      verifyFormData.append('response', String(turnstileToken));
      if (clientIp) {
        verifyFormData.append('remoteip', clientIp);
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyFormData,
      });

      const verifyData = (await verifyRes.json()) as { success: boolean; 'error-codes'?: string[] };
      if (!verifyData.success) {
        console.error('Turnstile verification failed:', verifyData['error-codes']);
        return redirectOrJson('/contact/error', 303, 'Turnstile verification failed');
      }
    }

    // 4. Form inputs validation
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const fieldErrors = validateContactFields({ name, email, message });
    if (Object.keys(fieldErrors).length > 0) {
      if (wantsJson) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Check the highlighted fields and try again.',
          fieldErrors,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return redirectOrJson('/contact/error');
    }

    // 5. Send via Mailgun REST API
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) {
      console.error('Missing Mailgun configuration (MAILGUN_API_KEY or MAILGUN_DOMAIN)');
      return redirectOrJson('/contact/error', 303, 'Email service not configured');
    }

    const isEu = env.MAILGUN_REGION?.toLowerCase() === 'eu';
    const mailgunHost = isEu ? 'api.eu.mailgun.net' : 'api.mailgun.net';
    const mailgunUrl = `https://${mailgunHost}/v3/${env.MAILGUN_DOMAIN}/messages`;

    const recipient = env.CONTACT_TO_EMAIL || 'hello@example.com';
    const sender = `Website Enquiry <mailgun@${env.MAILGUN_DOMAIN}>`;
    const subject = `Website enquiry from ${name}`;

    const textBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      ``,
      `Message:`,
      message,
      ``,
      `---`,
      `Submitted at: ${new Date().toISOString()}`,
    ].join('\n');

    const mailgunData = new FormData();
    mailgunData.append('from', sender);
    mailgunData.append('to', recipient);
    mailgunData.append('h:Reply-To', `${name} <${email}>`);
    mailgunData.append('subject', subject);
    mailgunData.append('text', textBody);

    const mailgunRes = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`api:${env.MAILGUN_API_KEY}`),
      },
      body: mailgunData,
    });

    if (!mailgunRes.ok) {
      const errText = await mailgunRes.text();
      console.error('Mailgun send failed:', mailgunRes.status, errText);
      return redirectOrJson('/contact/error', 303, 'Failed to dispatch email');
    }

    return redirectOrJson('/contact/success');
  } catch (error) {
    console.error('Unexpected error in contact function:', error);
    return redirectOrJson('/contact/error', 303, 'Server error');
  }
}
```

### 6. Sitemap filter (optional)

If you don't want the `/contact/success` and `/contact/error` outcome pages included in your XML sitemap, update `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [sitemap({
    filter: (page) => !page.includes('/contact/success/') && !page.includes('/contact/error/'),
  })],
});
```

### 7. Automated tests (optional)

Create `scripts/test-contact-form.mjs` to test the built HTML accessibility and endpoint contract with a mocked provider:

```javascript
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { onRequestGet, onRequestPost } from '../functions/api/contact.ts';
import { CONTACT_FIELD_LIMITS } from '../src/lib/contact-validation.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function builtDocument(relativePath) {
  const file = path.join(root, 'dist', relativePath);
  assert.ok(fs.existsSync(file), `Expected built page: ${relativePath}`);
  return new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
}

function postRequest(fields, { acceptJson = true, env = {} } = {}) {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.set(name, String(value)));

  return onRequestPost({
    request: new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: acceptJson ? { Accept: 'application/json' } : {},
      body,
    }),
    env,
  });
}

test('built form exposes labels, requirements, descriptions, and status semantics', () => {
  const document = builtDocument('index.html');
  const form = document.querySelector('.c-contact-form');
  assert.ok(form);
  assert.equal(form.getAttribute('method'), 'POST');
  assert.equal(form.getAttribute('action'), '/api/contact');
  assert.equal(form.noValidate, false, 'Expected native validation without JavaScript');

  for (const field of ['name', 'email', 'message']) {
    const input = form.elements.namedItem(field);
    assert.ok(input, `Expected ${field} field`);
    assert.ok(document.querySelector(`label[for="${input.id}"]`), `Expected label for ${field}`);
    assert.ok(input.hasAttribute('required'), `Expected ${field} to be required`);
    assert.equal(input.getAttribute('aria-required'), 'true');
    assert.equal(Number(input.getAttribute('maxlength')), CONTACT_FIELD_LIMITS[field]);

    const descriptionId = input.getAttribute('aria-describedby');
    assert.ok(descriptionId, `Expected ${field} error relationship`);
    assert.ok(document.getElementById(descriptionId), `Expected ${descriptionId} error container`);
  }

  assert.equal(form.elements.namedItem('email').getAttribute('type'), 'email');
  const status = form.querySelector('[role="status"]');
  assert.ok(status);
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.equal(status.getAttribute('aria-atomic'), 'true');

  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length, 'Expected unique IDs in the built page');
});

test('built success and error destinations provide one heading and a recovery link', () => {
  for (const relativePath of ['contact/success/index.html', 'contact/error/index.html']) {
    const document = builtDocument(relativePath);
    assert.equal(document.querySelectorAll('main').length, 1);
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.ok(document.querySelector('main a[href]'));
  }
});

test('endpoint returns field-specific errors for missing and malformed values', async () => {
  const response = await postRequest({ name: 'Ada', email: 'not-an-email', message: 'Hello' });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.success, false);
  assert.equal(data.fieldErrors.email, 'Enter a valid email address.');

  const emptyResponse = await postRequest({ name: '', email: '', message: '' });
  const emptyData = await emptyResponse.json();
  assert.deepEqual(Object.keys(emptyData.fieldErrors).sort(), ['email', 'message', 'name']);
});

test('endpoint rejects excessive input and name header injection', async () => {
  const response = await postRequest({
    name: 'Ada\r\nBcc: target@example.com',
    email: `${'a'.repeat(245)}@example.com`,
    message: 'x'.repeat(CONTACT_FIELD_LIMITS.message + 1),
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.fieldErrors.name, 'Enter your name without line breaks.');
  assert.equal(data.fieldErrors.email, `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`);
  assert.equal(data.fieldErrors.message, `Message must be ${CONTACT_FIELD_LIMITS.message} characters or fewer.`);
});

test('standard HTML submission redirects invalid input to the error page', async () => {
  const response = await postRequest(
    { name: 'Ada', email: 'not-an-email', message: 'Hello' },
    { acceptJson: false },
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('Location'), 'https://example.com/contact/error');
});

test('endpoint rejects valid input when delivery is not configured', async () => {
  const originalConsoleError = console.error;
  const errors = [];
  console.error = (...messages) => errors.push(messages.join(' '));

  try {
    const response = await postRequest({ name: 'Ada', email: 'ada@example.com', message: 'Hello' });
    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.error, 'Email service not configured');
    assert.ok(errors.some((message) => message.includes('Missing Mailgun configuration')));
  } finally {
    console.error = originalConsoleError;
  }
});

test('endpoint sends validated input to the configured Mailgun region', async () => {
  const originalFetch = globalThis.fetch;
  let delivery;

  globalThis.fetch = async (url, init) => {
    delivery = { url: String(url), init };
    return new Response('queued', { status: 200 });
  };

  try {
    const response = await postRequest(
      { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' },
      {
        env: {
          MAILGUN_API_KEY: 'test-key',
          MAILGUN_DOMAIN: 'mg.example.com',
          MAILGUN_REGION: 'eu',
          CONTACT_TO_EMAIL: 'team@example.com',
        },
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(delivery.url, 'https://api.eu.mailgun.net/v3/mg.example.com/messages');
    assert.match(delivery.init.headers.Authorization, /^Basic /);
    assert.equal(delivery.init.body.get('to'), 'team@example.com');
    assert.equal(delivery.init.body.get('h:Reply-To'), 'Ada Lovelace <ada@example.com>');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('anti-spam short circuits return success without contacting the provider', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Provider should not be called');
  };

  try {
    const honeypot = await postRequest({ _hp: 'bot', name: '', email: '', message: '' });
    assert.deepEqual(await honeypot.json(), { success: true });

    const timestamp = Math.floor(Date.now() / 1000);
    const tooFast = await postRequest({
      _timestamp: timestamp,
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
    });
    assert.deepEqual(await tooFast.json(), { success: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GET requests return visitors to the form on the home page', async () => {
  const response = await onRequestGet({
    request: new Request('https://example.com/api/contact'),
    env: {},
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://example.com/#contact');
});
```

Add the script to `package.json`:

```json
"scripts": {
  "test:forms": "node --experimental-strip-types --test scripts/test-contact-form.mjs"
}
```

## Required configuration

Configure secrets and variables in your Cloudflare Pages deployment environment, never in committed files:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MAILGUN_API_KEY` | Yes | Mailgun sending credential. |
| `MAILGUN_DOMAIN` | Yes | Verified sending domain. |
| `CONTACT_TO_EMAIL` | Yes for production | Destination mailbox. |
| `MAILGUN_REGION` | No | Set to `eu` for the EU API; otherwise the US API is used. |
| `TURNSTILE_SECRET_KEY` | Only when Turnstile is enabled | Server-side challenge verification secret. |

When Turnstile is enabled, pass the matching public site key to `<ContactForm turnstileSiteKey="0x4AAAAAA..." />`. The site key may be present in browser-rendered markup; the secret key must never be.

## Behaviour

The baseline form posts to `/api/contact`. Standard HTML submissions receive a `303` redirect to a success or error page. Browser JavaScript enhances the same form with in-place status messaging and field-specific errors.

Abuse protection is layered:

1. a visually hidden honeypot;
2. an elapsed-time heuristic;
3. optional Cloudflare Turnstile verification.

The endpoint validates all trusted inputs again before contacting Mailgun. Honeypot and implausibly fast submissions return an indistinguishable success response so bots do not learn which rule they triggered.

## Pre-production checklist

1. Configure Mailgun credentials, region, verified domain, and destination for preview and production environments in Cloudflare Pages.
2. Decide whether Turnstile is necessary and document the privacy implications.
3. Customise the fields, consent copy, success page, error page, sender identity, and operational alerts.
4. Test valid, invalid, provider-failure, no-JavaScript, keyboard, and abuse-protection paths in the deployed environment.
5. Run `npm run test:forms` to exercise the local contract with a mocked provider. Astro's static preview does not reproduce host-native function routing, so it is not a substitute for a deployed integration test.

