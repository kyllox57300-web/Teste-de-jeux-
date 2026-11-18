/* =========================================================
   SONS ET MUSIQUE (Web Audio, aucun fichier)
   ========================================================= */
const AUD = {ctx:null, timer:null, nextT:0, step:0, settings:null};
const R = Math.random, rnd = (a, b) => a + R() * (b - a), pick = a => a[Math.floor(R() * a.length)];
export function setSettings(fn){ AUD.settings = fn; }
const st = () => AUD.settings ? AUD.settings() : {sound:true, music:true};
export function audioInit(){
  if(AUD.ctx){ if(AUD.ctx.state === 'suspended') AUD.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
  const c = AUD.ctx = new AC();
  AUD.out = c.createGain(); AUD.out.gain.value = 0.55; AUD.out.connect(c.destination);
  AUD.music = c.createGain(); AUD.music.gain.value = 0; AUD.music.connect(c.destination);
  const len = c.sampleRate * 0.5, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for(let i = 0; i < len; i++) d[i] = R() * 2 - 1; AUD.noise = buf;
  musicUpdate();
}
export function resume(){ if(AUD.ctx && AUD.ctx.state === 'suspended') AUD.ctx.resume(); }
function tone(f, t, dur, type, vol, f2, dest){ const c = AUD.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dest || AUD.out); o.start(t); o.stop(t + dur + 0.05); }
function noise(t, dur, freq, vol, q, type){ const c = AUD.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = AUD.noise;
  f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(AUD.out); s.start(t, R() * 0.3); s.stop(t + dur + 0.02); }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
let lastDig = 0;
export function sfx(n, x){
  if(!AUD.ctx || !st().sound) return; const t = AUD.ctx.currentTime;
  switch(n){
    case 'dig': if(t - lastDig < 0.05) return; lastDig = t; noise(t, 0.16, rnd(500, 900), 0.5, 0.8); tone(rnd(90, 120), t, 0.1, 'sine', 0.22, 50); break;
    case 'clear': noise(t, 0.4, 300, 0.45, 0.6); tone(520, t + 0.05, 0.12, 'triangle', 0.14); tone(780, t + 0.12, 0.15, 'triangle', 0.14); break;
    case 'item': tone(880, t, 0.08, 'triangle', 0.14); tone(1320, t + 0.06, 0.1, 'triangle', 0.11); break;
    case 'rare': [72, 76, 79, 84].forEach((m, i) => tone(mtof(m), t + i * 0.06, 0.18, 'square', 0.06)); break;
    case 'leg': [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => { tone(mtof(m), t + i * 0.08, 0.45, 'square', 0.07); tone(mtof(m + 12), t + i * 0.08, 0.35, 'sine', 0.05); }); break;
    case 'coin': for(let i = 0; i < 5; i++){ tone(1500 + i * 120, t + i * 0.06, 0.08, 'square', 0.05); tone(2200 + i * 150, t + i * 0.06 + 0.03, 0.1, 'square', 0.04); } break;
    case 'buy': tone(1200, t, 0.06, 'square', 0.07); tone(1800, t + 0.05, 0.12, 'square', 0.06); break;
    case 'quest': [64, 67, 72].forEach((m, i) => tone(mtof(m), t + i * 0.08, 0.2, 'triangle', 0.12)); break;
    case 'level': [60, 64, 67, 72, 76].forEach((m, i) => tone(mtof(m), t + i * 0.07, 0.3, 'triangle', 0.13)); break;
    case 'ult': [48, 55, 60, 64, 67, 72, 76, 79].forEach((m, i) => { tone(mtof(m), t + i * 0.09, 0.6, 'sawtooth', 0.05); tone(mtof(m), t + i * 0.09, 0.6, 'triangle', 0.08); }); break;
    case 'click': tone(rnd(520, 640), t, 0.05, 'square', 0.05, 300); break;
    case 'click2': tone(1400, t, 0.04, 'square', 0.06); tone(900, t + 0.04, 0.05, 'square', 0.05); break;
    case 'unlock': [60, 64, 67, 72].forEach((m, i) => tone(mtof(m), t + i * 0.1, 0.3, 'square', 0.07)); break;
    case 'chapter': [60, 64, 67, 72, 67, 72, 76].forEach((m, i) => tone(mtof(m), t + i * 0.12, 0.35, 'square', 0.07)); break;
    case 'event': tone(440, t, 0.15, 'square', 0.07); tone(330, t + 0.15, 0.2, 'square', 0.07); break;
    case 'error': tone(180, t, 0.18, 'sawtooth', 0.09, 120); break;
    case 'beep': tone(900 + (x || 0) * 900, t, 0.07, 'sine', 0.1 + (x || 0) * 0.15); break;
    case 'open': noise(t, 0.25, 1800, 0.25, 2); tone(300, t + 0.05, 0.15, 'triangle', 0.12, 500); break;
    case 'lift': noise(t, 0.3, 200, 0.4, 0.7); tone(110, t, 0.25, 'sine', 0.2, 160); break;
    case 'throw': noise(t, 0.5, 800, 0.3, 0.5, 'highpass'); tone(300, t, 0.5, 'sine', 0.12, 900); break;
    case 'quake': noise(t, 1.2, 80, 0.9, 0.5, 'lowpass'); tone(50, t, 1.0, 'sine', 0.5, 30); break;
    case 'magnet': tone(200, t, 0.6, 'sawtooth', 0.06, 800); tone(205, t, 0.6, 'sawtooth', 0.06, 805); break;
    case 'crane': tone(150, t, 0.5, 'square', 0.05, 220); break;
    case 'repair': noise(t, 0.08, 3000, 0.3, 3); tone(1100, t, 0.06, 'square', 0.05); break;
  }
}
const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], PENTA = [69, 72, 74, 76, 79, 81];
export function musicUpdate(){
  if(!AUD.ctx) return; const on = st().music;
  AUD.music.gain.setTargetAtTime(on ? 0.05 : 0, AUD.ctx.currentTime, 0.3);
  if(on && !AUD.timer){ AUD.nextT = AUD.ctx.currentTime + 0.1; AUD.timer = setInterval(musicSched, 60); }
  if(!on && AUD.timer){ clearInterval(AUD.timer); AUD.timer = null; }
}
function musicSched(){
  const c = AUD.ctx, beat = 60 / 88 / 2;
  while(AUD.nextT < c.currentTime + 0.25){
    const t = AUD.nextT, s = AUD.step, chord = PROG[Math.floor(s / 8) % 4];
    if(s % 8 === 0) chord.forEach(m => tone(mtof(m), t, beat * 7.5, 'triangle', 0.22, null, AUD.music));
    if(s % 4 === 0) tone(mtof(chord[0] - 12), t, beat * 1.8, 'sine', 0.5, null, AUD.music);
    if(s % 2 === 1 && R() < 0.3) tone(mtof(pick(PENTA)), t, beat * 1.5, 'sine', 0.18, null, AUD.music);
    if(s % 2 === 0) tone(4000, t, 0.03, 'square', 0.015, null, AUD.music);
    AUD.nextT += beat; AUD.step++;
  }
}
