import { useEffect, useRef } from 'react';

// A projected wire sculpture made from local geometry; no video or 3D library.
export default function OrbitalSculpture({ motionOn }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0, size = 0, rotation = .35, lastTime = 0, visible = true;
    const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
    const rings = Array.from({ length: 48 }, (_, i) => Array.from({ length: 129 }, (_, j) => {
      const u = i / 48 * Math.PI * 2, v = j / 128 * Math.PI * 2;
      return [(1 + .46 * Math.cos(v)) * Math.cos(u), (1 + .46 * Math.cos(v)) * Math.sin(u), .46 * Math.sin(v) + .17 * Math.sin(u * 3)];
    }));
    function draw(time = 0) {
      frame = 0;
      if (!size) return;
      const delta = lastTime ? Math.min(time - lastTime, 40) : 0;
      lastTime = time;
      if (motionOn) rotation += delta * .00012;
      eased.x += (pointer.x - eased.x) * .045; eased.y += (pointer.y - eased.y) * .045;
      ctx.clearRect(0, 0, size, size);
      const a = .95 + eased.y * .25, b = rotation + eased.x * .3;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const projected = rings.map((ring) => {
        const points = ring.map(([x, y, z]) => {
          const rx = x * cb + z * sb, rz = -x * sb + z * cb;
          const ry = y * ca - rz * sa, depth = y * sa + rz * ca;
          const perspective = 4.8 / (4.8 - depth);
          return [size / 2 + rx * size * .255 * perspective, size / 2 + ry * size * .255 * perspective, depth];
        });
        return { points, depth: points.reduce((sum, p) => sum + p[2], 0) / points.length };
      }).sort((p, q) => p.depth - q.depth);
      projected.forEach(({ points, depth }) => {
        ctx.beginPath();
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.strokeStyle = `rgba(222, 80, 39, ${.26 + (depth + 1.5) / 3 * .65})`;
        ctx.lineWidth = size > 450 ? 1.15 : .85; ctx.stroke();
      });
      if (motionOn && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function resize() {
      size = canvas.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr; canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!frame) draw();
    }
    function move(event) {
      if (!motionOn || event.pointerType !== 'mouse') return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width - .5;
      pointer.y = (event.clientY - bounds.top) / bounds.height - .5;
    }
    function leave() { pointer.x = 0; pointer.y = 0; }
    function resume() {
      lastTime = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else if (!frame && visible) draw();
    }
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume(); else { cancelAnimationFrame(frame); frame = 0; }
    });
    intersectionObserver.observe(canvas);
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', resume); resize();
    return () => {
      cancelAnimationFrame(frame); resizeObserver.disconnect(); intersectionObserver.disconnect();
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [motionOn]);
  return <canvas ref={canvasRef} className="orbital-canvas" aria-hidden="true" />;
}
