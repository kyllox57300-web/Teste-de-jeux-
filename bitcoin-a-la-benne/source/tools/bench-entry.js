// banc d'essai (tests) : personnages KayKit + outils, pose figée
import * as THREE from 'three';
import * as CH from '../src/chars.js';
import {kayReady, makeChar, playChar} from '../src/kaykit.js';
const q = new URLSearchParams(location.search), rot = JSON.parse(q.get('rot') || '[0,0,3.14159]'), anim = q.get('anim') || '2H_Melee_Attack_Chop', who = (q.get('who') || 'kevin').split(','), times = JSON.parse(q.get('t') || '[0,0.25,0.5,0.75]'), tiers = JSON.parse(q.get('tiers') || '[0]');
const r = new THREE.WebGLRenderer({antialias:true}); r.setSize(1400, 600); document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0x9fd0ff); s.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.6)); const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(3, 5, 4); s.add(d);
const c = new THREE.PerspectiveCamera(30, 1400 / 600, .1, 100); c.position.set(0, 1.2, +(q.get('cz') || 11)); c.lookAt(0, .9, 0);
kayReady.then(() => {
  const list = []; for(const w of who) for(const tr of tiers) for(const t of times) list.push([w, t, tr]);
  list.forEach(([w, t, tier], i) => { const g = makeChar(w); g.position.x = (i - (list.length - 1) / 2) * 1.5; g.rotation.y = +(q.get('ry') || 1.57) + (q.get('carry') ? -.9 : 0); s.add(g);
    const tool = CH.toolModel(tier); tool.rotation.set(...rot); if(q.get('py')) tool.position.y = +q.get('py'); g.userData.hand.add(tool);
    playChar(g, anim); const a = g.userData.act[anim]; g.userData.mixer.update(.01); a.time = a.getClip().duration * t; a.weight = 1; a.fadeIn(0); g.userData.mixer.update(0);
    const cr = q.get('carry') && JSON.parse(q.get('carry'))[i]; if(cr){ const b = g.userData.bones; b.upperarml.rotation.set(cr[0], cr[1], cr[2]); b.upperarmr.rotation.set(cr[0], -cr[1], -cr[2]); b.lowerarml.rotation.set(0, 0, 0); b.lowerarmr.rotation.set(0, 0, 0); } });
  r.render(s, c); document.title = 'ok';
});
