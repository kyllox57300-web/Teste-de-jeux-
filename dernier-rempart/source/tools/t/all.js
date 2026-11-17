export default async (page, shot) => {
  const r = await page.evaluate(() => {
    const D = __DR, p = D.player, out = []; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; const realHurt = D.game.hurt; D.game.hurt = () => {};
    const step = (n = 1) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    const prompt = () => document.getElementById('prompt').textContent;
    step(40); p.points = 200000; out.push('power at start: ' + D.world.power); D.world.setPower(true);
    // every interactable that is not a window: stand on it, read the prompt, use it
    for (const it of D.world.interactables) {
      if (it.win) continue;
      p.x = it.x; p.z = it.z; p.vx = p.vz = 0; const before = p.points; step(2); const pr = prompt(); D.debug.input.usePressed = true; step(2);
      out.push(`${pr.slice(0, 46)} | -${before - p.points} | room ${D.world.roomAt(p.x, p.z)} | ${p.weapons.map((w) => w.id + (w.up ? '*' : '')).join('+')}`);
    }
    out.push('unlocked ' + [...D.world.unlocked].sort().join('') + ' perks ' + [...p.perks].join(',') + ' hp ' + p.maxHp);
    // supply crate: wait, take
    const box = D.world.box; step(60 * 4); out.push('box state ' + box.state + ' pick ' + box.pickId); p.x = 3.6; p.z = -12.7; step(2); D.debug.input.usePressed = true; step(2); out.push('after take ' + p.weapons.map((w) => w.id).join('+'));
    // window repair
    const w0 = D.world.windows[0]; D.world.removePlank(w0); D.world.removePlank(w0); p.x = -7; p.z = 0; p.yaw = Math.PI / 2; step(2); out.push('repair prompt: ' + prompt()); D.debug.input.use = true; step(120); D.debug.input.use = false; out.push('planks ' + w0.count);
    // grenade
    const mk = (x, z) => { const q = D.zombies.spawn(D.world.windows[0], 3); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.speed = 0.001; q.t = 0; return q; };
    p.x = 0; p.z = 4; p.yaw = 0; p.pitch = 0; step(2); for (let i = 0; i < 5; i++) mk(-1 + i * 0.5, -3); const k0 = p.kills, g0 = p.grenades; D.weapons.throwGrenade(); step(60 * 4); out.push(`grenade: used ${g0 - p.grenades}, kills ${p.kills - k0}, alive ${D.zombies.alive}, hp ${Math.round(p.hp)}`);
    // launcher
    D.zombies.clear(); p.weapons = [{ id: 'launcher', mag: 1, reserve: 5, up: false }]; p.cur = 0; D.weapons.reset(); step(40); for (let i = 0; i < 5; i++) mk(-1 + i * 0.5, -4); const k1 = p.kills; D.debug.input.firePressed = true; step(1); step(90); out.push(`launcher: kills ${p.kills - k1}, mag ${p.weapons[0].mag}, reloading ${D.weapons.reloadT >= 0}`); step(200); out.push('launcher after reload mag ' + p.weapons[0].mag + ' res ' + p.weapons[0].reserve);
    // every weapon fires, reloads and switches without error
    D.zombies.clear();
    for (const id in D.debug.WEAPONS) { p.weapons = [{ id, mag: 2, reserve: 30, up: id === 'rifle' || id === 'orage' }, { id: 'pistol', mag: 8, reserve: 8, up: false }]; p.cur = 0; D.weapons.reset(); step(40); let s0 = p.shots; for (let i = 0; i < 400; i++) { D.debug.input.fire = i % 20 < 10; D.debug.input.ads = i > 200; step(1); } D.debug.input.fire = false; D.debug.input.ads = false; D.weapons.switchWeapon(); step(60); out.push(`${id}: shots ${p.shots - s0}, mag ${p.weapons[0].mag}, res ${p.weapons[0].reserve}, cur ${p.cur}`); }
    // brute + death
    D.game.hurt = realHurt; p.perks.delete('chance'); D.zombies.clear(); p.x = 0; p.z = 3; const b = mk(0.5, 2.2); b.speed = 1.5; let t = 0; while (!D.game.over && t++ < 60 * 30) step(1); out.push('death: over=' + D.game.over + ' after ' + (t / 60).toFixed(1) + 's');
    return out.join('\n');
  });
  console.log(r);
  await page.waitForFunction(() => __DR.state === 'over', null, { timeout: 120000 });
  await page.click('#again'); await page.waitForTimeout(400);
  console.log('restart', await page.evaluate(() => JSON.stringify({ state: __DR.state, round: __DR.game.round, doors: __DR.world.doors.filter((d) => d.open).length, w: __DR.player.weapons, g: __DR.player.grenades, perks: [...__DR.player.perks] })));
};
