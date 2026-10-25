import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Search, X } from 'lucide-react';
import { PROJECTS, PROJECT_CATEGORIES, filterProjects } from '../data/projects';
import { clearProjectUrl, copyProjectShareLink, getProjectHref, getProjectIdFromUrl, navigateToProject, PROJECT_OPEN_EVENT } from '../lib/projectNavigation';
import ProjectVisual from './ProjectVisual';
const FEATURED = PROJECTS.slice(0,3);
const getSelected = () => PROJECTS.find((item) => item.id === getProjectIdFromUrl()) || null;
function projectClick(event, id) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); navigateToProject(id);
}
export default function Work({ motionOn }) {
  const [active, setActive] = useState(0), [category, setCategory] = useState('All projects'), [query, setQuery] = useState(''), [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(getSelected), [copy, setCopy] = useState(null);
  const pinRef = useRef(null), trackRef = useRef(null), scrollTween = useRef(null), dialogRef = useRef(null), archiveRef = useRef(null), requestRef = useRef(0);
  const matches = filterProjects(category,query), shown = expanded || query || category !== 'All projects' ? matches : matches.slice(0,6);
  const isOpen = selected !== null;
  useEffect(() => {
    const sync = () => { requestRef.current += 1; setCopy(null); setSelected(getSelected()); };
    window.addEventListener(PROJECT_OPEN_EVENT, sync); window.addEventListener('popstate', sync);
    return () => { window.removeEventListener(PROJECT_OPEN_EVENT, sync); window.removeEventListener('popstate', sync); };
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current, opener = document.activeElement, previous = document.body.style.overflow, archive = archiveRef.current;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previous; if (opener && opener !== document.body && opener.isConnected) opener.focus({ preventScroll: true }); else archive?.focus({ preventScroll: true }); };
  }, [isOpen]);
  useEffect(() => { if (selected) dialogRef.current.scrollTop = 0; }, [selected]);
  useEffect(() => {
    if (!motionOn) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 900px) and (min-height: 700px)', () => {
      const track = trackRef.current, pin = pinRef.current;
      pin.classList.add('is-pinned');
      const tween = gsap.to(track, { x: () => -(track.scrollWidth - pin.clientWidth), ease: 'none', scrollTrigger: { trigger: pin, start: 'top 85px', end: () => '+=' + innerWidth * 2.2, pin: true, scrub: .8, invalidateOnRefresh: true, onUpdate: (self) => setActive(Math.round(self.progress * (FEATURED.length-1))) } });
      scrollTween.current = tween;
      const focus = (event) => {
        const panel = event.target.closest('.showcase-panel');
        if (!panel || event.target.matches(':hover')) return;
        const index = Number(panel.dataset.index), trigger = tween.scrollTrigger;
        pin.scrollLeft = 0;
        window.scrollTo({ top: trigger.start + (trigger.end-trigger.start) * index/(FEATURED.length-1), behavior: 'instant' });
      };
      track.addEventListener('focusin',focus);
      return () => { track.removeEventListener('focusin',focus); pin.classList.remove('is-pinned'); scrollTween.current = null; };
    });
    return () => media.revert();
  }, [motionOn]);
  function goTo(index) {
    const trigger = scrollTween.current?.scrollTrigger;
    if (trigger) window.scrollTo({ top: trigger.start+(trigger.end-trigger.start)*index/(FEATURED.length-1), behavior: motionOn ? 'smooth' : 'instant' });
    else document.getElementById('showcase-'+index)?.scrollIntoView({ behavior: motionOn ? 'smooth' : 'instant' });
  }
  function close() { requestRef.current += 1; clearProjectUrl(); setSelected(null); setCopy(null); }
  async function share() {
    const request = ++requestRef.current, id = selected.id;
    setCopy({ pending: true }); const result = await copyProjectShareLink(id);
    if (request === requestRef.current && dialogRef.current?.open) setCopy(result);
  }
  const selectedIndex = selected ? PROJECTS.findIndex((project) => project.id === selected.id) : 0;
  return <section id="projects" className="work-new" aria-labelledby="work-title">
    <div className="wrap work-intro" data-reveal><div><p className="overline accent-text">IDEAS THAT LEFT THE NOTEBOOK</p><h2 id="work-title" className="display-heading">SELECTED<br /><span>WORK</span><sup>(03)</sup></h2></div><p>Different problems.<br />The same drive to figure them out.<br /><span>Scroll through a few favorites.</span></p></div>
    <div className="showcase-pin" ref={pinRef}>
      <div className="showcase-track" ref={trackRef}>{FEATURED.map((project,index)=><article className="showcase-panel" key={project.id} id={'showcase-'+index} data-index={index}>
        <div className="showcase-copy"><span className="project-big-number" aria-hidden="true">0{index+1}</span><p className="overline">{project.category} / {project.technologies[0]}</p><h3>{project.title}</h3><p className="showcase-description">{project.subtitle}</p><div className="showcase-stack">{project.technologies.map((tool)=><span key={tool}>{tool}</span>)}</div><a className="new-button" href={getProjectHref(project.id)} onClick={(event)=>projectClick(event,project.id)}>Inside the project <ArrowUpRight size={17}/></a></div>
        <a className="showcase-art" href={getProjectHref(project.id)} onClick={(event)=>projectClick(event,project.id)} aria-label={`Explore ${project.title}`}><ProjectVisual project={project}/><span className="art-open"><ArrowUpRight size={23}/></span></a>
      </article>)}</div>
      <div className="showcase-navigation"><span className="overline">SCROLL TO DISCOVER <ArrowRight size={14}/></span><div className="showcase-dots" role="group" aria-label="Featured projects">{FEATURED.map((project,index)=><button key={project.id} type="button" aria-label={`Go to ${project.title}`} aria-pressed={active===index} onClick={()=>goTo(index)}><span/>0{index+1}</button>)}</div><span className="overline">0{active+1} / 03</span></div>
    </div>
    <div className="wrap archive" ref={archiveRef} tabIndex={-1}>
      <div className="archive-heading" data-reveal><div><p className="overline accent-text">THE WIDER PICTURE</p><h3>More things<br />I’ve put into the world<span>.</span></h3></div><span className="archive-total">{PROJECTS.length}<small>PROJECTS & EXPERIMENTS</small></span></div>
      <div className="archive-controls"><div className="archive-search"><Search size={17}/><label className="visually-hidden" htmlFor="project-search">Search all 17 projects</label><input type="search" id="project-search" placeholder="Search a project, tool, or idea" value={query} onChange={(event)=>setQuery(event.target.value)}/></div><div className="archive-categories" role="group" aria-label="Filter projects by category">{PROJECT_CATEGORIES.map((item)=><button key={item} type="button" aria-pressed={category===item} onClick={()=>setCategory(item)}>{item==='All projects'?'All':item}</button>)}</div></div>
      <p className="archive-count" role="status">{shown.length} of {matches.length} projects{query ? ` matching “${query}”` : ''}</p>
      <div className="archive-list">{shown.map((project)=><a key={project.id} href={getProjectHref(project.id)} className="archive-row" onClick={(event)=>projectClick(event,project.id)}><span className="archive-number">{project.number}</span><strong>{project.title}</strong><span className="archive-category">{project.category}</span><span className="archive-tech">{project.technologies.slice(0,2).join(' / ')}</span><ArrowUpRight size={22}/></a>)}</div>
      {shown.length===0&&<div className="archive-empty"><p>No match yet. Try another idea.</p><button type="button" className="new-button secondary" onClick={()=>{setQuery('');setCategory('All projects');}}>Clear filters <X size={16}/></button></div>}
      <div className="archive-bottom">{!query&&category==='All projects'&&<button type="button" className="new-button secondary" onClick={()=>{setExpanded(!expanded);if(expanded)archiveRef.current.scrollIntoView({behavior:motionOn?'smooth':'instant'});}} aria-expanded={expanded}>{expanded?'Show selected projects':`Show all ${PROJECTS.length} projects`}<ArrowDown size={16} style={{rotate:expanded?'180deg':undefined}}/></button>}<a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer" className="quiet-link">Everything on GitHub <ArrowUpRight size={16}/></a></div>
    </div>
    <dialog className="project-sheet" ref={dialogRef} aria-labelledby="sheet-title" onCancel={(event)=>{event.preventDefault();close();}} onClick={(event)=>{if(event.target===event.currentTarget)close();}}>{selected&&<div className="sheet-inner"><div className="sheet-top"><span className="overline">PROJECT / {selected.number}</span><button type="button" className="round-button" onClick={close} aria-label="Close project details" autoFocus><X/></button></div><ProjectVisual project={selected}/><div className="sheet-copy"><p className="overline accent-text">{selected.category}</p><h2 id="sheet-title">{selected.title}</h2><p>{selected.description}</p><div className="showcase-stack">{selected.technologies.map((tool)=><span key={tool}>{tool}</span>)}</div><h3>Inside the build</h3><ul>{selected.highlights.map((item)=><li key={item}>{item}</li>)}</ul><div className="sheet-actions"><a className="new-button" href={selected.github} target="_blank" rel="noopener noreferrer">Explore the source <ArrowUpRight size={17}/></a><button type="button" className="quiet-link" onClick={share} disabled={copy?.pending}>{copy?.copied?<Check size={15}/>:<Copy size={15}/>}Copy project link</button></div><p className="share-status" role="status">{copy?.copied?'Project link copied.':copy&&!copy.pending?'Clipboard unavailable. Copy the link below.':''}</p>{copy&&!copy.pending&&!copy.copied&&<input className="share-fallback" readOnly aria-label="Project share link" value={copy.url} onFocus={(event)=>event.currentTarget.select()}/>}<div className="sheet-pagination"><button type="button" onClick={()=>navigateToProject(PROJECTS[(selectedIndex-1+PROJECTS.length)%PROJECTS.length].id)}><ArrowLeft size={16}/>Previous</button><span className="overline">{selectedIndex+1} / {PROJECTS.length}</span><button type="button" onClick={()=>navigateToProject(PROJECTS[(selectedIndex+1)%PROJECTS.length].id)}>Next<ArrowRight size={16}/></button></div></div></div>}</dialog>
  </section>;
}
