export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; });
  const views = { A: [2.8, 4.8, 0.85, 0.05], C: [14.5, -7.2, 1.25, 0.04], E: [32.5, -15.5, 1.75, 0.03], F: [2.8, -15.2, 0.75, 0.05], D: [17.2, 4.6, -2.35, 0.06], OUT: [9.5, 4.6, 0.5, 0.02] };
  for (const k of (process.env.VIEWS || 'A,C,E,F,D').split(',')) { const v = views[k]; await page.evaluate((v) => V(...v), v); await shot('tour-' + k); }
};
