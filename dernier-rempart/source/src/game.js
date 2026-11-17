import * as THREE from 'three';
import { G } from './ctx.js';
import { rand, clamp } from './util.js';
import { PERKS } from './world.js';
import { WEAPONS } from './weapons.js';
import { cv, imgTex } from './textures.js';
import * as SND from './audio.js';

const PW = {
  ammo: { name: 'Munitions max', glyph: '▮▮▮', color: [0.5, 1, 0.45] },
  insta: { name: 'Mort instantanée', glyph: '☠', color: [1, 0.35, 0.3] },
  double: { name: 'Points doublés', glyph: '×2', color: [1, 0.8, 0.3] },
  nuke: { name: 'Déflagration', glyph: '✹', color: [1, 0.6, 0.2] },
};

export function initGame() {
  const W = G.world, Z = G.zombies, p = G.player, hud = G.hud;
  const game = (G.game = { round: 0, over: false, toSpawn: 0, spawnT: 0, between: 0, power: { insta: 0, double: 0 }, drops: [], dropsThisRound: 0, repairT: 0, repairs: 0, flowT: 0, started: false, overT: 0 });

  // power-up tokens
  for (const k in PW) {
    const c = cv(128), x = c.getContext('2d'); x.strokeStyle = '#fff'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 56, 0, 6.3); x.stroke();
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 ${k === 'ammo' ? 44 : 62}px 'Oswald','Arial Narrow',sans-serif`; x.fillText(PW[k].glyph, 64, 68);
    PW[k].tex = imgTex(c, { repeat: false });
  }
  const dropPool = [];
  function makeDrop() {
    const g = new THREE.Group();
    const icon = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); icon.scale.setScalar(0.55);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.tex.glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); halo.scale.setScalar(1.7);
    g.add(halo, icon); G.scene.add(g);
    return { g, icon, halo, type: '', t: 0, on: false };
  }
  function spawnDrop(x, z) {
    const d = dropPool.find((q) => !q.on) || (dropPool.push(makeDrop()), dropPool[dropPool.length - 1]);
    const types = ['ammo', 'insta', 'double', 'nuke']; d.type = types[(Math.random() * types.length) | 0]; const P = PW[d.type];
    d.icon.material.map = P.tex; d.icon.material.color.setRGB(P.color[0] * 2.4, P.color[1] * 2.4, P.color[2] * 2.4); d.halo.material.color.setRGB(P.color[0] * 0.9, P.color[1] * 0.9, P.color[2] * 0.9);
    d.g.position.set(x, 1.05, z); d.g.visible = true; d.on = true; d.t = 0; game.drops.push(d);
  }
  function takeDrop(d) {
    const P = PW[d.type]; d.on = false; d.g.visible = false; game.drops.splice(game.drops.indexOf(d), 1);
    SND.pickup(); hud.message(P.name, '', 2.2); G.fx.burst(d.g.position.x, 1.05, d.g.position.z, P.color[0] * 2, P.color[1] * 2, P.color[2] * 2);
    if (d.type === 'ammo') { G.weapons.maxAmmo(); hud.ammo(); }
    else if (d.type === 'insta') game.power.insta = 20;
    else if (d.type === 'double') game.power.double = 20;
    else { SND.boom(); hud.flash(0.9); for (const z of Z.list.slice()) if (z.state !== 'dead') { Z.kill(z, Math.random() < 0.5, null); p.kills++; } game.addPoints(400); }
  }

  game.zombieHp = (r) => (r < 10 ? 90 + (r - 1) * 75 : 765 * Math.pow(1.1, r - 9));
  const countFor = (r) => (r <= 5 ? [6, 9, 13, 18, 24][r - 1] : Math.floor(24 + (r - 5) * 5));
  game.addPoints = (n) => { if (game.power.double > 0) n *= 2; p.points += n; p.score += n; hud.points(n); };
  game.spend = (c) => { if (p.points < c) { SND.deny(); hud.toast(`Il manque ${c - p.points} points`); return false; } p.points -= c; hud.points(-c); return true; };
  game.refund = () => { game.toSpawn++; };
  game.addPerk = (id) => { if (id === 'chance' && p.perks.has('chance')) return; p.perks.add(id); SND.perk(); hud.perks(); hud.message(PERKS[id].name, PERKS[id].desc, 2.6); if (id === 'vigueur') { p.maxHp = 200; p.hp = 200; } if (id === 'souffle') { p.maxStamina = 9; p.stamina = 9; } };
  game.onKill = (z, head, melee) => {
    p.kills++; if (head) p.headshots++;
    game.addPoints(z.brute ? 300 : melee ? 130 : head ? 100 : 60);
    if (game.dropsThisRound < 3 && Math.random() < 0.045 && W.roomAt(z.x, z.z)) { game.dropsThisRound++; spawnDrop(z.x, z.z); }
  };
  game.hurt = (z) => { if (z && !game.inSafe() && !p.dead) hud.hurtFrom(z.x, z.z); game.hurtAmount(z && z.brute ? 80 : z && z.crawl ? 30 : 45); };
  game.hurtAmount = (amount) => {
    if (p.dead || amount <= 0 || game.inSafe()) return;
    p.hp -= amount; p.lastHurt = 0; p.hurtFlash = 0.7; p.shake = 0.6; SND.hurt(); hud.bloodSplat(amount);
    if (p.hp <= 0 && p.perks.has('chance')) {
      // second chance: back on your feet, a shockwave throws back everything close, and time slows for a breath
      p.perks.delete('chance'); hud.perks(); p.hp = p.maxHp * 0.6; p.lastHurt = 0; game.slowmo = 1.6; hud.flash(0.6); hud.message('Seconde chance', 'Relève-toi', 2.2); SND.perk(); SND.boom();
      for (const z of Z.list.slice()) { if (z.state === 'dead') continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < 4.5) { Z.kill(z, false, new THREE.Vector3(z.x - p.x, 0, z.z - p.z).normalize()); p.kills++; } }
      G.fx.burst(p.x, 1.2, p.z, 0.5, 2.2, 0.6, 60); return;
    }
    if (p.hp <= 0) { p.hp = 0; p.dead = true; p.deadT = 0; game.over = true; game.overT = 0; SND.gameOver(); hud.prompt(null); }
  };
  game.repair = (w) => {
    game.repairT += G.dt;
    if (game.repairT >= 0.7) { game.repairT = 0; if (W.addPlank(w) && game.repairs < 40) { game.repairs++; game.addPoints(10); } }
  };
  game.meleeStrike = () => {
    let best = null, bd = 2.1; const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    for (const z of Z.list) { if (z.state === 'dead' || z.y < -0.8) continue; const dx = z.x - p.x, dz = z.z - p.z, d = Math.hypot(dx, dz); if (d < bd && (dx * fx + dz * fz) / (d || 1) > 0.45) { bd = d; best = z; } }
    if (best) { SND.thud(); const pt = new THREE.Vector3(best.x, 1.35, best.z); Z.damage(best, 160, false, new THREE.Vector3(fx, 0, fz), pt, true); p.shake = Math.max(p.shake, 0.25); G.hud.hit(false); }
  };

  function nextRound() {
    game.round++; if (game.round > 1) p.grenades = Math.min(4, p.grenades + 2); hud.ammo(); game.toSpawn = countFor(game.round); game.spawnT = 2.2; game.dropsThisRound = 0; game.repairs = 0;
    hud.round(game.round, true); hud.message(`Manche ${game.round}`, game.round === 1 ? 'Ils arrivent par les fenêtres. Tenez bon.' : '', 3.6); SND.roundStart();
  }
  function pickWindow() {
    const opts = W.windows.filter((w) => W.unlocked.has(w.room)); let tot = 0;
    const ws = opts.map((w) => { const d = Math.hypot(w.x - p.x, w.z - p.z); const k = 1 / (1 + d / 7); tot += k; return k; });
    let r = Math.random() * tot; for (let i = 0; i < opts.length; i++) { r -= ws[i]; if (r <= 0) return opts[i]; }
    return opts[0];
  }

  // test mode: lots of points, a flamethrower that never runs dry, and a circle at the start where the player cannot be hurt
  game.inSafe = () => !!game.test && !p.dead && Math.hypot(p.x - W.safe.x, p.z - W.safe.z) < W.safe.r;
  game.start = (opts = {}) => {
    game.test = !!opts.test;
    Z.clear(); W.reset(); G.fx.clear(); p.reset();
    if (game.test) {
      p.points = 200000; p.x = W.safe.x; p.z = W.safe.z; p.yaw = Math.PI; p.grenades = 4;
      p.weapons = [{ id: 'flamer', mag: WEAPONS.flamer.mag, reserve: WEAPONS.flamer.reserve, up: false, inf: true }, { id: 'pistol', mag: WEAPONS.pistol.mag, reserve: WEAPONS.pistol.reserve, up: false }]; p.cur = 0;
    }
    W.safe.group.visible = game.test; W.setPower(false); // every game, test mode included, starts without power
    G.weapons.reset();
    for (const d of game.drops) { d.on = false; d.g.visible = false; } game.drops.length = 0;
    Object.assign(game, { round: 0, over: false, toSpawn: 0, spawnT: 0, between: 2.5, repairT: 0, repairs: 0, flowT: 0, started: true, overT: 0 });
    game.power.insta = 0; game.power.double = 0;
    hud.reset(); hud.show(true); G.camera.fov = 74; G.camera.updateProjectionMatrix();
  };

  let interact = null;
  game.update = (dt, input) => {
    if (game.over) { game.overT += dt; return; }
    game.flowT -= dt; if (game.flowT <= 0) { game.flowT = 0.18; W.flow(p.x, p.z); }
    game.power.insta = Math.max(0, game.power.insta - dt); game.power.double = Math.max(0, game.power.double - dt);
    // rounds
    if (game.between > 0) { game.between -= dt; if (game.between <= 0) nextRound(); }
    else if (game.toSpawn > 0) {
      game.spawnT -= dt;
      if (game.spawnT <= 0 && Z.alive < Math.min(24, 6 + game.round * 3)) { const z = Z.spawn(pickWindow(), game.round); if (z) { game.toSpawn--; game.spawnT = Math.max(0.35, 2.4 * Math.pow(0.9, game.round - 1)) * rand(0.7, 1.3); } }
    } else if (Z.alive === 0) { game.between = 10; SND.roundEnd(); hud.message('Manche terminée', 'Réparez les barricades, rechargez, achetez.', 4); }
    // interactions
    interact = null; let bd = 1e9; const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    for (const it of W.interactables) {
      const dx = it.x - p.x, dz = it.z - p.z, d = Math.hypot(dx, dz); if (d > it.r) continue;
      if (d > 0.7 && (dx * fx + dz * fz) / d < 0.25) continue;
      const pr = it.prompt(); if (!pr) continue;
      if (d < bd) { bd = d; interact = it; interact._p = pr; }
    }
    G.weapons.updateProjectiles(dt); G.weapons.updateBolts(dt);
    hud.prompt(interact ? interact._p : null);
    if (interact) { if (interact.hold) { if (input.use) interact.use(); else game.repairT = 0; } else if (input.usePressed) interact.use(); } else game.repairT = 0;
    // drops
    for (let i = game.drops.length - 1; i >= 0; i--) {
      const d = game.drops[i]; d.t += dt; d.g.position.y = 1.05 + Math.sin(d.t * 2.4) * 0.1; d.icon.material.rotation = Math.sin(d.t * 1.5) * 0.15;
      d.g.visible = d.t < 20 || Math.floor(d.t * 6) % 2 === 0;
      if (Math.hypot(d.g.position.x - p.x, d.g.position.z - p.z) < 1.0) takeDrop(d); else if (d.t > 26) { d.on = false; d.g.visible = false; game.drops.splice(i, 1); }
    }
    // low-health heartbeat
    if (p.hp < p.maxHp * 0.5) { game.hb = (game.hb || 0) - dt; if (game.hb <= 0) { game.hb = 0.85; SND.heartbeat(); } }
  };
  return game;
}
