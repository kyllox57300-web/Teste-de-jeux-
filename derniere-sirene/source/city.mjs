import { terrain as t, W, H } from './data.mjs';
import { createGrid } from './grid.mjs';
import metz from '../maps/metz.json' with {type:'json'};

export function random(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export const open = (map, i) => map[i] === t.road || map[i] === t.park || map[i] === t.bridge;

export const baseGrid=createGrid(W,H);
export const {cell,point,dist,adjacent,field}=baseGrid;

export function generate(mission) {
  if(mission.metro) return generateMetz(mission.seed);
  if (mission.layout) return {cells:mission.layout.slice(), start:mission.start, end:mission.end, homes:homesFor(mission.layout, mission.start), seed:mission.seed};
  if(mission.containment) return generateDistrict(mission);
  const rng = random(mission.seed);
  const cells = new Array(W*H).fill(t.block);
  const river = ['island','port','rural'].includes(mission.theme);
  const bridges = mission.theme==='island' ? [4,13] : [4,10,16];
  for (let z=0;z<H;z++) for (let x=0;x<W;x++) {
    const bend = mission.seed%2 === 0 ? 0 : 1;
    const alley = z%3===1 || x%3===1 || (x===22 && z%2===0);
    let type = alley ? t.road : t.block;
    if (!alley && rng() < ({city:.18, port:.2, island:.24, rural:.72, suburb:.46, industry:.35}[mission.theme] || .25)) type=t.park;
    if (river && (x===10+bend || x===11+bend || (mission.theme==='island' && x===12+bend))) {
      type = bridges.includes(z) ? t.bridge : t.water;
    }
    if (mission.theme==='port' && z>=17 && (x<7 || x>17)) type=t.water;
    cells[cell(x,z)] = type;
  }
  const start = cell(22, mission.seed%2===0 ? 4 : 13);
  const end = cell(2,10);
  cells[start] = cells[end] = t.road;
  const rear = mission.seed%2===0 ? 16 : 1;
  const breach=typeof mission.id==='number'&&mission.id>=5 ? cell(mission.id>=9?16:19,rear) : null;
  return {cells,start,end,breach,homes:homesFor(cells,start),seed:mission.seed};
}

let cityMap;
function generateMetz(seed) {
  if(!cityMap) {
    const grid=createGrid(metz.w,metz.h);
    const cells=Array.from(metz.cells,Number);
    const anchors=[];
    for(const [i,x,z] of metz.anchors) anchors[i]=[x,z];
    const paths=grid.field([metz.start],i=>open(cells,i));
    const homes=cells.flatMap((_,i)=>paths[i]>4&&paths[i]<30000?[i]:[]);
    cityMap={art:metz,grid,anchors,cells,homes,start:metz.start,end:metz.end};
  }
  return {...cityMap,seed,cells:cityMap.cells.slice()};
}

const districts={
  canal:{avenues:[1,5,8,12,15,20,23], streets:[2,5,9,13,17], crossing:[5,9,13], entry:[22,13], refuge:[2,5]},
  rail:{avenues:[2,6,10,14,19,23], streets:[1,4,8,12,16], crossing:[6,14,23], entry:[21,4], refuge:[2,16]},
  delta:{avenues:[1,4,8,12,16,21,23], streets:[2,6,10,14,17], crossing:[6,14], entry:[22,14], refuge:[2,6]}
};
function generateDistrict(mission) {
  const rng=random(mission.seed);
  const {avenues,streets,crossing,entry,refuge}=districts[mission.id];
  const cells=new Array(W*H);
  for(let z=0;z<H;z++) for(let x=0;x<W;x++) {
    const boulevard=avenues.includes(x)||streets.includes(z);
    const sideStreet=(z===7 && x<9)||(z===11 && x>=16&&x<=21)||(x===18&&z>=4&&z<=8);
    let type=t.block;
    if(boulevard||sideStreet) type=t.road;
    else if(rng()<.17) type=t.park;
    if(mission.id==='canal') {
      const bank=z<9?10:11;
      if(x===bank||x===bank+1) type=crossing.includes(z)?t.bridge:t.water;
    } else if(mission.id==='rail' && (z===9||z===10)) {
      type=crossing.includes(x)?t.road:t.block;
    } else if(mission.id==='delta' && ([6,7,17,18].includes(x))) {
      type=crossing.includes(z)?t.bridge:t.water;
    }
    cells[cell(x,z)]=type;
  }
  const start=cell(...entry),end=cell(...refuge);
  return {cells,start,end,homes:homesFor(cells,start),seed:mission.seed};
}

function homesFor(cells, start) {
  const connected = field([start], i=>open(cells,i));
  return cells.flatMap((type,i)=> (type===t.road || type===t.park) && connected[i]>4 && connected[i]<30000 ? [i] : []);
}

export function validCustom(layout, start, end) {
  if (!Array.isArray(layout) || layout.length !== W*H || layout.some(value=>!Number.isInteger(value) || value<0 || value>4)) return false;
  if (![start,end].every(i=>Number.isInteger(i) && open(layout,i)) || start===end) return false;
  const reached=field([start],i=>open(layout,i));
  return reached[end]<30000 && homesFor(layout,start).length>=30;
}
