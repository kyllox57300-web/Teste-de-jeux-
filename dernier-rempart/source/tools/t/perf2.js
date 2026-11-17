export default async (page, shot) => {
  const r = await page.evaluate(async () => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    for (let i = 0; i < 24; i++) { const q = D.zombies.spawn(D.world.windows[0], i % 6 === 0 ? 30 : 3); if (!q) break; q.state = 'chase'; q.x = -6 + (i % 6) * 1.5; q.z = -4 + Math.floor(i / 6) * 1.4; q.y = 0; q.t = 0; }
    const t0 = performance.now(); for (let i = 0; i < 240; i++) D.debug.simulate(1 / 60); const sim = (performance.now() - t0) / 240;
    D.renderer.info.autoReset = false; D.renderer.info.reset();
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const info = { ...D.renderer.info.render }; D.renderer.info.autoReset = true;
    return JSON.stringify({ simMs: +sim.toFixed(2), zombies: D.zombies.list.length, kinds: D.zombies.list.reduce((a, z) => (a[z.kind] = (a[z.kind] || 0) + 1, a), {}), calls: info.calls, tris: info.triangles, programs: D.renderer.info.programs.length, textures: D.renderer.info.memory.textures });
  });
  console.log(r);
  const lt = await page.evaluate(() => performance.getEntriesByType('navigation')[0] ? Math.round(performance.now()) : 0); console.log('page age ms', lt);
};
