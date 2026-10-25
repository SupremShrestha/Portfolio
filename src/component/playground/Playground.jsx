import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Bug, Eraser, Pencil, Play, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { clamp, GAME_SECONDS, loadBestScore, nextBugPosition, pointInSurface, saveBestScore, secondsRemaining } from './playgroundLogic';
import './Playground.css';

function paintSketch(canvas, strokes, ink, background) {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const stroke of strokes) {
    context.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = ink;
    context.fillStyle = ink;
    context.lineWidth = Math.min(canvas.width, canvas.height) * (stroke.tool === 'eraser' ? 0.075 : 0.01);
    context.beginPath();
    const [first, ...rest] = stroke.points;
    if (!first) continue;
    const startX = first.x * canvas.width;
    const startY = first.y * canvas.height;
    if (rest.length === 0) {
      context.arc(startX, startY, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.moveTo(startX, startY);
      for (const point of rest) context.lineTo(point.x * canvas.width, point.y * canvas.height);
      context.stroke();
    }
  }
  if (background) {
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.globalCompositeOperation = 'source-over';
}

function DrawingPad() {
  const canvasRef = useRef(null);
  const surfaceRef = useRef(null);
  const strokesRef = useRef([]);
  const activePointerRef = useRef(null);
  const keyboardPointRef = useRef({ x: 0.5, y: 0.5 });
  const exportRef = useRef({ mounted: false, url: null, timer: null });
  const [tool, setTool] = useState('pen');
  const [strokeCount, setStrokeCount] = useState(0);
  const [keyboardPoint, setKeyboardPoint] = useState(null);
  const [message, setMessage] = useState('No brief. No rules. Just a little blank space.');

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) paintSketch(canvas, strokesRef.current, getComputedStyle(canvas).getPropertyValue('--ink').trim() || '#171717');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const exportedFile = exportRef.current;
    exportedFile.mounted = true;
    const resize = () => {
      const bounds = surfaceRef.current.getBoundingClientRect();
      const resolution = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * resolution);
      canvas.height = Math.round(bounds.height * resolution);
      redraw();
    };
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(surfaceRef.current);
    if (!observer) window.addEventListener('resize', resize);
    const themeObserver = new MutationObserver(redraw);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => {
      exportedFile.mounted = false;
      if (exportedFile.timer !== null) window.clearTimeout(exportedFile.timer);
      if (exportedFile.url) URL.revokeObjectURL(exportedFile.url);
      observer?.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [redraw]);

  const addStroke = (points, strokeTool = tool) => {
    strokesRef.current = [...strokesRef.current, { tool: strokeTool, points }];
    setStrokeCount(strokesRef.current.length);
    redraw();
  };

  const endPointer = (event) => {
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const startPointer = (event) => {
    if (event.button !== 0 || activePointerRef.current !== null) return;
    event.preventDefault();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    setKeyboardPoint(null);
    addStroke([pointInSurface(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())]);
    setMessage('Looking good. Make a mark, make a mess.');
  };

  const movePointer = (event) => {
    if (activePointerRef.current !== event.pointerId) return;
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    if (!stroke) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const coalesced = event.nativeEvent.getCoalescedEvents?.();
    const events = coalesced?.length ? coalesced : [event];
    for (const point of events) stroke.points.push(pointInSurface(point.clientX, point.clientY, bounds));
    redraw();
  };

  const drawWithKeyboard = (event) => {
    const steps = { ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, -0.025], ArrowDown: [0, 0.025] };
    const step = steps[event.key];
    if (step) {
      event.preventDefault();
      const previous = keyboardPointRef.current;
      const next = { x: clamp(previous.x + step[0]), y: clamp(previous.y + step[1]) };
      keyboardPointRef.current = next;
      setKeyboardPoint(next);
      if (event.shiftKey) addStroke([previous, next]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      addStroke([keyboardPointRef.current]);
      setKeyboardPoint(keyboardPointRef.current);
    }
  };

  const stampStar = () => {
    const center = { x: 0.2 + Math.random() * 0.6, y: 0.25 + Math.random() * 0.5 };
    const points = Array.from({ length: 11 }, (_, index) => {
      const angle = index * Math.PI / 5 - Math.PI / 2;
      const radius = index % 2 === 0 ? 0.12 : 0.05;
      return { x: center.x + Math.cos(angle) * radius * 0.65, y: center.y + Math.sin(angle) * radius };
    });
    addStroke(points, 'pen');
    setMessage('One tiny star. A very reasonable place to start.');
  };

  const undo = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
    setMessage('Last mark undone. Creative freedom restored.');
  };

  const clear = () => {
    strokesRef.current = [];
    activePointerRef.current = null;
    setStrokeCount(0);
    redraw();
    setMessage('A fresh page. Take two?');
  };

  const download = () => {
    const source = canvasRef.current;
    const exported = document.createElement('canvas');
    exported.width = source.width;
    exported.height = source.height;
    paintSketch(exported, strokesRef.current, '#171717', '#ffffff');
    exported.toBlob((blob) => {
      const exportedFile = exportRef.current;
      if (!exportedFile.mounted) return;
      if (!blob) {
        setMessage('Couldn’t save that drawing. Please try again.');
        return;
      }
      if (exportedFile.timer !== null) window.clearTimeout(exportedFile.timer);
      if (exportedFile.url) URL.revokeObjectURL(exportedFile.url);
      const url = URL.createObjectURL(blob);
      exportedFile.url = url;
      const link = document.createElement('a');
      link.href = url;
      link.download = 'a-little-doodle-by-you.png';
      link.click();
      exportedFile.timer = window.setTimeout(() => {
        URL.revokeObjectURL(url);
        exportedFile.url = null;
        exportedFile.timer = null;
      }, 1000);
      setMessage('Your doodle is ready. A little piece of the internet, yours.');
    }, 'image/png');
  };

  return (
    <article className="plaything sketch-pad" aria-labelledby="sketch-heading">
      <div className="plaything-top"><span className="mono">01 / Leave your mark</span><span className="plaything-tag">no talent required</span></div>
      <div className="plaything-heading"><h3 id="sketch-heading">The doodle pad.</h3><Pencil size={25} aria-hidden="true" /></div>
      <p className="plaything-description">Draw a face. Invent a logo. Explain the universe.</p>
      <div className="sketch-toolbar" aria-label="Drawing tools">
        <div className="sketch-tool-group">
          <button type="button" className={`play-tool${tool === 'pen' ? ' is-active' : ''}`} aria-pressed={tool === 'pen'} onClick={() => setTool('pen')}><Pencil size={15} aria-hidden="true" /> Pen</button>
          <button type="button" className={`play-tool${tool === 'eraser' ? ' is-active' : ''}`} aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')}><Eraser size={15} aria-hidden="true" /> Eraser</button>
        </div>
        <button type="button" className="play-tool sketch-star" onClick={stampStar}><Sparkles size={15} aria-hidden="true" /> Add a star</button>
      </div>
      <div className={`sketch-surface${tool === 'eraser' ? ' is-erasing' : ''}`} ref={surfaceRef}>
        <canvas ref={canvasRef} tabIndex={0} aria-label="Your drawing canvas" aria-describedby="sketch-instructions"
          onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={() => { activePointerRef.current = null; }}
          onKeyDown={drawWithKeyboard} onFocus={() => setKeyboardPoint(keyboardPointRef.current)} onBlur={() => setKeyboardPoint(null)}>
          Draw using a pointer or use the Add a star button to create a doodle.
        </canvas>
        {strokeCount === 0 && <div className="sketch-empty" aria-hidden="true"><span>your next great idea<br />probably starts here</span><svg viewBox="0 0 66 62"><path d="M5 7C50 0 60 28 38 52M36 37l1 17 16-6" /></svg></div>}
        {keyboardPoint && <span className="sketch-cursor" style={{ left: `${keyboardPoint.x * 100}%`, top: `${keyboardPoint.y * 100}%` }} aria-hidden="true" />}
      </div>
      <p id="sketch-instructions" className="sketch-instructions">Drag to draw. Keyboard: arrows to move, Shift + arrows to draw, Enter for a dot.</p>
      <div className="sketch-bottom">
        <div className="sketch-tool-group"><button type="button" className="play-tool" disabled={!strokeCount} onClick={undo}><RotateCcw size={15} aria-hidden="true" /> Undo</button><button type="button" className="play-tool" disabled={!strokeCount} onClick={clear}><Trash2 size={15} aria-hidden="true" /> Clear</button></div>
        <button type="button" className="play-tool sketch-save" onClick={download} disabled={!strokeCount}><ArrowDownToLine size={15} aria-hidden="true" /> Save PNG</button>
      </div>
      <p className="plaything-note" role="status">{message}</p>
    </article>
  );
}

