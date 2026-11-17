import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { G } from './ctx.js';
import { loadAssets } from './assets.js';
import { buildTextures } from './textures.js';
import { buildWorld } from './world.js';
import { buildAtmosphere } from './atmos.js';
import { initWeapons, buildGunModel, WEAPONS, rayWorld } from './weapons.js';
import { setGunEnv } from './guns.js';
import { initZombies } from './zombies.js';
import { initFx } from './fx.js';
import { initHud } from './hud.js';
import { initPlayer } from './player.js';
import { initGame } from './game.js';
import * as SND from './audio.js';
import { initTouch, touchDevice } from './touch.js';

const $ = (id) => document.getElementById(id);
const canvas = $('c');
const input = { fwd: false, back: false, left: false, right: false, sprint: false, jump: false, fire: false, firePressed: false, ads: false, use: false, usePressed: false, dx: 0, dy: 0, mx: 0.5, ax: 0, ay: 0 };
let touch = null;
let composer = null, bloom = null, grade = null, level = 'high', free = false, lockedOnce = false, lastLockTry = 0, flashlight = null;

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uLow: { value: 0 }, uVig: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uLow, uVig; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){ vec2 dc=vUv-0.5; float ca=dot(dc,dc)*0.012; vec4 c=texture2D(tDiffuse,vUv); c.r=texture2D(tDiffuse,vUv+dc*ca*2.0).r; c.b=texture2D(tDiffuse,vUv-dc*ca*2.0).b;
      vec2 q=(vUv-0.5)*vec2(1.0,0.86); float v=smoothstep(0.86,0.28,length(q));
      float lum=dot(c.rgb,vec3(0.2126,0.7152,0.0722)); c.rgb*=mix(vec3(0.9,0.98,1.1), vec3(1.07,1.0,0.9), smoothstep(0.05,0.6,lum)); c.rgb=mix(vec3(lum),c.rgb,0.92);
      c.rgb*=mix(1.0, mix(0.3,1.0,v), uVig); float l=dot(c.rgb,vec3(0.2126,0.7152,0.0722));
      c.rgb=mix(c.rgb, vec3(l)*vec3(1.05,0.92,0.9), uLow*0.75);
      c.rgb*=vec3(1.03,1.0,0.96); c.rgb*=1.0+(h(vUv*vec2(1387.0,911.0)+fract(uTime)*71.0)-0.5)*0.11;
      gl_FragColor=c; }`,
};

const SafeShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      bool bad = any(notEqual(c, c)) || any(isinf(c)) || any(greaterThan(abs(c.rgb), vec3(1e4)));
      gl_FragColor = bad ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(min(max(c.rgb, vec3(0.0)), vec3(40.0)), 1.0); }`,
};
const LEVELS = { high: { pr: 1.25, shadow: 2048, bloom: true, msaa: 4 }, medium: { pr: 1, shadow: 1024, bloom: true, msaa: 0 }, low: { pr: 0.8, shadow: 0, bloom: false, msaa: 0 } };
function applyQuality(name, keepShadows) {
  level = name; const L = { ...LEVELS[name] }, r = G.renderer, sun = G.world.sun;
  if (keepShadows) L.shadow = r.shadowMap.enabled ? sun.shadow.mapSize.x : 0;
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, L.pr));
  const was = r.shadowMap.enabled; r.shadowMap.enabled = L.shadow > 0; sun.castShadow = L.shadow > 0;
  if (L.shadow && sun.shadow.mapSize.x !== L.shadow) { sun.shadow.mapSize.set(L.shadow, L.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (was !== r.shadowMap.enabled) G.scene.traverse((o) => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => (m.needsUpdate = true)); } });
  if (composer) { composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); }
  const size = r.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: L.msaa });
  composer = new EffectComposer(r, rt);
  composer.addPass(new RenderPass(G.scene, G.camera));
  composer.addPass(new ShaderPass(SafeShader));
  if (L.bloom) { bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.42, 0.55, 1.0); composer.addPass(bloom); }
  grade = new ShaderPass(GradeShader); composer.addPass(grade); composer.addPass(new OutputPass());
  resize();
}
function resize() {
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight; if (!w || !h) return;
  G.renderer.setSize(w, h, false); if (composer) { composer.setPixelRatio(G.renderer.getPixelRatio()); composer.setSize(w, h); }
  G.camera.aspect = w / h; G.camera.updateProjectionMatrix();
}

