/* =========================================================
   MOTEUR DU JEU — toute la logique, sans affichage.
   Le rendu 3D et l'interface lisent W et S, et consomment la file d'événements W.fx.
   La simulation (tools/sim.mjs) utilise ce même fichier sous Node.
   ========================================================= */
import * as D from './data.js';
const {CELL, COLS, QROWS, NQ, ROWS, GATE, QUARTERS, RAR, RK, LOOT, BIG, CONTAINERS, SKILL_BY_ID} = D;

/* ---------- Outils ---------- */
export function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const R = Math.random;
export const rnd = (a, b) => a + R() * (b - a);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const pick = (a, r = R) => a[Math.floor(r() * a.length)];
function gauss(){ let u = 0, v = 0; while(!u) u = R(); while(!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const UNITS = ['K','M','B','T','Qa','Qi','Sx'];
export function fmt(n){
  if(!isFinite(n)) return '∞';
  const neg = n < 0; n = Math.abs(n); let s, u = '';
  if(n < 1000) s = (n < 10 && n % 1 > 0.05) ? n.toFixed(1) : String(Math.floor(n));
  else { let i = -1; while(n >= 999.95 && i < UNITS.length - 1){ n /= 1000; i++; } s = n < 100 ? n.toFixed(1) : String(Math.floor(n)); u = ' ' + UNITS[i]; }
  return (neg ? '-' : '') + s.replace('.', ',').replace(/,0$/, '') + u;
}
export const eur = n => fmt(n) + ' €';
export function fmtTime(sec){ sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h ? h + ' h ' + String(m).padStart(2, '0') + ' min' : m ? m + ' min ' + String(s).padStart(2, '0') + ' s' : s + ' s'; }

/* ---------- Géométrie de la grille ---------- */
export const cx = c => (c - (COLS - 1) / 2) * CELL;
export const cz = r => r * CELL;
export const colOf = x => Math.round(x / CELL + (COLS - 1) / 2);
export const rowOf = z => Math.round(z / CELL);
export const qOfRow = r => r >= NQ * QROWS ? -1 : NQ - 1 - Math.floor(r / QROWS);
export const rowStart = q => (NQ - 1 - q) * QROWS;
export const HUT = {c:1, r:NQ * QROWS + 1, w:3, h:2};
export const SELL = {c:2, r:NQ * QROWS + 3};
export const START = {c:GATE, r:NQ * QROWS + 2};
export const TRUCK_HOME = {c:GATE + 3, r:NQ * QROWS + 4};
export const CRANE = {c:COLS + 1, r:NQ * QROWS + 1};   // juste à l'extérieur du grillage, à droite de la cour
export const sellPos = () => ({x:cx(SELL.c), z:cz(SELL.r)});

/* =========================================================
   ÉTAT
   ========================================================= */
export let S = null;          // partie sauvegardée
export const W = {            // monde vivant (reconstruit au chargement)
  tiles:[], kevin:null, workers:[], truck:null, loot:[], bigs:[], conts:[], treasures:[], crane:null, robo:null,
  fx:[], headless:false, nextId:1, dirty:new Set(),
};
export function setS(s){ S = s; }
export function defaultMeta(){
  return {karma:0, prestiges:0, finishes:0, bestTime:0, ach:{}, album:{}, life:{time:0, finds:0, earned:0, heaps:0, bestTrade:0},
    settings:{sound:true, music:true, quality:'auto', anim:1, view:'tps'}, tuto:false};
}
export function newState(meta){
  const p0 = 30000;
  return {
    v:3, seed:Math.floor(R() * 1e9), meta:meta || defaultMeta(),
    money:0, btc:0, btcCost:0,
    up:{tool:0, sac:0, luck:0, boots:0, team:0, detR:0, brou:false, det:false, magnet:false, truck:false, vacuum:false, crane:false, digger:false, drone:false},
    emps:{gege:0, stag:0, ferr:0, chien:0, dozer:0, robot:0},
    unlocked:[true, false, false, false, false, false, false],
    bag:[], tool:'shovel', xp:0, lvl:1, sp:0, skills:{},
    chapter:0, ended:false, endTime:0, chapterTimes:[],
    story:{c:0, r:0, found:false}, disk:{c:0, r:0, found:false}, side:0,
    quest:0, flags:{}, buffs:[], nextEvent:160, cds:{}, combo:0, comboT:0, sales:0,
    order:null, orderT:90, dayT:0.3,
    st:{time:0, finds:0, heaps:0, layers:0, taps:0, earned:0, sold:0, rares:0, epics:0, legs:0, events:0, buys:0, sells:0, bestTrade:0, worstTrade:0,
        trips:0, bigs:0, opened:0, safes:0, repaired:0, treasures:0, thrown:0, quakes:0, magnets:0},
    market:{p:p0, target:p0, hist:Array(90).fill(p0), fut:[], acc:0},
    world:null, lastSave:Date.now(),
  };
}
const emit = (t, o) => { W.fx.push(Object.assign({t}, o || {})); };
export const toast = (msg, cls) => emit('toast', {msg, cls});
const sfx = n => emit('sfx', {n});

/* =========================================================
   CALCULS
   ========================================================= */
export const has = id => !!(S.skills && S.skills[id]);
export const costMul = () => has('M2') ? 0.8 : 1;
export const costLv = (base, lvl) => base * Math.pow(D.GROWTH, lvl) * costMul();
export const totalEmps = () => D.EMPS.reduce((a, e) => a + (S.emps[e.id] || 0), 0);
export const toolPow = () => Math.pow(1.10, S.up.tool) * (has('F1') ? 1.5 : 1) * (has('B3') ? 1.6 : 1);
export const teamPow = () => Math.pow(1.05, S.up.team) * (has('M5') ? 1.5 : 1);
export const bagCap = () => D.SACKS[S.up.sac].cap + (S.up.brou ? 15 : 0) + (has('C1') ? 10 : 0) + (has('C5') ? 30 : 0) + (S.tool === 'digger' ? 30 : 0);
export const kevSpeed = () => 4.2 * (1 + 0.08 * S.up.boots) * (has('C3') ? 1.4 : 1) * (S.tool === 'digger' ? 0.9 : 1) *
  (W.kevin && W.kevin.carry && !has('C4') && !has('CU') ? 0.7 : 1) * (W.kevin && W.kevin.push ? (has('C6') ? 0.7 : 0.4) : 1);
export const digInterval = () => 0.55 / (has('F2') ? 1.6 : 1);
export const kevPower = () => toolPow() * (S.tool === 'digger' ? 4 * (has('B6') ? 2 : 1) : 1) * bm('tap');
export const carryCap = () => has('CU') ? 99 : 1 + (S.up.brou ? 1 : 0) + (has('C2') ? 1 : 0) + (has('C4') ? 2 : 0) + (has('C6') ? 2 : 0);
export const gadgetMul = () => has('B5') || has('BU') ? 2 : 1;
export const pickRadius = () => (S.tool === 'vacuum' ? 7 * gadgetMul() : 2.6) ;
export const detRange = () => (9 + 4 * S.up.detR) * (has('B5') ? 1.5 : 1);
export function bm(k){ let m = 1; for(const b of S.buffs) if(b.k === k) m *= b.m; return m; }
export const isNight = () => S.dayT > 0.76 || S.dayT < 0.04;
export const luck = () => (1 + 0.05 * S.up.luck) * bm('luck') * (has('F3') ? 2 : 1) * (isNight() ? 1.3 : 1);
export const karmaMult = () => 1 + 0.10 * S.meta.karma;
export const xpNeed = lv => Math.round(50 * Math.pow(1.36, lv - 1));
export const deepestOpen = () => { let q = 0; S.unlocked.forEach((u, i) => { if(u) q = i; }); return q; };
/** Bonus de série de l'album : +25 % sur les objets d'un quartier dont on a trouvé les 8 objets (x2 avec Collectionneur) */
export function seriesDone(q){ for(let i = 0; i < 8; i++) if(!S.meta.album[q + '_' + i]) return false; return true; }
export const seriesBonus = q => seriesDone(q) ? (has('M6') ? 1.5 : 1.25) : 1;
export const bigSeriesDone = () => BIG.every(b => S.meta.album['B_' + b.id]);
export const priceMul = () => karmaMult() * bm('money') * (has('M1') ? 1.3 : 1) * (has('MU') ? 2 : 1) * (bigSeriesDone() ? (has('M6') ? 1.3 : 1.15) : 1);
export const itemOf = it => LOOT[it[0]][it[1]];
/** Valeur d'un petit objet : it = [quartier, index, facteur, cassé, réparé] */
export function itemValue(it){
  const L = itemOf(it); let v = QUARTERS[it[0]].v * RAR[L[2]].m * it[2] * seriesBonus(it[0]) * priceMul();
  if(it[3] && !has('B4')) v *= 0.3;
  if(it[4]) v *= has('BU') ? 3 : has('B1') ? 1.5 : 1;
  return v;
}
export const bigValue = b => QUARTERS[b.q].v * BIG.find(x => x.id === b.kind).m * priceMul() * (1 + 0.1 * (b.q));
/** Valeur moyenne d'une couche (pour les estimations) */
export function layerValue(q){
  const L = luck(); let tw = 0, v = 0;
  for(const r of RK){ const w = RAR[r].w * (r === 'c' ? 1 : L); tw += w; v += w * RAR[r].m; }
  return (1.35 + (has('F4') ? 1 : 0)) * v / tw * QUARTERS[q].v * priceMul() * seriesBonus(q);
}
const avgLayerHp = q => QUARTERS[q].hp * 1.3 * Math.pow(1.15, (QUARTERS[q].L[0] + QUARTERS[q].L[1]) / 4);
export function teamIncome(){
  let inc = 0; const q = deepestOpen();
  for(const e of D.EMPS) inc += (S.emps[e.id] || 0) * empPowBase(e.id) / WORKER_HIT / avgLayerHp(q) * layerValue(q) * workerRate();
  return inc * bm('emp');
}
export const rewardSec = sec => Math.max(0, (teamIncome() + kevPower() / digInterval() / avgLayerHp(deepestOpen()) * layerValue(deepestOpen())) * sec);
const workerRate = () => has('M5') ? 1 : 0.8;
const empPowBase = id => D.EMPS.find(e => e.id === id).pow * teamPow() * ((id === 'dozer' || id === 'robot') && has('B6') ? 2 : 1);

/* =========================================================
   LE MONDE
   ========================================================= */
export const tile = (c, r) => (r >= 0 && r < ROWS && c >= 0 && c < COLS) ? W.tiles[r][c] : null;
export const hpMax = t => t.h0 * Math.pow(1.15, t.maxL - t.L);
const inHut = (c, r) => c >= HUT.c && c < HUT.c + HUT.w && r >= HUT.r && r < HUT.r + HUT.h;
const inCrane = (c, r) => c === CRANE.c && r === CRANE.r;
export const walkable = (c, r) => { const t = tile(c, r); return !!t && t.L === 0 && !inHut(c, r) && !inCrane(c, r); };
export function crossOK(c1, r1, c2, r2){
  if(r1 === r2) return true;
  const a = qOfRow(r1), b = qOfRow(r2);
  if(a === b || a < 0 || b < 0) return true;
  return c1 === GATE && c2 === GATE && S.unlocked[Math.max(a, b)];
}
const canStep = (c1, r1, c2, r2) => walkable(c2, r2) && crossOK(c1, r1, c2, r2);
export const adjacentOK = (c, r, tc, tr) => Math.abs(c - tc) + Math.abs(r - tr) === 1 && crossOK(c, r, tc, tr);
const DIRS = [[0,-1],[1,0],[-1,0],[0,1]];
export function bfs(sc, sr){
  const N = ROWS * COLS, prev = new Int32Array(N).fill(-2), dist = new Int32Array(N).fill(-1), order = [];
  const k0 = sr * COLS + sc; if(sc < 0 || sc >= COLS || sr < 0 || sr >= ROWS) return {prev, dist, order};
  prev[k0] = -1; dist[k0] = 0; order.push(k0);
  for(let i = 0; i < order.length; i++){
    const k = order[i], c = k % COLS, r = (k - c) / COLS;
    for(const [dc, dr] of DIRS){ const nc = c + dc, nr = r + dr; if(nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      const nk = nr * COLS + nc; if(prev[nk] !== -2 || !canStep(c, r, nc, nr)) continue; prev[nk] = k; dist[nk] = dist[k] + 1; order.push(nk); }
  }
  return {prev, dist, order};
}
function pathTo(b, k){ const p = []; while(k !== -1){ p.unshift([k % COLS, Math.floor(k / COLS)]); k = b.prev[k]; } return p; }
export function findPath(sc, sr, goal){ const b = bfs(sc, sr); for(const k of b.order){ if(goal(k % COLS, Math.floor(k / COLS))) return pathTo(b, k); } return null; }
export function reachableHeaps(ent){
  const b = bfs(ent.c, ent.r), out = [], seen = new Set();
  for(const k of b.order){ const c = k % COLS, r = (k - c) / COLS;
    for(const [dc, dr] of DIRS){ const nc = c + dc, nr = r + dr, t = tile(nc, nr), nk = nr * COLS + nc;
      if(!t || !t.L || seen.has(nk) || !adjacentOK(c, r, nc, nr)) continue; seen.add(nk); out.push({c:nc, r:nr, q:t.q, d:b.dist[k], from:k}); } }
  return {b, list:out};
}
export function qClearedPct(q){ let n = 0, d = 0; for(let r = rowStart(q); r < rowStart(q) + QROWS; r++) for(const t of W.tiles[r]){ n++; if(!t.L) d++; } return d / n; }
export const TOTAL_HEAPS = NQ * QROWS * COLS;
export function clearedCount(){ let n = 0; for(let r = 0; r < NQ * QROWS; r++) for(const t of W.tiles[r]) if(!t.L) n++; return n; }

/** Génère la décharge (même graine = même décharge) */
function genWorld(seed){
  const rng = mulberry(seed); W.tiles = [];
  for(let r = 0; r < ROWS; r++){
    const row = [];
    for(let c = 0; c < COLS; c++){
      const q = qOfRow(r);
      if(q < 0){ row.push({L:0, maxL:0, q:0, yard:true, seed:0}); continue; }
      const Q = QUARTERS[q], depth = 1 - (r - rowStart(q)) / (QROWS - 1);
      const L = clamp(Math.round(Q.L[0] + (Q.L[1] - Q.L[0]) * (depth * 0.75 + rng() * 0.45)), Q.L[0], Q.L[1]);
      row.push({L, maxL:L, q, h0:Q.hp * (1 + 0.6 * depth), hp:0, seed:Math.floor(rng() * 1e9), mark:false, magL:-1});
      row[row.length - 1].hp = hpMax(row[row.length - 1]);
    }
    W.tiles.push(row);
  }
  S.story.c = 1 + Math.floor(rng() * (COLS - 2)); S.story.r = rowStart(2) + Math.floor(rng() * 5);
  S.disk.c = 1 + Math.floor(rng() * (COLS - 2)); S.disk.r = rowStart(6) + Math.floor(rng() * 5);
  S.side = S.disk.c < COLS / 2 ? -1 : 1;
  for(const p of [S.story, S.disk]){ const t = W.tiles[p.r][p.c]; t.L = t.maxL = QUARTERS[t.q].L[1]; t.hp = hpMax(t); }
  // trésors enfouis : 4 par quartier (on les détecte une fois le sol dégagé)
  W.treasures = [];
  for(let q = 0; q < NQ; q++) for(let i = 0; i < 4; i++){
    const c = Math.floor(rng() * COLS), r = rowStart(q) + Math.floor(rng() * QROWS);
    W.treasures.push({id:W.nextId++, x:cx(c) + (rng() - 0.5) * 1.6, z:cz(r) + (rng() - 0.5) * 1.6, q, found:false});
  }
  // quelques poubelles et valises dans la cour pour commencer
  W.conts = [];
  addCont('bin', cx(GATE - 2), cz(NQ * QROWS + 1) + 0.4, 0);
  addCont('case', cx(GATE + 2), cz(NQ * QROWS + 2), 0);
  addCont('trunk', cx(COLS - 1) - 0.3, cz(NQ * QROWS + 5), 0, true);
}
function addCont(kind, x, z, q, decor){ const o = {id:W.nextId++, kind, x, z, q, open:false, opening:0, decor:!!decor}; W.conts.push(o); emit('newCont', {id:o.id}); return o; }
function addBig(kind, x, z, q, drop){ const o = {id:W.nextId++, kind, x, y:drop ? 2.2 : 0, z, vy:drop ? 3.5 : 0, q, state:'ground', open:false, rot:R() * 6.28, tx:0, tz:0, t:0}; W.bigs.push(o); emit('newBig', {id:o.id}); return o; }

/* =========================================================
   ENTITÉS
   ========================================================= */
function mkEnt(c, r){ return {x:cx(c), z:cz(r), c, r, path:[], ang:0, walk:0, dig:0, job:null, target:null, after:null, cd:0, bubble:null, bubbleT:0, anim:'idle', animT:0}; }
export function say(ent, txt, sec){ if(W.headless) return; ent.bubble = txt; ent.bubbleT = sec || 2.5; }
function resetEntities(){
  const k = S.kev && walkable(colOf(S.kev.x), rowOf(S.kev.z)) ? S.kev : {x:cx(START.c), z:cz(START.r)};
  W.kevin = mkEnt(colOf(k.x), rowOf(k.z)); W.kevin.x = k.x; W.kevin.z = k.z; W.kevin.carry = null; W.kevin.push = null; W.kevin.autoT = undefined; W.kevin.prefQ = 0; W.kevin.ang = Math.PI;
  W.workers = []; for(const e of D.EMPS) for(let i = 0; i < (S.emps[e.id] || 0); i++) addWorkerEnt(e.id, true);
  W.truck = Object.assign(mkEnt(TRUCK_HOME.c, TRUCK_HOME.r), {state:'home', load:[], wait:0, ang:0});
  W.crane = {state:'idle', obj:null, hx:cx(CRANE.c), hz:cz(CRANE.r), hy:14, t:0};
  W.robo = has('BU') ? Object.assign(mkEnt(W.kevin.c, W.kevin.r), {x:W.kevin.x + 1, z:W.kevin.z + 1, y:1.2}) : null;
}
function addWorkerEnt(type, quiet){
  const w = mkEnt(START.c + 1, START.r + 1); w.type = type; w.claim = null; w.idle = R(); w.x += (R() - 0.5);
  W.workers.push(w); emit('newWorker', {w});
  if(!quiet) say(w, pick(['Je m\'en occupe, patron !', 'Ça sent bon le travail !', 'Où est la bouteille ?', 'Au boulot !']), 2.5);
}
/** Chemin en cases → liste de points, puis raccourcis en ligne droite quand c'est possible */
function setPath(ent, cells, endPt){
  const pts = cells.slice(1).map(([c, r]) => [cx(c), cz(r)]);
  if(endPt) pts.push(endPt);
  // lissage : on saute les points intermédiaires si le segment reste sur du sol dégagé
  const out = []; let from = [ent.x, ent.z], i = 0;
  while(i < pts.length){
    let j = pts.length - 1;
    while(j > i && !segFree(from, pts[j])) j--;
    out.push(pts[j]); from = pts[j]; i = j + 1;
  }
  ent.path = out;
}
function segFree(a, b){
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 0.5);
  let pc = colOf(a[0]), pr = rowOf(a[1]);
  for(let k = 1; k <= n; k++){ const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n;
    for(const [ox, oz] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35], [0, 0]]){ const c = colOf(x + ox), r = rowOf(z + oz); if(!walkable(c, r)) return false; }
    const c = colOf(x), r = rowOf(z); if(c !== pc || r !== pr){ if(!crossOK(pc, pr, c, r) || (pc !== c && pr !== r)) return false; pc = c; pr = r; } }
  return true;
}
function goTo(ent, cells, then, endPt){ setPath(ent, cells, endPt); ent.after = then; ent.target = null; if(!ent.path.length && then){ ent.after = null; then(); } }
function moveEnt(ent, dt, speed){
  if(!ent.path.length) return false;
  const [gx, gz] = ent.path[0], c = colOf(gx), r = rowOf(gz);
  if(!walkable(c, r)){ ent.path = []; ent.after = null; return false; }
  const dx = gx - ent.x, dz = gz - ent.z, d = Math.hypot(dx, dz), st = speed * dt;
  if(d > 0.05) ent.ang = Math.atan2(dx, dz);
  ent.walk += dt * speed * 2.6;
  if(d <= st){ ent.x = gx; ent.z = gz; ent.path.shift(); ent.c = colOf(ent.x); ent.r = rowOf(ent.z);
    if(!ent.path.length && ent.after){ const f = ent.after; ent.after = null; f(); } }
  else { ent.x += dx / d * st; ent.z += dz / d * st; ent.c = colOf(ent.x); ent.r = rowOf(ent.z); }
  return true;
}
/** Déplacement libre (clavier) avec collisions contre les tas, les grillages et la cabane */
export function moveFree(dx, dz, dt){
  const k = W.kevin; if(k.push) return;
  const sp = kevSpeed() * dt, nx = k.x + dx * sp, nz = k.z + dz * sp;
  k.path = []; k.after = null; k.job = null; k.target = null; k.autoT = undefined;
  if(Math.hypot(dx, dz) > 0.01){ k.ang = Math.atan2(dx, dz); k.walk += dt * kevSpeed() * 2.6; k.freeMove = 0.15; }
  // une position est valide si ses 4 coins sont sur du sol dégagé, sans traverser un grillage ailleurs qu'au portail ouvert
  const okAt = (x, z) => {
    if(x < cx(0) - CELL / 2 + 0.3 || x > cx(COLS - 1) + CELL / 2 - 0.3 || z < -CELL / 2 + 0.3 || z > cz(ROWS - 1) + CELL / 2 - 0.3) return false;
    for(const [ox, oz] of [[0.32, 0.32], [-0.32, 0.32], [0.32, -0.32], [-0.32, -0.32]]){
      const c = colOf(x + ox), r = rowOf(z + oz); if(!walkable(c, r)) return false;
      const qa = qOfRow(r), qb = qOfRow(k.r);
      if(r !== k.r && qa !== qb && qa >= 0 && qb >= 0 && !(c === GATE && colOf(x) === GATE && S.unlocked[Math.max(qa, qb)])) return false;
    }
    return true; };
  if(okAt(nx, k.z)) k.x = nx;
  if(okAt(k.x, nz)) k.z = nz;
  k.c = colOf(k.x); k.r = rowOf(k.z);
}

