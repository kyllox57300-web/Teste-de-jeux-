import fs from 'fs';
export default async (page, shot, out) => {
  await page.mouse.click(900, 200); await page.waitForTimeout(200);
  const b64 = await page.evaluate(async () => { const S = window.__SND; S.initAudio(); S.menuMusic(true); const st = S.debugStream(), rec = new MediaRecorder(st, { mimeType: 'audio/webm' }), ch = []; rec.ondataavailable = (e) => ch.push(e.data); rec.start(); await new Promise((r) => setTimeout(r, 12000)); rec.stop(); await new Promise((r) => (rec.onstop = r)); const u = new Uint8Array(await new Blob(ch).arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); });
  fs.writeFileSync(out + '/menu-theme.webm', Buffer.from(b64, 'base64'));
};