// ------------------------------------------------------------------ state
function setState(s) {
  G.state = s;
  $('menu').hidden = s !== 'menu'; $('pause').hidden = s !== 'paused'; $('over').hidden = s !== 'over'; $('loading').hidden = s !== 'loading';
  G.hud.show(s === 'playing' || s === 'paused'); G.weapons.root.visible = s === 'playing' || s === 'paused';
  document.body.classList.toggle('playing', s === 'playing');
  if (s !== 'playing') { input.fire = input.ads = input.use = false; if (touch) touch.reset(); }
  $('touch').hidden = !(touch && touch.on && s === 'playing');
}
function tryLock() {
  if (free) return; lastLockTry = performance.now();
  try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(lockFailed); } catch (e) { lockFailed(); }
}
function lockFailed() {
  if (document.pointerLockElement === canvas || free) return;
  if (!lockedOnce) { free = true; G.hud.toast('Souris non capturée : visez en bougeant la souris, Échap pour la pause.'); if (G.state === 'paused') resume(); }
  else $('pause-hint').textContent = 'Le navigateur demande un instant : recliquez sur Reprendre.';
}
let lastTest = false;
function startGame(test) { if (typeof test === 'boolean') lastTest = test; if (touch && touch.on) phoneScreen(); SND.initAudio(); SND.menuMusic(false); SND.ambience(true); SND.rain(); SND.suspend(false); G.game.start({ test: lastTest }); setState('playing'); tryLock(); canvas.focus(); }
// phones: ask for full screen in landscape (Android allows it; elsewhere it is quietly skipped)
function phoneScreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      const r = document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      if (r && r.then) r.then(() => { try { const o = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (o && o.catch) o.catch(() => {}); } catch (e) { /* no lock */ } }).catch(() => {});
    }
  } catch (e) { /* fullscreen unavailable */ }
}
const portrait = () => window.innerHeight > window.innerWidth * 1.05;
function pause() { if (G.state !== 'playing' || G.game.over) return; setState('paused'); $('pause-hint').textContent = ''; SND.suspend(true); if (document.pointerLockElement) document.exitPointerLock(); }
function resume() { if (G.state !== 'paused') return; if (free) { SND.suspend(false); setState('playing'); canvas.focus(); } else tryLock(); }
function toMenu() { SND.flameLoop(false); SND.suspend(false); SND.menuMusic(true); G.zombies.clear(); G.game.started = false; if (document.pointerLockElement) document.exitPointerLock(); setState('menu'); }
function showOver() {
  const p = G.player; setState('over'); if (document.pointerLockElement) document.exitPointerLock();
  $('o-round').textContent = G.game.round; $('o-kills').textContent = p.kills; $('o-head').textContent = p.headshots; $('o-score').textContent = p.score;
  $('o-acc').textContent = p.shots ? Math.round((p.hits / p.shots) * 100) + ' %' : '—';
  let best = 0; try { best = +localStorage.getItem('dr-best') || 0; if (!G.game.test && G.game.round > best) localStorage.setItem('dr-best', G.game.round); } catch (e) { /* storage unavailable */ }
  $('o-best').textContent = Math.max(best, G.game.round);
  $('again').textContent = G.game.test ? 'Rejouer en mode test' : 'Rejouer'; $('normal-again').hidden = !G.game.test;
}