/* =========================================================
   ORDRES DU JOUEUR (toucher / cliquer)
   ========================================================= */
function clearJob(){ const k = W.kevin; k.job = null; k.target = null; k.after = null; k.autoT = undefined; k.goal = null; }
/** Kévin va creuser le tas (c, r) */
export function orderDig(c, r, quiet){
  const k = W.kevin, t = tile(c, r); if(!t || !t.L) return false;
  if(k.push){ if(!quiet) pushing(); return false; }
  if(k.carry){ if(!quiet) toast('Posez d\'abord l\'objet que vous portez (chez Josiane).', 'bad'); return false; }
  clearJob(); k.prefQ = t.q;
  if(adjacentOK(k.c, k.r, c, r)){ k.target = {c, r}; return true; }
  const path = findPath(k.c, k.r, (pc, pr) => adjacentOK(pc, pr, c, r));
  if(!path){ if(!quiet){ toast('🚧 Pas d\'accès : videz d\'abord les tas devant.', 'bad'); sfx('error'); } return false; }
  k.goal = {c, r};
  goTo(k, path, () => { k.target = {c, r}; k.goal = null; });
  return true;
}
/** Marcher jusqu'à un point précis (sol, objet) puis faire une action */
function walkToPoint(x, z, then, near){
  const k = W.kevin, c = colOf(x), r = rowOf(z);
  if(Math.hypot(k.x - x, k.z - z) <= (near || 0.3)){ then && then(); return true; }
  const path = findPath(k.c, k.r, (pc, pr) => (pc === c && pr === r) || (near > 1 && Math.hypot(cx(pc) - x, cz(pr) - z) <= near));
  if(!path){ toast('🚧 Impossible d\'y aller.', 'bad'); sfx('error'); return false; }
  const endOK = walkable(c, r) && near <= 1;
  goTo(k, path, then, endOK ? [x, z] : null);
  return true;
}
export function orderMove(x, z){ if(pushing()) return false; clearJob(); return walkToPoint(x, z, null, 0.3); }
export function orderPickLoot(id){
  const o = W.loot.find(l => l.id === id); if(!o || pushing()) return false; clearJob();
  return walkToPoint(o.x, o.z, () => tryPick(o, true), 0.3);
}
export function orderSell(){
  const k = W.kevin;
  if(k.carry && has('CU')) return throwToHut();
  if(pushing()) return false;
  if(!S.bag.length && !k.carry){ toast('Le sac est vide.'); return false; }
  const back = k.target ? {...k.target} : k.goal ? {...k.goal} : null;
  clearJob();
  const sp = sellPos();
  const ok = walkToPoint(sp.x, sp.z, () => { doSell(); if(back && !orderDig(back.c, back.r, true)) k.autoT = 0.3; else if(!back) k.autoT = 0.3; }, 0.3);
  if(ok) say(k, 'Direction Josiane !', 1.5);
  return ok;
}
/** Toucher un gros objet : le porter, le pousser (trop lourd) ou le fouiller (frigo/coffre-fort) */
export function orderBig(id){
  const k = W.kevin, o = W.bigs.find(b => b.id === id); if(!o || o.state !== 'ground' || pushing()) return false;
  const B = BIG.find(b => b.id === o.kind);
  if(k.carry){ toast('Vous portez déjà un objet.'); return false; }
  if(S.tool === 'crane' && S.up.crane) return craneGrab(o);
  clearJob();
  return walkToPoint(o.x, o.z, () => {
    if(B.open && !o.open){ startOpen(o, true); return; }
    if(B.w <= carryCap()){ o.state = 'carried'; k.carry = o; sfx('lift'); say(k, B.w >= 3 ? 'HNNNGH !' : 'Hop !', 1.5); emit('lift', {id:o.id}); S.flags.carried = true; }
    else { // trop lourd : Kévin le pousse jusqu'à la cabane
      if(!findPath(k.c, k.r, (c, r) => c === SELL.c && r === SELL.r)){ toast('🚧 Pas de chemin jusqu\'à la cabane.', 'bad'); return; }
      o.state = 'pushed'; k.push = o; say(k, 'Trop lourd… je le pousse !', 2);
      pushToHut();
    }
  }, 1.9);
}
/** Kévin pousse un gros objet jusqu'à Josiane. Si le trajet est coupé (autre ordre, tas qui réapparaît…),
 *  on recalcule ; si aucun chemin n'existe, Josiane vient le chercher : Kévin n'est jamais bloqué. */
