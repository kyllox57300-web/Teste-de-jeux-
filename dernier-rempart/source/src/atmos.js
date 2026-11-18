// Atmosphere pass: aged surfaces, light volumes, moon shafts, ground fog, grass, clouds, clutter, decals and lightning.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { G } from './ctx.js';
import { ROOMS } from './world.js';
import { cv, imgTex, noiseCanvas } from './textures.js';
import { mulberry32, rand } from './util.js';
import * as SND from './audio.js';

const MOON = new THREE.Vector3(-0.55, 0.62, 0.56).normalize();
export const NOISE_GLSL = `
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fb3(vec3 p){ return 0.55 * n3(p) + 0.3 * n3(p * 2.03 + 7.1) + 0.15 * n3(p * 4.1 + 3.7); }
`;

// ---------- aged surfaces: done in the material's own shader so every wall, floor and ceiling gets it for free
function weather(mat, kind) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = mat3(modelMatrix) * objectNormal;');
    let body = '';
    if (kind === 'brick') body = `
      // which room does this wall face? sample a point a little in front of the surface
      vec3 wn = normalize(vWN); vec2 q = vWP.xz + wn.xz * 0.25; int room = 0; bumpK = 1.0;
      if (abs(wn.y) < 0.5) {
        if (q.x > -8.0 && q.x < 4.0 && q.y > -6.0 && q.y < 6.0) room = 1;            // salle commune
        else if (q.x > 4.0 && q.x < 16.0 && q.y > -6.0 && q.y < 2.0) room = 2;       // atelier
        else if (q.x > -8.0 && q.x < 16.0 && q.y > -14.0 && q.y < -6.0) room = 3;    // grande halle
        else if (q.x > 4.0 && q.x < 34.0 && q.y > -26.0 && q.y < -14.0) room = 5;    // grange
        else if (q.x > -8.0 && q.x < 4.0 && q.y > -26.0 && q.y < -14.0) room = 6;    // dortoir
        if (room == 0) { // a reveal inside the wall thickness: look either side of it
          vec2 pp = vec2(wn.z, wn.x);
          for (int k = 0; k < 2; k++) { vec2 r2 = vWP.xz + pp * (k == 0 ? 0.32 : -0.32);
            if (r2.x > -8.0 && r2.x < 4.0 && r2.y > -6.0 && r2.y < 6.0) room = 1; else if (r2.x > 4.0 && r2.x < 16.0 && r2.y > -6.0 && r2.y < 2.0) room = 2;
            else if (r2.x > 4.0 && r2.x < 34.0 && r2.y > -26.0 && r2.y < -14.0) room = 5; else if (r2.x > -8.0 && r2.x < 4.0 && r2.y > -26.0 && r2.y < -14.0) room = 6;
            if (room != 0) break; }
        }
      }
      float u = vWP.x * abs(wn.z) + vWP.z * abs(wn.x), y = vWP.y;
      float m = fb3(vWP * vec3(0.8, 1.0, 0.8)), pn = fb3(vWP * 3.0), wallRough = -1.0;
      vec3 brick = diffuseColor.rgb;
      vec3 plaster = vec3(0.13, 0.12, 0.095) * (0.65 + 0.55 * pn) * mix(vec3(1.0), vec3(0.72, 0.8, 0.62), smoothstep(0.35, 0.75, fb3(vWP * 0.5 + 9.0)));
      float tn = fb3(vWP * 0.9 + vec3(5.0, 1.3, -2.1)), tear = smoothstep(0.665, 0.69, tn), tearEdge = smoothstep(0.645, 0.665, tn) - tear;
      float stain = smoothstep(0.5, 0.8, fb3(vec3(u * 0.8, y * 0.35, 3.0))) * smoothstep(0.5, 3.2, y);
      if (room == 1) {
        if (y < 1.05) { // dark wood wainscot: vertical boards with grooves, a rail on top
          float bd = fract(u * 1.7), groove = smoothstep(0.0, 0.04, bd) * smoothstep(1.0, 0.96, bd);
          vec3 wood = vec3(0.075, 0.036, 0.018) * (0.75 + 0.5 * n3(vec3(u * 3.0, y * 45.0, 1.0))) * mix(0.5, 1.0, groove);
          diffuseColor.rgb = mix(wood, wood * 1.8, smoothstep(0.95, 1.0, y)); wallRough = 0.55;
        } else {
          vec2 c = fract(vec2(u * 5.0, y * 5.0 + floor(u * 5.0) * 0.5)) - 0.5;
          float dam = smoothstep(0.2, 0.12, length(c * vec2(1.0, 1.6))) * (0.6 + 0.4 * n3(vec3(u * 40.0, y * 40.0, 2.0)));
          vec3 paper = mix(vec3(0.045, 0.07, 0.05), vec3(0.085, 0.11, 0.075), dam) * mix(0.85, 1.0, step(0.5, fract(u * 2.5)));
          paper = mix(paper, paper * vec3(0.9, 0.75, 0.5), stain * 0.8);
          diffuseColor.rgb = mix(mix(paper, vec3(0.16, 0.15, 0.12), tearEdge), mix(plaster, brick, smoothstep(0.7, 0.73, tn)), tear); wallRough = 0.92;
        }
      } else if (room == 6) { // faded floral paper
        vec2 c = fract(vec2(u * 4.0, y * 4.0 + floor(u * 4.0) * 0.5)) - 0.5; float a = atan(c.y, c.x), r = length(c);
        float flower = smoothstep(0.13, 0.09, r - 0.03 * sin(a * 5.0)), leaf = smoothstep(0.03, 0.0, abs(c.x + c.y * 0.6) - 0.004) * step(r, 0.35);
        vec3 paper = vec3(0.22, 0.16, 0.12); paper = mix(paper, vec3(0.2, 0.06, 0.06), flower * 0.7); paper = mix(paper, vec3(0.08, 0.12, 0.07), leaf * 0.5);
        paper *= mix(0.9, 1.0, step(0.5, fract(u * 8.0))); paper = mix(paper, paper * vec3(0.7, 0.55, 0.35), stain);
        diffuseColor.rgb = mix(mix(paper, vec3(0.3, 0.27, 0.22), tearEdge), mix(plaster, brick, 0.5), tear); wallRough = 0.95;
      } else if (room == 2) { // workshop: green enamel dado, whitewash above, flaking
        vec3 paint = y < 1.4 ? vec3(0.03, 0.08, 0.05) : vec3(0.19, 0.185, 0.165) * (0.8 + 0.25 * pn);
        if (y > 1.36 && y < 1.43) paint = vec3(0.12, 0.02, 0.015);
        float flake = smoothstep(0.62, 0.66, fb3(vWP * 1.3 + 2.0));
        diffuseColor.rgb = mix(paint * (0.85 + 0.3 * pn), brick, flake); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.7, 0.6, 0.45), stain * 0.6);
        wallRough = y < 1.4 ? mix(0.45, 0.9, flake) : 0.9;
      } else if (room == 5) { // barn: horizontal planks
        float pl2 = fract(y * 3.6 + n3(vec3(u * 0.2, 0.0, 7.0)) * 0.1), seam = smoothstep(0.0, 0.05, pl2) * smoothstep(1.0, 0.95, pl2);
        float board = floor(y * 3.6), grain = n3(vec3(u * 1.2 + board * 7.0, y * 60.0, board));
        diffuseColor.rgb = vec3(0.09, 0.055, 0.03) * (0.6 + 0.6 * grain) * mix(0.35, 1.0, seam) * (0.8 + 0.4 * n3(vec3(board * 3.1, 0.0, 1.0))); wallRough = 0.85;
      } else {
        if (room == 3) brick = mix(brick, vec3(0.2, 0.19, 0.17) * (0.75 + 0.35 * pn), smoothstep(0.4, 0.75, fb3(vec3(u * 0.7, y * 0.25, 11.0))) * 0.55); // old limewash, streaked
        float pl = smoothstep(0.4, 0.44, m) * smoothstep(0.05, 0.6, y);
        diffuseColor.rgb = mix(brick, plaster, pl);
        float edge = smoothstep(0.385, 0.4, m) * (1.0 - smoothstep(0.4, 0.42, m));
        diffuseColor.rgb *= 1.0 - edge * 0.35;
        float streak = smoothstep(0.55, 0.85, n3(vec3((vWP.x + vWP.z) * 3.1, y * 0.22, 1.0)));
        diffuseColor.rgb *= 1.0 - streak * 0.4 * smoothstep(3.2, 0.8, y);
      }
      diffuseColor.rgb *= mix(0.45, 1.0, smoothstep(0.0, 0.9, y)) * mix(0.55, 1.0, smoothstep(3.2, 2.2, y));
      // brick relief only where brick shows: papered, painted and boarded walls are flat
      bumpK = (room == 0 || room == 3) ? 1.0 : room == 5 ? 0.2 : room == 2 ? mix(0.06, 1.0, smoothstep(0.62, 0.66, fb3(vWP * 1.3 + 2.0))) : mix(0.04, 1.0, tear);`;
    else if (kind === 'floor') body = `
      float d = fb3(vec3(vWP.xz * 0.45, 0.0));
      diffuseColor.rgb *= mix(0.6, 1.05, d);
      float dust = smoothstep(0.58, 0.85, fb3(vec3(vWP.xz * 1.1, 5.0)));
      diffuseColor.rgb = mix(diffuseColor.rgb, dot(diffuseColor.rgb, vec3(0.33)) * vec3(1.15, 1.1, 1.0), dust * 0.6);`;
    else if (kind === 'ceil') body = `diffuseColor.rgb *= mix(0.55, 1.0, fb3(vec3(vWP.xz * 0.5, 2.0)));`;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;' + NOISE_GLSL).replace('#include <map_fragment>', '#include <map_fragment>\n' + body);
    if (kind === 'brick') sh.fragmentShader = sh.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nif (wallRough > 0.0) roughnessFactor = wallRough;')
      .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replace('dHdxy_fwd()', 'dHdxy_fwd() * bumpK'))
      .replace('void main() {', 'float bumpK = 1.0;\nvoid main() {');
  };
  mat.customProgramCacheKey = () => 'weather-' + kind;
  mat.needsUpdate = true;
}

