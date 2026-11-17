import * as THREE from 'three';
import { G } from './ctx.js';
import { mulberry32 } from './util.js';

export const cv = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function imgTex(img, { srgb = true, flipY = true, repeat = true } = {}) {
  const t = img instanceof HTMLCanvasElement ? new THREE.CanvasTexture(img) : new THREE.Texture(img);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = G.maxAniso; t.flipY = flipY; t.needsUpdate = true;
  return t;
}

function hash(x, y, s) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, p, s) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const x0 = ((xi % p) + p) % p, x1 = (x0 + 1) % p, y0 = ((yi % p) + p) % p, y1 = (y0 + 1) % p;
  const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(u, v, base, oct, s) {
  let a = 0, amp = 0.5, f = base, tot = 0;
  for (let o = 0; o < oct; o++) { a += amp * vnoise(u * f, v * f, f, s + o * 17); tot += amp; f *= 2; amp *= 0.5; }
  return a / tot;
}

function pixelTex(size, fn) {
  const c = cv(size), ctx = c.getContext('2d'), id = ctx.createImageData(size, size), d = id.data;
  for (let y = 0, i = 0; y < size; y++) for (let x = 0; x < size; x++, i += 4) {
    const col = fn(x / size, y / size);
    d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = col[3] === undefined ? 255 : col[3];
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

function concrete(seed) {
  const c = pixelTex(512, (u, v) => {
    const n = fbm(u, v, 4, 5, seed), fine = vnoise(u * 160, v * 160, 160, seed + 9), stain = fbm(u, v, 2, 4, seed + 31);
    let val = 96 + n * 66 + (fine - 0.5) * 30 - Math.max(0, stain - 0.52) * 150;
    return [val, val * 0.985, val * 0.95];
  });
  const ctx = c.getContext('2d'), r = mulberry32(seed * 7 + 3);
  ctx.strokeStyle = 'rgba(20,18,16,0.55)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < 7; k++) {
    let x = r() * 512, y = r() * 512, a = r() * 6.28;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 26; s++) { a += (r() - 0.5) * 1.1; x += Math.cos(a) * 9; y += Math.sin(a) * 9; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  return c;
}

function paintedMetal(base, rust, seed) {
  return pixelTex(256, (u, v) => {
    const n = fbm(u, v, 3, 5, seed), streak = vnoise(u * 40, v * 3, 40, seed + 5), fine = vnoise(u * 90, v * 90, 90, seed + 2);
    let t = Math.min(1, Math.max(0, (n + streak * 0.25 - 0.56) / 0.12));
    const k = 0.82 + fine * 0.3;
    return [(base[0] + (rust[0] - base[0]) * t) * k, (base[1] + (rust[1] - base[1]) * t) * k, (base[2] + (rust[2] - base[2]) * t) * k];
  });
}

function radial(size, stops) {
  const c = cv(size), ctx = c.getContext('2d'), g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return c;
}

function muzzle() {
  const c = cv(256), ctx = c.getContext('2d');
  ctx.translate(128, 128);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
  g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.18, 'rgba(255,205,110,0.95)'); g.addColorStop(0.5, 'rgba(255,120,30,0.35)'); g.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = g;
  const r = mulberry32(11);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.283 + r() * 0.4, len = 60 + r() * 62, w = 0.16 + r() * 0.16;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * len * 0.55, Math.sin(a - w) * len * 0.55); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); ctx.lineTo(Math.cos(a + w) * len * 0.55, Math.sin(a + w) * len * 0.55); ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, 6.283); ctx.fill();
  return c;
}

