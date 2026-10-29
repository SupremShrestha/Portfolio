import { useLayoutEffect, useRef } from 'react';
import { animationScope, decorativeClone, visibleRect } from '../lib/motion';

export default function useDialogMotion(dialogRef, open, motionOn, { kind = 'project', originRef, fallbackRef, onExited, contentKey } = {}) {
  const session = useRef(null);
  const exitCallback = useRef(onExited);
  useLayoutEffect(() => { exitCallback.current = onExited; });

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const scope = animationScope();
    function release() {
      if (!session.current) return;
      const { overflow, opener } = session.current;
      session.current = null;
      document.body.style.overflow = overflow;
      if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
      else fallbackRef?.current?.focus({ preventScroll: true });
    }
    async function run() {
      if (!open && !dialog.open) return;
      if (open && !dialog.open) {
        session.current = { overflow: document.body.style.overflow, opener: document.activeElement };
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
      dialog.dataset.phase = open ? 'entering' : 'closing';
      const duration = open ? 420 : 260;
      const jobs = [];
      if (motionOn) {
        const surface = kind === 'contact' ? dialog : dialog.querySelector(kind === 'menu' ? '.menu-inner' : '.sheet-inner');
        const target = kind === 'project' ? dialog.querySelector('.sheet-visual > .project-visual') : null;
        const from = visibleRect(originRef?.current), to = visibleRect(target);
        const shared = from && to && window.innerWidth >= 900;
        const offset = kind === 'contact' ? 'translateY(24px) scale(.985)' : kind === 'menu' ? 'translateY(-24px)' : 'translateX(48px)';
        jobs.push(scope.animate(surface, open
          ? [{ opacity: 0, transform: shared ? 'none' : offset }, { opacity: 1, transform: 'none' }]
          : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: shared ? 'none' : offset }], { duration }));
        if (kind === 'contact') {
          if (open) dialog.querySelectorAll('[data-contact-reveal]').forEach((element, index) => {
            jobs.push(scope.animate(element, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 80 + index * 40, fill: 'both' }));
          });
        } else if (kind === 'menu') {
          dialog.querySelectorAll('nav a').forEach((link, index) => {
            jobs.push(scope.animate(link, open
              ? [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }]
              : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-12px)' }],
            { duration: open ? 400 : 160, delay: open ? 55 + index * 38 : (5 - index) * 12, fill: 'both', hold: !open }));
          });
        } else {
          if (shared) {
            const ghost = decorativeClone(target);
            ghost.classList.add('project-flight');
            Object.assign(ghost.style, { width: `${to.width}px`, height: `${to.height}px`, minHeight: '0' });
            dialog.append(ghost);
            const previousVisibility = target.style.visibility;
            target.style.visibility = 'hidden';
            const restore = () => { ghost.remove(); target.style.visibility = previousVisibility; };
            scope.cleanup(restore);
            const frames = [
              { transform: `translate(${from.left}px, ${from.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, borderRadius: '16px' },
              { transform: `translate(${to.left}px, ${to.top}px) scale(1, 1)`, borderRadius: '0px' },
            ];
            jobs.push(scope.animate(ghost, open ? frames : [...frames].reverse(), { duration, fill: 'both' }).then(() => { if (!scope.cancelled) restore(); }));
          }
          if (open) dialog.querySelectorAll('.sheet-copy > [data-sheet-reveal]').forEach((element, index) => {
            jobs.push(scope.animate(element, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 120 + index * 45, fill: 'both' }));
          });
        }
      }
      await Promise.all(jobs);
      if (scope.cancelled) return;
      dialog.dataset.phase = open ? 'open' : 'closed';
      if (!open) {
        dialog.close();
        release();
        exitCallback.current?.();
      }
    }
    run();
    return () => scope.cancel();
  }, [dialogRef, open, motionOn, kind, originRef, fallbackRef, contentKey]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog.open) dialog.close();
      if (session.current) document.body.style.overflow = session.current.overflow;
      session.current = null;
    };
  }, [dialogRef]);
}
