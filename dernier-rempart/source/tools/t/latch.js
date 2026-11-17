export default async (page, shot) => {
  console.log(await page.evaluate(() => { const D = __DR; D.debug.setFree(true); D.debug.startGame(); for (let i = 0; i < 60; i++) D.debug.simulate(1 / 60); const a = D.player.shots; D.debug.input.firePressed = true; D.debug.simulate(1 / 60); const b = D.player.shots; for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60); D.debug.input.firePressed = true; D.debug.simulate(1 / 60); return JSON.stringify({ before: a, afterLatch: b, afterSecond: D.player.shots, mag: D.player.weapons[0].mag }); }));
};
