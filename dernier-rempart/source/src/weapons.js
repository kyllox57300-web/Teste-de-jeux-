import * as THREE from 'three';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { G } from './ctx.js';
import { clamp, damp, lerp, rand, smooth } from './util.js';
import { aimBone, setWorldQuat } from './rig.js';
import { buildGunModel, gunMats, skinGun } from './guns.js';
import { graded } from './zskin.js';
import { cv, noiseCanvas } from './textures.js';
import * as SND from './audio.js';
export { buildGunModel, flattenGun } from './guns.js';

export const VM_SCALE = 0.12;
const ARM_SCALE = 0.9; // the source model has oversized hands for these weapons
export const WEAPONS = {
  pistol: { name: 'P-11', cost: 0, dmg: 34, head: 2.3, rpm: 420, auto: false, mag: 8, reserve: 48, maxReserve: 96, reload: 1.5, spread: 0.012, adsSpread: 0.0025, recoil: 0.03, pellets: 1, pen: 1, adsFov: 62, hip: [0.11, -0.1, -0.44], adsZ: -0.38, move: 1, snd: 'pistol' },
  magnum: { name: 'Notaire', cost: 0, dmg: 260, head: 2.5, rpm: 150, auto: false, mag: 6, reserve: 48, maxReserve: 72, reload: 2.6, spread: 0.008, adsSpread: 0.0015, recoil: 0.12, pellets: 1, pen: 3, adsFov: 58, hip: [0.11, -0.1, -0.44], adsZ: -0.4, move: 1, snd: 'magnum' },
  smg: { name: 'Vipère', cost: 1000, dmg: 30, head: 2, rpm: 780, auto: true, mag: 32, reserve: 160, maxReserve: 224, reload: 2.0, spread: 0.022, adsSpread: 0.007, recoil: 0.013, pellets: 1, pen: 1, adsFov: 60, hip: [0.12, -0.13, -0.36], adsZ: -0.3, move: 1, snd: 'smg', wallOff: 0.02 },
  drum: { name: 'Frelon', cost: 1500, dmg: 33, head: 2, rpm: 920, auto: true, mag: 71, reserve: 213, maxReserve: 284, reload: 3.0, spread: 0.026, adsSpread: 0.01, recoil: 0.012, pellets: 1, pen: 1, adsFov: 60, hip: [0.12, -0.13, -0.33], adsZ: -0.3, move: 0.97, snd: 'smg', wallOff: 0.05 },
  shotgun: { name: 'Bûcheron', cost: 1200, dmg: 40, head: 1.3, rpm: 70, auto: false, mag: 6, reserve: 36, maxReserve: 60, reload: 2.5, spread: 0.065, adsSpread: 0.045, recoil: 0.1, pellets: 8, pen: 1, adsFov: 62, hip: [0.12, -0.135, -0.32], adsZ: -0.32, move: 0.95, snd: 'shotgun', wallOff: 0.18, wallScale: 0.92, falloff: [5, 16] },
  double: { name: 'Faucheuse', cost: 1000, dmg: 48, head: 1.3, rpm: 260, auto: false, mag: 2, reserve: 40, maxReserve: 60, reload: 2.2, spread: 0.085, adsSpread: 0.07, recoil: 0.13, pellets: 10, pen: 1, adsFov: 64, hip: [0.12, -0.135, -0.36], adsZ: -0.34, move: 1, snd: 'shotgun', wallOff: 0.1, falloff: [4, 13] },
  carbine: { name: 'Sentinelle', cost: 1400, dmg: 100, head: 2.6, rpm: 330, auto: false, mag: 10, reserve: 80, maxReserve: 140, reload: 2.2, spread: 0.01, adsSpread: 0.0012, recoil: 0.045, pellets: 1, pen: 2, adsFov: 50, hip: [0.12, -0.135, -0.3], adsZ: -0.3, move: 0.95, snd: 'rifle', wallOff: 0.12, wallScale: 0.85 },
  rifle: { name: 'Garde-48', cost: 1800, dmg: 52, head: 2.3, rpm: 560, auto: true, mag: 30, reserve: 180, maxReserve: 270, reload: 2.3, spread: 0.016, adsSpread: 0.003, recoil: 0.02, pellets: 1, pen: 2, adsFov: 52, hip: [0.12, -0.135, -0.34], adsZ: -0.34, move: 0.95, snd: 'rifle', wallOff: 0.15, wallScale: 0.92 },
  sniper: { name: 'Longue-Vue', cost: 0, dmg: 450, head: 3, rpm: 46, auto: false, mag: 5, reserve: 35, maxReserve: 50, reload: 3.0, spread: 0.03, adsSpread: 0, recoil: 0.09, pellets: 1, pen: 5, adsFov: 16, hip: [0.12, -0.135, -0.3], adsZ: -0.2, move: 0.9, snd: 'magnum' },
  lmg: { name: 'Rempart', cost: 0, dmg: 60, head: 2, rpm: 620, auto: true, mag: 100, reserve: 300, maxReserve: 400, reload: 4.0, spread: 0.026, adsSpread: 0.008, recoil: 0.016, pellets: 1, pen: 3, adsFov: 56, hip: [0.13, -0.145, -0.32], adsZ: -0.32, move: 0.85, snd: 'lmg' },
  flamer: { name: 'Fournaise', cost: 0, dmg: 18, head: 1, rpm: 1200, auto: true, mag: 120, reserve: 240, maxReserve: 360, reload: 3.2, spread: 0, adsSpread: 0, recoil: 0.002, pellets: 1, pen: 99, adsFov: 66, hip: [0.12, -0.135, -0.3], adsZ: -0.32, move: 0.9, snd: 'flame', flame: true, infinite: true, range: 7.5, wallOff: 0.12, wallScale: 0.85 },
  burst: { name: 'Faucon', cost: 1600, dmg: 64, head: 2.4, rpm: 950, auto: false, burst: 3, burstGap: 0.24, mag: 30, reserve: 180, maxReserve: 270, reload: 2.2, spread: 0.014, adsSpread: 0.0025, recoil: 0.018, pellets: 1, pen: 2, adsFov: 52, hip: [0.12, -0.135, -0.34], adsZ: -0.34, move: 0.97, snd: 'rifle', wallOff: 0.16, wallScale: 0.92 },
  autoshot: { name: 'Tempête', cost: 2000, dmg: 30, head: 1.3, rpm: 290, auto: true, mag: 20, reserve: 80, maxReserve: 120, reload: 3.1, spread: 0.075, adsSpread: 0.055, recoil: 0.07, pellets: 7, pen: 1, adsFov: 62, hip: [0.12, -0.135, -0.32], adsZ: -0.32, move: 0.93, snd: 'shotgun', wallOff: 0.12, wallScale: 0.9, falloff: [5, 15] },
  orage: { name: "Tisseur d'orage", cost: 0, dmg: 1800, head: 1, rpm: 110, auto: false, mag: 8, reserve: 40, maxReserve: 56, reload: 2.8, spread: 0, adsSpread: 0, recoil: 0.06, pellets: 1, pen: 1, adsFov: 60, hip: [0.12, -0.135, -0.36], adsZ: -0.34, move: 1, snd: 'zap', arc: true, chain: 6, special: true },
  crossbow: { name: 'Carreau', cost: 0, dmg: 520, head: 2, rpm: 60, auto: false, mag: 1, reserve: 30, maxReserve: 40, reload: 1.15, spread: 0.004, adsSpread: 0.0008, recoil: 0.05, pellets: 1, pen: 99, adsFov: 54, hip: [0.12, -0.135, -0.36], adsZ: -0.34, move: 1, snd: 'bow', bolt3d: true, wallOff: 0.1, wallScale: 0.85 },
  lever: { name: 'Cavalier', cost: 1300, dmg: 140, head: 2.5, rpm: 105, auto: false, mag: 8, reserve: 64, maxReserve: 96, reload: 2.6, spread: 0.009, adsSpread: 0.0015, recoil: 0.06, pellets: 1, pen: 2, adsFov: 54, hip: [0.12, -0.135, -0.34], adsZ: -0.34, move: 1, snd: 'rifle', wallOff: 0.14, wallScale: 0.88 },
  launcher: { name: 'Tonnerre', cost: 0, dmg: 1300, head: 1, rpm: 60, auto: false, mag: 1, reserve: 14, maxReserve: 20, reload: 1.9, spread: 0.004, adsSpread: 0.002, recoil: 0.13, pellets: 1, pen: 1, adsFov: 64, hip: [0.12, -0.135, -0.36], adsZ: -0.32, move: 0.92, snd: 'launcher', shell: true },
};
const UP = {};
for (const id in WEAPONS) { const d = WEAPONS[id]; UP[id] = { ...d, name: d.name + ' ★', chain: d.chain ? d.chain + 5 : undefined, dmg: d.dmg * 2.2, mag: id === 'launcher' ? 2 : Math.ceil(d.mag * 1.5), maxReserve: Math.ceil(d.maxReserve * 1.5), spread: d.spread * 0.8, pen: d.pen + 1 }; }
export const wstat = (w) => (w.up ? UP[w.id] : WEAPONS[w.id]);

