export default async (page, shot) => {
  const st = () => page.evaluate(() => JSON.stringify({ state: __DR.state, lock: !!document.pointerLockElement, x: +__DR.player.x.toFixed(2), z: +__DR.player.z.toFixed(2), mag: __DR.player.weapons[0].mag, shots: __DR.player.shots, t: +__DR.time.toFixed(2) }));
  await shot('70-menu');
  await page.click('#play'); await page.waitForTimeout(500);
  await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(1500);
  console.log('quick click fired?', await st());
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await shot('71-pause');
  console.log('paused', await st());
};
