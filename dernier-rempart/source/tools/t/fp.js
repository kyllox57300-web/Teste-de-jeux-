export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id, up, ads) => { D.player.weapons = [{ id, mag: 5, reserve: 50, up }]; D.player.cur = 0; D.weapons.reset(); D.debug.input.ads = ads; V(0.5, 3.5, 0.2, -0.02, 50); };
  });
  const up = !!process.env.UP, ads = !!process.env.ADS;
  for (const id of process.env.IDS.split(',')) { await page.evaluate(([id, up, ads]) => EQ(id, up, ads), [id, up, ads]); await shot('81-fp-' + id + (ads ? '-ads' : '') + (up ? '-up' : '')); }
};
