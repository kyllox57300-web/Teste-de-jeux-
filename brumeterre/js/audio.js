// Brumeterre — sons et musiques synthétisés (Web Audio, aucun fichier)
(function (B) {
  'use strict';
  const A = B.Audio = { ctx: null, on: false, sfxVol: 0.8, musVol: 0.6, track: null };
  let ctx, master, sfxBus, musBus, rev, noiseBuf, delay;
  const last = {}; let voices = 0;

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = A.ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = 1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = A.sfxVol; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = A.musVol * 0.55; musBus.connect(master);
    // réverbération générée
    rev = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    rev.buffer = ir;
    const revG = ctx.createGain(); revG.gain.value = 0.32; rev.connect(revG); revG.connect(master);
    delay = ctx.createDelay(1); delay.delayTime.value = 0.36; const fb = ctx.createGain(); fb.gain.value = 0.28; const dl = ctx.createGain(); dl.gain.value = 0.22;
    delay.connect(fb); fb.connect(delay); delay.connect(dl); dl.connect(musBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    A.on = true;
    if (A.wantTrack) A.music(A.wantTrack);
  };
  A.setVol = function (s, m) {
    A.sfxVol = s; A.musVol = m;
    if (sfxBus) sfxBus.gain.setTargetAtTime(s, ctx.currentTime, 0.05);
    if (musBus) musBus.gain.setTargetAtTime(m * 0.55, ctx.currentTime, 0.1);
  };
  A.suspend = function () { if (ctx && ctx.state === 'running') ctx.suspend(); };
  A.resume = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };

  // ───── Briques ─────
  function env(g, t, a, d, peak, sus) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus || 0.0001), t + a + d); }
  function tone(o) {
    const t = o.t || ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + (o.slide || o.d));
    if (o.det) osc.detune.value = o.det;
    const g = ctx.createGain(); env(g, t, o.a || 0.005, o.d, o.v || 0.3);
    let node = osc;
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || 0.8; osc.connect(f); node = f; }
    node.connect(g); g.connect(o.bus || sfxBus);
    if (o.rv) { const s = ctx.createGain(); s.gain.value = o.rv; g.connect(s); s.connect(rev); }
    if (o.dl) { const s = ctx.createGain(); s.gain.value = o.dl; g.connect(s); s.connect(delay); }
    osc.start(t); osc.stop(t + (o.a || 0.005) + o.d + 0.05);
    voices++; osc.onended = () => voices--;
  }
  function noise(o) {
    const t = o.t || ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1000, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.d); f.Q.value = o.q || 1;
    const g = ctx.createGain(); env(g, t, o.a || 0.003, o.d, o.v || 0.3);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    if (o.rv) { const s = ctx.createGain(); s.gain.value = o.rv; g.connect(s); s.connect(rev); }
    src.start(t, Math.random() * 0.5); src.stop(t + (o.a || 0.003) + o.d + 0.05);
    voices++; src.onended = () => voices--;
  }
  const r = (a, b) => a + Math.random() * (b - a);

  const SFX = {
    hit: () => { noise({ f: r(1800, 2600), ft: 'bandpass', q: 2, d: 0.05, v: 0.12 }); tone({ f: r(180, 240), f2: 90, d: 0.06, v: 0.1, type: 'triangle' }); },
    crit: () => { noise({ f: 3500, ft: 'bandpass', q: 3, d: 0.08, v: 0.2 }); tone({ f: 900, f2: 1600, d: 0.08, v: 0.12, type: 'square', lp: 3000 }); },
    die: () => { noise({ f: r(600, 1000), f2: 150, d: 0.18, v: 0.16 }); tone({ f: r(300, 420), f2: 80, d: 0.15, v: 0.12, type: 'triangle' }); },
    elitedie: () => { noise({ f: 1200, f2: 80, d: 0.5, v: 0.35, rv: 0.3 }); tone({ f: 220, f2: 40, d: 0.5, v: 0.3, type: 'sawtooth', lp: 900 }); },
    bossdie: () => { noise({ f: 2000, f2: 60, d: 1.6, v: 0.5, rv: 0.6 }); tone({ f: 110, f2: 30, d: 1.5, v: 0.4, type: 'sawtooth', lp: 600 }); [523, 659, 784, 1047].forEach((f, i) => tone({ t: ctx.currentTime + 0.6 + i * 0.12, f: f, d: 0.8, v: 0.12, type: 'triangle', rv: 0.5 })); },
    boom: () => { noise({ f: 900, f2: 60, d: 0.4, v: 0.4, rv: 0.2 }); tone({ f: 120, f2: 35, d: 0.35, v: 0.35, type: 'sine' }); },
    freeze: () => { tone({ f: 2200, f2: 3400, d: 0.25, v: 0.08, type: 'sine', rv: 0.4 }); noise({ f: 6000, ft: 'highpass', d: 0.2, v: 0.08 }); },
    xp: () => { tone({ f: 1100 + (A.xpPitch = ((A.xpPitch || 0) + 1) % 12) * 45, d: 0.05, v: 0.05, type: 'sine' }); },
    coin: () => { tone({ f: 1500, d: 0.05, v: 0.08, type: 'square', lp: 4000 }); tone({ t: ctx.currentTime + 0.05, f: 2000, d: 0.12, v: 0.08, type: 'square', lp: 4000 }); },
    heal: () => { [660, 880, 1100].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.06, f: f, d: 0.2, v: 0.08, type: 'sine', rv: 0.4 })); },
    magnet: () => tone({ f: 300, f2: 1400, d: 0.4, v: 0.12, type: 'triangle', rv: 0.3 }),
    chest: () => { tone({ f: 200, f2: 150, d: 0.1, v: 0.2, type: 'square', lp: 800 }); [784, 988, 1175, 1568].forEach((f, i) => tone({ t: ctx.currentTime + 0.1 + i * 0.07, f: f, d: 0.3, v: 0.1, type: 'triangle', rv: 0.4 })); },
    hurt: () => { tone({ f: 160, f2: 60, d: 0.2, v: 0.35, type: 'sawtooth', lp: 700 }); noise({ f: 500, d: 0.12, v: 0.2 }); },
    block: () => { tone({ f: 1200, f2: 900, d: 0.15, v: 0.15, type: 'triangle', rv: 0.3 }); noise({ f: 4000, ft: 'bandpass', q: 4, d: 0.06, v: 0.12 }); },
    revive: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.08, f: f, d: 0.6, v: 0.12, type: 'triangle', rv: 0.6 })); },
    special: () => { noise({ f: 300, f2: 4000, d: 0.35, v: 0.25, rv: 0.4 }); tone({ f: 220, f2: 880, d: 0.4, v: 0.25, type: 'sawtooth', lp: 2500, rv: 0.4 }); },
    clear: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.09, f: f, d: 0.5, v: 0.1, type: 'triangle', rv: 0.5, dl: 0.3 })); },
    roar: () => { noise({ f: 400, f2: 120, d: 1.0, v: 0.45, rv: 0.4, q: 3, ft: 'bandpass' }); tone({ f: 90, f2: 55, d: 1, v: 0.35, type: 'sawtooth', lp: 400 }); },
    eshoot: () => tone({ f: r(500, 620), f2: 300, d: 0.08, v: 0.06, type: 'square', lp: 1800 }),
    eshoot2: () => tone({ f: 380, f2: 200, d: 0.12, v: 0.08, type: 'sawtooth', lp: 1200 }),
    shoot: () => tone({ f: r(1300, 1500), f2: 700, d: 0.07, v: 0.06, type: 'triangle' }),
    bow: () => { noise({ f: 2500, ft: 'bandpass', q: 1.5, d: 0.08, v: 0.08 }); tone({ f: 400, f2: 250, d: 0.06, v: 0.05, type: 'triangle' }); },
    fire: () => { noise({ f: 900, f2: 300, d: 0.25, v: 0.15 }); },
    throw: () => noise({ f: 1500, f2: 600, ft: 'bandpass', d: 0.1, v: 0.07 }),
    ice: () => tone({ f: 2400, f2: 1800, d: 0.1, v: 0.05, type: 'sine', rv: 0.2 }),
    spore: () => tone({ f: 300, f2: 500, d: 0.12, v: 0.05, type: 'sine' }),
    whip: () => noise({ f: 3000, f2: 800, ft: 'bandpass', q: 2, d: 0.12, v: 0.12 }),
    swing: () => { noise({ f: 600, f2: 2400, ft: 'bandpass', q: 1.5, d: 0.14, v: 0.15 }); tone({ f: 120, f2: 70, d: 0.12, v: 0.15, type: 'sine' }); },
    rune: () => tone({ f: 440, f2: 880, d: 0.3, v: 0.08, type: 'sine', rv: 0.5 }),
    zap: () => { noise({ f: 5000, ft: 'highpass', d: 0.1, v: 0.1 }); tone({ f: 1800, f2: 400, d: 0.1, v: 0.06, type: 'square', lp: 5000 }); },
    whoosh: () => noise({ f: 800, f2: 2000, ft: 'bandpass', q: 1, d: 0.2, v: 0.08 }),
    beam: () => tone({ f: 600, f2: 1800, d: 0.2, v: 0.08, type: 'sawtooth', lp: 3000, rv: 0.2 }),
    nova: () => { tone({ f: 300, f2: 900, d: 0.3, v: 0.12, type: 'triangle', rv: 0.4 }); },
    bell: () => { [523, 1046, 1568].forEach((f, i) => tone({ f: f, d: 1.2, v: 0.12 / (i + 1), type: 'sine', rv: 0.6 })); },
    place: () => tone({ f: 200, d: 0.06, v: 0.08, type: 'square', lp: 800 }),
    orbhit: () => tone({ f: r(900, 1200), d: 0.06, v: 0.04, type: 'sine' }),
    splash: () => noise({ f: 1200, f2: 400, d: 0.2, v: 0.1 }),
    thunder: () => { noise({ f: 3000, f2: 200, d: 0.6, v: 0.3, rv: 0.5 }); },
    slam: () => { noise({ f: 300, f2: 50, d: 0.4, v: 0.4 }); tone({ f: 80, f2: 30, d: 0.4, v: 0.4 }); },
    breath: () => noise({ f: 600, f2: 2500, d: 0.8, v: 0.25, rv: 0.3 }),
    rescue: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.1, f: f, d: 0.5, v: 0.12, type: 'triangle', rv: 0.6, dl: 0.3 })); },
    levelup: () => { [523, 659, 784, 1047].forEach((f, i) => { tone({ t: ctx.currentTime + i * 0.07, f: f, d: 0.35, v: 0.13, type: 'triangle', rv: 0.5 }); tone({ t: ctx.currentTime + i * 0.07, f: f * 2, d: 0.2, v: 0.04, type: 'sine' }); }); },
    click: () => tone({ f: 900, f2: 700, d: 0.04, v: 0.08, type: 'triangle' }),
    open: () => { tone({ f: 500, f2: 800, d: 0.12, v: 0.08, type: 'triangle', rv: 0.3 }); },
    close: () => tone({ f: 700, f2: 450, d: 0.1, v: 0.07, type: 'triangle' }),
    legendary: () => { [523, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.06, f: f, d: 1, v: 0.1, type: 'triangle', rv: 0.7, dl: 0.4 })); noise({ f: 8000, ft: 'highpass', d: 1, v: 0.05, rv: 0.6 }); },
    buy: () => { SFX.coin(); tone({ t: ctx.currentTime + 0.1, f: 1300, d: 0.2, v: 0.08, type: 'sine' }); },
    build: () => { [0, 0.15, 0.3].forEach(t => { noise({ t: ctx.currentTime + t, f: 900, f2: 200, d: 0.1, v: 0.25 }); }); [392, 523, 659, 784].forEach((f, i) => tone({ t: ctx.currentTime + 0.5 + i * 0.09, f: f, d: 0.6, v: 0.1, type: 'triangle', rv: 0.5 })); },
    error: () => tone({ f: 200, f2: 150, d: 0.18, v: 0.12, type: 'square', lp: 900 }),
    page: () => noise({ f: 3000, ft: 'bandpass', q: 0.8, d: 0.12, v: 0.06 }),
    victory: () => { const n = [523, 659, 784, 1047, 784, 1047, 1319]; n.forEach((f, i) => tone({ t: ctx.currentTime + i * 0.13, f: f, d: 0.6, v: 0.13, type: 'triangle', rv: 0.6 })); },
    defeat: () => { [392, 349, 311, 262].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.25, f: f, d: 0.8, v: 0.12, type: 'triangle', rv: 0.6, lp: 1500 })); },
    unlock: () => { [659, 880, 1175].forEach((f, i) => tone({ t: ctx.currentTime + i * 0.1, f: f, d: 0.5, v: 0.12, type: 'sine', rv: 0.6 })); },
    pick: () => { tone({ f: 600, f2: 1200, d: 0.15, v: 0.1, type: 'triangle', rv: 0.3 }); }
  };
  A.sfx = function (id, vol) {
    if (!A.on || !ctx || ctx.state !== 'running' || A.sfxVol <= 0) return;
    const now = ctx.currentTime;
    const gap = id === 'hit' || id === 'xp' || id === 'orbhit' ? 0.035 : 0.06;
    if (last[id] && now - last[id] < gap) return;
    if (voices > 48 && id !== 'levelup' && id !== 'hurt') return;
    last[id] = now;
    const f = SFX[id]; if (!f) return;
    try { f(); } catch (e) { /* ignore */ }
  };

  // ───── Musique procédurale ─────
  const SC = { major: [0, 2, 4, 5, 7, 9, 11], lyd: [0, 2, 4, 6, 7, 9, 11], dor: [0, 2, 3, 5, 7, 9, 10], aeo: [0, 2, 3, 5, 7, 8, 10], phr: [0, 1, 3, 5, 7, 8, 10], hmin: [0, 2, 3, 5, 7, 8, 11] };
  const TRACKS = {
    title: { bpm: 64, root: 50, sc: 'aeo', prog: [0, 5, 3, 6], pad: 'sine', lead: 'triangle', drums: 0, arp: 0, bell: 1, dens: 0.35 },
    village: { bpm: 84, root: 55, sc: 'lyd', prog: [0, 4, 5, 3], pad: 'triangle', lead: 'triangle', drums: 1, arp: 1, bell: 1, dens: 0.55, warm: 1 },
    forest: { bpm: 96, root: 50, sc: 'dor', prog: [0, 6, 3, 4], pad: 'sine', lead: 'triangle', drums: 2, arp: 1, dens: 0.5 },
    swamp: { bpm: 80, root: 45, sc: 'phr', prog: [0, 1, 0, 5], pad: 'sawtooth', lead: 'sine', drums: 2, arp: 0, dens: 0.4, dark: 1 },
    ruins: { bpm: 90, root: 52, sc: 'hmin', prog: [0, 5, 3, 4], pad: 'triangle', lead: 'sine', drums: 2, arp: 1, bell: 1, dens: 0.45 },
    peaks: { bpm: 88, root: 57, sc: 'aeo', prog: [0, 3, 5, 4], pad: 'sine', lead: 'sine', drums: 1, arp: 1, bell: 1, dens: 0.4, airy: 1 },
    heart: { bpm: 100, root: 43, sc: 'phr', prog: [0, 1, 5, 0], pad: 'sawtooth', lead: 'square', drums: 3, arp: 1, dens: 0.5, dark: 1 },
    boss: { bpm: 132, root: 45, sc: 'hmin', prog: [0, 5, 6, 4], pad: 'sawtooth', lead: 'square', drums: 4, arp: 1, dens: 0.7, dark: 1 },
    endless: { bpm: 120, root: 48, sc: 'dor', prog: [0, 3, 6, 4], pad: 'sawtooth', lead: 'triangle', drums: 3, arp: 1, dens: 0.65 }
  };
  let seqTimer = null, step = 0, nextT = 0, cur = null, motif = null;
  A.music = function (name) {
    A.wantTrack = name;
    if (!A.on || !ctx) return;
    if (A.track === name) return;
    A.track = name;
    if (musBus) { musBus.gain.cancelScheduledValues(ctx.currentTime); musBus.gain.setValueAtTime(musBus.gain.value, ctx.currentTime); musBus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6); musBus.gain.linearRampToValueAtTime(A.musVol * 0.55, ctx.currentTime + 1.4); }
    setTimeout(() => {
      cur = TRACKS[name] || null; step = 0; nextT = ctx.currentTime + 0.1;
      if (cur) { const rr = B.rng(B.hashStr(name)); motif = []; for (let i = 0; i < 32; i++) motif.push(rr() < cur.dens ? rr.int(0, 9) : -1); }
      if (!seqTimer) seqTimer = setInterval(tick, 60);
    }, 650);
  };
  A.stopMusic = function () { A.track = null; cur = null; };
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function deg(T, d, oct) { const s = SC[T.sc]; const o = Math.floor(d / 7); return T.root + 12 * (o + (oct || 0)) + s[((d % 7) + 7) % 7]; }
  function tick() {
    if (!cur || !ctx || ctx.state !== 'running' || A.musVol <= 0) { if (ctx) nextT = ctx.currentTime + 0.1; return; }
    const T = cur, spb = 60 / T.bpm / 2; // croches
    while (nextT < ctx.currentTime + 0.25) {
      const bar = Math.floor(step / 8) % T.prog.length, s8 = step % 8, ch = T.prog[bar];
      const t = nextT;
      // nappe
      if (s8 === 0) [0, 2, 4].forEach(k => tone({ t: t, f: mtof(deg(T, ch + k, 0)), d: spb * 8, a: spb * 2, v: T.pad === 'sawtooth' ? 0.035 : 0.06, type: T.pad, lp: T.dark ? 700 : 1400, bus: musBus, rv: 0.5, det: (k - 1) * 6 }));
      // basse
      if (s8 === 0 || s8 === 4 || (T.drums >= 3 && s8 % 2 === 0)) tone({ t: t, f: mtof(deg(T, ch, -1)), d: spb * (T.drums >= 3 ? 1.6 : 3.5), v: 0.12, type: 'triangle', lp: 500, bus: musBus });
      // arpège
      if (T.arp && (T.drums >= 3 || s8 % 2 === 0)) { const k = [0, 2, 4, 7][s8 % 4]; tone({ t: t, f: mtof(deg(T, ch + k, 1)), d: spb * 0.9, v: 0.035, type: T.airy ? 'sine' : 'triangle', lp: 2600, bus: musBus, dl: 0.4 }); }
      // mélodie
      const m = motif[step % 32];
      if (m >= 0 && (step % 64) >= 16) tone({ t: t, f: mtof(deg(T, ch + m, T.dark ? 1 : 2) - (T.dark ? 0 : 12)), d: spb * 1.8, a: 0.02, v: 0.05, type: T.lead, lp: T.lead === 'square' ? 1800 : 3000, bus: musBus, rv: 0.35, dl: 0.3 });
      if (T.bell && s8 === 6 && bar % 2 === 1) tone({ t: t, f: mtof(deg(T, ch + 4, 2)), d: 1.5, v: 0.04, type: 'sine', bus: musBus, rv: 0.7 });
      // percussions
      if (T.drums) {
        if (s8 === 0 || (T.drums >= 3 && s8 === 4) || (T.drums >= 4 && s8 === 6)) { tone({ t: t, f: 110, f2: 40, d: 0.18, v: T.drums >= 3 ? 0.3 : 0.18, type: 'sine', bus: musBus }); }
        if (T.drums >= 2 && s8 === 4) noise({ t: t, f: 1800, ft: 'bandpass', q: 0.8, d: 0.12, v: T.drums >= 3 ? 0.08 : 0.04, bus: musBus, rv: 0.2 });
        if (T.drums >= 1 && s8 % 2 === 1) noise({ t: t, f: 7000, ft: 'highpass', d: 0.03, v: 0.025, bus: musBus });
        if (T.drums >= 4 && s8 % 2 === 0) noise({ t: t, f: 8000, ft: 'highpass', d: 0.02, v: 0.02, bus: musBus });
      }
      nextT += spb; step++;
    }
  }
  A.biomeTrack = (b) => ['forest', 'swamp', 'ruins', 'peaks', 'heart'][b] || 'forest';
})(this.B || (this.B = {}));
