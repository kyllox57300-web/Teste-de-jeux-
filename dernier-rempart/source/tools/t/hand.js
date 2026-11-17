// Renders the view-model hands from outside, four angles per weapon, to judge the grip.
export default async (page, shot) => {
  await page.evaluate(() => {
    const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    window.V = (n = 6) => { const p = D.player; p.x = -2; p.z = 1.2; p.yaw = 0.2; p.pitch = -0.02; p.vx = p.vz = 0; for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    window.EQ = (id) => { D.player.weapons = [{ id, mag: 5, reserve: 50, up: false }]; D.player.cur = 0; D.weapons.reset(); for (const k of ['ads', 'sprint', 'fwd']) D.debug.input[k] = false; V(50); };
  });
  const E = (c) => page.evaluate(c);
  const views = { right: [[0.75, 0.05, -0.3], 34], left: [[-0.55, 0.05, -0.3], 34], below: [[0.1, -0.75, -0.2], 34], front: [[0.1, 0.05, -1.05], 34], top: [[0.1, 0.6, -0.15], 34] };
  for (const id of (process.env.IDS || 'pistol').split(',')) {
    await E(`EQ('${id}'); D.debug.freeze = true;`);
    const tgt = await E(`(()=>{ const g = D.weapons.vm['${id}'].g, i = g.userData; const hip = D.debug.WEAPONS['${id}'].hip; const f = i.fore || i.grip; return [hip[0] + (i.grip[0] + f[0]) / 2, hip[1] + (i.grip[1] + f[1]) / 2, hip[2] + (i.grip[2] + f[2]) / 2]; })()`);
    for (const k of (process.env.VIEWS || 'right,left,below,front').split(',')) {
      const [eye, fov] = views[k];
      await page.evaluate(([eye, tgt, fov]) => { const e = [tgt[0] + eye[0], tgt[1] + eye[1], tgt[2] + (eye[2] + 0.3)]; D.debug.view(e, tgt, fov); }, [eye, tgt, fov]);
      await shot(`h-${process.env.TAG || 'a'}-${id}-${k}`);
    }
    await E(`D.debug.freeze = false;`);
  }
};
