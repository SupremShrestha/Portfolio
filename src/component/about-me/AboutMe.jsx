import { createElement, useId, useRef, useState } from 'react';
import { ArrowUpRight, Braces, CircuitBoard, Cpu, Database, MapPin } from 'lucide-react';
import { PROJECTS } from '../../data/projects';
import { getProjectHref, navigateToProject } from '../../lib/projectNavigation';
import './AboutMe.css';

const SKILL_GROUPS = [
  {
    id: 'web-mobile', title: 'Web & mobile', Icon: Braces,
    description: 'Interfaces, APIs, and the shared state between them. From a live ride map to restaurant dashboards and appointment booking.',
    tools: ['React', 'React Native', 'TypeScript', 'Supabase', 'Spring Boot', 'Flask', 'PostgreSQL', 'WebSocket'],
    projectIds: ['group-ride-sharing', 'restaurant-saas', 'code-crunch'],
  },
  {
    id: 'applied-ml', title: 'Applied ML', Icon: Cpu,
    description: 'Models with a task to solve: classify a sonar return, compare passenger satisfaction models, or move a simulated robot arm.',
    tools: ['Python', 'scikit-learn', 'LightGBM', 'NumPy', 'PyBullet', 'Gymnasium', 'Stable-Baselines3'],
    projectIds: ['robotic-arm-rl', 'sonar-classifier', 'airline-satisfaction'],
  },
  {
    id: 'data-pipelines', title: 'Data pipelines', Icon: Database,
    description: 'The work around the model: repeatable ingestion, data checks, scheduled training, prediction APIs, and monitoring.',
    tools: ['Airflow', 'MLflow', 'FastAPI', 'Django', 'PostGIS', 'Docker', 'Great Expectations', 'Evidently'],
    projectIds: ['risk-evaluation', 'seoul-bike-pipeline'],
  },
  {
    id: 'fundamentals-iot', title: 'Fundamentals & IoT', Icon: CircuitBoard,
    description: 'The nuts and bolts: object-oriented programs, desktop interfaces, file-backed records, and sensor-driven Arduino logic.',
    tools: ['Java', 'Swing', 'Python', 'OOP', 'Matplotlib', 'Arduino', 'C++', 'Tinkercad'],
    projectIds: ['flight-booking', 'water-conservation', 'hospital-management'],
  },
].map((group) => ({
  ...group,
  projects: group.projectIds.map((projectId) => PROJECTS.find((project) => project.id === projectId)).filter(Boolean),
}));

function openProject(event, projectId) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateToProject(projectId);
}

const DIRECTIONS = [
  { title: 'Models beyond the notebook', description: 'Connecting predictions to real data pipelines, APIs, and dashboards in the BIPAD and Seoul bike projects.' },
  { title: 'Shared, realtime experiences', description: 'Working with live rider locations, persistent chat, and order updates across restaurant staff dashboards.' },
  { title: 'Learning in simulation', description: 'Exploring target reaching and pick-and-place with simulated robot arms, baselines, and reproducible evaluations.' },
];
const FILES = ['The person', 'The toolkit', 'Right now'];

