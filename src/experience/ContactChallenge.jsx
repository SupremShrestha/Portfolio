import { useEffect, useRef, useState } from 'react';

let loading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = window.setTimeout(failed, 12000);
    function failed() { window.clearTimeout(timer); script.remove(); loading = null; reject(new Error('Security check unavailable')); }
    script.onerror = failed;
    script.onload = () => { window.clearTimeout(timer); if (window.turnstile) resolve(window.turnstile); else failed(); };
    document.head.appendChild(script);
  });
  return loading;
}

export default function ContactChallenge({ siteKey, onToken }) {
  const element = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false, widget;
    onToken('');
    loadTurnstile().then(api => {
      if (cancelled) return;
      widget = api.render(element.current, {
        sitekey: siteKey, action: 'portfolio-contact', theme: 'auto', size: 'flexible',
        callback: token => { if (!cancelled) { onToken(token); setError(''); } },
        'expired-callback': () => { if (!cancelled) onToken(''); },
        'error-callback': () => { if (!cancelled) { onToken(''); setError('The security check could not load. Retry below, or use email.'); } },
      });
    }).catch(() => { if (!cancelled) setError('The security check could not load. Retry below, or use email.'); });
    return () => { cancelled = true; if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [siteKey, onToken]);
  return <div className="contact-challenge"><div ref={element}/>{error && <p className="form-error" role="status">{error}</p>}</div>;
}
