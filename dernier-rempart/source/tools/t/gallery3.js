export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {}; D.renderer.info.autoReset = false;
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.Zs = (list) => { D.zombies.clear(); for (const [x, z, type] of list) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.type = type; q.speed = 0.001; q.t = 0; } };
  });
  const E = (c) => page.evaluate(c);
  await E(`Zs([[-0.3,0.6,0],[1.6,-1.5,0],[-2.4,-3,2],[3,-3,0],[-4,-2,0],[0,-4,0],[2,-5,0],[-3,-5,0]]); V(0.5, 3.5, 0.15, -0.02, 40); D.debug.input.fire = true; V(0.5,3.5,0.15,-0.02,1); D.weapons.flashT = 9;`); await shot('50-pistol-fire');
  console.log(await E(`(()=>{ const i = D.renderer.info; i.reset(); return 0; })()`));
  await page.waitForTimeout(2500);
  console.log('per-frame info', await E(`JSON.stringify(D.renderer.info.render)`));
  await E(`D.debug.input.fire=false; D.weapons.flashT = 0.01; D.weapons.reload(); V(0.5, 3.5, 0.15, -0.02, 30)`); await shot('51-reload');
  await E(`D.zombies.clear(); D.weapons.give('lmg'); V(0.5, 3.5, 0.15, -0.02, 40)`); await shot('52-lmg');
  await E(`D.weapons.give('magnum'); V(0.5, 3.5, 0.15, -0.02, 40)`); await shot('53-magnum');
  await E(`D.weapons.give('smg'); V(0.5, 3.5, 0.15, -0.02, 40)`); await shot('54-smg');
  await E(`D.weapons.give('shotgun'); V(-6, -3.6, 0.3, 0, 40)`); await shot('55-shotgun-cabinet');
};
