// Knocked down and back up: DIR=back|front. Side view, frames at TIMES.
export default async (page, shot) => {
  const front = process.env.DIR === 'front', times = (process.env.TIMES || '0.3,0.8,1.6,2.1,2.5,2.9,3.3,4').split(',').map(Number);
  await page.evaluate(([front]) => {
    const G = __DR, D = G.debug; D.setFree(true); D.startGame(true); D.freeze = true;
    G.game.toSpawn = 0; G.game.between = 1e9; G.player.hp = 1e9; G.player.maxHp = 1e9; G.game.hurt = () => {};
    G.weapons.root.visible = false; G.flashlight.visible = false; document.getElementById('hud').style.display = 'none'; G.world.safe.group.visible = false;
    const L = new D.THREE.PointLight(0xffe2c0, 9, 12, 1.2); G.scene.add(L); window.__L = L;
    let z; for (let i = 0; i < 30; i++) { z = G.zombies.spawn(G.world.windows[0], 3); if (z.kind !== 'b') break; G.zombies.clear(); }
    z.state = 'chase'; z.y = 0; z.t = 0; z.x = 0.5; z.z = 0; z.yaw = -Math.PI / 2; z.w.idle = 0; z.w.walk = 1; z.type = 1; z.speed = 1.2;
    G.player.x = -9; G.player.z = 0; window.__Z = z; for (let i = 0; i < 20; i++) D.simulate(1 / 60);
    console.log('knock', G.zombies.knock(z, new D.THREE.Vector3(front ? -1 : 1, 0, 0), 2), z.death); window.__T = 0; window.__X = z.x;
  }, [front]);
  for (const t of times) {
    await page.evaluate((t) => { const G = __DR, D = G.debug; while (__T < t - 1e-6) { D.simulate(1 / 60); __T += 1 / 60; G.player.x = -9; G.player.z = 0; }
      const c = G.camera; c.position.set(__X, 1.3, 5.2); c.lookAt(__X, 0.6, 0); __L.position.set(__X - 1, 2.4, 1.8); c.fov = 44; c.updateProjectionMatrix(); c.updateMatrixWorld(true); D.probe(); }, t);
    await shot('knock-' + t);
  }
  console.log(await page.evaluate(() => __Z.state + ' x ' + __Z.x.toFixed(2) + ' y ' + __Z.y.toFixed(2)));
};
