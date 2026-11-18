// Everything is synthesised with WebAudio: no sound files.
// Positional sounds go through HRTF panners; anything in another room is muffled; reverb follows indoor / outdoor.
import { G } from './ctx.js';
import { rand, clamp } from './util.js';

let limOut = null;
export function debugStream() { const d = ac.createMediaStreamDestination(); limOut.connect(d); return d.stream; }
let ac = null, master = null, noise = null, pink = null, sat = null, glottal = null, amb = null, tensionBus = null;
const verb = { in: null, out: null }, P = { x: 0, z: 0, yaw: 0 };
const ok = () => ac && ac.state === 'running';
const BUSY = {}, CAP = { shell: 3, voice: 4, die: 3, flesh: 3, zstep: 4, impact: 3, hit: 2, plank: 3, thud: 2, fall: 4 };
function allow(cat, dur) {
  const now = ac.currentTime, L = (BUSY[cat] ||= []);
  while (L.length && L[0] <= now) L.shift();
  if (L.length >= (CAP[cat] || 6)) return false;
  L.push(now + dur); L.sort((a, b) => a - b); return true;
}
let liveSpatial = []; // end times of positional sounds, to pick HRTF only while it is affordable

// ---------------------------------------------------------------- setup
function impulse(sec, decay, early, bright) {
  const n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c); let lp = 0;
    for (let i = 0; i < n; i++) { const t = i / n; lp += ((Math.random() * 2 - 1) - lp) * bright; d[i] = lp * Math.pow(1 - t, decay) * (i < 200 ? i / 200 : 1); }
    for (const [ms, g] of early) { const i = Math.floor((ms / 1000) * ac.sampleRate * (1 + (c ? 0.03 : 0))); if (i < n) d[i] += g * (Math.random() < 0.5 ? -1 : 1); }
  }
  return b;
}
export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ac = new AC();
  master = ac.createGain(); master.gain.value = G.settings.volume;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = 0.002; comp.release.value = 0.18;
  const lim = ac.createDynamicsCompressor(); lim.threshold.value = -2; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.06;
  master.connect(comp); comp.connect(lim); lim.connect(ac.destination); limOut = lim;
  const len = ac.sampleRate * 2; noise = ac.createBuffer(1, len, ac.sampleRate); pink = ac.createBuffer(1, len, ac.sampleRate);
  { const d = noise.getChannelData(0), p = pink.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; d[i] = w; b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; p[i] = (b0 + b1 + b2 + w * 0.1848) * 0.35; } }
  // two rooms: a tight indoor space with early reflections, and an open night with a long slap-back
  for (const [k, ir, g] of [['in', impulse(1.1, 3.2, [[11, 0.5], [17, 0.42], [29, 0.33], [41, 0.25]], 0.55), 0.55], ['out', impulse(2.6, 2.4, [[140, 0.32], [290, 0.2], [460, 0.12]], 0.25), 0.4]]) {
    const cv = ac.createConvolver(); cv.buffer = ir; const gg = ac.createGain(); gg.gain.value = g; cv.connect(gg); gg.connect(master); verb[k] = cv;
  }
  sat = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; sat[i] = Math.tanh(x * 2.6) / Math.tanh(2.6); }
  // a glottal-pulse waveform for voices: strong fundamental, harmonics falling off ~12 dB/octave, slightly asymmetric
  { const N = 40, re = new Float32Array(N), im = new Float32Array(N); for (let h = 1; h < N; h++) { im[h] = 1 / (h * h * 0.6 + h * 0.4); re[h] = (h % 2 ? 0.25 : -0.15) / (h * h); } glottal = ac.createPeriodicWave(re, im); }
  if (ac.listener.positionX) ac.listener.positionY.value = 1.65;
}
export const setVolume = (v) => { if (master) master.gain.value = v; };
export const suspend = (s) => { if (!ac) return; if (s) ac.suspend(); else ac.resume(); };
export const listener = (x, z, yaw) => {
  P.x = x; P.z = z; P.yaw = yaw; if (!ac) return;
  const L = ac.listener, fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  if (L.positionX) { const t = ac.currentTime; L.positionX.setTargetAtTime(x, t, 0.02); L.positionZ.setTargetAtTime(z, t, 0.02); L.forwardX.setTargetAtTime(fx, t, 0.02); L.forwardY.value = 0; L.forwardZ.setTargetAtTime(fz, t, 0.02); L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; }
  else if (L.setPosition) { L.setPosition(x, 1.65, z); L.setOrientation(fx, 0, fz, 0, 1, 0); }
};
const outdoors = () => !(G.world && G.world.indoor(P.x, P.z));

// one output strip: gain -> (muffle) -> panner -> master, plus a send to the current room's reverb
function out(gain = 1, x, z, wet = 0.25, y = 1.3) {
  const g = ac.createGain(); g.gain.value = gain; let tail = g;
  if (x !== undefined) {
    const W = G.world, here = W && W.roomAt(P.x, P.z), there = W && W.roomAt(x, z);
    if (W && here !== there && !(outdoors() && !W.indoor(x, z))) { const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; g.connect(lp); tail = lp; g.gain.value = gain * 0.6; }
    const now = ac.currentTime; liveSpatial = liveSpatial.filter((t) => t > now); liveSpatial.push(now + 1.5);
    const p = ac.createPanner(); p.panningModel = liveSpatial.length <= 6 ? 'HRTF' : 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 2.2; p.rolloffFactor = 1.15; p.maxDistance = 60;
    if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
    tail.connect(p); tail = p;
  }
  tail.connect(master);
  if (wet) { const w = ac.createGain(); w.gain.value = wet; tail.connect(w); w.connect(outdoors() ? verb.out : verb.in); }
  return g;
}
function src(buf, rate = 1, t0 = ac.currentTime) { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.start(t0, Math.random() * 1.5); return s; }
function env(node, t, a, peak, d, shape = 'exp') { const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (shape === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else g.gain.linearRampToValueAtTime(0.0001, t + a + d); node.connect(g); return g; }
// filtered noise burst
function nz(dest, { t = 0, dur = 0.2, type = 'lowpass', f0 = 4000, f1 = 400, q = 0.7, gain = 1, attack = 0.002, rate = 1, buf }) {
  const now = ac.currentTime + t, s = src(buf || noise, rate, now), f = ac.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, now); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), now + dur);
  s.connect(f); env(f, now, attack, gain, dur).connect(dest); s.stop(now + attack + dur + 0.05);
}
function tone(dest, { t = 0, dur = 0.2, type = 'sine', f0 = 440, f1 = f0, gain = 0.5, attack = 0.004, wave }) {
  const now = ac.currentTime + t, o = ac.createOscillator(); if (wave) o.setPeriodicWave(wave); else o.type = type;
  o.frequency.setValueAtTime(f0, now); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), now + dur);
  env(o, now, attack, gain, dur).connect(dest); o.start(now); o.stop(now + attack + dur + 0.05);
}
function shaper(dest, amount = 1) { const w = ac.createWaveShaper(); w.curve = sat; w.oversample = '2x'; const pre = ac.createGain(); pre.gain.value = amount; pre.connect(w); w.connect(dest); return pre; }
// bell / metal: a few inharmonic partials
function bell(dest, { t = 0, f = 220, dur = 3, gain = 0.3, parts = [1, 2.01, 2.76, 4.07, 5.43] }) { parts.forEach((m, i) => tone(dest, { t, dur: dur / (1 + i * 0.45), f0: f * m, gain: gain / (1 + i * 0.8), attack: 0.003 })); }

