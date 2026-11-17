import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { G } from './ctx.js';
import { labelTex, crateTex, cv, imgTex } from './textures.js';
import { rand, mulberry32, clamp } from './util.js';
import { WEAPONS, buildGunModel, flattenGun } from './weapons.js';
import * as SND from './audio.js';

export const H = 3.2, T = 0.3;
export const ROOMS = {
  A: { x0: -8, x1: 4, z0: -6, z1: 6, name: 'la salle commune' }, B: { x0: 4, x1: 16, z0: -6, z1: 2, name: "l'atelier" }, C: { x0: -8, x1: 16, z0: -14, z1: -6, name: 'la grande halle' },
  D: { x0: 16, x1: 34, z0: -14, z1: 6, name: 'la cour', outdoor: true }, G: { x0: 16, x1: 34, z0: 6, z1: 24, name: 'le cimetière', outdoor: true }, E: { x0: 4, x1: 34, z0: -26, z1: -14, name: 'la grange' }, F: { x0: -8, x1: 4, z0: -26, z1: -14, name: 'le dortoir' },
};
const WIN = { w: 1.5, y0: 0.95, y1: 2.3 }, DOOR = { w: 1.5, y0: 0, y1: 2.25 };
const NAV = { x0: -9.5, z0: -27.5, cs: 0.5, w: 92, h: 104 };
const CENTER = { x: 13, z: -10 };

function worldUV(g, tile) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ax > 0.5) uv.setXY(i, p.getZ(i) / tile, p.getY(i) / tile);
    else if (ay > 0.5) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile);
    else uv.setXY(i, p.getX(i) / tile, p.getY(i) / tile);
  }
  return g;
}
function boxG(x0, x1, y0, y1, z0, z1, tile = 1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return worldUV(g, tile);
}

