export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    for (const d of D.world.doors) D.world.openDoor(d);
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    D.player.weapons = [{ id: 'carbine', mag: 10, reserve: 50, up: false }]; D.player.cur = 0; D.weapons.reset();
  });
  const E = (c) => page.evaluate(c);
  const views = { F: [2.5, -15.5, 0.9, -0.05], E: [5.5, -18.5, -Math.PI / 2 - 0.15, -0.02], E2: [32, -16, Math.PI / 2 + 0.5, -0.03], D: [17.5, 4.5, -Math.PI / 2 - 0.55, 0.03], D2: [32.5, -12.5, 0.75 + Math.PI / 2, 0.0] };
  for (const k of (process.env.VIEWS || 'F,E,E2,D,D2').split(',')) { const v = views[k]; await E(`V(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, 70)`); await shot('90-map-' + k); }
};
