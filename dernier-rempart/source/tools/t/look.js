import fs from 'fs';
export default async (page, shot, out) => {
  await page.evaluate(() => { __DR.debug.setFree(true); __DR.debug.startGame(); });
  const url = await page.evaluate(() => __DR.tex.zombie[0].image.toDataURL('image/jpeg', 0.8));
  fs.writeFileSync(out + '/zt.jpg', Buffer.from(url.split(',')[1], 'base64'));
  await page.evaluate(() => {
    const D = __DR, p = D.player; D.game.between = 999; p.x = -2; p.z = 2; p.yaw = 0; p.pitch = -0.05;
    const mk = (dx, dz, type) => { const z = D.zombies.spawn(D.world.windows[0], 1); z.state = 'chase'; z.x = p.x + dx; z.z = p.z + dz; z.y = 0; z.type = type; z.speed = 0.0001; z.t = 0; z.yaw = Math.atan2(-dx, -dz); return z; };
    mk(0.3, -2.4, 0); mk(-1.6, -3.6, 0); mk(1.9, -4.2, 2);
    D.game.hurt = () => {};
    for (let i = 0; i < 20; i++) D.debug.simulate(1 / 30);
  });
  await shot('10-look-flash');
  await page.evaluate(() => { __DR.flashlight.visible = false; for (let i = 0; i < 3; i++) __DR.debug.simulate(1 / 30); });
  await shot('11-look-noflash');
};
