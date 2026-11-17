export default async (page, shot) => {
  const t = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { if (++n >= 5) res((performance.now() - t0) / 5); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('ms/frame', t.toFixed(0));
  await shot('01-menu');
  console.log(await page.evaluate(() => JSON.stringify({ state: __DR.state, calls: __DR.renderer.info.render.calls, tris: __DR.renderer.info.render.triangles, level: __DR.debug.level() })));
};
