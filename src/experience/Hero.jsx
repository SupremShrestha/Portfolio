import { ArrowDown, ArrowUpRight } from 'lucide-react';
import ParticleField from './ParticleField';
export default function Hero({ motionOn, theme }) {
  return <section className="new-hero" id="home" aria-labelledby="intro-title">
    <ParticleField motionOn={motionOn} theme={theme} />
    <div className="hero-grid" aria-hidden="true" /><div className="hero-glow" aria-hidden="true" />
    <div className="hero-poster">
      <div className="hero-identity hero-in"><span className="live-dot" /><span className="overline">DEVELOPER. AI EXPLORER. CURIOUS HUMAN.</span></div>
      <h1 className="hero-name" id="intro-title" aria-label="Suprem Shrestha"><span className="hero-name-line"><span>SUPREM</span></span><span className="hero-name-line hero-outline"><span>SHRESTHA<span className="name-period">.</span></span></span></h1>
      <div className="hero-title-caption hero-in"><span className="hero-caption-line" /><p>Engineering ideas.<br /><span>Designing possibilities.</span></p><a className="hero-enter-work" href="#projects" aria-label="Explore selected work"><ArrowUpRight size={40} strokeWidth={1} /></a></div>
    </div>
    <div className="hero-footer hero-in"><p>Computer Science & AI<br /><span>Based in Kathmandu, Nepal</span></p><a href="#projects" className="enter-link"><span className="overline">SCROLL TO ENTER</span><ArrowDown size={17} /></a><p className="hero-footer-right">INDEPENDENT MIND.<br /><span>OPEN-ENDED POSSIBILITIES.</span></p></div>
    <div className="hero-edge-mark overline" aria-hidden="true">27.71° N / 85.32° E</div>
  </section>;
}
