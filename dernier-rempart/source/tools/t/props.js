export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 30) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; });
  await page.evaluate(() => V(2.4, 4.1, -Math.PI / 2, 0, 40)); await shot('p1-wallbuy');
  await page.evaluate(() => { D.player.points = 5000; V(3.6, -11.8, 0, -0.3, 40); D.debug.input.usePressed = true; V(3.6, -11.8, 0, -0.3, 2); V(3.6, -11.8, 0, -0.3, 200); }); await shot('p2-crate');
};
