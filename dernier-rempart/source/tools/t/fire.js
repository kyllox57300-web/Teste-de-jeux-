export default async (page, shot) => {
  await page.evaluate(() => { const D = __DR; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    const p = D.player; p.x = -4.5; p.z = -1.2; p.yaw = Math.PI / 2 + 0.55; p.pitch = -0.05; for (let i = 0; i < 40; i++) D.debug.simulate(1 / 60); });
  await shot('fp1');
  await page.evaluate(() => { const p = D.player; p.x = 0.5; p.z = 2.5; p.yaw = 0.15; p.pitch = 0.05; for (let i = 0; i < 20; i++) D.debug.simulate(1 / 60); });
  await shot('fp2');
};
