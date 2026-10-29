import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Search, X } from 'lucide-react';
import { PROJECTS, PROJECT_CATEGORIES, filterProjects } from '../data/projects';
import { clearProjectUrl, copyProjectShareLink, getProjectHref, getProjectIdFromUrl, navigateToProject, PROJECT_OPEN_EVENT } from '../lib/projectNavigation';
import useDialogMotion from '../hooks/useDialogMotion';
import useAnimatedList from '../hooks/useAnimatedList';
import useProjectSurface from '../hooks/useProjectSurface';
import ProjectVisual from './ProjectVisual';

const FEATURED = PROJECTS.slice(0, 3);
const getSelected = () => PROJECTS.find(item => item.id === getProjectIdFromUrl()) || null;

function FeaturedCard({ project, index, motionOn, onOpen }) {
  const surface = useProjectSurface(motionOn);
  return <article className="showcase-panel" id={'showcase-' + index} data-index={index}>
    <div className="showcase-copy"><span className="project-big-number" aria-hidden="true">0{index + 1}</span><p className="overline">{project.category} / {project.technologies[0]}</p><h3>{project.title}</h3><p className="showcase-description">{project.subtitle}</p><div className="showcase-stack">{project.technologies.map(tool => <span key={tool}>{tool}</span>)}</div><a className="new-button" href={getProjectHref(project.id)} onClick={event => onOpen(event, project.id)}>Inside the project <ArrowUpRight size={17}/></a></div>
    <a className="showcase-art" ref={surface} href={getProjectHref(project.id)} onClick={event => onOpen(event, project.id)} aria-label={`Explore ${project.title}`}><div className="art-surface"><ProjectVisual project={project}/></div><span className="art-light" aria-hidden="true"/><span className="art-open"><ArrowUpRight size={23}/></span></a>
  </article>;
}

export function ProjectCaseStudy({ study }) {
  if (!study) return null;
  return <div className="case-study">
    <section><span className="overline accent-text">01 / THE PROBLEM</span><p>{study.problem}</p></section>
    <section><span className="overline accent-text">02 / THE BUILD</span><p>{study.build}</p></section>
    <section><span className="overline accent-text">03 / ENGINEERING DECISIONS</span><div className="case-decisions">{study.decisions.map(([title, copy]) => <div key={title}><h4>{title}</h4><p>{copy}</p></div>)}</div></section>
    <section className="case-outcome"><span className="overline accent-text">04 / THE RESULT</span><p>{study.outcome}</p><small>{study.evidence}</small></section>
  </div>;
}

function ProjectDemo({ project, open }) {
  const video = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const pause = () => { if (document.hidden) element.pause(); };
    if (!open) element.pause();
    document.addEventListener('visibilitychange', pause);
    return () => { element.pause(); document.removeEventListener('visibilitychange', pause); };
  }, [open]);
  if (!project.media?.video) return null;
  return <figure className="project-demo">{failed ? <p>The demo could not load. You can still explore the project source below.</p> : <video ref={video} controls playsInline preload="none" poster={project.media.screenshot ? import.meta.env.BASE_URL + project.media.screenshot : undefined} aria-label={`${project.title} demonstration`} onError={() => setFailed(true)} src={import.meta.env.BASE_URL + project.media.video}/>}<figcaption>{project.media.caption || `${project.title} demonstration`}</figcaption></figure>;
}

