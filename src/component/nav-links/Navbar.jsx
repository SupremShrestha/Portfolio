import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Pause, Play, Sun, X } from 'lucide-react';
import './Navbar.css';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'playground', label: 'Play' },
  { id: 'contact', label: 'Let’s talk ↗' },
];

export default function Navbar({ theme, toggleTheme, motionOn, toggleMotion, reducedMotion }) {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      let current = 'home';
      for (const { id } of SECTIONS) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= 160) current = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) current = 'contact';
      setActiveSection(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (event.type === 'pointerdown' && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', dismiss); };
  }, [menuOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <a href="#home" className="brand" aria-label="Suprem Shrestha, home" onClick={() => setMenuOpen(false)}>suprem<span>.sh</span><span className="brand-spark" aria-hidden="true">✳</span></a>
        <nav className={'primary-nav ' + (menuOpen ? 'is-open' : '')} id="primary-navigation" aria-label="Main navigation">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={'#' + id} className={activeSection === id ? 'active' : ''}
              aria-current={activeSection === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="header-controls">
          <button type="button" className="header-control" onClick={toggleTheme} aria-label={'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode'} title={theme === 'light' ? 'Lights off' : 'Lights on'}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button type="button" className="header-control motion-control" onClick={toggleMotion} aria-pressed={!motionOn} disabled={reducedMotion} aria-label={motionOn ? 'Pause animations' : 'Resume animations'} title={reducedMotion ? 'Reduced motion follows your system preference' : motionOn ? 'Pause animations' : 'Resume animations'}>{motionOn ? <Pause size={16} /> : <Play size={16} />}</button>
          <button ref={menuButton} className="header-control menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
    </header>
  );
}
