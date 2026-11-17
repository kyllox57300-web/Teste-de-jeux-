export default async (page) => {
  console.log(await page.evaluate(() => { const D = __DR, p = D.player, W = D.world, out = []; D.debug.setFree(true);
    const step = (n = 1) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    const vig = W.interactables.find((i) => Math.abs(i.x + 6) < 0.1 && i.z > -5.6 && i.z < -5);
    const tryBuy = (label) => { p.x = vig.x; p.z = vig.z; p.yaw = Math.PI; step(2); const pts = p.points; D.debug.input.usePressed = true; step(2); out.push(`${label}: power=${W.power} bought=${p.perks.has('vigueur')} spent=${pts - p.points} prompt="${document.getElementById('prompt').textContent}"`); };
    for (const test of [true, false]) { D.debug.startGame(test); D.game.between = 999; p.points = 20000; tryBuy((test ? 'test' : 'normal') + ' mode, no power'); W.setPower(true); tryBuy('after power'); tryBuy('second try'); }
    return out.join('\n'); }));
};
