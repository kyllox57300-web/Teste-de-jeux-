export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    p.weapons = [{ id: 'orage', mag: 8, reserve: 40, up: false }]; p.cur = 0; D.weapons.reset(); p.x = -2; p.z = 4; p.yaw = 0; p.pitch = -0.06; for (let i = 0; i < 40; i++) D.debug.simulate(1/60); });
  await shot('ar0');
  await page.evaluate(() => { const p = D.player; for (let i = 0; i < 8; i++) { const q = D.zombies.spawn(D.world.windows[0], 6); q.state = 'chase'; q.x = -4 + (i % 4) * 1.4; q.z = 0.5 - Math.floor(i / 4) * 1.6; q.y = 0; q.speed = 0.001; q.t = 0; }
    for (let i = 0; i < 10; i++) D.debug.simulate(1/60); D.debug.input.firePressed = true; D.debug.simulate(1/60); });
  await shot('ar1');
  await page.evaluate(() => { for (let i = 0; i < 14; i++) D.debug.simulate(1/60); }); await shot('ar2');
};
