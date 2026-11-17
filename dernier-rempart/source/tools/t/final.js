export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (x, z, yaw, pitch = 0, n = 6) => { const p = D.player; p.x = x; p.z = z; p.yaw = yaw; p.pitch = pitch; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id, up, ads) => { D.player.weapons = [{ id, mag: 5, reserve: 50, up }]; D.player.cur = 0; D.weapons.reset(); D.hud.weapon(); D.debug.input.ads = ads; V(0.5, 3.5, 0.2, -0.02, 50); };
    window.Zs = (list) => { D.zombies.clear(); for (const [x, z, br] of list) { const q = D.zombies.spawn(D.world.windows[0], 6); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.speed = 0.001; q.t = 0; } };
  });
  const E = (c) => page.evaluate(c);
  await E(`EQ('pistol', false, false)`); await shot('95-pistol');
  await E(`Zs([[-0.6,-1.5],[1.4,-2.5],[-2.6,-3]]); EQ('sniper', false, true)`); await shot('96-scope');
  await E(`EQ('rifle', true, false)`); await shot('97-rifle-up');
  await E(`EQ('rifle', false, true)`); await shot('98-rifle-ads');
  await E(`D.debug.input.ads = false; EQ('launcher', false, false); D.debug.input.firePressed = true; V(0.5,3.5,0.2,0.0,1); for (let i=0;i<60;i++){ D.debug.simulate(1/60); if (D.fxBoom) break; } V(0.5,3.5,0.2,0.0,9)`); await shot('99-boom');
};
