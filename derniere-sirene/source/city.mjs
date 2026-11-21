import { terrain as t, W, H } from './data.mjs';

export function random(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export const cell = (x, z) => z * W + x;
export const point = i => [i % W, Math.floor(i / W)];
export const dist = (a, b) => Math.abs(a % W - b % W) + Math.abs(Math.floor(a/W) - Math.floor(b/W));
export const open = (map, i) => map[i] === t.road || map[i] === t.park || map[i] === t.bridge;
export const adjacent = Array.from({length:W*H}, (_, i) => {
  const [x,z] = point(i);
  return [[x-1,z],[x+1,z],[x,z-1],[x,z+1]].filter(([a,b]) => a>=0 && b>=0 && a<W && b<H).map(([a,b]) => cell(a,b));
});

export function field(sources, passable) {
  const values = new Int16Array(W*H).fill(30000);
  const queue = new Int16Array(W*H);
  let cursor = 0, length = 0;
  for (const i of sources) {
    if (values[i] === 0) continue;
    values[i] = 0;
    queue[length++] = i;
  }
  while (cursor < length) {
    const i = queue[cursor++];
    for (const j of adjacent[i]) if (values[j] === 30000 && passable(j)) {
      values[j] = values[i]+1;
      queue[length++] = j;
    }
  }
  return values;
}

export function generate(mission) {
  if (mission.layout) return {cells:mission.layout.slice(), start:mission.start, end:mission.end, homes:homesFor(mission.layout, mission.start), seed:mission.seed};
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
