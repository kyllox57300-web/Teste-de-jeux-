// Varied zombie deaths, all procedural on top of the pose the zombie had when it died.
// Each kind of death drives a few "channels" over time (how the whole body tips, slides, spins, how the knees,
// spine, neck and arms bend); the body is then dropped onto the floor so its lowest joint just touches it.
//   crumple  strings cut (head shots): knees give, the body folds down and topples
//   knees    drops to its knees, sways, then falls forward or onto its side
//   stumble  carried forward by its own momentum, falls face down with the arms out
//   back     thrown backward by a heavy hit, feet off the floor, arms flung out
//   spin     hit on the shoulder: spins round and goes down sideways
//   blast    explosion: thrown through the air, limbs flailing
//   burn     on fire: flails and staggers, sinks to its knees, curls up as it falls
//   slump    no room to fall (against a wall): sits down where it stands
import * as THREE from 'three';
import { G } from './ctx.js';
import { clamp, rand } from './util.js';
import { aimBone, turnBone } from './rig.js';
import * as SND from './audio.js';

const UP = new THREE.Vector3(0, 1, 0);
const _fB = new THREE.Vector3(), _rB = new THREE.Vector3(), _uB = new THREE.Vector3(), _t = new THREE.Vector3(), _t2 = new THREE.Vector3(), _p = new THREE.Vector3();
const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _q = new THREE.Quaternion();
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const ramp = (t, a, b) => ease((t - a) / (b - a));
const drop = (t, a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u; }; // gravity: slow start, fast finish
const brake = (t, a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return 1 - (1 - u) * (1 - u); }; // fast start, slows down
const bump = (t, a, b) => { const u = (t - a) / (b - a); return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };
const wob = (t, at, amp) => (t < at ? 0 : amp * Math.exp(-(t - at) * 7) * Math.sin((t - at) * 21)); // a small bounce after landing
const mix = (a, b, k) => a + (b - a) * k;

const LIMP = [0.12, 0, 0.25, 1]; // arm hanging under its own weight: [forward, up, out, world-down]
const FLAT = [0, -0.65, 0.45, 0.2]; // lying: arm along the body, a little out

function blank(c) {
  c.slide = 0; c.spin = 0; c.pitch = 0; c.roll = 0; c.twist = 0; c.air = 0;
  c.thL = 0; c.shL = 0; c.thR = 0; c.shR = 0; c.curl = 0; c.side = 0; c.turn = 0; c.neck = 0; c.look = 0;
  c.aL = LIMP; c.aR = LIMP; c.bL = null; c.bR = null; c.wL = 0; c.wR = 0;
  return c;
}
const lerpArm = (a, b, k, out) => { for (let i = 0; i < 4; i++) out[i] = a[i] + (b[i] - a[i]) * k; return out; };

