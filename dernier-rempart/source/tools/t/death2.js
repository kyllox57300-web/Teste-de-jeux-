export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const p = D.player; p.x = -2; p.z = 3.6; p.yaw = 0; p.pitch = -0.3;
    for (let i = 0; i < 3; i++) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = p.x - 1.2 + i * 1.2; q.z = p.z - 2.2; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = 0; }
    for (let i = 0; i < 20; i++) D.debug.simulate(1 / 60);
    const T = D.debug.THREE; D.zombies.list.forEach((z, i) => D.zombies.damage(z, 1e6, i === 1, (i === 2 ? new T.Vector3(0, 0, 1) : new T.Vector3(0, 0, -1)), new T.Vector3(z.x, 1.3, z.z)));
    for (let i = 0; i < 100; i++) D.debug.simulate(1 / 60); });
  await shot('d4');
};