export default function Work({ motionOn }) {
  const [active, setActive] = useState(0), [category, setCategory] = useState('All projects'), [query, setQuery] = useState(''), [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(getSelected), [displayed, setDisplayed] = useState(getSelected), [copy, setCopy] = useState(null), [preview, setPreview] = useState(null);
  const pinRef = useRef(null), trackRef = useRef(null), scrollTween = useRef(null), dialogRef = useRef(null), archiveRef = useRef(null), requestRef = useRef(0);
  const listRef = useRef(null), exitsRef = useRef(null), originRef = useRef(null), originId = useRef(null);
  const matches = filterProjects(category, query), shown = expanded || query || category !== 'All projects' ? matches : matches.slice(0, 6);
  const listKey = shown.map(project => project.id).join('|');
  const captureList = useAnimatedList(listRef, exitsRef, listKey, motionOn);
  const isOpen = selected !== null;
  useDialogMotion(dialogRef, isOpen, motionOn, { originRef, fallbackRef: archiveRef, contentKey: displayed?.id });

  useEffect(() => {
    const sync = () => {
      const next = getSelected();
      requestRef.current += 1;
      if (next && next.id !== originId.current) originRef.current = null;
      setCopy(null); setPreview(null); setSelected(next);
      if (next) setDisplayed(next);
    };
    window.addEventListener(PROJECT_OPEN_EVENT, sync); window.addEventListener('popstate', sync);
    return () => { window.removeEventListener(PROJECT_OPEN_EVENT, sync); window.removeEventListener('popstate', sync); };
  }, []);
  useEffect(() => { if (displayed) { const inner = dialogRef.current.querySelector('.sheet-inner'); if (inner) inner.scrollTop = 0; } }, [displayed]);
  useEffect(() => {
    if (!motionOn) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 900px) and (min-height: 700px)', () => {
      const track = trackRef.current, pin = pinRef.current;
      pin.classList.add('is-pinned');
      const tween = gsap.to(track, { x: () => -(track.scrollWidth - pin.clientWidth), ease: 'none', scrollTrigger: { trigger: pin, start: 'top 85px', end: () => '+=' + innerWidth * 2.2, pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: self => setActive(Math.round(self.progress * (FEATURED.length - 1))) } });
      scrollTween.current = tween;
      const focus = event => {
        const panel = event.target.closest('.showcase-panel');
        if (!panel || event.target.matches(':hover')) return;
        const index = Number(panel.dataset.index), trigger = tween.scrollTrigger;
        pin.scrollLeft = 0;
        window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * index / (FEATURED.length - 1), behavior: 'instant' });
      };
      track.addEventListener('focusin', focus);
      return () => { track.removeEventListener('focusin', focus); pin.classList.remove('is-pinned'); scrollTween.current = null; };
    });
    return () => media.revert();
  }, [motionOn]);
  useEffect(() => {
    const resize = new ResizeObserver(() => ScrollTrigger.refresh());
    resize.observe(archiveRef.current);
    return () => resize.disconnect();
  }, []);
  function projectClick(event, id) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    originRef.current = event.currentTarget.closest('.showcase-panel')?.querySelector('.project-visual') || null;
    originId.current = id;
    navigateToProject(id);
  }
  function updateArchive(callback) { setPreview(null); captureList(); callback(); }
  function showPreview(event, project) {
    if (window.innerWidth < 900 || (event.type === 'pointerenter' && event.pointerType !== 'mouse')) return;
    const top = Math.max(100, Math.min(event.currentTarget.getBoundingClientRect().top - 70, window.innerHeight - 280));
    setPreview({ project, top });
  }
  function goTo(index) {
    const trigger = scrollTween.current?.scrollTrigger;
    if (trigger) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * index / (FEATURED.length - 1), behavior: motionOn ? 'smooth' : 'instant' });
    else document.getElementById('showcase-' + index)?.scrollIntoView({ behavior: motionOn ? 'smooth' : 'instant' });
  }
  function close() { requestRef.current += 1; clearProjectUrl(); setSelected(null); setCopy(null); }
  async function share() {
    if (!selected) return;
    const request = ++requestRef.current, id = selected.id;
    setCopy({ pending: true }); const result = await copyProjectShareLink(id);
    if (request === requestRef.current && dialogRef.current?.open) setCopy(result);
  }
  const selectedIndex = displayed ? PROJECTS.findIndex(project => project.id === displayed.id) : 0;
  return <section id="projects" className="work-new" aria-labelledby="work-title">
    <div className="wrap work-intro" data-reveal><div><p className="overline accent-text">IDEAS THAT LEFT THE NOTEBOOK</p><h2 id="work-title" className="display-heading">SELECTED<br/><span>WORK</span><sup>(03)</sup></h2></div><p>Different problems.<br/>The same drive to figure them out.<br/><span>Scroll through a few favorites.</span></p></div>
    <div className="showcase-pin" ref={pinRef}>
      <div className="showcase-track" ref={trackRef}>{FEATURED.map((project, index) => <FeaturedCard key={project.id} project={project} index={index} motionOn={motionOn} onOpen={projectClick}/>)}</div>
      <div className="showcase-navigation"><span className="overline">SCROLL TO DISCOVER <ArrowRight size={14}/></span><div className="showcase-dots" role="group" aria-label="Featured projects">{FEATURED.map((project, index) => <button key={project.id} type="button" aria-label={`Go to ${project.title}`} aria-pressed={active === index} onClick={() => goTo(index)}><span/>0{index + 1}</button>)}</div><span className="overline">0{active + 1} / 03</span></div>
    </div>
    <div className="wrap archive" ref={archiveRef} tabIndex={-1}>
      <div className="archive-heading" data-reveal><div><p className="overline accent-text">THE WIDER PICTURE</p><h3>More things<br/>I’ve put into the world<span>.</span></h3></div><span className="archive-total">{PROJECTS.length}<small>PROJECTS & EXPERIMENTS</small></span></div>
      <div className="archive-controls"><div className="archive-search"><Search size={17}/><label className="visually-hidden" htmlFor="project-search">Search all 17 projects</label><input type="search" id="project-search" placeholder="Search a project, tool, or idea" value={query} onChange={event => updateArchive(() => setQuery(event.target.value))}/></div><div className="archive-categories" role="group" aria-label="Filter projects by category">{PROJECT_CATEGORIES.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => updateArchive(() => setCategory(item))}>{item === 'All projects' ? 'All' : item}</button>)}</div></div>
      <p className="archive-count" role="status">{shown.length} of {matches.length} projects{query ? ` matching “${query}”` : ''}</p>
      <div className="archive-list-shell">
        <div className="archive-list" ref={listRef}>{shown.map(project => <a key={project.id} data-project={project.id} href={getProjectHref(project.id)} className="archive-row" onClick={event => projectClick(event, project.id)} onPointerEnter={event => showPreview(event, project)} onPointerLeave={() => setPreview(null)} onFocus={event => showPreview(event, project)} onBlur={() => setPreview(null)}><span className="archive-number">{project.number}</span><strong>{project.title}</strong><span className="archive-category">{project.category}</span><span className="archive-tech">{project.technologies.slice(0, 2).join(' / ')}</span><ArrowUpRight size={22}/></a>)}</div>
        <div className="archive-exits" ref={exitsRef} aria-hidden="true"/>
      </div>
      {preview && <div className="archive-preview" key={preview.project.id} style={{ top: preview.top }} aria-hidden="true"><ProjectVisual project={preview.project}/><span>{preview.project.title}<ArrowUpRight size={15}/></span></div>}
      {shown.length === 0 && <div className="archive-empty"><p>No match yet. Try another idea.</p><button type="button" className="new-button secondary" onClick={() => updateArchive(() => { setQuery(''); setCategory('All projects'); })}>Clear filters <X size={16}/></button></div>}
      <div className="archive-bottom">{!query && category === 'All projects' && <button type="button" className="new-button secondary" onClick={() => updateArchive(() => { setExpanded(!expanded); if (expanded) archiveRef.current.scrollIntoView({ behavior: motionOn ? 'smooth' : 'instant' }); })} aria-expanded={expanded}>{expanded ? 'Show selected projects' : `Show all ${PROJECTS.length} projects`}<ArrowDown size={16} style={{ rotate: expanded ? '180deg' : undefined }}/></button>}<a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer" className="quiet-link">Everything on GitHub <ArrowUpRight size={16}/></a></div>
    </div>
    <dialog className="project-sheet" ref={dialogRef} aria-labelledby="sheet-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      {displayed && <div className="sheet-inner">
        <div className="sheet-top"><span className="overline">PROJECT / {displayed.number}</span><button type="button" className="round-button" onClick={close} aria-label="Close project details" autoFocus><X/></button></div>
        <div className="sheet-visual" key={'visual-' + displayed.id}><ProjectVisual project={displayed}/></div>
        <div className="sheet-copy" key={displayed.id}>
          <p className="overline accent-text" data-sheet-reveal>{displayed.category}</p><h2 id="sheet-title" data-sheet-reveal>{displayed.title}</h2><p data-sheet-reveal>{displayed.description}</p><div className="showcase-stack" data-sheet-reveal>{displayed.technologies.map(tool => <span key={tool}>{tool}</span>)}</div>
          <ProjectDemo key={displayed.id} project={displayed} open={isOpen}/>
          <ProjectCaseStudy study={displayed.caseStudy}/>
          <h3>Inside the build</h3><ul>{displayed.highlights.map(item => <li key={item}>{item}</li>)}</ul>
          <div className="sheet-actions"><a className="new-button" href={displayed.github} target="_blank" rel="noopener noreferrer">Explore the source <ArrowUpRight size={17}/></a><button type="button" className="quiet-link" onClick={share} disabled={copy?.pending}>{copy?.copied ? <Check size={15}/> : <Copy size={15}/>}Copy project link</button></div><p className="share-status" role="status">{copy?.copied ? 'Project link copied.' : copy && !copy.pending ? 'Clipboard unavailable. Copy the link below.' : ''}</p>{copy && !copy.pending && !copy.copied && <input className="share-fallback" readOnly aria-label="Project share link" value={copy.url} onFocus={event => event.currentTarget.select()}/>}
          <div className="sheet-pagination"><button type="button" onClick={() => navigateToProject(PROJECTS[(selectedIndex - 1 + PROJECTS.length) % PROJECTS.length].id)}><ArrowLeft size={16}/>Previous</button><span className="overline">{selectedIndex + 1} / {PROJECTS.length}</span><button type="button" onClick={() => navigateToProject(PROJECTS[(selectedIndex + 1) % PROJECTS.length].id)}>Next<ArrowRight size={16}/></button></div>
        </div>
      </div>}
    </dialog>
  </section>;
}
