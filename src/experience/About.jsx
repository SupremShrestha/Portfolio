import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Code2, Cpu, Database, MapPin, Plus, Radio } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { DISCIPLINES, EDUCATION } from '../data/profile';
import { getProjectHref, navigateToProject } from '../lib/projectNavigation';
import { tabDestination } from '../lib/sectionInteractions';

const ICONS = [Code2, Cpu, Database, Radio];
function openProject(event, id) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); navigateToProject(id);
}

export function Journey() {
  const [active, setActive] = useState(EDUCATION.length - 1);
  const tabs = useRef([]);
  function keyboard(event, index) {
    const next = tabDestination(event.key, index, EDUCATION.length, 'vertical');
    if (next === null) return;
    event.preventDefault(); setActive(next); tabs.current[next]?.focus();
  }
  return <section className="journey" id="education" aria-labelledby="journey-title">
    <div className="journey-title" data-reveal><div><p className="overline accent-text">THE PATH SO FAR</p><h3 id="journey-title">Still becoming<span>.</span></h3></div><p>A few chapters behind me.<br/>A lot left to discover.</p></div>
    <div className="journey-layout" data-reveal>
      <div className="journey-selector"><p className="overline">EXPLORE THE CHAPTERS</p><ol className="journey-steps" role="tablist" aria-label="Education chapters" aria-orientation="vertical" style={{ '--chapter-position': active }}>
        {EDUCATION.map((chapter, index) => <li role="presentation" key={chapter.id}><button ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={'chapter-tab-' + chapter.id} aria-controls={'chapter-panel-' + chapter.id} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => keyboard(event, index)}><span className="chapter-step-number">0{index + 1}</span><span><span className="chapter-period">{chapter.period}{chapter.current && <small>NOW</small>}</span><strong>{chapter.title}</strong></span><ArrowUpRight size={18}/></button></li>)}
      </ol><span className="journey-selector-note">Every chapter adds something.</span></div>
      <div className="chapter-panels">{EDUCATION.map((chapter, index) => <div className="chapter-panel" id={'chapter-panel-' + chapter.id} role="tabpanel" aria-labelledby={'chapter-tab-' + chapter.id} hidden={active !== index} tabIndex={0} key={chapter.id}>
        <div className="chapter-content"><div className="chapter-top"><span className="overline">{chapter.current ? 'THE CURRENT CHAPTER' : 'PART OF THE FOUNDATION'}</span><span className="chapter-year" aria-hidden="true">{chapter.year}</span></div><h4>{chapter.heading}</h4><div className="chapter-school"><strong>{chapter.title}</strong><span>{chapter.place}</span></div><p className="chapter-note">{chapter.note}</p><p className="chapter-reflection">{chapter.reflection}</p><div className="chapter-focus">{chapter.focus.map(item => <span key={item}>{item}</span>)}</div><div className="chapter-bottom"><span className="overline">CHAPTER 0{index + 1} / 0{EDUCATION.length}</span>{chapter.project ? <a className="quiet-link" href={getProjectHref(chapter.project)} onClick={event => openProject(event, chapter.project)}>Learning in practice <ArrowUpRight size={16}/></a> : <span className="chapter-next-note">A foundation to build on <ArrowRight size={15}/></span>}</div></div>
      </div>)}</div>
    </div>
  </section>;
}

export default function About() {
  const [active, setActive] = useState(DISCIPLINES[0].id);
  return <section id="about" className="about-new" aria-labelledby="about-title"><div className="wrap">
    <div className="about-top" data-reveal><p className="overline accent-text">A LITTLE MORE HUMAN</p><span className="about-location"><MapPin size={14}/> KATHMANDU, NEPAL</span></div>
    <div className="about-heading" data-reveal><h2 className="display-heading" id="about-title">MORE THAN<br/>THE <span>CODE.</span></h2><div className="about-orbit" aria-hidden="true"><span>+</span><i/><i/><i/></div></div>
    <div className="about-body">
      <div className="about-bio" data-reveal>
        <div className="profile-card"><div className="profile-card-top"><span className="overline">A WORK IN PROGRESS</span><span className="profile-monogram" aria-hidden="true">ss<span>.</span></span></div><p className="about-lead">Hi, I’m Suprem.<br/><span>Curiosity keeps<br/>me moving.</span></p><p>I’m a Computer Science student specializing in Artificial Intelligence. My favorite place to work is where a technical problem meets a human one.</p><dl className="profile-facts"><div><dt>BASED IN</dt><dd>Kathmandu, Nepal</dd></div><div><dt>EXPLORING</dt><dd>Code, data & intelligence</dd></div><div><dt>LEARNING BY</dt><dd>Making things work</dd></div></dl><a className="quiet-link" href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer">The professional side <ArrowUpRight size={17}/></a></div>
        <div className="about-numbers"><a href="#projects"><strong>{PROJECTS.length}<span>↗</span></strong><span>PROJECTS & EXPERIMENTS</span></a><div><strong>04</strong><span>CONNECTED DISCIPLINES</span></div></div>
      </div>
      <div className="disciplines" aria-label="Skills and disciplines"><div className="disciplines-intro"><p className="overline accent-text">DIFFERENT TOOLS. THE SAME CURIOSITY.</p><h3>What I like<br/>figuring out.</h3><p>Some days, a model. Other days, an interaction.<br/>Select a discipline to see the work behind it.</p></div>
        {DISCIPLINES.map((item, index) => {
          const Icon = ICONS[index], expanded = active === item.id;
          const project = PROJECTS.find(project => project.id === item.project);
          return <div className="discipline" data-expanded={expanded} key={item.id}><h3><button type="button" className="discipline-trigger" id={'skill-' + item.id} aria-expanded={expanded} aria-controls={'skill-panel-' + item.id} onClick={() => setActive(expanded ? null : item.id)}><span className="discipline-icon"><Icon size={21} strokeWidth={1.5}/></span><span>{item.title}<small>{item.label}</small></span><Plus size={19} className="discipline-toggle"/></button></h3><div className="discipline-body" id={'skill-panel-' + item.id} role="region" aria-labelledby={'skill-' + item.id} aria-hidden={!expanded} inert={!expanded}><div><div className="discipline-content"><p>{item.text}</p><div className="showcase-stack">{item.tools.map(tool => <span key={tool}>{tool}</span>)}</div><a className="discipline-project" href={getProjectHref(item.project)} onClick={event => openProject(event, item.project)}><span><small>SEE IT IN PRACTICE</small><strong>{project.title}</strong></span><ArrowUpRight size={23}/></a></div></div></div></div>;
        })}
      </div>
    </div>
    <ol className="approach-notes" aria-label="How I approach a project" data-reveal>{[['01', 'Ask a better question.', 'Look for the problem behind the problem.'], ['02', 'Make it tangible.', 'Turn an idea into something to try.'], ['03', 'Keep refining.', 'Learn from what works. Revisit what doesn’t.']].map(([number, title, copy]) => <li key={number}><span className="overline accent-text">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowRight size={18} aria-hidden="true"/></li>)}</ol>
    <Journey/>
  </div><div className="skills-band" aria-label="Code, capture, listen, look up"><div aria-hidden="true">{[0, 1, 2, 3].map(n => <span key={n}>CODE <b>✦</b> CAPTURE <b>✦</b> LISTEN <b>✦</b> LOOK UP <b>✦</b></span>)}</div></div></section>;
}
