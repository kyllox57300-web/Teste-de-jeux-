export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (n = 6) => { const p = D.player; p.x = 0.5; p.z = 3.5; p.yaw = 0.2; p.pitch = -0.02; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id) => { D.player.weapons = [{ id, mag: 5, reserve: 50, up: false }]; D.player.cur = 0; D.weapons.reset(); D.hud.weapon(); for (const k of ['ads', 'sprint', 'fwd']) D.debug.input[k] = false; V(50); };
    window.RUN = (n) => { const p = D.player; D.debug.input.sprint = true; D.debug.input.fwd = true; p.x = 0; p.z = 4; p.yaw = 0.2; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
  });
  const E = (c) => page.evaluate(c);
  const tag = process.env.TAG || 'a';
  for (const id of (process.env.IDS || 'pistol,rifle').split(',')) {
    await E(`EQ('${id}')`); await shot(`${tag}-${id}-idle`);
    if (process.env.MORE) {
      await E(`EQ('${id}'); RUN(22)`); await shot(`${tag}-${id}-sprint`);
      await E(`EQ('${id}'); D.debug.input.ads = true; V(40)`); await shot(`${tag}-${id}-ads`);
      await E(`EQ('${id}'); D.player.weapons[0].mag = 1; D.weapons.reload(); V(Math.round(D.weapons.reloadDur * 60 * 0.5))`); await shot(`${tag}-${id}-reload`);
    }
  }
};
