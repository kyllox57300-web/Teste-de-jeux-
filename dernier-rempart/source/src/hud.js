import { G } from './ctx.js';
import { wstat } from './weapons.js';
import { PERKS } from './world.js';
import * as SND from './audio.js';

const $ = (id) => document.getElementById(id);
export function initHud() {
  const el = { hud: $('hud'), cross: $('cross'), hit: $('hit'), round: $('round-n'), pts: $('pts'), gains: $('gains'), mag: $('mag'), res: $('res'), wname: $('wname'), other: $('other'), prompt: $('prompt'), badge: $('badge'), hdir: $('hdir'), bcv: $('bloodfx'), gren: $('gren'), scope: $('scope'), msg: $('msg'), sub: $('msg-sub'), perks: $('perks'), power: $('power'), dmg: $('dmg'), flash: $('flash'), hp: $('hp-fill'), st: $('st-fill'), toast: $('toast') };
  let lastPrompt = '', msgT = 0, hitT = 0, shownPts = 0, toastT = 0, lastGap = -1;
  // blood that lands on the screen when you are hit, drying away over a few seconds
  const splats = [], bctx = el.bcv.getContext('2d'); let red = null;
  const tinted = () => { if (red) return red; red = document.createElement('canvas'); red.width = red.height = 256; const x = red.getContext('2d'); x.drawImage(G.img.splat, 0, 0, 256, 256); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#5c0503'; x.fillRect(0, 0, 256, 256); return red; };
  const arcs = Array.from(el.hdir.children).map((e) => ({ e, t: 0, x: 0, z: 0 })); let ai = 0;
  const H = {
    hurtFrom(x, z) { const a = arcs[ai++ % arcs.length]; a.x = x; a.z = z; a.t = 1.2; },
    bloodSplat(amount) {
      const c = el.bcv; if (c.width !== Math.round(innerWidth / 2)) { c.width = Math.round(innerWidth / 2); c.height = Math.round(innerHeight / 2); }
      const n = amount > 50 ? 4 : 2;
      for (let i = 0; i < n; i++) { const edge = Math.random() * 4 | 0, u = Math.random(); const x = edge === 0 ? u * c.width : edge === 1 ? c.width * (0.9 + Math.random() * 0.15) : edge === 2 ? u * c.width : c.width * (-0.05 + Math.random() * 0.15); const y = edge === 0 ? c.height * (-0.05 + Math.random() * 0.12) : edge === 2 ? c.height * (0.88 + Math.random() * 0.15) : u * c.height; splats.push({ x, y, s: c.height * (0.25 + Math.random() * 0.35), r: Math.random() * 6.28, life: 1 }); }
      while (splats.length > 14) splats.shift();
    },
    show(v) { el.hud.hidden = !v; },
    reset() { splats.length = 0; bctx.clearRect(0, 0, el.bcv.width, el.bcv.height); for (const a of arcs) a.t = 0; el.badge.hidden = !G.game.test; el.badge._s = ''; shownPts = 0; el.gains.innerHTML = ''; el.perks.innerHTML = ''; el.power.innerHTML = ''; el.msg.classList.remove('on'); H.prompt(null); H.points(0); H.weapon(); H.round(0); H.scope(false); el.dmg.style.opacity = 0; el.flash.style.opacity = 0; },
    weapon() { const p = G.player, w = p.weapons[p.cur]; if (!w) return; el.wname.textContent = wstat(w).name; el.wname.classList.toggle('up', !!w.up); el.other.textContent = p.weapons.map((o, i) => (i === p.cur ? '' : `${i + 1} · ${wstat(o).name}`)).filter(Boolean).join('   '); H.ammo(); },
    ammo() { const p = G.player, w = p.weapons[p.cur]; if (!w) return; el.mag.textContent = w.inf ? '∞' : w.mag; el.res.textContent = w.inf ? '∞' : w.reserve; el.mag.classList.toggle('low', w.mag <= Math.ceil(wstat(w).mag * 0.25)); el.gren.textContent = '●'.repeat(p.grenades) + '○'.repeat(Math.max(0, 4 - p.grenades)); },
    scope(on) { el.scope.hidden = !on; },
    points(gain) { el.pts.textContent = G.player.points; if (gain) { const s = document.createElement('span'); s.textContent = (gain > 0 ? '+' : '') + gain; s.className = gain > 0 ? 'gain' : 'loss'; s.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px'); el.gains.appendChild(s); setTimeout(() => s.remove(), 900); while (el.gains.children.length > 6) el.gains.firstChild.remove(); } },
    round(n, anim) { el.round.textContent = n || ''; if (anim) { el.round.classList.remove('pulse'); void el.round.offsetWidth; el.round.classList.add('pulse'); } },
    prompt(html) { html = html || ''; if (G.touch) html = html.replace(/<b>F<\/b>/g, '<b>ACTION</b>'); if (html === lastPrompt) return; lastPrompt = html; el.prompt.innerHTML = html; el.prompt.classList.toggle('on', !!html); },
    message(text, sub = '', dur = 3.2) { el.msg.firstElementChild.textContent = text; el.sub.textContent = sub; el.msg.classList.add('on'); msgT = dur; },
    toast(text) { el.toast.textContent = text; el.toast.classList.add('on'); toastT = 3.5; },
    hit(head) { el.hit.className = head ? 'on head' : 'on'; hitT = 0.12; SND.hitmark(head); },
    spread(s, ads) { const gap = Math.round(4 + s * 620); if (gap !== lastGap) { lastGap = gap; el.cross.style.setProperty('--gap', gap + 'px'); } el.cross.style.opacity = ads > 0.5 || G.player.sprinting || !el.scope.hidden ? 0 : 1; },
    perks() { el.perks.innerHTML = ''; for (const id of G.player.perks) { const P = PERKS[id], d = document.createElement('span'); d.textContent = P.icon; d.title = P.name; d.style.color = P.color; el.perks.appendChild(d); } },
    flash(a) { el.flash.style.transition = 'none'; el.flash.style.opacity = a; requestAnimationFrame(() => { el.flash.style.transition = 'opacity 1.4s'; el.flash.style.opacity = 0; }); },
    update(dt) {
      const p = G.player, g = G.game;
      for (const a of arcs) { if (a.t <= 0) { if (a.e.style.opacity !== '0') a.e.style.opacity = '0'; continue; } a.t -= dt;
        const dx = a.x - p.x, dz = a.z - p.z, fw = -Math.sin(p.yaw) * dx - Math.cos(p.yaw) * dz, rt = Math.cos(p.yaw) * dx - Math.sin(p.yaw) * dz;
        a.e.style.transform = `rotate(${Math.atan2(rt, fw)}rad)`; a.e.style.opacity = String(Math.min(1, a.t)); }
      if (splats.length) { const c = el.bcv; bctx.clearRect(0, 0, c.width, c.height); const img = tinted();
        for (let i = splats.length - 1; i >= 0; i--) { const s = splats[i]; s.life -= dt * 0.33; if (s.life <= 0) { splats.splice(i, 1); continue; } bctx.save(); bctx.globalAlpha = Math.min(0.85, s.life * 1.2); bctx.translate(s.x, s.y); bctx.rotate(s.r); bctx.drawImage(img, -s.s / 2, -s.s / 2, s.s, s.s); bctx.restore(); }
        if (!splats.length) bctx.clearRect(0, 0, c.width, c.height); }
      if (g.test) { const s = g.inSafe() ? 'Mode test · zone sûre : invincible' : 'Mode test · hors de la zone'; if (el.badge._s !== s) { el.badge._s = s; el.badge.textContent = s; el.badge.classList.toggle('out', !g.inSafe()); } }
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) el.msg.classList.remove('on'); }
      if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('on'); }
      if (hitT > 0) { hitT -= dt; if (hitT <= 0) el.hit.className = ''; }
      el.hp.style.transform = `scaleX(${Math.max(0, p.hp / p.maxHp)})`; el.st.style.transform = `scaleX(${p.stamina / p.maxStamina})`;
      el.dmg.style.opacity = Math.min(1, (1 - p.hp / p.maxHp) * 1.1 + p.hurtFlash);
      let s = '';
      if (g.power.insta > 0) s += `<span class="pw${g.power.insta < 5 ? ' end' : ''}">☠ Mort instantanée <b>${Math.ceil(g.power.insta)}</b></span>`;
      if (g.power.double > 0) s += `<span class="pw${g.power.double < 5 ? ' end' : ''}">×2 Points doublés <b>${Math.ceil(g.power.double)}</b></span>`;
      if (s !== el.power._s) { el.power.innerHTML = s; el.power._s = s; }
    },
  };
  G.hud = H;
  return H;
}
