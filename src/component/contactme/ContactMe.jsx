import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { ArrowUpRight, Check, Copy, Github, Linkedin, MapPin, Send } from 'lucide-react';
import { CONTACT_EMAIL, createContactMessage, createMailto, validateContact } from '../../lib/contact';
import './ContactMe.css';

const INITIAL_FORM = { name: '', email: '', message: '' };
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
const CAN_SEND_DIRECTLY = Object.values(EMAILJS_CONFIG).every(Boolean);

export default function Contact() {
  const [values, setValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState({});

  const change = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setStatus(null);
    setCopyFeedback((previous) => ({ ...previous, message: '' }));
  };

  const copy = async (kind, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback((previous) => ({ ...previous, [kind]: 'copied' }));
    } catch {
      setCopyFeedback((previous) => ({ ...previous, [kind]: 'unavailable' }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus(null);
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    if (!CAN_SEND_DIRECTLY) {
      window.location.href = createMailto(values);
      setStatus({ type: 'info', message: 'If your email app opened, send the draft there to finish. Otherwise, copy your message and email me directly. Your message is kept here.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        from_name: values.name.trim(),
        from_email: values.email.trim(),
        name: values.name.trim(),
        email: values.email.trim(),
        reply_to: values.email.trim(),
        to_name: 'Suprem Shrestha',
        message: values.message.trim(),
      }, { publicKey: EMAILJS_CONFIG.publicKey });
      setStatus({ type: 'success', message: 'Message sent. Thanks for reaching out — I’ll be in touch!' });
      setValues(INITIAL_FORM);
      setCopyFeedback((previous) => ({ ...previous, message: '' }));
    } catch {
      setStatus({ type: 'error', message: 'Your message could not be sent. It’s still here — please try again, email me directly, or copy your message below.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <p className="section-label">05 / A NOTE IN MY INBOX</p>
        <div className="contact-layout">
          <div className="contact-copy">
            <h2 className="section-title" id="contact-heading">Your idea.<br />My inbox<span>↗</span></h2>
            <p>Got a project? A question? A really good joke?<br />I’m all ears.</p>
            <div className="email-block">
              <span className="mono">DROP ME A LINE</span>
              <div className="email-address-row"><a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a><button className="copy-email" type="button" aria-label="Copy email address" onClick={() => copy('email', CONTACT_EMAIL)}>{copyFeedback.email === 'copied' ? <Check size={16} /> : <Copy size={16} />}</button></div>
              <span className="copy-feedback" role="status">{copyFeedback.email === 'copied' ? 'Email address copied.' : copyFeedback.email === 'unavailable' ? 'Select the email address above to copy it.' : ''}</span>
            </div>
            <p className="contact-location"><MapPin size={15} aria-hidden="true" /> Kathmandu, Nepal</p>
            <div className="contact-socials">
              <a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer"><Github size={16} aria-hidden="true" /> GitHub <ArrowUpRight size={13} aria-hidden="true" /></a>
              <a href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer"><Linkedin size={16} aria-hidden="true" /> LinkedIn <ArrowUpRight size={13} aria-hidden="true" /></a>
            </div>
          </div>
          <form className="contact-form" onSubmit={submit} noValidate aria-busy={submitting}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label>
                <input id="contact-name" name="name" value={values.name} onChange={change} placeholder="What should I call you?" autoComplete="name" required maxLength={100} disabled={submitting} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
                {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                <input id="contact-email" name="email" type="email" value={values.email} onChange={change} placeholder="you@example.com" autoComplete="email" required maxLength={254} disabled={submitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">What’s on your mind? <span aria-hidden="true">*</span></label>
              <textarea id="contact-message" name="message" value={values.message} onChange={change} placeholder="Tell me a little about your idea…" rows={5} required maxLength={3000} disabled={submitting} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : 'message-hint'} />
              {errors.message && <p className="field-error" id="message-error">{errors.message}</p>}
              <span className="message-hint" id="message-hint">{values.message.length.toLocaleString()} / 3,000</span>
            </div>
            <div className="form-actions">
              <button type="submit" className="button" disabled={submitting}>{submitting ? 'Sending…' : CAN_SEND_DIRECTLY ? 'Send message' : 'Open email draft'}<Send size={14} aria-hidden="true" /></button>
              {values.message.trim() && <button type="button" className="copy-message" onClick={() => copy('message', createContactMessage(values))}>{copyFeedback.message === 'copied' ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}{copyFeedback.message === 'copied' ? 'Copied' : 'Copy message'}</button>}
            </div>
            <p className="form-note">{CAN_SEND_DIRECTLY ? 'Your message goes straight to my inbox.' : 'Opens your email app with your message ready to send.'}</p>
            <div className="form-feedback" aria-live="polite" aria-atomic="true">
              {status && <p className={'form-status ' + status.type}>{status.message}</p>}
              {copyFeedback.message === 'copied' && <p className="form-status">Message copied. Paste it into an email to {CONTACT_EMAIL}.</p>}
              {copyFeedback.message === 'unavailable' && <p className="form-status">Copying isn’t available here. You can select your message above and copy it manually.</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