// ---------------------------------------------------------------- guns
const GUN = {
  pistol: { crack: 0.9, body: [2600, 520], bodyDur: 0.11, thump: [150, 48], thumpG: 0.9, mech: 2900, tail: 0.55, g: 0.8 },
  magnum: { crack: 1.1, body: [1900, 260], bodyDur: 0.22, thump: [110, 34], thumpG: 1.3, mech: 1800, tail: 0.85, g: 1.0 },
  smg: { crack: 0.75, body: [3200, 700], bodyDur: 0.07, thump: [170, 60], thumpG: 0.7, mech: 3600, tail: 0.4, g: 0.65 },
  shotgun: { crack: 0.9, body: [1500, 180], bodyDur: 0.3, thump: [95, 30], thumpG: 1.5, mech: 1300, tail: 0.9, g: 1.0, wide: true },
  rifle: { crack: 1.0, body: [2400, 380], bodyDur: 0.13, thump: [125, 40], thumpG: 1.0, mech: 2500, tail: 0.65, g: 0.85 },
  lmg: { crack: 1.0, body: [2100, 320], bodyDur: 0.14, thump: [110, 36], thumpG: 1.15, mech: 2000, tail: 0.65, g: 0.9 },
  bow: { crack: 0.0, body: [900, 300], bodyDur: 0.08, thump: [180, 90], thumpG: 0.6, mech: 1400, tail: 0.2, g: 0.6, twang: true },
  launcher: { crack: 0.2, body: [700, 160], bodyDur: 0.2, thump: [90, 50], thumpG: 1.0, mech: 900, tail: 0.5, g: 0.8, tube: true },
};
export function shot(id) {
  if (!ok()) return; const s = GUN[id] || GUN.rifle, k = rand(0.94, 1.07), o = out(s.g, undefined, undefined, s.tail), hot = shaper(o, 1.4);
  nz(hot, { dur: 0.012, type: 'highpass', f0: 3500 * k, f1: 2500, gain: s.crack, attack: 0.0005 });
  nz(hot, { dur: s.bodyDur, type: 'bandpass', f0: s.body[0] * k, f1: s.body[1], q: s.wide ? 0.5 : 0.8, gain: 1.2, attack: 0.001 });
  nz(o, { dur: s.bodyDur * 2.4, type: 'lowpass', f0: 1800 * k, f1: 120, gain: 0.45, attack: 0.002, buf: pink });
  tone(hot, { dur: s.bodyDur * 1.3, type: 'sine', f0: s.thump[0] * k, f1: s.thump[1], gain: s.thumpG, attack: 0.001 });
  nz(o, { t: 0.012, dur: 0.035, type: 'bandpass', f0: s.mech * k, f1: s.mech * 0.8, q: 7, gain: 0.35 });
  if (s.twang) { tone(o, { dur: 0.35, type: 'triangle', f0: 210, f1: 180, gain: 0.5, attack: 0.002 }); tone(o, { dur: 0.25, type: 'sine', f0: 420, f1: 380, gain: 0.25 }); nz(o, { t: 0.02, dur: 0.12, type: 'bandpass', f0: 2600, f1: 4000, q: 2, gain: 0.35, attack: 0.01 }); }
  if (s.tube) nz(o, { t: 0.02, dur: 0.35, type: 'bandpass', f0: 500, f1: 2400, q: 1.5, gain: 0.35, attack: 0.03 });
  if (outdoors()) { const d = ac.createDelay(1); d.delayTime.value = rand(0.18, 0.28); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200; const g = ac.createGain(); g.gain.value = 0.22; o.connect(d); d.connect(lp); lp.connect(g); g.connect(master); }
}
// spent casing hitting the floor a moment after the shot: brass rings, a plastic shell just clacks
export function shell(plastic) {
  if (!ok() || !allow('shell', 0.6)) return; const o = out(0.16, undefined, undefined, 0.15), t = rand(0.38, 0.55);
  if (plastic) { nz(o, { t, dur: 0.04, type: 'bandpass', f0: 1400, f1: 900, q: 3, gain: 0.8 }); nz(o, { t: t + 0.09, dur: 0.03, type: 'bandpass', f0: 1100, f1: 800, q: 3, gain: 0.4 }); return; }
  for (const [dt, g] of [[0, 1], [0.08, 0.5], [0.13, 0.3]]) { tone(o, { t: t + dt, dur: 0.12, f0: rand(4800, 5600), gain: 0.25 * g, attack: 0.001 }); tone(o, { t: t + dt, dur: 0.08, f0: rand(7600, 8400), gain: 0.12 * g, attack: 0.001 }); }
}
// storm weaver discharge: crack, buzzing arc with jittering pitch, then a short rolling boom
export function zap(up) {
  if (!ok()) return; const o = out(0.85, undefined, undefined, 0.6), h = shaper(o, 2.2), now = ac.currentTime;
  nz(h, { dur: 0.02, type: 'highpass', f0: 5000, f1: 3000, gain: 1, attack: 0.0005 });
  const b = ac.createOscillator(); b.type = 'sawtooth'; b.frequency.setValueAtTime(up ? 140 : 95, now); for (let t = 0.01; t < 0.32; t += 0.012) b.frequency.setValueAtTime(rand(60, up ? 320 : 220), now + t);
  const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.Q.value = 1.2; bf.frequency.setValueAtTime(3200, now); bf.frequency.exponentialRampToValueAtTime(600, now + 0.35);
  b.connect(bf); env(bf, now, 0.004, 0.9, 0.34).connect(h); b.start(now); b.stop(now + 0.4);
  for (let i = 0; i < 7; i++) nz(o, { t: rand(0, 0.28), dur: 0.015, type: 'highpass', f0: rand(3000, 7000), f1: 2000, gain: rand(0.3, 0.7), attack: 0.0005 });
  nz(o, { t: 0.04, dur: 0.6, type: 'lowpass', f0: 900, f1: 80, gain: 0.7, buf: pink }); tone(o, { t: 0.03, dur: 0.5, f0: 70, f1: 32, gain: 0.7 });
}
// the generator coming to life: heavy clunk, a starter whirr winding up, then a steady electric hum and relay clicks
let humNode = null;
export function power() {
  if (!ok()) return; const o = out(1, undefined, undefined, 0.6), h = shaper(o, 1.8);
  tone(h, { dur: 0.25, f0: 90, f1: 40, gain: 1 }); nz(h, { dur: 0.15, f0: 1500, f1: 200, gain: 0.8 });
  const now = ac.currentTime, m = ac.createOscillator(); m.type = 'sawtooth'; m.frequency.setValueAtTime(18, now + 0.2); m.frequency.exponentialRampToValueAtTime(110, now + 1.2);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; m.connect(lp); env(lp, now + 0.2, 0.6, 0.6, 0.9, 'lin').connect(o); m.start(now + 0.2); m.stop(now + 1.8);
  for (let i = 0; i < 5; i++) nz(o, { t: 0.9 + i * 0.09, dur: 0.02, type: 'bandpass', f0: 2600, f1: 2000, q: 6, gain: 0.6 });
  bell(o, { t: 1.0, f: 196, dur: 2.5, gain: 0.2 }); bell(o, { t: 1.15, f: 294, dur: 2.5, gain: 0.18 });
  if (humNode) humNode.gain.setTargetAtTime(0.012, now + 1, 0.5); else { const g = ac.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.012, now + 1, 0.5); for (const f of [50, 100, 150]) { const s = ac.createOscillator(); s.frequency.value = f; const sg = ac.createGain(); sg.gain.value = 1 / (f / 50); s.connect(sg); sg.connect(g); s.start(now); } g.connect(master); humNode = g; }
}
export function powerOff() { if (humNode && ac) humNode.gain.setTargetAtTime(0, ac.currentTime, 0.2); }
export function dry() { if (!ok()) return; const o = out(0.45, undefined, undefined, 0.05); nz(o, { dur: 0.02, type: 'bandpass', f0: 3200, f1: 2600, q: 6, gain: 1 }); nz(o, { t: 0.03, dur: 0.02, type: 'bandpass', f0: 1800, f1: 1500, q: 6, gain: 0.6 }); }
export function reload(stage) {
  if (!ok()) return; const o = out(0.55, undefined, undefined, 0.12);
  if (stage === 0) { nz(o, { dur: 0.03, type: 'bandpass', f0: 2200, f1: 1600, q: 5 }); nz(o, { t: 0.05, dur: 0.12, type: 'bandpass', f0: 900, f1: 500, q: 2, gain: 0.6 }); tone(o, { t: 0.02, dur: 0.06, f0: 640, f1: 520, gain: 0.15, type: 'triangle' }); }
  else if (stage === 1) { nz(o, { dur: 0.04, type: 'bandpass', f0: 1400, f1: 900, q: 4 }); nz(o, { t: 0.05, dur: 0.035, type: 'bandpass', f0: 3000, f1: 2200, q: 6, gain: 1 }); tone(o, { t: 0.05, dur: 0.05, f0: 1900, gain: 0.12, type: 'triangle' }); }
  else { nz(o, { dur: 0.03, type: 'bandpass', f0: 3600, f1: 2400, q: 7 }); nz(o, { t: 0.07, dur: 0.05, type: 'bandpass', f0: 2600, f1: 1500, q: 5, gain: 0.9 }); tone(o, { t: 0.07, dur: 0.06, f0: 1300, gain: 0.12, type: 'triangle' }); }
}
export function swing() { if (!ok()) return; const o = out(0.4, undefined, undefined, 0.05); nz(o, { dur: 0.24, type: 'bandpass', f0: 400, f1: 2200, q: 1.4, attack: 0.09, buf: pink, gain: 1.4 }); }
export function thud() { if (!ok() || !allow('thud', 0.12)) return; const o = out(0.95, undefined, undefined, 0.15), h = shaper(o, 1.5); tone(h, { dur: 0.16, f0: 140, f1: 45, gain: 1 }); nz(h, { dur: 0.1, f0: 1100, f1: 180, gain: 0.8 }); nz(o, { t: 0.01, dur: 0.12, type: 'bandpass', f0: 700, f1: 300, q: 2, gain: 0.5 }); }
export function flesh(x, z) { if (!ok() || !allow('flesh', 0.15)) return; const o = out(0.55, x, z, 0.05); nz(o, { dur: 0.06, f0: 1700, f1: 300, gain: 1 }); tone(o, { dur: 0.08, f0: 210, f1: 70, gain: 0.6 }); nz(o, { t: 0.02, dur: 0.12, type: 'bandpass', f0: 650, f1: 380, q: 3, gain: 0.45, rate: 0.6 }); }
export function tick(g = 0.3, f = 2400) { if (!ok()) return; const o = out(g, undefined, undefined, 0.05); nz(o, { dur: 0.02, type: 'bandpass', f0: f, f1: f * 0.85, q: 8, gain: 1 }); }
export function hitmark(head) { if (!ok() || !allow('hit', 0.06)) return; const o = out(0.28, undefined, undefined, 0); tone(o, { dur: 0.035, type: 'triangle', f0: head ? 1600 : 2300, gain: 0.6, attack: 0.001 }); if (head) { nz(o, { dur: 0.06, type: 'highpass', f0: 2500, f1: 1800, gain: 0.7 }); tone(o, { t: 0.015, dur: 0.12, f0: 380, f1: 150, gain: 0.7 }); } }
// footsteps: what is underfoot decides the sound
export function step(run) {
  if (!ok()) return; const k = G.world && G.world.roomAt(P.x, P.z), o = out(run ? 0.32 : 0.22, undefined, undefined, 0.1), v = rand(0.9, 1.1);
  if (k === 'A' || k === 'C' || k === 'F') { tone(o, { dur: 0.09, f0: 190 * v, f1: 110, gain: 0.7 }); nz(o, { dur: 0.05, type: 'bandpass', f0: 1200 * v, f1: 600, q: 1.2, gain: 0.6 }); if (Math.random() < 0.12) nz(o, { t: 0.04, dur: 0.25, type: 'bandpass', f0: 380, f1: 520, q: 18, gain: 0.25, rate: 0.3 }); }
  else if (k === 'B') { nz(o, { dur: 0.035, type: 'highpass', f0: 2600 * v, f1: 1800, gain: 0.8 }); tone(o, { dur: 0.05, f0: 130 * v, f1: 80, gain: 0.35 }); }
  else if (k === 'E') { nz(o, { dur: 0.12, type: 'bandpass', f0: 2600 * v, f1: 1400, q: 0.8, gain: 0.9, attack: 0.01 }); nz(o, { dur: 0.06, f0: 600, f1: 150, gain: 0.4 }); }
  else { nz(o, { dur: 0.1, type: 'bandpass', f0: 1700 * v, f1: 900, q: 0.7, gain: 0.85, attack: 0.006 }); nz(o, { t: 0.02, dur: 0.07, type: 'highpass', f0: 4000, f1: 3000, gain: 0.3 }); }
}
export function zstep(x, z, run) { if (!ok() || !allow('zstep', 0.2)) return; const o = out(run ? 0.3 : 0.2, x, z, 0.08, 0.1); nz(o, { dur: run ? 0.07 : 0.18, type: 'bandpass', f0: rand(600, 1100), f1: 300, q: 0.9, gain: 0.8, attack: run ? 0.002 : 0.04 }); }
export function impact(x, z) { if (!ok() || !allow('impact', 0.06)) return; const o = out(0.25, x, z, 0.1, 1); nz(o, { dur: 0.04, type: 'bandpass', f0: rand(2500, 4000), f1: 1500, q: 2, gain: 1 }); }

