/* =========================================================
   OBJETS 3D GRATUITS (packs KayKit « City Builder », « Furniture », « Restaurant »,
   « Halloween » de Kay Lousberg, licence CC0). Convertis par tools/props.mjs en
   géométries à couleurs de sommets, comme les modèles faits en code du jeu.
   ========================================================= */
import * as THREE from 'three';
import bin from '../assets/props.bin';

const buf = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
const dv = new DataView(buf), hl = dv.getUint32(0, true);
const INDEX = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, hl)));
const RAW = {}; let off = 4 + hl; const pad = n => n + (4 - n % 4) % 4;
for(const [k, v] of Object.entries(INDEX)){
  const q = new Int16Array(buf, off, v.nv * 3); off += pad(v.nv * 6);
  const c = new Uint8Array(buf, off, v.nv * 3); off += pad(v.nv * 3);
  const ix = new Uint16Array(buf, off, v.ni); off += pad(v.ni * 2);
  RAW[k] = {q, c, ix, v};
}
export const PROP_KEYS = Object.keys(INDEX);
export const hasProp = k => !!RAW[k];
const toLin = new Float32Array(256).map((_, i) => { const c = i / 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); });
const base = new Map();
/** Géométrie de base (non indexée, position/normale/couleur), pied à y = 0, centrée en x/z, taille d'origine */
function baseGeo(k){
  if(base.has(k)) return base.get(k);
  const {q, c, ix, v} = RAW[k], n = ix.length, P = new Float32Array(n * 3), C = new Float32Array(n * 3);
  const cx = (v.min[0] + v.max[0]) / 2, cz = (v.min[2] + v.max[2]) / 2;
  for(let i = 0; i < n; i++){ const j = ix[i];
    for(let a = 0; a < 3; a++){ const t = (q[j * 3 + a] + 32767) / 65534, val = v.min[a] + t * (v.max[a] - v.min[a]);
      P[i * 3 + a] = a === 0 ? val - cx : a === 1 ? val - v.min[1] : val - cz; C[i * 3 + a] = toLin[c[j * 3 + a]]; } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3));
  g.computeVertexNormals(); g.computeBoundingBox();
  base.set(k, g); return g;
}
/** Taille d'origine [x, y, z] */
export function propSize(k){ const v = INDEX[k]; return [0, 1, 2].map(a => v.max[a] - v.min[a]); }
/**
 * Une pièce prête à fusionner (comme part() de models.js).
 * o.h = hauteur voulue, ou o.len = plus grande dimension horizontale voulue, ou o.s = échelle ;
 * o.p = position, o.r = rotation, o.tint = couleur multipliée (ex. rouille), o.mix = [couleur, part] mélange
 */
export function propPart(k, o = {}){
  const g = baseGeo(k).clone(), sz = propSize(k);
  const s = o.s || (o.h ? o.h / sz[1] : o.len ? o.len / Math.max(sz[0], sz[2]) : 1);
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...(o.p || [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.r || [0, 0, 0]))), new THREE.Vector3(s, s, s));
  g.applyMatrix4(m);
  if(o.tint || o.mix){ const col = g.attributes.color, t = new THREE.Color(o.tint || 0xffffff), mc = o.mix ? new THREE.Color(o.mix[0]) : null, f = o.mix ? o.mix[1] : 0;
    for(let i = 0; i < col.count; i++){ let r = col.getX(i) * t.r, gg = col.getY(i) * t.g, b = col.getZ(i) * t.b;
      if(mc){ r = r * (1 - f) + mc.r * f; gg = gg * (1 - f) + mc.g * f; b = b * (1 - f) + mc.b * f; } col.setXYZ(i, r, gg, b); } }
  return g;
}
