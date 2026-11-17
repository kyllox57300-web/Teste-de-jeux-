export default async (page, shot) => {
  await page.evaluate(() => { __DR.debug.setFree(true); __DR.debug.startGame(); });
  const sim = (sec, extra = '') => page.evaluate(([sec, extra]) => { const D = __DR; let log = []; for (let i = 0; i < sec * 30; i++) { if (extra) (0, eval)(extra); D.debug.simulate(1 / 30); } return JSON.stringify({ t: D.time.toFixed(1), round: D.game.round, alive: D.zombies.alive, toSpawn: D.game.toSpawn, hp: D.player.hp, pts: D.player.points, z: D.zombies.list.map((z) => z.state + ':' + z.x.toFixed(1) + ',' + z.z.toFixed(1)) }); }, [sec, extra]);
  const face = () => page.evaluate(() => { const D = __DR, p = D.player; let b = null, bd = 1e9; for (const z of D.zombies.list) { if (z.state === 'dead') continue; const d = Math.hypot(z.x - p.x, z.z - p.z); if (d < bd) { bd = d; b = z; } } if (b) { p.yaw = Math.atan2(-(b.x - p.x), -(b.z - p.z)); p.pitch = Math.atan2(1.2 * b.scale + b.y - 1.66, bd); } return b ? b.state + ' d=' + bd.toFixed(2) : 'none'; });
  console.log(await sim(8));
  console.log('face', await face()); await page.waitForTimeout(300); await shot('04-outside');
  console.log(await sim(10));
  console.log('face', await face()); await shot('05-approach');
  // run until one is chasing and close
  for (let i = 0; i < 30; i++) { const s = JSON.parse(await sim(1)); if (s.z.some((q) => q.startsWith('chase'))) { console.log('chase at', s.t, s.z.join(' ')); break; } }
  console.log(await sim(1.2)); console.log('face', await face()); await shot('06-chase');
  console.log(await sim(1.5)); console.log('face', await face()); await shot('07-close');
};
