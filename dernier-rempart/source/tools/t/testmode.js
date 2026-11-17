export default async (page, shot) => {
  const E = (c) => page.evaluate(c);
  await page.click('#test-mode'); await page.waitForTimeout(400);
  console.log('start', await E(`(()=>{ const D = __DR, p = D.player; window.D = D; return JSON.stringify({ state: D.state, test: D.game.test, pts: p.points, w: p.weapons.map(w => w.id + (w.inf ? '∞' : '')), inSafe: D.game.inSafe(), badge: document.getElementById('badge').textContent, mag: document.getElementById('mag').textContent }); })()`));
  // let several rounds of zombies come in and crowd the circle; player stays in the zone and does nothing
  console.log('crowd', await E(`(()=>{ const D = __DR, p = D.player; D.debug.setFree(true); D.game.round = 4; D.game.between = 0.01; let minD = 99, maxHold = 0;
    for (let i = 0; i < 60 * 70; i++) { D.debug.simulate(1 / 60); let hold = 0; for (const z of D.zombies.list) { if (z.state !== 'chase') continue; const d = Math.hypot(z.x - D.world.safe.x, z.z - D.world.safe.z); minD = Math.min(minD, d); if (d < D.world.safe.r + 1) hold++; } maxHold = Math.max(maxHold, hold); }
    return JSON.stringify({ t: D.time.toFixed(0), hp: p.hp, dead: p.dead, alive: D.zombies.alive, chasing: D.zombies.list.filter(z => z.state === 'chase').length, maxAtEdge: maxHold, closest: minD.toFixed(2), r: D.world.safe.r }); })()`));
  await E(`(()=>{ const p = __DR.player; p.yaw = Math.PI; p.pitch = -0.08; for (let i = 0; i < 4; i++) __DR.debug.simulate(1/60); })()`); await shot('t1-edge');
  // aim at the closest zombie and burn
  console.log('flame', await E(`(()=>{ const D = __DR, p = D.player, w = p.weapons[0]; const k0 = p.kills, m0 = w.mag;
    const aim = () => { let b = null, bd = 1e9; for (const z of D.zombies.list) { if (z.state !== 'chase') continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < bd) { bd = d; b = z; } } if (b) { p.yaw = Math.atan2(-(b.x - p.x), -(b.z - p.z)); p.pitch = -0.12; } };
    aim(); for (let i = 0; i < 40; i++) { D.debug.input.fire = true; D.debug.simulate(1/60); } return JSON.stringify({ magBefore: m0, magAfter: w.mag, inf: w.inf, burning: D.zombies.list.filter(z => z.burn > 0).length }); })()`));
  await shot('t2-flame');
  console.log('flame2', await E(`(()=>{ const D = __DR, p = D.player, k0 = p.kills; for (let i = 0; i < 60 * 8; i++) { D.debug.input.fire = true; if (i % 30 === 0) { let b = null, bd = 1e9; for (const z of D.zombies.list) { if (z.state !== 'chase') continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < bd) { bd = d; b = z; } } if (b) p.yaw = Math.atan2(-(b.x - p.x), -(b.z - p.z)); } D.debug.simulate(1/60); } D.debug.input.fire = false; for (let i = 0; i < 20; i++) D.debug.simulate(1/60); return JSON.stringify({ kills: p.kills - k0, mag: p.weapons[0].mag, pts: p.points, hp: p.hp, char: D.zombies.list.filter(z => z.scorch >= 12).length }); })()`));
  await shot('t3-after');
  // step outside the circle: zombies should be able to hurt us again
  console.log('outside', await E(`(()=>{ const D = __DR, p = D.player; D.game.round = 6; D.game.toSpawn = 0; for (let i = 0; i < 8; i++) { const q = D.zombies.spawn(D.world.windows[0], 6); if (!q) break; q.state = 'chase'; q.x = 1.5 + (i % 3) * 0.6; q.z = 3 + Math.floor(i / 3) * 0.6; q.y = 0; q.t = 0; } p.x = 2.0; p.z = 1.5; p.vx = p.vz = 0; let t = 0; while (!D.game.over && t++ < 60 * 20) D.debug.simulate(1/60); return JSON.stringify({ inSafe: D.game.inSafe(), over: D.game.over, after: (t / 60).toFixed(1) + 's', badge: document.getElementById('badge').textContent }); })()`));
  await E(`(()=>{ for (let i = 0; i < 200; i++) __DR.debug.simulate(1/60); })()`);
  await page.waitForFunction(() => __DR.state === 'over', null, { timeout: 60000 });
  await page.click('#again'); await page.waitForTimeout(300);
  console.log('replay keeps test mode', await E(`JSON.stringify({ test: __DR.game.test, pts: __DR.player.points, w: __DR.player.weapons.map(w => w.id), best: localStorage.getItem('dr-best') })`));
  await page.keyboard.press('Escape'); await page.waitForTimeout(200); await page.click('[data-menu]'); await page.waitForTimeout(200);
  await page.click('#play'); await page.waitForTimeout(300);
  console.log('normal mode', await E(`JSON.stringify({ test: __DR.game.test, pts: __DR.player.points, w: __DR.player.weapons.map(w => w.id), zone: __DR.world.safe.group.visible, badgeHidden: document.getElementById('badge').hidden })`));
};