// ---------------------------------------------------------------- the deaths
// every function fills the channels for time t (seconds since death); D holds the per-death random choices
const KINDS = {
  crumple(t, D, c) {
    const k = ramp(t, 0, 0.26), tip = drop(t, 0.2, 0.78), f = D.fd;
    c.thL = 1.15 * k * (1 - tip * 0.85); c.shL = 2.1 * k * (1 - tip * 0.8); c.thR = 0.95 * k * (1 - tip * 0.75); c.shR = 1.9 * k * (1 - tip * 0.8);
    c.pitch = f * (1.5 * tip) + wob(t, 0.78, 0.05 * f); c.roll = D.rs * 0.3 * tip; c.twist = D.rs * 0.55 * tip;
    c.curl = 0.55 * k * (1 - tip); c.neck = (0.7 * k) * (1 - tip) + 0.15 * tip; c.look = D.rs * 0.5 * tip;
    c.wL = c.wR = 0.95; c.aL = lerpArm(LIMP, FLAT, tip, D.a1 || (D.a1 = [0, 0, 0, 0])); c.aR = lerpArm(LIMP, [0.3, 0.5, 0.6, 0.2], tip, D.a2 || (D.a2 = [0, 0, 0, 0]));
    D.hits = D.hits || [0.78];
    return 1.2;
  },
  slump(t, D, c) { // nowhere to fall: knees give and it sits back on its heels, head on its chest
    const k = ramp(t, 0, 0.35), s = ramp(t, 0.3, 0.9);
    c.thL = 1.2 * k + 0.3 * s; c.shL = 2.2 * k; c.thR = 1.1 * k + 0.35 * s; c.shR = 2.1 * k;
    c.pitch = D.fd * (0.15 * k + 0.25 * s) + wob(t, 0.4, 0.04); c.roll = D.rs * 0.18 * s;
    c.curl = 0.6 * k + 0.2 * s; c.neck = 0.8 * k; c.look = D.rs * 0.35 * s; c.side = D.rs * 0.2 * s;
    c.wL = c.wR = 0.95; c.aL = c.aR = LIMP;
    D.hits = D.hits || [0.42];
    return 1.0;
  },
  knees(t, D, c) {
    const k = ramp(t, 0, 0.3), sway = t > 0.3 && t < 1.25 ? Math.sin((t - 0.3) * 5.2) * 0.07 * bump(t, 0.3, 1.25) : 0, tip = drop(t, 1.12, 1.72);
    c.thL = mix(0.12 * k, 0.2, tip); c.shL = 1.6 * k * (1 - 0.8 * tip); c.thR = mix(0.08 * k, 0.12, tip); c.shR = 1.55 * k * (1 - 0.85 * tip);
    c.curl = (0.42 * k + sway) * (1 - tip); c.neck = 0.75 * k * (1 - tip) + 0.1 * tip; c.side = sway * 1.5;
    if (D.mode) { c.roll = D.rs * (1.45 * tip) + sway; c.twist = D.rs * 0.35 * tip; c.look = -D.rs * 0.4 * tip; }
    else { c.pitch = 1.5 * tip + wob(t, 1.72, 0.05); c.roll = sway; c.twist = D.rs * 0.6 * tip; c.look = D.rs * 0.6 * tip; }
    c.wL = c.wR = 0.9; c.aL = lerpArm(LIMP, FLAT, tip, D.a1 || (D.a1 = [0, 0, 0, 0])); c.aR = lerpArm(LIMP, D.mode ? [0.5, 0.2, 0.4, 0.25] : FLAT, tip, D.a2 || (D.a2 = [0, 0, 0, 0]));
    D.hits = D.hits || [0.3, 1.72];
    return 2.1;
  },
  stumble(t, D, c) {
    const tip = drop(t, 0.1, 0.7), st = bump(t, 0, 0.55), land = ramp(t, 0.5, 0.72);
    c.slide = D.dist * brake(t, 0, 0.75);
    c.pitch = 1.52 * tip + wob(t, 0.7, 0.05); c.twist = D.rs * 0.55 * ramp(t, 0.45, 0.8);
    c.thL = 0.6 * st; c.shL = 0.45 * st + 0.25 * land; c.thR = -0.3 * st; c.shR = 0.7 * bump(t, 0.08, 0.6) + 0.15 * land;
    c.curl = 0.3 * st; c.neck = -0.45 * ramp(t, 0.25, 0.65); c.look = D.rs * 0.8 * land;
    c.aL = lerpArm([0.9, -0.3, 0.25, 0.35], [0.1, 0.85, 0.75, 0.25], land, D.a1 || (D.a1 = [0, 0, 0, 0]));
    c.aR = lerpArm([0.9, -0.3, 0.25, 0.35], [-0.2, 0.2, 0.55, 0.3], land, D.a2 || (D.a2 = [0, 0, 0, 0]));
    c.wL = c.wR = 0.9 * ramp(t, 0, 0.2);
    D.hits = D.hits || [0.7];
    return 1.15;
  },
  back(t, D, c) {
    const T = D.T, tip = drop(t, 0, T), fl = ramp(t, 0.18, T * 0.95);
    c.slide = D.dist * brake(t, 0, T * 0.95); c.air = D.hop * bump(t, 0, T * 0.6);
    c.pitch = -1.53 * tip + wob(t, T, -0.07); c.twist = D.rs * 0.3 * ramp(t, T * 0.5, T);
    c.thL = 0.8 * bump(t, 0.03, T + 0.15) + 0.1; c.shL = 1.0 * bump(t, 0.03, T + 0.15); c.thR = 0.35 * bump(t, 0, T); c.shR = 0.55 * bump(t, 0, T) + 0.15 * fl;
    c.curl = -0.4 * bump(t, 0, T * 0.8); c.neck = -0.7 * bump(t, 0, T * 0.75) + 0.2 * fl; c.look = D.rs * 0.7 * fl;
    c.aL = lerpArm([0.95, 0.55, 0.2, 0], [-0.1, 0.6, 1, 0.3], fl, D.a1 || (D.a1 = [0, 0, 0, 0]));
    c.aR = lerpArm([0.9, 0.45, 0.25, 0], [-0.25, 0.15, 1, 0.3], fl, D.a2 || (D.a2 = [0, 0, 0, 0]));
    c.wL = c.wR = ramp(t, 0, 0.08);
    D.hits = D.hits || [T];
    return T + 0.55;
  },
  spin(t, D, c) {
    const tip = drop(t, 0.16, 0.78), land = ramp(t, 0.6, 0.85);
    c.spin = D.s * D.S * brake(t, 0, 0.8); c.slide = 0.4 * brake(t, 0, 0.8);
    c.roll = D.s * 1.45 * tip + wob(t, 0.78, 0.05 * D.s); c.twist = D.s * 0.6 * land;
    c.thL = 0.7 * ramp(t, 0.05, 0.35) * (1 - 0.6 * land); c.shL = 1.2 * ramp(t, 0.05, 0.35) * (1 - 0.6 * land); c.thR = 0.2; c.shR = 0.35;
    c.curl = 0.25 * (1 - land); c.side = -D.s * 0.3 * bump(t, 0, 0.7); c.neck = 0.3 * (1 - land); c.look = D.s * 0.6 * land;
    c.aL = lerpArm([0.15, 0.3, 1, 0], [0.2, -0.4, 0.5, 0.35], land, D.a1 || (D.a1 = [0, 0, 0, 0]));
    c.aR = lerpArm([0.1, 0.15, 1, 0], [0.4, 0.4, 0.6, 0.35], land, D.a2 || (D.a2 = [0, 0, 0, 0]));
    c.wL = c.wR = 0.95 * ramp(t, 0, 0.1);
    D.hits = D.hits || [0.78];
    return 1.2;
  },
  blast(t, D, c) {
    const T = D.T, fly = t < T ? t : T, land = ramp(t, T - 0.1, T + 0.15);
    c.air = Math.max(0, D.vy * fly - 4.9 * fly * fly);
    c.slide = D.dist * brake(t, 0, T + 0.3);
    c.pitch = D.fd * (1.52 + D.flip) * ease(Math.min(1, t / (T * 0.95))) + wob(t, T, 0.06 * D.fd); c.roll = D.rl * ramp(t, 0, T); c.spin = D.sp * brake(t, 0, T);
    const fl = (1 - land), w1 = Math.sin(t * 13), w2 = Math.sin(t * 11 + 1.3);
    c.thL = (0.6 + 0.4 * w1) * fl + 0.15; c.shL = (0.7 + 0.5 * w2) * fl + 0.2 * land; c.thR = (-0.2 + 0.4 * w2) * fl; c.shR = (0.5 + 0.4 * w1) * fl + 0.1;
    c.curl = (D.fd > 0 ? 0.3 : -0.35) * fl; c.neck = -0.5 * fl + 0.15 * land; c.look = D.rl * 1.2 * land;
    c.aL = lerpArm([0.2 + 0.4 * w2, 0.7 + 0.3 * w1, 1, 0], [0, 0.55, 1, 0.3], land, D.a1 || (D.a1 = [0, 0, 0, 0]));
    c.aR = lerpArm([0.3 + 0.4 * w1, 0.6 + 0.3 * w2, 1, 0], [0.2, -0.3, 0.8, 0.3], land, D.a2 || (D.a2 = [0, 0, 0, 0]));
    c.wL = c.wR = ramp(t, 0, 0.06);
    D.hits = D.hits || [T];
    return T + 0.55;
  },
  burn(t, D, c) {
    const fl = 1 - ramp(t, 1.25, 1.6), k = ramp(t, 1.25, 1.6), tip = drop(t, 1.55, 2.15), w = t * 1.0;
    c.spin = 0.9 * Math.sin(t * 2.1) * fl + D.s * 0.6 * ramp(t, 0, 1.4); c.slide = D.dist * ramp(t, 0, 1.4);
    c.thL = 0.35 * Math.max(0, Math.sin(t * 7.5)) * fl + 0.12 * k; c.shL = 0.6 * Math.max(0, Math.sin(t * 7.5)) * fl + 1.55 * k * (1 - 0.5 * tip);
    c.thR = 0.35 * Math.max(0, Math.sin(t * 7.5 + Math.PI)) * fl + 0.1 * k; c.shR = 0.6 * Math.max(0, Math.sin(t * 7.5 + Math.PI)) * fl + 1.5 * k * (1 - 0.5 * tip);
    c.pitch = 1.5 * tip + wob(t, 2.15, 0.05); c.roll = 0.12 * Math.sin(t * 3.1) * fl; c.twist = D.rs * 0.5 * tip;
    c.curl = (0.15 + 0.2 * Math.sin(t * 6)) * fl + 0.5 * k * (1 - tip) + 0.25 * tip; c.side = 0.25 * Math.sin(t * 4.3) * fl;
    c.neck = -0.55 * fl + 0.6 * k * (1 - tip); c.look = 0.5 * Math.sin(t * 5.3) * fl + D.rs * 0.5 * tip;
    // flailing at the flames, then curling up: fists drawn to the chest (the burned body's boxer pose)
    const a1 = D.a1 || (D.a1 = [0, 0, 0, 0]), a2 = D.a2 || (D.a2 = [0, 0, 0, 0]), b1 = D.b1 || (D.b1 = [0, 0, 0, 0]), b2 = D.b2 || (D.b2 = [0, 0, 0, 0]);
    lerpArm([0.3 + 0.6 * Math.sin(w * 9), 0.5 + 0.6 * Math.sin(w * 7.3), 0.7, 0], [0.55, -0.45, 0.35, 0], k, a1);
    lerpArm([0.3 + 0.6 * Math.sin(w * 8.1 + 2), 0.5 + 0.6 * Math.sin(w * 6.7 + 1), 0.7, 0], [0.55, -0.45, 0.35, 0], k, a2);
    lerpArm([0.3 + 0.6 * Math.sin(w * 9 + 0.8), 0.9, 0.3, 0], [0.4, 0.9, -0.55, 0], k, b1);
    lerpArm([0.3 + 0.6 * Math.sin(w * 8.1 + 2.8), 0.9, 0.3, 0], [0.4, 0.9, -0.55, 0], k, b2);
    c.aL = a1; c.aR = a2; c.bL = b1; c.bR = b2; c.wL = c.wR = ramp(t, 0, 0.15);
    D.hits = D.hits || [1.6, 2.15];
    return 2.55;
  },
};

