import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowDownRight, ArrowLeft, ArrowRight, Camera, Download, Headphones, Pause, Plane, Play, RotateCcw, Telescope } from 'lucide-react';
import { PHOTOGRAPHS } from '../data/media';
import { tabDestination } from '../lib/sectionInteractions';
import './interests.css';

const INTERESTS = [
  { id: 'aviation', label: 'Aviation', Icon: Plane, title: 'A different perspective.', copy: 'There’s something about flight: the engineering, the possibility, the world getting a little bigger. Curiosity doesn’t stop at ground level.', prompt: 'Pick a destination. Trace a possibility.' },
  { id: 'photography', label: 'Photography', Icon: Camera, title: 'Notice the ordinary.', copy: 'Light, a little patience, and a different way of seeing. Photography is a reason to slow down and pay attention to what’s already there.', prompt: 'Same scene. A different frame. Make it yours.' },
  { id: 'music', label: 'Music', Icon: Headphones, title: 'Find a little rhythm.', copy: 'A soundtrack for thinking, making, and switching off. Sometimes a small change in rhythm is all it takes to see something differently.', prompt: 'Make a tiny loop. No musical experience required.' },
  { id: 'astronomy', label: 'Astronomy', Icon: Telescope, title: 'Stay a little starstruck.', copy: 'Looking up puts things in perspective. Astronomy is an invitation to keep asking questions, especially the ones without an easy answer.', prompt: 'Connect a few dots. Let curiosity do the rest.' },
];

const DESTINATIONS = [
  { city: 'Tokyo', code: 'HND', x: 530, y: 135 },
  { city: 'Singapore', code: 'SIN', x: 420, y: 285 },
  { city: 'London', code: 'LHR', x: 115, y: 100 },
];

