import { useEffect, useRef, useState } from 'react';

const REPLIES = ['poke me. I dare you.', 'oh, hi human!', 'hey! that tickles.', 'I’m meant to be supervising.', 'okay, we’re friends now.', 'one more? really?'];

export default function DeskBuddy({ motionOn }) {
  const [pokes, setPokes] = useState(0);
  const buddyRef = useRef(null);
  const drawingRef = useRef(null);

  useEffect(() => {
    if (!motionOn || !window.matchMedia('(pointer: fine)').matches) return;
    let frame;
    const point = { x: 0, y: 0 };
    const update = () => {
      frame = null;
      const box = buddyRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = Math.max(-6, Math.min(6, (point.x - box.left - box.width / 2) / 45));
      const dy = Math.max(-5, Math.min(5, (point.y - box.top - box.height / 2) / 45));
      buddyRef.current.style.setProperty('--eye-x', dx + 'px');
      buddyRef.current.style.setProperty('--eye-y', dy + 'px');
    };
    const move = (event) => { point.x = event.clientX; point.y = event.clientY; if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
      buddyRef.current?.style.setProperty('--eye-x', '0px');
      buddyRef.current?.style.setProperty('--eye-y', '0px');
    };
  }, [motionOn]);

  const poke = () => {
    setPokes((value) => value + 1);
    if (motionOn && drawingRef.current?.animate) {
      drawingRef.current.animate([
        { transform: 'rotate(0) scale(1)' },
        { transform: 'rotate(-9deg) scale(1.08, .88)' },
        { transform: 'rotate(7deg) scale(.96, 1.05)' },
        { transform: 'rotate(0) scale(1)' },
      ], { duration: 460, easing: 'ease-out' });
    }
  };

  return (
    <div className="buddy-scene" ref={buddyRef}>
      <div className="buddy-speech" role="status">{REPLIES[Math.min(pokes, REPLIES.length - 1)]}</div>
      <button className="buddy-button" type="button" onClick={poke} aria-label="Poke the desk buddy">
        <svg ref={drawingRef} className="buddy-drawing" viewBox="0 0 300 310" fill="none" aria-hidden="true">
          <ellipse className="buddy-shadow" cx="147" cy="282" rx="92" ry="10" fill="var(--ink)" opacity=".13" />
          <path d="M70 167C47 169 23 158 14 139M224 165C247 169 266 153 278 135" stroke="var(--ink)" strokeWidth="12" strokeLinecap="round" />
          <path d="M13 139L11 123M13 139L28 129M278 135L278 119M278 135L264 126" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
          <path d="M107 222L99 271M187 222L198 271" stroke="var(--ink)" strokeWidth="17" strokeLinecap="round" />
          <path d="M102 268C80 262 62 271 63 281C78 287 98 285 108 280M193 268C214 260 232 267 234 279C220 286 201 285 191 280" fill="var(--ink)" />
          <path d="M146 43C187 22 230 54 235 99C255 128 242 163 230 176C233 221 191 250 151 238C111 258 66 227 65 188C39 155 51 115 65 99C63 66 109 30 146 43Z" fill="var(--ink)" />
          <g className="buddy-eyes">
            <ellipse cx="118" cy="129" rx="27" ry="33" fill="var(--paper)" />
            <ellipse cx="178" cy="129" rx="27" ry="33" fill="var(--paper)" />
            <g className="buddy-pupils"><ellipse cx="121" cy="132" rx="9" ry="13" fill="var(--ink)" /><ellipse cx="181" cy="132" rx="9" ry="13" fill="var(--ink)" /></g>
          </g>
          <path d={pokes % 2 ? 'M128 183Q150 207 173 180' : 'M134 185Q150 192 165 183'} stroke="var(--paper)" strokeWidth="5" strokeLinecap="round" />
          <path d="M99 66L112 58M187 61L199 71" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" opacity=".45" />
        </svg>
      </button>
      <p className="buddy-caption mono">{pokes ? 'POKES RECEIVED: ' + String(pokes).padStart(2, '0') : 'RESIDENT PIXEL SUPERVISOR'}</p>
    </div>
  );
}