// ---------------------------------------------------------------- knocked down, then back up
// The fall reuses a death (thrown back / stumbling forward); the body lies a moment, then climbs back to its feet
// through a few key poses (sitting up or onto hands and knees, a crouch or a kneel, a half rise, standing).
const NUM = ['pitch', 'roll', 'twist', 'spin', 'thL', 'shL', 'thR', 'shR', 'curl', 'side', 'neck', 'look'];
function snap(c) { const o = { aL: c.aL.slice(), aR: c.aR.slice(), w: c.wL }; for (const k of NUM) o[k] = c[k]; return o; }
function load(o, c) { for (const k of NUM) c[k] = o[k] || 0; c.aL = o.aL; c.aR = o.aR; c.wL = c.wR = o.w; }
function interp(keys, u, c, D) {
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1].u) i++;
  const A = keys[i], B = keys[i + 1], k = ease((u - A.u) / (B.u - A.u));
  for (const n of NUM) c[n] = mix(A[n] || 0, B[n] || 0, k);
  c.aL = lerpArm(A.aL || LIMP, B.aL || LIMP, k, D.b1 || (D.b1 = [0, 0, 0, 0])); c.aR = lerpArm(A.aR || LIMP, B.aR || LIMP, k, D.b2 || (D.b2 = [0, 0, 0, 0]));
  c.wL = c.wR = mix(A.w ?? 0.9, B.w ?? 0.9, k);
}
// leg angles in the side view: the thigh points (thigh - pitch) forward of straight down, the shin that much less the knee bend
const UP_FROM_BACK = [
  { u: 0.3, pitch: -0.3, thL: 1.0, shL: 1.8, thR: 0.8, shR: 1.75, curl: 0.45, neck: 0.25, aL: [-0.35, -0.6, 0.5, 0.6], aR: [-0.35, -0.6, 0.5, 0.6], w: 0.9 }, // sits up, hands behind
  { u: 0.56, pitch: 0.5, thL: 1.7, shL: 1.6, thR: 1.6, shR: 1.7, curl: 0.55, neck: -0.2, aL: [0.6, -0.4, 0.3, 0.6], aR: [0.5, -0.4, 0.35, 0.6], w: 0.8 }, // crouch over its feet
  { u: 0.8, pitch: 0.42, thL: 0.9, shL: 0.9, thR: 0.85, shR: 0.95, curl: 0.5, neck: -0.3, w: 0.6 }, // half way up
  { u: 1, pitch: 0.08, thL: 0.05, shL: 0.1, thR: 0.05, shR: 0.1, curl: 0.3, neck: -0.25, w: 0.3 },
];
const UP_FROM_FRONT = [
  { u: 0.3, pitch: 1.35, thL: 1.35, shL: 1.55, thR: 1.3, shR: 1.6, curl: 0.1, neck: -0.55, aL: [0.25, 0, 0.2, 1], aR: [0.25, 0, 0.2, 1], w: 0.95 }, // hands and knees
  { u: 0.55, pitch: 0.25, thL: 0.25, shL: 1.6, thR: 0.2, shR: 1.6, curl: 0.35, neck: -0.2, w: 0.85 }, // kneeling
  { u: 0.78, pitch: 0.3, thL: 1.45, shL: 1.35, thR: 0.25, shR: 1.5, curl: 0.4, neck: -0.25, w: 0.6 }, // one foot planted
  { u: 1, pitch: 0.08, thL: 0.05, shL: 0.1, thR: 0.05, shR: 0.1, curl: 0.3, neck: -0.25, w: 0.3 },
];
const GETUP = 1.6;
function knock(fall, fallEnd, keys) {
  return (t, D, c) => {
    const f1 = fallEnd(D), l1 = f1 + D.lie, end = l1 + GETUP;
    if (t < f1) { KINDS[fall](t, D, c); return end; }
    if (!D.L) { KINDS[fall](f1, D, c); D.L = snap(c); D.L.u = 0; }
    c.slide = D.dist;
    if (t < l1) { load(D.L, c); c.neck += 0.2 * Math.sin(t * 11) * bump(t, f1, f1 + 0.6); c.look += 0.25 * bump(t, l1 - 0.5, l1); return end; } // a twitch, then the head comes up
    interp([D.L, ...keys], (t - l1) / GETUP, c, D); return end;
  };
}
KINDS.knockB = knock('back', (D) => D.T + 0.45, UP_FROM_BACK);
KINDS.knockF = knock('stumble', () => 1.1, UP_FROM_FRONT);
// killed while down or getting up: from wherever it is, it slumps flat
KINDS.hold = (t, D, c) => {
  const k = drop(t, 0, 0.5), S = D.S, back = S.pitch < 0;
  for (const n of NUM) c[n] = mix(S[n] || 0, n === 'pitch' ? (back ? -1.53 : 1.52) : n === 'roll' || n === 'twist' || n === 'look' ? S[n] || 0 : n === 'thL' || n === 'thR' ? 0.15 : n === 'shL' || n === 'shR' ? 0.3 : 0, k);
  c.aL = lerpArm(S.aL, FLAT, k, D.b1 || (D.b1 = [0, 0, 0, 0])); c.aR = lerpArm(S.aR, FLAT, k, D.b2 || (D.b2 = [0, 0, 0, 0])); c.wL = c.wR = mix(S.w, 0.9, k); c.slide = D.dist;
  return 0.8;
};
export function holdDeath(z) {
  const c = blank(z.dc); KINDS[z.death](z.t, z.dD, c); // where the knock-down has the body right now (it may not have been drawn yet)
  const S = snap(c), D = { S, dist: z.dD.dist || 0, hits: Math.abs(S.pitch) < 1.2 ? [0.5] : [] };
  z.dAge0 = (z.dAge0 || 0) + z.t; z.death = 'hold'; z.dD = D; z.dLanded = 0;
}
// a heavy blow that does not kill: knocked off its feet. Returns false if there is no room to fall.
export function startKnock(z, dir, force) {
  const fx = Math.sin(z.yaw), fz = Math.cos(z.yaw), body = 1.75 * z.scale;
  let dx = -fx, dz = -fz; { const l = Math.hypot(dir.x, dir.z); if (l > 1e-4) { dx = dir.x / l; dz = dir.z / l; } }
  const D = { rs: Math.random() < 0.5 ? 1 : -1, fd: 1, mode: 0, s: 1, hits: null, lie: rand(0.5, 1.2) };
  if (dx * fx + dz * fz > 0.2) { const d = roomFor(z, fx, fz, rand(0.3, 0.7), body); if (d < 0) return false; D.dist = d; z.ddx = fx; z.ddz = fz; z.death = 'knockF'; }
  else { const d = roomFor(z, dx, dz, rand(0.4, 0.8) + Math.min(1, force * 0.3), body); if (d < 0) return false; D.dist = d; D.T = 0.52 + Math.min(0.12, force * 0.03); D.hop = Math.min(0.18, force * 0.05); D.fd = -1; z.ddx = dx; z.ddz = dz; z.death = 'knockB'; }
  z.dD = D; z.dx0 = z.x; z.dz0 = z.z; z.dc = z.dc || {}; z.dLanded = 0; z.dGround = undefined; z.dAge0 = 0;
  return true;
}

