import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setSize(1200, 600); document.body.appendChild(r.domElement); r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x404448);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2)); const dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(2, 4, 3); scene.add(dl);
const cam = new THREE.PerspectiveCamera(30, 2, 0.1, 100); cam.position.set(0, 1.0, 7.5); cam.lookAt(0, 0.9, 0);
const gl = new GLTFLoader(); const dr = new DRACOLoader(); dr.setDecoderPath('./'); gl.setDRACOLoader(dr);
(async () => {
const files = ['Michelle.glb', 'readyplayer.me.glb', 'kira.glb', 'Samba_Dancing.fbx', 'Xbot.glb'];
let x = -4; window.info = [];
for (const f of files) {
  try {
    const obj = f.endsWith('.fbx') ? await new FBXLoader().loadAsync('../' + f) : (await gl.loadAsync('../' + f)).scene;
    const box = new THREE.Box3().setFromObject(obj), s = 1.8 / (box.max.y - box.min.y); obj.scale.multiplyScalar(s);
    const b2 = new THREE.Box3().setFromObject(obj); obj.position.x += x - (b2.min.x + b2.max.x) / 2; obj.position.y -= b2.min.y; obj.position.z -= (b2.min.z + b2.max.z) / 2; scene.add(obj); x += 2;
    let names = []; obj.traverse((o) => { if (o.isBone && names.length < 3) names.push(o.name); });
    window.info.push(f + ' ok bones:' + names.join(','));
  } catch (e) { window.info.push(f + ' ERR ' + e.message); x += 2; }
}
r.render(scene, cam); window.done = true;
})();
