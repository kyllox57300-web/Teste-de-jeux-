// Touch controls for phones and tablets: a floating stick on the left thumb, drag-to-look on the right,
// round buttons for the rest, and a light console-style aim assist so shooting with a thumb stays fair.
import * as THREE from 'three';
import { G } from './ctx.js';
import { rayWorld } from './weapons.js';

export function touchDevice() {
  const mm = (q) => window.matchMedia && window.matchMedia(q).matches;
  return mm('(pointer: coarse)') && !mm('(pointer: fine)') || (navigator.maxTouchPoints > 0 && !mm('(hover: hover)'));
}

// [id, angle in degrees around the fire button (0 = left, 90 = up), distance, diameter]
const RING = [
  ['t-ads', 180, 104, 62], ['t-reload', 135, 104, 58], ['t-jump', 90, 106, 58],
  ['t-use', 176, 196, 74], ['t-melee', 148, 172, 54], ['t-swap', 116, 178, 58], ['t-gren', 90, 186, 54],
];
const FIRE = 98, FIRE_RIGHT = 30, FIRE_BOTTOM = 34; // fire button size and its gap from the corner

export function initTouch({ input, pause, $ }) {
  const root = $('touch'), base = $('t-base'), knob = $('t-knob'), prompt = $('prompt');
  const T = { on: false, k: 1, sens: 2.1 };
  let look = null, stick = null, assist = 0, adsWas = false;

  const down = (el, fn, up) => {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (err) { /* capture unsupported */ } el.classList.add('on'); fn(e); });
    const end = (e) => { el.classList.remove('on'); if (up) up(e); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  };
  const startLook = (e) => { look = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
  const moveLook = (e) => {
    if (!look || e.pointerId !== look.id) return;
    const dx = e.clientX - look.x, dy = e.clientY - look.y; look.x = e.clientX; look.y = e.clientY;
    // a little acceleration on quick swipes so turning around stays one gesture
    const sp = Math.hypot(dx, dy), acc = 1 + Math.min(0.8, Math.max(0, sp - 6) * 0.03);
    input.dx += dx * T.sens * acc; input.dy += dy * T.sens * acc;
  };
  const endLook = (e) => { if (look && e.pointerId === look.id) look = null; };

  // right side of the screen: drag to look
  const lookPad = $('t-look');
  lookPad.addEventListener('pointerdown', (e) => { e.preventDefault(); try { lookPad.setPointerCapture(e.pointerId); } catch (err) { /* capture unsupported */ } startLook(e); });
  for (const el of [lookPad]) { el.addEventListener('pointermove', moveLook); el.addEventListener('pointerup', endLook); el.addEventListener('pointercancel', endLook); }

  // left side: a stick that appears under the thumb; pushed to the rim forward, it sprints
  const movePad = $('t-move');
  const restStick = () => { base.style.left = ''; base.style.top = ''; base.classList.remove('live', 'run'); knob.style.transform = ''; };
  movePad.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (stick) return;
    try { movePad.setPointerCapture(e.pointerId); } catch (err) { /* capture unsupported */ }
    const r = movePad.getBoundingClientRect();
    stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
    base.style.left = e.clientX - r.left + 'px'; base.style.top = e.clientY - r.top + 'px'; base.classList.add('live');
  });
  movePad.addEventListener('pointermove', (e) => {
    if (!stick || e.pointerId !== stick.id) return;
    const R = 56 * T.k; let dx = e.clientX - stick.x, dy = e.clientY - stick.y; const l = Math.hypot(dx, dy);
    // past the rim the stick follows the thumb, so a drifting thumb never loses control
    if (l > R * 1.35) { const m = (l - R * 1.35) / l; stick.x += dx * m; stick.y += dy * m; const r = movePad.getBoundingClientRect(); base.style.left = stick.x - r.left + 'px'; base.style.top = stick.y - r.top + 'px'; dx = e.clientX - stick.x; dy = e.clientY - stick.y; }
    const n = Math.min(1, Math.hypot(dx, dy) / R), a = Math.atan2(dy, dx), v = n < 0.14 ? 0 : (n - 0.14) / 0.86;
    input.ax = Math.cos(a) * v; input.ay = -Math.sin(a) * v;
    input.sprint = n > 0.97 && input.ay > 0.75;
    base.classList.toggle('run', input.sprint);
    knob.style.transform = `translate(${Math.cos(a) * n * R}px, ${Math.sin(a) * n * R}px)`;
  });
  const endStick = (e) => { if (!stick || e.pointerId !== stick.id) return; stick = null; input.ax = input.ay = 0; input.sprint = false; restStick(); };
  movePad.addEventListener('pointerup', endStick); movePad.addEventListener('pointercancel', endStick);

  // buttons
  const fire = $('t-fire');
  down(fire, (e) => { input.fire = true; input.firePressed = true; startLook(e); }, (e) => { input.fire = false; endLook(e); });
  fire.addEventListener('pointermove', moveLook);
  down($('t-ads'), () => { input.ads = !input.ads; });
  down($('t-reload'), () => G.weapons.reload());
  down($('t-jump'), () => { input.jump = true; }, () => { input.jump = false; });
  const use = $('t-use');
  const useOn = () => { if (!input.use) input.usePressed = true; input.use = true; }, useOff = () => { input.use = false; };
  down(use, useOn, useOff);
  down(prompt, useOn, useOff); // the on-screen prompt itself can be pressed too
  down($('t-swap'), () => { input.ads = false; G.weapons.switchWeapon(); });
  down($('t-gren'), () => G.weapons.throwGrenade());
  down($('t-melee'), () => G.weapons.melee());
  down($('t-pause'), () => pause());

  T.layout = () => {
    const w = window.innerWidth, h = window.innerHeight;
    T.k = Math.max(0.72, Math.min(1.2, Math.min(w, h) / 420));
    const k = T.k, cx = FIRE_RIGHT * k + (FIRE * k) / 2, cy = FIRE_BOTTOM * k + (FIRE * k) / 2;
    const place = (el, x, y, d) => { el.style.width = el.style.height = d + 'px'; el.style.right = x - d / 2 + 'px'; el.style.bottom = y - d / 2 + 'px'; };
    place(fire, cx, cy, FIRE * k);
    for (const [id, ang, dist, d] of RING) { const a = (ang * Math.PI) / 180; place($(id), cx - Math.cos(a) * dist * k, cy + Math.sin(a) * dist * k, d * k); }
    root.style.setProperty('--k', k);
  };
  T.layout();
  window.addEventListener('resize', T.layout);

  T.enable = (on) => { T.on = on; document.body.classList.toggle('touch', on); };
  T.reset = () => {
    look = null; stick = null; restStick(); assist = 0; adsWas = false;
    input.ax = input.ay = 0; input.sprint = input.jump = input.use = input.fire = input.ads = false;
    for (const b of root.querySelectorAll('.on')) b.classList.remove('on');
  };

  // aim assist: raising the sights pulls toward the nearest visible zombie; holding fire gently tracks it
  const _c = new THREE.Vector3(), _t = new THREE.Vector3(), _d = new THREE.Vector3();
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function target(maxAng) {
    const p = G.player, cam = G.camera; cam.getWorldPosition(_c);
    let best = null, bestA = maxAng;
    for (const z of G.zombies.list) {
      if (z.state === 'dead' || z.y < -0.6 || !z.bones || !z.bones.Spine2) continue;
      _t.setFromMatrixPosition(z.bones.Spine2.matrixWorld);
      _d.subVectors(_t, _c); const dist = _d.length(); if (dist > 32 || dist < 0.3) continue;
      const yaw = Math.atan2(-_d.x, -_d.z), pitch = Math.asin(_d.y / dist);
      const dy = wrap(yaw - p.yaw), dp = pitch - p.pitch, ang = Math.hypot(dy * Math.cos(p.pitch), dp);
      if (ang >= bestA) continue;
      _d.multiplyScalar(1 / dist); if (rayWorld(_c, _d, dist).t < dist - 0.4) continue;
      best = { dy, dp }; bestA = ang;
    }
    return best;
  }
  T.update = (dt) => {
    if (!T.on || G.player.dead) return;
    const p = G.player;
    if (input.ads && !adsWas) assist = 0.22; adsWas = input.ads;
    if (assist > 0) {
      assist -= dt; const t = target(0.2);
      if (t) { const f = 1 - Math.exp(-16 * dt); p.yaw += t.dy * f; p.pitch += t.dp * f; }
    } else if (input.fire) {
      const t = target(0.09);
      if (t) { const f = 1 - Math.exp(-5 * dt); p.yaw += t.dy * f; p.pitch += t.dp * f; }
    }
    use.classList.toggle('lit', prompt.classList.contains('on'));
    $('t-ads').classList.toggle('lock', input.ads);
  };
  return T;
}
