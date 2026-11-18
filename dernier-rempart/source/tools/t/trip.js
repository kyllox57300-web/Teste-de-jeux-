// A walker is shot in the leg: a knee gives, it dips toward the floor and limps on. Side view, 6 frames.
export default async (page, shot) => {
  await page.evaluate(() => {
    const G = __DR, D = G.debug; D.setFree(true); D.startGame(true); D.freeze = true;
    G.game.toSpawn = 0; G.game.between = 1e9; G.player.hp = 1e9; G.player.maxHp = 1e9; G.game.hurt = () => {};
    G.weapons.root.visible = false; G.flashlight.visible = false; document.getElementById('hud').style.display = 'none'; G.world.safe.group.visible = false;
    const L = new D.THREE.PointLight(0xffe2c0, 9, 12, 1.2); G.scene.add(L); window.__L = L;
    let z; for (let i = 0; i < 30; i++) { z = G.zombies.spawn(G.world.windows[0], 3); if (z.kind !== 'b') break; G.zombies.clear(); }
    z.state = 'chase'; z.y = 0; z.t = 0; z.x = 1.5; z.z = 0; z.yaw = -Math.PI / 2; z.w.idle = 0; z.w.walk = 1; z.type = 1; z.speed = 1.8; z.hp = z.maxHp = 1e5;
    G.player.x = -6.5; G.player.z = 0; window.__Z = z; for (let i = 0; i < 30; i++) D.simulate(1 / 60);
    G.zombies.damage(z, 2e4, false, new D.THREE.Vector3(1, 0, 0), new D.THREE.Vector3(z.x, 0.5, z.z)); window.__T = 0; window.__X = z.x - 0.6;
  });
  for (const t of [0.1, 0.25, 0.4, 0.55, 0.75, 1.1]) {
    await page.evaluate((t) => { const G = __DR, D = G.debug; while (__T < t - 1e-6) { D.simulate(1 / 60); __T += 1 / 60; } G.player.x = -6.5; G.player.z = 0;
      const c = G.camera; c.position.set(__X, 1.0, 4.2); c.lookAt(__X, 0.75, 0); __L.position.set(__X - 1, 2.4, 1.8); c.fov = 40; c.updateProjectionMatrix(); c.updateMatrixWorld(true); D.probe(); }, t);
    await shot('trip-' + t);
  }
  console.log(await page.evaluate(() => 'trip ' + __Z.trip.toFixed(2) + ' x ' + __Z.x.toFixed(2)));
};