function Aviation({ motionOn, active = true }) {
  const [destination, setDestination] = useState(0);
  const [progress, setProgress] = useState(48);
  const end = DESTINATIONS[destination], start = { x: 320, y: 190 };
  const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 90 };
  const t = progress / 100;
  const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x;
  const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y;
  const angle = Math.atan2(2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y), 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x)) * 180 / Math.PI;
  const plane = useRef(null), route = useRef(null), marker = useRef(null);
  const position = useRef({ x: DESTINATIONS[0].x, y: DESTINATIONS[0].y, progress: 48, destination: 0 });
  useLayoutEffect(() => {
    if (!active) return;
    const current = position.current;
    const changed = current.destination !== destination;
    current.destination = destination;
    if (changed && motionOn) current.progress = 0;
    const draw = () => {
      const cx = (320 + current.x) / 2, cy = Math.min(190, current.y) - 90, p = current.progress / 100;
      const px = (1-p)**2*320 + 2*(1-p)*p*cx + p*p*current.x;
      const py = (1-p)**2*190 + 2*(1-p)*p*cy + p*p*current.y;
      const rotation = Math.atan2(2*(1-p)*(cy-190)+2*p*(current.y-cy), 2*(1-p)*(cx-320)+2*p*(current.x-cx))*180/Math.PI;
      plane.current.setAttribute('transform', `translate(${px} ${py}) rotate(${rotation})`);
      route.current.setAttribute('d', `M320 190 Q${cx} ${cy} ${current.x} ${current.y}`);
      marker.current.setAttribute('transform', `translate(${current.x-end.x} ${current.y-end.y})`);
    };
    if (!motionOn) { Object.assign(current, { x: end.x, y: end.y, progress }); draw(); return; }
    draw();
    const tween = gsap.to(current, { x: end.x, y: end.y, progress, duration: changed ? .95 : .25, ease: 'power2.out', onUpdate: draw });
    return () => tween.kill();
  }, [destination, end.x, end.y, progress, motionOn, active]);
  return <>
    <div className="flight-board"><span>KTM <small>KATHMANDU</small></span><span className="flight-board-line"><Plane size={20}/></span><span>{end.code}<small>{end.city.toUpperCase()}</small></span></div>
    <svg className="flight-map" viewBox="0 0 640 350" role="img" aria-label={`Illustrative route from Kathmandu to ${end.city}, ${progress} percent along the route`}>
      <defs><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth=".5"/></pattern></defs>
      <rect width="640" height="350" fill="url(#map-grid)" opacity=".16"/>
      <g className="map-land" fill="currentColor" opacity=".1"><path d="M50 85 96 45 152 56 181 82 233 65 268 92 323 72 378 91 418 75 472 101 519 111 508 151 463 154 434 192 394 190 369 230 343 220 319 185 285 173 272 147 221 133 204 111 164 128 129 103 85 115Z"/><path d="M172 148 219 143 256 182 242 236 213 274 192 231 168 205Z"/><path d="M391 234 414 260 439 272 445 294 411 281Z"/><path d="M470 281 514 266 552 284 563 316 518 323 478 310Z"/></g>
      <path ref={route} d={`M${start.x} ${start.y} Q${control.x} ${control.y} ${end.x} ${end.y}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7" className="flight-route"/>
      {[{ ...start, code: 'KTM' }, end].map((point, index) => <g key={index} ref={index === 1 ? marker : undefined}><circle cx={point.x} cy={point.y} r="5" fill="currentColor"/><circle cx={point.x} cy={point.y} r="12" fill="none" stroke="currentColor" opacity=".3"/><text x={point.x} y={point.y + 30} textAnchor="middle">{point.code}</text></g>)}
      <g ref={plane} transform={`translate(${x} ${y}) rotate(${angle})`}><circle r="20" fill="var(--surface)" stroke="currentColor" strokeOpacity=".3"/><path d="m13 0-8-3-5-10-3 0 2 10-9-1-3-4-2 0 2 8-2 8 2 0 3-4 9-1-2 10 3 0 5-10Z" fill="currentColor" transform="scale(.8)"/></g>
    </svg>
    <div className="exhibit-controls"><div className="option-group" role="group" aria-label="Flight destination">{DESTINATIONS.map((place, i) => <button type="button" key={place.code} aria-pressed={i === destination} onClick={() => setDestination(i)}>{place.city}</button>)}</div><label className="range-label">EXPLORE THE ROUTE <input aria-label="Flight progress" type="range" min="0" max="100" value={progress} onChange={event => setProgress(Number(event.target.value))}/><output>{progress}%</output></label></div>
    <p className="exhibit-footnote">IMAGINED ROUTES · A LOVE OF FLIGHT, NOT A LIVE TRACKER</p>
  </>;
}

function Landscape({ exposure }) {
  return <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="An illustrated mountain landscape used for a photography framing study" style={{ filter: `brightness(${exposure / 100})` }}>
    <defs><linearGradient id="photo-sky" x2="0" y2="1"><stop stopColor="#27334e"/><stop offset=".7" stopColor="#c49c93"/><stop offset="1" stopColor="#e7b989"/></linearGradient><linearGradient id="photo-lake" x2="0" y2="1"><stop stopColor="#7b8b97"/><stop offset="1" stopColor="#273a4a"/></linearGradient></defs>
    <path fill="url(#photo-sky)" d="M0 0h600v400H0z"/><circle fill="#f4d6a4" cx="425" cy="108" r="32"/>
    <path fill="#67758c" d="m0 240 90-114 65 67 102-136 113 133 49-49 92 95 89-62v226H0Z"/>
    <path fill="#d5d7dc" d="m194 140 63-83 62 73-39-19-24 20-18-19-18 27Z"/>
    <path fill="#374b60" d="m0 239 69-46 52 42 96-58 83 65 64-34 101 45 71-47 64 30v164H0Z"/>
    <path fill="url(#photo-lake)" d="M0 275q155-20 300 0t300 0v125H0Z"/>
    <g stroke="#c8b6a5" opacity=".35"><path d="M330 297h146m-110 13h85m-133 16h178m-167 16h93m-25 19h131"/></g>
    <path fill="#192d38" d="M0 310q90-20 175 25t164 65H0Zm600 18q-78 5-153 72h153Z"/>
    <g stroke="#1a2c35" strokeWidth="4"><path d="M81 340V202m-28 60 28-46 28 46m-37-8-30 48 39-12 37 12-30-48M535 354V243m-22 47 22-36 22 36m-29-9-24 40 31-10 30 10-22-40"/></g>
  </svg>;
}

export function PhotoGallery({ photos = PHOTOGRAPHS }) {
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  const photo = photos[index % photos.length];
  return <div className="personal-gallery"><p className="overline accent-text">THROUGH MY LENS</p><figure key={photo.src}><img src={import.meta.env.BASE_URL + photo.src} alt={photo.alt} loading="lazy" decoding="async" width="1200" height="800"/><figcaption><span>{photo.caption}</span><small>{photo.location}</small></figcaption></figure>{photos.length > 1 && <div className="gallery-controls"><button type="button" className="round-button" aria-label="Previous photograph" onClick={() => setIndex((index - 1 + photos.length) % photos.length)}><ArrowLeft size={17}/></button><span role="status" className="overline">{index + 1} / {photos.length}</span><button type="button" className="round-button" aria-label="Next photograph" onClick={() => setIndex((index + 1) % photos.length)}><ArrowRight size={17}/></button></div>}</div>;
}

function Photography() {
  const [ratio, setRatio] = useState('3:2'), [exposure, setExposure] = useState(100), [captured, setCaptured] = useState(false);
  const scene = useRef(null);
  function changeRatio(value) { setRatio(value); setCaptured(false); }
  function capture() {
    const svg = scene.current.querySelector('svg').cloneNode(true);
    const width = ratio === '1:1' ? 400 : ratio === '4:5' ? 320 : 600;
    svg.setAttribute('viewBox', `${(600 - width) / 2} 0 ${width} 400`);
    svg.setAttribute('width', String(width * 2)); svg.setAttribute('height', '800');
    svg.removeAttribute('role'); svg.removeAttribute('aria-label');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `suprem-framing-study-${ratio.replace(':', 'x')}.svg`;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setCaptured(true);
  }
  return <>
    <PhotoGallery/>
    <div className="viewfinder-stage"><div className="viewfinder" data-ratio={ratio} ref={scene}><Landscape exposure={exposure}/><div className="thirds-grid" aria-hidden="true"/><span className="focus-bracket" aria-hidden="true"/><span className="camera-live overline">{captured ? 'FRAME CAPTURED' : 'COMPOSITION STUDY'}</span><span className="camera-setting overline">{ratio} / {exposure}% LIGHT</span>{captured && <span className="shutter" aria-hidden="true"/>}</div></div>
    <div className="exhibit-controls photo-controls"><div className="option-group" role="group" aria-label="Photo aspect ratio">{['3:2', '1:1', '4:5'].map(value => <button type="button" key={value} aria-pressed={ratio === value} onClick={() => changeRatio(value)}>{value}</button>)}</div><button type="button" className="capture-button" onClick={capture}><Download size={16}/>Download frame</button></div>
    <label className="range-label photo-exposure">EXPOSURE <input aria-label="Photo exposure" type="range" min="60" max="140" value={exposure} onChange={event => { setExposure(Number(event.target.value)); setCaptured(false); }}/><output>{((exposure - 100) / 40).toFixed(1)} EV</output></label>
    <p className="exhibit-footnote" role="status">{captured ? `SVG DOWNLOAD STARTED · ${ratio} · EXPOSURE ${exposure}%` : 'AN ILLUSTRATED SCENE · AN EXPERIMENT IN FRAMING, NOT MY PHOTO GALLERY'}</p>
  </>;
}

const INITIAL_PATTERN = [[true, false, false, true, false, false, true, false], [false, false, true, false, false, true, false, false], [true, false, false, false, true, false, false, true]];
const MUSIC_PRESETS = [
  { id: 'steady', label: 'Steady', pattern: INITIAL_PATTERN },
  { id: 'spaced', label: 'Spaced', pattern: [[true, false, false, false, false, false, false, false], [false, false, false, true, false, false, false, false], [false, false, false, false, false, false, true, false]] },
  { id: 'offbeat', label: 'Offbeat', pattern: [[false, true, false, false, false, true, false, false], [false, false, false, true, false, false, false, true], [true, false, true, false, true, false, true, false]] },
];
const NOTES = [{ label: 'C', frequency: 261.63 }, { label: 'E', frequency: 329.63 }, { label: 'G', frequency: 392 }];

function Music({ active = true }) {
  const [pattern, setPattern] = useState(INITIAL_PATTERN), [bpm, setBpm] = useState(92), [playing, setPlaying] = useState(false), [step, setStep] = useState(-1), [error, setError] = useState('');
  const audio = useRef(null), stage = useRef(null), patternRef = useRef(pattern), starting = useRef(false), visible = useRef(true);
  const activeRef = useRef(active);
  const [preset, setPreset] = useState('steady');
  useLayoutEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    if (!active) { setPlaying(false); setStep(-1); audio.current?.suspend().catch(() => {}); }
  }, [active]);
  useEffect(() => { patternRef.current = pattern; }, [pattern]);
  useEffect(() => {
    const stop = () => { setPlaying(false); setStep(-1); audio.current?.suspend().catch(() => {}); };
    const visibility = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; if (!entry.isIntersecting) stop(); });
    observer.observe(stage.current); document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); audio.current?.close().catch(() => {}); audio.current = null; };
  }, []);
  useEffect(() => {
    if (!playing || !active) return;
    let index = 0;
    const tick = () => {
      const context = audio.current;
      if (!context || context.state !== 'running') return;
      setStep(index);
      NOTES.forEach((note, row) => {
        if (!patternRef.current[row][index]) return;
        const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
        oscillator.type = 'sine'; oscillator.frequency.value = note.frequency;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.065, now + .02); gain.gain.exponentialRampToValueAtTime(.001, now + .35);
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(now); oscillator.stop(now + .4);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
      index = (index + 1) % 8;
    };
    tick(); const timer = window.setInterval(tick, 30000 / bpm);
    return () => window.clearInterval(timer);
  }, [playing, bpm, active]);
  async function toggle() {
    if (starting.current) return;
    if (playing) { setPlaying(false); setStep(-1); await audio.current?.suspend().catch(() => {}); return; }
    starting.current = true;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('unsupported');
      if (!audio.current) audio.current = new Audio();
      const context = audio.current;
      await context.resume();
      if (audio.current === context && activeRef.current && visible.current && !document.hidden) { setError(''); setPlaying(true); }
      else await context.suspend();
    } catch { setError('Audio is unavailable in this browser. You can still build a pattern.'); }
    finally { starting.current = false; }
  }
  return <div ref={stage}>
    <div className="music-display"><div className={`vinyl ${playing ? 'is-playing' : ''}`} aria-hidden="true"><div><Headphones size={27}/></div></div><div><span className="overline accent-text">THE CURIOSITY SESSIONS</span><h4>A little loop.</h4><p>Three notes. Eight steps.<br/>An original sound, made by you.</p></div></div>
    <div className="music-presets"><span className="overline">START WITH A FEELING</span><div className="option-group" role="group" aria-label="Music patterns">{MUSIC_PRESETS.map(item => <button type="button" key={item.id} aria-pressed={preset === item.id} onClick={() => { setPreset(item.id); setPattern(item.pattern); }}>{item.label}</button>)}</div></div>
    <div className="sequencer" role="group" aria-label="Music sequencer"><div className="sequence-beats" aria-hidden="true"><span/>{Array.from({ length: 8 }, (_, i) => <span key={i} data-current={step === i}>{i + 1}</span>)}</div>{NOTES.map((note, row) => <div className="sequence-row" key={note.label}><span>{note.label}</span>{pattern[row].map((enabled, col) => <button type="button" key={col} aria-label={`${note.label}, step ${col + 1}`} aria-pressed={enabled} className={step === col ? 'current-step' : ''} onClick={() => { setPreset(null); setPattern(current => current.map((notes, r) => r === row ? notes.map((value, c) => c === col ? !value : value) : notes)); }}><span/></button>)}</div>)}</div>
    <div className="exhibit-controls"><button type="button" className="capture-button" aria-pressed={playing} onClick={toggle}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? 'Pause loop' : 'Play your loop'}</button><button type="button" className="quiet-link" onClick={() => { setPreset('steady'); setPattern(INITIAL_PATTERN); }} aria-label="Reset music pattern"><RotateCcw size={15}/>Reset</button><label className="range-label tempo-label">TEMPO <input aria-label="Music tempo" type="range" min="60" max="140" value={bpm} onChange={event => setBpm(Number(event.target.value))}/><output>{bpm} BPM</output></label></div>
    <p className="exhibit-footnote" role="status">{error || 'TAP THE STEPS TO COMPOSE · SOUND STARTS ONLY WHEN YOU PRESS PLAY'}</p>
  </div>;
}

const CONSTELLATIONS = [
  { name: 'Orion', stars: [[27, 22, 'Betelgeuse'], [69, 24, 'Bellatrix'], [41, 48, 'Alnitak'], [49, 44, 'Alnilam'], [57, 40, 'Mintaka'], [32, 80, 'Saiph'], [73, 76, 'Rigel']], lines: [[0, 1], [0, 2], [2, 3], [3, 4], [4, 1], [2, 5], [4, 6], [5, 6]] },
  { name: 'Cassiopeia', stars: [[15, 30, 'Caph'], [32, 66, 'Schedar'], [49, 35, 'Gamma Cassiopeiae'], [67, 70, 'Ruchbah'], [84, 22, 'Segin']], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { name: 'Lyra', stars: [[32, 20, 'Vega'], [47, 41, 'Zeta Lyrae'], [72, 49, 'Delta Lyrae'], [36, 70, 'Sheliak'], [61, 79, 'Sulafat']], lines: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 1]] },
];

function Astronomy() {
  const [selected, setSelected] = useState(0), [star, setStar] = useState(0), [lines, setLines] = useState(true);
  const constellation = CONSTELLATIONS[selected];
  return <>
    <div className="star-map"><div className="star-map-dust" aria-hidden="true"/>
      <span className="star-north overline">N / LOOK UP</span>
      <svg key={constellation.name} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="constellation-lines">{lines && constellation.lines.map(([from, to], index) => <line key={`${from}-${to}`} pathLength="1" style={{ animationDelay: `${index * 100}ms` }} x1={constellation.stars[from][0]} y1={constellation.stars[from][1]} x2={constellation.stars[to][0]} y2={constellation.stars[to][1]}/>)}</svg>
      {constellation.stars.map(([x, y, name], index) => <button type="button" key={name} className="map-star" style={{ left: `${x}%`, top: `${y}%` }} aria-label={`Explore ${name}`} aria-pressed={index === star} onClick={() => setStar(index)}><span/><span className="star-tooltip">{name}</span></button>)}
      <div className="star-identification" role="status"><span className="overline">A POINT OF CURIOSITY</span><strong>{constellation.stars[star][2]}</strong></div>
    </div>
    <div className="exhibit-controls"><div className="option-group" role="group" aria-label="Constellation">{CONSTELLATIONS.map((item, index) => <button type="button" key={item.name} aria-pressed={index === selected} onClick={() => { setSelected(index); setStar(0); }}>{item.name}</button>)}</div><button type="button" className="quiet-link" aria-pressed={lines} onClick={() => setLines(value => !value)}>{lines ? 'Hide' : 'Connect'} the dots</button></div>
    <div className="star-browse"><p className="exhibit-footnote">{constellation.name.toUpperCase()} · STAR {star + 1} OF {constellation.stars.length}</p><button type="button" className="quiet-link" onClick={() => setStar((star + 1) % constellation.stars.length)}>Next star <ArrowRight size={15}/></button></div>
  </>;
}

const EXHIBITS = [Aviation, Photography, Music, Astronomy];

const INTEREST_HINTS = ['Follow a route', 'Find your frame', 'Make a little loop', 'Connect the stars'];

export default function Interests({ motionOn = true }) {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const interest = INTERESTS[active];
  useEffect(() => {
    const select = event => { const index = INTERESTS.findIndex(item => item.id === event.detail); if (index >= 0) setActive(index); };
    window.addEventListener('portfolio-interest', select);
    return () => window.removeEventListener('portfolio-interest', select);
  }, []);
  function keyboard(event, index) {
    const next = tabDestination(event.key, index, INTERESTS.length);
    if (next === null) return;
    event.preventDefault(); setActive(next); tabs.current[next].focus();
  }
  return <section className="interests-new" id="interests" aria-labelledby="interests-title"><div className="wrap">
    <div className="interests-heading" data-reveal><div><p className="overline accent-text">OFF THE CLOCK / STILL CURIOUS</p><h2 className="display-heading" id="interests-title">OTHER<br/><span>ORBITS.</span></h2></div><div className="interests-intro"><ArrowDownRight size={37} strokeWidth={1}/><span className="overline accent-text">FOUR WAYS TO WANDER</span><p>Not everything needs to be a project.<br/>Some things are just worth getting lost in.</p><span className="orbit-invitation">Pick an orbit. Stay a little.</span></div></div>
    <div className="interest-tabs" role="tablist" aria-label="Explore my interests" data-reveal style={{ '--active-orbit': active }}><span className="orbit-tab-indicator" aria-hidden="true"/>{INTERESTS.map(({ id, label, Icon }, index) => <button type="button" role="tab" id={`tab-${id}`} aria-selected={active === index} aria-controls={`panel-${id}`} tabIndex={active === index ? 0 : -1} key={id} ref={node => { tabs.current[index] = node; }} onClick={() => setActive(index)} onKeyDown={event => keyboard(event, index)}><span className="interest-tab-number">0{index + 1}</span><Icon size={23} strokeWidth={1.5}/><span className="orbit-tab-copy"><strong>{label}</strong><small>{INTEREST_HINTS[index]}</small></span><span className="interest-tab-dot"/></button>)}</div>
    <div className="orbit-guide"><p role="status"><span className="orbit-guide-dot"/>EXPLORING <strong>{interest.label}</strong></p><span>Your experiments stay as you explore.</span><div><button type="button" className="round-button" aria-label="Previous interest" onClick={() => setActive((active - 1 + INTERESTS.length) % INTERESTS.length)}><ArrowLeft size={16}/></button><span className="overline">0{active + 1} / 04</span><button type="button" className="round-button" aria-label="Next interest" onClick={() => setActive((active + 1) % INTERESTS.length)}><ArrowRight size={16}/></button></div></div>
    {INTERESTS.map((item, index) => {
      const Exhibit = EXHIBITS[index], Icon = item.Icon;
      return <div className="orbit-panel" key={item.id} role="tabpanel" id={`panel-${item.id}`} aria-labelledby={`tab-${item.id}`} hidden={active !== index} tabIndex={0}><div className="interest-workbench"><div className="interest-story"><div className="orbit-story-top"><span className="overline">FIELD NOTES / 0{index + 1}</span><Icon size={24} strokeWidth={1}/></div><h3>{item.title}</h3><p>{item.copy}</p><div className="interest-prompt"><ArrowRight size={23} strokeWidth={1.25}/><p>{item.prompt}</p></div><span className="interest-signature">A curious human, first.</span><div className="story-orbits" aria-hidden="true"><i/><i/><i/><span>0{index + 1}</span></div></div><div className="interest-exhibit"><div className="exhibit-top"><span className="live-dot"/><span className="overline">{item.label} / AN INTERACTIVE STUDY</span><span className="overline">TRY IT ↗</span></div><div className="exhibit-content"><Exhibit motionOn={motionOn && active === index} active={active === index}/></div></div></div></div>;
    })}
    <div className="interests-bottom"><span className="overline">FOUR INTERESTS. ONE RESTLESS CURIOSITY.</span><span className="overline">27.71° N / 85.32° E</span></div>
  </div></section>;
}
