// Brumeterre — fonds animés : écran titre, village vivant, carte
(function (B) {
  'use strict';
  const G = B.G, TAU = Math.PI * 2;
  const P_ = () => G.prim;

  // Emplacements dans le village (monde 480 × 900)
  B.VLAYOUT = {
    fanal: [240, 480], observatory: [240, 205], forge: [92, 335], tavern: [388, 335], academy: [92, 585], altar: [388, 585], garden: [240, 715], stable: [100, 820]
  };
  B.HOUSES = [[160, 432], [322, 432], [178, 578], [304, 578], [40, 470], [440, 470], [150, 255], [330, 255], [40, 690], [440, 700], [395, 815], [300, 860], [48, 190], [432, 190], [140, 120], [340, 120]];

  // ───── Dessin des bâtiments ─────
  function wall(x, cx, by, w, h, col) { P_().rrect(x, cx, by - h / 2, w, h, 3, col, 2); x.save(); x.beginPath(); x.rect(cx - w / 2, by - h, w, h); x.clip(); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(cx + w * 0.15, by - h, w, h); x.restore(); }
  function roof(x, cx, by, w, h, col, over) {
    over = over || 8;
    P_().poly(x, [cx - w / 2 - over, by, cx, by - h, cx + w / 2 + over, by], col, 2);
    x.save(); x.beginPath(); x.moveTo(cx - w / 2 - over, by); x.lineTo(cx, by - h); x.lineTo(cx + w / 2 + over, by); x.closePath(); x.clip();
    x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1.5; for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(cx - w, by - h * i / 5); x.lineTo(cx + w, by - h * i / 5); x.stroke(); }
    x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.moveTo(cx, by - h); x.lineTo(cx + w, by); x.lineTo(cx, by); x.fill();
    x.restore();
  }
  function win(x, cx, cy, w, h, lit) { P_().rrect(x, cx, cy, w, h, 2, lit ? '#ffd27a' : '#2a2030', 1.5); if (lit) { x.fillStyle = '#fff3c0'; x.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w / 2 - 2, h / 2 - 2); } x.strokeStyle = G.prim.OUT; x.lineWidth = 1; x.beginPath(); x.moveTo(cx, cy - h / 2); x.lineTo(cx, cy + h / 2); x.moveTo(cx - w / 2, cy); x.lineTo(cx + w / 2, cy); x.stroke(); }
  function door(x, cx, by, w, h, col) { x.beginPath(); x.moveTo(cx - w / 2, by); x.lineTo(cx - w / 2, by - h + w / 2); x.arc(cx, by - h + w / 2, w / 2, Math.PI, 0); x.lineTo(cx + w / 2, by); x.closePath(); x.fillStyle = col || '#5a3a22'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = G.prim.OUT; x.stroke(); }
  function chimney(x, cx, by, h) { P_().rrect(x, cx, by - h / 2, 9, h, 1, '#6a5a5a', 1.5); P_().rrect(x, cx, by - h, 12, 4, 1, '#5a4a4a', 1.5); }
  function banner(x, cx, ty, col) { x.strokeStyle = '#4a3420'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, ty); x.lineTo(cx, ty - 24); x.stroke(); P_().poly(x, [cx, ty - 24, cx + 14, ty - 20, cx, ty - 14], col, 1.2); }
  function scaffold(x, w, h) {
    P_().rrect(x, 0, -4, w, 8, 2, '#7a6a5a', 1.5);
    x.strokeStyle = '#8a6a42'; x.lineWidth = 3; for (const sx of [-w / 2 + 6, w / 2 - 6]) { x.beginPath(); x.moveTo(sx, 0); x.lineTo(sx, -h); x.stroke(); }
    x.lineWidth = 2; x.beginPath(); x.moveTo(-w / 2 + 6, -h * 0.5); x.lineTo(w / 2 - 6, -h * 0.5); x.moveTo(-w / 2 + 6, -h); x.lineTo(w / 2 - 6, -h * 0.5); x.stroke();
    for (let i = 0; i < 3; i++) P_().rrect(x, -w / 4 + i * w / 4, -12, w / 5, 8, 1, '#a08060', 1);
  }
  function ruin(x, w) { for (let i = 0; i < 5; i++) P_().rrect(x, -w / 2 + 8 + i * (w - 16) / 4, -6 - (i % 2) * 6, 14, 12 + (i % 3) * 6, 2, '#5a5560', 1.5); }

  G.building = function (id, lvl, state) {
    const key = 'bld_' + id + '_' + lvl + '_' + state;
    const D = BLD[id];
    return G.spr(key, D.w, D.h, (x) => {
      x.translate(0, D.h / 2 - 6);
      if (state === 'need') { ruin(x, D.w * 0.6); return; }
      if (lvl === 0) { scaffold(x, D.w * 0.6, D.h * 0.35); return; }
      D.f(x, lvl);
    }, 2);
  };
  const BLD = {
    fanal: { w: 120, h: 230, f(x, l) {
      const h = 110 + l * 9, bw = 46 + l;
      P_().rrect(x, 0, -6, bw + 30, 12, 3, '#6a6070', 2);
      P_().poly(x, [-bw / 2, -10, -bw / 2 + 10, -h, bw / 2 - 10, -h, bw / 2, -10], '#d8cfc0', 2);
      x.save(); x.beginPath(); x.moveTo(-bw / 2, -10); x.lineTo(-bw / 2 + 10, -h); x.lineTo(bw / 2 - 10, -h); x.lineTo(bw / 2, -10); x.clip();
      for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#c84a3a' : '#e8e0d0'; x.fillRect(-bw, -10 - (i + 1) * h / 5, bw * 2, h / 10); }
      x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(4, -h, bw, h); x.restore();
      door(x, 0, -10, 12, 22, '#4a3020');
      for (let i = 1; i <= Math.min(3, Math.floor(l / 3) + 1); i++) win(x, 0, -10 - i * h / 4.2, 8, 10, true);
      P_().rrect(x, 0, -h - 4, bw - 6, 8, 2, '#4a4050', 2);
      P_().rrect(x, 0, -h - 22, bw - 16, 28, 4, '#ffe7a0', 2);
      x.fillStyle = '#fff8e0'; x.fillRect(-bw / 2 + 12, -h - 32, 8, 18);
      x.strokeStyle = G.prim.OUT; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-6, -h - 36); x.lineTo(-6, -h - 8); x.moveTo(6, -h - 36); x.lineTo(6, -h - 8); x.stroke();
      P_().poly(x, [-bw / 2 + 4, -h - 36, 0, -h - 58 - l, bw / 2 - 4, -h - 36], '#3a3a5a', 2);
      if (l >= 4) { banner(x, -bw / 2 - 10, -4, '#ffcf4a'); banner(x, bw / 2 + 10, -4, '#ffcf4a'); }
      if (l >= 7) { P_().rrect(x, 0, -h * 0.5, bw + 4, 5, 2, '#c9a43a', 1.5); }
    } },
    forge: { w: 120, h: 110, f(x, l) {
      const w = 66 + l * 5, h = 34 + l * 3;
      chimney(x, w / 2 - 12, -h - 10, 36 + l * 4); if (l >= 3) chimney(x, -w / 2 + 14, -h - 6, 30);
      wall(x, 0, 0, w, h, '#7a6a5a');
      roof(x, 0, -h, w, 26 + l * 2, '#4a3a3a');
      door(x, -8, 0, 18, 26, '#2a1a10'); x.fillStyle = 'rgba(255,140,40,0.7)'; x.fillRect(-15, -18, 14, 18);
      win(x, w / 2 - 14, -h / 2, 10, 10, true);
      P_().rrect(x, w / 2 + 6, -6, 16, 7, 2, '#3a3a44', 1.5); P_().rrect(x, w / 2 + 6, -13, 22, 6, 2, '#5a5a66', 1.5);
      if (l >= 2) { P_().rrect(x, -w / 2 - 6, -8, 10, 16, 2, '#6a4a2a', 1.2); }
      if (l >= 4) banner(x, -w / 2 + 4, -h, '#ff8a3a');
      if (l >= 5) { x.fillStyle = '#ffcf4a'; x.font = '14px serif'; x.fillText('⚒', -6, -h - 8); }
    } },
    tavern: { w: 130, h: 130, f(x, l) {
      const w = 70 + l * 6, h = 30 + l * 10;
      chimney(x, -w / 2 + 14, -h - 14, 30);
      wall(x, 0, 0, w, h, '#d8c49a');
      x.strokeStyle = '#6a4a2a'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 3; i++) { x.moveTo(-w / 2 + i * w / 3, 0); x.lineTo(-w / 2 + i * w / 3, -h); } x.moveTo(-w / 2, -h / 2); x.lineTo(w / 2, -h / 2); x.stroke();
      roof(x, 0, -h, w, 30 + l * 2, '#8a3a2a');
      door(x, 0, 0, 16, 24, '#5a3a22');
      for (let f = 0; f < Math.min(3, l); f++) { win(x, -w / 4 - 4, -12 - f * 22 - (f ? 8 : 0), 11, 11, true); win(x, w / 4 + 4, -12 - f * 22 - (f ? 8 : 0), 11, 11, true); }
      x.strokeStyle = '#4a3420'; x.lineWidth = 2; x.beginPath(); x.moveTo(w / 2, -h + 14); x.lineTo(w / 2 + 16, -h + 14); x.stroke();
      P_().rrect(x, w / 2 + 14, -h + 24, 16, 14, 2, '#c08a3a', 1.5); x.font = '10px serif'; x.fillText('🍺', w / 2 + 8, -h + 28);
      if (l >= 3) { x.strokeStyle = '#3a2a1a'; x.lineWidth = 1; x.beginPath(); x.moveTo(-w / 2 - 10, -h + 6); x.quadraticCurveTo(0, -h + 20, w / 2 + 10, -h + 6); x.stroke(); for (let i = 0; i < 6; i++) P_().ell(x, -w / 2 + i * w / 5, -h + 10 + Math.sin(i / 5 * Math.PI) * 8, 2.5, 2.5, ['#ff8a8a', '#ffe08a', '#8affb0'][i % 3]); }
    } },
    academy: { w: 120, h: 150, f(x, l) {
      const w = 54 + l * 4, h = 50 + l * 12;
      if (l >= 3) { wall(x, -w / 2 - 14, 0, 30, 34, '#8a8aa8'); roof(x, -w / 2 - 14, -34, 30, 16, '#3a4a8a', 4); }
      wall(x, 0, 0, w, h, '#a8a0c0');
      P_().poly(x, [-w / 2 - 6, -h, 0, -h - 40 - l * 4, w / 2 + 6, -h], '#3a4a9a', 2);
      x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.moveTo(0, -h - 40 - l * 4); x.lineTo(w / 2 + 6, -h); x.lineTo(0, -h); x.fill();
      door(x, 0, 0, 14, 22, '#3a2a4a');
      for (let i = 0; i < Math.min(4, l + 1); i++) win(x, 0, -30 - i * 18, 10, 12, i % 2 === 0);
      P_().ell(x, 0, -h - 40 - l * 4, 4, 4, '#ffe08a', 1);
      if (l >= 2) { P_().rrect(x, w / 2 + 6, -8, 12, 16, 2, '#6a3a2a', 1); P_().rrect(x, w / 2 + 6, -18, 10, 4, 1, '#3a6a8a', 1); }
    } },
    altar: { w: 120, h: 120, f(x, l) {
      const w = 60 + l * 6;
      for (let i = 0; i < 3; i++) P_().rrect(x, 0, -4 - i * 7, w - i * 14, 8, 2, '#8a8494', 1.5);
      if (l >= 2) for (const sx of [-w / 2 + 6, w / 2 - 6]) { P_().rrect(x, sx, -32 - l * 3, 9, 40 + l * 6, 2, '#b8b0c0', 1.5); P_().rrect(x, sx, -54 - l * 6, 14, 5, 2, '#a8a0b0', 1.5); }
      if (l >= 4) { P_().rrect(x, 0, -66 - l * 3, w + 4, 8, 2, '#a8a0b0', 1.5); }
      P_().rrect(x, 0, -30, 22, 12, 3, '#5a5060', 1.5);
      P_().poly(x, [-14, -36, 14, -36, 8, -28, -8, -28], '#c9a43a', 1.5);
      x.fillStyle = '#ffb43c'; x.beginPath(); x.moveTo(-8, -36); x.quadraticCurveTo(0, -62, 8, -36); x.fill();
      x.fillStyle = '#fff3c0'; x.beginPath(); x.moveTo(-4, -36); x.quadraticCurveTo(0, -50, 4, -36); x.fill();
    } },
    garden: { w: 170, h: 100, f(x, l) {
      const n = 2 + l;
      x.strokeStyle = '#7a5a3a'; x.lineWidth = 2.5; x.strokeRect(-70, -60, 140, 56);
      for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(-70 + i * 20, -60); x.lineTo(-70 + i * 20, -66); x.stroke(); }
      for (let r = 0; r < 3; r++) { P_().rrect(x, 0, -48 + r * 18, 128, 10, 4, '#5a3e28', 1.2); for (let i = 0; i < n * 2; i++) { const px = -58 + i * (116 / (n * 2 - 1 || 1)); const c = ['#5bd17a', '#8ae05a', '#3aa05a'][(i + r) % 3]; P_().ell(x, px, -52 + r * 18, 4, 5, c, 1); if (l >= 3 && (i + r) % 3 === 0) P_().ell(x, px, -56 + r * 18, 2, 2, ['#ff8ab0', '#ffe07a', '#b48aff'][i % 3]); } }
      if (l >= 2) { P_().rrect(x, 64, -18, 14, 24, 2, '#6a8aa0', 1.2); }
      if (l >= 4) { P_().poly(x, [-90, -10, -90, -44, -74, -60, -58, -44, -58, -10], 'rgba(190,230,255,0.45)', 1.5); }
    } },
    stable: { w: 130, h: 110, f(x, l) {
      const w = 70 + l * 7, h = 34 + l * 3;
      wall(x, 0, 0, w, h, '#a03a2a');
      x.strokeStyle = '#f0e0d0'; x.lineWidth = 2; x.strokeRect(-12, -26, 24, 26); x.beginPath(); x.moveTo(-12, -26); x.lineTo(12, 0); x.moveTo(12, -26); x.lineTo(-12, 0); x.stroke();
      P_().poly(x, [-w / 2 - 6, -h, -w / 4, -h - 26, w / 4, -h - 26, w / 2 + 6, -h], '#5a2a22', 2);
      win(x, 0, -h - 12, 10, 8, true);
      P_().ell(x, w / 2 + 12, -8, 10, 8, '#e8c86a', 1.5);
      if (l >= 2) { x.strokeStyle = '#8a6a42'; x.lineWidth = 2; x.beginPath(); x.moveTo(-w / 2 - 30, -4); x.lineTo(-w / 2 - 4, -4); x.moveTo(-w / 2 - 30, -12); x.lineTo(-w / 2 - 4, -12); x.stroke(); }
    } },
    observatory: { w: 120, h: 150, f(x, l) {
      const w = 46 + l * 6, h = 50 + l * 10;
      wall(x, 0, 0, w, h, '#7a7a90');
      x.beginPath(); x.arc(0, -h, w / 2 + 4, Math.PI, 0); x.closePath(); x.fillStyle = '#4a5a8a'; x.fill(); x.lineWidth = 2; x.strokeStyle = G.prim.OUT; x.stroke();
      x.fillStyle = '#1a1a30'; x.fillRect(-4, -h - w / 2, 8, w / 2 - 2);
      x.save(); x.translate(4, -h - w / 3); x.rotate(-0.7); P_().rrect(x, 14, 0, 30, 8, 2, '#c9a43a', 1.5); x.restore();
      door(x, 0, 0, 12, 20, '#2a2a3a'); win(x, 0, -h / 2 - 4, 9, 10, true);
      for (let i = 0; i < l * 2; i++) P_().ell(x, -40 + i * 13, -h - w / 2 - 10 - (i % 2) * 8, 1.5, 1.5, '#fff3c0');
    } }
  };
  G.house = function (s, lit) {
    return G.spr('house_' + s.id + (lit ? 1 : 0), 70, 70, (x) => {
      x.translate(0, 28);
      chimney(x, 12, -36, 18);
      wall(x, 0, 0, 40, 26, G.shade(s.col, 0.35));
      roof(x, 0, -26, 40, 20, s.col, 6);
      door(x, -7, 0, 9, 15, '#4a3020');
      win(x, 9, -12, 9, 8, lit);
    }, 2);
  };
  G.villager = function (s, f) {
    return G.spr('vil_' + s.id + f, 20, 26, (x) => {
      const P = G.prim, st = [0, 1, 0, -1][f] * 1.5;
      P.rrect(x, -2.5 + st, 9, 3, 5, 1, '#3a2a22', 1); P.rrect(x, 2.5 - st, 9, 3, 5, 1, '#3a2a22', 1);
      P.rrect(x, 0, 2, 9, 11, 3, s.col, 1.2);
      P.ell(x, 0, -6, 5, 5, '#f0c8a0', 1.2);
      x.beginPath(); x.arc(0, -7, 5.2, Math.PI, 0); x.fillStyle = G.shade(s.col, -0.4); x.fill();
      P.ell(x, 1.5, -6, 0.8, 1, P.OUT); P.ell(x, 3.5, -6, 0.8, 1, P.OUT);
    }, 3);
  };

  // ───── Fond animé ─────
  class Backdrop {
    constructor(cv) { this.cv = cv; this.ctx = cv.getContext('2d', { alpha: false }); this.on = false; this.t = 0; this.mode = 'title'; this.parts = []; this.camY = 0; this.vil = []; this.resize(); }
    resize() {
      const cw = this.cv.clientWidth || innerWidth, ch = this.cv.clientHeight || innerHeight;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.cv.width = Math.round(cw * this.dpr); this.cv.height = Math.round(ch * this.dpr);
      this.cw = cw; this.ch = ch;
      this.vs = Math.min(cw / 470, 1.6);
      this.vh = 900 * this.vs;
      this.camY = B.clamp(this.camY, 0, Math.max(0, this.vh - ch + 150));
    }
    start(mode, opt) {
      const was = this.mode;
      this.mode = mode; this.opt = opt || {}; this.on = true; this.cv.classList.remove('off'); this.fps = 30;
      if (mode === 'village') { this.initVillage(); if (was !== 'village' || !this.camSet) { this.resize(); this.camY = B.clamp(480 * this.vs + 40 - this.ch * 0.55, 0, Math.max(0, this.vh - this.ch + 160)); this.camSet = true; } }
    }
    stop() { this.on = false; this.cv.classList.add('off'); }
    draw(dt) {
      this.t += dt;
      const x = this.ctx;
      x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.mode === 'village') this.drawVillage(x, dt);
      else this.drawFogScene(x, dt);
    }
    // Brume du titre / de la carte
    drawFogScene(x, dt) {
      const w = this.cw, h = this.ch, t = this.t;
      const bi = this.opt.biome;
      const pal = bi !== undefined ? B.BIOMES[bi].pal : null;
      const g = x.createLinearGradient(0, 0, 0, h);
      if (pal) { g.addColorStop(0, G.shade(pal.g3, -0.5)); g.addColorStop(1, G.shade(pal.g1, -0.3)); }
      else { g.addColorStop(0, '#120c22'); g.addColorStop(0.55, '#2a1c3a'); g.addColorStop(1, '#3a2230'); }
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (pal) {
        const gp = this.mapPat && this.mapPatB === bi ? this.mapPat : (this.mapPatB = bi, this.mapPat = x.createPattern(G.ground(bi).c, 'repeat'));
        x.globalAlpha = 0.55; x.fillStyle = gp; x.save(); x.translate(0, (t * 4) % 256); x.fillRect(0, -256, w, h + 256); x.restore(); x.globalAlpha = 1;
        const D = B.BIOMES[bi].pal.deco.filter(k => G.DECO[k].tall); const rr = B.rng(bi * 13 + 5);
        for (let i = 0; i < 10 && D.length; i++) { const sp = G.deco(rr.pick(D), rr.int(0, 3), pal); const side = i % 2 ? w - 20 - rr() * 40 : 20 + rr() * 40; const yy = (i / 10) * h + rr() * 40; x.globalAlpha = 0.5; x.drawImage(sp.c, side - sp.w / 2, yy - sp.h / 2, sp.w, sp.h); }
        x.globalAlpha = 1;
      }
      if (!pal) {
        // lune
        const mg = G.glow('#ffe9c0', 128); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5; x.drawImage(mg.c, w * 0.84 - 80, h * 0.075 - 80, 160, 160); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
        x.fillStyle = '#fff4dc'; x.beginPath(); x.arc(w * 0.84, h * 0.075, 20, 0, TAU); x.fill(); x.fillStyle = 'rgba(200,190,170,0.35)'; x.beginPath(); x.arc(w * 0.84 - 6, h * 0.075 - 4, 5, 0, TAU); x.arc(w * 0.84 + 7, h * 0.075 + 5, 3.5, 0, TAU); x.fill();
        // montagnes
        for (let k = 0; k < 3; k++) {
          x.fillStyle = ['#2a2040', '#1e1730', '#140f20'][k];
          x.beginPath(); x.moveTo(0, h);
          for (let i = 0; i <= 12; i++) { const px = i / 12 * w; const py = h * (0.5 + k * 0.1) - Math.abs(Math.sin(i * 1.7 + k * 3)) * h * (0.16 - k * 0.03); x.lineTo(px, py); }
          x.lineTo(w, h); x.fill();
        }
        // village au loin (lumières)
        x.globalCompositeOperation = 'lighter';
        const lg = G.glow('#ffb04a', 64);
        for (let i = 0; i < 9; i++) { const px = w * 0.38 + (i - 4) * 12 + Math.sin(i * 7) * 6, py = h * 0.74 + Math.cos(i * 3) * 6; x.globalAlpha = 0.6 + Math.sin(t * 3 + i) * 0.2; x.drawImage(lg.c, px - 10, py - 10, 20, 20); }
        x.globalAlpha = 0.5 + Math.sin(t * 1.5) * 0.1; x.drawImage(lg.c, w * 0.38 - 50, h * 0.7 - 70, 100, 100);
        x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';

      }
      // couches de brume
      const fogc = pal ? pal.fog : [40, 30, 60];
      for (let k = 0; k < 3; k++) {
        const cl = G.fogBand(5 + k * 7), sz = 380 + k * 160, sp = (8 + k * 10) * (k % 2 ? -1 : 1);
        x.globalAlpha = (pal ? 0.18 : 0.5) + k * (pal ? 0.06 : 0.12);
        const ox = ((t * sp) % sz + sz) % sz - sz, oy = h * (0.35 + k * 0.18) - sz / 2;
        for (let px = ox; px < w; px += sz) x.drawImage(cl.c, px, oy, sz, sz);
      }
      x.globalAlpha = 1;
      x.fillStyle = 'rgba(' + fogc.join(',') + ',' + (pal ? 0.12 : 0.25) + ')'; x.fillRect(0, 0, w, h);
      if (!pal) {
        // le Porteur de Lanterne sur sa colline
        const hx = w * 0.68, hy = h * 0.56, k = 2.3;
        const hl = x.createLinearGradient(0, hy, 0, h); hl.addColorStop(0, '#2a1d34'); hl.addColorStop(1, '#0e0914');
        x.fillStyle = hl; x.beginPath(); x.moveTo(w * 0.38, h); x.quadraticCurveTo(w * 0.55, hy + 8, hx, hy + 22); x.quadraticCurveTo(w * 0.92, hy + 26, w, hy + 50); x.lineTo(w, h); x.fill();
        const H = B.HEROES[0], sp = G.hero(H, 0);
        x.globalCompositeOperation = 'lighter'; const hg = G.glow('#ff9a40', 128); x.globalAlpha = 0.6 + Math.sin(t * 7) * 0.05; x.drawImage(hg.c, hx - 30 - 130, hy - 20 - 130, 260, 260); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
        x.save(); x.translate(hx, hy - 6 + Math.sin(t * 2) * 0.6); x.scale(-1, 1); x.filter = 'brightness(0.85)'; x.drawImage(sp.c, -sp.w * k / 2, -sp.h * k / 2, sp.w * k, sp.h * k); x.filter = 'none'; x.restore();
        const ls = G.lantern(); x.save(); x.translate(hx - 28, hy - 4 + Math.sin(t * 3) * 1.2); x.rotate(Math.sin(t * 2) * 0.08); x.drawImage(ls.c, -ls.w * 1.1, 0, ls.w * 2.2, ls.h * 2.2); x.restore();
      }
      // braises / lucioles
      if (Math.random() < 0.3) this.parts.push({ x: Math.random() * w, y: h + 5, vx: (Math.random() - 0.5) * 12, vy: -15 - Math.random() * 25, life: 6, c: pal ? pal.acc : '#ffb04a' });
      x.globalCompositeOperation = 'lighter';
      for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; const gg = G.glow(p.c, 32); x.globalAlpha = Math.min(1, p.life / 2) * (0.5 + 0.5 * Math.sin(t * 4 + p.x)); x.drawImage(gg.c, p.x - 5, p.y - 5, 10, 10); }
      this.parts = this.parts.filter(p => p.life > 0);
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      const vg = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = vg; x.fillRect(0, 0, w, h);
    }

    // ───── Village ─────
    initVillage() {
      const P = B.P;
      this.vil = [];
      const sv = B.SURVIVORS.filter(s => P.survivors[s.id]);
      for (const s of sv) this.vil.push({ s: s, x: 240 + (Math.random() - 0.5) * 200, y: 500 + (Math.random() - 0.5) * 300, tx: 0, ty: 0, wait: Math.random() * 3, f: 0 });
      this.vtrees = [];
      const r = B.rng(42);
      for (let i = 0; i < 40; i++) { const a = r() * TAU, d = 330 + r() * 160; this.vtrees.push([240 + Math.cos(a) * d * 0.75, 470 + Math.sin(a) * d, r.int(0, 3)]); }
      this.vtrees.sort((a, b) => a[1] - b[1]);
      this.deco = [];
      for (let i = 0; i < 70; i++) this.deco.push([20 + r() * 440, 60 + r() * 840, r.pick(['grass', 'grass', 'flower', 'rock', 'bush'])]);
    }
    hit(px, py) {
      // retourne l'objet touché (coordonnées écran)
      const wx = (px - this.ox) / this.vs, wy = (py + this.camY - this.oy) / this.vs;
      let best = null, bd = 1e9;
      for (const id in B.VLAYOUT) { const [bx, by] = B.VLAYOUT[id]; const D = BLD[id]; if (wx > bx - D.w / 2 && wx < bx + D.w / 2 && wy > by - D.h * 0.75 && wy < by + 18) { const d = Math.abs(wy - by); if (d < bd) { bd = d; best = { k: 'bld', id: id }; } } }
      const sv = B.SURVIVORS.filter(s => B.P.survivors[s.id]);
      sv.forEach((s, i) => { const hp = B.HOUSES[i]; if (!hp) return; if (Math.abs(wx - hp[0]) < 26 && wy > hp[1] - 40 && wy < hp[1] + 14) best = { k: 'house', id: s.id }; });
      return best;
    }
    drawVillage(x, dt) {
      const P = B.P, w = this.cw, h = this.ch, t = this.t, s = this.vs;
      const ox = this.ox = (w - 480 * s) / 2, oy = this.oy = 40;
      x.fillStyle = '#0c0a14'; x.fillRect(0, 0, w, h);
      x.save(); x.translate(ox, oy - this.camY); x.scale(s, s);
      // sol
      const gp = this.gpat || (this.gpat = x.createPattern(G.ground(0).c, 'repeat'));
      x.fillStyle = gp; x.fillRect(-200, -100, 880, 1150);
      x.fillStyle = 'rgba(60,90,40,0.25)'; x.fillRect(-200, -100, 880, 1150);
      // chemins
      x.strokeStyle = '#8a7050'; x.lineWidth = 16; x.lineCap = 'round';
      const F = B.VLAYOUT.fanal;
      for (const id in B.VLAYOUT) { if (id === 'fanal') continue; const p = B.VLAYOUT[id]; x.beginPath(); x.moveTo(F[0], F[1] + 4); x.quadraticCurveTo((F[0] + p[0]) / 2 + (p[1] - F[1]) * 0.15, (F[1] + p[1]) / 2, p[0], p[1] + 6); x.stroke(); }
      x.strokeStyle = '#a08860'; x.lineWidth = 9;
      for (const id in B.VLAYOUT) { if (id === 'fanal') continue; const p = B.VLAYOUT[id]; x.beginPath(); x.moveTo(F[0], F[1] + 4); x.quadraticCurveTo((F[0] + p[0]) / 2 + (p[1] - F[1]) * 0.15, (F[1] + p[1]) / 2, p[0], p[1] + 6); x.stroke(); }
      P_().ell(x, F[0], F[1] + 8, 70, 30, '#9a8264');
      for (const d of this.deco) { const sp = G.deco(d[2], 1, B.BIOMES[0].pal); x.drawImage(sp.c, d[0] - sp.w / 2, d[1] - sp.h / 2, sp.w, sp.h); }
      // objets triés
      const L = [];
      for (const id in B.VLAYOUT) {
        const b = B.BUILDINGS.find(q => q.id === id), st = B.Meta.bldState(b);
        L.push({ y: B.VLAYOUT[id][1], k: 'b', id: id, lvl: P.bld[id], st: st === 'need' ? 'need' : 'ok', can: st === 'ok' && B.Meta.can(B.Meta.bldCost(b) || {}) });
      }
      const sv = B.SURVIVORS.filter(q => P.survivors[q.id]);
      sv.forEach((q, i) => { const hp = B.HOUSES[i]; if (hp) L.push({ y: hp[1], k: 'h', s: q, x: hp[0], quest: B.Meta.questOf(q.id) }); });
      for (const v of this.vil) L.push({ y: v.y, k: 'v', v: v });
      for (const tr of this.vtrees) L.push({ y: tr[1], k: 't', x: tr[0], v: tr[2] });
      L.sort((a, b) => a.y - b.y);
      for (const o of L) {
        if (o.k === 't') { const sp = G.deco('tree', o.v, B.BIOMES[0].pal); x.drawImage(sp.c, o.x - sp.w / 2, o.y - sp.h * 0.62, sp.w, sp.h); }
        else if (o.k === 'b') {
          const [bx, by] = B.VLAYOUT[o.id]; const sp = G.building(o.id, o.lvl, o.st);
          x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(bx, by + 2, sp.w * 0.4, 10, 0, 0, TAU); x.fill();
          x.drawImage(sp.c, bx - sp.w / 2, by - sp.h + 6, sp.w, sp.h);
          if (o.id === 'forge' && o.lvl > 0 && Math.random() < 0.3) this.parts.push({ x: bx + 20 + (Math.random() - 0.5) * 6, y: by - 80 - o.lvl * 7, vx: (Math.random() - 0.5) * 10, vy: -30, life: 1.2, c: '#ff8a3a', add: 1 });
          if (o.lvl > 0 && Math.random() < 0.06) this.parts.push({ x: bx + (o.id === 'forge' ? 22 : -20), y: by - 70 - o.lvl * 5, vx: 6, vy: -12, life: 4, c: '#8a8090', smoke: 1 });
          // étiquette
          const b = B.BUILDINGS.find(q => q.id === o.id);
          this.label(x, bx, by + 18, b.n + (o.lvl ? ' ' + o.lvl : ''), o.st === 'need' ? '#8a8090' : '#ffe9c0');
          if (o.st === 'ok' && o.lvl === 0) this.bubble(x, bx, by - 70, '🔨');
          else if (o.can && o.lvl < b.max && o.lvl < B.Meta.bldMax(b)) this.bubble(x, bx + 30, by - sp.h * 0.6, '⬆', true);
        } else if (o.k === 'h') {
          const sp = G.house(o.s, true); x.drawImage(sp.c, o.x - sp.w / 2, o.y - sp.h + 14, sp.w, sp.h);
          if (o.quest && o.quest.done) this.bubble(x, o.x, o.y - 52, '❗');
          else if (!B.P.survivors[o.s.id].seen) this.bubble(x, o.x, o.y - 52, '💬');
        } else if (o.k === 'v') {
          const v = o.v; const sp = G.villager(v.s, v.moving ? Math.floor(t * 8) % 4 : 0);
          x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(v.x, v.y + 12, 6, 2.5, 0, 0, TAU); x.fill();
          x.save(); x.translate(v.x, v.y); if (v.tx < v.x) x.scale(-1, 1); x.drawImage(sp.c, -10, -13, 20, 26); x.restore();
        }
      }
      // villageois : déplacement
      for (const v of this.vil) {
        if (v.wait > 0) { v.wait -= dt; v.moving = false; if (v.wait <= 0) { const keys = Object.keys(B.VLAYOUT); const p = B.VLAYOUT[B.pick(keys)]; v.tx = p[0] + (Math.random() - 0.5) * 60; v.ty = p[1] + 14 + Math.random() * 16; } continue; }
        const dx = v.tx - v.x, dy = v.ty - v.y, d = Math.hypot(dx, dy);
        if (d < 3) { v.wait = 2 + Math.random() * 5; continue; }
        v.moving = true; v.x += dx / d * 22 * dt; v.y += dy / d * 22 * dt;
      }
      // lumières chaudes
      x.globalCompositeOperation = 'lighter';
      const lg = G.glow('#ffb050', 64);
      const fl = P.bld.fanal;
      x.globalAlpha = 0.5 + Math.sin(t * 2) * 0.08; const fy = F[1] - 130 - fl * 9;
      x.drawImage(lg.c, F[0] - 60, fy - 60, 120, 120);
      // rayon du phare
      x.globalAlpha = 0.1;
      const ang = t * 0.6; x.save(); x.translate(F[0], fy); x.rotate(ang); const bg = x.createLinearGradient(0, 0, 300, 0); bg.addColorStop(0, 'rgba(255,230,160,0.9)'); bg.addColorStop(1, 'rgba(255,230,160,0)'); x.fillStyle = bg; x.beginPath(); x.moveTo(0, 0); x.lineTo(320, -40); x.lineTo(320, 40); x.closePath(); x.fill(); x.rotate(Math.PI); x.beginPath(); x.moveTo(0, 0); x.lineTo(320, -40); x.lineTo(320, 40); x.closePath(); x.fill(); x.restore();
      for (const id in B.VLAYOUT) { if (!P.bld[id]) continue; const [bx, by] = B.VLAYOUT[id]; x.globalAlpha = 0.25 + Math.sin(t * 3 + bx) * 0.05; x.drawImage(lg.c, bx - 45, by - 70, 90, 90); }
      sv.forEach((q, i) => { const hp = B.HOUSES[i]; if (!hp) return; x.globalAlpha = 0.25; x.drawImage(lg.c, hp[0] - 25, hp[1] - 40, 50, 50); });
      // particules
      for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      this.parts = this.parts.filter(p => p.life > 0);
      for (const p of this.parts) { if (p.smoke) continue; const gg = G.glow(p.c, 32); x.globalAlpha = Math.min(1, p.life); x.drawImage(gg.c, p.x - 4, p.y - 4, 8, 8); }
      if (Math.random() < 0.2) this.parts.push({ x: Math.random() * 480, y: 100 + Math.random() * 800, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 4, c: '#d8ff7a' });
      x.globalCompositeOperation = 'source-over';
      for (const p of this.parts) { if (!p.smoke) continue; x.globalAlpha = Math.min(0.35, p.life / 8); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, 6 + (4 - p.life) * 3, 0, TAU); x.fill(); }
      x.globalAlpha = 1;
      // brume autour (recule avec le Fanal)
      const R = 200 + fl * 34;
      const fg = x.createRadialGradient(F[0], F[1] - 40, R * 0.55, F[0], F[1] - 40, R * 1.25);
      fg.addColorStop(0, 'rgba(30,24,44,0)'); fg.addColorStop(0.6, 'rgba(30,24,44,0.55)'); fg.addColorStop(1, 'rgba(22,18,34,0.97)');
      x.fillStyle = fg; x.fillRect(-300, -200, 1100, 1300);
      const cl = G.cloud(11); x.globalAlpha = 0.18; const sz = 500; const oxx = ((t * 6) % sz + sz) % sz - sz;
      for (let px = oxx - 300; px < 800; px += sz) for (let py = -200; py < 1100; py += sz) x.drawImage(cl.c, px, py, sz, sz);
      x.globalAlpha = 1;
      x.restore();
    }
    label(x, cx, cy, txt, col) {
      x.font = '700 12px system-ui, sans-serif'; x.textAlign = 'center';
      const w = x.measureText(txt).width + 14;
      x.fillStyle = 'rgba(15,10,22,0.78)'; P_().rrect(x, cx, cy, w, 18, 9, 'rgba(15,10,22,0.78)');
      x.fillStyle = col; x.fillText(txt, cx, cy + 4);
    }
    bubble(x, cx, cy, ic, small) {
      const b = Math.sin(this.t * 4) * 3;
      const r = small ? 10 : 14;
      P_().ell(x, cx, cy + b, r, r, small ? '#5ad08a' : '#ffcf6a', 1.5);
      x.font = (small ? 11 : 15) + 'px system-ui'; x.textAlign = 'center'; x.fillStyle = small ? '#fff' : '#2a1408'; x.fillText(ic, cx, cy + b + (small ? 4 : 5));
    }
  }
  B.Backdrop = Backdrop;
})(this.B || (this.B = {}));
