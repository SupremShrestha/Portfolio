import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, FolderOpen, Keyboard, Moon, Search, Waves, X } from 'lucide-react';
import { filterProjects, PROJECTS } from '../../data/projects';
import { getProjectHref, navigateToProject } from '../../lib/projectNavigation';
import './SiteTools.css';

const PLACES = [
  { id: 'home', number: '01', title: 'Back to the desk', detail: 'Home · Suprem Shrestha', keywords: 'home introduction start hero' },
  { id: 'projects', number: '02', title: 'See what I’ve built', detail: `The project drawer · All ${PROJECTS.length} projects`, keywords: 'projects work portfolio builds development data automation' },
  { id: 'about', number: '03', title: 'Meet the human', detail: 'About · Skills & a little personality', keywords: 'about biography skills human me' },
  { id: 'education', number: '04', title: 'The learning bit', detail: 'Education · The journey so far', keywords: 'education school university learning journey experience' },
  { id: 'playground', number: '05', title: 'Go play something', detail: 'Playground · Doodles & bug catching', keywords: 'playground game fun draw doodle bugs canvas' },
  { id: 'contact', number: '06', title: 'Send me a hello', detail: 'Contact · A new conversation', keywords: 'contact email message hello hire collaborate social github linkedin' },
];

function isPlainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function SiteTools({ theme, motionOn, toggleTheme, toggleMotion, reducedMotion }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [allProjects, setAllProjects] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const sections = searching ? PLACES.filter((place) => words.every((word) => `${place.title} ${place.detail} ${place.keywords}`.toLowerCase().includes(word))) : PLACES;
  const matchingProjects = searching ? filterProjects('All projects', query) : PROJECTS;
  const projects = searching || allProjects ? matchingProjects : matchingProjects.filter((project) => project.featured).slice(0, 3);
  const count = sections.length + projects.length;

  function openMenu() {
    if (document.querySelector('dialog[open]')) return;
    pendingNavigationRef.current = null;
    setQuery('');
    setAllProjects(false);
    setOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    const shortcuts = (event) => {
      if (event.repeat || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      if (dialogRef.current?.open) {
        event.preventDefault();
        dialogRef.current.close();
        return;
      }
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      pendingNavigationRef.current = null;
      setQuery('');
      setAllProjects(false);
      setOpen(true);
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, []);

  useEffect(() => {
    if (!open) {
      const navigate = pendingNavigationRef.current;
      if (!navigate) return;
      pendingNavigationRef.current = null;
      // Restore scrolling and native focus before opening a project dialog.
      const frame = window.requestAnimationFrame(navigate);
      return () => window.cancelAnimationFrame(frame);
    }
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (allProjects) resultsRef.current?.querySelector('.shortcut-project-results [data-shortcut-result]')?.focus();
  }, [allProjects]);

  function chooseSection(event, id) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    pendingNavigationRef.current = () => {
      window.location.hash = id;
      document.getElementById(id)?.scrollIntoView({ behavior: motionOn ? 'smooth' : 'auto', block: 'start' });
    };
    closeMenu();
  }

  function chooseProject(event, id) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    pendingNavigationRef.current = () => navigateToProject(id);
    closeMenu();
  }

  function resultLinks() {
    return Array.from(resultsRef.current?.querySelectorAll('[data-shortcut-result]') || []);
  }

  function searchKeys(event) {
    if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const links = resultLinks();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const target = event.key === 'ArrowDown' ? links[0] : links[links.length - 1];
      target?.focus();
    } else if (event.key === 'Enter' && links.length) {
      event.preventDefault();
      links[0].click();
    }
  }

  function browseResults(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const link = event.target.closest('[data-shortcut-result]');
    if (!link) return;
    event.preventDefault();
    const links = resultLinks();
    const index = links.indexOf(link);
    if (event.key === 'ArrowUp' && index === 0) { inputRef.current?.focus(); return; }
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  }

  function clearSearch() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <>
      <button className="shortcut-trigger" type="button" onClick={openMenu} aria-haspopup="dialog" aria-controls="shortcut-dialog" aria-label="Open search and jump menu" title="Search and jump (Ctrl or Command + K)"><Keyboard size={17} aria-hidden="true" /><span>jump</span></button>
      <dialog id="shortcut-dialog" ref={dialogRef} className="shortcut-dialog" aria-labelledby="shortcut-title" aria-describedby="shortcut-intro" onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
        <div className="shortcut-inner">
          <div className="shortcut-heading"><h2 id="shortcut-title">Take a shortcut.</h2><button type="button" onClick={closeMenu} aria-label="Close search menu"><X size={21} aria-hidden="true" /></button></div>
          <p className="shortcut-intro" id="shortcut-intro">Find a corner of the site, a project, or that one tool you’re curious about.</p>
          <div className="shortcut-search">
            <label htmlFor="shortcut-search" className="visually-hidden">Search sections and all {PROJECTS.length} projects</label>
            <Search size={19} aria-hidden="true" />
            <input id="shortcut-search" ref={inputRef} type="search" value={query} autoComplete="off" spellCheck="false" maxLength={120} placeholder="Try “React”, “Python”, or “playground”…" aria-controls="shortcut-results" aria-describedby="shortcut-key-help" onChange={(event) => setQuery(event.target.value)} onKeyDown={searchKeys} />
            {query && <button type="button" onClick={clearSearch} aria-label="Clear shortcut search"><X size={17} aria-hidden="true" /></button>}
          </div>
          <div className="shortcut-results-meta"><p role="status" aria-live="polite" aria-atomic="true">{searching ? `${count} ${count === 1 ? 'result' : 'results'} · ${sections.length} ${sections.length === 1 ? 'section' : 'sections'}, ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` : `${sections.length} sections + ${projects.length} ${allProjects ? 'projects' : 'selected projects'}`}</p><span id="shortcut-key-help"><kbd>↑</kbd><kbd>↓</kbd> browse · <kbd>Enter</kbd> go</span></div>
          <div className="shortcut-results" id="shortcut-results" ref={resultsRef} onKeyDown={browseResults}>
            {sections.length > 0 && <nav className="shortcut-result-group" aria-label="Section shortcuts"><h3 className="mono">Around here <span>{sections.length}</span></h3>{sections.map((place) => <a data-shortcut-result href={'#' + place.id} key={place.id} onClick={(event) => chooseSection(event, place.id)}><span className="shortcut-result-number mono">{place.number}</span><span className="shortcut-result-copy"><strong>{place.title}</strong><small>{place.detail}</small></span><ArrowDownRight size={17} aria-hidden="true" /></a>)}</nav>}
            {projects.length > 0 && <nav className="shortcut-result-group shortcut-project-results" aria-label="Project shortcuts"><h3 className="mono">{searching || allProjects ? 'From the project drawer' : 'A few selected builds'} <span>{projects.length}</span></h3>{projects.map((project) => {
              const matchingTools = searching ? project.technologies.filter((technology) => words.some((word) => technology.toLowerCase().includes(word))) : [];
              const tools = matchingTools.length ? matchingTools : project.technologies.slice(0, 3);
              return <a data-shortcut-result href={getProjectHref(project.id)} key={project.id} onClick={(event) => chooseProject(event, project.id)}><span className="shortcut-project-icon"><FolderOpen size={18} aria-hidden="true" /></span><span className="shortcut-result-copy"><strong>{project.title}</strong><small><span className="shortcut-category">{project.category}</span>{tools.length > 0 && <> · {tools.join(' · ')}</>}</small></span><ArrowUpRight size={16} aria-hidden="true" /></a>;
            })}</nav>}
            {!count && <div className="shortcut-empty"><Search size={26} aria-hidden="true" /><h3>No shortcuts for “{query.trim()}”.</h3><p>Try a project name, a category like “AI & data”, or a tool like “React”.</p><button type="button" onClick={clearSearch}>Clear search & start again <X size={14} aria-hidden="true" /></button></div>}
            {!searching && !allProjects && <button type="button" className="shortcut-show-all" onClick={() => setAllProjects(true)}>Open the whole drawer <span>All {PROJECTS.length} projects</span><ArrowDownRight size={16} aria-hidden="true" /></button>}
          </div>
          <div className="shortcut-preferences" role="group" aria-label="Site preferences"><button type="button" onClick={toggleTheme} aria-label="Dark theme" aria-pressed={theme === 'dark'}><Moon size={16} aria-hidden="true" /><span>Theme</span><strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong></button><button type="button" onClick={toggleMotion} aria-label="Animations" aria-pressed={motionOn} disabled={reducedMotion} aria-describedby={reducedMotion ? 'shortcut-motion-note' : undefined}><Waves size={17} aria-hidden="true" /><span>Animations</span><strong>{motionOn ? 'On' : 'Off'}</strong></button></div>
          {reducedMotion && <p className="shortcut-motion-note" id="shortcut-motion-note">Animations follow your system’s reduced-motion preference.</p>}
          <div className="shortcut-keys"><span><kbd>Ctrl / ⌘</kbd><kbd>K</kbd> search from anywhere</span><span><kbd>Esc</kbd> close</span><span className="shortcut-native-hint">Tab works here, too.</span></div>
        </div>
      </dialog>
    </>
  );
}
