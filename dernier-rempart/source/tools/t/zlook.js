export default async (page, shot) => {
  const E = (c) => page.evaluate(c);
  console.log(await E(`(()=>{ const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const p = D.player; p.x = -2; p.z = 3.6; p.yaw = 0; p.pitch = -0.02;
    const mk = (kind, dx, dz, st) => { const pool = D.zombies.pools[kind]; const q = D.zombies.spawn(D.world.windows[0], kind === 'b' ? 30 : 3); if (!q) return; q.state = st || 'chase'; q.x = p.x + dx; q.z = p.z + dz; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = Math.atan2(-dx, -dz); return q; };
    window.MK = mk; let kinds = [];
    for (let i = 0; i < 40 && kinds.length < 5; i++) { const q = mk('m', -1.8 + kinds.length * 0.9, -2.6 - (kinds.length % 2) * 0.6); if (q) kinds.push(q.kind); }
    for (let i = 0; i < 20; i++) D.debug.simulate(1/60);
    return JSON.stringify({ kinds, pools: Object.fromEntries(Object.entries(D.zombies.pools).map(([k, v]) => [k, v.length])) }); })()`));
  await shot('z1-group');
  await E(`(()=>{ D.zombies.list.forEach((z, i) => { z.speed = i % 2 ? 1.2 : 3.6; z.type = i % 2 ? 0 : 2; }); for (let i = 0; i < 26; i++) D.debug.simulate(1/60); })()`);
  await shot('z2-walking');
};
