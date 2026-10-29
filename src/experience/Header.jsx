import { useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { THEMES } from '../lib/themes';
import useDialogMotion from '../hooks/useDialogMotion';

const LINKS = [['home', 'Start'], ['projects', 'Selected work'], ['about', 'The human'], ['interests', 'Other orbits'], ['playground', 'Experiment'], ['contact', 'Say hello']];
function MenuIcon({ open }) {
  return <span className="menu-glyph" data-open={open} aria-hidden="true"><i/><i/></span>;
}
export default function Header({ theme, setTheme, motionOn, toggleMotion, reducedMotion }) {
  const dialog = useRef(null), destination = useRef(null);
  const [open, setOpen] = useState(false);
  function afterClose() {
    const id = destination.current;
    destination.current = null;
    if (!id) return;
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: motionOn ? 'smooth' : 'instant' });
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    history.replaceState(null, '', '#' + id);
  }
  useDialogMotion(dialog, open, motionOn, { kind: 'menu', onExited: afterClose });
  function close() { setOpen(false); }
  function navigate(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); destination.current = id; close();
  }
  return <>
    <header className="new-header">
      <a className="new-brand" href="#home" aria-label="Suprem Shrestha, home">s<span>s</span><i aria-hidden="true" /></a>
      <div className="theme-switcher" role="group" aria-label="Color theme"><span className="theme-current">{THEMES.find(item => item.id === theme).name}</span>{THEMES.map(item => <button type="button" key={item.id} aria-label={`${item.name} theme`} aria-pressed={theme === item.id} onClick={event => { const box = event.currentTarget.getBoundingClientRect(); setTheme(item.id, { x: box.left + box.width / 2, y: box.top + box.height / 2 }); }} style={{ '--swatch': item.color }} title={item.name}><span /></button>)}</div>
      <div className="header-right"><button className="motion-button" type="button" disabled={reducedMotion} aria-pressed={!motionOn} onClick={toggleMotion} aria-label={motionOn ? 'Pause animations' : 'Resume animations'} title={reducedMotion ? 'Reduced motion follows your device setting' : 'Toggle motion'}>{motionOn ? <Pause size={15} /> : <Play size={15} />}</button><button className="menu-button" type="button" onClick={() => { if (!document.querySelector('dialog[open]')) setOpen(true); }} aria-label="Open navigation menu" aria-expanded={open} aria-controls="site-menu"><span>INDEX</span><MenuIcon open={open}/></button></div>
    </header>
    <dialog ref={dialog} id="site-menu" className="menu-dialog" aria-label="Site navigation" onCancel={event => { event.preventDefault(); close(); }}><div className="menu-inner"><div className="menu-top"><span className="overline">TAKE A LOOK AROUND</span><button className="round-button menu-close" type="button" onClick={close} aria-label="Close navigation menu" autoFocus><MenuIcon open={open}/></button></div><nav aria-label="Main navigation">{LINKS.map(([id, label], i) => <a href={'#' + id} key={id} onClick={event => navigate(event, id)}><span className="overline">0{i + 1}</span><strong>{label}</strong><ArrowUpRight /></a>)}</nav><div className="menu-bottom"><span>Kathmandu, Nepal</span><a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div></dialog>
  </>;
}
