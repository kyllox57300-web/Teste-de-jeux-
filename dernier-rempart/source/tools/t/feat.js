export default async (page, shot) => {
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player, out = [], T = D.debug.THREE; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999;
    const step = (n = 1) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    const mk = (x, z) => { const q = D.zombies.spawn(D.world.windows[0], 4); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.speed = 0.001; q.t = 0; return q; };
    // cadence: count shots in 2 s with and without
    const rate = () => { p.weapons = [{ id: 'smg', mag: 999, reserve: 0, up: false }]; p.cur = 0; D.weapons.reset(); step(40); const s0 = p.shots; D.debug.input.fire = true; step(120); D.debug.input.fire = false; return p.shots - s0; };
    const r0 = rate(); p.perks.add('cadence'); const r1 = rate(); out.push(`cadence: ${r0} -> ${r1} shots in 2 s`);
    // mule: three weapons
    p.perks.add('mule'); p.weapons = [{ id: 'pistol', mag: 8, reserve: 8, up: false }]; p.cur = 0; D.weapons.give('smg'); D.weapons.give('rifle'); D.weapons.give('shotgun'); out.push('mule: ' + p.weapons.map(w => w.id).join('+'));
    // seconde chance
    p.perks.add('chance'); D.game.hurt = D.game.hurt; for (let i = 0; i < 5; i++) mk(p.x + 1 + i * 0.3, p.z + 1); const k0 = p.kills; D.game.hurtAmount(500); step(10);
    out.push(`chance: dead=${p.dead} hp=${Math.round(p.hp)} perkLeft=${p.perks.has('chance')} shockwave kills=${p.kills - k0}`); D.game.hurtAmount(500); out.push('second hit after chance used: dead=' + p.dead);
    return out.join('\n');
  }));
  console.log(await page.evaluate(() => {
    const D = __DR, p = D.player, out = []; D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {}; D.game.hurtAmount = () => {};
    const step = (n = 1) => { for (let i = 0; i < n; i++) D.debug.simulate(1 / 60); };
    const mk = (x, z) => { const q = D.zombies.spawn(D.world.windows[0], 4); q.state = 'chase'; q.x = x; q.z = z; q.y = 0; q.speed = 0.001; q.t = 0; return q; };
    // crossbow passes through a line of zombies and sticks in the wall; upgraded one explodes
    p.x = 0; p.z = 4; p.yaw = 0; p.pitch = 0; for (let i = 0; i < 4; i++) mk(0, 2.5 - i * 1.2);
    p.weapons = [{ id: 'crossbow', mag: 1, reserve: 10, up: false }]; p.cur = 0; D.weapons.reset(); step(40); const k0 = p.kills; D.debug.input.firePressed = true; step(2);
    const stuck = D.scene.children.filter(o => o.isGroup && o.visible && o.children.length === 4 && o.children[0].geometry && o.children[0].geometry.parameters && o.children[0].geometry.parameters.height === 0.36);
    out.push(`crossbow: kills ${p.kills - k0}, bolts stuck ${stuck.length} at z=${stuck[0] ? stuck[0].position.z.toFixed(2) : '-'}`);
    step(80); out.push('crossbow reloaded: mag ' + p.weapons[0].mag);
    D.zombies.clear(); for (let i = 0; i < 4; i++) mk(0.4 * i - 0.6, -5.4); p.weapons = [{ id: 'crossbow', mag: 1, reserve: 10, up: true }]; p.cur = 0; D.weapons.reset(); step(40); const k1 = p.kills; p.pitch = -0.02; D.debug.input.firePressed = true; step(60);
    out.push(`upgraded crossbow (explodes on the wall): kills ${p.kills - k1}`);
    // lever action: cycles between shots
    D.zombies.clear(); p.weapons = [{ id: 'lever', mag: 8, reserve: 8, up: false }]; p.cur = 0; D.weapons.reset(); step(40); const s0 = p.shots; D.debug.input.fire = true; for (let i = 0; i < 60; i++) { D.debug.input.firePressed = i % 4 === 0; step(1); } D.debug.input.fire = false;
    out.push('lever: shots in 1 s of clicking ' + (p.shots - s0) + ', lever angle now ' + D.weapons.vm.lever.info.lever.rotation.x.toFixed(2));
    // dismemberment: chip a zombie below half health a few times
    D.zombies.clear(); let severed = 0; for (let t = 0; t < 20; t++) { const q = mk(0, 1); q.kind === 'b' ? 0 : 0; q.hp = q.maxHp * 0.5; for (let k = 0; k < 6 && q.state !== 'dead'; k++) D.zombies.damage(q, 1, false, new D.debug.THREE.Vector3(0, 0, -1), new D.debug.THREE.Vector3(0, 1.3, 1)); if (q.bones.LeftForeArm.scale.x < 0.5 || q.bones.RightForeArm.scale.x < 0.5) severed++; D.zombies.clear(); }
    out.push('arms severed on ' + severed + '/20 wounded zombies');
    return out.join('\n');
  }));
};
