export default async (page, shot) => {
  console.log(await page.evaluate(() => { const D = __DR, p = D.player, W = D.world, out = []; window.D = D; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    const step = (n = 1) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    for (const d of W.doors) W.openDoor(d); p.points = 50000; out.push('power at start: ' + W.power);
    const vig = W.interactables.find((i) => Math.abs(i.x + 6) < 0.1 && i.z > -5.6 && i.z < -5); p.x = vig.x; p.z = vig.z; p.yaw = Math.PI; step(2);
    out.push('perk prompt without power: ' + document.getElementById('prompt').textContent); D.debug.input.usePressed = true; step(2); out.push('vigueur bought without power? ' + p.perks.has('vigueur'));
    const lamp = W.lamps[0]; out.push('lamp intensity before ' + lamp.l.intensity.toFixed(1));
    p.x = 24; p.z = -24.6; p.yaw = 0; step(2); out.push('generator prompt: ' + document.getElementById('prompt').textContent); D.debug.input.usePressed = true; step(2); step(70);
    out.push('power now: ' + W.power + ', lamp intensity ' + lamp.l.intensity.toFixed(1));
    p.x = vig.x; p.z = vig.z; p.yaw = Math.PI; step(2); D.debug.input.usePressed = true; step(2); out.push('vigueur after power: ' + p.perks.has('vigueur') + ' maxHp ' + p.maxHp);
    D.debug.startGame(); out.push('new game resets power: ' + W.power); D.debug.startGame(true); out.push('test mode power: ' + W.power); D.debug.startGame(false);
    p.x = 24; p.z = -23.0; p.yaw = 0; p.pitch = -0.1; for (const d of W.doors) W.openDoor(d); step(30);
    return out.join('\n'); }));
  await shot('pw1');
  await page.evaluate(() => { const p = D.player; D.debug.input.usePressed = true; D.debug.simulate(1 / 60); D.debug.simulate(1 / 60); for (let i = 0; i < 70; i++) D.debug.simulate(1 / 60); }); await shot('pw2');
  await page.evaluate(() => { const p = D.player; p.x = 12.5; p.z = -10; p.yaw = 0.9; p.pitch = 0.08; for (let i = 0; i < 20; i++) D.debug.simulate(1 / 60); }); await shot('pw3');
  await page.evaluate(() => { const p = D.player; p.x = 10.25; p.z = 1.45; p.yaw = Math.PI - 0.5; p.pitch = -0.1; const w = D.world.windows.find((w) => w.id === 4); for (let i = 0; i < 5; i++) D.world.removePlank(w); for (let i = 0; i < 40; i++) D.debug.simulate(1 / 60); }); await shot('pw4');
};
