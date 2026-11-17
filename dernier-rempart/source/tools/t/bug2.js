export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    const w = D.world.windows.find((w) => w.id === 4); for (let i = 0; i < 5; i++) D.world.removePlank(w);
    p.weapons = [{ id: 'orage', mag: 8, reserve: 40, up: false }]; p.cur = 0; D.weapons.reset();
    p.x = w.x + 0.25; p.z = w.z - 0.55; p.yaw = Math.PI - 0.5; p.pitch = -0.15; for (let i = 0; i < 60; i++) D.debug.simulate(1 / 60);
    window.info = JSON.stringify({ x: p.x, z: p.z, room: D.world.roomAt(p.x, p.z), prompt: document.getElementById('prompt').textContent }); });
  console.log(await page.evaluate(() => window.info));
  await shot('bug2');
};
