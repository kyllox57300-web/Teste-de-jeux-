// The two outdoor areas: courtyard (D) and cemetery (G), seen from inside each.
export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; });
  const views = (process.env.VIEWS || '17.5,-12,-2.4,0.05;32,4,0.9,0.02;18,8,-2.5,0.05;32,22,0.75,0.02').split(';').map((s) => s.split(',').map(Number));
  let i = 0; for (const v of views) { await page.evaluate((v) => V(...v), v); await shot('out-' + i++); }
};
