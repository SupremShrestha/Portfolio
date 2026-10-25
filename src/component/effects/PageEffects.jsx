import { useEffect } from 'react';

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
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scroll) : null;
    observer?.observe(document.body);
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!motionOn || !('IntersectionObserver' in window)) return;
    const sections = [...document.querySelectorAll('main > .section')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    sections.forEach((section) => {
      section.classList.add('reveal-section');
      observer.observe(section);
    });
    return () => {
      observer.disconnect();
      sections.forEach((section) => section.classList.remove('reveal-section'));
    };
  }, [motionOn]);

  return <div className="reading-progress" aria-hidden="true" />;
}
