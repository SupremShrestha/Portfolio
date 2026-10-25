import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Code2, Github, MoveUpRight, RotateCcw, Sparkles } from 'lucide-react';
import DeskBuddy from './DeskBuddy';
import DraggableSticker from './DraggableSticker';
import { getProjectHref, navigateToProject } from '../../lib/projectNavigation';
import './HeroTitle.css';

const STARTING_POINTS = [
  { id: 'group-ride-sharing', label: 'a ride', title: 'Explore Ride Map' },
  { id: 'robotic-arm-rl', label: 'a robot', title: 'Explore Robotic Arm Learning' },
  { id: 'risk-evaluation', label: 'a risk model', title: 'Explore BIPAD Risk Platform' },
];

export default function HeroTitle({ motionOn }) {
  const [deskVersion, setDeskVersion] = useState(0);
  return (
    <section className="hero" id="home" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-topline mono"><span>A SMALL CORNER OF THE INTERNET</span><span>KATHMANDU, NEPAL <MoveUpRight size={12} aria-hidden="true" /></span></div>
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="handwritten hero-hello">hey, I’m Suprem <span aria-hidden="true">↙</span></p>
            <h1 id="hero-heading"><span>I make</span><span>things <em>click.</em></span></h1>
            <p className="hero-description">Computer science student in Kathmandu. I build apps, experiment with data, and occasionally teach a simulated robot where to put a cube.</p>
            <div className="hero-actions">
              <a className="button hero-work-button" href="#projects">Proof? Right this way. <ArrowDownRight size={22} aria-hidden="true" /></a>
              <a className="hero-github" href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer" aria-label="Find me on GitHub"><Github size={21} aria-hidden="true" /><ArrowUpRight size={12} aria-hidden="true" /></a>
            </div>
            <nav className="hero-starting-points" aria-label="Start with a project">
              <span className="mono">Or start with</span>
              {STARTING_POINTS.map((project) => <a key={project.id} href={getProjectHref(project.id)} aria-label={project.title}
                onClick={(event) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  navigateToProject(project.id);
                }}>{project.label}<ArrowUpRight size={12} aria-hidden="true" /></a>)}
            </nav>
          </div>
          <div className="hero-side"><DeskBuddy motionOn={motionOn} /><p className="handwritten buddy-note">he’s part of the team.<br />very little work gets done.</p></div>
          <div key={deskVersion} className="sticker-layer">
            <DraggableSticker className="sticker-build" label="Built by a human"><Sparkles size={18} aria-hidden="true" /><span>BUILT BY<br /><strong>A HUMAN.</strong></span></DraggableSticker>
            <DraggableSticker className="sticker-code" label="Try, break, learn, repeat"><Code2 size={23} aria-hidden="true" /><span>try. break.<br />learn. repeat.</span></DraggableSticker>
            <DraggableSticker className="sticker-note" label="Work in progress"><span className="handwritten">always a<br />work in progress</span><span className="note-star" aria-hidden="true">✳</span></DraggableSticker>
          </div>
        </div>
        <div className="hero-bottom"><a href="#playground" className="playground-nudge"><span className="nudge-star" aria-hidden="true">✳</span> Psst. There’s a playground down there. <ArrowDownRight size={17} aria-hidden="true" /></a><button type="button" className="reset-desk" onClick={() => setDeskVersion((version) => version + 1)}><RotateCcw size={12} aria-hidden="true" />reset the stickers</button></div>
      </div>
      <div className="ticker" aria-label="Code, break, learn, repeat"><div className="ticker-track" aria-hidden="true">{[0, 1, 2, 3].map((item) => <span key={item}>MAKE SOMETHING <b>✳</b> BREAK SOMETHING <b>↗</b> LEARN SOMETHING <b>✳</b> REPEAT <b>↻</b></span>)}</div><span className="visually-hidden">Make something. Break something. Learn something. Repeat.</span></div>
    </section>
  );
}
