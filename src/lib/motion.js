export const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';

// One owner for every animation, including cancellation during rapid input.
export function animationScope() {
  const animations = new Set();
  const cleanups = [];
  let cancelled = false;
  return {
    get cancelled() { return cancelled; },
    animate(element, frames, options = {}) {
      if (!element?.animate || cancelled) return Promise.resolve();
      const { hold = false, ...timing } = options;
      const animation = element.animate(frames, { duration: 360, easing: EASE_OUT, ...timing });
      animations.add(animation);
      return animation.finished.catch(() => {}).finally(() => {
        if (hold && !cancelled) return;
        animations.delete(animation);
        animation.cancel();
      });
    },
    cleanup(callback) { cleanups.push(callback); },
    cancel() {
      cancelled = true;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      cleanups.splice(0).forEach(callback => callback());
    },
  };
}

export function visibleRect(element) {
  if (!element?.isConnected) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return null;
  return rect;
}

// Renaming SVG IDs keeps cloned gradient/pattern references self-contained.
let cloneId = 0;
export function decorativeClone(element) {
  const clone = element.cloneNode(true);
  const suffix = `-motion-${++cloneId}`;
  const nodes = [clone, ...clone.querySelectorAll('*')];
  const ids = new Map(nodes.filter(node => node.id).map(node => [node.id, node.id + suffix]));
  nodes.forEach(node => {
    if (node.id) node.id = ids.get(node.id);
    for (const attribute of [...node.attributes]) {
      let value = attribute.value;
      ids.forEach((replacement, id) => { value = value.replaceAll(`url(#${id})`, `url(#${replacement})`); });
      if (attribute.name !== 'id') node.setAttribute(attribute.name, value);
    }
    node.removeAttribute('autofocus');
  });
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  return clone;
}
