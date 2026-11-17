export default async (page) => {
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player, out = []; D.debug.setFree(true); D.debug.startGame(); D.game.hurt = () => {}; D.game.hurtAmount = () => {};
    out.push('pool at start: ' + JSON.stringify(Object.fromEntries(Object.entries(D.zombies.pools).map(([k, v]) => [k, v.length]))));
    // time each simulation step through a busy stretch (round 8, many spawns, shooting) and report the worst steps
    D.game.round = 7; D.game.between = 0.01; const times = []; p.weapons = [{ id: 'lmg', mag: 999, reserve: 0, up: false }]; p.cur = 0; D.weapons.reset();
    for (let i = 0; i < 60 * 40; i++) { D.debug.input.fire = i % 120 < 50; const t0 = performance.now(); D.debug.simulate(1 / 60); times.push([performance.now() - t0, i, D.zombies.list.length]); }
    times.sort((a, b) => b[0] - a[0]);
    out.push('worst steps (ms, frame, zombies): ' + times.slice(0, 8).map((t) => t[0].toFixed(1) + '@' + t[1] + '/' + t[2]).join('  '));
    out.push('median ' + times[times.length >> 1][0].toFixed(2) + ' ms; pool now ' + JSON.stringify(Object.fromEntries(Object.entries(D.zombies.pools).map(([k, v]) => [k, v.length]))) + ' alive ' + D.zombies.list.length);
    const t1 = performance.now(); for (let i = 0; i < 5; i++) D.zombies.pools.m.push(D.zombies.makeKind ? D.zombies.makeKind('m') : null); out.push('make() x5: ' + (performance.now() - t1).toFixed(1) + ' ms');
    return out.join('\n');
  }));
};
