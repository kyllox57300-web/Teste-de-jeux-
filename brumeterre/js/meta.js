// Brumeterre — progression permanente (profil, sauvegarde, économie, objets, quêtes, succès)
(function (B) {
  'use strict';
  const SAVE_KEY = 'brumeterre_save_v1';
  const M = B.Meta = {};

  M.newProfile = function () {
    return {
      v: 1, created: Date.now(), play: 0,
      res: { braise: 0, bois: 0, essence: 0, herbe: 0, aube: 0 },
      bld: { fanal: 1, forge: 0, academy: 0, tavern: 0, altar: 0, garden: 0, stable: 0, observatory: 0 },
      survivors: {}, heroes: { aldric: { lvl: 1, xp: 0 } }, hero: 'aldric',
      comps: { firefly: { lvl: 1, xp: 0 } }, comp: 'firefly',
      talents: {}, items: [], equip: { weapon: null, armor: null, jewel: null }, iuid: 1,
      bless: [], potions: {}, potSel: [],
      biome: 0, bossKills: {}, cleared: {}, deep: 0, deepSel: 0,
      seen: {}, kills: {}, powersSeen: {}, evos: {}, uniques: {}, lore: { l_start: 1 },
      ach: {}, heroWins: {}, qstate: {},
      st: { runs: 0, runsWon: 0, kills: 0, elites: 0, bestLvl: 0, legendary: 0, mythic: 0, deepWon: 0, endlessBest: 0, challenges: 0, noHit: 0, pacts: 0, braiseTotal: 0, talentRanks: 0, maxUpgrade: 0, maxGold: 0, quests: 0, fastBoss: 0, herbs: 0, potionsUsed: 0, items: 0, upgrades: 0, buys: 0, events: 0, blessed: 0, bestRunTime: 0 },
      daily: { key: 0, done: false }, weekly: { key: 0, done: false },
      settings: { sound: 0.8, music: 0.6, vib: true, quality: 'auto', joy: 'float', hand: 'r', lang: 'fr', nums: true, shake: true, autoSp: false },
      tuto: 0, run: null, news: []
    };
  };

  // ───── Sauvegarde ─────
  M.store = (typeof localStorage !== 'undefined') ? localStorage : null;
  M.load = function () {
    let P = null;
    if (M.store) {
      for (const k of [SAVE_KEY, SAVE_KEY + '_bak']) {
        try { const s = M.store.getItem(k); if (s) { P = JSON.parse(s); if (P && P.v) break; } } catch (e) { P = null; }
      }
    }
    P = M.migrate(P || M.newProfile());
    B.P = P;
    return P;
  };
  M.migrate = function (P) {
    const d = M.newProfile();
    for (const k in d) if (P[k] === undefined) P[k] = d[k];
    for (const k in d.st) if (P.st[k] === undefined) P.st[k] = 0;
    for (const k in d.res) if (P.res[k] === undefined) P.res[k] = 0;
    for (const k in d.bld) if (P.bld[k] === undefined) P.bld[k] = d.bld[k];
    for (const k in d.settings) if (P.settings[k] === undefined) P.settings[k] = d.settings[k];
    return P;
  };
  let saveT = null, lastSave = 0;
  M.save = function (now) {
    if (!M.store || !B.P) return;
    if (!now) { if (saveT) return; saveT = setTimeout(() => { saveT = null; M.save(true); }, 400); return; }
    if (saveT) { clearTimeout(saveT); saveT = null; }
    try {
      const s = JSON.stringify(B.P);
      M.store.setItem(SAVE_KEY, s);
      if (Date.now() - lastSave > 20000) { M.store.setItem(SAVE_KEY + '_bak', s); lastSave = Date.now(); }
    } catch (e) { /* stockage plein : on ignore */ }
  };
  M.exportSave = function () { return 'BRUME1:' + btoa(unescape(encodeURIComponent(JSON.stringify(B.P)))); };
  M.importSave = function (txt) {
    txt = (txt || '').trim();
    if (txt.startsWith('BRUME1:')) txt = txt.slice(7);
    const P = JSON.parse(decodeURIComponent(escape(atob(txt))));
    if (!P || !P.v || !P.res) throw new Error('bad');
    B.P = M.migrate(P); M.save(true);
    return B.P;
  };
  M.wipe = function () { B.P = M.newProfile(); if (M.store) { M.store.removeItem(SAVE_KEY); M.store.removeItem(SAVE_KEY + '_bak'); } M.save(true); return B.P; };

  // ───── Ressources ─────
  M.RES = { braise: { i: '🔥', n: 'Braises' }, bois: { i: '🪵', n: 'Bois-de-lune' }, essence: { i: '💧', n: 'Essences' }, herbe: { i: '🌿', n: 'Herbes' }, aube: { i: '✨', n: 'Éclats d\'Aube' }, gold: { i: '🪙', n: 'Or' } };
  M.can = function (cost) { if (!cost) return true; for (const k in cost) if ((B.P.res[k] || 0) < cost[k]) return false; return true; };
  M.pay = function (cost) { if (!M.can(cost)) return false; for (const k in cost) B.P.res[k] -= cost[k]; M.save(); return true; };
  M.gain = function (res) { for (const k in res) { B.P.res[k] = (B.P.res[k] || 0) + Math.floor(res[k]); if (k === 'braise') B.P.st.braiseTotal += Math.floor(res[k]); } };
  M.costStr = function (cost) { return Object.keys(cost).map(k => M.RES[k].i + ' ' + B.fmt(cost[k])).join('  '); };

  // ───── Talents ─────
  M.tRank = (id) => B.P.talents[id] || 0;
  M.flagSum = function (flag) { let s = 0; for (const t of B.TALENTS) if (t.flag === flag) s += M.tRank(t.id); return s; };
  M.branchPts = function (br) { let s = 0; for (const t of B.TALENTS) if (t.br === br) s += M.tRank(t.id); return s; };
  M.talentState = function (t) {
    const r = M.tRank(t.id);
    if (r >= t.max) return 'max';
    if (B.P.bld.academy < t.tier) return 'acad';
    if (M.branchPts(t.br) < (t.tier - 1) * 3) return 'pts';
    return 'ok';
  };
  M.buyTalent = function (t) {
    if (M.talentState(t) !== 'ok') return false;
    const c = B.talentCost(t, M.tRank(t.id));
    if (!M.pay({ essence: c })) return false;
    B.P.talents[t.id] = M.tRank(t.id) + 1; B.P.st.talentRanks++;
    M.save(); return true;
  };

  // ───── Bâtiments ─────
  M.bldMax = function (b) { if (b.id === 'fanal') return b.max; return Math.min(b.max, Math.ceil(B.P.bld.fanal / 2) + 1); };
  M.bldCost = function (b) { const l = B.P.bld[b.id]; return b.cost[b.id === 'fanal' ? l : l] || null; };
  M.bldState = function (b) {
    const l = B.P.bld[b.id];
    if (b.need && !B.P.survivors[b.need]) return 'need';
    if (l >= b.max) return 'max';
    if (l >= M.bldMax(b)) return 'fanal';
    return 'ok';
  };
  M.build = function (b) {
    if (M.bldState(b) !== 'ok') return false;
    const c = M.bldCost(b); if (!c || !M.pay(c)) return false;
    B.P.bld[b.id]++; M.save(); return true;
  };

  // ───── Héros ─────
  M.heroState = function (h) {
    if (B.P.heroes[h.id]) return 'own';
    const u = h.unlock;
    if (u.tav > B.P.bld.tavern) return 'tav';
    if (u.req && u.req.biome && B.P.biome < u.req.biome) return 'req';
    if (u.req && u.req.boss && Object.keys(B.P.cleared).length < u.req.boss) return 'req';
    return 'ok';
  };
  M.hireHero = function (h) { if (M.heroState(h) !== 'ok' || !M.pay(h.unlock.cost)) return false; B.P.heroes[h.id] = { lvl: 1, xp: 0 }; M.save(); return true; };
  M.heroXpNeed = (l) => 120 + l * l * 90;

  // ───── Compagnons ─────
  M.compMax = () => Math.max(2, B.P.bld.stable * 2);
  M.compXpNeed = (l) => 80 + l * l * 60;
  M.buyComp = function (c) { if (B.P.comps[c.id] || !B.P.bld.stable || !M.pay(c.cost)) return false; B.P.comps[c.id] = { lvl: 1, xp: 0 }; M.save(); return true; };

  // ───── Objets ─────
  M.rollRarity = function (rng, luck, minR) {
    const w = [60, 28, 10, 2].map((v, i) => v * (i ? 1 + luck * i * 1.2 : 1));
    let tot = 0; w.forEach(v => tot += v); let x = rng() * tot, r = 0;
    for (let i = 0; i < 4; i++) { x -= w[i]; if (x <= 0) { r = i; break; } }
    return Math.max(r, minR || 0);
  };
  M.makeItem = function (rng, tier, rar, slot) {
    slot = slot || rng.pick(['weapon', 'armor', 'jewel']);
    const base = rng.pick(B.ITEM_BASES[slot]);
    const nl = [1, 2, 3, 3, 4][rar];
    const pool = B.AFFIX[slot].slice(); rng.shuffle(pool);
    const lines = [];
    for (let i = 0; i < nl && i < pool.length; i++) { const a = pool[i]; lines.push([a[0], +(a[1] + (a[2] - a[1]) * rng()).toFixed(4)]); }
    const it = { uid: B.P.iuid++, slot: slot, base: base, rar: rar, tier: tier, up: 0, lines: lines };
    if (rar >= 3) { const us = B.UNIQUES.filter(u => u.slot === slot); it.u = rng.pick(us).id; }
    return it;
  };
  M.itemMul = (it) => (1 + it.tier * 0.35) * (1 + it.up * 0.08) * (it.rar === 4 ? 1.3 : 1);
  M.itemName = function (it) {
    if (it.u) { const u = B.UNIQUES.find(x => x.id === it.u); return u.n; }
    const adj = ['', ' fine', ' runique', ' ancestrale'][Math.min(3, it.rar)] || '';
    const fem = /^(Épée|Hache|Dague|Lance|Tunique|Cotte|Robe|Cuirasse|Brigandine|Amulette|Broche)$/.test(it.base);
    const m = { ' fine': fem ? ' fine' : ' fin', ' runique': ' runique', ' ancestrale': fem ? ' ancestrale' : ' ancestral' }[adj] || '';
    return it.base + m;
  };
  M.lineText = function (it, l) {
    const a = B.AFFIX[it.slot].find(x => x[0] === l[0]); if (!a) return '';
    let v = l[1] * M.itemMul(it);
    const pct = a[3].indexOf('%') >= 0 && l[0] !== 'luck';
    const s = pct ? Math.round(v * 1000) / 10 : (l[0] === 'luck' ? Math.round(v * 100) : Math.round(v * 10) / 10);
    return a[3].replace('{v}', String(s).replace('.', ','));
  };
  M.itemStats = function (it, out) {
    const mul = M.itemMul(it);
    for (const l of it.lines) out[l[0]] = (out[l[0]] || 0) + l[1] * mul;
    return out;
  };
  M.itemPower = function (it) { return Math.round((it.lines.length * 10 + (it.u ? 25 : 0)) * M.itemMul(it)); };
  M.upCost = (it) => ({ braise: Math.round((60 + it.up * it.up * 45) * (1 + it.tier * 0.6) * (1 + it.rar * 0.25)), bois: Math.round((2 + it.up * 2) * (1 + it.tier * 0.4)) });
  M.upMax = () => [0, 3, 5, 7, 10, 10][B.P.bld.forge];
  M.salvage = function (it) {
    const g = { bois: Math.round((2 + it.rar * 3 + it.up) * (1 + it.tier * 0.4)), braise: Math.round((20 + it.rar * 40) * (1 + it.tier * 0.5)) };
    B.P.items = B.P.items.filter(x => x.uid !== it.uid);
    for (const s in B.P.equip) if (B.P.equip[s] === it.uid) B.P.equip[s] = null;
    M.gain(g); M.save(); return g;
  };
  M.transmuteCost = (it) => ({ aube: 5, essence: 150, braise: 5000 });

  // ───── Statistiques de départ d'une expédition ─────
  M.runMeta = function (heroId, opts) {
    const P = B.P; opts = opts || {};
    const st = {}; const flags = {};
    const add = (o, k) => { for (const s in o) st[s] = (st[s] || 0) + o[s] * (k || 1); };
    for (const t of B.TALENTS) { const r = M.tRank(t.id); if (!r) continue; if (t.st) add(t.st, r); if (t.flag) flags[t.flag] = (flags[t.flag] || 0) + r; }
    for (const s in P.equip) {
      const it = P.items.find(x => x.uid === P.equip[s]); if (!it) continue;
      M.itemStats(it, st);
      if (it.u) { const u = B.UNIQUES.find(x => x.id === it.u); if (u.st) add(u.st, it.rar === 4 ? 1.3 : 1); if (u.flag) flags['u_' + u.flag] = 1; }
    }
    for (const id in P.survivors) { const s = B.SURVIVORS.find(x => x.id === id); if (s && s.st) { for (const k in s.st) { if (k === 'shop' || k === 'mapSee' || k === 'boisMul') flags[k] = (flags[k] || 0) + s.st[k]; else st[k] = (st[k] || 0) + s.st[k]; } } }
    const h = P.heroes[heroId]; if (h) { st.dmg = (st.dmg || 0) + (h.lvl - 1) * 0.03; st.hp = (st.hp || 0) + (h.lvl - 1) * 4;
      if (h.lvl >= 3) flags.spDmg = 0.25; if (h.lvl >= 6) st.spCharge = (st.spCharge || 0) + 0.15; if (h.lvl >= 10) flags.startLvl = (flags.startLvl || 0) + 1; }
    if (!opts.noBless) for (const id of P.bless) { const b = B.BLESSINGS.find(x => x.id === id); if (!b) continue; if (b.st) add(b.st); if (b.flag) flags[b.flag] = 1; }
    // compagnon
    const cid = opts.comp !== undefined ? opts.comp : P.comp;
    let comp = null;
    if (cid && P.comps[cid]) {
      const lv = P.comps[cid].lvl; comp = { id: cid, lvl: lv };
      const cm = 1 + M.flagSum('compDmg') * 0.1;
      switch (cid) {
        case 'firefly': if (lv >= 4) st.light = (st.light || 0) + 0.1; break;
        case 'fox': if (lv >= 8) st.gold = (st.gold || 0) + 0.15; break;
        case 'owl': st.crit = (st.crit || 0) + 0.04; if (lv >= 4) st.elite = (st.elite || 0) + 0.1; if (lv >= 8) flags.mapSee = 1; break;
        case 'salamander': if (lv >= 4) st.burnPow = (st.burnPow || 0) + 0.15; break;
        case 'turtle': st.armor = (st.armor || 0) + 2; break;
        case 'cat': st.dodge = (st.dodge || 0) + 0.04; if (lv >= 4) st.luck = (st.luck || 0) + 0.1; break;
        case 'drake': if (lv >= 4) st.fireDmg = (st.fireDmg || 0) + 0.1; break;
      }
      comp.pw = cm;
    }
    if (flags.calm) st.dmgIn = flags.calm;
    return { st: st, flags: flags, comp: comp };
  };

  // ───── Quêtes des survivants ─────
  const QC = {
    elite: P => P.st.elites, items: P => P.st.items, upgrade: P => P.st.upgrades, runs: P => P.st.runs, herbs: P => P.st.herbs,
    potions: P => P.st.potionsUsed, blessed: P => P.st.blessed, runsWon: P => P.st.runsWon, noHit: P => P.st.noHit, daily: P => P.st.challenges,
    buy: P => P.st.buys, events: P => P.st.events, kills: P => P.st.kills,
    kill: (P, q) => P.kills[q.m] || 0, boss: (P, q) => P.bossKills[q.id] || 0
  };
  const QA = {
    heroes: P => Object.keys(P.heroes).length, talents: P => P.st.talentRanks, evo: P => Object.keys(P.evos).length,
    clear: (P, q) => P.cleared[q.b] ? 1 : 0, compLvl: P => Math.max(0, ...Object.values(P.comps).map(c => c.lvl)), comps: P => Object.keys(P.comps).length,
    gold: P => P.st.maxGold, endless: P => P.st.endlessBest, fanal: P => P.bld.fanal, buildings: P => Object.values(P.bld).reduce((a, b) => a + b, 0), deep: P => P.st.deepWon
  };
  M.questOf = function (sid) {
    const s = B.SURVIVORS.find(x => x.id === sid); const st = B.P.survivors[sid]; if (!s || !st) return null;
    if (st.qi >= s.q.length) return null;
    const q = s.q[st.qi];
    const need = q.n || 1;
    let prog;
    if (QC[q.k]) prog = QC[q.k](B.P, q) - (st.qb || 0);
    else prog = QA[q.k](B.P, q);
    return { q: q, prog: Math.max(0, Math.min(need, prog)), need: need, done: prog >= need };
  };
  M.questText = function (q) {
    const n = q.n || 1;
    switch (q.k) {
      case 'elite': return 'Vaincre ' + n + ' élites';
      case 'items': return 'Trouver ' + n + ' objets';
      case 'upgrade': return 'Améliorer ' + n + ' fois un objet à la forge';
      case 'runs': return 'Partir ' + n + ' fois en expédition';
      case 'heroes': return 'Avoir ' + n + ' héros';
      case 'talents': return 'Acheter ' + n + ' niveaux de talents';
      case 'evo': return 'Découvrir ' + n + ' évolutions';
      case 'herbs': return 'Récolter ' + n + ' herbes';
      case 'potions': return 'Boire ' + n + ' potions';
      case 'kill': return 'Vaincre ' + n + ' × ' + B.MONSTERS[q.m].n;
      case 'clear': return 'Vaincre le boss : ' + B.MONSTERS[B.BIOMES[q.b].boss].n;
      case 'boss': return 'Vaincre ' + B.MONSTERS[q.id].n;
      case 'blessed': return 'Partir ' + n + ' fois avec une bénédiction';
      case 'compLvl': return 'Un compagnon au niveau ' + n;
      case 'comps': return 'Avoir ' + n + ' compagnons';
      case 'runsWon': return 'Gagner ' + n + ' expéditions';
      case 'noHit': return 'Gagner un combat sans être touché';
      case 'gold': return 'Avoir ' + n + ' pièces d\'or en expédition';
      case 'daily': return 'Réussir ' + n + ' défis';
      case 'endless': return 'Survivre ' + Math.round(n / 60) + ' min en mode Infini';
      case 'buy': return 'Acheter ' + n + ' fois chez les marchands';
      case 'events': return 'Vivre ' + n + ' événements mystères';
      case 'fanal': return 'Grand Fanal niveau ' + n;
      case 'buildings': return 'Total des niveaux de bâtiments : ' + n;
      case 'kills': return 'Vaincre ' + B.fmt(n) + ' monstres';
      case 'deep': return 'Vaincre la Brume Profonde ' + n;
    }
    return '?';
  };
  M.startQuest = function (sid) {
    const s = B.SURVIVORS.find(x => x.id === sid); const st = B.P.survivors[sid];
    if (!s || !st || st.qi >= s.q.length) return;
    const q = s.q[st.qi]; st.qb = QC[q.k] ? QC[q.k](B.P, q) : 0;
  };
  M.claimQuest = function (sid) {
    const r = M.questOf(sid); if (!r || !r.done) return null;
    M.gain(r.q.rw); B.P.st.quests++;
    B.P.survivors[sid].qi++; M.startQuest(sid); M.save();
    return r.q.rw;
  };
  M.rescue = function (sid) {
    if (B.P.survivors[sid]) return false;
    B.P.survivors[sid] = { at: Date.now(), qi: 0, qb: 0, seen: false };
    M.startQuest(sid);
    B.P.news.push({ k: 'surv', id: sid });
    if (Object.keys(B.P.survivors).length >= 3) B.P.lore.l_village = 1;
    M.save(); return true;
  };
  M.nextSurvivor = function (biome, exclude) {
    exclude = exclude || [];
    return B.SURVIVORS.find(s => !B.P.survivors[s.id] && s.b <= biome && exclude.indexOf(s.id) < 0) || null;
  };

  // ───── Succès ─────
  M.checkAch = function () {
    const got = [];
    for (const a of B.ACHIEVEMENTS) {
      if (B.P.ach[a.id]) continue;
      let ok = false; try { ok = a.test(B.P); } catch (e) { ok = false; }
      if (ok) { B.P.ach[a.id] = Date.now(); M.gain(a.rw); got.push(a); }
    }
    if (got.length) M.save();
    return got;
  };

  // ───── Défis ─────
  M.challenge = function (weekly) {
    const key = weekly ? B.weekKey() : B.dayKey();
    const r = B.rng(B.hashStr((weekly ? 'W' : 'D') + key));
    const heroes = B.HEROES.filter(h => B.P.heroes[h.id]);
    const hero = r.pick(heroes.length ? heroes : [B.HEROES[0]]).id;
    const maxB = Math.max(0, Math.min(4, B.P.biome));
    const biome = weekly ? maxB : r.int(0, maxB);
    const rules = r.shuffle(B.RULES.slice()).slice(0, weekly ? 3 : 2).map(x => x.id);
    return { key: key, weekly: !!weekly, hero: hero, biome: biome, rules: rules, seed: B.hashStr('S' + key + (weekly ? 'w' : 'd')), reward: weekly ? { aube: 3, essence: 60 + biome * 30, braise: 2000 } : { aube: 1, essence: 20 + biome * 10, braise: 600 } };
  };
})(this.B || (this.B = {}));