// ---------------------------------------------------------------- hit scanning
const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _n = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _lo = [0, 0, 0], _hi = [0, 0, 0], _oo = [0, 0, 0], _dd = [0, 0, 0];
export function rayWorld(o, d, maxT = 200) {
  let best = maxT, nx = 0, ny = 0, nz = 0;
  if (d.y < -1e-5) { const t = -o.y / d.y; if (t > 0 && t < best) { best = t; nx = 0; ny = 1; nz = 0; } }
  if (d.y > 1e-5) { const t = (3.2 - o.y) / d.y, hx = o.x + d.x * t, hz = o.z + d.z * t; if (t > 0 && t < best && G.world.indoor(hx, hz)) { best = t; nx = 0; ny = -1; nz = 0; } }
  _oo[0] = o.x; _oo[1] = o.y; _oo[2] = o.z; _dd[0] = d.x; _dd[1] = d.y; _dd[2] = d.z;
  for (const c of G.world.colliders) {
    if (!c.on || !c.bullet) continue;
    let t0 = 0, t1 = best, ax = 0, sg = 0, miss = false;
    _lo[0] = c.x0; _lo[1] = c.y0; _lo[2] = c.z0; _hi[0] = c.x1; _hi[1] = c.y1; _hi[2] = c.z1;
    for (let a = 0; a < 3; a++) {
      if (Math.abs(_dd[a]) < 1e-8) { if (_oo[a] < _lo[a] || _oo[a] > _hi[a]) { miss = true; break; } continue; }
      let ta = (_lo[a] - _oo[a]) / _dd[a], tb = (_hi[a] - _oo[a]) / _dd[a], s = -1;
      if (ta > tb) { const q = ta; ta = tb; tb = q; s = 1; }
      if (ta > t0) { t0 = ta; ax = a; sg = s; }
      if (tb < t1) t1 = tb;
      if (t0 > t1) { miss = true; break; }
    }
    if (miss || t0 <= 0 || t0 >= best) continue;
    best = t0; nx = ax === 0 ? sg : 0; ny = ax === 1 ? sg : 0; nz = ax === 2 ? sg : 0;
  }
  return { t: best, nx, ny, nz, hit: best < maxT };
}

