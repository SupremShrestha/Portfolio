import { useEffect, useState } from 'react';
import { resolveTheme, THEMES } from '../lib/themes';
function readPreference(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { return window.localStorage.getItem('suprem-' + key) || fallback; } catch { return fallback; }
}
export default function usePreferences() {
  const [theme, setTheme] = useState(() => resolveTheme(readPreference('visual-theme', 'void')));
  const [motion, setMotion] = useState(() => readPreference('motion', 'on') !== 'off');
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const motionOn = motion && !reducedMotion;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = motionOn ? 'on' : 'off';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES.find((item) => item.id === theme).background);
    try { window.localStorage.setItem('suprem-visual-theme', theme); window.localStorage.setItem('suprem-motion', motion ? 'on' : 'off'); } catch { /* Optional persistence. */ }
  }, [theme, motion, motionOn]);
  return { theme, setTheme: (value) => setTheme(resolveTheme(value)), motionOn, reducedMotion, toggleMotion: () => setMotion((value) => !value) };
}
