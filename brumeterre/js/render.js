// Brumeterre — rendu du combat (Canvas 2D) et effets visuels
(function (B) {
  'use strict';
  const G = B.G, TAU = Math.PI * 2;
  const ELC = { fire: '#ff7a2f', ice: '#7fd8ff', bolt: '#ffe14d', poison: '#8ee04a', light: '#fff1b0', shadow: '#c9a0ff', nature: '#7ae07a', arcane: '#ff7ad9' };
  const LOOKGLOW = { shard: '#ffe9a0', sun: '#ffb43c', arrow: '#d8f0a0', dagger: '#c9a0ff', fireball: '#ff7a2f', ice: '#7fd8ff', lance: '#7fd8ff', moon: '#ff7ad9', star: '#a77bff', spore: '#8ee04a', sword: '#fff1b0', axe: '#ffd0a0', tornado: '#c8b0ff', soul: '#5ad0c0', orb: '#fff1b0', sunorb: '#ffb43c', wisp: '#9ae8ff', soulbig: '#c8b0ff', wolf: '#9be37a' };
  const LIGHTLOOK = { shard: 1, sun: 1, fireball: 1, orb: 1, sunorb: 1, sword: 1, wisp: 1, soul: 1, soulbig: 1, moon: 1, spore: 0.5 };

  class Render {
    constructor(canvas) {
      this.cv = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
      this.fog = G.canvas(64, 64); this.fx = this.fog.getContext('2d');
      this.parts = []; this.nums = []; this.fxs = []; this.lights = [];
      this.shakeA = 0; this.flashA = 0; this.flashC = '#fff';
      this.cx = 500; this.cy = 700; this.t = 0;
      this.q = 2; // qualité 0..2
      this.showNums = true;
      this.joy = null;
      this.trails = new Map();
      this.resize();
    }
    setQuality(q) { this.q = q; this.resize(); }
    resize() {
      const cw = this.cv.clientWidth || 400, ch = this.cv.clientHeight || 700;
      const dprMax = [1, 1.5, 2][this.q];
      this.dpr = Math.min(typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1, dprMax);
      this.cv.width = Math.round(cw * this.dpr); this.cv.height = Math.round(ch * this.dpr);
      this.cw = cw; this.ch = ch;
      this.s = Math.min(cw / 390, ch / 640);
      this.VW = cw / this.s; this.VH = ch / this.s;
      const fd = this.q === 0 ? 6 : 4;
      this.fog.width = Math.ceil(cw / fd); this.fog.height = Math.ceil(ch / fd); this.fd = fd;
    }
    setCombat(c) {
      this.c = c;
      this.parts.length = 0; this.nums.length = 0; this.fxs.length = 0; this.trails.clear();
      this.setBiome(c.biome);
      this.cx = c.P.x; this.cy = c.P.y;
    }
    setBiome(bi) {
      const c = this.c; this.bi = bi;
      const pal = this.pal = B.BIOMES[bi].pal;
      this.groundPat = this.ctx.createPattern(G.ground(bi).c, 'repeat');
      // décors
      const r = B.rng(1000 + bi * 31 + (c.row || 0) * 7);
      const D = B.BIOMES[bi].pal.deco;
      this.deco = [];
      const tall = D.filter(t => G.DECO[t].tall), small = D.filter(t => !G.DECO[t].tall);
      const area = c.W * c.H;
      for (let i = 0; i < area / 7000; i++) {
        const flatL = small.filter(t => G.DECO[t].flat), solid = small.filter(t => !G.DECO[t].flat);
        const t = (r() < 0.62 && flatL.length) || !solid.length ? r.pick(flatL) : r.pick(solid), x = 40 + r() * (c.W - 80), y = 40 + r() * (c.H - 80);
        this.deco.push({ t: t, v: r.int(0, 3), x: x, y: y, flat: !!G.DECO[t].flat });
      }
      for (let i = 0; i < 6 && tall.length; i++) { this.deco.push({ t: r.pick(tall), v: r.int(0, 3), x: 120 + r() * (c.W - 240), y: 120 + r() * (c.H - 240), flat: false }); }
      // bordure
      const bt = tall.length ? tall : small;
      for (let x = -40; x < c.W + 60; x += 52 + r() * 25) { this.deco.push({ t: r.pick(bt), v: r.int(0, 3), x: x, y: -20 - r() * 40, flat: false, border: 1 }); this.deco.push({ t: r.pick(bt), v: r.int(0, 3), x: x + 20, y: c.H + 30 + r() * 40, flat: false, border: 1 }); }
      for (let y = -40; y < c.H + 60; y += 50 + r() * 25) { this.deco.push({ t: r.pick(bt), v: r.int(0, 3), x: -25 - r() * 40, y: y, flat: false, border: 1 }); this.deco.push({ t: r.pick(bt), v: r.int(0, 3), x: c.W + 25 + r() * 40, y: y + 20, flat: false, border: 1 }); }
      for (const d of this.deco) { d.spr = G.deco(d.t, d.v, pal); d.glow = G.DECO[d.t].glow; }
      this.fogCol = 'rgb(' + pal.fog.join(',') + ')';
      this.amb = B.BIOMES[bi].amb;
    }

    // ───── Interface d'effets (appelée par le moteur) ─────
    part(x, y, vx, vy, life, size, col, add, g, type) {
      const max = [180, 400, 700][this.q];
      if (this.parts.length >= max) this.parts.shift();
      this.parts.push({ x: x, y: y, vx: vx, vy: vy, life: life, max: life, size: size, col: col, add: add, g: g || 0, type: type || 0 });
    }
    burst(x, y, n, col, spd, size, life, add) {
      n = Math.ceil(n * [0.4, 0.75, 1][this.q]);
      for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = spd * (0.3 + Math.random() * 0.7); this.part(x, y, Math.cos(a) * s, Math.sin(a) * s, life * (0.6 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.6), col, add); }
    }
    num(x, y, v, col, size) {
      if (!this.showNums) return;
      if (this.nums.length > 50) this.nums.shift();
      this.nums.push({ x: x + (Math.random() - 0.5) * 12, y: y, vy: -55, life: 0.75, txt: v, col: col, size: size || 13 });
    }
    hit(e, d, crit, el) {
      if (d >= 1 || crit) this.num(e.x, e.y - e.r - 4, Math.round(d), crit ? '#ffd23a' : (el ? ELC[el] || '#fff' : '#fff'), crit ? 18 : 12 + Math.min(4, d / 60));
      if (Math.random() < 0.5) this.burst(e.x, e.y, 2, el ? ELC[el] || '#fff' : '#fff', 90, 3, 0.25, true);
      if (crit) B.Audio && B.Audio.sfx('crit', 0.5);
      else B.Audio && B.Audio.sfx('hit', 0.35);
    }
    death(e, silent) {
      const c = e.d.L.c;
      this.burst(e.x, e.y, e.boss ? 60 : e.elite ? 26 : 9, c[0], e.boss ? 300 : 140, e.boss ? 7 : 4, 0.6, false);
      this.burst(e.x, e.y, e.boss ? 30 : e.elite ? 8 : 2, this.pal ? this.pal.acc : '#fff', 110, 2.5, 0.4, true);
      this.fxs.push({ k: 'ring', x: e.x, y: e.y, r: e.r * 0.6, r2: e.r * 2.2, life: 0.3, max: 0.3, col: c[2] || '#fff' });
      this.lights.push({ x: e.x, y: e.y, r: e.r * 3, life: 0.3, max: 0.3 });
      if (!silent) { B.Audio && B.Audio.sfx(e.boss ? 'bossdie' : e.elite ? 'elitedie' : 'die', e.elite ? 0.8 : 0.4); if (e.elite) this.shake(6); }
    }
    boom(x, y, r, el) {
      const col = el === 'enemy' ? '#ff5a3c' : el === 'quake' ? '#e0b080' : ELC[el] || '#ffb43c';
      this.fxs.push({ k: 'boom', x: x, y: y, r: r, life: 0.35, max: 0.35, col: col });
      this.burst(x, y, Math.min(30, r / 3), col, r * 3, 4, 0.5, true);
      this.lights.push({ x: x, y: y, r: r * 2.2, life: 0.4, max: 0.4 });
      if (r > 80) this.shake(r / 25);
      B.Audio && B.Audio.sfx(el === 'ice' ? 'freeze' : 'boom', Math.min(1, r / 120));
    }
    shake(a) { if (B.settings && !B.settings.shake) return; this.shakeA = Math.max(this.shakeA, a); }
    flash(col, a) { this.flashC = col; this.flashA = Math.max(this.flashA, a); }
    sfx(id, v) { B.Audio && B.Audio.sfx(id, v); }
    text(x, y, s, col) { this.nums.push({ x: x, y: y, vy: -35, life: 1.4, txt: s, col: col, size: 15, bold: 1 }); }
    bolt(pts, col) { this.fxs.push({ k: 'bolt', pts: pts, life: 0.18, max: 0.18, col: col, seed: Math.random() * 99 }); for (const p of pts) this.lights.push({ x: p[0], y: p[1], r: 80, life: 0.18, max: 0.18 }); }
    cone(x, y, a, w, len, el) { this.fxs.push({ k: 'cone', x: x, y: y, a: a, w: w, len: len, life: 0.35, max: 0.35, col: ELC[el] || '#ff7a2f' }); this.lights.push({ x: x + Math.cos(a) * len / 2, y: y + Math.sin(a) * len / 2, r: len, life: 0.35, max: 0.35 }); }
    peck(x, y, x2, y2) { this.fxs.push({ k: 'line', x: x, y: y, x2: x2, y2: y2, life: 0.12, max: 0.12, col: '#c9a0ff' }); }
    puff(x, y, col) { this.burst(x, y, 14, col, 110, 6, 0.6, false); }
    ring(x, y, r, col) { this.fxs.push({ k: 'ring', x: x, y: y, r: r * 0.2, r2: r, life: 0.5, max: 0.5, col: col }); }
    swing(x, y, a, arc, r, look) { this.fxs.push({ k: 'swing', x: x, y: y, a: a, arc: arc, r: r, life: 0.22, max: 0.22, col: look === 'vine' ? '#7ae07a' : '#ffcf8a' }); }
    beam(x, y, a, len, w, look) { this.fxs.push({ k: 'beam', x: x, y: y, a: a, len: len, w: w, life: 0.25, max: 0.25, col: look === 'prism' ? null : '#ff7ad9' }); this.lights.push({ x: x + Math.cos(a) * len / 2, y: y + Math.sin(a) * len / 2, r: len * 0.7, life: 0.25, max: 0.25 }); }
    nova(x, y, r, look) { this.fxs.push({ k: 'ring', x: x, y: y, r: 10, r2: r, life: 0.4, max: 0.4, col: look === 'bell' ? '#ff9ae0' : '#fff1b0', w: 8 }); this.lights.push({ x: x, y: y, r: r * 1.5, life: 0.4, max: 0.4 }); }
    splash(z) { this.burst(z.x, z.y, 10, z.look === 'poison' ? '#8ee04a' : '#ff9a4a', 100, 4, 0.5, true); B.Audio && B.Audio.sfx('splash', 0.4); }
    strikeStart(s) { }
    strikeHit(s) {
      if (s.look === 'thunder') { this.fxs.push({ k: 'thunder', x: s.x, y: s.y, life: 0.25, max: 0.25, seed: Math.random() * 99 }); this.lights.push({ x: s.x, y: s.y, r: 200, life: 0.25, max: 0.25 }); this.burst(s.x, s.y, 10, '#ffe14d', 200, 3, 0.3, true); B.Audio && B.Audio.sfx('thunder', 0.6); }
      else if (s.look === 'arrowrain') { this.burst(s.x, s.y, 4, '#d8c090', 80, 3, 0.3, false); B.Audio && B.Audio.sfx('hit', 0.2); }
      else this.boom(s.x, s.y, s.r, s.el);
    }
    minHit(m) { this.burst(m.x, m.y, 3, LOOKGLOW[m.look] || '#fff', 80, 3, 0.25, true); }
    teleHit(T) {
      if (T.k === 'circle') {
        if (T.roar) { this.ring(T.x, T.y, T.r, '#bfe8ff'); return; }
        this.fxs.push({ k: 'boom', x: T.x, y: T.y, r: T.r, life: 0.3, max: 0.3, col: T.spike === 3 ? '#bfe8ff' : T.spike === 0 ? '#8a6a3a' : '#ff6a4a' });
        if (T.spike !== undefined) this.fxs.push({ k: 'spikes', x: T.x, y: T.y, r: T.r, life: 0.6, max: 0.6, b: T.spike });
        this.burst(T.x, T.y, 12, '#c8a080', T.r * 2.5, 4, 0.4, false);
        if (T.shock) { this.shake(7); this.ring(T.x, T.y, T.r * 1.4, '#fff'); }
        B.Audio && B.Audio.sfx('slam', 0.6);
      } else if (T.k === 'line') { this.fxs.push({ k: 'beam', x: T.x, y: T.y, a: T.a, len: T.len, w: T.w / 2, life: 0.3, max: 0.3, col: '#ff6a4a' }); B.Audio && B.Audio.sfx('slam', 0.4); }
      else if (T.k === 'cone') { this.cone(T.x, T.y, T.a, T.w, T.len, T.slow ? 'ice' : 'fire'); B.Audio && B.Audio.sfx('breath', 0.7); }
    }
    bossIntro(e) { this.bossBanner = { n: B.tx(e.d, 'n'), t: 2.6 }; }
    bossCast(e, t) { this.burst(e.x, e.y - e.r, 8, '#ff5a3c', 90, 4, 0.4, true); }
    playerHit(d) { this.shake(4 + Math.min(8, d / 6)); this.hurtA = 0.6; B.Audio && B.Audio.sfx('hurt', 0.8); B.vibrate && B.vibrate(30); }
    special(id, P) {
      this.flash('#fff3c0', 0.35); this.shake(8); B.vibrate && B.vibrate(60);
      this.fxs.push({ k: 'ring', x: P.x, y: P.y, r: 20, r2: 240, life: 0.5, max: 0.5, col: '#ffe9a0', w: 12 });
      B.Audio && B.Audio.sfx('special', 1);
    }
    clear() { this.flash('#fff8e0', 0.25); B.Audio && B.Audio.sfx('clear', 0.8); }
    biomeChange(bi) { this.setBiome(bi); this.flash('#000', 0.6); this.bossBanner = { n: B.tx(B.BIOMES[bi], 'n'), t: 2.5 }; }

    // ───── Mise à jour visuelle ─────
    update(dt) {
      this.t += dt;
      const c = this.c;
      for (const p of this.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy = p.vy * 0.94 + p.g * dt; }
      this.parts = this.parts.filter(p => p.life > 0);
      for (const n of this.nums) { n.life -= dt; n.y += n.vy * dt; n.vy *= 0.92; }
      this.nums = this.nums.filter(n => n.life > 0);
      for (const f of this.fxs) f.life -= dt;
      this.fxs = this.fxs.filter(f => f.life > 0);
      for (const l of this.lights) l.life -= dt;
      this.lights = this.lights.filter(l => l.life > 0);
      this.shakeA *= Math.pow(0.003, dt); if (this.shakeA < 0.2) this.shakeA = 0;
      this.flashA = Math.max(0, this.flashA - dt * 2);
      if (this.hurtA > 0) this.hurtA -= dt;
      if (this.bossBanner) { this.bossBanner.t -= dt; if (this.bossBanner.t <= 0) this.bossBanner = null; }
      if (!c) return;
      // caméra
      const P = c.P;
      const k = 1 - Math.pow(0.0005, dt);
      this.cx += (P.x + c.mx * 30 - this.cx) * k; this.cy += (P.y + c.my * 30 - this.cy) * k;
      const mX = Math.max(0, (c.W - this.VW) / 2 + 60), mY = Math.max(0, (c.H - this.VH) / 2 + 60);
      this.cx = B.clamp(this.cx, c.W / 2 - mX, c.W / 2 + mX); this.cy = B.clamp(this.cy, c.H / 2 - mY, c.H / 2 + mY);
      // particules d'ambiance et d'états
      const q = [0.3, 0.7, 1][this.q];
      if (Math.random() < 0.28 * q) this.ambient();
      for (const e of c.en) {
        if (e.burnT > 0 && Math.random() < 0.15 * q) this.part(e.x + (Math.random() - 0.5) * e.r, e.y - e.r * 0.3, 0, -40, 0.5, 4, '#ff8a3a', true, -20);
        if (e.pois > 0 && Math.random() < 0.08 * q) this.part(e.x + (Math.random() - 0.5) * e.r, e.y, 0, -25, 0.6, 3, '#8ee04a', true);
        if (e.st === 'under' && Math.random() < 0.3 * q) this.part(e.x + (Math.random() - 0.5) * 14, e.y + 4, (Math.random() - 0.5) * 40, -30, 0.4, 3, '#6a5030', false, 120);
        if (e.d.L.a === 'wyrm') {
          let tr = this.trails.get(e.uid); if (!tr) { tr = []; this.trails.set(e.uid, tr); }
          const last = tr[0];
          if (!last || B.dist2(last[0], last[1], e.x, e.y) > 36) { tr.unshift([e.x, e.y]); if (tr.length > 14) tr.pop(); }
        }
      }
      if (c.P.dashT > 0) this.part(P.x, P.y, 0, 0, 0.3, 10, '#a77bff', true);
    }
    ambient() {
      const x = this.cx + (Math.random() - 0.5) * this.VW, y = this.cy + (Math.random() - 0.5) * this.VH;
      switch (this.amb) {
        case 'firefly': this.part(x, y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 3, 2, '#d8ff7a', true, 0, 1); break;
        case 'bubble': this.part(x, y, 0, -12, 2, 4, '#b07aff', true, 0, 1); break;
        case 'dust': this.part(x, y, 8, 4, 3, 2.5, '#9ab8ff', true, 0, 1); break;
        case 'snow': this.part(x, this.cy - this.VH / 2, 20 + Math.random() * 20, 60, 6, 2.5, '#ffffff', false, 0, 2); break;
        case 'ember': this.part(x, this.cy + this.VH / 2, (Math.random() - 0.5) * 20, -60, 5, 3, '#ff6a3a', true, 0, 1); break;
      }
    }

    // ───── Dessin ─────
    draw() {
      const ctx = this.ctx, c = this.c;
      if (!c) return;
      const s = this.s * this.dpr;
      const shx = (Math.random() - 0.5) * this.shakeA, shy = (Math.random() - 0.5) * this.shakeA;
      const vx = this.cx - this.VW / 2 + shx, vy = this.cy - this.VH / 2 + shy;
      this.vx = vx; this.vy = vy;
      const inView = (x, y, m) => x > vx - m && x < vx + this.VW + m && y > vy - m && y < vy + this.VH + m;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = G.shade(this.pal.g3, -0.45); ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      ctx.setTransform(s, 0, 0, s, -vx * s, -vy * s);
      // sol
      ctx.fillStyle = this.groundPat; ctx.fillRect(Math.max(-80, vx), Math.max(-80, vy), Math.min(this.VW, c.W + 80 - vx) + 2, Math.min(this.VH, c.H + 80 - vy) + 2);
      // bord sombre
      const gb = ctx.createLinearGradient(0, 0, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-80, -80, c.W + 160, 70); ctx.fillRect(-80, c.H + 10, c.W + 160, 70); ctx.fillRect(-80, -10, 70, c.H + 20); ctx.fillRect(c.W + 10, -10, 70, c.H + 20);
      // décors plats
      for (const d of this.deco) if (d.flat && inView(d.x, d.y, 60)) ctx.drawImage(d.spr.c, d.x - d.spr.w / 2, d.y - d.spr.h / 2, d.spr.w, d.spr.h);
      // zones au sol
      this.drawZones(ctx);
      // survivant
      if (c.survivor) this.drawSurvivor(ctx, c.survivor);
      // pièges
      for (const m of c.mines) { const sp = G.proj('shard'); ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, TAU); ctx.fill(); ctx.fillStyle = m.arm > 0 ? '#886' : (Math.sin(this.t * 10) > 0 ? '#ff5a2a' : '#ffcf4a'); ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, TAU); ctx.fill(); }
      // ramassables
      for (const p of c.picks) {
        if (!inView(p.x, p.y, 20)) continue;
        const sp = G.pick(p.type, p.v), bob = Math.sin(this.t * 4 + p.x) * 2;
        ctx.drawImage(sp.c, p.x - 13, p.y - 13 + bob, 26, 26);
      }
      // entités triées par y
      const L = this.list || (this.list = []); L.length = 0;
      for (const d of this.deco) if (!d.flat && inView(d.x, d.y, 120)) L.push(d);
      for (const e of c.en) if (inView(e.x, e.y, 80)) L.push(e);
      L.push(c.P);
      for (const m of c.mins) L.push(m);
      if (c.comp) L.push(c.comp);
      L.sort((a, b) => a.y - b.y);
      ctx.globalAlpha = 1;
      // ombres
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      for (const o of L) { if (o.spr || o.st === 'under') continue; const r = o === c.P ? 11 : (o.r || 8) * (o.d && o.d.L && o.d.L.a === 'wisp' ? 0.6 : 0.9); ctx.beginPath(); ctx.ellipse(o.x, o.y + r * 0.75, r * (1 - Math.min(0.5, (o.z || 0) / 200)), r * 0.38, 0, 0, TAU); ctx.fill(); }
      for (const o of L) {
        if (o.spr) { ctx.drawImage(o.spr.c, o.x - o.spr.w / 2, o.y - o.spr.h * 0.62, o.spr.w, o.spr.h); continue; }
        if (o === c.P) this.drawPlayer(ctx, c);
        else if (o === c.comp) this.drawComp(ctx, o);
        else if (o.d) this.drawEnemy(ctx, o);
        else this.drawMinion(ctx, o);
      }
      // armes en orbite / auras
      this.drawWeapons(ctx, c);
      // projectiles du joueur
      for (const b of c.pb) {
        if (!inView(b.x, b.y, 40)) continue;
        const sp = G.proj(b.look);
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.boom || b.look === 'star' || b.look === 'axe' ? b.t * 14 : b.look === 'tornado' ? 0 : b.a);
        const k = b.look === 'tornado' ? b.r / 26 : Math.max(1, b.r / 8) * 0.9;
        ctx.drawImage(sp.c, -sp.w * k / 2, -sp.h * k / 2, sp.w * k, sp.h * k); ctx.restore();
      }
      // frappes du ciel (avant impact)
      for (const st of c.strikes) {
        if (st.t < 0 || !st.placed) continue;
        const k = Math.min(1, st.t / st.delay);
        if (st.look === 'meteor') { const sp = G.proj('fireball'); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ff7a2f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(st.x, st.y, st.r * k, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; ctx.save(); ctx.translate(st.x + (1 - k) * 120, st.y - (1 - k) * 260); ctx.rotate(Math.atan2(260, -120)); ctx.drawImage(sp.c, -30, -30, 60, 60); ctx.restore(); }
        else if (st.look === 'arrowrain') { const sp = G.proj('arrow'); ctx.save(); ctx.translate(st.x, st.y - (1 - k) * 200); ctx.rotate(Math.PI / 2); ctx.drawImage(sp.c, -17, -6, 34, 12); ctx.restore(); }
        else { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(st.x, st.y, st.r * (1 - k * 0.5), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      }
      // particules normales
      for (const p of this.parts) if (!p.add) { ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5); ctx.fillStyle = p.col; const z = p.size * (0.5 + 0.5 * p.life / p.max); ctx.fillRect(p.x - z / 2, p.y - z / 2, z, z); }
      ctx.globalAlpha = 1;
      // lumières additives
      if (this.q > 0) this.drawGlows(ctx, c, inView);
      this.drawFx(ctx, false);
      // ───── brume ─────
      this.drawFog(ctx, c, vx, vy);
      ctx.setTransform(s, 0, 0, s, -vx * s, -vy * s);
      // lueur chaude de la lanterne
      const P = c.P, LR = c.lightR();
      ctx.globalCompositeOperation = 'lighter';
      const fl = 1 + Math.sin(this.t * 9) * 0.02 + Math.sin(this.t * 23) * 0.015;
      const gw = G.glow('#ff9a40', 128);
      ctx.globalAlpha = 0.16; ctx.drawImage(gw.c, P.x - LR * fl, P.y - LR * fl, LR * 2 * fl, LR * 2 * fl);
      ctx.globalAlpha = 0.5; const lp = this.lanternPos(c); ctx.drawImage(gw.c, lp[0] - 26, lp[1] - 26, 52, 52);
      // yeux dans la brume
      ctx.globalAlpha = 1;
      for (const e of c.en) {
        if (e.st === 'under' || e.alpha < 0.3 || !inView(e.x, e.y, 20)) continue;
        const d2 = B.dist2(e.x, e.y, P.x, P.y);
        if (d2 < LR * LR * 0.5) continue;
        const f = this.efr(e), sp = G.mon(e.d, f);
        if (!sp.eyes) continue;
        const g = G.glow(e.d.L.eye, 32); const k = e.elite ? 1.45 : 1;
        for (const ey of sp.eyes) { const ex = e.x + ey[0] * (e.face < 0 ? -1 : 1) * k, eyy = e.y + ey[1] * k - (e.z || 0); const z = Math.max(6, e.r * 0.55); ctx.drawImage(g.c, ex - z, eyy - z, z * 2, z * 2); }
      }
      // projectiles ennemis (toujours visibles)
      ctx.globalCompositeOperation = 'source-over';
      this.drawTele(ctx, c);
      for (const b of c.eb) {
        if (!inView(b.x, b.y, 30)) continue;
        const col = b.col || '#ff6a4a';
        if (this.q > 0) { ctx.globalCompositeOperation = 'lighter'; const g = G.glow(col, 32); ctx.globalAlpha = 0.6; ctx.drawImage(g.c, b.x - b.r * 2.2, b.y - b.r * 2.2, b.r * 4.4, b.r * 4.4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
        if (b.look === 'web' || b.look === 'boulder' || b.look === 'wave') { const sp = G.proj(b.look); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.look === 'wave' ? b.a : b.t * 3); const k = b.r / (b.look === 'boulder' ? 16 : b.look === 'wave' ? 14 : 9); ctx.drawImage(sp.c, -sp.w * k / 2, -sp.h * k / 2, sp.w * k, sp.h * k); ctx.restore(); }
        else { ctx.fillStyle = '#1a0a10'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 1.5, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.4, 0, TAU); ctx.fill(); }
      }
      this.drawFx(ctx, true);
      // particules additives
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.parts) if (p.add) { const g = G.glow(p.col, 32); ctx.globalAlpha = Math.min(1, p.life / p.max * 2) * (p.type ? 0.5 + 0.5 * Math.sin(this.t * 3 + p.x) : 1); const z = p.size * 2.2; ctx.drawImage(g.c, p.x - z, p.y - z, z * 2, z * 2); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // barres de vie (élites)
      for (const e of c.en) if ((e.elite || (e.boss && e.d.guard && c.kind === 'endless')) && !e.dead && inView(e.x, e.y, 40)) {
        const w = e.r * 2; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - w / 2 - 1, e.y - e.r - 14, w + 2, 6); ctx.fillStyle = '#ff5a5a'; ctx.fillRect(e.x - w / 2, e.y - e.r - 13, w * e.hp / e.max, 4);
        if (e.shield > 0) { ctx.fillStyle = '#ffe08a'; ctx.fillRect(e.x - w / 2, e.y - e.r - 13, w * Math.min(1, e.shield / e.max), 2); }
      }
      // nombres
      for (const n of this.nums) {
        ctx.globalAlpha = Math.min(1, n.life * 3);
        ctx.font = (n.bold ? '800 ' : '700 ') + n.size + 'px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,5,15,0.85)'; ctx.strokeText(n.txt, n.x, n.y); ctx.fillStyle = n.col; ctx.fillText(n.txt, n.x, n.y);
      }
      ctx.globalAlpha = 1;
      // écran
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.flashA > 0) { ctx.globalAlpha = this.flashA; ctx.fillStyle = this.flashC; ctx.fillRect(0, 0, this.cw, this.ch); ctx.globalAlpha = 1; }
      if (this.bossBanner) this.drawBanner(ctx);
      if (this.joy) this.drawJoy(ctx);
      this.offscreenBoss(ctx, c);
    }

    efr(e) { const sp = e.st === 'dash' ? 2.5 : 1; return Math.floor((e.ph * 7 * sp * (e.spd > 0 ? 1 : 0.3)) % 4); }
    drawEnemy(ctx, e) {
      const c = this.c;
      if (e.st === 'under') { ctx.fillStyle = '#4a3a24'; ctx.beginPath(); ctx.ellipse(e.x, e.y + 6, 12, 5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6a5434'; ctx.beginPath(); ctx.ellipse(e.x, e.y + 4, 8, 3.5, 0, 0, TAU); ctx.fill(); return; }
      const f = this.efr(e);
      const sp = G.mon(e.d, f);
      const el = e.elite ? 1.45 : 1;
      const sq = 1 + Math.sin(e.ph * 9) * 0.05;
      const w = sp.w * el, h = sp.h * el;
      ctx.save();
      ctx.translate(e.x, e.y - (e.z || 0));
      if (e.alpha < 1) ctx.globalAlpha = Math.max(0, e.alpha);
      if (e.elite) { const g = G.glow(e.elite === 'swift' ? '#7affd0' : e.elite === 'armored' ? '#c0c8d8' : e.elite === 'vampire' ? '#ff3a5a' : e.elite === 'explosive' ? '#ff8a2a' : e.elite === 'frozen' ? '#7fd8ff' : e.elite === 'shielded' ? '#ffe08a' : e.elite === 'berserk' ? '#ff4a2a' : '#c9a0ff', 64); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45 + Math.sin(this.t * 5) * 0.15; ctx.drawImage(g.c, -e.r * 2, -e.r * 2, e.r * 4, e.r * 4); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = e.alpha < 1 ? e.alpha : 1; }
      if (e.st === 'aim' || e.st === 'fuse' || e.st === 'crouch') { ctx.translate((Math.random() - 0.5) * 3, 0); }
      if (e.face < 0) ctx.scale(-1, 1);
      if (e.d.L.a === 'wyrm') this.drawWyrmBody(ctx, e);
      ctx.drawImage(sp.c, -w / 2, -h / 2, w * sq, h / sq);
      if (e.flash > 0) { const wh = G.white(sp, 'mon_' + e.d.id + '_' + f); ctx.globalAlpha = Math.min(1, e.flash * 8) * 0.85; ctx.drawImage(wh.c, -w / 2, -h / 2, w * sq, h / sq); }
      if (e.frzT > 0) { const wh = G.white(sp, 'mon_' + e.d.id + '_' + f); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'source-atop'; ctx.drawImage(wh.c, -w / 2, -h / 2, w * sq, h / sq); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5; ctx.strokeStyle = '#bff0ff'; ctx.lineWidth = 2; ctx.strokeRect(-e.r * 0.9, -e.r * 0.9, e.r * 1.8, e.r * 1.8); }
      if (e.st === 'fuse') { ctx.globalAlpha = 0.6 + Math.sin(this.t * 30) * 0.4; const wh = G.white(sp, 'mon_' + e.d.id + '_' + f); ctx.drawImage(wh.c, -w / 2, -h / 2, w, h); }
      ctx.restore();
      if (e.stunT > 0) { ctx.fillStyle = '#ffe14d'; for (let i = 0; i < 3; i++) { const a = this.t * 6 + i * 2.1; ctx.beginPath(); ctx.arc(e.x + Math.cos(a) * e.r * 0.7, e.y - e.r - 4 + Math.sin(a) * 3, 2.5, 0, TAU); ctx.fill(); } }
      if (e.shield > 0) { ctx.strokeStyle = 'rgba(255,224,138,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 1.25, 0, TAU); ctx.stroke(); }
    }
    drawWyrmBody(ctx, e) {
      const tr = this.trails.get(e.uid); if (!tr) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const s = this.s * this.dpr; ctx.setTransform(s, 0, 0, s, -this.vx * s, -this.vy * s);
      for (let i = tr.length - 1; i >= 1; i--) { const r = e.r * (1 - i / tr.length * 0.55); const sp = G.wyrmSeg(e.d.L, r, i); ctx.drawImage(sp.c, tr[i][0] - sp.w / 2, tr[i][1] - sp.h / 2); }
      ctx.restore();
    }
    lanternPos(c) { const P = c.P; const fx = Math.cos(P.face) >= 0 ? 1 : -1; return [P.x + fx * 13, P.y - 2 + Math.sin(this.t * 7) * (c.moving ? 1.5 : 0.5)]; }
    drawPlayer(ctx, c) {
      const P = c.P, H = this.heroDef || (this.heroDef = B.HEROES.find(h => h.id === c.RH.hero));
      if (this.heroDef.id !== c.RH.hero) this.heroDef = B.HEROES.find(h => h.id === c.RH.hero);
      const f = c.moving ? Math.floor(this.t * 9) % 4 : 0;
      const sp = G.hero(this.heroDef, f);
      const fx = Math.cos(P.face) >= 0 ? 1 : -1;
      const bob = c.moving ? Math.abs(Math.sin(this.t * 9)) * -2 : Math.sin(this.t * 2.5) * 0.8;
      if (P.inv > 0 && Math.floor(this.t * 20) % 2 === 0 && P.dashT <= 0) ctx.globalAlpha = 0.45;
      ctx.save(); ctx.translate(P.x, P.y - 8 + bob); ctx.scale(fx, 1);
      ctx.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
      ctx.restore();
      const lp = this.lanternPos(c); const ls = G.lantern(this.lanternCol);
      ctx.save(); ctx.translate(lp[0], lp[1] + 2); ctx.rotate(Math.sin(this.t * 7) * (c.moving ? 0.25 : 0.08)); ctx.drawImage(ls.c, -ls.w / 2, -2, ls.w, ls.h); ctx.restore();
      ctx.globalAlpha = 1;
      if (P.shield > 0 || P.aegis) { ctx.strokeStyle = P.aegis ? 'rgba(255,224,138,0.7)' : 'rgba(159,232,160,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.x, P.y - 6, 24 + Math.sin(this.t * 4) * 1.5, 0, TAU); ctx.stroke(); }
    }
    drawComp(ctx, o) {
      const def = B.COMPANIONS.find(x => x.id === o.id);
      const sp = G.compSpr(def);
      const fx = this.c.P.x > o.x ? 1 : -1;
      ctx.save(); ctx.translate(o.x, o.y + Math.sin(this.t * 5) * 2); ctx.scale(fx, 1); ctx.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h); ctx.restore();
    }
    drawMinion(ctx, m) {
      const sp = G.proj(m.look);
      const k = m.r / 10;
      ctx.save(); ctx.translate(m.x, m.y + Math.sin(this.t * 6 + (m.idx || 0)) * 2); if (m.vx < 0) ctx.scale(-1, 1); ctx.drawImage(sp.c, -sp.w * k / 2, -sp.h * k / 2, sp.w * k, sp.h * k); ctx.restore();
    }
    drawWeapons(ctx, c) {
      const P = c.P;
      for (const w of c.weap) {
        if (w.type === 'orbit' && w.orbs) { const sp = G.proj(w.p.look); const k = w.p.r / 10; for (const o of w.orbs) ctx.drawImage(sp.c, o.x - sp.w * k / 2, o.y - sp.h * k / 2, sp.w * k, sp.h * k); }
        if (w.type === 'aura') {
          const R = w.R || w.p.area; const col = w.p.look === 'frost' ? '#9ae8ff' : '#ffe9a0';
          ctx.globalAlpha = 0.12; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(P.x, P.y, R, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.45; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -this.t * 30; ctx.beginPath(); ctx.arc(P.x, P.y, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
      }
    }
    drawZones(ctx) {
      const c = this.c;
      for (const z of c.zones) {
        if (z.delay > 0) { const sp = G.proj(z.look === 'poison' ? 'spore' : 'fireball'); const k = 1 - z.delay / z.d0; ctx.drawImage(sp.c, z.x - 10, z.y - 10 - Math.sin(k * Math.PI) * 50, 20, 20); continue; }
        const a = Math.min(1, z.life * 2, (z.max - z.life + 0.3) * 4);
        const col = z.look === 'poison' ? '#7ad83a' : z.look === 'fire' ? '#ff6a2a' : z.look === 'holy' ? '#ffe9a0' : z.look === 'runes' ? '#ff7ad9' : z.look === 'ooze' ? '#6a3a8a' : '#8ad0ff';
        ctx.globalAlpha = a * (z.own === 'e' ? 0.55 : 0.32); ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.8, 0, 0, TAU); ctx.fill();
        ctx.globalAlpha = a * 0.7; ctx.strokeStyle = col; ctx.lineWidth = 2;
        if (z.look === 'holy' || z.look === 'runes') { ctx.setLineDash([4, 8]); ctx.lineDashOffset = this.t * 20; ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.8, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r * 0.7, z.r * 0.56, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
        else if (z.own === 'e') { ctx.beginPath(); ctx.ellipse(z.x, z.y, z.r, z.r * 0.8, 0, 0, TAU); ctx.stroke(); }
        if (Math.random() < 0.08 * (this.q + 1)) this.part(z.x + (Math.random() - 0.5) * z.r * 1.4, z.y + (Math.random() - 0.5) * z.r, 0, -30, 0.6, 3, col, true);
      }
      ctx.globalAlpha = 1;
    }
    drawSurvivor(ctx, s) {
      ctx.globalAlpha = 0.5 + Math.sin(this.t * 3) * 0.15;
      ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -this.t * 20;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.8, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      if (!s.done) { ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(s.x, s.y - 40, 14, -Math.PI / 2, -Math.PI / 2 + s.prog * TAU); ctx.stroke(); }
      const sp = G.survivorSpr(s.done);
      ctx.drawImage(sp.c, s.x - sp.w / 2, s.y - sp.h / 2 - 6, sp.w, sp.h);
    }
    drawGlows(ctx, c, inView) {
      ctx.globalCompositeOperation = 'lighter';
      for (const b of c.pb) { const col = LOOKGLOW[b.look]; if (!col || !inView(b.x, b.y, 30)) continue; const g = G.glow(col, 32); const z = Math.max(12, b.r * 2.6); ctx.globalAlpha = 0.55; ctx.drawImage(g.c, b.x - z, b.y - z, z * 2, z * 2); }
      for (const w of c.weap) if (w.type === 'orbit' && w.orbs) { const g = G.glow(LOOKGLOW[w.p.look] || '#fff', 32); for (const o of w.orbs) { const z = w.p.r * 2.6; ctx.globalAlpha = 0.6; ctx.drawImage(g.c, o.x - z, o.y - z, z * 2, z * 2); } }
      for (const m of c.mins) { const g = G.glow(LOOKGLOW[m.look] || '#fff', 32); const z = m.r * 2.4; ctx.globalAlpha = 0.45; ctx.drawImage(g.c, m.x - z, m.y - z, z * 2, z * 2); }
      for (const p of c.picks) if (p.type === 'xp' && inView(p.x, p.y, 20)) { const g = G.glow('#7ad8ff', 32); ctx.globalAlpha = 0.35; ctx.drawImage(g.c, p.x - 12, p.y - 12, 24, 24); }
      for (const d of this.deco) if (d.glow && inView(d.x, d.y, 40)) { const g = G.glow(d.glow, 32); ctx.globalAlpha = 0.35 + Math.sin(this.t * 2 + d.x) * 0.1; ctx.drawImage(g.c, d.x - 26, d.y - 30, 52, 52); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    drawFog(ctx, c, vx, vy) {
      const f = this.fx, fw = this.fog.width, fh = this.fog.height;
      const k = this.s / this.fd; // monde → pixels de brume
      f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
      f.fillStyle = this.fogCol; f.fillRect(0, 0, fw, fh);
      // volutes
      const cl = G.cloud(3), cl2 = G.cloud(9);
      const sz = 256 * k * 2.2;
      f.globalAlpha = 0.3;
      for (const [cc, sp, off] of [[cl, 9, 0], [cl2, -6, 100]]) {
        const ox = (((-vx + this.t * sp) * k) % sz + sz) % sz - sz, oy = (((-vy + this.t * sp * 0.4 + off) * k) % sz + sz) % sz - sz;
        for (let x = ox; x < fw; x += sz) for (let y = oy; y < fh; y += sz) f.drawImage(cc.c, x, y, sz, sz);
      }
      // trous de lumière
      f.globalCompositeOperation = 'destination-out';
      const h = G.hole();
      const P = c.P, LR = c.lightR() * (1 + Math.sin(this.t * 9) * 0.015 + Math.sin(this.t * 2.3) * 0.02);
      f.globalAlpha = 1;
      f.drawImage(h.c, (P.x - vx - LR * 1.15) * k, (P.y - vy - LR * 1.15) * k, LR * 2.3 * k, LR * 2.3 * k);
      f.globalAlpha = 0.6;
      for (const b of c.pb) { const li = LIGHTLOOK[b.look]; if (!li) continue; const r = 45 * li; f.drawImage(h.c, (b.x - vx - r) * k, (b.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      for (const m of c.mins) { const r = 45; f.drawImage(h.c, (m.x - vx - r) * k, (m.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      for (const w of c.weap) if (w.orbs) for (const o of w.orbs) { const r = 55; f.drawImage(h.c, (o.x - vx - r) * k, (o.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      for (const l of this.lights) { f.globalAlpha = Math.min(1, l.life / l.max * 1.5) * 0.85; f.drawImage(h.c, (l.x - vx - l.r) * k, (l.y - vy - l.r) * k, l.r * 2 * k, l.r * 2 * k); }
      f.globalAlpha = 0.32;
      for (const d of this.deco) if (d.glow) { const r = 38; f.drawImage(h.c, (d.x - vx - r) * k, (d.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      for (const z of c.zones) if (z.own === 'p' && (z.look === 'fire' || z.look === 'holy')) { const r = z.r * 1.5; f.drawImage(h.c, (z.x - vx - r) * k, (z.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      if (c.survivor) { const s = c.survivor, r = 90; f.drawImage(h.c, (s.x - vx - r) * k, (s.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      if (c.comp && c.comp.id === 'firefly') { const r = 60; f.drawImage(h.c, (c.comp.x - vx - r) * k, (c.comp.y - vy - r) * k, r * 2 * k, r * 2 * k); }
      f.globalAlpha = 1; f.globalCompositeOperation = 'source-over';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.96;
      ctx.drawImage(this.fog, 0, 0, this.cv.width, this.cv.height);
      ctx.globalAlpha = 1;
    }
    drawTele(ctx, c) {
      for (const T of c.tele) {
        const k = Math.min(1, T.t / T.delay);
        const col = T.roar ? '191,232,255' : '255,70,50';
        ctx.fillStyle = 'rgba(' + col + ',' + (0.12 + k * 0.12) + ')'; ctx.strokeStyle = 'rgba(' + col + ',' + (0.5 + k * 0.4) + ')'; ctx.lineWidth = 2;
        if (T.k === 'circle') {
          ctx.beginPath(); ctx.ellipse(T.x, T.y, T.r, T.r * 0.85, 0, 0, TAU); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(' + col + ',0.3)'; ctx.beginPath(); ctx.ellipse(T.x, T.y, T.r * k, T.r * 0.85 * k, 0, 0, TAU); ctx.fill();
        } else if (T.k === 'line') {
          ctx.save(); ctx.translate(T.x, T.y); ctx.rotate(T.a);
          ctx.fillRect(0, -T.w / 2, T.len, T.w); ctx.strokeRect(0, -T.w / 2, T.len, T.w);
          ctx.fillStyle = 'rgba(' + col + ',0.3)'; ctx.fillRect(0, -T.w / 2, T.len * k, T.w);
          ctx.restore();
        } else if (T.k === 'cone') {
          ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.arc(T.x, T.y, T.len, T.a - T.w, T.a + T.w); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(' + col + ',0.3)'; ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.arc(T.x, T.y, T.len * k, T.a - T.w, T.a + T.w); ctx.closePath(); ctx.fill();
        }
      }
    }
    drawFx(ctx, top) {
      for (const f of this.fxs) {
        const k = f.life / f.max;
        if (top !== (f.k === 'bolt' || f.k === 'thunder' || f.k === 'beam' || f.k === 'cone')) continue;
        ctx.globalAlpha = Math.min(1, k * 1.5);
        switch (f.k) {
          case 'ring': ctx.strokeStyle = f.col; ctx.lineWidth = (f.w || 4) * k; ctx.beginPath(); ctx.arc(f.x, f.y, B.lerp(f.r2, f.r, k), 0, TAU); ctx.stroke(); break;
          case 'boom': {
            ctx.globalCompositeOperation = 'lighter'; const g = G.glow(f.col, 64); const r = f.r * (1.3 - k * 0.3); ctx.globalAlpha = k; ctx.drawImage(g.c, f.x - r * 1.3, f.y - r * 1.3, r * 2.6, r * 2.6);
            ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = f.col; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1.1 - k * 0.4), 0, TAU); ctx.stroke(); break;
          }
          case 'swing': {
            ctx.fillStyle = f.col; ctx.globalAlpha = k * 0.7;
            const a0 = f.a - f.arc / 2, a1 = f.a + f.arc / 2, prog = 1 - k;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r, a0, a0 + (a1 - a0) * Math.min(1, prog * 2.5 + 0.2)); ctx.arc(f.x, f.y, f.r * 0.55, a0 + (a1 - a0) * Math.min(1, prog * 2.5 + 0.2), a0, true); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, a0, a0 + (a1 - a0) * Math.min(1, prog * 2.5 + 0.2)); ctx.stroke();
            break;
          }
          case 'bolt': {
            ctx.globalCompositeOperation = 'lighter';
            for (const [lw, col] of [[6, f.col], [2, '#fff']]) {
              ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
              const r = B.rng(Math.floor(f.seed * 1000 + this.t * 30));
              for (let i = 0; i < f.pts.length; i++) {
                const p = f.pts[i];
                if (i === 0) { ctx.moveTo(p[0], p[1]); continue; }
                const q = f.pts[i - 1];
                for (let s = 1; s <= 3; s++) { const t = s / 3; ctx.lineTo(B.lerp(q[0], p[0], t) + (s < 3 ? (r() - 0.5) * 18 : 0), B.lerp(q[1], p[1], t) + (s < 3 ? (r() - 0.5) * 18 : 0)); }
              }
              ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over'; break;
          }
          case 'thunder': {
            ctx.globalCompositeOperation = 'lighter';
            const r = B.rng(Math.floor(f.seed * 1000));
            for (const [lw, col] of [[8, '#ffe14d'], [3, '#fff']]) { ctx.strokeStyle = col; ctx.lineWidth = lw * k; ctx.beginPath(); let x = f.x + (r() - 0.5) * 40, y = f.y - 300; ctx.moveTo(x, y); while (y < f.y) { y += 30; x += (r() - 0.5) * 30; ctx.lineTo(y >= f.y ? f.x : x, Math.min(y, f.y)); } ctx.stroke(); }
            ctx.globalCompositeOperation = 'source-over'; break;
          }
          case 'beam': {
            ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.globalCompositeOperation = 'lighter';
            if (!f.col) { const g = ctx.createLinearGradient(0, -f.w, 0, f.w); g.addColorStop(0, '#ff6a6a'); g.addColorStop(0.3, '#ffe06a'); g.addColorStop(0.5, '#6aff9a'); g.addColorStop(0.7, '#6ac8ff'); g.addColorStop(1, '#c86aff'); ctx.fillStyle = g; }
            else ctx.fillStyle = f.col;
            ctx.globalAlpha = k * 0.8; ctx.fillRect(0, -f.w * k, f.len, f.w * 2 * k);
            ctx.fillStyle = '#fff'; ctx.globalAlpha = k; ctx.fillRect(0, -f.w * 0.3 * k, f.len, f.w * 0.6 * k);
            ctx.restore(); ctx.globalCompositeOperation = 'source-over'; break;
          }
          case 'cone': {
            ctx.globalCompositeOperation = 'lighter';
            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.len); g.addColorStop(0, G.rgba(f.col, 0.9 * k)); g.addColorStop(1, G.rgba(f.col, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, f.len, f.a - f.w, f.a + f.w); ctx.closePath(); ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; break;
          }
          case 'line': ctx.strokeStyle = f.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x2, f.y2); ctx.stroke(); break;
          case 'spikes': {
            const col = f.b === 3 ? '#bff0ff' : f.b === 0 ? '#6a4a2a' : f.b === 4 ? '#3a1a22' : '#8a8090';
            const grow = Math.min(1, (f.max - f.life) * 8);
            for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d = f.r * 0.45; const x = f.x + Math.cos(a) * d, y = f.y + Math.sin(a) * d * 0.8; G.prim.poly(ctx, [x - 6, y, x, y - 26 * grow, x + 6, y], col, 1.5); }
            G.prim.poly(ctx, [f.x - 8, f.y, f.x, f.y - 36 * grow, f.x + 8, f.y], col, 1.5);
            break;
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    drawBanner(ctx) {
      const b = this.bossBanner, k = Math.min(1, b.t * 2, (2.6 - b.t) * 3);
      ctx.globalAlpha = Math.max(0, k);
      const y = this.ch * 0.3;
      const g = ctx.createLinearGradient(0, 0, this.cw, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(10,0,5,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, y - 34, this.cw, 62);
      ctx.font = '800 26px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffcf8a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
      ctx.strokeText(b.n, this.cw / 2, y + 8); ctx.fillText(b.n, this.cw / 2, y + 8);
      ctx.globalAlpha = 1;
    }
    drawJoy(ctx) {
      const j = this.joy;
      ctx.globalAlpha = j.active ? 0.55 : 0.22;
      ctx.strokeStyle = '#fff3d0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(j.bx, j.by, j.R, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.fill();
      ctx.globalAlpha = j.active ? 0.85 : 0.35; ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(j.kx, j.ky, j.R * 0.42, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    offscreenBoss(ctx, c) {
      // flèche vers les élites/boss hors de l'écran
      for (const e of c.en) {
        if (!(e.boss || e.elite) || e.dead) continue;
        const sx = (e.x - this.vx) * this.s, sy = (e.y - this.vy) * this.s;
        if (sx > 0 && sx < this.cw && sy > 0 && sy < this.ch) continue;
        const cx = this.cw / 2, cy = this.ch / 2, a = Math.atan2(sy - cy, sx - cx);
        const m = 26, x = B.clamp(cx + Math.cos(a) * 1000, m, this.cw - m), y = B.clamp(cy + Math.sin(a) * 1000, m + 90, this.ch - m - 60);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = e.boss ? '#ff5a3c' : '#ffcf4a'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -8); ctx.lineTo(-6, 8); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      if (c.survivor && !c.survivor.done) {
        const s = c.survivor; const sx = (s.x - this.vx) * this.s, sy = (s.y - this.vy) * this.s;
        if (!(sx > 0 && sx < this.cw && sy > 0 && sy < this.ch)) { const cx = this.cw / 2, cy = this.ch / 2, a = Math.atan2(sy - cy, sx - cx); const x = B.clamp(cx + Math.cos(a) * 1000, 30, this.cw - 30), y = B.clamp(cy + Math.sin(a) * 1000, 120, this.ch - 90); ctx.save(); ctx.translate(x, y); ctx.font = '22px system-ui'; ctx.textAlign = 'center'; ctx.fillText('🙋', 0, 8); ctx.restore(); }
      }
    }
  }
  B.Render = Render;

  // Sprites de compagnons et de survivant
  G.compSpr = function (def) {
    return G.spr('comp_' + def.id, 30, 30, (x) => {
      const P = G.prim, c = def.col;
      switch (def.id) {
        case 'firefly': P.ell(x, 0, 0, 5, 4, '#3a3a2a', 1); P.ell(x, -4, 1, 4, 4, '#fff6a0', 1); P.ell(x, 1, -5, 4, 2, 'rgba(255,255,255,0.6)', 0.8); break;
        case 'fox': P.ell(x, -2, 2, 8, 5, c, 1.3); P.poly(x, [-9, 1, -15, -3, -12, 5], '#fff', 1); P.ell(x, 6, -2, 5, 4.5, c, 1.3); P.poly(x, [3, -5, 4, -11, 7, -6], c, 1); P.poly(x, [7, -6, 9, -11, 10, -5], c, 1); P.ell(x, 10, -1, 2, 1.5, '#fff'); P.eye(x, 7, -3, 1, '#2a1a0a'); break;
        case 'owl': P.ell(x, 0, 2, 8, 9, c, 1.3); P.ell(x, -3, -2, 3.2, 3.2, '#fff', 1); P.ell(x, 3, -2, 3.2, 3.2, '#fff', 1); P.ell(x, -3, -2, 1.5, 1.5, '#1a1a1a'); P.ell(x, 3, -2, 1.5, 1.5, '#1a1a1a'); P.poly(x, [-1, 1, 1, 1, 0, 3], '#ffaa3a', 0.6); P.poly(x, [-7, -6, -4, -10, -3, -6], c, 1); P.poly(x, [7, -6, 4, -10, 3, -6], c, 1); break;
        case 'salamander': P.ell(x, 0, 2, 10, 4, c, 1.3); P.ell(x, 9, 0, 4, 3.5, c, 1.2); P.ell(x, 10, -1, 1, 1, '#000'); for (let i = 0; i < 3; i++) P.ell(x, -6 + i * 5, 0, 1.5, 1.5, '#ffcf4a'); break;
        case 'crow': P.ell(x, 0, 2, 8, 6, c, 1.3); P.ell(x, 6, -3, 4.5, 4, c, 1.2); P.poly(x, [9, -3, 14, -2, 9, -1], '#ffcf4a', 0.8); P.eye(x, 7, -4, 1.1, '#ff3a3a'); P.poly(x, [-4, 0, -12, -6, -6, 4], G.shade(c, -0.3), 1); break;
        case 'turtle': P.ell(x, 8, 2, 4, 3.5, '#9ad06a', 1.2); P.ell(x, 0, 2, 9, 6.5, c, 1.3); P.ell(x, 0, 1, 6, 4, G.shade(c, 0.25)); P.ell(x, 9, 1, 1, 1, '#000'); break;
        case 'cat': P.ell(x, -2, 3, 8, 5, c, 1.3); P.ell(x, 6, -2, 5, 4.5, c, 1.2); P.poly(x, [3, -5, 3, -10, 6, -6], c, 1); P.poly(x, [7, -6, 9, -10, 10, -4], c, 1); P.eye(x, 5, -2, 1.1, '#7affd0'); P.eye(x, 8.5, -2, 1.1, '#7affd0'); break;
        case 'drake': P.poly(x, [-4, -2, -12, -10, -8, 2], '#ff9a6a', 1); P.ell(x, -1, 3, 8, 5.5, c, 1.3); P.ell(x, 7, -2, 5, 4, c, 1.2); P.poly(x, [5, -5, 4, -9, 7, -6], '#ffcf4a', 0.8); P.eye(x, 8, -3, 1.1, '#ffcf4a'); P.ell(x, -1, 5, 4, 2, '#ffd0a0'); break;
      }
    }, 3);
  };
  G.survivorSpr = function (free) {
    return G.spr('survivor' + (free ? 1 : 0), 50, 60, (x) => {
      const P = G.prim;
      if (!free) { for (let i = 0; i < 5; i++) { x.fillStyle = '#3a3030'; x.fillRect(-18 + i * 9, -20, 3, 38); } P.rrect(x, 0, -21, 42, 5, 2, '#5a4a40', 1.2); P.rrect(x, 0, 19, 42, 5, 2, '#5a4a40', 1.2); }
      P.ell(x, 0, 6, 7, 10, '#8a6a4a', 1.3); P.ell(x, 0, -8, 6.5, 6.5, '#f0c8a0', 1.3); P.ell(x, -2, -9, 1, 1.2, P.OUT); P.ell(x, 2, -9, 1, 1.2, P.OUT);
      x.beginPath(); x.arc(0, -10, 6.8, Math.PI, 0); x.fillStyle = '#6a4a2a'; x.fill();
      if (free) { P.rrect(x, -10, 0, 3, 10, 1, '#f0c8a0', 1); P.rrect(x, 10, -6, 3, 10, 1, '#f0c8a0', 1); }
    });
  };
})(this.B || (this.B = {}));
