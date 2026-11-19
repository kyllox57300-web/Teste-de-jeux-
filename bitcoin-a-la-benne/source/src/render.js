/* =========================================================
   RENDU 3D (Three.js) : décor, tas, objets, personnages, lumière, effets, caméra
   ========================================================= */
import * as THREE from 'three';
import * as M from './models.js';
import * as CH from './chars.js';
import {makeRobot, play as robotPlay, robotReady} from './robot.js';
import {kayReady, makeChar, playChar, kenneyTruck, kenneyMoto} from './kaykit.js';
import * as C from './core.js';
import * as D from './data.js';
const {CELL, COLS, ROWS, NQ, QROWS, GATE, QUARTERS, LOOT, RAR} = D;
const {W, cx, cz, rowStart} = C;

export const R = {renderer:null, scene:null, camera:null, quality:'med', q:null,
  cam:{yaw:Math.PI, pitch:0.72, dist:12, mode:'tps', tx:0, ty:0, tz:0, userT:0, shake:0},
  heaps:null, decos:{}, loot:new Map(), bigs:new Map(), conts:new Map(), workers:new Map(), fxDebris:null, ready:false};
const QUAL = {
  low:{pr:1, shadows:false, map:0, deco:2, decoR:24, decoShadow:false, aa:false, parts:120, fogNear:30, fogFar:95, lights:false},
  med:{pr:1.5, shadows:true, map:1024, deco:4, decoR:32, decoShadow:false, aa:true, parts:250, fogNear:40, fogFar:130, lights:false},
  high:{pr:2, shadows:true, map:2048, deco:6, decoR:46, decoShadow:true, aa:true, parts:400, fogNear:50, fogFar:160, lights:true},
};
export function autoQuality(){
  const mobile = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  return mobile ? 'med' : 'high';
}
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(), tmpE = new THREE.Euler(), tmpC = new THREE.Color();
const rng = C.mulberry;

/* =========================================================
   INITIALISATION
   ========================================================= */
export function initRender(canvas, quality){
  R.quality = quality === 'auto' || !QUAL[quality] ? autoQuality() : quality; R.q = QUAL[R.quality];
  R.renderer = new THREE.WebGLRenderer({canvas, antialias:R.q.aa, powerPreference:'high-performance'});
  R.renderer.outputColorSpace = THREE.SRGBColorSpace;
  R.renderer.toneMapping = THREE.ACESFilmicToneMapping; R.renderer.toneMappingExposure = 1.05;
  R.renderer.shadowMap.enabled = R.q.shadows; R.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  R.scene = new THREE.Scene();
  R.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600); R.scene.add(R.camera);
  resize();
  addEventListener('resize', resize);
  buildSky(); buildLights();
  // le robot animé se charge un instant après le démarrage : on remplace les robots provisoires
  // les personnages et véhicules 3D se chargent un instant après : on remplace les modèles provisoires
  kayReady.then(ok => { if(ok && R.ready) swapToKay(); });
  robotReady.then(ok => { if(!ok) return; for(const [w, m] of [...R.workers]) if(w.type === 'robot' && !m.userData.glb){ m.parent && m.parent.remove(m); R.workers.delete(w); addWorkerMesh(w); } });
  R.scene.fog = new THREE.Fog(0xcfe0e8, R.q.fogNear, R.q.fogFar);
}
export function resize(){
  if(!R.renderer) return;
  R.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, R.q.pr));
  R.renderer.setSize(innerWidth, innerHeight, false);
  R.camera.aspect = innerWidth / innerHeight; R.camera.updateProjectionMatrix();
}
export function setQuality(qn){
  R.quality = qn === 'auto' || !QUAL[qn] ? autoQuality() : qn; R.q = QUAL[R.quality];
  R.renderer.shadowMap.enabled = R.q.shadows; R.sun.castShadow = R.q.shadows;
  if(R.q.shadows){ R.sun.shadow.mapSize.set(R.q.map, R.q.map); if(R.sun.shadow.map){ R.sun.shadow.map.dispose(); R.sun.shadow.map = null; } }
  R.scene.fog.near = R.q.fogNear; R.scene.fog.far = R.q.fogFar;
  R.scene.traverse(o => { if(o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.needsUpdate = true); } });
  resize(); if(R.ready) buildHeaps();
}

