import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PageEffects({ motionOn }) {
  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--reading-progress', height > 0 ? window.scrollY / height : 0);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    const observer = new ResizeObserver(scroll); observer.observe(document.body);
    return () => {
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll);
      observer.disconnect(); cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!motionOn) return;
    const context = gsap.context(() => {
      // Keep the page usable if motion is disabled while an entrance is in progress.
      gsap.from('.hero-line > span', { yPercent: 115, rotate: 3, duration: 1.25, stagger: .13, ease: 'power4.out', clearProps: 'all' });
      gsap.from('.hero-enter', { y: 22, opacity: 0, duration: 1, stagger: .07, delay: .3, ease: 'power3.out', clearProps: 'all' });
      gsap.utils.toArray('.section-title, .section-label, .project-section-heading, .about-facts, .education-card, .plaything, .contact-form, .about-notebook, .about-manifesto').forEach((element) => {
        gsap.from(element, { y: 45, opacity: 0, duration: 1, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
      const media = gsap.matchMedia();
      media.add('(min-width: 800px)', () => {
        gsap.to('.hero-visual', { y: 70, rotate: -7, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.to('.manifesto-star', { rotate: 180, ease: 'none', scrollTrigger: { trigger: '.about-manifesto', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      const words = gsap.utils.toArray('.scroll-word');
      if (words.length) gsap.fromTo(words, { opacity: .25 }, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '.manifesto-text', start: 'top 85%', end: 'bottom 45%', scrub: .6 } });
    });
    // Project lists change after filtering, so reveal newly mounted cards as well.
    const animatedCards = new WeakSet();
    const cardAnimations = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        const animation = target.animate([{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
        cardAnimations.add(animation);
        animation.onfinish = () => cardAnimations.delete(animation);
        observer.unobserve(target);
      });
    }, { threshold: .06 });
    const trackCards = () => document.querySelectorAll('.project-card').forEach((card) => {
      if (!animatedCards.has(card)) { animatedCards.add(card); observer.observe(card); }
    });
    trackCards();
    const mutation = new MutationObserver(() => { trackCards(); ScrollTrigger.refresh(); });
    const grid = document.getElementById('project-grid');
    if (grid) mutation.observe(grid, { childList: true });
    const resize = new ResizeObserver(() => ScrollTrigger.refresh()); resize.observe(document.querySelector('main'));
    return () => {
      context.revert(); observer.disconnect(); mutation.disconnect(); resize.disconnect();
      cardAnimations.forEach((animation) => animation.cancel());
    };
  }, [motionOn]);
  return <div className="reading-progress" aria-hidden="true" />;
}
