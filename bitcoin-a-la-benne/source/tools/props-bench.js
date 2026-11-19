// banc d'essai (tests) : affiche tous les objets de props.bin
import * as THREE from 'three';
import {PROP_KEYS, propPart} from '../src/props.js';
const r = new THREE.WebGLRenderer({antialias:true}); r.setSize(1600, 900); document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color(0x9fd0ff); s.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.4)); const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(3, 5, 4); s.add(d);
const c = new THREE.PerspectiveCamera(30, 16 / 9, .1, 200); c.position.set(0, 26, 34); c.lookAt(0, 0, 0);
const mat = new THREE.MeshLambertMaterial({vertexColors:true, flatShading:true});
const keys = (new URLSearchParams(location.search).get('k') || PROP_KEYS.join(',')).split(','), N = Math.ceil(Math.sqrt(keys.length * 1.8));
const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 900; cv.style = 'position:absolute;left:0;top:0'; document.body.appendChild(cv); const x2 = cv.getContext('2d'); x2.font = '14px sans-serif'; x2.fillStyle = '#000';
keys.forEach((k, i) => { const m = new THREE.Mesh(propPart(k, {len:2.2}), mat); m.position.set((i % N - (N - 1) / 2) * 3.2, 0, (Math.floor(i / N) - 2) * 4); m.rotation.y = .5; s.add(m);
  const v = m.position.clone(); v.y = -.3; v.z += 1.2; v.project(c); x2.fillText(k, (v.x + 1) / 2 * 1600 - 20, (1 - v.y) / 2 * 900); });
r.render(s, c); document.title = 'ok';
