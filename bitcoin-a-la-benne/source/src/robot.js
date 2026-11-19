/* =========================================================
   ROBOT ANIMÉ (modèle CC0 « RobotExpressive » de Quaternius)
   Utilisé pour l'employé « Robot fouilleur ». Intégré dans le fichier du jeu.
   ========================================================= */
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import glb from '../assets/RobotExpressive.glb';
let base = null, clips = null;
export const robotReady = new Promise(res => {
  try { new GLTFLoader().parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '', g => { base = g.scene; clips = g.animations; base.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } }); res(true); }, () => res(false)); }
  catch(e){ res(false); }
});
/** Un robot prêt à animer (ou null si le modèle n'est pas encore chargé) */
export function makeRobot(){
  if(!base) return null;
  const m = SkeletonUtils.clone(base); m.scale.setScalar(.36);
  const mixer = new THREE.AnimationMixer(m), act = {};
  for(const n of ['Idle', 'Walking', 'Punch', 'ThumbsUp']){ const c = clips.find(x => x.name === n); if(c) act[n] = mixer.clipAction(c); }
  const g = new THREE.Group(); g.add(m); g.userData = {mixer, act, cur:null, glb:true};
  play(g, 'Idle'); return g;
}
export function play(g, name){
  const u = g.userData; if(!u.act || u.cur === name || !u.act[name]) return;
  const next = u.act[name]; next.reset().fadeIn(.25).play(); if(u.cur && u.act[u.cur]) u.act[u.cur].fadeOut(.25); u.cur = name;
}
