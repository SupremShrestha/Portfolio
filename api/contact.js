import { createContactHandler } from '../server/contact.js';

// Vercel Node function. These variables remain exclusively on the server.
export default function handler(req, res) {
  return createContactHandler(process.env)(req, res);
}
