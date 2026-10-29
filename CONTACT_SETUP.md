# Enable direct contact-form delivery

The implementation is ready, but no email-service or Turnstile credentials are configured in this checkout. Until you configure them, the form clearly offers a prefilled email draft. The visitor must send that draft themselves.

The direct-delivery path is: visitor → your `/api/contact` server → Cloudflare verification → Resend → `ssuprim26@gmail.com`. The frontend receives only the public Turnstile site key. Resend and Turnstile secret keys remain on the server.

## 1. Set up Resend

1. Create or sign in to your [Resend account](https://resend.com).
2. Add a sending domain you own and complete the DNS verification requested by Resend. Choose a sender on that domain, such as `Portfolio <hello@yourdomain.com>`. Your Gmail address remains the **recipient**, not the sender.
3. Create a dedicated API key for this portfolio with **Sending access**, restricted to your sending domain. Store it securely; it becomes `RESEND_API_KEY`. [Resend API key documentation](https://resend.com/docs/dashboard/api-keys/introduction).
4. Use the verified sender as `CONTACT_FROM_EMAIL`. The server already sets Reply-To to the visitor's validated email, so you can reply normally. [Resend sending API](https://resend.com/docs/api-reference/emails/send-email).

For a preliminary test without a domain, Resend's provided testing sender may be used only within the restrictions on your account; use a verified domain for the production setup described here. Never put a private API key in a `VITE_` variable or source file.

## 2. Deploy the full project to Vercel

1. Commit and push the local portfolio changes to your repository when you are ready to publish them.
2. Import the repository into a Vercel project. Use the **Vite** framework, `npm run build`, and output directory `dist`. The included `vercel.json` supplies these settings.
3. Deploy and note the resulting hostname, for example `your-portfolio.vercel.app`. The contact form uses the email-draft fallback until the settings below are added.

Vercel runs the included `api/contact.js` as a Node function alongside the Vite frontend. [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite). GitHub Pages can keep serving the static site, but the server function needs a server-capable host. This implementation is configured to keep the form and API on the same origin using Vercel.

## 3. Create a Cloudflare Turnstile widget

1. In your Cloudflare account, open **Turnstile → Add widget**.
2. Name it `Suprem Portfolio` and choose **Managed** mode.
3. Add your deployed hostname, such as `your-portfolio.vercel.app`, and your custom domain if you use one. Enter hostnames without `https://` or paths. For local development, also allow `localhost`.
4. Copy the **site key** and **secret key**. Keep the secret key private. [Cloudflare widget setup](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/).

The server checks the token, its hostname, and the `portfolio-contact` action before sending. Expired or reused tokens are rejected and the form creates a fresh challenge for retry. [Cloudflare server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## 4. Add the environment variables

Add these in your Vercel project's environment settings for Production, then redeploy. To test locally, copy `.env.example` to `.env.local` and enter them there instead. `.env.local` is ignored by Git.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Your private, sending-only Resend API key |
| `CONTACT_FROM_EMAIL` | `Portfolio <hello@your-verified-domain.com>` |
| `CONTACT_ALLOWED_ORIGIN` | Your exact site origin, e.g. `https://your-portfolio.vercel.app` |
| `TURNSTILE_SITE_KEY` | Your widget's public site key |
| `TURNSTILE_SECRET_KEY` | Your widget's private secret key |

Origins include the scheme and any port, but **no path or trailing slash**. For more than one origin, use a comma-separated list. Example:

```dotenv
CONTACT_ALLOWED_ORIGIN=https://your-portfolio.vercel.app,https://yourdomain.com
```

Use `http://localhost:5173` for local development. Add preview deployment origins explicitly if you want preview forms to send; production credentials do not need to be enabled for every preview. Never commit the populated environment file.

## 5. Verify delivery

1. Redeploy Vercel, or restart `npm run dev` locally after changing settings.
2. Open `/api/contact` on that site. It should return `ready: true` and the public site key, with no secrets. This checks configuration presence, not credential validity.
3. Open **Start a conversation**. The form should show the Turnstile widget and **Send message**.
4. Send your own test message and check both the Resend delivery log and `ssuprim26@gmail.com`, including spam. The UI reports provider acceptance only after a successful API response.
5. Reply to the email to verify the visitor's Reply-To address.

If it still shows **Open email draft**, one or more server settings are missing, the API is unreachable, or only the static `dist/` directory was deployed. If the security check fails, check the Turnstile hostname list and the exact allowed origin. If Resend rejects the message, check the API key's sending permission and verified sender/domain. The form keeps the visitor's draft when sending fails.

## Verification and privacy

`npm test` covers validation, missing configuration, origin rejection, challenge rejection, request-size limits, fixed-recipient enforcement, provider failure, and retry idempotency. These tests mock external services; they do not send email or solve real challenges. `npm run build` checks the production frontend bundle.

The app stores an unfinished draft in session storage for that browser tab, removes it after provider acceptance, and does not log message contents or secrets on the server. Resend processes the submitted name, email, and message; Cloudflare processes the security challenge. The form discloses these providers. Provider delivery and retention behavior is governed by the accounts you configure.

Turnstile and the honeypot reduce automated spam; they are not a per-IP rate limiter. For stricter traffic limits, configure a host-level rate-limit rule for `POST /api/contact` in your hosting account. The handler returns a retry message when the email provider rate-limits a request.
