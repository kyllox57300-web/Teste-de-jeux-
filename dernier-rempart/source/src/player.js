import { G } from './ctx.js';
import { clamp, damp, lerp } from './util.js';
import { WEAPONS } from './weapons.js';
import * as SND from './audio.js';

const R = 0.34, EYE = 1.66;
export function initPlayer() {
  const cam = G.camera; cam.rotation.order = 'YXZ';
  const p = (G.player = {});
  p.reset = () => Object.assign(p, {
    x: 0.6, z: 3.2, y: 0, vy: 0, vx: 0, vz: 0, yaw: 0.35, pitch: 0, pitchOut: 0, recoil: 0, recoilYaw: 0, speed: 0, bob: 0, lastStep: 0,
    hp: 100, maxHp: 100, lastHurt: 99, hurtFlash: 0, shake: 0, dead: false, deadT: 0,
    stamina: 4, maxStamina: 4, sprinting: false, sprintLock: 0, ads: 0, adsFov: 60, moveMul: 1, fov: 74,
    points: 500, perks: new Set(), weapons: [{ id: 'pistol', mag: WEAPONS.pistol.mag, reserve: WEAPONS.pistol.reserve, up: false }], cur: 0, grenades: 2, shots: 0, hits: 0, kills: 0, headshots: 0, score: 0,
  });
  p.reset();
  p.update = (dt, input) => {
    if (p.dead) {
      p.deadT += dt; const k = Math.min(1, p.deadT / 1.1), e = k * k;
      cam.position.set(p.x, lerp(EYE, 0.32, e), p.z); cam.rotation.set(p.pitch + e * 0.35, p.yaw, e * 1.1);
      return;
    }
    const s = G.settings.sens * 0.0022 * lerp(1, p.adsFov / 74, p.ads);
    p.yaw -= input.dx * s; p.pitch = clamp(p.pitch - input.dy * s, -1.5, 1.5);
    // keys give full steps; the touch stick gives an analog push (input.ax / input.ay)
    const analog = input.ax || input.ay;
    const mf = analog ? input.ay : (input.fwd ? 1 : 0) - (input.back ? 1 : 0), mr = analog ? input.ax : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
    let wx = -sy * mf + cy * mr, wz = -cy * mf - sy * mr; const wl = Math.hypot(wx, wz); if (wl > 1 || (!analog && wl > 0)) { wx /= wl; wz /= wl; }
    p.sprintLock = Math.max(0, p.sprintLock - dt);
    const wantSprint = input.sprint && mf > 0 && p.ads < 0.3 && p.sprintLock <= 0 && p.stamina > 0.05 && (p.sprinting || p.stamina > 0.8);
    p.sprinting = wantSprint;
    if (p.sprinting) p.stamina = Math.max(0, p.stamina - dt); else p.stamina = Math.min(p.maxStamina, p.stamina + dt * (wl > 0 ? 0.7 : 1.2));
    const top = (p.sprinting ? 6.4 : 4.3) * p.moveMul;
    const acc = p.y > 0.01 ? 3 : 14;
    p.vx = damp(p.vx, wx * top, acc, dt); p.vz = damp(p.vz, wz * top, acc, dt);
    if (input.jump && p.y <= 0.001) { p.vy = 4.4; SND.step(true); }
    p.vy -= 13 * dt; p.y += p.vy * dt; if (p.y <= 0) { if (p.vy < -3) { p.shake = Math.max(p.shake, 0.25); SND.step(true); } p.y = 0; p.vy = 0; }
    p.x += p.vx * dt; p.z += p.vz * dt;
    // zombies are solid
    for (const z of G.zombies.list) { if (z.state !== 'chase') continue; const dx = p.x - z.x, dz = p.z - z.z, d2 = dx * dx + dz * dz; if (d2 < 0.3364 && d2 > 1e-6) { const d = Math.sqrt(d2), k = ((0.58 - d) / d) * 0.85; p.x += dx * k; p.z += dz * k; } }
    for (let it = 0; it < 2; it++) for (const c of G.world.colliders) {
      if (!c.on || !c.move) continue;
      const nx = clamp(p.x, c.x0, c.x1), nz = clamp(p.z, c.z0, c.z1), dx = p.x - nx, dz = p.z - nz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (R - d) / d; p.x += dx * k; p.z += dz * k; }
      else { const l = p.x - c.x0, r = c.x1 - p.x, u = p.z - c.z0, b = c.z1 - p.z, mn = Math.min(l, r, u, b); if (mn === l) p.x = c.x0 - R; else if (mn === r) p.x = c.x1 + R; else if (mn === u) p.z = c.z0 - R; else p.z = c.z1 + R; }
    }
    p.speed = Math.hypot(p.vx, p.vz);
    if (p.y <= 0.001 && p.speed > 0.5) { p.bob += p.speed * dt * 1.75; const st = Math.floor(p.bob / Math.PI); if (st !== p.lastStep) { p.lastStep = st; SND.step(p.sprinting); } }
    // health
    p.lastHurt += dt; p.hurtFlash = Math.max(0, p.hurtFlash - dt * 1.6); p.shake = Math.max(0, p.shake - dt * 1.8);
    if (p.lastHurt > 4.5 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + dt * 45);
    // camera
    p.recoil = damp(p.recoil, 0, 9, dt); p.recoilYaw = damp(p.recoilYaw, 0, 9, dt);
    const bk = Math.min(1, p.speed / 4.3) * (1 - p.ads * 0.8), sh = p.shake;
    p.pitchOut = p.pitch + p.recoil;
    cam.position.set(p.x + Math.cos(p.bob) * 0.012 * bk * cy, p.y + EYE - Math.abs(Math.sin(p.bob)) * 0.035 * bk, p.z - Math.cos(p.bob) * 0.012 * bk * sy);
    cam.rotation.set(p.pitchOut + (Math.random() - 0.5) * sh * 0.08, p.yaw + p.recoilYaw + (Math.random() - 0.5) * sh * 0.08, Math.sin(p.bob) * 0.004 * bk + (Math.random() - 0.5) * sh * 0.06 - mr * 0.008);
    const fov = lerp(74, p.adsFov, p.ads) + (p.sprinting ? 5 : 0);
    p.fov = damp(p.fov, fov, 12, dt);
    if (Math.abs(cam.fov - p.fov) > 0.01) { cam.fov = p.fov; cam.updateProjectionMatrix(); }
    SND.listener(p.x, p.z, p.yaw);
  };
  return p;
}
