// Usage: node tools/shot.mjs <scriptfile.js> — runs a page script against the built game and saves screenshots.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const out = process.env.OUT || 'shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 720) }, deviceScaleFactor: 1 });
const logs = [];
await page.addInitScript((q) => { try { localStorage.setItem('dr-settings', JSON.stringify({ sens: 1, volume: 0.8, quality: q })); } catch (e) {} }, process.env.Q || 'low');
page.setDefaultTimeout(180000);
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 400)); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + (e.stack || e.message).slice(0, 900)));
await page.goto('file://' + process.cwd() + '/dist/DernierRempart-local.html');
await page.waitForFunction(() => window.__DR && window.__DR.state === 'menu', null, { timeout: 120000 }).catch(() => logs.push('TIMEOUT waiting for menu'));
const steps = (await import(process.cwd() + '/' + process.argv[2])).default;
try { await steps(page, (name) => page.screenshot({ path: `${out}/${name}.png`, timeout: 180000 }), out); } catch (e) { logs.push('STEP ERROR: ' + e.message.slice(0, 600)); }
console.log(logs.slice(0, 40).join('\n') || 'no console errors');
await browser.close();
