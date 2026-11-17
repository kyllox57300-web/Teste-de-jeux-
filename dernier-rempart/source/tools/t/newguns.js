export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id) => { D.player.weapons = [{ id, mag: 8, reserve: 50, up: false }]; D.player.cur = 0; D.weapons.reset(); D.hud.weapon(); V(0.5, 3.5, 0.2, -0.02, 50); }; });
  const E = (c) => page.evaluate(c);
  await E(`(()=>{ const g = window.SG = new D.debug.THREE.Group(); ['burst','autoshot','orage'].forEach((id, i) => { const m = D.debug.gun(id); m.rotation.y = -Math.PI/2; m.position.set(-0.45 + (i % 2) * 0.95, 1.95 - Math.floor(i / 2) * 0.33, 0); g.add(m); }); g.position.set(-2, 0, -0.6); D.scene.add(g); D.weapons.root.visible = false; const l = new D.debug.THREE.PointLight(0xffffff, 6, 6, 1.5); l.position.set(0, 1.7, 1.2); g.add(l); V(-2, 0.75, 0, 0, 3); })()`);
  await shot('ng-side'); await E(`D.scene.remove(window.SG); D.weapons.root.visible = true;`);
  for (const id of ['burst', 'autoshot', 'orage']) { await E(`EQ('${id}')`); await shot('ng-fp-' + id); }
  // the special on a crowd
  console.log(await E(`(()=>{ const p = D.player; p.weapons = [{ id: 'orage', mag: 8, reserve: 40, up: false }]; p.cur = 0; D.weapons.reset(); V(-2, 4, 0, -0.06, 40);
    for (let i = 0; i < 8; i++) { const q = D.zombies.spawn(D.world.windows[0], 6); q.state = 'chase'; q.x = -4 + (i % 4) * 1.4; q.z = 0.5 - Math.floor(i / 4) * 1.6; q.y = 0; q.speed = 0.001; q.t = 0; }
    V(-2, 4, 0, -0.06, 10); const k0 = p.kills; D.debug.input.firePressed = true; D.debug.simulate(1/60); D.debug.input.firePressed = false; D.debug.simulate(1/60);
    return 'orage kills ' + (p.kills - k0) + ' mag ' + p.weapons[0].mag; })()`));
  await shot('ng-arc');
  await E(`V(-2, 4, 0, -0.06, 16)`); await shot('ng-arc2');
  // burst: one click = three rounds
  console.log(await E(`(()=>{ const p = D.player; D.zombies.clear(); p.weapons = [{ id: 'burst', mag: 30, reserve: 60, up: false }]; p.cur = 0; D.weapons.reset(); V(0.5, 3.5, 0.2, 0, 40); const s0 = p.shots; D.debug.input.firePressed = true; D.debug.input.fire = true; D.debug.simulate(1/60); D.debug.input.firePressed = false; D.debug.input.fire = false; V(0.5, 3.5, 0.2, 0, 30); const one = p.shots - s0; D.debug.input.fire = true; for (let i = 0; i < 60; i++) { D.debug.input.firePressed = i % 20 === 0; D.debug.simulate(1/60); } D.debug.input.fire = false; return 'burst: one click ' + one + ' shots; 3 clicks in 1 s -> ' + (p.shots - s0 - one) + ' shots, mag ' + p.weapons[0].mag; })()`));
  console.log(await E(`(()=>{ const p = D.player; p.points = 20000; p.weapons = [{ id: 'pistol', mag: 8, reserve: 8, up: false }]; p.cur = 0; D.weapons.reset(); const it = D.world.interactables.find(i => Math.abs(i.x - 30) < 0.1 && i.z < -14); V(it.x, it.z, Math.PI, 0, 3); D.debug.input.usePressed = true; D.debug.simulate(1/60); return 'prototype: ' + p.weapons.map(w => w.id).join('+') + ' pts ' + p.points + ' prompt-after ' + it.prompt(); })()`));
};
