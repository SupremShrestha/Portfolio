import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { processContact, createContactHandler } from '../server/contact.js';
import { CONTACT_EMAIL } from '../src/lib/contact.js';

const env = {
  RESEND_API_KEY: 'test-private-api-key', CONTACT_FROM_EMAIL: 'Portfolio <hello@example.com>',
  CONTACT_ALLOWED_ORIGIN: 'https://portfolio.example.com,http://localhost:5173',
  TURNSTILE_SITE_KEY: 'public-site-key', TURNSTILE_SECRET_KEY: 'test-private-turnstile-key',
};
const body = { name: '  Test Visitor  ', email: '  visitor@example.org  ', message: 'A test message. No real email is sent.', token: 'test-challenge-token', website: '', requestId: '3db7fbdc-fcd0-4c34-a97c-3bdfd997ab09' };
const request = { method: 'POST', headers: { origin: 'https://portfolio.example.com', 'content-type': 'application/json' }, body };
const verified = { success: true, action: 'portfolio-contact', hostname: 'portfolio.example.com' };
const mockResponse = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
function provider({ challenge = verified, challengeStatus = 200, email = { id: 'mock-message-id' }, emailStatus = 200 } = {}) {
  const calls = [];
  return { calls, fetchImpl: async (url, options) => { calls.push({ url, options }); return url.includes('siteverify') ? mockResponse(challenge, challengeStatus) : mockResponse(email, emailStatus); } };
}
const forbiddenFetch = async () => { throw new Error('Provider must not be called'); };

test('public configuration exposes only readiness and the site key, and fails closed when settings are missing', async () => {
  const ready = await processContact({ method: 'GET' }, { env });
  assert.deepEqual(ready.body, { ready: true, siteKey: env.TURNSTILE_SITE_KEY });
  assert.equal(JSON.stringify(ready).includes(env.RESEND_API_KEY), false);
  for (const key of Object.keys(env)) {
    const missing = { ...env, [key]: '' };
    assert.deepEqual((await processContact({ method: 'GET' }, { env: missing })).body, { ready: false, siteKey: null });
    assert.equal((await processContact(request, { env: missing, fetchImpl: forbiddenFetch })).status, 503);
  }
});

test('rejects other origins, missing origins, invalid methods, and non-JSON requests before contacting providers', async () => {
  for (const origin of [undefined, 'null', 'https://portfolio.example.com.attacker.org', 'https://attacker.org']) {
    assert.equal((await processContact({ ...request, headers: { ...request.headers, origin } }, { env, fetchImpl: forbiddenFetch })).status, 403);
  }
  assert.equal((await processContact({ ...request, method: 'PUT' }, { env, fetchImpl: forbiddenFetch })).status, 405);
  assert.equal((await processContact({ ...request, headers: { ...request.headers, 'content-type': 'text/plain' } }, { env, fetchImpl: forbiddenFetch })).status, 415);
});

test('server rejects malformed fields, header injection, oversized data, honeypots, and missing verification', async () => {
  for (const invalid of [null, [], { ...body, name: {} }, { ...body, email: 123 }, { ...body, message: null }, { ...body, name: 'a'.repeat(101) }, { ...body, name: 'Hello\r\nBcc: attacker@example.org' }, { ...body, email: 'bad@address' }, { ...body, message: 'a'.repeat(3001) }, { ...body, website: 'spam' }, { ...body, token: '' }, { ...body, token: 'a'.repeat(2049) }, { ...body, requestId: 'untrusted-key' }]) {
    assert.equal((await processContact({ ...request, body: invalid }, { env, fetchImpl: forbiddenFetch })).status, 400);
  }
  assert.equal((await processContact({ ...request, body: { ...body, message: 'a'.repeat(17000) } }, { env, fetchImpl: forbiddenFetch })).status, 413);
});

test('a failed, expired, wrong-host, or wrong-action bot check never reaches the email provider', async () => {
  for (const challenge of [{ ...verified, success: false }, { ...verified, success: 'true' }, { ...verified, action: 'another-action' }, { ...verified, hostname: 'attacker.org' }]) {
    const mock = provider({ challenge });
    const result = await processContact(request, { env, fetchImpl: mock.fetchImpl });
    assert.equal(result.status, 403); assert.equal(mock.calls.length, 1);
  }
  const mock = provider({ challengeStatus: 500 });
  assert.equal((await processContact(request, { env, fetchImpl: mock.fetchImpl })).status, 502);
  assert.equal(mock.calls.length, 1);
});

