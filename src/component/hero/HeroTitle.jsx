import { ArrowDown, ArrowUpRight, Github } from 'lucide-react';
import OrbitalSculpture from './OrbitalSculpture';
import './HeroTitle.css';

export default function HeroTitle({ motionOn }) {
  return (
    <section className="hero" id="home" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-topline mono hero-enter"><span><i /> A MIND IN MOTION</span><span>KATHMANDU, NP <span className="hero-coordinates">27.71° N / 85.32° E</span></span></div>
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="hero-intro hero-enter">Suprem Shrestha <span>— Developer & AI explorer</span></p>
            <h1 id="hero-heading"><span className="hero-line"><span>Curiosity.</span></span><span className="hero-line"><span>Code.</span></span><span className="hero-line hero-line-last"><span>A little <em>chaos.</em></span></span></h1>
            <div className="hero-description-row hero-enter"><span className="hero-plus" aria-hidden="true">↳</span><p>I turn curious ideas into things you can use.<br />Exploring the space between thoughtful interfaces<br className="desktop-break" /> and intelligent systems.</p></div>
            <div className="hero-actions hero-enter"><a className="button" href="#projects">Explore my work <ArrowUpRight size={20} /></a><a className="hero-social" href="https://github.com/SupremShrestha" target="_blank" rel="noopener noreferrer" aria-label="Find me on GitHub"><Github size={20} /><ArrowUpRight size={13} /></a></div>
          </div>
          <div className="hero-visual hero-enter">
            <div className="orbital-cross orbital-cross-one" aria-hidden="true">+</div><div className="orbital-cross orbital-cross-two" aria-hidden="true">+</div>
            <OrbitalSculpture motionOn={motionOn} />
            <div className="orbital-label mono"><span>FIG. 01 — CONSTANTLY EVOLVING</span><span>CODE × CURIOSITY</span></div>
            <span className="hero-orbit-tag mono"><i /> EXPLORING WHAT’S NEXT</span>
          </div>
        </div>
        <div className="hero-bottom hero-enter"><a href="#projects" className="scroll-cue"><span><ArrowDown size={16} /></span><span className="mono">SCROLL TO EXPLORE</span></a><p className="mono">A COLLECTION OF WORK,<br />EXPERIMENTS & HAPPY ACCIDENTS.</p><span className="hero-edition mono">PORTFOLIO / VOL. 01</span></div>
      </div>
      <div className="ticker" aria-label="Development, design, and artificial intelligence"><div className="ticker-track" aria-hidden="true">{[0, 1, 2, 3].map((item) => <span key={item}>CREATIVE DEVELOPMENT <b>✳</b> ARTIFICIAL INTELLIGENCE <b>✳</b> ENDLESS CURIOSITY <b>✳</b> </span>)}</div></div>
    </section>
  );
}