// soft vertical gradient used by light volumes
function volMat(color, strength) {
  return new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(color) }, uK: { value: strength }, uT: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vWP;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uK, uT; varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vWP; ${NOISE_GLSL}
      void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
        float a = uK * f * pow(vUv.y, 1.3) * (0.7 + 0.6 * fb3(vWP * 1.4 + vec3(0.0, uT * 0.15, uT * 0.05)));
        gl_FragColor = vec4(uCol * a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

function shaftMat() {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uK: { value: 1 } },
    vertexShader: `varying vec2 vUv; varying vec3 vWP; void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform float uT, uK; varying vec2 vUv; varying vec3 vWP; ${NOISE_GLSL}
      void main(){ float side = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
        float a = side * pow(1.0 - vUv.y, 1.8) * smoothstep(0.0, 0.12, vUv.y) * (0.35 + 0.9 * fb3(vWP * 1.8 + vec3(uT * 0.08, -uT * 0.05, 0.0))) * 0.03 * uK;
        gl_FragColor = vec4(vec3(0.55, 0.68, 1.0) * a, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

function fogMat(seed, k) {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uK: { value: k }, uSeed: { value: seed } },
    vertexShader: `varying vec3 vWP; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform float uT, uK, uSeed; varying vec3 vWP; ${NOISE_GLSL}
      bool inside(vec2 p){ bool big = p.x > -8.2 && p.x < 34.2 && p.y > -26.2 && p.y < 6.2; bool yard = p.x > 16.0 && p.x < 34.0 && p.y > -14.0 && p.y < 6.0; bool notch = p.x > 4.0 && p.x < 16.0 && p.y > 2.2; return big && !yard && !notch; }
      void main(){ if (inside(vWP.xz)) discard;
        float n = fb3(vec3(vWP.xz * 0.11 + vec2(uT * 0.025, uT * 0.012), uSeed));
        float yardK = (vWP.x > 16.0 && vWP.x < 34.0 && vWP.z > -14.0 && vWP.z < 24.0) ? 0.5 : 1.0;
        float a = smoothstep(0.35, 0.75, n) * uK * yardK * smoothstep(120.0, 40.0, length(vWP.xz - vec2(13.0, -10.0)));
        gl_FragColor = vec4(vec3(0.05, 0.062, 0.085), a); }`,
    transparent: true, depthWrite: false,
  });
}

function cloudMat() {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uFlash: { value: 0 }, uMoon: { value: MOON } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uT, uFlash; uniform vec3 uMoon; varying vec3 vD; ${NOISE_GLSL}
      void main(){ if (vD.y < 0.0) discard;
        vec2 p = vD.xz / (vD.y + 0.18) * 1.6 + vec2(uT * 0.006, uT * 0.002);
        float c = smoothstep(0.42, 0.78, fb3(vec3(p, 1.0)) * 0.7 + fb3(vec3(p * 2.7, 4.0)) * 0.3);
        float lit = pow(max(dot(vD, uMoon), 0.0), 6.0);
        vec3 col = mix(vec3(0.05, 0.065, 0.09), vec3(0.32, 0.36, 0.44), lit) + uFlash * vec3(0.6, 0.65, 0.8);
        float a = c * smoothstep(0.0, 0.18, vD.y) * 0.92;
        gl_FragColor = vec4(col, a); }`,
    transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
  });
}

