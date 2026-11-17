export default async (page) => {
  console.log(await page.evaluate(() => { const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const p = D.player; p.x = -2; p.z = 3.6; const out = [];
    for (const kind of ['m', 'f']) {
      D.zombies.clear(); let q; for (let t = 0; t < 30; t++) { q = D.zombies.spawn(D.world.windows[0], 3); if (q.kind === kind) break; D.zombies.clear(); }
      q.state = 'chase'; q.x = -2; q.z = 1.4; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = 0;
      for (let i = 0; i < 10; i++) D.debug.simulate(1 / 60);
      const T = D.debug.THREE, hp = () => { const v = new T.Vector3().setFromMatrixPosition(q.bones.Head.matrixWorld); return [v.x.toFixed(2), v.y.toFixed(2), v.z.toFixed(2)].join(','); };
      const feet = () => { const v = new T.Vector3().setFromMatrixPosition(q.bones.LeftFoot.matrixWorld); return [v.x.toFixed(2), v.y.toFixed(2), v.z.toFixed(2)].join(','); };
      const before = hp();
      D.zombies.damage(q, 1e6, false, new T.Vector3(0, 0, -1), new T.Vector3(q.x, 1.3, q.z));
      for (let i = 0; i < 100; i++) D.debug.simulate(1 / 60);
      out.push(`${kind} yaw ${q.yaw.toFixed(2)} fallDir ${q.fallDir} rotX ${q.holder.rotation.x.toFixed(2)} head before ${before} after ${hp()} foot ${feet()} holder ${q.holder.position.z.toFixed(2)}`);
    }
    return out.join('\n'); }));
};
