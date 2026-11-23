// Brumeterre — dessin procédural des sprites (héros, monstres, boss, décors, projectiles)
(function (B) {
  'use strict';
  const G = B.G = {};
  const TAU = Math.PI * 2;
  const OUT = '#140d1c';
  G.K = 2.5; // pixels de sprite par unité du monde

  // ───── Couleurs ─────
  G.rgb = function (hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  G.shade = function (hex, k) {
    let [r, g, b] = G.rgb(hex);
    if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  };
  G.rgba = function (hex, a) { const [r, g, b] = G.rgb(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };

  G.canvas = function (w, h) {
    const c = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(w, h);
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  };
  const cache = new Map();
  G.cache = cache;
  // Crée (une seule fois) un sprite de taille monde w×h centré, dessiné par fn(ctx)
  G.spr = function (key, w, h, fn, k) {
    let s = cache.get(key);
    if (s) return s;
    k = k || G.K;
    const c = G.canvas(w * k, h * k);
    const x = c.getContext('2d');
    x.scale(k, k); x.translate(w / 2, h / 2);
    x.lineJoin = 'round'; x.lineCap = 'round';
    const meta = fn(x) || {};
    s = { c: c, w: w, h: h, eyes: meta.eyes || null };
    cache.set(key, s);
    return s;
  };
  // Version blanche (flash de coup)
  G.white = function (s, key) {
    const k2 = key + '#w';
    let w = cache.get(k2); if (w) return w;
    const c = G.canvas(s.c.width, s.c.height); const x = c.getContext('2d');
    x.drawImage(s.c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    w = { c: c, w: s.w, h: s.h }; cache.set(k2, w); return w;
  };
  G.glow = function (col, size) {
    const key = 'glow' + col + (size || 64);
    let s = cache.get(key); if (s) return s;
    size = size || 64;
    const c = G.canvas(size, size); const x = c.getContext('2d');
    const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, G.rgba(col, 1)); g.addColorStop(0.25, G.rgba(col, 0.55)); g.addColorStop(1, G.rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    s = { c: c, w: size, h: size }; cache.set(key, s); return s;
  };

  // ───── Primitives ─────
  function ell(x, cx, cy, rx, ry, fill, lw, rot) {
    x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU);
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (lw) { x.lineWidth = lw; x.strokeStyle = OUT; x.stroke(); }
  }
  function poly(x, pts, fill, lw) {
    x.beginPath(); x.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]);
    x.closePath();
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (lw) { x.lineWidth = lw; x.strokeStyle = OUT; x.stroke(); }
  }
  function rrect(x, cx, cy, w, h, r, fill, lw) {
    x.beginPath();
    const l = cx - w / 2, t = cy - h / 2;
    x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath();
    if (fill) { x.fillStyle = fill; x.fill(); }
    if (lw) { x.lineWidth = lw; x.strokeStyle = OUT; x.stroke(); }
  }
  // volume : reflet en haut à gauche + ombre en bas
  function shadeEll(x, cx, cy, rx, ry) {
    x.save(); x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.clip();
    x.fillStyle = 'rgba(0,0,0,0.22)'; x.beginPath(); x.ellipse(cx + rx * 0.15, cy + ry * 0.55, rx * 1.05, ry * 0.7, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.ellipse(cx - rx * 0.3, cy - ry * 0.4, rx * 0.45, ry * 0.3, -0.4, 0, TAU); x.fill();
    x.restore();
  }
  function eye(x, cx, cy, r, col) {
    ell(x, cx, cy, r * 1.25, r * 1.25, OUT);
    ell(x, cx, cy, r, r, col);
    ell(x, cx - r * 0.3, cy - r * 0.3, r * 0.35, r * 0.35, '#fff');
  }
  G.prim = { ell: ell, poly: poly, rrect: rrect, shadeEll: shadeEll, eye: eye, OUT: OUT };

  // ───── HÉROS ─────
  G.hero = function (H, f) {
    const key = 'hero_' + H.id + '_' + f;
    return G.spr(key, 44, 52, (x) => {
      const [c0, skin, c2] = H.col;
      const lw = 1.6;
      const step = [0, 1, 0, -1][f % 4];
      x.translate(0, 4);
      // cape
      poly(x, [-7, -8, 7, -8, 11, 12 + step * 0.5, -11, 12 - step * 0.5], G.shade(c0, -0.35), lw);
      // jambes
      rrect(x, -4 + step * 2.2, 15, 5.5, 8, 2, '#3a2a22', lw);
      rrect(x, 4 - step * 2.2, 15, 5.5, 8, 2, '#3a2a22', lw);
      // corps
      poly(x, [-8, -6, 8, -6, 10, 12, -10, 12], c0, lw);
      x.save(); x.beginPath(); x.moveTo(-8, -6); x.lineTo(8, -6); x.lineTo(10, 12); x.lineTo(-10, 12); x.closePath(); x.clip();
      x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(-10, -6, 7, 18);
      x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(4, -6, 8, 18);
      x.restore();
      rrect(x, 0, 6, 20, 3.2, 1, c2, 1);
      // bras arrière
      rrect(x, -9, 1 - step, 4.5, 10, 2, G.shade(c0, -0.15), lw);
      // tête
      const hy = -15;
      ell(x, 0, hy, 10.5, 10, skin, lw);
      shadeEll(x, 0, hy, 10.5, 10);
      if (H.hood) {
        x.beginPath(); x.moveTo(-12, hy + 4); x.quadraticCurveTo(-13, hy - 14, 0, hy - 14); x.quadraticCurveTo(13, hy - 14, 12, hy + 4); x.quadraticCurveTo(6, hy - 6, -2, hy - 5); x.quadraticCurveTo(-8, hy - 4, -12, hy + 4);
        x.fillStyle = G.shade(c0, -0.2); x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
      } else {
        x.beginPath(); x.moveTo(-11, hy + 2); x.quadraticCurveTo(-12, hy - 12, 1, hy - 11.5); x.quadraticCurveTo(12, hy - 11, 11, hy - 1); x.quadraticCurveTo(6, hy - 7, 1, hy - 5); x.quadraticCurveTo(-4, hy - 7, -11, hy + 2);
        x.fillStyle = H.hair; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
        if (H.id === 'maelle' || H.id === 'seraphine' || H.id === 'isolde' || H.id === 'rune') { // cheveux longs
          x.beginPath(); x.moveTo(-10, hy); x.quadraticCurveTo(-14, hy + 10, -9, hy + 16); x.lineTo(-5, hy + 6); x.closePath(); x.fillStyle = H.hair; x.fill(); x.stroke();
        }
      }
      if (H.beard) { x.beginPath(); x.moveTo(-6, hy + 3); x.quadraticCurveTo(0, hy + 16, 9, hy + 3); x.quadraticCurveTo(3, hy + 6, -6, hy + 3); x.fillStyle = H.hair; x.fill(); x.lineWidth = lw; x.stroke(); }
      // yeux
      ell(x, 3.5, hy + 0.5, 1.5, 2, OUT); ell(x, 8, hy + 0.5, 1.3, 1.9, OUT);
      ell(x, 3.1, hy - 0.2, 0.5, 0.5, '#fff'); ell(x, 7.7, hy - 0.2, 0.5, 0.5, '#fff');
      ell(x, 6, hy + 4.5, 1.6, 0.8, 'rgba(255,120,120,0.45)');
      // accessoires
      if (H.id === 'maelle') { rrect(x, -10, -4, 4, 14, 1.5, '#7a4a2a', 1); poly(x, [-11, -12, -9, -12, -10, -15], '#ddd', 0.8); }
      if (H.id === 'borin') { rrect(x, -11, -2, 3, 16, 1, '#6a4a2a', 1); rrect(x, -11, -10, 9, 6, 1.5, '#8a8a95', 1); }
      if (H.id === 'seraphine') { x.strokeStyle = '#ffe58a'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, hy - 13, 7, 2.2, 0, 0, TAU); x.stroke(); }
      if (H.id === 'rune') { poly(x, [-3, hy - 12, 1, hy - 18, 0, hy - 13, 4, hy - 19, 2, hy - 11], '#ffe14d', 0.8); }
      if (H.id === 'ossian') { ell(x, -9, -2, 3, 3, '#5ad0c0'); }
      if (H.id === 'isolde') { ell(x, -9, 4, 3, 3.5, '#8ee04a', 1); }
      // bras avant (tient la lanterne)
      rrect(x, 9, 0 + step * 0.5, 4.5, 9, 2, c0, lw);
      ell(x, 10, 5, 2.5, 2.5, skin, 1);
    });
  };
  G.heroPortrait = function (H, size) {
    const c = G.canvas(size, size); const x = c.getContext('2d');
    const s = G.hero(H, 0);
    const k = size / 40;
    x.drawImage(s.c, size / 2 - s.w * k / 2, size / 2 - s.h * k / 2 + 6 * k, s.w * k, s.h * k);
    return c;
  };
  G.lantern = function (col) {
    return G.spr('lantern' + (col || ''), 12, 18, (x) => {
      x.strokeStyle = OUT; x.lineWidth = 1.2; x.beginPath(); x.arc(0, -6, 3, Math.PI, 0); x.stroke();
      rrect(x, 0, -4, 8, 2.5, 1, '#4a3420', 1);
      rrect(x, 0, 1.5, 7, 8, 2, col || '#ffd36a', 1.2);
      ell(x, 0, 1.5, 2, 3, '#fff8d0');
      rrect(x, 0, 6.5, 8, 2.5, 1, '#4a3420', 1);
    });
  };

  // ───── MONSTRES ─────
  const ARCH = {};
  G.mon = function (d, f) {
    const L = d.L, r = d.r * (L.sc ? 1 : 1);
    const key = 'mon_' + d.id + '_' + f;
    const pad = (L.a === 'wyrm' || L.a === 'hydra' || L.a === 'root' || L.a === 'mistlord') ? 3.4 : (L.antlers ? 3.4 : 2.9);
    return G.spr(key, r * pad, r * pad, (x) => (ARCH[L.a] || ARCH.blob)(x, r, L, f, d));
  };

  ARCH.quad = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.4, r * 0.1);
    const sw = Math.sin(f / 4 * TAU) * r * 0.16;
    const by = L.low ? r * 0.1 : 0;
    // queue
    if (L.tail) { x.strokeStyle = c2; x.lineWidth = r * 0.1; x.beginPath(); x.moveTo(-r * 0.8, by); x.quadraticCurveTo(-r * 1.3, by - r * 0.2 + sw, -r * 1.35, by + r * 0.3); x.stroke(); }
    else if (!L.low) poly(x, [-r * 0.75, by - r * 0.15, -r * 1.25, by - r * 0.45 - sw * 0.5, -r * 1.05, by + r * 0.05], c1, lw);
    else poly(x, [-r * 0.7, by - r * 0.1, -r * 1.4, by + r * 0.05, -r * 0.7, by + r * 0.25], c1, lw);
    // pattes
    const ly = by + r * 0.35, lh = L.low ? r * 0.35 : r * 0.55;
    for (const [lx, s] of [[-r * 0.5, 1], [r * 0.45, -1], [-r * 0.3, -1], [r * 0.62, 1]]) rrect(x, lx + sw * s, ly + lh / 2, r * 0.22, lh, r * 0.08, c1, lw);
    // corps
    ell(x, 0, by, r * 0.88, L.low ? r * 0.42 : r * 0.55, c0, lw);
    shadeEll(x, 0, by, r * 0.88, L.low ? r * 0.42 : r * 0.55);
    if (L.spikes) for (let i = 0; i < 4; i++) poly(x, [-r * 0.5 + i * r * 0.3, by - r * 0.45, -r * 0.35 + i * r * 0.3, by - r * 0.85, -r * 0.2 + i * r * 0.3, by - r * 0.45], c2, lw * 0.7);
    ell(x, r * 0.05, by + r * 0.25, r * 0.5, r * 0.2, G.rgba(c2 === '#fff' ? '#ffffff' : c2, 0.35));
    // tête
    const hx = r * 0.78, hy = by - (L.low ? r * 0.05 : r * 0.3);
    if (L.ears) { poly(x, [hx - r * 0.25, hy - r * 0.2, hx - r * 0.1, hy - r * 0.75, hx + r * 0.08, hy - r * 0.25], c1, lw); poly(x, [hx + 0.05 * r, hy - r * 0.25, hx + r * 0.2, hy - r * 0.7, hx + r * 0.32, hy - r * 0.2], c0, lw); }
    if (L.horns) { x.strokeStyle = OUT; x.lineWidth = r * 0.2; x.beginPath(); x.moveTo(hx - r * 0.1, hy - r * 0.25); x.quadraticCurveTo(hx - r * 0.5, hy - r * 0.9, hx - r * 0.75, hy - r * 0.3); x.stroke(); x.strokeStyle = c2; x.lineWidth = r * 0.12; x.stroke(); }
    if (L.antlers) {
      x.strokeStyle = OUT; x.lineWidth = r * 0.16;
      const ant = () => { x.beginPath(); x.moveTo(hx, hy - r * 0.3); x.lineTo(hx - r * 0.2, hy - r * 1.1); x.lineTo(hx - r * 0.6, hy - r * 1.5); x.moveTo(hx - r * 0.2, hy - r * 1.1); x.lineTo(hx + r * 0.3, hy - r * 1.55); x.moveTo(hx - r * 0.1, hy - r * 0.7); x.lineTo(hx - r * 0.6, hy - r * 0.9); x.moveTo(hx - r * 0.4, hy - r * 1.3); x.lineTo(hx - r * 0.75, hy - r * 1.2); x.stroke(); };
      ant(); x.strokeStyle = c2; x.lineWidth = r * 0.08; ant();
      for (const [a, b] of [[hx - r * 0.6, hy - r * 1.5], [hx + r * 0.3, hy - r * 1.55], [hx - r * 0.75, hy - r * 1.2]]) ell(x, a, b, r * 0.09, r * 0.09, '#d9ff8a');
    }
    const snout = L.snout ? 1 : 0;
    ell(x, hx, hy, r * (0.38 + snout * 0.05), r * 0.34, c0, lw);
    ell(x, hx + r * (0.3 + snout * 0.35), hy + r * 0.1, r * (0.22 + snout * 0.3), r * (0.17 - snout * 0.03), G.shade(c0, 0.12), lw);
    ell(x, hx + r * (0.48 + snout * 0.62), hy + r * 0.05, r * 0.07, r * 0.06, OUT);
    if (L.tusk) poly(x, [hx + r * 0.35, hy + r * 0.2, hx + r * 0.5, hy - r * 0.05, hx + r * 0.45, hy + r * 0.25], c2, lw * 0.6);
    const ey = [hx + r * 0.12, hy - r * 0.08];
    eye(x, ey[0], ey[1], r * 0.1, L.eye);
    return { eyes: [ey] };
  };

  ARCH.blob = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.4, r * 0.1);
    const sq = Math.sin(f / 4 * TAU) * 0.08;
    const rx = r * (L.long ? 1.05 : 0.92) * (1 + sq), ry = r * (L.long ? 0.6 : 0.8) * (1 - sq);
    if (L.tent) for (let i = 0; i < 5; i++) { x.strokeStyle = OUT; x.lineWidth = r * 0.16; x.beginPath(); const sx = -r * 0.6 + i * r * 0.3; x.moveTo(sx, r * 0.4); x.quadraticCurveTo(sx + Math.sin(f + i) * r * 0.3, r * 0.9, sx + Math.cos(f + i) * r * 0.2, r * 1.15); x.stroke(); x.strokeStyle = c1; x.lineWidth = r * 0.09; x.stroke(); }
    x.beginPath();
    for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; const w = 1 + Math.sin(a * 3 + f * 1.5) * 0.05; const px = Math.cos(a) * rx * w, py = Math.sin(a) * ry * w + (Math.sin(a) > 0 ? ry * 0.12 : 0); i ? x.lineTo(px, py + r * 0.1) : x.moveTo(px, py + r * 0.1); }
    x.closePath(); x.fillStyle = c0; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
    shadeEll(x, 0, r * 0.1, rx, ry);
    ell(x, -rx * 0.35, -ry * 0.35, rx * 0.18, ry * 0.12, 'rgba(255,255,255,0.45)');
    if (L.long) { ell(x, rx * 0.8, r * 0.1, r * 0.25, r * 0.28, c1, lw); ell(x, rx * 0.86, r * 0.1, r * 0.12, r * 0.15, '#2a0a14'); }
    const e1 = [rx * (L.long ? 0.35 : 0.1), -ry * 0.15], e2 = [rx * (L.long ? 0.55 : 0.45), -ry * 0.18];
    eye(x, e1[0], e1[1], r * 0.13, L.eye); eye(x, e2[0], e2[1], r * 0.11, L.eye);
    if (!L.long) { x.strokeStyle = OUT; x.lineWidth = lw * 0.8; x.beginPath(); x.arc(rx * 0.3, ry * 0.2, r * 0.15, 0.2, Math.PI - 0.2); x.stroke(); }
    return { eyes: [e1, e2] };
  };

  ARCH.mush = function (x, r, L, f) {
    const [c0, c1] = L.c; const lw = Math.max(1.4, r * 0.1);
    const st = Math.sin(f / 4 * TAU) * r * 0.12;
    rrect(x, -r * 0.25 + st, r * 0.85, r * 0.28, r * 0.25, r * 0.1, G.shade(c1, -0.4), lw);
    rrect(x, r * 0.25 - st, r * 0.85, r * 0.28, r * 0.25, r * 0.1, G.shade(c1, -0.4), lw);
    rrect(x, 0, r * 0.35, r * (L.wide ? 0.9 : 0.7), r * 0.85, r * 0.25, c1, lw);
    const cw = r * (L.wide ? 1.25 : 1.05), ch = r * (L.wide ? 0.7 : 0.8);
    x.beginPath(); x.ellipse(0, -r * 0.05, cw, ch, 0, Math.PI, 0); x.quadraticCurveTo(0, r * 0.2, -cw, -r * 0.05); x.closePath();
    x.fillStyle = c0; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
    x.save(); x.clip(); x.fillStyle = 'rgba(255,255,255,0.2)'; x.beginPath(); x.ellipse(-cw * 0.35, -ch * 0.6, cw * 0.4, ch * 0.3, -0.3, 0, TAU); x.fill(); x.restore();
    if (L.dots) for (const [a, b, s] of [[-0.5, -0.45, 0.16], [0.2, -0.6, 0.13], [0.55, -0.25, 0.11], [-0.1, -0.2, 0.09]]) ell(x, cw * a, ch * b, r * s, r * s * 0.9, '#fff');
    if (L.wide) for (let i = 0; i < 5; i++) ell(x, -cw * 0.6 + i * cw * 0.3, -ch * 0.35 - Math.sin(i) * 3, r * 0.07, r * 0.07, G.shade(c0, -0.3));
    const e1 = [-r * 0.12, r * 0.3], e2 = [r * 0.22, r * 0.3];
    eye(x, e1[0], e1[1], r * 0.1, L.eye === '#1a1a1a' || L.eye === '#3a2a1a' ? '#ffcf4a' : L.eye); eye(x, e2[0], e2[1], r * 0.1, L.eye === '#1a1a1a' || L.eye === '#3a2a1a' ? '#ffcf4a' : L.eye);
    return { eyes: [e1, e2] };
  };

  ARCH.bug = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.3, r * 0.09);
    const n = L.legs || 6;
    x.strokeStyle = OUT; x.lineWidth = r * 0.12;
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1, k = Math.floor(i / 2) / (n / 2 - 1 || 1);
      const lx = -r * 0.3 + k * r * 0.6, sw = Math.sin(f / 4 * TAU + i) * r * 0.15;
      x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx + (k - 0.5) * r * 0.6 + sw, s * r * 0.6); x.lineTo(lx + (k - 0.5) * r * 1.1 + sw, s * r * 0.95); x.stroke();
    }
    ell(x, -r * 0.35, 0, r * 0.62, r * 0.55, c0, lw); shadeEll(x, -r * 0.35, 0, r * 0.62, r * 0.55);
    if (n === 8) { x.strokeStyle = c2; x.lineWidth = r * 0.07; x.beginPath(); x.moveTo(-r * 0.6, -r * 0.2); x.lineTo(-r * 0.2, r * 0.2); x.moveTo(-r * 0.6, r * 0.2); x.lineTo(-r * 0.2, -r * 0.2); x.stroke(); }
    ell(x, r * 0.35, 0, r * 0.4, r * 0.36, c1, lw);
    const e1 = [r * 0.55, -r * 0.13], e2 = [r * 0.55, r * 0.13];
    eye(x, e1[0], e1[1], r * 0.09, L.eye); eye(x, e2[0], e2[1], r * 0.09, L.eye);
    if (n === 8) { eye(x, r * 0.42, -r * 0.22, r * 0.06, L.eye); eye(x, r * 0.42, r * 0.22, r * 0.06, L.eye); }
    return { eyes: [e1, e2] };
  };

  ARCH.hum = function (x, r, L, f, d) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.4, r * 0.1);
    const st = [0, 1, 0, -1][f % 4] * r * 0.15;
    const hunch = L.hunch ? r * 0.15 : 0;
    // arme arrière
    if (L.scythe) { x.strokeStyle = OUT; x.lineWidth = r * 0.14; x.beginPath(); x.moveTo(-r * 0.6, r * 0.9); x.lineTo(r * 0.5, -r * 1.2); x.stroke(); x.strokeStyle = '#6a5a4a'; x.lineWidth = r * 0.07; x.stroke(); x.beginPath(); x.moveTo(r * 0.5, -r * 1.2); x.quadraticCurveTo(r * 1.3, -r * 1.1, r * 1.4, -r * 0.4); x.quadraticCurveTo(r * 1.0, -r * 0.9, r * 0.45, -r * 0.95); x.fillStyle = c2; x.fill(); x.lineWidth = lw * 0.8; x.strokeStyle = OUT; x.stroke(); }
    if (L.staff) { x.strokeStyle = OUT; x.lineWidth = r * 0.13; x.beginPath(); x.moveTo(r * 0.75, r * 0.95); x.lineTo(r * 0.75, -r * 1.1); x.stroke(); x.strokeStyle = '#5a3a2a'; x.lineWidth = r * 0.06; x.stroke(); ell(x, r * 0.75, -r * 1.2, r * 0.17, r * 0.17, c2, lw * 0.7); }
    // jambes
    const lc = L.bones ? c0 : G.shade(c0, -0.35);
    rrect(x, -r * 0.22 + st, r * 0.7, r * 0.24, r * 0.5, r * 0.08, lc, lw);
    rrect(x, r * 0.22 - st, r * 0.7, r * 0.24, r * 0.5, r * 0.08, lc, lw);
    // corps
    if (L.bones) {
      rrect(x, 0, r * 0.12, r * 0.18, r * 0.8, r * 0.05, c0, lw * 0.8);
      x.strokeStyle = OUT; x.lineWidth = lw; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(0, -r * 0.1 + i * r * 0.18, r * 0.38 - i * r * 0.04, r * 0.06, 0, 0, TAU); x.stroke(); x.strokeStyle = c0; x.lineWidth = lw * 0.5; x.stroke(); x.strokeStyle = OUT; x.lineWidth = lw; }
    } else {
      poly(x, [-r * 0.42, -r * 0.3 + hunch, r * 0.42, -r * 0.3 + hunch, r * 0.55, r * 0.55, -r * 0.55, r * 0.55], c0, lw);
      x.save(); x.beginPath(); x.moveTo(-r * 0.42, -r * 0.3); x.lineTo(r * 0.42, -r * 0.3); x.lineTo(r * 0.55, r * 0.55); x.lineTo(-r * 0.55, r * 0.55); x.clip(); x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(r * 0.15, -r * 0.4, r * 0.6, r); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(-r * 0.6, -r * 0.4, r * 0.3, r); x.restore();
    }
    // bras
    const ac = L.bones ? c0 : G.shade(c0, 0.1);
    rrect(x, -r * 0.5, r * 0.05 + hunch - st * 0.5, r * 0.2, r * 0.6, r * 0.08, ac, lw);
    rrect(x, r * 0.52, r * 0.05 + hunch + st * 0.5, r * 0.2, r * 0.6, r * 0.08, ac, lw);
    if (L.bow) { x.strokeStyle = OUT; x.lineWidth = r * 0.12; x.beginPath(); x.arc(r * 0.6, r * 0.05, r * 0.55, -1.2, 1.2); x.stroke(); x.strokeStyle = c2; x.lineWidth = r * 0.06; x.stroke(); }
    // tête
    const hy = -r * 0.62 + hunch;
    if (L.hood) {
      x.beginPath(); x.moveTo(-r * 0.5, hy + r * 0.4); x.quadraticCurveTo(-r * 0.55, hy - r * 0.6, 0, hy - r * 0.62); x.quadraticCurveTo(r * 0.6, hy - r * 0.55, r * 0.5, hy + r * 0.4); x.closePath();
      x.fillStyle = G.shade(c0, -0.15); x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
      ell(x, r * 0.08, hy + r * 0.05, r * 0.3, r * 0.3, '#0a0610');
    } else {
      ell(x, 0, hy, r * 0.42, r * 0.4, c1 === '#a8a090' || L.bones ? c0 : (L.c[1] && d.id === 's_drowned' ? '#7a9a9a' : G.shade(c1, 0.25)), lw);
      shadeEll(x, 0, hy, r * 0.42, r * 0.4);
      if (L.bones) { ell(x, r * 0.08, hy + r * 0.22, r * 0.2, r * 0.08, OUT); }
      if (L.ears) { poly(x, [-r * 0.35, hy, -r * 0.8, hy - r * 0.3, -r * 0.3, hy - r * 0.2], G.shade(c1, 0.2), lw * 0.8); poly(x, [r * 0.35, hy, r * 0.8, hy - r * 0.3, r * 0.3, hy - r * 0.2], G.shade(c1, 0.2), lw * 0.8); }
      if (L.hat) { poly(x, [-r * 0.65, hy - r * 0.2, r * 0.65, hy - r * 0.2, r * 0.1, hy - r * 1.3, -r * 0.3, hy - r * 1.0], c1, lw); rrect(x, 0, hy - r * 0.25, r * 1.4, r * 0.14, r * 0.05, c1, lw * 0.8); }
      if (L.leaf) { x.strokeStyle = OUT; x.lineWidth = lw * 0.7; x.beginPath(); x.moveTo(0, hy - r * 0.38); x.lineTo(0, hy - r * 0.7); x.stroke(); ell(x, -r * 0.15, hy - r * 0.72, r * 0.18, r * 0.09, c2, lw * 0.6, -0.5); ell(x, r * 0.15, hy - r * 0.78, r * 0.18, r * 0.09, c2, lw * 0.6, 0.5); }
    }
    const e1 = [r * 0.0, hy], e2 = [r * 0.2, hy];
    eye(x, e1[0], e1[1], r * 0.08, L.eye); eye(x, e2[0], e2[1], r * 0.08, L.eye);
    return { eyes: [e1, e2] };
  };

  ARCH.wisp = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.2, r * 0.08);
    const fl = Math.sin(f / 4 * TAU) * r * 0.12;
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r * 1.4);
    g.addColorStop(0, G.rgba(c0, 0.5)); g.addColorStop(1, G.rgba(c0, 0));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 1.4, 0, TAU); x.fill();
    x.beginPath();
    if (L.ghost) {
      x.moveTo(-r * 0.7, r * 0.1); x.quadraticCurveTo(-r * 0.75, -r * 0.95, 0, -r * 0.95); x.quadraticCurveTo(r * 0.75, -r * 0.95, r * 0.7, r * 0.1);
      for (let i = 0; i <= 4; i++) x.lineTo(r * 0.7 - i * r * 0.35, r * (0.75 + (i % 2 ? -0.2 : 0.1)) + (i % 2 ? fl : -fl));
    } else if (L.crystal) {
      x.moveTo(0, -r); x.lineTo(r * 0.65, -r * 0.1); x.lineTo(r * 0.2, r * 0.85); x.lineTo(-r * 0.4, r * 0.7); x.lineTo(-r * 0.65, -r * 0.2);
    } else {
      x.moveTo(0, -r * 1.15 - fl); x.quadraticCurveTo(r * 0.55, -r * 0.55, r * 0.72, r * 0.15); x.quadraticCurveTo(r * 0.7, r * 0.85, 0, r * 0.85); x.quadraticCurveTo(-r * 0.7, r * 0.85, -r * 0.72, r * 0.15); x.quadraticCurveTo(-r * 0.5, -r * 0.4, 0, -r * 1.15 - fl);
    }
    x.closePath(); x.fillStyle = c1; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
    x.save(); x.clip(); ell(x, 0, r * 0.15, r * 0.5, r * 0.55, c0); ell(x, -r * 0.1, r * 0.2, r * 0.25, r * 0.3, c2); x.restore();
    const e1 = [-r * 0.2, -r * 0.05], e2 = [r * 0.22, -r * 0.05];
    ell(x, e1[0], e1[1], r * 0.12, r * 0.16, L.ghost || L.crystal ? '#1a1030' : OUT); ell(x, e2[0], e2[1], r * 0.12, r * 0.16, L.ghost || L.crystal ? '#1a1030' : OUT);
    ell(x, e1[0], e1[1] - r * 0.02, r * 0.05, r * 0.06, L.eye); ell(x, e2[0], e2[1] - r * 0.02, r * 0.05, r * 0.06, L.eye);
    return { eyes: [e1, e2] };
  };

  ARCH.brute = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.6, r * 0.09);
    const st = [0, 1, 0, -1][f % 4] * r * 0.1;
    if (L.statue) rrect(x, 0, r * 0.85, r * 1.4, r * 0.35, r * 0.06, G.shade(c0, -0.25), lw);
    rrect(x, -r * 0.35 + st, r * 0.75, r * 0.38, r * 0.45, r * 0.1, c1, lw);
    rrect(x, r * 0.35 - st, r * 0.75, r * 0.38, r * 0.45, r * 0.1, c1, lw);
    // bras
    rrect(x, -r * 0.82, r * 0.12 - st, r * 0.38, r * 0.95, r * 0.16, c1, lw);
    rrect(x, r * 0.82, r * 0.12 + st, r * 0.38, r * 0.95, r * 0.16, c1, lw);
    // torse
    rrect(x, 0, -r * 0.05, r * 1.45, r * 1.15, r * 0.35, c0, lw);
    x.save(); rrect(x, 0, -r * 0.05, r * 1.45, r * 1.15, r * 0.35); x.clip();
    x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(r * 0.2, -r * 0.8, r, r * 1.6); x.fillStyle = 'rgba(255,255,255,0.14)'; x.fillRect(-r * 0.8, -r * 0.8, r * 0.4, r * 1.6);
    if (L.fur) { x.strokeStyle = G.shade(c0, -0.15); x.lineWidth = r * 0.06; for (let i = 0; i < 12; i++) { const px = -r * 0.6 + (i % 4) * r * 0.4, py = -r * 0.4 + Math.floor(i / 4) * r * 0.35; x.beginPath(); x.moveTo(px, py); x.lineTo(px + r * 0.08, py + r * 0.18); x.stroke(); } }
    x.restore();
    if (L.moss) { ell(x, -r * 0.45, -r * 0.55, r * 0.35, r * 0.18, c2, lw * 0.6); ell(x, r * 0.35, -r * 0.6, r * 0.28, r * 0.15, c2, lw * 0.6); ell(x, r * 0.8, -r * 0.35, r * 0.2, r * 0.12, c2, lw * 0.6); }
    if (L.runes) { x.strokeStyle = c2; x.lineWidth = r * 0.07; x.shadowColor = c2; x.shadowBlur = r * 0.4; x.beginPath(); x.moveTo(-r * 0.3, -r * 0.1); x.lineTo(-r * 0.1, r * 0.25); x.lineTo(r * 0.15, -r * 0.05); x.lineTo(r * 0.35, r * 0.3); x.stroke(); x.shadowBlur = 0; }
    if (L.ice) { poly(x, [-r * 0.75, -r * 0.5, -r * 0.6, -r * 1.05, -r * 0.4, -r * 0.5], c2, lw * 0.7); poly(x, [r * 0.45, -r * 0.55, r * 0.7, -r * 1.15, r * 0.85, -r * 0.45], c2, lw * 0.7); }
    if (L.spikes) for (let i = 0; i < 5; i++) poly(x, [-r * 0.6 + i * r * 0.3, -r * 0.55, -r * 0.5 + i * r * 0.3, -r * 1.0, -r * 0.4 + i * r * 0.3, -r * 0.55], c2, lw * 0.6);
    // tête
    ell(x, r * 0.1, -r * 0.55, r * 0.38, r * 0.32, G.shade(c0, 0.08), lw);
    const e1 = [-r * 0.02, -r * 0.58], e2 = [r * 0.25, -r * 0.58];
    eye(x, e1[0], e1[1], r * 0.08, L.eye); eye(x, e2[0], e2[1], r * 0.08, L.eye);
    return { eyes: [e1, e2] };
  };

  ARCH.fly = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.3, r * 0.09);
    const wa = Math.sin(f / 4 * TAU) * 0.7;
    const wing = (s) => {
      x.save(); x.rotate(s * (0.3 + wa));
      x.beginPath(); x.moveTo(0, -r * 0.1);
      if (L.thin) { x.ellipse(-r * 0.2, -r * 0.75 * s, r * 0.35, r * 0.75, -0.3 * s, 0, TAU); x.fillStyle = 'rgba(220,240,255,0.55)'; x.fill(); x.lineWidth = lw * 0.6; x.strokeStyle = OUT; x.stroke(); }
      else { x.quadraticCurveTo(-r * 0.4, -r * 1.3 * s, -r * 1.2, -r * 1.0 * s); x.quadraticCurveTo(-r * 0.8, -r * 0.5 * s, -r * 0.9, -r * 0.2 * s); x.quadraticCurveTo(-r * 0.5, -r * 0.3 * s, -r * 0.2, 0); x.closePath(); x.fillStyle = c1; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke(); }
      x.restore();
    };
    wing(1); wing(-1);
    if (L.thin) { x.strokeStyle = OUT; x.lineWidth = r * 0.06; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-r * 0.1 + i * r * 0.15, r * 0.2); x.lineTo(-r * 0.3 + i * r * 0.2, r * 0.9); x.stroke(); } }
    ell(x, 0, 0, r * (L.thin ? 0.55 : 0.6), r * (L.thin ? 0.32 : 0.48), c0, lw); shadeEll(x, 0, 0, r * 0.6, r * 0.48);
    const hx = r * 0.55;
    ell(x, hx, -r * 0.15, r * 0.3, r * 0.28, L.feather ? c2 : G.shade(c0, 0.1), lw);
    if (L.thin) { x.strokeStyle = OUT; x.lineWidth = r * 0.07; x.beginPath(); x.moveTo(hx + r * 0.25, -r * 0.1); x.lineTo(hx + r * 0.75, r * 0.1); x.stroke(); }
    if (L.horns) { poly(x, [hx - r * 0.15, -r * 0.35, hx - r * 0.3, -r * 0.75, hx, -r * 0.4], c2, lw * 0.7); poly(x, [hx + r * 0.05, -r * 0.38, hx + r * 0.1, -r * 0.8, hx + r * 0.2, -r * 0.35], c2, lw * 0.7); }
    if (L.feather) { x.fillStyle = c1; poly(x, [hx - r * 0.2, -r * 0.35, hx - r * 0.1, -r * 0.7, hx + r * 0.15, -r * 0.4], c1, lw * 0.6); }
    const e1 = [hx + r * 0.08, -r * 0.2];
    eye(x, e1[0], e1[1], r * 0.09, L.eye);
    return { eyes: [e1] };
  };

  ARCH.eye = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.4, r * 0.09);
    for (let i = 0; i < 4; i++) { x.strokeStyle = OUT; x.lineWidth = r * 0.15; x.beginPath(); const sx = -r * 0.45 + i * r * 0.3; x.moveTo(sx, r * 0.5); x.quadraticCurveTo(sx + Math.sin(f * 1.5 + i) * r * 0.3, r * 0.95, sx - Math.sin(f + i) * r * 0.2, r * 1.25); x.stroke(); x.strokeStyle = c1; x.lineWidth = r * 0.08; x.stroke(); }
    ell(x, 0, 0, r * 0.82, r * 0.8, c0, lw); shadeEll(x, 0, 0, r * 0.82, r * 0.8);
    x.strokeStyle = 'rgba(160,20,40,0.6)'; x.lineWidth = r * 0.04; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; x.beginPath(); x.moveTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.72); x.quadraticCurveTo(Math.cos(a + 0.3) * r * 0.55, Math.sin(a + 0.3) * r * 0.55, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42); x.stroke(); }
    ell(x, r * 0.22, 0, r * 0.4, r * 0.42, c1, lw * 0.7);
    ell(x, r * 0.28, 0, r * 0.2, r * 0.28, '#0a0005');
    ell(x, r * 0.15, -r * 0.15, r * 0.08, r * 0.08, '#fff');
    return { eyes: [[r * 0.28, 0]] };
  };

  ARCH.frog = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.4, r * 0.09);
    const sq = Math.sin(f / 4 * TAU) * 0.06;
    ell(x, -r * 0.55, r * 0.45, r * 0.4, r * 0.25, c1, lw); ell(x, r * 0.55, r * 0.45, r * 0.4, r * 0.25, c1, lw);
    ell(x, 0, r * 0.1, r * 0.95 * (1 + sq), r * 0.65 * (1 - sq), c0, lw); shadeEll(x, 0, r * 0.1, r * 0.95, r * 0.65);
    ell(x, 0, r * 0.35, r * 0.6, r * 0.3, G.rgba(c2, 0.5));
    for (const [a, b] of [[-0.4, -0.1], [0.3, 0.05], [-0.1, -0.3]]) ell(x, r * a, r * b, r * 0.08, r * 0.08, G.shade(c0, -0.3));
    x.strokeStyle = OUT; x.lineWidth = lw; x.beginPath(); x.moveTo(-r * 0.55, r * 0.15); x.quadraticCurveTo(0, r * 0.38, r * 0.55, r * 0.15); x.stroke();
    const e1 = [-r * 0.42, -r * 0.42], e2 = [r * 0.42, -r * 0.42];
    ell(x, e1[0], e1[1], r * 0.26, r * 0.26, c0, lw); ell(x, e2[0], e2[1], r * 0.26, r * 0.26, c0, lw);
    eye(x, e1[0], e1[1], r * 0.15, L.eye); eye(x, e2[0], e2[1], r * 0.15, L.eye);
    if (L.crown) { poly(x, [-r * 0.35, -r * 0.55, -r * 0.4, -r * 0.95, -r * 0.18, -r * 0.75, 0, -r * 1.05, r * 0.18, -r * 0.75, r * 0.4, -r * 0.95, r * 0.35, -r * 0.55], '#ffcf2a', lw * 0.8); ell(x, 0, -r * 0.7, r * 0.07, r * 0.07, '#ff3a5a'); }
    return { eyes: [e1, e2] };
  };

  ARCH.mimic = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.5, r * 0.09);
    const open = 0.2 + Math.abs(Math.sin(f / 4 * TAU)) * 0.35;
    rrect(x, 0, r * 0.3, r * 1.6, r * 0.9, r * 0.12, c0, lw);
    x.fillStyle = '#3a0a14'; x.fillRect(-r * 0.7, -r * 0.15 - open * r * 0.5, r * 1.4, open * r * 0.6);
    for (let i = 0; i < 6; i++) { poly(x, [-r * 0.65 + i * r * 0.26, -r * 0.15, -r * 0.55 + i * r * 0.26, -r * 0.15 + r * 0.2, -r * 0.45 + i * r * 0.26, -r * 0.15], '#fff', 0.6); }
    x.save(); x.translate(0, -r * 0.15 - open * r * 0.55); rrect(x, 0, -r * 0.25, r * 1.6, r * 0.5, r * 0.15, c0, lw); x.restore();
    rrect(x, 0, r * 0.3, r * 1.6, r * 0.12, 0, c2, 0);
    ell(x, 0, r * 0.35, r * 0.12, r * 0.14, c2, lw * 0.7);
    ell(x, r * 0.1, r * 0.05, r * 0.3, r * 0.1, '#ff5a7a');
    const e1 = [-r * 0.35, -r * 0.55 - open * r * 0.5], e2 = [r * 0.35, -r * 0.55 - open * r * 0.5];
    eye(x, e1[0], e1[1], r * 0.1, L.eye); eye(x, e2[0], e2[1], r * 0.1, L.eye);
    return { eyes: [e1, e2] };
  };

  // ───── Boss spéciaux ─────
  ARCH.root = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(2, r * 0.06);
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i / 6 * 0.9); x.strokeStyle = OUT; x.lineWidth = r * 0.22; x.beginPath(); x.moveTo(0, r * 0.5); x.quadraticCurveTo(Math.cos(a) * r * 0.9, r * 0.6 + Math.sin(f + i) * 4, Math.cos(a) * r * 1.5, r * 0.85 + Math.sin(a) * r * 0.3); x.stroke(); x.strokeStyle = c1; x.lineWidth = r * 0.13; x.stroke(); }
    // couronne de branches
    for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.1 + i / 5 * 0.8); x.strokeStyle = OUT; x.lineWidth = r * 0.16; x.beginPath(); x.moveTo(0, -r * 0.6); x.quadraticCurveTo(Math.cos(a) * r * 0.8, -r * 0.6 + Math.sin(a) * r * 0.9, Math.cos(a) * r * 1.3, -r * 0.5 + Math.sin(a) * r * 1.2); x.stroke(); x.strokeStyle = c1; x.lineWidth = r * 0.08; x.stroke(); ell(x, Math.cos(a) * r * 1.3, -r * 0.5 + Math.sin(a) * r * 1.2, r * 0.3, r * 0.22, c2, lw); }
    rrect(x, 0, 0, r * 1.2, r * 1.6, r * 0.45, c0, lw);
    x.save(); rrect(x, 0, 0, r * 1.2, r * 1.6, r * 0.45); x.clip(); x.strokeStyle = G.shade(c0, -0.3); x.lineWidth = r * 0.05; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(-r * 0.5 + i * r * 0.25, -r * 0.8); x.quadraticCurveTo(-r * 0.4 + i * r * 0.25, 0, -r * 0.55 + i * r * 0.25, r * 0.8); x.stroke(); } x.restore();
    ell(x, 0, r * 0.25, r * 0.3, r * 0.2 + Math.sin(f) * 2, '#1a0a05', lw);
    const e1 = [-r * 0.25, -r * 0.2], e2 = [r * 0.25, -r * 0.2];
    ell(x, e1[0], e1[1], r * 0.16, r * 0.12, '#1a0a05'); ell(x, e2[0], e2[1], r * 0.16, r * 0.12, '#1a0a05');
    ell(x, e1[0], e1[1], r * 0.08, r * 0.07, L.eye); ell(x, e2[0], e2[1], r * 0.08, r * 0.07, L.eye);
    return { eyes: [e1, e2] };
  };
  ARCH.hydra = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(2, r * 0.06);
    ell(x, 0, r * 0.75, r * 1.4, r * 0.4, 'rgba(40,30,60,0.6)');
    const heads = [[-0.85, -0.6], [0, -1.05], [0.85, -0.6]];
    const eyes = [];
    heads.forEach(([hx, hy], i) => {
      const sw = Math.sin(f / 4 * TAU + i * 2) * r * 0.1;
      x.strokeStyle = OUT; x.lineWidth = r * 0.42; x.beginPath(); x.moveTo(hx * r * 0.4, r * 0.4); x.quadraticCurveTo(hx * r * 0.9, r * 0.0, hx * r + sw, hy * r); x.stroke();
      x.strokeStyle = c0; x.lineWidth = r * 0.32; x.stroke();
      x.strokeStyle = G.rgba(c2, 0.4); x.lineWidth = r * 0.1; x.stroke();
      ell(x, hx * r + sw, hy * r, r * 0.32, r * 0.26, c0, lw); shadeEll(x, hx * r + sw, hy * r, r * 0.32, r * 0.26);
      ell(x, hx * r + sw + r * 0.12, hy * r + r * 0.12, r * 0.2, r * 0.1, c1, lw * 0.7);
      poly(x, [hx * r + sw - r * 0.2, hy * r - r * 0.18, hx * r + sw - r * 0.3, hy * r - r * 0.45, hx * r + sw - r * 0.05, hy * r - r * 0.22], c2, lw * 0.6);
      eye(x, hx * r + sw + r * 0.05, hy * r - r * 0.05, r * 0.07, L.eye);
      eyes.push([hx * r + sw + r * 0.05, hy * r - r * 0.05]);
    });
    ell(x, 0, r * 0.5, r * 1.0, r * 0.5, c0, lw); shadeEll(x, 0, r * 0.5, r * 1.0, r * 0.5);
    return { eyes: eyes };
  };
  ARCH.lich = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.8, r * 0.07);
    const fl = Math.sin(f / 4 * TAU) * r * 0.08;
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r * 1.4); g.addColorStop(0, G.rgba(c2, 0.35)); g.addColorStop(1, G.rgba(c2, 0)); x.fillStyle = g; x.fillRect(-r * 1.5, -r * 1.5, r * 3, r * 3);
    x.beginPath(); x.moveTo(-r * 0.55, -r * 0.4); x.lineTo(r * 0.55, -r * 0.4); x.lineTo(r * 0.8, r * 1.0 + fl);
    for (let i = 0; i < 5; i++) x.lineTo(r * 0.8 - (i + 0.5) * r * 0.32, r * (i % 2 ? 1.0 : 0.75) + fl);
    x.lineTo(-r * 0.8, r * 1.0 + fl); x.closePath(); x.fillStyle = c0; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
    x.save(); x.clip(); x.fillStyle = c1; x.fillRect(-r * 0.12, -r * 0.4, r * 0.24, r * 1.5); x.restore();
    rrect(x, -r * 0.75, r * 0.1, r * 0.25, r * 0.8, r * 0.1, c0, lw); rrect(x, r * 0.75, r * 0.1, r * 0.25, r * 0.8, r * 0.1, c0, lw);
    // livre
    rrect(x, r * 0.85, r * 0.45, r * 0.55, r * 0.4, r * 0.05, '#6a3a1a', lw); x.fillStyle = c2; x.fillRect(r * 0.62, r * 0.35, r * 0.46, r * 0.04);
    ell(x, 0, -r * 0.7, r * 0.38, r * 0.4, '#e8e0c8', lw); ell(x, 0, -r * 0.52, r * 0.18, r * 0.08, OUT);
    poly(x, [-r * 0.4, -r * 0.95, -r * 0.35, -r * 1.35, -r * 0.15, -r * 1.05, 0, -r * 1.45, r * 0.15, -r * 1.05, r * 0.35, -r * 1.35, r * 0.4, -r * 0.95], '#c9a43a', lw * 0.8);
    const e1 = [-r * 0.14, -r * 0.72], e2 = [r * 0.14, -r * 0.72];
    ell(x, e1[0], e1[1], r * 0.1, r * 0.11, OUT); ell(x, e2[0], e2[1], r * 0.1, r * 0.11, OUT);
    ell(x, e1[0], e1[1], r * 0.05, r * 0.05, L.eye); ell(x, e2[0], e2[1], r * 0.05, r * 0.05, L.eye);
    return { eyes: [e1, e2] };
  };
  ARCH.wyrm = function (x, r, L, f) { // tête du wyrm (le corps est dessiné à l'exécution)
    const [c0, c1, c2] = L.c; const lw = Math.max(1.8, r * 0.08);
    poly(x, [-r * 0.3, -r * 0.5, -r * 1.0, -r * 1.1, -r * 0.1, -r * 0.7], c2, lw);
    poly(x, [-r * 0.3, r * 0.5, -r * 1.0, r * 1.1, -r * 0.1, r * 0.7], c2, lw);
    ell(x, 0, 0, r * 0.95, r * 0.75, c0, lw); shadeEll(x, 0, 0, r * 0.95, r * 0.75);
    ell(x, r * 0.75, 0, r * 0.55, r * 0.42, c0, lw);
    x.strokeStyle = OUT; x.lineWidth = lw; x.beginPath(); x.moveTo(r * 0.5, r * 0.15); x.lineTo(r * 1.25, r * 0.1); x.stroke();
    for (let i = 0; i < 4; i++) poly(x, [r * (0.6 + i * 0.15), r * 0.12, r * (0.67 + i * 0.15), r * 0.3, r * (0.74 + i * 0.15), r * 0.12], '#fff', 0.5);
    const e1 = [r * 0.55, -r * 0.3], e2 = [r * 0.55, r * 0.3];
    eye(x, e1[0], e1[1], r * 0.12, L.eye); eye(x, e2[0], e2[1], r * 0.12, L.eye);
    return { eyes: [e1, e2] };
  };
  G.wyrmSeg = function (L, r, i) {
    return G.spr('wyrmseg' + Math.round(r) + (i % 2), r * 2.6, r * 2.6, (x) => {
      const [c0, c1, c2] = L.c;
      ell(x, 0, 0, r, r * 0.92, c0, Math.max(1.6, r * 0.08)); shadeEll(x, 0, 0, r, r * 0.92);
      if (i % 2) poly(x, [-r * 0.3, -r * 0.8, 0, -r * 1.3, r * 0.3, -r * 0.8], c2, 1.2);
      ell(x, 0, r * 0.3, r * 0.55, r * 0.3, G.rgba(c2, 0.35));
    });
  };
  ARCH.knight = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(1.8, r * 0.08);
    const st = [0, 1, 0, -1][f % 4] * r * 0.12;
    // épée
    x.save(); x.rotate(-0.5); rrect(x, r * 0.9, -r * 0.4, r * 0.22, r * 1.9, r * 0.05, '#c8ccd8', lw); rrect(x, r * 0.9, r * 0.5, r * 0.6, r * 0.12, r * 0.04, c2, lw * 0.8); x.restore();
    rrect(x, -r * 0.25 + st, r * 0.7, r * 0.3, r * 0.6, r * 0.08, c1, lw); rrect(x, r * 0.25 - st, r * 0.7, r * 0.3, r * 0.6, r * 0.08, c1, lw);
    poly(x, [-r * 0.6, -r * 0.35, r * 0.6, -r * 0.35, r * 0.45, r * 0.5, -r * 0.45, r * 0.5], c0, lw);
    x.fillStyle = G.rgba(c2, 0.6); x.fillRect(-r * 0.05, -r * 0.3, r * 0.1, r * 0.75);
    ell(x, -r * 0.65, -r * 0.35, r * 0.3, r * 0.22, c0, lw); ell(x, r * 0.65, -r * 0.35, r * 0.3, r * 0.22, c0, lw);
    rrect(x, 0, -r * 0.78, r * 0.62, r * 0.62, r * 0.18, G.shade(c0, 0.1), lw);
    x.fillStyle = '#05030a'; x.fillRect(-r * 0.24, -r * 0.82, r * 0.48, r * 0.1);
    poly(x, [0, -r * 1.1, -r * 0.1, -r * 1.5, r * 0.25, -r * 1.35], c2, lw * 0.6);
    const e1 = [-r * 0.1, -r * 0.77], e2 = [r * 0.12, -r * 0.77];
    ell(x, e1[0], e1[1], r * 0.05, r * 0.04, L.eye); ell(x, e2[0], e2[1], r * 0.05, r * 0.04, L.eye);
    return { eyes: [e1, e2] };
  };
  ARCH.mistlord = function (x, r, L, f) {
    const [c0, c1, c2] = L.c; const lw = Math.max(2, r * 0.05);
    const g = x.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6); g.addColorStop(0, G.rgba(c2, 0.35)); g.addColorStop(1, G.rgba(c2, 0)); x.fillStyle = g; x.fillRect(-r * 1.7, -r * 1.7, r * 3.4, r * 3.4);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + f * 0.2; x.strokeStyle = OUT; x.lineWidth = r * 0.2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(Math.cos(a + 0.4) * r * 0.9, Math.sin(a + 0.4) * r * 0.9, Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45); x.stroke(); x.strokeStyle = c1; x.lineWidth = r * 0.11; x.stroke(); }
    x.beginPath(); for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU; const w = 1 + Math.sin(a * 5 + f) * 0.07; i ? x.lineTo(Math.cos(a) * r * 0.95 * w, Math.sin(a) * r * 0.9 * w) : x.moveTo(Math.cos(a) * r * 0.95 * w, 0); }
    x.closePath(); x.fillStyle = c0; x.fill(); x.lineWidth = lw; x.strokeStyle = OUT; x.stroke();
    const eyes = [];
    for (const [a, b, s] of [[0, -0.1, 0.22], [-0.45, -0.35, 0.1], [0.45, -0.38, 0.11], [-0.5, 0.25, 0.08], [0.5, 0.3, 0.09], [0.05, 0.45, 0.07], [-0.2, -0.55, 0.06], [0.25, -0.6, 0.06]]) {
      ell(x, a * r, b * r, s * r * 1.3, s * r, '#ffe0c0', lw * 0.6); ell(x, a * r, b * r, s * r * 0.6, s * r * 0.8, L.eye); ell(x, a * r, b * r, s * r * 0.2, s * r * 0.6, '#000');
      eyes.push([a * r, b * r]);
    }
    return { eyes: eyes };
  };

  // ───── DÉCORS ─────
  const DECO = {};
  G.deco = function (type, v, pal) {
    const key = 'deco_' + type + '_' + v + '_' + pal.g1;
    const D = DECO[type];
    return G.spr(key, D.w, D.h, (x) => D.f(x, v, pal), 2);
  };
  G.DECO = DECO;
  const vr = (v, k) => (Math.sin(v * 12.9898 + k * 78.233) * 43758.5453) % 1;
  DECO.tree = { w: 110, h: 130, tall: 1, f(x, v, p) {
    rrect(x, 0, 38, 16, 40, 5, '#3a2818', 2);
    const greens = ['#1f4a2c', '#24563a', '#2c6b44'];
    for (let i = 0; i < 3; i++) { const s = 1 - i * 0.22; ell(x, (vr(v, i) - 0.5) * 10, 8 - i * 22, 46 * s, 36 * s, greens[i], 2.2); shadeEll(x, 0, 8 - i * 22, 46 * s, 36 * s); }
    for (let i = 0; i < 6; i++) ell(x, (vr(v, i + 3) - 0.5) * 60, (vr(v, i + 9) - 0.5) * 60 - 10, 4, 3, 'rgba(160,230,120,0.35)');
  } };
  DECO.pine = { w: 90, h: 130, tall: 1, f(x, v, p) {
    rrect(x, 0, 45, 12, 30, 4, '#4a3420', 2);
    for (let i = 0; i < 4; i++) { const w = 40 - i * 8, y = 30 - i * 22; poly(x, [-w, y, 0, y - 34, w, y], i % 2 ? '#2a5a4a' : '#24504a', 2); poly(x, [-w * 0.9, y - 2, -w * 0.2, y - 18, w * 0.6, y - 4, w * 0.9, y - 2], 'rgba(240,250,255,0.85)', 0); }
  } };
  DECO.deadtree = { w: 90, h: 120, tall: 1, f(x, v, p) {
    x.strokeStyle = OUT; x.lineWidth = 10; const tr = () => { x.beginPath(); x.moveTo(0, 55); x.lineTo(2, 0); x.lineTo(-20, -40); x.moveTo(2, 0); x.lineTo(25, -30); x.lineTo(35, -50); x.moveTo(-10, -20); x.lineTo(-35, -25); x.stroke(); };
    tr(); x.strokeStyle = '#3a3440'; x.lineWidth = 6; tr();
  } };
  DECO.bush = { w: 60, h: 46, f(x, v, p) { for (let i = 0; i < 3; i++) ell(x, -14 + i * 14, 4 - (i === 1 ? 8 : 0), 15, 13, i === 1 ? '#2f6b44' : '#26583a', 2); ell(x, 6, -4, 2.5, 2.5, '#ff6a8a'); ell(x, -10, 2, 2.5, 2.5, '#ff6a8a'); } };
  DECO.mushroom = { w: 30, h: 30, glow: '#7affe0', f(x, v, p) { rrect(x, 0, 6, 6, 10, 2, '#e8dcc0', 1.5); x.beginPath(); x.ellipse(0, 0, 10, 8, 0, Math.PI, 0); x.closePath(); x.fillStyle = '#5affd0'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = OUT; x.stroke(); ell(x, -3, -4, 2, 1.5, '#e0fff8'); } };
  DECO.grass = { w: 30, h: 24, flat: 1, f(x, v, p) { x.strokeStyle = G.shade(p.g2, 0.25); x.lineWidth = 2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-8 + i * 3, 8); x.quadraticCurveTo(-8 + i * 3 + (vr(v, i) - 0.5) * 6, 0, -8 + i * 3 + (vr(v, i + 1) - 0.5) * 10, -6 - vr(v, i + 2) * 6); x.stroke(); } } };
  DECO.flower = { w: 24, h: 24, flat: 1, f(x, v, p) { const c = ['#ff8ab0', '#ffe07a', '#b48aff', '#8ad0ff'][Math.floor(Math.abs(vr(v, 1)) * 4) % 4]; x.strokeStyle = '#2a5a2a'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, 8); x.lineTo(0, 0); x.stroke(); for (let i = 0; i < 5; i++) ell(x, Math.cos(i / 5 * TAU) * 3.5, Math.sin(i / 5 * TAU) * 3.5 - 2, 2.5, 2.5, c); ell(x, 0, -2, 1.8, 1.8, '#fff3a0'); } };
  DECO.rock = { w: 44, h: 34, f(x, v, p) { poly(x, [-16, 8, -12, -6, -2, -12, 12, -8, 17, 6, 8, 11, -8, 12], G.shade(p.g1, 0.35), 2); poly(x, [-12, -6, -2, -12, 12, -8, 2, -4], 'rgba(255,255,255,0.15)', 0); } };
  DECO.stump = { w: 40, h: 34, f(x, v, p) { rrect(x, 0, 4, 26, 16, 5, '#4a3420', 2); ell(x, 0, -4, 13, 5, '#8a6a42', 2); x.strokeStyle = '#5a4228'; x.lineWidth = 1; x.beginPath(); x.ellipse(0, -4, 7, 2.5, 0, 0, TAU); x.stroke(); } };
  DECO.reed = { w: 30, h: 50, f(x, v, p) { x.strokeStyle = '#4a5a3a'; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-6 + i * 4, 20); x.lineTo(-8 + i * 5, -14 + i * 3); x.stroke(); } for (let i = 0; i < 2; i++) rrect(x, -6 + i * 9, -12 + i * 4, 4, 10, 2, '#6a4a2a', 1); } };
  DECO.puddle = { w: 70, h: 40, flat: 1, f(x, v, p) { ell(x, 0, 0, 30, 14, 'rgba(20,16,30,0.7)'); ell(x, -6, -3, 14, 4, 'rgba(180,140,255,0.15)'); } };
  DECO.lily = { w: 30, h: 22, flat: 1, f(x, v, p) { x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 9, 0.3, TAU - 0.3); x.closePath(); x.fillStyle = '#3a7a3a'; x.fill(); x.strokeStyle = OUT; x.lineWidth = 1.2; x.stroke(); ell(x, 2, -2, 3, 3, '#ffb0d0'); } };
  DECO.pillar = { w: 50, h: 110, tall: 1, f(x, v, p) { const h = 50 + vr(v, 1) * 30; rrect(x, 0, 40, 34, 12, 2, '#5a6070', 2); rrect(x, 0, 40 - h / 2, 24, h, 2, '#6a7080', 2); x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(4, 40 - h, 8, h - 4); poly(x, [-14, 40 - h, 14, 40 - h, 8, 34 - h, -6, 30 - h], '#6a7080', 2); ell(x, -4, 30 - h * 0.5, 4, 6, 'rgba(100,180,90,0.5)'); } };
  DECO.brokenwall = { w: 90, h: 60, tall: 1, f(x, v, p) { poly(x, [-40, 20, -40, -10, -25, -18, -10, -8, 5, -22, 20, -12, 40, -5, 40, 20], '#4a5060', 2); x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = 1.5; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-40, -4 + i * 7); x.lineTo(40, -4 + i * 7); x.stroke(); } } };
  DECO.rune = { w: 40, h: 30, flat: 1, glow: '#6ab8ff', f(x, v, p) { x.strokeStyle = '#6ab8ff'; x.lineWidth = 2; x.shadowColor = '#6ab8ff'; x.shadowBlur = 6; x.beginPath(); x.ellipse(0, 0, 14, 7, 0, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(-6, -2); x.lineTo(0, 3); x.lineTo(6, -3); x.stroke(); } };
  DECO.skull = { w: 24, h: 20, flat: 1, f(x, v, p) { ell(x, 0, 0, 6, 5, '#d8d0b8', 1.2); ell(x, -2, 0, 1.5, 1.5, OUT); ell(x, 2, 0, 1.5, 1.5, OUT); } };
  DECO.icerock = { w: 50, h: 44, f(x, v, p) { poly(x, [-18, 12, -14, -8, -4, -16, 10, -10, 18, 10], '#9ab8d0', 2); poly(x, [-14, -8, -4, -16, 10, -10, -2, -6], '#eaf6ff', 0); } };
  DECO.snowdrift = { w: 70, h: 30, flat: 1, f(x, v, p) { ell(x, 0, 2, 30, 9, '#f4f9ff'); ell(x, -10, -2, 14, 6, '#ffffff'); } };
  DECO.crystal = { w: 36, h: 50, glow: '#9ae8ff', f(x, v, p) { poly(x, [-8, 14, -10, -4, -4, -20, 2, -6, 0, 14], '#8ae0ff', 1.6); poly(x, [2, 14, 4, -2, 10, -12, 13, 0, 9, 14], '#bff0ff', 1.6); } };
  DECO.spike = { w: 40, h: 50, f(x, v, p) { poly(x, [-12, 14, -2, -22, 4, 14], '#2a1a1e', 2); poly(x, [2, 14, 10, -10, 14, 14], '#3a2026', 2); ell(x, -2, -20, 2, 2, '#ff5a3c'); } };
  DECO.tendril = { w: 40, h: 50, f(x, v, p) { x.strokeStyle = OUT; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 18); x.bezierCurveTo(-12, 0, 12, -8, -2, -20); x.stroke(); x.strokeStyle = '#4a1a2a'; x.lineWidth = 3.5; x.stroke(); } };
  DECO.ember = { w: 24, h: 24, flat: 1, glow: '#ff5a3c', f(x, v, p) { ell(x, 0, 0, 5, 3, '#ff5a3c'); ell(x, 0, 0, 2.5, 1.5, '#ffcf6a'); } };
  DECO.blackrock = { w: 50, h: 40, f(x, v, p) { poly(x, [-18, 12, -12, -10, 4, -14, 18, 2, 10, 12], '#1e1418', 2); x.strokeStyle = '#ff5a3c'; x.lineWidth = 1; x.beginPath(); x.moveTo(-8, -6); x.lineTo(0, 2); x.lineTo(8, -4); x.stroke(); } };
  DECO.eyeplant = { w: 30, h: 44, glow: '#ff3a1a', f(x, v, p) { x.strokeStyle = '#3a1a20'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 18); x.quadraticCurveTo(6, 4, 0, -8); x.stroke(); ell(x, 0, -10, 6, 6, '#f0d8c8', 1.5); ell(x, 1, -10, 3, 3.5, '#ff3a1a'); ell(x, 1, -10, 1, 2, '#000'); } };

  // ───── PROJECTILES ─────
  const PROJ = {};
  G.proj = function (look) {
    const P = PROJ[look] || PROJ.shard;
    return G.spr('proj_' + look, P.w, P.h, P.f, 3);
  };
  PROJ.shard = { w: 24, h: 24, glow: '#fff1b0', f(x) { poly(x, [9, 0, 0, -4, -7, 0, 0, 4], '#fff6c8', 1); poly(x, [9, 0, 0, -2, -3, 0, 0, 2], '#fff', 0); } };
  PROJ.sun = { w: 40, h: 40, glow: '#ffb43c', f(x) { for (let i = 0; i < 8; i++) poly(x, [Math.cos(i / 8 * TAU) * 15, Math.sin(i / 8 * TAU) * 15, Math.cos(i / 8 * TAU + 0.3) * 8, Math.sin(i / 8 * TAU + 0.3) * 8, Math.cos(i / 8 * TAU - 0.3) * 8, Math.sin(i / 8 * TAU - 0.3) * 8], '#ffcf4a', 0); ell(x, 0, 0, 9, 9, '#fff0a0', 1); ell(x, 0, 0, 5, 5, '#fff'); } };
  PROJ.arrow = { w: 34, h: 12, glow: '#cfe8a0', f(x) { x.strokeStyle = OUT; x.lineWidth = 3; x.beginPath(); x.moveTo(-14, 0); x.lineTo(10, 0); x.stroke(); x.strokeStyle = '#c8a070'; x.lineWidth = 1.5; x.stroke(); poly(x, [14, 0, 8, -3.5, 8, 3.5], '#e8eef0', 1); poly(x, [-14, 0, -10, -4, -8, -4, -11, 0, -8, 4, -10, 4], '#6ad04a', 0.8); } };
  PROJ.dagger = { w: 26, h: 12, glow: '#c9a0ff', f(x) { poly(x, [11, 0, -2, -3, -2, 3], '#dfe3f0', 1); rrect(x, -4, 0, 2.5, 8, 1, '#7a2a4a', 1); rrect(x, -8, 0, 6, 2.5, 1, '#3a2a2a', 1); } };
  PROJ.fireball = { w: 34, h: 34, glow: '#ff7a2f', f(x) { const g = x.createRadialGradient(2, 0, 0, 0, 0, 14); g.addColorStop(0, '#fff6c0'); g.addColorStop(0.35, '#ffb43c'); g.addColorStop(0.8, '#ff5a1a'); g.addColorStop(1, 'rgba(255,60,20,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(14, 0); x.quadraticCurveTo(4, -12, -12, -2); x.quadraticCurveTo(-6, 0, -12, 3); x.quadraticCurveTo(4, 12, 14, 0); x.fill(); } };
  PROJ.ice = { w: 22, h: 14, glow: '#7fd8ff', f(x) { poly(x, [9, 0, -1, -4, -8, 0, -1, 4], '#bff0ff', 1); poly(x, [9, 0, -1, -1.5, -4, 0], '#fff', 0); } };
  PROJ.lance = { w: 44, h: 16, glow: '#7fd8ff', f(x) { poly(x, [20, 0, 4, -5, -18, -2, -18, 2, 4, 5], '#a8e8ff', 1.4); poly(x, [20, 0, 4, -2, -10, 0], '#fff', 0); } };
  PROJ.moon = { w: 36, h: 36, glow: '#ff7ad9', f(x) { x.beginPath(); x.arc(0, 0, 13, 0.5, TAU - 0.5); x.arc(5, 0, 10, TAU - 0.9, 0.9, true); x.closePath(); x.fillStyle = '#ffd0f4'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#7a2a6a'; x.stroke(); } };
  PROJ.star = { w: 24, h: 24, glow: '#a77bff', f(x) { const p = []; for (let i = 0; i < 8; i++) { const r = i % 2 ? 3.5 : 10; p.push(Math.cos(i / 8 * TAU) * r, Math.sin(i / 8 * TAU) * r); } poly(x, p, '#c8b0ff', 1.2); ell(x, 0, 0, 2, 2, OUT); } };
  PROJ.spore = { w: 22, h: 22, glow: '#8ee04a', f(x) { ell(x, 0, 0, 6, 6, '#b8f06a', 1.2); ell(x, -2, -2, 2, 2, '#efffd0'); for (let i = 0; i < 6; i++) ell(x, Math.cos(i) * 7, Math.sin(i) * 7, 1.2, 1.2, '#8ee04a'); } };
  PROJ.sword = { w: 36, h: 14, glow: '#fff1b0', f(x) { poly(x, [16, 0, 2, -3, -6, -3, -6, 3, 2, 3], '#fffbe0', 1.2); rrect(x, -7, 0, 2.5, 10, 1, '#ffcf4a', 1); rrect(x, -12, 0, 8, 2.5, 1, '#c9a43a', 1); } };
  PROJ.axe = { w: 30, h: 30, glow: '#ffd0a0', f(x) { rrect(x, 0, 0, 3, 22, 1, '#6a4a2a', 1); x.beginPath(); x.moveTo(1, -10); x.quadraticCurveTo(12, -8, 11, 2); x.quadraticCurveTo(6, -2, 1, -2); x.closePath(); x.fillStyle = '#d8dde8'; x.fill(); x.strokeStyle = OUT; x.lineWidth = 1.2; x.stroke(); } };
  PROJ.tornado = { w: 70, h: 80, glow: '#c8b0ff', f(x) { for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(220,210,255,' + (0.7 - i * 0.08) + ')'; x.lineWidth = 3; x.beginPath(); x.ellipse(Math.sin(i) * 3, 22 - i * 9, 6 + i * 4.5, 2.5 + i * 1.2, 0, 0, TAU); x.stroke(); } } };
  PROJ.soul = { w: 26, h: 26, glow: '#5ad0c0', f(x) { ell(x, 0, 0, 6, 6, '#bffff4', 1); ell(x, -4, 0, 5, 3, 'rgba(90,208,192,0.6)'); } };
  PROJ.orb = { w: 30, h: 30, glow: '#fff1b0', f(x) { ell(x, 0, 0, 9, 9, '#fff6c8', 1.4); ell(x, -3, -3, 3, 3, '#fff'); } };
  PROJ.sunorb = { w: 40, h: 40, glow: '#ffb43c', f(x) { PROJ.sun.f(x); } };
  PROJ.wisp = { w: 30, h: 30, glow: '#9ae8ff', f(x) { x.beginPath(); x.moveTo(0, -10); x.quadraticCurveTo(7, -2, 6, 4); x.quadraticCurveTo(0, 10, -6, 4); x.quadraticCurveTo(-7, -2, 0, -10); x.fillStyle = '#bff8ff'; x.fill(); x.strokeStyle = '#3a8aa0'; x.lineWidth = 1.2; x.stroke(); ell(x, -2, 1, 1.2, 1.6, OUT); ell(x, 2, 1, 1.2, 1.6, OUT); } };
  PROJ.soulbig = { w: 34, h: 34, glow: '#c8b0ff', f(x) { x.beginPath(); x.moveTo(0, -13); x.quadraticCurveTo(9, -2, 8, 5); x.quadraticCurveTo(0, 13, -8, 5); x.quadraticCurveTo(-9, -2, 0, -13); x.fillStyle = '#e0d0ff'; x.fill(); x.strokeStyle = '#6a3aa0'; x.lineWidth = 1.4; x.stroke(); ell(x, -3, 1, 1.5, 2, OUT); ell(x, 3, 1, 1.5, 2, OUT); } };
  PROJ.wolf = { w: 40, h: 34, glow: '#9be37a', f(x) { ARCH.quad(x, 12, { c: ['#8aa0b8', '#5a6a80', '#e0f0ff'], eye: '#9be37a', ears: 1 }, 0); } };
  // projectiles ennemis
  PROJ.eorb = { w: 26, h: 26, f(x) { ell(x, 0, 0, 7.5, 7.5, '#ffd0c0', 1.5); ell(x, 0, 0, 4, 4, '#fff'); } };
  PROJ.web = { w: 30, h: 30, f(x) { x.strokeStyle = '#efe8ff'; x.lineWidth = 1.4; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(Math.cos(i / 4 * Math.PI) * 9, Math.sin(i / 4 * Math.PI) * 9); x.lineTo(-Math.cos(i / 4 * Math.PI) * 9, -Math.sin(i / 4 * Math.PI) * 9); x.stroke(); } x.beginPath(); x.arc(0, 0, 5, 0, TAU); x.stroke(); } };
  PROJ.boulder = { w: 50, h: 50, f(x) { poly(x, [-16, 6, -12, -12, 4, -17, 16, -6, 14, 10, 0, 16, -12, 13], '#7a7068', 2); poly(x, [-12, -12, 4, -17, 6, -8, -6, -4], 'rgba(255,255,255,0.2)', 0); } };
  PROJ.wave = { w: 40, h: 40, f(x) { x.beginPath(); x.arc(-8, 0, 16, -1.1, 1.1); x.arc(-14, 0, 12, 1.0, -1.0, true); x.closePath(); x.fillStyle = 'rgba(255,90,60,0.9)'; x.fill(); x.strokeStyle = '#fff0e0'; x.lineWidth = 1.5; x.stroke(); } };

  // ───── PICKUPS ─────
  G.pick = function (type, v) {
    const big = type === 'xp' ? (v >= 20 ? 3 : v >= 6 ? 2 : v >= 2.5 ? 1 : 0) : 0;
    return G.spr('pick_' + type + big, 26, 26, (x) => {
      if (type === 'xp') {
        const col = ['#7ad8ff', '#7affb0', '#ffcf4a', '#ff7ad9'][big]; const s = 4.5 + big * 1.6;
        poly(x, [0, -s * 1.3, s, 0, 0, s * 1.3, -s, 0], col, 1.2); poly(x, [0, -s * 1.3, s * 0.4, -s * 0.2, -s * 0.5, 0], 'rgba(255,255,255,0.7)', 0);
      } else if (type === 'gold') { ell(x, 0, 0, 5.5, 5.5, '#ffcf4a', 1.4); ell(x, 0, 0, 3, 3, '#ffe9a0'); x.fillStyle = '#c9902a'; x.fillRect(-0.7, -2.5, 1.4, 5); }
      else if (type === 'heal') { ell(x, 0, 2, 8, 6, '#d9934a', 1.4); ell(x, -2, -1, 3, 2, '#f8c88a'); x.strokeStyle = '#8a5a2a'; x.lineWidth = 1; x.beginPath(); x.moveTo(-4, 1); x.lineTo(4, 3); x.stroke(); }
      else if (type === 'magnet') { x.strokeStyle = OUT; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 6, Math.PI, 0); x.lineTo(6, 6); x.moveTo(-6, 0); x.lineTo(-6, 6); x.stroke(); x.strokeStyle = '#ff4a4a'; x.lineWidth = 3.5; x.stroke(); }
      else if (type === 'herb') { ell(x, -3, 0, 5, 2.5, '#5bd17a', 1, -0.6); ell(x, 3, -1, 5, 2.5, '#7ae09a', 1, 0.6); }
      else if (type === 'chest') { rrect(x, 0, 2, 20, 13, 2, '#8a5a2a', 1.6); rrect(x, 0, -5, 20, 6, 3, '#a8703a', 1.6); rrect(x, 0, 0, 20, 2.5, 0, '#ffcf4a', 0); rrect(x, 0, 1, 4, 5, 1, '#ffcf4a', 1); }
    }, 3);
  };

  // Lumière douce (trou dans la brume) : dégradé blanc
  G.hole = function () {
    let s = cache.get('hole'); if (s) return s;
    const n = 128, c = G.canvas(n, n), x = c.getContext('2d');
    const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.42, 'rgba(0,0,0,0.96)'); g.addColorStop(0.72, 'rgba(0,0,0,0.42)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, n, n);
    s = { c: c, w: n, h: n }; cache.set('hole', s); return s;
  };
  // Texture de nuages de brume (tuilable)
  G.cloud = function (seed) {
    const key = 'cloud' + seed; let s = cache.get(key); if (s) return s;
    const n = 256, c = G.canvas(n, n), x = c.getContext('2d');
    const r = B.rng(seed);
    for (let i = 0; i < 40; i++) {
      const cx = r() * n, cy = r() * n, rad = 20 + r() * 60, a = 0.05 + r() * 0.12;
      for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) {
        const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rad);
        g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fillRect(cx + ox - rad, cy + oy - rad, rad * 2, rad * 2);
      }
    }
    s = { c: c, w: n, h: n }; cache.set(key, s); return s;
  };
  // Bande de brume (fondue en haut et en bas)
  G.fogBand = function (seed) {
    const key = 'band' + seed; let s = cache.get(key); if (s) return s;
    const src = G.cloud(seed), n = 256, c = G.canvas(n, n), x = c.getContext('2d');
    x.drawImage(src.c, 0, 0); x.drawImage(src.c, 0, 0);
    x.globalCompositeOperation = 'destination-in';
    const g = x.createLinearGradient(0, 0, 0, n); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, 'rgba(0,0,0,1)'); g.addColorStop(0.7, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, n, n);
    s = { c: c, w: n, h: n }; cache.set(key, s); return s;
  };
  // Tuile de sol du biome
  G.ground = function (bi) {
    const key = 'ground' + bi; let s = cache.get(key); if (s) return s;
    const pal = B.BIOMES[bi].pal;
    const n = 256, c = G.canvas(n, n), x = c.getContext('2d');
    x.fillStyle = pal.g1; x.fillRect(0, 0, n, n);
    const r = B.rng(77 + bi);
    for (let i = 0; i < 70; i++) {
      const cx = r() * n, cy = r() * n, rad = 10 + r() * 40;
      for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) {
        const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rad);
        const col = r() < 0.5 ? pal.g2 : pal.g3;
        g.addColorStop(0, G.rgba(col, 0.6)); g.addColorStop(1, G.rgba(col, 0));
        x.fillStyle = g; x.fillRect(cx + ox - rad, cy + oy - rad, rad * 2, rad * 2);
      }
    }
    for (let i = 0; i < 160; i++) { x.fillStyle = r() < 0.5 ? G.rgba('#ffffff', 0.04) : G.rgba('#000000', 0.08); const cx = r() * n, cy = r() * n; x.fillRect(cx, cy, 1.5 + r() * 2, 1.5 + r() * 2); }
    if (bi === 2) { x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 2; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 64); x.lineTo(n, i * 64); x.stroke(); for (let j = 0; j < 4; j++) { x.beginPath(); x.moveTo(j * 64 + (i % 2) * 32, i * 64); x.lineTo(j * 64 + (i % 2) * 32, i * 64 + 64); x.stroke(); } } }
    if (bi === 1) for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(15,12,25,0.35)'; x.beginPath(); x.ellipse(r() * n, r() * n, 15 + r() * 25, 6 + r() * 10, 0, 0, TAU); x.fill(); }
    if (bi === 3) for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(r() * n, r() * n, 2, 2); }
    if (bi === 4) { x.strokeStyle = 'rgba(255,80,50,0.12)'; x.lineWidth = 1.5; for (let i = 0; i < 6; i++) { x.beginPath(); let px = r() * n, py = r() * n; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 50; py += (r() - 0.5) * 50; x.lineTo(px, py); } x.stroke(); } }
    s = { c: c, w: n, h: n }; cache.set(key, s); return s;
  };
})(this.B || (this.B = {}));
