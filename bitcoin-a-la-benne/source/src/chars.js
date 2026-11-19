/* =========================================================
   PERSONNAGES ET ACCESSOIRES DÉTAILLÉS (formes arrondies, ombrage doux)
   Tout est fabriqué en code. Chaque personnage a des articulations
   (épaules, coudes, hanches, genoux) animées par render.js.
   ========================================================= */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {part, merged} from './models.js';

/* ---------- Matériaux ---------- */
export const SOFT = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.78, metalness:0});
export const METAL = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.32, metalness:.65});
export const SOFT2 = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.78, metalness:0, side:THREE.DoubleSide});
function mk(parts, m = SOFT){ const o = new THREE.Mesh(merged(parts), m); o.castShadow = true; o.receiveShadow = true; return o; }

/* ---------- Géométries arrondies ---------- */
const sph = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
const hemi = (r, w = 16, h = 8, t = Math.PI / 2) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, t);
const cap = (r, len, rs = 12) => new THREE.CapsuleGeometry(r, len, 5, rs);
const cyl = (rt, rb, h, s = 16, open = false, t0 = 0, tl = Math.PI * 2) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open, t0, tl);
const tor = (r, t, rs = 8, ts = 18, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const rbox = (w, h, d, r = .04) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
const cone = (r, h, s = 12) => new THREE.ConeGeometry(r, h, s);
const dark = (c, f = .75) => new THREE.Color(c).multiplyScalar(f).getHex();
const P = part;

/* =========================================================
   PERSONNAGE
   options : shirt, trim, pants, shoes, sole, skin, hair, style ('messy','short','bun','bald'),
             hat ('beanie','cap','helmet'), beard, glasses, nose, logo, apron, skirt, coat, scarf,
             vest, gloves, headphones, backpack, earrings, print
   ========================================================= */
export function person(o = {}){
  const skin = o.skin || 0xf2c49b, shirt = o.shirt || 0xf7931a, trim = o.trim || dark(shirt, .8), pants = o.pants || 0x34507a, shoes = o.shoes || 0x5a3a26, hair = o.hair || 0x5b3a1e;
  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = .94; g.add(hips);
  // bassin + ceinture
  hips.add(mk([P(sph(.2, 16, 10), o.skirt || pants, [0, .02, 0], [0, 0, 0], [1.05, .62, .78]),
    ...(o.skirt ? [] : [P(cyl(.205, .205, .05, 18), 0x4a3020, [0, .1, 0], [0, 0, 0], [1.02, 1, .8]), P(rbox(.07, .055, .02, .01), 0xd8b040, [0, .1, .162])])]));
  if(o.skirt) hips.add(mk([P(cyl(.21, .3, .48, 18), o.skirt, [0, -.17, 0], [0, 0, 0], [1, 1, .85]), P(cyl(.302, .302, .03, 18), dark(o.skirt, .7), [0, -.4, 0], [0, 0, 0], [1, 1, .85])]));
  if(o.coat) hips.add(mk([P(cyl(.23, .3, .55, 18, true), o.coat, [0, -.2, 0], [0, 0, 0], [1, 1, .85])], SOFT2));
  // --- jambes (hanche → genou → pied) ---
  const leg = side => {
    const hip = new THREE.Group(); hip.position.set(side * .105, -.02, 0); hips.add(hip);
    const lc = o.skirt ? (o.stockings || 0xd8b8a0) : pants;
    hip.add(mk([P(cap(.088, .24), lc, [0, -.2, 0])]));
    const knee = new THREE.Group(); knee.position.y = -.42; hip.add(knee);
    knee.add(mk([P(cap(.078, .24), lc, [0, -.18, 0]), ...(o.skirt ? [] : [P(tor(.082, .022, 6, 16), dark(pants, .8), [0, -.34, 0], [Math.PI / 2, 0, 0])])]));
    const sole = o.sole || 0xf2efe8;
    knee.add(mk([P(sph(.1, 14, 10), shoes, [0, -.43, .045], [0, 0, 0], [1.05, .7, 1.55]), P(rbox(.2, .04, .32, .02), sole, [0, -.48, .045]),
      P(sph(.06, 10, 8), dark(shoes, 1.25), [0, -.44, .17], [0, 0, 0], [1.4, .7, 1]),
      ...[0, 1, 2].map(i => P(box(.08, .012, .016), 0xffffff, [0, -.395, .03 + i * .04]))]));
    return {hip, knee};
  };
  const L = leg(1), Rl = leg(-1);
  // --- buste ---
  const torso = new THREE.Group(); torso.position.y = .1; hips.add(torso);
  const tp = [P(cap(.2, .2, 16), shirt, [0, .3, 0], [0, 0, 0], [1.1, 1, .78]), P(cyl(.215, .22, .07, 18), trim, [0, .07, 0], [0, 0, 0], [1.08, 1, .8]),
    P(cyl(.07, .075, .1, 12), skin, [0, .6, 0])];
  if(o.hood !== false && !o.vest && !o.apron) tp.push(P(tor(.13, .055, 8, 18), trim, [0, .55, -.06], [Math.PI / 2.3, 0, 0]),
    P(cyl(.008, .008, .17, 5), 0xffffff, [.05, .45, .158]), P(cyl(.008, .008, .17, 5), 0xffffff, [-.05, .45, .158]), P(sph(.015, 6, 5), 0xffffff, [.05, .36, .16]), P(sph(.015, 6, 5), 0xffffff, [-.05, .36, .16]),
    P(rbox(.28, .12, .03, .015), trim, [0, .2, .15]));
  if(o.logo) tp.push(P(cyl(.06, .06, .012, 18), 0xffffff, [0, .36, .156], [Math.PI / 2, 0, 0]), P(box(.016, .07, .014), shirt, [-.012, .36, .163]),
    P(tor(.017, .007, 5, 10, Math.PI), shirt, [.002, .377, .163], [0, 0, -Math.PI / 2]), P(tor(.019, .007, 5, 10, Math.PI), shirt, [.002, .341, .163], [0, 0, -Math.PI / 2]));
  if(o.print) tp.push(P(cone(.06, .1, 5), o.print, [0, .36, .157], [Math.PI / 2, 0, 0]));
  if(o.apron) tp.push(P(rbox(.34, .5, .03, .02), o.apron, [0, .16, .158]), P(rbox(.16, .1, .02, .01), dark(o.apron, .8), [0, .05, .175]),
    P(box(.02, .22, .01), o.apron, [.12, .48, .14], [-.3, 0, 0]), P(box(.02, .22, .01), o.apron, [-.12, .48, .14], [-.3, 0, 0]));
  if(o.vest) tp.push(P(cap(.205, .17, 16), o.vest, [0, .3, 0], [0, 0, 0], [1.12, .95, .82]), P(cyl(.226, .226, .035, 18), 0xd8dde4, [0, .38, 0], [0, 0, 0], [1.12, 1, .82]), P(cyl(.226, .226, .035, 18), 0xd8dde4, [0, .22, 0], [0, 0, 0], [1.12, 1, .82]));
  if(o.coat) tp.push(P(cap(.215, .2, 16), o.coat, [0, .3, 0], [0, 0, 0], [1.12, 1.02, .8]), P(box(.02, .5, .02), dark(o.coat, .6), [0, .28, .17]), ...[0, 1, 2].map(i => P(sph(.02, 6, 5), 0xc8a040, [.04, .42 - i * .12, .17])));
  if(o.scarf) tp.push(P(tor(.1, .045, 8, 16), o.scarf, [0, .58, 0], [Math.PI / 2, 0, 0]), P(rbox(.08, .28, .03, .012), o.scarf, [.06, .44, .17], [.1, 0, .1]), P(box(.08, .02, .032), dark(o.scarf, .7), [.06, .32, .175]));
  torso.add(mk(tp));
  // --- tête ---
  const head = new THREE.Group(); head.position.y = .64; torso.add(head);
  const hp = [P(sph(.19, 18, 14), skin, [0, .18, 0], [0, 0, 0], [1, 1.03, .97]),
    P(sph(.045, 10, 8), skin, [.188, .17, 0], [0, 0, 0], [.55, 1, .85]), P(sph(.045, 10, 8), skin, [-.188, .17, 0], [0, 0, 0], [.55, 1, .85]),
    P(sph(.042, 10, 8), o.nose || dark(skin, .93), [0, .15, .19], [0, 0, 0], [1, .95, 1.1]),
    P(sph(.034, 10, 8), 0xffffff, [.068, .21, .158], [0, 0, 0], [1, 1.1, .6]), P(sph(.034, 10, 8), 0xffffff, [-.068, .21, .158], [0, 0, 0], [1, 1.1, .6]),
    P(sph(.019, 8, 6), 0x2a1a10, [.068, .205, .177]), P(sph(.019, 8, 6), 0x2a1a10, [-.068, .205, .177]),
    P(sph(.007, 5, 4), 0xffffff, [.062, .215, .193]), P(sph(.007, 5, 4), 0xffffff, [-.074, .215, .193]),
    P(rbox(.075, .02, .02, .008), dark(hair, .9), [.07, .265, .168], [0, 0, -.12]), P(rbox(.075, .02, .02, .008), dark(hair, .9), [-.07, .265, .168], [0, 0, .12]),
    P(tor(.035, .008, 5, 10, Math.PI), 0x8a2a2a, [0, .095, .165], [0, 0, Math.PI]),
    P(sph(.03, 8, 6), 0xf0a08a, [.11, .14, .14], [0, 0, 0], [1, .7, .4]), P(sph(.03, 8, 6), 0xf0a08a, [-.11, .14, .14], [0, 0, 0], [1, .7, .4])];
  const st = o.style || 'messy';
  if(!o.hat && st === 'messy') hp.push(P(hemi(.197, 18, 8, Math.PI / 2.1), hair, [0, .2, -.005], [-.15, 0, 0]),
    ...[[0, .36, .07, .075], [.08, .35, .05, .065], [-.08, .35, .05, .065], [.04, .38, -.04, .07], [-.05, .37, -.06, .065], [.12, .3, .1, .05], [-.12, .3, .1, .05], [0, .33, .14, .055]]
      .map(([x, y, z, r]) => P(sph(r, 10, 8), hair, [x, y, z])), P(rbox(.03, .1, .06, .01), hair, [.185, .2, .04]), P(rbox(.03, .1, .06, .01), hair, [-.185, .2, .04]));
  if(!o.hat && st === 'short') hp.push(P(hemi(.197, 18, 8, Math.PI / 2.2), hair, [0, .2, 0], [-.1, 0, 0]));
  if(st === 'bun') hp.push(P(hemi(.198, 18, 8, Math.PI / 2), hair, [0, .19, -.01], [-.25, 0, 0]), P(sph(.09, 12, 10), hair, [0, .38, -.12]), P(tor(.05, .015, 5, 12), dark(hair, .8), [0, .34, -.1], [-.6, 0, 0]));
  if(o.beard) hp.push(P(new THREE.SphereGeometry(.198, 18, 10, 0, Math.PI * 2, Math.PI * .52, Math.PI * .42), o.beard, [0, .19, .01], [0, 0, 0], [1, 1.05, 1.04]),
    P(cap(.024, .09, 8), o.beard, [0, .118, .19], [0, 0, Math.PI / 2]), P(sph(.05, 10, 8), o.beard, [0, .04, .16], [0, 0, 0], [1.3, .9, .8]));
  if(o.glasses) hp.push(P(tor(.038, .007, 5, 14), 0x333333, [.068, .21, .185]), P(tor(.038, .007, 5, 14), 0x333333, [-.068, .21, .185]), P(box(.06, .008, .008), 0x333333, [0, .215, .19]));
  if(o.earrings) hp.push(P(sph(.016, 6, 5), 0xf0d060, [.19, .11, 0]), P(sph(.016, 6, 5), 0xf0d060, [-.19, .11, 0]));
  if(o.hat === 'beanie') hp.push(P(hemi(.205, 18, 8), o.hatCol, [0, .22, 0]), P(cyl(.207, .207, .07, 18), dark(o.hatCol, .8), [0, .24, 0]), P(sph(.055, 10, 8), 0xf4f0e8, [0, .44, 0]));
  if(o.hat === 'cap') hp.push(P(hemi(.2, 18, 8), o.hatCol, [0, .23, 0]), P(cyl(.16, .16, .015, 16, false, 0, Math.PI), o.hatCol, [0, .245, -.14], [0, Math.PI / 2, 0], [1, 1, 1.15]), P(sph(.02, 6, 5), o.hatCol, [0, .43, 0]));
  if(o.hat === 'helmet') hp.push(P(hemi(.22, 18, 8), o.hatCol, [0, .23, 0], [0, 0, 0], [1, .9, 1.05]), P(cyl(.25, .25, .02, 20), o.hatCol, [0, .24, .02], [0, 0, 0], [1, 1, 1.15]), P(rbox(.05, .03, .4, .01), dark(o.hatCol, .85), [0, .42, 0]));
  if(o.headphones) hp.push(P(tor(.21, .018, 6, 18, Math.PI), 0x222222, [0, .2, 0]), P(cyl(.06, .06, .05, 14), 0xd03a3a, [.205, .18, 0], [0, 0, Math.PI / 2]), P(cyl(.06, .06, .05, 14), 0xd03a3a, [-.205, .18, 0], [0, 0, Math.PI / 2]));
  head.add(mk(hp));
  // --- bras (épaule → coude → main) ---
  const arm = side => {
    const sh = new THREE.Group(); sh.position.set(side * .255, .5, 0); torso.add(sh);
    const sleeve = o.vest ? (o.under || 0x3a5a8a) : o.coat || shirt;
    sh.add(mk([P(sph(.085, 12, 10), sleeve), P(cap(.07, .18), sleeve, [0, -.14, 0])]));
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el);
    el.add(mk([P(cap(.064, .16), sleeve, [0, -.12, 0]), P(tor(.065, .018, 6, 14), dark(sleeve, .8), [0, -.24, 0], [Math.PI / 2, 0, 0])]));
    const hand = new THREE.Group(); hand.position.y = -.29; el.add(hand);
    const hc = o.gloves || skin;
    hand.add(mk([P(sph(.06, 12, 10), hc, [0, -.03, 0], [0, 0, 0], [1, 1.25, .8]), P(cap(.022, .045, 6), hc, [side * -.045, -.02, .03], [.4, 0, side * .6])]));
    return {sh, el, hand};
  };
  const AL = arm(1), AR = arm(-1);
  // --- sac à dos ---
  const bag = new THREE.Group(); bag.position.set(0, .34, -.2); torso.add(bag);
  if(o.backpack){ bag.add(mk([P(rbox(.34, .4, .2, .07), 0x8a6232, [0, 0, -.04]), P(rbox(.36, .14, .22, .05), 0x6e4c24, [0, .16, -.035]), P(rbox(.22, .16, .06, .03), 0x7a5428, [0, -.07, -.155]),
    P(rbox(.05, .05, .02, .01), 0xd8b040, [0, .1, -.155]), P(tor(.17, .022, 6, 14, Math.PI), 0x5a3a18, [.12, .02, .1], [0, Math.PI / 2, Math.PI / 2]), P(tor(.17, .022, 6, 14, Math.PI), 0x5a3a18, [-.12, .02, .1], [0, Math.PI / 2, Math.PI / 2]),
    P(cyl(.05, .05, .3, 10), 0x4a5a3a, [0, .23, -.06], [0, 0, Math.PI / 2])])); }
  g.userData = {hips, torso, head, armL:AL.sh, armR:AR.sh, elbowL:AL.el, elbowR:AR.el, legL:L.hip, legR:Rl.hip, kneeL:L.knee, kneeR:Rl.knee, hand:AR.hand, handL:AL.hand, bag, baseY:.94};
  return g;
}
/* Apparences des personnages */
export const LOOKS = {
  kevin:{shirt:0xf28a1a, trim:0xd06c10, pants:0x34507a, shoes:0x3a3a42, hair:0x5b3a1e, beard:0x5b3a1e, logo:true, backpack:true},
  josiane:{shirt:0x8a5a9a, apron:0x4f86c6, skirt:0x5a4a6a, stockings:0xc8a890, shoes:0xe090a8, sole:0xf0d0d8, hair:0xd0d0d4, style:'bun', glasses:true, earrings:true, skin:0xf0c8a8},
  gege:{coat:0x6b4a2e, shirt:0x6b4a2e, pants:0x3b3b3b, shoes:0x2a2018, hat:'beanie', hatCol:0xb03030, beard:0xb8b8b4, hair:0xb8b8b4, nose:0xe07070, scarf:0x2f6a3a, gloves:0x6a6a5a, style:'short'},
  stag:{shirt:0x3a78c0, hood:false, print:0xffd040, pants:0x2a3550, shoes:0xf0f0f0, sole:0xd03030, hat:'cap', hatCol:0xd03030, headphones:true, hair:0x2a1a10, style:'short', skin:0xd8a078},
  ferr:{vest:0xff8a20, under:0x3a5a8a, shirt:0x3a5a8a, pants:0x2a3a5a, shoes:0x5a3a20, hat:'helmet', hatCol:0xf0c020, gloves:0x8a6a3a, beard:0x3a2a1a, hair:0x3a2a1a, style:'short', skin:0xc89070},
};

