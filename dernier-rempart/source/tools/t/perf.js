export default async (page, shot) => {
  const r = await page.evaluate(async () => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); D.game.between = 999; D.game.hurt = () => {};
    for (let i = 0; i < 22; i++) { const q = D.zombies.spawn(D.world.windows[0], 5); q.state = 'chase'; q.x = -6 + (i % 6) * 1.5; q.z = -4 + Math.floor(i / 6) * 1.4; q.y = 0; q.t = 0; }
    const t0 = performance.now(); for (let i = 0; i < 300; i++) D.debug.simulate(1 / 60); const sim = (performance.now() - t0) / 300;
    const tz = performance.now(); for (let i = 0; i < 300; i++) D.zombies.update(1 / 60); const zo = (performance.now() - tz) / 300;
    const fr = await new Promise((res) => { let n = 0; const t1 = performance.now(); const f = () => { if (++n >= 6) res((performance.now() - t1) / 6); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
    return JSON.stringify({ simMs: +sim.toFixed(2), zombiesMs: +zo.toFixed(2), frameMs: +fr.toFixed(0), n: D.zombies.list.length });
  });
  console.log(r);
};
