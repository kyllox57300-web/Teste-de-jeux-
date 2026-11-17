export default async (page) => {
  console.log(await page.evaluate(async () => {
    const D = __DR; D.debug.setFree(true); D.debug.startGame(); const out = []; for (let i = 0; i < 3; i++) { const t = performance.now(); D.debug.probe(); out.push('warm frame ' + (performance.now() - t).toFixed(0) + ' ms'); }
    for (const k of ['m', 'f', 'b']) { const t0 = performance.now(); const z = D.zombies.makeKind(k); const t1 = performance.now(); z.holder.visible = true; z.holder.position.set(0, 0, 2); D.debug.probe(); const t2 = performance.now(); D.debug.probe(); const t3 = performance.now(); z.holder.visible = false; out.push(`${k}: build ${(t1 - t0).toFixed(1)} ms, first frame shown ${(t2 - t1).toFixed(0)} ms, next frame ${(t3 - t2).toFixed(0)} ms`); }
    return out.join('\n');
  }));
};