// ---------------------------------------------------------------- first-person arms (real skinned arms, two-bone IK)
const V = () => new THREE.Vector3();
const _u = V(), _tw = V(), _sl = V(), _a = V(), _b = V(), _c = V(), _t = V(), _f = V(), _nn = V(), _k = V(), _pole = V(), _q = new THREE.Quaternion(), _hq = new THREE.Quaternion(), _tq = new THREE.Quaternion(), _gq = new THREE.Quaternion(), _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _lw = new THREE.Vector3();
function limitWrist(f, hand, max) { const d = clamp(f.dot(hand), -1, 1), ang = Math.acos(d); if (ang <= max) return f; _lw.copy(f).addScaledVector(hand, -d); if (_lw.lengthSq() < 1e-8) return f; _lw.normalize(); return f.copy(hand).multiplyScalar(Math.cos(max)).addScaledVector(_lw, Math.sin(max)); }
let _armMats = null;
function ARM_MATS() {
  if (_armMats) return _armMats;
  let top = null, body = null; G.gltfM.scene.traverse((o) => { if (o.isMesh && o.material.name === 'Wolf3D_Outfit_Top') top = o.material; if (o.isMesh && o.material.name === 'Wolf3D_Body') body = o.material; });
  // plain wool battledress: olive base, fine twill, wear and grime (independent of the suit's UV layout)
  const jacket = cv(512); { const x = jacket.getContext('2d'); x.fillStyle = '#5e6443'; x.fillRect(0, 0, 512, 512);
    x.globalCompositeOperation = 'multiply'; x.drawImage(noiseCanvas(77, 512, 0.62, 1.08, 6), 0, 0); x.globalAlpha = 0.55; x.drawImage(noiseCanvas(78, 512, 0.7, 1.05, 24), 0, 0); x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over'; x.strokeStyle = 'rgba(30,32,20,0.18)'; x.lineWidth = 1; for (let i = -512; i < 512; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 512, 512); x.stroke(); }
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(noiseCanvas(79, 512, 0.55, 1.1, 2), 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  const skin = cv(512); { const x = skin.getContext('2d'); x.fillStyle = '#9c7258'; x.fillRect(0, 0, 512, 512);
    x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(noiseCanvas(5, 512, 0.72, 1.05, 4), 0, 0); x.globalAlpha = 0.5; x.drawImage(noiseCanvas(6, 512, 0.55, 1.05, 2), 0, 0);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    const r = (() => { let a = 91; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
    x.fillStyle = 'rgba(150,60,50,0.22)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(r() * 512, r() * 512, 6 + r() * 16, 4 + r() * 10, r() * 3, 0, 6.3); x.fill(); }
    x.strokeStyle = 'rgba(110,30,25,0.55)'; x.lineCap = 'round'; for (let i = 0; i < 26; i++) { const px = r() * 512, py = r() * 512, a = r() * 6.28, L = 8 + r() * 26; x.lineWidth = 1 + r() * 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
    x.fillStyle = 'rgba(40,32,24,0.3)'; for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(r() * 512, r() * 512, 2 + r() * 9, 0, 6.3); x.fill(); } }
  const T = (c) => { const t = new THREE.CanvasTexture(c); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = G.maxAniso; return t; };
  _armMats = {
    sleeve: new THREE.MeshStandardMaterial({ map: T(jacket), roughness: 0.95, envMap: G.scene.environment, envMapIntensity: 0.15, emissiveMap: T(jacket), emissive: new THREE.Color(0.06, 0.06, 0.05) }),
    skin: new THREE.MeshStandardMaterial({ map: T(skin), normalMap: body.normalMap, roughness: 0.62, envMap: G.scene.environment, envMapIntensity: 0.25, emissive: 0x140906 }),
  };
  return _armMats;
}
function twistOf(q, axis, out) { const d = q.x * axis.x + q.y * axis.y + q.z * axis.z; out.set(axis.x * d, axis.y * d, axis.z * d, q.w); const l = out.length(); if (l < 1e-6) out.identity(); else out.normalize(); return out; }
function makeArm(side, root, shoulder) {
  // the human model's arm: bare hand (skin) and jacket sleeve, everything else hidden
  const model = skClone(G.gltfM.scene), holder = new THREE.Group(); holder.add(model);
  const B = {}, keep = [];
  model.traverse((o) => {
    if (o.isSkinnedMesh) { if (o.name === 'Wolf3D_Body' || o.name === 'Wolf3D_Outfit_Top') keep.push(o); else o.visible = false; }
    if (o.isBone && o.name.includes(side)) B[o.name.replace('mixamorig', '').replace(':', '').replace(side, '')] = o;
  });
  const re = new RegExp(side + '(Arm|ForeArm|Hand)');
  for (const body of keep) {
    const geo = body.geometry.clone(), si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
    const okBone = body.skeleton.bones.map((b) => re.test(b.name)), vOk = new Uint8Array(si.count);
    for (let i = 0; i < si.count; i++) { let bw = -1, bi = 0; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } } vOk[i] = okBone[bi] ? 1 : 0; }
    const idx = geo.index ? geo.index.array : null, n = idx ? idx.length : si.count, out = [];
    for (let i = 0; i < n; i += 3) { const a = idx ? idx[i] : i, b2 = idx ? idx[i + 1] : i + 1, c = idx ? idx[i + 2] : i + 2; if (vOk[a] && vOk[b2] && vOk[c]) out.push(a, b2, c); }
    geo.setIndex(out); body.geometry = geo; body.frustumCulled = false; body.castShadow = false; body.receiveShadow = false;
    body.material = body.name === 'Wolf3D_Body' ? ARM_MATS().skin : ARM_MATS().sleeve;
  }
  // rest-pose measurements (holder is detached: world == model space)
  holder.updateMatrixWorld(true);
  const pos = (b) => new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
  const W = pos(B.Hand), F = pos(B.HandMiddle1).sub(W).normalize(), Sd = pos(B.HandIndex1).sub(pos(B.HandPinky1)).normalize();
  const N = side === 'Right' ? new THREE.Vector3().crossVectors(Sd, F) : new THREE.Vector3().crossVectors(F, Sd); N.normalize();
  const K = new THREE.Vector3().crossVectors(F, N).normalize(); N.crossVectors(K, F).normalize();
  const hq = B.Hand.getWorldQuaternion(new THREE.Quaternion()).invert();
  const localT = new THREE.Matrix4().makeBasis(F.clone().applyQuaternion(hq), N.clone().applyQuaternion(hq), K.clone().applyQuaternion(hq)).transpose();
  const fingers = [];
  for (const f of ['Index', 'Middle', 'Ring', 'Pinky', 'Thumb']) for (let j = 1; j <= 3; j++) {
    const b = B['Hand' + f + j]; if (!b) continue;
    const bq = b.getWorldQuaternion(new THREE.Quaternion()).invert();
    fingers.push({ b, rest: b.quaternion.clone(), axis: (f === 'Thumb' ? F.clone().multiplyScalar(side === 'Right' ? -1 : 1) : K.clone()).applyQuaternion(bq).normalize(), thumb: f === 'Thumb', j, f });
  }
  const shoulderLocal = pos(B.Arm).multiplyScalar(ARM_SCALE);
  holder.scale.setScalar(ARM_SCALE); holder.position.copy(shoulder).sub(shoulderLocal);
  root.add(holder);
  const rig = { holder, B, shoulderLocal, restArm: B.Arm.quaternion.clone(), restFore: B.ForeArm.quaternion.clone(), localT, fingers, len: pos(B.HandMiddle1).distanceTo(W) };
  rig.curl3 = (c1, c2, c3, th = 0.3) => { for (const f of fingers) { const k = f.thumb ? (f.j === 1 ? th : th * 0.85) : (f.j === 1 ? c1 : f.j === 2 ? c2 : c3) * (f.f === 'Pinky' ? 1.12 : f.f === 'Index' ? 0.92 : 1); _q.setFromAxisAngle(f.axis, k); f.b.quaternion.copy(f.rest).multiply(_q); } };
  rig.curl = (a, spread = 0) => { for (const f of fingers) { const k = f.thumb ? (f.j === 1 ? a * 0.35 : a * 0.3) : a * (f.j === 1 ? 0.95 : f.j === 2 ? 1.1 : 0.7) * (1 + spread * (f.f === 'Pinky' ? 0.25 : f.f === 'Index' ? -0.2 : 0)); _q.setFromAxisAngle(f.axis, k); f.b.quaternion.copy(f.rest).multiply(_q); } };
  // world-space solve: put the wrist on `target`, bend the elbow toward `pole`, face the hand along Fw / palm Nw
  const axisH = B.Hand.position.clone().normalize(), tw0 = twistOf(B.Hand.quaternion, axisH, new THREE.Quaternion()).invert();
  // `knuckle`: where the base of the middle finger sits. fDir / uDir: world directions of the forearm (elbow->wrist) and upper arm.
  rig.pose = (knuckle, Fw, Nw, fDir, uDir, th) => {
    B.Arm.quaternion.copy(rig.restArm); B.ForeArm.quaternion.copy(rig.restFore); holder.updateMatrixWorld(true);
    _a.setFromMatrixPosition(B.Arm.matrixWorld); _b.setFromMatrixPosition(B.ForeArm.matrixWorld); _c.setFromMatrixPosition(B.Hand.matrixWorld);
    const l1 = _a.distanceTo(_b), l2 = _b.distanceTo(_c);
    _sl.copy(knuckle).addScaledVector(Fw, -rig.len * VM_SCALE * ARM_SCALE).addScaledVector(fDir, -l2).addScaledVector(uDir, -l1);
    root.worldToLocal(_sl); holder.position.copy(_sl).sub(shoulderLocal); holder.updateMatrixWorld(true);
    aimBone(B.Arm, B.ForeArm, uDir); aimBone(B.ForeArm, B.Hand, fDir);
    _k.crossVectors(Fw, Nw).normalize(); _nn.crossVectors(_k, Fw).normalize();
    _m1.makeBasis(Fw, _nn, _k); _m2.multiplyMatrices(_m1, rig.localT); _hq.setFromRotationMatrix(_m2);
    setWorldQuat(B.Hand, _hq);
    // let the forearm take most of the wrist roll so the cuff does not wring
    twistOf(B.Hand.quaternion, axisH, _tq).multiply(tw0); _q.identity().slerp(_tq, 0.8);
    B.ForeArm.quaternion.multiply(_q); B.ForeArm.updateMatrixWorld(true); setWorldQuat(B.Hand, _hq);
    // thumb: laid along the weapon instead of sticking out (coefficients on finger direction / palm normal / knuckle axis)
    if (th && B.HandThumb1 && B.HandThumb2) {
      _a.copy(Fw).multiplyScalar(th[0]).addScaledVector(_nn, th[1]).addScaledVector(_k, th[2]).normalize(); aimBone(B.HandThumb1, B.HandThumb2, _a);
      if (B.HandThumb3) { _a.copy(Fw).multiplyScalar(th[3]).addScaledVector(_nn, th[4]).addScaledVector(_k, th[5]).normalize(); aimBone(B.HandThumb2, B.HandThumb3, _a); }
    }
  };
  return rig;
}

// ---------------------------------------------------------------- weapon controller
export function initWeapons() {
  const cam = G.camera, m = gunMats();
  const root = new THREE.Group(); root.scale.setScalar(VM_SCALE); cam.add(root);
  const vm = {};
  for (const id in WEAPONS) {
    const g = buildGunModel(id, true); g.visible = false; root.add(g);
    const info = g.userData, def = WEAPONS[id];
    def.adsPos = [0, -info.sightY, def.adsZ]; UP[id].adsPos = def.adsPos;
    info.magHome = info.mag ? info.mag.position.clone() : null;
    vm[id] = { g, info };
  }
  const armR = makeArm('Right', root, new THREE.Vector3(0.25, -0.3, 0.16)), armL = makeArm('Left', root, new THREE.Vector3(-0.2, -0.33, 0.06));

  // muzzle flash
  const flash = new THREE.Group(); root.add(flash); flash.visible = false;
  const fm = new THREE.MeshBasicMaterial({ map: G.tex.muzzle, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, color: new THREE.Color(2.2, 1.7, 1.1), opacity: 0.85, fog: false });
  const fq = new THREE.PlaneGeometry(1, 1), f0 = new THREE.Mesh(fq, fm), f1 = new THREE.Mesh(fq, fm), f2 = new THREE.Mesh(fq, fm);
  f1.rotation.y = Math.PI / 2; f1.position.z = -0.3; f2.rotation.set(0, Math.PI / 2, Math.PI / 2); f2.position.z = -0.3; flash.add(f0, f1, f2);
  const flashLight = new THREE.PointLight(0xffb060, 0, 16, 1.6); G.scene.add(flashLight);
  let boomT = 0;
  const shells = [], shellGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.015, 8).rotateX(Math.PI / 2);
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(shellGeo, m.brass); s.visible = false; root.add(s); shells.push({ m: s, v: V(), life: 0, w: V() }); }
  let shellI = 0;
  // thrown / launched explosives
  const projs = [], pg = new THREE.SphereGeometry(0.05, 10, 8), pmat = new THREE.MeshStandardMaterial({ color: 0x2b3a22, roughness: 0.6, metalness: 0.4 });
  for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(pg, pmat); s.visible = false; s.castShadow = true; G.scene.add(s); projs.push({ m: s, v: V(), on: false, fuse: 0, shell: false, up: false }); }

  const S = {
    root, vm, cool: 0, reloadT: -1, reloadDur: 1, switchT: -1, switchTo: -1, ads: 0, flashT: 0, kick: 0, kickRot: 0, swayX: 0, swayY: 0, meleeT: -1, meleeHit: false,
    pumpT: -1, slideT: -1, burstLeft: 0, charge: 0, blueFlash: 0, flaming: 0, flameHitT: 0, sprintF: 0, bloom: 0, triggerHeld: false, drawT: 0, soundStage: 0, throwT: -1, scoped: false,
  };
  const pl = () => G.player, cur = () => pl().weapons[pl().cur], rateK = () => (pl().perks.has('cadence') ? 1.35 : 1);

  S.show = () => { const w = cur(); for (const id in vm) { vm[id].g.visible = !!w && id === w.id; if (vm[id].g.visible) skinGun(vm[id].g, !!w.up); } };
  S.reset = () => { S.burstLeft = 0; S.charge = 0; S.flaming = 0; SND.flameLoop(false); S.cool = 0; S.reloadT = -1; S.switchT = -1; S.ads = 0; S.meleeT = -1; S.pumpT = -1; S.flashT = 0; S.kick = 0; S.kickRot = 0; S.bloom = 0; S.drawT = 0.35; S.throwT = -1; flash.visible = false; flashLight.intensity = 0; for (const s of shells) s.m.visible = false; for (const q of projs) { q.on = false; q.m.visible = false; } for (const id in vm) if (vm[id].info.magHome) { vm[id].info.mag.position.copy(vm[id].info.magHome); } S.show(); };
  S.give = (id) => {
    const p = pl(), def = WEAPONS[id], own = p.weapons.find((w) => w.id === id);
    SND.buy();
    if (own) { own.mag = wstat(own).mag; own.reserve = wstat(own).maxReserve; G.hud.ammo(); return; }
    const w = { id, mag: def.mag, reserve: def.reserve, up: false, inf: !!def.infinite }; // the flamethrower never runs dry, in every mode
    if (p.weapons.length < (p.perks.has('mule') ? 3 : 2)) { p.weapons.push(w); p.cur = p.weapons.length - 1; } else p.weapons[p.cur] = w;
    S.reloadT = -1; S.switchT = -1; S.drawT = 0.4; S.cool = 0.35; S.show(); G.hud.weapon();
  };
  S.upgrade = () => { const w = cur(); w.up = true; w.mag = wstat(w).mag; w.reserve = wstat(w).maxReserve; S.reloadT = -1; S.drawT = 0.5; S.show(); G.hud.weapon(); };
  S.switchWeapon = (i) => { const p = pl(); if (S.switchT >= 0 || p.weapons.length < 2) return; if (i === undefined) i = (p.cur + 1) % p.weapons.length; if (i === p.cur || i >= p.weapons.length) return; S.switchT = 0; S.switchTo = i; S.reloadT = -1; SND.tick(0.5, 300); };
  S.reload = () => { const w = cur(), def = wstat(w); if (S.reloadT >= 0 || S.switchT >= 0 || w.mag >= def.mag || w.reserve <= 0) return; S.reloadT = 0; S.reloadDur = def.reload * (pl().perks.has('mains') ? 0.55 : 1); S.soundStage = 0; };
  S.melee = () => { if (S.meleeT >= 0 || S.switchT >= 0) return; S.meleeT = 0; S.meleeHit = false; S.reloadT = -1; SND.swing(); };
  S.maxAmmo = () => { for (const w of pl().weapons) w.reserve = wstat(w).maxReserve; pl().grenades = 4; };
  S.throwGrenade = () => {
    const p = pl(); if (p.grenades <= 0 || S.throwT >= 0 || S.switchT >= 0) return;
    p.grenades--; S.throwT = 0; SND.swing(); G.hud.ammo();
    cam.getWorldPosition(_o); _e.set(p.pitchOut + 0.12, p.yaw, 0); _d.set(0, 0, -1).applyEuler(_e);
    launch(_o.addScaledVector(_d, 0.4), _d.clone().multiplyScalar(13).add(_n.set(p.vx, 0, p.vz)), false, false);
  };
  function launch(pos, vel, shell, up) { const q = projs.find((x) => !x.on) || projs[0]; q.on = true; q.m.visible = true; q.m.position.copy(pos); q.v.copy(vel); q.fuse = shell ? 6 : 2.1; q.shell = shell; q.up = up; q.m.scale.setScalar(shell ? 0.7 : 1); }
  function explode(pos, up) {
    G.fx.explosion(pos); SND.boom(); boomT = 0.22; flashLight.position.copy(pos).setY(Math.max(0.9, pos.y)); { cam.getWorldPosition(_o); _d.subVectors(_o, flashLight.position).setY(0); if (_d.lengthSq() > 1e-4) flashLight.position.addScaledVector(_d.normalize(), 0.6); } flashLight.intensity = 140;
    const R = 5.2, Z = G.zombies, p = pl();
    for (const z of Z.list.slice()) { if (z.state === 'dead') continue; const d = Math.hypot(z.x - pos.x, z.z - pos.z, (z.y + 1) - pos.y); if (d < R) { _n.set(z.x - pos.x, 0.3, z.z - pos.z).normalize(); const res = Z.damage(z, (up ? 2600 : 1300) * Math.pow(1 - d / R, 0.9), false, _n, null, false); if (!res.killed && Math.random() < 0.7) Z.cripple(z); } }
    const dp = Math.hypot(p.x - pos.x, p.z - pos.z, (p.y + 1.2) - pos.y); p.shake = Math.max(p.shake, clamp(1.2 - dp / 12, 0, 1)); if (dp < 3.4) G.game.hurtAmount(60 * (1 - dp / 3.4));
  }
  S.explode = explode; S.stat = wstat; S.arms = { R: armR, L: armL };

  // flamethrower: a short-range cone that passes through crowds and sets zombies alight
  function flameTick(w, def) {
    const p = pl(); if (!w.inf) w.mag--; S.cool = 60 / def.rpm / rateK(); S.flaming = 0.12;
    cam.getWorldPosition(_o); _d.set(0, 0, -1).transformDirection(cam.matrixWorld);
    const wh = rayWorld(_o, _d, def.range), len = Math.max(0.6, wh.t - 0.12);
    const info = vm[w.id].info, mz = _p.set(...info.muzzle); vm[w.id].g.localToWorld(mz);
    if (!S.scoped) G.fx.flameJet(mz, _o, _d, len, !!w.up);
    const dmgMul = p.perks.has('tir') ? 1.35 : 1, burn = (w.up ? 110 : 50) * dmgMul; let any = false;
    for (const z of G.zombies.list) {
      if (z.state === 'dead' || z.y < -1.2) continue;
      _n.setFromMatrixPosition(z.bones.Spine2.matrixWorld).sub(_o);
      const t = _n.dot(_d); if (t < 0.15 || t > len + 0.6) continue;
      if (_n.addScaledVector(_d, -t).length() > 0.5 + t * 0.09) continue;
      G.zombies.damage(z, def.dmg * dmgMul, false, _d, null, false, burn); any = true;
    }
    if (any && G.time - S.flameHitT > 0.2) { S.flameHitT = G.time; G.hud.hit(false); }
    S.kickRot += def.recoil; p.recoil += def.recoil * 0.3;
    G.hud.ammo();
  }
  // storm weaver: a bolt to whatever is under the crosshair (generous aim), then it jumps zombie to zombie
  const _arcPts = [];
  function arcFire(w, def, info, mz) {
    const p = pl(); cam.getWorldPosition(_o); _d.set(0, 0, -1).transformDirection(cam.matrixWorld);
    const wh = rayWorld(_o, _d, 40); let first = null, best = 1e9;
    for (const z of G.zombies.list) {
      if (z.state === 'dead' || z.y < -1.2) continue;
      _n.setFromMatrixPosition(z.bones.Spine2.matrixWorld).sub(_o); const t = _n.dot(_d); if (t < 0.3 || t > Math.min(28, wh.t + 0.5)) continue;
      const off = _n.addScaledVector(_d, -t).length(); if (off > 0.6 + t * 0.06) continue; if (t + off * 4 < best) { best = t + off * 4; first = z; }
    }
    _arcPts.length = 0; _arcPts.push(mz.clone());
    if (!first) { const end = _o.clone().addScaledVector(_d, Math.min(wh.t, 18)); _arcPts.push(end); G.fx.arc(_arcPts, !!w.up); G.fx.sparks(end, 0.35, 0.8, 1.6, 10); return false; }
    const hit = new Set(); let cur = first, dmg = def.dmg * (p.perks.has('tir') ? 1.35 : 1), killed = 0;
    for (let n = 0; n < def.chain && cur; n++) {
      hit.add(cur); const at = new THREE.Vector3().setFromMatrixPosition(cur.bones.Spine2.matrixWorld); _arcPts.push(at);
      const prev = _arcPts[_arcPts.length - 2]; _n.subVectors(at, prev).normalize();
      cur.shock = 0.7; const res = G.zombies.damage(cur, dmg, false, _n, null, false); if (res.killed) killed++;
      G.fx.sparks(at, 0.4, 0.85, 1.7, 8);
      dmg *= 0.85; let next = null, nd = 7.5;
      for (const z of G.zombies.list) { if (z.state === 'dead' || hit.has(z) || z.y < -1.2) continue; const d = Math.hypot(z.x - cur.x, z.z - cur.z); if (d < nd) { nd = d; next = z; } }
      cur = next;
    }
    G.fx.arc(_arcPts, !!w.up); G.hud.hit(false); p.hits++;
    if (killed >= 3) G.hud.toast(`Chaîne ×${killed}`);
    return true;
  }
  function fire() {
    const p = pl(), w = cur(), def = wstat(w);
    if (def.flame) { flameTick(w, def); return; }
    if (def.arc) {
      if (!w.inf) w.mag--; S.cool = 60 / def.rpm / rateK(); p.shots++;
      const info = vm[w.id].info, mz = _p.set(...info.muzzle); vm[w.id].g.localToWorld(mz);
      arcFire(w, def, info, mz.clone()); SND.zap(!!w.up); S.charge = 1;
      S.kick = Math.min(1.8, S.kick + 1.0); S.kickRot += def.recoil; p.recoil += def.recoil;
      if (boomT <= 0) { flashLight.color.setRGB(0.45, 0.75, 1); flashLight.intensity = 70; S.blueFlash = 0.12; }
      G.hud.ammo(); return;
    }
    if (!w.inf) w.mag--; S.cool = 60 / def.rpm / rateK(); p.shots++;
    const spreadBase = lerp(def.spread, def.adsSpread, S.ads) * (1 + p.speed * 0.12) + S.bloom;
    S.bloom = Math.min(0.014, S.bloom + def.recoil * 0.1);
    cam.getWorldPosition(_o);
    const info = vm[w.id].info, mz = _p.set(...info.muzzle); vm[w.id].g.localToWorld(mz);
    let anyHit = false, headKill = false;
    const dmgMul = p.perks.has('tir') ? 1.35 : 1;
    if (def.shell) {
      _e.set(p.pitchOut + 0.04, p.yaw + p.recoilYaw, 0); _d.set(0, 0, -1).applyEuler(_e);
      launch(_o.clone().addScaledVector(_d, 0.5), _d.clone().multiplyScalar(30), true, !!w.up);
    } else for (let k = 0; k < def.pellets; k++) {
      const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * spreadBase;
      _e.set(p.pitchOut + Math.sin(a) * r, p.yaw + p.recoilYaw + Math.cos(a) * r, 0); _d.set(0, 0, -1).applyEuler(_e);
      const wh = rayWorld(_o, _d, 140), hits = G.zombies.raycast(_o, _d, wh.t);
      let end = wh.t, dmgK = dmgMul, n = 0;
      for (const h of hits) {
        if (n >= def.pen) { end = h.t; break; }
        let dmg = def.dmg * dmgK * (h.head ? def.head : 1);
        if (def.falloff) dmg *= clamp(1 - (h.t - def.falloff[0]) / (def.falloff[1] - def.falloff[0]), 0.2, 1);
        const res = G.zombies.damage(h.z, dmg, h.head, _d, _n.copy(_o).addScaledVector(_d, h.t));
        anyHit = true; if (res.killed && h.head) headKill = true;
        n++; dmgK *= 0.75; if (n >= def.pen) end = h.t;
      }
      const hp = _n.copy(_o).addScaledVector(_d, end);
      if (k < 3) G.fx.tracer(mz, hp, !!w.up);
      if (end >= wh.t - 1e-4 && wh.hit) { G.fx.impact(hp, wh.nx, wh.ny, wh.nz); if (k === 0 && wh.t < 25) SND.impact(hp.x, hp.z); }
    }
    if (anyHit) { p.hits++; G.hud.hit(headKill); }
    SND.shot(def.snd);
    G.fx.smoke(mz, def.pellets > 1 ? 4 : 2, def.pellets > 1 || def.recoil > 0.08 ? 1.6 : 1);
    const big = def.pellets > 1 || def.recoil > 0.08;
    S.kick = Math.min(1.8, S.kick + (big ? 1.4 : 0.6)); S.kickRot += def.recoil;
    p.recoil += def.recoil * lerp(1, 0.7, S.ads); p.recoilYaw += rand(-0.35, 0.35) * def.recoil;
    if (!def.shell) { S.flashT = 0.05; flash.visible = !S.scoped; flash.position.set(...info.muzzle).applyQuaternion(vm[w.id].g.quaternion).add(vm[w.id].g.position); flash.scale.setScalar((def.pellets > 1 ? 0.4 : 0.25) * rand(0.8, 1.25)); flash.quaternion.copy(vm[w.id].g.quaternion); flash.rotateZ(Math.random() * 6.283); if (boomT <= 0) flashLight.intensity = def.pellets > 1 ? 60 : 38; }
    if (info.pump || info.bolt || info.lever) S.pumpT = 0; if (info.slide) S.slideT = 0;
    if (info.eject && !info.bolt && !info.pump && !info.lever) eject(w.id);
    if (def.bolt3d) stickBolt(w, mz);
    G.hud.ammo();
  }
  const bolts = [], boltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.36, 6).rotateX(Math.PI / 2), fletch = new THREE.BoxGeometry(0.0015, 0.018, 0.05).translate(0, 0, 0.15);
  for (let i = 0; i < 18; i++) { const b = new THREE.Group(); b.add(new THREE.Mesh(boltGeo, m.wood), new THREE.Mesh(fletch, m.brass), new THREE.Mesh(fletch.clone().rotateZ(2.1), m.brass), new THREE.Mesh(fletch.clone().rotateZ(4.2), m.brass)); b.visible = false; G.scene.add(b); bolts.push({ g: b, boom: 0, up: false }); }
  let boltI = 0;
  function stickBolt(w, mz) {
    cam.getWorldPosition(_o); _d.set(0, 0, -1).transformDirection(cam.matrixWorld);
    const wh = rayWorld(_o, _d, 80), B = bolts[boltI++ % bolts.length], at = _o.clone().addScaledVector(_d, wh.t - 0.1);
    B.g.position.copy(at); B.g.lookAt(at.clone().sub(_d)); B.g.visible = wh.hit; B.up = !!w.up; B.boom = w.up && wh.hit ? 0.55 : 0;
    G.fx.tracer(mz, at, false);
  }
  S.updateBolts = (dt) => { for (const B of bolts) if (B.boom > 0) { B.boom -= dt; if (B.boom <= 0) { B.g.visible = false; explode(B.g.position.clone(), true); } } };
  function eject(id) { const info = vm[id].info; if (!info.eject) return; const s = shells[shellI++ % shells.length]; s.m.visible = true; s.m.position.set(...info.eject).applyQuaternion(vm[id].g.quaternion).add(vm[id].g.position); s.v.set(rand(0.9, 1.5), rand(0.7, 1.2), rand(-0.1, 0.25)); s.w.set(rand(-20, 20), rand(-20, 20), rand(-20, 20)); s.life = 0.7; SND.shell(id === 'shotgun' || id === 'double'); }

  const OFF_R = new THREE.Vector3(0.15, -0.2, 0.3), OFF_L = new THREE.Vector3(-0.2, -0.2, 0.3), OFF_RP = new THREE.Vector3(0.15, -0.37, 0.13), OFF_LP = new THREE.Vector3(-0.2, -0.37, 0.12);
  const TH_R = [0.8, 0.6, 0, 0.97, 0.05, -0.1], TH_L = [0.25, 0.9, -0.35, 0.35, 0.6, -0.6];
  const pos = V(), rot = new THREE.Euler(), FR = V(), NR = V(), FL = V(), NL = V(), tR = V(), tL = V();
  S.update = (dt, input, active) => {
    const p = pl(), w = cur(); if (!w) return;
    const def = wstat(w), Vm = vm[w.id], info = Vm.info;
    S.cool -= dt; S.bloom = Math.max(0, S.bloom - dt * 0.09);
    S.flaming = Math.max(0, S.flaming - dt); SND.flameLoop(S.flaming > 0 && active);
    if (info.pilot) info.pilot.scale.setScalar(0.035 + Math.random() * 0.022);
    if (info.coreGlow) { S.charge = Math.max(0, S.charge - dt * 2.5); const k = 0.08 + Math.random() * 0.03 + S.charge * 0.12; info.coreGlow.scale.set(k, k, 1); info.mag.material.emissiveIntensity = 1.2 + Math.sin(G.time * 9) * 0.3 + S.charge * 3 + (Math.random() < 0.05 ? 1.5 : 0); }
    if (S.blueFlash > 0) { S.blueFlash -= dt; if (S.blueFlash <= 0) flashLight.color.setHex(0xffb060); } S.drawT = Math.max(0, S.drawT - dt);
    const busy = S.switchT >= 0 || S.meleeT >= 0 || S.drawT > 0.12 || S.throwT >= 0;
    if (active) {
      const held = input.fire || input.firePressed, wantFire = held && (def.auto || !S.triggerHeld || input.firePressed);
      if (held && p.sprinting) p.sprintLock = 0.25;
      if (def.burst && wantFire && S.burstLeft <= 0 && S.cool <= 0 && !busy && S.reloadT < 0 && !p.sprinting && w.mag > 0) S.burstLeft = def.burst;
      if (S.burstLeft > 0 && S.cool <= 0 && !busy && S.reloadT < 0) { if (w.mag > 0) { fire(); S.burstLeft--; if (S.burstLeft <= 0) S.cool = def.burstGap / rateK(); } else S.burstLeft = 0; }
      else if (!def.burst && wantFire && S.cool <= 0 && !busy && S.reloadT < 0 && !p.sprinting) {
        if (w.mag > 0) fire(); else { if (!S.triggerHeld) SND.dry(); if (w.reserve > 0) S.reload(); }
      }
      S.triggerHeld = held;
      if (w.mag === 0 && w.reserve > 0 && S.reloadT < 0 && S.cool <= 0 && !busy) S.reload();
    }
    const wantAds = active && input.ads && S.reloadT < 0 && !busy && !p.sprinting && !(info.bolt && S.pumpT >= 0.15);
    S.ads = damp(S.ads, wantAds ? 1 : 0, info.scope ? 11 : 16, dt); p.ads = S.ads; p.adsFov = def.adsFov; p.moveMul = def.move * lerp(1, 0.55, S.ads);
    S.sprintF = damp(S.sprintF, p.sprinting ? 1 : 0, 10, dt);
    const scoped = !!info.scope && S.ads > 0.82; if (scoped !== S.scoped) { S.scoped = scoped; G.hud.scope(scoped); }
    // --- reload
    let rk = 0, magOff = 0;
    if (S.reloadT >= 0) {
      S.reloadT += dt; const q = S.reloadT / S.reloadDur;
      rk = smooth(clamp(q / 0.15, 0, 1)) * (1 - smooth(clamp((q - 0.82) / 0.18, 0, 1)));
      magOff = q < 0.2 ? 0 : q < 0.42 ? (q - 0.2) / 0.22 : q < 0.55 ? 1 : q < 0.78 ? 1 - (q - 0.55) / 0.23 : 0;
      if (S.soundStage === 0 && q > 0.2) { S.soundStage = 1; SND.reload(0); }
      if (S.soundStage === 1 && q > 0.72) { S.soundStage = 2; SND.reload(1); }
      if (S.soundStage === 2 && q > 0.9) { S.soundStage = 3; SND.reload(2); }
      if (q >= 1) { const need = def.mag - w.mag, take = Math.min(need, w.reserve); w.mag += take; w.reserve -= take; S.reloadT = -1; G.hud.ammo(); }
    }
    if (info.mag && info.magHome) {
      if (info.magSpin) { info.mag.rotation.z += dt * magOff * 14; info.mag.position.x = info.magHome.x - magOff * 0.03; }
      else if (info.clip) { info.mag.position.y = info.magHome.y + (1 - smooth(magOff)) * -0.03 + smooth(magOff) * 0.05; info.mag.visible = magOff > 0.05; }
      else if (info.shell) { info.mag.visible = magOff > 0.05; info.mag.position.z = info.magHome.z + (1 - magOff) * -0.1 + 0.12; info.mag.position.y = info.magHome.y + magOff * 0.02; }
      else { info.mag.position.y = info.magHome.y - smooth(magOff) * 0.13; info.mag.position.z = info.magHome.z + smooth(magOff) * 0.02; info.mag.visible = true; }
    }
    // --- switch / draw
    let sw = S.drawT > 0 ? S.drawT / 0.4 : 0;
    if (S.switchT >= 0) { S.switchT += dt; sw = Math.min(1, S.switchT / 0.28); if (S.switchT >= 0.28) { p.cur = S.switchTo; S.switchT = -1; S.drawT = 0.35; S.show(); G.hud.weapon(); sw = 1; } }
    if (S.throwT >= 0) { S.throwT += dt; sw = Math.max(sw, Math.sin(clamp(S.throwT / 0.55, 0, 1) * Math.PI) * 0.7); if (S.throwT > 0.55) S.throwT = -1; }
    // --- melee
    let mk = 0;
    if (S.meleeT >= 0) { S.meleeT += dt; const q = S.meleeT / 0.5; mk = Math.sin(clamp(q, 0, 1) * Math.PI); if (!S.meleeHit && q > 0.28) { S.meleeHit = true; G.game.meleeStrike(); } if (q >= 1) S.meleeT = -1; }
    // --- pose
    S.kick = damp(S.kick, 0, 14, dt); S.kickRot = damp(S.kickRot, 0, 12, dt);
    S.swayX = damp(S.swayX, clamp(-input.dx * 0.0012, -0.05, 0.05), 8, dt); S.swayY = damp(S.swayY, clamp(-input.dy * 0.0012, -0.05, 0.05), 8, dt);
    const a = S.ads, bobK = (1 - a * 0.88) * Math.min(1, p.speed / 4), ph = p.bob;
    pos.set(lerp(def.hip[0], def.adsPos[0], a), lerp(def.hip[1], def.adsPos[1], a), lerp(def.hip[2], def.adsPos[2], a));
    pos.x += Math.cos(ph) * 0.009 * bobK + S.swayX * 0.25; pos.y += -Math.abs(Math.sin(ph)) * 0.011 * bobK + S.swayY * 0.25 + Math.sin(G.time * 1.6) * 0.0018 * (1 - a) - p.vy * 0.004;
    pos.z += S.kick * 0.035 * (1 - a * 0.4);
    rot.set(S.kickRot * 1.6 * (1 - a * 0.5) + S.swayY, S.swayX * 1.4 + (info.fore ? 0 : 0.07 * (1 - a)), S.swayX * -0.8);
    const breakK = info.breakOpen || info.shell ? rk : 0;
    pos.y += rk * 0.03; pos.x -= rk * 0.04; pos.z -= rk * 0.04; rot.x += rk * 0.2 - breakK * 0.75; rot.z += rk * 0.36; rot.y += rk * 0.14;
    pos.y -= sw * 0.3; rot.x -= sw * 0.9;
    pos.y -= S.sprintF * 0.05; pos.x -= S.sprintF * 0.06; rot.y += S.sprintF * 0.85; rot.x -= S.sprintF * 0.25; rot.z += S.sprintF * 0.2;
    pos.z -= mk * 0.2; pos.x -= mk * 0.14; pos.y += mk * 0.04; rot.y += mk * 1.0; rot.z += mk * 0.5; rot.x += mk * 0.3;
    let pumpO = 0, boltK = 0;
    if (S.pumpT >= 0) {
      S.pumpT += dt; const dur = info.bolt ? 0.9 : info.lever ? 0.36 : 0.42, q = (S.pumpT - 0.18) / dur;
      if (q > 0) pumpO = Math.sin(clamp(q, 0, 1) * Math.PI);
      if (S.pumpT > 0.22 && S.pumpT - dt <= 0.22) SND.reload(2);
      if (q > 0.5 && (S.pumpT - dt - 0.18) / dur <= 0.5) { eject(w.id); if (info.bolt) SND.reload(1); }
      if (q >= 1) S.pumpT = -1;
    }
    if (info.bolt) { boltK = pumpO; rot.z += boltK * 0.22; rot.x += boltK * 0.1; pos.y -= boltK * 0.02; }
    Vm.g.position.copy(pos); Vm.g.rotation.copy(rot);
    if (info.pump) info.pump.position.z = pumpO * 0.09;
    if (info.lever) { info.lever.rotation.x = -pumpO * 0.95; rot.x += pumpO * 0.12; Vm.g.rotation.x = rot.x; }
    if (info.crossbow && info.mag) info.mag.visible = w.mag > 0 || (S.reloadT >= 0 && S.reloadT / S.reloadDur > 0.45);
    if (info.slide) { let o = 0; if (S.slideT >= 0) { S.slideT += dt; o = Math.sin(clamp(S.slideT / 0.09, 0, 1) * Math.PI); if (S.slideT > 0.09) S.slideT = -1; } info.slide.position.z = (w.mag === 0 && S.reloadT < 0 ? 0.03 : 0) + o * 0.035; }
    Vm.g.visible = !scoped; armR.holder.visible = !scoped; armL.holder.visible = !scoped && (!!info.fore || rk > 0.02);
    // --- hands
    if (!scoped) {
      root.updateMatrixWorld(true);
      const gm = Vm.g.matrixWorld; Vm.g.getWorldQuaternion(_gq);
      const gp = info.grip, long = !!info.fore;
      if (long) FR.set(0, -0.2, -1); else FR.set(-0.08, -0.08, -1);
      FR.normalize().applyQuaternion(_gq); NR.set(-1, 0, 0.12).normalize().applyQuaternion(_gq);
      tR.set(gp[0] + 0.026, gp[1] + 0.004, gp[2] - 0.022);
      if (info.bolt && boltK > 0) tR.set(0.062, 0.03, 0.03 + boltK * 0.07); // right hand works the bolt
      tR.applyMatrix4(gm);
      _f.set(long ? -0.18 : lerp(-0.22, -0.12, a), long ? 0.28 : lerp(0.3, 0.42, a), -0.93).normalize().transformDirection(cam.matrixWorld); limitWrist(_f, FR, long ? 0.5 : 0.4); _u.set(-0.28, 0.52, -0.8).normalize().transformDirection(cam.matrixWorld);
      armR.curl(1.15 - (info.bolt ? boltK * 0.5 : 0), 1); armR.pose(tR, FR, NR, _f, _u, TH_R);
      // left hand: handguard, magazine well or support grip; follows the magazine while reloading
      let lx, ly, lz;
      let style = 0;
      if (long && !info.foreMag) { const fb = info.foreB; FL.set(0.8, 0.12, -0.45); NL.set(-0.1, 1, 0); lx = fb[1] + 0.014; ly = fb[0] - 0.011; lz = info.fore[2] + (info.pump ? pumpO * 0.09 : 0); }
      else if (long) { style = 1; FL.set(0.1, -0.15, -0.98); NL.set(1, 0, 0.1); lx = info.fore[0] - 0.029; ly = info.fore[1] - 0.012; lz = info.fore[2] - 0.018; }
      else { style = 2; FL.set(0.25, 0.2, -1); NL.set(1, 0.3, 0.1); lx = gp[0] - 0.06; ly = gp[1] - 0.42; lz = gp[2] + 0.05; }
      if (rk > 0 && info.magHome) { const mh = info.magHome; lx = lerp(lx, mh.x - 0.03, rk); ly = lerp(ly, mh.y - 0.04 - smooth(magOff) * 0.13, rk); lz = lerp(lz, mh.z - 0.03, rk); FL.lerp(_c.set(0.25, 0.2, -1), rk); NL.lerp(_c.set(1, 0.3, 0.1), rk); }
      else if (rk > 0) { ly -= rk * 0.12 * Math.sin(magOff * Math.PI); lz += rk * 0.1; }
      if (S.throwT >= 0 || mk > 0) ly -= 0.25 * Math.max(mk, S.throwT >= 0 ? Math.sin(clamp(S.throwT / 0.55, 0, 1) * Math.PI) : 0);
      FL.normalize().applyQuaternion(_gq); NL.normalize().applyQuaternion(_gq);
      tL.set(lx, ly, lz).applyMatrix4(gm);
      if (long && !info.foreMag) _f.set(0.46, 0.36, -0.82); else if (long) _f.set(0.4, 0.32, -0.86); else _f.set(0.34, 0.55, -0.76);
      _f.normalize().transformDirection(cam.matrixWorld); limitWrist(_f, FL, 0.62); _u.set(0.5, 0.54, -0.68).normalize().transformDirection(cam.matrixWorld);
      if (rk > 0.5 && info.magHome) armL.curl3(1.0, 0.9, 0.6, 0.35); else if (style === 0) armL.curl3(1.42, 0.28, 0.32, 0.18); else if (style === 1) armL.curl3(1.1, 1.0, 0.7, 0.3); else armL.curl3(1.05, 0.75, 0.6, 0.25);
      armL.pose(tL, FL, NL, _f, _u, style === 0 && !(rk > 0.5 && info.magHome) ? TH_L : null);
    }
    if (S.flashT > 0) { S.flashT -= dt; if (S.flashT <= 0) flash.visible = false; }
    if (boomT > 0) { boomT -= dt; flashLight.intensity = damp(flashLight.intensity, 0, 14, dt); }
    else if (S.flaming > 0) { flashLight.intensity = 13 + Math.random() * 8; cam.getWorldPosition(flashLight.position); _d.set(0, -0.12, -1).normalize().transformDirection(cam.matrixWorld); flashLight.position.addScaledVector(_d, 2.6); }
    else { flashLight.intensity = damp(flashLight.intensity, 0, 30, dt); cam.getWorldPosition(flashLight.position); _d.set(0, 0, -1).transformDirection(cam.matrixWorld); { const h = rayWorld(flashLight.position, _d, 1.2); flashLight.position.addScaledVector(_d, Math.max(0.05, Math.min(0.7, h.t - 0.45))); const k = clamp((h.t - 0.3) / 1.2, 0.03, 1); flashLight.intensity = Math.min(flashLight.intensity, 60 * k * k); } }
    for (const s of shells) if (s.life > 0) { s.life -= dt; s.v.y -= 6 * dt; s.m.position.addScaledVector(s.v, dt); s.m.rotation.x += s.w.x * dt; s.m.rotation.y += s.w.y * dt; if (s.life <= 0) s.m.visible = false; }
    G.hud.spread(lerp(def.spread, def.adsSpread, a) * (1 + p.speed * 0.12) + S.bloom, a);
  };

  // explosives fly in world space, independent of the weapon in hand
  S.updateProjectiles = (dt) => {
    for (const q of projs) {
      if (!q.on) continue;
      q.fuse -= dt; q.v.y -= (q.shell ? 6 : 12) * dt;
      const sp = q.v.length(), step = sp * dt; _d.copy(q.v).multiplyScalar(1 / (sp || 1));
      const h = rayWorld(q.m.position, _d, step + 0.06);
      let boom = q.fuse <= 0;
      if (h.hit) {
        if (q.shell) { q.m.position.addScaledVector(_d, Math.max(0, h.t - 0.05)); boom = true; }
        else { q.m.position.addScaledVector(_d, Math.max(0, h.t - 0.06)); const vn = q.v.x * h.nx + q.v.y * h.ny + q.v.z * h.nz; q.v.x -= 2 * vn * h.nx; q.v.y -= 2 * vn * h.ny; q.v.z -= 2 * vn * h.nz; q.v.multiplyScalar(h.ny > 0.5 ? 0.45 : 0.5); if (h.ny > 0.5 && Math.abs(q.v.y) < 1) { q.v.y = 0; q.v.x *= 0.8; q.v.z *= 0.8; } if (sp > 2.5) SND.tick(0.25, 500); }
      } else q.m.position.addScaledVector(_d, step);
      if (q.shell && !boom) for (const z of G.zombies.list) { if (z.state === 'dead' || z.y < -1) continue; if (Math.hypot(z.x - q.m.position.x, z.z - q.m.position.z) < 0.55 && q.m.position.y < 2 * z.scale) { boom = true; break; } }
      if (q.m.position.y < 0.05) q.m.position.y = 0.05;
      if (boom) { q.on = false; q.m.visible = false; explode(q.m.position, q.up); }
    }
  };
  G.weapons = S;
  return S;
}
