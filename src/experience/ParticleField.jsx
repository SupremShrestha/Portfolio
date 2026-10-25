import { useEffect, useRef } from 'react';
import { THEMES } from '../lib/themes';
// Perspective star field with a gently twisting depth axis. Also powers the lab.
export default function ParticleField({ motionOn, theme, interactive = false, mode = 'attract', burst = 0, paused = false }) {
  const canvasRef = useRef(null);
  const pulseRef = useRef(0);
  const simulation = useRef({ time: 0, pointer: { x: .5, y: .5 }, eased: { x: .5, y: .5 } });
  useEffect(() => { pulseRef.current = motionOn ? 1 : 0; }, [burst, motionOn]);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0, width = 0, height = 0, time = simulation.current.time, last = 0, visible = true;
    const hex = THEMES.find((item) => item.id === theme)?.color || '#a594ff';
    const accent = [1,3,5].map((offset) => parseInt(hex.slice(offset,offset+2),16)).join(',');
    const { pointer, eased } = simulation.current;
    const stars = Array.from({ length: interactive ? 320 : 220 }, (_, i) => ({ x: Math.sin(i * 127.1) * 1.6, y: Math.cos(i * 73.7) * 1.2, z: (i * .618033) % 1, size: 1 + (i % 3) * .4 }));
    function render(now = 0) {
      frame = 0;
      if (!width) return;
      const delta = last ? Math.min(now - last, 40) : 0; last = now;
      if (motionOn && !paused) time += delta * .000018;
      simulation.current.time = time;
      eased.x += (pointer.x - eased.x) * .04; eased.y += (pointer.y - eased.y) * .04;
      ctx.clearRect(0, 0, width, height);
      const centerX = width * .5, centerY = height * (interactive ? .5 : .42);
      const min = Math.min(width, height), spin = time * .12;
      for (const star of stars) {
        const depth = (star.z + time * .15) % 1, scale = .15 + depth * 1.4;
        const angle = spin + star.z * .5;
        let x = (star.x * Math.cos(angle) - star.y * Math.sin(angle)) * min * scale;
        let y = (star.x * Math.sin(angle) + star.y * Math.cos(angle)) * min * scale * .7;
        if (interactive) {
          const dx = (eased.x - .5) * width - x, dy = (eased.y - .5) * height - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, 1 - distance / (min * .5)) * (mode === 'repel' ? -.55 : .55);
          x += dx * strength; y += dy * strength;
        } else { x += (eased.x - .5) * 20 * depth; y += (eased.y - .5) * 20 * depth; }
        const pulse = 1 + pulseRef.current * .5;
        ctx.beginPath(); ctx.arc(centerX + x * pulse, centerY + y * pulse, star.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent},${.12 + depth * .65})`; ctx.fill();
      }
      if (interactive) {
        ctx.strokeStyle = `rgba(${accent},.3)`; ctx.lineWidth = 1;
        const x = eased.x * width, y = eased.y * height;
        ctx.beginPath(); ctx.arc(x, y, 30 + pulseRef.current * 65, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 10,y); ctx.lineTo(x + 10,y); ctx.moveTo(x,y - 10); ctx.lineTo(x,y + 10); ctx.stroke();
      }
      pulseRef.current *= .95;
      if (motionOn && !paused && visible && !document.hidden) frame = requestAnimationFrame(render);
    }
    function size() {
      const bounds = canvas.getBoundingClientRect(); width = bounds.width; height = bounds.height;
      const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!frame) render();
    }
    function move(event) {
      if (!motionOn) return;
      const bounds = canvas.getBoundingClientRect(); pointer.x = (event.clientX - bounds.left) / width; pointer.y = (event.clientY - bounds.top) / height;
      if (paused && !frame) render();
    }
    function key(event) {
      if (!interactive || !motionOn) return;
      const delta = .05;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') pointer.x = Math.max(0, pointer.x - delta);
      if (event.key === 'ArrowRight') pointer.x = Math.min(1, pointer.x + delta);
      if (event.key === 'ArrowUp') pointer.y = Math.max(0, pointer.y - delta);
      if (event.key === 'ArrowDown') pointer.y = Math.min(1, pointer.y + delta);
      if (event.key === ' ') pulseRef.current = 1;
      if (!frame) render();
    }
    function pulse() { if (interactive && motionOn) { pulseRef.current = 1; if (!frame) render(); } }
    function visibility() { last = 0; if (document.hidden || !visible) { cancelAnimationFrame(frame); frame = 0; } else if (!frame) render(); }
    const resize = new ResizeObserver(size); resize.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); }); intersection.observe(canvas);
    const pointerSurface = interactive ? canvas : canvas.parentElement;
    pointerSurface.addEventListener('pointermove', move); canvas.addEventListener('pointerdown', pulse); canvas.addEventListener('keydown', key); document.addEventListener('visibilitychange', visibility); size();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); pointerSurface.removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', pulse); canvas.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', visibility); };
  }, [motionOn, theme, interactive, mode, paused]);
  return <canvas ref={canvasRef} className={interactive ? 'lab-canvas' : 'hero-particles'} aria-hidden={interactive ? undefined : true} tabIndex={interactive ? 0 : undefined} role={interactive ? 'img' : undefined} aria-label={interactive ? 'Interactive particle field. Use arrow keys to move the center and Space to pulse.' : undefined} />;
}
