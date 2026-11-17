export default async (page, shot) => {
  const errs = await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    return 'ok';
  });
  const E = (c) => page.evaluate(c);
  const ids = ['pistol', 'magnum', 'smg', 'drum', 'shotgun', 'double', 'carbine', 'rifle', 'sniper', 'lmg', 'launcher'];
  // side-view board: six guns per shot
  for (let k = 0; k < 2; k++) {
    await E(`(()=>{ if (window.SG) D.scene.remove(window.SG); const g = window.SG = new D.debug.THREE.Group(); const ids = ${JSON.stringify(ids.slice(k * 6, k * 6 + 6))}; ids.forEach((id, i) => { const m = D.debug.gun(id); m.rotation.y = -Math.PI/2; m.position.set(-0.45 + (i % 2) * 0.95, 1.95 - Math.floor(i / 2) * 0.33, 0); g.add(m); }); g.position.set(-2, 0, -0.6); D.scene.add(g); D.weapons.root.visible = false; const l = new D.debug.THREE.PointLight(0xffffff, 6, 6, 1.5); l.position.set(0, 1.7, 1.2); g.add(l); V(-2, 0.75, 0, 0, 3); D.camera.fov = 50; })()`);
    await E(`V(-2, 0.75, 0, 0, 2)`);
    await shot('80-guns-' + k);
  }
  await E(`D.scene.remove(window.SG); D.weapons.root.visible = true;`);
  for (const id of (process.env.IDS ? process.env.IDS.split(',') : [])) { await E(`D.weapons.give('${id}'); V(0.5, 3.5, 0.2, -0.02, 45)`); await shot('81-fp-' + id); }
};