function BugGame({ motionOn }) {
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBestScore);
  const [remaining, setRemaining] = useState(GAME_SECONDS);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [announcement, setAnnouncement] = useState('One bug. Fifteen seconds. How hard can it be?');
  const scoreRef = useRef(0);
  const deadlineRef = useRef(0);
  const bugRef = useRef(null);
  const startRef = useRef(null);
  const returnFocusRef = useRef(false);

  useEffect(() => {
    if (phase !== 'playing') return;
    const clock = window.setInterval(() => {
      const time = secondsRemaining(deadlineRef.current);
      setRemaining(time);
      if (time === 0) {
        returnFocusRef.current = document.activeElement === bugRef.current;
        setPhase('ended');
        setBest((previous) => {
          const next = Math.max(previous, scoreRef.current);
          saveBestScore(next);
          return next;
        });
        setAnnouncement(`Time! You caught ${scoreRef.current} ${scoreRef.current === 1 ? 'bug' : 'bugs'}. Ready for another round?`);
      }
    }, 100);
    const wandering = motionOn ? window.setInterval(() => setPosition((previous) => nextBugPosition(previous)), 1050) : null;
    return () => {
      window.clearInterval(clock);
      if (wandering !== null) window.clearInterval(wandering);
    };
  }, [phase, motionOn]);

  useEffect(() => {
    if (phase === 'playing') bugRef.current?.focus({ preventScroll: true });
    if (phase === 'ended' && returnFocusRef.current) startRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    deadlineRef.current = Date.now() + GAME_SECONDS * 1000;
    setScore(0);
    setRemaining(GAME_SECONDS);
    setPosition(nextBugPosition());
    setAnnouncement('Go! Click or tap the bug. Keyboard players: press Space or Enter.');
    setPhase('playing');
  };

  const squash = () => {
    if (phase !== 'playing' || Date.now() >= deadlineRef.current) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setPosition((previous) => nextBugPosition(previous));
  };

  const stop = () => {
    setPhase('idle');
    setRemaining(GAME_SECONDS);
    setAnnouncement('Round stopped. Take a breather, then try again.');
  };

  return (
    <article className="plaything bug-game" aria-labelledby="bug-heading">
      <div className="plaything-top"><span className="mono">02 / A tiny distraction</span><span className="plaything-tag bug-tag">100% real debugging*</span></div>
      <div className="plaything-heading"><h3 id="bug-heading">Catch that bug.</h3><Bug size={27} aria-hidden="true" /></div>
      <p className="plaything-description">Finally, a bug you can actually fix by clicking it.</p>
      <div className="bug-scoreboard"><div><span className="mono">Caught</span><strong>{String(score).padStart(2, '0')}</strong></div><div><span className="mono">Personal best</span><strong>{String(best).padStart(2, '0')}</strong></div><div className={remaining <= 5 && phase === 'playing' ? 'bug-clock is-urgent' : 'bug-clock'}><span className="mono">Time left</span><strong>{String(remaining).padStart(2, '0')}<small>s</small></strong></div></div>
      <div className={`bug-field${phase === 'playing' ? ' is-playing' : ''}`}>
        <span className="bug-field-label mono" aria-hidden="true">Containment area</span>
        {phase === 'playing' ? <div className="bug-habitat"><button type="button" ref={bugRef} className="bug-target" style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} onClick={squash} aria-label="Catch the bug"><Bug size={30} strokeWidth={1.8} aria-hidden="true" /><span className="bug-hit-label" aria-hidden="true">+1</span></button></div> : <div className="bug-idle-art" aria-hidden="true"><div className="bug-doodle"><Bug size={55} strokeWidth={1.4} /><span>{phase === 'ended' ? 'phew!' : 'who, me?'}</span></div><p>{phase === 'ended' ? `${score} bugs caught. Nice reflexes.` : 'A small problem with six legs.'}</p><span className="mono">{phase === 'ended' ? 'The bug would like a rematch.' : 'Press start. Chaos will follow.'}</span></div>}
        {phase === 'playing' && <div className="bug-time-track" aria-hidden="true"><span style={{ width: `${remaining / GAME_SECONDS * 100}%` }} /></div>}
      </div>
      <p className="bug-instructions">Click or tap to catch. Keyboard: focus the bug, then press Space or Enter.</p>
      <div className="bug-game-bottom"><button ref={startRef} type="button" className="play-start" onClick={phase === 'playing' ? stop : start}>{phase === 'playing' ? <><span aria-hidden="true">■</span> End round</> : <><Play size={15} fill="currentColor" aria-hidden="true" /> {phase === 'ended' ? 'Play again' : 'Start 15-second round'} <ArrowUpRight size={16} aria-hidden="true" /></>}</button><span className="bug-disclaimer">*not how debugging works</span></div>
      <p className="plaything-note" role="status">{announcement}</p>
    </article>
  );
}

export default function Playground({ motionOn = true }) {
  return (
    <section id="playground" className="section playground-section" aria-labelledby="playground-heading">
      <div className="container">
        <div className="playground-intro"><div><p className="section-label">04 / A little off-script</p><h2 className="section-title" id="playground-heading">Serious about<br /><span>playing around.</span><svg className="playground-title-scribble" viewBox="0 0 360 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9Q103-2 196 7T357 6M39 12Q161 4 306 11" /></svg></h2></div><p>Good things happen when you get curious.<br />Take a break. Click something. Make a mess.<span className="playground-handnote">yes, these actually work ↙</span></p></div>
        <div className="playground-grid"><DrawingPad /><BugGame motionOn={motionOn} /></div>
        <p className="playground-footnote mono"><span aria-hidden="true">✳</span> Built for the joy of building things.</p>
      </div>
    </section>
  );
}
