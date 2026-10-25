import { useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { THEMES } from '../lib/themes';
const LINKS = [['home', 'Start'], ['projects', 'Selected work'], ['about', 'The human'], ['playground', 'Experiment'], ['contact', 'Say hello']];
export default function Header({ theme, setTheme, motionOn, toggleMotion, reducedMotion }) {
  const dialog = useRef(null), opener = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const close = () => { document.body.style.overflow = ''; opener.current?.focus({ preventScroll: true }); };
    element.addEventListener('close', close);
    return () => { element.removeEventListener('close', close); document.body.style.overflow = ''; };
  }, []);
  function open() { if (document.querySelector('dialog[open]')) return; dialog.current.showModal(); document.body.style.overflow = 'hidden'; }
  function navigate(event, id) {
    event.preventDefault(); dialog.current.close();
    requestAnimationFrame(() => { document.getElementById(id)?.scrollIntoView({ behavior: motionOn ? 'smooth' : 'instant' }); history.replaceState(null, '', '#' + id); });
  }
  return <>
    <header className="new-header">
      <a className="new-brand" href="#home" aria-label="Suprem Shrestha, home">s<span>s</span><i aria-hidden="true" /></a>
      <div className="theme-switcher" role="group" aria-label="Color theme"><span className="theme-current">{THEMES.find((item) => item.id === theme).name}</span>{THEMES.map((item) => <button type="button" key={item.id} aria-label={`${item.name} theme`} aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} style={{ '--swatch': item.color }} title={item.name}><span /></button>)}</div>
      <div className="header-right"><button className="motion-button" type="button" disabled={reducedMotion} aria-pressed={!motionOn} onClick={toggleMotion} aria-label={motionOn ? 'Pause animations' : 'Resume animations'} title={reducedMotion ? 'Reduced motion follows your device setting' : 'Toggle motion'}>{motionOn ? <Pause size={15} /> : <Play size={15} />}</button><button className="menu-button" ref={opener} type="button" onClick={open} aria-label="Open navigation menu"><span>INDEX</span><Menu size={22} /></button></div>
    </header>
    <dialog ref={dialog} className="menu-dialog" aria-label="Site navigation"><div className="menu-inner"><div className="menu-top"><span className="overline">TAKE A LOOK AROUND</span><button className="round-button" type="button" onClick={() => dialog.current.close()} aria-label="Close navigation menu" autoFocus><X /></button></div><nav aria-label="Main navigation">{LINKS.map(([id, label], i) => <a href={'#' + id} key={id} onClick={(event) => navigate(event, id)}><span className="overline">0{i + 1}</span><strong>{label}</strong><ArrowUpRight /></a>)}</nav><div className="menu-bottom"><span>Kathmandu, Nepal</span><a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div></dialog>
  </>;
}
