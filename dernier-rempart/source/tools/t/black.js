export default async (page, shot) => {
  const r = await page.evaluate(() => {
    const D = __DR, p = D.player, out = []; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {}; D.game.hurtAmount = () => {};
    const run = (label, setup, frames, each) => { setup(); let worst = 999, blackFrames = 0, samples = []; for (let f = 0; f < frames; f++) { each && each(f); D.debug.simulate(1 / 60); const pr = D.debug.probe(); samples.push(Math.round(pr.mean)); worst = Math.min(worst, pr.mean); if (pr.black > 120) blackFrames++; } out.push(`${label}: blackFrames ${blackFrames}/${frames} worstMean ${worst.toFixed(1)} means ${samples.join(',')}`); };
    run('idle', () => { p.x = 0; p.z = 3; p.yaw = 0; p.pitch = 0; }, 8);
    run('rifle into wall 0.4m', () => { D.weapons.give('rifle'); for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60); p.x = -7.3; p.z = 2.5; p.yaw = Math.PI / 2; p.pitch = 0; }, 16, (f) => { D.debug.input.fire = true; p.weapons[p.cur].mag = 30; });
    D.debug.input.fire = false;
    run('shotgun into wall', () => { D.weapons.give('shotgun'); for (let i = 0; i < 30; i++) D.debug.simulate(1 / 60); p.x = -7.4; p.z = -1.5; p.yaw = Math.PI / 2; p.pitch = -0.2; }, 16, (f) => { D.debug.input.firePressed = f % 4 === 0; p.weapons[p.cur].mag = 6; });
    run('grenade against wall', () => { p.x = -5.5; p.z = 2.5; p.yaw = Math.PI / 2; p.pitch = 0; p.grenades = 4; D.weapons.throwGrenade(); }, 40);
    run('launcher at wall', () => { p.weapons = [{ id: 'launcher', mag: 1, reserve: 9, up: false }]; p.cur = 0; D.weapons.reset(); for (let i = 0; i < 40; i++) D.debug.simulate(1 / 60); p.x = -4; p.z = 2.5; p.yaw = Math.PI / 2; p.pitch = 0; D.debug.input.firePressed = true; }, 24);
    run('flamer at wall', () => { p.weapons = [{ id: 'flamer', mag: 100, reserve: 9, up: false, inf: true }]; p.cur = 0; D.weapons.reset(); for (let i = 0; i < 40; i++) D.debug.simulate(1 / 60); p.x = -7.2; p.z = 2.5; p.yaw = Math.PI / 2; }, 20, () => { D.debug.input.fire = true; });
    D.debug.input.fire = false;
    run('lightning', () => { p.x = 0; p.z = 3; p.yaw = 0.5; D.atmos.nextBolt = 0; }, 20);
    out.push('context lost: ' + (D.contextLost || 0));
    return out.join('\n');
  });
  console.log(r);
};