// ---------------------------------------------------------------- jingles
export function buy() { if (!ok()) return; const o = out(0.35, undefined, undefined, 0.3); bell(o, { f: 880, dur: 0.8, gain: 0.25 }); bell(o, { t: 0.1, f: 1318, dur: 1.0, gain: 0.22 }); nz(o, { dur: 0.06, type: 'bandpass', f0: 3200, f1: 2400, q: 3, gain: 0.4 }); }
export function deny() { if (!ok()) return; const o = out(0.3, undefined, undefined, 0.05); tone(o, { dur: 0.18, type: 'square', f0: 110, f1: 90, gain: 0.3 }); tone(o, { t: 0.02, dur: 0.18, type: 'square', f0: 116, f1: 94, gain: 0.25 }); }
export function pickup() { if (!ok()) return; const o = out(0.35, undefined, undefined, 0.4); [523, 659, 784, 1047].forEach((f, i) => bell(o, { t: i * 0.07, f, dur: 0.9, gain: 0.18 })); }
export function perk() { if (!ok()) return; const o = out(0.45, undefined, undefined, 0.5); nz(o, { dur: 0.5, type: 'bandpass', f0: 300, f1: 1500, q: 2, gain: 0.5, attack: 0.2 }); [392, 494, 587, 784].forEach((f, i) => { tone(o, { t: 0.25 + i * 0.11, dur: 0.9, type: 'sawtooth', f0: f, gain: 0.12 }); bell(o, { t: 0.25 + i * 0.11, f: f * 2, dur: 1.2, gain: 0.12 }); }); }
export function boxOpen() { if (!ok()) return; const o = out(0.45, undefined, undefined, 0.5); creak(o, 0, 0.6); [330, 415, 494, 622, 740, 880].forEach((f, i) => bell(o, { t: 0.35 + i * 0.42, f, dur: 1.4, gain: 0.18 })); }
function creak(o, t, dur) { const now = ac.currentTime + t, s = ac.createOscillator(); s.type = 'sawtooth'; s.frequency.setValueAtTime(rand(55, 80), now); for (let i = 1; i < 8; i++) s.frequency.setValueAtTime(rand(40, 110), now + (dur * i) / 8); const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 9; b.frequency.setValueAtTime(rand(600, 900), now); b.frequency.linearRampToValueAtTime(rand(1100, 1600), now + dur); s.connect(b); env(b, now, dur * 0.2, 0.5, dur * 0.8, 'lin').connect(o); s.start(now); s.stop(now + dur + 0.05); }
export function door(x, z) { if (!ok()) return; const o = out(1, x, z, 0.4); creak(o, 0, 0.7); tone(o, { t: 0.65, dur: 0.35, f0: 85, f1: 38, gain: 1 }); nz(o, { t: 0.65, dur: 0.25, f0: 1400, f1: 180, gain: 0.8 }); nz(o, { t: 0.7, dur: 0.6, type: 'bandpass', f0: 2000, f1: 900, q: 0.8, gain: 0.25, attack: 0.05 }); }
export function plank(x, z, broke) {
  if (!ok() || !allow('plank', 0.2)) return; const o = out(broke ? 1 : 0.7, x, z, 0.3);
  if (broke) { const h = shaper(o, 1.6); for (let i = 0; i < 4; i++) nz(h, { t: i * 0.018 + rand(0, 0.01), dur: 0.05, type: 'bandpass', f0: rand(500, 1800), f1: 300, q: 4, gain: 0.8 }); tone(h, { dur: 0.12, type: 'triangle', f0: 200, f1: 80, gain: 0.7 }); nz(o, { t: 0.05, dur: 0.35, type: 'bandpass', f0: 3000, f1: 800, q: 0.7, gain: 0.35 }); }
  else { for (const t of [0, 0.16]) { tone(o, { t, dur: 0.07, type: 'triangle', f0: 260, f1: 140, gain: 0.7 }); nz(o, { t, dur: 0.03, type: 'bandpass', f0: 2600, f1: 1800, q: 3, gain: 0.8 }); } }
}

