export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; });
  await page.evaluate(() => V(21, 13, 2.32, 0.16, 30)); await shot('s1');

  await page.evaluate(() => { const p = D.player; V(0, 3, 0, 0, 5); const z1 = { x: p.x + 2, z: p.z + 0.5 }, z2 = { x: p.x - 0.3, z: p.z - 1.5 }; D.hud.hurtFrom(z1.x, z1.z); D.hud.hurtFrom(z2.x, z2.z); D.hud.bloodSplat(80); for (let i = 0; i < 6; i++) D.debug.simulate(1 / 60); }); await shot('s3');
};
