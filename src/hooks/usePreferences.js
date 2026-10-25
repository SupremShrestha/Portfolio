import { useEffect, useState } from 'react';

function readPreference(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { return window.localStorage.getItem('suprem-' + key) || fallback; } catch { return fallback; }
}

export default function usePreferences() {
  const [theme, setTheme] = useState(() => readPreference('theme', 'light') === 'dark' ? 'dark' : 'light');
  const [motion, setMotion] = useState(() => readPreference('motion', 'on') !== 'off');
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const motionOn = motion && !reducedMotion;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = motionOn ? 'on' : 'off';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f4f4' : '#171717');
    try {
      window.localStorage.setItem('suprem-theme', theme);
      window.localStorage.setItem('suprem-motion', motion ? 'on' : 'off');
    } catch { /* Preferences remain available in memory. */ }
  }, [theme, motion, motionOn]);
  return {
    theme, motionOn, reducedMotion,
    toggleTheme: () => setTheme((value) => value === 'light' ? 'dark' : 'light'),
    toggleMotion: () => setMotion((value) => !value),
  };
}
