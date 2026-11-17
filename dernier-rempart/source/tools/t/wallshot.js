export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    D.weapons.give('rifle'); for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60); p.x = -7.3; p.z = 2.5; p.yaw = Math.PI / 2; p.pitch = 0; for (let i = 0; i < 10; i++) D.debug.simulate(1 / 60); D.debug.freeze = true; });
  await page.evaluate(() => D.debug.probe()); await shot('w0');
  await page.evaluate(() => { D.debug.input.firePressed = true; D.debug.input.fire = true; D.debug.simulate(1 / 60); D.debug.probe(); }); await shot('w1');
  console.log(await page.evaluate(() => JSON.stringify({ light: D.scene.children.filter(o => o.isPointLight).map(l => l.intensity.toFixed(1)) })));
};
