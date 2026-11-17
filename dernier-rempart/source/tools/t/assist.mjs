import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); page.setDefaultTimeout(180000);
page.on('pageerror', (e) => console.log('PAGEERROR ' + e.message));
await page.goto('file://' + process.cwd() + '/dist/DernierRempart-local.html');
await page.waitForFunction(() => window.__DR && window.__DR.state === 'menu', null, { timeout: 150000 });
const r = await page.evaluate(() => {
  const G = __DR, D = G.debug; D.startGame(false); D.freeze = true;
  // run the game until a zombie is walking inside
  let z = null; for (let i = 0; i < 4000 && !z; i++) { D.simulate(1 / 30); z = G.zombies.list.find((q) => q.state === 'chase'); }
  if (!z) return 'no zombie';
  G.scene.updateMatrixWorld(true);
  const p = G.player, sp = new D.THREE.Vector3().setFromMatrixPosition(z.bones.Spine2.matrixWorld), c = G.camera.getWorldPosition(new D.THREE.Vector3());
  const want = Math.atan2(-(sp.x - c.x), -(sp.z - c.z));
  p.yaw = want + 0.12; // look 7 degrees beside it
  const before = Math.abs(Math.atan2(Math.sin(p.yaw - want), Math.cos(p.yaw - want)));
  D.input.ads = true; for (let i = 0; i < 10; i++) D.simulate(1 / 60); D.input.ads = false;
  G.scene.updateMatrixWorld(true);
  const sp2 = new D.THREE.Vector3().setFromMatrixPosition(z.bones.Spine2.matrixWorld), c2 = G.camera.getWorldPosition(new D.THREE.Vector3());
  const want2 = Math.atan2(-(sp2.x - c2.x), -(sp2.z - c2.z));
  const after = Math.abs(Math.atan2(Math.sin(p.yaw - want2), Math.cos(p.yaw - want2)));
  return { dist: Math.hypot(sp.x - c.x, sp.z - c.z).toFixed(1), before: before.toFixed(3), after: after.toFixed(3) };
});
console.log(JSON.stringify(r));
await browser.close();