function cobwebTex() {
  const c = cv(256), x = c.getContext('2d'), r = mulberry32(7); x.strokeStyle = 'rgba(220,220,215,0.55)'; x.lineWidth = 1;
  const spokes = 9;
  for (let i = 0; i < spokes; i++) { const a = (i / (spokes - 1)) * Math.PI / 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); x.stroke(); }
  for (let k = 1; k < 12; k++) { const R = k * 21 + r() * 6; x.beginPath(); for (let i = 0; i < spokes; i++) { const a = (i / (spokes - 1)) * Math.PI / 2, rr = R * (0.9 + r() * 0.15); const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (i) x.quadraticCurveTo(Math.cos(a - 0.1) * rr * 0.92, Math.sin(a - 0.1) * rr * 0.92, px, py); else x.moveTo(px, py); } x.stroke(); }
  return imgTex(c, { repeat: false });
}
function grassTex() {
  const c = cv(128), x = c.getContext('2d'), r = mulberry32(3);
  for (let i = 0; i < 46; i++) { const bx = 8 + r() * 112, h = 50 + r() * 76, lean = (r() - 0.5) * 40, w = 2 + r() * 3; const g = 60 + r() * 50; x.strokeStyle = `rgb(${g * 0.8 | 0},${g | 0},${g * 0.55 | 0})`; x.lineWidth = w; x.beginPath(); x.moveTo(bx, 128); x.quadraticCurveTo(bx + lean * 0.3, 128 - h * 0.6, bx + lean, 128 - h); x.stroke(); }
  return imgTex(c, { repeat: false });
}
function writing(text, sub) {
  const c = cv(1024, 256), x = c.getContext('2d'); x.font = "700 150px 'Special Elite','Courier New',monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(110,8,6,0.92)'; x.save(); x.translate(512, 120); x.rotate(-0.04); x.fillText(text, 0, 0); x.restore();
  const r = mulberry32(text.length * 7); x.strokeStyle = 'rgba(100,6,4,0.85)'; x.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const px = 80 + r() * 864, py = 150 + r() * 20; x.lineWidth = 3 + r() * 5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py + 20 + r() * 80); x.stroke(); }
  if (sub) { x.font = "400 54px 'Special Elite','Courier New',monospace"; x.fillStyle = 'rgba(30,24,20,0.85)'; x.fillText(sub, 512, 222); }
  return imgTex(c, { repeat: false });
}
function handprint() {
  const c = cv(128), x = c.getContext('2d'); x.fillStyle = 'rgba(95,8,6,0.88)';
  x.beginPath(); x.ellipse(64, 80, 26, 30, 0, 0, 6.3); x.fill();
  for (const [dx, len, a] of [[-26, 30, -0.5], [-12, 44, -0.15], [4, 48, 0], [20, 42, 0.15], [34, 30, 0.45]]) { x.save(); x.translate(64 + dx * 0.9, 62); x.rotate(a); x.beginPath(); x.ellipse(0, -len / 2, 7, len / 2, 0, 0, 6.3); x.fill(); x.restore(); }
  x.fillRect(58, 100, 4, 26); x.fillRect(70, 104, 3, 18);
  return imgTex(c, { repeat: false });
}