// ------------------------------------------------------------------ input
const KEYS = { KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', ShiftLeft: 'sprint', ShiftRight: 'sprint', Space: 'jump', KeyF: 'use', KeyE: 'use' };
function bindInput() {
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    const k = KEYS[e.code];
    if (G.state === 'playing') {
      if (k) { if (k === 'use' && !input.use) input.usePressed = true; input[k] = true; e.preventDefault(); }
      else if (e.code === 'KeyR') G.weapons.reload();
      else if (e.code === 'KeyV') G.weapons.melee();
      else if (e.code === 'KeyG') G.weapons.throwGrenade();
      else if (e.code === 'Digit1') G.weapons.switchWeapon(0);
      else if (e.code === 'Digit2') G.weapons.switchWeapon(1);
      else if (e.code === 'Digit3') G.weapons.switchWeapon(2);
      else if (e.code === 'KeyL') { flashlight.visible = !flashlight.visible; SND.tick(0.3, 1800); }
      else if (e.code === 'Escape' || e.code === 'KeyP') pause();
      if (e.code === 'Tab') e.preventDefault();
    } else if (G.state === 'paused' && (e.code === 'KeyP' || (e.code === 'Escape' && free))) resume();
    else if (G.state === 'over' && e.code === 'Enter') startGame();
  });
  window.addEventListener('keyup', (e) => { const k = KEYS[e.code]; if (k) input[k] = false; });
  window.addEventListener('blur', () => { for (const k in KEYS) input[KEYS[k]] = false; input.fire = input.ads = false; });
  canvas.addEventListener('mousedown', (e) => {
    if (G.state !== 'playing') return;
    if (!free && document.pointerLockElement !== canvas) { tryLock(); return; }
    if (e.button === 0) { input.fire = true; input.firePressed = true; } else if (e.button === 2) input.ads = true; e.preventDefault();
  });
  window.addEventListener('mouseup', (e) => { if (e.button === 0) input.fire = false; else if (e.button === 2) input.ads = false; });
  window.addEventListener('contextmenu', (e) => { if (G.state === 'playing') e.preventDefault(); });
  window.addEventListener('mousemove', (e) => {
    if (G.state !== 'playing') return;
    if (document.pointerLockElement === canvas || free) { input.dx += e.movementX || 0; input.dy += e.movementY || 0; }
    input.mx = e.clientX / window.innerWidth;
  });
  window.addEventListener('wheel', (e) => { if (G.state === 'playing') { G.weapons.switchWeapon(); e.preventDefault(); } }, { passive: false });
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) { lockedOnce = true; free = false; if (G.state === 'paused') { SND.suspend(false); setState('playing'); } }
    else if (G.state === 'playing' && !free && !G.game.over) pause();
  });
  document.addEventListener('pointerlockerror', lockFailed);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe($('app'));

  $('play').addEventListener('click', () => startGame(false));
  $('test-mode').addEventListener('click', () => startGame(true));
  $('resume').addEventListener('click', resume);
  $('restart').addEventListener('click', () => { SND.suspend(false); startGame(); });
  $('again').addEventListener('click', () => startGame());
  $('normal-again').addEventListener('click', () => startGame(false));
  for (const b of document.querySelectorAll('[data-menu]')) b.addEventListener('click', toMenu);
  for (const b of document.querySelectorAll('[data-fs]')) b.addEventListener('click', () => { try { if (document.fullscreenElement) document.exitFullscreen(); else { const r = document.documentElement.requestFullscreen(); if (r && r.catch) r.catch(() => {}); } } catch (e) { /* fullscreen unavailable */ } });
  // settings (menu and pause share the same values)
  try { const s = JSON.parse(localStorage.getItem('dr-settings') || 'null'); if (s) Object.assign(G.settings, s); } catch (e) { /* storage unavailable */ }
  const sync = () => { for (const i of document.querySelectorAll('[data-set]')) i.value = G.settings[i.dataset.set]; };
  for (const i of document.querySelectorAll('[data-set]')) i.addEventListener('input', () => {
    const k = i.dataset.set; G.settings[k] = k === 'quality' ? i.value : +i.value; sync();
    if (k === 'volume') SND.setVolume(G.settings.volume);
    if (k === 'quality') { autoSteps = 0; applyQuality(i.value === 'auto' ? (G.touch ? 'medium' : 'high') : i.value); }
    try { localStorage.setItem('dr-settings', JSON.stringify(G.settings)); } catch (e) { /* storage unavailable */ }
  });
  sync();
}