/* =========================================================
   OUTILS (le manche part de la main vers le bas, -Y)
   ========================================================= */
export function toolModel(tier){
  const g = new THREE.Group(), wood = [], metal = [];
  const shaft = (len, col = 0x9a6a3a) => { wood.push(P(cyl(.022, .024, len, 10), col, [0, -len / 2 + .3, 0])); for(let i = 0; i < 3; i++) wood.push(P(cyl(.0235, .0235, .01, 10), dark(col, .8), [0, .2 - i * .32, 0])); };
  if(tier === 0 || tier === 3){
    const gold = tier === 3, bl = gold ? 0xf2c230 : 0x8a7a68;
    shaft(1.05, gold ? 0x7a4a2a : 0x9a6a3a);
    (gold ? metal : wood).push(P(tor(.065, .016, 6, 14, Math.PI), gold ? 0xf2c230 : 0x2a2a2a, [0, .33, 0]), P(cyl(.018, .018, .13, 8), gold ? 0xf2c230 : 0x2a2a2a, [0, .394, 0], [0, 0, Math.PI / 2]));
    metal.push(P(cyl(.03, .045, .14, 10), dark(bl, .85), [0, -.78, 0]),
      P(new THREE.CylinderGeometry(.33, .33, .32, 14, 1, true, -.42, .84), bl, [0, -.98, .3], [0, Math.PI, 0]),
      P(new THREE.CylinderGeometry(.33, .33, .02, 14, 1, false, -.42, .84), dark(bl, .85), [0, -.83, .3], [0, Math.PI, 0]));
    if(!gold) wood.push(...[[-.05, -.95], [.07, -1.05], [0, -1.08]].map(([x, y]) => P(sph(.03, 6, 5), 0x7a4a28, [x, y, .015], [0, 0, 0], [1, 1, .3])));
    if(gold) metal.push(P(new THREE.OctahedronGeometry(.045), 0x40d0ff, [0, -.93, .03]));
  }
  if(tier === 1){
    shaft(1.0, 0x8a5a30);
    metal.push(P(tor(.32, .035, 8, 20, 1.6), 0x8e939a, [0, .02, 0], [0, 0, Math.PI / 2 - .8]), P(cone(.035, .16, 8), 0xb0b4ba, [.27, .2, 0], [0, 0, -1.9]), P(cone(.035, .16, 8), 0xb0b4ba, [-.27, .2, 0], [0, 0, 1.9]),
      P(rbox(.09, .1, .09, .02), 0x6a6e74, [0, .32, 0]));
  }
  if(tier === 2){
    metal.push(P(cyl(.075, .085, .42, 14), 0xd23a3a, [0, -.32, 0]), P(rbox(.2, .14, .16, .03), 0x333333, [0, -.05, 0]),
      P(cyl(.02, .02, .4, 8), 0x555555, [0, .04, 0], [0, 0, Math.PI / 2]), P(cap(.03, .08, 8), 0x1a1a1a, [.21, .04, 0], [0, 0, Math.PI / 2]), P(cap(.03, .08, 8), 0x1a1a1a, [-.21, .04, 0], [0, 0, Math.PI / 2]),
      P(cyl(.025, .025, .3, 8), 0xa0a4aa, [0, -.66, 0]), P(cone(.026, .1, 8), 0xc0c4ca, [0, -.86, 0], [Math.PI, 0, 0]), P(tor(.12, .02, 6, 14, Math.PI * 1.3), 0x2a2a2a, [.12, -.2, -.05], [0, Math.PI / 2, 0]));
  }
  g.userData.tier = tier;
  if(wood.length) g.add(mk(wood)); if(metal.length) g.add(mk(metal, METAL));
  g.traverse(m => { m.castShadow = true; });
  return g;
}

