// Brumeterre — écrans du village : bâtiments, héros, inventaire, défis, encyclopédie, succès
(function (B) {
  'use strict';
  const U = B.UI, S = B.SCR;
  const Gm = () => B.Game;
  const Me = () => B.Meta;

  // ───── Bâtiments ─────
  S.building = function (id, fromPrep, tab) {
    const P = B.P, b = B.BUILDINGS.find(x => x.id === id);
    const back = () => fromPrep ? S.prep() : S.village();
    const st = Me().bldState(b), lvl = P.bld[id];
    if (st === 'need') {
      const s = B.SURVIVORS.find(x => x.id === b.need);
      const m = U.modal('<div class="panel col center" style="gap:10px"><div style="font-size:48px">' + b.i + '</div><h2>' + b.n + '</h2><p class="mut">' + b.d + '</p><div class="card">🔒 Sauvez <b>' + s.n + '</b> (' + s.r + ') pour construire ce bâtiment.<div class="tiny mut" style="margin-top:4px">On le trouve dans : ' + B.BIOMES[s.b].n + '</div></div><button class="btn" data-a="ok">OK</button></div>', { ok: () => U.close(m) }, { closeOnBg: true });
      return;
    }
    const cost = Me().bldCost(b);
    let up = '';
    if (st === 'max') up = '<div class="tag good">Niveau maximum</div>';
    else if (st === 'fanal') up = '<div class="small mut">🗼 Améliorez le Grand Fanal pour aller plus loin.</div>';
    else up = '<button class="btn ' + (Me().can(cost) ? 'green' : 'off') + '" data-a="up" style="width:100%">' + (lvl ? '⬆ Améliorer niv. ' + (lvl + 1) : '🔨 Construire') + ' · ' + U.cost(cost) + '</button><div class="tiny mut center" style="margin-top:4px">Niveau ' + (lvl + 1) + ' : ' + b.eff(lvl + 1) + '</div>';
    const head = '<div class="panel col" style="gap:8px"><div class="row"><span class="ico l">' + b.i + '</span><div style="flex:1"><h3>' + b.n + (lvl ? ' <span class="tag">Niv. ' + lvl + '/' + b.max + '</span>' : '') + '</h3><div class="small mut">' + b.d + '</div>' + (lvl ? '<div class="small gold" style="margin-top:4px">' + b.eff(lvl) + '</div>' : '') + '</div></div>' + up + '</div>';
    let body = lvl ? (BODY[id] ? BODY[id](tab) : '') : '<div class="card center mut">Construisez ce bâtiment pour l\'utiliser.</div>';
    const H = {
      back: back,
      up: () => { if (Me().build(b)) { B.Audio.sfx('build'); B.vibrate(40); U.toast(b.i + ' ' + b.n + ' niveau ' + P.bld[id] + ' !'); Me().checkAch().forEach(a => U.toast('🏆 ' + a.n)); S.building(id, fromPrep, tab); } else B.Audio.sfx('error'); }
    };
    Object.assign(H, ACT[id] ? ACT[id](() => S.building(id, fromPrep, S._tab), fromPrep) : {});
    U.show('bld', '<div class="vtop" style="position:relative">' + U.resBar() + '</div>' + U.top(b.n) + '<div class="scroll grow" style="padding:0 14px 30px"><div class="col" style="gap:12px">' + head + body + '</div></div>', H);
  };
  S._tab = 0;
  const BODY = {}, ACT = {};

  // Grand Fanal
  BODY.fanal = () => {
    const P = B.P;
    P.lanterns = P.lanterns || { ember: 1 };
    const lan = '<div class="panel col" style="gap:8px"><h3>✨ Lanternes</h3><div class="small mut">Changez la couleur de votre flamme avec des Éclats d\'Aube (purement esthétique).</div><div class="grid2">' + B.LANTERNS.map(l => { const own = P.lanterns[l.id], on = (P.lanternId || 'ember') === l.id; return '<button class="card' + (on ? ' sel' : '') + '" data-a="lan" data-id="' + l.id + '" style="text-align:left"><div class="row"><span style="width:26px;height:26px;border-radius:50%;background:radial-gradient(' + l.c + ',' + l.g + ');box-shadow:0 0 14px ' + l.g + ';flex:none"></span><b class="small">' + l.n + '</b></div><div class="tiny" style="margin-top:4px">' + (on ? '✔ Équipée' : own ? 'Choisir' : U.cost({ aube: l.cost })) + '</div></button>'; }).join('') + '</div></div>';
    return lan + '<div class="panel col small" style="gap:6px"><h3>Le village</h3><div>🏠 Survivants : <b>' + Object.keys(P.survivors).length + '/' + B.SURVIVORS.length + '</b></div><div>🗼 Ressources gagnées : <b class="gold">+' + P.bld.fanal * 3 + ' %</b></div><div>🏗️ Niveau max des bâtiments : <b>' + Math.min(5, Math.ceil(P.bld.fanal / 2) + 1) + '</b></div><div class="mut">Chaque niveau du Fanal fait reculer la brume autour du village.</div></div>';
  };
  ACT.fanal = (re) => ({ lan: (t) => {
    const P = B.P, l = B.LANTERNS.find(x => x.id === t.dataset.id); P.lanterns = P.lanterns || { ember: 1 };
    if (!P.lanterns[l.id]) { if (!Me().pay({ aube: l.cost })) { B.Audio.sfx('error'); U.toast('Il faut ' + l.cost + ' ✨ Éclats d\'Aube'); return; } P.lanterns[l.id] = 1; B.Audio.sfx('legendary'); }
    P.lanternId = l.id; P.lanternCol = l.c; P.lanternGlow = l.g; Me().save(); re();
  } });
  // Forge
  BODY.forge = () => {
    const P = B.P;
    const list = P.items.slice().sort((a, b) => (Object.values(P.equip).indexOf(b.uid) >= 0) - (Object.values(P.equip).indexOf(a.uid) >= 0) || b.rar - a.rar || Me().itemPower(b) - Me().itemPower(a));
    return '<div class="small mut">Touchez un objet pour l\'améliorer (+' + Me().upMax() + ' max), le recycler' + (P.bld.forge >= 3 ? ', relancer une ligne' : '') + (P.bld.forge >= 5 ? ' ou le transmuter en mythique' : '') + '.</div>' +
      (list.length ? '<div class="col">' + list.map(it => U.itemCard(it, { a: 'item', eq: Object.values(P.equip).indexOf(it.uid) >= 0 })).join('') + '</div>' : '<div class="card center mut">Aucun objet. Les coffres, élites et boss en donnent.</div>');
  };
  ACT.forge = (re) => ({ item: (t) => S.itemDetail(+t.dataset.uid, re, true) });
  // Académie
  BODY.academy = (tab) => {
    const P = B.P; const br = S._tab = tab !== undefined ? tab : S._tab || 0;
    const tabs = '<div class="tabs">' + B.TALENT_BRANCHES.map((b, i) => '<button class="' + (i === br ? 'on' : '') + '" data-a="tab" data-i="' + i + '">' + b.i + ' ' + b.n + ' <span class="tiny">' + Me().branchPts(i) + '</span></button>').join('') + '</div>';
    let rows = '';
    for (let tier = 1; tier <= 5; tier++) {
      const ts = B.TALENTS.filter(t => t.br === br && t.tier === tier);
      const lockA = P.bld.academy < tier, lockP = Me().branchPts(br) < (tier - 1) * 3;
      rows += '<div class="tiny mut" style="margin-top:4px">Rang ' + tier + (lockA ? ' · 🔒 Académie niv. ' + tier : lockP ? ' · 🔒 ' + (tier - 1) * 3 + ' points dans la branche' : '') + '</div><div class="grid2">' +
        ts.map(t => { const r = Me().tRank(t.id), stt = Me().talentState(t), c = B.talentCost(t, r); return '<button class="card' + (stt === 'ok' ? '' : stt === 'max' ? ' sel' : ' lock') + '" data-a="tal" data-id="' + t.id + '" style="text-align:left;padding:10px"><div class="row" style="gap:8px"><span class="ico s" style="border-color:' + B.TALENT_BRANCHES[br].c + '">' + t.i + '</span><b class="small" style="flex:1">' + t.n + '</b></div><div class="tiny mut" style="margin:4px 0">' + t.d + '</div><div class="row" style="justify-content:space-between"><span class="tag">' + r + '/' + t.max + '</span>' + (stt === 'max' ? '<span class="tiny good">✔</span>' : '<span class="res tiny ' + (P.res.essence >= c ? '' : 'bad') + '">💧 ' + c + '</span>') + '</div></button>'; }).join('') + '</div>';
    }
    return tabs + '<div class="small mut">Points dépensés : ' + P.st.talentRanks + ' · Essences : 💧 ' + B.fmt(P.res.essence) + '</div>' + rows;
  };
  ACT.academy = (re) => ({
    tab: (t) => { S._tab = +t.dataset.i; re(); },
    tal: (t) => { const T = B.TALENT[t.dataset.id]; if (Me().buyTalent(T)) { B.Audio.sfx('unlock'); Me().checkAch().forEach(a => U.toast('🏆 ' + a.n)); re(); } else { B.Audio.sfx('error'); const s = Me().talentState(T); U.toast(s === 'max' ? 'Déjà au maximum' : s === 'acad' ? 'Améliorez l\'Académie' : s === 'pts' ? 'Il faut plus de points dans cette branche' : 'Pas assez d\'essences'); } }
  });
  // Taverne
  BODY.tavern = () => '<div class="col">' + B.HEROES.map(h => S.heroCard(h)).join('') + '</div>';
  ACT.tavern = (re) => ({ hero: (t) => S.heroDetail(t.dataset.id, re), hire: (t) => S.hire(t.dataset.id, re) });
  // Autel
  BODY.altar = () => {
    const P = B.P; const known = [0, 4, 6, 8, 10, 12][P.bld.altar]; const max = [0, 1, 1, 2, 2, 3][P.bld.altar] + Me().flagSum('blessSlot');
    return '<div class="small mut">Choisissez jusqu\'à <b>' + max + '</b> bénédiction(s) pour vos prochaines expéditions (gratuit).</div><div class="grid2">' +
      B.BLESSINGS.map((b, i) => { const on = P.bless.indexOf(b.id) >= 0, lock = i >= known; return '<button class="card' + (on ? ' sel' : '') + (lock ? ' lock' : '') + '" data-a="bl" data-id="' + b.id + '" style="text-align:left"><div style="font-size:24px">' + (lock ? '🔒' : b.i) + '</div><b>' + b.n + '</b><div class="tiny mut">' + (lock ? 'Autel niveau supérieur' : b.d) + '</div></button>'; }).join('') + '</div>';
  };
  ACT.altar = (re) => ({ bl: (t) => {
    const P = B.P; const id = t.dataset.id; const i = B.BLESSINGS.findIndex(b => b.id === id); if (i >= [0, 4, 6, 8, 10, 12][P.bld.altar]) return;
    const max = [0, 1, 1, 2, 2, 3][P.bld.altar] + Me().flagSum('blessSlot');
    const k = P.bless.indexOf(id); if (k >= 0) P.bless.splice(k, 1); else { if (P.bless.length >= max) P.bless.shift(); P.bless.push(id); }
    Me().save(); B.Audio.sfx('rune'); re();
  } });
  // Jardin
  BODY.garden = () => {
    const P = B.P; const n = Math.min(6, P.bld.garden + 1); const potMax = (P.bld.garden >= 3 ? 2 : 1) + Me().flagSum('potSlot');
    return '<div class="small mut">Préparez des potions avec vos herbes 🌿 (' + P.res.herbe + '). Touchez une potion préparée pour l\'emporter (' + P.potSel.length + '/' + potMax + ').</div><div class="col">' +
      B.POTIONS.map((p, i) => { const lock = i >= n, have = P.potions[p.id] || 0, sel = P.potSel.filter(x => x === p.id).length; return '<div class="card row' + (lock ? ' lock' : '') + (sel ? ' sel' : '') + '" style="gap:10px"><span class="ico">' + (lock ? '🔒' : p.i) + '</span><div style="flex:1;min-width:0" data-a="take" data-id="' + p.id + '"><b>' + p.n + '</b> <span class="tag">×' + have + '</span>' + (sel ? ' <span class="tag good">emportée ×' + sel + '</span>' : '') + '<div class="tiny mut">' + (lock ? 'Jardin niveau ' + (i) : p.d) + '</div></div>' + (lock ? '' : '<button class="btn sm ' + (Me().can(p.cost) ? 'green' : 'off') + '" data-a="brew" data-id="' + p.id + '">' + U.cost(p.cost) + '</button>') + '</div>'; }).join('') + '</div>';
  };
  ACT.garden = (re) => ({
    brew: (t) => { const p = B.POTIONS.find(x => x.id === t.dataset.id); if (Me().pay(p.cost)) { B.P.potions[p.id] = (B.P.potions[p.id] || 0) + 1; B.Audio.sfx('heal'); re(); } else B.Audio.sfx('error'); },
    take: (t) => { const P = B.P, id = t.dataset.id; const potMax = (P.bld.garden >= 3 ? 2 : 1) + Me().flagSum('potSlot'); const sel = P.potSel.filter(x => x === id).length; if (sel && sel >= (P.potions[id] || 0)) { P.potSel = P.potSel.filter(x => x !== id); } else if ((P.potions[id] || 0) > sel) { if (P.potSel.length >= potMax) P.potSel.shift(); P.potSel.push(id); } Me().save(); re(); }
  });
  // Écurie
  BODY.stable = () => {
    const P = B.P;
    return '<div class="small mut">Choisissez le compagnon qui vous accompagne. Il gagne de l\'expérience à chaque expédition (niveau max ' + Me().compMax() + ').</div><div class="col">' +
      B.COMPANIONS.map(c => {
        const own = P.comps[c.id], on = P.comp === c.id;
        const pw = c.pw.map((p, i) => '<div class="tiny ' + (own && own.lvl >= [1, 4, 8][i] ? 'good' : 'dim') + '">Niv. ' + [1, 4, 8][i] + ' : ' + p + '</div>').join('');
        return '<div class="card' + (on ? ' sel' : '') + '"><div class="row"><canvas data-comp="' + c.id + '" width="60" height="60" style="position:static;width:48px;height:48px;border-radius:12px;background:radial-gradient(#3a2e50,#1a1426)"></canvas><div style="flex:1"><b>' + c.n + '</b>' + (own ? ' <span class="tag">Niv. ' + own.lvl + '</span>' : '') + '<div class="tiny mut">' + c.d + '</div>' + (own ? '<div style="margin-top:4px">' + U.bar(own.xp / Me().compXpNeed(own.lvl)) + '</div>' : '') + '</div></div><div style="margin-top:6px">' + pw + '</div>' +
          (own ? '<button class="btn sm ' + (on ? 'ghost' : 'main') + '" data-a="pick" data-id="' + c.id + '" style="width:100%;margin-top:8px">' + (on ? '✔ Choisi (toucher pour retirer)' : 'Emmener') + '</button>' : '<button class="btn sm ' + (Me().can(c.cost) ? 'green' : 'off') + '" data-a="buy" data-id="' + c.id + '" style="width:100%;margin-top:8px">Adopter · ' + U.cost(c.cost) + '</button>') + '</div>';
      }).join('') + '</div>';
  };
  ACT.stable = (re) => ({
    pick: (t) => { const P = B.P; P.comp = P.comp === t.dataset.id ? null : t.dataset.id; Me().save(); re(); },
    buy: (t) => { const c = B.COMPANIONS.find(x => x.id === t.dataset.id); if (Me().buyComp(c)) { B.P.comp = c.id; B.Audio.sfx('unlock'); U.toast(c.i + ' ' + c.n + ' rejoint l\'écurie !'); re(); } else B.Audio.sfx('error'); }
  });
  // Observatoire
  BODY.observatory = () => S.challengeBody();
  ACT.observatory = () => S.challengeActs();

  // Dessin des compagnons dans les cartes
  const drawComps = (el) => el.querySelectorAll('canvas[data-comp]').forEach(cv => { const c = B.COMPANIONS.find(x => x.id === cv.dataset.comp); const sp = B.G.compSpr(c); const x = cv.getContext('2d'); x.drawImage(sp.c, 0, 0, cv.width, cv.height); });
  const _show = U.show;
  U.show = function (name, html, h, o) { const el = _show(name, html, h, o); requestAnimationFrame(() => { drawComps(el); S.drawCanvases(el); }); return el; };
  S.drawCanvases = function (el) {
    el.querySelectorAll('canvas[data-hero]').forEach(cv => S.drawPortrait(cv, B.HEROES.find(h => h.id === cv.dataset.hero)));
    el.querySelectorAll('canvas[data-mon]').forEach(cv => { const m = B.MONSTERS[cv.dataset.mon]; const sp = B.G.mon(m, 0); const x = cv.getContext('2d'); const k = Math.min(cv.width / sp.w, cv.height / sp.h) * 0.95; if (cv.dataset.dark) x.filter = 'brightness(0)'; x.drawImage(sp.c, cv.width / 2 - sp.w * k / 2, cv.height / 2 - sp.h * k / 2, sp.w * k, sp.h * k); });
  };

  // ───── Maison d'un survivant ─────
  S.house = function (sid) {
    const P = B.P, s = B.SURVIVORS.find(x => x.id === sid), st = P.survivors[sid];
    st.seen = true; Me().save();
    const line = s.lines[Math.floor(Math.random() * s.lines.length)];
    const q = Me().questOf(sid);
    const qhtml = q ? '<div class="card"><div class="tiny mut">Quête</div><b>' + Me().questText(q.q) + '</b><div style="margin:6px 0">' + U.bar(q.prog / q.need) + '</div><div class="row" style="justify-content:space-between"><span class="small">' + B.fmt(q.prog) + ' / ' + B.fmt(q.need) + '</span><span class="small">Récompense : ' + U.cost(q.q.rw).replace(/ bad/g, '') + '</span></div>' + (q.done ? '<button class="btn main" data-a="claim" style="width:100%;margin-top:8px">🎁 Réclamer</button>' : '') + '</div>' : '<div class="card center mut">' + s.n + ' n\'a plus rien à vous demander. Merci !</div>';
    const bonus = s.bld ? '🏗️ Débloque : ' + B.BUILDINGS.find(b => b.id === s.bld).n : s.st && Object.keys(s.st).length ? '✨ Bonus permanent actif' : '';
    const m = U.modal('<div class="panel col" style="gap:10px"><div class="row"><span style="font-size:46px">' + s.i + '</span><div><h2>' + s.n + '</h2><div class="mut small">' + s.r + '</div><div class="tiny gold">' + bonus + '</div></div></div><div class="card" style="font-style:italic;line-height:1.5">« ' + line + ' »</div>' + qhtml + '<button class="btn" data-a="close">Au revoir</button></div>', {
      claim: () => { const rw = Me().claimQuest(sid); if (rw) { B.Audio.sfx('chest'); U.toast('🎁 ' + U.cost(rw).replace(/ bad/g, '')); Me().checkAch().forEach(a => U.toast('🏆 ' + a.n)); } U.close(m); setTimeout(() => S.house(sid), 200); },
      close: () => U.close(m)
    }, { closeOnBg: true });
  };

  // ───── Héros ─────
  S.heroCard = function (h) {
    const P = B.P, st = Me().heroState(h), own = P.heroes[h.id];
    let right = '';
    if (st === 'own') right = P.hero === h.id ? '<span class="tag good">✔ Choisi</span>' : '<span class="tag">Niv. ' + own.lvl + '</span>';
    let below = '';
    if (st === 'ok') below = '<button class="btn sm ' + (Me().can(h.unlock.cost) ? 'green' : 'off') + '" data-a="hire" data-id="' + h.id + '" style="width:100%;margin-top:8px">Engager · ' + U.cost(h.unlock.cost) + '</button>';
    else if (st !== 'own') below = '<div class="tiny mut" style="margin-top:6px">🔒 ' + (st === 'tav' ? 'Taverne niveau ' + h.unlock.tav : h.unlock.req.biome ? 'Atteindre : ' + B.BIOMES[h.unlock.req.biome].n : 'Vaincre ' + h.unlock.req.boss + ' boss de biome') + ' · ' + U.cost(h.unlock.cost).replace(/ bad/g, '') + '</div>';
    return '<div class="card' + (P.hero === h.id ? ' sel' : '') + (st === 'own' || st === 'ok' ? '' : ' lock') + '" data-a="hero" data-id="' + h.id + '" style="cursor:pointer"><div class="row"><canvas data-hero="' + h.id + '" width="72" height="72" style="position:static;width:56px;height:56px;border-radius:14px;background:radial-gradient(#3a2e50,#1a1426)"></canvas><div style="flex:1;min-width:0"><b>' + h.n + '</b> <span class="mut small">' + h.t + '</span><div class="tiny mut">' + h.d + '</div></div>' + right + '</div>' + below + '</div>';
  };
  S.heroes = function (fromPrep) {
    const re = () => S.heroes(fromPrep);
    U.show('heroes', U.top('Héros') + '<div class="scroll grow" style="padding:0 14px 20px"><div class="col">' + B.HEROES.map(h => S.heroCard(h)).join('') + '</div><div class="tiny mut center" style="margin-top:10px">Les héros se recrutent à la Taverne. Ils gagnent des niveaux (dégâts +3 %, vie +4) en partant en expédition.</div></div>', {
      back: () => fromPrep ? S.prep() : S.village(),
      hero: (t) => S.heroDetail(t.dataset.id, re),
      hire: (t) => S.hire(t.dataset.id, re)
    });
  };
  S.hire = function (id, re) {
    const h = B.HEROES.find(x => x.id === id);
    if (Me().hireHero(h)) { B.P.hero = id; B.Audio.sfx('unlock'); B.vibrate(50); U.toast('🎉 ' + h.n + ' rejoint la compagnie !'); Me().checkAch().forEach(a => U.toast('🏆 ' + a.n)); re(); }
    else B.Audio.sfx('error');
  };
  S.heroDetail = function (id, re) {
    const P = B.P, h = B.HEROES.find(x => x.id === id), own = P.heroes[id], st = Me().heroState(h);
    const w = B.POWERS[h.w];
    const stt = B.computeStats({ hero: id, ws: [], ps: [], meta: {}, curses: [] });
    const m = U.modal('<div class="panel col" style="gap:10px"><div class="row"><canvas data-hero="' + id + '" width="96" height="96" style="position:static;width:80px;height:80px;border-radius:18px;background:radial-gradient(#4a3a62,#1a1426)"></canvas><div><h2>' + h.n + '</h2><div class="mut">' + h.t + '</div>' + (own ? '<div class="tiny">Niveau ' + own.lvl + '/10</div><div style="width:140px;margin-top:3px">' + U.bar(own.lvl >= 10 ? 1 : own.xp / Me().heroXpNeed(own.lvl)) + '</div>' : '') + '</div></div>' +
      '<p class="small">' + h.d + '</p><div class="grid2 small"><span>❤️ Vie ' + stt.hp + '</span><span>👟 Vitesse ' + Math.round(stt.spd) + '</span><span>🎯 Critique ' + Math.round(stt.crit * 100) + ' %</span><span>🛡️ Armure ' + Math.round(stt.armor) + '</span></div>' +
      '<div class="card row">' + U.pwIcon(h.w, 's') + '<div><b>' + w.n + '</b><div class="tiny mut">' + w.d + '</div></div></div>' +
      '<div class="card"><b>✨ ' + h.sp.n + '</b><div class="tiny mut">' + h.sp.d + ' (recharge ' + h.sp.ch + ' s)</div></div>' +
      (st === 'own' ? '<button class="btn main" data-a="sel">' + (P.hero === id ? '✔ Héros choisi' : 'Choisir ' + h.n) + '</button>' : st === 'ok' ? '<button class="btn green" data-a="hire">Engager · ' + U.cost(h.unlock.cost) + '</button>' : '<div class="card center mut">🔒 Pas encore disponible</div>') +
      '<button class="btn ghost" data-a="close">Fermer</button></div>', {
      sel: () => { P.hero = id; Me().save(); U.close(m); re(); },
      hire: () => { U.close(m); S.hire(id, re); },
      close: () => U.close(m)
    }, { closeOnBg: true });
    S.drawCanvases(m);
  };

  // ───── Inventaire ─────
  S.invTab = 'all';
  S.inventory = function (fromPrep) {
    const P = B.P;
    const re = () => S.inventory(fromPrep);
    P.items.forEach(i => delete i.isNew);
    const eq = ['weapon', 'armor', 'jewel'].map(s => { const it = P.items.find(x => x.uid === P.equip[s]); return it ? U.itemCard(it, { a: 'item', eq: true }) : '<div class="card row mut"><span class="ico">' + B.SLOT_ICON[s] + '</span>' + B.SLOT_NAME[s] + ' : vide</div>'; }).join('');
    const list = P.items.filter(i => Object.values(P.equip).indexOf(i.uid) < 0 && (S.invTab === 'all' || i.slot === S.invTab)).sort((a, b) => b.rar - a.rar || Me().itemPower(b) - Me().itemPower(a));
    const tabs = '<div class="tabs">' + [['all', 'Tout'], ['weapon', '🗡️ Armes'], ['armor', '🛡️ Armures'], ['jewel', '💍 Bijoux']].map(t => '<button class="' + (S.invTab === t[0] ? 'on' : '') + '" data-a="tab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    U.show('inv', U.top('Inventaire', '<span class="tag">' + P.items.length + ' objets</span>') + '<div class="scroll grow" style="padding:0 14px 20px"><div class="col"><h3>Équipé</h3>' + eq + '<h3 style="margin-top:6px">Sac</h3>' + tabs + (list.length ? list.map(it => U.itemCard(it, { a: 'item' })).join('') : '<div class="card center mut">Rien ici.</div>') + (list.length > 3 ? '<button class="btn sm red" data-a="salvAll">♻️ Recycler tous les objets communs du sac</button>' : '') + '</div></div>', {
      back: () => fromPrep ? S.prep() : S.village(),
      tab: (t) => { S.invTab = t.dataset.t; re(); },
      item: (t) => S.itemDetail(+t.dataset.uid, re),
      salvAll: () => { if (!B.P.bld.forge) { U.toast('Il faut une Forge pour recycler.'); return; } const l = P.items.filter(i => i.rar === 0 && Object.values(P.equip).indexOf(i.uid) < 0); if (!l.length) return; U.confirm('Recycler ' + l.length + ' objets communs ?', () => { const tot = {}; l.forEach(i => { const g = Me().salvage(i); for (const k in g) tot[k] = (tot[k] || 0) + g[k]; }); U.toast('♻️ ' + U.cost(tot).replace(/ bad/g, '')); re(); }, 'Recycler'); }
    });
  };
  S.itemDetail = function (uid, re, atForge) {
    const P = B.P, it = P.items.find(x => x.uid === uid); if (!it) return;
    const isEq = P.equip[it.slot] === uid;
    const cur = P.items.find(x => x.uid === P.equip[it.slot]);
    const forge = P.bld.forge;
    const upC = Me().upCost(it), canUp = forge && it.up < Me().upMax();
    const rr = { essence: 10 + it.rar * 10 + Math.round(it.tier * 10) };
    const m = U.modal('<div class="col" style="gap:10px">' + U.itemCard(it, { eq: isEq }) + (cur && !isEq ? '<div class="tiny mut center">Actuellement équipé : ' + Me().itemName(cur) + ' (puissance ' + Me().itemPower(cur) + ')</div>' : '') +
      '<div class="panel col" style="gap:8px">' +
      '<button class="btn main" data-a="eq">' + (isEq ? 'Retirer' : 'Équiper') + '</button>' +
      (forge ? '<button class="btn ' + (canUp && Me().can(upC) ? 'green' : 'off') + '" data-a="up">⚒️ Améliorer +' + (it.up + 1) + ' · ' + U.cost(upC) + '</button>' : '<div class="tiny mut center">Construisez la Forge pour améliorer.</div>') +
      (forge >= 3 ? '<button class="btn ' + (Me().can(rr) ? '' : 'off') + '" data-a="reroll">🎲 Relancer une ligne · ' + U.cost(rr) + '</button>' : '') +
      (forge >= 5 && it.rar === 3 ? '<button class="btn ' + (Me().can(Me().transmuteCost(it)) ? 'red' : 'off') + '" data-a="trans">🟥 Transmuter en mythique · ' + U.cost(Me().transmuteCost(it)) + '</button>' : '') +
      (forge && !isEq ? '<button class="btn ghost" data-a="salv">♻️ Recycler</button>' : '') +
      '<button class="btn ghost" data-a="close">Fermer</button></div></div>', {
      eq: () => { P.equip[it.slot] = isEq ? null : uid; Me().save(); B.Audio.sfx('pick'); U.close(m); re(); },
      up: () => { if (!canUp || !Me().pay(upC)) { B.Audio.sfx('error'); return; } it.up++; P.st.upgrades++; P.st.maxUpgrade = Math.max(P.st.maxUpgrade, it.up); B.Audio.sfx('build'); Me().checkAch().forEach(a => U.toast('🏆 ' + a.n)); Me().save(); U.close(m); setTimeout(() => S.itemDetail(uid, re, atForge), 200); re(); },
      reroll: () => { if (!Me().pay(rr)) { B.Audio.sfx('error'); return; } const r = B.rng(Date.now()); const i = r.int(0, it.lines.length - 1); const pool = B.AFFIX[it.slot].filter(a => !it.lines.some(l => l[0] === a[0])); const a = r.pick(pool.length ? pool : B.AFFIX[it.slot]); it.lines[i] = [a[0], +(a[1] + (a[2] - a[1]) * r()).toFixed(4)]; B.Audio.sfx('rune'); Me().save(); U.close(m); setTimeout(() => S.itemDetail(uid, re, atForge), 200); re(); },
      trans: () => { if (!Me().pay(Me().transmuteCost(it))) { B.Audio.sfx('error'); return; } it.rar = 4; const r = B.rng(Date.now()); const pool = B.AFFIX[it.slot].filter(a => !it.lines.some(l => l[0] === a[0])); const a = r.pick(pool); it.lines.push([a[0], a[2]]); P.st.mythic++; B.Audio.sfx('legendary'); S.legendFlash(it); Me().checkAch().forEach(x => U.toast('🏆 ' + x.n)); Me().save(); U.close(m); re(); },
      salv: () => U.confirm('Recycler cet objet ?', () => { const g = Me().salvage(it); U.toast('♻️ ' + U.cost(g).replace(/ bad/g, '')); U.close(m); re(); }, 'Recycler'),
      close: () => U.close(m)
    }, { closeOnBg: true });
  };

  // ───── Défis (observatoire) ─────
  S.challengeBody = function () {
    const P = B.P, ob = P.bld.observatory;
    if (!ob) return '<div class="card center mut">🔭 Sauvez Orion l\'astronome (Ruines Englouties) et construisez l\'Observatoire pour débloquer les défis, le mode Infini et la Brume Profonde.</div>';
    const card = (ch, done, lock) => '<div class="card' + (lock ? ' lock' : '') + '"><div class="row" style="justify-content:space-between"><h3>' + (ch.weekly ? '📅 Défi de la semaine' : '☀️ Défi du jour') + '</h3>' + (done ? '<span class="tag good">✔ Réussi</span>' : '') + '</div>' +
      '<div class="small" style="margin:6px 0">' + B.HEROES.find(h => h.id === ch.hero).n + ' · ' + B.BIOMES[ch.biome].n + '</div>' + ch.rules.map(r => { const R = B.RULES.find(x => x.id === r); return '<div class="small">' + R.i + ' <b>' + R.n + '</b> — <span class="mut">' + R.d + '</span></div>'; }).join('') +
      '<div class="small" style="margin-top:6px">Récompense : ' + U.cost(ch.reward).replace(/ bad/g, '') + '</div>' + (lock ? '<div class="tiny mut">Observatoire niveau 2</div>' : '<button class="btn ' + (done ? '' : 'main') + '" data-a="chal" data-w="' + (ch.weekly ? 1 : 0) + '" style="width:100%;margin-top:8px">' + (done ? 'Rejouer (sans récompense)' : 'Relever le défi') + '</button>') + '</div>';
    const d = Me().challenge(false), w = Me().challenge(true);
    return '<div class="col">' + card(d, P.daily.key === d.key && P.daily.done) + card(w, P.weekly.key === w.key && P.weekly.done, ob < 2) +
      '<div class="card' + (ob < 2 ? ' lock' : '') + '"><h3>♾️ Mode Infini</h3><div class="small mut">Survivez le plus longtemps possible : les biomes s\'enchaînent et la brume s\'épaissit. Record : <b class="gold">' + B.fmtTime(P.st.endlessBest) + '</b></div>' + (ob < 2 ? '<div class="tiny mut">Observatoire niveau 2</div>' : '<button class="btn" data-a="endless" style="width:100%;margin-top:8px">Lancer le mode Infini</button>') + '</div>' +
      '<div class="card' + (ob < 3 || !P.deep ? ' lock' : '') + '"><h3>🌫️ Brume Profonde</h3><div class="small mut">20 niveaux de difficulté après la victoire finale. Niveau débloqué : <b>' + P.deep + '</b>. Choisissez-le dans l\'écran d\'expédition.</div>' + (ob < 3 ? '<div class="tiny mut">Observatoire niveau 3</div>' : !P.deep ? '<div class="tiny mut">Vaincre la Brume Incarnée d\'abord</div>' : '') + '</div></div>';
  };
  S.challengeActs = function () {
    return {
      chal: (t) => { const ch = Me().challenge(t.dataset.w === '1'); Gm().startRun({ mode: ch.weekly ? 'weekly' : 'daily', hero: ch.hero, biome: ch.biome, rules: ch.rules, seed: ch.seed, challenge: ch }); },
      endless: () => Gm().startRun({ mode: 'endless', hero: B.P.hero, biome: 0 })
    };
  };
  S.challenges = function () {
    U.show('chal', U.top('Défis') + '<div class="scroll grow" style="padding:0 14px 20px">' + S.challengeBody() + '</div>', Object.assign({ back: () => S.village() }, S.challengeActs()));
  };

  // ───── Encyclopédie ─────
  S.encTab = 0;
  S.ency = function () {
    const P = B.P;
    const tabs = ['🐺 Bestiaire', '✨ Pouvoirs', '🧙 Héros', '💍 Objets', '📖 Histoire', '🗺️ Biomes'];
    let body = '';
    const t = S.encTab;
    if (t === 0) {
      const all = B.MONSTER_LIST.concat(B.BOSS_LIST);
      body = '<div class="small mut">' + Object.keys(P.seen).length + ' / ' + all.length + ' créatures rencontrées</div><div class="grid2">' + all.map(m => { const seen = P.seen[m.id]; return '<div class="card" style="padding:8px"><div class="row" style="gap:8px"><canvas data-mon="' + m.id + '" ' + (seen ? '' : 'data-dark="1"') + ' width="80" height="80" style="position:static;width:52px;height:52px;border-radius:12px;background:radial-gradient(#3a2e50,#120d1c);flex:none"></canvas><div style="min-width:0"><b class="small">' + (seen ? m.n : '???') + '</b>' + (m.kind === 'boss' ? ' <span class="tag" style="color:#ff8a6a">' + (m.guard ? 'Gardien' : 'Boss') + '</span>' : '') + '<div class="tiny mut">' + (m.b >= 0 ? B.BIOMES[m.b].n : 'Partout') + '</div><div class="tiny">' + (seen ? '💀 ' + B.fmt((m.kind === 'boss' ? P.bossKills[m.id] : P.kills[m.id]) || 0) : '') + '</div></div></div>' + (seen ? '<div class="tiny mut" style="margin-top:4px">' + m.d + '</div>' : '') + '</div>'; }).join('') + '</div>';
    } else if (t === 1) {
      const all = Object.values(B.POWERS);
      body = '<div class="small mut">' + Object.keys(P.powersSeen).length + ' / ' + all.length + ' pouvoirs découverts · ' + Object.keys(P.evos).length + ' / ' + B.EVOS.length + ' évolutions</div>' +
        ['w', 'p', 'e'].map(k => '<h3 style="margin-top:8px">' + { w: 'Armes', p: 'Passifs', e: 'Évolutions' }[k] + '</h3><div class="col">' + all.filter(p => p.kind === k).map(p => { const seen = P.powersSeen[p.id] || P.evos[p.id]; return '<div class="card row' + (seen ? '' : ' lock') + '" style="gap:10px">' + (seen ? U.pwIcon(p.id, 's') : '<span class="ico s">?</span>') + '<div style="min-width:0"><b class="small">' + (seen ? p.n : '???') + '</b> ' + (seen ? U.elemTags(p.e) : '') + '<div class="tiny mut">' + (seen ? p.d : '') + (seen && k === 'e' ? '<br>= ' + B.POWERS[p.from].n + ' (niv. 5) + ' + B.POWERS[p.with].n : '') + '</div></div></div>'; }).join('') + '</div>').join('') +
        '<h3 style="margin-top:8px">Synergies d\'éléments</h3>' + Object.keys(B.SYNERGY).map(e => '<div class="card small"><b style="color:' + B.ELEM[e].c + '">' + B.ELEM[e].i + ' ' + B.elemName(e) + '</b><br>' + B.SYNERGY[e].map(s => s.n + ' : ' + s.d).join('<br>') + '</div>').join('');
    } else if (t === 2) {
      body = '<div class="col">' + B.HEROES.map(h => '<div class="card row"><canvas data-hero="' + h.id + '" width="72" height="72" style="position:static;width:52px;height:52px;border-radius:12px;background:radial-gradient(#3a2e50,#1a1426)"></canvas><div><b>' + h.n + '</b> <span class="small mut">' + h.t + '</span><div class="tiny mut">' + h.d + '</div><div class="tiny">✨ ' + h.sp.n + ' · Victoires finales : ' + (P.heroWins[h.id] || 0) + '</div></div></div>').join('') + '</div>' +
        '<h3 style="margin-top:8px">Compagnons</h3><div class="col">' + B.COMPANIONS.map(c => '<div class="card small">' + c.i + ' <b>' + c.n + '</b> — <span class="mut">' + c.d + '</span></div>').join('') + '</div>';
    } else if (t === 3) {
      body = '<div class="small mut">Objets uniques trouvés : ' + Object.keys(P.uniques).length + ' / ' + B.UNIQUES.length + '</div><div class="col">' + B.UNIQUES.map(u => { const f = P.uniques[u.id]; return '<div class="card r3 rb' + (f ? '' : ' lock') + '"><b class="rt">' + (f ? u.n : '???') + '</b> <span class="tiny mut">' + B.SLOT_NAME[u.slot] + '</span><div class="tiny">' + (f ? '★ ' + u.d : 'Un objet légendaire encore inconnu.') + '</div></div>'; }).join('') + '</div>' +
        '<h3 style="margin-top:8px">Raretés</h3><div class="col small">' + B.RARITY.map((r, i) => '<div><b style="color:' + r.c + '">' + r.n + '</b> — ' + ['1 ligne de bonus', '2 lignes', '3 lignes', '3 lignes + un effet unique', '4 lignes + effet unique renforcé (forge niv. 5)'][i] + '</div>').join('') + '</div>';
    } else if (t === 4) {
      body = '<div class="col">' + B.LORE.map(l => { const u = P.lore[l.id]; return '<div class="card' + (u ? '' : ' lock') + '"><b class="gold">' + (u ? l.n : '???') + '</b><p class="small" style="line-height:1.5;margin-top:4px">' + (u ? l.t : 'Page encore perdue dans la brume…') + '</p></div>'; }).join('') + '</div>';
    } else {
      body = '<div class="col">' + B.BIOMES.map((b, i) => '<div class="card' + (i > P.biome ? ' lock' : '') + '"><div style="height:8px;border-radius:4px;background:linear-gradient(90deg,' + b.pal.g2 + ',' + b.pal.acc + ')"></div><h3 style="margin-top:6px">' + (i > P.biome ? '🔒 ' : '') + b.n + (P.cleared[i] ? ' ✔' : '') + '</h3><p class="small mut">' + b.d + '</p><div class="tiny">Gardien : ' + (P.seen[b.guard] ? B.MONSTERS[b.guard].n : '???') + ' · Boss : ' + (P.seen[b.boss] ? B.MONSTERS[b.boss].n : '???') + '</div></div>').join('') + '</div>';
    }
    U.show('ency', U.top('Encyclopédie') + '<div style="padding:0 14px 8px"><div class="tabs">' + tabs.map((x, i) => '<button class="' + (i === t ? 'on' : '') + '" data-a="tab" data-i="' + i + '">' + x + '</button>').join('') + '</div></div><div class="scroll grow" style="padding:0 14px 24px">' + body + '</div>', {
      back: () => S.village(), tab: (el) => { S.encTab = +el.dataset.i; S.ency(); }
    });
  };

  // ───── Succès et statistiques ─────
  S.achievements = function () {
    const P = B.P, st = P.st;
    const got = Object.keys(P.ach).length;
    const stats = [['Expéditions', st.runs], ['Victoires', st.runsWon], ['Monstres vaincus', B.fmt(st.kills)], ['Élites vaincues', st.elites], ['Meilleur niveau', st.bestLvl], ['Survivants sauvés', Object.keys(P.survivors).length + '/' + B.SURVIVORS.length], ['Braises gagnées', B.fmt(st.braiseTotal)], ['Talents achetés', st.talentRanks], ['Objets trouvés', st.items], ['Record Infini', B.fmtTime(st.endlessBest)], ['Brume Profonde vaincue', st.deepWon], ['Défis réussis', st.challenges], ['Temps de jeu', B.fmtTime(P.play)]];
    U.show('ach', U.top('Succès', '<span class="tag">' + got + '/' + B.ACHIEVEMENTS.length + '</span>') + '<div class="scroll grow" style="padding:0 14px 24px"><div class="panel grid2 small" style="gap:6px;margin-bottom:12px">' + stats.map(s => '<span class="mut">' + s[0] + '</span><b style="text-align:right">' + s[1] + '</b>').join('') + '</div><div class="col">' +
      B.ACHIEVEMENTS.map(a => { const g = P.ach[a.id]; return '<div class="card row' + (g ? ' sel' : ' lock') + '" style="gap:10px"><span class="ico s">' + (g ? a.i : '🔒') + '</span><div style="flex:1"><b class="small">' + a.n + '</b><div class="tiny mut">' + a.d + '</div></div><span class="tiny">' + U.cost(a.rw).replace(/ bad/g, '') + '</span></div>'; }).join('') + '</div></div>', { back: () => S.village() });
  };
})(this.B || (this.B = {}));