test('verified submissions use a fixed recipient, private credentials, plain text, and visitor reply-to', async () => {
  const mock = provider();
  const result = await processContact({ ...request, body: { ...body, to: 'attacker@example.org', from: 'attacker@example.org' } }, { env, fetchImpl: mock.fetchImpl });
  assert.deepEqual(result, { status: 200, body: { success: true } });
  assert.equal(mock.calls.length, 2);
  const verification = JSON.parse(mock.calls[0].options.body);
  assert.equal(verification.secret, env.TURNSTILE_SECRET_KEY);
  const mail = mock.calls[1];
  assert.equal(mail.options.headers.Authorization, `Bearer ${env.RESEND_API_KEY}`);
  const payload = JSON.parse(mail.options.body);
  assert.deepEqual(payload.to, [CONTACT_EMAIL]); assert.equal(payload.from, env.CONTACT_FROM_EMAIL);
  assert.equal(payload.reply_to, 'visitor@example.org'); assert.equal(payload.subject, 'Portfolio enquiry from Test Visitor');
  assert.equal(typeof payload.text, 'string'); assert.equal(payload.html, undefined);
});

test('retries reuse the same provider idempotency key, but changed messages use a different key', async () => {
  const mock = provider();
  await processContact(request, { env, fetchImpl: mock.fetchImpl });
  await processContact({ ...request, body: { ...body, token: 'new-token' } }, { env, fetchImpl: mock.fetchImpl });
  await processContact({ ...request, body: { ...body, message: 'A different message to send.' } }, { env, fetchImpl: mock.fetchImpl });
  assert.equal(mock.calls[1].options.headers['Idempotency-Key'], mock.calls[3].options.headers['Idempotency-Key']);
  assert.notEqual(mock.calls[1].options.headers['Idempotency-Key'], mock.calls[5].options.headers['Idempotency-Key']);
});

test('provider errors, rate limits, malformed success responses, and network failures never produce success or leak secrets', async () => {
  for (const options of [{ emailStatus: 500, email: { error: env.RESEND_API_KEY } }, { emailStatus: 429, email: {} }, { email: {} }]) {
    const mock = provider(options);
    const result = await processContact(request, { env, fetchImpl: mock.fetchImpl });
    assert.equal(result.status, options.emailStatus === 429 ? 429 : 502);
    assert.equal(result.body.success, undefined); assert.equal(JSON.stringify(result).includes(env.RESEND_API_KEY), false);
  }
  const result = await processContact(request, { env, fetchImpl: async () => { throw new Error(env.TURNSTILE_SECRET_KEY); } });
  assert.equal(result.status, 502); assert.equal(JSON.stringify(result).includes(env.TURNSTILE_SECRET_KEY), false);
});

async function runHandler(chunks, headers = request.headers, parsedBody) {
  const req = Readable.from(chunks); req.method = 'POST'; req.headers = headers;
  if (parsedBody !== undefined) req.body = parsedBody;
  const result = { headers: {}, statusCode: 200, setHeader(name, value) { this.headers[name] = value; }, end(value) { this.body = JSON.parse(value); } };
  const mock = provider();
  await createContactHandler(env, mock.fetchImpl)(req, result);
  return { result, calls: mock.calls };
}

test('the HTTP adapter supports streamed JSON and Vercel-parsed bodies with no-store responses', async () => {
  for (const parsedBody of [undefined, body]) {
    const { result } = await runHandler([JSON.stringify(body)], request.headers, parsedBody);
    assert.equal(result.statusCode, 200); assert.equal(result.body.success, true);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  }
});

test('the HTTP adapter stops malformed JSON and oversized streams before invoking any provider', async () => {
  for (const [chunks, headers, status] of [
    [['{bad'], request.headers, 400],
    [['x'.repeat(9000), 'x'.repeat(9000)], request.headers, 413],
    [[], { ...request.headers, 'content-length': '17000' }, 413],
  ]) {
    const { result, calls } = await runHandler(chunks, headers);
    assert.equal(result.statusCode, status); assert.equal(calls.length, 0);
  }
});
