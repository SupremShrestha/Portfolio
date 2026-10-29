import { useId, useState } from 'react';
export default function ProjectVisual({ project }) {
  const id = useId().replaceAll(':', '');
  const [failedSource, setFailedSource] = useState(null);
  const media = project.media;
  if (media?.screenshot && failedSource !== media.screenshot) return <div className="project-visual visual-screenshot">
    <div className="visual-top"><span className="visual-status"/><span>FROM THE PROJECT</span><span>↗</span></div>
    <img src={import.meta.env.BASE_URL + media.screenshot} alt={media.alt || `${project.title} screenshot`} loading="lazy" decoding="async" width="1600" height="1400" onError={() => setFailedSource(media.screenshot)}/>
    <div className="visual-bottom"><span>{media.caption || project.title}</span><span>{project.number}</span></div>
  </div>;
  const ride = project.id === 'group-ride-sharing', robot = project.id === 'robotic-arm-rl', risk = project.id === 'risk-evaluation';
  const kind = ride ? 'ride' : robot ? 'robot' : risk ? 'risk' : 'system';
  return <div className={`project-visual visual-${kind}`}>
    <div className="visual-top"><span className="visual-status" /><span>{ride ? 'CONNECTED BY THE JOURNEY' : robot ? 'LEARNING THROUGH MOVEMENT' : risk ? 'MAKING THE INVISIBLE VISIBLE' : 'IDEAS, MADE TANGIBLE'}</span><span>↗</span></div>
    <svg viewBox="0 0 800 560" className="project-scene" role="img" aria-label={`${project.title} conceptual illustration`}>
      <defs><pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".18" /></pattern><radialGradient id={`${id}-light`}><stop stopColor="currentColor" stopOpacity=".15" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></radialGradient></defs>
      <rect width="800" height="560" fill={`url(#${id}-grid)`} /><circle cx="400" cy="280" r="280" fill={`url(#${id}-light)`} />
      {ride ? <>
        <g className="map-roads" fill="none" stroke="currentColor" opacity=".16" strokeWidth="12"><path d="M0 130L800 380M0 380L800 130M200 0L450 560M500 0L240 560M710 0L540 560" /></g>
        <path d="M30 480Q170 180 400 380T810 300" fill="none" stroke="currentColor" strokeWidth="38" opacity=".08" />
        <g className="route-map"><path className="route-line" d="M185 360C130 260 330 295 360 190S600 140 620 300" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="7 9" />{[[185,360,'S'],[360,190,'P'],[620,300,'A']].map(([x,y,l])=><g key={l} transform={`translate(${x} ${y})`}><circle r="33" fill="currentColor" opacity=".1"/><circle className="map-ping" r="23" fill="none" stroke="currentColor"/><circle r="15" fill="currentColor"/><text y="5" textAnchor="middle" fill="#0d242b" fontSize="13" fontFamily="Arial">{l}</text></g>)}</g>
        <g className="map-card" transform="translate(245 350)"><rect width="300" height="90" rx="12" fill="#102c33" stroke="#7bd8e8" strokeOpacity=".4"/><text x="24" y="35" fill="#e5faff" fontSize="19" fontFamily="Arial">Your crew. One shared map.</text><text x="24" y="61" fill="#7bd8e8" fontSize="11" fontFamily="monospace">REALTIME / REACT NATIVE / MAPBOX</text></g>
      </> : robot ? <g transform="translate(400 330)">
        <g fill="none" stroke="currentColor" opacity=".2"><path d="M-230 60L0 180 230 60 0-60Z"/><path d="M-180 35L50 155M-120 5L110 125M-60-25L170 95M-170 95L60-25M-110 125L120 5M-50 155L180 35"/></g>
        <path d="M-88 43L0 90 100 40 12-5Z" fill="#554477" stroke="currentColor"/><path d="M-88 43v25L0 115V90M0 90v25L100 65V40" fill="#33294b" stroke="currentColor"/>
        <g className="robot-arm"><path d="M0 37L-35-90 3-106 45 14Z" fill="#ad91e2"/><path d="M-35-90L-85-230-40-245 3-106Z" fill="#dfcaff"/><circle cx="-16" cy="-95" r="31" fill="#342947" stroke="#dfcaff" strokeWidth="5"/><circle cx="-16" cy="-95" r="12" fill="#ad91e2"/><path d="M-85-230L75-268 88-220-40-194Z" fill="#b699e9"/><circle cx="-61" cy="-220" r="26" fill="#342947" stroke="#dfcaff" strokeWidth="4"/><path d="M79-247L139-222 125-190 87-220Z" fill="#705496"/><path d="M133-218l30 35-24 36M121-197l-8 38-29 4" stroke="#ddc9ff" strokeWidth="9" fill="none" strokeLinecap="round"/></g>
        <g className="robot-target"><path d="M138 35l36-20 36 20-36 20Z" fill="#e7ff9e"/><path d="M138 35v38l36 20V55Z" fill="#a6c16a"/><path d="M174 55v38l36-20V35Z" fill="#7b914c"/></g>
        <path d="M-200-70Q-225-270 5-305" fill="none" stroke="currentColor" strokeDasharray="4 8"/><circle cx="5" cy="-305" r="4" fill="currentColor"/>
      </g> : risk ? <>
        <g transform="translate(100 165) rotate(-12 300 100)">{Array.from({length: 96},(_,i)=>{const x=i%16,y=Math.floor(i/16);if(Math.abs(y-2.5+(x-7)*.13)>1.8)return null;return <rect key={i} className="risk-tile" x={x*37} y={y*33} width="31" height="27" rx="3" fill="currentColor" opacity={.2+(i*7%8)*.1} style={{animationDelay:`${i*.03}s`}}/>;})}</g>
        <path d="M100 420H700M100 390H700M100 450H700" stroke="currentColor" opacity=".15"/><path className="risk-signal" d="M100 430L145 400 190 410 235 375 280 410 325 350 370 380 415 330 460 360 505 300 550 340 595 320 640 360 700 290" fill="none" stroke="currentColor" strokeWidth="3"/><text x="100" y="115" fill="currentColor" fontSize="13" fontFamily="monospace">NEPAL / SPATIAL RISK INTELLIGENCE</text><circle cx="505" cy="300" r="9" fill="currentColor"/>
      </> : <g fill="none" stroke="currentColor">{[0,1,2,3,4].map((n)=><rect key={n} x={220+n*20} y={100+n*20} width={320-n*40} height={320-n*40} rx={50-n*8} transform={`rotate(${n*12} 380 260)`} opacity={.25+n*.13} strokeWidth="2"/>)}<path d="M340 230l-35 30 35 30M420 230l35 30-35 30M395 215l-30 90" strokeWidth="5" strokeLinecap="round"/><text x="400" y="485" textAnchor="middle" fontSize="15" fontFamily="monospace" fill="currentColor" stroke="none">{project.technologies.slice(0,3).join(' / ')}</text></g>}
    </svg>
    <div className="visual-bottom"><span>CONCEPT VISUAL / {project.number}</span><span>{project.category.toUpperCase()}</span></div>
  </div>;
}
