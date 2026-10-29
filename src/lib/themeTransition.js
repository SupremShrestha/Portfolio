// The latest selection wins even if a browser delays a transition callback.
export function createThemeTransition() {
  let generation = 0, active = null, wipe = null;
  return {
    get pending() { return active !== null; },
    change(apply, { motionOn, x, y }) {
      const request = ++generation;
      active?.skipTransition();
      active = null;
      wipe?.cancel(); wipe = null;
      const root = document.documentElement;
      if (!motionOn || !document.startViewTransition) {
        root.classList.remove('theme-transition');
        apply();
        return;
      }
      root.classList.add('theme-transition');
      const centerX = Number.isFinite(x) ? x : window.innerWidth / 2;
      const centerY = Number.isFinite(y) ? y : 45;
      const radius = Math.hypot(Math.max(centerX, window.innerWidth - centerX), Math.max(centerY, window.innerHeight - centerY));
      const transition = document.startViewTransition(() => { if (request === generation) apply(); });
      active = transition;
      transition.ready.then(() => {
        if (request !== generation || active !== transition) return;
        wipe = root.animate([
          { clipPath: `circle(0px at ${centerX}px ${centerY}px)` },
          { clipPath: `circle(${radius}px at ${centerX}px ${centerY}px)` },
        ], { duration: 520, easing: 'cubic-bezier(.65, 0, .2, 1)', pseudoElement: '::view-transition-new(root)', fill: 'both' });
      }).catch(() => {});
      transition.finished.catch(() => {}).finally(() => {
        if (request === generation) { root.classList.remove('theme-transition'); active = null; wipe?.cancel(); wipe = null; }
      });
    },
    cancel() { active?.skipTransition(); active = null; wipe?.cancel(); wipe = null; document.documentElement.classList.remove('theme-transition'); },
  };
}