function pushToHut(){
  const k = W.kevin, o = k.push; if(!o) return;
  const done = () => { if(k.push !== o) return; k.push = null; o.state = 'ground'; if(W.bigs.includes(o)) sellBigObj(o); };
  const sp = sellPos();
  if(Math.hypot(k.x - sp.x, k.z - sp.z) < 2.5){ done(); return; }
  const path = findPath(k.c, k.r, (c, r) => c === SELL.c && r === SELL.r);
  if(!path){ done(); return; }
  k.job = null; k.target = null; k.autoT = undefined; k.goal = null;
  goTo(k, path, done, [sp.x, sp.z]);
}
/** Pendant qu'il pousse, Kévin ne fait rien d'autre : on le rappelle au joueur et on reprend la route */
function pushing(){ const k = W.kevin; if(!k.push) return false; toast('🛒 Kévin pousse ' + BIG.find(b => b.id === k.push.kind).n + ' jusqu\'à Josiane…'); if(!k.path.length) pushToHut(); return true; }
/** Ouvrir / fouiller un contenant */
export function orderCont(id){
  const o = W.conts.find(b => b.id === id); if(!o || o.open || pushing()) return false;
  if(W.kevin.carry){ toast('Posez d\'abord ce que vous portez.'); return false; }
  clearJob();
  return walkToPoint(o.x, o.z, () => startOpen(o, false), 1.7);
}
function startOpen(o, isBig){
  const k = W.kevin, kind = isBig ? BIG.find(b => b.id === o.kind) : CONTAINERS.find(c => c.id === o.kind);
  k.ang = Math.atan2(o.x - k.x, o.z - k.z);
  if(kind.safe && !has('BU')){ emit('safeGame', {id:o.id, steps:has('B2') ? 2 : 3}); return; }
  const time = has('B2') || has('BU') ? 0.15 : (kind.time || 1.2);
  k.job = {type:'open', o, isBig, t:time};
}
/** Fin d'ouverture : les objets jaillissent */
export function finishOpen(o, isBig){
  const kind = isBig ? BIG.find(b => b.id === o.kind) : CONTAINERS.find(c => c.id === o.kind);
  o.open = true; S.st.opened++; if(kind.safe) S.st.safes++;
  const n = kind.safe ? 4 : isBig ? 3 : Math.round(rnd(kind.items[0], kind.items[1]));
  const q = o.q;
  for(let i = 0; i < n; i++){ const it = rollItem(q, kind.safe ? (i === 0 ? 'e' : 'r') : (i === 0 ? kind.minR : null)); spawnLoot(it, o.x, 0.8, o.z, 1.6, W.kevin); }
  if(kind.safe){ const cash = QUARTERS[q].v * 25 * priceMul(); earn(cash); toast('🔓 Coffre-fort ouvert ! Liasses de billets : +' + eur(cash), 'gold'); sfx('leg'); }
  else sfx('open');
  emit('opened', {id:o.id, big:isBig}); gainXP(5 + 3 * q);
}
export function safeResult(id, ok){ const o = W.bigs.find(b => b.id === id); if(o && ok) finishOpen(o, true); }

/* ---------- Outils spéciaux ---------- */
export function setTool(t){
  if(t === S.tool) return;
  if(t !== 'shovel' && !S.up[t]) return;
  const k = W.kevin;
  if(t === 'digger' && k.carry){ toast('Posez d\'abord l\'objet.'); return; }
  S.tool = t; emit('tool', {t}); sfx('click');
}
/** Détecteur : creuser un trou à un endroit précis */
export function orderDetectDig(x, z){
  if(pushing()) return false;
  clearJob();
  return walkToPoint(x, z, () => { W.kevin.job = {type:'hole', x, z, t:1.1}; }, 0.3);
}
function finishHole(x, z){
  emit('hole', {x, z});
  const tr = W.treasures.find(t => !t.found && Math.hypot(t.x - x, t.z - z) < 1.5 + (has('B5') ? 0.8 : 0));
  if(!tr){ say(W.kevin, pick(['Rien… juste de la terre.', 'Un vieux bouchon.', 'Raté !']), 1.5); gainXP(1); return; }
  tr.found = true; S.st.treasures++;
  const q = tr.q; for(let i = 0; i < 3; i++) spawnLoot(rollItem(q, i === 0 ? 'e' : 'r'), x, 0.3, z, 1.4, W.kevin);
  const cash = QUARTERS[q].v * 25 * priceMul(); earn(cash);
  toast('💰 Trésor enfoui ! +' + eur(cash) + ' et des objets précieux !', 'gold'); sfx('leg'); emit('joy', {}); gainXP(30 + 10 * q);
}
/** Aimant : attire le métal au sol et arrache 1 objet en métal à chaque tas proche */
export function useMagnet(){
  if(!S.up.magnet) return false;
  const cd = S.cds.magnet || 0; if(cd > 0){ toast('🧲 L\'aimant recharge (' + Math.ceil(cd) + ' s)'); return false; }
  const k = W.kevin, Rr = 9 * gadgetMul(); let n = 0;
  for(const o of W.loot) if(o.metal && o.landed && Math.hypot(o.x - k.x, o.z - k.z) < Rr){ o.magnet = 1; n++; }
  for(let r = 0; r < ROWS; r++) for(let c = 0; c < COLS; c++){ const t = W.tiles[r][c];
    if(!t.L || t.magL === t.L || Math.hypot(cx(c) - k.x, cz(r) - k.z) > Rr || !S.unlocked[t.q]) continue;
    t.magL = t.L;
    const metal = []; LOOT[t.q].forEach((x, i) => { if(x[4]) metal.push(i); });
    if(R() < 0.8){ const rr = rollRarity(); const ok = metal.filter(i => LOOT[t.q][i][2] === rr); const idx = pick(ok.length ? ok : metal.filter(i => LOOT[t.q][i][2] === 'c'));
      const it = [t.q, idx, round2(0.8 + R() * 0.4), 0, 0]; noteFind(it); const o = spawnLoot(it, cx(c), 1.2, cz(r), 1.0, k); o.magnet = 1; n++; }
  }
  S.cds.magnet = 10 / gadgetMul(); S.st.magnets++;
  emit('magnet', {x:k.x, z:k.z, r:Rr}); sfx('magnet');
  if(!n) say(k, 'Pas de métal par ici…', 1.5);
  return true;
}
/** Grue : attrape un gros objet n'importe où et l'amène chez Josiane */
function craneGrab(o){
  if(W.crane.state !== 'idle'){ toast('🏗️ La grue est occupée.'); return false; }
  W.crane.state = 'go'; W.crane.obj = o; o.state = 'crane'; sfx('crane'); toast('🏗️ La grue arrive !');
  return true;
}
/** Hercule : lance l'objet porté jusqu'à la cabane */
export function throwToHut(){
  const k = W.kevin, o = k.carry; if(!o) return false;
  k.carry = null; o.state = 'thrown'; const sp = sellPos();
  o.sx = k.x; o.sz = k.z; o.tx = sp.x + rnd(-1, 1); o.tz = sp.z - 1.2 + rnd(-0.5, 0.5); o.t = 0; o.dur = clamp(Math.hypot(o.tx - k.x, o.tz - k.z) / 18, 0.6, 2.4);
  S.st.thrown++; sfx('throw'); emit('throw', {id:o.id}); say(k, pick(['ATTRAPE, JOSIANE !', 'YAAAH !', 'Livraison express !']), 1.8);
  return true;
}
/** Séisme (compétence ultime du Fouilleur) */
export function useQuake(){
  if(!has('FU')) return false;
  if((S.cds.quake || 0) > 0){ toast('🌋 Séisme dans ' + Math.ceil(S.cds.quake) + ' s'); return false; }
  const k = W.kevin; let n = 0;
  for(let r = 0; r < ROWS; r++) for(let c = 0; c < COLS; c++){ const t = W.tiles[r][c];
    if(t.L && S.unlocked[t.q] && Math.hypot(cx(c) - k.x, cz(r) - k.z) < 7.5){ t.hp = 0; removeLayer(k, c, r); n++; } }
  S.cds.quake = 40; S.st.quakes++; emit('quake', {x:k.x, z:k.z}); sfx('quake');
  if(n) say(k, 'TREMBLEZ, ORDURES !', 2);
  return true;
}

/* =========================================================
   OBJETS : tirage, apparition, ramassage, vente
   ========================================================= */
