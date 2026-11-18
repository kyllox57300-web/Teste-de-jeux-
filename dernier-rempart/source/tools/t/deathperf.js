// CPU cost of the simulation while 20 zombies die at once (no rendering).
export default async (page) => {
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const sim = (n) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; sim(30); p.x = 0; p.z = 3;
    const T = D.debug.THREE, zs = [];
    for (let i = 0; i < 20; i++) { const q = D.zombies.spawn(D.world.windows[0], 3); if (!q) break; q.state = 'chase'; q.x = -4 + (i % 5) * 1.6; q.z = -3 + Math.floor(i / 5) * 1.5; q.y = 0; q.t = 0; zs.push(q); }
    sim(20); let t0 = performance.now(); sim(60); const alive = (performance.now() - t0) / 60;
    const kinds = {}; zs.forEach((z, i) => D.zombies.damage(z, 1e6, i % 4 === 0, new T.Vector3(0, 0, -1), new T.Vector3(z.x, i % 3 ? 1.2 : 0.5, z.z)));
    zs.forEach((z) => { kinds[z.death] = (kinds[z.death] || 0) + 1; });
    t0 = performance.now(); sim(60); const dying = (performance.now() - t0) / 60; sim(400);
    return `ms/frame alive ${alive.toFixed(2)}  dying ${dying.toFixed(2)}  kinds ${JSON.stringify(kinds)} left ${D.zombies.list.length}`;
  }));
};
