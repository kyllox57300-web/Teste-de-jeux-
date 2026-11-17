// Turns the clean human characters into rotting ones by repainting their textures at load time.
import * as THREE from 'three';
import { G } from './ctx.js';
import { cv, noiseCanvas } from './textures.js';
import { mulberry32 } from './util.js';

const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); t.flipY = false; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = G.maxAniso; t.needsUpdate = true; return t; };
const NOISE = {};
const noise = (seed) => (NOISE[seed] ||= noiseCanvas(seed, 256, 0.45, 1.05, 3));

export function graded(img, size, { sat = 0.3, bright = 0.85, contrast = 1.1, tint = '#b5bfa2', dirt = 0.55, seed = 1 }) {
  const c = cv(size), x = c.getContext('2d');
  x.filter = `saturate(${sat}) brightness(${bright}) contrast(${contrast})`; x.drawImage(img, 0, 0, size, size); x.filter = 'none';
  x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, size, size);
  x.globalAlpha = dirt; x.drawImage(noise(seed), 0, 0, size, size); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  return c;
}
let SPLAT = null;
function splatIn(col) { const c = cv(256), x = c.getContext('2d'); x.drawImage(G.img.splat, 0, 0, 256, 256); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 256, 256); return c; }
function stamp(x, size, r, col, n, smin, smax, alpha, area = [0, 0, 1, 1], op = 'source-over') {
  SPLAT ||= {}; const sp = (SPLAT[col] ||= splatIn(col));
  x.save(); x.globalCompositeOperation = op;
  for (let k = 0; k < n; k++) {
    const s = (smin + r() * (smax - smin)) * size;
    x.save(); x.globalAlpha = alpha * (0.55 + r() * 0.45); x.translate((area[0] + r() * (area[2] - area[0])) * size, (area[1] + r() * (area[3] - area[1])) * size); x.rotate(r() * 6.28); x.scale(1, 0.6 + r() * 0.8); x.drawImage(sp, -s / 2, -s / 2, s, s); x.restore();
  }
  x.restore();
}
function drips(x, size, r, n, area, col = 'rgba(70,6,4,0.8)') {
  x.save(); x.strokeStyle = col; x.lineCap = 'round';
  for (let k = 0; k < n; k++) { let px = (area[0] + r() * (area[2] - area[0])) * size, py = (area[1] + r() * (area[3] - area[1])) * size; x.lineWidth = (0.004 + r() * 0.006) * size; x.beginPath(); x.moveTo(px, py); const L = (0.03 + r() * 0.09) * size; for (let s = 0; s < 6; s++) { px += (r() - 0.5) * 0.004 * size; py += L / 6; x.lineTo(px, py); } x.stroke(); }
  x.restore();
}
function veins(x, size, r, n, col = 'rgba(52,24,56,0.32)') {
  x.save(); x.strokeStyle = col; x.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    let px = r() * size, py = r() * size, a = r() * 6.28; x.lineWidth = (0.0015 + r() * 0.002) * size; x.beginPath(); x.moveTo(px, py);
    for (let s = 0; s < 14; s++) { a += (r() - 0.5) * 1.3; px += Math.cos(a) * 0.012 * size; py += Math.sin(a) * 0.012 * size; x.lineTo(px, py); if (r() < 0.15) { x.moveTo(px, py); } }
    x.stroke();
  }
  x.restore();
}
const imgOf = (m) => m && m.map && m.map.image;
// where each part of the suited man lives in his 2048 px atlas (x, y, w, h in pixels, top-left origin)
export const ATLAS = { Wolf3D_Skin: [0, 0, 1024, 1024], Wolf3D_Outfit_Top: [1024, 0, 1024, 1024], Wolf3D_Outfit_Bottom: [0, 1024, 1024, 1024], Wolf3D_Outfit_Footwear: [1024, 1024, 512, 512],
  Wolf3D_Body: [1536, 1024, 256, 256], Wolf3D_Eye: [1792, 1024, 128, 128], Wolf3D_Teeth: [1920, 1024, 128, 128], Wolf3D_Beard: [1536, 1280, 128, 128] };