const round2 = x => Math.round(x * 100) / 100;
function rollRarity(minR){
  const L = luck(); let tw = 0; const w = {};
  for(const r of RK){ w[r] = (minR && RK.indexOf(r) < RK.indexOf(minR)) ? 0 : RAR[r].w * (r === 'c' ? 1 : L); tw += w[r]; }
  let t = R() * tw; for(const r of RK){ t -= w[r]; if(t <= 0 && w[r] > 0) return r; } return minR || 'c';
}
export function rollItem(q, minR){
  const rr = rollRarity(minR), idx = []; LOOT[q].forEach((x, i) => { if(x[2] === rr) idx.push(i); });
  const broken = rr !== 'c' && R() < 0.3 ? 1 : 0;
  const it = [q, pick(idx), round2(0.8 + R() * 0.4), broken, 0]; noteFind(it); return it;
}
function noteFind(it){
  const r = itemOf(it)[2], key = it[0] + '_' + it[1];
  S.st.finds++; S.meta.life.finds++;
  const first = !S.meta.album[key]; S.meta.album[key] = (S.meta.album[key] || 0) + 1;
  if(r === 'r') S.st.rares++; if(r === 'e') S.st.epics++; if(r === 'l') S.st.legs++;
  if(first){ emit('albumNew', {key}); if(seriesDone(it[0])){ toast('📚 Série complète : ' + QUARTERS[it[0]].n + ' ! Ses objets valent +' + Math.round((seriesBonus(it[0]) - 1) * 100) + ' %', 'gold'); gainXP(80 * (it[0] + 1)); } }
}
/** Un objet jaillit d'un point et retombe près de « vers » (l'entité qui creuse) */
function spawnLoot(it, x, y, z, dist, toward){
  let ang = toward ? Math.atan2(toward.x - x, toward.z - z) + rnd(-1.1, 1.1) : R() * 6.28, lx, lz, tries = 0;
  do { const d = rnd(dist * 0.6, dist * 1.2); lx = x + Math.sin(ang) * d; lz = z + Math.cos(ang) * d; ang += 0.7; tries++; }
  while(!walkable(colOf(lx), rowOf(lz)) && tries < 10);
  if(!walkable(colOf(lx), rowOf(lz)) && toward){ lx = toward.x + rnd(-0.6, 0.6); lz = toward.z + rnd(-0.6, 0.6); }
  const o = {id:W.nextId++, it, x, y, z, sx:x, sy:y, sz:z, lx, lz, t:0, dur:rnd(0.45, 0.7), landed:false, metal:!!itemOf(it)[4], age:0, magnet:0};
  W.loot.push(o); emit('newLoot', {id:o.id});
  const rr = itemOf(it)[2]; if(rr !== 'c') emit('rare', {id:o.id, r:rr});
  return o;
}
function tryPick(o, force){
  if(S.bag.length >= bagCap()){ if(force) say(W.kevin, 'Sac plein !', 1.2); return false; }
  W.loot.splice(W.loot.indexOf(o), 1); S.bag.push(o.it); emit('pick', {id:o.id, x:o.x, z:o.z, it:o.it}); gainXP(RAR[itemOf(o.it)[2]].xp * 0.5);
  W.kevin.pickT = 0.35; sfx(itemOf(o.it)[2] === 'c' ? 'item' : itemOf(o.it)[2] === 'l' ? 'leg' : 'rare');
  if(itemOf(o.it)[2] === 'l'){ toast('🏆 LÉGENDAIRE : ' + itemOf(o.it)[0] + ' ' + itemOf(o.it)[1] + ' !', 'gold'); emit('joy', {big:true}); }
  else if(itemOf(o.it)[2] === 'e'){ emit('joy', {}); }
  return true;
}
/** Vente chez Josiane : sac + objet porté */
function doSell(){
  const k = W.kevin;
  if(k.carry){ const o = k.carry; k.carry = null; o.state = 'ground'; sellBigObj(o); }
  if(!S.bag.length) return 0;
  return sellList(S.bag.splice(0), true);
}
export function sellList(list, byKevin){
  let v = 0, n = 0, ord = 0;
  for(const it of list){ let x = itemValue(it);
    if(S.order && it[0] === S.order.q && it[1] === S.order.i && S.order.got < S.order.n){ S.order.got++; x *= 4; ord++; }
    v += x; n++; }
  let mult = 1, label = '';
  if(has('M3') && R() < 0.3){ mult *= 2; label = '🤝 Marchandage réussi ! x2'; }
  S.sales++;
  if(has('MU') && S.sales % 5 === 0){ mult *= 5; label = '🐺 ENCHÈRE ! La foule s\'arrache vos objets : x5 !'; emit('auction', {}); }
  v *= mult; earn(v); S.st.sold += n; S.st.trips++; gainXP(n * 0.6 + 2);
  if(ord) toast('📦 Commande de Josiane : ' + ord + ' objet(s) payés x4 !', 'good');
  if(S.order && S.order.got >= S.order.n){ const bonus = S.order.reward; earn(bonus); gainXP(40); toast('✅ Commande terminée ! Prime : +' + eur(bonus), 'gold'); S.order = null; S.orderT = 120; }
  emit('sell', {v, n, label}); sfx('coin');
  if(label) toast(label, 'gold');
  return v;
}
function sellBigObj(o){
  const v = bigValue(o) * (has('M3') && R() < 0.3 ? 2 : 1);
  W.bigs.splice(W.bigs.indexOf(o), 1); earn(v); S.st.bigs++; S.meta.album['B_' + o.kind] = (S.meta.album['B_' + o.kind] || 0) + 1;
  gainXP(15 + 8 * o.q); emit('sellBig', {id:o.id, v}); sfx('coin');
  toast('💶 Josiane rachète ' + BIG.find(b => b.id === o.kind).n + ' : +' + eur(v), 'gold');
  if(bigSeriesDone() && !S.flags.bigSeries){ S.flags.bigSeries = true; toast('📚 Série « Gros objets » complète ! Tous les prix +15 %', 'gold'); }
}
export function earn(x){ if(!(x > 0)) return; S.money += x; S.st.earned += x; S.meta.life.earned += x; }
/** Réparer un objet cassé du sac (après le mini-jeu) */
export function repairItem(i){ const it = S.bag[i]; if(!it || !it[3]) return false; it[3] = 0; it[4] = 1; S.st.repaired++; gainXP(10 + 4 * it[0]); sfx('repair'); return true; }

/* =========================================================
   EXPÉRIENCE ET COMPÉTENCES
   ========================================================= */
export function gainXP(n){
  S.xp += n * (1 + 0.2 * Math.min(S.combo, 5));
  while(S.xp >= xpNeed(S.lvl)){ S.xp -= xpNeed(S.lvl); S.lvl++; S.sp++; emit('level', {lv:S.lvl}); sfx('level'); toast('⭐ Niveau ' + S.lvl + ' ! +1 point de compétence', 'gold'); }
}
export function canLearn(id){
  const s = SKILL_BY_ID[id]; if(!s || has(id) || S.sp < s.cost) return false;
  if(!s.req.length) return true;
  return s.any ? s.req.some(has) : s.req.every(has);
}
export function learn(id){
  if(!canLearn(id)) return false; const s = SKILL_BY_ID[id]; S.sp -= s.cost; S.skills[id] = true;
  if(id === 'BU' && !W.robo) W.robo = Object.assign(mkEnt(W.kevin.c, W.kevin.r), {x:W.kevin.x + 1, z:W.kevin.z + 1, y:1.2});
  if(id === 'BU') for(const it of S.bag) if(it[3]){ it[3] = 0; it[4] = 1; }
  emit('skill', {id}); sfx(s.ult ? 'ult' : 'level'); return true;
}

/* =========================================================
   CREUSER
   ========================================================= */
function taken(c, r, ent){
  for(const w of W.workers) if(w !== ent && w.claim && w.claim.c === c && w.claim.r === r) return true;
  const k = W.kevin;
  if(ent !== k && ((k.target && k.target.c === c && k.target.r === r) || (k.goal && k.goal.c === c && k.goal.r === r))) return true;
  return false;
}
export function autoNext(ent){
  const k = W.kevin, {b, list} = reachableHeaps(ent);
  const free = list.filter(h => !taken(h.c, h.r, ent) && !(ent !== k && h.c === S.disk.c && h.r === S.disk.r));
  if(!free.length) return false;
  let best;
  if(ent === k){ const same = free.filter(h => h.q === k.prefQ && h.d <= 12); best = (same.length ? same : free).reduce((a, h) => h.d < a.d ? h : a); }
  else best = free.reduce((a, h) => (h.q > a.q || (h.q === a.q && h.d < a.d)) ? h : a);
  const cells = pathTo(b, best.from), c = best.c, r = best.r;
  if(ent !== k) ent.claim = {c, r}; else k.goal = {c, r};
  goTo(ent, cells, () => { ent.target = {c, r}; if(ent === k) k.goal = null; });
  return true;
}
/** Un coup sur un tas */
function hit(ent, c, r, power){
  const t = tile(c, r); if(!t || !t.L) return;
  if(ent === W.kevin && S.tool === 'vacuum' && t.q === 1) power *= 2;
  t.hp -= power; emit('hit', {c, r, k:ent === W.kevin});
  if(ent === W.kevin) sfx('dig');
  if(t.hp > 0) return;
  removeLayer(ent, c, r);
  if(ent === W.kevin && has('F6') && t.L && R() < 0.3){ removeLayer(ent, c, r); toast('💥 Double couche !'); }
}
/** Une couche du tas disparaît : des objets jaillissent */
function removeLayer(ent, c, r){
  const t = tile(c, r); if(!t || !t.L) return;
  const isK = ent === W.kevin;
  t.L--; S.st.layers++;
  const nItems = 1 + (R() < 0.35 ? 1 : 0) + (isK && has('F4') ? 1 : 0);
  for(let i = 0; i < nItems; i++){
    const it = rollItem(t.q, t.mark && t.L === 0 && i === 0 ? 'e' : null);
    if(isK) spawnLoot(it, cx(c), 0.6 + t.L * 0.5, cz(r), 1.9, ent);
    else { const v = itemValue(it) * workerRate(); earn(v); emit('workerFind', {x:cx(c), z:cz(r), v, w:ent}); }
  }
  if(isK){ S.combo = S.comboT > 0 ? Math.min(S.combo + 1, 10) : 1; S.comboT = 3; gainXP(2 + t.q * 1.5); }
  emit('layer', {c, r, L:t.L, k:isK});
  if(t.L > 0){ t.hp = hpMax(t); return; }
  // tas entièrement vidé : le sol réapparaît, et parfois une surprise
  t.mark = false; S.st.heaps++; S.meta.life.heaps++; emit('cleared', {c, r}); sfx('clear');
  if(c === S.story.c && r === S.story.r && !S.story.found) foundStory();
  else if(c === S.disk.c && r === S.disk.r && !S.disk.found) foundDisk();
  else {
    const roll = R();
    if(roll < 0.07) addBig(pick(BIG.filter(b => b.id !== 'safe' || t.q >= 2)).id, cx(c), cz(r), t.q, true);
    else if(roll < 0.16) addCont(pick(CONTAINERS).id, cx(c), cz(r), t.q);
    else if(isK && has('F5') && roll < 0.41){ for(let i = 0; i < 2; i++) spawnLoot(rollItem(t.q, 'r'), cx(c), 0.5, cz(r), 1.6, ent); toast('✨ Flair : un petit trésor caché !'); }
  }
  if(isK){ W.kevin.target = null; W.kevin.autoT = 0.45; } else { ent.target = null; ent.claim = null; }
}
function foundStory(){
  S.story.found = true; sfx('leg'); emit('joy', {big:true}); emit('storyItem', {c:S.story.c, r:S.story.r});
  toast('📦 Le boîtier du disque dur !', 'gold'); say(W.kevin, 'MON BOÎTIER !', 3);
  emit('dialog', {lines:D.STORY_DLG.map(l => [l[0], l[1].replace('%SIDE%', S.side < 0 ? 'GAUCHE' : 'DROIT')])});
  gainXP(150);
}
function foundDisk(){ S.disk.found = true; sfx('leg'); emit('joy', {big:true}); emit('diskFound', {c:S.disk.c, r:S.disk.r}); say(W.kevin, 'MON DISQUE !!!', 4); gainXP(500); }

