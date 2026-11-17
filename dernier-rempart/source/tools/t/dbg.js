export default async (page, shot) => {
  const r = await page.evaluate(() => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; const S = D.weapons, p = D.player, out = [];
    D.weapons.give('rifle');
    for (let i = 0; i < 60 * 9; i++) { D.debug.input.fire = i % 6 < 3; D.debug.simulate(1 / 60); if (i % 30 === 0) out.push([i, p.weapons[p.cur].mag, +S.reloadT.toFixed(2), +S.cool.toFixed(2), +S.drawT.toFixed(2), S.switchT, S.meleeT]); }
    return JSON.stringify(out);
  });
  console.log(r);
};