/* ---------- Ciel dégradé + soleil + étoiles ---------- */
function buildSky(){
  const geo = new THREE.SphereGeometry(450, 24, 12);
  R.skyMat = new THREE.ShaderMaterial({side:THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{top:{value:new THREE.Color(0x4a90d8)}, hor:{value:new THREE.Color(0xcfe6f0)}, bot:{value:new THREE.Color(0x9cb8a0)}, sunDir:{value:new THREE.Vector3(0, 1, 0)}, sunCol:{value:new THREE.Color(0xfff2c0)}},
    vertexShader:'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader:`uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(hor, top, pow(min(h * 1.6, 1.0), 0.8)) : mix(hor, bot, min(-h * 4.0, 1.0));
        float s = max(dot(vP, normalize(sunDir)), 0.0); c += sunCol * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.25);
        gl_FragColor = vec4(c, 1.0); }`});
  R.sky = new THREE.Mesh(geo, R.skyMat); R.sky.renderOrder = -1; R.scene.add(R.sky);
  const n = 700, pos = new Float32Array(n * 3), r = rng(7);
  for(let i = 0; i < n; i++){ const a = r() * 6.28, b = Math.acos(r() * 0.95); pos[i * 3] = Math.sin(b) * Math.cos(a) * 400; pos[i * 3 + 1] = Math.cos(b) * 400; pos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * 400; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  R.stars = new THREE.Points(sg, new THREE.PointsMaterial({color:0xffffff, size:1.6, sizeAttenuation:false, transparent:true, opacity:0, fog:false, depthWrite:false}));
  R.scene.add(R.stars);
}
function buildLights(){
  R.hemi = new THREE.HemisphereLight(0xcfe6ff, 0x8a7a5a, 1.2); R.scene.add(R.hemi);
  R.sun = new THREE.DirectionalLight(0xfff0d0, 2.4); R.sun.castShadow = R.q.shadows;
  const s = R.sun.shadow; s.mapSize.set(R.q.map || 1024, R.q.map || 1024); s.camera.left = -26; s.camera.right = 26; s.camera.top = 26; s.camera.bottom = -26; s.camera.near = 1; s.camera.far = 120; s.bias = -0.0008; s.normalBias = 0.04;
  R.scene.add(R.sun); R.scene.add(R.sun.target);
  R.pointLights = []; for(let i = 0; i < 4; i++){ const p = new THREE.PointLight(0xffc870, 0, 14, 1.6); R.scene.add(p); R.pointLights.push(p); }
}

/* =========================================================
   CONSTRUCTION DU MONDE (appelée après chaque chargement de partie)
   ========================================================= */
let worldGroup = null;
export function buildWorld(){
  if(worldGroup){ R.scene.remove(worldGroup); worldGroup.traverse(o => { if(o.geometry && !o.userData.shared) o.geometry.dispose(); }); }
  worldGroup = new THREE.Group(); R.scene.add(worldGroup);
  R.loot.clear(); R.bigs.clear(); R.conts.clear(); R.workers.clear(); R.flying = []; R.flyToKevin = [];
  buildGround(); buildFences(); buildDecor(); buildCharacters(); buildFx();
  buildHeaps();
  for(const o of W.conts) addContMesh(o);
  for(const o of W.bigs) addBigMesh(o);
  for(const o of W.loot) addLootMesh(o);
  for(const w of W.workers) addWorkerMesh(w);
  R.ready = true;
}
/* ---------- Sol (couleurs par case : quartiers, cour, route, sol vidé) ---------- */
const X0 = cx(0) - CELL / 2, X1 = cx(COLS - 1) + CELL / 2, Z0 = -CELL / 2, Z1 = cz(ROWS - 1) + CELL / 2;
const GM = 40;   // marge d'herbe autour
function buildGround(){
  const w = X1 - X0 + GM * 2, d = Z1 - Z0 + GM * 2, sx = Math.round(w / 1.3), sz = Math.round(d / 1.3);
  const geo = new THREE.PlaneGeometry(w, d, sx, sz); geo.rotateX(-Math.PI / 2); geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const pos = geo.attributes.position, n = pos.count, col = new Float32Array(n * 3), r = rng(11);
  R.groundBase = new Float32Array(n * 3);
  for(let i = 0; i < n; i++){
    const x = pos.getX(i), z = pos.getZ(i); let c;
    const inside = x > X0 - .3 && x < X1 + .3 && z > Z0 - .3 && z < Z1 + .3;
    if(!inside){ c = tmpC.setHex(0x5e8a3e); const far = Math.min(1, Math.max(Math.abs(x) - (X1 + 4), z - (Z1 + 4), Z0 - 4 - z, 0) / 30); pos.setY(i, far * (2 + 3 * Math.sin(x * .13) * Math.cos(z * .11)) ); }
    else { const rr = C.rowOf(z), q = C.qOfRow(Math.min(ROWS - 1, Math.max(0, rr)));
      c = tmpC.setHex(q < 0 ? 0xa8946e : QUARTERS[q].col.ground);
      if(q < 0 && Math.abs(x - cx(GATE)) < 2.2) c.setHex(0x4e4e55); }
    const k = 0.9 + r() * 0.18; col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
  }
  R.groundBase.set(col);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({vertexColors:true}));
  ground.receiveShadow = true; ground.userData.kind = 'ground'; worldGroup.add(ground); R.ground = ground;
  R.groundDims = {x0:(X0 + X1) / 2 - w / 2, z0:(Z0 + Z1) / 2 - d / 2, sx, sz, w, d};
  // déchets oubliés au sol des cases vidées (la décharge reste « vivante » une fois nettoyée)
  R.litter = {}; for(const k of ['paper', 'can', 'bottle', 'plank', 'cd']){ const m = new THREE.InstancedMesh(M.decoGeo(k), M.VCOL, NQ * QROWS * COLS); m.count = 0; m.receiveShadow = true; m.frustumCulled = false; worldGroup.add(m); R.litter[k] = m; }
  for(let r2 = 0; r2 < NQ * QROWS; r2++) for(let c2 = 0; c2 < COLS; c2++) if(!W.tiles[r2][c2].L) stainCell(c2, r2, false);
  geo.attributes.color.needsUpdate = true;
  // ligne blanche au milieu de la route
  const line = new THREE.Mesh(new THREE.PlaneGeometry(.2, D.YARD * CELL), new THREE.MeshBasicMaterial({color:0xe8e2c8}));
  line.rotation.x = -Math.PI / 2; line.position.set(cx(GATE), .02, cz(NQ * QROWS) + 3 * CELL); worldGroup.add(line);
}
/** Assombrit le sol d'une case vidée (terre humide) */
function stainCell(c, r, update = true){
  const g = R.ground.geometry, pos = g.attributes.position, col = g.attributes.color, d = R.groundDims, x = cx(c), z = cz(r), rr = rng(c * 31 + r * 7);
  const i0 = Math.floor((x - CELL / 2 - d.x0) / d.w * d.sx), i1 = Math.ceil((x + CELL / 2 - d.x0) / d.w * d.sx);
  const j0 = Math.floor((z - CELL / 2 - d.z0) / d.d * d.sz), j1 = Math.ceil((z + CELL / 2 - d.z0) / d.d * d.sz);
  for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++){ const k = j * (d.sx + 1) + i; if(k < 0 || k >= pos.count) continue;
    const dist = Math.hypot(pos.getX(k) - x, pos.getZ(k) - z); if(dist > CELL * 0.7) continue;
    const f = 0.72 + 0.1 * rr(); col.setXYZ(k, R.groundBase[k * 3] * f, R.groundBase[k * 3 + 1] * f * 0.97, R.groundBase[k * 3 + 2] * f * 0.94); }
  if(update) col.needsUpdate = true;
  // 2 ou 3 petits déchets couchés au sol
  const kinds = ['paper', 'can', 'bottle', 'plank', 'cd'], n = 2 + (rr() < .5 ? 1 : 0);
  for(let i = 0; i < n; i++){ const k = kinds[Math.floor(rr() * kinds.length)], m = R.litter[k]; if(m.count >= m.instanceMatrix.count) continue;
    tmpQ.setFromEuler(tmpE.set(k === 'can' || k === 'bottle' ? Math.PI / 2 : 0, rr() * 6.28, 0)); const sc = k === 'plank' ? .6 : .55;
    m.setMatrixAt(m.count++, tmpM.compose(tmpV.set(x + (rr() - .5) * CELL * .8, k === 'can' || k === 'bottle' ? .06 : .01, z + (rr() - .5) * CELL * .8), tmpQ, tmpS.set(sc, sc, sc)));
    m.instanceMatrix.needsUpdate = true; }
}
/* ---------- Grillages et portails ---------- */
let chainTex = null;
function chainTexture(){
  if(chainTex) return chainTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  g.strokeStyle = '#c8ccd2'; g.lineWidth = 2.5; for(let i = -64; i < 128; i += 16){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
  chainTex = new THREE.CanvasTexture(cv); chainTex.wrapS = chainTex.wrapT = THREE.RepeatWrapping; chainTex.colorSpace = THREE.SRGBColorSpace; return chainTex;
}
function fenceRun(x0, z0, x1, z1, parts, panels){
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2.6)), ang = Math.atan2(x1 - x0, z1 - z0);
  for(let i = 0; i <= n; i++) parts.push(M.part(M.G.box(.12, 2.1, .12), 0x5d4630, [x0 + (x1 - x0) * i / n, 1.05, z0 + (z1 - z0) * i / n]));
  const t = chainTexture().clone(); t.needsUpdate = true; t.repeat.set(len / 1.2, 2 / 1.2);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.9), new THREE.MeshLambertMaterial({map:t, transparent:true, alphaTest:.3, side:THREE.DoubleSide}));
  p.position.set((x0 + x1) / 2, 1.05, (z0 + z1) / 2); p.rotation.y = ang + Math.PI / 2; panels.push(p);
}
R.gates = [];
function buildFences(){
  const parts = [], panels = [];
  // périmètre
  fenceRun(X0, Z0, X1, Z0, parts, panels); fenceRun(X0, Z0, X0, Z1, parts, panels); fenceRun(X1, Z0, X1, Z1, parts, panels);
  fenceRun(X0, Z1, cx(GATE) - 2.2, Z1, parts, panels); fenceRun(cx(GATE) + 2.2, Z1, X1, Z1, parts, panels);
  // entre les quartiers, avec un portail au centre
  R.gates = [];
  for(let q = 1; q < NQ; q++){
    const z = (rowStart(q - 1) - 0.5) * CELL, gx0 = cx(GATE) - CELL / 2, gx1 = cx(GATE) + CELL / 2;
    fenceRun(X0, z, gx0, z, parts, panels); fenceRun(gx1, z, X1, z, parts, panels);
    const gate = new THREE.Group(); gate.position.set(0, 0, z);
    const mkDoor = side => { const d = new THREE.Group(); d.position.set(side < 0 ? gx0 : gx1, 0, 0);
      const m = new THREE.Mesh(merged([M.part(M.G.box(1.25, .08, .08), 0x9aa0a8, [-side * .63, 1.9, 0]), M.part(M.G.box(1.25, .08, .08), 0x9aa0a8, [-side * .63, .2, 0]),
        M.part(M.G.box(.08, 1.8, .08), 0x9aa0a8, [-side * 1.22, 1.05, 0]), ...[1, 2, 3, 4].map(i => M.part(M.G.box(.04, 1.7, .04), 0xb0b6be, [-side * i * .25, 1.05, 0]))]), M.VCOL);
      m.castShadow = true; d.add(m); gate.add(d); return d; };
    const dl = mkDoor(-1), dr = mkDoor(1);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(.25, .3, .15), new THREE.MeshLambertMaterial({color:0xe0b030})); lock.position.set(cx(GATE), 1.1, 0); gate.add(lock);
    // pancarte avec le prix
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.25), new THREE.MeshBasicMaterial({map:tex, side:THREE.DoubleSide, transparent:true}));
    sign.position.set(cx(GATE), 3.2, 0); sign.userData = {kind:'gate', q}; gate.add(sign);
    const post = new THREE.Mesh(merged([M.part(M.G.box(.15, 3.2, .15), 0x5d4630, [cx(GATE) - 1.6, 1.6, 0]), M.part(M.G.box(.15, 3.2, .15), 0x5d4630, [cx(GATE) + 1.6, 1.6, 0])]), M.VCOL); gate.add(post);
    worldGroup.add(gate);
    R.gates.push({q, dl, dr, lock, sign, cv, tex, open:0, state:''});
  }
  const posts = new THREE.Mesh(merged(parts), M.VCOL); posts.castShadow = true; worldGroup.add(posts);
  for(const p of panels) worldGroup.add(p);
}
function merged(p){ return M.merged(p); }
function drawGateSign(g){
  const Q = QUARTERS[g.q], ok = C.S.money >= Q.cost, state = (C.S.unlocked[g.q] ? 'o' : ok ? 'y' : 'n') + (C.S.unlocked[g.q - 1] ? 1 : 0);
  if(state === g.state) return; g.state = state;
  const c = g.cv.getContext('2d'); c.clearRect(0, 0, 512, 160);
  if(C.S.unlocked[g.q]){ g.sign.visible = false; return; }
  g.sign.visible = true;
  c.fillStyle = ok ? '#fff0b8' : '#f3e6c8'; c.strokeStyle = '#5d4630'; c.lineWidth = 10; roundRect(c, 6, 6, 500, 148, 22); c.fill(); c.stroke();
  c.fillStyle = '#3a2a10'; c.font = 'bold 40px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('🔒 ' + Q.n, 256, 66);
  c.fillStyle = ok ? '#1f8a4a' : '#a03020'; c.font = 'bold 38px system-ui, sans-serif'; c.fillText(C.eur(Q.cost) + (ok ? ' — touchez pour ouvrir' : ''), 256, 120);
  g.tex.needsUpdate = true;
}
function roundRect(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
/* ---------- Décor : cabane, grue, lampadaires, conteneurs, épaves, arbres, collines ---------- */
R.lamps = [];
function buildDecor(){
  const hut = M.hutModel(); hut.position.set(cx(C.HUT.c + 1), 0, cz(C.HUT.r) + 0.6); hut.traverse(o => { o.userData.kind = 'hut'; }); worldGroup.add(hut); R.hut = hut;
  R.crane = M.craneModel(); R.crane.position.set(cx(C.CRANE.c), 0, cz(C.CRANE.r)); worldGroup.add(R.crane);
  R.hook = M.hookModel(); worldGroup.add(R.hook);
  R.cable = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 4), new THREE.MeshBasicMaterial({color:0x222222})); worldGroup.add(R.cable);
  R.lamps = [];
  const lampSpots = [[cx(GATE) - 2.6, cz(NQ * QROWS + 1)], [cx(GATE) + 2.6, cz(NQ * QROWS + 4)], [cx(0) - 1.2, cz(NQ * QROWS + 3)], [cx(COLS - 1) + 1.2, cz(NQ * QROWS + 1)]];
  for(let q = 1; q < NQ; q++) lampSpots.push([cx(GATE) + 2.1, (rowStart(q - 1) - 0.5) * CELL + .3]);
  for(const [x, z] of lampSpots){ const l = M.lampModel(); l.position.set(x, 0, z); worldGroup.add(l); R.lamps.push(l); }
  // feu de baril (fumée)
  R.fire = M.barrelFire(); R.fire.position.set(cx(COLS - 1) - .2, 0, cz(NQ * QROWS + 3)); worldGroup.add(R.fire);
  R.fireLight = new THREE.PointLight(0xff8a30, 0, 8, 1.5); R.fireLight.position.set(R.fire.position.x, 1.5, R.fire.position.z); worldGroup.add(R.fireLight);
  // autour de la décharge : conteneurs, épaves, pneus, arbres, collines
  const r = rng(99), cols = [0xc0392b, 0x2f6fb8, 0x2f8a40, 0xd88a20, 0x7a4a8a];
  for(let i = 0; i < 14; i++){ const sc = M.shippingContainer(cols[i % 5]); const side = i % 2 ? 1 : -1; sc.position.set(side * (X1 + 5 + r() * 6), (i % 3 === 2 ? 2.6 : 0), Z0 + 6 + i * (Z1 - Z0 - 10) / 14); sc.rotation.y = r() * .4; worldGroup.add(sc); }
  for(let i = 0; i < 12; i++){ const w = M.carWreck(cols[(i + 2) % 5]); const side = i % 2 ? 1 : -1; w.position.set(side * (X1 + 3 + r() * 3), 0, Z0 + 10 + r() * (Z1 - Z0)); w.rotation.y = r() * 6; worldGroup.add(w); }
  for(let i = 0; i < 10; i++){ const t = M.tireStack(); const side = i % 2 ? 1 : -1; t.position.set(side * (X1 + 2 + r() * 1.5), 0, Z0 + r() * (Z1 - Z0)); worldGroup.add(t); }
  const treeParts = [];
  for(let i = 0; i < 90; i++){ const side = r() < .5 ? -1 : 1, x = side * (X1 + 14 + r() * 22), z = Z0 - 20 + r() * (Z1 - Z0 + 50), s = .8 + r() * .9; const t = M.treeModel(s); t.position.set(x, 0, z); t.updateMatrix(); const g = t.geometry.clone(); g.applyMatrix4(t.matrix); treeParts.push(g); }
  for(let i = 0; i < 26; i++){ const x = X0 - 10 + r() * (X1 - X0 + 20), z = Z1 + 8 + r() * 25, s = .8 + r() * .8; if(Math.abs(x - cx(GATE)) < 4) continue; const t = M.treeModel(s); t.position.set(x, 0, z); t.updateMatrix(); const g = t.geometry.clone(); g.applyMatrix4(t.matrix); treeParts.push(g); }
  for(let i = 0; i < 16; i++){ const x = X0 - 10 + r() * (X1 - X0 + 20), z = Z0 - 12 - r() * 20, s = .9 + r() * .8; const t = M.treeModel(s); t.position.set(x, 0, z); t.updateMatrix(); const g = t.geometry.clone(); g.applyMatrix4(t.matrix); treeParts.push(g); }
  const trees = new THREE.Mesh(M.merged(treeParts), M.VCOL); trees.castShadow = R.q.shadows; worldGroup.add(trees);
  // collines lointaines
  const hills = []; for(let i = 0; i < 26; i++){ const a = i / 26 * Math.PI * 2, d = 150 + r() * 40, h = 14 + r() * 26;
    hills.push(M.part(M.G.cone(30 + r() * 25, h, 7), new THREE.Color().setHSL(.28, .3, .3 + r() * .1).getHex(), [Math.cos(a) * d + (X0 + X1) / 2, h / 2 - 2, Math.sin(a) * d + (Z0 + Z1) / 2])); }
  const hm = new THREE.Mesh(M.merged(hills), M.VCOL); worldGroup.add(hm);
  // la route qui part vers la ville
  const road = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 60), new THREE.MeshLambertMaterial({color:0x4e4e55})); road.rotation.x = -Math.PI / 2; road.position.set(cx(GATE), .015, Z1 + 30); road.receiveShadow = true; worldGroup.add(road);
  // zone dorée (indice du boîtier) et cercle du drone
  R.hint = new THREE.Mesh(new THREE.PlaneGeometry(COLS * CELL / 2, QROWS * CELL), new THREE.MeshBasicMaterial({color:0xffd050, transparent:true, opacity:.12, depthWrite:false}));
  R.hint.rotation.x = -Math.PI / 2; R.hint.position.y = .05; R.hint.visible = false; worldGroup.add(R.hint);
  R.droneRing = new THREE.Mesh(new THREE.RingGeometry(7, 7.6, 40), new THREE.MeshBasicMaterial({color:0xff5030, transparent:true, opacity:.7, depthWrite:false, side:THREE.DoubleSide}));
  R.droneRing.rotation.x = -Math.PI / 2; R.droneRing.position.y = .08; R.droneRing.visible = false; worldGroup.add(R.droneRing);
  R.drone = M.roboModel(); R.drone.scale.setScalar(1.6); R.drone.visible = false; worldGroup.add(R.drone);
  // mouettes
  R.gulls = []; for(let i = 0; i < 6; i++){ const g = M.gullModel(); g.userData.ph = r() * 6; g.userData.rad = 12 + r() * 20; g.userData.h = 14 + r() * 8; g.userData.sp = .15 + r() * .15; g.userData.c = [r() * 30 - 15, r() * 100]; worldGroup.add(g); R.gulls.push(g); }
}
/* ---------- Personnages ---------- */
function kevinModel(){
  const g = makeChar('kevin'); if(!g) return CH.person(CH.LOOKS.kevin);
  // sac à dos (grossit avec les améliorations) à la place de la cape
  if(g.userData.bones.Rogue_Cape) g.userData.bones.Rogue_Cape.visible = false;
  const bag = new THREE.Group(); bag.position.set(0, 1.0, -.27); g.add(bag); g.userData.bag = bag;
  const b = new THREE.Mesh(new THREE.BoxGeometry(.42, .5, .22, 2, 2, 2), new THREE.MeshStandardMaterial({color:0x8a5a2e, roughness:.85}));
  b.castShadow = true; bag.add(b);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(.44, .16, .24), new THREE.MeshStandardMaterial({color:0x6b4220, roughness:.9})); fl.position.y = .2; fl.castShadow = true; bag.add(fl);
  return g;
}
function josianeModel(){ return makeChar('josiane') || CH.person(CH.LOOKS.josiane); }
/** Remplace les personnages dessinés à la main par les modèles 3D animés (dès qu'ils sont chargés) */
function swapToKay(){
  if(R.kevin && !R.kevin.userData.kay){ const old = R.kevin; R.kevin = kevinModel(); worldGroup.remove(old); worldGroup.add(R.kevin); R.kevinTier = -1; R.kevinTool = null; }
  if(R.josiane && !R.josiane.userData.kay){ const old = R.josiane, j = josianeModel(); j.position.copy(old.position); j.position.y = .42; j.traverse(o => { o.userData.kind = 'hut'; }); worldGroup.remove(old); worldGroup.add(j); R.josiane = j; }
  if(R.truck && !R.truck.userData.kenney){ const t = kenneyTruck(); if(t){ t.userData.kenney = true; t.visible = R.truck.visible; worldGroup.remove(R.truck); worldGroup.add(t); R.truck = t; } }
  for(const [w, m] of [...R.workers]) if(m.userData.hips){ worldGroup.remove(m); R.workers.delete(w); addWorkerMesh(w); }
}
function buildCharacters(){
  R.kevin = kevinModel(); worldGroup.add(R.kevin);
  R.kevinTool = null; R.kevinTier = -1;
  R.brouette = CH.brouetteModel(); R.brouette.visible = false; worldGroup.add(R.brouette);
  R.digger = M.diggerModel(); R.digger.visible = false; worldGroup.add(R.digger);
  R.josiane = josianeModel();
  R.josiane.position.set(cx(C.HUT.c + 1) + 1.0, R.josiane.userData.kay ? .42 : 0, cz(C.HUT.r) + 0.6 + 2.95); /* sur un tabouret derrière le comptoir */ R.josiane.traverse(o => { o.userData.kind = 'hut'; }); worldGroup.add(R.josiane);
  R.truck = kenneyTruck() || M.truckModel(); worldGroup.add(R.truck);
  R.robo = M.roboModel(); R.robo.visible = false; worldGroup.add(R.robo);
  R.detRing = new THREE.Mesh(new THREE.RingGeometry(.9, 1.1, 32), new THREE.MeshBasicMaterial({color:0x7bd88f, transparent:true, opacity:0, depthWrite:false, side:THREE.DoubleSide}));
  R.detRing.rotation.x = -Math.PI / 2; worldGroup.add(R.detRing);
  R.selRing = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.5, 32), new THREE.MeshBasicMaterial({color:0xffd84f, transparent:true, opacity:.8, depthWrite:false, side:THREE.DoubleSide}));
  R.selRing.rotation.x = -Math.PI / 2; R.selRing.visible = false; worldGroup.add(R.selRing);
}
function addWorkerMesh(w){
  let m;
  if(w.type === 'chien') m = CH.dogModel();
  else if(w.type === 'dozer') m = M.dozerModel(.75);
  else if(w.type === 'robot') m = makeRobot() || M.robotModel();
  else { m = makeChar(w.type) || CH.person(CH.LOOKS[w.type] || CH.LOOKS.gege); const t = CH.toolModel(w.type === 'ferr' ? 1 : 0); holdTool(m, t); m.userData.hand.add(t); }
  m.userData.type = w.type; worldGroup.add(m); R.workers.set(w, m); return m;
}

/* =========================================================
   TAS : monticules instanciés + déchets instanciés posés dessus
   ========================================================= */
let moundGeo = null;
function moundGeometry(){
  if(moundGeo) return moundGeo;
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, r = rng(5);
  const seen = new Map();
  for(let i = 0; i < p.count; i++){
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const key = x.toFixed(3) + y.toFixed(3) + z.toFixed(3);
    if(!seen.has(key)) seen.set(key, 0.88 + r() * 0.24);
    const k = seen.get(key); y = Math.max(y, -0.05);
    p.setXYZ(i, x * k, y < 0 ? -0.05 : y * k, z * k);
  }
  g.computeVertexNormals();
  // chaque face a sa propre nuance (terre, gravats, ombres) : le tas paraît plus « texturé »
  const ng = g.index ? g.toNonIndexed() : g; ng.computeVertexNormals();
  const n = ng.attributes.position.count, col = new Float32Array(n * 3);
  for(let f = 0; f < n; f += 3){ const v = 0.68 + r() * 0.42, warm = r() * 0.06; for(let j = 0; j < 3; j++){ col[(f + j) * 3] = v + warm; col[(f + j) * 3 + 1] = v; col[(f + j) * 3 + 2] = v - warm; } }
  ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
  moundGeo = ng; return ng;
}
const heapH = (L) => L ? 0.45 + 0.42 * L : 0;
const heapRad = (t, L) => (CELL * 0.6 + 0.06 * t.maxL) * (L ? 0.72 + 0.28 * L / t.maxL : 0);
R.heapAnim = new Map();
export function buildHeaps(){
  if(R.heaps){ worldGroup.remove(R.heaps); for(const k in R.decos) worldGroup.remove(R.decos[k].mesh); }
  const cells = []; for(let r = 0; r < NQ * QROWS; r++) for(let c = 0; c < COLS; c++) cells.push([c, r]);
  R.heapCells = cells; R.heapIndex = new Map(); cells.forEach(([c, r], i) => R.heapIndex.set(r * COLS + c, i));
  const mat = new THREE.MeshLambertMaterial({flatShading:true, vertexColors:true});
  R.heaps = new THREE.InstancedMesh(moundGeometry(), mat, cells.length);
  R.heaps.castShadow = R.q.shadows; R.heaps.receiveShadow = true; R.heaps.userData.kind = 'heap';
  // déchets : génération déterministe à partir de la graine de chaque tas
  const per = R.q.deco, lists = {}; R.heapDecos = [];
  cells.forEach(([c, r], i) => {
    const t = W.tiles[r][c], rr = rng(t.seed), Q = QUARTERS[t.q], ds = [];
    for(let k = 0; k < t.maxL; k++) for(let j = 0; j < per; j++){
      const key = Q.deco[Math.floor(rr() * Q.deco.length)], info = M.decoInfo(key);
      const d = {key, geo:info.geo, tint:info.tint, k, u:(t.maxL - 1 - k + (j + rr() * .8) / per) / t.maxL, ang:rr() * 6.28, rot:[rr() * 1.4 - .7, rr() * 6.28, rr() * 1.4 - .7], s:.95 + rr() * .6};
      (lists[info.geo] = lists[info.geo] || []).push([i, ds.length]); ds.push(d);
    }
    R.heapDecos.push(ds);
    t.jx = (rr() - .5) * .5; t.jz = (rr() - .5) * .5; t.ry = rr() * 6.28;
    t.cur = {h:heapH(t.L), r:heapRad(t, t.L)};
    tmpC.setHex(Q.col.mound).offsetHSL(0, (rr() - .5) * .05, (rr() - .5) * .08); R.heaps.setColorAt(i, tmpC);
  });
  R.decos = {}; R.decoLookup = {};
  for(const geo in lists){
    const L = lists[geo], m = new THREE.InstancedMesh(M.decoGeo(geo), M.VCOL, L.length);
    m.castShadow = R.q.shadows && R.q.decoShadow; m.receiveShadow = true; m.userData.kind = 'deco'; m.userData.geo = geo; m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, tmpC.setHex(0xffffff));
    L.forEach(([hi, di]) => { const d = R.heapDecos[hi][di]; d.type = geo; d.m = new Float32Array(16); d.vis = false; tmpC.setHex(d.tint); d.col = [tmpC.r, tmpC.g, tmpC.b]; });
    R.decos[geo] = {mesh:m, list:L, lookup:new Int32Array(L.length)}; m.count = 0; worldGroup.add(m);
  }
  cells.forEach((_, i) => placeHeap(i));
  R.heaps.instanceMatrix.needsUpdate = true; if(R.heaps.instanceColor) R.heaps.instanceColor.needsUpdate = true;
  worldGroup.add(R.heaps); R.cullT = 0; R.cullAt = null; cullDecos(true);
}
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
/** Place le monticule et ses déchets selon la hauteur actuelle (animée) */
function placeHeap(i){
  const [c, r] = R.heapCells[i], t = W.tiles[r][c], h = t.cur.h, rad = t.cur.r, x = cx(c) + t.jx, z = cz(r) + t.jz;
  if(h < 0.02){ R.heaps.setMatrixAt(i, ZERO); }
  else { tmpQ.setFromAxisAngle(tmpV.set(0, 1, 0), t.ry); R.heaps.setMatrixAt(i, tmpM.compose(tmpV.set(x, 0, z), tmpQ, tmpS.set(rad, h, rad))); }
  const u0 = (t.maxL - t.L) / t.maxL;
  for(const d of R.heapDecos[i]){
    if(!d.m) continue;
    if(d.k >= t.L || h < 0.02){ d.vis = false; continue; }
    const rho = 0.08 + 0.86 * Math.min(1, (d.u - u0) / Math.max(0.05, 1 - u0));
    const y = h * Math.pow(Math.max(0, 1 - rho * rho), 0.65) * 0.9 - 0.08;
    tmpE.set(d.rot[0], d.rot[1], d.rot[2]); tmpQ.setFromEuler(tmpE);
    tmpM.compose(tmpV.set(x + Math.cos(d.ang) * rho * rad * .95, y, z + Math.sin(d.ang) * rho * rad * .95), tmpQ, tmpS.set(d.s, d.s, d.s));
    tmpM.toArray(d.m); d.vis = true;
  }
}
/** Ne dessine que les déchets des tas proches (gros gain de performance sur téléphone) */
function cullDecos(force){
  const k = W.kevin, cxp = k ? k.x : 0, czp = k ? k.z : cz(NQ * QROWS);
  if(!force && R.cullAt && Math.hypot(R.cullAt[0] - cxp, R.cullAt[1] - czp) < 2.5 && !R.cullDirty) return;
  R.cullAt = [cxp, czp]; R.cullDirty = false;
  const rad = R.q.decoR, rad2 = rad * rad, cnt = {};
  for(const g in R.decos) cnt[g] = 0;
  const r0 = Math.max(0, C.rowOf(czp - rad)), r1 = Math.min(NQ * QROWS - 1, C.rowOf(czp + rad));
  for(let r = r0; r <= r1; r++) for(let c = 0; c < COLS; c++){
    const dx = cx(c) - cxp, dz = cz(r) - czp; if(dx * dx + dz * dz > rad2) continue;
    const hi = R.heapIndex.get(r * COLS + c); if(hi === undefined) continue;
    for(const d of R.heapDecos[hi]){ if(!d.vis) continue; const D_ = R.decos[d.type], n = cnt[d.type]++;
      D_.mesh.instanceMatrix.array.set(d.m, n * 16); D_.mesh.instanceColor.array.set(d.col, n * 3); D_.lookup[n] = hi; }
  }
  for(const g in R.decos){ const m = R.decos[g].mesh; m.count = cnt[g]; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
}
function heapChanged(c, r){
  const i = R.heapIndex.get(r * COLS + c); if(i === undefined) return;
  const t = W.tiles[r][c]; R.heapAnim.set(i, {h:heapH(t.L), r:heapRad(t, t.L)});
}
function animateHeaps(dt){
  if(!R.heapAnim.size) return;
  const touched = new Set();
  for(const [i, tg] of R.heapAnim){
    const [c, r] = R.heapCells[i], t = W.tiles[r][c], k = Math.min(1, dt * 7);
    t.cur.h += (tg.h - t.cur.h) * k; t.cur.r += (tg.r - t.cur.r) * k;
    if(Math.abs(tg.h - t.cur.h) < 0.01 && Math.abs(tg.r - t.cur.r) < 0.01){ t.cur.h = tg.h; t.cur.r = tg.r; R.heapAnim.delete(i); }
    placeHeap(i); touched.add(i);
  }
  R.heaps.instanceMatrix.needsUpdate = true; R.cullDirty = true;
  R.heaps.computeBoundingSphere();
}

/* =========================================================
   OBJETS AU SOL, GROS OBJETS, CONTENANTS
   ========================================================= */
let glowTex = null;
function glowTexture(){
  if(glowTex) return glowTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(cv); return glowTex;
}
const glowMats = {};
const glowMat = col => glowMats[col] || (glowMats[col] = new THREE.SpriteMaterial({map:glowTexture(), color:col, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}));
function addLootMesh(o){
  const L = C.itemOf(o.it), g = new THREE.Group();
  const m = new THREE.Mesh(M.itemGeo(L[3]), M.VCOL); m.castShadow = R.q.shadows; m.scale.setScalar(1.6); g.add(m);
  const r = L[2];
  if(r !== 'c'){ const s = new THREE.Sprite(glowMat(RAR[r].col)); s.scale.setScalar(r === 'l' ? 2.4 : r === 'e' ? 1.8 : 1.3); g.add(s); g.userData.glow = s;
    if(r === 'l' || r === 'e' || C.has('F5')){ const beam = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, r === 'l' ? 14 : 6, 8, 1, true), new THREE.MeshBasicMaterial({color:RAR[r].col, transparent:true, opacity:r === 'l' ? .45 : .25, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide}));
      beam.position.y = (r === 'l' ? 14 : 6) / 2; g.add(beam); g.userData.beam = beam; } }
  if(o.it[3]){ const crack = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, .06), new THREE.MeshBasicMaterial({color:0xff5030})); crack.position.y = .3; g.add(crack); }
  g.userData.kind = 'loot'; g.userData.id = o.id; g.traverse(x => { x.userData.kind = 'loot'; x.userData.id = o.id; });
  g.userData.spin = R2() * 6; worldGroup.add(g); R.loot.set(o.id, g);
}
const R2 = Math.random;
function addBigMesh(o){
  const g = (o.kind === 'moto' && kenneyMoto()) || CH.bigModel(o.kind); g.userData.kind = 'big'; g.userData.id = o.id; g.traverse(x => { x.userData.kind = 'big'; x.userData.id = o.id; });
  if(o.open && g.userData.door) g.userData.door.rotation.y = -1.8;
  worldGroup.add(g); R.bigs.set(o.id, g);
}
function addContMesh(o){
  const g = CH.contModel(o.kind); g.userData.kind = 'cont'; g.userData.id = o.id; g.traverse(x => { x.userData.kind = 'cont'; x.userData.id = o.id; });
  g.position.set(o.x, 0, o.z); g.rotation.y = (o.id * 1.7) % 6.28; if(o.kind === 'trunk') g.rotation.y = Math.PI / 2 + 0.3;
  if(o.open) openDoor(g, o.kind, 1);
  worldGroup.add(g); R.conts.set(o.id, g);
}
function openDoor(g, kind, f){ const d = g.userData.door; if(!d) return;
  if(kind === 'bin' || kind === 'case' || kind === 'trunk') d.rotation.x = -f * (kind === 'trunk' ? 1.3 : 1.6); else d.rotation.y = -f * 1.8; }

/* =========================================================
   EFFETS : débris, poussière, étincelles, onde de choc, pièces
   ========================================================= */
function buildFx(){
  const n = R.q.parts;
  R.fxDebris = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .12, .12), new THREE.MeshLambertMaterial(), n); R.fxDebris.frustumCulled = false;
  R.fxDebris.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.fxD = []; for(let i = 0; i < n; i++){ R.fxDebris.setMatrixAt(i, ZERO); R.fxDebris.setColorAt(i, tmpC.setHex(0xffffff)); }
  worldGroup.add(R.fxDebris);
  R.puffs = []; const puffMat = new THREE.SpriteMaterial({map:glowTexture(), color:0xd8c8a8, transparent:true, depthWrite:false, opacity:.6});
  for(let i = 0; i < 40; i++){ const s = new THREE.Sprite(puffMat.clone()); s.visible = false; worldGroup.add(s); R.puffs.push({s, t:1, life:1}); }
  R.sparks = []; for(let i = 0; i < 50; i++){ const s = new THREE.Sprite(glowMat(0xfff0a0).clone()); s.visible = false; worldGroup.add(s); R.sparks.push({s, t:1, life:1, v:new THREE.Vector3()}); }
  R.shock = new THREE.Mesh(new THREE.RingGeometry(.8, 1.2, 40), new THREE.MeshBasicMaterial({color:0xffb050, transparent:true, opacity:0, depthWrite:false, side:THREE.DoubleSide}));
  R.shock.rotation.x = -Math.PI / 2; R.shock.position.y = .1; worldGroup.add(R.shock); R.shockT = 1;
  R.smoke = []; for(let i = 0; i < 10; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(), color:0x777777, transparent:true, depthWrite:false, opacity:.3})); worldGroup.add(s); R.smoke.push({s, t:i / 10}); }
  const fn = 40, fp = new Float32Array(fn * 3); const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  R.flies = new THREE.Points(fg, new THREE.PointsMaterial({color:0x222222, size:.08})); R.flies.frustumCulled = false; worldGroup.add(R.flies);
  R.flyData = []; for(let i = 0; i < fn; i++) R.flyData.push({ph:R2() * 6, sp:3 + R2() * 4, rad:.4 + R2() * .8, h:.8 + R2() * 1.2, hi:-1});
}
let dIdx = 0;
function debris(x, y, z, n, col, sp = 4){
  for(let i = 0; i < n; i++){ const k = dIdx++ % R.fxDebris.count;
    R.fxD[k] = {x, y, z, vx:(R2() - .5) * sp, vy:2 + R2() * sp, vz:(R2() - .5) * sp, t:0, life:.8 + R2() * .5, rx:R2() * 6, s:.6 + R2() * .9};
    R.fxDebris.setColorAt(k, tmpC.setHex(col).offsetHSL(0, 0, (R2() - .5) * .15)); }
  R.fxDebris.instanceColor.needsUpdate = true;
}
function puff(x, y, z, s = 2, col = 0xd8c8a8){ const p = R.puffs.find(p => p.t >= p.life); if(!p) return; p.t = 0; p.life = .9; p.s.visible = true; p.s.position.set(x, y, z); p.base = s; p.s.material.color.setHex(col); }
function sparkle(x, y, z, n, col){ for(let i = 0; i < n; i++){ const p = R.sparks.find(p => p.t >= p.life); if(!p) return; p.t = 0; p.life = 1 + R2() * .6; p.s.visible = true; p.s.position.set(x, y, z);
  p.v.set((R2() - .5) * 6, 3 + R2() * 5, (R2() - .5) * 6); p.s.material.color.setHex(col); p.s.scale.setScalar(.5); } }
/** Les déchets de la couche retirée s'envolent pour de vrai (copies des déchets du tas) */
function flyDecos(c, r){
  const i = R.heapIndex.get(r * COLS + c); if(i === undefined) return;
  const t = W.tiles[r][c], gone = R.heapDecos[i].filter(d => d.m && d.vis && d.k === t.L);
  for(const d of gone.slice(0, 7)){
    let f = R.flying.find(o => !o.on);
    if(!f){ if(R.flying.length > 40) continue; f = {mesh:new THREE.Mesh(M.decoGeo(d.type), M.VCOL), on:false}; f.mesh.castShadow = R.q.shadows; worldGroup.add(f.mesh); R.flying.push(f); }
    f.mesh.geometry = M.decoGeo(d.type); tmpM.fromArray(d.m); tmpM.decompose(f.mesh.position, f.mesh.quaternion, f.mesh.scale);
    const ang = Math.atan2(f.mesh.position.x - cx(c), f.mesh.position.z - cz(r)) + (R2() - .5);
    f.v = new THREE.Vector3(Math.sin(ang) * (2 + R2() * 3), 5 + R2() * 4, Math.cos(ang) * (2 + R2() * 3)); f.spin = (R2() - .5) * 12; f.t = 0; f.on = true; f.mesh.visible = true; f.s0 = f.mesh.scale.x;
  }
}
function updateFlying(dt){
  for(const f of R.flying){ if(!f.on) continue; f.t += dt; f.v.y -= 18 * dt; f.mesh.position.addScaledVector(f.v, dt); f.mesh.rotation.x += f.spin * dt; f.mesh.rotation.z += f.spin * .7 * dt;
    if(f.mesh.position.y < 0.1){ f.mesh.position.y = 0.1; f.v.multiplyScalar(.4); f.v.y = Math.abs(f.v.y); }
    const k = f.t > .9 ? Math.max(0, 1 - (f.t - .9) / .4) : 1; f.mesh.scale.setScalar(f.s0 * k);
    if(f.t > 1.3){ f.on = false; f.mesh.visible = false; } }
}
function updateFx(dt){
  updateFlying(dt);
  for(let i = 0; i < R.fxDebris.count; i++){ const d = R.fxD[i]; if(!d) continue; d.t += dt;
    if(d.t >= d.life){ R.fxDebris.setMatrixAt(i, ZERO); R.fxD[i] = null; continue; }
    d.vy -= 14 * dt; d.x += d.vx * dt; d.y = Math.max(.05, d.y + d.vy * dt); d.z += d.vz * dt; if(d.y <= .05){ d.vx *= .6; d.vz *= .6; d.vy = Math.abs(d.vy) * .3; }
    d.rx += dt * 8; const s = d.s * (1 - Math.max(0, d.t - d.life + .3) / .3);
    tmpQ.setFromEuler(tmpE.set(d.rx, d.rx * .7, 0)); R.fxDebris.setMatrixAt(i, tmpM.compose(tmpV.set(d.x, d.y, d.z), tmpQ, tmpS.set(s, s, s))); }
  R.fxDebris.instanceMatrix.needsUpdate = true;
  for(const p of R.puffs){ if(p.t >= p.life){ p.s.visible = false; continue; } p.t += dt; const u = p.t / p.life; p.s.scale.setScalar(p.base * (.6 + u)); p.s.material.opacity = .55 * (1 - u); p.s.position.y += dt * .6; }
  for(const p of R.sparks){ if(p.t >= p.life){ p.s.visible = false; continue; } p.t += dt; p.v.y -= 9 * dt; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 1 - p.t / p.life; }
  if(R.shockT < 1){ R.shockT += dt * 1.4; R.shock.scale.setScalar(1 + R.shockT * 7); R.shock.material.opacity = .9 * (1 - R.shockT); }
}

/* =========================================================
   ÉVÉNEMENTS DU MOTEUR → EFFETS VISUELS
   ========================================================= */
export function onFx(f){
  if(!R.ready) return;
  switch(f.t){
    case 'world': buildWorld(); break;
    case 'layer': { flyDecos(f.c, f.r); heapChanged(f.c, f.r); const t = W.tiles[f.r][f.c], col = QUARTERS[t.q].col.mound, x = cx(f.c), z = cz(f.r);
      debris(x, heapH(t.L + 1) * .8, z, 14, col, 5); puff(x, heapH(t.L + 1) * .6, z, 3.2);
      if(f.k) R.cam.shake = Math.max(R.cam.shake, .12); break; }
    case 'hit': { const t = W.tiles[f.r][f.c]; if(f.k) debris(cx(f.c), heapH(t.L) * .9, cz(f.r), 3, QUARTERS[t.q].col.mound, 2.5); break; }
    case 'cleared': stainCell(f.c, f.r); puff(cx(f.c), .5, cz(f.r), 4.5); break;
    case 'refill': heapChanged(f.c, f.r); { const i = R.heapIndex.get(f.r * COLS + f.c); if(i !== undefined){ const t = W.tiles[f.r][f.c]; t.cur = {h:0, r:0}; } } break;
    case 'newLoot': { const o = W.loot.find(l => l.id === f.id); if(o) addLootMesh(o); break; }
    case 'pick': { const g = R.loot.get(f.id); if(g){ R.flyToKevin = R.flyToKevin || []; R.flyToKevin.push({g, t:0}); R.loot.delete(f.id); } break; }
    case 'land': { const o = W.loot.find(l => l.id === f.id); if(o) puff(o.x, .2, o.z, .8); break; }
    case 'rare': { const o = W.loot.find(l => l.id === f.id); if(o) sparkle(o.x, 1, o.z, f.r === 'l' ? 30 : 12, f.r === 'l' ? 0xffd040 : f.r === 'e' ? 0xd090ff : 0x70c0ff); break; }
    case 'newBig': { const o = W.bigs.find(b => b.id === f.id); if(o){ addBigMesh(o); puff(o.x, .5, o.z, 3); } break; }
    case 'newCont': { const o = W.conts.find(b => b.id === f.id); if(o && !R.conts.has(o.id)) addContMesh(o); break; }
    case 'thump': puff(f.x, .3, f.z, 2.2); debris(f.x, .3, f.z, 6, 0x9a8a70, 3); R.cam.shake = Math.max(R.cam.shake, .08); break;
    case 'sellBig': case 'thud': { const g = R.bigs.get(f.id); if(g){ worldGroup.remove(g); R.bigs.delete(f.id); } const sp = C.sellPos(); debris(sp.x, 1, sp.z - 1, 20, 0xffcf3a, 5); puff(sp.x, .5, sp.z - 1, 3); break; }
    case 'sell': { const sp = C.sellPos(); debris(sp.x, 1.2, sp.z - .5, Math.min(40, 6 + f.n * 2), 0xffcf3a, 4); sparkle(sp.x, 1.5, sp.z - .5, 10, 0xffe070); break; }
    case 'opened': { const g = f.big ? R.bigs.get(f.id) : R.conts.get(f.id); if(g){ g.userData.openT = 0.001; const o = (f.big ? W.bigs : W.conts).find(b => b.id === f.id); if(o){ puff(o.x, 1, o.z, 2.5); sparkle(o.x, 1.2, o.z, 10, 0xffffff); } } break; }
    case 'quake': R.shock.position.set(f.x, .1, f.z); R.shockT = 0; R.cam.shake = .9; for(let i = 0; i < 6; i++) puff(f.x + (R2() - .5) * 8, .6, f.z + (R2() - .5) * 8, 4); break;
    case 'magnet': R.shock.position.set(f.x, .1, f.z); R.shockT = 0; R.shock.material.color.setHex(0x70b0ff); setTimeout(() => R.shock.material.color.setHex(0xffb050), 700); break;
    case 'hole': debris(f.x, .3, f.z, 12, 0x6a5038, 3); puff(f.x, .3, f.z, 1.6); { const h = new THREE.Mesh(new THREE.CircleGeometry(.6, 10), new THREE.MeshLambertMaterial({color:0x3a2a1a})); h.rotation.x = -Math.PI / 2; h.position.set(f.x, .03, f.z); worldGroup.add(h); } break;
    case 'joy': if(f.big){ sparkle(W.kevin.x, 2, W.kevin.z, 40, 0xffd040); R.cam.shake = .3; } R.joyT = f.big ? 1.6 : 0.9; break;
    case 'gate': break;
    case 'newWorker': addWorkerMesh(f.w); break;
    case 'workerFind': debris(f.x, 1.2, f.z, 4, 0xffcf3a, 2); break;
    case 'storyItem': case 'diskFound': sparkle(cx(f.c), 1, cz(f.r), 45, 0xffe060); break;
    case 'level': sparkle(W.kevin.x, 2.2, W.kevin.z, 30, 0x80d0ff); break;
    case 'skill': sparkle(W.kevin.x, 2.2, W.kevin.z, 40, 0xffd060); if(f.id === 'BU') R.robo.visible = true; break;
    case 'auction': for(let i = 0; i < 4; i++) setTimeout(() => { const sp = C.sellPos(); sparkle(sp.x, 2, sp.z - 1, 25, 0xffd040); }, i * 200); break;
  }
}

/* =========================================================
   CAMÉRA (3e personne / 1re personne)
   ========================================================= */
export function camInput(dyaw, dpitch){ const c = R.cam; c.yaw -= dyaw; c.pitch = C.clamp(c.pitch + dpitch, c.mode === 'fps' ? -1.2 : .15, c.mode === 'fps' ? 1.2 : 1.35); c.userT = 3; }
export function camZoom(f){ R.cam.dist = C.clamp(R.cam.dist * f, 5, 26); }
export function setView(mode){ R.cam.mode = mode; R.cam.pitch = mode === 'fps' ? -0.25 : 0.72; }
function updateCamera(dt, time){
  const c = R.cam, k = W.kevin;
  if(!k){ return; }
  const moving = k.path.length > 0;
  c.userT -= dt;
  if(R.viewTool) R.viewTool.visible = c.mode === 'fps' && C.S.tool !== 'digger';
  if(c.mode === 'tps'){
    // la caméra se replace doucement derrière Kévin quand il marche (sauf si on vient de la tourner au doigt)
    if(moving && c.userT <= 0 && !k.freeMove){ let d = (k.ang + Math.PI) - c.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); c.yaw += d * Math.min(1, dt * .8); }
    const tg = c.lock || k; c.tx += (tg.x - c.tx) * Math.min(1, dt * 6); c.tz += (tg.z - c.tz) * Math.min(1, dt * 6); c.ty = c.lock && c.lock.y !== undefined ? c.lock.y : 1.3;
    const cp = Math.cos(c.pitch), dist = c.dist;
    R.camera.position.set(c.tx - Math.sin(c.yaw) * cp * dist, c.ty + Math.sin(c.pitch) * dist, c.tz - Math.cos(c.yaw) * cp * dist);
    R.camera.lookAt(c.tx, c.ty, c.tz);
  } else {
    if(!R.viewTool || R.viewTier !== C.toolTier()){ if(R.viewTool) R.camera.remove(R.viewTool); R.viewTool = CH.toolModel(C.toolTier()); R.viewTool.traverse(o => { o.castShadow = false; }); R.viewTier = C.toolTier(); R.camera.add(R.viewTool); }
    const sw = k.target && !moving ? Math.max(0, Math.sin(k.dig)) : 0;
    R.viewTool.position.set(.42, -.12 - sw * .2, -.75 - sw * .15); R.viewTool.rotation.set(-1.15 + sw * .7, .35, .25);
    R.camera.position.set(k.x, 1.65 + Math.abs(Math.sin(k.walk * .5)) * (moving ? .04 : 0), k.z);
    R.camera.lookAt(k.x + Math.sin(c.yaw) * Math.cos(c.pitch), 1.65 + Math.sin(c.pitch), k.z + Math.cos(c.yaw) * Math.cos(c.pitch));
  }
  if(c.shake > 0){ R.camera.position.x += (R2() - .5) * c.shake; R.camera.position.y += (R2() - .5) * c.shake; c.shake = Math.max(0, c.shake - dt * 2.5); }
}
export const camForward = () => ({x:Math.sin(R.cam.yaw), z:Math.cos(R.cam.yaw)});

/* =========================================================
   JOUR / NUIT
   ========================================================= */
const SKY = [ // [moment, haut, horizon, intensité soleil, couleur soleil, hémisphère]
  [0.00, 0x1a2a5a, 0x34487a, 0.0, 0xffffff, 1.05],
  [0.04, 0x2a3a70, 0xf0906a, 0.6, 0xff9060, 0.8],
  [0.12, 0x4a90d8, 0xcfe6f0, 2.2, 0xfff0d0, 1.1],
  [0.50, 0x3a84d0, 0xd8eaf0, 2.6, 0xfff4e0, 1.2],
  [0.64, 0x5a7ac0, 0xf8b070, 1.7, 0xffc080, 0.95],
  [0.74, 0x2e3a70, 0xd06050, 0.5, 0xff7050, 0.8],
  [0.80, 0x1a2a5a, 0x34487a, 0.0, 0xffffff, 1.05],
  [1.00, 0x1a2a5a, 0x34487a, 0.0, 0xffffff, 1.05],
];
const ca = new THREE.Color(), cb = new THREE.Color();
function lerpHex(a, b, u, out){ ca.setHex(a); cb.setHex(b); return out.copy(ca).lerp(cb, u); }
function updateDayNight(){
  const t = C.S.dayT; let i = 0; while(i < SKY.length - 2 && SKY[i + 1][0] <= t) i++;
  const a = SKY[i], b = SKY[i + 1], u = (t - a[0]) / (b[0] - a[0] || 1);
  lerpHex(a[1], b[1], u, R.skyMat.uniforms.top.value); lerpHex(a[2], b[2], u, R.skyMat.uniforms.hor.value);
  R.skyMat.uniforms.bot.value.copy(R.skyMat.uniforms.hor.value).multiplyScalar(.7);
  const night = 1 - Math.min(1, (a[3] + (b[3] - a[3]) * u) / 1.2);
  R.sun.intensity = a[3] + (b[3] - a[3]) * u; lerpHex(a[4], b[4], u, R.sun.color);
  R.hemi.intensity = a[5] + (b[5] - a[5]) * u; R.hemi.color.copy(R.skyMat.uniforms.hor.value).lerp(new THREE.Color(0xffffff), night > .5 ? .35 : .5);
  R.scene.fog.color.copy(R.skyMat.uniforms.hor.value).lerp(R.skyMat.uniforms.top.value, .25);
  R.stars.material.opacity = Math.max(0, night - .3) * 1.2;
  // le soleil fait le tour (lune la nuit : lumière bleutée faible)
  const ang = (t - 0.04) / 0.74 * Math.PI, el = Math.sin(Math.max(0.05, Math.min(Math.PI - .05, ang)));
  const k = W.kevin || {x:0, z:cz(NQ * QROWS)};
  const dir = new THREE.Vector3(Math.cos(ang) * .8, Math.max(.25, el), .45).normalize();
  if(night > .85){ dir.set(-.4, .9, .3).normalize(); R.sun.intensity = 1.25; R.sun.color.setHex(0xa8b8e8); }
  R.sun.position.set(k.x + dir.x * 50, dir.y * 50, k.z + dir.z * 50); R.sun.target.position.set(k.x, 0, k.z);
  R.skyMat.uniforms.sunDir.value.copy(dir);
  // lampadaires
  const on = night > .4;
  for(const l of R.lamps) l.userData.bulb.material.color.setHex(on ? 0xffe8a0 : 0x554a30);
  if(R.q.lights && on){
    const sorted = R.lamps.slice().sort((p, q) => Math.hypot(p.position.x - k.x, p.position.z - k.z) - Math.hypot(q.position.x - k.x, q.position.z - k.z));
    R.pointLights.forEach((p, i) => { const l = sorted[i]; p.intensity = l ? 12 * night : 0; if(l) p.position.set(l.position.x + .8, 4.6, l.position.z); });
  } else R.pointLights.forEach(p => p.intensity = 0);
  R.fireLight.intensity = (R.q.lights ? 6 : 0) * (.6 + night) * (0.8 + Math.random() * .3);
  return night;
}

/* =========================================================
   IMAGE PAR IMAGE
   ========================================================= */
const v3 = new THREE.Vector3();
export function frame(dt, time){
  if(!R.ready || !W.kevin) return;
  const S = C.S, k = W.kevin;
  animateHeaps(dt); cullDecos(false); updateFx(dt);
  const night = updateDayNight();
  // --- Kévin (et ses véhicules / outils) ---
  const kv = R.kevin, ud = kv.userData, moving = k.path.length > 0 || k.freeMove > 0, digging = !!k.target && !moving, inDigger = S.tool === 'digger';
  kv.position.set(k.x, 0, k.z); kv.rotation.y = k.ang;
  const tier = C.toolTier();
  if(tier !== R.kevinTier){ if(R.kevinTool) ud.hand.remove(R.kevinTool); R.kevinTool = CH.toolModel(tier); holdTool(kv, R.kevinTool); ud.hand.add(R.kevinTool); R.kevinTier = tier; }
  if(ud.bag) ud.bag.scale.setScalar(0.7 + Math.min(1.2, S.up.sac * 0.1) + Math.min(.4, S.bag.length / Math.max(1, C.bagCap()) * .4));
  animatePerson(kv, {moving, digging:digging || !!k.job, dig:k.dig, walk:k.walk, carry:!!k.carry, push:!!k.push, pick:k.pickT > 0, joy:R.joyT > 0, run:S.up.boots > 3}, time, dt);
  if(R.joyT > 0) R.joyT -= dt;
  kv.visible = R.cam.mode !== 'fps';
  R.digger.visible = inDigger && R.cam.mode !== 'fps';
  if(inDigger){ R.digger.position.set(k.x, 0, k.z); R.digger.rotation.y = k.ang; const a = digging ? Math.sin(k.dig) : 0;
    R.digger.userData.arm1.rotation.x = .25 - a * .35; R.digger.userData.arm2.rotation.x = .9 + a * .6;
    kv.position.set(k.x + Math.sin(k.ang) * -.3 + Math.cos(k.ang) * -.25, .55, k.z + Math.cos(k.ang) * -.3 - Math.sin(k.ang) * -.25); showLegs(ud, false); }
  else showLegs(ud, true);
  R.brouette.visible = S.up.brou && !inDigger && !k.carry && R.cam.mode !== 'fps';
  if(R.brouette.visible){ R.brouette.position.set(k.x + Math.sin(k.ang) * .9, 0, k.z + Math.cos(k.ang) * .9); R.brouette.rotation.y = k.ang; }
  // --- Josiane ---
  animatePerson(R.josiane, {moving:false, wave:Math.hypot(k.x - R.josiane.position.x, k.z - R.josiane.position.z) < 6}, time, dt);
  R.josiane.lookAt(k.x, 0, k.z); R.josiane.rotation.x = 0; R.josiane.rotation.z = 0;
  // --- employés ---
  for(const [w, m] of R.workers){
    m.position.set(w.x, 0, w.z); m.rotation.y = w.ang;
    const mv = w.path.length > 0, dg = !!w.target && !mv;
    if(m.userData.hips || m.userData.kay) animatePerson(m, {moving:mv, digging:dg, dig:w.dig, walk:w.walk}, time, dt);
    else if(m.userData.glb){ robotPlay(m, mv ? 'Walking' : dg ? 'Punch' : 'Idle'); m.userData.mixer.update(dt); }
    else if(m.userData.tail){ m.userData.head.position.y = .66 + (dg ? Math.sin(w.dig * 2) * .1 : 0); m.userData.head.rotation.x = dg ? .4 + Math.sin(w.dig * 2) * .2 : 0;
      m.userData.tail.rotation.z = Math.sin(time * 14) * .5; m.position.y = mv ? Math.abs(Math.sin(w.walk)) * .06 : 0; }
    else if(m.userData.arm){ m.userData.arm.rotation.x = dg ? -.6 + Math.max(0, Math.sin(w.dig)) * 1.2 : 0; }
    else if(w.type === 'dozer'){ m.position.y = dg ? Math.abs(Math.sin(w.dig * 2)) * .05 : 0; }
  }
  // --- objets au sol (vol, rotation, lueur) ---
  for(const [id, g] of R.loot){ const o = W.loot.find(l => l.id === id); if(!o){ worldGroup.remove(g); R.loot.delete(id); continue; }
    g.position.set(o.x, o.y + (o.landed ? Math.sin(time * 3 + g.userData.spin) * .06 + .1 : 0), o.z); g.rotation.y = time * 1.5 + g.userData.spin;
    if(g.userData.glow) g.userData.glow.material.opacity = .6 + Math.sin(time * 5 + g.userData.spin) * .3; }
  if(R.flyToKevin) for(let i = R.flyToKevin.length - 1; i >= 0; i--){ const f = R.flyToKevin[i]; f.t += dt * 3.5;
    f.g.position.lerp(v3.set(k.x, 1.4, k.z), Math.min(1, f.t)); f.g.scale.setScalar(Math.max(.01, 1 - f.t));
    if(f.t >= 1){ worldGroup.remove(f.g); R.flyToKevin.splice(i, 1); } }
  // --- gros objets ---
  for(const o of W.bigs){ const g = R.bigs.get(o.id); if(!g) continue;
    if(o.state === 'carried'){ g.position.set(k.x, 1.95, k.z); g.rotation.set(0, k.ang, 0); g.scale.setScalar(.85); }
    else { g.position.set(o.x, o.y || 0, o.z); g.rotation.y = o.rot || 0; g.scale.setScalar(1); if(o.state === 'thrown') g.rotation.x = o.rot; else g.rotation.x = 0; }
    if(g.userData.openT > 0 && g.userData.openT < 1){ g.userData.openT = Math.min(1, g.userData.openT + dt * 2); openDoor(g, o.kind, g.userData.openT); } }
  for(const o of W.conts){ const g = R.conts.get(o.id); if(g && g.userData.openT > 0 && g.userData.openT < 1){ g.userData.openT = Math.min(1, g.userData.openT + dt * 2); openDoor(g, o.kind, g.userData.openT); } }
  // --- camion, grue, robot, drone ---
  const tr = W.truck; R.truck.visible = S.up.truck; if(tr){ R.truck.position.set(tr.x, 0, tr.z); if(tr.path.length) R.truck.rotation.y = tr.ang; else if(tr.state === 'home') R.truck.rotation.y = Math.PI; R.truck.userData.load.visible = tr.load.length > 0 || tr.state === 'load'; }
  if(R.truck.userData.load.children.length === 0){ for(let i = 0; i < 6; i++){ const m = new THREE.Mesh(M.decoGeo('bag'), M.VCOL); m.position.set((i % 3 - 1) * .55, 0, (Math.floor(i / 3) - .5) * .9); m.scale.setScalar(.9); R.truck.userData.load.add(m); } }
  const cr = W.crane; R.crane.visible = true;
  if(cr){ const jx = cr.hx - R.crane.position.x, jz = cr.hz - R.crane.position.z; R.crane.userData.jib.rotation.y = Math.atan2(jx, jz);
    R.hook.position.set(cr.hx, cr.hy, cr.hz); R.cable.position.set(cr.hx, (cr.hy + 15) / 2, cr.hz); R.cable.scale.y = Math.max(.1, 15 - cr.hy); R.hook.visible = R.cable.visible = S.up.crane; }
  if(W.robo){ R.robo.visible = true; R.robo.position.set(W.robo.x, W.robo.y, W.robo.z); R.robo.rotation.y = W.robo.ang || 0; R.robo.userData.prop.rotation.y = time * 30; }
  R.hint.visible = S.story.found && !S.disk.found; if(R.hint.visible) R.hint.position.set(S.side < 0 ? cx(0) - CELL / 2 + COLS * CELL / 4 : cx(COLS - 1) + CELL / 2 - COLS * CELL / 4, .05, (rowStart(6) + QROWS / 2 - .5) * CELL);
  R.droneRing.visible = R.drone.visible = S.up.drone && !S.disk.found;
  if(R.drone.visible){ const ox = ((S.seed % 7) - 3) * .5, oz = ((S.seed % 5) - 2) * .5; R.droneRing.position.set(cx(S.disk.c) + ox, .08, cz(S.disk.r) + oz);
    R.drone.position.set(cx(S.disk.c) + Math.cos(time * .6) * 6, 7 + Math.sin(time * 2) * .3, cz(S.disk.r) + Math.sin(time * .6) * 6); R.drone.userData.prop.rotation.y = time * 30; }
  // --- détecteur : onde au sol ---
  const det = C.DET; if(det.pulse > 0 && det.strength > 0){ const col = det.strength > .66 ? 0xff5040 : det.strength > .33 ? 0xffc840 : 0x7bd88f;
    R.detRing.material.color.setHex(col); R.detRing.material.opacity = det.pulse * .8; R.detRing.scale.setScalar(1 + (1 - det.pulse) * 4); R.detRing.position.set(k.x, .06, k.z); } else R.detRing.material.opacity = 0;
  // --- portails ---
  for(const g of R.gates){ drawGateSign(g); const open = S.unlocked[g.q] ? 1 : 0; g.open += (open - g.open) * Math.min(1, dt * 3); g.dl.rotation.y = g.open * 1.6; g.dr.rotation.y = -g.open * 1.6; g.lock.visible = !S.unlocked[g.q]; }
  // --- ambiance : mouettes, mouches, fumée ---
  for(const g of R.gulls){ const u = g.userData, a = time * u.sp + u.ph; g.position.set(k.x + u.c[0] + Math.cos(a) * u.rad, u.h + Math.sin(a * 2) * 1.5, k.z - 20 + Math.sin(a) * u.rad); g.rotation.y = -a; const fl = Math.sin(time * 9 + u.ph) * .5; u.wl.rotation.z = fl; u.wr.rotation.z = -fl; }
  updateFlies(dt, time);
  for(const s of R.smoke){ s.t += dt * .25; if(s.t > 1) s.t -= 1; s.s.position.set(R.fire.position.x + Math.sin(s.t * 9) * .3 * s.t, 1.1 + s.t * 5, R.fire.position.z + s.t * .8); s.s.scale.setScalar(.6 + s.t * 2.2); s.s.material.opacity = .35 * (1 - s.t) * (s.t > .05 ? 1 : s.t * 20); s.s.material.color.setHex(s.t < .15 ? 0xff9040 : 0x6a6a6a); }
  // --- cercle de sélection (dernier ordre) ---
  if(R.sel && R.sel.t > 0){ R.sel.t -= dt; R.selRing.visible = true; R.selRing.position.set(R.sel.x, .07, R.sel.z); R.selRing.material.opacity = Math.min(1, R.sel.t * 2); R.selRing.scale.setScalar(1 + (1 - Math.min(1, R.sel.t)) * .3); } else R.selRing.visible = false;
  updateCamera(dt, time);
  R.renderer.render(R.scene, R.camera);
}
export function markSel(x, z){ R.sel = {x, z, t:1}; }
function updateFlies(dt, time){
  const k = W.kevin, pos = R.flies.geometry.attributes.position;
  // les mouches tournent autour des tas les plus proches de Kévin
  if(!R.flyHeaps || time - (R.flyHeapsT || 0) > 2){ R.flyHeapsT = time; R.flyHeaps = [];
    for(let r = Math.max(0, k.r - 4); r < Math.min(NQ * QROWS, k.r + 4); r++) for(let c = 0; c < COLS; c++) if(W.tiles[r][c].L) R.flyHeaps.push([cx(c), cz(r), W.tiles[r][c].L]);
    R.flyHeaps = R.flyHeaps.sort(() => R2() - .5).slice(0, 6); }
  R.flyData.forEach((f, i) => { const h = R.flyHeaps[i % Math.max(1, R.flyHeaps.length)]; if(!h){ pos.setXYZ(i, 0, -50, 0); return; }
    const a = time * f.sp + f.ph; pos.setXYZ(i, h[0] + Math.cos(a) * f.rad + Math.sin(a * 2.3) * .2, heapH(h[2]) + f.h * .5 + Math.sin(a * 3.1) * .25, h[1] + Math.sin(a) * f.rad); });
  pos.needsUpdate = true;
}
/** Animation procédurale d'un personnage (épaules, coudes, hanches, genoux) */
function showLegs(u, v){ if(u.legs) u.legs.forEach(l => { l.visible = v; }); else { u.legL.visible = u.legR.visible = v; } }
/** Outil tenu en main : l'orientation dépend du type de personnage */
function holdTool(g, t){
  if(!g.userData.kay){ t.rotation.x = -1.25; return; }
  // personnages KayKit : la main tient le bout du manche, l'outil part vers l'avant (+Y de la main)
  if(t.userData.tier === 1){ t.rotation.set(0, 0, 0); t.position.set(0, .72, 0); } else { t.rotation.set(0, 0, Math.PI); t.position.set(0, 0, 0); }
}
const up1 = new THREE.Euler();
/** Animation d'un personnage 3D KayKit : on choisit l'animation selon ce qu'il fait */
function animateKay(g, s, dt){
  const u = g.userData;
  const name = s.joy ? 'Cheer' : s.pick ? 'PickUp' : (s.carry || s.push) ? (s.moving ? 'Walking_A' : 'Idle')
    : s.digging ? '2H_Melee_Attack_Chop' : s.moving ? (s.run ? 'Running_A' : 'Walking_A') : s.wave ? 'Interact' : 'Idle';
  playChar(g, name, name === 'Walking_A' ? 1.25 : name === '2H_Melee_Attack_Chop' ? 1.3 : 1);
  u.mixer.update(dt);
  const b = u.bones;
  if(u.hand) u.hand.visible = !s.carry;
  if(s.carry && b.upperarml){ b.upperarml.rotation.set(CARRY[0], CARRY[1], CARRY[2]); b.upperarmr.rotation.set(CARRY[0], -CARRY[1], -CARRY[2]); b.lowerarml.rotation.set(0, 0, 0); b.lowerarmr.rotation.set(0, 0, 0); }
  if(s.push && b.spine){ b.spine.rotation.x += .35; }
}
const CARRY = [.3, 0, -.5]; // bras levés de chaque côté de la tête (objet porté au-dessus)
function animatePerson(g, s, time, dt = 1 / 60){
  const u = g.userData; if(u.kay) return animateKay(g, s, dt); if(!u.hips) return;
  const w = s.walk || time * 6, sw = s.moving ? Math.sin(w) : 0, base = u.baseY || .94;
  u.legL.rotation.x = sw * .65; u.legR.rotation.x = -sw * .65;
  if(u.kneeL){ u.kneeL.rotation.x = s.moving ? Math.max(0, Math.sin(w + 1.6)) * .95 : s.pick ? .9 : 0; u.kneeR.rotation.x = s.moving ? Math.max(0, Math.sin(w - 1.6)) * .95 : s.pick ? .9 : 0; }
  if(s.pick){ u.legL.rotation.x = u.legR.rotation.x = -.6; }
  const breathe = s.moving ? 0 : Math.sin(time * 2.2) * .012;
  u.hips.position.y = base + (s.moving ? Math.abs(Math.sin(w)) * .05 : 0) + (s.joy ? Math.abs(Math.sin(time * 10)) * .35 : 0) - (s.pick ? .22 : 0) + breathe;
  u.torso.rotation.x = s.pick ? .75 : s.push ? .45 : s.digging ? .2 + Math.max(0, Math.sin(s.dig)) * .3 : (s.moving ? .08 : 0);
  u.torso.rotation.y = s.moving ? sw * .08 : 0;
  let eL = -.15, eR = -.15;
  if(s.carry){ u.armL.rotation.set(-2.9, 0, -.25); u.armR.rotation.set(-2.9, 0, .25); eL = eR = -.35; }
  else if(s.joy){ u.armL.rotation.set(-2.8 + Math.sin(time * 12) * .3, 0, -.5); u.armR.rotation.set(-2.8 - Math.sin(time * 12) * .3, 0, .5); eL = eR = -.2; }
  else if(s.push){ u.armL.rotation.set(-1.35, 0, -.1); u.armR.rotation.set(-1.35, 0, .1); eL = eR = -.3; }
  else if(s.digging){ const a = Math.sin(s.dig); u.armR.rotation.set(-.7 - a * 1.5, 0, .1); u.armL.rotation.set(-.6 - a * 1.3, 0, -.15); eR = -.5 + a * .35; eL = -.7 + a * .3; }
  else if(s.pick){ u.armL.rotation.set(-1.1, 0, 0); u.armR.rotation.set(-1.2, 0, 0); eL = eR = -.3; }
  else if(s.wave){ u.armL.rotation.set(-2.5, 0, -.3); eL = -.6 + Math.sin(time * 8) * .5; u.armR.rotation.set(0, 0, .05); }
  else { u.armL.rotation.set(-sw * .55, 0, -.06); u.armR.rotation.set(sw * .55, 0, .06); eL = -.25 - Math.max(0, -sw) * .3; eR = -.25 - Math.max(0, sw) * .3; }
  if(u.elbowL){ u.elbowL.rotation.x = eL; u.elbowR.rotation.x = eR; }
  u.head.rotation.y = Math.sin(time * .7 + g.id) * .18; u.head.rotation.x = s.pick ? .3 : Math.sin(time * .5 + g.id) * .04;
}

/* =========================================================
   CE QUE TOUCHE LE JOUEUR (rayon depuis la caméra)
   ========================================================= */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
export function pickAt(sx, sy){
  ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, R.camera);
  const objs = [R.heaps, ...Object.values(R.decos).map(d => d.mesh), ...R.loot.values(), ...R.bigs.values(), ...R.conts.values(), R.hut, R.josiane, R.ground, ...R.gates.map(g => g.sign)];
  const hits = ray.intersectObjects(objs, true);
  for(const h of hits){
    let o = h.object; const kind = o.userData.kind || (o.parent && o.parent.userData.kind);
    if(kind === 'loot' || kind === 'big' || kind === 'cont'){ let p = o; while(p && p.userData.id === undefined) p = p.parent; return {kind, id:p ? p.userData.id : o.userData.id, point:h.point}; }
    if(kind === 'gate'){ if(!o.visible) continue; return {kind, q:o.userData.q, point:h.point}; }
    if(kind === 'hut') return {kind:'hut', point:h.point};
    if(kind === 'heap'){ const [c, r] = R.heapCells[h.instanceId]; return {kind:'heap', c, r, point:h.point}; }
    if(kind === 'deco'){ const d = R.decos[o.userData.geo]; const hi = d.lookup[h.instanceId]; const [c, r] = R.heapCells[hi]; if(!W.tiles[r][c].L) continue; return {kind:'heap', c, r, point:h.point}; }
    if(kind === 'ground'){
      // tout près d'un objet au sol ? on le prend (plus facile au doigt)
      const near = W.loot.filter(l => l.landed).sort((a, b) => Math.hypot(a.x - h.point.x, a.z - h.point.z) - Math.hypot(b.x - h.point.x, b.z - h.point.z))[0];
      if(near && Math.hypot(near.x - h.point.x, near.z - h.point.z) < .9) return {kind:'loot', id:near.id, point:h.point};
      return {kind:'ground', point:h.point};
    }
  }
  return null;
}
/** Position écran d'un point du monde (pour les bulles et les textes flottants) */
export function toScreen(x, y, z){ v3.set(x, y, z).project(R.camera); if(v3.z > 1) return null; return {x:(v3.x + 1) / 2 * innerWidth, y:(1 - v3.y) / 2 * innerHeight}; }