/* =========================================================
   MISE À JOUR
   ========================================================= */
export const WORKER_HIT = 1.2;
let detT = 0;
export const DET = {strength:0, pulse:0, target:null};
export function detTargets(){
  const out = [];
  if(!S.story.found && S.unlocked[2]) out.push({x:cx(S.story.c), z:cz(S.story.r), story:true});
  if(!S.disk.found && S.unlocked[6]) out.push({x:cx(S.disk.c), z:cz(S.disk.r), story:true});
  for(const t of W.treasures) if(!t.found && S.unlocked[t.q] && walkable(colOf(t.x), rowOf(t.z))) out.push(t);
  return out;
}
export function detStrengthTo(p){ if(!p || !W.kevin) return 0; const d = Math.hypot(W.kevin.x - p.x, W.kevin.z - p.z); return clamp(1 - d / detRange(), 0, 1); }

export function update(dt){
  S.st.time += dt; S.meta.life.time += dt;
  S.dayT = (S.dayT + dt / 420) % 1;                        // un jour complet = 7 minutes
  S.buffs = S.buffs.filter(b => b.until > S.st.time);
  for(const k in S.cds) S.cds[k] = Math.max(0, S.cds[k] - dt);
  if(S.comboT > 0){ S.comboT -= dt; if(S.comboT <= 0) S.combo = 0; }
  const k = W.kevin;
  // --- Kévin ---
  const moving = moveEnt(k, dt, kevSpeed());
  if(k.freeMove > 0) k.freeMove -= dt;
  const full = S.bag.length >= bagCap();
  if(k.job && !moving){
    const j = k.job; j.t -= dt; k.dig += dt * 8;
    if(j.t <= 0){ k.job = null; if(j.type === 'open') finishOpen(j.o, j.isBig); else if(j.type === 'hole') finishHole(j.x, j.z); }
  } else if(!moving && k.target){
    const {c, r} = k.target, t = tile(c, r);
    if(!t || !t.L) k.target = null;
    else if(!full){ k.ang = Math.atan2(cx(c) - k.x, cz(r) - k.z); k.dig += dt * 9; k.cd -= dt; if(k.cd <= 0){ k.cd = digInterval(); kevHit(c, r); } }
  } else if(!moving && !k.target && !full && k.autoT !== undefined && !k.carry){
    k.autoT -= dt; if(k.autoT <= 0){ k.autoT = undefined; autoNext(k); }
  }
  if(k.push && !moving && !k.path.length) pushToHut(); // trajet coupé : on repart vers Josiane
  if(k.push){ const o = k.push; o.x = k.x + Math.sin(k.ang) * 1.1; o.z = k.z + Math.cos(k.ang) * 1.1; o.rot = k.ang; }
  if(k.pickT > 0) k.pickT -= dt;
  if(!moving && full && k.bubbleT <= -3) say(k, S.up.truck ? 'J\'attends le camion…' : 'Sac plein ! Direction Josiane ?', 3);
  k.bubbleT -= dt;
  // --- Objets au sol : vol, atterrissage, ramassage automatique, aimant ---
  const pr = pickRadius();
  for(let i = W.loot.length - 1; i >= 0; i--){
    const o = W.loot[i]; o.age += dt;
    if(!o.landed){ o.t += dt; const u = Math.min(1, o.t / o.dur);
      o.x = o.sx + (o.lx - o.sx) * u; o.z = o.sz + (o.lz - o.sz) * u; o.y = o.sy * (1 - u) + Math.sin(u * Math.PI) * 1.6 + 0.12 * u;
      if(u >= 1){ o.landed = true; o.y = 0.12; emit('land', {id:o.id}); } continue; }
    const d = Math.hypot(o.x - k.x, o.z - k.z);
    if(o.magnet || (S.tool === 'vacuum' && d < pr && d > 0.6)){ const sp = (o.magnet ? 14 : 9) * dt; o.x += (k.x - o.x) / d * Math.min(sp, d); o.z += (k.z - o.z) / d * Math.min(sp, d); o.y = 0.6; }
    if(d < (o.magnet ? 0.8 : Math.min(pr, 2.6)) && !full && o.age > 0.25) { if(tryPick(o)) continue; }
    if(o.magnet && full){ o.magnet = 0; o.y = 0.12; }
    if(W.robo){ const rd = Math.hypot(o.x - W.robo.x, o.z - W.robo.z); if(rd < 1 && !full){ tryPick(o); } }
  }
  // --- Gros objets : portés, lancés, grue ---
  for(const o of W.bigs){
    if(o.state === 'carried'){ o.x = k.x; o.z = k.z; o.y = 1.9; o.rot = k.ang; }
    else if(o.state === 'ground' && (o.y > 0 || o.vy)){ // petite physique : chute et rebond
      o.vy -= 22 * dt; o.y += o.vy * dt; if(o.y <= 0){ o.y = 0; if(o.vy < -3){ o.vy = -o.vy * 0.35; emit('thump', {x:o.x, z:o.z}); } else o.vy = 0; } }
    else if(o.state === 'thrown'){ o.t += dt; const u = Math.min(1, o.t / o.dur); o.x = o.sx + (o.tx - o.sx) * u; o.z = o.sz + (o.tz - o.sz) * u; o.y = 1.9 * (1 - u) + Math.sin(u * Math.PI) * (6 + o.dur * 4); o.rot += dt * 8;
      if(u >= 1){ o.y = 0; o.state = 'ground'; emit('thud', {x:o.x, z:o.z}); sellBigObj(o); break; } }
  }
  craneUpdate(dt);
  // --- Robot R0B0 (compétence MacGyver) : suit Kévin et file ramasser ---
  if(W.robo){ const ro = W.robo; let tx = k.x + 1.2, tz = k.z + 1.2;
    const near = W.loot.filter(o => o.landed && Math.hypot(o.x - k.x, o.z - k.z) < 12).sort((a, b) => Math.hypot(a.x - ro.x, a.z - ro.z) - Math.hypot(b.x - ro.x, b.z - ro.z))[0];
    if(near && !full){ tx = near.x; tz = near.z; }
    const d = Math.hypot(tx - ro.x, tz - ro.z); if(d > 0.1){ const sp = Math.min(d, 7 * dt); ro.x += (tx - ro.x) / d * sp; ro.z += (tz - ro.z) / d * sp; ro.ang = Math.atan2(tx - ro.x, tz - ro.z); }
    ro.y = 1.1 + Math.sin(S.st.time * 3) * 0.15; }
  // --- Employés ---
  const empOn = bm('emp') > 0;
  for(const w of W.workers){
    const mv = moveEnt(w, dt, w.type === 'dozer' || w.type === 'robot' ? 3.4 : w.type === 'chien' ? 3.6 : 2.6);
    if(!mv && w.target){
      const t = tile(w.target.c, w.target.r);
      if(!t || !t.L){ w.target = null; w.claim = null; }
      else if(empOn){ w.ang = Math.atan2(cx(w.target.c) - w.x, cz(w.target.r) - w.z); w.dig += dt * 6; w.cd -= dt; if(w.cd <= 0){ w.cd = WORKER_HIT; hit(w, w.target.c, w.target.r, empPowBase(w.type) * bm('emp')); } }
    } else if(!mv && !w.target && !w.after){ w.idle -= dt; if(w.idle <= 0){ w.idle = 1 + R(); if(!autoNext(w)) w.claim = null; } }
    w.bubbleT -= dt;
  }
  if(S.up.truck) truckUpdate(dt);
  // --- Marché ---
  S.market.acc += dt; let steps = 0;
  while(S.market.acc >= 1 && steps++ < 120){ S.market.acc -= 1; marketStep(); }
  if(S.market.acc > 1) S.market.acc = 0;
  // --- Commande de Josiane ---
  if(!S.order){ S.orderT -= dt; if(S.orderT <= 0) newOrder(); }
  else if(S.st.time > S.order.until){ toast('⌛ La commande de Josiane a expiré.'); S.order = null; S.orderT = 60; }
  // --- Événements ---
  if(S.st.time >= S.nextEvent){ S.nextEvent = S.st.time + rnd(110, 180); if(S.st.time > 150) emit('event', {ev:pick(EVENTS.filter(e => !e.cond || e.cond()))}); }
  // --- Détecteur ---
  if(S.up.det && (S.tool === 'det' || detTargets().some(t => t.story))){
    const ts = detTargets(); let best = null, bs = 0;
    for(const t of ts){ if(S.tool !== 'det' && !t.story) continue; const s = detStrengthTo(t); if(s > bs){ bs = s; best = t; } }
    DET.strength = bs; DET.target = best; detT -= dt;
    if(detT <= 0){ detT = bs > 0 ? 1.5 - 1.38 * bs : 2.2; DET.pulse = 1; if(bs > 0) emit('sfx', {n:'beep', x:bs}); }
    DET.pulse = Math.max(0, DET.pulse - dt * 2);
  } else { DET.strength = 0; DET.target = null; }
  // --- Filet de sécurité : plus aucun tas accessible ---
  S.refillT = (S.refillT || 0) + dt;
  if(S.refillT > 5){ S.refillT = 0; refillIfStuck(); }
  checkProgress();
}
function kevHit(c, r){
  const p = kevPower(), q = tile(c, r).q, k = W.kevin;
  hit(k, c, r, p);
  if(S.tool === 'digger'){ // la pelleteuse prend aussi les tas de côté
    const side = Math.abs(cx(c) - k.x) > Math.abs(cz(r) - k.z) ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
    for(const [dc, dr] of side){ const t = tile(c + dc, r + dr); if(t && t.L && t.q === q) hit(k, c + dc, r + dr, p * 0.5); }
  }
}
/** Toucher le tas en cours = un coup en plus */
let lastTap = -1;
export function tapHit(){
  const k = W.kevin;
  if(!k.target || k.path.length || S.bag.length >= bagCap()) return false;
  if(S.st.time - lastTap < 0.1) return false; lastTap = S.st.time;
  S.st.taps++; k.dig += 1.5; kevHit(k.target.c, k.target.r); return true;
}
function truckUpdate(dt){
  const tr = W.truck, k = W.kevin;
  const home = () => { tr.state = 'home'; tr.path = []; tr.after = null; tr.x = cx(TRUCK_HOME.c); tr.z = cz(TRUCK_HOME.r); tr.c = TRUCK_HOME.c; tr.r = TRUCK_HOME.r; tr.ang = 0; };
  const sellLoad = () => { if(tr.load.length) sellList(tr.load.splice(0)); home(); };
  if(tr.state === 'home' && S.bag.length >= Math.max(4, Math.floor(bagCap() * 0.5))){
    const path = findPath(tr.c, tr.r, (c, r) => Math.abs(c - k.c) + Math.abs(r - k.r) <= 1);
    if(path){ tr.state = 'go'; tr.wait = 0.8; goTo(tr, path, () => { tr.state = 'load'; }); }
  }
  const sp = 7 * (has('B6') ? 2 : 1);
  if(tr.state === 'go'){ if(!moveEnt(tr, dt, sp) && tr.state === 'go') tr.state = 'load'; }
  else if(tr.state === 'load'){ tr.wait -= dt;
    if(tr.wait <= 0){ tr.load = tr.load.concat(S.bag.splice(0)); tr.state = 'back'; emit('truckLoad', {});
      const path = findPath(tr.c, tr.r, (c, r) => c === TRUCK_HOME.c && r === TRUCK_HOME.r);
      if(path) goTo(tr, path, sellLoad); else sellLoad(); } }
  else if(tr.state === 'back'){ if(!moveEnt(tr, dt, sp) && tr.state === 'back') sellLoad(); }
}
function craneUpdate(dt){
  const cr = W.crane; if(cr.state === 'idle') return;
  const o = cr.obj, sp = sellPos(), speed = 12 * dt;
  const moveHook = (x, z, y) => { const d = Math.hypot(x - cr.hx, z - cr.hz); if(d > speed){ cr.hx += (x - cr.hx) / d * speed; cr.hz += (z - cr.hz) / d * speed; } else { cr.hx = x; cr.hz = z; }
    cr.hy += clamp(y - cr.hy, -6 * dt, 6 * dt); return d <= speed && Math.abs(y - cr.hy) < 0.1; };
  if(cr.state === 'go'){ if(moveHook(o.x, o.z, 2.2)){ cr.state = 'lift'; sfx('lift'); } }
  else if(cr.state === 'lift'){ if(moveHook(o.x, o.z, 9)) cr.state = 'bring'; o.y = cr.hy - 1.6; }
  else if(cr.state === 'bring'){ const done = moveHook(sp.x, sp.z - 1.4, 9); o.x = cr.hx; o.z = cr.hz; o.y = cr.hy - 1.6; if(done) cr.state = 'drop'; }
  else if(cr.state === 'drop'){ const done = moveHook(sp.x, sp.z - 1.4, 2.4); o.x = cr.hx; o.z = cr.hz; o.y = cr.hy - 1.6;
    if(done){ o.y = 0; o.state = 'ground'; sellBigObj(o); cr.state = 'up'; cr.obj = null; } }
  else if(cr.state === 'up'){ if(moveHook(cx(CRANE.c), cz(CRANE.r), 14)) cr.state = 'idle'; }
}
function newOrder(){
  const q = deepestOpen(), idx = []; LOOT[q].forEach((x, i) => { if(x[2] === 'c') idx.push(i); });
  const i = pick(idx), n = 3 + Math.floor(R() * 3);
  S.order = {q, i, n, got:0, until:S.st.time + 300, reward:QUARTERS[q].v * 40 * priceMul()};
  toast('📦 Commande de Josiane : ' + n + ' × ' + LOOT[q][i][0] + ' ' + LOOT[q][i][1] + ' (payés x4)', 'good');
}
/** Plus aucun tas accessible et le portail suivant trop cher : la ville livre de nouvelles ordures */
function refillIfStuck(){
  if(reachableHeaps(W.kevin).list.length) return false;
  const q = deepestOpen(), list = [];
  for(let r = rowStart(q); r < rowStart(q) + QROWS; r++) for(let c = 0; c < COLS; c++){ const t = W.tiles[r][c];
    if(!t.L && c !== GATE && Math.hypot(cx(c) - W.kevin.x, cz(r) - W.kevin.z) > 1.5 && !W.workers.some(w => w.c === c && w.r === r)) list.push([c, r]); }
  let n = 0;
  for(const [c, r] of list.sort(() => R() - 0.5)){ if(n >= 12) break; const t = W.tiles[r][c]; t.L = t.maxL = Math.min(2, QUARTERS[q].L[0]); t.refilled = true; t.hp = hpMax(t); n++; emit('refill', {c, r}); }
  if(n){ toast('🚚 La ville a livré de nouvelles ordures (' + n + ' tas) !', 'good'); W.kevin.autoT = 0.5; for(const w of W.workers){ w.claim = null; w.idle = 0.5; } }
  return n > 0;
}