// ---------------------------------------------------------------- voices
// A human vocal tract, not an animal: glottal pulses with slow vibrato and per-cycle jitter, a soft creak (half-pitch subharmonic)
// instead of rapid gating, five formants with real bandwidths following a vowel path, and breath through the same tract.
const VOW = { // male formants F1..F5 (Hz)
  u: [320, 800, 2240, 3200, 3700], o: [450, 820, 2500, 3300, 3750], uh: [600, 1150, 2400, 3250, 3750],
  a: [740, 1150, 2450, 3300, 3800], ae: [680, 1650, 2450, 3300, 3800], er: [480, 1330, 1700, 3250, 3750],
};
const BW = [90, 110, 160, 220, 280], FG = [1, 0.55, 0.3, 0.16, 0.1];
function voice(x, z, { f = 100, dur = 1.2, gain = 0.6, path = ['uh', 'u'], pitch = [1, 1.06, 0.82], creak = 0.25, breath = 0.18, vibHz = 5, vib = 0.012, tract = 0.92, y = 1.55, strain = 1 }) {
  const o = out(gain, x, z, 0.3, y), t0 = ac.currentTime + 0.01, end = t0 + dur;
  // source: pitch contour with slow vibrato and a little random jitter, plus creak at half pitch
  const osc = ac.createOscillator(), sub = ac.createOscillator(); osc.setPeriodicWave(glottal); sub.setPeriodicWave(glottal);
  const n = pitch.length - 1;
  pitch.forEach((m, i) => { const t = t0 + (dur * i) / n; osc.frequency.linearRampToValueAtTime(f * m, t); sub.frequency.linearRampToValueAtTime((f * m) / 2, t); });
  for (let t = t0 + 0.03; t < end; t += 0.07) { const j = 1 + (Math.random() - 0.5) * 0.025; osc.detune.setValueAtTime(1200 * Math.log2(j), t); }
  const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = vibHz * rand(0.85, 1.15); vg.gain.value = f * vib; v.connect(vg); vg.connect(osc.frequency);
  const lowest = (f * Math.min(...pitch)) / 2, src_ = ac.createGain(), subG = ac.createGain(); subG.gain.value = creak * clamp((lowest - 50) / 25, 0, 1); osc.connect(src_); sub.connect(subG); subG.connect(src_);
  // gentle drive only when straining (attack scream), never a fuzz box
  let drive = src_; if (strain > 1) { const pre = ac.createGain(); pre.gain.value = strain; const ws = ac.createWaveShaper(); ws.curve = sat; src_.connect(pre); pre.connect(ws); drive = ws; }
  // breath: aspiration through the same formants, and a little breathy high end
  const bn = src(pink, 1, t0), bg = ac.createGain(); bg.gain.value = breath; bn.connect(bg);
  const hiss = src(noise, 1, t0), hf = ac.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 3200; hf.Q.value = 0.8; const hg = ac.createGain(); hg.gain.value = breath * 0.25; hiss.connect(hf); hf.connect(hg);
  // amplitude: slow swell and fade, with mild shimmer
  const vca = ac.createGain(); vca.gain.setValueAtTime(0.0001, t0); vca.gain.linearRampToValueAtTime(0.85, t0 + Math.min(0.25, dur * 0.22)); vca.gain.linearRampToValueAtTime(1, t0 + dur * 0.5);
  for (let t = t0 + dur * 0.25; t < t0 + dur * 0.7; t += 0.09) vca.gain.linearRampToValueAtTime(rand(0.85, 1), t);
  vca.gain.linearRampToValueAtTime(0.6, t0 + dur * 0.8); vca.gain.exponentialRampToValueAtTime(0.0001, end);
  // vocal tract: parallel formant bank following the vowel path (zombie tract a bit longer = formants lower)
  const fm = path.map((k) => VOW[k].map((F) => F * tract)), m = fm.length - 1;
  for (let i = 0; i < 5; i++) {
    const b = ac.createBiquadFilter(); b.type = 'bandpass'; const g = ac.createGain(); g.gain.value = FG[i] * (i < 2 ? 1 : 1.3);
    fm.forEach((F, k) => { const t = t0 + (dur * k) / Math.max(1, m); b.frequency.linearRampToValueAtTime(F[i], t); b.Q.setValueAtTime(F[i] / BW[i], t); });
    drive.connect(b); bg.connect(b); b.connect(g); g.connect(vca);
  }
  hg.connect(vca);
  const lip = ac.createBiquadFilter(); lip.type = 'highshelf'; lip.frequency.value = 2000; lip.gain.value = -4; vca.connect(lip); lip.connect(o);
  for (const nd of [osc, sub, v]) { nd.start(t0); nd.stop(end + 0.05); } bn.stop(end + 0.05); hiss.stop(end + 0.05);
}
// a short in-breath before a moan
function inhale(x, z, gain) { const o = out(gain, x, z, 0.25, 1.55); nz(o, { dur: 0.35, type: 'bandpass', f0: 1800, f1: 2600, q: 1.2, gain: 0.5, attack: 0.25, buf: pink }); }
export function groan(x, z, fast) {
  if (!ok() || !allow('voice', fast ? 0.9 : 2.2)) return;
  if (fast) voice(x, z, { f: rand(120, 150), dur: rand(0.6, 0.9), gain: 1.2, path: ['a', 'uh'], pitch: [1, 1.25, 0.9], creak: 0.3, breath: 0.35, vib: 0.02, vibHz: 6.5, strain: 1.6 });
  else {
    const r = Math.random(), path = r < 0.4 ? ['uh', 'o', 'u'] : r < 0.75 ? ['er', 'uh', 'o'] : ['a', 'uh', 'u'];
    if (Math.random() < 0.35) inhale(x, z, 0.4);
    voice(x, z, { f: rand(84, 110), dur: rand(1.3, 2.2), gain: 1.5, path, pitch: [0.95, 1.08, 1.0, 0.8], creak: rand(0.18, 0.35), breath: 0.22, vib: 0.014, vibHz: rand(4, 5.5), tract: rand(0.86, 0.95) });
  }
}
export function zombieAttack(x, z) { if (!ok() || !allow('voice', 0.6)) return; voice(x, z, { f: rand(170, 220), dur: 0.55, gain: 0.95, path: ['ae', 'a', 'uh'], pitch: [0.85, 1.25, 1.15, 0.85], creak: 0.35, breath: 0.45, vib: 0.03, vibHz: 7, strain: 2.2, tract: 0.95 }); }
export function zombieDie(x, z, how) {
  if (!ok() || !allow('die', 0.5)) return;
  if (how === 'burn') voice(x, z, { f: rand(190, 240), dur: 1.5, gain: 1.25, path: ['ae', 'a', 'a', 'uh'], pitch: [1, 1.3, 1.2, 1.25, 0.7], creak: 0.25, breath: 0.5, vib: 0.05, vibHz: 9, strain: 2.4, tract: 0.95 });
  else if (how === 'gurgle') { voice(x, z, { f: rand(95, 115), dur: 1.1, gain: 1.0, path: ['o', 'u', 'uh'], pitch: [1, 0.85, 0.95, 0.6], creak: 0.6, breath: 0.6, vib: 0.06, vibHz: 13, y: 1.0, strain: 1.2 }); }
  else if (how === 'grunt') voice(x, z, { f: rand(130, 160), dur: 0.45, gain: 1.2, path: ['uh', 'er'], pitch: [1.2, 0.8], creak: 0.35, breath: 0.5, vib: 0.01, y: 1.0, strain: 1.8 });
  else voice(x, z, { f: rand(120, 145), dur: 0.9, gain: 1.2, path: ['a', 'uh', 'er'], pitch: [1.1, 0.9, 0.72], creak: 0.3, breath: 0.4, vib: 0.01, y: 1.0, strain: 1.3 });
  const o = out(0.5, x, z, 0.15, 0.6); nz(o, { t: 0.5, dur: 0.6, type: 'bandpass', f0: 900, f1: 400, q: 0.8, gain: 0.35, attack: 0.15, buf: pink });
}
// a body hitting the floor: a dull low thump, the slap of cloth and limbs a moment later (k: 1 full fall, <1 knees)
export function bodyfall(x, z, k = 1) {
  if (!ok() || !allow('fall', 0.25)) return; const o = out(0.75 * Math.min(1.3, k), x, z, 0.22, 0.1), h = shaper(o, 1.3);
  tone(h, { dur: 0.22 * k + 0.05, f0: rand(95, 120) / Math.max(0.8, k), f1: 38, gain: 1 }); nz(h, { dur: 0.09, f0: 900, f1: 120, gain: 0.9 });
  if (k > 0.6) { nz(o, { t: rand(0.06, 0.1), dur: 0.12, type: 'bandpass', f0: rand(500, 800), f1: 220, q: 1.2, gain: 0.55, buf: pink }); tone(o, { t: rand(0.12, 0.2), dur: 0.08, f0: 140, f1: 60, gain: 0.45 }); nz(o, { t: 0.02, dur: 0.3, type: 'bandpass', f0: 2600, f1: 900, q: 0.6, gain: 0.12, attack: 0.03 }); }
}
// a head shot kill: a wet crack
export function splat(x, z) { if (!ok() || !allow('flesh', 0.15)) return; const o = out(0.7, x, z, 0.12, 1.6), h = shaper(o, 1.6); nz(h, { dur: 0.035, type: 'highpass', f0: 3000, f1: 1600, gain: 0.9 }); tone(h, { dur: 0.07, f0: 420, f1: 120, gain: 0.6 }); nz(o, { t: 0.015, dur: 0.22, type: 'bandpass', f0: 900, f1: 320, q: 2.5, gain: 0.6, rate: 0.5 }); for (let i = 0; i < 3; i++) nz(o, { t: 0.08 + i * rand(0.04, 0.08), dur: 0.05, type: 'bandpass', f0: rand(1200, 2400), f1: 700, q: 3, gain: 0.25 }); }
export function hurt() { if (!ok()) return; const o = out(0.95, undefined, undefined, 0.2), h = shaper(o, 1.8); tone(h, { dur: 0.22, f0: 160, f1: 55, gain: 1 }); nz(h, { dur: 0.14, f0: 1800, f1: 220, gain: 0.9 }); nz(o, { t: 0.02, dur: 0.18, type: 'bandpass', f0: 700, f1: 400, q: 3, gain: 0.5, rate: 0.6 }); }
export function heartbeat() { if (!ok()) return; const o = out(0.75, undefined, undefined, 0); tone(o, { dur: 0.12, f0: 62, f1: 40, gain: 1 }); tone(o, { t: 0.22, dur: 0.14, f0: 55, f1: 36, gain: 0.8 }); }

