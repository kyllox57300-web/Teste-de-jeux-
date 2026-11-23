// Brumeterre — démarrage, boucle de jeu, contrôles, déroulé des combats
(function (B) {
  'use strict';
  const U = B.UI;
  const Gm = B.Game = { mode: 'menu', run: null, c: null, paused: false };
  const STEP = 1 / 60;

  B.vibrate = function (ms) { if (B.P && B.P.settings.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };

  // ───── Démarrage ─────
  Gm.init = function () {
    const P = B.Meta.load();
    B.settings = P.settings;
    B.lang = P.settings.lang || 'fr';
    Gm.applySettings();
    Gm.cv = document.getElementById('game');
    Gm.R = new B.Render(Gm.cv);
    Gm.bg = new B.Backdrop(document.getElementById('bg'));
    Gm.setupInput();
    Gm.setupLifecycle();
    addEventListener('resize', () => { Gm.R.resize(); Gm.bg.resize(); });
    // premier geste : audio
    const unlock = () => { B.Audio.init(); B.Audio.setVol(P.settings.sound, P.settings.music); };
    addEventListener('pointerdown', unlock, { capture: true });
    addEventListener('keydown', unlock, { capture: true });
    requestAnimationFrame(Gm.frame);
    B.SCR.loading();
    // temps de jeu
    setInterval(() => { if (!document.hidden && B.P) { B.P.play += 5; } }, 5000);
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
  };
  Gm.applySettings = function () {
    const S = B.P.settings;
    B.Audio.setVol(S.sound, S.music);
    if (Gm.R) { Gm.R.showNums = S.nums; Gm.R.setQuality(S.quality === 'auto' ? (Gm.autoQ !== undefined ? Gm.autoQ : 2) : ['low', 'mid', 'high'].indexOf(S.quality)); }
    B.lang = S.lang || 'fr';
  };

  // ───── Cycle de vie (pause auto, sauvegarde) ─────
  Gm.setupLifecycle = function () {
    const away = () => {
      if (Gm.mode === 'combat' && Gm.c && !Gm.c.over && !Gm.paused) Gm.pause();
      B.Audio.suspend();
      Gm.saveRun(); B.Meta.save(true);
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) away(); else { B.Audio.resume(); Gm.last = performance.now(); } });
    addEventListener('pagehide', away);
    addEventListener('blur', () => { if (Gm.mode === 'combat' && Gm.c && !Gm.c.over && !Gm.paused) Gm.pause(); });
    addEventListener('beforeunload', () => { Gm.saveRun(); B.Meta.save(true); });
    setInterval(() => { Gm.saveRun(); B.Meta.save(true); }, 10000);
  };
  Gm.saveRun = function () { if (Gm.run && B.P) { B.P.run = Gm.run.sync(); } };

  // ───── Boucle ─────
  Gm.last = 0; Gm.acc = 0; Gm.lastDraw = 0; Gm.ft = []; Gm.qTimer = 0;
  Gm.frame = function (now) {
    requestAnimationFrame(Gm.frame);
    if (document.hidden) return;
    let dt = (now - (Gm.last || now)) / 1000; Gm.last = now;
    if (dt > 0.25) dt = 0.25;
    if (Gm.mode === 'combat' && Gm.c) {
      const c = Gm.c;
      if (!Gm.paused && !c.paused && !c.over) {
        Gm.acc += dt * (Gm.slowmo ? 0.35 : 1);
        let n = 0;
        while (Gm.acc >= STEP && n < 5) { c.step(STEP); Gm.acc -= STEP; n++; if (c.paused || c.over) { Gm.acc = 0; break; } }
        if (n >= 5) Gm.acc = 0;
        Gm.hint(dt);
      }
      if (now - Gm.lastDraw >= 15.5) {
        const fdt = (now - Gm.lastDraw) / 1000; Gm.lastDraw = now;
        if (!Gm.paused) Gm.R.update(Math.min(0.05, fdt));
        Gm.R.draw();
        Gm.hud(fdt);
        Gm.autoQuality(fdt);
      }
    } else if (Gm.bg && Gm.bg.on) {
      if (now - Gm.lastDraw >= (Gm.bg.fps === 60 ? 15.5 : 32)) { const fdt = (now - Gm.lastDraw) / 1000; Gm.lastDraw = now; Gm.bg.draw(Math.min(0.1, fdt)); }
    }
  };
  Gm.autoQuality = function (dt) {
    if (B.P.settings.quality !== 'auto') return;
    Gm.ft.push(dt); if (Gm.ft.length < 90) return;
    const avg = Gm.ft.reduce((a, b) => a + b, 0) / Gm.ft.length; Gm.ft.length = 0;
    const q = Gm.R.q;
    if (avg > 0.024 && q > 0) { Gm.autoQ = q - 1; Gm.R.setQuality(q - 1); Gm.qTimer = 0; }
    else if (avg < 0.0175 && q < 2) { Gm.qTimer++; if (Gm.qTimer > 8) { Gm.autoQ = q + 1; Gm.R.setQuality(q + 1); Gm.qTimer = 0; } }
  };

  // ───── Contrôles ─────
  Gm.joy = { active: false, id: null, bx: 0, by: 0, kx: 0, ky: 0, R: 56 };
  Gm.keys = {};
  Gm.setupInput = function () {
    const app = document.getElementById('app');
    const J = Gm.joy;
    const fixedBase = () => { const S = B.P.settings; const w = innerWidth, h = innerHeight; return [S.hand === 'l' ? w - 110 : 110, h - 150]; };
    app.addEventListener('pointerdown', (e) => {
      if (Gm.mode !== 'combat' || Gm.paused || !Gm.c || Gm.c.paused) return;
      if (e.target.closest('button, .modal')) return;
      if (J.active) return;
      J.active = true; J.id = e.pointerId;
      if (B.P.settings.joy === 'fixed') { const b = fixedBase(); J.bx = b[0]; J.by = b[1]; }
      else { J.bx = e.clientX; J.by = e.clientY; }
      J.kx = e.clientX; J.ky = e.clientY;
      Gm.updJoy(e.clientX, e.clientY);
      try { app.setPointerCapture(e.pointerId); } catch (err) { }
    });
    app.addEventListener('pointermove', (e) => { if (J.active && e.pointerId === J.id) Gm.updJoy(e.clientX, e.clientY); });
    const up = (e) => { if (J.active && e.pointerId === J.id) { J.active = false; J.id = null; if (Gm.c) { Gm.c.mx = 0; Gm.c.my = 0; } if (B.P.settings.joy !== 'fixed') { J.kx = J.bx; J.ky = J.by; } else { const b = fixedBase(); J.kx = J.bx = b[0]; J.ky = J.by = b[1]; } Gm.keyMove(); } };
    app.addEventListener('pointerup', up); app.addEventListener('pointercancel', up);
    addEventListener('keydown', (e) => {
      Gm.keys[e.key.toLowerCase()] = true; Gm.keyMove();
      if (Gm.mode === 'combat' && (e.key === ' ') && Gm.c) Gm.c.wantSpecial = true;
      if (e.key === 'Escape' && Gm.mode === 'combat' && Gm.c && !Gm.c.paused) { Gm.paused ? Gm.resume() : Gm.pause(); }
    });
    addEventListener('keyup', (e) => { Gm.keys[e.key.toLowerCase()] = false; Gm.keyMove(); });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  Gm.updJoy = function (x, y) {
    const J = Gm.joy; let dx = x - J.bx, dy = y - J.by;
    const d = Math.hypot(dx, dy);
    if (d > J.R) { if (B.P.settings.joy !== 'fixed') { J.bx += dx / d * (d - J.R); J.by += dy / d * (d - J.R); } dx = x - J.bx; dy = y - J.by; }
    const dd = Math.min(J.R, Math.hypot(dx, dy));
    const a = Math.atan2(dy, dx);
    J.kx = J.bx + Math.cos(a) * dd; J.ky = J.by + Math.sin(a) * dd;
    let m = dd / J.R; m = m < 0.12 ? 0 : Math.min(1, (m - 0.12) / 0.6);
    if (Gm.c) { Gm.c.mx = Math.cos(a) * m; Gm.c.my = Math.sin(a) * m; }
    Gm.moved = (Gm.moved || 0) + 1;
  };
  Gm.keyMove = function () {
    if (!Gm.c || Gm.joy.active) return;
    const k = Gm.keys;
    let x = (k.d || k.arrowright ? 1 : 0) - (k.q || k.a || k.arrowleft ? 1 : 0), y = (k.s || k.arrowdown ? 1 : 0) - (k.z || k.w || k.arrowup ? 1 : 0);
    const m = Math.hypot(x, y) || 1; Gm.c.mx = x / m; Gm.c.my = y / m;
  };

  // ───── Expédition ─────
  Gm.startRun = function (opts) {
    Gm.run = B.Run.create(opts);
    B.P.run = Gm.run.sync(); B.Meta.save(true);
    if (Gm.run.d.mode === 'endless') { Gm.startCombat(); return; }
    Gm.processQueue(() => B.SCR.map());
  };
  Gm.continueRun = function () {
    if (!B.P.run) return;
    Gm.run = new B.Run(B.P.run);
    const d = Gm.run.d;
    if (d.mode === 'endless') { Gm.startCombat(); return; }
    if (d.state === 'combat' && d.pos.r >= 0) { U.toast('Le combat reprend depuis le début.'); Gm.startCombat(d.combatKind); return; }
    if (d.state === 'node' && d.pos.r >= 0) { Gm.enterNode(Gm.run.node(), true); return; }
    Gm.processQueue(() => B.SCR.map());
  };
  Gm.enterNode = function (n, resume) {
    const d = Gm.run.d;
    switch (n.t) {
      case 'fight': case 'elite': case 'survivor': case 'guard': case 'boss': Gm.startCombat(); break;
      case 'event': d.state = 'node'; Gm.saveRun(); B.SCR.event(); break;
      case 'shop': d.state = 'node'; Gm.saveRun(); B.SCR.shop(); break;
      case 'camp': d.state = 'node'; Gm.saveRun(); B.SCR.camp(); break;
      case 'treasure': d.state = 'node'; Gm.saveRun(); B.SCR.treasure(resume); break;
    }
  };
  Gm.nodeDone = function () {
    const d = Gm.run.d; d.state = 'map';
    const n = Gm.run.node(); if (n) n.done = 1;
    Gm.saveRun(); B.Meta.save();
    Gm.processQueue(() => B.SCR.map());
  };
  // file d'attente : cartes de pouvoir et combats déclenchés par les événements
  Gm.processQueue = function (done) {
    const d = Gm.run.d;
    const q = d.queue.shift();
    Gm.saveRun();
    if (!q) { done(); return; }
    if (q.k === 'offer') { Gm.offerModal(q.o, () => Gm.processQueue(done)); return; }
    if (q.k === 'fight') { Gm.afterFight = () => Gm.processQueue(done); Gm.startCombat(q.kind); return; }
    Gm.processQueue(done);
  };

  // ───── Combat ─────
  Gm.startCombat = function (kind) {
    const run = Gm.run, d = run.d;
    d.state = 'combat'; d.combatKind = kind || null;
    Gm.saveRun(); B.Meta.save(true);
    const o = run.combatOpts(kind);
    o.F = Gm.R;
    o.onLevel = (c) => Gm.levelUp(c);
    o.onChest = (c, v) => Gm.chest(c, v);
    o.onEnd = (c) => setTimeout(() => Gm.combatEnd(c), c.over === 'win' ? 300 : 900);
    const c = Gm.c = new B.Combat(o);
    Gm.R.setCombat(c); Gm.R.heroDef = null; Gm.R.lanternCol = B.P.lanternCol || null; Gm.R.lanternGlow = B.P.lanternGlow || '#ff9a40';
    Gm.mode = 'combat'; Gm.paused = false; Gm.acc = 0;
    Gm.cv.classList.add('on'); Gm.bg.stop();
    U.show('combat', '', null); U.closeAll();
    Gm.buildHud();
    Gm.R.resize();
    const tr = o.kind === 'boss' || o.kind === 'guard' ? 'boss' : o.kind === 'endless' ? 'endless' : B.Audio.biomeTrack(d.biome);
    B.Audio.music(tr);
    Gm.hintState = { t: 0, shown: {} };
    if (o.kind === 'survivor') Gm.showHint('Restez dans le cercle doré pour libérer ' + (o.survivorName || 'le survivant') + ' !', 4);
    else if (o.kind === 'elite') Gm.showHint('Une élite rôde : battez-la pour un coffre !', 3);
    else if (o.kind === 'guard' && d.mode === 'tutorial') Gm.showHint('Un gardien ! Évitez les zones rouges au sol.', 4);
  };
  Gm.combatEnd = function (c) {
    if (Gm.c !== c) return;
    const run = Gm.run, d = run.d;
    Gm.joy.active = false;
    if (d.mode === 'endless') { Gm.endRun(false, { time: c.t }); return; }
    const res = run.afterCombat(c);
    if (res.lost) { Gm.endRun(false); return; }
    if (res.rescued) { const s = B.SURVIVORS.find(x => x.id === res.rescued); U.toast(s.i + ' <b>' + s.n + '</b> est sauvé ! Il part vers le village.', 4000); }
    if (c.kind === 'boss') { Gm.endRun(true); return; }
    if (Gm.afterFight) { const f = Gm.afterFight; Gm.afterFight = null; Gm.leaveCombat(); d.state = 'node'; f(); return; }
    Gm.leaveCombat();
    if (c.kind === 'guard' && d.mode === 'tutorial') { Gm.endRun(true); return; }
    // résumé rapide puis carte
    B.SCR.combatWin(c, res, () => Gm.nodeDone());
  };
  Gm.leaveCombat = function () {
    Gm.mode = 'menu'; Gm.cv.classList.remove('on'); document.getElementById('hud').classList.add('hidden');
    Gm.c = null; Gm.bg.start('map');
  };
  Gm.endRun = function (won, extra) {
    const run = Gm.run;
    Gm.leaveCombat();
    if (won && run.d.mode === 'tutorial') { B.P.tuto = 1; }
    const sum = run.finish(won, extra);
    Gm.run = null;
    B.Audio.sfx(won ? 'victory' : 'defeat');
    B.SCR.endRun(sum);
  };
  Gm.pause = function () {
    if (!Gm.c || Gm.paused) return;
    Gm.paused = true; Gm.joy.active = false; Gm.c.mx = Gm.c.my = 0;
    B.SCR.pause();
  };
  Gm.resume = function () { Gm.paused = false; Gm.last = performance.now(); U.closeAll(); };

  // Montée de niveau
  Gm.levelUp = function (c) {
    B.Audio.sfx('levelup'); B.vibrate(25);
    Gm.R.flash('#ffe9a0', 0.3);
    Gm.joy.active = false; c.mx = c.my = 0;
    if (Gm.run.d.mods.autoPick) {
      const off = Gm.run.makeOffer({}); const card = off.cards[Math.floor(Math.random() * off.cards.length)];
      Gm.run.applyCard(card); c.recompute(); U.toast('🎲 ' + (B.POWERS[card.id] ? B.POWERS[card.id].n : 'Bonus')); c.resume(); return;
    }
    Gm.offerModal({}, () => { c.recompute(); Gm.last = performance.now(); c.resume(); }, 'Niveau ' + c.RH.lvl + ' !');
  };
  Gm.chest = function (c, v) {
    const run = Gm.run;
    const g = Math.round((8 + run.d.biome * 6) * v); run.d.gold += g;
    if (Math.random() < 0.35 * v) run.addItem(run.rollItem(v > 1 ? 1 : 0));
    Gm.R.flash('#ffcf6a', 0.4); B.vibrate(40);
    const evo = run.evoReady().length > 0;
    if (evo) B.Audio.sfx('legendary');
    Gm.offerModal({ chest: true, minRar: v > 1 ? 1 : 0 }, () => { c.recompute(); Gm.last = performance.now(); c.paused = false; }, 'Coffre ! +' + g + ' 🪙');
  };
  // Fenêtre de choix de pouvoir
  Gm.offerModal = function (o, done, title) {
    const run = Gm.run;
    let off = run.makeOffer(o);
    let banMode = false, picked = false;
    const leg = off.cards.some(c => c.rar >= 3 || c.evo);
    if (leg) { B.Audio.sfx('legendary'); Gm.R.flash('#ffb43c', 0.35); B.vibrate([30, 40, 60]); }
    const html = () => '<div class="center"><h2 style="font-size:26px">' + (title || 'Nouveau pouvoir') + '</h2><div class="mut small">' + (banMode ? 'Touchez une carte pour la bannir de l\'expédition' : 'Choisissez un pouvoir') + '</div></div>' +
      '<div class="col" style="gap:9px">' + off.cards.map((c, i) => U.powerCard(c, run, i)).join('') + '</div>' +
      '<div class="grid2"><button class="btn sm' + (run.d.rerolls > 0 ? '' : ' off') + '" data-a="reroll">🎲 Relancer (' + run.d.rerolls + ')</button><button class="btn sm' + (run.d.banishes > 0 ? '' : ' off') + (banMode ? ' main' : '') + '" data-a="ban">🚫 Bannir (' + run.d.banishes + ')</button></div>' +
      '<div class="center"><button class="btn sm ghost" data-a="mine">Voir mes pouvoirs</button></div>';
    const m = U.modal(html(), {
      pick: (t) => {
        if (picked) return;
        const card = off.cards[+t.dataset.i];
        if (banMode) { if (card.evo || card.id[0] === '_') return; run.d.banished.push(card.id); run.d.banishes--; banMode = false; off = run.makeOffer(o); m.querySelector('.box').innerHTML = html(); return; }
        picked = true;
        run.applyCard(card);
        B.Audio.sfx(card.evo ? 'legendary' : 'pick');
        if (card.evo) U.toast('★ ' + B.POWERS[card.id].n + ' !', 3000);
        U.close(m); Gm.saveRun(); done();
      },
      reroll: () => { if (run.d.rerolls <= 0) return; run.d.rerolls--; off = run.makeOffer(o); m.querySelector('.box').innerHTML = html(); },
      ban: () => { if (run.d.banishes <= 0) return; banMode = !banMode; m.querySelector('.box').innerHTML = html(); },
      mine: () => B.SCR.myPowers()
    });
  };

  // ───── HUD ─────
  Gm.buildHud = function () {
    const h = document.getElementById('hud');
    const S = B.P.settings, c = Gm.c;
    const H = B.HEROES.find(x => x.id === c.RH.hero);
    const spIcon = { flare: '☀️', rain: '🏹', quake: '💥', cauldron: '☣️', shadowstep: '🌑', sanctuary: '✨', army: '👻', storm: '⛈️' }[H.sp.id];
    h.innerHTML = '<div class="vign"></div><div class="lowhp hidden"></div>' +
      '<div class="hud-top"><div class="hud-bars"><div class="hpbar"><i></i><b></b></div><div class="xpbar"><i></i></div><div class="hud-info"><span class="lvl">Niv. 1</span><span class="h-goal"></span><span>💀 <b class="h-k">0</b></span><span>🪙 <b class="h-g">0</b></span></div><div class="hud-pw"></div></div>' +
      '<button class="hbtn" data-a="pause" aria-label="Pause">⏸</button></div>' +
      '<div class="goal hidden"></div>' +
      '<div class="bossbar hidden"><div class="n"></div><div class="bar"><i></i></div></div>' +
      '<div class="hint hidden"></div>' +
      '<button class="spbtn ' + (S.hand === 'l' ? 'l' : 'r') + '" data-a="sp" aria-label="Capacité spéciale"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="7"/><circle class="spring" cx="50" cy="50" r="46" fill="none" stroke="#ffd27a" stroke-width="7" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="289"/></svg><span>' + spIcon + '</span></button>';
    h.classList.remove('hidden');
    Gm.H = { hp: h.querySelector('.hpbar i'), hpt: h.querySelector('.hpbar b'), xp: h.querySelector('.xpbar i'), lvl: h.querySelector('.lvl'), goal: h.querySelector('.h-goal'), k: h.querySelector('.h-k'), g: h.querySelector('.h-g'), pw: h.querySelector('.hud-pw'), bb: h.querySelector('.bossbar'), bbn: h.querySelector('.bossbar .n'), bbi: h.querySelector('.bossbar i'), sp: h.querySelector('.spbtn'), spr: h.querySelector('.spring'), low: h.querySelector('.lowhp'), hint: h.querySelector('.hint'), t: 0, pwKey: '' };
    if (!h.dataset.bound) {
      h.dataset.bound = 1;
      h.addEventListener('pointerdown', (e) => {
        const t = e.target.closest('[data-a]'); if (!t) return;
        e.stopPropagation(); e.preventDefault();
        if (t.dataset.a === 'pause') { B.Audio.sfx('click'); Gm.pause(); }
        if (t.dataset.a === 'sp' && Gm.c && !Gm.paused) { if (Gm.c.P.sp >= 1) Gm.c.wantSpecial = true; else B.Audio.sfx('error'); }
      });
    }
  };
  Gm.hud = function (dt) {
    const c = Gm.c, H = Gm.H; if (!c || !H) return;
    H.t += dt; if (H.t < 0.06) return; H.t = 0;
    const P = c.P, S = c.S;
    H.hp.style.transform = 'scaleX(' + B.clamp(P.hp / S.hp, 0, 1) + ')';
    H.hpt.textContent = Math.ceil(Math.max(0, P.hp)) + ' / ' + S.hp;
    H.xp.style.transform = 'scaleX(' + B.clamp(c.RH.xp / B.xpNeed(c.RH.lvl), 0, 1) + ')';
    H.lvl.textContent = 'Niv. ' + c.RH.lvl;
    H.k.textContent = c.kills; H.g.textContent = Gm.run.d.gold + c.loot.gold;
    let goal = '';
    if (c.kind === 'fight' || c.kind === 'tutorial' || c.kind === 'ambush') goal = '⏳ ' + B.fmtTime(Math.max(0, c.duration - c.t));
    else if (c.kind === 'survivor') goal = c.survivor.done ? '⏳ ' + B.fmtTime(Math.max(0, c.duration - c.t)) : '🙋 ' + Math.round(c.survivor.prog * 100) + ' %';
    else if (c.kind === 'elite') goal = '💀 Élites : ' + (c.elitesAlive || 0);
    else if (c.kind === 'endless') goal = '♾️ ' + B.fmtTime(c.t);
    else if (c.kind === 'mimic') goal = '🧰 Mimique';
    H.goal.textContent = goal;
    const boss = c.boss;
    if (boss && !boss.dead) { H.bb.classList.remove('hidden'); H.bbn.textContent = B.tx(boss.d, 'n'); H.bbi.style.width = (boss.hp / boss.max * 100) + '%'; } else H.bb.classList.add('hidden');
    H.spr.style.strokeDashoffset = 289 * (1 - P.sp);
    H.sp.classList.toggle('ready', P.sp >= 1);
    H.low.classList.toggle('hidden', P.hp / S.hp > 0.28);
    const key = c.RH.ws.map(w => w.id + w.lvl).join() + '|' + c.RH.ps.map(p => p.id + p.lvl).join();
    if (key !== H.pwKey) {
      H.pwKey = key;
      H.pw.innerHTML = c.RH.ws.concat(c.RH.ps).map(x => { const d = B.POWERS[x.id]; return '<span class="' + (d.kind === 'e' ? 'evo' : '') + '">' + d.i + (d.kind !== 'e' ? '<em>' + x.lvl + '</em>' : '') + '</span>'; }).join('');
    }
  };
  // Astuces du tutoriel
  Gm.showHint = function (txt, t) {
    const H = Gm.H; if (!H) return;
    H.hint.innerHTML = txt; H.hint.classList.remove('hidden'); H.hint.style.animation = 'none'; void H.hint.offsetWidth; H.hint.style.animation = '';
    clearTimeout(Gm.hintT); Gm.hintT = setTimeout(() => H.hint.classList.add('hidden'), (t || 3) * 1000);
  };
  Gm.hint = function (dt) {
    const run = Gm.run; if (!run || run.d.mode !== 'tutorial' || !Gm.c) return;
    const hs = Gm.hintState; hs.t += dt;
    const c = Gm.c;
    const once = (k, cond, txt, t) => { if (!hs.shown[k] && cond) { hs.shown[k] = 1; Gm.showHint(txt, t); } };
    once('move', hs.t > 0.5, '👆 Glissez le pouce n\'importe où pour vous déplacer', 4.5);
    once('auto', hs.t > 6, '⚔️ Votre héros attaque tout seul : esquivez !', 4);
    once('xp', hs.t > 11 && c.picks.some(p => p.type === 'xp'), '💎 Ramassez les gemmes pour gagner des niveaux', 4);
    once('sp', c.P.sp >= 1, '✨ Votre capacité spéciale est prête : touchez le gros bouton !', 5);
    once('fog', hs.t > 22, '👁️ Les yeux dans la brume… ce sont des monstres', 4);
  };

  document.addEventListener('DOMContentLoaded', Gm.init);
})(this.B || (this.B = {}));
