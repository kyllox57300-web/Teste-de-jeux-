export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame();
    window.T = {
      aim() { const p = D.player; let b = null, bd = 1e9; for (const z of D.zombies.list) { if (z.state === 'dead' || z.y < -0.5) continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < bd) { bd = d; b = z; } } if (!b) return null; const e = b.bones[window.AIM || 'Spine2'].matrixWorld.elements; const hx = e[12], hy = e[13], hz = e[14]; const dx = hx - p.x, dz = hz - p.z, dd = Math.hypot(dx, dz); p.yaw = Math.atan2(-dx, -dz); p.pitch = Math.atan2(hy - (p.y + 1.66), dd) - p.recoil; return bd; },
      run(sec, { fire = false, aim = false } = {}) { let fired = 0; for (let i = 0; i < sec * 60; i++) { let d = aim ? T.aim() : null; D.debug.input.fire = fire && d !== null && d < 14 && (i % 6 < 3); D.debug.simulate(1 / 60); } D.debug.input.fire = false; return T.stat(); },
      stat() { const p = D.player, w = p.weapons[p.cur]; return JSON.stringify({ t: +D.time.toFixed(1), round: D.game.round, alive: D.zombies.alive, toSpawn: D.game.toSpawn, hp: Math.round(p.hp), pts: p.points, kills: p.kills, hs: p.headshots, shots: p.shots, hits: p.hits, w: w.id, mag: w.mag, res: w.reserve, over: D.game.over, state: D.state, n: D.zombies.list.length }); },
      use(x, z, yaw) { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.vx = p.vz = 0; D.debug.simulate(1 / 60); D.debug.input.usePressed = true; D.debug.simulate(1 / 60); return T.stat(); },
    };
  });
  const E = (code) => page.evaluate(code);
  await E(`window.realHurt = __DR.game.hurt; __DR.game.hurt = () => {}`);
  console.log('r1 start', await E(`T.run(14)`));
  console.log('fight', await E(`T.run(40, {fire:true, aim:true})`));
  await E(`T.aim(); __DR.debug.input.fire = true; __DR.debug.simulate(1/60); __DR.debug.input.fire=false`); await shot('20-firing');
  console.log('fight2', await E(`T.run(45, {fire:true, aim:true})`));
  await shot('21-after');
  console.log('fight3', await E(`T.run(60, {fire:true, aim:true})`));
  // purchases
  await E(`__DR.player.points = 20000`);
  console.log('door1', await E(`T.use(3.2, -2, -Math.PI/2)`), await E(`JSON.stringify(__DR.world.doors.map(d=>d.open)) + [...__DR.world.unlocked].join('')`));
  console.log('smg', await E(`T.use(3.2, 4.1, -Math.PI/2)`));
  console.log('perk', await E(`T.use(-6, -5.0, 0)`), await E(`[...__DR.player.perks].join(',') + ' maxHp=' + __DR.player.maxHp`));
  console.log('door2', await E(`T.use(-2, -5.2, 0)`), await E(`[...__DR.world.unlocked].join('')`));
  console.log('crate', await E(`T.use(3.6, -12.6, 0)`), await E(`'box state ' + __DR.world.box.state`));
  console.log('crate wait', await E(`T.run(3.5)`), await E(`'box state ' + __DR.world.box.state + ' pick ' + __DR.world.box.pickId`));
  await E(`__DR.player.pitch=-0.35`); await shot('22-crate');
  console.log('take', await E(`T.use(3.6, -12.6, 0)`), await E(`JSON.stringify(__DR.player.weapons)`));
  console.log('rifle', await E(`T.use(15.2, -10, -Math.PI/2)`), await E(`JSON.stringify(__DR.player.weapons)`));
  console.log('fight4', await E(`T.run(40, {fire:true, aim:true})`));
  await E(`T.aim(); __DR.debug.input.fire = true; __DR.debug.simulate(1/60); __DR.debug.input.fire=false`); await shot('23-rifle');
  // death
  await E(`__DR.game.hurt = window.realHurt`);
  console.log('idle until death', await E(`(()=>{ let s; for (let i=0;i<40;i++){ s=T.run(5); if (__DR.game.over) break; } return s; })()`));
  await shot('24-dying');
  await page.waitForFunction(() => __DR.state === 'over', null, { timeout: 120000 });
  await shot('25-over');
  await page.click('#again'); await page.waitForTimeout(500);
  console.log('restart', await E(`T.stat()`), await E(`JSON.stringify({doors: __DR.world.doors.map(d=>d.open), planks: __DR.world.windows.map(w=>w.count), perks:[...__DR.player.perks], lock: !!document.pointerLockElement})`));
};
