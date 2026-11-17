export default async (page) => {
  await page.click('#play'); await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    const S = window.__SND, errs = [], names = [];
    const call = (n, ...a) => { try { S[n](...a); names.push(n); } catch (e) { errs.push(n + ': ' + e.message); } };
    for (const w of ['pistol', 'magnum', 'smg', 'shotgun', 'rifle', 'lmg', 'launcher']) call('shot', w);
    call('dry'); for (const st of [0, 1, 2]) call('reload', st); call('swing'); call('thud'); call('flesh', 2, 2); call('tick'); call('hitmark', true); call('step', false); call('zstep', 3, 3, true); call('impact', 3, 3);
    call('buy'); call('deny'); call('pickup'); call('perk'); call('boxOpen'); call('door', 2, 2); call('plank', 2, 2, true); call('plank', 2, 2, false);
    call('groan', 3, 3, false); call('groan', 3, 3, true); call('zombieAttack', 2, 2); call('zombieDie', 2, 2); call('hurt'); call('heartbeat'); call('roundStart'); call('roundEnd'); call('gameOver'); call('thunder', 0.2); call('boom');
    call('flameLoop', true); call('flameLoop', false); call('tension', 0.6); call('ambientTick', 99);
    await new Promise((r) => setTimeout(r, 1500));
    return JSON.stringify({ ok: names.length, errs });
  });
  console.log(r);
};