export function buildAtmosphere() {
  const scene = G.scene, W = G.world, M = G.mat, A = (G.atmos = { vols: [], shafts: [], fogs: [], flash: 0, nextBolt: rand(18, 35), t: 0 });
  weather(M.brick, 'brick'); weather(M.floorWood, 'floor'); weather(M.concrete, 'floor'); weather(M.dirt, 'floor'); weather(M.ceil, 'ceil');

  // light cones under the lamps
  const coneGeo = new THREE.CylinderGeometry(0.16, 1.55, 2.3, 28, 1, true); coneGeo.translate(0, -1.15, 0);
  { const uv = coneGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i)); }
  for (const L of W.lamps) {
    const m = new THREE.Mesh(coneGeo, volMat(L.l.color, 0.16)); m.position.copy(L.l.position); m.position.y += 0.1; m.renderOrder = 6; L.g.add(m);
    A.vols.push({ m, L });
  }
  // moonlight through the windows that face the moon
  const dir = MOON.clone().negate(), smat = shaftMat();
  for (const w of W.windows) {
    if (dir.x * w.nx + dir.z * w.nz < 0.15 || ROOMS[w.room].outdoor) continue;
    const t = (0.95 + 2.3) / 2 / -dir.y, len = Math.min(5.5, t * 1.6), half = 0.75, y0 = 0.95, y1 = 2.3;
    const ax = w.axis === 'x' ? 0 : 1, az = w.axis === 'x' ? 1 : 0, quads = [];
    const P = (u, y, s) => new THREE.Vector3(w.x + ax * u + dir.x * s, y + dir.y * s, w.z + az * u + dir.z * s);
    const quad = (a, b, c, d) => { const g = new THREE.BufferGeometry().setFromPoints([a, b, c, a, c, d]); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); quads.push(g); };
    quad(P(-half, y0, 0), P(half, y0, 0), P(half, y0, len), P(-half, y0, len));
    quad(P(-half, y1, 0), P(half, y1, 0), P(half, y1, len), P(-half, y1, len));
    quad(P(-half, y0, 0), P(-half, y1, 0), P(-half, y1, len), P(-half, y0, len));
    quad(P(half, y0, 0), P(half, y1, 0), P(half, y1, len), P(half, y0, len));
    const g = mergeGeometries(quads); g.computeVertexNormals();
    // uv.y runs along the beam (0 at the window): rebuild it from the distance travelled
    const pos = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < pos.count; i++) { const dx = pos.getX(i) - w.x, dz = pos.getZ(i) - w.z; uv.setY(i, Math.min(1, Math.abs(dx * dir.x + dz * dir.z) / (len * Math.hypot(dir.x, dir.z) + 1e-3))); }
    const m = new THREE.Mesh(g, smat); m.renderOrder = 6; m.frustumCulled = false; scene.add(m); A.shafts.push(m);
  }
  A.shaftMat = smat;

  // ground fog outside, three drifting layers
  for (const [y, k, s] of [[0.12, 0.6, 1], [0.45, 0.45, 2], [0.9, 0.3, 3]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(240, 240).rotateX(-Math.PI / 2), fogMat(s, k)); m.position.set(13, y, -10); m.renderOrder = 4; scene.add(m); A.fogs.push(m); }
  // drifting clouds
  A.clouds = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), cloudMat()); A.clouds.renderOrder = -1; scene.add(A.clouds);

  // dead grass clumps outside, swaying
  {
    const r = mulberry32(21), blade = new THREE.PlaneGeometry(0.9, 0.7); blade.translate(0, 0.35, 0);
    const clump = mergeGeometries([blade, blade.clone().rotateY(Math.PI / 3), blade.clone().rotateY(-Math.PI / 3)]);
    const gm = new THREE.MeshStandardMaterial({ map: grassTex(), alphaTest: 0.45, side: THREE.DoubleSide, color: 0x8a8a62, roughness: 1 });
    gm.onBeforeCompile = (sh) => { sh.uniforms.uT = A.grassT = { value: 0 }; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 ip = instanceMatrix * vec4(0.0,0.0,0.0,1.0); float sw = sin(uT * 1.6 + ip.x * 0.7 + ip.z * 0.4) * 0.12 + sin(uT * 3.1 + ip.x) * 0.04; transformed.x += sw * position.y; transformed.z += sw * 0.5 * position.y;'); };
    const N = 1600, inst = new THREE.InstancedMesh(clump, gm, N), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    let n = 0;
    while (n < N) {
      const a = r() * 6.283, d = 2 + Math.pow(r(), 0.7) * 48, x = 13 + Math.cos(a) * (21 + d), z = -10 + Math.sin(a) * (16 + d);
      const inB = x > -8.6 && x < 34.6 && z > -26.6 && z < 6.6 && !(x > 4 && x < 16 && z > 2.6);
      const yard = x > 16.4 && x < 33.6 && z > -13.6 && z < 5.6;
      const crypt = x > 22.5 && x < 29.5 && z > 15.8 && z < 22; if ((inB && !yard) || crypt) continue;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.28); const s = 0.6 + r() * 0.9; sc.set(s, s * (0.7 + r() * 0.6), s); p.set(x, -0.02, z);
      inst.setMatrixAt(n++, mt.compose(p, q, sc));
    }
    inst.receiveShadow = true; scene.add(inst);
  }

  // clutter: debris, papers, bottles, chairs, cobwebs, blood smears, writing on the walls
  {
    const r = mulberry32(55), geo = { plank: [], brick: [], paper: [], glass: [], wood: [] };
    const indoor = (x, z) => { const k = W.roomAt(x, z); return k && !ROOMS[k].outdoor; };
    const free = (x, z, m = 0.35) => { for (const c of W.colliders) if (c.on && c.move && x > c.x0 - m && x < c.x1 + m && z > c.z0 - m && z < c.z1 + m) return false; return true; };
    const spot = (room, edge) => { const R = ROOMS[room]; for (let i = 0; i < 40; i++) { const x = R.x0 + 0.5 + r() * (R.x1 - R.x0 - 1), z = R.z0 + 0.5 + r() * (R.z1 - R.z0 - 1); const nearWall = Math.min(x - R.x0, R.x1 - x, z - R.z0, R.z1 - z) < 1.3; if ((!edge || nearWall) && free(x, z) && Math.hypot(x + 1.5, z + 1) > 2.4) return [x, z]; } return null; };
    for (const room of ['A', 'B', 'C', 'E', 'F']) {
      for (let i = 0; i < 9; i++) { const s = spot(room, true); if (!s) continue; const g = new THREE.BoxGeometry(0.1 + r() * 0.06, 0.025, 0.7 + r() * 0.9); g.rotateY(r() * 3.14); g.rotateZ((r() - 0.5) * 0.3); g.translate(s[0], 0.03 + r() * 0.04, s[1]); geo.plank.push(g); }
      for (let i = 0; i < 7; i++) { const s = spot(room, true); if (!s) continue; for (let k = 0; k < 4 + (r() * 5 | 0); k++) { const g = new THREE.BoxGeometry(0.2, 0.06, 0.1); g.rotateY(r() * 3.14); g.rotateX((r() - 0.5) * 0.6); g.translate(s[0] + (r() - 0.5) * 0.6, 0.03 + r() * 0.06, s[1] + (r() - 0.5) * 0.6); geo.brick.push(g); } }
      for (let i = 0; i < 12; i++) { const s = spot(room, false); if (!s) continue; const g = new THREE.PlaneGeometry(0.21, 0.29); g.rotateX(-Math.PI / 2); g.rotateY(r() * 6.28); g.translate(s[0], 0.006 + i * 0.0004, s[1]); geo.paper.push(g); }
      for (let i = 0; i < 4; i++) { const s = spot(room, true); if (!s) continue; const g = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 10); if (r() < 0.5) { g.rotateZ(Math.PI / 2); g.rotateY(r() * 6.28); g.translate(s[0], 0.035, s[1]); } else g.translate(s[0], 0.12, s[1]); geo.glass.push(g); }
      for (let i = 0; i < 2; i++) { const s = spot(room, false); if (!s) continue; const ch = [new THREE.BoxGeometry(0.44, 0.04, 0.44).translate(0, 0.45, 0), new THREE.BoxGeometry(0.44, 0.5, 0.04).translate(0, 0.72, -0.2)]; for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ch.push(new THREE.BoxGeometry(0.035, 0.45, 0.035).translate(sx * 0.19, 0.225, sz * 0.19)); const g = mergeGeometries(ch); if (r() < 0.6) { g.rotateX(-Math.PI / 2); g.translate(0, 0.22, 0); } g.rotateY(r() * 6.28); g.translate(s[0], 0, s[1]); geo.wood.push(g); }
    }
    const mats = { plank: M.plank, brick: new THREE.MeshStandardMaterial({ map: G.tex.brick, color: 0x9c8070, roughness: 0.95 }), paper: new THREE.MeshStandardMaterial({ color: 0xb9b19b, roughness: 1, side: THREE.DoubleSide, map: G.tex.concrete }), glass: new THREE.MeshStandardMaterial({ color: 0x2e4a2a, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 }), wood: M.woodDark };
    for (const k in geo) if (geo[k].length) { const m = new THREE.Mesh(mergeGeometries(geo[k].map((g) => (g.index ? g.toNonIndexed() : g))), mats[k]); m.castShadow = k !== 'paper'; m.receiveShadow = true; scene.add(m); }
    // cobwebs in ceiling corners
    const web = new THREE.MeshBasicMaterial({ map: cobwebTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.6, color: 0x9a9a96 });
    for (const room of ['A', 'B', 'C', 'E', 'F']) { const R = ROOMS[room]; for (const [cx, cz, ry] of [[R.x0, R.z0, 0], [R.x1, R.z0, -Math.PI / 2], [R.x1, R.z1, Math.PI], [R.x0, R.z1, Math.PI / 2]]) { if (r() < 0.35) continue; const g = new THREE.Group(); g.position.set(cx, 3.2, cz); g.rotation.y = ry; const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1).translate(0.55, -0.55, 0), web); p.rotation.set(0, -Math.PI / 4, 0); p.position.set(0.2, -0.02, 0.2); g.add(p); scene.add(g); } }
    // blood smears and writing
    const smear = new THREE.MeshStandardMaterial({ color: 0x3a0605, alphaMap: G.tex.splat, transparent: true, depthWrite: false, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    for (const room of ['A', 'B', 'C', 'E', 'F']) for (let i = 0; i < 4; i++) { const s = spot(room, false); if (!s) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), smear); m.position.set(s[0], 0.008 + i * 0.0005, s[1]); m.rotation.y = r() * 6.28; m.scale.set(0.7 + r() * 1.4, 1, 0.5 + r() * 0.9); m.receiveShadow = true; scene.add(m); }
    const decal = (tex, x, z, nx, nz, y, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); m.position.set(x + nx * 0.16, y, z + nz * 0.16); m.lookAt(x + nx * 2, y, z + nz * 2); m.receiveShadow = true; scene.add(m); };
    decal(writing('ILS ARRIVENT', ''), -2.2, 6, 0, -1, 2.35, 2.4, 0.6);
    decal(writing('NE PAS OUVRIR', ''), 10, -14, 0, 1, 2.74, 2.0, 0.5); // on the lintel above the barn door
    decal(writing('VISEZ LA TÊTE', ''), 4, 1.0, -1, 0, 1.9, 1.8, 0.46);
    decal(writing('IIII IIII II', 'jours tenus'), -8, -18, 1, 0, 2.0, 1.7, 0.42);
    const hp = handprint(); for (const [x, z, nx, nz, y] of [[-6.6, 6, 0, -1, 1.25], [-6.2, 6, 0, -1, 1.05], [15.0, -14, 0, 1, 1.4], [4, -17.8, -1, 0, 1.2], [4, -18.3, -1, 0, 1.0], [-3.4, -26, 0, 1, 1.5]]) decal(hp, x, z, nx, nz, y, 0.26, 0.26);
  }

  // ---------- distant horizon: a village in silhouette (outside the fog, darker than the sky), a few lit windows, a fire burning far off
  {
    const r = mulberry32(808), parts = [], lit = [], C = new THREE.Vector3(13, 0, -10);
    const at = (a, d) => [C.x + Math.cos(a) * d, C.z + Math.sin(a) * d];
    const house = (a, d, w, h, roof, depth = 8) => {
      const [x, z] = at(a, d), g = new THREE.BoxGeometry(w, h, depth); g.translate(0, h / 2, 0);
      const rf = new THREE.CylinderGeometry(0.01, w * 0.72, roof, 4, 1).rotateY(Math.PI / 4).scale(1, 1, depth / w).translate(0, h + roof / 2, 0);
      const m = new THREE.Matrix4().makeTranslation(x, -0.5, z).multiply(new THREE.Matrix4().makeRotationY(-a + Math.PI / 2));
      parts.push(g.applyMatrix4(m), rf.applyMatrix4(m));
      if (r() < 0.45) { const wy = 1.5 + r() * (h - 3), wx = (r() - 0.5) * (w - 2); lit.push(new THREE.Vector3(wx, wy, depth / 2 + 0.05).applyMatrix4(m)); }
    };
    for (let i = 0; i < 46; i++) { const a = r() * 6.283; house(a, 105 + r() * 50, 7 + r() * 9, 6 + r() * 9, 3 + r() * 5); }
    { // church with a steeple, and a water tower
      const [x, z] = at(2.2, 120), m = new THREE.Matrix4().makeTranslation(x, -0.5, z).multiply(new THREE.Matrix4().makeRotationY(-2.2 + Math.PI / 2));
      parts.push(new THREE.BoxGeometry(12, 14, 26).translate(0, 7, 0).applyMatrix4(m), new THREE.CylinderGeometry(0.01, 9, 7, 4).rotateY(Math.PI / 4).scale(1, 1, 2.2).translate(0, 17.5, 0).applyMatrix4(m),
        new THREE.BoxGeometry(6, 26, 6).translate(0, 13, 15).applyMatrix4(m), new THREE.CylinderGeometry(0.05, 4.4, 18, 4).rotateY(Math.PI / 4).translate(0, 35, 15).applyMatrix4(m), new THREE.BoxGeometry(0.4, 4, 0.4).translate(0, 46, 15).applyMatrix4(m), new THREE.BoxGeometry(2.2, 0.4, 0.4).translate(0, 46.6, 15).applyMatrix4(m));
      lit.push(new THREE.Vector3(0, 20, 18.05).applyMatrix4(m));
      const [tx, tz] = at(4.9, 110); parts.push(new THREE.CylinderGeometry(5, 5, 7, 16).translate(tx, 21, tz), new THREE.CylinderGeometry(0.01, 5.6, 3, 16).translate(tx, 26, tz));
      for (const [ox, oz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) parts.push(new THREE.CylinderGeometry(0.25, 0.25, 18, 6).translate(tx + ox, 9, tz + oz));
    }
    const sil = new THREE.Mesh(mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g))), new THREE.MeshBasicMaterial({ color: 0x080b12, fog: false }));
    sil.renderOrder = -1; sil.scale.y = 1.6; scene.add(sil); for (const v of lit) v.y *= 1.6;
    const winM = new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(2.2, 1.4, 0.6), fog: false, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true });
    for (const v of lit) { const s = new THREE.Sprite(winM); s.position.copy(v); s.scale.setScalar(2.2); scene.add(s); }
    const [fx, fz] = at(0.9, 140); A.farFire = [];
    for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, color: new THREE.Color(3, 1.1, 0.25), fog: false, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true })); s.position.set(fx + i * 6 - 6, 4 + i * 2, fz); s.scale.set(26 - i * 6, 16 - i * 3, 1); scene.add(s); A.farFire.push(s); }
  }

  // ---------- rain
  {
    const N = 2200, pos = new Float32Array(N * 6), vel = new Float32Array(N), geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    const rain = new THREE.LineSegments(geo2, new THREE.LineBasicMaterial({ color: new THREE.Color(0.55, 0.62, 0.75), transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    rain.frustumCulled = false; rain.renderOrder = 8; scene.add(rain);
    const drop = (i, top) => { const c = G.camera.position, a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * 16; let x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, y = top ? c.y + rand(4, 10) : rand(0, c.y + 10);
      if (W.indoor(x, z)) y = -50; pos[i * 6] = pos[i * 6 + 3] = x; pos[i * 6 + 1] = y; pos[i * 6 + 4] = y + 0.38; pos[i * 6 + 2] = pos[i * 6 + 5] = z; vel[i] = rand(10, 14); };
    for (let i = 0; i < N; i++) drop(i, false);
    const ripples = []; const rg = new THREE.RingGeometry(0.02, 0.05, 16).rotateX(-Math.PI / 2), rm = new THREE.MeshBasicMaterial({ color: 0x9aa6b8, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(rg, rm.clone()); m.visible = false; m.renderOrder = 3; scene.add(m); ripples.push({ m, t: 0 }); }
    let ri = 0;
    A.rain = (dt) => {
      const wind = 1.6; let splashes = 0;
      for (let i = 0; i < N; i++) {
        let y = pos[i * 6 + 1]; if (y < -10) { if (Math.random() < 0.02) drop(i, true); continue; }
        y -= vel[i] * dt; pos[i * 6] += wind * dt * 0.3;
        if (y <= 0) { if (splashes++ < 6 && Math.random() < 0.3) { const R = ripples[ri++ % ripples.length]; R.m.position.set(pos[i * 6], 0.015, pos[i * 6 + 2]); R.t = 0; R.m.visible = true; } drop(i, true); continue; }
        pos[i * 6 + 1] = y; pos[i * 6 + 3] = pos[i * 6] - wind * 0.03; pos[i * 6 + 4] = y + 0.38; pos[i * 6 + 5] = pos[i * 6 + 2];
      }
      geo2.attributes.position.needsUpdate = true;
      for (const R of ripples) if (R.m.visible) { R.t += dt; R.m.scale.setScalar(1 + R.t * 9); R.m.material.opacity = 0.4 * (1 - R.t / 0.45); if (R.t > 0.45) R.m.visible = false; }
    };
  }
  // puddles in the yard and between the graves: black mirrors that catch the lamps, the fire and the lightning
  {
    const c = cv(256), x = c.getContext('2d'), r = mulberry32(77);
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9; i++) { const px = 128 + (r() - 0.5) * 110, py = 128 + (r() - 0.5) * 70, rad = 30 + r() * 46, g = x.createRadialGradient(px, py, rad * 0.35, px, py, rad); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(px, py, rad, rad * (0.6 + r() * 0.4), r() * 3, 0, 6.283); x.fill(); }
    const id = x.getImageData(0, 0, 256, 256), d = id.data; for (let i = 0; i < d.length; i += 4) { const v = Math.min(255, Math.max(0, (d[i] - 70) * 2.4)); d[i] = d[i + 1] = d[i + 2] = v; } x.putImageData(id, 0, 0);
    const pm = new THREE.MeshStandardMaterial({ color: 0x06080b, roughness: 0.05, metalness: 0.1, alphaMap: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, envMapIntensity: 2.5 });
    const pg = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), rp = mulberry32(5);
    const spots = [[19.5, -9, 3.2], [24, 1.5, 2.6], [29.5, -4.5, 3.6], [21.4, -2.3, 2.2], [22.6, -11.4, 2.6], [31.5, 3.5, 2.2], [26.5, -11.5, 2.4], [18.6, 10, 2.2], [21, 14.5, 1.6], [31.5, 9.5, 2.8], [19.5, 21.5, 2], [30.5, 19, 1.8], [25.5, 12.2, 2.4]];
    for (const [px, pz, sz] of spots) { const m = new THREE.Mesh(pg, pm); m.position.set(px, 0.006, pz); m.rotation.y = rp() * 6.28; m.scale.set(sz * (0.9 + rp() * 0.5), 1, sz * (0.6 + rp() * 0.4)); m.receiveShadow = true; m.renderOrder = 1; scene.add(m); }
  }
  // lightning you can see: a jagged forked bolt far off over the roofs, only for the instant of the flash
  {
    const pos = new Float32Array(900 * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    const bm = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 5.5, 8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    const bolt = new THREE.Mesh(geo, bm); bolt.frustumCulled = false; bolt.visible = false; bolt.renderOrder = 0; scene.add(bolt); A.boltMesh = bolt;
    let n = 0; const _a = new THREE.Vector3(), _b = new THREE.Vector3(), side = new THREE.Vector3();
    const seg = (a, b, w) => { if (n > 890) return; side.set(a.x - 13, 0, a.z + 10).normalize(); // the ribbon faces the map
      const sx = -side.z * w, sz = side.x * w;
      for (const [p, q] of [[a, -1], [a, 1], [b, -1], [a, 1], [b, 1], [b, -1]]) { pos[n * 3] = p.x + sx * q; pos[n * 3 + 1] = p.y; pos[n * 3 + 2] = p.z + sz * q; n++; } };
    const branch = (p, dir, len, w, depth) => { let a = p.clone(); const steps = 10 + ((Math.random() * 6) | 0);
      for (let i = 0; i < steps; i++) { _b.copy(a).addScaledVector(dir, len / steps); _b.x += rand(-1, 1) * len * 0.07; _b.z += rand(-1, 1) * len * 0.07; _b.y += rand(-0.3, 0.3) * len * 0.05; seg(a, _b, w * (1 - i / steps * 0.6)); a = _b.clone();
        if (depth < 2 && Math.random() < 0.18) branch(a, dir.clone().add(new THREE.Vector3(rand(-0.9, 0.9), rand(-0.1, 0.2), rand(-0.9, 0.9))).normalize(), len * rand(0.25, 0.45), w * 0.5, depth + 1); } };
    A.strike = (at) => { n = 0; const ang = at ?? rand(0, 6.283), dist = rand(140, 165), top = new THREE.Vector3(13 + Math.cos(ang) * dist, rand(70, 90), -10 + Math.sin(ang) * dist);
      branch(top, new THREE.Vector3(rand(-0.2, 0.2), -1, rand(-0.2, 0.2)).normalize(), top.y + 4, 1.1, 0);
      for (let i = n; i < 900; i++) pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0; geo.attributes.position.needsUpdate = true; geo.setDrawRange(0, n); bolt.visible = true; };
  }
  // wet ground outside catches the lamps and the moon
  M.grass.roughness = 0.6; M.dirt.roughness = 0.55; M.dirt.color.multiplyScalar(0.8); M.grass.color.multiplyScalar(0.85);

  A.update = (dt) => {
    A.t += dt; A.rain(dt);
    for (const [i, s] of A.farFire.entries()) s.material.opacity = 0.55 + 0.25 * Math.sin(A.t * (1.3 + i * 0.7)) * Math.sin(A.t * (2.9 + i));
    for (const v of A.vols) { v.m.material.uniforms.uK.value = 0.16 * v.L.k; v.m.material.uniforms.uT.value = A.t; }
    A.shaftMat.uniforms.uT.value = A.t; for (const f of A.fogs) f.material.uniforms.uT.value = A.t;
    A.clouds.position.copy(G.camera.position); A.clouds.material.uniforms.uT.value = A.t; if (A.grassT) A.grassT.value = A.t;
    // lightning: two quick flashes, thunder follows
    A.nextBolt -= dt;
    if (A.nextBolt <= 0) { A.nextBolt = rand(22, 50); A.bolt = 0; SND.thunder(rand(0.6, 2.2)); A.strike(A.boltAt); }
    if (A.bolt !== undefined) { A.bolt += dt; const b = A.bolt; A.flash = b < 0.08 ? 1 : b < 0.16 ? 0.15 : b < 0.24 ? 0.8 : Math.max(0, 0.8 - (b - 0.24) * 3); if (b > 0.6) { A.bolt = undefined; A.flash = 0; } A.boltMesh.material.opacity = b < 0.08 ? 1 : b < 0.16 ? 0.1 : b < 0.3 ? 0.85 : Math.max(0, 0.85 - (b - 0.3) * 4); A.boltMesh.visible = A.bolt !== undefined; }
    A.clouds.material.uniforms.uFlash.value = A.flash; A.shaftMat.uniforms.uK.value = 1 + A.flash * 6;
    W.hemi.intensity = 0.5 + A.flash * 2.2; W.sun.intensity = 3.4 + A.flash * 9;
  };
}
