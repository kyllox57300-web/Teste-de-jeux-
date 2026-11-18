/* =========================================================
   MODÈLES 3D « LOW POLY » FABRIQUÉS EN CODE (aucun fichier externe)
   ========================================================= */
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ---------- Matériaux partagés ---------- */
const matCache = new Map();
export function mat(color, o = {}){
  const key = color + JSON.stringify(o);
  if(matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshLambertMaterial({color, flatShading:true, ...o});
  matCache.set(key, m); return m;
}
export const VCOL = new THREE.MeshLambertMaterial({vertexColors:true, flatShading:true});

/* ---------- Géométries de base ---------- */
const G = {
  box:(w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl:(rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s),
  sph:(r, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h),
  cone:(r, h, s = 7) => new THREE.ConeGeometry(r, h, s),
  tor:(r, t, rs = 6, ts = 12, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  ico:(r, d = 0) => new THREE.IcosahedronGeometry(r, d),
  oct:(r) => new THREE.OctahedronGeometry(r, 0),
};
/** Une pièce = [géométrie, couleur, position, rotation, échelle] */
function part(geo, color, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]){
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
  g.applyMatrix4(m);
  const col = new THREE.Color(color), n = g.attributes.position.count, arr = new Float32Array(n * 3);
  for(let i = 0; i < n; i++){ arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  for(const k of Object.keys(g.attributes)) if(!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k);
  return g;
}
/** Fusionne des pièces en une seule géométrie à couleurs de sommets (1 seul appel de dessin) */
export function merged(parts){ const g = mergeGeometries(parts, false); g.computeBoundingSphere(); g.computeBoundingBox(); return g; }

/* =========================================================
   PETITS OBJETS (à ramasser) — taille ~0,2 à 0,5 m
   ========================================================= */
const ITEM_DEFS = {
  can:()=>[part(G.cyl(.07, .07, .2, 8), 0xd23a3a), part(G.cyl(.071, .071, .03, 8), 0xdddddd, [0, .09, 0])],
  sock:()=>[part(G.box(.1, .26, .08), 0xe8e0d0, [0, .05, 0]), part(G.box(.18, .09, .08), 0xe8e0d0, [.05, -.08, 0]), part(G.box(.11, .05, .085), 0xd04040, [0, .17, 0])],
  phone:()=>[part(G.box(.14, .26, .03), 0x2a2d33), part(G.box(.12, .2, .005), 0x4fa0e0, [0, .015, .016])],
  paper:()=>[part(G.box(.3, .01, .22), 0xece8da), part(G.box(.24, .012, .02), 0x8899aa, [0, 0, -.05]), part(G.box(.24, .012, .02), 0x8899aa, [0, 0, .03])],
  watch:()=>[part(G.cyl(.08, .08, .03, 10), 0xd8b040, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.065, .065, .01, 10), 0xf6f6ee, [0, 0, .02], [Math.PI / 2, 0, 0]), part(G.box(.06, .3, .015), 0x6b3e1e, [0, 0, -.01])],
  vhs:()=>[part(G.box(.3, .04, .18), 0x1d1d22), part(G.box(.22, .042, .06), 0xe0e0e0, [0, 0, .04])],
  console:()=>[part(G.box(.3, .06, .16), 0x8a8fa0), part(G.box(.12, .062, .1), 0x3a6a3a, [-.04, .002, 0]), part(G.cyl(.02, .02, .07, 6), 0xd03030, [.1, 0, .02]), part(G.cyl(.02, .02, .07, 6), 0x3050d0, [.1, 0, -.04])],
  floppy:()=>[part(G.box(.22, .02, .22), 0x2a50b0), part(G.box(.12, .022, .06), 0xc8ccd4, [0, 0, -.07]), part(G.box(.14, .022, .08), 0xf4f0e0, [0, 0, .06])],
  toaster:()=>[part(G.box(.28, .2, .16), 0xc8ccd2), part(G.box(.2, .03, .03), 0x222222, [0, .1, -.03]), part(G.box(.2, .03, .03), 0x222222, [0, .1, .03])],
  teddy:()=>[part(G.sph(.12), 0xb07a46, [0, 0, 0]), part(G.sph(.09), 0xb07a46, [0, .17, 0]), part(G.sph(.04), 0xb07a46, [.07, .24, 0]), part(G.sph(.04), 0xb07a46, [-.07, .24, 0])],
  bottle:()=>[part(G.cyl(.06, .06, .22, 7), 0x2f8a40), part(G.cyl(.025, .05, .1, 7), 0x2f8a40, [0, .15, 0])],
  keys:()=>[part(G.tor(.06, .012, 4, 10), 0xc0c0c0, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.box(.03, .01, .14), 0xd8b040, [.03, 0, .1]), part(G.box(.03, .01, .12), 0xc0c4c8, [-.04, 0, .09])],
  necklace:()=>[part(G.tor(.1, .012, 4, 14), 0xd8c050, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.oct(.04), 0xe04080, [0, 0, .1])],
  scooter:()=>[part(G.box(.5, .03, .1), 0x3070d0), part(G.cyl(.012, .012, .45, 5), 0x999999, [.22, .22, 0]), part(G.cyl(.05, .05, .03, 8), 0x222222, [.22, -.04, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.05, .05, .03, 8), 0x222222, [-.22, -.04, 0], [Math.PI / 2, 0, 0])],
  figure:()=>[part(G.box(.1, .16, .07), 0xd03030, [0, .05, 0]), part(G.sph(.05), 0xf0c49a, [0, .18, 0]), part(G.box(.16, .1, .02), 0x3050d0, [0, .06, -.05]), part(G.cyl(.06, .07, .03, 8), 0x333333, [0, -.05, 0])],
  ingot:()=>[part(G.box(.26, .08, .12), 0xf2c230), part(G.box(.2, .02, .08), 0xffe080, [0, .05, 0])],
  cable:()=>[part(G.tor(.1, .015, 4, 12), 0xe04040, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.tor(.07, .015, 4, 12), 0x3070e0, [.05, .02, 0], [Math.PI / 2, .4, 0])],
  keyboard:()=>[part(G.box(.4, .03, .14), 0x3a3d44), part(G.box(.36, .015, .1), 0xa0a5b0, [0, .02, 0])],
  mouse:()=>[part(G.sph(.06, 7, 5), 0xd8d8d0, [0, 0, 0], [0, 0, 0], [1, .6, 1.5]), part(G.cyl(.005, .005, .2, 4), 0x333333, [0, 0, .15], [Math.PI / 2, 0, 0])],
  gpu:()=>[part(G.box(.3, .03, .12), 0x2d7a3e), part(G.cyl(.04, .04, .03, 8), 0x222222, [-.07, .03, 0]), part(G.cyl(.04, .04, .03, 8), 0x222222, [.07, .03, 0]), part(G.box(.12, .02, .02), 0xd8b040, [0, -.01, .06])],
  ring:()=>[part(G.tor(.05, .014, 5, 12), 0xd8d8e0), part(G.oct(.03), 0x80d0ff, [0, .06, 0])],
  barrelS:()=>[part(G.cyl(.1, .1, .22, 8), 0xd8a72a), part(G.cyl(.102, .102, .02, 8), 0x9a7010, [0, .05, 0])],
  duck:()=>[part(G.sph(.1), 0xf2d23a, [0, 0, 0], [0, 0, 0], [1.2, .8, 1]), part(G.sph(.06), 0xf2d23a, [.09, .08, 0]), part(G.cone(.03, .06, 5), 0xf08a20, [.16, .08, 0], [0, 0, -Math.PI / 2])],
  boot:()=>[part(G.box(.1, .26, .12), 0x2a5a2a, [0, .06, 0]), part(G.box(.22, .08, .12), 0x2a5a2a, [.06, -.08, 0])],
  wrench:()=>[part(G.box(.3, .03, .04), 0xa0a8b0), part(G.tor(.04, .015, 4, 8, 4.5), 0xa0a8b0, [.16, 0, 0], [Math.PI / 2, 0, 0])],
  gear:()=>[part(G.cyl(.1, .1, .04, 10), 0x8a9098), part(G.cyl(.04, .04, .05, 8), 0x444444), ...[0, 1, 2, 3, 4, 5].map(i => part(G.box(.05, .04, .05), 0x8a9098, [Math.cos(i) * .12, 0, Math.sin(i) * .12]))],
  rim:()=>[part(G.tor(.14, .04, 6, 12), 0x1d1d1f, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.11, .11, .05, 10), 0xc8ccd2)],
  lock:()=>[part(G.box(.16, .14, .07), 0xf0c030), part(G.tor(.05, .015, 4, 10, Math.PI), 0xc0c0c0, [0, .07, 0])],
  fish:()=>[part(G.sph(.08), 0xff7a20, [0, 0, 0], [0, 0, 0], [1.8, 1, .6]), part(G.cone(.06, .1, 4), 0xff7a20, [-.17, 0, 0], [0, 0, Math.PI / 2])],
  spring:()=>[0, 1, 2, 3].map(i => part(G.tor(.06, .012, 4, 10), 0xb0b4b8, [0, i * .04, 0], [Math.PI / 2, 0, 0])),
  pillowS:()=>[part(G.box(.36, .1, .24), 0xefe6c8)],
  cash:()=>[part(G.box(.26, .08, .13), 0x5fb070), part(G.box(.05, .085, .135), 0xf0e0b0)],
  teeth:()=>[part(G.tor(.08, .03, 5, 10, Math.PI), 0xf0c060, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.tor(.08, .025, 5, 10, Math.PI), 0xf6f0e0, [0, .03, 0], [Math.PI / 2, 0, 0])],
  gem:()=>[part(G.oct(.09), 0x70e0ff, [0, .04, 0], [0, 0, 0], [1, 1.3, 1]), part(G.cyl(.05, .05, .02, 8), 0xd8c050, [0, -.06, 0])],
  moneybag:()=>[part(G.sph(.15), 0x8a6a3a, [0, 0, 0], [0, 0, 0], [1, 1.1, 1]), part(G.cone(.06, .1, 6), 0x8a6a3a, [0, .17, 0]), part(G.box(.05, .08, .01), 0xf2c230, [0, 0, .15])],
  gnome:()=>[part(G.cyl(.1, .12, .2, 8), 0x3060c0), part(G.sph(.08), 0xf0c49a, [0, .15, 0]), part(G.cone(.08, .2, 8), 0xd03030, [0, .3, 0]), part(G.cone(.06, .1, 6), 0xf0f0f0, [0, .1, .06], [Math.PI, 0, 0])],
  battery:()=>[part(G.box(.26, .18, .16), 0x2a2a2e), part(G.cyl(.02, .02, .04, 6), 0xd03030, [.08, .1, 0]), part(G.cyl(.02, .02, .04, 6), 0x303030, [-.08, .1, 0])],
  lamp:()=>[part(G.cyl(.12, .08, .12, 10), 0xd8dce2, [0, 0, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.1, .1, .01, 10), 0xfff6c0, [0, 0, .065], [Math.PI / 2, 0, 0])],
  trophy:()=>[part(G.cyl(.09, .04, .14, 8), 0xf2c230, [0, .1, 0]), part(G.cyl(.02, .02, .08, 6), 0xf2c230, [0, -.02, 0]), part(G.box(.14, .05, .1), 0x5a3a20, [0, -.08, 0])],
  meteor:()=>[part(G.ico(.13, 0), 0x6a5a6a), part(G.ico(.06, 0), 0xff8040, [.06, .06, .04])],
  crown:()=>[part(G.cyl(.12, .12, .1, 10, 1, true), 0xf2c230), ...[0, 1, 2, 3, 4].map(i => part(G.cone(.03, .07, 4), 0xf2c230, [Math.cos(i * 1.256) * .12, .08, Math.sin(i * 1.256) * .12])), part(G.oct(.03), 0xe02040, [0, 0, .12])],
  pizza:()=>[part(G.cyl(.18, .18, .02, 3), 0xe0a040), part(G.cyl(.03, .03, .025, 6), 0xc03020, [.05, .005, 0]), part(G.cyl(.03, .03, .025, 6), 0xc03020, [-.03, .005, .05])],
  hdd:()=>[part(G.box(.2, .03, .28), 0x8d939b), part(G.cyl(.07, .07, .035, 12), 0xc3c8ce, [0, 0, -.03])],
  cd:()=>[part(G.cyl(.12, .12, .006, 16), 0xd8e4f0), part(G.cyl(.02, .02, .008, 8), 0x555555)],
  egg:()=>[part(G.sph(.09, 8, 6), 0xff9ad0, [0, 0, 0], [0, 0, 0], [1, 1.25, 1]), part(G.box(.08, .05, .01), 0x88aa88, [0, .02, .085])],
  coin:()=>[part(G.cyl(.1, .1, .025, 14), 0xf2a020), part(G.cyl(.07, .07, .028, 14), 0xffc840)],
  letter:()=>[part(G.box(.24, .01, .16), 0xf6e8e0), part(G.box(.05, .012, .05), 0xe03050, [0, 0, 0])],
  computer:()=>[part(G.box(.36, .28, .3), 0xd8d2c0), part(G.box(.28, .2, .01), 0x203040, [0, .02, .155]), part(G.box(.4, .03, .16), 0xd8d2c0, [0, -.16, .25])],
  potato:()=>[part(G.ico(.11, 1), 0xb08a50, [0, 0, 0], [0, 0, 0], [1.3, .9, 1]), part(G.box(.1, .005, .06), 0x222222, [0, .08, 0])],
};
const itemGeoCache = new Map();
export function itemGeo(key){
  if(!itemGeoCache.has(key)) itemGeoCache.set(key, merged((ITEM_DEFS[key] || ITEM_DEFS.can)()));
  return itemGeoCache.get(key);
}

/* =========================================================
   DÉCHETS DES TAS (géométries instanciées) — taille ~0,5 à 1 m
   ========================================================= */
const DECO_DEFS = {
  bag:()=>[part(G.ico(.36, 1), 0xffffff, [0, .2, 0], [0, 0, 0], [1, .8, .9]), part(G.cone(.08, .2, 5), 0xffffff, [0, .5, 0])],
  can:()=>[part(G.cyl(.09, .09, .28, 7), 0xd23a3a, [0, .14, 0]), part(G.cyl(.092, .092, .04, 7), 0xdddddd, [0, .27, 0])],
  box:()=>[part(G.box(.6, .42, .48), 0xb98b55, [0, .21, 0]), part(G.box(.62, .04, .1), 0xd8c79a, [0, .43, 0])],
  bottle:()=>[part(G.cyl(.08, .08, .3, 6), 0x2f8a40, [0, .15, 0]), part(G.cyl(.03, .07, .12, 6), 0x2f8a40, [0, .36, 0])],
  paper:()=>[part(G.box(.5, .03, .38), 0xecebe2, [0, .02, 0])],
  tire:()=>[part(G.tor(.34, .14, 5, 10), 0x1c1c1f, [0, .14, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.2, .2, .1, 8), 0x55585e, [0, .14, 0])],
  monitor:()=>[part(G.box(.55, .45, .45), 0xd2ccbc, [0, .23, 0]), part(G.box(.44, .34, .02), 0x1d2e44, [0, .25, .23])],
  keyboard:()=>[part(G.box(.6, .05, .22), 0x3a3d44, [0, .03, 0]), part(G.box(.55, .03, .17), 0x8b909c, [0, .06, 0])],
  pcb:()=>[part(G.box(.45, .03, .32), 0x2d7a3e, [0, .02, 0]), part(G.box(.12, .05, .12), 0x111111, [0, .05, 0])],
  tv:()=>[part(G.box(.7, .55, .5), 0x4a4038, [0, .28, 0]), part(G.box(.55, .42, .02), 0x2a3a3a, [0, .3, .26])],
  cable:()=>[part(G.tor(.2, .03, 4, 12), 0xe04040, [0, .04, 0], [Math.PI / 2, 0, 0]), part(G.tor(.14, .03, 4, 12), 0x3070e0, [.1, .07, 0], [Math.PI / 2, 0, 0])],
  barrel:()=>[part(G.cyl(.22, .22, .6, 8), 0xb88a2a, [0, .3, 0]), part(G.cyl(.23, .23, .04, 8), 0x7a5a10, [0, .2, 0]), part(G.cyl(.23, .23, .04, 8), 0x7a5a10, [0, .42, 0])],
  duck:()=>[part(G.sph(.2), 0xf2d23a, [0, .15, 0], [0, 0, 0], [1.2, .8, 1]), part(G.sph(.12), 0xf2d23a, [.18, .3, 0]), part(G.cone(.05, .12, 5), 0xf08a20, [.32, .3, 0], [0, 0, -Math.PI / 2])],
  mattress:()=>[part(G.box(1.5, .22, .95), 0xffffff, [0, .11, 0]), part(G.box(1.46, .04, .91), 0xffffff, [0, .23, 0])],
  pillow:()=>[part(G.box(.6, .16, .4), 0xefe6c8, [0, .08, 0])],
  fridge:()=>[part(G.box(.75, 1.4, .7), 0xeef0f2, [0, .7, 0]), part(G.box(.04, .4, .04), 0x888888, [.3, .9, .36]), part(G.box(.76, .02, .71), 0xb0b4b8, [0, 1.0, 0])],
  cart:()=>[part(G.box(.8, .5, .55), 0xb7bcc2, [0, .45, 0]), part(G.box(.1, .5, .55), 0xc03030, [-.45, .45, 0]), part(G.cyl(.06, .06, .06, 6), 0x222222, [.3, .05, .22], [Math.PI / 2, 0, 0]), part(G.cyl(.06, .06, .06, 6), 0x222222, [-.3, .05, .22], [Math.PI / 2, 0, 0])],
  plank:()=>[part(G.box(1.4, .08, .22), 0x8a6a40, [0, .04, 0])],
  cd:()=>[part(G.cyl(.18, .18, .01, 14), 0xd8e4f0, [0, .01, 0])],
  pizza:()=>[part(G.box(.5, .06, .5), 0xd0a060, [0, .03, 0]), part(G.box(.4, .02, .03), 0xb07030, [0, .07, .1])],
  hdd:()=>[part(G.box(.3, .05, .42), 0x8d939b, [0, .03, 0]), part(G.cyl(.1, .1, .06, 10), 0xc3c8ce, [0, .04, -.04])],
};
/** Variantes de couleur (même géométrie, teinte différente) */
const DECO_VARIANT = {bag:['bag', 0x2a2a30], bagG:['bag', 0x2f6a35], bagB:['bag', 0x2c5aa0], bagW:['bag', 0xd9d9d2], bagY:['bag', 0xd6b23a],
  barrelB:['barrel', 0x2f6fb8], mattressP:['mattress', 0xe2a9b8], mattress:['mattress', 0xe6d7bf]};
export function decoInfo(key){ const v = DECO_VARIANT[key]; return v ? {geo:v[0], tint:v[1]} : {geo:key, tint:0xffffff}; }
const decoGeoCache = new Map();
export function decoGeo(key){ if(!decoGeoCache.has(key)) decoGeoCache.set(key, merged(DECO_DEFS[key]())); return decoGeoCache.get(key); }
export const DECO_KEYS = Object.keys(DECO_DEFS);

/* =========================================================
   GROS OBJETS ET CONTENANTS (avec une porte / un couvercle animable)
   ========================================================= */
function mesh(geo, m){ const o = new THREE.Mesh(geo, m || VCOL); o.castShadow = true; o.receiveShadow = true; return o; }
export function bigModel(kind){
  const g = new THREE.Group(); let door = null;
  if(kind === 'tv'){ g.add(mesh(merged([part(G.box(.9, .7, .6), 0x4a4038, [0, .35, 0]), part(G.box(.72, .54, .02), 0x2a3a3a, [0, .38, .31]), part(G.cyl(.02, .02, .4, 4), 0x999999, [.2, .9, 0], [0, 0, .4]), part(G.cyl(.02, .02, .4, 4), 0x999999, [-.2, .9, 0], [0, 0, -.4])]))); }
  if(kind === 'fridge'){ g.add(mesh(merged([part(G.box(.9, 1.8, .8), 0xeef0f2, [0, .9, -.02]), part(G.box(.9, .06, .02), 0xb0b4b8, [0, 1.25, .39])])));
    door = new THREE.Group(); door.position.set(-.45, 0, .4); door.add(mesh(merged([part(G.box(.9, 1.78, .06), 0xf6f8fa, [.45, .9, .03]), part(G.box(.05, .5, .05), 0x888888, [.8, 1.05, .08])]))); g.add(door); }
  if(kind === 'wash'){ g.add(mesh(merged([part(G.box(.8, .9, .7), 0xf0f0f0, [0, .45, 0]), part(G.cyl(.25, .25, .04, 14), 0x7090b0, [0, .45, .35], [Math.PI / 2, 0, 0]), part(G.box(.7, .12, .02), 0xc0c4c8, [0, .82, .35])]))); }
  if(kind === 'moto'){ g.add(mesh(merged([part(G.tor(.32, .09, 6, 12), 0x1c1c1f, [.65, .34, 0]), part(G.tor(.32, .09, 6, 12), 0x1c1c1f, [-.65, .34, 0]), part(G.box(1.0, .35, .3), 0xc02a2a, [0, .7, 0]),
    part(G.box(.5, .12, .32), 0x2a2a2a, [-.2, .92, 0]), part(G.cyl(.03, .03, .7, 5), 0xc0c0c0, [.62, .9, 0], [Math.PI / 2, 0, 0]), part(G.cyl(.1, .12, .15, 8), 0xe0e0d0, [.75, .85, 0], [0, 0, Math.PI / 2])]))); }
  if(kind === 'statue'){ g.add(mesh(merged([part(G.box(.6, .3, .6), 0x6a6a6a, [0, .15, 0]), part(G.cyl(.18, .22, .9, 8), 0x9a7a3a, [0, .75, 0]), part(G.sph(.17), 0x9a7a3a, [0, 1.35, 0]),
    part(G.cyl(.05, .05, .7, 6), 0x9a7a3a, [.25, 1.4, 0], [0, 0, -.3]), part(G.cone(.12, .25, 5), 0xd8b040, [.38, 1.82, 0])]))); }
  if(kind === 'safe'){ g.add(mesh(merged([part(G.box(.9, 1.0, .85), 0x3a4a5a, [0, .5, 0]), part(G.box(.94, .06, .9), 0x2a3440, [0, 1.0, 0])])));
    door = new THREE.Group(); door.position.set(-.4, 0, .43); door.add(mesh(merged([part(G.box(.8, .86, .06), 0x4a5a6a, [.4, .5, .03]), part(G.cyl(.12, .12, .05, 12), 0xc0a040, [.45, .55, .08], [Math.PI / 2, 0, 0]), part(G.box(.04, .2, .04), 0xd0d0d0, [.7, .5, .08])]))); g.add(door); }
  g.userData.door = door; return g;
}
export function contModel(kind){
  const g = new THREE.Group(); let door = null;
  if(kind === 'bin'){ g.add(mesh(merged([part(G.cyl(.38, .32, .95, 9), 0x3a7a4a, [0, .47, 0]), part(G.cyl(.05, .05, .9, 4), 0x2a5a3a, [0, .45, -.35], [0, 0, Math.PI / 2])])));
    door = new THREE.Group(); door.position.set(0, .95, -.38); door.add(mesh(merged([part(G.cyl(.4, .4, .08, 9), 0x2f6a3f, [0, .04, .38])]))); g.add(door); }
  if(kind === 'case'){ g.add(mesh(merged([part(G.box(.85, .25, .6), 0x8a3a2a, [0, .13, 0]), part(G.box(.25, .05, .05), 0x2a2a2a, [0, .2, .32])])));
    door = new THREE.Group(); door.position.set(0, .25, -.3); door.add(mesh(merged([part(G.box(.85, .18, .6), 0x9a4a32, [0, .09, .3]), part(G.box(.86, .04, .1), 0xd8c050, [0, .09, .58])]))); g.add(door); }
  if(kind === 'ward'){ g.add(mesh(merged([part(G.box(1.1, 1.9, .6), 0x7a5230, [0, .95, 0]), part(G.box(1.14, .08, .64), 0x5a3a20, [0, 1.92, 0])])));
    door = new THREE.Group(); door.position.set(-.55, 0, .31); door.add(mesh(merged([part(G.box(1.08, 1.8, .05), 0x8a6240, [.54, .95, 0]), part(G.box(.6, 1.0, .02), 0xa8b8c0, [.54, 1.1, .03]), part(G.sph(.04), 0xd8c050, [.95, .95, .04])]))); g.add(door); }
  if(kind === 'trunk'){ // carcasse de voiture : on ouvre le coffre
    g.add(mesh(merged([part(G.box(1.7, .6, 3.4), 0x8a4a3a, [0, .55, 0]), part(G.box(1.5, .5, 1.6), 0x7a4234, [0, 1.1, .1]), part(G.box(1.4, .38, 1.5), 0x405060, [0, 1.12, .12]),
      ...[[-.85, 1.1], [.85, 1.1], [-.85, -1.1], [.85, -1.1]].map(([x, z]) => part(G.cyl(.32, .32, .25, 10), 0x1c1c1f, [x, .32, z], [0, 0, Math.PI / 2])), part(G.box(1.3, .15, .08), 0xb0b0b0, [0, .5, 1.72])]), null));
    door = new THREE.Group(); door.position.set(0, .86, -1.2); door.add(mesh(merged([part(G.box(1.6, .08, .55), 0x9a5444, [0, 0, -.28])]))); g.add(door); }
  g.userData.door = door; return g;
}

/* =========================================================
   PERSONNAGES (bras et jambes articulés, animés par le code)
   ========================================================= */
export function person(o = {}){
  const g = new THREE.Group(), skin = o.skin || 0xf0c49a;
  const hips = new THREE.Group(); hips.position.y = 0.82; g.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  torso.add(mesh(merged([part(G.box(.46, .58, .28), o.shirt || 0xf7931a, [0, .3, 0]), part(G.box(.48, .12, .3), o.shirt2 || o.shirt || 0xd07810, [0, .02, 0]),
    ...(o.logo ? [part(G.cyl(.08, .08, .02, 10), 0xffffff, [0, .38, .15], [Math.PI / 2, 0, 0]), part(G.box(.03, .1, .022), o.shirt || 0xf7931a, [0, .38, .16])] : []),
    ...(o.apron ? [part(G.box(.4, .5, .02), o.apron, [0, .2, .15])] : []), ...(o.vest ? [part(G.box(.48, .1, .3), o.vest, [0, .45, 0]), part(G.box(.48, .1, .3), o.vest, [0, .2, 0])] : [])])));
  const head = new THREE.Group(); head.position.y = .72; torso.add(head);
  head.add(mesh(merged([part(G.box(.34, .34, .32), skin, [0, .14, 0]), part(G.box(.05, .05, .03), 0x1a1410, [.08, .17, .165]), part(G.box(.05, .05, .03), 0x1a1410, [-.08, .17, .165]),
    part(G.box(.07, .07, .06), skin, [0, .1, .18]),
    ...(o.beard ? [part(G.box(.36, .16, .1), o.beard, [0, 0, .13]), part(G.box(.36, .2, .3), o.beard, [0, .02, -.03])] : []),
    ...(o.hat === 'beanie' ? [part(G.box(.38, .16, .36), o.hair, [0, .33, 0]), part(G.sph(.06), o.hair, [0, .44, 0])] :
       o.hat === 'helmet' ? [part(G.sph(.22, 8, 5), o.hair, [0, .3, 0], [0, 0, 0], [1, .6, 1]), part(G.box(.46, .03, .44), o.hair, [0, .27, .02])] :
       o.hat === 'cap' ? [part(G.box(.36, .1, .34), o.hair, [0, .33, 0]), part(G.box(.3, .03, .18), o.hair, [0, .29, .24])] :
       o.hat === 'bun' ? [part(G.box(.36, .1, .34), o.hair, [0, .33, 0]), part(G.sph(.1), o.hair, [0, .38, -.15])] :
       [part(G.box(.36, .12, .34), o.hair || 0x6a4424, [0, .34, 0]), part(G.box(.36, .2, .08), o.hair || 0x6a4424, [0, .22, -.14])]),
    ...(o.glasses ? [part(G.box(.3, .06, .02), 0x222222, [0, .17, .175])] : []),
    ...(o.nose ? [part(G.box(.08, .08, .06), o.nose, [0, .1, .2])] : [])])));
  const mkArm = side => { const a = new THREE.Group(); a.position.set(side * .3, .52, 0);
    a.add(mesh(merged([part(G.box(.14, .5, .14), o.shirt || 0xf7931a, [0, -.22, 0]), part(G.box(.13, .12, .13), skin, [0, -.5, 0])]))); torso.add(a); return a; };
  const armL = mkArm(1), armR = mkArm(-1);
  const mkLeg = side => { const l = new THREE.Group(); l.position.set(side * .12, 0, 0);
    l.add(mesh(merged([part(G.box(.17, .7, .2), o.pants || 0x2c3a5a, [0, -.37, 0]), part(G.box(.19, .12, .3), 0x2a1d14, [0, -.76, .05])]))); hips.add(l); return l; };
  const legL = mkLeg(1), legR = mkLeg(-1);
  // outil dans la main droite
  const hand = new THREE.Group(); hand.position.set(0, -.5, .05); armR.add(hand);
  // sac à dos
  const bag = new THREE.Group(); bag.position.set(0, .3, -.24); torso.add(bag);
  if(o.backpack){ bag.add(mesh(merged([part(G.ico(.25, 1), 0x8a6232, [0, 0, -.05], [0, 0, 0], [1, 1.1, .7]), part(G.box(.3, .06, .04), 0x5a3a18, [0, .1, .12])]))); }
  g.userData = {hips, torso, head, armL, armR, legL, legR, hand, bag, tool:null};
  return g;
}
/** Outils tenus en main (paliers : pelle rouillée, pioche, marteau-piqueur, pelle en or) */
export function toolModel(tier){
  const parts = [part(G.cyl(.025, .025, 1.0, 5), 0x7a5230, [0, -.35, .25], [Math.PI / 2.4, 0, 0])];
  if(tier === 0) parts.push(part(G.box(.26, .32, .03), 0x9aa0a8, [0, -.78, .62], [Math.PI / 2.4, 0, 0]));
  if(tier === 1) parts.push(part(G.box(.6, .07, .07), 0x8e939a, [0, -.72, .6], [0, 0, 0]), part(G.cone(.05, .2, 4), 0x8e939a, [.38, -.72, .6], [0, 0, -Math.PI / 2]));
  if(tier === 2){ parts.length = 0; parts.push(part(G.box(.22, .5, .22), 0xd23a3a, [0, -.45, .3]), part(G.cyl(.03, .03, .4, 5), 0x666666, [0, -.85, .3]), part(G.box(.5, .06, .06), 0x333333, [0, -.15, .3])); }
  if(tier === 3) parts.push(part(G.box(.28, .34, .03), 0xffcf3a, [0, -.78, .62], [Math.PI / 2.4, 0, 0]));
  const m = mesh(merged(parts)); return m;
}
export function dogModel(){
  const g = new THREE.Group();
  const body = mesh(merged([part(G.box(.35, .3, .7), 0x8a5a2c, [0, .45, 0]), part(G.box(.06, .06, .3), 0x8a5a2c, [0, .58, -.45], [.6, 0, 0]),
    ...[[-.12, .25], [.12, .25], [-.12, -.25], [.12, -.25]].map(([x, z]) => part(G.box(.09, .32, .09), 0x7a4a20, [x, .16, z])), part(G.box(.36, .08, .05), 0xd23a3a, [0, .58, .3])]));
  const head = mesh(merged([part(G.box(.3, .28, .3), 0x9b6a38, [0, 0, 0]), part(G.box(.16, .12, .16), 0x9b6a38, [0, -.04, .2]), part(G.box(.06, .06, .04), 0x111111, [0, 0, .29]),
    part(G.box(.08, .16, .06), 0x6a3e1a, [.14, .14, -.05]), part(G.box(.08, .16, .06), 0x6a3e1a, [-.14, .14, -.05])]));
  head.position.set(0, .7, .45); g.add(body); g.add(head); g.userData = {head, body}; return g;
}
export function dozerModel(scale = 1){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(1.1, .3, 1.3), 0x2a2a2e, [0, .15, 0]), part(G.box(.9, .55, 1.0), 0xf0b81c, [0, .55, -.05]), part(G.box(.6, .5, .55), 0xf0b81c, [0, 1.05, -.2]),
    part(G.box(.55, .35, .02), 0x9bd0e8, [0, 1.1, .08]), part(G.box(1.3, .5, .1), 0x6b6e75, [0, .3, .85]), part(G.cyl(.04, .04, .4, 5), 0x333333, [.3, 1.4, -.3])])));
  g.scale.setScalar(scale); return g;
}
export function robotModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(.6, .25, .7), 0x3d3f45, [0, .12, 0]), part(G.box(.55, .7, .5), 0xc4c9d0, [0, .65, 0]), part(G.box(.4, .2, .02), 0x2a3a4a, [0, .8, .26]),
    part(G.box(.08, .05, .02), 0x5ff0ff, [.08, .82, .275]), part(G.box(.08, .05, .02), 0x5ff0ff, [-.08, .82, .275]), part(G.cyl(.015, .015, .3, 4), 0x888888, [0, 1.15, 0]), part(G.sph(.05), 0xff4040, [0, 1.32, 0])])));
  const arm = new THREE.Group(); arm.position.set(.32, .7, 0); arm.add(mesh(merged([part(G.box(.08, .08, .5), 0x9aa0a8, [0, 0, .25]), part(G.box(.15, .15, .06), 0x9aa0a8, [0, 0, .5])]))); g.add(arm);
  g.userData = {arm}; return g;
}
/** R0B0 : petit robot volant qui suit Kévin (compétence MacGyver) */
export function roboModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.sph(.22, 8, 6), 0xe8eaf0), part(G.box(.26, .1, .02), 0x2a3a4a, [0, .04, .2]), part(G.box(.06, .04, .02), 0x5ff0ff, [.06, .05, .215]), part(G.box(.06, .04, .02), 0x5ff0ff, [-.06, .05, .215]),
    part(G.cyl(.25, .25, .03, 10), 0xffcf3a, [0, -.12, 0])])));
  const prop = new THREE.Group(); prop.position.y = .3; prop.add(mesh(merged([part(G.box(.6, .02, .06), 0x555555), part(G.cyl(.02, .02, .1, 4), 0x555555, [0, -.05, 0])]))); g.add(prop);
  g.userData = {prop}; return g;
}
export function truckModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(2.0, 1.2, 3.0), 0x2f7a3a, [0, 1.15, -.5]), part(G.box(2.04, .1, 3.04), 0x246030, [0, 1.75, -.5]), part(G.box(1.9, 1.3, 1.2), 0xe8e6dc, [0, 1.15, 1.6]),
    part(G.box(1.7, .55, .05), 0x9bd0e8, [0, 1.4, 2.21]), part(G.box(2.0, .3, 4.4), 0x2a2a2e, [0, .45, .1]),
    ...[[-1, 1.5], [1, 1.5], [-1, -1.3], [1, -1.3]].map(([x, z]) => part(G.cyl(.42, .42, .3, 10), 0x1c1c1f, [x, .42, z], [0, 0, Math.PI / 2])),
    part(G.box(.3, .2, .05), 0xffe070, [.7, .9, 2.21]), part(G.box(.3, .2, .05), 0xffe070, [-.7, .9, 2.21])])));
  const load = new THREE.Group(); load.position.set(0, 1.75, -.5); g.add(load); g.userData = {load};
  return g;
}
export function diggerModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(1.6, .45, 2.0), 0x2a2a2e, [0, .22, 0]), part(G.box(1.4, .7, 1.5), 0xe0a81c, [0, .8, -.15]), part(G.box(.8, .8, .8), 0xe0a81c, [-.25, 1.55, -.3]),
    part(G.box(.7, .55, .02), 0x9bd0e8, [-.25, 1.6, .11]), part(G.box(.5, .3, .6), 0x3d3d42, [.35, 1.35, -.6])])));
  const arm1 = new THREE.Group(); arm1.position.set(.35, 1.2, .5); g.add(arm1);
  arm1.add(mesh(merged([part(G.box(.22, .22, 1.6), 0xe0a81c, [0, 0, .8])])));
  const arm2 = new THREE.Group(); arm2.position.set(0, 0, 1.6); arm1.add(arm2);
  arm2.add(mesh(merged([part(G.box(.18, .18, 1.1), 0xe0a81c, [0, 0, .55]), part(G.box(.6, .45, .35), 0x55575c, [0, -.15, 1.15])])));
  const seat = new THREE.Group(); seat.position.set(-.25, 1.25, -.3); g.add(seat);
  g.userData = {arm1, arm2, seat}; return g;
}
export function brouetteModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(.7, .3, .9), 0x2f6b3f, [0, .55, .2], [.15, 0, 0]), part(G.cyl(.18, .18, .1, 10), 0x1c1c1f, [0, .2, .75], [0, 0, Math.PI / 2]),
    part(G.cyl(.025, .025, 1.1, 4), 0x5b4026, [.25, .55, -.2], [Math.PI / 2.2, 0, 0]), part(G.cyl(.025, .025, 1.1, 4), 0x5b4026, [-.25, .55, -.2], [Math.PI / 2.2, 0, 0])])));
  const load = new THREE.Group(); load.position.set(0, .72, .2); g.add(load); g.userData = {load}; return g;
}

