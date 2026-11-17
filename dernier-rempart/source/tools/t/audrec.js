import fs from 'fs';
export default async (page, shot, out) => {
  await page.mouse.click(900, 200); await page.evaluate(() => { window.__SND.initAudio(); }); await page.waitForTimeout(300);
  const list = [['shot', 'pistol'], ['shot', 'rifle'], ['shot', 'shotgun'], ['shot', 'magnum'], ['groan', 3, 3, false], ['groan', 3, 3, true], ['zombieAttack', 2, 2], ['zombieDie', 2, 2], ['step', false], ['door', 2, 2], ['plank', 2, 2, true], ['flesh', 2, 2], ['roundStart'], ['thunder', 0.05], ['boom']];
  for (const [n, ...a] of list) {
    const b64 = await page.evaluate(async ([n, a]) => {
      const S = window.__SND, st = S.debugStream(), rec = new MediaRecorder(st, { mimeType: 'audio/webm' }), chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data); rec.start();
      await new Promise((r) => setTimeout(r, 120)); S[n](...a); await new Promise((r) => setTimeout(r, n === 'roundStart' || n === 'thunder' ? 3500 : 1800));
      rec.stop(); await new Promise((r) => (rec.onstop = r));
      const buf = await new Blob(chunks).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
    }, [n, a]);
    fs.writeFileSync(`${out}/snd-${n}${a.length && typeof a[a.length - 1] === 'boolean' ? (a[a.length - 1] ? '-b' : '-a') : typeof a[0] === 'string' ? '-' + a[0] : ''}.webm`, Buffer.from(b64, 'base64'));
  }
  console.log('recorded', list.length);
};
