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
  return Response.redirect(new URL('/contact', context.request.url).toString(), 302);
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

    if (!name || !email || !message) {
      return redirectOrJson('/contact/error', 303, 'Required fields missing');
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
