import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePreferences from '../hooks/usePreferences';
import Header from './Header';
import Hero from './Hero';
import Work from './Work';
import About from './About';
import Interests from './Interests';
import Lab from './Lab';
import Contact from './Contact';
import './experience.css';
import './polish.css';
import './human.css';

gsap.registerPlugin(ScrollTrigger);
function Motion({ motionOn }) {
  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      const length = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--progress', length > 0 ? scrollY / length : 0);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', scroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); };
  }, []);
  useEffect(() => {
    if (!motionOn) return;
    const context = gsap.context(() => {
      gsap.from('.hero-name-line > span', { yPercent: 110, duration: 1.5, stagger: .15, ease: 'power4.out', clearProps: 'all' });
      gsap.from('.hero-in', { opacity: 0, y: 20, duration: 1, delay: .6, stagger: .1, clearProps: 'all' });
      gsap.to('.hero-poster', { yPercent: 16, scale: .84, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.new-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.fromTo('.statement-copy > span', { opacity: .2 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.statement-copy', start: 'top 85%', end: 'bottom 45%', scrub: .5 } });
      gsap.fromTo('.interests-new', { '--orbit-progress': 0 }, { '--orbit-progress': 1, ease: 'none', scrollTrigger: { trigger: '.interests-new', start: 'top 65%', end: 'bottom 70%', scrub: .6 } });
      gsap.fromTo('.interests-intro > svg', { rotate: -70 }, { rotate: 0, ease: 'none', scrollTrigger: { trigger: '.interests-heading', start: 'top 90%', end: 'bottom 50%', scrub: .5 } });
      const media = gsap.matchMedia();
      media.add('(min-width: 900px)', () => {
        gsap.fromTo('.statement-shell', { clipPath: 'inset(0 5% round 35px)' }, { clipPath: 'inset(0 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'top 20%', scrub: 1 } });
        gsap.to('.about-orbit', { rotate: 130, ease: 'none', scrollTrigger: { trigger: '.about-new', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
    });
    const animations = new Set();
    const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const animation = target.animate([{ opacity: 0, transform: 'translateY(35px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
      animations.add(animation); animation.onfinish = () => animations.delete(animation); observer.unobserve(target);
    }), { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => { context.revert(); observer.disconnect(); animations.forEach((animation) => animation.cancel()); };
  }, [motionOn]);
  return <div className="page-progress" aria-hidden="true" />;
}
export default function Portfolio() {
  const preferences = usePreferences();
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Motion motionOn={preferences.motionOn} />
    <Header {...preferences} />
    <main id="main-content" tabIndex={-1}>
      <Hero {...preferences} />
      <section className="statement" aria-label="My approach"><div className="statement-shell"><div className="wrap"><p className="overline">THE MINDSET / ALWAYS EXPLORING</p><p className="statement-copy">{'The best ideas live between what is and what could be.'.split(' ').map((word, i) => <span key={i}>{word} </span>)}</p><div className="statement-bottom"><span className="statement-symbol" aria-hidden="true">↗</span><p>I connect code, data, and a little imagination<br />to make that space a little more interesting.</p><span className="overline">THINK IT.<br />BUILD IT.</span></div></div></div></section>
      <Work motionOn={preferences.motionOn} />
      <About />
      <Interests motionOn={preferences.motionOn} />
      <Lab {...preferences} />
      <Contact motionOn={preferences.motionOn} />
    </main>
  </>;
}
