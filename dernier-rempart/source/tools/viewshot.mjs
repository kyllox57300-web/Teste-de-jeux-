import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
const [url, out, w = '1200', h = '600'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } }); p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'log') console.log('console', m.text().slice(0, 300)); });
await p.goto(url); await p.waitForFunction(() => window.done, null, { timeout: 250000 }); console.log((await p.evaluate(() => window.info || [])).join('\n'));
await p.screenshot({ path: out }); await b.close();