// ------------------------------------------------------------------ loop
let last = 0, fpsT = 0, fpsN = 0, autoSteps = 0, menuT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (G.debug && G.debug.freeze) return;
  const real = Math.min(0.25, (now - last) / 1000 || 0.016); last = now;
  const dt = Math.min(0.05, real);
  // a phone held upright shows « tournez le téléphone » and the game waits
  const upright = touch && touch.on && G.state === 'playing' && portrait();
  $('rotate').hidden = !upright;
  if (upright) { touch.reset(); fpsT = fpsN = 0; }
  else if (G.state === 'playing' || G.state === 'over') { simulate(dt); fpsT += real; fpsN++; }
  else if (G.state === 'menu') {
    menuT += dt; G.time += dt; G.world.update(dt); G.atmos.update(dt); G.fx.update(dt);
    const c = G.camera; c.position.set(1.6 + Math.sin(menuT * 0.11) * 0.9, 1.5 + Math.sin(menuT * 0.23) * 0.05, 3.9 + Math.cos(menuT * 0.09) * 0.5); c.rotation.set(-0.02 + Math.sin(menuT * 0.17) * 0.015, 0.95 + Math.sin(menuT * 0.07) * 0.22, 0);
    if (c.fov !== 62) { c.fov = 62; c.updateProjectionMatrix(); }
  }
  if (G.state === 'playing' && G.game.over && G.game.overT > 2.6) showOver();
  // automatic quality: step down when the frame rate stays low
  if (fpsT > 3) { const fps = fpsN / fpsT; fpsT = 0; fpsN = 0; if (G.settings.quality === 'auto' && fps < 36 && autoSteps < 2 && G.state === 'playing') { autoSteps++; applyQuality(level === 'high' ? 'medium' : 'low', true); G.hud.toast('Qualité graphique réduite pour garder un jeu fluide.'); } }
  render();
}
function simulate(dt) {
  if (G.game && G.game.slowmo > 0) { G.game.slowmo -= dt; dt *= 0.35; } // seconde chance: a breath of slow motion
  G.dt = dt; G.time += dt;
  if (free && !(touch && touch.on) && G.state === 'playing') { const e = input.mx; if (e < 0.06) input.dx -= 900 * dt; else if (e > 0.94) input.dx += 900 * dt; }
  const active = G.state === 'playing' && !G.game.over;
  if (active && touch) touch.update(dt);
  G.player.update(dt, active ? input : IDLE);
  G.camera.updateMatrixWorld(true);
  { // the torch dims as a wall comes close, so it never burns a white disc into the plaster
    G.camera.getWorldPosition(_fo); _fd.set(0, 0, -1).transformDirection(G.camera.matrixWorld);
    let t = rayWorld(_fo, _fd, 3).t;
    for (const z of G.zombies.list) { if (z.state === 'dead') continue; const dx = z.x - _fo.x, dz = z.z - _fo.z, d = Math.hypot(dx, dz); if (d < t && d > 0.01 && (dx * _fd.x + dz * _fd.z) / d > 0.7) t = Math.max(0.3, d - 0.25); } // a zombie in your face counts as a wall
    const k = Math.min(1, Math.max(0.2, (t - 0.25) / 2.2));
    flashlight.intensity += (20 * k - flashlight.intensity) * (1 - Math.exp(-10 * dt));
  }
  G.weapons.update(dt, active ? input : IDLE, active);
  G.game.update(dt, input);
  G.zombies.update(dt); G.world.update(dt); G.atmos.update(dt); G.fx.update(dt); G.hud.update(dt);
  SND.ambientTick(dt); SND.rainTick(dt); { let near = 0; for (const z of G.zombies.list) if (z.state === 'chase' && Math.hypot(z.x - G.player.x, z.z - G.player.z) < 14) near++; SND.tension(near / 8); }
  input.dx = input.dy = 0; input.usePressed = false; input.firePressed = false;
}
const _fo = new THREE.Vector3(), _fd = new THREE.Vector3();
const IDLE = { fwd: false, back: false, left: false, right: false, sprint: false, jump: false, fire: false, firePressed: false, ads: false, use: false, usePressed: false, dx: 0, dy: 0, ax: 0, ay: 0 };
function render() {
  if (G.lostDisplay) return;
  const p = G.player;
  G.fx.resize(G.renderer.domElement.height, G.camera.fov);
  G.world.sky.position.copy(G.camera.position);
  if (grade) { grade.uniforms.uTime.value = G.time; grade.uniforms.uLow.value = G.state === 'menu' ? 0 : Math.max(0, 1 - p.hp / p.maxHp); }
  composer.render();
}