/* =========================================================
   MARCHÉ CRYPTO (avec un aperçu du futur pour la compétence Initié)
   ========================================================= */
export const FEE = () => has('M4') ? 0 : 0.01;
function nextPrice(m, p){
  m.target = clamp(m.target * Math.exp(0.004 * gauss()), 12000, 90000);
  let lp = Math.log(p); lp += 0.03 * (Math.log(m.target) - lp) + 0.012 * gauss();
  if(R() < 0.008) lp += (R() < 0.5 ? -1 : 1) * rnd(0.06, 0.16);
  return clamp(Math.exp(lp), 3000, 300000);
}
function marketStep(){
  const m = S.market; if(!m.fut) m.fut = [];
  while(m.fut.length < 10) m.fut.push(nextPrice(m, m.fut.length ? m.fut[m.fut.length - 1] : m.p));
  m.p = m.fut.shift(); m.hist.push(m.p); if(m.hist.length > 90) m.hist.shift();
}
export const marketTrend = () => { const m = S.market; return m.fut && m.fut.length ? (m.fut[m.fut.length - 1] - m.p) / m.p : 0; };
export function marketShock(pct){ const m = S.market; m.p *= (1 + pct); m.hist[m.hist.length - 1] = m.p; m.fut = (m.fut || []).map(x => x * (1 + pct)); }
export function marketBuy(frac){ const a = S.money * frac; if(a < 0.01) return 0; S.money -= a; S.btc += a * (1 - FEE()) / S.market.p; S.btcCost += a; S.st.buys++; return a; }
export function marketSell(frac){
  if(S.btc <= 0) return null;
  const q = frac >= 1 ? S.btc : S.btc * frac, proceeds = q * S.market.p * (1 - FEE()), costPart = S.btcCost * (q / S.btc), profit = proceeds - costPart;
  S.btc -= q; S.btcCost -= costPart; if(S.btc < 1e-12){ S.btc = 0; S.btcCost = 0; }
  S.money += Math.min(proceeds, costPart); if(profit > 0) earn(profit);
  S.st.sells++; if(profit > S.st.bestTrade) S.st.bestTrade = profit; if(profit < S.st.worstTrade) S.st.worstTrade = profit;
  if(profit > S.meta.life.bestTrade) S.meta.life.bestTrade = profit;
  gainXP(Math.min(50, Math.abs(profit) / Math.max(1, QUARTERS[deepestOpen()].v * 5)));
  return profit;
}

/* =========================================================
   ÉVÉNEMENTS ALÉATOIRES (choix aux conséquences différentes)
   ========================================================= */
export function addBuff(k, m, dur, label){ S.buffs.push({k, m, until:S.st.time + dur, label, neg:m < 1}); }
const Rw = sec => Math.max(20, rewardSec(sec || 60));
const lose = pct => { const x = S.money * pct; S.money -= x; return eur(x); };
function bagLose(frac){ const n = Math.floor(S.bag.length * frac); if(!n) return 0; S.bag.sort(() => R() - 0.5); S.bag.splice(0, n); return n; }
function giveBag(minR){ const it = rollItem(deepestOpen(), minR); S.bag.push(it); return itemOf(it); }
function dumpTrash(n){
  const list = [], k = W.kevin;
  for(let r = 0; r < NQ * QROWS; r++) for(let c = 0; c < COLS; c++){ const t = W.tiles[r][c];
    if(!t.L && c !== GATE && Math.hypot(cx(c) - k.x, cz(r) - k.z) > 1.5 && !W.workers.some(w => w.c === c && w.r === r) && !(c === S.disk.c && r === S.disk.r) && S.unlocked[t.q]
      && !W.bigs.some(b => colOf(b.x) === c && rowOf(b.z) === r) && !W.conts.some(b => colOf(b.x) === c && rowOf(b.z) === r)) list.push([c, r]); }
  let m = 0;
  for(const [c, r] of list.sort(() => R() - 0.5)){ if(m >= n) break; const t = W.tiles[r][c]; t.L = 1; t.maxL = 1; t.refilled = true; t.hp = hpMax(t); m++; emit('refill', {c, r}); }
  return m;
}
function markHeap(){ const {list} = reachableHeaps(W.kevin); const ok = list.filter(h => !(h.c === S.disk.c && h.r === S.disk.r)); if(!ok.length) return null;
  ok.sort((a, b) => a.d - b.d); const h = ok[Math.floor(R() * Math.min(6, ok.length))]; W.tiles[h.r][h.c].mark = true; emit('mark', {c:h.c, r:h.r}); return h; }
