// Lightning over the yard and the puddles: one frame mid-flash, one in the dark.
export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    V(25, 4, 0, 0.12); D.atmos.nextBolt = 1e9; });
  await shot('storm-dark');
  await page.evaluate(() => { D.atmos.boltAt = -Math.PI / 2 - 0.1; D.atmos.nextBolt = 0; for (let i = 0; i < 2; i++) D.debug.simulate(1 / 60); });
  await shot('storm-flash');
  await page.evaluate(() => { for (let i = 0; i < 14; i++) D.debug.simulate(1 / 60); });
  await shot('storm-flash2');
};