// ---------------------------------------------------------------- music cues
function pad(o, t, freqs, dur, gain, bright = 1400) {
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, ac.currentTime + t); lp.frequency.linearRampToValueAtTime(bright, ac.currentTime + t + dur * 0.4); lp.frequency.linearRampToValueAtTime(400, ac.currentTime + t + dur); lp.connect(o);
  for (const f of freqs) for (const d of [-0.006, 0.006]) tone(lp, { t, dur, type: 'sawtooth', f0: f * (1 + d), gain, attack: dur * 0.35 });
}
export function roundStart() {
  if (!ok()) return; const o = out(0.5, undefined, undefined, 0.9);
  bell(o, { f: 98, dur: 5, gain: 0.5, parts: [1, 2.4, 3.01, 4.2, 5.4, 6.8] }); bell(o, { t: 1.4, f: 98, dur: 5, gain: 0.45, parts: [1, 2.4, 3.01, 4.2, 5.4, 6.8] });
  pad(o, 0.3, [73.4, 110, 146.8, 174.6], 4.5, 0.05); tone(o, { t: 0.2, dur: 4.5, f0: 36.7, gain: 0.5, attack: 1.2 });
}
export function roundEnd() { if (!ok()) return; const o = out(0.45, undefined, undefined, 0.9); bell(o, { f: 196, dur: 4, gain: 0.35 }); bell(o, { t: 0.7, f: 293.7, dur: 4, gain: 0.28 }); pad(o, 0.2, [98, 146.8, 196, 233.1], 4, 0.045, 1800); }
export function gameOver() { if (!ok()) return; const o = out(0.55, undefined, undefined, 0.9); bell(o, { f: 82.4, dur: 6, gain: 0.5, parts: [1, 2.4, 3.01, 4.2, 5.4] }); pad(o, 0.4, [55, 82.4, 98, 130.8], 6, 0.06, 900); tone(o, { dur: 6, f0: 41.2, f1: 30, gain: 0.5, attack: 1 }); }