export const EVENTS = [
  {e:'🌪️', t:'Tempête de sacs plastiques !', d:'Le ciel devient noir. Des milliers de sacs volent vers vous.',
   ch:[['🏠 Tout le monde à l\'abri', ()=>{ addBuff('emp', 0, 30, '🏠 Équipe à l\'abri'); return 'Vous jouez aux cartes avec Josiane. L\'équipe s\'arrête 30 s, mais personne n\'est blessé.'; }],
       ['⛏️ Fouiller dans la tempête', ()=>{ if(R() < 0.5){ const a = giveBag('r'), b = giveBag('e'); return 'La tempête dépose des trésors dans votre sac : ' + a[0] + ' ' + b[0] + ' !'; }
         return 'Un sac vous gifle violemment. Frais de pharmacie : ' + lose(0.06) + '.'; }],
       ['☂️ Vendre des parapluies', ()=>{ const x = Rw(45); earn(x); return 'Les touristes de la décharge adorent. +' + eur(x) + '.'; }]]},
  {e:'🐀', t:'Un rat géant fouille votre sac !', d:'Il est gros comme un chat et il a l\'air très fier de lui.',
   ch:[['🏃 Le poursuivre', ()=>{ if(R() < 0.6){ const a = giveBag('e'); return 'Vous le rattrapez ! En prime, il lâche ' + a[0] + ' ' + a[1] + '.'; }
         const n = bagLose(0.4); return 'Il vous mord le mollet et s\'enfuit avec ' + n + ' objet(s) de votre sac.'; }],
       ['🧀 Lui lancer du fromage (5 %)', ()=>{ lose(0.05); S.flags.ratFriend = true; addBuff('luck', 1.6, 120, '🐀 Rat porte-bonheur'); return 'Le rat devient votre mascotte ! Chance +60 % pendant 2 min.'; }],
       ['🤷 Le laisser faire', ()=>{ const n = bagLose(0.5); return n ? 'Il emporte la moitié de votre sac (' + n + ' objets).' : 'Votre sac était vide. Il repart, déçu.'; }]]},
  {e:'🚛', t:'Un camion-benne arrive', d:'« J\'ai un chargement frais. Je peux le vider chez vous ? Je vous paie bien. »',
   ch:[['💶 Accepter l\'argent', ()=>{ const x = Rw(120); earn(x); const n = dumpTrash(6); return '+' + eur(x) + '… mais ' + n + ' endroits déjà vidés se recouvrent d\'ordures.'; }],
       ['🔍 Fouiller le chargement', ()=>{ const a = giveBag('r'), b = giveBag(), c = giveBag(); return 'Vous récupérez ' + a[0] + ' ' + b[0] + ' ' + c[0] + ' avant qu\'il reparte vide.'; }],
       ['🙅 Refuser', ()=>'Il repart. Votre décharge reste propre. Fierté.']]},
  {e:'🕴️', t:'Un homme en costume vous aborde', d:'« Placement garanti à 300 %, mon ami. Totalement légal. »',
   ch:[['💸 Investir 20 % de vos €', ()=>{ S.flags.scammed = true; const x = S.money * 0.2; S.money -= x;
         if(R() < 0.12){ earn(x * 3); return 'Incroyable, c\'était vrai ! Vous récupérez ' + eur(x * 3) + '.'; } return 'Il disparaît avec ' + eur(x) + '. Son costume était en papier crépon.'; }],
       ['🙅 Refuser poliment', ()=>'Il hausse les épaules et va voir le pigeon d\'à côté.'],
       ['🚓 Appeler la police', ()=>{ if(R() < 0.55){ const x = Rw(90); earn(x); return 'Arrêté ! Prime de ' + eur(x) + '.'; } return 'Le « policier » était son complice. Amende imaginaire : ' + lose(0.05) + '.'; }]]},
  {e:'🏛️', t:'Inspection surprise de la mairie', d:'« Vous avez un permis de fouille, monsieur ? »',
   ch:[['🧾 Payer l\'amende (8 %)', ()=>{ lose(0.08); addBuff('money', 1.25, 120, '🧾 En règle'); return 'En règle ! Les clients vous font confiance : +25 % de valeur pendant 2 min.'; }],
       ['🤫 Glisser un billet (3 %)', ()=>{ lose(0.03); if(R() < 0.65) return 'L\'inspecteur regarde ailleurs. Affaire classée.'; return 'Pris la main dans le sac ! Amende salée : ' + lose(0.15) + '.'; }],
       ['🗑️ Se cacher dans un tas', ()=>{ if(R() < 0.5) return 'Il ne vous trouve pas. Vous sentez la banane, mais vous êtes libre.'; addBuff('emp', 0, 60, '🚫 Chantier fermé'); return 'Trouvé. Chantier fermé 1 min : l\'équipe s\'arrête.'; }]]},
  {e:'🤳', t:'Un influenceur veut vous filmer', d:'« Salut la famille ! Aujourd\'hui je suis avec un VRAI chercheur de trésor ! »',
   ch:[['🎬 Accepter le tournage', ()=>{ addBuff('money', 2, 60, '🤳 Buzz'); return 'La vidéo devient virale ! Valeur des objets x2 pendant 1 min.'; }],
       ['💎 Lui vendre un objet « vintage »', ()=>{ if(!S.bag.length){ const x = Rw(30); earn(x); return 'Sac vide… il achète votre vieille casquette ' + eur(x) + '.'; }
         S.bag.sort((a, b) => itemValue(b) - itemValue(a)); const it = S.bag.shift(), v = itemValue(it) * 10; earn(v); return 'Il achète ' + itemOf(it)[0] + ' ' + itemOf(it)[1] + ' pour ' + eur(v) + ' (x10 !).'; }],
       ['🙅 Refuser', ()=>{ marketShock(0.08); return 'Il filme quand même et parle du Bitcoin. Le cours grimpe de 8 % !'; }]]},
  {e:'📈', t:'Rumeur sur un forum crypto', d:'« Le Bitcoin va aller sur la Lune, source : mon cousin. »',
   ch:[['🚀 Y croire', ()=>{ if(R() < 0.5){ marketShock(0.18); return 'Le cours bondit de 18 % !'; } marketShock(-0.18); return 'Le cours chute de 18 %. Le cousin a supprimé son compte.'; }],
       ['📣 Lancer la rumeur vous-même', ()=>{ marketShock(0.10); if(R() < 0.4) return 'Le cours monte de 10 %… mais l\'autorité des marchés vous colle une amende de ' + lose(0.05) + '.'; return 'Le cours monte de 10 %. Personne ne remonte jusqu\'à vous.'; }],
       ['😴 Ignorer', ()=>'Vous retournez à vos poubelles. C\'est plus honnête.']]},
  {e:'✨', t:'Quelque chose brille dans un tas !', d:'Un éclat doré dépasse d\'un tas pas très loin.',
   ch:[['🏃 Kévin y va tout de suite', ()=>{ const h = markHeap(); if(!h) return 'Fausse alerte, c\'était une capsule de bière.'; orderDig(h.c, h.r, true); return 'Le tas brillant est marqué ✨ : il contient forcément un objet épique ou mieux !'; }],
       ['📍 Le marquer pour plus tard', ()=>{ const h = markHeap(); return h ? 'Le tas est marqué d\'une étoile ✨. Il contient un objet épique ou mieux.' : 'Fausse alerte, c\'était une capsule de bière.'; }],
       ['🙈 Ignorer, c\'est louche', ()=>'Ça brillait un peu trop. Probablement radioactif.']]},
  {e:'🍷', t:'Gégé veut faire la fête', d:'« J\'ai trouvé une bouteille pas entamée ! On fête ça avec l\'équipe ? »', cond:()=>totalEmps() >= 2,
   ch:[['🎉 Faire la fête', ()=>{ addBuff('emp', 0, 25, '🎉 Fête'); addBuff('emp', 2, 115, '😎 Équipe motivée'); return 'Grosse fête ! L\'équipe s\'arrête 25 s… puis travaille 2x plus fort pendant 1 min 30.'; }],
       ['🙅 Pas pendant le travail', ()=>{ if(R() < 0.5){ addBuff('emp', 0.7, 60, '😒 Équipe vexée'); return 'L\'équipe boude : -30 % pendant 1 min.'; } return 'Gégé range la bouteille. « Pour plus tard », dit-il.'; }]]},
];
export function resolveEvent(ev, i){ S.st.events++; gainXP(8); return ev.ch[i][1](); }

/* =========================================================
   QUÊTES, SUCCÈS, CHAPITRES
   ========================================================= */
export const QUESTS = [
  {t:'Touchez un tas pour que Kévin le creuse', c:()=>S.st.layers >= 1, r:[0, 3]},
  {t:'Videz 4 tas',                        c:()=>S.st.heaps >= 4,  r:[0, 5]},
  {t:'Vendez votre sac chez Josiane',      c:()=>S.st.trips >= 1,  r:[0, 8]},
  {t:'Fouillez la poubelle ou la valise de la cour', c:()=>S.st.opened >= 1, r:[0, 10]},
  {t:'Améliorez l\'outil de Kévin',        c:()=>S.up.tool >= 1,   r:[0, 10]},
  {t:'Dépensez un point de compétence (⭐)', c:()=>Object.keys(S.skills).length >= 1, r:[0, 15]},
  {t:'Achetez un sac plus grand',          c:()=>S.up.sac >= 1,    r:[0, 15]},
  {t:'Embauchez Gégé (Boutique › Équipe)', c:()=>S.emps.gege >= 1, r:[0, 25]},
  {t:'Rapportez un gros objet à Josiane',  c:()=>S.st.bigs >= 1,   r:[20, 40]},
  {t:'Ouvrez la Colline des Sacs',         c:()=>S.unlocked[1],    r:[30, 60]},
  {t:'Achetez l\'aimant et utilisez-le',   c:()=>S.st.magnets >= 1, r:[30, 120]},
  {t:'Réparez un objet cassé (🔧 dans le Sac)', c:()=>S.st.repaired >= 1, r:[30, 120]},
  {t:'Ayez 3 employés',                    c:()=>totalEmps() >= 3, r:[40, 200]},
  {t:'Ouvrez le Cimetière Électronique',   c:()=>S.unlocked[2],    r:[45, 600]},
  {t:'Achetez le détecteur et déterrez un trésor', c:()=>S.st.treasures >= 1, r:[45, 800]},
  {t:'Retrouvez le boîtier du disque',     c:()=>S.story.found,    r:[60, 2500]},
  {t:'Ouvrez un coffre-fort',              c:()=>S.st.safes >= 1,  r:[60, 3000]},
  {t:'Ouvrez le Lac de Lixiviat',          c:()=>S.unlocked[3],    r:[60, 6000]},
  {t:'Atteignez le niveau 10',             c:()=>S.lvl >= 10,      r:[60, 8000]},
  {t:'Achetez la pelleteuse ou la grue',   c:()=>S.up.digger || S.up.crane, r:[60, 2e4]},
  {t:'Complétez une série de l\'album',    c:()=>[0,1,2,3,4,5,6].some(seriesDone), r:[60, 3e4]},
  {t:'Ouvrez la Montagne de Matelas',      c:()=>S.unlocked[4],    r:[60, 4e4]},
  {t:'Débloquez une compétence ULTIME',    c:()=>['FU','CU','MU','BU'].some(has), r:[60, 1e5]},
  {t:'Ouvrez le Mont Ordure',              c:()=>S.unlocked[5],    r:[60, 3e5]},
  {t:'Ouvrez la Fosse Originelle',         c:()=>S.unlocked[6],    r:[60, 2e6]},
  {t:'Retrouvez le disque dur !',          c:()=>S.ended,          r:[0, 0]},
];
export const ACHS = [
  {id:'h1',   e:'🧹', n:'Premier coup de pelle', d:'Vider un tas',          c:()=>S.st.heaps >= 1},
  {id:'h100', e:'🚮', n:'Pro du tri',          d:'Vider 100 tas',          c:()=>S.st.heaps >= 100},
  {id:'h300', e:'🏗️', n:'Grand nettoyage',     d:'Vider 300 tas',          c:()=>S.st.heaps >= 300},
  {id:'q100', e:'✨', n:'Quartier propre',      d:'Vider 100 % d\'un quartier', c:()=>QUARTERS.some((_, q) => qClearedPct(q) >= 1)},
  {id:'f100', e:'🧺', n:'Ramasseur',           d:'Trouver 100 objets',     c:()=>S.st.finds >= 100},
  {id:'f1k',  e:'🏭', n:'Usine à trouvailles', d:'Trouver 1 000 objets',   c:()=>S.st.finds >= 1000},
  {id:'leg',  e:'🏆', n:'Légende des ordures', d:'Trouver un objet légendaire', c:()=>S.st.legs >= 1},
  {id:'big1', e:'📦', n:'Déménageur',          d:'Vendre un gros objet',   c:()=>S.st.bigs >= 1},
  {id:'big20',e:'🚚', n:'Roi du débarras',     d:'Vendre 20 gros objets',  c:()=>S.st.bigs >= 20},
  {id:'safe', e:'🔐', n:'Perceur de coffres',  d:'Ouvrir un coffre-fort',  c:()=>S.st.safes >= 1},
  {id:'open20',e:'🧳', n:'Curieux',            d:'Fouiller 20 contenants', c:()=>S.st.opened >= 20},
  {id:'rep10',e:'🔧', n:'Réparateur',          d:'Réparer 10 objets',      c:()=>S.st.repaired >= 10},
  {id:'tre',  e:'💰', n:'Chasseur de trésors', d:'Déterrer 5 trésors',     c:()=>S.st.treasures >= 5},
  {id:'throw',e:'🦸', n:'Lancer de frigo',     d:'Lancer un gros objet jusqu\'à la cabane', c:()=>S.st.thrown >= 1},
  {id:'quake',e:'🌋', n:'Tremblement de benne', d:'Déclencher un séisme',  c:()=>S.st.quakes >= 1},
  {id:'lv15', e:'⭐', n:'Vétéran',             d:'Atteindre le niveau 15', c:()=>S.lvl >= 15},
  {id:'ult',  e:'🌟', n:'Ultime !',            d:'Débloquer une compétence ultime', c:()=>['FU','CU','MU','BU'].some(has)},
  {id:'album',e:'📚', n:'Collectionneur',      d:'Compléter une série de l\'album', c:()=>[0,1,2,3,4,5,6].some(seriesDone)},
  {id:'m1m',  e:'💰', n:'Millionnaire des poubelles', d:'Gagner 1 M € au total', c:()=>S.st.earned >= 1e6},
  {id:'e12',  e:'🏢', n:'PME de la poubelle',  d:'Avoir 12 employés',      c:()=>totalEmps() >= 12},
  {id:'zall', e:'🗺️', n:'Explorateur',         d:'Ouvrir tous les quartiers', c:()=>S.unlocked.every(x => x)},
  {id:'mk1',  e:'📈', n:'Trader de génie',     d:'Gagner 1 000 € en une vente de Bitcoin', c:()=>S.st.bestTrade >= 1000},
  {id:'mkl',  e:'📉', n:'Acheté au plus haut', d:'Perdre de l\'argent au Marché', c:()=>S.st.worstTrade < 0},
  {id:'ev10', e:'🎲', n:'Aimant à problèmes',  d:'Vivre 10 événements',    c:()=>S.st.events >= 10},
  {id:'scam', e:'🐟', n:'Pigeon de compétition', d:'Faire confiance à l\'arnaqueur', c:()=>S.flags.scammed},
  {id:'rat',  e:'🧀', n:'Ami des rats',        d:'Donner du fromage au rat', c:()=>S.flags.ratFriend},
  {id:'night',e:'🌙', n:'Oiseau de nuit',      d:'Trouver un légendaire la nuit', c:()=>S.flags.nightLeg},
  {id:'end',  e:'💽', n:'Retrouvé !',          d:'Retrouver le disque dur', c:()=>S.ended},
  {id:'fast', e:'⚡', n:'Speedrunner',         d:'Finir en moins d\'une heure', c:()=>S.ended && S.endTime < 3600},
  {id:'pres', e:'♻️', n:'Éternel recommencement', d:'Faire un prestige',   c:()=>S.meta.prestiges >= 1},
];
export const CHAPTER_GOALS = [
  {done:()=>S.unlocked[1], obj:()=>({txt:'Ouvrir le portail de « La Colline des Sacs » (' + eur(QUARTERS[1].cost) + ')', pct:Math.min(1, S.money / QUARTERS[1].cost)})},
  {done:()=>totalEmps() >= 3 && S.unlocked[2], obj:()=>{ const e = Math.min(3, totalEmps());
    return {txt:'Avoir 3 employés (' + e + '/3) et ouvrir « Le Cimetière Électronique » (' + eur(QUARTERS[2].cost) + ')', pct:(e / 3 + (S.unlocked[2] ? 1 : Math.min(1, S.money / QUARTERS[2].cost))) / 2}; }},
  {done:()=>S.story.found && S.unlocked[3], obj:()=>{ if(!S.story.found) return {txt:'Trouver le boîtier du disque dans le Cimetière' + (S.up.det ? ' (suivez les bips du détecteur)' : ' — achetez le Détecteur'), pct:S.up.det ? 0.1 + 0.4 * detStrengthTo({x:cx(S.story.c), z:cz(S.story.r)}) : 0.05};
    return {txt:'Ouvrir « Le Lac de Lixiviat » (' + eur(QUARTERS[3].cost) + ')', pct:0.5 + 0.5 * Math.min(1, S.money / QUARTERS[3].cost)}; }},
  {done:()=>S.unlocked[5], obj:()=>{ const q = S.unlocked[4] ? 5 : 4;
    return {txt:(S.unlocked[4] ? 'Ouvrir « Le Mont Ordure »' : 'Ouvrir « La Montagne de Matelas » puis « Le Mont Ordure »') + ' (' + eur(QUARTERS[q].cost) + ')', pct:((S.unlocked[4] ? 1 : 0) + Math.min(1, S.money / QUARTERS[q].cost)) / 2}; }},
  {done:()=>S.disk.found, obj:()=>{ if(!S.unlocked[6]) return {txt:'Ouvrir « La Fosse Originelle » (' + eur(QUARTERS[6].cost) + ')', pct:0.5 * Math.min(1, S.money / QUARTERS[6].cost)};
    return {txt:'Trouver le disque dur dans la Fosse, côté ' + (S.side < 0 ? 'gauche' : 'droit') + ' (détecteur' + (S.up.drone ? ' + drone' : '') + ')', pct:0.5 + 0.5 * detStrengthTo({x:cx(S.disk.c), z:cz(S.disk.r)})}; }},
];
export function checkProgress(){
  let guard = 0;
  while(S.quest < QUESTS.length - 1 && QUESTS[S.quest].c() && guard++ < 5){
    const q = QUESTS[S.quest], x = Math.max(q.r[1], q.r[0] ? Rw(q.r[0]) : 0);
    earn(x); S.quest++; gainXP(10); toast('📜 Quête réussie : ' + q.t + ' (+' + eur(x) + ')', 'good'); sfx('quest');
  }
  for(const a of ACHS) if(!S.meta.ach[a.id] && a.c()){ S.meta.ach[a.id] = true; toast('🏅 Succès : ' + a.n, 'gold'); sfx('rare'); }
  if(!S.ended && CHAPTER_GOALS[S.chapter].done()){
    S.chapterTimes.push(S.st.time);
    if(S.chapter < 4){ const dlg = D.CHAPTERS[S.chapter].dlg; S.chapter++; emit('dialog', {lines:dlg, chapter:S.chapter}); gainXP(60 * S.chapter); }
    else {
      S.ended = true; S.endTime = S.st.time; S.meta.finishes++;
      if(!S.meta.bestTime || S.endTime < S.meta.bestTime) S.meta.bestTime = S.endTime;
      S.quest = QUESTS.length; emit('dialog', {lines:D.END_DLG, end:true}); checkProgress();
    }
  }
}

