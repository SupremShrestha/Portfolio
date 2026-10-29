import { createHash } from 'node:crypto';
import { CONTACT_EMAIL, createContactMessage, validateContact } from '../src/lib/contact.js';

const MAX_BYTES = 16_384;
const json = (status, body) => ({ status, body });

// A fixed recipient and sender prevent this endpoint becoming an open email relay.
// Turnstile is mandatory: no production path skips server-side verification.
export async function processContact({ method, headers = {}, body }, { env, fetchImpl = fetch } = {}) {
  const ready = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_ALLOWED_ORIGIN', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'].every(key => Boolean(env?.[key]?.trim()));
  if (method === 'GET') return json(200, { ready, siteKey: ready ? env.TURNSTILE_SITE_KEY : null });
  if (method !== 'POST') return json(405, { error: 'This endpoint accepts GET and POST requests.' });
  if (!ready) return json(503, { error: 'Direct delivery is not available yet. Please use the email link below.' });
  const allowed = env.CONTACT_ALLOWED_ORIGIN.split(',').map(origin => origin.trim());
  const origin = headers.origin;
  if (typeof origin !== 'string' || !allowed.includes(origin)) return json(403, { error: 'Please send your message from the portfolio website.' });
  if (!headers['content-type']?.toLowerCase().startsWith('application/json')) return json(415, { error: 'Please submit the contact form as JSON.' });
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { error: 'Please check your message and try again.' });
  if (Buffer.byteLength(JSON.stringify(body)) > MAX_BYTES) return json(413, { error: 'Your message is too large.' });
  if (body.website) return json(400, { error: 'Unable to submit this message.' });
  const errors = validateContact(body);
  if (Object.keys(errors).length) return json(400, { error: 'Please check the highlighted fields.', errors });
  if (typeof body.token !== 'string' || !body.token || body.token.length > 2048) return json(400, { error: 'Please complete the security check, then try again.' });
  if (typeof body.requestId !== 'string' || !/^[a-f\d-]{36}$/i.test(body.requestId)) return json(400, { error: 'Please refresh the form and try again.' });
  try {
    const verification = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: body.token }),
      signal: AbortSignal.timeout(8000),
    });
    if (!verification.ok) return json(502, { error: 'The security check is temporarily unavailable. Please try again.' });
    const challenge = await verification.json();
    if (challenge.success !== true || challenge.action !== 'portfolio-contact' || challenge.hostname !== new URL(origin).hostname) {
      return json(403, { error: 'The security check expired or could not be verified. Please try again.' });
    }
    const values = { name: body.name.trim(), email: body.email.trim(), message: body.message.trim() };
    const digest = createHash('sha256').update(JSON.stringify(values)).digest('hex');
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Idempotency-Key': `portfolio/${body.requestId}/${digest}` },
      body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, to: [CONTACT_EMAIL], reply_to: values.email, subject: `Portfolio enquiry from ${values.name}`, text: createContactMessage(values) }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== 'string') return json(response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'Too many requests right now. Please wait a little before trying again.' : 'Your message could not be accepted. Please try again or email me directly.' });
    return json(200, { success: true });
  } catch {
    // Never log contact contents, provider errors, or credentials.
    return json(502, { error: 'Delivery could not be confirmed. Your message is still here; retry or use email.' });
  }
}

export function createContactHandler(env, fetchImpl) {
  return async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Allow', 'GET, POST');
    let body = req.body;
    try {
      if (Number(req.headers['content-length'] || 0) > MAX_BYTES) {
        res.statusCode = 413; res.end(JSON.stringify({ error: 'Your message is too large.' })); return;
      }
      if (req.method === 'POST') {
        if (body === undefined) {
          const chunks = []; let size = 0;
          for await (const chunk of req) {
            size += Buffer.byteLength(chunk);
            if (size > MAX_BYTES) { res.statusCode = 413; res.end(JSON.stringify({ error: 'Your message is too large.' })); return; }
            chunks.push(Buffer.from(chunk));
          }
          body = Buffer.concat(chunks).toString('utf8');
        }
        if (typeof body === 'string') body = JSON.parse(body);
      }
    } catch { res.statusCode = 400; res.end(JSON.stringify({ error: 'Invalid message format.' })); return; }
    const result = await processContact({ method: req.method, headers: req.headers, body }, { env, fetchImpl });
    res.statusCode = result.status; res.end(JSON.stringify(result.body));
  };
}
