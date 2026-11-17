export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {}; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; });

  await page.evaluate(() => V(19.5, 8.0, Math.PI + 0.9, 0.0, 30)); await shot('c2');
  await page.evaluate(() => V(26, 14.5, Math.PI, 0.05, 30)); await shot('c3');

};