// ---------------------------------------------------------------- flamethrower, thunder, explosions
let flameNode = null;
export function flameLoop(on) {
  if (!ac) return;
  const now = ac.currentTime;
  if (on && !flameNode && ac.state === 'running') {
    const o = out(0.8, undefined, undefined, 0.35);
    const s = src(noise), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.6;
    const bp = ac.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = 220; bp.gain.value = 10; bp.Q.value = 0.8;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.8, now + 0.07);
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 11; lg.gain.value = 0.2; lfo.connect(lg); lg.connect(g.gain);
    const crackle = src(noise, 1), cf = ac.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 3500; const cg = ac.createGain(); cg.gain.value = 0.0; const cl = ac.createOscillator(), clg = ac.createGain(); cl.type = 'square'; cl.frequency.value = 23; clg.gain.value = 0.12; cl.connect(clg); clg.connect(cg.gain); crackle.connect(cf); cf.connect(cg); cg.connect(o);
    s.connect(lp); lp.connect(bp); bp.connect(g); g.connect(o); lfo.start(now); cl.start(now);
    nz(o, { dur: 0.32, type: 'bandpass', f0: 300, f1: 1400, q: 1, gain: 0.9, attack: 0.02 });
    flameNode = { s, g, lfo, crackle, cl };
  } else if (!on && flameNode) {
    const n = flameNode; flameNode = null;
    n.g.gain.cancelScheduledValues(now); n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), now); n.g.gain.linearRampToValueAtTime(0.0001, now + 0.16);
    for (const x of [n.s, n.lfo, n.crackle, n.cl]) x.stop(now + 0.2);
  }
}
export function thunder(delay = 1) {
  if (!ok()) return; const o = out(0.95, undefined, undefined, 0.9), h = shaper(o, 1.3);
  nz(h, { t: delay, dur: 0.3, type: 'lowpass', f0: 3000, f1: 400, gain: 0.8, attack: 0.005 });
  for (let i = 0; i < 4; i++) nz(o, { t: delay + 0.15 + i * rand(0.25, 0.6), dur: rand(1.2, 2.4), type: 'lowpass', f0: rand(300, 600), f1: 50, gain: rand(0.6, 1), attack: rand(0.05, 0.3), buf: pink, rate: 0.5 });
  tone(o, { t: delay + 0.05, dur: 3, f0: 46, f1: 28, gain: 0.6, attack: 0.3 });
}
export function boom() {
  if (!ok()) return; const o = out(1.15, undefined, undefined, 0.9), h = shaper(o, 2);
  nz(h, { dur: 0.05, type: 'highpass', f0: 2500, f1: 1500, gain: 1, attack: 0.001 }); nz(h, { dur: 1.5, f0: 2600, f1: 60, gain: 1.2, buf: pink });
  tone(h, { dur: 1.2, f0: 85, f1: 22, gain: 1.3 }); for (let i = 0; i < 8; i++) nz(o, { t: 0.2 + Math.random() * 0.8, dur: 0.05, type: 'bandpass', f0: rand(1500, 4000), f1: 800, q: 3, gain: 0.25 });
}

