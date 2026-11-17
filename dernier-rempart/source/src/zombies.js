import * as THREE from 'three';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { G } from './ctx.js';
import { clamp, damp, rand, angDiff, pick } from './util.js';
import * as SND from './audio.js';
import { aimBone, turnBone } from './rig.js';
import { retargetClips, boneMap, bindPose } from './retarget.js';
import { buildZombieSkins, ATLAS } from './zskin.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const MAX = 28, UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _f = new THREE.Vector3(), _r = new THREE.Vector3(), _t = new THREE.Vector3();
const _q = new THREE.Quaternion(), _bq = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _id = new THREE.Quaternion(), _q2 = new THREE.Quaternion();

export function initZombies() {
  const src = G.gltf.scene, clips = G.gltf.animations, scene = G.scene;
  const bodyMats = G.tex.zombie.map((t) => new THREE.MeshStandardMaterial({ map: t, normalMap: G.tex.soldierNorm, roughness: 0.8, metalness: 0.05 }));
  const bruteMat = new THREE.MeshStandardMaterial({ map: G.tex.brute, normalMap: G.tex.soldierNorm, roughness: 0.6, metalness: 0.15, emissive: 0x2a0500, emissiveIntensity: 0.6 });
  const charMat = new THREE.MeshStandardMaterial({ map: G.tex.concrete, color: 0x221d19, roughness: 1, emissiveMap: G.tex.concreteBump, emissive: 0x7a2200, emissiveIntensity: 0.45 });
  const BURN_BONES = ['Spine2', 'Spine', 'Head', 'LeftForeArm', 'RightForeArm', 'Hips', 'LeftLeg', 'RightLeg'];
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x050000, emissive: new THREE.Color(1, 0.05, 0.015), emissiveIntensity: 0.95, roughness: 0.18, metalness: 0.3 });
  const blobGeo = new THREE.PlaneGeometry(1.5, 1.5).rotateX(-Math.PI / 2);
  const clip = (n) => clips.find((c) => c.name === n);
  const list = [];
  const Z = { list, alive: 0, pools: { m: [], f: [], b: [] } };

  // ---- model templates: the soldier (armoured brute) plus two human bodies driven by the soldier's retargeted clips
  buildZombieSkins();
  const TYPES = {};
  { const w = new THREE.Group(), s = skClone(src); s.rotation.y = Math.PI; w.add(s); TYPES.b = { model: w, clips: { Walk: clip('Walk'), Run: clip('Run'), Idle: clip('Idle') } }; }
  for (const [kind, gltf, height] of [['m', G.gltfM, 1.78], ['f', G.gltfF, 1.68]]) {
    const w = new THREE.Group(), t = skClone(gltf.scene); w.add(t);
    bindPose(w); const B = boneMap(t), top = new THREE.Vector3().setFromMatrixPosition(B.HeadTop_End.matrixWorld).y;
    t.scale.multiplyScalar(height / top); w.updateMatrixWorld(true);
    if (kind === 'm') { // fold the suited man's nine parts into one skinned mesh on the atlas (the hat stays separate)
      const parts = []; t.traverse((o) => { if (o.isSkinnedMesh && o.material.name !== 'Wolf3D_Headwear') parts.push(o); });
      const geos = parts.map((o) => {
        const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(), r = ATLAS[o.material.name], out = new THREE.BufferGeometry();
        const f32 = (a) => new THREE.BufferAttribute(Float32Array.from({ length: a.count * a.itemSize }, (_, i) => a.getComponent(Math.floor(i / a.itemSize), i % a.itemSize)), a.itemSize);
        out.setAttribute('position', f32(g.attributes.position)); out.setAttribute('normal', f32(g.attributes.normal)); out.setAttribute('skinWeight', f32(g.attributes.skinWeight));
        const si = g.attributes.skinIndex; out.setAttribute('skinIndex', new THREE.BufferAttribute(Uint16Array.from({ length: si.count * 4 }, (_, i) => si.getComponent(Math.floor(i / 4), i % 4)), 4));
        const uv = f32(g.attributes.uv); for (let i = 0; i < uv.count; i++) { const u = uv.getX(i) - Math.floor(uv.getX(i) * 0.9999), v = uv.getY(i) - Math.floor(uv.getY(i) * 0.9999); uv.setXY(i, (r[0] + u * r[2]) / 2048, (r[1] + v * r[3]) / 2048); }
        out.setAttribute('uv', uv); return out;
      });
      const sm = new THREE.SkinnedMesh(mergeGeometries(geos), G.zskin.m[0].mat); sm.name = 'zbody';
      parts[0].parent.add(sm); sm.bind(parts[0].skeleton, parts[0].bindMatrix);
      for (const o of parts) o.parent.remove(o);
    }
    const srcW = new THREE.Group(), s = skClone(src); s.rotation.y = Math.PI; srcW.add(s);
    TYPES[kind] = { model: w, clips: retargetClips(srcW, [clip('Walk'), clip('Run'), clip('Idle')], w) };
  }

  function make(kind) {
    const T = TYPES[kind], model = skClone(T.model), holder = new THREE.Group();
    holder.rotation.order = 'YXZ'; holder.add(model); holder.visible = false; scene.add(holder);
    const bones = boneMap(model), meshes = [];
    model.traverse((o) => { if (o.isSkinnedMesh) { o.castShadow = !/Eye|Teeth|visor/.test(o.name); o.receiveShadow = true; o.frustumCulled = false; o.userData.mat = o.material.name; meshes.push(o); } });
    const blob = new THREE.Mesh(blobGeo, G.mat.blob); blob.position.y = 0.02; blob.renderOrder = 2; scene.add(blob); blob.visible = false;
    const mixer = new THREE.AnimationMixer(model);
    const act = { walk: mixer.clipAction(T.clips.Walk), run: mixer.clipAction(T.clips.Run), idle: mixer.clipAction(T.clips.Idle) };
    for (const k in act) { act[k].play(); act[k].setEffectiveWeight(0); }
    return { kind, holder, model, bones, meshes, blob, mixer, act, on: false, hp: 0, state: '', x: 0, z: 0, y: 0, yaw: 0, speed: 1, t: 0, win: null, atk: -1, atkDone: false, stagger: 0, fall: 0, fallDir: 1, noHead: false, arms: 1, lean: 0, wob: rand(10), groan: rand(2, 6), type: 0, scale: 1, stuck: 0, lastX: 0, lastZ: 0, burn: 0, burnDps: 0, burnTick: 0, scorch: 0, w: { walk: 0, run: 0, idle: 1 } };
  }
  function dress(z) {
    if (z.kind === 'b') { for (const m of z.meshes) m.material = m.name.includes('visor') ? eyeMat : bruteMat; return; }
    if (z.kind === 'f') { const mat = pick(G.zskin.f); for (const m of z.meshes) m.material = mat; return; }
    const set = pick(G.zskin.m);
    for (const m of z.meshes) { if (m.name === 'zbody') m.material = set.mat; else { m.material = set.hatMat; m.visible = set.hat; } }
  }
  const charred = (z) => { for (const m of z.meshes) if (!/Eye|visor/.test(m.name)) m.material = charMat; };
  // build the whole horde up front (the game never has more than MAX at once) so nothing is created mid-fight
  Z.prewarm = () => { for (let i = 0; i < MAX; i++) { const k = i < 3 ? 'b' : i % 4 === 3 ? 'f' : 'm'; Z.pools[k].push(make(k)); } };
  const release = (z) => Z.pools[z.kind].push(z);
  Z.makeKind = make;
  Z.materials = () => [charMat, bruteMat, eyeMat, ...G.zskin.f, ...G.zskin.m.flatMap((s) => [s.mat, s.hatMat])];
  Z.warm = () => {
    if (!Z.pools.b.length) Z.pools.b.push(make('b'));
    // every pooled zombie is shown once (bone textures, buffers) wearing each look in turn (skins upload), one of them charred
    const shown = [...Z.pools.b, ...Z.pools.m, ...Z.pools.f], mi = { m: 0, f: 0 };
    shown.forEach((z, i) => { dress(z); if (z.kind === 'm') { const set = G.zskin.m[mi.m++ % G.zskin.m.length]; for (const m of z.meshes) { if (m.name === 'zbody') m.material = set.mat; else { m.material = set.hatMat; m.visible = true; } } } else if (z.kind === 'f') { const mat = G.zskin.f[mi.f++ % G.zskin.f.length]; for (const m of z.meshes) m.material = mat; } z.holder.visible = true; z.holder.position.set((i % 7) * 0.7 - 2, 0, 1 + Math.floor(i / 7) * 0.7); z.mixer.update(0.01); z.holder.updateMatrixWorld(true); });
    if (Z.pools.m[1]) charred(Z.pools.m[1]);
    return () => shown.forEach((z) => { z.holder.visible = false; });
  };

  Z.spawn = (win, round) => {
    if (list.length >= MAX) return null;
    const brute = round >= 5 && Math.random() < Math.min(0.12, 0.03 + (round - 5) * 0.012), kind = brute ? 'b' : Math.random() < 0.28 ? 'f' : 'm';
    const z = Z.pools[kind].pop() || make(kind);
    const W = G.world, tx = -win.nz, tz = win.nx, d = rand(13, 19), lat = rand(-6, 6);
    z.x = win.x - win.nx * d + tx * lat; z.z = win.z - win.nz * d + tz * lat; z.y = -1.9;
    z.win = win; z.state = 'rise'; z.t = 0; z.on = true; z.atk = -1; z.stagger = 0; z.fall = 0; z.noHead = false; z.stuck = 0;
    z.maxHp = z.hp = G.game.zombieHp(round);
    const runChance = clamp((round - 3) * 0.14, 0, 0.8), jogChance = clamp((round - 1) * 0.22, 0, 0.9);
    const u = Math.random();
    if (u < runChance) { z.type = 2; z.speed = rand(3.3, 4.1); } else if (u < runChance + jogChance * (1 - runChance)) { z.type = 1; z.speed = rand(1.9, 2.5); } else { z.type = 0; z.speed = rand(0.95, 1.35); }
    z.brute = brute;
    if (z.brute) { z.type = 1; z.speed = rand(1.7, 2.1); z.maxHp = z.hp = z.hp * 5; }
    z.scale = z.brute ? 1.3 : rand(0.95, 1.06); z.holder.scale.setScalar(z.scale); z.holder.rotation.set(0, 0, 0);
    z.yaw = Math.atan2(win.x - z.x, win.z - z.z);
    dress(z);
    z.bones.Head.scale.setScalar(1); z.bones.LeftForeArm.scale.setScalar(1); z.bones.RightForeArm.scale.setScalar(1);
    z.arms = 1; const lost = Math.random(); if (lost < 0.08) z.bones.LeftForeArm.scale.setScalar(0.001); else if (lost < 0.16) z.bones.RightForeArm.scale.setScalar(0.001);
    z.settled = false; z.settleN = 0; z.flinch = 0; z.shock = 0; z.bleed = 0; z.kx = 0; z.kz = 0; z.holder.rotation.z = 0; z.crawl = false; for (const s of ['Left', 'Right']) z.bones[s + 'UpLeg'].scale.setScalar(1);
    // each one moves in its own way: hunch, a limp, how the arms hang, a head lolling to one side
    z.lean = z.type === 2 ? rand(0.42, 0.62) : z.type === 1 ? rand(0.3, 0.5) : rand(0.3, 0.62);
    z.limp = z.type === 0 && Math.random() < 0.55 ? rand(0.45, 1) : z.type === 1 && Math.random() < 0.25 ? rand(0.3, 0.6) : 0; z.limpS = Math.random() < 0.5 ? 'Left' : 'Right';
    { const u = Math.random(); z.armStyle = z.type === 2 ? 3 : z.brute ? (u < 0.6 ? 2 : 0) : z.type === 1 ? (u < 0.5 ? 0 : u < 0.8 ? 1 : 2) : (u < 0.34 ? 0 : u < 0.68 ? 1 : 2); }
    z.lead = Math.random() < 0.5 ? 1 : -1; z.tilt = rand(-0.14, 0.14); z.headTilt = rand(-0.42, 0.42); z.twitch = rand(1.5, 6); z.jerk = 0; z.jerkA = 0; z.lurch = z.type === 0 ? rand(0.22, 0.45) : z.type === 1 ? 0.14 : 0.06; z.armS = 0; z.ph = 0; z.shuf = z.type === 0 && !z.brute ? rand(0.5, 0.78) : 1;
    z.wob = rand(10); z.groan = rand(0.5, 5); z.burn = 0; z.burnDps = 0; z.burnTick = 0; z.scorch = 0;
    z.w.walk = 0; z.w.run = 0; z.w.idle = 1;
    z.holder.visible = true; z.blob.visible = true; z.blob.material.opacity = 0.9;
    list.push(z); Z.alive++;
    G.fx.dirt(z.x, z.z);
    return z;
  };

  // legs blown off: the zombie drops to the floor and keeps dragging itself forward on its arms
  Z.cripple = (z) => {
    if (z.crawl || z.kind === 'b' || z.state !== 'chase') return;
    _a.setFromMatrixPosition(z.bones.Hips.matrixWorld); G.fx.blood(_a, UP, 30, 3.4); G.fx.gib(_a, _b.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()); G.fx.gib(_a, _b.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()); G.fx.pool(z.x, z.z);
    for (const s of ['Left', 'Right']) z.bones[s + 'UpLeg'].scale.setScalar(0.001);
    z.crawl = true; z.speed = rand(0.55, 0.85); z.type = 0; z.bleed = 4; z.bleedBone = z.bones.Hips; z.atk = -1; SND.zombieDie(z.x, z.z);
  };
  const DEAD_BONES = ['Spine', 'Spine1', 'Spine2', 'Neck', 'LeftArm', 'LeftForeArm', 'RightArm', 'RightForeArm', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg'];
  Z.kill = (z, head, dir) => {
    if (z.state === 'dead') return;
    // the collapse is applied on top of this pose every frame, so it never piles up
    z.deathPose = DEAD_BONES.map((k) => [z.bones[k], z.bones[k].quaternion.clone()]);
    z.twist = rand(-0.35, 0.35); z.thudDone = false; z.deadFlinch = 1;
    z.state = 'dead'; z.t = 0; Z.alive--; z.fallDir = dir && (Math.sin(z.yaw) * dir.x + Math.cos(z.yaw) * dir.z) > 0 ? 1 : -1;
    if (z.win && z.win.busy === z) z.win.busy = null;
    if (head) { z.noHead = true; z.bones.Head.scale.setScalar(0.001); _a.setFromMatrixPosition(z.bones.Neck.matrixWorld); G.fx.blood(_a, UP, 26, 3.2); }
    SND.zombieDie(z.x, z.z);
    G.fx.pool(z.x + (dir ? dir.x : 0) * 0.5, z.z + (dir ? dir.z : 0) * 0.5);
  };

  // returns { killed }
  // flame: >0 sets the zombie on fire with that many damage per second, <0 is a burn tick; both stay quiet (no hit points, no flesh sound)
  Z.damage = (z, dmg, head, dir, point, melee, flame) => {
    if (z.state === 'dead') return { killed: false };
    const game = G.game;
    if (game.power.insta > 0) dmg = 1e9;
    z.hp -= dmg; z.stagger = flame ? Math.max(z.stagger, 0.05) : 0.16;
    if (!flame && dir && z.kind !== 'b' && z.hp < z.maxHp * 0.55 && Math.random() < 0.08) {
      const side = Math.random() < 0.5 ? 'Left' : 'Right', fa = z.bones[side + 'ForeArm'];
      if (fa && fa.scale.x > 0.5) { fa.scale.setScalar(0.001); _a.setFromMatrixPosition(fa.matrixWorld); G.fx.blood(_a, dir, 22, 3); G.fx.gib(_a, dir); z.bleed = 2.5; z.bleedBone = fa; SND.flesh(z.x, z.z); }
    }
    if (!flame && dir && z.state === 'chase' && !z.crawl) { // heavy hits shove the body back a step
      const imp = Math.min(2.4, (melee ? 2.6 : (dmg / z.maxHp) * 3.2)) / (z.brute ? 3 : 1), l = Math.hypot(dir.x, dir.z) || 1;
      z.kx = (z.kx || 0) + (dir.x / l) * imp; z.kz = (z.kz || 0) + (dir.z / l) * imp;
    }
    if (!flame && dir) { const side = Math.cos(z.yaw) * dir.x - Math.sin(z.yaw) * dir.z; z.flinch = Math.min(1.4, (z.flinch || 0) + (head ? 1.2 : 0.7)); z.flinchSide = side >= 0 ? 1 : -1; z.flinchHead = head; }
    if (flame > 0) { z.burn = Math.max(z.burn, 3); z.burnDps = flame; if (++z.scorch === 12) charred(z); }
    if (point) G.fx.blood(point, dir, head ? 12 : 7, head ? 2.6 : 1.8);
    if (z.hp <= 0) { Z.kill(z, head, dir); game.onKill(z, head, melee); return { killed: true }; }
    if (!flame) { game.addPoints(10); SND.flesh(z.x, z.z); }
    return { killed: false };
  };

  // Ray vs every zombie; returns hits sorted by distance.
  const hits = [];
  function segHit(o, d, p0, p1, r, maxT) {
    // closest approach between ray (o,d) and segment p0-p1
    _a.subVectors(p1, p0); _b.subVectors(o, p0);
    const A = 1, B = d.dot(_a), C = _a.lengthSq(), D = d.dot(_b), E = _a.dot(_b), den = A * C - B * B;
    let s = den > 1e-8 ? clamp((A * E - B * D) / den, 0, 1) : 0;
    let t = B * s - D; if (t < 0) return -1; if (t > maxT + r) return -1;
    s = clamp((E + B * t) / C, 0, 1); t = B * s - D;
    _c.copy(o).addScaledVector(d, t).sub(p0).addScaledVector(_a, -s);
    const dist2 = _c.lengthSq(); if (dist2 > r * r) return -1;
    return Math.max(0.01, t - Math.sqrt(r * r - dist2));
  }
  Z.raycast = (o, d, maxT) => {
    hits.length = 0;
    for (const z of list) {
      if (z.state === 'dead' || z.y < -1.2) continue;
      const dx = z.x - o.x, dz = z.z - o.z, along = dx * d.x + dz * d.z; if (along < -1.5 || along > maxT + 1.5) continue;
      const B = z.bones, s = z.scale;
      _f.setFromMatrixPosition(B.Head.matrixWorld); _r.setFromMatrixColumn(B.Head.matrixWorld, 1).normalize().multiplyScalar(0.17 * s).add(_f);
      let t = z.noHead ? -1 : segHit(o, d, _f, _r, 0.15 * s, maxT), head = t >= 0;
      if (t < 0) {
        _f.setFromMatrixPosition(B.Neck.matrixWorld); _r.setFromMatrixPosition(B.Hips.matrixWorld);
        t = segHit(o, d, _f, _r, 0.27 * s, maxT);
        if (t < 0) { _f.setFromMatrixPosition(B.Hips.matrixWorld); _r.setFromMatrixPosition(B.LeftFoot.matrixWorld); _t.setFromMatrixPosition(B.RightFoot.matrixWorld); _r.add(_t).multiplyScalar(0.5); t = segHit(o, d, _f, _r, 0.24 * s, maxT); }
      }
      if (t >= 0 && t < maxT) hits.push({ z, t, head });
    }
    hits.sort((a, b) => a.t - b.t);
    return hits;
  };

  Z.clear = () => { for (const z of list) { z.on = false; z.holder.visible = false; z.blob.visible = false; release(z); } list.length = 0; Z.alive = 0; };

  // procedural layer over the walk cycle: hunched spine, weight thrown side to side, a dragging leg,
  // a lolling head with sudden twitches, and arms that reach, dangle and swing with the step
  const reachArm = (B, f, r, s, side, up, out, w) => {
    _t.copy(f).addScaledVector(UP, up).addScaledVector(r, out * side).normalize(); aimBone(B[s + 'Arm'], B[s + 'ForeArm'], _t, w);
    _t.copy(f).addScaledVector(UP, up + 0.16).addScaledVector(r, out * side * 0.25).normalize(); aimBone(B[s + 'ForeArm'], B[s + 'Hand'], _t, w);
  };
  const dangleArm = (B, f, r, s, side, swing, w) => {
    _t.set(0, -1, 0).addScaledVector(f, 0.12 + swing).addScaledVector(r, 0.2 * side).normalize(); aimBone(B[s + 'Arm'], B[s + 'ForeArm'], _t, w);
    _t.set(0, -1, 0).addScaledVector(f, 0.42 + swing * 1.4).addScaledVector(r, 0.08 * side).normalize(); aimBone(B[s + 'ForeArm'], B[s + 'Hand'], _t, w);
  };
  function shamble(z, B, f, r, armUp, armW, dt) {
    const ph = z.ph, mv = Math.min(1, z.w.walk + z.w.run), run = z.type === 2, t = G.time + z.wob;
    // hips: dropped on the bad side, rocking with each step
    turnBone(B.Hips, f, (Math.sin(ph) * (0.05 + z.limp * 0.1) + z.limp * 0.05 * (z.limpS === 'Left' ? 1 : -1)) * mv);
    // spine: hunched forward, listing to one side, shoulders twisting against the step
    const lunge = z.atk >= 0 ? Math.sin(Math.min(1, z.atk / 0.75) * Math.PI) : 0, shove = Math.min(0.5, Math.hypot(z.kx || 0, z.kz || 0) * 0.25);
    const h = z.lean + Math.sin(t * 0.9) * 0.03 + lunge * 0.38 - shove; // throws its weight into a swing, rocks back when shoved
    turnBone(B.Spine, r, h * 0.42); turnBone(B.Spine1, r, h * 0.36); turnBone(B.Spine2, r, h * 0.22);
    turnBone(B.Spine1, f, z.tilt - Math.sin(ph) * (0.05 + z.limp * 0.06) * mv); turnBone(B.Spine2, UP, Math.sin(ph) * (run ? 0.16 : 0.1) * mv);
    // the bad leg swings out stiff and its toe scrapes the floor
    if (z.limp > 0 && mv > 0.1) { const L = z.limpS, k = z.limp * mv; turnBone(B[L + 'UpLeg'], f, (L === 'Left' ? 1 : -1) * 0.13 * k); turnBone(B[L + 'Foot'], r, 0.5 * k); }
    // head: lifted to see, lolling to one side; now and then it jerks
    if (B.Head.scale.x > 0.5) {
      z.twitch -= dt; if (z.twitch <= 0) { z.twitch = rand(2, 7); z.jerk = 1; z.jerkA = rand(-0.55, 0.55); }
      z.jerk = Math.max(0, z.jerk - dt * 3.2); const j = z.jerk * z.jerk;
      turnBone(B.Neck, r, -h * (run ? 0.5 : 0.62) + (run ? -0.04 : 0.08) + Math.sin(t * 0.7) * 0.05);
      turnBone(B.Neck, UP, z.jerkA * j);
      turnBone(B.Head, f, z.headTilt * (run ? 0.4 : 1) + Math.sin(t * 1.1) * 0.1 + Math.sin(ph) * 0.06 * mv + z.jerkA * 0.5 * j);
    }
    // arms: lifted smoothly toward what the state asks for, lagging a little like dead weight
    z.armS = damp(z.armS, armUp, 7, dt); const au = z.armS, wob = Math.sin(t * 2.4) * 0.1, wob2 = Math.cos(t * 1.9) * 0.1;
    const lead = z.lead, swing = Math.sin(ph) * (run ? 0.5 : 0.32) * mv;
    let style = z.armStyle; if (armW >= 0.95 || armUp > 0.2) style = 0; // attacking, clawing at planks: both arms up
    if (style === 0) {
      reachArm(B, f, r, 'Left', 1, -0.1 + au + wob, 0.22, armW); reachArm(B, f, r, 'Right', -1, -0.16 + au + wob2, 0.22, armW * 0.92);
    } else if (style === 1) {
      const a = lead > 0 ? 'Left' : 'Right', b = lead > 0 ? 'Right' : 'Left';
      reachArm(B, f, r, a, lead, -0.02 + au + wob, 0.18, armW); dangleArm(B, f, r, b, -lead, -swing * lead, 0.85);
    } else if (style === 2) {
      dangleArm(B, f, r, 'Left', 1, swing + wob * 0.4, 0.9); dangleArm(B, f, r, 'Right', -1, -swing + wob2 * 0.4, 0.9);
    } else { // runners: clawing forward and up, arms flailing out of time
      reachArm(B, f, r, 'Left', 1, 0.05 + Math.sin(2 * ph) * 0.35 + au, 0.3, 0.9); reachArm(B, f, r, 'Right', -1, 0.05 + Math.sin(2 * ph + 2.2) * 0.35 + au, 0.3, 0.9);
    }
  }

  const setAnim = (z, name, dt, rate = 8) => { for (const k in z.w) { z.w[k] = damp(z.w[k], k === name ? 1 : 0, rate, dt); z.act[k].setEffectiveWeight(z.w[k]); } };

  Z.update = (dt) => {
    const W = G.world, p = G.player, frozen = G.game.over;
    for (let i = list.length - 1; i >= 0; i--) {
      const z = list[i]; z.t += dt;
      let moveSpeed = 0, armUp = 0.0, armW = 0.72;
      const tx = p.x - z.x, tz = p.z - z.z, pd = Math.hypot(tx, tz);
      if (z.state === 'rise') {
        z.y = -1.9 + Math.min(1, z.t / 1.5) * 1.9; armUp = 0.9 * (1 - z.t / 1.5); setAnim(z, 'idle', dt);
        if (Math.random() < dt * 14) G.fx.dirt(z.x + rand(-0.3, 0.3), z.z + rand(-0.3, 0.3), 2);
        if (z.t >= 1.5) { z.y = 0; z.state = 'approach'; }
      } else if (z.state === 'approach') {
        const w = z.win, gx = w.x - w.nx * 0.82, gz = w.z - w.nz * 0.82, dx = gx - z.x, dz = gz - z.z, d = Math.hypot(dx, dz);
        // queue behind another zombie already working on this window
        const blocked = w.busy && w.busy !== z && d < 2.2;
        if (d < 0.25 && !w.busy) { w.busy = z; z.state = 'window'; z.t = 0; z.x = gx; z.z = gz; }
        else if (!blocked) { z.yaw += angDiff(z.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 6); moveSpeed = z.speed; }
        else z.yaw += angDiff(z.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 6);
      } else if (z.state === 'window') {
        const w = z.win; z.yaw += angDiff(z.yaw, Math.atan2(w.nx, w.nz)) * Math.min(1, dt * 8);
        if (w.count > 0) { armUp = 0.25 + Math.sin(z.t * 7) * 0.35; armW = 0.95; if (z.t > 1.5) { z.t = 0; W.removePlank(w); } }
        else if (z.t > 0.35) { z.state = 'climb'; z.t = 0; z.cx = z.x; z.cz = z.z; }
        setAnim(z, 'idle', dt);
      } else if (z.state === 'climb') {
        const w = z.win, q = Math.min(1, z.t / 1.15);
        z.x = z.cx + w.nx * 1.9 * q; z.z = z.cz + w.nz * 1.9 * q; z.y = Math.sin(q * Math.PI) * 0.62; armUp = 0.3; armW = 0.9;
        z.holder.rotation.x = Math.sin(q * Math.PI) * 0.55;
        setAnim(z, 'walk', dt);
        if (q >= 1) { z.state = 'chase'; z.y = 0; z.holder.rotation.x = 0; if (w.busy === z) w.busy = null; z.t = 0; z.lastX = z.x; z.lastZ = z.z; }
      } else if (z.state === 'chase') {
        const SZ = G.game.inSafe() ? W.safe : null, hold = !!SZ && Math.hypot(z.x - SZ.x, z.z - SZ.z) < SZ.r + 0.8;
        let gx = p.x, gz = p.z;
        if (!hold && !(pd < 9 && W.los(z.x, z.z, p.x, p.z))) { const s = W.step(z.x, z.z); if (s.ok) { gx = s.x; gz = s.z; } }
        const want = Math.atan2(gx - z.x, gz - z.z);
        z.yaw += angDiff(z.yaw, want) * Math.min(1, dt * (z.atk >= 0 ? 3 : 7));
        if (z.crawl && z.atk < 0 && pd < 1.6 && !hold && !frozen) { z.atk = 0; z.atkDone = false; SND.zombieAttack(z.x, z.z); }
        if (z.atk < 0 && hold) { armUp = 0.5 + Math.sin(G.time * 5 + z.wob) * 0.3; armW = 0.95; } // clawing at the edge of the safe zone
        else if (z.atk < 0) {
          if (pd > 0.95) moveSpeed = z.speed * (z.stagger > 0 ? 0.35 : 1);
          if (pd < 1.35 && !frozen && Math.abs(p.y) < 1.2) { z.atk = 0; z.atkDone = false; SND.zombieAttack(z.x, z.z); }
        } else {
          z.atk += dt; const q = z.atk / 0.75;
          armUp = q < 0.4 ? q / 0.4 * 0.95 : 0.95 - (q - 0.4) / 0.25 * 1.5; armUp = Math.max(-0.45, armUp); armW = 1;
          if (!z.atkDone && q > 0.55) { z.atkDone = true; if (pd < 1.75 && !frozen) G.game.hurt(z); }
          if (q >= 1) z.atk = -1;
          moveSpeed = pd > 1.0 ? z.speed * 0.3 : 0;
        }
        // anti-stuck: teleport-free nudge via respawn if nothing happens for a long time
        if (z.t > 4 && !frozen && !SZ) { const moved = Math.hypot(z.x - z.lastX, z.z - z.lastZ); z.stuck = moved < 0.4 && pd > 2.5 ? z.stuck + 1 : 0; z.lastX = z.x; z.lastZ = z.z; z.t = 0; if (z.stuck >= 4) { z.hp = 0; z.state = 'dead'; z.t = 2.6; Z.alive--; G.game.refund(); } }
      } else if (z.state === 'dead' && z.crawl) {
        z.fall = 1; z.settled = true; armUp = 0; armW = 0;
        if (z.t > 4.8) { z.on = false; z.holder.visible = false; z.blob.visible = false; list.splice(i, 1); release(z); continue; }
      } else if (z.state === 'dead') {
        z.fall = Math.min(1, z.fall + dt * 1.25);
        const kneel = z.fallDir > 0 ? 1 : 0.3, buckle = Math.min(1, z.fall / 0.35) * kneel, tip = Math.max(0, (z.fall - 0.22) / 0.78), e = tip * tip * (3 - 2 * tip);
        z.holder.rotation.x = z.fallDir * e * (Math.PI / 2 - 0.12); z.holder.rotation.z = z.twist * e;
        z.y = -0.38 * Math.sin(buckle * Math.PI * 0.5) * (1 - e) + e * 0.2;
        if (z.fall >= 1 && !z.thudDone) { z.thudDone = true; if (Math.hypot(z.x - p.x, z.z - p.z) < 18) SND.zstep(z.x, z.z, true); G.fx.dirt(z.x + Math.sin(z.yaw) * z.fallDir * 1.2, z.z + Math.cos(z.yaw) * z.fallDir * 1.2, 6); }
        armUp = -0.2; armW = 0.5 * (1 - z.fall);
        if (z.t > 3.4) { const k = Math.min(1, (z.t - 3.4) / 1.4); z.y = 0.2 - k * k * 0.75; }
        if (z.t > 4.8) { z.on = false; z.holder.visible = false; z.blob.visible = false; list.splice(i, 1); release(z); continue; }
      }
      z.stagger = Math.max(0, z.stagger - dt);
      if (z.bleed > 0) { z.bleed -= dt; if (Math.random() < dt * 14) { _t.setFromMatrixPosition(z.bleedBone.matrixWorld); G.fx.blood(_t, UP, 2, 0.6); } }
      if (z.shock > 0) { z.shock -= dt; if (Math.random() < dt * 30) { const b = z.bones[pick(BURN_BONES)]; if (b) { _t.setFromMatrixPosition(b.matrixWorld); G.fx.sparks(_t, 0.4, 0.85, 1.7, 2); } } }
      if (z.burn > 0) {
        z.burn -= dt;
        if (z.state !== 'dead') { z.burnTick -= dt; if (z.burnTick <= 0) { z.burnTick = 0.25; Z.damage(z, z.burnDps * 0.25, false, null, null, false, -1); } }
        if (Math.random() < dt * (z.state === 'dead' ? 9 : 26)) { const b = z.bones[pick(BURN_BONES)]; if (b) { _t.setFromMatrixPosition(b.matrixWorld); G.fx.flame(_t.x, _t.y - 0.15, _t.z); } }
      }

      // --- movement + separation + wall collision
      { const A = z.w.run > 0.5 ? z.act.run : z.act.walk; z.ph = (A.time / A.getClip().duration) * Math.PI * 2; }
      if (moveSpeed > 0 && !z.crawl) moveSpeed *= 1 + z.lurch * Math.sin(2 * z.ph + 0.6); // a surge on every step
      if (moveSpeed > 0) { z.x += Math.sin(z.yaw) * moveSpeed * dt; z.z += Math.cos(z.yaw) * moveSpeed * dt; }
      if (z.kx || z.kz) { if (z.state === 'chase') { z.x += z.kx * dt; z.z += z.kz * dt; } const k = Math.exp(-7 * dt); z.kx *= k; z.kz *= k; if (Math.abs(z.kx) + Math.abs(z.kz) < 0.02) z.kx = z.kz = 0; }
      if (z.state === 'chase' || z.state === 'approach') {
        for (let j = 0; j < list.length; j++) { const o = list[j]; if (o === z || o.state === 'dead' || o.state === 'rise' || o.state === 'climb') continue; const dx = z.x - o.x, dz = z.z - o.z, d2 = dx * dx + dz * dz; if (d2 < 0.36 && d2 > 1e-6) { const d = Math.sqrt(d2), k = (0.6 - d) * 0.5 / d; z.x += dx * k; z.z += dz * k; } }
        if (z.state === 'chase') {
          if (W.safe && G.game.inSafe()) { const dx = z.x - W.safe.x, dz = z.z - W.safe.z, d = Math.hypot(dx, dz), lim = W.safe.r + 0.45; if (d < lim && d > 1e-4) { z.x = W.safe.x + (dx / d) * lim; z.z = W.safe.z + (dz / d) * lim; } }
          if (pd < 0.7 && pd > 1e-4) { const k = (0.7 - pd) / pd; z.x -= tx * k; z.z -= tz * k; }
          for (const c of W.colliders) { if (!c.on || !c.move) continue; const nx = clamp(z.x, c.x0, c.x1), nz = clamp(z.z, c.z0, c.z1), dx = z.x - nx, dz = z.z - nz, d2 = dx * dx + dz * dz; if (d2 < 0.09) { if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (0.3 - d) / d; z.x += dx * k; z.z += dz * k; } else { const l = z.x - c.x0, r = c.x1 - z.x, u = z.z - c.z0, b = c.z1 - z.z, mn = Math.min(l, r, u, b); if (mn === l) z.x = c.x0 - 0.3; else if (mn === r) z.x = c.x1 + 0.3; else if (mn === u) z.z = c.z0 - 0.3; else z.z = c.z1 + 0.3; } } }
        }
      }
      // --- animation
      if (z.state === 'approach' || z.state === 'chase') {
        const moving = moveSpeed > 0.2; setAnim(z, moving ? (z.type === 2 ? 'run' : 'walk') : 'idle', dt);
        const uneven = 1 + z.limp * 0.45 * Math.sin(z.ph + (z.limpS === 'Left' ? 0 : Math.PI)); // the bad leg is slow to come through
        // walkers shuffle: the stride is pulled toward the standing pose, so steps come shorter and quicker
        if (z.shuf < 1) { const k = z.shuf; z.act.walk.setEffectiveWeight(z.w.walk * k); z.act.idle.setEffectiveWeight(z.w.idle + z.w.walk * (1 - k)); }
        z.act.walk.timeScale = (z.speed / (1.45 * Math.pow(z.shuf, 0.85))) * uneven; z.act.run.timeScale = z.speed / 3.9;
      }
      const H = z.holder; H.position.set(z.x, z.y, z.z); H.rotation.y = z.yaw;
      if (z.crawl) { // body lies face down, chest at (x, z): the holder sits behind it, tipped forward
        H.position.x -= Math.sin(z.yaw) * 1.12; H.position.z -= Math.cos(z.yaw) * 1.12; H.position.y = 0.16 - (z.state === 'dead' && z.t > 3.4 ? Math.pow(Math.min(1, (z.t - 3.4) / 1.4), 2) * 0.6 : 0);
        H.rotation.x = 1.42 + (z.state === 'dead' ? 0.1 : Math.sin(G.time * 4 + z.wob) * 0.04); H.rotation.z = 0;
      }
      { const k = W.roomAt(z.x, z.z), outside = !W.indoor(z.x, z.z); if (outside !== z.outside) { z.outside = outside; for (const m of z.meshes) m.castShadow = outside && !/Eye|Teeth|visor/.test(m.name); } }
      z.blob.position.set(z.x, 0.02, z.z); z.blob.scale.setScalar(z.state === 'dead' ? 1 + z.fall * 0.7 : 1); z.blob.visible = z.y > -1 && !(z.state === 'dead' && z.t > 2.8);
      z.flinch = Math.max(0, (z.flinch || 0) - dt * 5);
      if (z.state !== 'dead' || !z.settled) {
        if (z.state === 'dead') { if (z.deathPose) for (const [b, q] of z.deathPose) b.quaternion.copy(q); } else z.mixer.update(dt);
        H.updateMatrixWorld(true);
        const B = z.bones, f = _f.set(Math.sin(z.yaw), 0, Math.cos(z.yaw)), r = _r.set(f.z, 0, -f.x);
        if (z.state !== 'dead' && z.crawl) {
          // arms claw forward in turn, head strains up toward the player
          const ph = G.time * (2.2 + z.speed * 2) + z.wob, atk = z.atk >= 0 ? Math.sin(Math.min(1, z.atk / 0.75) * Math.PI) : 0;
          turnBone(B.Neck, r, -0.95); turnBone(B.Head, r, -0.35);
          for (const [s, side, k] of [['Left', 0.35, 0], ['Right', -0.35, Math.PI]]) {
            const reach = Math.sin(ph + k) * 0.5 + 0.5;
            _t.copy(f).multiplyScalar(0.4 + reach * 0.9 + atk).addScaledVector(UP, -0.85 + reach * 0.45 + atk * 0.8).addScaledVector(r, side).normalize(); aimBone(B[s + 'Arm'], B[s + 'ForeArm'], _t, 1);
            _t.copy(f).multiplyScalar(0.6 + reach * 0.5).addScaledVector(UP, -1.0 + atk).addScaledVector(r, side * 0.5).normalize(); aimBone(B[s + 'ForeArm'], B[s + 'Hand'], _t, 1);
          }
        } else if (z.state !== 'dead') {
          shamble(z, B, f, r, armUp, armW, dt);
          if (z.shock > 0) { for (const k of ['Spine1', 'Neck', 'LeftArm', 'RightArm']) turnBone(B[k], UP, rand(-0.35, 0.35)); }
          if (z.flinch > 0) { const k = Math.sin(Math.min(1, z.flinch) * Math.PI * 0.5); turnBone(B.Spine1, r, -k * 0.45); turnBone(B.Spine1, UP, z.flinchSide * k * 0.35); if (z.flinchHead && B.Head.scale.x > 0.5) turnBone(B.Neck, r, -k * 0.7); }
        } else {
          // ragdoll-ish collapse: knees fold, spine curls, arms go limp toward the floor
          const tip = Math.max(0, (z.fall - 0.22) / 0.78), buckle = Math.min(1, z.fall / 0.35) * (z.fallDir > 0 ? 1 : 0.3) * (1 - tip), lim = Math.min(1, z.fall * 1.6);
          for (const s of ['Left', 'Right']) { turnBone(B[s + 'UpLeg'], r, -0.75 * buckle * (s === 'Left' ? 1 : 0.8)); turnBone(B[s + 'Leg'], r, 1.15 * buckle * (s === 'Left' ? 0.9 : 1)); }
          if (z.shock > 0) for (const k of ['Spine1', 'Neck', 'LeftForeArm', 'RightForeArm', 'LeftLeg']) turnBone(B[k], r, rand(-0.5, 0.5));
          turnBone(B.Spine, r, z.fallDir * 0.35 * lim); turnBone(B.Spine2, f, z.twist * 0.6 * lim); if (B.Head.scale.x > 0.5) turnBone(B.Neck, r, z.fallDir * 0.6 * lim);
          _t.copy(UP).multiplyScalar(-1).addScaledVector(f, -z.fallDir * 0.4).addScaledVector(r, 0.5).normalize(); aimBone(B.LeftArm, B.LeftForeArm, _t, lim * 0.85);
          _t.copy(UP).multiplyScalar(-1).addScaledVector(f, -z.fallDir * 0.4).addScaledVector(r, -0.5).normalize(); aimBone(B.RightArm, B.RightForeArm, _t, lim * 0.85);
          if (z.fall >= 1) { z.settleN = (z.settleN || 0) + 1; if (z.settleN > 2) z.settled = true; }
        }
      }
      // --- footsteps (shuffle for walkers, slaps for runners) and voice
      if ((z.state === 'chase' || z.state === 'approach') && moveSpeed > 0.3 && !z.crawl) { z.stepT = (z.stepT || 0) - dt * moveSpeed; if (z.stepT <= 0) { z.stepT = 0.7; if (pd < 12) SND.zstep(z.x, z.z, z.type === 2); } }
      // --- voice
      if (z.state !== 'dead') { z.groan -= dt; if (z.groan <= 0) { z.groan = rand(3, 8); if (pd < 26) SND.groan(z.x, z.z, z.type === 2); } }
    }
  };
  G.zombies = Z;
  return Z;
}
