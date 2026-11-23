// Brumeterre — une expédition : carte, cartes de pouvoirs, événements, boutique, récompenses (sans DOM)
(function (B) {
  'use strict';
  const M = () => B.Meta;
  const RAR_LV = [1, 2, 3, 4]; // niveaux donnés par une carte selon sa rareté

  class Run {
    // opts : { mode: normal|daily|weekly|endless|tutorial, hero, biome, deep, rules, seed }
    static create(opts) {
      const P = B.P, Me = B.Meta;
      const seed = opts.seed || (Date.now() ^ (Math.random() * 1e9)) >>> 0;
      const meta = Me.runMeta(opts.hero, { noBless: opts.mode === 'daily' || opts.mode === 'weekly' });
      const d = {
        mode: opts.mode || 'normal', seed: seed, rs: seed, biome: opts.biome || 0, deep: opts.deep || 0, rules: opts.rules || [],
        hero: opts.hero, gold: 0, loot: { braise: 0, bois: 0, essence: 0, herbe: 0, aube: 0 }, items: [], rescued: [],
        st: { kills: 0, elites: 0, killsBy: {}, seen: {}, events: 0, buys: 0, noHit: 0, pacts: 0, evos: [], pw: {}, lore: [], combats: 0, maxGold: 0 },
        rerolls: 1 + (meta.flags.reroll || 0), banishes: meta.flags.banish || 0, banished: [],
        potions: [], next: {}, queue: [], t0: Date.now(), time: 0, pos: { r: -1, i: -1 }, map: null, state: 'map', evSeen: [],
        challenge: opts.challenge || null, flags: meta.flags, bossTime: 0
      };
      // modificateurs
      const mods = Object.assign({}, B.deepMods(d.deep));
      for (const rid of d.rules) { const r = B.RULES.find(x => x.id === rid); if (!r) continue; for (const k in r.m) { if (typeof r.m[k] === 'number' && mods[k] && k.endsWith('Mul')) mods[k] *= r.m[k]; else mods[k] = r.m[k]; } }
      mods.autoSpecial = P.settings.autoSp ? 1 : 0;
      d.mods = mods;
      const H = B.HEROES.find(h => h.id === opts.hero);
      const fl = meta.flags;
      const RH = d.RH = {
        hero: opts.hero, lvl: 1, xp: 0, hp: 9999, ws: [{ id: H.w, lvl: fl.startW2 ? 2 : 1 }], ps: [], meta: meta.st, bonus: {}, tmp: null,
        comp: meta.comp, flags: fl, curses: [], revUsed: 0, spCharge: fl.spStart ? 0.5 : 0,
        slotsW: 5 + (fl.wslot || 0), slotsP: 5 + (fl.pslot || 0)
      };
      for (const r of d.rules) { const rr = B.RULES.find(x => x.id === r); if (rr && rr.st) for (const k in rr.st) RH.bonus[k] = (RH.bonus[k] || 0) + rr.st[k]; }
      const R = new Run(d);
      // départ
      const extraW = (fl.blWeapon ? 1 : 0) + (fl.extraWeapon ? 1 : 0) + (mods.arsenal || 0);
      for (let i = 0; i < extraW; i++) R.giveRandom('w');
      if (fl.extraPassive) R.giveRandom('p');
      if (fl.startLvl) { RH.lvl += fl.startLvl; for (let i = 0; i < fl.startLvl; i++) d.queue.push({ k: 'offer', o: {} }); }
      if (fl.blStar) d.queue.push({ k: 'offer', o: { minRar: 2 } });
      d.gold = 25 * (fl.startGold || 0);
      const S = B.computeStats(RH);
      RH.hp = Math.round(S.hp * (mods.startHp || 1));
      // potions emportées
      if (d.mode !== 'tutorial' && d.mode !== 'endless') for (const id of P.potSel) { if ((P.potions[id] || 0) > 0) { P.potions[id]--; d.potions.push(id); } }
      if (P.bless.length && d.mode !== 'daily' && d.mode !== 'weekly') P.st.blessed++;
      if (d.mode === 'endless') { d.state = 'combat'; }
      else d.map = R.genMap();
      R.markSeen(H.w);
      return R;
    }
    constructor(d) { this.d = d; this.rng = B.rng(d.rs); }
    sync() { this.d.rs = this.rng.state(); return this.d; }
    get RH() { return this.d.RH; }
    get biome() { return this.d.biome; }

    // ───── Carte ─────
    genMap() {
      const d = this.d, r = this.rng;
      if (d.mode === 'tutorial') {
        return { rows: [[{ t: 'fight', x: 0.5, l: [0] }], [{ t: 'treasure', x: 0.5, l: [0] }], [{ t: 'survivor', x: 0.5, l: [0], surv: 'brann' }], [{ t: 'guard', x: 0.5, l: [] }]] };
      }
      const short = d.mods.shortMap;
      const N = short ? 8 : 12, G = short ? 4 : 6;
      const rows = [];
      for (let ri = 0; ri < N; ri++) {
        let n = ri === 0 ? r.int(2, 3) : ri === G || ri === N - 1 ? 1 : ri === N - 2 ? 2 : r.int(2, 4);
        const row = [];
        for (let i = 0; i < n; i++) row.push({ t: 'fight', x: n === 1 ? 0.5 : 0.12 + 0.76 * i / (n - 1) + (r() - 0.5) * 0.08, l: [] });
        for (const nd of row) nd.t = this.nodeType(ri, N, G);
        if (ri === N - 2) { row[0].t = 'camp'; row[1].t = d.mods.noCamp ? 'shop' : r.chance(0.5) ? 'camp' : 'shop'; if (d.mods.noCamp) row[0].t = 'event'; }
        rows.push(row);
      }
      // liens
      for (let ri = 0; ri < N - 1; ri++) {
        const a = rows[ri], b = rows[ri + 1];
        a.forEach(nd => {
          const sorted = b.map((m, j) => [Math.abs(m.x - nd.x), j]).sort((p, q) => p[0] - q[0]);
          nd.l.push(sorted[0][1]);
          if (sorted[1] && sorted[1][0] < 0.36 && r.chance(0.6)) nd.l.push(sorted[1][1]);
        });
        b.forEach((m, j) => { if (!a.some(nd => nd.l.indexOf(j) >= 0)) { const best = a.map((nd, k) => [Math.abs(nd.x - m.x), k]).sort((p, q) => p[0] - q[0])[0][1]; a[best].l.push(j); } });
        a.forEach(nd => nd.l.sort());
      }
      // survivants
      const exclude = [];
      const nSurv = Object.keys(B.P.survivors).length < 6 ? 2 : 1;
      for (let k = 0; k < nSurv; k++) {
        const s = B.Meta.nextSurvivor(d.biome, exclude);
        if (!s) break;
        exclude.push(s.id);
        const cand = [];
        rows.forEach((row, ri) => { if (ri >= 1 && ri < N - 2 && ri !== G) row.forEach((nd, i) => { if (nd.t === 'fight' && !nd.surv) cand.push(nd); }); });
        if (!cand.length) break;
        const nd = r.pick(cand); nd.t = 'survivor'; nd.surv = s.id;
      }
      return { rows: rows };
    }
    nodeType(ri, N, G) {
      const r = this.rng, d = this.d;
      if (ri === 0) return 'fight';
      if (ri === G) return 'guard';
      if (ri === N - 1) return 'boss';
      if (ri === G - 1) return r.weighted([['camp', 4], ['shop', 3], ['event', 3], ['treasure', 1]], x => x[1])[0];
      const w = [['fight', 46], ['event', 22], ['treasure', 8], ['shop', ri >= 2 ? (d.mods.moreShops ? 20 : 8) : 0], ['elite', ri >= 2 ? (ri > G ? 18 : 12) : 0], ['camp', ri > G ? 7 : 0]];
      return r.weighted(w, x => x[1])[0];
    }
    nextNodes() {
      const d = this.d;
      if (d.pos.r < 0) return d.map.rows[0].map((n, i) => i);
      const cur = d.map.rows[d.pos.r][d.pos.i];
      return d.pos.r + 1 < d.map.rows.length ? cur.l : [];
    }
    node() { const d = this.d; return d.pos.r >= 0 ? d.map.rows[d.pos.r][d.pos.i] : null; }
    goTo(i) { const d = this.d; d.pos = { r: d.pos.r + 1, i: i }; const n = this.node(); n.vis = 1; return n; }

    // ───── Combats ─────
    combatOpts(kind, extra) {
      const d = this.d, n = this.node();
      const k = kind || (d.mode === 'endless' ? 'endless' : !n ? 'fight' : n.t === 'survivor' ? 'survivor' : n.t);
      const row = d.mode === 'endless' ? 0 : Math.max(0, d.pos.r) * (d.mods.shortMap ? 1.4 : 1);
      const o = { RH: d.RH, biome: d.biome, kind: d.mode === 'endless' ? 'endless' : d.mode === 'tutorial' && k === 'fight' ? 'tutorial' : k, row: Math.min(11, row), mods: Object.assign({}, d.mods), rng: B.rng(this.rng.int(1, 1e9)) };
      if (k === 'survivor' && n && n.surv) o.survivorName = B.SURVIVORS.find(s => s.id === n.surv).n;
      if (d.mode === 'tutorial' && k === 'guard') { o.mods.hpMul = 0.45; o.mods.dmgMul = 0.6; }
      if (d.next.lightMul) o.mods.lightMul = (o.mods.lightMul || 1) * d.next.lightMul;
      if (d.next.xpMul) o.mods.xpMul = (o.mods.xpMul || 1) * d.next.xpMul;
      d.RH.tmp = d.next.st || null;
      if (d.mods.goldMul) o.mods.goldMul = d.mods.goldMul;
      if (extra) Object.assign(o, extra);
      this.hp0 = d.RH.hp;
      return o;
    }
    // résultat d'un combat (appelé par le jeu)
    afterCombat(c) {
      const d = this.d, RH = d.RH, fl = d.flags;
      d.next = {}; RH.tmp = null;
      const L = c.loot;
      d.gold += Math.round(L.gold * (d.mods.goldMul || 1));
      d.st.maxGold = Math.max(d.st.maxGold, d.gold);
      d.loot.braise += L.braise; d.loot.essence += L.essence; d.loot.bois += L.bois; d.loot.herbe += L.herbe + (c.over === 'win' ? (fl.herbPer || 0) : 0);
      d.st.kills += c.kills; d.st.elites += c.eliteKills; d.st.combats++;
      for (const k in c.killsBy) d.st.killsBy[k] = (d.st.killsBy[k] || 0) + c.killsBy[k];
      for (const k in c.seen) d.st.seen[k] = 1;
      if (c.bossKilled) { d.bossKills = d.bossKills || {}; d.bossKills[c.bossKilled] = (d.bossKills[c.bossKilled] || 0) + 1; }
      if (c.over !== 'win') return { lost: true };
      d.loot.essence += c.kind === 'fight' || c.kind === 'survivor' ? 1 : 0;
      d.loot.bois += 3 + Math.floor(Math.max(0, d.pos.r) / 2) + (c.kind === 'elite' ? 4 : 0) + (c.kind === 'boss' ? 4 + d.biome * 2 : c.kind === 'guard' ? 2 + d.biome : 0);
      if (c.dmgTaken === 0 && c.t > 15) d.st.noHit++;
      if (fl.postHeal) { const S = B.computeStats(RH); RH.hp = Math.min(S.hp, RH.hp + S.hp * 0.04 * fl.postHeal); }
      const n = this.node();
      const res = { rescued: null, boss: c.bossKilled };
      if (c.kind === 'survivor' && c.survivor && c.survivor.done && n && n.surv) {
        if (B.Meta.rescue(n.surv)) { d.rescued.push(n.surv); res.rescued = n.surv; }
      }
      if (c.kind === 'boss' || c.kind === 'guard') {
        d.st.lore.push(['l_forest', 'l_swamp', 'l_ruins', 'l_peaks', 'l_heart'][d.biome]);
        if (c.kind === 'guard' && d.biome === 4) d.st.lore.push('l_knight');
        if (d.deep > 0) d.loot.aube += c.kind === 'boss' ? Math.ceil(d.deep / 3) : 0;
        // butin de gardien/boss
        this.addItem(this.rollItem(c.kind === 'boss' ? 2 : 1));
        if (c.kind === 'boss') { d.won = true; d.bossTime = c.t; }
      }
      return res;
    }
    // ───── Pouvoirs ─────
    owned(id) { return this.RH.ws.find(w => w.id === id) || this.RH.ps.find(p => p.id === id); }
    markSeen(id) { this.d.st.pw[id] = 1; }
    evoReady() {
      const RH = this.RH, out = [];
      for (const w of RH.ws) {
        const e = B.EVO_BY_WEAPON[w.id];
        if (e && w.lvl >= 5 && RH.ps.find(p => p.id === e.with)) out.push(e);
      }
      return out;
    }
    rollRar(minR) {
      const S = B.computeStats(this.RH);
      const luck = Math.max(0, S.luck);
      const w = [65, 25 * (1 + luck * 1.2), 8 * (1 + luck * 2), 2 * (1 + luck * 3)];
      let tot = w.reduce((a, b) => a + b, 0), x = this.rng() * tot, r = 0;
      for (let i = 0; i < 4; i++) { x -= w[i]; if (x <= 0) { r = i; break; } }
      return Math.max(r, minR || 0);
    }
    // o : { minRar, chest, upgradeOnly }
    makeOffer(o) {
      o = o || {};
      const RH = this.RH, d = this.d;
      const cards = [];
      const nCards = 3 + (d.flags.fourCards ? 1 : 0);
      const evos = this.evoReady();
      if (evos.length && (o.chest || this.rng.chance(0.6))) { const e = this.rng.pick(evos); cards.push({ id: e.id, rar: 3, evo: true, from: e.from, lv: 1 }); }
      const pool = [];
      const wFull = RH.ws.length >= RH.slotsW, pFull = RH.ps.length >= RH.slotsP;
      for (const w of RH.ws) { const def = B.POWERS[w.id]; if (def.kind === 'w' && w.lvl < def.max) pool.push({ id: w.id, w: 1.4 }); }
      for (const p of RH.ps) { const def = B.POWERS[p.id]; if (p.lvl < def.max) pool.push({ id: p.id, w: 1.2 }); }
      if (!o.upgradeOnly) {
        if (!wFull) for (const w of B.WEAPONS) if (!this.owned(w.id) && !this.evolvedFrom(w.id) && d.banished.indexOf(w.id) < 0) pool.push({ id: w.id, w: 0.7 });
        if (!pFull) for (const p of B.PASSIVES) if (!this.owned(p.id) && d.banished.indexOf(p.id) < 0) pool.push({ id: p.id, w: this.passiveWeight(p) });
      }
      while (cards.length < nCards && pool.length) {
        const pick = this.rng.weighted(pool, x => x.w);
        pool.splice(pool.indexOf(pick), 1);
        const def = B.POWERS[pick.id], cur = this.owned(pick.id);
        const rar = this.rollRar(o.minRar);
        const from = cur ? cur.lvl : 0;
        const to = Math.min(def.max, from + RAR_LV[rar]);
        cards.push({ id: pick.id, rar: rar, from: from, lv: to });
      }
      if (!cards.length) cards.push({ id: '_gold', rar: 0 }, { id: '_heal', rar: 0 });
      for (const c of cards) this.markSeen(c.id);
      return { cards: cards };
    }
    evolvedFrom(wid) { const e = B.EVO_BY_WEAPON[wid]; return e && this.RH.ws.find(w => w.id === e.id); }
    passiveWeight(p) {
      // favorise un peu les passifs qui font évoluer une arme possédée
      for (const w of this.RH.ws) { const e = B.EVO_BY_WEAPON[w.id]; if (e && e.with === p.id) return 1.6; }
      return 0.8;
    }
    applyCard(card) {
      const RH = this.RH, d = this.d;
      if (card.id === '_gold') { d.gold += 25; return; }
      if (card.id === '_heal') { const S = B.computeStats(RH); RH.hp = Math.min(S.hp, RH.hp + S.hp * 0.3); return; }
      const def = B.POWERS[card.id];
      if (card.evo) {
        const i = RH.ws.findIndex(w => w.id === def.from);
        if (i >= 0) RH.ws[i] = { id: def.id, lvl: 1 }; else RH.ws.push({ id: def.id, lvl: 1 });
        d.st.evos.push(def.id);
        return;
      }
      const cur = this.owned(card.id);
      if (cur) cur.lvl = Math.max(cur.lvl, card.lv);
      else if (def.kind === 'w') { if (RH.ws.length >= RH.slotsW) return; RH.ws.push({ id: card.id, lvl: card.lv }); }
      else { if (RH.ps.length >= RH.slotsP) return; RH.ps.push({ id: card.id, lvl: card.lv }); }
      if (def.st && def.st.hp) RH.hp += def.st.hp * (card.lv - (card.from || 0));
    }
    // aperçu des synergies qu'apporterait une carte
    cardSynergy(card) {
      const out = { elems: [], evoWith: null, evoFor: null };
      const def = B.POWERS[card.id]; if (!def) return out;
      const cnt = B.elemCounts(this.RH);
      const isNew = !this.owned(card.id) && !card.evo;
      for (const e of def.e) {
        const c = (cnt[e] || 0) + (isNew ? 1 : 0);
        const hot = isNew && B.SYNERGY[e].some(s => s.n === c);
        out.elems.push({ e: e, c: c, hot: hot });
      }
      if (def.kind === 'w') { const ev = B.EVO_BY_WEAPON[def.id]; if (ev) out.evoWith = { p: ev.with, has: !!this.owned(ev.with), e: ev.id }; }
      if (def.kind === 'p') { for (const e of B.EVOS) if (e.with === def.id) { const w = this.owned(e.from); if (w) out.evoFor = { w: e.from, e: e.id, lvl: w.lvl }; } }
      return out;
    }
    giveRandom(kind) {
      const RH = this.RH;
      const list = (kind === 'w' ? B.WEAPONS : B.PASSIVES).filter(x => !this.owned(x.id) && !(kind === 'p' && x.max === 1));
      if (!list.length) return null;
      if (kind === 'w' && RH.ws.length >= RH.slotsW) return null;
      if (kind === 'p' && RH.ps.length >= RH.slotsP) return null;
      const x = this.rng.pick(list);
      (kind === 'w' ? RH.ws : RH.ps).push({ id: x.id, lvl: 1 });
      this.markSeen(x.id);
      return x;
    }
    // ───── Objets ─────
    rollItem(minR) {
      const S = B.computeStats(this.RH);
      const luck = S.luck + (this.d.flags.itemLuck || 0) * 0.15;
      const rar = B.Meta.rollRarity(this.rng, luck, minR);
      const tier = this.d.biome + (this.d.deep > 0 ? Math.min(3, this.d.deep * 0.15) : 0);
      return B.Meta.makeItem(this.rng, Math.round(tier * 10) / 10, rar);
    }
    addItem(it) { this.d.items.push(it); return it; }

    // ───── Boutique ─────
    shopStock() {
      const d = this.d;
      if (this.node().stock) return this.node().stock;
      const pm = (d.mods.priceMul || 1) * (1 - 0.07 * (d.flags.shop || 0) - (d.flags.shop && B.P.survivors.lise ? 0 : 0)) * (1 + d.biome * 0.25);
      const offer = this.makeOffer({});
      const stock = offer.cards.filter(c => c.id[0] !== '_').slice(0, 3).map(c => ({ k: 'card', card: c, price: Math.round([22, 38, 65, 110][c.rar] * pm) }));
      stock.push({ k: 'heal', price: Math.round(18 * pm) });
      if (this.RH.curses.length) stock.push({ k: 'uncurse', price: Math.round(45 * pm) });
      stock.push({ k: 'item', item: this.rollItem(1), price: Math.round(70 * pm) });
      this.node().stock = stock;
      return stock;
    }
    buy(i) {
      const d = this.d, s = this.node().stock[i];
      if (!s || s.sold || d.gold < s.price) return false;
      d.gold -= s.price; s.sold = true; d.st.buys++;
      if (s.k === 'card') this.applyCard(s.card);
      if (s.k === 'heal') { const S = B.computeStats(this.RH); this.RH.hp = Math.min(S.hp, this.RH.hp + S.hp * 0.35); }
      if (s.k === 'uncurse') this.RH.curses.shift();
      if (s.k === 'item') this.addItem(s.item);
      return true;
    }
    // ───── Feu de camp ─────
    campHeal() {
      const S = B.computeStats(this.RH);
      const k = (0.32 + 0.1 * (this.d.flags.campHeal || 0)) * (this.d.mods.campMul || 1) * (S.healPow || 1);
      const before = this.RH.hp;
      this.RH.hp = Math.min(S.hp, this.RH.hp + S.hp * k);
      return Math.round(this.RH.hp - before);
    }
    // ───── Trésor ─────
    openTreasure() {
      const d = this.d;
      const g = Math.round((18 + d.biome * 10 + this.rng.int(0, 15)) * (1 + 0.4 * (d.flags.treasure || 0)) * (d.mods.goldMul || 1));
      d.gold += g; d.st.maxGold = Math.max(d.st.maxGold, d.gold);
      const out = { gold: g, item: null, offer: false };
      if (this.rng.chance(0.65)) out.item = this.addItem(this.rollItem(0));
      if (this.rng.chance(0.35) || !out.item) { out.offer = true; d.queue.push({ k: 'offer', o: { minRar: 1, chest: true } }); }
      d.loot.bois += 2 + this.rng.int(0, 2) + d.biome;
      return out;
    }
    // ───── Événement ─────
    pickEvent() {
      const d = this.d;
      let list = B.EVENTS.filter(e => d.evSeen.indexOf(e.id) < 0);
      if (!list.length) list = B.EVENTS;
      if (Object.keys(B.P.survivors).length >= B.SURVIVORS.length) list = list.filter(e => e.id !== 'wounded') || list;
      const e = this.rng.pick(list);
      d.evSeen.push(e.id); d.st.events++;
      return e;
    }
    // API utilisée par les événements
    api() {
      const R = this, d = this.d, RH = this.RH;
      const S = () => B.computeStats(RH);
      return {
        rng: this.rng, biome: d.biome,
        heal: (k) => { const s = S(); RH.hp = Math.min(s.hp, RH.hp + s.hp * k); },
        hurt: (k) => { const s = S(); RH.hp = Math.max(1, RH.hp - s.hp * k); },
        maxHp: (v) => { RH.bonus.hp = (RH.bonus.hp || 0) + v; if (v > 0) RH.hp += v; const s = S(); RH.hp = Math.max(1, Math.min(RH.hp, s.hp)); },
        gold: (v) => { d.gold = Math.max(0, d.gold + Math.round(v * (v > 0 ? (d.mods.goldMul || 1) : 1))); d.st.maxGold = Math.max(d.st.maxGold, d.gold); },
        offer: (o) => d.queue.push({ k: 'offer', o: o || {} }),
        curse: (id) => { if (RH.curses.indexOf(id) < 0) RH.curses.push(id); },
        item: (minR) => R.addItem(R.rollItem(minR || 0)),
        fight: (kind) => d.queue.push({ k: 'fight', kind: kind }),
        res: (k, v) => { d.loot[k] = (d.loot[k] || 0) + v; },
        stat: (k, v) => { RH.bonus[k] = (RH.bonus[k] || 0) + v; },
        upgradeRandom: () => { const l = RH.ws.concat(RH.ps).filter(x => x.lvl < B.POWERS[x.id].max); if (!l.length) return null; const x = R.rng.pick(l); x.lvl++; return B.POWERS[x.id].n; },
        removePassive: () => { if (!RH.ps.length) return null; const i = R.rng.int(0, RH.ps.length - 1); const x = RH.ps.splice(i, 1)[0]; return B.POWERS[x.id].n; },
        survivor: () => { const s = B.Meta.nextSurvivor(Math.max(d.biome, 0)); if (!s) { d.gold += 30; return null; } B.Meta.rescue(s.id); d.rescued.push(s.id); return s.n; },
        reveal: () => { d.reveal = true; },
        xp: (k) => { RH.xp += B.xpNeed(RH.lvl) * k; let n = 0; while (RH.xp >= B.xpNeed(RH.lvl)) { RH.xp -= B.xpNeed(RH.lvl); RH.lvl++; n++; d.queue.push({ k: 'offer', o: {} }); } return n; },
        compXp: (v) => { d.compXp = (d.compXp || 0) + v; },
        give: (id) => { if (R.owned(id)) { d.gold += 20; return false; } if (RH.ws.length >= RH.slotsW) { d.gold += 20; return false; } RH.ws.push({ id: id, lvl: 1 }); R.markSeen(id); return true; },
        spFull: () => { RH.spCharge = 1; },
        lore: () => { const l = B.LORE.find(x => !B.P.lore[x.id] && d.st.lore.indexOf(x.id) < 0 && ['l_end', 'l_deep', 'l_knight'].indexOf(x.id) < 0); d.st.lore.push(l ? l.id : 'l_statue'); },
        flag: (f) => { if (f === 'pact') d.st.pacts++; }
      };
    }
    // ───── Potions ─────
    usePotion(i) {
      const d = this.d, id = d.potions[i]; if (!id) return false;
      const pw = 1 + 0.2 * (d.flags.potPow || 0);
      d.potions.splice(i, 1); B.P.st.potionsUsed++;
      const S = B.computeStats(this.RH);
      switch (id) {
        case 'po_heal': this.RH.hp = Math.min(S.hp, this.RH.hp + S.hp * 0.45 * pw); break;
        case 'po_rage': d.next.st = Object.assign(d.next.st || {}, { dmg: 0.3 * pw }); break;
        case 'po_iron': d.next.st = Object.assign(d.next.st || {}, { armor: 6 * pw }); break;
        case 'po_wis': d.next.xpMul = 1 + 0.6 * pw; break;
        case 'po_light': d.next.lightMul = 1 + 0.5 * pw; break;
        case 'po_luck': d.queue.push({ k: 'offer', o: { minRar: 2 } }); break;
      }
      return true;
    }

    // ───── Fin d'expédition ─────
    finish(won, extra) {
      const d = this.d, P = B.P, Me = B.Meta, fl = d.flags;
      extra = extra || {};
      d.time = (Date.now() - d.t0) / 1000;
      let keep = won ? 1 : Math.min(0.85, 0.5 + 0.08 * (fl.keep || 0));
      if (d.mode === 'endless') keep = 0.8;
      if (d.mode === 'tutorial') keep = 1;
      const bonus = (1 + 0.03 * P.bld.fanal) * (1 + 0.06 * (fl.allMul || 0));
      const g = {
        braise: (d.loot.braise + d.gold * 2) * keep * bonus * (1 + 0.05 * (fl.braiseMul || 0)) * (fl.braise20 ? 1.2 : 1) * (1 + 0.1 * d.deep),
        bois: d.loot.bois * keep * bonus * (1 + 0.08 * (fl.boisMul || 0) + 0.15 * (fl.boisMul && P.survivors.barnabe ? 0 : 0)) * (1 + 0.1 * d.deep),
        essence: d.loot.essence * keep * bonus * (1 + 0.08 * (fl.essMul || 0)) * (1 + 0.1 * d.deep),
        herbe: (d.loot.herbe + P.bld.garden * 2) * (won ? 1 : 0.7),
        aube: d.loot.aube
      };
      if (P.survivors.barnabe) g.bois *= 1.15;
      if (won && d.mode === 'normal' && d.biome === 4) { g.aube += 1 + (fl.aubeBoss || 0); }
      else if (won && d.mode === 'normal' && fl.aubeBoss && d.deep > 0) g.aube += 1;
      // défis
      let chal = null;
      if (won && (d.mode === 'daily' || d.mode === 'weekly')) {
        const box = d.mode === 'weekly' ? P.weekly : P.daily;
        if (!(box.key === d.challenge.key && box.done)) { box.key = d.challenge.key; box.done = true; for (const k in d.challenge.reward) g[k] = (g[k] || 0) + d.challenge.reward[k]; P.st.challenges++; chal = d.challenge.reward; }
      }
      for (const k in g) g[k] = Math.floor(g[k]);
      Me.gain(g);
      // objets
      for (const it of d.items) { P.items.push(it); P.st.items++; if (it.rar >= 3) { P.st.legendary++; if (it.u) P.uniques[it.u] = 1; } }
      // statistiques
      const S = P.st;
      if (d.mode !== 'tutorial') S.runs++; else S.runs++;
      if (won) S.runsWon++;
      S.kills += d.st.kills; S.elites += d.st.elites; S.events += d.st.events; S.buys += d.st.buys; S.noHit += d.st.noHit; S.pacts += d.st.pacts;
      S.bestLvl = Math.max(S.bestLvl, d.RH.lvl); S.maxGold = Math.max(S.maxGold, d.st.maxGold); S.herbs += g.herbe;
      for (const k in d.st.killsBy) P.kills[k] = (P.kills[k] || 0) + d.st.killsBy[k];
      for (const k in d.st.seen) P.seen[k] = 1;
      for (const k in d.st.pw) P.powersSeen[k] = 1;
      for (const e of d.st.evos) P.evos[e] = 1;
      for (const l of d.st.lore) P.lore[l] = 1;
      const newLore = d.st.lore.slice();
      // boss et progression
      let unlocked = null;
      if (d.bossKills) for (const id in d.bossKills) P.bossKills[id] = (P.bossKills[id] || 0) + d.bossKills[id];
      if (won && d.mode === 'normal') {
        P.cleared[d.biome] = 1;
        if (d.biome < 4 && P.biome <= d.biome) { P.biome = d.biome + 1; unlocked = d.biome + 1; }
        if (d.biome === 4) {
          P.heroWins[d.hero] = (P.heroWins[d.hero] || 0) + 1;
          P.lore.l_end = 1;
          if (d.deep >= P.deep) { P.deep = Math.min(20, d.deep + 1); }
          if (d.deep > 0) { S.deepWon = Math.max(S.deepWon, d.deep); P.lore.l_deep = 1; }
          if (d.bossTime && d.bossTime < 60) S.fastBoss++;
        }
      }
      if (d.mode === 'endless') S.endlessBest = Math.max(S.endlessBest, Math.floor(extra.time || 0));
      // maîtrise du héros
      const h = P.heroes[d.hero];
      let heroUp = 0;
      if (h) {
        h.xp += Math.round((d.st.kills * 0.6 + d.RH.lvl * 12 + (won ? 150 : 0)) * (1 + 0.12 * (fl.heroXp || 0)));
        while (h.lvl < 10 && h.xp >= Me.heroXpNeed(h.lvl)) { h.xp -= Me.heroXpNeed(h.lvl); h.lvl++; heroUp++; }
      }
      // compagnon
      let compUp = 0;
      if (d.RH.comp && P.comps[d.RH.comp.id]) {
        const c = P.comps[d.RH.comp.id];
        c.xp += Math.round((d.st.kills * 0.4 + d.RH.lvl * 8 + (d.compXp || 0)) * (1 + 0.2 * (fl.compXp || 0)));
        while (c.lvl < Me.compMax() && c.xp >= Me.compXpNeed(c.lvl)) { c.xp -= Me.compXpNeed(c.lvl); c.lvl++; compUp++; }
        if (c.lvl >= Me.compMax()) c.xp = Math.min(c.xp, Me.compXpNeed(c.lvl));
      }
      P.run = null;
      const ach = Me.checkAch();
      Me.save(true);
      return { won: won, gains: g, keep: keep, items: d.items, rescued: d.rescued, unlocked: unlocked, heroUp: heroUp, compUp: compUp, ach: ach, chal: chal, lore: newLore, lvl: d.RH.lvl, kills: d.st.kills, time: d.time, biome: d.biome, mode: d.mode, deep: d.deep, endless: extra.time };
    }
  }
  B.Run = Run;
})(this.B || (this.B = {}));
