/* =========================================================
   MODÈLES 3D GRATUITS (licence CC0, intégrés dans le fichier du jeu)
   - Personnages animés « KayKit Adventurers » de Kay Lousberg
   - Camion et moto des « Starter Kits » de Kenney
   Les armes ont été retirées des personnages ; on leur met nos outils dans la main.
   ========================================================= */
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import animsGlb from '../assets/kaykit-anims.glb';
import barbGlb from '../assets/kaykit-barbarian.glb';
import knightGlb from '../assets/kaykit-knight.glb';
import mageGlb from '../assets/kaykit-mage.glb';
import rogueGlb from '../assets/kaykit-rogue.glb';
import truckGlb from '../assets/kenney-truck.glb';
import motoGlb from '../assets/kenney-moto.glb';

const SRC = {hooded:animsGlb, barbarian:barbGlb, knight:knightGlb, mage:mageGlb, rogue:rogueGlb, truck:truckGlb, moto:motoGlb};
const BASE = {}; let CLIPS = [];
const parse = bin => new Promise((res, rej) => new GLTFLoader().parse(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength), '', res, rej));

export const kayReady = Promise.all(Object.entries(SRC).map(([k, bin]) => parse(bin).then(g => {
  BASE[k] = g.scene; if(k === 'hooded') CLIPS = g.animations;
  g.scene.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
}))).then(() => true).catch(e => { console.warn('modèles 3D', e); return false; });
export const kayLoaded = () => !!BASE.hooded;

/* ---------- recoloration : on change une teinte de la palette de texture ---------- */
const texCache = {};
function recolor(baseTex, key, rules){
  if(texCache[key]) return texCache[key];
  const img = baseTex.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); const d = cx.getImageData(0, 0, cv.width, cv.height), p = d.data;
  const c = new THREE.Color(), hsl = {};
  for(let i = 0; i < p.length; i += 4){
    c.setRGB(p[i] / 255, p[i + 1] / 255, p[i + 2] / 255); c.getHSL(hsl);
    for(const r of rules) if(hsl.s > (r.minS ?? .2) && Math.abs(((hsl.h - r.from + 1.5) % 1) - .5) < r.range){
      c.setHSL(r.to, Math.min(1, hsl.s * (r.sat ?? 1)), Math.min(1, hsl.l * (r.light ?? 1))); p[i] = c.r * 255; p[i + 1] = c.g * 255; p[i + 2] = c.b * 255; break; }
  }
  cx.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.flipY = baseTex.flipY; t.colorSpace = baseTex.colorSpace; t.magFilter = baseTex.magFilter; t.minFilter = baseTex.minFilter;
  return texCache[key] = t;
}

/* ---------- qui est qui ---------- */
export const CAST = {
  kevin:{base:'hooded', recolor:[{from:.38, range:.09, to:.58, sat:.9}]},                       // sweat à capuche bleu
  josiane:{base:'rogue', recolor:[{from:.38, range:.09, to:.88, sat:.75, light:1.1}], hide:['Rogue_Cape']}, // gilet prune
  gege:{base:'barbarian', hide:['Barbarian_Cape']},
  stag:{base:'mage', recolor:[{from:.72, range:.08, to:.08, sat:1.1}]},                        // chapeau orange de stagiaire
  ferr:{base:'knight', recolor:[{from:0, range:.04, to:.12, sat:1}], hide:['Knight_Cape']},
};
const HEIGHT = 1.75;

/** Un personnage animé prêt à l'emploi (ou null si les modèles ne sont pas encore chargés) */
export function makeChar(who){
  const def = CAST[who] || CAST.gege; if(!BASE[def.base]) return null;
  const m = SkeletonUtils.clone(BASE[def.base]);
  const parts = {};
  m.traverse(o => { parts[o.name] = o;
    if(o.isMesh && def.recolor){ const mat = o.material.clone(); if(mat.map) mat.map = recolor(mat.map, who, def.recolor); o.material = mat; }
  });
  for(const h of def.hide || []) if(parts[h]) parts[h].visible = false;
  // taille : on mesure le personnage pour qu'il fasse la même hauteur que l'ancien
  m.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(m), s = HEIGHT / Math.max(.01, box.max.y - box.min.y);
  m.scale.setScalar(s);
  const g = new THREE.Group(); g.add(m);
  const mixer = new THREE.AnimationMixer(m), act = {};
  for(const c of CLIPS) act[c.name] = mixer.clipAction(c);
  for(const n of ['PickUp', 'Cheer', 'Throw', 'Hit_A']) if(act[n]){ act[n].setLoop(THREE.LoopOnce); act[n].clampWhenFinished = true; }
  const hand = new THREE.Group(); (parts.handslotr || m).add(hand); hand.scale.setScalar(1 / s);
  const legs = Object.keys(parts).filter(n => /LegLeft|LegRight/.test(n)).map(n => parts[n]);
  g.userData = {mixer, act, cur:null, kay:true, hand, legs, bones:parts, model:m};
  playChar(g, 'Idle');
  return g;
}
export function playChar(g, name, speed = 1){
  const u = g.userData; const next = u.act[name]; if(!next) return;
  next.timeScale = speed;
  if(u.cur === name) return;
  next.reset().fadeIn(.2).play(); if(u.cur && u.act[u.cur]) u.act[u.cur].fadeOut(.2); u.cur = name;
}

/* ---------- véhicule et moto Kenney ---------- */
function fit(obj, len, axis){
  obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj), sz = b.getSize(new THREE.Vector3());
  const s = len / Math.max(.01, axis === 'x' ? sz.x : sz.z); obj.scale.setScalar(s); obj.position.y = -b.min.y * s; return obj;
}
export function kenneyTruck(){
  if(!BASE.truck) return null;
  const m = fit(BASE.truck.clone(), 4.6, 'z');
  const g = new THREE.Group(); g.add(m);
  const load = new THREE.Group(); load.position.set(0, 1.25, -1.0); g.add(load); g.userData = {load, kenney:true};
  return g;
}
export function kenneyMoto(){
  if(!BASE.moto) return null;
  const m = BASE.moto.clone(); m.rotation.y = Math.PI / 2; const w = new THREE.Group(); w.add(m); fit(w, 2.0, 'x');
  const g = new THREE.Group(); g.add(w); return g;
}
