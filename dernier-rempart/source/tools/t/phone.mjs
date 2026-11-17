// Phone check: landscape touch screen, plays with simulated fingers (stick, look, fire, action).
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
const out = (process.env.OUT || 'shots');
const W = +(process.env.W || 844), H = +(process.env.H || 390);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); page.setDefaultTimeout(180000);
const logs = []; page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text().slice(0, 300)); }); page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
await page.goto('file://' + process.cwd() + '/dist/DernierRempart-local.html');
await page.waitForFunction(() => window.__DR && window.__DR.state === 'menu', null, { timeout: 150000 });
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
await shot('ph-menu');
const cdp = await ctx.newCDPSession(page);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
await page.evaluate(() => document.getElementById('test-mode').scrollIntoView());
const tm = await page.locator('#test-mode').boundingBox(); await page.touchscreen.tap(tm.x + tm.width / 2, tm.y + tm.height / 2);
await page.waitForTimeout(1500);
const st = await page.evaluate(() => ({ state: __DR.state, touch: __DR.touch, overlay: !document.getElementById('touch').hidden }));
console.log('after start', JSON.stringify(st));
await shot('ph-play');
// stick forward for 1.5 s while looking right with the other thumb
const p0 = await page.evaluate(() => ({ x: __DR.player.x, z: __DR.player.z, yaw: __DR.player.yaw }));
await touch('touchStart', [[120, 300, 1]]);
for (let i = 1; i <= 6; i++) { await touch('touchMove', [[120, 300 - i * 9, 1]]); await page.waitForTimeout(30); }
await touch('touchStart', [[120, 246, 1], [560, 200, 2]]);
for (let i = 1; i <= 10; i++) { await touch('touchMove', [[120, 246, 1], [560 + i * 8, 200, 2]]); await page.waitForTimeout(40); }
await page.waitForTimeout(800);
await shot('ph-move');
await touch('touchEnd', []);
const p1 = await page.evaluate(() => ({ x: __DR.player.x, z: __DR.player.z, yaw: __DR.player.yaw }));
console.log('moved', Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2), 'm, yaw', (p1.yaw - p0.yaw).toFixed(2));
// fire
const fb = await page.locator('#t-fire').boundingBox();
const shots0 = await page.evaluate(() => __DR.player.shots);
await touch('touchStart', [[fb.x + fb.width / 2, fb.y + fb.height / 2, 3]]); await page.waitForTimeout(400); await shot('ph-fire'); await touch('touchEnd', []);
await page.waitForTimeout(300);
console.log('shots', shots0, '->', await page.evaluate(() => __DR.player.shots));
// pause button
const pb = await page.locator('#t-pause').boundingBox(); await page.touchscreen.tap(pb.x + 20, pb.y + 20); await page.waitForTimeout(400);
console.log('pause ->', await page.evaluate(() => __DR.state)); await shot('ph-pause');
const rb = await page.locator('#resume').boundingBox(); await page.touchscreen.tap(rb.x + 20, rb.y + 10); await page.waitForTimeout(400);
console.log('resume ->', await page.evaluate(() => __DR.state));
// stand at a barricade: ACTION lights up and the prompt reads ACTION
await page.evaluate(() => { const it = __DR.world.interactables.find((q) => q.prompt() && !q.win); __DR.player.x = it.x; __DR.player.z = it.z; });
await page.waitForTimeout(1200);
console.log('action', await page.evaluate(() => ({ lit: document.getElementById('t-use').classList.contains('lit'), prompt: document.getElementById('prompt').textContent })));
await shot('ph-action');
await page.evaluate(() => document.fullscreenElement && document.exitFullscreen()); await page.waitForTimeout(500); await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800);
const t0 = await page.evaluate(() => __DR.time); await page.waitForTimeout(800);
console.log('portrait', await page.evaluate((t0) => ({ rotate: !document.getElementById('rotate').hidden, frozen: __DR.time === t0 }), t0));
await shot('ph-portrait');
await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(800);
console.log('landscape again', await page.evaluate(() => ({ rotate: !document.getElementById('rotate').hidden, state: __DR.state })));
console.log(logs.join('\n') || 'no errors');
await browser.close();
