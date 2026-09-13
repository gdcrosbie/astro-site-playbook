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