function makeMaterials() {
  const X = G.tex, M = G.mat, S = (o) => new THREE.MeshStandardMaterial(o);
  M.brick = S({ map: X.brick, bumpMap: X.brickBump, bumpScale: 2.2, roughness: 0.93, color: 0x9c8f86 });
  M.floorWood = S({ map: X.wood, bumpMap: X.woodBump, bumpScale: 1.2, roughnessMap: X.woodRough, roughness: 0.88, color: 0x6e5038 });
  M.woodDark = S({ map: X.wood, bumpMap: X.woodBump, bumpScale: 1, roughness: 0.85, color: 0x4c3625 });
  M.plank = S({ map: X.wood, bumpMap: X.woodBump, bumpScale: 1, roughness: 0.9, color: 0x6a5238 });
  M.ceil = S({ map: X.wood, roughness: 0.95, color: 0x2e2219 });
  M.concrete = S({ map: X.concrete, bumpMap: X.concreteBump, bumpScale: 1.6, roughness: 0.95, color: 0x8d8b86 });
  M.dirt = S({ map: X.concrete, bumpMap: X.concreteBump, bumpScale: 2.4, roughness: 1, color: 0x6b5a46 });
  M.grass = S({ map: X.grass, roughness: 1, color: 0x66786a });
  M.straw = S({ map: X.concrete, bumpMap: X.concreteBump, bumpScale: 3, roughness: 1, color: 0xb08a3a });
  M.cloth = S({ map: X.concrete, roughness: 1, color: 0x59604e });
  M.crate = S({ map: crateTex(), roughness: 0.85, color: 0xa08a70 });
  M.barrelGreen = S({ map: X.metalGreen, roughness: 0.55, metalness: 0.55 });
  M.barrelRed = S({ map: X.metalRed, roughness: 0.55, metalness: 0.5 });
  M.metalGrey = S({ map: X.metalGrey, roughness: 0.5, metalness: 0.7 });
  M.iron = S({ color: 0x1c1d20, roughness: 0.45, metalness: 0.9 });
  M.tire = S({ color: 0x0b0b0b, roughness: 0.92 });
  M.sand = S({ map: X.concrete, bumpMap: X.concreteBump, bumpScale: 2, roughness: 1, color: 0x8a7a58 });
  M.bark = S({ color: 0x14110e, roughness: 1 });
  M.roof = S({ color: 0x0a0a0a, roughness: 1 });
  M.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4.2, 2.2) });
  M.blob = new THREE.MeshBasicMaterial({ map: X.blob, transparent: true, depthWrite: false, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
}

export function buildWorld() {
  makeMaterials();
  const M = G.mat, scene = G.scene;
  const W = (G.world = { colliders: [], windows: [], doors: [], interactables: [], lamps: [], fires: [], unlocked: new Set(['A']) });
  const geo = { brick: [], floorWood: [], concrete: [], dirt: [], woodDark: [], ceil: [], crate: [], barrelGreen: [], barrelRed: [], metalGrey: [], iron: [], roof: [], plank: [], straw: [], cloth: [], tire: [], sand: [], bark: [] };

  const addCol = (x0, x1, z0, z1, y0 = 0, y1 = H, move = true, bullet = true) => { const c = { x0, x1, z0, z1, y0, y1, move, bullet, on: true }; W.colliders.push(c); return c; };
  const solid = (list, x0, x1, y0, y1, z0, z1, tile = 1, move = true) => { list.push(boxG(x0, x1, y0, y1, z0, z1, tile)); return addCol(x0, x1, z0, z1, y0, y1, move && y0 < 1.2, true); };

  // ---------- walls ----------
  function wall(axis, at, from, to, ops = []) {
    ops = ops.slice().sort((a, b) => a.c - b.c);
    const seg = (a, b, y0, y1, move) => {
      if (b - a < 1e-4) return;
      const r = axis === 'x' ? [at - T / 2, at + T / 2, a, b] : [a, b, at - T / 2, at + T / 2];
      geo.brick.push(boxG(r[0], r[1], y0, y1, r[2], r[3], 2.2));
      addCol(r[0], r[1], r[2], r[3], y0, y1, move, true);
    };
    let cur = from - T / 2;
    for (const o of ops) {
      const a = o.c - o.w / 2, b = o.c + o.w / 2;
      seg(cur, a, 0, H, true);
      if (o.y0 > 0) seg(a, b, 0, o.y0, true);
      seg(a, b, o.y1, H, false);
      cur = b;
    }
    seg(cur, to + T / 2, 0, H, true);
  }
  const win = (c) => ({ c, ...WIN }), door = (c) => ({ c, ...DOOR });
  wall('x', -8, -6, 6, [win(0)]); wall('z', 6, -8, 4, [win(-5), win(1)]); wall('x', 4, 2, 6);
  wall('x', 4, -6, 2, [door(-2)]); wall('z', 2, 4, 16, [win(10)]); wall('x', 16, -6, 2, [door(-2)]);
  wall('z', -6, -8, 4, [door(-2)]); wall('z', -6, 4, 16, [door(11)]);
  wall('x', -8, -14, -6, [win(-10)]); wall('z', -14, -8, 4, [door(-2)]); wall('z', -14, 4, 16, [door(10)]); wall('x', 16, -14, -6, [door(-10)]);
  wall('x', -8, -26, -14, [win(-20)]); wall('z', -26, -8, 4, [win(-2)]); wall('x', 4, -26, -14, [door(-20)]);
  wall('z', -26, 4, 34, [win(10), win(22)]); wall('x', 34, -26, -14, [win(-20)]); wall('z', -14, 16, 34, [door(25)]);
  wall('x', 34, -14, 6, [win(-4), win(-10)]); wall('z', 6, 16, 34, [door(26)]); wall('x', 16, 2, 6);
  wall('x', 16, 6, 24, [win(18)]); wall('x', 34, 6, 24, [win(15)]); wall('z', 24, 16, 34, [win(20.5), win(29.5)]);

  // ---------- floors, ceilings, roof ----------
  const flat = (list, r, y, up, tile) => { const g = new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0); g.rotateX(up ? -Math.PI / 2 : Math.PI / 2); g.translate((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2); list.push(worldUV(g, tile)); };
  flat(geo.floorWood, ROOMS.A, 0, true, 1.9); flat(geo.concrete, ROOMS.B, 0, true, 3); flat(geo.floorWood, ROOMS.C, 0, true, 1.9);
  flat(geo.dirt, ROOMS.D, 0, true, 3.4); flat(geo.dirt, ROOMS.E, 0, true, 2.6); flat(geo.floorWood, ROOMS.F, 0, true, 1.9);
  for (const k in ROOMS) {
    const r = ROOMS[k]; if (k === 'G') { geo.concrete.push(boxG(r.x1 - 0.25, r.x1 + 0.25, H, H + 0.12, r.z0, r.z1 + 0.25, 2), boxG(r.x0 - 0.25, r.x1 + 0.25, H, H + 0.12, r.z1 - 0.25, r.z1 + 0.25, 2), boxG(r.x0 - 0.25, r.x0 + 0.25, H, H + 0.12, r.z0, r.z1, 2), boxG(r.x0, r.x1, H, H + 0.12, r.z0 - 0.25, r.z0 + 0.25, 2)); continue; }
    if (r.outdoor) { // capping stones on the yard wall
      geo.concrete.push(boxG(r.x1 - 0.25, r.x1 + 0.25, H, H + 0.12, r.z0, r.z1 + 0.25, 2), boxG(r.x0 - 0.25, r.x1 + 0.25, H, H + 0.12, r.z1 - 0.25, r.z1 + 0.25, 2), boxG(r.x0 - 0.25, r.x0 + 0.25, H, H + 0.12, 2, r.z1, 2));
      continue;
    }
    flat(geo.ceil, r, H, false, 2.4);
    geo.roof.push(boxG(r.x0 - 0.4, r.x1 + 0.4, H + 0.02, H + 0.3, r.z0 - 0.4, r.z1 + 0.4));
    const alongX = r.x1 - r.x0 > r.z1 - r.z0;
    if (alongX) for (let x = r.x0 + 2; x < r.x1 - 0.5; x += 2.4) geo.woodDark.push(boxG(x - 0.09, x + 0.09, H - 0.24, H, r.z0, r.z1, 1.5));
    else for (let z = r.z0 + 2; z < r.z1 - 0.5; z += 2.4) geo.woodDark.push(boxG(r.x0, r.x1, H - 0.24, H, z - 0.09, z + 0.09, 1.5));
    const s = 0.035, hgt = 0.14;
    geo.woodDark.push(boxG(r.x0 + T / 2, r.x1 - T / 2, 0, hgt, r.z0 + T / 2, r.z0 + T / 2 + s, 1.5), boxG(r.x0 + T / 2, r.x1 - T / 2, 0, hgt, r.z1 - T / 2 - s, r.z1 - T / 2, 1.5));
  }

  // ---------- windows ----------
  const plankGeoX = new THREE.BoxGeometry(0.05, 0.17, WIN.w + 0.5), plankGeoZ = new THREE.BoxGeometry(WIN.w + 0.5, 0.17, 0.05);
  function addWindow(id, room, axis, at, c, nx, nz) {
    const w = { id, room, axis, x: axis === 'x' ? at : c, z: axis === 'x' ? c : at, nx, nz, planks: [], count: 0, busy: null };
    const f = 0.07, d = T / 2 + 0.03, a = c - WIN.w / 2, b = c + WIN.w / 2;
    const fr = (u0, u1, y0, y1) => geo.woodDark.push(axis === 'x' ? boxG(at - d, at + d, y0, y1, u0, u1, 1.3) : boxG(u0, u1, y0, y1, at - d, at + d, 1.3));
    fr(a - f, a, WIN.y0 - f, WIN.y1 + f); fr(b, b + f, WIN.y0 - f, WIN.y1 + f); fr(a, b, WIN.y0 - f, WIN.y0); fr(a, b, WIN.y1, WIN.y1 + f);
    const sx = axis === 'x' ? at + nx * 0.2 : c, sz = axis === 'x' ? c : at + nz * 0.2;
    geo.woodDark.push(axis === 'x' ? boxG(sx - 0.14, sx + 0.14, WIN.y0 - 0.05, WIN.y0, a - 0.1, b + 0.1, 1.3) : boxG(a - 0.1, b + 0.1, WIN.y0 - 0.05, WIN.y0, sz - 0.14, sz + 0.14, 1.3));
    const r = mulberry32(id * 31 + 7);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(axis === 'x' ? plankGeoX : plankGeoZ, M.plank);
      const y = WIN.y0 + 0.16 + i * 0.26, off = T / 2 + 0.035 + (i % 2) * 0.03;
      m.position.set(w.x + nx * off, y, w.z + nz * off);
      const roll = (r() - 0.5) * 0.24;
      if (axis === 'x') m.rotation.x = roll; else m.rotation.z = roll;
      m.castShadow = false; m.receiveShadow = true;
      scene.add(m);
      w.planks.push({ mesh: m, on: true, home: m.position.clone(), rot: m.rotation.clone(), t: 0, mode: 0 });
    }
    w.count = 5;
    W.windows.push(w);
    W.interactables.push({ x: w.x + nx * 0.9, z: w.z + nz * 0.9, y: 1.4, r: 1.5, hold: true, win: w, prompt: () => (w.count < 5 ? 'Maintenir <b>F</b> — Réparer la barricade' : null), use: () => G.game.repair(w) });
  }
  addWindow(1, 'A', 'x', -8, 0, 1, 0); addWindow(2, 'A', 'z', 6, -5, 0, -1); addWindow(3, 'A', 'z', 6, 1, 0, -1);
  addWindow(4, 'B', 'z', 2, 10, 0, -1); addWindow(5, 'C', 'x', -8, -10, 1, 0);
  addWindow(6, 'F', 'x', -8, -20, 1, 0); addWindow(7, 'F', 'z', -26, -2, 0, 1);
  addWindow(8, 'E', 'z', -26, 10, 0, 1); addWindow(9, 'E', 'z', -26, 22, 0, 1); addWindow(10, 'E', 'x', 34, -20, -1, 0);
  addWindow(11, 'D', 'x', 34, -4, -1, 0); addWindow(12, 'D', 'x', 34, -10, -1, 0);
  addWindow(13, 'G', 'x', 16, 18, 1, 0); addWindow(14, 'G', 'x', 34, 15, -1, 0); addWindow(15, 'G', 'z', 24, 20.5, 0, -1); addWindow(16, 'G', 'z', 24, 29.5, 0, -1);

  W.removePlank = (w) => {
    for (let i = 4; i >= 0; i--) { const p = w.planks[i]; if (p.on) { p.on = false; p.mode = -1; p.t = 0; w.count--; SND.plank(w.x, w.z, true); G.fx?.debris(p.mesh.position, w.nx, w.nz); return true; } }
    return false;
  };
  W.addPlank = (w) => {
    for (let i = 0; i < 5; i++) { const p = w.planks[i]; if (!p.on) { p.on = true; p.mode = 1; p.t = 0; w.count++; p.mesh.visible = true; SND.plank(w.x, w.z, false); return true; } }
    return false;
  };

  // ---------- doors ----------
  const doorLabel = (cost) => labelTex([{ text: 'CONDAMNÉ', size: 70, y: 92, color: '#d8cdb0' }, { text: String(cost), size: 104, y: 186, color: '#c0241c' }], { w: 512, h: 256 });
  function addDoor(id, axis, at, c, cost, rooms) {
    const s = 1, w = DOOR.w, h = DOOR.y1;
    const pivot = new THREE.Group();
    const slabG = axis === 'x' ? new THREE.BoxGeometry(0.07, h, w) : new THREE.BoxGeometry(w, h, 0.07);
    const slab = new THREE.Mesh(worldUV(slabG, 1.2), M.woodDark);
    const g = new THREE.Group(); g.add(slab);
    for (const [yy, rot] of [[0.62, 0.16], [1.3, -0.12], [1.86, 0.1]]) {
      const pl = new THREE.Mesh(axis === 'x' ? new THREE.BoxGeometry(0.04, 0.16, w + 0.34) : new THREE.BoxGeometry(w + 0.34, 0.16, 0.04), M.plank);
      pl.position.y = yy - h / 2;
      if (axis === 'x') { pl.position.x = 0.055; pl.rotation.x = rot; } else { pl.position.z = 0.055; pl.rotation.z = rot; }
      g.add(pl);
    }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshStandardMaterial({ map: doorLabel(cost), transparent: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4 }));
    const sign2 = sign.clone();
    if (axis === 'x') { sign.rotation.y = Math.PI / 2; sign.position.set(0.082, 0.42, 0); sign2.rotation.y = -Math.PI / 2; sign2.position.set(-0.04, 0.42, 0); }
    else { sign.position.set(0, 0.42, 0.082); sign2.rotation.y = Math.PI; sign2.position.set(0, 0.42, -0.04); }
    g.add(sign, sign2);
    if (axis === 'x') { pivot.position.set(at + s * (T / 2 + 0.04), 0, c - w / 2); g.position.set(0, h / 2, w / 2); }
    else { pivot.position.set(c - w / 2, 0, at + s * (T / 2 + 0.04)); g.position.set(w / 2, h / 2, 0); }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    pivot.add(g); scene.add(pivot);
    const col = axis === 'x' ? addCol(at - T / 2, at + T / 2 + 0.1, c - w / 2, c + w / 2, 0, h) : addCol(c - w / 2, c + w / 2, at - T / 2, at + T / 2 + 0.1, 0, h);
    const d = { id, axis, cost, rooms, pivot, col, open: false, t: 0, target: axis === 'x' ? 3.05 : -3.05, x: axis === 'x' ? at : c, z: axis === 'x' ? c : at };
    W.doors.push(d);
    W.interactables.push({
      x: d.x, z: d.z, y: 1.2, r: 1.9,
      prompt: () => { if (d.open) return null; const here = W.roomAt(G.player.x, G.player.z), to = rooms[0] === here ? rooms[1] : rooms[0]; return `<b>F</b> — Dégager le passage vers ${ROOMS[to].name} <i>[${cost}]</i>`; },
      use: () => { if (!d.open && G.game.spend(cost)) W.openDoor(d); },
    });
  }
  addDoor(1, 'x', 4, -2, 750, ['A', 'B']); addDoor(2, 'z', -6, -2, 1000, ['A', 'C']); addDoor(3, 'z', -6, 11, 1000, ['B', 'C']);
  addDoor(4, 'x', 16, -2, 1250, ['B', 'D']); addDoor(5, 'x', 16, -10, 1250, ['C', 'D']); addDoor(6, 'z', -14, -2, 1250, ['F', 'C']);
  addDoor(7, 'z', -14, 10, 1500, ['E', 'C']); addDoor(8, 'x', 4, -20, 1250, ['F', 'E']); addDoor(9, 'z', -14, 25, 1500, ['E', 'D']); addDoor(10, 'z', 6, 26, 1750, ['D', 'G']);
  W.openDoor = (d) => { d.open = true; d.col.on = false; SND.door(d.x, d.z); W.refreshRooms(); W.rebuildNav(); };
  W.refreshRooms = () => {
    W.unlocked = new Set(['A']);
    for (let k = 0; k < 8; k++) for (const d of W.doors) if (d.open && (W.unlocked.has(d.rooms[0]) || W.unlocked.has(d.rooms[1]))) { W.unlocked.add(d.rooms[0]); W.unlocked.add(d.rooms[1]); }
  };

  // ---------- props ----------
  const crate = (x, z, s = 0.9, y = 0) => { const g = new THREE.BoxGeometry(s, s, s); g.translate(x, y + s / 2, z); geo.crate.push(g); if (y < 1) addCol(x - s / 2, x + s / 2, z - s / 2, z + s / 2, y, y + s, y < 0.5, true); };
  const barrel = (x, z, mat = 'barrelGreen') => {
    const g = new THREE.CylinderGeometry(0.29, 0.29, 0.9, 20); g.translate(x, 0.45, z); geo[mat].push(g);
    for (const yy of [0.04, 0.32, 0.6, 0.88]) { const t = new THREE.TorusGeometry(0.292, 0.014, 6, 20); t.rotateX(Math.PI / 2); t.translate(x, yy, z); geo[mat].push(t); }
    addCol(x - 0.27, x + 0.27, z - 0.27, z + 0.27, 0, 0.9);
  };
  const table = (x, z, w = 1.8, d = 0.9) => {
    geo.woodDark.push(boxG(x - w / 2, x + w / 2, 0.76, 0.82, z - d / 2, z + d / 2, 1.2));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) geo.woodDark.push(boxG(x + sx * (w / 2 - 0.1) - 0.04, x + sx * (w / 2 - 0.1) + 0.04, 0, 0.76, z + sz * (d / 2 - 0.1) - 0.04, z + sz * (d / 2 - 0.1) + 0.04, 1.2));
    addCol(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 0, 0.82);
  };
  const pillar = (x, z, mat = 'concrete', hw = 0.28) => solid(geo[mat], x - hw, x + hw, 0, H, z - hw, z + hw, mat === 'concrete' ? 3 : 1.4);
  const shelf = (x, z, alongX, len = 1.8) => {
    const dx = alongX ? len / 2 : 0.2, dz = alongX ? 0.2 : len / 2, r = mulberry32((x * 13 + z * 7) | 0);
    for (const yy of [0.25, 0.85, 1.45, 2.0]) geo.woodDark.push(boxG(x - dx, x + dx, yy, yy + 0.04, z - dz, z + dz, 1.1));
    for (const s of [-1, 1]) geo.woodDark.push(alongX ? boxG(x + s * dx - 0.03, x + s * dx + 0.03, 0, 2.1, z - dz, z + dz, 1.1) : boxG(x - dx, x + dx, 0, 2.1, z + s * dz - 0.03, z + s * dz + 0.03, 1.1));
    for (const yy of [0.29, 0.89, 1.49]) for (let k = 0; k < 4; k++) {
      const u = (r() - 0.5) * (len - 0.4), hh = 0.12 + r() * 0.2, rr = 0.045 + r() * 0.04;
      const g = r() < 0.6 ? new THREE.CylinderGeometry(rr, rr, hh, 10) : new THREE.BoxGeometry(rr * 3, hh, rr * 2.4);
      g.translate(alongX ? x + u : x, yy + hh / 2, alongX ? z : z + u);
      geo[r() < 0.5 ? 'metalGrey' : r() < 0.5 ? 'barrelRed' : 'barrelGreen'].push(g);
    }
    addCol(x - dx, x + dx, z - dz, z + dz, 0, 2.1);
  };
  const RB = (w, h, d, r, x, y, z) => new RoundedBoxGeometry(w, h, d, 2, r).translate(x, y, z);
  const bunk = (x, z, alongX) => {
    const L = 2.0, Wd = 0.9, hx = alongX ? L / 2 : Wd / 2, hz = alongX ? Wd / 2 : L / 2;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) geo.iron.push(boxG(x + sx * hx - 0.025, x + sx * hx + 0.025, 0, 1.75, z + sz * hz - 0.025, z + sz * hz + 0.025));
    for (const y of [0.42, 1.32]) { geo.iron.push(boxG(x - hx, x + hx, y - 0.04, y, z - hz, z + hz)); geo.cloth.push(RB(hx * 2 - 0.08, 0.14, hz * 2 - 0.08, 0.05, x, y + 0.07, z)); geo.straw.push(RB(alongX ? 0.4 : hx * 2 - 0.2, 0.09, alongX ? hz * 2 - 0.2 : 0.4, 0.04, x + (alongX ? -hx + 0.3 : 0), y + 0.17, z + (alongX ? 0 : -hz + 0.3))); }
    addCol(x - hx, x + hx, z - hz, z + hz, 0, 1.75);
  };
  const locker = (x, z, alongX) => { const hx = alongX ? 0.26 : 0.22, hz = alongX ? 0.22 : 0.26; geo.metalGrey.push(boxG(x - hx, x + hx, 0, 1.85, z - hz, z + hz, 1.2)); geo.iron.push(alongX ? boxG(x - 0.03, x + 0.03, 1.0, 1.1, z + hz, z + hz + 0.02) : boxG(x + hx, x + hx + 0.02, 1.0, 1.1, z - 0.03, z + 0.03)); addCol(x - hx, x + hx, z - hz, z + hz, 0, 1.85); };
  const bale = (x, z, y = 0, alongX = true) => { const w = alongX ? 1.25 : 0.62, d = alongX ? 0.62 : 1.25; geo.straw.push(RB(w, 0.56, d, 0.07, x, y + 0.28, z)); if (y < 1) addCol(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y, y + 0.56, y < 0.5, true); };
  const sandbags = (x, z, n, alongX) => {
    for (let row = 0; row < 3; row++) for (let i = 0; i < n - (row % 2); i++) { const u = (i - (n - 1 - (row % 2)) / 2) * 0.62; geo.sand.push(RB(alongX ? 0.64 : 0.36, 0.25, alongX ? 0.36 : 0.64, 0.1, x + (alongX ? u : 0), 0.125 + row * 0.23, z + (alongX ? 0 : u))); }
    const hl = n * 0.31; addCol(x - (alongX ? hl : 0.2), x + (alongX ? hl : 0.2), z - (alongX ? 0.2 : hl), z + (alongX ? 0.2 : hl), 0, 0.72);
  };
  // Room A — salle commune
  table(-3.2, 2.2);
  crate(-7.2, -5.2, 1.0); crate(-6.15, -5.3, 0.8); crate(-7.15, -5.2, 0.7, 1.0);
  barrel(3.3, -5.3); barrel(2.6, -5.35, 'barrelRed');
  shelf(-7.62, 3.6, false, 2.0);
  crate(3.3, 0.8, 0.85);
  // Room B — atelier
  geo.woodDark.push(boxG(5, 8, 0.84, 0.92, -5.85, -5.1, 1.2)); geo.iron.push(boxG(5.05, 5.13, 0, 0.84, -5.8, -5.15), boxG(7.87, 7.95, 0, 0.84, -5.8, -5.15), boxG(5.05, 7.95, 0.3, 0.34, -5.8, -5.15));
  addCol(5, 8, -5.85, -5.1, 0, 0.92);
  geo.barrelRed.push(boxG(5.3, 5.9, 0.92, 1.14, -5.7, -5.35)); geo.metalGrey.push(boxG(6.6, 7.0, 0.92, 1.0, -5.6, -5.3), new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12).translate(7.5, 1.02, -5.5));
  barrel(15.2, 1.3); barrel(14.5, 1.35, 'barrelRed');
  crate(15.1, -5.1, 1.1); crate(13.95, -5.2, 0.85); crate(15.1, -5.1, 0.75, 1.1);
  pillar(10, -2.4);
  shelf(12.6, 1.62, true, 1.9);
  // Room C — grande halle
  pillar(0.5, -10); pillar(8, -10);
  crate(-7.1, -13.1, 1.1); crate(-5.95, -13.25, 0.8); crate(-7.2, -6.95, 0.9);
  barrel(15.2, -13.2); barrel(14.5, -13.3, 'barrelRed'); barrel(15.3, -7.0);
  table(12.6, -8.0, 1.6, 0.85);
  shelf(-4.9, -6.38, true, 2.0);
  crate(4.6, -6.75, 0.9);
  // Room F — dortoir
  bunk(-7.3, -16.6, false); bunk(-7.3, -23.6, false); bunk(1.6, -25.3, true); bunk(-5.2, -25.3, true);
  for (const x of [-6.9, -6.35, -5.8, -5.25]) locker(x, -14.4, true);
  table(-1.5, -20.2, 1.6, 0.85); crate(3.3, -15.0, 0.85); barrel(3.3, -25.2);
  // Room E — grange
  for (const x of [11, 19, 27]) for (const z of [-22.2, -17.8]) pillar(x, z, 'woodDark', 0.16);
  bale(5.2, -25.3); bale(6.5, -25.3); bale(5.85, -25.3, 0.56); bale(5.0, -24.0, 0, false);
  bale(15.5, -25.3); bale(16.8, -25.3); bale(16.15, -25.3, 0.56); bale(14.2, -25.3);
  bale(33.3, -15.2, 0, false); bale(33.3, -16.5, 0, false); bale(33.3, -15.85, 0.56, false); bale(32.4, -14.9);
  bale(22, -19.2); bale(22.3, -20.6, 0, false);
  crate(5.0, -14.9, 1.0); crate(6.1, -14.8, 0.8); barrel(13.0, -14.7); barrel(13.7, -14.75, 'barrelRed'); crate(31.5, -25.2, 1.0); crate(32.6, -25.2, 0.85); crate(31.6, -25.2, 0.7, 1.0);
  // Room D — cour
  {
    // wrecked truck
    const tx = 27.2, tz = -7.2, tg = [];
    tg.push(RB(2.1, 1.25, 1.7, 0.12, tx, 1.5, tz - 1.9), RB(2.0, 0.75, 1.3, 0.1, tx, 1.1, tz - 3.3), RB(2.2, 0.16, 3.4, 0.03, tx, 0.95, tz + 0.7));
    for (const s of [-1, 1]) tg.push(RB(0.07, 0.55, 3.4, 0.02, tx + s * 1.07, 1.3, tz + 0.7)); tg.push(RB(2.2, 0.55, 0.07, 0.02, tx, 1.3, tz - 0.98), RB(2.1, 0.12, 0.2, 0.03, tx, 0.62, tz - 4.0));
    geo.barrelGreen.push(...tg);
    for (const s of [-1, 1]) for (const dz of [-3.1, 1.3]) geo.tire.push(new THREE.CylinderGeometry(0.46, 0.46, 0.3, 18).rotateZ(Math.PI / 2).translate(tx + s * 0.98, 0.44 - (dz > 0 && s > 0 ? 0.12 : 0), tz + dz));
    geo.iron.push(boxG(tx - 0.9, tx + 0.9, 0.55, 0.8, tz - 3.9, tz + 2.3));
    addCol(tx - 1.15, tx + 1.15, tz - 4.05, tz + 2.45, 0, 2.1);
    sandbags(21.5, 2.6, 5, true); sandbags(30.5, -1.2, 4, false);
    crate(17.0, 5.1, 1.0); crate(18.1, 5.2, 0.8); crate(33.1, 5.1, 0.95); barrel(33.2, -13.2); barrel(32.5, -13.3, 'barrelRed'); crate(17.1, -13.1, 0.95);
    bale(20.5, -13.3); bale(21.8, -13.3);
    // a dead tree growing in the yard
    const r = mulberry32(77), branch = (m, len, rad, depth) => {
      const g = new THREE.CylinderGeometry(rad * 0.62, rad, len, 7, 1); g.translate(0, len / 2, 0); g.applyMatrix4(m); geo.bark.push(g); if (depth <= 0) return;
      for (let i = 0; i < 2 + (depth < 3 ? 1 : 0); i++) { const c = new THREE.Matrix4().makeTranslation(0, len * (0.6 + r() * 0.4), 0); c.multiply(new THREE.Matrix4().makeRotationY(r() * 6.28)).multiply(new THREE.Matrix4().makeRotationZ(0.4 + r() * 0.5)); branch(m.clone().multiply(c), len * 0.66, rad * 0.6, depth - 1); }
    };
    branch(new THREE.Matrix4().makeTranslation(30.2, -0.1, 2.4), 2.6, 0.24, 4); addCol(29.98, 30.42, 2.18, 2.62, 0, 2.6);
  }

  // Room G — cimetière: rows of graves, a crypt with the last-chance perk, two lanterns, open graves, a dead tree
  {
    const r = mulberry32(2024), stoneM = 'concrete';
    const grave = (x, z, kind, rot) => {
      const parts = [], h = 0.7 + r() * 0.5, w = 0.5 + r() * 0.2;
      if (kind === 0) parts.push(RB(w, h, 0.14, 0.05, 0, h / 2, 0), new THREE.CylinderGeometry(w / 2, w / 2, 0.14, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).rotateZ(-Math.PI / 2).translate(0, h, 0));
      else if (kind === 1) parts.push(RB(0.12, 1.1, 0.12, 0.02, 0, 0.55, 0), RB(0.55, 0.12, 0.12, 0.02, 0, 0.82, 0));
      else if (kind === 2) parts.push(RB(w, h * 0.55, 0.15, 0.03, 0, h * 0.27, 0).rotateZ((r() - 0.5) * 0.4));
      else parts.push(RB(0.36, 0.25, 0.36, 0.03, 0, 0.12, 0), new THREE.CylinderGeometry(0.04, 0.15, 1.3, 4).rotateY(Math.PI / 4).translate(0, 0.9, 0));
      parts.push(RB(w + 0.2, 0.08, 0.5, 0.02, 0, 0.04, 0.2));
      const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)));
      g.rotateZ((r() - 0.5) * 0.12); g.rotateY(rot + (r() - 0.5) * 0.25); g.translate(x, 0, z); geo[stoneM].push(worldUV(g, 1.4));
      addCol(x - 0.32, x + 0.32, z - 0.15, z + 0.15, 0, 1.0);
    };
    for (const row of [9.5, 12.5]) for (let x = 18.5; x < 32; x += 2.2) { if (Math.abs(x - 26) < 1.6) continue; grave(x + (r() - 0.5) * 0.4, row + (r() - 0.5) * 0.3, (r() * 4) | 0, 0); }
    for (const x of [18.5, 31.5]) for (let z = 15.5; z < 22.5; z += 2.4) grave(x, z, (r() * 4) | 0, Math.PI / 2 * (x < 25 ? 1 : -1));
    // open graves: a dark pit with a dirt mound beside it
    for (const [x, z] of [[21.3, 15.5], [29.8, 15.2]]) { geo.roof.push(boxG(x - 0.45, x + 0.45, 0.005, 0.02, z - 1.0, z + 1.0)); geo.dirt.push(worldUV(new THREE.SphereGeometry(0.75, 14, 8, 0, 6.3, 0, Math.PI / 2).scale(0.7, 0.45, 1.3).translate(x + 0.95, 0, z), 1.2)); addCol(x - 0.5, x + 1.5, z - 1.0, z + 1.0, 0, 0.4); }
    // crypt: stone box with a pillared porch facing the yard door
    const cx0 = 23, cx1 = 29, cz0 = 17.5, cz1 = 21.5, ch = 3.0;
    solid(geo.concrete, cx0, cx1, 0, ch, cz1 - 0.3, cz1, 2.4); solid(geo.concrete, cx0, cx0 + 0.3, 0, ch, cz0, cz1, 2.4); solid(geo.concrete, cx1 - 0.3, cx1, 0, ch, cz0, cz1, 2.4);
    solid(geo.concrete, cx0, 25.3, 0, ch, cz0, cz0 + 0.3, 2.4); solid(geo.concrete, 26.7, cx1, 0, ch, cz0, cz0 + 0.3, 2.4); geo.concrete.push(boxG(25.3, 26.7, 2.4, ch, cz0, cz0 + 0.3, 2.4));
    geo.concrete.push(boxG(cx0 - 0.3, cx1 + 0.3, ch, ch + 0.25, cz0 - 1.4, cz1 + 0.3, 2.4), worldUV(new THREE.CylinderGeometry(0.01, 3.6, 0.9, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 0.75).translate(26, ch + 0.7, 19.0), 2.4));
    for (const x of [23.6, 28.4]) solid(geo.concrete, x - 0.22, x + 0.22, 0, ch, cz0 - 1.3, cz0 - 0.86, 2.4);
    geo.concrete.push(boxG(cx0 - 0.4, cx1 + 0.4, 0, 0.12, cz0 - 1.6, cz0, 2), boxG(cx0, cx1, 0, 0.06, cz0, cz1, 2));
    W.later = W.later || []; W.later.push(() => lamp(26, 20.2, 7, 0xff9a50, 0.6, 0.3, 2.95)); // candle-lit lantern inside the crypt
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.32), new THREE.MeshStandardMaterial({ map: labelTex([{ text: 'FAMILLE DUVAL', size: 66, y: 64, color: '#2b2a26', font: "'Stardos Stencil','Impact',serif" }], { w: 512, h: 128 }), transparent: true, roughness: 1 }));
    plaque.position.set(26, 2.68, cz0 - 0.005); plaque.rotation.y = Math.PI; scene.add(plaque);
    // lanterns on iron posts
    for (const [x, z] of [[24.5, 7.4], [27.5, 7.4], [17.3, 22.6]]) {
      geo.iron.push(boxG(x - 0.04, x + 0.04, 0, 2.3, z - 0.04, z + 0.04), boxG(x - 0.13, x + 0.13, 2.3, 2.34, z - 0.13, z + 0.13), boxG(x - 0.11, x + 0.11, 2.62, 2.66, z - 0.11, z + 0.11));
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) geo.iron.push(boxG(x + sx * 0.11 - 0.012, x + sx * 0.11 + 0.012, 2.34, 2.62, z + sz * 0.11 - 0.012, z + sz * 0.11 + 0.012));
      addCol(x - 0.08, x + 0.08, z - 0.08, z + 0.08, 0, 2.3);
      W.later = W.later || []; W.later.push(() => lamp(x, z, 9, 0xffb460, 0.35, 0.02, 2.6));
    }
    // gnarled tree by the north wall
    { const branch = (m, len, rad, depth) => { const g = new THREE.CylinderGeometry(rad * 0.6, rad, len, 7, 1); g.translate(0, len / 2, 0); g.applyMatrix4(m); geo.bark.push(g); if (depth <= 0) return; for (let i = 0; i < 2 + (depth < 3 ? 1 : 0); i++) { const c = new THREE.Matrix4().makeTranslation(0, len * (0.55 + r() * 0.45), 0); c.multiply(new THREE.Matrix4().makeRotationY(r() * 6.28)).multiply(new THREE.Matrix4().makeRotationZ(0.45 + r() * 0.55)); branch(m.clone().multiply(c), len * 0.68, rad * 0.62, depth - 1); } };
      branch(new THREE.Matrix4().makeTranslation(31.4, -0.1, 22.4), 3.2, 0.3, 5); addCol(31.15, 31.65, 22.15, 22.65, 0, 3); }
  }

  // ---------- merge static geometry ----------
  for (const k in geo) {
    if (!geo[k].length) continue;
    const m = new THREE.Mesh(mergeGeometries(geo[k].map((g) => (g.index ? g.toNonIndexed() : g))), M[k]);
    m.castShadow = k !== 'ceil' && k !== 'floorWood' && k !== 'dirt'; m.receiveShadow = k !== 'roof'; m.matrixAutoUpdate = false;
    scene.add(m);
  }

  // ---------- outside ----------
  const ground = new THREE.Mesh(worldUV(new THREE.PlaneGeometry(320, 320).rotateX(-Math.PI / 2), 5), M.grass);
  ground.position.set(CENTER.x, -0.03, CENTER.z); ground.receiveShadow = true; scene.add(ground);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 16), new THREE.MeshBasicMaterial({ map: G.tex.sky, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(sky); W.sky = sky;
  const moonDir = new THREE.Vector3(-0.55, 0.62, 0.56).normalize();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(2.2, 2.5, 3), fog: false, depthWrite: false }));
  moon.position.copy(moonDir).multiplyScalar(170); moon.scale.setScalar(26); sky.add(moon);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.3, 3.2), fog: false }));
  disc.position.copy(moonDir).multiplyScalar(168); disc.lookAt(0, 0, 0); sky.add(disc);
  {
    const r = mulberry32(42), parts = [];
    const branch = (m, len, rad, depth) => {
      const g = new THREE.CylinderGeometry(rad * 0.62, rad, len, depth > 1 ? 7 : 5, 1); g.translate(0, len / 2, 0); g.applyMatrix4(m); parts.push(g);
      if (depth <= 0) return;
      const n = depth > 2 ? 2 : 2 + (r() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const c = new THREE.Matrix4().makeTranslation(0, len * (0.55 + r() * 0.45), 0);
        c.multiply(new THREE.Matrix4().makeRotationY(r() * 6.28)).multiply(new THREE.Matrix4().makeRotationZ(0.35 + r() * 0.6));
        branch(m.clone().multiply(c), len * (0.6 + r() * 0.2), rad * 0.6, depth - 1);
      }
    };
    for (let i = 0; i < 110; i++) {
      const a = r() * 6.28, d = 46 + r() * 62, x = CENTER.x + Math.cos(a) * d, z = CENTER.z + Math.sin(a) * d, s = 0.8 + r() * 0.9;
      const m = new THREE.Matrix4().makeTranslation(x, -0.2, z).multiply(new THREE.Matrix4().makeRotationY(r() * 6.28)).multiply(new THREE.Matrix4().makeRotationZ((r() - 0.5) * 0.16)).multiply(new THREE.Matrix4().makeScale(s, s, s));
      branch(m, 3.2 + r() * 1.6, 0.26, 4);
    }
    const trees = new THREE.Mesh(mergeGeometries(parts.map((g) => g.toNonIndexed())), M.bark); trees.matrixAutoUpdate = false; scene.add(trees);
    const rocks = [];
    for (let i = 0; i < 80; i++) {
      const a = r() * 6.28, d = 24 + r() * 40, x = CENTER.x + Math.cos(a) * d, z = CENTER.z + Math.sin(a) * d, g = new THREE.IcosahedronGeometry(0.35 + r() * 0.7, 1), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) p.setXYZ(k, p.getX(k) * (0.8 + hashv(p.getX(k), p.getY(k), p.getZ(k)) * 0.5), p.getY(k) * 0.6, p.getZ(k) * (0.8 + hashv(p.getZ(k), p.getX(k), p.getY(k)) * 0.5));
      g.computeVertexNormals(); g.translate(x, 0.05, z);
      if (inBuilding(x, z, 2.5)) continue;
      rocks.push(g);
    }
    const rk = new THREE.Mesh(mergeGeometries(rocks), new THREE.MeshStandardMaterial({ color: 0x3a3c3e, roughness: 1, map: G.tex.concrete })); rk.receiveShadow = true; rk.castShadow = true; rk.matrixAutoUpdate = false; scene.add(rk);
  }

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0x5a6f96, 0x1c1814, 0.5); scene.add(hemi); W.hemi = hemi;
  const sun = new THREE.DirectionalLight(0x9db6e8, 3.4);
  sun.position.copy(moonDir).multiplyScalar(90).add(new THREE.Vector3(CENTER.x, 0, CENTER.z)); sun.target.position.set(CENTER.x, 0, CENTER.z); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -46, right: 46, top: 46, bottom: -46, near: 5, far: 200 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.07;
  W.sun = sun;

  const shadeProfile = [[0.025, 0.0], [0.05, -0.02], [0.2, -0.13], [0.235, -0.135]].map(([x, y]) => new THREE.Vector2(x, y));
  const shadeGeo = new THREE.LatheGeometry(shadeProfile, 20), bulbGeo = new THREE.SphereGeometry(0.042, 12, 8), cordGeo = new THREE.CylinderGeometry(0.008, 0.008, 1, 5);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x20302a, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide });
  function lamp(x, z, intensity, color = 0xffc48c, flicker = 0, drop = 0.75, top = H - 0.24) {
    const g = new THREE.Group(); g.position.set(x, top, z);
    const cord = new THREE.Mesh(cordGeo, M.iron); cord.scale.y = drop; cord.position.y = -drop / 2; g.add(cord);
    const sh = new THREE.Mesh(shadeGeo, shadeMat); sh.position.y = -drop; g.add(sh);
    const b = new THREE.Mesh(bulbGeo, M.bulb); b.position.y = -drop - 0.13; g.add(b);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(color).multiplyScalar(0.9), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.setScalar(1.3); halo.position.y = -drop - 0.13; g.add(halo);
    const l = new THREE.PointLight(color, intensity, 16, 1.7); l.position.y = -drop - 0.22; g.add(l);
    scene.add(g);
    W.lamps.push({ g, l, halo, base: intensity, flicker, t: rand(10), k: 1 });
  }
  lamp(-2, 0.2, 22); lamp(10.2, -1.2, 22, 0xffd8ae, 1);
  lamp(-3, -10, 20); lamp(11.5, -10.4, 20, 0xffbc84, 0.4);
  lamp(-2, -19.5, 20, 0xffc890, 0.5); lamp(10.5, -20, 22, 0xffb878); lamp(26, -20, 22, 0xffb878, 0.7);
  // bracket lamp on the barn wall, lighting the yard
  { const br = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.9), M.iron); br.position.set(22, 3.0, -13.45); scene.add(br); lamp(22, -13.1, 16, 0xdfe6ff, 0.3, 0.35, 3.0); }
  // burning barrel
  function fireBarrel(x, z) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.9, 18, 1, true), new THREE.MeshStandardMaterial({ map: G.tex.metalRed, roughness: 0.7, metalness: 0.5, side: THREE.DoubleSide, color: 0x555555 })); g.position.set(x, 0.45, z); g.castShadow = true; scene.add(g);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(3, 1.3, 0.3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); core.position.set(x, 1.0, z); core.scale.set(1.1, 1.3, 1); scene.add(core);
    const l = new THREE.PointLight(0xff8a3c, 26, 17, 1.6); l.position.set(x, 1.45, z); scene.add(l);
    addCol(x - 0.28, x + 0.28, z - 0.28, z + 0.28, 0, 0.9);
    W.fires.push({ x, z, l, core, t: rand(10) });
  }
  fireBarrel(20.6, -1.2);
  for (const f of W.later || []) f();

  // fireplace in the common room: stone surround, chimney breast, a log fire that lights the room
  {
    const x0 = -7.85, z0 = -4.5, z1 = -2.5, fg = { concrete: [], roof: [], bark: [], woodDark: [], brass: [] }, st = 'concrete';
    fg[st].push(boxG(x0, -7.15, 0, 0.12, z0 + 0.1, z1 - 0.1, 1.2), boxG(x0, -7.45, 0.12, 1.1, z0 + 0.15, -4.0, 1.2), boxG(x0, -7.45, 0.12, 1.1, -3.0, z1 - 0.15, 1.2), boxG(x0, -7.3, 1.1, 1.24, z0, z1, 1.2), boxG(x0, -7.6, 1.24, H, -4.2, -2.8, 1.6));
    fg.roof.push(boxG(x0 - 0.01, -7.8, 0.12, 1.1, -4.0, -3.0));
    for (const [dz, ry] of [[-0.12, 0.3], [0.12, -0.25]]) fg.bark.push(new THREE.CylinderGeometry(0.07, 0.08, 0.7, 8).rotateX(Math.PI / 2).rotateY(ry).translate(-7.62, 0.2, -3.5 + dz));
    addCol(x0, -7.15, z0, z1, 0, 1.24);
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(3, 1.2, 0.3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); core.position.set(-7.6, 0.35, -3.5); core.scale.set(0.9, 0.7, 1); scene.add(core);
    const l = new THREE.PointLight(0xff8a3c, 18, 9, 1.6); l.position.set(-7.0, 0.7, -3.5); scene.add(l);
    W.fires.push({ x: -7.62, z: -3.5, y: 0.22, dz: 0.5, l, core, base: 18, t: rand(10) });
    // a clock and two candlesticks on the mantel
    fg.woodDark.push(boxG(-7.75, -7.45, 1.24, 1.6, -3.65, -3.35, 1));
    for (const dz of [-0.75, 0.75]) fg.brass.push(new THREE.CylinderGeometry(0.03, 0.05, 0.22, 10).translate(-7.6, 1.35, -3.5 + dz));
    const brassM = new THREE.MeshStandardMaterial({ color: 0x9a7030, metalness: 1, roughness: 0.35 });
    for (const k in fg) { const m = new THREE.Mesh(mergeGeometries(fg[k].map((g) => (g.index ? g.toNonIndexed() : g))), k === 'brass' ? brassM : M[k]); m.castShadow = k !== 'roof'; m.receiveShadow = true; scene.add(m); }
  }
  // old paintings hanging crooked: a dark landscape or a portrait in a heavy frame
  function painting(x, z, nx, nz, y, w, h, seed) {
    const c = cv(128, 160), g = c.getContext('2d'), r = mulberry32(seed), portrait = r() < 0.5;
    const sky = g.createLinearGradient(0, 0, 0, 160); sky.addColorStop(0, portrait ? '#1d1a14' : '#3a3a30'); sky.addColorStop(1, portrait ? '#0d0b08' : '#1a1810'); g.fillStyle = sky; g.fillRect(0, 0, 128, 160);
    if (portrait) { g.fillStyle = '#3a2c22'; g.beginPath(); g.ellipse(64, 70, 22, 28, 0, 0, 6.3); g.fill(); g.fillStyle = '#16120e'; g.beginPath(); g.ellipse(64, 150, 50, 45, 0, 0, 6.3); g.fill(); g.fillStyle = '#5a4532'; g.beginPath(); g.ellipse(64, 74, 16, 21, 0, 0, 6.3); g.fill(); }
    else { for (let k = 0; k < 3; k++) { g.fillStyle = ['#2a2a1e', '#1e2016', '#14150e'][k]; g.beginPath(); g.moveTo(0, 160); for (let px = 0; px <= 128; px += 8) g.lineTo(px, 80 + k * 22 + Math.sin(px * 0.05 + k * 2 + r() * 0.5) * 10); g.lineTo(128, 160); g.fill(); } g.fillStyle = 'rgba(220,200,150,0.5)'; g.beginPath(); g.arc(90, 40, 7, 0, 6.3); g.fill(); }
    g.fillStyle = 'rgba(30,20,10,0.35)'; for (let k = 0; k < 900; k++) g.fillRect(r() * 128, r() * 160, 1, 1);
    const grp = new THREE.Group(); grp.position.set(x + nx * (T / 2 + 0.03), y, z + nz * (T / 2 + 0.03)); grp.rotation.y = Math.atan2(nx, nz); grp.rotation.z = (r() - 0.5) * 0.12;
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: imgTex(c, { repeat: false }), roughness: 0.6 })); grp.add(canvas);
    const fw = 0.07, fm = new THREE.MeshStandardMaterial({ color: 0x5a4020, metalness: 0.6, roughness: 0.45 });
    for (const [px, py, sw, sh] of [[0, h / 2 + fw / 2, w + fw * 2, fw], [0, -h / 2 - fw / 2, w + fw * 2, fw], [w / 2 + fw / 2, 0, fw, h], [-w / 2 - fw / 2, 0, fw, h]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.04), fm); b.position.set(px, py, 0.01); grp.add(b); }
    scene.add(grp);
  }
  painting(-2.5, 6, 0, -1, 1.9, 0.7, 0.9, 1); painting(2.2, -6, 0, 1, 1.85, 0.6, 0.8, 2); painting(1, -14, 0, -1, 1.95, 0.55, 0.7, 3); painting(-8, -23.2, 1, 0, 2.3, 0.5, 0.65, 4); painting(-8, 3.6, 1, 0, 2.45, 0.45, 0.55, 5);

  // ---------- wall weapons ----------
  function wallBuy(id, x, z, nx, nz) {
    const def = WEAPONS[id], g = new THREE.Group();
    g.position.set(x + nx * 0.03, 1.42, z + nz * 0.03); g.rotation.y = Math.atan2(nx, nz);
    const board = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.62, 0.05, 2, 0.015), M.woodDark); board.receiveShadow = true; g.add(board);
    const gun = flattenGun(buildGunModel(id)); gun.position.set(def.wallOff ?? 0.1, 0.07, 0.08); gun.rotation.y = -Math.PI / 2; gun.scale.setScalar(def.wallScale ?? 1); g.add(gun);
    for (const sx of [-0.25, 0.3]) { const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 6), M.iron); peg.rotation.x = Math.PI / 2; peg.position.set(sx, -0.0, 0.06); g.add(peg); }
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), new THREE.MeshBasicMaterial({ map: labelTex([{ text: `${def.name.toUpperCase()}  ·  ${def.cost}`, size: 62, y: 50 }], { w: 512, h: 96 }), transparent: true, color: 0xb8ae96 }));
    tag.position.set(0, -0.21, 0.03); g.add(tag);
    scene.add(g);
    W.interactables.push({
      x: x + nx * 0.5, z: z + nz * 0.5, y: 1.4, r: 1.7,
      prompt: () => {
        const own = G.player.weapons.find((w) => w.id === id);
        if (own) { const cost = own.up ? def.cost * 2 : def.cost / 2; return own.reserve >= G.weapons.stat(own).maxReserve ? null : `<b>F</b> — Munitions ${def.name} <i>[${cost}]</i>`; }
        return `<b>F</b> — Acheter ${def.name} <i>[${def.cost}]</i>`;
      },
      use: () => {
        const own = G.player.weapons.find((w) => w.id === id);
        if (own) { if (own.reserve < G.weapons.stat(own).maxReserve && G.game.spend(own.up ? def.cost * 2 : def.cost / 2)) { own.reserve = G.weapons.stat(own).maxReserve; SND.pickup(); G.hud.ammo(); } }
        else if (G.game.spend(def.cost)) G.weapons.give(id);
      },
    });
  }
  wallBuy('smg', 3.85, 4.1, -1, 0); wallBuy('shotgun', 6.4, 1.85, 0, -1); wallBuy('rifle', 1.2, -6.15, 0, -1);
  wallBuy('carbine', 3.85, -17, -1, 0); wallBuy('drum', 18, -14.15, 0, -1); wallBuy('double', 16.15, 3.6, 1, 0);
  wallBuy('burst', 13, -13.85, 0, 1); wallBuy('autoshot', 19, -25.85, 0, 1); wallBuy('lever', 16.15, 12, 1, 0);

  // ---------- perk cabinets + armoury ----------
  W.powered = []; W.power = false; W.powerK = 0.5;
  function cabinet(P, x, z, nx, nz, prompt, use) {
    const g = new THREE.Group(); g.position.set(x + nx * 0.27, 0, z + nz * 0.27); g.rotation.y = Math.atan2(nx, nz);
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.86, 1.95, 0.5, 3, 0.03), new THREE.MeshStandardMaterial({ map: G.tex[P.metal], roughness: 0.5, metalness: 0.6 })); body.position.y = 0.975; body.castShadow = true; body.receiveShadow = true; g.add(body);
    const tex = labelTex([{ text: P.icon, size: 150, y: 150, color: P.color, font: 'serif' }, { text: P.name.toUpperCase(), size: 50, y: 300, color: '#f1e6c8' }, { text: P.desc, size: 26, y: 360, color: '#cfc4a6', font: "'Special Elite','Courier New',monospace" }, { text: String(P.cost), size: 64, y: 448, color: P.color }], { w: 384, h: 512, bg: '#0c0d0e' });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.88), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 1.25, roughness: 0.95 }));
    panel.position.set(0, 1.3, 0.252); g.add(panel);
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.3, 0.06, 2, 0.02), M.iron); slot.position.set(0, 0.5, 0.24); g.add(slot);
    const top = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(P.color).multiplyScalar(1.6), blending: THREE.AdditiveBlending, depthWrite: false })); top.scale.setScalar(0.9); top.position.set(0, 2.02, 0.2); g.add(top);
    scene.add(g);
    const hx = Math.abs(nx) > 0.5 ? 0.3 : 0.45, hz = Math.abs(nz) > 0.5 ? 0.3 : 0.45;
    addCol(g.position.x - hx, g.position.x + hx, g.position.z - hz, g.position.z + hz, 0, 1.95);
    W.powered.push({ panel, top });
    const noPower = '<b>⚡</b> Pas de courant — rétablissez-le au groupe électrogène de la grange';
    W.interactables.push({ x: g.position.x + nx * 0.5, z: g.position.z + nz * 0.5, y: 1.3, r: 1.6, prompt: () => (W.power ? prompt() : noPower), use: () => { if (W.power) use(); else SND.deny(); } });
  }
  const perkCab = (perk, x, z, nx, nz) => { const P = PERKS[perk]; cabinet(P, x, z, nx, nz, () => (G.player.perks.has(perk) ? null : `<b>F</b> — ${P.name} : ${P.desc} <i>[${P.cost}]</i>`), () => { if (!G.player.perks.has(perk) && G.game.spend(P.cost)) G.game.addPerk(perk); }); };
  perkCab('vigueur', -6, -5.85, 0, 1); perkCab('mains', 8.0, 1.85, 0, -1); perkCab('souffle', 3.85, -23.6, -1, 0); perkCab('tir', 30, -13.85, 0, 1);
  perkCab('cadence', 7, -13.85, 0, 1); perkCab('mule', -0.4, -25.85, 0, 1); perkCab('chance', 26, 21.15, 0, -1);
  cabinet(FORGE, 28, -25.85, 0, 1,
    () => { const w = G.player.weapons[G.player.cur]; return w.up ? null : `<b>F</b> — Armurerie : améliorer ${WEAPONS[w.id].name} <i>[${FORGE.cost}]</i>`; },
    () => { const w = G.player.weapons[G.player.cur]; if (!w.up && G.game.spend(FORGE.cost)) { G.weapons.upgrade(); SND.perk(); G.hud.message(G.weapons.stat(w).name, 'Dégâts doublés, chargeur agrandi', 2.8); } });

  cabinet(PROTO, 30, -14.15, 0, -1,
    () => (G.player.weapons.some((w) => w.id === 'orage') ? null : `<b>F</b> — Prototype : Tisseur d'orage, l'éclair saute de zombie en zombie <i>[${PROTO.cost}]</i>`),
    () => { if (!G.player.weapons.some((w) => w.id === 'orage') && G.game.spend(PROTO.cost)) { G.weapons.give('orage'); SND.zap(false); G.hud.message("Tisseur d'orage", "L'éclair saute de zombie en zombie", 3); } });

  // ---------- generator: big lever on the barn's south wall
  {
    const g = new THREE.Group(); g.position.set(24, 0, -25.55); scene.add(g);
    const bodyM = new THREE.MeshStandardMaterial({ map: G.tex.metalGreen, roughness: 0.55, metalness: 0.6 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.1, 0.75, 3, 0.05), bodyM); body.position.set(0, 0.55, 0.1); body.castShadow = true; g.add(body);
    for (let i = 0; i < 6; i++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.7, 0.6), M.iron); fin.position.set(-0.55 + i * 0.08, 0.6, 0.12); g.add(fin); }
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 18).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ map: G.tex.metalRed, roughness: 0.5, metalness: 0.6 })); tank.position.set(0.2, 1.32, 0.0); g.add(tank);
    const panelBox = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.9, 0.18, 2, 0.02), M.metalGrey); panelBox.position.set(0.4, 1.75, -0.08); g.add(panelBox);
    const lamps = []; for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.2, 0.1) })); l.position.set(0.22 + i * 0.12, 2.05, 0.02); g.add(l); lamps.push(l); }
    for (let i = 0; i < 2; i++) { const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8cfb4, roughness: 0.5 })); dial.position.set(0.28 + i * 0.22, 1.82, 0.02); g.add(dial); }
    const leverP = new THREE.Group(); leverP.position.set(0.6, 1.55, 0.04); g.add(leverP); leverP.rotation.x = -0.9;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8), M.iron); arm.position.y = 0.18; leverP.add(arm);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8a1010, roughness: 0.4 })); knob.position.y = 0.37; leverP.add(knob);
    for (const dx of [-0.3, 0.0]) { const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 6), M.tire); cable.position.set(dx, 2.2, -0.2); g.add(cable); }
    addCol(23.2, 24.8, -26, -25.05, 0, 2.2);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshStandardMaterial({ map: labelTex([{ text: 'GROUPE ÉLECTROGÈNE', size: 52, y: 52, color: '#e2d6b4' }], { w: 512, h: 112 }), transparent: true, roughness: 1 })); sign.position.set(-0.35, 1.22, 0.48); g.add(sign);
    const glow = new THREE.PointLight(0xff3020, 2, 4, 1.5); glow.position.set(0.4, 2.0, 0.5); g.add(glow);
    W.gen = { leverP, lamps, glow, t: -1 };
    W.setPower = (on) => {
      W.power = on; W.powerK = on ? 1 : 0.5; if (!on) SND.powerOff(); W.gen.leverP.rotation.x = on ? 0.9 : -0.9; W.gen.t = -1;
      for (const l of W.gen.lamps) l.material.color.setRGB(on ? 0.2 : 2.5, on ? 2.6 : 0.2, on ? 0.4 : 0.1); W.gen.glow.color.setHex(on ? 0x40ff70 : 0xff3020);
      for (const c of W.powered) { c.panel.material.emissiveIntensity = on ? 1.25 : 0.05; c.top.visible = on; }
    };
    W.interactables.push({ x: 24, z: -24.6, y: 1.5, r: 1.8, prompt: () => (W.power ? null : '<b>F</b> — Rétablir le courant'),
      use: () => { if (W.power || W.gen.t >= 0) return; W.gen.t = 0; SND.power(); } });
  }

  // ---------- supply crate (random weapon) ----------
  {
    const g = new THREE.Group(); g.position.set(3.6, 0, -13.42);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 0.72), M.crate); base.position.y = 0.275; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const lidP = new THREE.Group(); lidP.position.set(0, 0.55, -0.36);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.08, 0.76), M.crate); lid.position.set(0, 0.04, 0.37); lid.castShadow = true; lidP.add(lid); g.add(lidP);
    const q = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.4), new THREE.MeshStandardMaterial({ map: labelTex([{ text: 'RAVITAILLEMENT', size: 54, y: 60, color: '#e2d6b4' }, { text: '?  950  ?', size: 80, y: 160, color: '#c9a23a' }], { w: 512, h: 224 }), transparent: true, roughness: 1 }));
    q.position.set(0, 0.28, 0.365); g.add(q);
    const light = { intensity: 0 };
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(2, 1.5, 0.5), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })); glow.scale.set(2.2, 1.4, 1); glow.position.set(0, 0.75, 0); g.add(glow);
    const holder = new THREE.Group(); holder.position.set(0, 0.5, 0); g.add(holder);
    const models = {};
    for (const id of BOX_POOL) { const m = flattenGun(buildGunModel(id)); m.rotation.y = -Math.PI / 2; m.position.x = (WEAPONS[id].wallOff ?? 0.1) - 0.05; m.scale.setScalar(WEAPONS[id].wallScale ?? 1); m.visible = false; holder.add(m); models[id] = m; }
    scene.add(g); addCol(2.75, 4.45, -13.8, -13.05, 0, 0.6);
    const box = (W.box = { g, lidP, light, glow, holder, models, state: 0, t: 0, pickId: null, shown: null });
    W.interactables.push({
      x: 3.6, z: -12.7, y: 0.9, r: 1.8,
      prompt: () => (box.state === 0 ? '<b>F</b> — Caisse de ravitaillement : arme au hasard <i>[950]</i>' : box.state === 2 ? `<b>F</b> — Prendre ${WEAPONS[box.pickId].name}` : null),
      use: () => {
        if (box.state === 0 && G.game.spend(950)) {
          box.state = 1; box.t = 0; SND.boxOpen();
          const owned = G.player.weapons.map((w) => w.id), pool = BOX_POOL.filter((id) => !owned.includes(id));
          const wts = pool.map((id) => (id === 'orage' ? 0.5 : 1)); let r = Math.random() * wts.reduce((a, b) => a + b, 0); box.pickId = pool[pool.length - 1]; for (let i = 0; i < pool.length; i++) { r -= wts[i]; if (r <= 0) { box.pickId = pool[i]; break; } }
          if (box.pickId === 'orage') SND.zap(false);
        } else if (box.state === 2) { G.weapons.give(box.pickId); box.state = 3; box.t = 0; }
      },
    });
  }

  // ---------- safe zone (test mode only): a green circle at the start where nothing can hurt the player ----------
  {
    const S = { x: -1.5, z: -1.0, r: 2.0 }, grp = new THREE.Group(); grp.position.set(S.x, 0, S.z);
    const col = new THREE.Color(0.35, 1.6, 0.95);
    const ring = new THREE.Mesh(new THREE.RingGeometry(S.r - 0.07, S.r, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    ring.position.y = 0.012;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(S.r, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.025, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    disc.position.y = 0.01;
    const c = cv(4, 64), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r, 0.6, 72, 1, true), new THREE.MeshBasicMaterial({ map: imgTex(c, { repeat: false }), color: col, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    wall.position.y = 0.3;
    grp.add(ring, disc, wall); grp.visible = false; scene.add(grp);
    W.safe = { ...S, group: grp, ring, wall, t: 0 };
  }

  // ---------- navigation grid ----------
  const blocked = new Uint8Array(NAV.w * NAV.h), dist = new Int16Array(NAV.w * NAV.h), queue = new Int32Array(NAV.w * NAV.h);
  W.nav = { ...NAV, blocked, dist };
  W.rebuildNav = () => {
    for (let j = 0; j < NAV.h; j++) for (let i = 0; i < NAV.w; i++) {
      const x = NAV.x0 + (i + 0.5) * NAV.cs, z = NAV.z0 + (j + 0.5) * NAV.cs;
      let b = roomAt(x, z) ? 0 : 1;
      // doorways sit on the wall line: allow them when their door is open
      if (b) for (const d of W.doors) if (d.open && Math.abs(x - d.x) < (d.axis === 'x' ? 0.3 : 0.5) && Math.abs(z - d.z) < (d.axis === 'x' ? 0.5 : 0.3)) b = 0;
      blocked[j * NAV.w + i] = b;
    }
    for (const c of W.colliders) { if (!c.on || !c.move) continue;
      const i0 = Math.max(0, Math.ceil((c.x0 - 0.3 - NAV.x0) / NAV.cs - 0.5)), i1 = Math.min(NAV.w - 1, Math.floor((c.x1 + 0.3 - NAV.x0) / NAV.cs - 0.5));
      const j0 = Math.max(0, Math.ceil((c.z0 - 0.3 - NAV.z0) / NAV.cs - 0.5)), j1 = Math.min(NAV.h - 1, Math.floor((c.z1 + 0.3 - NAV.z0) / NAV.cs - 0.5));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = NAV.x0 + (i + 0.5) * NAV.cs, z = NAV.z0 + (j + 0.5) * NAV.cs; if (x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3) blocked[j * NAV.w + i] = 1; } }
  };
  const cell = (x, z) => { const i = clamp(Math.floor((x - NAV.x0) / NAV.cs), 0, NAV.w - 1), j = clamp(Math.floor((z - NAV.z0) / NAV.cs), 0, NAV.h - 1); return j * NAV.w + i; };
  const nearestFree = (x, z) => {
    let c = cell(x, z); if (!blocked[c]) return c;
    const ci = c % NAV.w, cj = (c / NAV.w) | 0; let best = -1, bd = 1e9;
    for (let dj = -3; dj <= 3; dj++) for (let di = -3; di <= 3; di++) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= NAV.w || j >= NAV.h) continue; const k = j * NAV.w + i; if (blocked[k]) continue; const cx = NAV.x0 + (i + 0.5) * NAV.cs - x, cz = NAV.z0 + (j + 0.5) * NAV.cs - z, d = cx * cx + cz * cz; if (d < bd) { bd = d; best = k; } }
    return best;
  };
  W.flow = (px, pz) => {
    dist.fill(-1);
    const s = nearestFree(px, pz); if (s < 0) return;
    let qh = 0, qt = 0; queue[qt++] = s; dist[s] = 0;
    while (qh < qt) {
      const c = queue[qh++], i = c % NAV.w, j = (c / NAV.w) | 0, d = dist[c] + 1;
      if (i > 0 && !blocked[c - 1] && dist[c - 1] < 0) { dist[c - 1] = d; queue[qt++] = c - 1; }
      if (i < NAV.w - 1 && !blocked[c + 1] && dist[c + 1] < 0) { dist[c + 1] = d; queue[qt++] = c + 1; }
      if (j > 0 && !blocked[c - NAV.w] && dist[c - NAV.w] < 0) { dist[c - NAV.w] = d; queue[qt++] = c - NAV.w; }
      if (j < NAV.h - 1 && !blocked[c + NAV.w] && dist[c + NAV.w] < 0) { dist[c + NAV.w] = d; queue[qt++] = c + NAV.w; }
    }
  };
  // Returns the point a walker at (x,z) should head to in order to reach the flow target.
  const out = { x: 0, z: 0, ok: false };
  W.step = (x, z) => {
    const c = nearestFree(x, z); out.ok = false; if (c < 0 || dist[c] < 0) return out;
    const ci = c % NAV.w, cj = (c / NAV.w) | 0; let best = c, bd = dist[c] * 10;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= NAV.w || j >= NAV.h) continue;
      const k = j * NAV.w + i; if (blocked[k] || dist[k] < 0) continue;
      if (di && dj && (blocked[cj * NAV.w + i] || blocked[j * NAV.w + ci])) continue;
      const v = dist[k] * 10 + (di && dj ? 4 : 0); if (v < bd) { bd = v; best = k; }
    }
    out.x = NAV.x0 + ((best % NAV.w) + 0.5) * NAV.cs; out.z = NAV.z0 + (((best / NAV.w) | 0) + 0.5) * NAV.cs; out.ok = true;
    return out;
  };
  W.los = (x0, z0, x1, z1) => {
    const dx = x1 - x0, dz = z1 - z0, n = Math.ceil(Math.hypot(dx, dz) / 0.22);
    for (let k = 1; k < n; k++) { const t = k / n; if (blocked[cell(x0 + dx * t, z0 + dz * t)]) return false; }
    return true;
  };
  W.roomAt = roomAt; W.indoor = (x, z) => { const k = roomAt(x, z); return !!k && !ROOMS[k].outdoor; };

  // ---------- per-frame world animation ----------
  W.update = (dt) => {
    if (W.gen && W.gen.t >= 0) { // lever thrown: it swings down, the dials kick, then everything comes on
      W.gen.t += dt; W.gen.leverP.rotation.x = -0.9 + Math.min(1, W.gen.t / 0.35) * 1.8;
      if (W.gen.t > 0.9) { W.setPower(true); G.hud.message('Courant rétabli', 'Les machines sont en marche', 3); G.hud.flash(0.25); }
    }
    if (W.safe.group.visible) { W.safe.t += dt; const k = 0.5 + 0.5 * Math.sin(W.safe.t * 2.4); W.safe.wall.material.opacity = 0.1 + 0.08 * k; W.safe.ring.material.opacity = 0.65 + 0.35 * k; }
    for (const d of W.doors) if (d.open && d.t < 1) { d.t = Math.min(1, d.t + dt / 0.9); const e = 1 - Math.pow(1 - d.t, 3); d.pivot.rotation.y = d.target * e; }
    for (const w of W.windows) for (const p of w.planks) {
      if (p.mode === -1) { p.t += dt; const m = p.mesh; m.position.x += w.nx * dt * 2.2; m.position.z += w.nz * dt * 2.2; m.position.y -= dt * (0.5 + p.t * 6); m.rotation.x += dt * 5; m.rotation.z += dt * 3; if (p.t > 0.7) { m.visible = false; p.mode = 0; } }
      else if (p.mode === 1) { p.t = Math.min(1, p.t + dt / 0.22); const m = p.mesh, e = 1 - p.t; m.rotation.copy(p.rot); m.position.set(p.home.x + w.nx * e * 0.5, p.home.y + e * 0.1, p.home.z + w.nz * e * 0.5); if (p.t >= 1) p.mode = 0; }
    }
    for (const L of W.lamps) {
      L.t += dt; let k = 1;
      if (L.flicker) { const n = Math.sin(L.t * 13.7) * Math.sin(L.t * 7.3 + 1.3) * Math.sin(L.t * 2.1); k = n > 0.55 * (2 - L.flicker) ? 0.25 + Math.random() * 0.4 : 1 - 0.06 * Math.sin(L.t * 31); }
      L.k += (k - L.k) * Math.min(1, dt * 30); L.l.intensity = L.base * L.k * W.powerK; L.halo.material.opacity = 0.35 + 0.65 * L.k;
    }
    for (const f of W.fires) { f.t += dt; const k = 0.8 + 0.2 * Math.sin(f.t * 11) * Math.sin(f.t * 7.3) + 0.12 * Math.sin(f.t * 23); f.l.intensity = (f.base || 26) * k; f.core.scale.set(1.1 * k, 1.3 + 0.3 * Math.sin(f.t * 9), 1); if (G.fx && Math.random() < dt * 30) G.fx.flame(f.x + (f.dx || 0) * Math.random(), f.y ?? 0.95, f.z + (f.dz || 0) * (Math.random() - 0.5)); }
    const b = W.box;
    if (b.state === 1) { // opening + shuffle
      b.t += dt; b.lidP.rotation.x = -Math.min(1, b.t / 0.5) * 1.9; b.light.intensity = Math.min(1, b.t) * 9; b.glow.material.opacity = Math.min(1, b.t) * 0.45;
      b.holder.position.y = 0.5 + Math.min(1, b.t / 2.6) * 0.55;
      const ids = Object.keys(b.models), show = b.t > 2.9 ? b.pickId : ids[Math.floor(b.t * (9 - b.t * 2)) % ids.length];
      if (show !== b.shown) { for (const id of ids) b.models[id].visible = id === show; b.shown = show; if (b.t < 2.9) SND.tick(0.25); }
      if (b.t > 3.1) { b.state = 2; b.t = 0; SND.pickup(); }
    } else if (b.state === 2) { b.t += dt; b.holder.position.y = 1.05 - Math.max(0, b.t - 5) * 0.12; b.holder.rotation.y = Math.sin(b.t * 1.4) * 0.12; if (b.t > 9) { b.state = 3; b.t = 0; } }
    else if (b.state === 3) { b.t += dt; for (const id in b.models) b.models[id].visible = false; b.shown = null; b.lidP.rotation.x = -Math.max(0, 1 - b.t / 0.4) * 1.9; b.light.intensity = Math.max(0, 1 - b.t * 2.5) * 9; b.glow.material.opacity = Math.max(0, 1 - b.t * 2.5) * 0.45; if (b.t > 1.2) { b.state = 0; b.holder.rotation.y = 0; } }
  };

  W.reset = () => {
    W.setPower(false);
    for (const d of W.doors) { d.open = false; d.t = 0; d.col.on = true; d.pivot.rotation.y = 0; }
    for (const w of W.windows) { w.count = 5; w.busy = null; for (const p of w.planks) { p.on = true; p.mode = 0; p.mesh.visible = true; p.mesh.position.copy(p.home); p.mesh.rotation.copy(p.rot); } }
    const b = W.box; b.state = 0; b.t = 0; b.lidP.rotation.x = 0; b.light.intensity = 0; b.glow.material.opacity = 0; for (const id in b.models) b.models[id].visible = false; b.shown = null;
    W.refreshRooms(); W.rebuildNav();
  };
  W.refreshRooms(); W.rebuildNav();
  scene.updateMatrixWorld(true);
  scene.traverse((o) => { if (o.isMesh && o.matrixAutoUpdate === false) o.updateMatrix(); });
}

