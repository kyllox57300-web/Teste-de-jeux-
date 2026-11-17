export default async (page) => {
  console.log(await page.evaluate(() => { const D = __DR, p = D.player, out = []; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    p.x = 0; p.z = 4.2; let q; for (let t = 0; t < 20; t++) { q = D.zombies.spawn(D.world.windows[0], 3); if (q.kind === 'm') break; D.zombies.clear(); }
    q.state = 'chase'; q.x = 0; q.z = 1.6; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = 0; for (let i = 0; i < 10; i++) D.debug.simulate(1 / 60);
    const T = D.debug.THREE; D.zombies.damage(q, 1e6, false, new T.Vector3(0, 0, -1), new T.Vector3(q.x, 1.3, q.z));
    const head = new T.Vector3(), hips = new T.Vector3();
    for (let f = 0; f <= 300; f++) { if (f % 15 === 0) { head.setFromMatrixPosition(q.bones.Head.matrixWorld); hips.setFromMatrixPosition(q.bones.Hips.matrixWorld);
        out.push(`t=${q.t.toFixed(2)} state=${q.state} fall=${q.fall.toFixed(2)} y=${q.y.toFixed(2)} rotX=${q.holder.rotation.x.toFixed(2)} headY=${head.y.toFixed(2)} hipsY=${hips.y.toFixed(2)} headRel=${(head.y - q.holder.position.y).toFixed(2)} vis=${q.holder.visible} inList=${D.zombies.list.includes(q)}`); }
      D.debug.simulate(1 / 60); q.holder.updateMatrixWorld(true); }
    return out.join('\n'); }));
};