/* =========================================================
   ANIMAUX, VÉHICULES, ACCESSOIRES
   ========================================================= */
export function dogModel(){
  const g = new THREE.Group(), fur = 0xa8703a, light = 0xf0e0c8;
  g.add(mk([P(cap(.16, .36, 14), fur, [0, .48, 0], [Math.PI / 2, 0, 0]), P(sph(.13, 12, 10), light, [0, .43, .12], [0, 0, 0], [1, .9, 1.3]), P(sph(.06, 8, 6), 0x6a4020, [.08, .58, -.1], [0, 0, 0], [1, .6, 1.4]),
    ...[[-.1, .18], [.1, .18], [-.1, -.2], [.1, -.2]].map(([x, z]) => P(cap(.05, .24, 8), fur, [x, .2, z])), ...[[-.1, .18], [.1, .18], [-.1, -.2], [.1, -.2]].map(([x, z]) => P(sph(.06, 8, 6), light, [x, .04, z + .02], [0, 0, 0], [1, .6, 1.3]))]));
  const head = new THREE.Group(); head.position.set(0, .66, .3); g.add(head);
  head.add(mk([P(sph(.16, 14, 12), fur), P(cap(.07, .1, 10), light, [0, -.04, .15], [Math.PI / 2, 0, 0]), P(sph(.035, 8, 6), 0x1a1a1a, [0, -.01, .25]),
    P(sph(.025, 8, 6), 0x1a1a1a, [.06, .05, .135]), P(sph(.025, 8, 6), 0x1a1a1a, [-.06, .05, .135]), P(sph(.008, 4, 4), 0xffffff, [.055, .058, .158]), P(sph(.008, 4, 4), 0xffffff, [-.065, .058, .158]),
    P(cap(.045, .14, 8), 0x6a4020, [.13, -.02, -.02], [0, 0, .35]), P(cap(.045, .14, 8), 0x6a4020, [-.13, -.02, -.02], [0, 0, -.35]), P(cap(.03, .02, 6), 0xd05060, [0, -.09, .2], [.4, 0, 0])]));
  g.add(mk([P(tor(.12, .025, 6, 16), 0xd23a3a, [0, .62, .22], [1.2, 0, 0]), P(cyl(.03, .03, .01, 10), 0xf2c230, [0, .52, .3], [1.3, 0, 0])]));
  const tail = new THREE.Group(); tail.position.set(0, .56, -.3); g.add(tail);
  tail.add(mk([P(cap(.035, .2, 8), fur, [0, .1, -.04], [-.5, 0, 0]), P(sph(.04, 8, 6), light, [0, .22, -.1])]));
  g.userData = {head, tail}; return g;
}
export function brouetteModel(){
  const g = new THREE.Group(), paint = 0x2f8a4a;
  g.add(mk([P(new THREE.CylinderGeometry(.5, .36, .34, 4, 1, true), paint, [0, .62, .22], [0, Math.PI / 4, 0], [.92, 1, 1.3])], SOFT2));
  g.add(mk([P(rbox(.5, .03, .62, .01), dark(paint, .7), [0, .46, .22]), P(new THREE.CylinderGeometry(.515, .5, .05, 4, 1, true), dark(paint, .8), [0, .79, .22], [0, Math.PI / 4, 0], [.92, 1, 1.3]),
    P(tor(.17, .06, 10, 18), 0x1c1c1f, [0, .2, .82], [0, Math.PI / 2, 0]), P(cyl(.07, .07, .1, 12), 0xc8ccd2, [0, .2, .82], [0, 0, Math.PI / 2]),
    ...[0, 1, 2, 3, 4, 5].map(i => P(box(.012, .23, .012), 0xa0a4aa, [0, .2, .82], [i * Math.PI / 3, 0, 0])),
    P(cyl(.025, .025, 1.5, 8), 0x8a8e94, [.24, .48, .05], [Math.PI / 2.25, 0, 0]), P(cyl(.025, .025, 1.5, 8), 0x8a8e94, [-.24, .48, .05], [Math.PI / 2.25, 0, 0]),
    P(cap(.03, .14, 8), 0x1a1a1a, [.24, .76, -.7], [Math.PI / 2.25, 0, 0]), P(cap(.03, .14, 8), 0x1a1a1a, [-.24, .76, -.7], [Math.PI / 2.25, 0, 0]),
    P(box(.03, .4, .03), 0x8a8e94, [.22, .22, -.25]), P(box(.03, .4, .03), 0x8a8e94, [-.22, .22, -.25])], METAL));
  const load = new THREE.Group(); load.position.set(0, .72, .2); g.add(load); g.userData = {load}; return g;
}

