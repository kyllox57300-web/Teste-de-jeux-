// Gait contact sheet: one zombie of each kind walks across the common room, seen from the side.
// GAIT=walk|jog|run|brute|crawl   FRAMES=n
export default async (page, shot) => {
  const kind = process.env.GAIT || 'walk', N = +(process.env.FRAMES || 8);
  await page.addInitScript(() => {}); await page.evaluate(([a, l, sd]) => { if (a) window.__ARM = +a; if (l) window.__LIMP = +l; if (sd) window.__SIDEENV = +sd; }, [process.env.ARM, process.env.LIMP, process.env.SIDE]);
  await page.evaluate(([kind]) => {
    const G = __DR, D = G.debug; D.setFree(true); D.startGame(true); D.freeze = true;
    G.game.toSpawn = 0; G.game.between = 1e9; G.player.x = -6.5; G.player.z = 0; G.player.hp = 1e9; G.player.maxHp = 1e9;
    G.weapons.root.visible = false; G.flashlight.visible = false; document.getElementById('hud').style.display = 'none';
    const L = new D.THREE.PointLight(0xffe2c0, 9, 12, 1.2); G.scene.add(L); window.__L = L;
    const z = G.zombies.spawn(G.world.windows[0], kind === 'run' ? 12 : kind === 'jog' ? 3 : 1);
    z.state = 'chase'; z.y = 0; z.t = 0; z.x = 3; z.z = 0; z.yaw = -Math.PI / 2; z.w.idle = 0; z.w.walk = 1;
    if (kind === 'walk') { z.type = 0; z.speed = 1.15; } if (kind === 'jog') { z.type = 1; z.speed = 2.2; } if (kind === 'run') { z.type = 2; z.speed = 3.7; }
    if (kind === 'crawl') { z.type = 0; G.zombies.cripple(z); z.bleed = 0; }
    if (window.__ARM !== undefined) z.armStyle = window.__ARM; if (window.__LIMP !== undefined) z.limp = window.__LIMP;
    window.__Z = z; for (let i = 0; i < 30; i++) D.simulate(1 / 60);
    window.__SIDE = +(window.__SIDEENV ?? 1);
  }, [kind]);
  for (let f = 0; f < N; f++) {
    await page.evaluate(() => {
      const G = __DR, D = G.debug, z = __Z; for (let i = 0; i < 7; i++) D.simulate(1 / 60);
      G.player.x = z.x - 4.5; G.player.z = z.z; // keep him out of reach but near
      const c = G.camera; const side = +(window.__SIDE ?? 1); c.position.set(z.x - 0.4 - (1 - side) * 3.6, 1.0, z.z + 4.4 * side + (1 - side) * 1.2); c.lookAt(z.x - 0.4, 0.88, z.z); __L.position.set(z.x - 1, 2.2, z.z + 1.6); c.fov = 40; c.updateProjectionMatrix(); c.updateMatrixWorld(true);
      G.weapons.root.visible = false; D.probe();
    });
    await shot(`gait-${kind}-${f}`);
  }
};
