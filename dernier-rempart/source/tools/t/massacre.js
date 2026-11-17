// Count audio nodes created when 20 zombies die at once (nuke) and during a shotgun volley into a crowd.
export default async (page) => {
  await page.click('#play'); await page.waitForTimeout(400);
  console.log(await page.evaluate(async () => {
    const D = __DR, p = D.player; D.game.between = 999; D.game.hurt = () => {}; D.game.hurtAmount = () => {}; D.debug.setFree(true);
    const AC = window.AudioContext, proto = AC.prototype, names = Object.getOwnPropertyNames(BaseAudioContext.prototype).filter((n) => n.startsWith('create'));
    let count = 0; for (const n of names) { const f = BaseAudioContext.prototype[n]; BaseAudioContext.prototype[n] = function (...a) { count++; return f.apply(this, a); }; }
    const crowd = () => { for (let i = 0; i < 20; i++) { const q = D.zombies.spawn(D.world.windows[0], 3); if (!q) break; q.state = 'chase'; q.x = -4 + (i % 5) * 0.9; q.z = -1 - Math.floor(i / 5) * 0.8; q.y = 0; q.speed = 0.001; q.t = 0; } };
    const out = [];
    crowd(); D.debug.simulate(1 / 60); count = 0;
    const T = D.debug.THREE; for (const z of D.zombies.list.slice()) D.zombies.damage(z, 1e6, Math.random() < 0.5, new T.Vector3(0, 0, -1), new T.Vector3(z.x, 1.2, z.z));
    out.push('20 kills at once -> nodes ' + count);
    D.zombies.clear(); crowd(); for (let i = 0; i < 5; i++) D.debug.simulate(1 / 60); count = 0;
    p.weapons = [{ id: 'shotgun', mag: 6, reserve: 30, up: true }]; p.cur = 0; D.weapons.reset(); p.x = -2.2; p.z = 2.5; p.yaw = 0; p.pitch = -0.05;
    for (let i = 0; i < 60; i++) { D.debug.input.firePressed = i % 15 === 0; D.debug.simulate(1 / 60); }
    out.push('shotgun volley 1 s -> nodes ' + count + ', kills ' + p.kills);
    D.zombies.clear(); crowd(); count = 0; p.weapons = [{ id: 'flamer', mag: 100, reserve: 9, up: false, inf: true }]; p.cur = 0; D.weapons.reset();
    for (let i = 0; i < 180; i++) { D.debug.input.fire = true; D.debug.simulate(1 / 60); }
    out.push('flamer 3 s into crowd -> nodes ' + count + ', kills ' + p.kills);
    return out.join('\n');
  }));
};