function sky() {
  const c = cv(1024, 512), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#03060d'); g.addColorStop(0.3, '#0a1322'); g.addColorStop(0.5, '#1d2c40'); g.addColorStop(1, '#1d2c40');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
  const r = mulberry32(5);
  for (let i = 0; i < 520; i++) {
    const y = Math.pow(r(), 1.5) * 235, a = (0.25 + r() * 0.75) * (1 - y / 250);
    ctx.fillStyle = `rgba(${200 + r() * 55},${210 + r() * 45},255,${a})`;
    ctx.fillRect(r() * 1024, y, r() < 0.12 ? 2 : 1, r() < 0.12 ? 2 : 1);
  }
  // drifting cloud bands near the horizon
  for (let i = 0; i < 40; i++) {
    const x = r() * 1024, y = 150 + r() * 110, w = 120 + r() * 260, h = 10 + r() * 26;
    const cg = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
    cg.addColorStop(0, 'rgba(60,76,100,0.16)'); cg.addColorStop(1, 'rgba(60,76,100,0)');
    ctx.save(); ctx.translate(x, y); ctx.scale(1, h / w * 2); ctx.translate(-x, -y); ctx.fillStyle = cg; ctx.fillRect(x - w, y - w, w * 2, w * 2); ctx.restore();
  }
  return c;
}

// Turn the clean soldier albedo into a rotten, blood-stained variant.
function zombieSkin(seed, brute = false) {
  const src = G.img.soldierDiff, c = cv(1024), ctx = c.getContext('2d'), r = mulberry32(seed);
  ctx.drawImage(src, 0, 0, 1024, 1024);
  const id = ctx.getImageData(0, 0, 1024, 1024), d = id.data;
  const tint = brute ? [0.5, 0.2, 0.17] : [[0.62, 0.7, 0.55], [0.7, 0.66, 0.56], [0.55, 0.63, 0.62]][seed % 3];
  for (let i = 0; i < d.length; i += 4) {
    const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    const n = 0.8 + 0.4 * hash((i >> 2) % 1024 >> 3, (i >> 12) >> 1, seed);
    d[i] = (l * 0.7 + d[i] * 0.3) * tint[0] * n; d[i + 1] = (l * 0.7 + d[i + 1] * 0.3) * tint[1] * n; d[i + 2] = (l * 0.7 + d[i + 2] * 0.3) * tint[2] * n;
  }
  ctx.putImageData(id, 0, 0);
  const sp = cv(256), sx = sp.getContext('2d');
  const stamp = (col, n, smin, smax, alpha) => {
    sx.globalCompositeOperation = 'source-over'; sx.clearRect(0, 0, 256, 256); sx.drawImage(G.img.splat, 0, 0, 256, 256);
    sx.globalCompositeOperation = 'source-in'; sx.fillStyle = col; sx.fillRect(0, 0, 256, 256);
    for (let k = 0; k < n; k++) {
      const s = smin + r() * (smax - smin);
      ctx.save(); ctx.globalAlpha = alpha * (0.6 + r() * 0.4); ctx.translate(r() * 1024, r() * 1024); ctx.rotate(r() * 6.28); ctx.drawImage(sp, -s / 2, -s / 2, s, s); ctx.restore();
    }
  };
  ctx.globalCompositeOperation = 'multiply'; stamp('#3a3226', 26, 160, 420, 0.75);
  ctx.globalCompositeOperation = 'source-over'; stamp('#4a0705', 30, 90, 330, 0.85); stamp('#7a0d08', 14, 50, 160, 0.8);
  return c;
}

export function noiseCanvas(seed, size = 256, lo = 0.5, hi = 1, base = 3) {
  return pixelTex(size, (u, v) => { const n = fbm(u, v, base, 5, seed), k = (lo + (hi - lo) * n) * 255; return [k, k, k]; });
}

function fireBlob() {
  return pixelTex(128, (u, v) => {
    const dx = u - 0.5, dy = v - 0.5, r = Math.sqrt(dx * dx + dy * dy) * 2;
    const n = fbm(u, v, 4, 4, 91), n2 = fbm(u, v, 8, 3, 17);
    const a = Math.max(0, Math.min(1, (1 - (r + (n - 0.5) * 0.9 + (n2 - 0.5) * 0.35)) * 1.6));
    return [255, 255, 255, Math.pow(a, 1.35) * 255];
  });
}

function bulletHole() {
  const c = cv(64), ctx = c.getContext('2d'), g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.22, 'rgba(8,6,5,0.95)'); g.addColorStop(0.5, 'rgba(30,26,22,0.45)'); g.addColorStop(1, 'rgba(40,36,30,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  return c;
}

