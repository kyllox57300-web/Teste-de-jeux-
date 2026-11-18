import * as THREE from 'three';
import { G } from './ctx.js';
import { rand } from './util.js';

class Particles {
  constructor(max, additive, opts = {}) {
    this.heat = !!opts.heat;
    this.max = max; this.n = 0; this.i = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.size = new Float32Array(max); this.rot = new Float32Array(max); this.baseG = new Float32Array(max); this.baseB = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.maxLife = new Float32Array(max); this.grav = new Float32Array(max); this.drag = new Float32Array(max); this.grow = new Float32Array(max); this.alpha = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aRot', new THREE.BufferAttribute(this.rot, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: opts.map || G.tex.dot }, uScale: { value: 600 } },
      vertexShader: 'attribute vec4 aColor; attribute float aSize; attribute float aRot; uniform float uScale; varying vec4 vC; varying float vR; void main(){ vC=aColor; vR=aRot; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=min(256.0, aSize*uScale/max(0.05,-mv.z)); gl_Position=projectionMatrix*mv; }',
      fragmentShader: `uniform sampler2D map; varying vec4 vC; varying float vR; void main(){ vec2 c=gl_PointCoord-0.5; float cs=cos(vR), sn=sin(vR); c=vec2(cs*c.x-sn*c.y, sn*c.x+cs*c.y)+0.5; vec4 t=texture2D(map,clamp(c,0.0,1.0)); gl_FragColor=${additive ? 'vec4(vC.rgb*vC.a*t.a,1.0)' : 'vec4(vC.rgb,vC.a*t.a)'}; }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.renderOrder = 5;
    G.scene.add(this.points);
  }
  spawn(x, y, z, vx, vy, vz, life, size, r, g, b, a = 1, grav = 9.8, drag = 0, grow = 0) {
    const i = this.i; this.i = (i + 1) % this.max;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z; this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.rot[i] = Math.random() * 6.283; this.baseG[i] = g; this.baseB[i] = b;
    this.life[i] = this.maxLife[i] = life; this.size[i] = size; this.col[i * 4] = r; this.col[i * 4 + 1] = g; this.col[i * 4 + 2] = b; this.col[i * 4 + 3] = a; this.alpha[i] = a; this.grav[i] = grav; this.drag[i] = drag; this.grow[i] = grow;
  }
  update(dt) {
    const { pos, vel, life, max } = this;
    for (let i = 0; i < max; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) { this.size[i] = 0; this.col[i * 4 + 3] = 0; continue; }
      const k = 1 - this.drag[i] * dt; vel[i * 3] *= k; vel[i * 3 + 2] *= k; vel[i * 3 + 1] = vel[i * 3 + 1] * k - this.grav[i] * dt;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (pos[i * 3 + 1] < 0.02 && this.grav[i] > 0) { pos[i * 3 + 1] = 0.02; vel[i * 3] = vel[i * 3 + 1] = vel[i * 3 + 2] = 0; }
      const lr = life[i] / this.maxLife[i];
      this.size[i] += this.grow[i] * dt; this.col[i * 4 + 3] = this.alpha[i] * Math.min(1, lr * 2) * (this.heat ? Math.min(1, (1 - lr) * 9 + 0.25) : 1);
      if (this.heat) { this.col[i * 4 + 1] = this.baseG[i] * (0.3 + 0.7 * lr); this.col[i * 4 + 2] = this.baseB[i] * lr * lr; } // yellow at the nozzle, red at the tip
    }
    const a = this.points.geometry.attributes; a.aRot.needsUpdate = true; a.position.needsUpdate = true; a.aColor.needsUpdate = true; a.aSize.needsUpdate = true;
  }
  clear() { this.life.fill(0); this.size.fill(0); }
}

export function initFx() {
  const scene = G.scene;
  const solid = new Particles(900, false), glow = new Particles(900, true);
  // tracers
  const tracers = [], tg = new THREE.CylinderGeometry(0.012, 0.012, 1, 5, 1, true).rotateX(Math.PI / 2), tm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.1), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 });
  const tmUp = tm.clone(); tmUp.color.setRGB(2.2, 1.0, 3.2);
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(tg, tm); m.visible = false; m.frustumCulled = false; scene.add(m); tracers.push({ m, life: 0 }); }
  let ti = 0;
  // bullet holes + blood pools
  const holes = [], hg = new THREE.PlaneGeometry(0.16, 0.16), hm = new THREE.MeshBasicMaterial({ map: G.tex.hole, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(hg, hm); m.visible = false; scene.add(m); holes.push(m); }
  let hi = 0;
  const pools = [], pg = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  for (let i = 0; i < 36; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a0503, alphaMap: G.tex.splat, transparent: true, depthWrite: false, roughness: 0.25, metalness: 0, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const m = new THREE.Mesh(pg, mat); m.visible = false; m.receiveShadow = true; m.renderOrder = 1; scene.add(m); pools.push({ m, t: 0, s: 1 });
  }
  let pi = 0;
  // blood thrown onto walls and floor behind a zombie that is shot through: it spreads, then runs down a little
  const wblood = [], wbg = new THREE.PlaneGeometry(1, 1), wbm = new THREE.MeshStandardMaterial({ color: 0x5e0805, alphaMap: G.tex.splat, transparent: true, depthWrite: false, roughness: 0.3, metalness: 0, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 });
  for (let i = 0; i < 48; i++) { const m = new THREE.Mesh(wbg, wbm); m.visible = false; m.renderOrder = 1; scene.add(m); wblood.push({ m, t: 9, s: 1, run: 0 }); }
  let wbi = 0;
  // floating dust inside the rooms
  const fire = new Particles(1400, true, { map: G.tex.fire, heat: true });
  // severed forearms: a short tumbling limb that lands and stays a while
  const gibs = [], gibGeo = new THREE.CapsuleGeometry(0.045, 0.24, 4, 8), gibMat = new THREE.MeshStandardMaterial({ color: 0x3e2a22, roughness: 0.55, map: G.tex.concrete }), stump = new THREE.MeshStandardMaterial({ color: 0x5a0806, roughness: 0.35 });
  for (let i = 0; i < 10; i++) { const m = new THREE.Group(); m.add(new THREE.Mesh(gibGeo, gibMat)); const s = new THREE.Mesh(new THREE.SphereGeometry(0.047, 8, 6), stump); s.position.y = 0.14; m.add(s); m.visible = false; m.traverse((o) => (o.castShadow = true)); scene.add(m); gibs.push({ m, v: new THREE.Vector3(), w: new THREE.Vector3(), life: 0 }); }
  let gi = 0;
  const arcs = [];
  for (let i = 0; i < 8; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(256 * 3), 3).setUsage(THREE.DynamicDrawUsage)); const L = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); L.frustumCulled = false; L.visible = false; L.life = 0; L.renderOrder = 7; scene.add(L); arcs.push(L); }
  let ai = 0;
  const motes = new Particles(260, true);
  const seedMote = () => { const r = [[-8, 4, -6, 6], [4, 16, -6, 2], [-8, 16, -14, -6], [-8, 4, -26, -14], [4, 34, -26, -14], [4, 34, -26, -14]][(Math.random() * 6) | 0]; motes.spawn(rand(r[0], r[1]), rand(0.3, 2.9), rand(r[2], r[3]), rand(-0.05, 0.05), rand(-0.02, 0.03), rand(-0.05, 0.05), rand(6, 14), rand(0.007, 0.016), 1, 0.8, 0.55, rand(0.15, 0.4), 0, 0, 0); };
  for (let i = 0; i < 260; i++) seedMote();

  const _v = new THREE.Vector3(), _n = new THREE.Vector3();
  const F = {
    resize(h, fov) { const s = h / (2 * Math.tan((fov * Math.PI) / 360)); solid.mat.uniforms.uScale.value = s; glow.mat.uniforms.uScale.value = s; fire.mat.uniforms.uScale.value = s; motes.mat.uniforms.uScale.value = s; },
    tracer(a, b, up) { const t = tracers[ti++ % tracers.length], len = a.distanceTo(b); if (len < 1.5) return; t.m.material = up ? tmUp : tm; t.m.position.copy(a).lerp(b, 0.5); t.m.lookAt(b); t.m.scale.set(1, 1, len); t.m.visible = true; t.life = 0.045; },
    impact(p, nx, ny, nz) {
      const h = holes[hi++ % holes.length]; h.position.set(p.x + nx * 0.006, p.y + ny * 0.006, p.z + nz * 0.006); _v.set(p.x + nx, p.y + ny, p.z + nz); h.lookAt(_v); h.rotation.z = Math.random() * 6.28; h.scale.setScalar(rand(0.6, 1.1)); h.visible = true;
      for (let i = 0; i < 5; i++) glow.spawn(p.x, p.y, p.z, nx * rand(1, 4) + rand(-2, 2), ny * rand(1, 4) + rand(-1, 3), nz * rand(1, 4) + rand(-2, 2), rand(0.12, 0.3), 0.03, 3, 2, 0.8, 1, 9, 1);
      for (let i = 0; i < 5; i++) solid.spawn(p.x + nx * 0.03, p.y + ny * 0.03, p.z + nz * 0.03, nx * rand(0.3, 1.2) + rand(-0.4, 0.4), ny * rand(0.3, 1.2) + rand(0, 0.6), nz * rand(0.3, 1.2) + rand(-0.4, 0.4), rand(0.4, 0.9), rand(0.06, 0.12), 0.35, 0.32, 0.28, 0.35, -0.3, 2.5, 0.35);
    },
    blood(p, dir, n = 8, speed = 2) {
      for (let i = 0; i < n; i++) solid.spawn(p.x, p.y, p.z, dir.x * speed * rand(0.2, 1) + rand(-1, 1) * speed * 0.45, Math.abs(dir.y) * speed + rand(-0.3, 1.4) * speed * 0.6, dir.z * speed * rand(0.2, 1) + rand(-1, 1) * speed * 0.45, rand(0.35, 0.8), rand(0.035, 0.085), 0.42, 0.02, 0.015, 0.95, 9.8, 0.6);
      for (let i = 0; i < 2; i++) solid.spawn(p.x, p.y, p.z, rand(-0.3, 0.3), rand(0, 0.4), rand(-0.3, 0.3), rand(0.25, 0.45), 0.16, 0.3, 0.02, 0.02, 0.4, 0, 1, 0.9);
    },
    wbList: () => wblood.filter((B) => B.m.visible).map((B) => B.m.position.toArray().map((v) => +v.toFixed(2)).join(',') + ' s' + B.s.toFixed(2)),
    wallBlood(p, nx, ny, nz, k = 1) {
      const B = wblood[wbi++ % wblood.length], m = B.m; m.position.set(p.x + nx * 0.01, p.y + ny * 0.01, p.z + nz * 0.01); _v.set(p.x + nx, p.y + ny, p.z + nz); m.lookAt(_v);
      B.wall = Math.abs(ny) < 0.5; if (!B.wall) m.rotateZ(Math.random() * 6.28); B.s = rand(0.3, 0.62) * k; B.run = B.wall ? rand(0.2, 0.8) : 0; B.t = 0; B.y0 = m.position.y; m.scale.set(B.s * 0.4, B.s * 0.4, 1); m.visible = true;
      for (let i = 0; i < 4; i++) solid.spawn(p.x + nx * 0.05, p.y, p.z + nz * 0.05, nx * rand(0.2, 0.8) + rand(-0.4, 0.4), rand(-0.6, 0.4), nz * rand(0.2, 0.8) + rand(-0.4, 0.4), rand(0.3, 0.6), rand(0.025, 0.05), 0.4, 0.02, 0.015, 0.9, 9.8, 0.6);
    },
    pool(x, z) { const P = pools[pi++ % pools.length]; P.m.position.set(x + rand(-0.3, 0.3), 0.012 + (pi % 36) * 0.0003, z + rand(-0.3, 0.3)); P.m.rotation.y = Math.random() * 6.28; P.s = rand(1.1, 1.9); P.t = 0; P.m.scale.setScalar(0.3); P.m.material.color.setHex(0x3a0503); P.m.material.roughness = 0.25; P.m.material.opacity = 0.95; P.m.visible = true; },
    dirt(x, z, n = 14) { for (let i = 0; i < n; i++) solid.spawn(x + rand(-0.3, 0.3), 0.05, z + rand(-0.3, 0.3), rand(-1, 1), rand(1, 3.2), rand(-1, 1), rand(0.5, 1), rand(0.05, 0.11), 0.11, 0.09, 0.06, 0.9, 9.8, 0.4); },
    debris(p, nx, nz) { for (let i = 0; i < 12; i++) solid.spawn(p.x, p.y + rand(-0.1, 0.1), p.z, nx * rand(0.5, 3) + rand(-1, 1), rand(0, 2), nz * rand(0.5, 3) + rand(-1, 1), rand(0.5, 1), rand(0.03, 0.07), 0.35, 0.26, 0.17, 1, 9.8, 0.3); },
    flameJet(mz, o, d, len, up) {
      // start a little ahead of the nozzle so the sprites never cover the screen
      const sx = mz.x + d.x * 0.2, sy = mz.y + d.y * 0.2, sz = mz.z + d.z * 0.2, speed = 12;
      const ax = o.x + d.x * len, ay = o.y + d.y * len, az = o.z + d.z * len;
      let vx = ax - sx, vy = ay - sy, vz = az - sz; const l = Math.hypot(vx, vy, vz) || 1; vx /= l; vy /= l; vz /= l;
      const life = l / speed;
      const R = up ? 0.75 : 1.25, Gc = up ? 0.45 : 0.5, B = up ? 1.8 : 0.12;
      // fill the whole path between two ticks (0.05 s at 12 m/s) so the jet reads as one continuous stream
      for (let i = 0; i < 12; i++) {
        const j = 0.035 + Math.random() * 0.045, k = rand(0.85, 1.1), t0 = Math.random() * 0.65, f = Math.min(1, t0 / Math.max(0.5, l));
        const size = 0.035 + f * 0.6 * l * 0.12;
        fire.spawn(sx + vx * t0 + rand(-0.015, 0.015), sy + vy * t0 + rand(-0.015, 0.015), sz + vz * t0 + rand(-0.015, 0.015),
          (vx + rand(-j, j)) * speed * k, (vy + rand(-j, j)) * speed * k + 0.25, (vz + rand(-j, j)) * speed * k,
          Math.max(0.05, (l - t0) / speed) * rand(0.85, 1.2), size, R * rand(0.85, 1.1), Gc * rand(0.8, 1.25), B, 0.34, -2.6, 0.3, rand(1.3, 2.1));
      }
      for (let i = 0; i < 2; i++) fire.spawn(ax - d.x * 0.3 + rand(-0.15, 0.15), ay - d.y * 0.3, az - d.z * 0.3 + rand(-0.15, 0.15), rand(-0.9, 0.9), rand(0.6, 1.8), rand(-0.9, 0.9), rand(0.3, 0.55), rand(0.16, 0.26), R, Gc, B, 0.3, -1.5, 1, 0.7);
      if (Math.random() < 0.5) solid.spawn(ax - d.x * 0.3, ay + 0.2, az - d.z * 0.3, rand(-0.4, 0.4), rand(0.7, 1.5), rand(-0.4, 0.4), rand(1.2, 2.2), rand(0.25, 0.4), 0.07, 0.065, 0.06, 0.4, -0.6, 1.2, 0.9);
    },
    arc(pts, up) {
      // jagged bolt between consecutive points: a bright core line, a wider faint copy, glow beads along the way
      for (let layer = 0; layer < 2; layer++) {
        const L = arcs[ai++ % arcs.length], pos = L.geometry.attributes.position; let n = 0;
        for (let s = 0; s < pts.length - 1 && n < 254; s++) {
          const a = pts[s], b = pts[s + 1], len = a.distanceTo(b), seg = Math.min(14, Math.max(3, Math.round(len * 3)));
          for (let i = 0; i <= seg && n < 255; i++) { const t = i / seg; let j = i === 0 || i === seg ? 0 : (0.12 + len * 0.03) * (layer ? 1.6 : 1);
            const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t, pz = a.z + (b.z - a.z) * t; j *= Math.min(1, Math.max(0.03, (Math.hypot(px - G.camera.position.x, py - G.camera.position.y, pz - G.camera.position.z) - 0.3) / 3));
            pos.setXYZ(n++, a.x + (b.x - a.x) * t + rand(-j, j), a.y + (b.y - a.y) * t + rand(-j, j), a.z + (b.z - a.z) * t + rand(-j, j)); }
          if (layer === 0) for (let i = 0; i < 6; i++) { const t = Math.random(); glow.spawn(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t, rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3), rand(0.08, 0.16), rand(0.05, 0.09), up ? 2.4 : 0.6, up ? 0.6 : 1.4, up ? 2.6 : 3.2, 1, 0, 2); }
        }
        L.geometry.setDrawRange(0, n); pos.needsUpdate = true; L.material.opacity = layer ? 0.35 : 1; L.material.color.setRGB(up ? 2.4 : 1.2, up ? 0.9 : 2.2, 3.4); L.visible = true; L.life = 0.09 + layer * 0.03;
      }
    },
    sparks(p, r, g, b, n = 8) { for (let i = 0; i < n; i++) glow.spawn(p.x, p.y, p.z, rand(-3, 3), rand(-1, 3), rand(-3, 3), rand(0.15, 0.35), rand(0.025, 0.045), r * 2, g * 2, b * 2, 1, 9, 1.5); },
    gib(p, dir) { const g = gibs[gi++ % gibs.length]; g.m.position.copy(p); g.v.set(dir.x * 3 + rand(-1, 1), rand(2, 4), dir.z * 3 + rand(-1, 1)); g.w.set(rand(-12, 12), rand(-12, 12), rand(-12, 12)); g.life = 6; g.m.visible = true; },
    smoke(p, n = 2, k = 1) { for (let i = 0; i < n; i++) solid.spawn(p.x + rand(-0.01, 0.01), p.y + rand(-0.01, 0.01), p.z + rand(-0.01, 0.01), rand(-0.12, 0.12), rand(0.15, 0.45), rand(-0.12, 0.12), rand(0.9, 1.6), rand(0.025, 0.05) * k, 0.62, 0.62, 0.6, 0.16 * k, -0.18, 1.6, rand(0.25, 0.45) * k); },
    flame(x, y, z) { fire.spawn(x + rand(-0.12, 0.12), y, z + rand(-0.12, 0.12), rand(-0.12, 0.12), rand(0.8, 1.7), rand(-0.12, 0.12), rand(0.4, 0.8), rand(0.1, 0.18), 1.5, rand(0.55, 0.8), 0.15, 0.55, -0.8, 0.4, 0.25); if (Math.random() < 0.2) glow.spawn(x, y + 0.2, z, rand(-0.5, 0.5), rand(1.5, 3), rand(-0.5, 0.5), rand(0.8, 1.6), 0.02, 3, 1.4, 0.3, 1, -0.8, 0.3); },
    flameOld(x, y, z) { glow.spawn(x + rand(-0.14, 0.14), y, z + rand(-0.14, 0.14), rand(-0.15, 0.15), rand(0.9, 2.1), rand(-0.15, 0.15), rand(0.35, 0.8), rand(0.14, 0.26), 2.6, rand(0.7, 1.3), 0.2, 0.9, -0.6, 0.4, -0.2); if (Math.random() < 0.25) glow.spawn(x, y + 0.2, z, rand(-0.5, 0.5), rand(1.5, 3), rand(-0.5, 0.5), rand(0.8, 1.6), 0.025, 3, 1.4, 0.3, 1, -0.8, 0.3); },
    explosion(p) {
      const y = Math.max(0.3, p.y);
      for (let i = 0; i < 46; i++) { _n.set(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).normalize().multiplyScalar(rand(3, 13)); glow.spawn(p.x, y, p.z, _n.x, _n.y, _n.z, rand(0.25, 0.7), rand(0.06, 0.16), 3.2, rand(1.2, 2.2), 0.4, 1, 6, 1.6); }
      for (let i = 0; i < 10; i++) glow.spawn(p.x + rand(-0.5, 0.5), y + rand(0, 0.6), p.z + rand(-0.5, 0.5), rand(-1, 1), rand(0.5, 2), rand(-1, 1), rand(0.18, 0.34), rand(1.2, 2.4), 3.4, 2.0, 0.7, 0.9, 0, 2, 2);
      for (let i = 0; i < 26; i++) { _n.set(rand(-1, 1), rand(0, 1), rand(-1, 1)).normalize().multiplyScalar(rand(0.6, 3.2)); solid.spawn(p.x + _n.x * 0.2, y + _n.y * 0.2, p.z + _n.z * 0.2, _n.x, _n.y + 0.6, _n.z, rand(1.4, 2.8), rand(0.5, 1.0), 0.16, 0.15, 0.14, 0.5, -0.5, 1.4, 0.9); }
      for (let i = 0; i < 22; i++) solid.spawn(p.x, y, p.z, rand(-6, 6), rand(2, 8), rand(-6, 6), rand(0.7, 1.4), rand(0.04, 0.09), 0.12, 0.1, 0.08, 1, 9.8, 0.3);
      const P = pools[pi++ % pools.length]; P.m.position.set(p.x, 0.014, p.z); P.m.rotation.y = Math.random() * 6.28; P.s = 3.6; P.t = 1.2; P.m.scale.setScalar(3.6); P.m.material.color.setHex(0x050404); P.m.material.roughness = 1; P.m.material.opacity = 0.9; P.m.visible = true;
    },
    burst(x, y, z, r, g, b, n = 30) { for (let i = 0; i < n; i++) { _n.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(1, 4)); glow.spawn(x, y, z, _n.x, _n.y, _n.z, rand(0.4, 0.9), rand(0.04, 0.09), r, g, b, 1, 2, 1.5); } },
    update(dt) {
      solid.update(dt); glow.update(dt); fire.update(dt); motes.update(dt);
      if (Math.random() < dt * 22) seedMote();
      for (const g of gibs) if (g.life > 0) { g.life -= dt; if (g.m.position.y > 0.05) { g.v.y -= 9.8 * dt; g.m.position.addScaledVector(g.v, dt); g.m.rotation.x += g.w.x * dt; g.m.rotation.z += g.w.z * dt; if (g.m.position.y <= 0.05) { g.m.position.y = 0.05; g.m.rotation.x = Math.PI / 2; if (Math.random() < 0.5) G.fx.pool(g.m.position.x, g.m.position.z); } } if (g.life <= 0) g.m.visible = false; }
      for (const L of arcs) if (L.visible) { L.life -= dt; L.material.opacity *= 0.8; if (L.life <= 0) L.visible = false; }
      for (const t of tracers) if (t.life > 0) { t.life -= dt; if (t.life <= 0) t.m.visible = false; }
      for (const B of wblood) if (B.m.visible && B.t < 3) { B.t += dt; const k = 1 - Math.pow(1 - Math.min(1, B.t / 0.12), 3), r = B.run * Math.min(1, B.t / 2.5); B.m.scale.set(B.s * (0.4 + 0.6 * k), B.s * (0.4 + 0.6 * k) * (1 + r), 1); if (B.wall) B.m.position.y = B.y0 - 0.5 * B.s * r; }
      for (const P of pools) if (P.m.visible) { P.t += dt; const k = Math.min(1, P.t / 1.6); P.m.scale.setScalar(P.s * (0.3 + 0.7 * (1 - Math.pow(1 - k, 3)))); if (P.t > 40) { P.m.material.opacity = Math.max(0, 0.95 - (P.t - 40) * 0.1); if (P.t > 50) P.m.visible = false; } }
    },
    clear() { for (const g of gibs) { g.life = 0; g.m.visible = false; } solid.clear(); glow.clear(); fire.clear(); for (const t of tracers) t.m.visible = false; for (const h of holes) h.visible = false; for (const P of pools) P.m.visible = false; for (const B of wblood) B.m.visible = false; },
  };
  G.fx = F;
  return F;
}