export default function AboutMe() {
  const [activeFile, setActiveFile] = useState(0);
  const [activeSkill, setActiveSkill] = useState(0);
  const tabs = useRef([]);
  const id = useId();
  const selectedSkill = SKILL_GROUPS[activeSkill];

  function handleTabKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % FILES.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + FILES.length) % FILES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = FILES.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActiveFile(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="section about-section" id="about" aria-labelledby="about-heading">
      <div className="container">
        <div className="about-manifesto">
          <p className="section-label">02 / A LITTLE CONTEXT</p>
          <div className="manifesto-layout"><p className="manifesto-text">{'Good things happen at the intersection of logic and a little imagination.'.split(' ').map((word, index) => <span className="scroll-word" key={index}>{word} </span>)}</p><span className="manifesto-star" aria-hidden="true">✳</span></div>
        </div>
        <div className="about-layout">
        <div className="about-intro">
          <p className="about-kicker mono">THE PERSON BEHIND THE PIXELS</p>
          <h2 id="about-heading" className="section-title">A builder.<br />A thinker.<br /><span className="about-scribble">Always curious.</span></h2>
          <p className="about-intro-copy">I’m Suprem, a Computer Science and AI student in Kathmandu. I’m here to understand how things work — then see what else they could become.</p>
          <dl className="about-facts">
            <div><dt className="mono">Name</dt><dd>Suprem Shrestha</dd></div>
            <div><dt className="mono">Based in</dt><dd><MapPin size={14} aria-hidden="true" /> Kathmandu, Nepal</dd></div>
            <div><dt className="mono">Studying</dt><dd>Computer Science + AI</dd></div>
          </dl>
          <a className="text-link" href="https://www.linkedin.com/in/supremshrestha/details/certifications/" target="_blank" rel="noopener noreferrer">Explore my certifications <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>

        <div className="about-notebook">
          <div className="about-file-bar"><span className="about-window-dots" aria-hidden="true"><i /><i /><i /></span><span className="mono">A WORK IN PROGRESS, IN THE BEST WAY</span><Braces size={17} aria-hidden="true" /></div>
          <div className="about-tabs" role="tablist" aria-label="Get to know Suprem">
            {FILES.map((file, index) => (
              <button
                key={file}
                ref={(node) => { tabs.current[index] = node; }}
                id={`${id}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={activeFile === index}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={activeFile === index ? 0 : -1}
                onClick={() => setActiveFile(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >{file}</button>
            ))}
          </div>
          <div className="about-file-content">
            <div className="about-file-panel" id={`${id}-panel-0`} role="tabpanel" aria-labelledby={`${id}-tab-0`} hidden={activeFile !== 0} tabIndex={0}>
              <span className="about-file-comment mono">01 — INTRODUCTION</span>
              <h3>I’m Suprem.<br />I learn by making things.</h3>
              <p>I’m a Computer Science student specializing in Artificial Intelligence. I like the point where data, design, and development meet.</p>
              <p>Some days that means experimenting with a predictive model. Other days it means moving a button a few pixels until the interface feels right.</p>
              <p className="about-file-signoff">This portfolio is a collection of those experiments. <span aria-hidden="true">:)</span></p>
            </div>
            <div className="about-file-panel" id={`${id}-panel-1`} role="tabpanel" aria-labelledby={`${id}-tab-1`} hidden={activeFile !== 1} tabIndex={0}>
              <span className="about-file-comment mono">02 — PRACTICE & TOOLS</span>
              <div className="about-skills">
                <div className="about-skill-intro"><h3>Pick a stack.<br />See the work.</h3><span className="mono">04 disciplines<br />real projects behind each</span></div>
                <div className="about-skill-choices" role="group" aria-label="Explore skill groups">
                  {SKILL_GROUPS.map(({ id: skillId, title, Icon }, index) => (
                    <button key={skillId} type="button" aria-pressed={activeSkill === index} aria-controls={`${id}-skill-detail`} onClick={() => setActiveSkill(index)}>
                      {createElement(Icon, { size: 17, 'aria-hidden': true })}<span>{title}</span>
                    </button>
                  ))}
                </div>
                <p className="visually-hidden" role="status">{selectedSkill.title} selected. {selectedSkill.projects.length} project examples below.</p>
                <div className="about-skill-detail" id={`${id}-skill-detail`} role="region" aria-labelledby={`${id}-skill-heading`}>
                  <h4 id={`${id}-skill-heading`}>{selectedSkill.title}</h4>
                  <p>{selectedSkill.description}</p>
                  <ul className="about-skill-tools" aria-label={`${selectedSkill.title} tools`}>{selectedSkill.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                  <p className="about-skill-evidence-label mono">See it in a build <span aria-hidden="true">↓</span></p>
                  <ul className="about-skill-projects">
                    {selectedSkill.projects.map((project) => (
                      <li key={project.id}><a href={getProjectHref(project.id)} onClick={(event) => openProject(event, project.id)}><span><strong>{project.title}</strong><span>{project.highlights[0]}</span></span><ArrowUpRight size={18} aria-hidden="true" /></a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="about-file-panel" id={`${id}-panel-2`} role="tabpanel" aria-labelledby={`${id}-tab-2`} hidden={activeFile !== 2} tabIndex={0}>
              <span className="about-file-comment mono">03 — CURRENT CURIOSITIES</span>
              <h3>Following the<br />interesting connections.</h3>
              <ul className="about-now-list">
                {DIRECTIONS.map(({ title, description }) => <li key={title}><span aria-hidden="true">↳</span><div><strong>{title}</strong><p>{description}</p></div></li>)}
              </ul>
            </div>
          </div>
          <div className="about-file-footer mono"><span><span className="about-file-cursor" aria-hidden="true" />{FILES[activeFile]}</span><span>always learning ↵</span></div>
          <p className="about-tab-note" aria-hidden="true">Different interests. One curious mind.</p>
        </div>
        </div>
      </div>
    </section>
  );
}
