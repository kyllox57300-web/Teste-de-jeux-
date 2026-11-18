export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    D.atmos.nextBolt = 1e9; V(24, 2, 0.75, -0.3); });
  await shot('puddle-1');
  await page.evaluate(() => V(25.5, -6, 0.6, -0.22)); await shot('puddle-2');
};
