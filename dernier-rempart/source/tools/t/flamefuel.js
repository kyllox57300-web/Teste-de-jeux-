export default async (page) => {
  await page.click('#play'); await page.waitForTimeout(300);
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player, out = []; D.debug.setFree(true); D.game.between = 999;
    out.push('test=' + D.game.test);
    // as the supply crate would hand it over
    D.weapons.give('flamer'); for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60);
    const w = p.weapons[p.cur]; out.push('given: ' + JSON.stringify(w));
    for (let s = 0; s < 40; s++) { for (let i = 0; i < 60; i++) { D.debug.input.fire = true; D.debug.simulate(1 / 60); } if (s % 4 === 3) out.push(`t=${s + 1}s mag ${w.mag} res ${w.reserve} reloading ${D.weapons.reloadT >= 0}`); }
    D.debug.input.fire = false;
    return out.join('\n');
  }));
};
