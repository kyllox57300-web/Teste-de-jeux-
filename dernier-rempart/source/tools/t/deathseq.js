export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    p.x = 0; p.z = 4.2; p.yaw = 0.35; p.pitch = -0.32;
    for (let i = 0; i < 3; i++) { let q; for (let t = 0; t < 20; t++) { q = D.zombies.spawn(D.world.windows[0], 3); if (q.kind !== 'b') break; D.zombies.clear(); } q.state = 'chase'; q.x = -1.6 + i * 1.3; q.z = 1.6; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = 0; }
    for (let i = 0; i < 10; i++) D.debug.simulate(1 / 60);
    const T = D.debug.THREE; D.zombies.list.forEach((z, i) => D.zombies.damage(z, 1e6, i === 1, new T.Vector3(0, 0, -1), new T.Vector3(z.x, 1.3, z.z))); window.sim = (s) => { for (let i = 0; i < s * 60; i++) D.debug.simulate(1 / 60); }; });
  let t = 0;
  for (const at of [0.5, 1.5, 2.5, 3.0, 3.4, 3.8, 4.2, 4.6]) { await page.evaluate((d) => sim(d), at - t); t = at; await shot('ds' + at); }
  console.log(await page.evaluate(() => D.zombies.list.map((z) => `t=${z.t.toFixed(2)} y=${z.y.toFixed(2)} settled=${z.settled} fall=${z.fall.toFixed(2)} vis=${z.holder.visible}`).join('\n')));
};
