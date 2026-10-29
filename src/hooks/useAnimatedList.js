import { useLayoutEffect, useRef } from 'react';
import { animationScope, decorativeClone } from '../lib/motion';

export default function useAnimatedList(listRef, exitsRef, listKey, motionOn) {
  const previous = useRef(null);
  const active = useRef(null);
  function capture() {
    const list = listRef.current;
    if (!motionOn || !list) { previous.current = null; return; }
    const bounds = list.getBoundingClientRect();
    previous.current = new Map([...list.children].map(row => [row.dataset.project, {
      top: row.getBoundingClientRect().top - bounds.top,
      width: row.offsetWidth, height: row.offsetHeight, clone: decorativeClone(row),
    }]));
    active.current?.cancel();
  }
  useLayoutEffect(() => {
    const scope = animationScope();
    active.current = scope;
    const snapshots = previous.current;
    previous.current = null;
    if (motionOn && snapshots && listRef.current) {
      const list = listRef.current, bounds = list.getBoundingClientRect();
      const ids = new Set();
      [...list.children].forEach((row, index) => {
        ids.add(row.dataset.project);
        const old = snapshots.get(row.dataset.project);
        const distance = old ? old.top - (row.getBoundingClientRect().top - bounds.top) : 20;
        scope.animate(row, [{ opacity: old ? 1 : 0, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, delay: old ? 0 : Math.min(index, 5) * 24, fill: 'both' });
      });
      snapshots.forEach(({ clone, top, width, height }, id) => {
        if (ids.has(id)) return;
        Object.assign(clone.style, { position: 'absolute', top: `${top}px`, left: '0', width: `${width}px`, height: `${height}px` });
        exitsRef.current.append(clone);
        scope.cleanup(() => clone.remove());
        scope.animate(clone, [{ opacity: .6, transform: 'none' }, { opacity: 0, transform: 'translateX(16px)' }], { duration: 140 }).then(() => clone.remove());
      });
    }
    return () => scope.cancel();
  }, [listKey, motionOn, listRef, exitsRef]);
  return capture;
}