// ---------------------------------------------------------------- choosing
// clear floor from (x, z) along (dx, dz) for len metres?
const clear = (z, dx, dz, len) => G.world.los(z.x, z.z, z.x + dx * len, z.z + dz * len);
function roomFor(z, dx, dz, want, body) { // longest slide (<= want) that still leaves room for the body to lie down
  for (let d = want; d >= 0; d -= 0.25) if (clear(z, dx, dz, d + body)) return Math.max(0, d);
  return -1;
}
const pickW = (opts) => { let s = 0; for (const o of opts) s += o[1]; let u = Math.random() * s; for (const o of opts) { u -= o[1]; if (u <= 0) return o[0]; } return opts[0][0]; };

// info: { head, dir (THREE.Vector3 or null), force (damage / max health), melee, blast }
export function chooseDeath(z, info) {
  const fx = Math.sin(z.yaw), fz = Math.cos(z.yaw), rx = fz, rz = -fx, body = 1.75 * z.scale;
  let dx = 0, dz = 0; if (info.dir) { const l = Math.hypot(info.dir.x, info.dir.z); if (l > 1e-4) { dx = info.dir.x / l; dz = info.dir.z / l; } }
  const along = dx * fx + dz * fz, across = dx * rx + dz * rz, force = Math.min(4, info.force || 0);
  const D = { rs: Math.random() < 0.5 ? 1 : -1, fd: 1, mode: 0, s: across >= 0 ? 1 : -1, hits: null };
  const outside = !z.state || z.state === 'rise' || z.state === 'window' || z.state === 'climb';
  let kind;
  if (z.crawl) return null;
  if (info.blast) kind = 'blast';
  else if (z.burn > 0.3 && Math.random() < 0.8) kind = 'burn';
  else if (outside) kind = pickW([['crumple', 3], ['knees', 2], ['back', 2]]);
  else if (info.head) kind = force > 2.2 ? pickW([['back', 3], ['crumple', 2]]) : pickW([['crumple', 6], ['knees', 2], ['back', 1], ['spin', 1]]);
  else if (info.melee) kind = pickW([['back', 3], ['spin', 2], ['knees', 1]]);
  else if (along > 0.35) kind = pickW([['stumble', 5], ['knees', 1]]); // shot from behind: pitched forward
  else if (z.type === 2 && Math.random() < 0.55) kind = 'stumble'; // a runner keeps going and lands at your feet
  else if (force > 1.6) kind = pickW([['back', 6], ['spin', 2]]);
  else kind = pickW([['back', 3], ['knees', 3], ['spin', 2.5], ['crumple', 2], ['stumble', 1.2]]);

  if (G.debug && G.debug.forceDeath) kind = G.debug.forceDeath;
  // make sure the body has somewhere to land; otherwise fall another way, and as a last resort sit down
  z.ddx = undefined;
  const tries = [kind, 'crumple', 'knees', 'slump'];
  for (const k of tries) {
    if (k === 'back' || k === 'blast') {
      const bx = dx || -fx, bz = dz || -fz, want = k === 'blast' ? rand(2, 3.4) * Math.min(1.3, 0.5 + force * 0.3) : rand(0.5, 1.0) + Math.min(1.4, force * 0.35);
      const d = roomFor(z, bx, bz, want, k === 'blast' ? 0.9 : body); if (d < 0) continue;
      D.dist = d; D.T = 0.52 + Math.min(0.12, force * 0.03); D.hop = Math.min(0.22, force * 0.05);
      // the slide runs along the push; the body tips the way it is pushed (facing it: onto its back)
      z.ddx = bx; z.ddz = bz; D.fd = (bx * fx + bz * fz) > 0 ? 1 : -1;
      if (k === 'blast') { D.vy = rand(2.6, 3.8) * Math.min(1.1, 0.6 + force * 0.2); D.T = (2 * D.vy) / 9.8; D.flip = force > 1.6 && Math.random() < 0.35 ? Math.PI * 2 : 0; D.rl = rand(-0.6, 0.6); D.sp = rand(-1.6, 1.6); }
      else if (D.fd > 0) continue; // pushed from behind: a stumble reads better
      kind = k; break;
    }
    if (k === 'stumble') { const d = roomFor(z, fx, fz, z.type === 2 ? rand(0.9, 1.5) : rand(0.35, 0.8), body); if (d < 0) continue; D.dist = d; z.ddx = fx; z.ddz = fz; kind = k; break; }
    if (k === 'spin') { // spins about half a turn, so look for room on either side
      D.S = rand(1.5, 2.6); const ok = clear(z, rx * D.s, rz * D.s, body) && clear(z, -rx * D.s, -rz * D.s, 1) && clear(z, fx, fz, 1) && clear(z, -fx, -fz, 1); if (!ok) continue;
      z.ddx = dx; z.ddz = dz; kind = k; break;
    }
    if (k === 'burn') { if (!clear(z, fx, fz, body + 0.6)) continue; D.dist = 0.5; z.ddx = fx; z.ddz = fz; D.s = Math.random() < 0.5 ? 1 : -1; kind = k; break; }
    if (k === 'crumple' || k === 'knees') {
      // forward or back for a crumple, forward or onto a side for the knees
      const f = clear(z, fx, fz, body * 0.95), b = clear(z, -fx, -fz, body * 0.95), sR = clear(z, rx, rz, body * 0.9), sL = clear(z, -rx, -rz, body * 0.9);
      if (k === 'crumple') { if (!f && !b) continue; D.fd = f && b ? (Math.random() < 0.7 ? 1 : -1) : f ? 1 : -1; }
      else { if (f && Math.random() < 0.6) D.mode = 0; else if (sR || sL) { D.mode = 1; D.rs = sR && sL ? D.rs : sR ? 1 : -1; } else if (f) D.mode = 0; else continue; }
      z.ddx = 0; z.ddz = 0; kind = k; break;
    }
    if (k === 'slump') { D.fd = clear(z, fx, fz, 0.8) ? 1 : -1; z.ddx = 0; z.ddz = 0; kind = k; break; }
  }
  if (z.ddx === undefined || Number.isNaN(z.ddx)) { z.ddx = 0; z.ddz = 0; }
  if (D.dist === undefined) D.dist = 0;
  z.death = kind; z.dD = D; z.dx0 = z.x; z.dz0 = z.z; z.dc = z.dc || {}; z.dRest = 1; z.dLanded = 0; z.dAge0 = 0;
  return kind;
}