// ---------------------------------------------------------------- ambience: wind, drone, creaks, distant moans, tension bed
export function ambience(on) {
  if (!ac || !on || amb) return;
  const now = ac.currentTime;
  const wind = src(pink, 0.6), wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 0.9;
  const wg = ac.createGain(); wg.gain.value = 0.09; const l1 = ac.createOscillator(), l1g = ac.createGain(); l1.frequency.value = 0.07; l1g.gain.value = 0.06; l1.connect(l1g); l1g.connect(wg.gain);
  const l2 = ac.createOscillator(), l2g = ac.createGain(); l2.frequency.value = 0.045; l2g.gain.value = 260; l2.connect(l2g); l2g.connect(wf.frequency);
  const whistle = src(noise), whf = ac.createBiquadFilter(); whf.type = 'bandpass'; whf.frequency.value = 1100; whf.Q.value = 14; const whg = ac.createGain(); whg.gain.value = 0.012; const l3 = ac.createOscillator(), l3g = ac.createGain(); l3.frequency.value = 0.11; l3g.gain.value = 380; l3.connect(l3g); l3g.connect(whf.frequency);
  wind.connect(wf); wf.connect(wg); wg.connect(master); whistle.connect(whf); whf.connect(whg); whg.connect(master);
  const drone = ac.createGain(); drone.gain.value = 0.035; for (const f of [41.2, 41.5, 61.7]) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(drone); o.start(now); } drone.connect(master);
  // tension: a muffled pulsing low string that swells with the horde
  tensionBus = ac.createGain(); tensionBus.gain.value = 0; const tl = ac.createBiquadFilter(); tl.type = 'lowpass'; tl.frequency.value = 520; tensionBus.connect(tl); tl.connect(master);
  for (const f of [55, 82.4, 110.5]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = rand(-8, 8); o.connect(tensionBus); o.start(now); }
  const pulse = ac.createOscillator(), pg = ac.createGain(); pulse.frequency.value = 1.6; pg.gain.value = 0.35; const tg2 = ac.createGain(); tg2.gain.value = 0.65; pulse.connect(pg); pg.connect(tg2.gain); tensionBus.disconnect(); tensionBus.connect(tg2); tg2.connect(tl); pulse.start(now);
  for (const n of [l1, l2, l3]) n.start(now);
  amb = { next: 6 };
}
// steady rain: a hiss outdoors, a muffled drumming on the roof indoors; crossfaded by where the player stands
let rainNode = null;
export function rain() {
  if (!ac || rainNode) return; const now = ac.currentTime;
  const s1 = src(noise), f1 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 3800; f1.Q.value = 0.4; const out1 = ac.createGain(); out1.gain.value = 0; s1.connect(f1); f1.connect(out1); out1.connect(master);
  const s2 = src(pink, 0.8), f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 700; const out2 = ac.createGain(); out2.gain.value = 0; s2.connect(f2); f2.connect(out2); out2.connect(master);
  rainNode = { out1, out2, drip: 2 };
}
export function rainTick(dt) {
  if (!rainNode || !ok()) return; const o = outdoors(), t = ac.currentTime;
  rainNode.out1.gain.setTargetAtTime(o ? 0.05 : 0.008, t, 0.4); rainNode.out2.gain.setTargetAtTime(o ? 0.05 : 0.09, t, 0.4);
  rainNode.drip -= dt; if (rainNode.drip <= 0) { rainNode.drip = rand(0.3, 1.4); const g = out(o ? 0.05 : 0.08, P.x + rand(-4, 4), P.z + rand(-4, 4), 0.3, o ? 0.1 : 2.5); tone(g, { dur: 0.05, f0: rand(1800, 3200), f1: rand(900, 1400), gain: 0.6, attack: 0.001 }); }
}
let music = null;
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]]; // Dm, Bb, Gm, A
const MELODY = [[74, 0], [77, 1], [76, 2], [74, 3], [72, 4.5], [70, 5], [69, 6], [74, 8], [77, 9], [81, 10], [79, 11], [77, 12.5], [76, 13], [73, 14], [74, 16], [72, 17], [70, 18], [69, 19], [67, 20.5], [65, 21], [64, 22], [62, 24], [65, 25], [64, 26], [61, 27], [62, 28.5]];
export function menuMusic(on) {
  if (!ac) return;
  if (!on) { if (music) { const m = music; music = null; clearInterval(m.timer); m.bus.gain.setTargetAtTime(0.0001, ac.currentTime, 0.6); setTimeout(() => m.bus.disconnect(), 3000); } return; }
  if (music) return;
  const bus = ac.createGain(); bus.gain.value = 0; bus.gain.setTargetAtTime(0.5, ac.currentTime, 1.2); bus.connect(master); const w = ac.createGain(); w.gain.value = 0.6; bus.connect(w); w.connect(verb.in);
  const beat = 0.75, bar = 4 * beat, loop = 8 * bar; let next = ac.currentTime + 0.2;
  const schedule = () => {
    while (next < ac.currentTime + 4) {
      const t0 = next - ac.currentTime;
      for (let b = 0; b < 8; b++) { const ch = CHORDS[b % 4]; pad(bus, t0 + b * bar, ch.map(NOTE), bar * 1.08, 0.028, 900); tone(bus, { t: t0 + b * bar, dur: bar, f0: NOTE(ch[0] - 12), gain: 0.16, attack: 0.4 }); }
      for (const [n, at] of MELODY) bell(bus, { t: t0 + at * beat, f: NOTE(n), dur: 2.4, gain: 0.07, parts: [1, 2, 3.01, 4.2] });
      next += loop;
    }
  };
  schedule(); music = { bus, timer: setInterval(() => { if (ok()) schedule(); }, 1000) };
}
export function tension(k) { if (tensionBus && ac) tensionBus.gain.setTargetAtTime(clamp(k, 0, 1) * 0.06, ac.currentTime, 0.8); }
// crows: two to four harsh caws from the dark trees
function crows(p) { const n = 2 + ((Math.random() * 3) | 0), f = rand(380, 470); for (let i = 0; i < n; i++) setTimeout(() => { if (ok()) voice(p.x, p.z, { f: f * rand(0.95, 1.05), dur: rand(0.2, 0.3), gain: 0.28, path: ['a', 'ae'], pitch: [1.1, 1, 0.85], creak: 0.7, breath: 0.6, vib: 0, strain: 3, tract: 0.55, y: 6 }); }, i * rand(380, 520)); }
// a dog howling somewhere beyond the village
function howl(p) { const o = out(0.16, p.x, p.z, 0.8, 2), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(o);
  const t = ac.currentTime, d = rand(2.2, 3.2), osc = ac.createOscillator(), g = ac.createGain(), vb = ac.createOscillator(), vg = ac.createGain(); osc.type = 'triangle';
  const f = rand(430, 520); osc.frequency.setValueAtTime(f * 0.8, t); osc.frequency.linearRampToValueAtTime(f * 1.25, t + d * 0.3); osc.frequency.linearRampToValueAtTime(f * 1.15, t + d * 0.7); osc.frequency.linearRampToValueAtTime(f * 0.75, t + d);
  vb.frequency.value = 5.5; vg.gain.value = 9; vb.connect(vg); vg.connect(osc.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 0.35); g.gain.setValueAtTime(1, t + d * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + d); osc.connect(g); g.connect(lp);
  for (const n of [osc, vb]) { n.start(t); n.stop(t + d + 0.05); } }