/* =========================================================
   DÉCOR : cabane de Josiane, grue, lampadaires, conteneurs, carcasses, arbres…
   ========================================================= */
export function hutModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.box(7.0, 3.0, 4.6), 0x8a5a34, [0, 1.5, 0]),
    ...[0, 1, 2, 3, 4, 5, 6].map(i => part(G.box(7.05, .06, 4.65), 0x6a4224, [0, .4 + i * .4, 0])),
    part(G.box(1.2, 2.2, .1), 0x4b2e17, [-1.8, 1.1, 2.31]), part(G.box(1.4, 1.0, .1), 0x9bd0e8, [1.4, 1.7, 2.31]), part(G.box(1.6, .12, .14), 0x4b2e17, [1.4, 1.15, 2.33]),
    part(G.box(7.8, .2, 5.6), 0x6f7f8c, [0, 3.25, 0], [0, 0, 0]), part(G.box(7.8, .7, .1), 0x5f6f7c, [0, 3.0, 2.8]),
    // comptoir de vente
    part(G.box(3.2, 1.0, .8), 0xb98b55, [1.0, .5, 3.0]), part(G.box(3.3, .1, .9), 0x8f683c, [1.0, 1.02, 3.0]),
    // établi de réparation
    part(G.box(1.8, .9, .8), 0x7a5a3a, [-3.0, .45, 3.0]), part(G.box(1.9, .08, .9), 0x5a3a20, [-3.0, .92, 3.0]), part(G.box(.3, .3, .3), 0xd23a3a, [-3.4, 1.11, 3.0]),
    // caisses
    part(G.box(.9, .9, .9), 0xb98b55, [3.9, .45, 1.0]), part(G.box(.7, .7, .7), 0xa07a48, [3.9, 1.25, 1.0], [0, .3, 0])])));
  // enseigne (texture dessinée)
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c2 = cv.getContext('2d');
  c2.fillStyle = '#f2d23a'; c2.fillRect(0, 0, 256, 64); c2.strokeStyle = '#7a5a10'; c2.lineWidth = 6; c2.strokeRect(3, 3, 250, 58);
  c2.fillStyle = '#3a2a08'; c2.font = 'bold 40px system-ui, sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('RACHAT €', 128, 34);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .8), new THREE.MeshBasicMaterial({map:tex})); sign.position.set(.5, 4.0, 2.82); g.add(sign);
  const post = mesh(merged([part(G.box(.12, .9, .12), 0x5a3a20, [-.9, 3.6, 2.8]), part(G.box(.12, .9, .12), 0x5a3a20, [1.9, 3.6, 2.8])])); g.add(post);
  return g;
}
export function craneModel(){
  const g = new THREE.Group();
  const lattice = [];
  for(let i = 0; i < 7; i++) lattice.push(part(G.box(1.0, .08, .08), 0xf0b81c, [0, 2 + i * 2, .5]), part(G.box(1.0, .08, .08), 0xf0b81c, [0, 2 + i * 2, -.5]), part(G.box(.08, .08, 1.0), 0xf0b81c, [.5, 2 + i * 2, 0]), part(G.box(.08, .08, 1.0), 0xf0b81c, [-.5, 2 + i * 2, 0]));
  for(const [x, z] of [[.5, .5], [-.5, .5], [.5, -.5], [-.5, -.5]]) lattice.push(part(G.box(.12, 15, .12), 0xf0b81c, [x, 7.5, z]));
  g.add(mesh(merged([part(G.box(2.2, .6, 2.2), 0x6b6e75, [0, .3, 0]), ...lattice])));
  const jib = new THREE.Group(); jib.position.y = 15.2; g.add(jib);
  jib.add(mesh(merged([part(G.box(.6, .6, 22), 0xf0b81c, [0, 0, 7]), part(G.box(1.4, 1.2, 1.6), 0xe8e6dc, [0, -.2, -1.2]), part(G.box(1.2, 1.2, 2.2), 0x777777, [0, -.2, -4.5]), part(G.cone(.4, 3, 4), 0xf0b81c, [0, 1.6, 0])])));
  g.userData = {jib}; return g;
}
export function hookModel(){ return mesh(merged([part(G.box(.6, .3, .6), 0xf0b81c, [0, .15, 0]), part(G.tor(.18, .05, 4, 8, Math.PI * 1.4), 0x444444, [0, -.15, 0])])); }
export function lampModel(){
  const g = new THREE.Group();
  g.add(mesh(merged([part(G.cyl(.08, .1, 5, 6), 0x3a3d44, [0, 2.5, 0]), part(G.box(.9, .08, .1), 0x3a3d44, [.4, 4.95, 0])])));
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .3), new THREE.MeshBasicMaterial({color:0x554a30})); bulb.position.set(.8, 4.88, 0); g.add(bulb);
  g.userData = {bulb}; return g;
}
export function shippingContainer(color){
  const parts = [part(G.box(2.4, 2.6, 6), color, [0, 1.3, 0])];
  for(let i = 0; i < 12; i++) parts.push(part(G.box(2.44, 2.3, .08), new THREE.Color(color).multiplyScalar(.8).getHex(), [0, 1.3, -2.8 + i * .5]));
  return mesh(merged(parts));
}
export function carWreck(color){
  return mesh(merged([part(G.box(1.8, .6, 3.6), color, [0, .5, 0]), part(G.box(1.6, .5, 1.7), color, [0, 1.05, -.1], [0, 0, .05]), part(G.box(1.5, .4, 1.6), 0x334050, [0, 1.05, -.08]),
    part(G.cyl(.32, .32, .25, 9), 0x1c1c1f, [-.9, .32, 1.2], [0, 0, Math.PI / 2]), part(G.cyl(.32, .32, .25, 9), 0x1c1c1f, [.9, .32, -1.2], [0, 0, Math.PI / 2])]));
}
export function tireStack(){ const p = []; for(let i = 0; i < 4; i++) p.push(part(G.tor(.42, .17, 6, 12), 0x1c1c1f, [(i % 2) * .06, .17 + i * .3, 0], [Math.PI / 2, 0, i])); return mesh(merged(p)); }
export function treeModel(s){
  return mesh(merged([part(G.cyl(.15 * s, .22 * s, 1.4 * s, 6), 0x6b4a2a, [0, .7 * s, 0]), part(G.cone(1.3 * s, 2.2 * s, 7), 0x3a6b2c, [0, 2.2 * s, 0]), part(G.cone(1.0 * s, 1.8 * s, 7), 0x4b7f35, [0, 3.1 * s, 0]), part(G.cone(.7 * s, 1.4 * s, 7), 0x5a9040, [0, 3.9 * s, 0])]));
}
export function barrelFire(){ return mesh(merged([part(G.cyl(.4, .4, 1.0, 9), 0x6a5040, [0, .5, 0]), part(G.cyl(.42, .42, .06, 9), 0x3a2a20, [0, .7, 0]), part(G.cyl(.36, .36, .05, 9), 0x111111, [0, 1.0, 0])])); }
export function gullModel(){ const g = new THREE.Group(); const body = mesh(merged([part(G.box(.14, .12, .5), 0xf4f4f0), part(G.cone(.04, .12, 4), 0xf0b020, [0, 0, .3], [Math.PI / 2, 0, 0])]), null);
  const wl = new THREE.Group(), wr = new THREE.Group(); wl.add(mesh(merged([part(G.box(.6, .02, .2), 0xe8e8e4, [.3, 0, 0]), part(G.box(.2, .025, .2), 0x333333, [.55, 0, 0])])));
  wr.add(mesh(merged([part(G.box(.6, .02, .2), 0xe8e8e4, [-.3, 0, 0]), part(G.box(.2, .025, .2), 0x333333, [-.55, 0, 0])]))); g.add(body, wl, wr); g.userData = {wl, wr}; g.traverse(o => { o.castShadow = false; }); return g; }
export function fencePost(){ return part(G.box(.12, 2.0, .12), 0x5d4630, [0, 1.0, 0]); }
export {part, G};