export const BOX_POOL = ['magnum', 'smg', 'drum', 'shotgun', 'double', 'carbine', 'rifle', 'sniper', 'lmg', 'launcher', 'flamer', 'burst', 'autoshot', 'orage', 'crossbow', 'lever'];
export const PROTO = { name: 'Prototype', desc: "Tisseur d'orage", cost: 7500, color: '#6fd3ff', icon: '⚡', metal: 'metalGrey' };
export const FORGE = { name: 'Armurerie', desc: 'Améliore l’arme en main', cost: 5000, color: '#b98cff', icon: '★', metal: 'metalGrey' };
export const PERKS = {
  vigueur: { name: 'Vigueur', desc: 'Santé doublée', cost: 2500, color: '#e0463a', icon: '✚', metal: 'metalRed' },
  mains: { name: 'Mains lestes', desc: 'Rechargement rapide', cost: 2000, color: '#58b7e6', icon: '⟳', metal: 'metalGrey' },
  souffle: { name: 'Second souffle', desc: 'Sprint prolongé', cost: 1500, color: '#e6c14a', icon: '➤', metal: 'metalGreen' },
  cadence: { name: 'Cadence', desc: 'Tir 35 % plus rapide', cost: 2000, color: '#ff6f3c', icon: '»', metal: 'metalRed' },
  chance: { name: 'Seconde chance', desc: 'Se relever une fois', cost: 1500, color: '#8fe07a', icon: '♥', metal: 'metalGreen' },
  mule: { name: 'Mule', desc: 'Porter une 3e arme', cost: 4000, color: '#c6a3ff', icon: '⦀', metal: 'metalGrey' },
  tir: { name: 'Poudre noire', desc: 'Dégâts des balles +35 %', cost: 3000, color: '#f08a3a', icon: '✦', metal: 'metalRed' },
};
function roomAt(x, z) { for (const k in ROOMS) { const r = ROOMS[k]; if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return k; } return null; }
function inBuilding(x, z, m = 0) { for (const k in ROOMS) { const r = ROOMS[k]; if (x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m) return true; } return false; }
function hashv(a, b, c) { const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return s - Math.floor(s); }
