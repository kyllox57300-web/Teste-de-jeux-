import fs from 'fs';
export default async (page, shot, out) => {
  await page.mouse.click(900, 200); await page.evaluate(() => { window.__SND.initAudio(); }); await page.waitForTimeout(300);
  const list = [['crows'], ['howl'], ['toll'], ['bodyfall', 1], ['splat'], ['die', 'burn'], ['die', 'gurgle'], ['die', 'grunt']];
  for (const [n, a] of list) {
    const b64 = await page.evaluate(async ([n, a]) => {
      const S = window.__SND, st = S.debugStream(), rec = new MediaRecorder(st, { mimeType: 'audio/webm' }), chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data); rec.start(); await new Promise((r) => setTimeout(r, 120));
      if (n === 'crows' || n === 'howl') S.ambientDebug[n](3, 3); else if (n === 'toll') S.ambientDebug.toll(); else if (n === 'die') S.zombieDie(2, 2, a); else if (n === 'bodyfall') S.bodyfall(2, 2, a); else S[n](2, 2);
      await new Promise((r) => setTimeout(r, n === 'toll' ? 6000 : 2500)); rec.stop(); await new Promise((r) => (rec.onstop = r));
      const buf = await new Blob(chunks).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
    }, [n, a]);
    fs.writeFileSync(`${out}/snd-${n}${a ? '-' + a : ''}.webm`, Buffer.from(b64, 'base64'));
  }
  console.log('recorded', list.length);
};
