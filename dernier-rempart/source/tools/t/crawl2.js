export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    p.x = 0.5; p.z = 4.5; p.yaw = 0.25; p.pitch = -0.32;
    let q; for (let t = 0; t < 20; t++) { q = D.zombies.spawn(D.world.windows[0], 4); if (q.kind === 'm') break; D.zombies.clear(); }
    q.state = 'chase'; q.x = 0; q.z = 2.2; q.y = 0; q.t = 0; q.speed = 1; for (let i = 0; i < 5; i++) D.debug.simulate(1 / 60);
    D.zombies.cripple(q); q.speed = 0.001; for (let i = 0; i < 40; i++) D.debug.simulate(1 / 60); });
  await shot('cr3');
};