// ---------------------------------------------------------------- posing
const CONTACT = [['Hips', 0.11], ['Spine1', 0.12], ['Spine2', 0.13], ['Neck', 0.08], ['Head', 0.1], ['LeftLeg', 0.07], ['RightLeg', 0.07], ['LeftForeArm', 0.05], ['RightForeArm', 0.05], ['LeftHand', 0.04], ['RightHand', 0.04]];
function armDir(spec, side, out) {
  out.set(0, 0, 0).addScaledVector(_fB, spec[0]).addScaledVector(_uB, spec[1]).addScaledVector(_rB, spec[2] * side).addScaledVector(UP, -spec[3]);
  if (out.lengthSq() < 1e-6) out.copy(UP).negate(); return out.normalize();
}
// a limb from a joint at height h, reach len, may not point into the floor: flatten it just enough
function noFloor(dir, h, len) {
  const lim = -Math.max(0, h - 0.05) / len; if (dir.y >= lim) return dir;
  const hx = dir.x, hz = dir.z, hl = Math.hypot(hx, hz), y = Math.max(-1, lim), k = Math.sqrt(Math.max(0, 1 - y * y));
  if (hl < 1e-4) dir.set(_fB.x, 0, _fB.z).normalize().multiplyScalar(k); else dir.set((hx / hl) * k, 0, (hz / hl) * k);
  dir.y = y; return dir;
}
// Pose a dead zombie for time t. Returns true once the body is at rest.
export function poseDeath(z, t) {
  const c = blank(z.dc), D = z.dD, rest = KINDS[z.death](t, D, c), H = z.holder, B = z.bones, s = z.scale;
  z.dRest = rest;
  z.x = z.dx0 + z.ddx * c.slide; z.z = z.dz0 + z.ddz * c.slide;
  _e.set(c.pitch, z.yaw + c.spin, c.roll, 'YXZ'); H.quaternion.setFromEuler(_e); _q.setFromAxisAngle(UP, c.twist); H.quaternion.multiply(_q);
  if (z.dGround === undefined) z.dGround = 0;
  H.position.set(z.x, z.dGround, z.z);
  for (const [b, q] of z.deathPose) b.quaternion.copy(q);
  // the stride it died in melts away: legs and back go slack toward a plain standing pose, the bends below act on that
  { const a = t + (z.dAge0 || 0), kL = ramp(a, 0, 0.3), kS = ramp(a, 0, 0.45) * 0.8; for (const [b, q, leg] of z.relaxQ) b.quaternion.slerp(q, leg ? kL : kS); }
  H.updateMatrixWorld(true);
  const m = H.matrixWorld; _rB.setFromMatrixColumn(m, 0).normalize(); _uB.setFromMatrixColumn(m, 1).normalize(); _fB.setFromMatrixColumn(m, 2).normalize();
  // legs: thigh forward, knee bent back
  if (c.thL) turnBone(B.LeftUpLeg, _rB, -c.thL); if (c.shL) turnBone(B.LeftLeg, _rB, c.shL);
  if (c.thR) turnBone(B.RightUpLeg, _rB, -c.thR); if (c.shR) turnBone(B.RightLeg, _rB, c.shR);
  // spine and head
  if (c.curl) { turnBone(B.Spine, _rB, c.curl * 0.4); turnBone(B.Spine1, _rB, c.curl * 0.35); turnBone(B.Spine2, _rB, c.curl * 0.25); }
  if (c.side) turnBone(B.Spine1, _fB, c.side);
  if (c.turn) turnBone(B.Spine2, _uB, c.turn);
  if (B.Head.scale.x > 0.5) { if (c.neck) turnBone(B.Neck, _rB, c.neck); if (c.look) turnBone(B.Neck, _uB, c.look); }
  // arms
  for (const [S, side, a, b, w] of [['Left', 1, c.aL, c.bL, c.wL], ['Right', -1, c.aR, c.bR, c.wR]]) {
    if (w <= 0.01) continue;
    _p.setFromMatrixPosition(B[S + 'Arm'].matrixWorld); aimBone(B[S + 'Arm'], B[S + 'ForeArm'], noFloor(armDir(a, side, _t), _p.y, 0.62 * s), w);
    armDir(b || a, side, _t2); if (!b) _t2.addScaledVector(_fB, 0.25).normalize();
    _p.setFromMatrixPosition(B[S + 'ForeArm'].matrixWorld); aimBone(B[S + 'ForeArm'], B[S + 'Hand'], noFloor(_t2, _p.y, 0.34 * s), w);
  }
  if (z.shock > 0) for (const k of ['Spine1', 'Neck', 'LeftForeArm', 'RightForeArm', 'LeftLeg']) turnBone(B[k], _rB, rand(-0.45, 0.45));
  // rest on the floor: the lowest joint (plus the flesh around it) touches it; feet use their own standing height
  let lo = 1e9;
  for (const [k, r] of CONTACT) { const b = B[k]; if (!b || b.scale.x < 0.5) continue; _p.setFromMatrixPosition(b.matrixWorld); lo = Math.min(lo, _p.y - r * s); }
  for (const k of ['LeftFoot', 'RightFoot']) { const b = B[k]; if (!b) continue; _p.setFromMatrixPosition(b.matrixWorld); lo = Math.min(lo, _p.y - z.ankle * s); }
  if (z.headTop && B.Head.scale.x > 0.5) { _p.setFromMatrixPosition(z.headTop.matrixWorld); lo = Math.min(lo, _p.y - 0.06 * s); }
  z.dGround -= lo; H.position.y = z.dGround + c.air; z.y = H.position.y;
  H.updateMatrixWorld(true);
  // landing: a thud, a puff of dust, blood where the chest comes down
  const hits = D.hits;
  while (z.dLanded < hits.length && t >= hits[z.dLanded]) {
    const last = z.dLanded === hits.length - 1; z.dLanded++;
    _p.setFromMatrixPosition(B.Spine2.matrixWorld);
    if (Math.hypot(z.x - G.player.x, z.z - G.player.z) < 22) SND.bodyfall(_p.x, _p.z, last ? (z.brute ? 1.4 : 1) : 0.45);
    if (last) { G.fx.dirt(_p.x, _p.z, z.death === 'blast' ? 10 : 6); G.fx.pool(_p.x, _p.z); }
  }
  return t >= rest;
}
