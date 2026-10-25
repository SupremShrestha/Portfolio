import { ArrowUpRight, Code2, Cpu, Database, Radio, Plus } from 'lucide-react';
import { createElement } from 'react';
import { PROJECTS } from '../data/projects';
import { getProjectHref, navigateToProject } from '../lib/projectNavigation';
const DISCIPLINES = [
  { title:'Interfaces & experiences', Icon:Code2, text:'Building the connection between people and software. From live ride maps to restaurant dashboards and shared, realtime state.', tools:['React','React Native','TypeScript','Spring Boot','Supabase'], project:'group-ride-sharing' },
  { title:'Intelligence & learning', Icon:Cpu, text:'Exploring how machines find patterns, make predictions, and learn through interaction. From sonar classification to robot simulation.', tools:['Python','scikit-learn','PyBullet','Gymnasium','Stable-Baselines3'], project:'robotic-arm-rl' },
  { title:'Data & the bigger picture', Icon:Database, text:'Making models useful beyond the notebook, with repeatable ingestion, validation, serving, and monitoring.', tools:['Airflow','MLflow','FastAPI','PostGIS','Docker'], project:'seoul-bike-pipeline' },
  { title:'Systems & physical things', Icon:Radio, text:'Understanding the foundations. Object-oriented programs, persistent records, and sensor-driven systems.', tools:['Java','Python','Arduino','C++','Tinkercad'], project:'water-conservation' },
];
const EDUCATION = [
  ['2024 — NOW','BSc (Hons) Computer Science','Sunway College / Birmingham University','Specializing in Artificial Intelligence.'],
  ['2022 — 2024','+2 in Science','Reliance International Academy','Science, Computer Science, and problem solving.'],
  ['2012 — 2022','High School','Paragon Public School','An early curiosity for computers and mathematics.'],
];
export default function About() {
  return <section id="about" className="about-new" aria-labelledby="about-title"><div className="wrap">
    <div className="about-top" data-reveal><p className="overline accent-text">A LITTLE MORE HUMAN</p><span className="overline">KATHMANDU, NEPAL ↗</span></div>
    <div className="about-heading" data-reveal><h2 className="display-heading" id="about-title">MORE THAN<br />THE <span>CODE.</span></h2><div className="about-orbit" aria-hidden="true"><span>+</span><i/><i/><i/></div></div>
    <div className="about-body"><div className="about-bio" data-reveal><p className="about-lead">Hi, I’m Suprem.<br />A work in progress.<br /><span>And I like it that way.</span></p><p>I’m a Computer Science student specializing in Artificial Intelligence. My favorite place to work is where a technical problem meets a human one.</p><p>Some days, I’m training a model. Other days, I’m refining an interaction until it just feels right. The common thread? Learning by making things.</p><div className="about-numbers"><div><strong>{PROJECTS.length}</strong><span>PROJECTS & EXPERIMENTS</span></div><div><strong>04</strong><span>CONNECTED DISCIPLINES</span></div></div><a className="quiet-link" href="https://www.linkedin.com/in/supremshrestha/" target="_blank" rel="noopener noreferrer">The professional side <ArrowUpRight size={17}/></a></div>
      <div className="disciplines" aria-label="Skills and disciplines">{DISCIPLINES.map((item,index)=><details className="discipline" key={item.title} open={index===0} data-reveal><summary><span className="discipline-icon">{createElement(item.Icon,{size:21,strokeWidth:1.5})}</span><h3>{item.title}</h3><Plus size={20} className="discipline-toggle"/></summary><div className="discipline-content"><p>{item.text}</p><div className="showcase-stack">{item.tools.map((tool)=><span key={tool}>{tool}</span>)}</div><a className="quiet-link" href={getProjectHref(item.project)} onClick={(event)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigateToProject(item.project);}}>See it in practice <ArrowUpRight size={15}/></a></div></details>)}</div>
    </div>
    <div className="journey" id="education"><div className="journey-title" data-reveal><p className="overline accent-text">THE PATH SO FAR</p><h3>Still becoming.</h3></div><ol className="journey-track">{EDUCATION.map(([year,title,place,note],index)=><li key={year} data-reveal><div className="journey-point"><span/>{index===0&&<small>CURRENT CHAPTER</small>}</div><p className="overline">{year}</p><h4>{title}</h4><p>{place}</p><span>{note}</span></li>)}</ol></div>
  </div><div className="skills-band" aria-label="Code, question, explore, repeat"><div aria-hidden="true">{[0,1,2,3].map((n)=><span key={n}>CODE <b>✦</b> QUESTION <b>✦</b> EXPLORE <b>✦</b> REPEAT <b>✦</b> </span>)}</div></div></section>;
}
