import { useEffect, useRef, useState } from 'react';

export default function DraggableSticker({ children, className = '', label }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);
  const stickerRef = useRef(null);

  useEffect(() => {
    const parent = stickerRef.current.parentElement;
    let previousWidth = parent.getBoundingClientRect().width;
    const resetOnResize = () => {
      const nextWidth = parent.getBoundingClientRect().width;
      if (Math.abs(nextWidth - previousWidth) < 1) return;
      previousWidth = nextWidth;
      start.current = null;
      setDragging(false);
      setPosition({ x: 0, y: 0 });
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resetOnResize) : null;
    observer?.observe(parent);
    window.addEventListener('resize', resetOnResize);
    return () => { observer?.disconnect(); window.removeEventListener('resize', resetOnResize); };
  }, []);

  const clamp = (element, next) => {
    const parent = element.parentElement.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const baseX = box.left - position.x;
    const baseY = box.top - position.y;
    return {
      x: Math.min(parent.right - baseX - box.width - 4, Math.max(parent.left - baseX + 4, next.x)),
      y: Math.min(parent.bottom - baseY - box.height - 4, Math.max(parent.top - baseY + 4, next.y)),
    };
  };
  const finish = (event) => {
    start.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <button ref={stickerRef} type="button" className={'desk-sticker ' + className + (dragging ? ' is-dragging' : '')}
      aria-label={label + '. Drag to move, or use arrow keys. Home resets its position.'}
      aria-roledescription="movable sticker"
      title="Drag me. Keyboard? Use the arrow keys."
      style={{ '--drag-x': position.x + 'px', '--drag-y': position.y + 'px' }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = { x: event.clientX, y: event.clientY, position };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!start.current) return;
        setPosition(clamp(event.currentTarget, {
          x: start.current.position.x + event.clientX - start.current.x,
          y: start.current.position.y + event.clientY - start.current.y,
        }));
      }}
      onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { start.current = null; setDragging(false); }}
      onKeyDown={(event) => {
        const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
        if (event.key === 'Home') { event.preventDefault(); setPosition({ x: 0, y: 0 }); }
        if (directions[event.key]) {
          event.preventDefault();
          const [x, y] = directions[event.key];
          setPosition(clamp(event.currentTarget, { x: position.x + x, y: position.y + y }));
        }
      }}>{children}<span className="sticker-grip" aria-hidden="true">⠿</span></button>
  );
}
