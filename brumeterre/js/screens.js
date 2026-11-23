// Brumeterre — écrans principaux (parcours de jeu)
(function (B) {
  'use strict';
  const U = B.UI, S = B.SCR = {};
  const Gm = () => B.Game;
  const Me = () => B.Meta;
  const esc = (s) => U.esc(s);

  // ───── Chargement ─────
  S.loading = function () {
    Gm().bg.start('title');
    const tip = B.pick(B.TIPS);
    const el = U.show('loading', '<div class="pad grow col" style="justify-content:center;align-items:center;gap:26px"><div class="logo">Brumeterre</div><div style="width:70%;max-width:280px">' + U.bar(0) + '</div><div class="mut small center" style="max-width:300px">💡 ' + tip + '</div></div>');
    const bar = el.querySelector('.bar i');
    // préparation des sprites
    const jobs = [];
    B.HEROES.forEach(h => { for (let f = 0; f < 4; f++) jobs.push(() => B.G.hero(h, f)); });
    Object.values(B.MONSTERS).forEach(m => { for (let f = 0; f < 4; f++) jobs.push(() => B.G.mon(m, f)); });
    for (let b = 0; b < 5; b++) jobs.push(() => B.G.ground(b));
    jobs.push(() => B.G.cloud(3), () => B.G.cloud(9), () => B.G.hole());
    let i = 0;
    const step = () => {
      const t0 = performance.now();
      while (i < jobs.length && performance.now() - t0 < 12) { try { jobs[i](); } catch (e) { console.warn(e); } i++; }
      bar.style.width = Math.round(i / jobs.length * 100) + '%';
      if (i < jobs.length) setTimeout(step, 0); else setTimeout(S.title, 350);
    };
    setTimeout(step, 50);
  };

  // ───── Titre ─────
  S.title = function () {
    const P = B.P;
    Gm().bg.start('title');
    B.Audio.music('title');
    const hasRun = !!P.run, started = P.tuto > 0 || P.st.runs > 0;
    U.show('title', '<div class="pad grow col" style="justify-content:space-between">' +
      '<div style="margin-top:12vh"><div class="logo">Brumeterre</div><div class="sub-logo">Porteurs de Lanterne</div></div>' +
      '<div class="col" style="gap:12px;width:100%;max-width:340px;margin:0 auto 6vh">' +
      (hasRun ? '<button class="btn main big pulse" data-a="cont">▶ Continuer l\'expédition</button>' : '') +
      '<button class="btn ' + (hasRun ? '' : 'main big pulse') + '" data-a="play">' + (started ? '🏮 Jouer' : '🏮 Nouvelle partie') + '</button>' +
      '<div class="grid2"><button class="btn" data-a="settings">⚙️ Paramètres</button><button class="btn" data-a="credits">📜 Crédits</button></div>' +
      '<div class="center dim tiny">v' + B.VERSION + ' · sans publicité, sans achat</div></div></div>', {
      play: () => { if (P.tuto === 0) S.intro(); else S.village(); },
      cont: () => Gm().continueRun(),
      settings: () => S.settings(),
      credits: () => S.credits()
    });
  };
  S.intro = function () {
    const pages = [
      ['🌫️', 'Une brume maléfique a englouti le monde.', 'Ceux qu\'elle touche oublient leur nom, puis deviennent des monstres.'],
      ['🏮', 'Vous êtes un Porteur de Lanterne.', 'Votre flamme est la seule chose qui repousse la brume.'],
      ['🏘️', 'Au dernier village, il reste un espoir.', 'Partez en expédition, combattez, sauvez des survivants… et reconstruisez.']
    ];
    let i = 0;
    const m = U.modal('', {}, {});
    const draw = () => {
      const p = pages[i];
      m.querySelector('.box').innerHTML = '<div class="panel col center" style="gap:14px;padding:26px 20px"><div style="font-size:56px">' + p[0] + '</div><h2>' + p[1] + '</h2><p class="mut" style="font-size:16px;line-height:1.5">' + p[2] + '</p><button class="btn main big" data-a="next">' + (i < pages.length - 1 ? 'Suite' : '🔥 Partir dans la brume') + '</button></div>';
    };
    U.bind(m, { next: () => { i++; if (i >= pages.length) { U.close(m); Gm().startRun({ mode: 'tutorial', hero: 'aldric', biome: 0 }); } else { B.Audio.sfx('page'); draw(); } } });
    draw();
  };

  // ───── Village ─────
  S.village = function () {
    const P = B.P;
    if (P.run) { Gm().continueRun(); return; }
    const bg = Gm().bg; bg.start('village'); bg.resize();
    B.Audio.music('village');
    const challengeAvail = P.bld.observatory > 0 && !(P.daily.key === B.dayKey() && P.daily.done);
    const el = U.show('village', '<div class="vtop">' + U.resBar() + '<span style="flex-basis:100%;height:0"></span><button class="btn sm ghost" data-a="ach" style="min-height:34px">🏆 ' + Object.keys(P.ach).length + '/' + B.ACHIEVEMENTS.length + '</button><button class="btn sm ghost" data-a="settings" style="min-height:34px">⚙️</button><button class="btn sm ghost" data-a="title" style="min-height:34px">🏠</button></div>' +
      '<div class="vtouch" style="position:absolute;inset:0;top:90px;bottom:90px"></div>' +
      '<div class="vbot"><button data-a="heroes"><span>🧙</span>Héros</button><button data-a="inv"><span>🎒</span>Inventaire' + (S.newItems() ? '<i class="badge">' + S.newItems() + '</i>' : '') + '</button><button class="go" data-a="go"><span>🏮</span>Expédition</button><button data-a="chal"><span>🔭</span>Défis' + (challengeAvail ? '<i class="badge">!</i>' : '') + '</button><button data-a="ency"><span>📖</span>Encyclo.</button></div>', {
      heroes: () => S.heroes(), inv: () => S.inventory(), go: () => S.prep(), chal: () => S.challenges(), ency: () => S.ency(), ach: () => S.achievements(), settings: () => S.settings(), title: () => S.title()
    });
    // toucher / glisser dans le village
    const tz = el.querySelector('.vtouch');
    let sy = 0, sc = 0, moved = false;
    tz.addEventListener('pointerdown', (e) => { sy = e.clientY; sc = bg.camY; moved = false; tz.setPointerCapture(e.pointerId); });
    tz.addEventListener('pointermove', (e) => { if (e.buttons === 0 && e.pointerType === 'mouse') return; const d = e.clientY - sy; if (Math.abs(d) > 6) moved = true; if (moved) bg.camY = B.clamp(sc - d, 0, Math.max(0, bg.vh - bg.ch + 160)); });
    tz.addEventListener('pointerup', (e) => {
      if (moved) return;
      const h = bg.hit(e.clientX, e.clientY);
      if (!h) return;
      B.Audio.sfx('click');
      if (h.k === 'bld') S.building(h.id); else S.house(h.id);
    });
    // nouvelles (survivants arrivés)
    setTimeout(() => S.news(), 400);
    if (P.tuto === 1) setTimeout(() => S.villageTuto(), 600);
  };
  S.newItems = () => B.P.items.filter(i => i.isNew).length;
  S.news = function () {
    const P = B.P; const n = P.news.shift(); if (!n) return;
    Me().save();
    if (n.k === 'surv') {
      const s = B.SURVIVORS.find(x => x.id === n.id);
      const bld = s.bld ? B.BUILDINGS.find(b => b.id === s.bld) : null;
      const m = U.modal('<div class="panel col center" style="gap:10px"><div style="font-size:54px">' + s.i + '</div><h2>' + s.n + ' arrive au village !</h2><div class="mut">' + s.r + '</div><p style="line-height:1.45;font-style:italic">« ' + s.lines[0] + ' »</p>' + (bld ? '<div class="card" style="text-align:left">' + bld.i + ' <b>' + bld.n + '</b> peut maintenant être construit(e).</div>' : '') + '<button class="btn main" data-a="ok">Bienvenue !</button></div>', { ok: () => { U.close(m); setTimeout(S.news, 300); } });
      B.Audio.sfx('rescue');
    }
  };
  S.villageTuto = function () {
    const P = B.P;
    const m = U.modal('<div class="panel col center" style="gap:12px"><div style="font-size:48px">🏘️</div><h2>Le village</h2><p style="line-height:1.5">Voici le dernier village. Touchez un bâtiment pour y entrer.<br><br>Brann peut construire la <b>Forge</b> avec les braises que vous avez rapportées. Plus tard : Académie (talents), Taverne (héros)…<br><br>Quand vous êtes prêt, touchez <b>🏮 Expédition</b>.</p><button class="btn main" data-a="ok">Compris !</button></div>', { ok: () => { U.close(m); P.tuto = 2; Me().save(); } });
  };

  // ───── Préparation de l'expédition ─────
  S.prepSel = null;
  S.prep = function (opts) {
    const P = B.P;
    opts = opts || {};
    Gm().bg.start('title');
    const sel = S.prepSel = S.prepSel || { biome: Math.min(P.biome, 4), deep: P.deepSel || 0 };
    sel.biome = Math.min(sel.biome, P.biome);
    const H = B.HEROES.find(h => h.id === P.hero);
    const meta = Me().runMeta(P.hero);
    const st = B.computeStats({ hero: P.hero, ws: [{ id: H.w, lvl: 1 }], ps: [], meta: meta.st, flags: meta.flags, curses: [] });
    const hl = P.heroes[P.hero];
    const comp = P.comp && P.comps[P.comp] ? B.COMPANIONS.find(c => c.id === P.comp) : null;
    const blessMax = [0, 1, 1, 2, 2, 3][P.bld.altar] + Me().flagSum('blessSlot');
    const potMax = (P.bld.garden >= 3 ? 2 : P.bld.garden ? 1 : 0) + Me().flagSum('potSlot');
    P.bless = P.bless.slice(0, blessMax);
    P.potSel = P.potSel.filter(id => (P.potions[id] || 0) > 0).slice(0, potMax);
    const biomes = B.BIOMES.map((b, i) => '<button class="card ' + (i === sel.biome ? 'sel' : '') + (i > P.biome ? ' lock' : '') + '" data-a="biome" data-i="' + i + '" style="flex:none;width:132px;text-align:left;padding:10px">' +
      '<div style="height:46px;border-radius:10px;margin-bottom:6px;background:linear-gradient(135deg,' + b.pal.g2 + ',' + b.pal.g3 + ');display:grid;place-items:center;font-size:22px;box-shadow:inset 0 0 14px ' + b.pal.acc + '55">' + (i > P.biome ? '🔒' : ['🌲', '🐸', '🏛️', '🏔️', '👁️'][i]) + '</div><b class="small">' + b.n + '</b><div class="tiny mut">' + (P.cleared[i] ? '✔ Boss vaincu' : i > P.biome ? 'Battez le boss précédent' : 'Boss : ' + B.MONSTERS[b.boss].n) + '</div></button>').join('');
    const html = U.top('Expédition') + '<div class="scroll grow" style="padding:0 14px 120px"><div class="col" style="gap:12px">' +
      // héros
      '<div class="panel row" data-a="heroes" style="cursor:pointer"><canvas class="hport" width="72" height="72" style="position:static;width:64px;height:64px;border-radius:14px;background:radial-gradient(#3a2e50,#1a1426)"></canvas><div style="flex:1"><div class="row" style="justify-content:space-between"><h3>' + H.n + '</h3><span class="tag">Niv. ' + hl.lvl + '</span></div><div class="mut small">' + H.t + '</div><div class="tiny" style="margin-top:4px">❤️ ' + st.hp + ' · ⚔️ ' + Math.round(st.dmg * 100) + ' % · 🛡️ ' + Math.round(st.armorRed * 100) + ' % · 👟 ' + Math.round(st.spd) + '</div></div><span class="mut">›</span></div>' +
      // compagnon / équipement
      '<div class="grid2"><div class="card" data-a="comp" style="cursor:pointer"><div class="tiny mut">Compagnon</div><b>' + (comp ? comp.i + ' ' + comp.n + ' <span class="tiny mut">niv. ' + P.comps[comp.id].lvl + '</span>' : '—') + '</b></div><div class="card" data-a="inv" style="cursor:pointer"><div class="tiny mut">Équipement</div><b>' + ['weapon', 'armor', 'jewel'].map(s => { const it = P.items.find(x => x.uid === P.equip[s]); return it ? '<span class="r' + it.rar + ' rt">' + B.SLOT_ICON[s] + '</span>' : '<span class="dim">' + B.SLOT_ICON[s] + '</span>'; }).join(' ') + '</b></div></div>' +
      // bénédictions
      (P.bld.altar ? '<div class="card" data-a="bless" style="cursor:pointer"><div class="row" style="justify-content:space-between"><span class="tiny mut">Bénédictions (' + P.bless.length + '/' + blessMax + ')</span><span class="mut">›</span></div><b>' + (P.bless.length ? P.bless.map(id => { const b = B.BLESSINGS.find(x => x.id === id); return b.i + ' ' + b.n; }).join(' · ') : '<span class="dim">Aucune</span>') + '</b></div>' : '') +
      (potMax ? '<div class="card" data-a="pots" style="cursor:pointer"><div class="row" style="justify-content:space-between"><span class="tiny mut">Potions emportées (' + P.potSel.length + '/' + potMax + ')</span><span class="mut">›</span></div><b>' + (P.potSel.length ? P.potSel.map(id => B.POTIONS.find(x => x.id === id).i).join(' ') : '<span class="dim">Aucune</span>') + '</b></div>' : '') +
      '<h3 style="margin-top:4px">Destination</h3><div class="tabs" style="gap:8px;padding-bottom:6px">' + biomes + '</div>' +
      (P.deep > 0 ? '<div class="card"><div class="row" style="justify-content:space-between"><b>🌫️ Brume Profonde : ' + sel.deep + '</b><span><button class="btn sm" data-a="deep" data-d="-1">−</button> <button class="btn sm" data-a="deep" data-d="1">+</button></span></div><div class="tiny mut" style="margin-top:4px">' + (sel.deep ? B.DEEP.slice(0, sel.deep).map((d, i) => (i + 1) + '. ' + d.d).slice(-3).join('<br>') + '<br><span class="gold">Ressources +' + sel.deep * 10 + ' %, Éclats d\'Aube sur les boss</span>' : 'Débloqué jusqu\'au niveau ' + P.deep) + '</div></div>' : '') +
      '</div></div><div style="position:absolute;left:0;right:0;bottom:0;padding:12px 14px calc(14px + var(--sab));background:linear-gradient(transparent,#0d0b14 30%)"><button class="btn main big" style="width:100%" data-a="go">🏮 Partir : ' + B.BIOMES[sel.biome].n + '</button></div>';
    const el = U.show('prep', html, {
      back: () => S.village(), heroes: () => S.heroes(true), inv: () => S.inventory(true), comp: () => S.building('stable', true),
      bless: () => S.building('altar', true), pots: () => S.building('garden', true),
      biome: (t) => { const i = +t.dataset.i; if (i > P.biome) { B.Audio.sfx('error'); return; } sel.biome = i; S.prep(); },
      deep: (t) => { sel.deep = B.clamp(sel.deep + +t.dataset.d, 0, P.deep); P.deepSel = sel.deep; S.prep(); },
      go: () => { Me().save(true); Gm().startRun({ mode: 'normal', hero: P.hero, biome: sel.biome, deep: sel.deep }); }
    });
    S.drawPortrait(el.querySelector('.hport'), H);
  };
  S.drawPortrait = function (cv, H) {
    if (!cv) return;
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
    const sp = B.G.hero(H, 0); const k = cv.width / 36;
    x.drawImage(sp.c, cv.width / 2 - sp.w * k / 2, cv.height / 2 - sp.h * k / 2 + 6 * k, sp.w * k, sp.h * k);
    const ls = B.G.lantern(); x.drawImage(ls.c, cv.width / 2 + 10 * k, cv.height / 2 + 4 * k, ls.w * k * 0.9, ls.h * k * 0.9);
  };

  // ───── Carte d'expédition ─────
  S.map = function () {
    const run = Gm().run; if (!run) return S.village();
    const d = run.d, rows = d.map.rows, P = B.P;
    Gm().bg.start('map', { biome: d.biome });
    B.Audio.music(B.Audio.biomeTrack(d.biome));
    const RH = d.RH, st = B.computeStats(RH);
    const next = run.nextNodes();
    const reveal = d.reveal || d.flags.mapSee;
    const ICON = { fight: '⚔️', elite: '💀', event: '❓', treasure: '💰', shop: '🛒', camp: '🔥', guard: '🛡️', boss: '👑', survivor: '⚔️' };
    const NAME = { fight: 'Combat', elite: 'Élite', event: 'Mystère', treasure: 'Trésor', shop: 'Marchand', camp: 'Feu de camp', guard: 'Gardien', boss: 'Boss', survivor: 'Survivant' };
    const RH_ = 96, W = 100;
    const H = rows.length * RH_ + 120;
    let svg = '', nodes = '';
    rows.forEach((row, ri) => row.forEach((n, i) => {
      const y = H - 70 - ri * RH_, x = n.x * W;
      n.l.forEach(j => { const m = rows[ri + 1][j]; const y2 = y - RH_, x2 = m.x * W; const done = n.vis && m.vis; const avail = d.pos.r === ri && d.pos.i === i; svg += '<line x1="' + x + '%" y1="' + y + '" x2="' + x2 + '%" y2="' + y2 + '" stroke="' + (done ? '#ffcf6a' : avail ? 'rgba(255,207,106,.7)' : 'rgba(255,255,255,.18)') + '" stroke-width="' + (done ? 4 : 3) + '" stroke-dasharray="' + (done ? '' : '6 7') + '" stroke-linecap="round"/>'; });
    }));
    rows.forEach((row, ri) => row.forEach((n, i) => {
      const y = H - 70 - ri * RH_;
      const can = (d.pos.r + 1 === ri) && next.indexOf(i) >= 0;
      const cur = d.pos.r === ri && d.pos.i === i;
      const t = n.t === 'event' && !reveal ? 'event' : n.t;
      const cls = 'mapnode' + (can ? ' can' : '') + (n.done || (n.vis && !cur) ? ' done' : '') + (cur ? ' cur' : '') + (n.t === 'boss' || n.t === 'guard' ? ' boss' : '') + (n.surv && !n.done ? ' surv' : '') + (!can && !n.vis && ri > d.pos.r + 1 ? ' far' : '');
      nodes += '<button class="' + cls + '" style="left:' + (n.x * W) + '%;top:' + y + 'px" data-a="node" data-r="' + ri + '" data-i="' + i + '" aria-label="' + NAME[n.t] + '">' + (n.t === 'boss' ? '<span style="filter:drop-shadow(0 0 8px #ff5a3c)">' + ICON[t] + '</span>' : ICON[t]) + '</button>';
    }));
    const potBtn = d.potions.length ? '<button class="btn sm" data-a="pots">🧪 ' + d.potions.length + '</button>' : '';
    const html = '<div class="top" style="flex-wrap:wrap;gap:8px"><button class="back" data-a="menu">☰</button><div style="flex:1;min-width:0"><div class="row" style="gap:8px"><b style="font-family:var(--title);font-size:17px;color:var(--gold)">' + B.BIOMES[d.biome].n + '</b>' + (d.deep ? '<span class="tag">🌫️ ' + d.deep + '</span>' : '') + (d.mode === 'daily' || d.mode === 'weekly' ? '<span class="tag">⭐ Défi</span>' : '') + '</div>' +
      '<div class="row tiny" style="gap:10px;margin-top:3px"><span>❤️ ' + Math.ceil(RH.hp) + '/' + st.hp + '</span><span>Niv. ' + RH.lvl + '</span><span>🪙 ' + d.gold + '</span><span>🔥 ' + B.fmt(d.loot.braise) + '</span></div><div style="margin-top:4px;width:100%">' + U.bar(RH.hp / st.hp) + '</div></div>' + potBtn + '<button class="btn sm" data-a="pw">✨ Pouvoirs</button></div>' +
      '<div class="scroll grow mapscroll"><div class="mapwrap" style="height:' + H + 'px;margin:0 22px"><svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">' + svg + '</svg>' + nodes + '</div></div>' +
      '<div class="center tiny mut" style="padding:6px 0 calc(8px + var(--sab))">Touchez un cercle doré pour avancer' + (RH.curses.length ? ' · <span class="bad">Malédictions : ' + RH.curses.map(c => B.CURSES[c].n).join(', ') + '</span>' : '') + '</div>';
    const el = U.show('map', html, {
      node: (t) => {
        const ri = +t.dataset.r, i = +t.dataset.i;
        const n = rows[ri][i];
        if (!(d.pos.r + 1 === ri && next.indexOf(i) >= 0)) { S.nodeInfo(n, NAME, ICON); return; }
        run.goTo(i); Gm().saveRun();
        t.style.transform = 'scale(1.3)';
        setTimeout(() => Gm().enterNode(n), 180);
      },
      pw: () => S.myPowers(), menu: () => S.runMenu(), pots: () => S.potionMenu()
    });
    const sc = el.querySelector('.mapscroll');
    const cy = H - 70 - Math.max(0, d.pos.r + 1) * RH_;
    requestAnimationFrame(() => { sc.scrollTop = Math.max(0, cy - sc.clientHeight * 0.6); });
  };
  S.nodeInfo = function (n, NAME, ICON) {
    const D = { fight: 'Un combat contre les créatures de la brume.', elite: 'Un monstre d\'élite et ses serviteurs. Il lâche un coffre.', event: 'Une rencontre étrange… Bonne ou mauvaise ?', treasure: 'Or, objets et parfois un pouvoir.', shop: 'Dépensez votre or : pouvoirs, soins, objets.', camp: 'Reposez-vous ou entraînez un pouvoir.', guard: 'Le gardien du biome. Coriace !', boss: 'Le maître de ce biome. Le battre débloque la suite.', survivor: 'Un survivant est piégé ici. Libérez-le pendant le combat !' };
    U.toast(ICON[n.t] + ' <b>' + NAME[n.t] + '</b> — ' + D[n.t] + (n.surv && !n.done ? '<br>🙋 ' + B.SURVIVORS.find(s => s.id === n.surv).n : ''), 2600);
  };
  S.runMenu = function () {
    const m = U.modal('<div class="panel col" style="gap:10px"><h2 class="center">Expédition</h2><button class="btn" data-a="pw">✨ Mes pouvoirs</button><button class="btn" data-a="set">⚙️ Paramètres</button><button class="btn" data-a="vil">🏠 Retour au titre (sauvegardé)</button><button class="btn red" data-a="quit">🏳️ Abandonner l\'expédition</button><button class="btn ghost" data-a="close">Fermer</button></div>', {
      pw: () => S.myPowers(), set: () => S.settings(true), close: () => U.close(m),
      vil: () => { U.close(m); Gm().saveRun(); Me().save(true); Gm().run = null; S.title(); },
      quit: () => U.confirm('Abandonner ? Vous garderez une partie des ressources, comme en cas de défaite.', () => { U.close(m); Gm().endRun(false); }, 'Abandonner')
    }, { closeOnBg: true });
  };
  S.potionMenu = function () {
    const run = Gm().run, d = run.d;
    const m = U.modal('<div class="panel col"><h2 class="center">Potions</h2>' + d.potions.map((id, i) => { const p = B.POTIONS.find(x => x.id === id); return '<button class="card row" data-a="use" data-i="' + i + '" style="text-align:left"><span class="ico">' + p.i + '</span><div><b>' + p.n + '</b><div class="small mut">' + p.d + '</div></div></button>'; }).join('') + '<button class="btn ghost" data-a="close">Fermer</button></div>', {
      use: (t) => { run.usePotion(+t.dataset.i); B.Audio.sfx('heal'); U.close(m); Gm().saveRun(); Gm().processQueue(() => S.map()); },
      close: () => U.close(m)
    }, { closeOnBg: true });
  };

  // ───── Événement ─────
  S.event = function () {
    const run = Gm().run, d = run.d;
    let ev = d.curEvent ? B.EVENTS.find(e => e.id === d.curEvent) : null;
    if (!ev) { ev = run.pickEvent(); d.curEvent = ev.id; Gm().saveRun(); }
    const html = '<div class="pad grow col" style="justify-content:center;gap:14px;max-width:480px;margin:0 auto;width:100%"><div class="panel col center" style="gap:12px"><div style="font-size:64px;filter:drop-shadow(0 0 18px rgba(255,200,120,.4))">' + ev.i + '</div><h2>' + ev.n + '</h2><p style="line-height:1.5;font-size:15.5px">' + ev.d + '</p></div><div class="col">' +
      ev.o.map((o, i) => { const ok = !o.need || d.gold >= (o.need.gold || 0); return '<button class="btn' + (ok ? '' : ' off') + '" data-a="opt" data-i="' + i + '" style="flex-direction:column;align-items:stretch;text-align:left;min-height:64px"><span>' + o.t + '</span><span class="tiny mut" style="font-weight:600">' + o.d + (o.need ? ' (vous avez ' + d.gold + ' 🪙)' : '') + '</span></button>'; }).join('') + '</div></div>';
    U.show('event', html, {
      opt: (t) => {
        const o = ev.o[+t.dataset.i];
        const txt = o.f(run.api());
        d.curEvent = null; Gm().saveRun();
        const m = U.modal('<div class="panel col center" style="gap:12px"><div style="font-size:40px">' + ev.i + '</div><p style="font-size:16px;line-height:1.5">' + txt + '</p><button class="btn main" data-a="ok">Continuer</button></div>', { ok: () => { U.close(m); Gm().nodeDone(); } });
      }
    });
  };
  // ───── Marchand ─────
  S.shop = function () {
    const run = Gm().run, d = run.d;
    const stock = run.shopStock();
    const item = (s, i) => {
      let body;
      if (s.k === 'card') { const p = B.POWERS[s.card.id]; body = U.pwIcon(s.card.id) + '<div style="flex:1;min-width:0"><b>' + p.n + '</b> <span class="r' + s.card.rar + ' rt tiny">' + B.rarityName(s.card.rar) + '</span><div class="tiny mut">' + (s.card.from ? 'Niv. ' + s.card.from + ' → ' + s.card.lv : 'Nouveau · niv. ' + s.card.lv) + ' · ' + p.d + '</div></div>'; }
      else if (s.k === 'heal') body = '<span class="ico">🍲</span><div style="flex:1"><b>Ragoût chaud</b><div class="tiny mut">Soigne 35 % de la vie</div></div>';
      else if (s.k === 'uncurse') body = '<span class="ico">🕊️</span><div style="flex:1"><b>Purification</b><div class="tiny mut">Retire une malédiction</div></div>';
      else body = '<span class="ico r' + s.item.rar + '" style="border-color:var(--rc)">' + B.SLOT_ICON[s.item.slot] + '</span><div style="flex:1;min-width:0"><b class="r' + s.item.rar + ' rt">' + Me().itemName(s.item) + '</b><div class="tiny mut">' + B.rarityName(s.item.rar) + ' · ' + s.item.lines.map(l => Me().lineText(s.item, l)).join(', ') + '</div></div>';
      return '<button class="card row' + (s.sold ? ' lock' : '') + '" data-a="buy" data-i="' + i + '" style="text-align:left;gap:10px">' + body + '<span class="res ' + (d.gold >= s.price ? 'gold' : 'bad') + '">' + (s.sold ? 'Vendu' : '🪙 ' + s.price) + '</span></button>';
    };
    U.show('shop', '<div class="top"><h2>🛒 Marchand</h2><span class="res gold" style="font-size:17px">🪙 ' + d.gold + '</span></div><div class="scroll grow" style="padding:0 14px 14px"><div class="panel row" style="margin-bottom:12px"><span style="font-size:40px">🧕</span><p class="small" style="font-style:italic">« Bienvenue, Porteur ! Tout ce qui brille a un prix. »</p></div><div class="col">' + stock.map(item).join('') + '</div></div><div class="pad" style="padding-top:0"><button class="btn main" style="width:100%" data-a="leave">Continuer la route</button></div>', {
      buy: (t) => { if (run.buy(+t.dataset.i)) { B.Audio.sfx('buy'); Gm().saveRun(); S.shop(); } else B.Audio.sfx('error'); },
      leave: () => Gm().nodeDone()
    });
  };
  // ───── Feu de camp ─────
  S.camp = function () {
    const run = Gm().run, d = run.d, st = B.computeStats(run.RH);
    const noCamp = d.mods.noCamp;
    U.show('camp', '<div class="pad grow col" style="justify-content:center;gap:16px;max-width:460px;margin:0 auto;width:100%"><div class="panel col center" style="gap:10px"><div style="font-size:70px;filter:drop-shadow(0 0 30px #ff8a3a)">🔥</div><h2>Feu de camp</h2><p class="mut">Un moment de calme dans la brume.</p><div class="small">❤️ ' + Math.ceil(run.RH.hp) + ' / ' + st.hp + '</div></div>' +
      '<button class="btn main big' + (noCamp ? ' off' : '') + '" data-a="rest">😴 Se reposer<span class="tiny" style="font-weight:600">(soigne ~' + Math.round((0.32 + 0.1 * (d.flags.campHeal || 0)) * (d.mods.campMul || 1) * 100) + ' %)</span></button>' +
      '<button class="btn big" data-a="train">⚔️ S\'entraîner<span class="tiny mut" style="font-weight:600">(améliorer un pouvoir)</span></button></div>', {
      rest: () => { const h = run.campHeal(); B.Audio.sfx('heal'); U.toast('❤️ +' + h); Gm().nodeDone(); },
      train: () => { d.queue.push({ k: 'offer', o: { upgradeOnly: true } }); Gm().nodeDone(); }
    });
  };
  // ───── Trésor ─────
  S.treasure = function (resume) {
    const run = Gm().run, d = run.d;
    if (!d.curTreasure) { d.curTreasure = run.openTreasure(); Gm().saveRun(); }
    const r = d.curTreasure;
    B.Audio.sfx(r.item && r.item.rar >= 3 ? 'legendary' : 'chest');
    if (r.item && r.item.rar >= 3) { B.vibrate([40, 30, 80]); }
    U.show('treasure', '<div class="pad grow col" style="justify-content:center;gap:16px;max-width:460px;margin:0 auto;width:100%"><div class="panel col center" style="gap:10px"><div class="chestanim" style="font-size:76px">💰</div><h2>Trésor !</h2><div class="res gold" style="font-size:20px">+' + r.gold + ' 🪙</div>' + (r.offer ? '<div class="small mut">Un parchemin de pouvoir était caché au fond…</div>' : '') + '</div>' + (r.item ? U.itemCard(r.item) : '') + '<button class="btn main big" data-a="ok">Prendre</button></div>', {
      ok: () => { d.curTreasure = null; Gm().nodeDone(); }
    });
    if (r.item && r.item.rar >= 3) setTimeout(() => S.legendFlash(r.item), 100);
  };
  S.legendFlash = function (it) {
    const f = document.createElement('div');
    f.className = 'legflash r' + it.rar;
    document.getElementById('ov').appendChild(f); setTimeout(() => f.remove(), 1200);
  };
  // ───── Fin de combat ─────
  S.combatWin = function (c, res, next) {
    const run = Gm().run;
    const html = '<div class="pad grow col" style="justify-content:center;align-items:center;gap:14px"><div class="panel col center" style="gap:8px;min-width:260px"><div style="font-size:46px">' + (c.kind === 'guard' ? '🛡️' : c.kind === 'elite' ? '💀' : '✨') + '</div><h2>' + (c.kind === 'guard' ? 'Gardien vaincu !' : 'La brume recule') + '</h2>' +
      '<div class="row" style="justify-content:center;gap:14px;flex-wrap:wrap"><span class="res">💀 ' + c.kills + '</span><span class="res">🪙 +' + c.loot.gold + '</span><span class="res">🔥 +' + Math.round(c.loot.braise) + '</span>' + (c.loot.essence ? '<span class="res">💧 +' + c.loot.essence + '</span>' : '') + '</div>' +
      (res.rescued ? '<div class="card">🙋 ' + B.SURVIVORS.find(s => s.id === res.rescued).n + ' est en route pour le village !</div>' : '') + (c.dmgTaken === 0 && c.t > 15 ? '<div class="gold small">🍃 Sans une égratignure !</div>' : '') +
      '<button class="btn main" data-a="ok" style="margin-top:6px;min-width:200px">Continuer</button></div></div>';
    U.show('cwin', html, { ok: next });
    B.Audio.sfx('clear');
  };
  // ───── Fin d'expédition ─────
  S.endRun = function (r) {
    const P = B.P;
    Gm().bg.start('title');
    B.Audio.music(r.won ? 'village' : 'title');
    const titles = r.won ? (r.mode === 'tutorial' ? ['Première expédition réussie !', '🏮'] : ['Victoire !', '🏆']) : r.mode === 'endless' ? ['Fin du mode Infini', '♾️'] : ['La brume vous a eu…', '💀'];
    const g = r.gains;
    const gl = Object.keys(g).filter(k => g[k] > 0).map(k => '<div class="card center" style="padding:8px"><div style="font-size:22px">' + Me().RES[k].i + '</div><b>+' + B.fmt(g[k]) + '</b><div class="tiny mut">' + Me().RES[k].n + '</div></div>').join('');
    const disc = [];
    if (r.unlocked !== null && r.unlocked !== undefined) disc.push('🗺️ Nouveau biome : <b>' + B.BIOMES[r.unlocked].n + '</b>');
    r.rescued.forEach(id => { const s = B.SURVIVORS.find(x => x.id === id); disc.push(s.i + ' ' + s.n + ' (' + s.r + ') a rejoint le village'); });
    if (r.heroUp) disc.push('⭐ ' + B.HEROES.find(h => h.id === P.hero).n + ' passe au niveau ' + P.heroes[P.hero].lvl);
    if (r.compUp && P.comp) disc.push('🐾 ' + B.COMPANIONS.find(c => c.id === P.comp).n + ' passe au niveau ' + P.comps[P.comp].lvl);
    r.ach.forEach(a => disc.push('🏆 Succès : <b>' + a.n + '</b>'));
    r.lore.forEach(l => { const L = B.LORE.find(x => x.id === l); if (L) disc.push('📖 Histoire : ' + L.n); });
    if (r.chal) disc.push('⭐ Défi réussi !');
    if (r.mode === 'endless') disc.push('♾️ Temps survécu : <b>' + B.fmtTime(r.endless) + '</b> (record : ' + B.fmtTime(P.st.endlessBest) + ')');
    const items = r.items.map(it => U.itemCard(it)).join('');
    r.items.forEach(it => it.isNew = true);
    const html = '<div class="scroll grow pad"><div class="col" style="gap:12px;max-width:480px;margin:0 auto">' +
      '<div class="center" style="margin-top:20px"><div style="font-size:60px">' + titles[1] + '</div><h2 style="font-size:28px">' + titles[0] + '</h2><div class="mut small">' + (r.mode === 'endless' ? '' : B.BIOMES[r.biome].n + ' · ') + 'Niveau ' + r.lvl + ' · ' + B.fmt(r.kills) + ' monstres · ' + B.fmtTime(r.time) + '</div>' + (!r.won && r.mode !== 'endless' ? '<div class="small" style="margin-top:6px">Vous gardez <b class="gold">' + Math.round(r.keep * 100) + ' %</b> des ressources.</div>' : '') + '</div>' +
      '<div class="grid3">' + gl + '</div>' +
      (disc.length ? '<div class="panel col" style="gap:6px"><h3>Nouveautés</h3>' + disc.map(x => '<div class="small">' + x + '</div>').join('') + '</div>' : '') +
      (items ? '<h3>Butin (' + r.items.length + ')</h3><div class="col">' + items + '</div>' : '') +
      '</div></div><div class="pad col" style="padding-top:8px;gap:8px"><button class="btn main big pulse" data-a="again">🔁 Rejouer</button><button class="btn" data-a="vil">🏘️ Retour au village</button></div>';
    U.show('end', html, {
      again: () => { if (r.mode === 'tutorial') { S.village(); return; } if (r.mode === 'endless') { Gm().startRun({ mode: 'endless', hero: P.hero, biome: 0 }); return; } S.prep(); },
      vil: () => S.village()
    });
    if (r.items.some(i => i.rar >= 3)) setTimeout(() => { S.legendFlash(r.items.find(i => i.rar >= 3)); B.Audio.sfx('legendary'); }, 500);
  };

  // ───── Pause ─────
  S.pause = function () {
    const c = Gm().c;
    const m = U.modal('<div class="panel col" style="gap:10px"><h2 class="center">Pause</h2><div class="center small mut">' + (c ? B.BIOMES[c.biome].n + ' · Niv. ' + c.RH.lvl + ' · ' + B.fmtTime(c.t) : '') + '</div><button class="btn main big" data-a="resume">▶ Reprendre</button><button class="btn" data-a="pw">✨ Voir mes pouvoirs</button><button class="btn" data-a="set">⚙️ Paramètres</button><button class="btn red" data-a="quit">🏳️ Abandonner</button></div>', {
      resume: () => { U.close(m); Gm().resume(); },
      pw: () => S.myPowers(), set: () => S.settings(true),
      quit: () => U.confirm('Abandonner l\'expédition ? Vous garderez une partie des ressources.', () => { U.closeAll(); Gm().paused = false; if (Gm().c) { Gm().c.over = 'lose'; } Gm().endRun(false, Gm().c ? { time: Gm().c.t } : null); }, 'Abandonner')
    });
  };
  S.myPowers = function () {
    const run = Gm().run; if (!run) return;
    const RH = run.RH, st = B.computeStats(RH);
    const row = (x) => { const d = B.POWERS[x.id]; return '<div class="card row" style="gap:10px">' + U.pwIcon(x.id, 's') + '<div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between"><b>' + d.n + '</b><span class="tag">' + (d.kind === 'e' ? '★ Évolution' : 'Niv. ' + x.lvl + '/' + d.max) + '</span></div><div class="tiny mut">' + d.d + '</div>' + (d.kind === 'w' && B.EVO_BY_WEAPON[d.id] ? '<div class="tiny gold">⭐ Évolue avec ' + B.POWERS[B.EVO_BY_WEAPON[d.id].with].n + ' (arme niv. 5)</div>' : '') + '</div></div>'; };
    const cnt = B.elemCounts(RH);
    const syn = Object.keys(B.SYNERGY).filter(e => cnt[e]).map(e => '<div class="small"><b style="color:' + B.ELEM[e].c + '">' + B.ELEM[e].i + ' ' + B.elemName(e) + ' ×' + cnt[e] + '</b> — ' + B.SYNERGY[e].map(s => '<span class="' + (cnt[e] >= s.n ? 'good' : 'dim') + '">' + s.n + ' : ' + s.d + '</span>').join(' · ') + '</div>').join('');
    const m = U.modal('<div class="panel col" style="gap:8px;max-height:82vh"><h2 class="center">Mes pouvoirs</h2><div class="scroll col" style="gap:8px">' +
      '<div class="tiny mut">Armes ' + RH.ws.length + '/' + RH.slotsW + '</div>' + RH.ws.map(row).join('') +
      '<div class="tiny mut">Passifs ' + RH.ps.length + '/' + RH.slotsP + '</div>' + (RH.ps.map(row).join('') || '<div class="dim small">Aucun</div>') +
      '<h3 style="margin-top:6px">Synergies</h3>' + (syn || '<div class="dim small">Rassemblez 2 pouvoirs du même élément.</div>') +
      '<h3 style="margin-top:6px">Statistiques</h3><div class="grid2 small"><span>❤️ Vie ' + Math.ceil(RH.hp) + '/' + st.hp + '</span><span>⚔️ Dégâts ' + Math.round(st.dmg * 100) + ' %</span><span>⏱️ Recharge ' + Math.round((1 - st.cdF) * 100) + ' %</span><span>🎯 Critique ' + Math.round(st.crit * 100) + ' %</span><span>🛡️ Réduction ' + Math.round(st.armorRed * 100) + ' %</span><span>👟 Vitesse ' + Math.round(st.spd) + '</span><span>🏮 Lanterne ' + Math.round(st.light) + '</span><span>🍀 Chance ' + Math.round(st.luck * 100) + '</span></div>' +
      '</div><button class="btn" data-a="close">Fermer</button></div>', { close: () => U.close(m) }, { closeOnBg: true });
  };

  // ───── Paramètres ─────
  S.settings = function (inGame) {
    const P = B.P, s = P.settings;
    const seg = (key, opts) => '<div class="tabs">' + opts.map(o => '<button class="' + (s[key] === o[0] ? 'on' : '') + '" data-a="set" data-k="' + key + '" data-v="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
    const sl = (key, label) => '<div class="row" style="justify-content:space-between"><span>' + label + '</span><input type="range" min="0" max="100" value="' + Math.round(s[key] * 100) + '" data-k="' + key + '" style="width:55%;accent-color:#ffb43c"></div>';
    const tg = (key, label) => '<div class="row" style="justify-content:space-between"><span>' + label + '</span><button class="btn sm ' + (s[key] ? 'green' : '') + '" data-a="tog" data-k="' + key + '" style="min-width:70px">' + (s[key] ? 'Oui' : 'Non') + '</button></div>';
    const html = '<div class="panel col" style="gap:12px;max-height:86vh"><h2 class="center">Paramètres</h2><div class="scroll col" style="gap:12px">' +
      sl('sound', '🔊 Sons') + sl('music', '🎵 Musique') + tg('vib', '📳 Vibrations') + tg('shake', '🫨 Tremblements d\'écran') + tg('nums', '🔢 Chiffres de dégâts') + tg('autoSp', '✨ Capacité spéciale automatique') +
      '<div><div class="small mut" style="margin-bottom:4px">🎨 Qualité graphique</div>' + seg('quality', [['auto', 'Auto'], ['low', 'Basse'], ['mid', 'Moyenne'], ['high', 'Haute']]) + '</div>' +
      '<div><div class="small mut" style="margin-bottom:4px">🕹️ Joystick</div>' + seg('joy', [['float', 'Flottant'], ['fixed', 'Fixe']]) + '</div>' +
      '<div><div class="small mut" style="margin-bottom:4px">✋ Main</div>' + seg('hand', [['r', 'Droite'], ['l', 'Gauche']]) + '</div>' +
      '<div><div class="small mut" style="margin-bottom:4px">🌐 Langue</div>' + seg('lang', [['fr', 'Français'], ['en', 'English']]) + '</div>' +
      (inGame ? '' : '<div class="sep"></div><div class="grid2"><button class="btn sm" data-a="export">📤 Exporter</button><button class="btn sm" data-a="import">📥 Importer</button></div><button class="btn sm red" data-a="wipe">🗑️ Effacer la sauvegarde</button>') +
      '<div class="tiny dim center">Temps de jeu : ' + B.fmtTime(P.play) + '</div></div><button class="btn main" data-a="close">OK</button></div>';
    const m = U.modal(html, {
      close: () => { U.close(m); Me().save(true); },
      set: (t) => { s[t.dataset.k] = t.dataset.v; Gm().applySettings(); if (t.dataset.k === 'lang') U.toast(t.dataset.v === 'en' ? 'English: menus are partially translated.' : 'Langue : français'); if (Gm().mode === 'combat') Gm().buildHud(); Me().save(); U.close(m); setTimeout(() => S.settings(inGame), 190); },
      tog: (t) => { s[t.dataset.k] = !s[t.dataset.k]; Gm().applySettings(); Me().save(); t.classList.toggle('green', s[t.dataset.k]); t.textContent = s[t.dataset.k] ? 'Oui' : 'Non'; },
      export: () => S.exportSave(), import: () => S.importSave(),
      wipe: () => U.confirm('Tout effacer ? Toute la progression sera perdue. Pensez à exporter avant !', () => U.confirm('Vraiment sûr ? C\'est définitif.', () => { Me().wipe(); U.closeAll(); location.reload(); }, 'Tout effacer'), 'Effacer')
    }, { closeOnBg: true });
    m.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => { s[r.dataset.k] = r.value / 100; Gm().applySettings(); }));
  };
  S.exportSave = function () {
    const code = Me().exportSave();
    const m = U.modal('<div class="panel col"><h2 class="center">Exporter</h2><p class="small mut">Copiez ce code et gardez-le précieusement (notes, e-mail…). Il contient toute votre progression.</p><textarea readonly style="width:100%;height:140px;border-radius:12px;background:#120d1c;color:#e8dcc8;border:1px solid var(--line);padding:8px;font-size:11px;user-select:text;-webkit-user-select:text">' + code + '</textarea><div class="grid2"><button class="btn" data-a="copy">📋 Copier</button><button class="btn" data-a="file">💾 Fichier</button></div><button class="btn ghost" data-a="close">Fermer</button></div>', {
      copy: () => { const ta = m.querySelector('textarea'); ta.select(); try { navigator.clipboard.writeText(code).then(() => U.toast('Copié !')); } catch (e) { document.execCommand('copy'); U.toast('Copié !'); } },
      file: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = 'brumeterre-sauvegarde.txt'; a.click(); },
      close: () => U.close(m)
    });
  };
  S.importSave = function () {
    const m = U.modal('<div class="panel col"><h2 class="center">Importer</h2><p class="small mut">Collez un code de sauvegarde (il remplacera la partie actuelle).</p><textarea style="width:100%;height:140px;border-radius:12px;background:#120d1c;color:#e8dcc8;border:1px solid var(--line);padding:8px;font-size:11px;user-select:text;-webkit-user-select:text"></textarea><button class="btn" data-a="file">📂 Choisir un fichier</button><div class="grid2"><button class="btn ghost" data-a="close">Annuler</button><button class="btn main" data-a="ok">Importer</button></div></div>', {
      ok: () => { try { Me().importSave(m.querySelector('textarea').value); U.closeAll(); U.toast('Sauvegarde importée !'); setTimeout(() => location.reload(), 600); } catch (e) { U.toast('❌ Code invalide'); B.Audio.sfx('error'); } },
      file: () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.txt,text/plain'; inp.onchange = () => { const f = inp.files[0]; if (!f) return; f.text().then(t => { m.querySelector('textarea').value = t; }); }; inp.click(); },
      close: () => U.close(m)
    });
  };
  S.credits = function () {
    const m = U.modal('<div class="panel col center" style="gap:10px"><div class="logo" style="font-size:40px">Brumeterre</div><p class="small" style="line-height:1.6">Conception, programmation, dessins, sons et musiques :<br><b>créés entièrement en code</b> pour ce jeu<br>(Canvas 2D et Web Audio, aucune image ni son externe).<br><br>Réalisé avec Claude (Anthropic)<br>pour <b>Teste-de-jeux</b>.<br><br>Aucune publicité, aucun achat : tout se débloque en jouant.<br><br>Merci d\'avoir porté la lanterne. 🏮</p><button class="btn main" data-a="close">Fermer</button></div>', { close: () => U.close(m) }, { closeOnBg: true });
  };
})(this.B || (this.B = {}));
