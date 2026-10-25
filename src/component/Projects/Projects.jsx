import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronUp, Copy, FolderOpen, Github, Grid2X2, List, Maximize2, RotateCcw, Search, Shuffle, X } from 'lucide-react';
import { filterProjects, PROJECT_CATEGORIES, PROJECTS } from '../../data/projects';
import { clearProjectUrl, copyProjectShareLink, getProjectHref, getProjectIdFromUrl, navigateToProject, PROJECT_OPEN_EVENT } from '../../lib/projectNavigation';
import './Projects.css';

const CURATED_LIMIT = 6;

function projectFromLocation() {
  const id = getProjectIdFromUrl();
  return PROJECTS.find((project) => project.id === id) || null;
}

function openProjectLink(event, id) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateToProject(id);
}

function tiltProject(event) {
  if (event.pointerType !== 'mouse' || document.documentElement.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty('--project-tilt-x', `${-y * 4}deg`);
  event.currentTarget.style.setProperty('--project-tilt-y', `${x * 4}deg`);
}

function resetProjectTilt(event) {
  event.currentTarget.style.setProperty('--project-tilt-x', '0deg');
  event.currentTarget.style.setProperty('--project-tilt-y', '0deg');
}

function ProjectImage({ project, className, loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return (
    <div className={`${className || ''} project-image-placeholder`} role="img" aria-label={`${project.title}: preview unavailable`}>
      <FolderOpen size={34} aria-hidden="true" />
      <strong>{project.title}</strong>
      <span className="mono">Preview coming soon</span>
    </div>
  );
  return <img className={className} src={import.meta.env.BASE_URL + project.image} alt={project.alt} loading={loading}
    decoding="async" width="1200" height="750" onError={() => setFailed(true)} />;
}

export default function Projects() {
  const [category, setCategory] = useState('All projects');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [projectOrder, setProjectOrder] = useState(null);
  const [selectedProject, setSelectedProject] = useState(projectFromLocation);
  const [view, setView] = useState('grid');
  const [copyResult, setCopyResult] = useState(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const dialogRef = useRef(null);
  const toolbarRef = useRef(null);
  const searchRef = useRef(null);
  const shuffleRef = useRef(null);
  const manualShareRef = useRef(null);
  const copyRequestRef = useRef(0);
  const isProjectOpen = selectedProject !== null;
  const hasFilters = category !== 'All projects' || query.trim() !== '';
  const curatedProjects = [...PROJECTS].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const order = projectOrder || curatedProjects.map((project) => project.id);
  const matchingProjects = [...filterProjects(category, query)].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const projects = hasFilters || expanded ? matchingProjects : matchingProjects.slice(0, CURATED_LIMIT);
  const canExpand = !hasFilters && PROJECTS.length > CURATED_LIMIT;
  const dialogProjects = selectedProject && !matchingProjects.some((project) => project.id === selectedProject.id) ? curatedProjects : matchingProjects;
  const dialogIndex = selectedProject ? dialogProjects.findIndex((project) => project.id === selectedProject.id) : -1;
  const previousProject = dialogProjects[(dialogIndex - 1 + dialogProjects.length) % dialogProjects.length];
  const nextProject = dialogProjects[(dialogIndex + 1) % dialogProjects.length];

  useEffect(() => {
    const syncFromUrl = () => {
      const project = projectFromLocation();
      if (project && !filterProjects(category, query).some((match) => match.id === project.id)) {
        setCategory('All projects');
        setQuery('');
      }
      copyRequestRef.current += 1;
      setCopyResult(null);
      setSelectedProject(project);
    };
    window.addEventListener(PROJECT_OPEN_EVENT, syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener(PROJECT_OPEN_EVENT, syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [category, query]);

  useEffect(() => {
    if (!isProjectOpen) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const toolbar = toolbarRef.current;
    const previousOverflow = document.body.style.overflow;
    if (!opener || opener === document.body) document.getElementById('projects')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
      else toolbar?.focus({ preventScroll: true });
    };
  }, [isProjectOpen]);

  useEffect(() => {
    if (selectedProject) dialogRef.current.scrollTop = 0;
  }, [selectedProject]);

  function closeProject() {
    // Only an explicit close edits history. Native popstate changes are read-only.
    clearProjectUrl();
    copyRequestRef.current += 1;
    setCopyResult(null);
    setSelectedProject(null);
  }

  async function copyProjectLink() {
    const id = selectedProject.id;
    const request = ++copyRequestRef.current;
    setCopyResult({ pending: true });
    const result = await copyProjectShareLink(id);
    if (request !== copyRequestRef.current || !dialogRef.current?.open || getProjectIdFromUrl() !== id) return;
    setCopyResult(result);
    if (!result.copied) requestAnimationFrame(() => {
      if (request !== copyRequestRef.current || !dialogRef.current?.open) return;
      manualShareRef.current?.focus();
      manualShareRef.current?.select();
    });
  }

  function shuffleProjects() {
    if (matchingProjects.length < 2) return;
    const shuffled = matchingProjects.map((project) => project.id);
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    if (shuffled.every((id, index) => id === matchingProjects[index].id)) shuffled.push(shuffled.shift());
    setProjectOrder([...shuffled, ...order.filter((id) => !shuffled.includes(id))]);
    setExpanded(true);
    setShuffleCount((count) => count + 1);
  }

  function restoreCuratedOrder() {
    setProjectOrder(null);
    setShuffleCount((count) => count + 1);
    const focusTarget = shuffleRef.current?.disabled ? searchRef.current : shuffleRef.current;
    focusTarget?.focus({ preventScroll: true });
  }

  function resetFilters() {
    setCategory('All projects');
    setQuery('');
    setExpanded(false);
    setProjectOrder(null);
    setShuffleCount(0);
    searchRef.current?.focus({ preventScroll: true });
  }

  function toggleExpanded() {
    if (!expanded) { setExpanded(true); return; }
    setExpanded(false);
    setProjectOrder(null);
    const motionAllowed = document.documentElement.dataset.motion !== 'off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    toolbarRef.current?.focus({ preventScroll: true });
    toolbarRef.current?.scrollIntoView({ behavior: motionAllowed ? 'smooth' : 'auto', block: 'start' });
  }

  return (
    <section className="section project-section" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <div className="project-section-heading">
          <div>
            <p className="section-label">01 / SELECTED WORK</p>
            <h2 className="section-title" id="projects-heading">Less talk.<br /><em>More building.</em></h2>
          </div>
          <div className="project-heading-note">
            <span className="project-handwriting">A FEW THINGS I’VE PUT INTO THE WORLD</span>
            <p>From realtime apps to learning machines. Ideas explored, problems worked through, and things shipped.</p>
          </div>
        </div>

        <div className="project-browser-tools" ref={toolbarRef} tabIndex={-1}>
          <div className="project-search-row">
            <div className="project-search">
              <label htmlFor="project-search">Find something interesting</label>
              <div className="project-search-field">
                <Search size={20} aria-hidden="true" />
                <input ref={searchRef} id="project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                  placeholder="A project, a tool, an idea…" autoComplete="off" aria-describedby="project-search-help" aria-controls="project-grid" />
                {query && <button type="button" className="project-clear-search" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={19} aria-hidden="true" /></button>}
              </div>
            </div>
            <p id="project-search-help">Search all {PROJECTS.length} projects, by idea, category, or technology.</p>
          </div>
          <div className="project-toolbar">
            <div className="project-filters" role="group" aria-label="Filter projects by category">
              {PROJECT_CATEGORIES.map((item) => (
                <button key={item} type="button" className={`project-filter${category === item ? ' project-filter-selected' : ''}`}
                  aria-pressed={category === item} onClick={() => setCategory(item)} aria-controls="project-grid">{item}</button>
              ))}
            </div>
            <div className="project-toolbar-actions">
              <button ref={shuffleRef} className="project-shuffle" type="button" onClick={shuffleProjects} disabled={matchingProjects.length < 2}>
                <Shuffle size={17} aria-hidden="true" /> Shuffle the stack
              </button>
              {projectOrder && <button className="project-order-reset" type="button" onClick={restoreCuratedOrder}><RotateCcw size={16} aria-hidden="true" /> Curated order</button>}
            </div>
          </div>
        </div>

        <div className="project-results-summary">
          <p className="project-count mono" role="status" aria-live="polite" aria-atomic="true">
            <strong>Showing {projects.length} of {PROJECTS.length} projects</strong>
            <span>{projectOrder ? 'shuffled collection' : 'the selected collection'}{hasFilters ? ' · matching your filters' : ''}</span>
          </p>
          <div className="project-result-actions">
            <div className="project-layout-switch" role="group" aria-label="Project display">
              <button type="button" aria-pressed={view === 'grid'} aria-controls="project-grid" onClick={() => setView('grid')}><Grid2X2 size={17} aria-hidden="true" /> Grid</button>
              <button type="button" aria-pressed={view === 'list'} aria-controls="project-grid" onClick={() => setView('list')}><List size={18} aria-hidden="true" /> List</button>
            </div>
            {hasFilters && <button className="project-reset-filters" type="button" onClick={resetFilters}>Reset filters <X size={16} aria-hidden="true" /></button>}
            {canExpand && <button className="project-view-toggle" type="button" aria-expanded={expanded} aria-controls="project-grid" onClick={toggleExpanded}>
              {expanded ? <>Show fewer <ChevronUp size={18} aria-hidden="true" /></> : <>Show all {PROJECTS.length} projects <ChevronDown size={18} aria-hidden="true" /></>}
            </button>}
          </div>
        </div>

        <div className={`project-grid${view === 'list' ? ' project-list' : ''}`} id="project-grid">
          {projects.map((project, index) => (
            <article className="project-card" key={`${category}-${shuffleCount}-${project.id}`}
              style={{ '--project-delay': `${Math.min(index, 5) * 45}ms`, '--project-angle': `${index % 2 === 0 ? -0.65 : 0.65}deg` }}
              onPointerMove={view === 'grid' ? tiltProject : undefined} onPointerLeave={resetProjectTilt}>
              <div className="project-window-bar">
                <span className="project-window-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="project-window-name mono">{project.id}.project</span>
                <span className="project-window-number mono">/{project.number}</span>
              </div>
              <a className="project-image-button" href={getProjectHref(project.id)} onClick={(event) => openProjectLink(event, project.id)}
                aria-label={`View details for ${project.title}`}>
                <ProjectImage key={project.image} project={project} />
                <span className="project-image-action"><Maximize2 size={17} aria-hidden="true" /> Explore project</span>
                <span className="project-image-corner" aria-hidden="true"><ArrowUpRight size={26} /></span>
              </a>
              <div className="project-card-copy">
                <div className="project-card-meta"><p className="project-category mono">{project.category}</p>{project.featured && <span className="project-featured-badge">Featured</span>}</div>
                <div className="project-card-heading">
                  <h3><a href={getProjectHref(project.id)} onClick={(event) => openProjectLink(event, project.id)}>{project.title}</a></h3>
                  <a className="project-github" href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source on GitHub`}><Github size={22} aria-hidden="true" /></a>
                </div>
                <p className="project-subtitle">{project.subtitle}</p>
                <ul className="project-tech" aria-label="Technologies">{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
                <a className="project-details-button" href={getProjectHref(project.id)} onClick={(event) => openProjectLink(event, project.id)} aria-label={`Explore project for ${project.title}`}>
                  <span>Explore project <span className="mono">/{project.number}</span></span><ArrowRight size={20} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
          {projects.length === 0 && <div className="project-empty">
            <FolderOpen size={38} aria-hidden="true" />
            <h3>No projects found.</h3>
            <p>Try another search or category. There are {PROJECTS.length} projects to explore.</p>
            <button className="button button-outline" type="button" onClick={resetFilters}>Reset filters <RotateCcw size={18} aria-hidden="true" /></button>
          </div>}
        </div>
        {canExpand && expanded && <div className="project-bottom-collapse"><button className="project-view-toggle" type="button" aria-expanded="true" aria-controls="project-grid" onClick={toggleExpanded}>Show fewer <ChevronUp size={18} aria-hidden="true" /></button></div>}
        <div className="project-end">
          <span className="project-handwriting">THERE’S ALWAYS ANOTHER IDEA IN PROGRESS.</span>
          <a href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer" className="text-link">Browse my GitHub <ArrowUpRight size={20} aria-hidden="true" /></a>
        </div>
      </div>

      <dialog ref={dialogRef} className="project-dialog" aria-labelledby="project-dialog-title"
        onCancel={(event) => { event.preventDefault(); closeProject(); }} onClick={(event) => { if (event.target === event.currentTarget) closeProject(); }}>
        {selectedProject && <div className="project-dialog-inner">
          <div className="project-dialog-header">
            <div className="project-dialog-topline">
              <span className="mono">PROJECT / {selectedProject.number}</span>
              <button className="project-dialog-close" type="button" aria-label="Close project details" onClick={closeProject} autoFocus><X size={23} aria-hidden="true" /></button>
            </div>
            <nav className="project-dialog-navigation" aria-label="Browse matching projects">
              <button type="button" disabled={dialogProjects.length < 2 || !previousProject} onClick={() => navigateToProject(previousProject.id)} aria-label={previousProject ? `Previous project: ${previousProject.title}` : 'Previous project'}><ArrowLeft size={18} aria-hidden="true" /> Previous</button>
              <p className="mono" role="status" aria-live="polite" aria-atomic="true"><span className="visually-hidden">{selectedProject.title}. </span>{dialogIndex + 1} of {dialogProjects.length}<span className="project-dialog-match-label">{hasFilters ? 'matching builds' : 'projects'}</span></p>
              <button type="button" disabled={dialogProjects.length < 2 || !nextProject} onClick={() => navigateToProject(nextProject.id)} aria-label={nextProject ? `Next project: ${nextProject.title}` : 'Next project'}>Next <ArrowRight size={18} aria-hidden="true" /></button>
            </nav>
          </div>
          <ProjectImage key={selectedProject.image} project={selectedProject} className="project-dialog-image" loading="eager" />
          <div className="project-dialog-copy">
            <p className="project-category mono">{selectedProject.category}</p>
            <h2 id="project-dialog-title">{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            <ul className="project-tech" aria-label="Technologies">{selectedProject.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
            {selectedProject.highlights?.length > 0 && <div className="project-dialog-highlights">
              <h3>Inside the build</h3>
              <ul>{selectedProject.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </div>}
            <div className="project-dialog-actions">
              <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="button">View source on GitHub <ArrowUpRight size={19} aria-hidden="true" /></a>
              <button className="project-copy-link" type="button" onClick={copyProjectLink} disabled={copyResult?.pending}>{copyResult?.copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}{copyResult?.pending ? 'Copying…' : 'Copy project link'}</button>
            </div>
            <div className="project-share-status" role="status" aria-live="polite">{copyResult?.copied ? 'Project link copied.' : copyResult && !copyResult.pending ? 'Clipboard unavailable. Select and copy the link below.' : ''}</div>
            {copyResult && !copyResult.pending && !copyResult.copied && <div className="project-manual-share">
              <label htmlFor="project-share-url">Project share link</label>
              <input ref={manualShareRef} id="project-share-url" type="url" readOnly value={copyResult.url} onFocus={(event) => event.target.select()} />
              <a href={copyResult.url} target="_blank" rel="noopener noreferrer">Open in a new tab <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>}
            <p className="project-dialog-tip mono">Press Esc to put this one back.</p>
          </div>
        </div>}
      </dialog>
    </section>
  );
}
