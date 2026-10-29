import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy, Lightbulb, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { CONTACT_EMAIL, createContactMessage, createMailto, validateContact } from '../lib/contact';
import ContactChallenge from './ContactChallenge';
import useDialogMotion from '../hooks/useDialogMotion';
import { CONVERSATION_TOPICS, messageForTopic, resolveConversationTopic } from '../data/conversation';

const EMPTY = { name: '', email: '', message: '' };
const DRAFT_KEY = 'suprem-contact-draft';
const ENDPOINT = new URL('api/contact', new URL(import.meta.env.BASE_URL, typeof window === 'undefined' ? 'https://example.com/' : window.location.href)).pathname;
function readDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
    return Object.fromEntries(Object.keys(EMPTY).map(key => [key, typeof draft?.[key] === 'string' ? draft[key].slice(0, key === 'message' ? 3000 : key === 'name' ? 100 : 254) : '']));
  } catch { return EMPTY; }
}

function readTopic() {
  try { return resolveConversationTopic(JSON.parse(sessionStorage.getItem(DRAFT_KEY))?.topic).id; }
  catch { return CONVERSATION_TOPICS[0].id; }
}

export function ContactProgress({ values }) {
  const invalid = validateContact(values);
  const fields = [['name', 'Your name'], ['email', 'A way to reply'], ['message', 'Your idea']];
  const completed = fields.filter(([field]) => !invalid[field]).length;
  return <div className="conversation-progress" role="progressbar" aria-label="Message details completed" aria-valuemin={0} aria-valuemax={3} aria-valuenow={completed} aria-valuetext={`${completed} of 3 details ready`}><div aria-hidden="true">{fields.map(([field, label], index) => <span key={field} data-complete={!invalid[field]}><i>{!invalid[field] ? <Check size={12}/> : `0${index + 1}`}</i>{label}</span>)}</div></div>;
}

