// Death contact sheet: KIND=crumple|knees|stumble|back|spin|blast|burn|slump (or a comma list), TIMES=0.2,0.5,...
// A zombie walks at the player across the common room, is killed with the chosen death, and is filmed from the side.
export default async (page, shot) => {
  const kinds = (process.env.KIND || 'back').split(','), times = (process.env.TIMES || '0.15,0.35,0.55,0.8,1.2,2.4').split(',').map(Number);
  await page.evaluate(() => {
    const G = __DR, D = G.debug; D.setFree(true); D.startGame(true); D.freeze = true;
    G.game.toSpawn = 0; G.game.between = 1e9; G.player.hp = 1e9; G.player.maxHp = 1e9; G.game.hurt = () => {};
    G.weapons.root.visible = false; G.flashlight.visible = false; document.getElementById('hud').style.display = 'none';
    G.world.safe.group.visible = false; const L = new D.THREE.PointLight(0xffe2c0, 9, 12, 1.2); G.scene.add(L); window.__L = L;
  });
  for (const kind of kinds) {
    await page.evaluate(([kind]) => {
      const G = __DR, D = G.debug; G.zombies.clear(); D.forceDeath = kind;
      let z; for (let i = 0; i < 30; i++) { z = G.zombies.spawn(G.world.windows[0], 3); if (z.kind !== 'b') break; G.zombies.clear(); }
      z.state = 'chase'; z.y = 0; z.t = 0; z.x = 0.5; z.z = 0; z.yaw = -Math.PI / 2; z.w.idle = 0; z.w.walk = 1; z.type = 1; z.speed = 1.6;
      G.player.x = -6.5; G.player.z = 0; window.__Z = z;
      for (let i = 0; i < 20; i++) D.simulate(1 / 60);
      if (kind === 'burn') { z.burn = 3; z.burnDps = 1; }
      const dir = new D.THREE.Vector3(1, kind === 'blast' ? 0.3 : 0, 0).normalize();
      G.zombies.damage(z, 1e5, kind === 'crumple', dir, kind === 'blast' ? null : new D.THREE.Vector3(z.x, 1.3, z.z));
      window.__T = 0; window.__X = z.x; window.__KZ = z.death;
    }, [kind]);
    for (const t of times) {
      await page.evaluate((t) => {
        const G = __DR, D = G.debug, z = __Z; while (__T < t - 1e-6) { D.simulate(1 / 60); __T += 1 / 60; }
        G.player.x = -6.5; G.player.z = 0;
        const c = G.camera, cx = __X; c.position.set(cx, 1.3, 5.6); c.lookAt(cx, 0.6, 0); __L.position.set(cx - 1, 2.4, 1.8); c.fov = 46; c.updateProjectionMatrix(); c.updateMatrixWorld(true);
        G.weapons.root.visible = false; D.probe();
      }, t);
      await shot(`death-${kind}-${t}`);
    }
    console.log(kind, '->', await page.evaluate(() => __KZ + ' y=' + __Z.y.toFixed(2) + ' x=' + __Z.x.toFixed(2)));
  }
};