/* =========================================================
   GROS OBJETS ET CONTENANTS (porte / couvercle animable, mêmes pivots qu'avant)
   ========================================================= */
export function bigModel(kind){
  const g = new THREE.Group(); let door = null;
  if(kind === 'tv'){ g.add(mk([P(rbox(.9, .7, .45, .08), 0x6a5038, [0, .38, .08]), P(sph(.34, 14, 10), 0x4a3a2a, [0, .4, -.15], [0, 0, 0], [1.1, .9, .8]), P(rbox(.66, .5, .04, .06), 0x2e4848, [-.07, .4, .31]),
      P(rbox(.5, .32, .02, .04), 0x8ab8c0, [-.12, .45, .33]), P(cyl(.035, .035, .03, 10), 0xd0c090, [.32, .5, .31], [Math.PI / 2, 0, 0]), P(cyl(.035, .035, .03, 10), 0xd0c090, [.32, .38, .31], [Math.PI / 2, 0, 0]),
      P(cyl(.012, .012, .5, 6), 0xb0b0b0, [.15, .95, -.05], [0, 0, .45]), P(cyl(.012, .012, .5, 6), 0xb0b0b0, [-.15, .95, -.05], [0, 0, -.45]), P(sph(.03), 0xd03030, [.26, 1.17, -.05]), P(sph(.03), 0xd03030, [-.26, 1.17, -.05]),
      ...[[-.35, -.05], [.35, -.05]].map(([x, z]) => P(cyl(.03, .04, .06, 8), 0x2a2a2a, [x, .03, z]))])); }
  if(kind === 'fridge'){ g.add(mk([P(rbox(.9, 1.8, .8, .07), 0xe8ecef, [0, .92, -.02]), P(rbox(.92, .05, .02, .01), 0xb0b4b8, [0, 1.25, .39]), ...[[-.38, -.32], [.38, -.32], [-.38, .32], [.38, .32]].map(([x, z]) => P(cyl(.04, .04, .05, 8), 0x333333, [x, .02, z]))]));
    door = new THREE.Group(); door.position.set(-.45, 0, .4); door.add(mk([P(rbox(.9, 1.76, .07, .03), 0xf6f8fa, [.45, .92, .03]), P(cap(.025, .5, 8), 0xc0c4ca, [.8, 1.0, .1]), P(rbox(.12, .08, .02, .01), 0xd03030, [.25, 1.4, .07]), P(rbox(.08, .1, .02, .01), 0x30a0d0, [.5, 1.55, .07]), P(sph(.03), 0xf0d040, [.3, 1.2, .07])])); g.add(door); }
  if(kind === 'wash'){ g.add(mk([P(rbox(.8, .9, .72, .07), 0xf2f2f0, [0, .47, 0]), P(tor(.24, .04, 10, 24), 0xc8ccd2, [0, .45, .36]), P(cyl(.21, .21, .02, 24), 0x7aa8d0, [0, .45, .355], [Math.PI / 2, 0, 0]),
      P(rbox(.7, .14, .02, .02), 0xd0d4d8, [0, .82, .36]), P(cyl(.04, .04, .03, 12), 0x555555, [.22, .82, .375], [Math.PI / 2, 0, 0]), P(rbox(.2, .06, .02, .01), 0x40c060, [-.18, .82, .375])])); }
  if(kind === 'moto'){ const wheel = x => [P(tor(.3, .085, 10, 20), 0x1c1c1f, [x, .36, 0]), P(cyl(.08, .08, .1, 12), 0xc8ccd2, [x, .36, 0], [Math.PI / 2, 0, 0]), ...[0, 1, 2, 3, 4, 5].map(i => P(box(.01, .45, .01), 0xb0b4ba, [x, .36, 0], [0, 0, i * Math.PI / 6]))];
    g.add(mk([...wheel(.68), ...wheel(-.68), P(sph(.28, 14, 10), 0xc02a2a, [.12, .86, 0], [0, 0, 0], [1.4, .7, .8]), P(rbox(.6, .1, .3, .04), 0x2a2a2a, [-.32, .9, 0]),
      P(cyl(.025, .025, .7, 8), 0xc0c4ca, [.62, .95, 0], [Math.PI / 2, 0, 0]), P(cap(.03, .08, 8), 0x1a1a1a, [.62, .95, .37], [Math.PI / 2, 0, 0]), P(cap(.03, .08, 8), 0x1a1a1a, [.62, .95, -.37], [Math.PI / 2, 0, 0]),
      P(cyl(.11, .12, .12, 14), 0xf0f0e0, [.82, .88, 0], [0, 0, Math.PI / 2]), P(cyl(.04, .055, .8, 10), 0xc8ccd2, [-.3, .45, .18], [0, 0, Math.PI / 2 + .1]),
      P(rbox(.4, .3, .25, .05), 0x555a60, [0, .55, 0]), P(cyl(.025, .025, .55, 8), 0xa0a4aa, [.58, .62, .06], [0, 0, .5]), P(cyl(.025, .025, .55, 8), 0xa0a4aa, [.58, .62, -.06], [0, 0, .5])], METAL)); }
  if(kind === 'statue'){ g.add(mk([P(rbox(.7, .35, .7, .04), 0x8a8a8a, [0, .17, 0]), P(rbox(.6, .06, .6, .02), 0xa0a0a0, [0, .37, 0]), P(cyl(.2, .26, .9, 14), 0x8a6a2a, [0, .85, 0]),
      P(sph(.17, 14, 12), 0x8a6a2a, [0, 1.45, 0]), ...[0, 1, 2, 3, 4, 5, 6].map(i => P(cone(.04, .14, 6), 0x8a6a2a, [Math.cos(i) * .14, 1.58, Math.sin(i) * .14 - .03], [Math.sin(i) * .5, 0, -Math.cos(i) * .5])),
      P(cap(.055, .55, 8), 0x8a6a2a, [.28, 1.45, 0], [0, 0, -.35]), P(cyl(.06, .04, .2, 10), 0x8a6a2a, [.4, 1.85, 0]), P(cone(.07, .2, 10), 0xffc040, [.4, 2.03, 0]), P(rbox(.28, .34, .06, .02), 0x7a5a20, [-.16, 1.0, .2], [0, 0, .3])], METAL)); }
  if(kind === 'safe'){ g.add(mk([P(rbox(.9, 1.0, .85, .06), 0x3a4a5a, [0, .55, 0]), ...[[-.38, -.36], [.38, -.36], [-.38, .36], [.38, .36]].map(([x, z]) => P(cyl(.05, .06, .06, 8), 0x222222, [x, .03, z])),
      ...[0, 1].map(i => P(cyl(.025, .025, .14, 8), 0x9aa0a8, [-.43, .3 + i * .5, .43]))], METAL));
    door = new THREE.Group(); door.position.set(-.4, 0, .43); door.add(mk([P(rbox(.8, .86, .07, .03), 0x4a5a6c, [.4, .55, .03]), P(cyl(.13, .13, .05, 24), 0xd0b050, [.42, .62, .08], [Math.PI / 2, 0, 0]),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => P(box(.012, .03, .01), 0x222222, [.42 + Math.cos(i * .785) * .1, .62 + Math.sin(i * .785) * .1, .11])), P(cyl(.025, .025, .05, 10), 0x222222, [.42, .62, .11], [Math.PI / 2, 0, 0]),
      P(cyl(.02, .02, .22, 8), 0xd0d0d0, [.42, .32, .1], [0, 0, Math.PI / 2]), P(cyl(.02, .02, .22, 8), 0xd0d0d0, [.42, .32, .1]),
      ...[[.1, .22], [.7, .22], [.1, .88], [.7, .88]].map(([x, y]) => P(sph(.02, 6, 5), 0x9aa0a8, [x, y, .07]))], METAL)); g.add(door); }
  g.userData.door = door; return g;
}
export function contModel(kind){
  const g = new THREE.Group(); let door = null;
  if(kind === 'bin'){ g.add(mk([P(cyl(.38, .3, .95, 18), 0x3a7a4a, [0, .5, 0]), ...[0, 1, 2].map(i => P(tor(.36 - i * .03, .015, 5, 18), 0x2f6a3f, [0, .25 + i * .25, 0], [Math.PI / 2, 0, 0])),
      P(cyl(.08, .08, .05, 12), 0x1a1a1a, [.22, .08, -.3], [0, 0, Math.PI / 2]), P(cyl(.08, .08, .05, 12), 0x1a1a1a, [-.22, .08, -.3], [0, 0, Math.PI / 2]), P(cap(.025, .5, 8), 0x2a5a3a, [0, .9, -.38], [0, 0, Math.PI / 2]),
      P(rbox(.2, .15, .01, .02), 0xf0f0f0, [0, .6, .345])]));
    door = new THREE.Group(); door.position.set(0, .97, -.38); door.add(mk([P(cyl(.4, .4, .06, 18), 0x2f6a3f, [0, .03, .38]), P(rbox(.16, .04, .06, .015), 0x24502f, [0, .07, .7])])); g.add(door); }
  if(kind === 'case'){ g.add(mk([P(rbox(.85, .26, .6, .05), 0x8a3a2a, [0, .14, 0]), ...[[-.33, .26], [.33, .26]].map(([x, z]) => P(cyl(.04, .04, .04, 10), 0x1a1a1a, [x, .02, z], [0, 0, Math.PI / 2])),
      P(rbox(.86, .05, .1, .02), 0x6a2a1a, [-.25, .14, 0]), P(rbox(.86, .05, .1, .02), 0x6a2a1a, [.25, .14, 0])]));
    door = new THREE.Group(); door.position.set(0, .26, -.3); door.add(mk([P(rbox(.85, .18, .6, .05), 0x9a4a32, [0, .09, .3]), P(rbox(.86, .04, .1, .015), 0xd8c050, [0, .09, .59]),
      P(tor(.07, .018, 6, 12, Math.PI), 0x2a2a2a, [0, .2, .3], [0, 0, 0]), P(cyl(.06, .06, .01, 12), 0x40a0e0, [.22, .185, .4]), P(rbox(.14, .1, .01, .01), 0xf0e0a0, [-.2, .185, .2], [0, .3, 0])])); g.add(door); }
  if(kind === 'ward'){ g.add(mk([P(rbox(1.1, 1.9, .6, .03), 0x7a5230, [0, 1.0, 0]), P(rbox(1.2, .1, .66, .03), 0x5a3a20, [0, 1.98, 0]), ...[[-.48, -.24], [.48, -.24], [-.48, .24], [.48, .24]].map(([x, z]) => P(cyl(.04, .03, .1, 8), 0x4a2a18, [x, .05, z]))]));
    door = new THREE.Group(); door.position.set(-.55, 0, .31); door.add(mk([P(rbox(1.08, 1.82, .05, .02), 0x8a6240, [.54, 1.0, 0]), P(rbox(.8, .7, .02, .02), 0x7a5230, [.54, 1.45, .03]), P(rbox(.8, .7, .02, .02), 0x7a5230, [.54, .6, .03]),
      P(rbox(.5, .4, .015, .02), 0xa8c0cc, [.54, 1.45, .045]), P(sph(.035, 8, 6), 0xd8c050, [.97, 1.0, .05])])); g.add(door); }
  if(kind === 'trunk'){ g.add(mk([P(rbox(1.75, .6, 3.5, .18), 0x8a4a3a, [0, .58, 0]), P(rbox(1.55, .55, 1.7, .2), 0x7a4234, [0, 1.12, .15]), P(rbox(1.45, .4, 1.6, .12), 0x3e5060, [0, 1.15, .17]),
      ...[[-.86, 1.15], [.86, 1.15], [-.86, -1.15], [.86, -1.15]].map(([x, z]) => P(cyl(.33, .33, .26, 16), 0x1c1c1f, [x, .33, z], [0, 0, Math.PI / 2])),
      ...[[-.86, 1.15], [.86, 1.15], [-.86, -1.15], [.86, -1.15]].map(([x, z]) => P(cyl(.18, .18, .27, 12), 0x9a9ea4, [x, .33, z], [0, 0, Math.PI / 2])),
      P(rbox(1.75, .16, .14, .05), 0xb0b0b0, [0, .4, 1.76]), P(rbox(1.75, .16, .14, .05), 0xb0b0b0, [0, .4, -1.76]), P(sph(.1, 10, 8), 0xf0f0d0, [.6, .65, 1.75], [0, 0, 0], [1, .8, .4]), P(sph(.1, 10, 8), 0xf0f0d0, [-.6, .65, 1.75], [0, 0, 0], [1, .8, .4]),
      ...[[.5, .9, .7], [-.3, .7, -.6], [.7, .6, .3]].map(([x, y, z]) => P(sph(.18, 8, 6), 0x6a3a1a, [x, y, z], [0, 0, 0], [1, .15, 1.4]))]));
    door = new THREE.Group(); door.position.set(0, .88, -1.2); door.add(mk([P(rbox(1.6, .08, .58, .04), 0x9a5444, [0, 0, -.29]), P(sph(.08, 8, 6), 0xd03030, [.6, -.02, -.56], [0, 0, 0], [1, .5, .3]), P(sph(.08, 8, 6), 0xd03030, [-.6, -.02, -.56], [0, 0, 0], [1, .5, .3])])); g.add(door); }
  g.userData.door = door; return g;
}