export function labelTex(lines, { w = 512, h = 256, bg = null, fg = '#e8dcc0' } = {}) {
  const c = cv(w, h), ctx = c.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of lines) {
    ctx.font = `${l.weight || 400} ${l.size}px ${l.font || "'Stardos Stencil','Impact','Arial Narrow',sans-serif"}`;
    let fs = l.size; while (fs > 10 && ctx.measureText(l.text).width > w * 0.92) { fs -= 2; ctx.font = `${l.weight || 400} ${fs}px ${l.font || "'Stardos Stencil','Impact','Arial Narrow',sans-serif"}`; }
    ctx.fillStyle = l.color || fg; ctx.globalAlpha = l.alpha ?? 0.92;
    ctx.fillText(l.text, w / 2 + (l.dx || 0), l.y);
  }
  const t = imgTex(c, { repeat: false });
  return t;
}

export function buildTextures() {
  const I = G.img, T = G.tex;
  T.brick = imgTex(I.brickDiff); T.brickBump = imgTex(I.brickBump, { srgb: false });
  T.wood = imgTex(I.woodDiff); T.woodBump = imgTex(I.woodBump, { srgb: false }); T.woodRough = imgTex(I.woodRough, { srgb: false });
  T.grass = imgTex(I.grass);
  const con = concrete(3); T.concrete = imgTex(con); T.concreteBump = imgTex(con, { srgb: false });
  T.metalGreen = imgTex(paintedMetal([58, 72, 52], [96, 52, 26], 4));
  T.metalRed = imgTex(paintedMetal([110, 34, 26], [70, 40, 22], 8));
  T.metalGrey = imgTex(paintedMetal([70, 74, 78], [84, 50, 30], 12));
  T.glow = imgTex(radial(128, [[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [0.6, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']]), { repeat: false });
  T.dot = imgTex(radial(64, [[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']]), { repeat: false });
  T.blob = imgTex(radial(128, [[0, 'rgba(0,0,0,0.78)'], [0.55, 'rgba(0,0,0,0.42)'], [1, 'rgba(0,0,0,0)']]), { repeat: false });
  T.muzzle = imgTex(muzzle(), { repeat: false });
  T.sky = imgTex(sky(), { repeat: false });
  T.hole = imgTex(bulletHole(), { repeat: false });
  T.fire = imgTex(fireBlob(), { repeat: false });
  T.splat = imgTex(I.splat, { repeat: false });
  T.soldierNorm = imgTex(I.soldierNorm, { srgb: false, flipY: false });
  T.soldier = imgTex(I.soldierDiff, { flipY: false });
  T.zombie = [1, 2, 3].map((s) => imgTex(zombieSkin(s), { flipY: false }));
  T.brute = imgTex(zombieSkin(7, true), { flipY: false });
}

export function crateTex() {
  const c = cv(512), ctx = c.getContext('2d');
  ctx.drawImage(G.img.woodDiff, 0, 0, 512, 512);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#8a6a48'; ctx.fillRect(0, 0, 512, 512);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(15,10,6,0.85)'; ctx.lineWidth = 5;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, i * 102.4); ctx.lineTo(512, i * 102.4); ctx.stroke(); }
  ctx.fillStyle = 'rgba(52,36,22,0.93)';
  ctx.fillRect(0, 0, 512, 58); ctx.fillRect(0, 454, 512, 58); ctx.fillRect(0, 0, 58, 512); ctx.fillRect(454, 0, 58, 512);
  ctx.save(); ctx.translate(256, 256); ctx.rotate(Math.PI / 4); ctx.fillRect(-300, -27, 600, 54); ctx.restore();
  ctx.strokeStyle = 'rgba(8,5,3,0.9)'; ctx.lineWidth = 4; ctx.strokeRect(58, 58, 396, 396); ctx.strokeRect(2, 2, 508, 508);
  ctx.fillStyle = 'rgba(160,160,150,0.8)';
  for (const [x, y] of [[29, 29], [483, 29], [29, 483], [483, 483], [256, 29], [256, 483], [29, 256], [483, 256]]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.3); ctx.fill(); }
  return imgTex(c, { repeat: false });
}
