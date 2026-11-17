export default async (page, shot) => {
  console.log(await page.evaluate(() => { const D = __DR, p = D.player; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    p.x = -2; p.z = 4.5; p.yaw = 0; p.pitch = -0.25;
    for (let i = 0; i < 4; i++) { let q; for (let t = 0; t < 20; t++) { q = D.zombies.spawn(D.world.windows[0], 4); if (q.kind !== 'b') break; D.zombies.list.pop(); D.zombies.alive--; } q.state = 'chase'; q.x = -3.5 + i; q.z = 0.2; q.y = 0; q.t = 0; q.speed = 1; }
    for (let i = 0; i < 10; i++) D.debug.simulate(1 / 60);
    D.zombies.list.forEach((z) => D.zombies.cripple(z));
    for (let i = 0; i < 70; i++) D.debug.simulate(1 / 60);
    return 'crawlers ' + D.zombies.list.filter(z => z.crawl).length + ' dist ' + D.zombies.list.map(z => Math.hypot(z.x - p.x, z.z - p.z).toFixed(1)).join(','); }));
  await shot('cr1');
  await page.evaluate(() => { D.player.pitch = -0.45; for (let i = 0; i < 60; i++) D.debug.simulate(1 / 60); }); await shot('cr2');
  console.log(await page.evaluate(() => 'hp ' + Math.round(D.player.hp)));
  // grenade-made crawlers in a normal fight
  console.log(await page.evaluate(() => { const p = D.player; D.zombies.clear(); p.hp = 100; D.game.hurt = () => {}; D.game.hurtAmount = () => {};
    for (let i = 0; i < 8; i++) { const q = D.zombies.spawn(D.world.windows[0], 12); q.state = 'chase'; q.x = -3 + (i % 4) * 0.8; q.z = 0 - Math.floor(i / 4) * 0.8; q.y = 0; q.t = 0; q.speed = 0.001; }
    for (let i = 0; i < 5; i++) D.debug.simulate(1 / 60); D.weapons.explode(new D.debug.THREE.Vector3(-1.8, 0.3, -0.4), false); for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60);
    return 'after grenade at round 12: dead ' + D.zombies.list.filter(z => z.state === 'dead').length + ', crawling ' + D.zombies.list.filter(z => z.crawl && z.state !== 'dead').length + ', standing ' + D.zombies.list.filter(z => !z.crawl && z.state !== 'dead').length; }));
};