const SHARED = {};
export function buildZombieSkins() {
  const out = { m: [], f: [] };
  // ---------- the man in the suit
  const mats = {}; G.gltfM.scene.traverse((o) => { if (o.isMesh) mats[o.material.name] = o.material; });
  const skinTints = ['#a9b597', '#b3ab92', '#9fae9f'];
  const suits = [{ tint: '#8a6f55', sat: 0.35 }, { tint: '#6f7a86', sat: 0.2 }, { tint: '#7d8460', sat: 0.3 }];
  for (let v = 0; v < 3; v++) {
    const r = mulberry32(100 + v * 17);
    // face and neck
    const head = graded(imgOf(mats.Wolf3D_Skin), 1024, { sat: 0.22, bright: 0.8, contrast: 1.18, tint: skinTints[v], dirt: 0.5, seed: 3 + v });
    { const x = head.getContext('2d');
      x.globalCompositeOperation = 'multiply';
      for (let k = 0; k < 9; k++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(90,60,90,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.save(); x.translate(r() * 1024, r() * 1024); x.scale(40 + r() * 90, 30 + r() * 70); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 6.3); x.fill(); x.restore(); }
      x.globalCompositeOperation = 'source-over';
      veins(x, 1024, r, 34);
      // sunken eyes and a bloody mouth (positions measured on this face texture)
      for (const ex of [0.4, 0.6]) { const g = x.createRadialGradient(ex * 1024, 0.29 * 1024, 4, ex * 1024, 0.29 * 1024, 60); g.addColorStop(0, 'rgba(40,20,28,0.75)'); g.addColorStop(1, 'rgba(40,20,28,0)'); x.fillStyle = g; x.fillRect(ex * 1024 - 64, 0.29 * 1024 - 64, 128, 128); }
      stamp(x, 1024, r, '#4a0705', 6, 0.05, 0.12, 0.85, [0.43, 0.44, 0.57, 0.5]); drips(x, 1024, r, 9, [0.44, 0.47, 0.56, 0.49]);
      stamp(x, 1024, r, '#3a0604', 5, 0.05, 0.16, 0.7);
    }
    // bare skin elsewhere (hands, neck under the collar): a mottled sickly tone
    const body = cv(256); { const x = body.getContext('2d'); x.fillStyle = skinTints[v]; x.fillRect(0, 0, 256, 256); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#c8b8a8'; x.fillRect(0, 0, 256, 256); x.drawImage(noise(11 + v), 0, 0); x.globalCompositeOperation = 'source-over'; veins(x, 256, r, 10); stamp(x, 256, r, '#3a0604', 5, 0.1, 0.3, 0.7); }
    const S = suits[v], cloth = (m, seed, blood) => { const c = graded(imgOf(m), 1024, { sat: S.sat, bright: 0.7, contrast: 1.15, tint: S.tint, dirt: 0.75, seed }); const x = c.getContext('2d'); stamp(x, 1024, r, '#2b2015', 14, 0.12, 0.35, 0.55, [0, 0, 1, 1], 'multiply'); stamp(x, 1024, r, '#4a0705', blood, 0.06, 0.26, 0.85); stamp(x, 1024, r, '#6a0b07', Math.ceil(blood / 2), 0.03, 0.1, 0.8); drips(x, 1024, r, blood, [0, 0, 1, 1]); return c; };
    const top = cloth(mats.Wolf3D_Outfit_Top, 21 + v, 16), bottom = cloth(mats.Wolf3D_Outfit_Bottom, 31 + v, 9), shoes = graded(imgOf(mats.Wolf3D_Outfit_Footwear), 512, { sat: 0.2, bright: 0.55, tint: '#9a8a78', dirt: 0.8, seed: 41 });
    const hat = graded(imgOf(mats.Wolf3D_Headwear), 512, { sat: 0.25, bright: 0.6, tint: '#7a6a58', dirt: 0.7, seed: 51 });
    const eye = cv(64); { const x = eye.getContext('2d'); x.fillStyle = '#cfc4a0'; x.fillRect(0, 0, 64, 64); const g = x.createRadialGradient(32, 32, 0, 32, 32, 13); g.addColorStop(0, '#2a0f00'); g.addColorStop(0.3, '#ffb21e'); g.addColorStop(1, '#a04a00'); x.fillStyle = g; x.beginPath(); x.arc(32, 32, 13, 0, 6.3); x.fill(); veins(x, 64, r, 8, 'rgba(150,20,20,0.6)'); }
    const eyeEm = cv(64); { const x = eyeEm.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 64, 64); const g = x.createRadialGradient(32, 32, 0, 32, 32, 14); g.addColorStop(0, '#ffcf60'); g.addColorStop(1, 'rgba(255,120,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    const M = (o) => new THREE.MeshStandardMaterial(o), nm = (m) => m && m.normalMap;
    const at = cv(2048), ax = at.getContext('2d'), put = (c, k) => { const r = ATLAS[k]; ax.drawImage(c, r[0], r[1], r[2], r[3]); };
    put(head, 'Wolf3D_Skin'); put(top, 'Wolf3D_Outfit_Top'); put(bottom, 'Wolf3D_Outfit_Bottom'); put(shoes, 'Wolf3D_Outfit_Footwear'); put(body, 'Wolf3D_Body'); put(eye, 'Wolf3D_Eye');
    { const r = ATLAS.Wolf3D_Teeth; ax.drawImage(imgOf(mats.Wolf3D_Teeth), r[0], r[1], r[2], r[3]); ax.globalCompositeOperation = 'multiply'; ax.fillStyle = '#9a8458'; ax.fillRect(r[0], r[1], r[2], r[3]); ax.globalCompositeOperation = 'source-over'; }
    { const r = ATLAS.Wolf3D_Beard; ax.fillStyle = '#2a2620'; ax.fillRect(r[0], r[1], r[2], r[3]); }
    if (!SHARED.normal) {
      const n = cv(2048), nx = n.getContext('2d'); nx.fillStyle = 'rgb(128,128,255)'; nx.fillRect(0, 0, 2048, 2048);
      for (const k of ['Wolf3D_Outfit_Top', 'Wolf3D_Outfit_Bottom', 'Wolf3D_Outfit_Footwear', 'Wolf3D_Body', 'Wolf3D_Beard']) { const im = mats[k] && mats[k].normalMap && mats[k].normalMap.image; if (im) { const r = ATLAS[k]; nx.drawImage(im, r[0], r[1], r[2], r[3]); } }
      const rg = cv(2048), rx = rg.getContext('2d'); rx.fillStyle = 'rgb(235,235,235)'; rx.fillRect(0, 0, 2048, 2048);
      for (const [k, v] of [['Wolf3D_Skin', 150], ['Wolf3D_Body', 150], ['Wolf3D_Eye', 50], ['Wolf3D_Teeth', 120], ['Wolf3D_Outfit_Footwear', 190]]) { const r = ATLAS[k]; rx.fillStyle = `rgb(${v},${v},${v})`; rx.fillRect(r[0], r[1], r[2], r[3]); }
      const em = cv(2048), ex = em.getContext('2d'); ex.fillStyle = '#000'; ex.fillRect(0, 0, 2048, 2048); { const r = ATLAS.Wolf3D_Eye; ex.drawImage(eyeEm, r[0], r[1], r[2], r[3]); }
      SHARED.normal = tex(n, false); SHARED.rough = tex(rg, false); SHARED.em = tex(em);
    }
    const set = { mat: M({ map: tex(at), normalMap: SHARED.normal, roughnessMap: SHARED.rough, roughness: 1, emissiveMap: SHARED.em, emissive: 0xffffff, emissiveIntensity: 2.2 }), hatMat: M({ map: tex(hat), normalMap: nm(mats.Wolf3D_Headwear), roughness: 0.95 }),
      Wolf3D_Skin: M({ map: tex(head), normalMap: nm(mats.Wolf3D_Skin), roughness: 0.62 }),
      Wolf3D_Body: M({ map: tex(body), normalMap: nm(mats.Wolf3D_Body), roughness: 0.62 }),
      Wolf3D_Outfit_Top: M({ map: tex(top), normalMap: nm(mats.Wolf3D_Outfit_Top), roughness: 0.92 }),
      Wolf3D_Outfit_Bottom: M({ map: tex(bottom), normalMap: nm(mats.Wolf3D_Outfit_Bottom), roughness: 0.92 }),
      Wolf3D_Outfit_Footwear: M({ map: tex(shoes), normalMap: nm(mats.Wolf3D_Outfit_Footwear), roughness: 0.75 }),
      Wolf3D_Headwear: M({ map: tex(hat), normalMap: nm(mats.Wolf3D_Headwear), roughness: 0.95 }),
      Wolf3D_Eye: M({ map: tex(eye), emissiveMap: tex(eyeEm), emissive: 0xffffff, emissiveIntensity: 2.2, roughness: 0.2 }),
      Wolf3D_Teeth: M({ map: mats.Wolf3D_Teeth.map, color: 0x9a8458, roughness: 0.5 }),
      Wolf3D_Beard: M({ color: 0x2a2620, normalMap: nm(mats.Wolf3D_Beard), roughness: 0.9 }),
    };
    set.hat = v === 0;
    out.m.push(set);
  }
  // ---------- Michelle: one atlas for everything
  let fm = null; G.gltfF.scene.traverse((o) => { if (o.isMesh) fm = o.material; });
  for (let v = 0; v < 2; v++) {
    const r = mulberry32(300 + v * 13);
    const c = graded(imgOf(fm), 1024, { sat: 0.28, bright: 0.72, contrast: 1.15, tint: v ? '#9aa08c' : '#a59a86', dirt: 0.7, seed: 61 + v });
    const x = c.getContext('2d'); veins(x, 1024, r, 30); stamp(x, 1024, r, '#2b2015', 16, 0.1, 0.3, 0.5, [0, 0, 1, 1], 'multiply'); stamp(x, 1024, r, '#4a0705', 22, 0.05, 0.22, 0.85); drips(x, 1024, r, 18, [0, 0, 1, 1]);
    out.f.push(new THREE.MeshStandardMaterial({ map: tex(c), normalMap: fm.normalMap, roughness: 0.8 }));
  }
  G.zskin = out;
}