const TOPIC_ICONS = [Lightbulb, Sparkles, MessageCircle];
export default function Contact({ motionOn = true }) {
  const dialog = useRef(null), pending = useRef(false), requestId = useRef(null), successRef = useRef(null), feedbackRef = useRef(null);
  const [topic, setTopic] = useState(readTopic);
  const selectedTopic = resolveConversationTopic(topic);
  const [values, setValues] = useState(readDraft), [errors, setErrors] = useState({}), [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null), [copied, setCopied] = useState(''), [config, setConfig] = useState(null), [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(''), [attempt, setAttempt] = useState(0), [website, setWebsite] = useState('');
  const acceptToken = useCallback(value => setToken(value), []);
  useDialogMotion(dialog, isOpen, motionOn, { kind: 'contact', onExited: () => setToken('') });

  useEffect(() => {
    try { if (Object.values(values).some(Boolean)) sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, topic })); else sessionStorage.removeItem(DRAFT_KEY); } catch { /* Storage is optional. */ }
  }, [values, topic]);
  useEffect(() => {
    if (!isOpen || !status) return;
    const target = status.kind === 'success' ? successRef.current : feedbackRef.current;
    target?.scrollIntoView({ block: 'nearest', behavior: motionOn ? 'smooth' : 'instant' });
    if (status.kind === 'success') target?.focus({ preventScroll: true });
  }, [status, isOpen, motionOn]);
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    let active = true;
    fetch(ENDPOINT, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(data => { if (active) setConfig(data.ready === true && typeof data.siteKey === 'string' && data.siteKey ? data : { ready: false }); })
      .catch(() => { if (active) setConfig({ ready: false }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [isOpen]);

  function selectTopic(id) {
    if (pending.current) return;
    const next = resolveConversationTopic(id);
    const message = messageForTopic(values.message, next.id);
    setTopic(next.id);
    setValues(current => ({ ...current, message }));
    setErrors({}); setStatus(null); setCopied('');
    if (message !== values.message) requestId.current = null;
  }
  function open(id) {
    if (document.querySelector('dialog[open]')) return;
    if (typeof id === 'string') selectTopic(id);
    setConfig(null); setIsOpen(true);
  }
  function close() { setIsOpen(false); }
  function writeAgain() {
    setStatus(null); setErrors({}); setCopied('');
    requestAnimationFrame(() => dialog.current.querySelector('#contact-name')?.focus());
  }
  async function copy(kind) {
    try { await navigator.clipboard.writeText(kind === 'email' ? CONTACT_EMAIL : createContactMessage(values)); setCopied(kind); }
    catch { setCopied('failed'); }
  }
  function change(event) {
    setValues(current => ({ ...current, [event.target.name]: event.target.value }));
    setErrors(current => ({ ...current, [event.target.name]: undefined })); setStatus(null); setCopied(''); requestId.current = null;
  }
  async function submit(event) {
    event.preventDefault(); if (pending.current) return;
    const next = validateContact(values); setErrors(next);
    if (Object.keys(next).length) { event.currentTarget.elements.namedItem(Object.keys(next)[0])?.focus(); return; }
    if (!config) return;
    if (!config.ready) {
      window.location.href = createMailto(values);
      setStatus({ kind: 'info', text: 'Your email draft is ready. Send it from your email app to finish; this form has not sent it.' }); return;
    }
    if (!token) { setStatus({ kind: 'error', text: 'Please complete the security check before sending.' }); return; }
    pending.current = true; setSending(true); setStatus(null);
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const response = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, website, token, requestId: requestId.current }), signal: AbortSignal.timeout(22000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        if (result.errors) setErrors(result.errors);
        throw new Error(typeof result.error === 'string' ? result.error : 'Your message could not be sent. Please try again or use email.');
      }
      setStatus({ kind: 'success', text: 'Message accepted for delivery. Thanks for starting the conversation.' }); setValues(EMPTY); requestId.current = null;
    } catch (error) {
      setStatus({ kind: 'error', text: error.name === 'TimeoutError' || error instanceof TypeError || error instanceof SyntaxError ? 'Delivery could not be confirmed. Your draft is preserved; retry or use email below.' : error.message });
    } finally { pending.current = false; setSending(false); setToken(''); setAttempt(value => value + 1); }
  }

  return <>
    <section className="contact-new" id="contact" aria-labelledby="contact-title"><div className="contact-rings" aria-hidden="true"><i/><i/><i/></div><div className="wrap">
      <div className="contact-top" data-reveal><span className="overline">GOT SOMETHING IN MIND?</span><span className="overline">LET’S SEE WHERE IT GOES ↗</span></div>
      <div className="contact-invitation"><h2 id="contact-title" data-reveal>MAKE<br/>SOMETHING<br/><span>MATTER.</span></h2><div className="conversation-card" data-reveal><span className="conversation-symbol" aria-hidden="true"><MessageCircle size={34} strokeWidth={1}/></span><p className="overline">ONE CONVERSATION CAN BE A START</p><h3>An idea.<br/>A question.<br/>A simple hello.</h3><p>Bring whatever you’re thinking about.<br/>We can figure out the next part together.</p><button type="button" className="contact-start" onClick={() => open()}>Start a conversation <span><ArrowUpRight size={26}/></span></button></div></div>
      <div className="contact-bottom"><div className="contact-starters"><p className="overline">A FEW PLACES TO START</p><div>{CONVERSATION_TOPICS.map((item, index) => { const Icon = TOPIC_ICONS[index]; return <button type="button" key={item.id} disabled={sending} onClick={() => open(item.id)}><Icon size={16}/>{item.label}<ArrowUpRight size={14}/></button>; })}</div></div><div className="contact-direct"><span>OR KEEP IT SIMPLE</span><div><a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a><button type="button" aria-label="Copy email address" onClick={() => copy('email')}>{copied === 'email' ? <Check size={16}/> : <Copy size={16}/>}</button></div><p role="status">{copied === 'email' ? 'Email copied.' : copied === 'failed' ? 'Select the email address to copy it.' : ''}</p></div></div>
    </div></section>
    <footer className="new-footer"><div className="wrap footer-main"><a href="#home" className="new-brand" aria-label="Suprem Shrestha, back to home">s<span>s</span><i aria-hidden="true"/></a><p>AN INDEPENDENT MIND<br/><span>FROM KATHMANDU, NEPAL.</span></p><nav aria-label="Social links"><a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={14}/></a><a href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14}/></a></nav><a className="back-top" href="#home">BACK TO TOP <ArrowUp size={18}/></a></div><div className="wrap footer-legal"><span>© {new Date().getFullYear()} Suprem Shrestha</span><span>CODE. CAPTURE. LISTEN. LOOK UP.</span><a href="https://github.com/SupremShrestha/Portfolio" target="_blank" rel="noopener noreferrer">Source code ↗</a></div></footer>
    <dialog ref={dialog} className="contact-dialog" aria-labelledby="contact-form-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}><div className="contact-dialog-inner">
      <div className="sheet-top conversation-top"><span className="overline accent-text">A NEW CONVERSATION</span><button type="button" className="round-button" onClick={close} aria-label="Close contact form" autoFocus><X/></button></div>
      <aside className="conversation-aside"><div className="aside-orbit" aria-hidden="true"><i/><i/><MessageCircle size={32} strokeWidth={1}/></div><p className="overline accent-text">A LITTLE CONTEXT GOES A LONG WAY</p><div key={topic} className="conversation-hints"><h3>{selectedTopic.title}</h3><p>{selectedTopic.description}</p><ol>{selectedTopic.prompts.map((prompt, index) => <li key={prompt}><span>0{index + 1}</span>{prompt}</li>)}</ol></div><div className="conversation-aside-bottom"><span className="overline">KATHMANDU, NEPAL</span><p>Different time zones.<br/>The same curiosity.</p></div></aside>
      <div className="conversation-main"><h2 id="contact-form-title">It starts<br/>with hello<span>.</span></h2><p className="contact-form-intro">A project, a question, or something you’re curious about. I’d love to hear it.</p>
        {status?.kind === 'success' && <div className="contact-success" ref={successRef} tabIndex={-1} role="status"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29"/><path d="m18 32 9 9 20-21" pathLength="1"/></svg><h3>Thanks for reaching out.</h3><p>{status.text}</p><button type="button" className="new-button secondary" onClick={writeAgain}>Write another message <ArrowUpRight size={16}/></button></div>}
        <form className="conversation-form" onSubmit={submit} noValidate aria-busy={sending} hidden={status?.kind === 'success'}>
          <div className="conversation-topic-field" data-contact-reveal><span id="conversation-topic-label" className="overline">WHAT BRINGS YOU HERE?</span><div className="conversation-topics" role="group" aria-labelledby="conversation-topic-label">{CONVERSATION_TOPICS.map(item => <button type="button" key={item.id} aria-pressed={topic === item.id} disabled={sending} onClick={() => selectTopic(item.id)}>{item.short}</button>)}</div><p>Pick a starter, or write in your own words. Your edits stay when you switch.</p></div>
          <ContactProgress values={values}/>
          <div className="contact-field-pair" data-contact-reveal>{[['name', 'Your name', 'text', 'What should I call you?'], ['email', 'Email address', 'email', 'you@example.com']].map(([name, label, type, placeholder]) => <div className="new-form-field" key={name}><label htmlFor={'contact-' + name}>{label} <span>*</span></label><input id={'contact-' + name} name={name} type={type} autoComplete={name} value={values[name]} onChange={change} placeholder={placeholder} required maxLength={name === 'name' ? 100 : 254} disabled={sending} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? name + '-error' : undefined}/>{errors[name] && <p className="form-error" id={name + '-error'}>{errors[name]}</p>}</div>)}</div>
          <div className="new-form-field" data-contact-reveal><label htmlFor="contact-message">What are you thinking? <span>*</span></label><textarea id="contact-message" name="message" value={values.message} onChange={change} placeholder="An idea, a question, a possibility…" rows={5} maxLength={3000} required disabled={sending} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error message-count' : 'message-count'}/><div className="message-meta"><span>Your draft stays while you explore.</span><span id="message-count">{values.message.length.toLocaleString()} / 3,000</span></div>{errors.message && <p className="form-error" id="message-error">{errors.message}</p>}</div>
          <div className="contact-trap" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/></div>
          {isOpen && config?.ready && <><ContactChallenge key={attempt} siteKey={config.siteKey} onToken={acceptToken}/>{!token && <button type="button" className="quiet-link" onClick={() => setAttempt(value => value + 1)} disabled={sending}>Retry security check</button>}</>}
          <button className="new-button contact-submit" type="submit" disabled={sending || !config}>{sending ? 'Sending…' : !config ? 'Checking delivery…' : config.ready ? 'Send message' : 'Open email draft'}{sending ? <LoaderCircle className="sending-spinner" size={16}/> : <Send size={16}/>}</button>
          <p className="delivery-note">{config?.ready ? 'Ready to send. You can also use email directly below.' : config ? 'Direct delivery is currently unavailable. You can send a prefilled email draft instead.' : 'Checking the connection. You can also email me directly below.'}</p>
          <div ref={feedbackRef} className={`contact-feedback ${status?.kind || ''}`} role={status?.kind === 'error' ? 'alert' : 'status'} aria-live={status?.kind === 'error' ? 'assertive' : 'polite'}><p>{status?.kind !== 'success' ? status?.text : ''}</p></div>
          <div className="contact-alternatives"><a className="quiet-link" href={createMailto(values)}>Email me directly <ArrowUpRight size={14}/></a>{values.message.trim() && <button className="quiet-link" type="button" onClick={() => copy('message')}><Copy size={14}/>Copy message</button>}</div>
          <p className="contact-status" role="status">{copied === 'message' ? 'Message copied. Paste it into your email app.' : copied === 'failed' ? 'Clipboard unavailable. You can select and copy the text manually.' : ''}</p>
        </form>
      </div>
    </div></dialog>
  </>;
}