// ------------------------------------------------------------------ boot
async function boot() {
  const bar = $('load-bar'), note = $('load-note');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false }); }
  catch (e) { note.textContent = "WebGL n'est pas disponible dans ce navigateur. Activez l'accélération matérielle puis rechargez la page."; return; }
  G.renderer = renderer; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  G.maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const scene = (G.scene = new THREE.Scene()); scene.fog = new THREE.FogExp2(0x1d2c40, 0.027); scene.background = new THREE.Color(0x1d2c40);
  const camera = (G.camera = new THREE.PerspectiveCamera(74, 16 / 9, 0.012, 420)); scene.add(camera);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.1; pm.dispose();
  await loadAssets((f) => { bar.style.transform = `scaleX(${f * 0.6})`; });
  // painted labels use the stencil face: give it a moment to arrive, then go on with the fallback
  try { if (document.fonts && document.fonts.load) await Promise.race([Promise.all([document.fonts.load("700 40px 'Stardos Stencil'"), document.fonts.load("600 40px 'Oswald'")]), new Promise((r) => setTimeout(r, 1800))]); } catch (e) { /* fallback fonts */ }
  const stepLoad = async (f, fn) => { fn(); bar.style.transform = `scaleX(${f})`; await new Promise((r) => setTimeout(r, 0)); };
  await stepLoad(0.72, buildTextures);
  await stepLoad(0.8, buildWorld);
  await stepLoad(0.84, buildAtmosphere);
  await stepLoad(0.85, () => {
    // capture the lit common room as the guns' reflection map (the PMREM helper renders from the origin, so the scene is shifted)
    const pm2 = new THREE.PMREMGenerator(renderer), at = new THREE.Vector3(-1.5, 1.5, 0.5);
    scene.position.sub(at); scene.updateMatrixWorld(true);
    G.roomEnv = pm2.fromScene(scene, 0.02, 0.05, 60).texture;
    scene.position.add(at); scene.updateMatrixWorld(true); pm2.dispose();
    setGunEnv(G.roomEnv);
  });
  await stepLoad(0.86, () => { initFx(); initPlayer(); initWeapons(); });
  await stepLoad(0.95, () => { initZombies(); G.zombies.prewarm(); initHud(); initGame(); });
  flashlight = new THREE.SpotLight(0xdfe8ff, 20, 34, 0.56, 0.8, 1.25); flashlight.position.set(0.02, -0.02, -0.13); flashlight.target.position.set(0, -0.02, -6); camera.add(flashlight, flashlight.target);
  G.flashlight = flashlight;
  applyQuality(G.settings.quality === 'auto' ? (touchDevice() ? 'medium' : 'high') : G.settings.quality);
  bindInput();
  // the browser only lets sound start after a click or a key: the first one on the menu starts the theme
  const wake = () => { if (G.state === 'menu') { SND.initAudio(); SND.menuMusic(true); } window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); };
  window.addEventListener('pointerdown', wake); window.addEventListener('keydown', wake);
  SND.setVolume(G.settings.volume);
  touch = initTouch({ input, pause, $ });
  const touchMode = (on) => { touch.enable(on); G.touch = on; if (on) free = true; };
  touchMode(touchDevice());
  // a touch screen laptop or a tablet with a keyboard: switch on the first real touch
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !touch.on) { touchMode(true); setState(G.state); } }, true);
  // warm up every shader variant (hidden zombies, burnt bodies, brute, effects) so nothing compiles mid-game
  note.textContent = 'Préparation des effets…';
  { const hidden = []; scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
    const undo = G.zombies.warm();
    try { if (renderer.compileAsync) await Promise.race([renderer.compileAsync(scene, camera), new Promise((r) => setTimeout(r, 15000))]); else renderer.compile(scene, camera); } catch (e) { renderer.compile(scene, camera); }
    // send every image to the graphics card now rather than the first time it comes into view
    const texs = new Set(), grab = (m) => { if (!m) return; for (const k in m) { const v = m[k]; if (v && v.isTexture) texs.add(v); } };
    scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(grab); }); G.zombies.materials().forEach(grab);
    for (const t of texs) { try { renderer.initTexture(t); } catch (e) { /* a texture that cannot be uploaded yet will go up on first use */ } }
    composer.render(); undo(); for (const o of hidden) o.visible = false; }
  note.textContent = 'Chargement de la bâtisse…';
  await stepLoad(1, () => {});
  setState('menu');
  requestAnimationFrame(frame);
  const dbgCam = new THREE.PerspectiveCamera(40, 16 / 9, 0.0008, 300), dbgLight = new THREE.PointLight(0xffffff, 0.02, 2, 2); dbgCam.add(dbgLight); scene.add(dbgCam);
  // debug: look at the view-model from outside (eye / target given in view-model units, relative to the player's camera)
  const dbgView = (eye, tgt, fov = 40) => { const c = G.camera; c.updateMatrixWorld(true); const e = new THREE.Vector3(...eye).multiplyScalar(0.12).applyMatrix4(c.matrixWorld), t = new THREE.Vector3(...tgt).multiplyScalar(0.12).applyMatrix4(c.matrixWorld); dbgCam.fov = fov; dbgCam.aspect = c.aspect; dbgCam.updateProjectionMatrix(); dbgCam.position.copy(e); dbgCam.up.set(0, 1, 0); dbgCam.lookAt(t); G.renderer.setRenderTarget(null); G.renderer.render(scene, dbgCam); };
  // probe: render one frame and return its average brightness (0-255) and how many sampled pixels are pure black
  const pc = document.createElement('canvas'); pc.width = 16; pc.height = 9; const pctx = pc.getContext('2d', { willReadFrequently: true });
  const probe = () => { render(); pctx.drawImage(canvas, 0, 0, 16, 9); const d = pctx.getImageData(0, 0, 16, 9).data; let s = 0, black = 0; for (let i = 0; i < d.length; i += 4) { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; s += l; if (l < 1) black++; } return { mean: s / (d.length / 4), black }; };
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); G.contextLost = (G.contextLost || 0) + 1; G.lostDisplay = true; $('lost').hidden = false; });
  canvas.addEventListener('webglcontextrestored', () => { G.lostDisplay = false; $('lost').hidden = true; applyQuality(level === 'high' ? 'medium' : level); });
  G.debug = { probe, view: dbgView, freeze: false, gun: buildGunModel, WEAPONS, THREE, startGame, input, simulate, setFree: (v) => { free = v; }, applyQuality, level: () => level, touch: () => touch };
  window.__DR = G; window.__SND = Object.assign({}, SND, { state: () => 'n/a' });
}
boot().catch((e) => { console.error(e); $('load-note').textContent = 'Erreur au chargement : ' + (e && e.message ? e.message : e); });