/* =========================================================
   ACHATS
   ========================================================= */
export function buyLeveled(id){
  const u = D.LEVELED.find(x => x.id === id); if(!u || S.up[id] >= u.max) return false;
  const c = costLv(u.base, S.up[id]); if(S.money < c) return false;
  S.money -= c; S.up[id]++;
  if(id === 'tool' && D.TOOL_TIERS.some(t => t.lvl === S.up.tool)){ toast('⛏️ Nouvel outil : ' + D.TOOL_TIERS[toolTier()].n + ' !', 'gold'); say(W.kevin, 'Regardez-moi cet outil !', 2); }
  return true;
}
export const toolTier = () => { let k = 0; D.TOOL_TIERS.forEach((t, i) => { if(S.up.tool >= t.lvl) k = i; }); return k; };
export const sackCost = () => { const nx = D.SACKS[S.up.sac + 1]; return nx ? nx.cost * costMul() : null; };
export function buySack(){ const c = sackCost(); if(c === null || S.money < c) return false; S.money -= c; S.up.sac++; say(W.kevin, 'Un plus grand sac !', 1.5); return true; }
export const onceCost = id => D.ONCE.find(x => x.id === id).cost * costMul();
export function buyOnce(id){ const o = D.ONCE.find(x => x.id === id); if(!o || S.up[id] || S.money < onceCost(id)) return false; S.money -= onceCost(id); S.up[id] = true; emit('bought', {id});
  if(['det','magnet','vacuum','crane','digger'].includes(id)) toast('🧰 Nouvel outil dans la barre du bas : ' + o.n + ' !', 'gold');
  if(id === 'truck') toast('🚛 Le camion viendra chercher votre sac quand il sera à moitié plein.', 'good'); return true; }
export const empCost = id => costLv(D.EMPS.find(e => e.id === id).base, S.emps[id]);
export function hire(id){ if(S.emps[id] >= D.EMP_MAX) return false; const c = empCost(id); if(S.money < c) return false; S.money -= c; S.emps[id]++; addWorkerEnt(id); return true; }
export function unlockQ(q){ const Q = QUARTERS[q]; if(!Q || S.unlocked[q] || !S.unlocked[q - 1] || S.money < Q.cost) return false;
  S.money -= Q.cost; S.unlocked[q] = true; sfx('unlock'); emit('gate', {q}); toast('🗺️ Portail ouvert : ' + Q.n + '. Creusez à travers le portail !', 'gold'); gainXP(40 * q); return true; }

/* =========================================================
   HORS LIGNE, PRESTIGE, SAUVEGARDE
   ========================================================= */
export function applyOffline(sec){
  sec = Math.min(sec, 8 * 3600); const inc = teamIncome() / (bm('emp') || 1);
  if(sec < 30 || inc <= 0) return null;
  const money = inc * sec * 0.5; earn(money);
  for(let i = 0; i < Math.min(90, sec); i++) marketStep();
  return {sec, money};
}
export const karmaGain = () => Math.max(1, Math.floor(2 * Math.pow(S.st.earned / 1e7, 0.3)));
export function doPrestige(){ if(!S.ended) return false; const meta = S.meta; meta.karma += karmaGain(); meta.prestiges++; S = newState(meta); startWorld(); return true; }
export function serialize(){
  let L = ''; for(let r = 0; r < NQ * QROWS; r++) for(const t of W.tiles[r]) L += t.L;
  const hp = {}, marks = [], maxL = {};
  for(let r = 0; r < NQ * QROWS; r++) W.tiles[r].forEach((t, c) => { const k = r * COLS + c; if(t.L && t.hp < hpMax(t) - 1e-9) hp[k] = Math.round(t.hp * 100) / 100; if(t.mark) marks.push(k); if(t.refilled) maxL[k] = t.maxL; });
  const k = W.kevin;
  if(k.carry){ k.carry.state = 'ground'; k.carry.y = 0; }
  S.world = {L, hp, marks, maxL,
    loot:W.loot.map(o => [o.it, round2(o.landed ? o.x : o.lx), round2(o.landed ? o.z : o.lz)]),
    bigs:W.bigs.map(o => [o.kind, round2(o.x), round2(o.z), o.q, o.open ? 1 : 0]),
    conts:W.conts.map(o => [o.kind, round2(o.x), round2(o.z), o.q, o.open ? 1 : 0, o.decor ? 1 : 0]),
    tre:W.treasures.map(t => t.found ? 1 : 0),
    truckLoad:W.truck ? W.truck.load : []};
  S.kev = {x:round2(k.x), z:round2(k.z)};
  const out = JSON.stringify(S);
  if(k.carry){ k.carry.state = 'carried'; }
  return out;
}
function merge(def, obj){
  if(obj === null || typeof obj !== 'object' || Array.isArray(def) || typeof def !== 'object' || def === null) return obj === undefined ? def : obj;
  const out = {...def}; for(const k in obj) out[k] = (k in def) ? merge(def[k], obj[k]) : obj[k]; return out;
}
export function parseSave(txt){
  const o = JSON.parse(txt);
  if(!o || o.v !== 3 || typeof o.money !== 'number' || typeof o.seed !== 'number') throw new Error('format');
  const st = merge(newState(), o); st.meta = merge(defaultMeta(), o.meta || {}); st.seed = o.seed;
  if(!Array.isArray(st.market.hist) || !st.market.hist.length) st.market.hist = Array(90).fill(st.market.p);
  return st;
}
/** Construit le monde de la partie S (nouvelle ou chargée) */
export function startWorld(){
  const storyF = S.story.found, diskF = S.disk.found, w = S.world;
  W.loot = []; W.bigs = []; W.fx.length = 0;
  genWorld(S.seed);
  if(w && w.L){
    S.story.found = storyF; S.disk.found = diskF;
    for(let r = 0; r < NQ * QROWS; r++) W.tiles[r].forEach((t, c) => { const k = r * COLS + c, v = +w.L[k]; if(!isNaN(v)){ if(w.maxL && w.maxL[k]){ t.maxL = w.maxL[k]; t.refilled = true; } t.L = v; if(v > t.maxL) t.maxL = v; t.hp = hpMax(t); } });
    for(const k in (w.hp || {})){ const r = Math.floor(k / COLS), c = k % COLS; if(W.tiles[r] && W.tiles[r][c].L) W.tiles[r][c].hp = w.hp[k]; }
    for(const k of (w.marks || [])){ const r = Math.floor(k / COLS), c = k % COLS; if(W.tiles[r]) W.tiles[r][c].mark = true; }
    (w.tre || []).forEach((f, i) => { if(W.treasures[i]) W.treasures[i].found = !!f; });
    W.conts = [];
    for(const [kind, x, z, q, open, decor] of (w.conts || [])){ const o = addCont(kind, x, z, q, decor); o.open = !!open; }
    for(const [kind, x, z, q, open] of (w.bigs || [])){ const o = addBig(kind, x, z, q); o.open = !!open; }
    for(const [it, x, z] of (w.loot || [])){ const o = {id:W.nextId++, it, x, y:0.12, z, sx:x, sy:0, sz:z, lx:x, lz:z, t:1, dur:1, landed:true, metal:!!itemOf(it)[4], age:5, magnet:0}; W.loot.push(o); }
    if(w.truckLoad && w.truckLoad.length) S.bag = S.bag.concat(w.truckLoad);
  }
  resetEntities();
  emit('world', {});
}
export function init(headless){ W.headless = !!headless; }
