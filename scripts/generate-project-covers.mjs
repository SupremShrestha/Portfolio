import { writeFileSync } from 'node:fs';
import { PROJECTS } from '../src/data/projects.js';

const palettes = [
  ['#dbe4ca', '#2e493d', '#a9c28b'], ['#e6e0d4', '#e36540', '#b2b4a7'],
  ['#d3e0e3', '#31596b', '#81b6bf'], ['#dbd9e8', '#666083', '#b8afcb'],
  ['#ebdfcf', '#9a583d', '#d1ab85'], ['#253d3a', '#b9d3aa', '#598d82'],
];
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x,y,value,size=20,fill='#27342e',extra='') => `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
const line = (x1,y1,x2,y2,stroke,width=2,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const rect = (x,y,w,h,fill,r=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
function ride() {
  let roads = '';
  for (let i=0;i<8;i++) roads += `<path d="M${i*190-100} 0L${i*190+140} 750 M0 ${i*140}L1200 ${i*140-170}" stroke="#b8c8a5" stroke-width="18" fill="none"/>`;
  return roads + `<path d="M-30 570Q220 480 270 610T640 510T1260 400" stroke="#aec8c1" stroke-width="85" fill="none"/>` +
  `<g transform="translate(420 85) rotate(8 180 260)" filter="url(#shadow)">${rect(0,0,320,560,'#26372c',42)}${rect(11,11,298,538,'#f4f4e9',34)}${rect(112,20,96,19,'#26372c',10)}${text(34,85,'Ride together.',28)}${text(34,111,'Your crew. One shared map.',12,'#727c6c')}${rect(23,140,274,300,'#dbe5cb',14)}<path d="M45 190L280 385M40 360L265 180M160 150L120 430M30 270L290 280" stroke="#bbc9a8" stroke-width="11"/><path d="M80 345C40 240 220 360 215 220" fill="none" stroke="#355f44" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 8"/><circle cx="80" cy="345" r="14" fill="#355f44" stroke="#fff" stroke-width="4"/><circle cx="215" cy="220" r="14" fill="#e17851" stroke="#fff" stroke-width="4"/>${rect(29,456,262,62,'#2e493d',17)}${text(49,482,'SUNDAY RIDE',10,'#b9cdad')}${text(49,504,'Your people, in motion ↗',16,'#f3f4eb')}</g>`+
  `<g transform="translate(795 320) rotate(-7)" filter="url(#shadow)">${rect(0,0,200,74,'#f3f4ea',12)}<circle cx="32" cy="37" r="15" fill="#e27850"/>${text(59,32,'Live locations',16)}${text(59,54,'Stay on the same route',11,'#697562')}</g>`;
}
function robot() {
  let grid='';for(let i=-5;i<12;i++) grid+=`<path d="M${i*100} 570l500-250M${i*100} 320l500 250" stroke="#c6c7bb" stroke-width="1"/>`;
  return grid+`<g transform="translate(610 440)"><ellipse cy="135" rx="240" ry="44" fill="#a5a89d" opacity=".25"/><path d="M-140 72L0 145 150 70 0 0Z" fill="#8e978c"/><path d="M-140 72v32L0 178v-33M0 145v33l150-75V70" fill="#57685b"/><path d="M-15 65L-55-100 38-125 78 40Z" fill="#e36540"/><path d="M-55-100L-110-267-28-292 38-125Z" fill="#ec835e"/><circle cx="-10" cy="-118" r="47" fill="#374a3c"/><circle cx="-10" cy="-118" r="24" fill="#dfe4d6"/><path d="M-110-267L67-320 85-250-28-218Z" fill="#e36540"/><circle cx="-66" cy="-257" r="38" fill="#415343"/><circle cx="-66" cy="-257" r="19" fill="#e0e5d8"/><path d="M67-320L155-290 140-248 85-250Z" fill="#374a3c"/><path d="M142-278l42 30-27 40M143-250l-9 48-30 5" fill="none" stroke="#374a3c" stroke-width="16" stroke-linecap="round"/><path d="M-260-130q40-200 300-220" fill="none" stroke="#919a8b" stroke-width="2" stroke-dasharray="7 12"/><path d="M165 50l44-23 44 23-44 23Z" fill="#e7b17f"/><path d="M165 50v50l44 24V73Z" fill="#c88759"/><path d="M209 73v51l44-24V50Z" fill="#a96944"/></g>`+text(93,227,'LEARN.',50,'#445441','letter-spacing="-3"')+text(93,284,'REACH.',50,'#445441','letter-spacing="-3"')+text(93,341,'REPEAT.',50,'#445441','letter-spacing="-3"');
}
function risk() {
  let cells=''; for(let r=0;r<7;r++)for(let c=0;c<13;c++){if(Math.abs(r-3+(c-6)*.23)<2.0) cells+=rect(260+c*48,220+r*36,43,31,['#a7c8c5','#6c9f9e','#426b75','#e28a63'][(r*3+c*7)%4],4);}
  return `<g transform="rotate(-13 600 350)">${rect(180,105,840,480,'#e9efed',12,'filter="url(#shadow)"')}${line(215,171,985,171,'#bccccc')}${text(215,150,'BIPAD / SPATIAL INTELLIGENCE',14,'#42616a','letter-spacing="2"')}${cells}${text(230,541,'NEPAL • RISK LANDSCAPE',12,'#42616a')}${text(856,541,'MODEL STUDY',10,'#42616a')}</g>`+`<g transform="translate(770 460)" filter="url(#shadow)">${rect(0,0,270,110,'#31596b',10)}${text(22,32,'FROM DATA TO DIRECTION',11,'#b9d1d3')}<path d="M24 81l35-15 35 8 35-40 35 17 35-8 35-15" fill="none" stroke="#c3d6b7" stroke-width="3"/></g>`;
}
function pipeline() {
  let blocks='';const labels=['INGEST','VALIDATE','TRAIN','SERVE'];
  for(let i=0;i<4;i++){const x=120+i*252,y=210+(i%2)*110;blocks+=`<g transform="translate(${x} ${y})" filter="url(#shadow)">${rect(0,0,200,170,i===2?'#666083':'#f0eff5',14)}${text(23,35,'0'+(i+1),14,i===2?'#d5d0e5':'#9188a6')}${text(23,135,labels[i],20,i===2?'#f0eff5':'#665d7c','letter-spacing="2"')}<circle cx="100" cy="73" r="22" stroke="${i===2?'#b9b0d0':'#9c94b1'}" stroke-width="2" fill="none"/>${line(88,73,112,73,i===2?'#d4cbe8':'#8b81a3',2)}${line(100,61,100,85,i===2?'#d4cbe8':'#8b81a3',2)}</g>`;if(i<3)blocks+=`<path d="M${x+200} ${y+85}h26v${i%2?-110:110}h26" stroke="#9b91ae" stroke-width="2" fill="none" stroke-dasharray="5 5"/>`;}
  return blocks+text(600,556,'A MODEL IS ONLY THE BEGINNING.',16,'#746989','text-anchor="middle" letter-spacing="3"');
}
function tableflow() {
  let cards='';['Seasonal bowl','House special','Fresh greens'].forEach((label,i)=>{cards+=`<g transform="translate(${185+i*250} 215)">${rect(0,0,224,220,'#f5f0e7',9)}<circle cx="112" cy="82" r="54" fill="${['#e0b48c','#c5c29d','#b5c19c'][i]}"/><circle cx="112" cy="82" r="39" fill="#f8f3e9"/><path d="M88 70q50-25 45 35-38 24-45-35" fill="${['#ad7952','#d49455','#738b55'][i]}"/>${text(19,168,label,18,'#5d4d3d')}${text(19,196,'FRESHLY PREPARED',10,'#948675')}</g>`;});
  return `<g transform="rotate(-6 600 360)" filter="url(#shadow)">${rect(140,110,920,460,'#faf7f0',14)}${rect(140,110,920,70,'#79533e',14)}${text(180,154,'tableflow',28,'#f7f1e5','letter-spacing="-1"')}${text(830,151,'MENU / KITCHEN / POS',12,'#e5d7c6')}${cards}${text(185,524,'Good food. Seamless flow.',26,'#79533e')}${rect(810,484,200,48,'#79533e',24)}${text(847,514,'QR TO KITCHEN ↗',12,'#f6eee2')}</g>`;
}
function sonar() {
  let rings='';for(let r=50;r<=235;r+=46)rings+=`<circle cx="600" cy="350" r="${r}" stroke="#528075" stroke-width="1" fill="none"/>`;
  let wave='';for(let x=0;x<=920;x+=4){const y=350+Math.sin(x*.15)*Math.exp(-Math.pow((x-450)/135,2))*115;wave+=(x?'L':'M')+(140+x)+' '+y;}
  return rings+line(330,350,870,350,'#528075')+line(600,85,600,615,'#528075')+`<path d="${wave}" stroke="#c7e2b8" stroke-width="3" fill="none"/><circle cx="600" cy="350" r="7" fill="#ec9875"/>`+text(100,166,'FIND THE',27,'#a3c4b3','letter-spacing="3"')+text(100,204,'SIGNAL.',27,'#a3c4b3','letter-spacing="3"')+text(915,535,'60 INPUTS',12,'#a3c4b3')+text(915,559,'02 CLASSES',12,'#a3c4b3');
}
function abstract(index,fg) {
  let shapes='';
  for(let i=0;i<15;i++){const r=65+i*12;shapes+=`<ellipse cx="600" cy="340" rx="${r*1.5}" ry="${r*.57}" transform="rotate(${index*13+i*7} 600 340)" fill="none" stroke="${fg}" stroke-width="2" opacity="${.25+i*.04}"/>`;}
  return shapes+text(600,350,'</>',70,fg,'text-anchor="middle" letter-spacing="-6"');
}
const art=[ride,robot,risk,pipeline,tableflow,sonar];
let generated = 0;
PROJECTS.forEach((project,index)=>{
  if (!project.image.endsWith('.svg')) return;
  const [bg,fg]=palettes[index%palettes.length];
  const graphic=art[index]?art[index]():abstract(index,fg);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc"><title id="title">${esc(project.title)} — project artwork</title><desc id="desc">Custom illustrative cover for ${esc(project.title)}. Concept artwork, not a product screenshot.</desc><defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="${fg}" flood-opacity=".16"/></filter><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="${fg}" stroke-width=".6" opacity=".09"/></pattern></defs>${rect(0,0,1200,750,bg)}${rect(0,0,1200,750,'url(#grid)')}${graphic}${rect(0,0,1200,78,bg)}${text(45,46,project.category.toUpperCase()+' / PROJECT STUDY',13,fg,'letter-spacing="2"')}${text(1155,46,project.number,14,fg,'text-anchor="end"')}${rect(0,642,1200,108,bg)}${line(45,644,1155,644,fg,1,'opacity=".25"')}${text(45,705,project.title,32,fg,'letter-spacing="-1"')}${text(1155,703,'SUPREM SHRESTHA ↗',12,fg,'text-anchor="end" letter-spacing="1"')}</svg>`;
  writeFileSync(new URL('../public/'+project.image, import.meta.url),svg+'\n');
  generated += 1;
});
console.log(`Created ${generated} original SVG project covers.`);