// the church bell of the village, a long way off
function toll() { const o = out(0.13, undefined, undefined, 1); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(o); for (let i = 0; i < 3; i++) bell(lp, { t: i * 2.6, f: 146.8, dur: 5, gain: 0.5, parts: [0.5, 1, 1.19, 1.5, 2, 2.52] }); }
export function ambientTick(dt) {
  if (!amb || !ok()) return;
  amb.next -= dt; if (amb.next > 0) return; amb.next = rand(6, 16);
  const a = Math.random() * 6.283, d = rand(14, 30), x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
  const u = Math.random(), far = (k) => ({ x: P.x + Math.cos(a) * k, z: P.z + Math.sin(a) * k });
  if (u < 0.32) { const o = out(0.35, P.x + Math.cos(a) * 4, P.z + Math.sin(a) * 4, 0.6, 2.8); creak(o, 0, rand(0.6, 1.4)); }
  else if (u < 0.55) voice(x, z, { f: rand(72, 95), dur: rand(1.8, 2.8), gain: 0.3, path: ['uh', 'o', 'u'], pitch: [0.95, 1.05, 0.8], creak: 0.2, breath: 0.25, tract: 0.88 });
  else if (u < 0.7) crows(far(rand(18, 30)));
  else if (u < 0.8) howl(far(45));
  else if (u < 0.88) toll();
  else if (u < 0.95) { const q = far(40); voice(q.x, q.z, { f: rand(260, 330), dur: rand(1.0, 1.5), gain: 0.18, path: ['a', 'ae', 'a'], pitch: [0.9, 1.25, 1.15, 0.7], creak: 0.1, breath: 0.4, vib: 0.04, vibHz: 7, strain: 2, tract: 1.15 }); } // someone far off, screaming
  else { const o = out(0.5, P.x + Math.cos(a) * 5, P.z + Math.sin(a) * 5, 0.5, 3); for (let i = 0; i < 5; i++) { tone(o, { t: i * rand(0.07, 0.14), dur: 0.05, type: 'triangle', f0: rand(1800, 3200), f1: 900, gain: 0.25 }); nz(o, { t: i * 0.1, dur: 0.04, type: 'bandpass', f0: 4200, f1: 2500, q: 4, gain: 0.3 }); } } // glass or tin rattling somewhere in the house
}
export const ambientDebug = { crows: (x, z) => crows({ x, z }), howl: (x, z) => howl({ x, z }), toll: () => toll() };
