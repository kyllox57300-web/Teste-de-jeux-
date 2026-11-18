// Shoots zombies standing in front of a wall: blood should spray onto the wall and run down it.
export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const p = D.player; p.x = -1.5; p.z = 0.4; p.yaw = Math.PI / 2; p.pitch = -0.02;
    window.sim = (n) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    sim(20);
    for (let i = 0; i < 3; i++) { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = -5.6; q.z = -0.6 + i * 0.9; q.y = 0; q.speed = 0.001; q.t = 0; q.yaw = -Math.PI / 2; q.hp = q.maxHp = 1e6; }
    p.weapons = [{ id: 'rifle', mag: 30, reserve: 90, up: false }]; p.cur = 0; D.weapons.reset(); sim(40);
  });
  for (const yaw of [Math.PI / 2 + 0.1, Math.PI / 2 - 0.05, Math.PI / 2 - 0.2]) await page.evaluate((yaw) => { const p = D.player; p.yaw = yaw; p.pitch = -0.04; sim(4); for (let i = 0; i < 24; i++) { D.debug.input.fire = true; sim(1); } D.debug.input.fire = false; sim(10); }, yaw);
  console.log(await page.evaluate(() => 'hits ' + D.player.hits + ' shots ' + D.player.shots + '\n' + D.fx.wbList().join('\n')));
  await page.evaluate(() => { D.zombies.clear(); D.flashlight.visible = false; sim(30); }); await shot('wb-1');
  await page.evaluate(() => sim(150)); await shot('wb-2');
};
