// Killed at every moment of a knock-down / get-up: no error, the body ends on the floor and is removed.
export default async (page) => {
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player, T = D.debug.THREE, out = []; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const sim = (n) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); }; sim(20); p.x = -6; p.z = 0;
    for (const front of [false, true]) for (const at of [0, 0.3, 1.0, 1.9, 2.4, 2.9, 3.3]) {
      D.zombies.clear(); let z; for (let i = 0; i < 30; i++) { z = D.zombies.spawn(D.world.windows[0], 3); if (z.kind !== 'b') break; D.zombies.clear(); }
      z.state = 'chase'; z.x = 0; z.z = 0; z.y = 0; z.t = 0; z.yaw = -Math.PI / 2; sim(5);
      const ok = D.zombies.knock(z, new T.Vector3(front ? -1 : 1, 0, 0), 2); sim(Math.round(at * 60)); const st = z.state;
      D.zombies.damage(z, 1e6, false, new T.Vector3(1, 0, 0), new T.Vector3(z.x, 1, z.z)); sim(60); const y = z.y, k = z.death; sim(300);
      out.push(`${front ? 'F' : 'B'} kill@${at} knock=${ok} was=${st} death=${k} y=${y.toFixed(2)} gone=${!D.zombies.list.includes(z)}`);
    }
    return out.join('\n');
  }));
};
