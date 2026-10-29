import { useEffect, useRef } from 'react';

export default function useProjectSurface(motionOn) {
  const ref = useRef(null);
  useEffect(() => {
    const surface = ref.current;
    if (!motionOn || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      ['--tilt-x', '--tilt-y', '--light-x', '--light-y'].forEach(name => surface.style.removeProperty(name));
      surface.removeAttribute('data-lit');
    };
    const move = event => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        const bounds = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
        surface.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
        surface.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`);
        surface.style.setProperty('--light-x', `${x * 100}%`);
        surface.style.setProperty('--light-y', `${y * 100}%`);
        surface.dataset.lit = 'true';
      });
    };
    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('blur', reset);
    return () => { reset(); surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', reset); surface.removeEventListener('blur', reset); };
  }, [motionOn]);
  return ref;
}
