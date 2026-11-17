export default async (page, shot) => {
  const ms = async () => (await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { if (++n >= 5) res((performance.now() - t0) / 5); else requestAnimationFrame(f); }; requestAnimationFrame(f); }))).toFixed(0);
  await page.evaluate(() => { __DR.debug.setFree(true); __DR.debug.startGame(); });
  await page.waitForTimeout(1500);
  console.log('ms/frame ingame', await ms());
  await shot('02-start');
  // look around: face the west window
  await page.evaluate(() => { __DR.player.yaw = Math.PI / 2; __DR.player.pitch = -0.05; });
  await page.waitForTimeout(9000);
  await shot('03-window');
  console.log(await page.evaluate(() => JSON.stringify({ round: __DR.game.round, alive: __DR.zombies.alive, n: __DR.zombies.list.length, states: __DR.zombies.list.map((z) => z.state + ':' + z.x.toFixed(1) + ',' + z.z.toFixed(1) + ',' + z.y.toFixed(1)), hp: __DR.player.hp, t: __DR.time.toFixed(1) })));
};
