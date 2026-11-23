// Brumeterre — moteur de combat (aucun DOM : tourne aussi dans les simulations Node)
(function (B) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = B.clamp;

  // Réglages d'équilibrage (ajustés avec tools/sim.js)
  B.CFG = {
    biomeHp: [1, 1.2, 1.45, 1.75, 2.1],
    biomeDmg: [1, 1.15, 1.3, 1.45, 1.6],
    rowHp: 0.2, rowHp2: 0.012, rowDmg: 0.06,
    bossHpMul: 1,
    spawnBase: 1.25, spawnRow: 0.2, spawnTime: 0.02,
    maxEnemies: 140,
    xpBase: 1, xpRow: 0.12,
    fightTime: 36, fightRow: 2.4,
    arenaW: 1000, arenaH: 1500,
    braisePerXp: 0.55,
    eliteHp: 6, eliteDmg: 1.4
  };

  B.xpNeed = function (lvl) { return Math.round(5 + lvl * 6.5 + lvl * lvl * 0.85); };

  // ───────────── STATISTIQUES ─────────────
  const STAT0 = () => ({
    hp: 100, armor: 0, spd: 150, dmg: 1, cd: 0, pick: 62, light: 165, xp: 1, luck: 0, area: 1, dur: 1, n: 0,
    crit: 0.05, critd: 1.6, regen: 0, pspd: 1, lifesteal: 0, dodge: 0, gold: 1, elite: 1, knock: 1, healPow: 1,
    fireDmg: 0, iceDmg: 0, boltDmg: 0, poisonDmg: 0, lightDmg: 0, shadowDmg: 0, natureDmg: 0, arcaneDmg: 0,
    burnPow: 0, poisonPow: 0, slowPow: 0, stunPow: 0, thorns: 0, aegis: 0, revive: 0, soulChance: 0, rage: 0,
    staticc: 0, boom: 0, frostArmor: 0, lvlHeal: 0, focus: 0, momentum: 0, spCharge: 0, flags: {}
  });
  // clés exprimées en % (additionnées puis appliquées comme multiplicateurs)
  const PCT = { spd: 1, dmg: 1, pick: 1, light: 1, xp: 1, area: 1, dur: 1, pspd: 1, gold: 1, elite: 1, knock: 1, healPow: 1, hp_pct: 1 };

  B.addStats = function (S, add, mul) {
    mul = mul || 1;
    for (const k in add) {
      const v = add[k] * mul;
      if (k === 'flags') continue;
      if (k === 'hp_pct') { S._hpPct = (S._hpPct || 0) + v; continue; }
      if (PCT[k]) S['_' + k] = (S['_' + k] || 0) + v;
      else S[k] = (S[k] || 0) + v;
    }
  };

  B.computeStats = function (RH) {
    const S = STAT0();
    const H = B.HEROES.find(h => h.id === RH.hero) || B.HEROES[0];
    B.addStats(S, H.st);
    if (H.st.hp) S.hp = H.st.hp; // le héros remplace la vie de base
    if (RH.meta) B.addStats(S, RH.meta);
    for (const p of RH.ps) { const d = B.POWERS[p.id]; if (d && d.st) B.addStats(S, d.st, p.lvl); }
    if (RH.bonus) B.addStats(S, RH.bonus); // bonus de l'expédition (événements, autel…)
    if (RH.tmp) B.addStats(S, RH.tmp); // potion du prochain combat
    const fl = RH.flags || {};
    for (const f in fl) if (f.slice(0, 2) === 'u_') S.flags[f.slice(2)] = 1;
    if (fl.poly) S._dmg = (S._dmg || 0) + 0.02 * fl.poly * RH.ws.length;
    S.evoDmg = 0.12 * (fl.evoDmg || 0);
    S.dmgIn = 1 - 0.03 * (fl.calm || 0);
    // Synergies d'éléments
    const cnt = B.elemCounts(RH);
    S.syn = {};
    for (const el in B.SYNERGY) {
      const c = cnt[el] || 0; let tier = 0;
      B.SYNERGY[el].forEach((s, i) => { if (c >= s.n) { tier = i + 1; if (s.st) B.addStats(S, s.st); if (s.flag) S.flags[s.flag] = 1; } });
      S.syn[el] = tier;
    }
    if (RH.curses) for (const c of RH.curses) { const d = B.CURSES && B.CURSES[c]; if (d && d.st) B.addStats(S, d.st); }
    // Application des pourcentages
    S.spd = S.spd * (1 + (S._spd || 0));
    S.dmg = 1 + (S._dmg || 0);
    S.pick = S.pick * (1 + (S._pick || 0));
    S.light = S.light * (1 + (S._light || 0));
    S.xp = 1 + (S._xp || 0);
    S.area = 1 + (S._area || 0);
    S.dur = 1 + (S._dur || 0);
    S.pspd = 1 + (S._pspd || 0);
    S.gold = 1 + (S._gold || 0);
    S.elite = 1 + (S._elite || 0);
    S.knock = 1 + (S._knock || 0);
    S.healPow = (1 + (S._healPow || 0)) * (S.flags.bloom ? 2 : 1);
    S.hp = Math.round(S.hp * (1 + (S._hpPct || 0)) * (S.flags.bloom ? 1.25 : 1));
    // Garde-fous
    S.cdF = 1 / (1 + Math.max(0, S.cd));
    S.crit = clamp(S.crit, 0, 0.75);
    S.dodge = clamp(S.dodge, 0, 0.45);
    S.armorRed = clamp(S.armor / (S.armor + 14), 0, 0.7);
    S.n = Math.floor(S.n + 1e-6);
    S.lifesteal = Math.min(S.lifesteal, 0.04);
    S.spd = clamp(S.spd, 70, 320);
    return S;
  };

  B.elemCounts = function (RH) {
    const c = {};
    const add = (id) => { const d = B.POWERS[id]; if (d) for (const e of d.e) c[e] = (c[e] || 0) + 1; };
    RH.ws.forEach(w => add(w.id)); RH.ps.forEach(p => add(p.id));
    if (RH.flags && RH.flags.affinity) { let best = null; for (const e in c) if (!best || c[e] > c[best]) best = e; if (best) c[best]++; }
    return c;
  };

  // Paramètres d'une arme selon son niveau et les statistiques
  B.weaponParams = function (id, lvl, S) {
    const d = B.POWERS[id];
    const p = Object.assign({}, d.p);
    if (d.fx || d.p.fx) p.fx = Object.assign({}, d.p.fx);
    if (d.lv) for (let i = 0; i < lvl - 1 && i < d.lv.length; i++) {
      const L = d.lv[i];
      for (const k in L) {
        if (k === 'cdm') p.cd *= L[k];
        else if (k === 'fxslow') p.fx.slow = [p.fx.slow[0] + L[k], p.fx.slow[1]];
        else if (k === 'fxfreeze') p.fx.freeze = [p.fx.freeze[0] + L[k], p.fx.freeze[1]];
        else if (k === 'fxstun') p.fx.stun = [p.fx.stun[0], p.fx.stun[1] + L[k]];
        else p[k] = (p[k] || 0) + L[k];
      }
    }
    if (!S) return p;
    let em = 0; for (const e of d.e) em += S[e + 'Dmg'] || 0;
    p.dmg *= S.dmg * (1 + em) * (d.kind === 'e' ? 1 + (S.evoDmg || 0) : 1);
    if (p.cd) p.cd = Math.max(0.08, p.cd * S.cdF);
    if (p.n !== undefined && d.type !== 'arc' && d.type !== 'aura' && d.type !== 'nova') p.n += S.n;
    if (p.area) p.area *= S.area;
    if (p.explode) p.explode *= S.area;
    if (d.type === 'orbit' || d.type === 'boomerang' || d.type === 'proj' && p.r > 15) p.r *= Math.sqrt(S.area);
    if (p.dur) p.dur *= S.dur;
    if (d.type === 'pool' && p.dur) p.dur *= 1;
    if (p.spd && d.type === 'proj') p.spd *= S.pspd;
    if (p.knock) p.knock *= S.knock;
    p.elems = d.e;
    p.crit = (p.crit || 0);
    return p;
  };

  // ───────────── COMBAT ─────────────
  let UID = 1;
  class Combat {
    constructor(o) {
      this.o = o;
      this.RH = o.RH;
      this.biome = o.biome || 0;
      this.kind = o.kind || 'fight';
      this.row = o.row || 0;
      this.mods = o.mods || {};
      this.F = o.F || null; // interface d'effets (rendu/son)
      this.rng = o.rng || B.rng(Date.now());
      this.W = B.CFG.arenaW; this.H = B.CFG.arenaH;
      if (this.kind === 'boss' || this.kind === 'guard') { this.W = 900; this.H = 1250; }
      this.t = 0; this.over = null; this.outro = 0; this.paused = false;
      this.en = []; this.pb = []; this.eb = []; this.zones = []; this.tele = []; this.picks = []; this.mins = []; this.mines = []; this.strikes = [];
      this.kills = 0; this.eliteKills = 0; this.bossKilled = null; this.dmgDealt = 0; this.dmgTaken = 0;
      this.loot = { gold: 0, braise: 0, essence: 0, bois: 0, herbe: 0 };
      this.seen = {}; this.killsBy = {};
      this.mx = 0; this.my = 0; this.moving = false; this.stillT = 0;
      this.lightMul = 1; this.darkT = 0;
      this.hash = new Map();
      this._near = [];
      // Durée et spawns
      const C = B.CFG;
      this.duration = C.fightTime + this.row * C.fightRow;
      if (this.kind === 'tutorial') this.duration = 30;
      if (this.mods.shortFights) this.duration *= 0.8;
      this.spawnAcc = 0;
      this.hpMul = C.biomeHp[this.biome] * (1 + this.row * C.rowHp + this.row * this.row * C.rowHp2) * (this.mods.hpMul || 1);
      this.dmgMul = C.biomeDmg[this.biome] * (1 + this.row * C.rowDmg) * (this.mods.dmgMul || 1);
      this.spdMul = (1 + 0.02 * this.biome) * (this.mods.spdMul || 1);
      if (this.kind === 'tutorial') { this.hpMul *= 0.7; this.dmgMul *= 0.6; }
      this.recompute(true);
      const P = this.P = {
        x: this.W / 2, y: this.H / 2 + 120, r: 14, vx: 0, vy: 0, inv: 0, face: -Math.PI / 2, hp: Math.min(this.RH.hp, this.S.hp),
        aegisT: 0, frostT: 0, staticD: 0, sp: this.RH.spCharge || 0, critAll: 0, shield: 0, slowT: 0, slowF: 0, rootT: 0, dashT: 0, dashA: 0
      };
      if (P.hp <= 0) P.hp = 1;
      if (this.RH.flags && this.RH.flags.startShield) P.aegis = true;
      this.weap = this.RH.ws.map(w => this.makeWeapon(w));
      this.comp = this.RH.comp ? { id: this.RH.comp.id, lvl: this.RH.comp.lvl, x: P.x - 30, y: P.y + 20, t: 0, t2: 0, tgt: null, trail: 0 } : null;
      this.synT = { ice: 0, bolt: 0, echo: 0 };
      this.survivor = null;
      if (this.kind === 'survivor') {
        const a = this.rng() * TAU;
        this.survivor = { x: clamp(P.x + Math.cos(a) * 330, 120, this.W - 120), y: clamp(P.y + Math.sin(a) * 330, 140, this.H - 140), prog: 0, done: false, r: 70, name: o.survivorName || '' };
      }
      // Ennemis d'ouverture
      if (this.kind === 'elite') {
        const k = this.row >= 6 ? 2 : 1;
        for (let i = 0; i < k; i++) this.spawnElite();
      }
      if (this.kind === 'guard' || this.kind === 'boss') {
        const bid = o.bossId || (this.kind === 'guard' ? B.BIOMES[this.biome].guard : B.BIOMES[this.biome].boss);
        this.bossDelay = 1.6; this.bossId = bid; this.boss = null;
      }
      if (this.kind === 'ambush') { this.duration = 30; for (let i = 0; i < 12; i++) this.spawnOne(); }
      if (this.kind === 'mimic') { const e = this.spawnMob('x_mimic', P.x, P.y - 220); e.hp = e.max = e.max * 2; e.elite = 'armored'; this.mimic = e; }
      for (let i = 0; i < 6 && this.kind !== 'tutorial'; i++) this.spawnOne();
    }

    recompute(first) {
      const oldMax = this.S ? this.S.hp : 0;
      this.S = B.computeStats(this.RH);
      if (this.P && !first && this.S.hp > oldMax) this.P.hp += this.S.hp - oldMax;
      if (this.P) this.P.hp = Math.min(this.P.hp, this.S.hp);
      if (this.weap) {
        this.weap = this.RH.ws.map(w => { const old = this.weap.find(x => x.id === w.id); const n = this.makeWeapon(w); if (old) { n.t = old.t; n.st = old.st; n.mins = old.mins; } return n; });
      }
    }
    makeWeapon(w) {
      const d = B.POWERS[w.id];
      return { id: w.id, lvl: w.lvl, d: d, type: d.type, p: B.weaponParams(w.id, w.lvl, this.S), t: 0.3 + Math.random() * 0.4, st: 0, mins: [] };
    }

    // ───── Apparition des ennemis ─────
    mobPool() {
      const bio = B.BIOMES[this.biome];
      const k = Math.min(bio.mobs.length, 3 + Math.floor(this.row / 2) + (this.kind === 'endless' ? 8 : 0));
      return bio.mobs.slice(0, k);
    }
    spawnPos(minD) {
      const P = this.P; minD = minD || 430;
      for (let i = 0; i < 8; i++) {
        const a = this.rng() * TAU, d = minD + this.rng() * 120;
        const x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
        if (x > 30 && x < this.W - 30 && y > 30 && y < this.H - 30) return [x, y];
      }
      const a = this.rng() * TAU;
      return [clamp(P.x + Math.cos(a) * minD, 30, this.W - 30), clamp(P.y + Math.sin(a) * minD, 30, this.H - 30)];
    }
    spawnMob(id, x, y, extra) {
      const d = B.MONSTERS[id];
      const boss = d.kind === 'boss';
      const hpm = boss ? (this.mods.hpMul || 1) * B.CFG.bossHpMul * (this.kind === 'endless' ? this.endlessMul : 1) : this.hpMul;
      const e = {
        uid: UID++, d: d, id: id, x: x, y: y, vx: 0, vy: 0, r: d.r, hp: d.hp * hpm, max: d.hp * hpm,
        spd: d.spd * this.spdMul, dmg: d.dmg * (boss ? (this.mods.dmgMul || 1) * B.CFG.biomeDmg[d.b] * (this.kind === 'endless' ? Math.sqrt(this.endlessMul) : 1) : this.dmgMul),
        xp: (d.xp || 1) * B.CFG.xpBase * (1 + this.row * B.CFG.xpRow), st: 'move', t: 0, cd: 1 + this.rng() * 2,
        elite: null, boss: boss, burn: 0, burnT: 0, pois: 0, poisD: 0, poisT: 0, slowF: 0, slowT: 0, frzT: 0, stunT: 0, flash: 0,
        shield: 0, dead: false, face: 1, ph: this.rng() * 10, ticks: null, untarget: false, alpha: 1, z: 0, a: 0
      };
      if (extra) Object.assign(e, extra);
      if (d.beh === 'burrow') { e.st = 'under'; e.untarget = true; }
      this.en.push(e);
      this.seen[id] = 1;
      return e;
    }
    spawnOne(id) {
      if (this.en.length >= B.CFG.maxEnemies) return null;
      const pool = this.mobPool();
      id = id || pool[Math.floor(this.rng() * pool.length)];
      const d = B.MONSTERS[id];
      const [x, y] = this.spawnPos();
      if (d.beh === 'swarm' && !d.child) {
        const k = 3 + Math.floor(this.rng() * 3);
        let last = null;
        for (let i = 0; i < k && this.en.length < B.CFG.maxEnemies; i++) last = this.spawnMob(id, x + (this.rng() - 0.5) * 60, y + (this.rng() - 0.5) * 60);
        return last;
      }
      return this.spawnMob(id, x, y);
    }
    spawnElite(id) {
      const pool = this.mobPool().filter(m => !B.MONSTERS[m].child && B.MONSTERS[m].beh !== 'swarm');
      id = id || pool[Math.floor(this.rng() * pool.length)];
      const [x, y] = this.spawnPos(300);
      const e = this.spawnMob(id, x, y);
      const af = B.ELITE_AFFIX[Math.floor(this.rng() * B.ELITE_AFFIX.length)].id;
      e.elite = af; e.hp = e.max = e.max * B.CFG.eliteHp * (this.mods.eliteHp || 1); e.dmg *= B.CFG.eliteDmg; e.r *= 1.45; e.xp *= 8;
      if (af === 'swift') e.spd *= 1.5;
      if (af === 'shielded') e.shield = e.max * 0.25;
      this.elitesAlive = (this.elitesAlive || 0) + 1;
      if (this.F) this.F.text(e.x, e.y - 40, 'Élite ' + B.ELITE_AFFIX.find(a => a.id === af).n, '#ffcf4a');
      return e;
    }
    spawnBoss() {
      const d = B.MONSTERS[this.bossId];
      const P = this.P;
      const e = this.spawnMob(this.bossId, this.W / 2, Math.max(160, P.y - 300));
      e.st = 'idle'; e.cd = 1.4; e.phase = 1; e.act = null;
      this.boss = e;
      if (this.F) { this.F.bossIntro(e); this.F.shake(10); this.F.sfx('roar'); }
      return e;
    }

    // ───── Boucle ─────
    step(dt) {
      if (this.over || this.paused) return;
      this.t += dt;
      const P = this.P, S = this.S;
      this.buildHash();
      this.updatePlayer(dt);
      this.updateSpawns(dt);
      this.updateWeapons(dt);
      this.updateSynergies(dt);
      this.updateCompanion(dt);
      this.updatePB(dt);
      this.updateStrikes(dt);
      this.updateMins(dt);
      this.updateEnemies(dt);
      this.updateEB(dt);
      this.updateZones(dt);
      this.updateTele(dt);
      this.updatePicks(dt);
      this.cleanup();
      this.checkEnd(dt);
      if (this.darkT > 0) { this.darkT -= dt; this.lightMul = Math.max(0.5, this.lightMul - dt * 0.25); }
      else this.lightMul = Math.min(1, this.lightMul + dt * 0.15);
      if (P.hp <= 0) this.playerDown();
    }

    buildHash() {
      const h = this.hash;
      for (const arr of h.values()) arr.length = 0;
      for (const e of this.en) {
        if (e.dead || e.untarget) continue;
        const k = ((e.x >> 6) & 1023) | (((e.y >> 6) & 1023) << 10);
        let a = h.get(k); if (!a) { a = []; h.set(k, a); }
        a.push(e);
      }
    }
    // Ennemis proches (dans un rayon) → tableau réutilisé
    near(x, y, r, out) {
      out = out || this._near; out.length = 0;
      const x0 = (x - r) >> 6, x1 = (x + r) >> 6, y0 = (y - r) >> 6, y1 = (y + r) >> 6;
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
        const a = this.hash.get((cx & 1023) | ((cy & 1023) << 10));
        if (!a) continue;
        for (const e of a) { if (e.dead) continue; const rr = r + e.r; if (B.dist2(x, y, e.x, e.y) < rr * rr) out.push(e); }
      }
      return out;
    }
    nearest(x, y, maxD, exclude) {
      let best = null, bd = maxD * maxD;
      for (const e of this.en) {
        if (e.dead || e.untarget) continue;
        if (exclude && exclude.indexOf(e.uid) >= 0) continue;
        const d = B.dist2(x, y, e.x, e.y);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    }
    randomEnemy(x, y, maxD) {
      const list = [];
      const m2 = maxD * maxD;
      for (const e of this.en) if (!e.dead && !e.untarget && B.dist2(x, y, e.x, e.y) < m2) list.push(e);
      return list.length ? list[Math.floor(Math.random() * list.length)] : null;
    }

    updatePlayer(dt) {
      const P = this.P, S = this.S;
      let mx = this.mx, my = this.my;
      const m = Math.hypot(mx, my);
      this.moving = m > 0.1;
      if (m > 1) { mx /= m; my /= m; }
      let spd = S.spd * (P.slowT > 0 ? 1 - P.slowF : 1);
      if (P.slowT > 0) P.slowT -= dt;
      if (P.dashT > 0) {
        P.dashT -= dt; P.x += Math.cos(P.dashA) * 900 * dt; P.y += Math.sin(P.dashA) * 900 * dt;
      } else {
        P.x += mx * spd * dt; P.y += my * spd * dt;
      }
      if (this.moving) { P.face = Math.atan2(my, mx); this.stillT = 0; P.staticD += spd * m * dt; } else this.stillT += dt;
      P.x = clamp(P.x, 24, this.W - 24); P.y = clamp(P.y, 24, this.H - 24);
      if (P.inv > 0) P.inv -= dt;
      if (P.critAll > 0) P.critAll -= dt;
      // régénération
      if (S.regen > 0 && P.hp < S.hp) P.hp = Math.min(S.hp, P.hp + S.regen * S.healPow * dt);
      if (S.aegis > 0) { P.aegisT -= dt; if (P.aegisT <= 0 && !P.aegis) { P.aegis = true; } }
      if (P.frostT > 0) P.frostT -= dt;
      // charge statique
      if (S.staticc > 0 && P.staticD > 260) {
        P.staticD = 0;
        const list = this.near(P.x, P.y, 170).slice(0, 2 + S.staticc);
        const pts = [[P.x, P.y]];
        for (const e of list) { this.hurt(e, (10 + S.staticc * 6) * S.dmg * (1 + S.boltDmg), { el: 'bolt' }); pts.push([e.x, e.y]); }
        if (list.length && this.F) this.F.bolt(pts, '#ffe14d');
      }
      // capacité spéciale
      const H = B.HEROES.find(h => h.id === this.RH.hero);
      if (P.sp < 1) P.sp = Math.min(1, P.sp + dt / (H.sp.ch * S.cdF * (1 - (S.spCharge || 0))));
      if (this.wantSpecial) { this.wantSpecial = false; if (P.sp >= 1) this.useSpecial(); }
      if (this.mods.autoSpecial && P.sp >= 1 && this.en.length > 8) this.useSpecial();
      // brume toxique (Brume Profonde)
      if (this.mods.toxicFog && !this.over) {
        this.fogT = (this.fogT || 0) + dt;
        if (this.fogT > 1) { this.fogT = 0; P.hp -= S.hp * 0.004; }
      }
    }

    updateSpawns(dt) {
      if (this.outro > 0) return;
      const C = B.CFG;
      if (this.kind === 'guard' || this.kind === 'boss') {
        if (!this.boss && this.bossDelay > 0) { this.bossDelay -= dt; if (this.bossDelay <= 0) this.spawnBoss(); }
        // quelques serviteurs
        this.spawnAcc += dt * 0.35 * (1 + this.biome * 0.15);
        while (this.spawnAcc >= 1) { this.spawnAcc -= 1; if (this.en.length < 40) this.spawnOne(); }
        return;
      }
      if (this.kind === 'mimic') return;
      let rate = C.spawnBase + this.row * C.spawnRow + this.t * C.spawnTime;
      if (this.kind === 'endless') {
        rate = 1.6 + this.t * 0.012;
        this.endlessUpdate(dt);
      }
      if (this.kind === 'tutorial') rate = 0.9 + this.t * 0.03;
      if (this.kind === 'elite') rate *= 0.6;
      if (this.t > this.duration && this.kind !== 'endless') rate *= (this.kind === 'elite' || this.kind === 'survivor') ? 0.5 : 0;
      rate *= (this.mods.spawnMul || 1);
      // vagues : pics réguliers
      const wave = 1 + 0.6 * Math.max(0, Math.sin(this.t * 0.45));
      this.spawnAcc += dt * rate * wave;
      while (this.spawnAcc >= 1) { this.spawnAcc -= 1; this.spawnOne(); }
      // élites surprises (Brume profonde)
      if (this.mods.moreElites && this.kind === 'fight' && !this.surpriseElite && this.t > this.duration * 0.5) { this.surpriseElite = 1; this.spawnElite(); }
    }

    endlessUpdate(dt) {
      // le biome change toutes les 90 s ; mini-boss toutes les 3 min
      const stage = Math.floor(this.t / 90);
      if (stage !== this.endStage) {
        this.endStage = stage;
        this.biome = stage % 5;
        this.row = Math.min(11, 3 + stage);
        const loop = Math.floor(stage / 5);
        this.endlessMul = (1 + stage * 0.55) * Math.pow(1.6, loop);
        this.hpMul = B.CFG.biomeHp[this.biome] * (1 + stage * 0.5) * Math.pow(2, loop);
        this.dmgMul = B.CFG.biomeDmg[this.biome] * (1 + stage * 0.14) * Math.pow(1.35, loop);
        if (this.F) this.F.biomeChange(this.biome);
        if (stage > 0 && stage % 2 === 0) {
          const g = B.BIOMES[this.biome].guard;
          const [x, y] = this.spawnPos(350);
          const e = this.spawnMob(g, x, y); e.st = 'idle'; e.cd = 2; e.phase = 1; e.act = null; e.max = e.hp = e.max * 0.6;
          if (this.F) { this.F.bossIntro(e); this.F.sfx('roar'); }
        }
      }
    }

    // ───── Dégâts ─────
    hurt(e, dmg, o) {
      if (e.dead || e.untarget) return 0;
      o = o || {};
      const S = this.S, P = this.P;
      let m = 1;
      if (e.elite || e.boss) m *= S.elite;
      if (S.flags.weaken && e.pois > 0) m *= 1.2;
      if (S.flags.radiant && B.dist2(P.x, P.y, e.x, e.y) < this.lightR() * this.lightR()) m *= 1.15;
      if (e.frzT > 0) m *= 1.15;
      if (S.rage) m *= 1 + Math.min(1, (1 - P.hp / S.hp) / 0.7) * S.rage;
      if (S.focus && this.stillT > 0.3) m *= 1 + S.focus;
      if (S.momentum && this.moving) m *= 1 + S.momentum;
      if (this.mods.dmgOut) m *= this.mods.dmgOut;
      let crit = false;
      if (!o.nocrit) {
        const cc = S.crit + (o.crit || 0) + (P.critAll > 0 ? 1 : 0);
        if (Math.random() < cc) { crit = true; m *= S.critd; }
      }
      if (e.elite === 'armored') m *= 0.6;
      if (e.boss && e.st === 'air') return 0;
      let d = dmg * m;
      if (e.shield > 0) { const a = Math.min(e.shield, d); e.shield -= a; d -= a * 0.999; if (d <= 0.5) { e.flash = 0.08; return 0; } }
      e.hp -= d; e.flash = 0.1;
      this.dmgDealt += d;
      if (S.lifesteal > 0) P.hp = Math.min(S.hp, P.hp + d * S.lifesteal * S.healPow);
      if (o.kb && !e.boss) { const k = o.kb / (e.elite ? 3 : 1) / Math.sqrt(e.r / 12); e.vx += Math.cos(o.ka) * k; e.vy += Math.sin(o.ka) * k; }
      const fx = o.fx;
      if (fx || S.flags.allBurn) this.applyFx(e, d, fx, o);
      if (this.F) this.F.hit(e, d, crit, o.el);
      if (crit && S.flags.critBoom && Math.random() < 0.2 && !o.fromBoom) { const l = this.near(e.x, e.y, 45).slice(); for (const t of l) this.hurt(t, d * 0.5, { el: 'fire', nocrit: 1, fromBoom: 1 }); if (this.F) this.F.boom(e.x, e.y, 45, 'fire'); }
      if (crit && S.flags.critBolt && Math.random() < 0.25 && !o.fromBolt) this.chainFrom(e, d * 0.5, 3, 160, { el: 'bolt', fromBolt: 1 });
      if (S.flags.execute && !e.boss && e.hp > 0 && e.hp < e.max * 0.12) { e.hp = 0; if (this.F) this.F.text(e.x, e.y - 20, '✝', '#c9a0ff'); }
      if (e.hp <= 0) this.kill(e, o);
      return d;
    }
    applyFx(e, d, fx, o) {
      const S = this.S;
      const cc = e.boss ? 0.3 : 1;
      if ((fx && fx.burn) || S.flags.allBurn) {
        const b = ((fx && fx.burn) || 0.2) * (1 + S.burnPow);
        const dps = d * b / 3;
        if (dps > e.burn || e.burnT < 1) e.burn = Math.max(e.burn, dps);
        e.burnT = 3 * S.dur;
      }
      if (!fx) return;
      if (fx.poison) {
        e.pois = Math.min(12 + (S.flags.plague ? 4 : 0), e.pois + fx.poison);
        e.poisD = Math.max(e.poisD, (o.base || d) * 0.25 * (1 + S.poisonPow));
        e.poisT = 4 * S.dur;
      }
      if (fx.slow) {
        const f = Math.min(e.boss ? 0.3 : 0.8, fx.slow[0] * (1 + S.slowPow));
        e.slowF = Math.max(e.slowF * (e.slowT > 0 ? 1 : 0), f); e.slowT = Math.max(e.slowT, fx.slow[1] * S.dur);
      }
      if (fx.freeze && Math.random() < fx.freeze[0] * (1 + S.slowPow)) { e.frzT = Math.max(e.frzT, fx.freeze[1] * cc * S.dur); }
      if (fx.stun && Math.random() < fx.stun[0] * (1 + S.stunPow)) e.stunT = Math.max(e.stunT, fx.stun[1] * cc);
    }
    kill(e, o) {
      if (e.dead) return;
      e.dead = true; e.hp = 0;
      const S = this.S, P = this.P;
      this.kills++;
      this.killsBy[e.id] = (this.killsBy[e.id] || 0) + 1;
      if (this.F) this.F.death(e);
      // butin
      const xp = e.xp * (this.mods.xpMul || 1);
      if (!e.d.child || Math.random() < 0.6) this.drop('xp', e.x, e.y, xp);
      this.loot.braise += xp * B.CFG.braisePerXp * (1 + this.biome * 0.35) * S.gold * (this.mods.lootMul || 1);
      const luck = 1 + S.luck;
      if (Math.random() < 0.09 * luck) this.drop('gold', e.x + 6, e.y, Math.ceil((1 + this.biome * 0.6) * (0.5 + Math.random())));
      if (Math.random() < 0.006 * luck * (this.mods.noHealDrops ? 0 : 1)) this.drop('heal', e.x, e.y - 6, 20);
      if (Math.random() < 0.0015 * luck) this.drop('magnet', e.x, e.y, 1);
      if (Math.random() < 0.004 * luck) this.drop('herb', e.x, e.y, 1);
      if (this.comp && this.comp.id === 'crow' && this.comp.lvl >= 4 && Math.random() < 0.06) this.drop('gold', e.x, e.y, 1);
      if (e.elite) {
        this.eliteKills++; this.elitesAlive = Math.max(0, (this.elitesAlive || 1) - 1);
        this.drop('chest', e.x, e.y, 1);
        this.loot.essence += 1 + Math.floor(this.biome * 0.8 + Math.random() * 2);
        this.loot.bois += 1 + Math.floor(Math.random() * 2 + this.biome * 0.5);
        if (e.elite === 'explosive') this.enemyBoom(e.x, e.y, 70, e.dmg * 1.2);
        if (e.elite === 'splitter' && !e.split2) for (let i = 0; i < 2; i++) { const c = this.spawnMob(e.id, e.x + (i ? 15 : -15), e.y); c.max = c.hp = e.max * 0.3; c.r = e.r * 0.75; c.split2 = 1; c.xp = e.xp * 0.1; }
      }
      if (e.boss) {
        this.bossKilled = e.id;
        this.loot.essence += 6 + this.biome * 6 + (e.d.guard ? 0 : 8 + this.biome * 4);
        this.loot.bois += 4 + this.biome * 2;
        this.drop('chest', e.x, e.y, 2);
        for (let i = 0; i < 14; i++) this.drop('gold', e.x + (Math.random() - 0.5) * 80, e.y + (Math.random() - 0.5) * 80, 2 + this.biome);
        if (this.F) { this.F.shake(16); this.F.flash('#fff', 0.6); this.F.sfx('bossdie'); }
        if (this.boss === e) this.boss = null;
        if (this.kind === 'endless') this.loot.essence += 2;
      }
      // déclencheurs
      if (e.d.beh === 'split' && e.d.p) for (let i = 0; i < e.d.p.k; i++) {
        const a = i / e.d.p.k * TAU;
        if (this.en.length < B.CFG.maxEnemies + 20) this.spawnMob(e.d.p.child, e.x + Math.cos(a) * 14, e.y + Math.sin(a) * 14, { vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 });
      }
      if (S.boom && Math.random() < S.boom) this.playerBoom(e.x, e.y, 58, (14 + this.RH.lvl * 2.2) * S.dmg, 'fire');
      if (S.flags.fireBoom && e.burnT > 0 && Math.random() < 0.5) this.playerBoom(e.x, e.y, 48, (8 + this.RH.lvl * 1.6) * S.dmg * (1 + S.fireDmg), 'fire');
      if (S.flags.shatter && e.frzT > 0) this.playerBoom(e.x, e.y, 55, (10 + this.RH.lvl * 2) * S.dmg * (1 + S.iceDmg), 'ice', { slow: [0.4, 1.5] });
      if (S.flags.plague && e.pois > 0) { const l = this.near(e.x, e.y, 90).slice(0, 3); for (const t of l) { t.pois = Math.min(12, t.pois + Math.ceil(e.pois / 2)); t.poisD = Math.max(t.poisD, e.poisD); t.poisT = 4; } }
      if (S.flags.lifelight) P.hp = Math.min(S.hp, P.hp + 1 * S.healPow);
      if (S.soulChance && Math.random() < S.soulChance) this.firePB(e.x, e.y, Math.random() * TAU, { dmg: (16 + this.RH.lvl * 2) * S.dmg * (1 + S.shadowDmg), spd: 300, pierce: 2, r: 8, home: 6, dur: 2.5, look: 'soul', elems: ['shadow'] }, null);
      for (const w of this.weap) if (w.p.grow) { w.extra = Math.min(8, (w.extra || 0) + 0.25); }
      if (this.RH.flags && this.RH.flags.killHeal) P.hp = Math.min(S.hp, P.hp + this.RH.flags.killHeal);
      P.sp = Math.min(1, P.sp + 0.004);
      if (this.mimic === e) this.mimicDead = true;
    }
    playerBoom(x, y, r, dmg, el, fx) {
      const list = this.near(x, y, r).slice();
      for (const e of list) this.hurt(e, dmg, { el: el, fx: fx, nocrit: 1 });
      if (this.F) this.F.boom(x, y, r, el);
    }
    enemyBoom(x, y, r, dmg, freeze) {
      const P = this.P;
      if (B.dist2(x, y, P.x, P.y) < (r + P.r) * (r + P.r)) this.hitPlayer(dmg, null, freeze ? { slow: 0.5, t: 2 } : null);
      if (this.F) this.F.boom(x, y, r, freeze ? 'ice' : 'enemy');
    }
    drop(type, x, y, v) {
      if (type === 'xp' && this.picks.length > 260) {
        // fusionne avec la gemme la plus proche
        let best = null, bd = 1e9;
        for (const p of this.picks) if (p.type === 'xp') { const d = B.dist2(x, y, p.x, p.y); if (d < bd) { bd = d; best = p; } }
        if (best) { best.v += v; return; }
      }
      this.picks.push({ type: type, x: x, y: y, v: v, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60 - 20, mag: false, t: 0 });
    }

    hitPlayer(dmg, src, eff) {
      const P = this.P, S = this.S;
      if (P.inv > 0 || P.dashT > 0 || this.over || this.outro > 0) return false;
      if (this.mods.god) return false;
      if (Math.random() < S.dodge) { if (this.F) this.F.text(P.x, P.y - 26, B.t('esquive'), '#bfe8ff'); P.inv = 0.25; return false; }
      if (P.aegis) { P.aegis = false; P.aegisT = Math.max(4, 16 - 2 * S.aegis); P.inv = 0.5; if (this.F) { this.F.text(P.x, P.y - 26, B.t('bloque'), '#ffe08a'); this.F.sfx('block'); } return false; }
      if (P.shield > 0) { P.shield--; P.inv = 0.5; if (this.F) { this.F.text(P.x, P.y - 26, B.t('bouclier'), '#9fe8a0'); this.F.sfx('block'); } return false; }
      let d = dmg * (1 - S.armorRed) * (this.mods.dmgIn || 1) * (S.dmgIn || 1);
      d = Math.max(1, d);
      P.hp -= d; P.inv = 0.55;
      this.dmgTaken += d;
      if (eff && eff.slow) { P.slowF = eff.slow; P.slowT = eff.t || 1.5; }
      if (src && S.thorns > 0) this.hurt(src, S.thorns * S.dmg * (1 + S.natureDmg), { el: 'nature', nocrit: 1 });
      if (src && src.elite === 'vampire') src.hp = Math.min(src.max, src.hp + d * 3);
      if (S.frostArmor && P.frostT <= 0) {
        P.frostT = 6;
        for (const e of this.near(P.x, P.y, 125).slice()) { e.frzT = Math.max(e.frzT, (e.boss ? 0.3 : 1.2)); this.hurt(e, (8 + S.frostArmor * 5) * S.dmg, { el: 'ice', nocrit: 1 }); }
        if (this.F) this.F.boom(P.x, P.y, 125, 'ice');
      }
      if (this.F) { this.F.playerHit(d); }
      return true;
    }
    playerDown() {
      const P = this.P, S = this.S;
      if (this.over) return;
      if (S.revive > (this.RH.revUsed || 0)) {
        this.RH.revUsed = (this.RH.revUsed || 0) + 1;
        P.hp = S.hp * 0.5; P.inv = 2.5;
        for (const e of this.near(P.x, P.y, 220).slice()) this.hurt(e, 60 * S.dmg, { kb: 300, ka: B.angTo(P.x, P.y, e.x, e.y), el: 'fire' });
        if (this.F) { this.F.boom(P.x, P.y, 220, 'fire'); this.F.text(P.x, P.y - 40, B.t('renait'), '#ffb43c'); this.F.sfx('revive'); }
        return;
      }
      P.hp = 0;
      this.over = 'lose';
      this.finish();
    }

    useSpecial() {
      const P = this.P, S = this.S;
      P.sp = 0;
      const H = B.HEROES.find(h => h.id === this.RH.hero);
      const pw = (1 + this.RH.lvl * 0.12) * S.dmg;
      const F = this.F;
      if (F) F.special(H.sp.id, P);
      switch (H.sp.id) {
        case 'flare':
          this.playerBoom(P.x, P.y, 230 * S.area, 0, 'light');
          for (const e of this.near(P.x, P.y, 230 * S.area).slice()) this.hurt(e, 45 * pw, { kb: 380, ka: B.angTo(P.x, P.y, e.x, e.y), el: 'light', fx: { burn: 0.6 } });
          this.lightBoost = 3; P.inv = Math.max(P.inv, 0.6);
          break;
        case 'rain':
          for (let i = 0; i < 26; i++) this.strikes.push({ x: P.x + (Math.random() - 0.5) * 380, y: P.y + (Math.random() - 0.5) * 380, t: -i * 0.09, delay: 0.25, r: 38, dmg: 22 * pw, look: 'arrowrain', el: 'nature', fx: null });
          break;
        case 'quake':
          for (const e of this.near(P.x, P.y, 210 * S.area).slice()) { e.stunT = Math.max(e.stunT, e.boss ? 0.6 : 2); this.hurt(e, 40 * pw, { kb: 200, ka: B.angTo(P.x, P.y, e.x, e.y), el: 'fire' }); }
          P.shield += 2; if (F) { F.boom(P.x, P.y, 210 * S.area, 'quake'); F.shake(12); }
          break;
        case 'cauldron':
          this.zones.push({ x: P.x, y: P.y, r: 165 * S.area, life: 6 * S.dur, max: 6 * S.dur, own: 'p', dmg: 14 * pw, tick: 0.35, tt: 0, look: 'poison', fx: { poison: 2 }, follow: 0 });
          break;
        case 'shadowstep': {
          const a = (Math.hypot(this.mx, this.my) > 0.1) ? Math.atan2(this.my, this.mx) : P.face;
          P.dashT = 0.24; P.dashA = a; P.inv = Math.max(P.inv, 0.9); P.critAll = 3;
          for (let i = 0; i < 8; i++) this.firePB(P.x, P.y, i / 8 * TAU, { dmg: 18 * pw, spd: 600, pierce: 3, r: 6, dur: 0.6, look: 'dagger', elems: ['shadow'] }, null);
          break;
        }
        case 'sanctuary':
          this.zones.push({ x: P.x, y: P.y, r: 150 * S.area, life: 6, max: 6, own: 'p', dmg: 12 * pw, tick: 0.5, tt: 0, look: 'holy', heal: 0.02, follow: 1 });
          break;
        case 'army':
          for (let i = 0; i < 8; i++) this.mins.push({ x: P.x, y: P.y, vx: 0, vy: 0, r: 10, cd: 0, dmg: 20 * pw, spd: 340, life: 8, look: 'soulbig', tgt: null, w: null, el: 'shadow' });
          break;
        case 'storm':
          for (let i = 0; i < 14; i++) {
            this.strikes.push({ tgtRand: 1, x: P.x, y: P.y, t: -i * 0.2, delay: 0.1, r: 40, dmg: 40 * pw, look: 'thunder', el: 'bolt', fx: { stun: [0.6, 0.6] } });
          }
          break;
      }
      if (this.RH.flags && this.RH.flags.specialHeal) P.hp = Math.min(S.hp, P.hp + S.hp * 0.1);
    }

    updateSynergies(dt) {
      const S = this.S, P = this.P;
      if (S.flags.iceNova) { this.synT.ice += dt; if (this.synT.ice > 6) { this.synT.ice = 0; for (const e of this.near(P.x, P.y, 160 * S.area).slice()) { e.frzT = Math.max(e.frzT, e.boss ? 0.3 : 1.1); this.hurt(e, (12 + this.RH.lvl * 1.5) * S.dmg * (1 + S.iceDmg), { el: 'ice', nocrit: 1 }); } if (this.F) this.F.boom(P.x, P.y, 160 * S.area, 'ice'); } }
      if (S.flags.skyBolt) { this.synT.bolt += dt; if (this.synT.bolt > 2.5) { this.synT.bolt = 0; for (let i = 0; i < 3; i++) this.strikes.push({ tgtRand: 1, x: P.x, y: P.y, t: -i * 0.12, delay: 0.1, r: 34, dmg: (20 + this.RH.lvl * 3) * S.dmg * (1 + S.boltDmg), look: 'thunder', el: 'bolt' }); } }
      if (S.flags.echo) { this.synT.echo += dt; if (this.synT.echo > 8) { this.synT.echo = 0; for (const w of this.weap) if (w.p.cd) w.t = Math.min(w.t, 0.02); if (this.F) this.F.text(P.x, P.y - 34, 'Écho !', '#ff7ad9'); } }
      if (this.lightBoost > 0) this.lightBoost -= dt;
    }
    lightR() { return this.S.light * this.lightMul * (this.lightBoost > 0 ? 1.4 : 1) * (this.mods.lightMul || 1); }

    // ───── Compagnon ─────
    updateCompanion(dt) {
      const c = this.comp; if (!c) return;
      const P = this.P, S = this.S;
      const tx = P.x - Math.cos(P.face) * 34 + Math.sin(this.t * 2) * 8, ty = P.y - Math.sin(P.face) * 34 - 14;
      let gx = tx, gy = ty;
      c.t -= dt; c.t2 -= dt;
      const pw = (1 + c.lvl * 0.15) * S.dmg * (1 + this.RH.lvl * 0.04) * (this.RH.comp.pw || 1);
      if (c.id === 'fox') {
        let best = null, bd = 200 * 200;
        for (const p of this.picks) { if (p.type === 'chest') continue; const d = B.dist2(c.x, c.y, p.x, p.y); if (d < bd) { bd = d; best = p; } }
        if (best) { gx = best.x; gy = best.y; if (bd < 400) best.mag = true; }
        if (c.lvl >= 4 && c.t2 <= 0) { const e = this.nearest(c.x, c.y, 60); if (e) { this.hurt(e, 12 * pw, { el: 'nature' }); c.t2 = 1; } }
      }
      const d = Math.hypot(gx - c.x, gy - c.y);
      const sp = Math.min(d * 6, c.id === 'fox' ? 420 : 300);
      if (d > 1) { c.x += (gx - c.x) / d * sp * dt; c.y += (gy - c.y) / d * sp * dt; }
      if (c.id === 'firefly' && c.t <= 0) {
        c.t = 1.2; const e = this.nearest(c.x, c.y, 360);
        if (e) { const a = B.angTo(c.x, c.y, e.x, e.y); const k = c.lvl >= 8 ? 2 : 1; for (let i = 0; i < k; i++) this.firePB(c.x, c.y, a + (i - (k - 1) / 2) * 0.2, { dmg: 7 * pw, spd: 420, pierce: 1, r: 5, dur: 1.2, look: 'shard', elems: ['light'] }, null); }
      }
      if (c.id === 'salamander' && this.moving) {
        c.trail -= dt;
        if (c.trail <= 0) { c.trail = 0.35; this.zones.push({ x: c.x, y: c.y + 10, r: 22, life: c.lvl >= 8 ? 3 : 1.8, max: 2, own: 'p', dmg: (4 + c.lvl) * S.dmg * (1 + S.fireDmg), tick: 0.4, tt: 0, look: 'fire', fx: { burn: 0.3 } }); }
      }
      if (c.id === 'crow' && c.t <= 0) {
        c.t = 0.8; const k = c.lvl >= 8 ? 2 : 1;
        for (let i = 0; i < k; i++) { const e = this.randomEnemy(P.x, P.y, 260); if (e) { this.hurt(e, (8 + c.lvl * 2) * pw / (1 + c.lvl * 0.15), { el: 'shadow' }); if (this.F) this.F.peck(c.x, c.y, e.x, e.y); } }
      }
      if (c.id === 'cat' && c.lvl >= 8 && c.t <= 0) { c.t = 1; const e = this.nearest(P.x, P.y, 120); if (e) this.hurt(e, 14 * pw, { el: 'shadow', crit: 0.3 }); }
      if (c.id === 'turtle' && c.lvl >= 4) { c.t2 = c.t2 > 0 ? c.t2 : 0; if (c.t2 <= 0 && P.shield < 1) { P.shield = 1; c.t2 = c.lvl >= 8 ? 12 : 20; if (this.F) this.F.text(P.x, P.y - 30, B.t('bouclier'), '#9fe8a0'); } }
      if (c.id === 'drake' && c.t <= 0) {
        c.t = 2; const e = this.nearest(c.x, c.y, 220);
        if (e) {
          const a = B.angTo(c.x, c.y, e.x, e.y), w = c.lvl >= 8 ? 0.7 : 0.45;
          for (const t of this.near(c.x, c.y, 200).slice()) { let da = Math.abs(((B.angTo(c.x, c.y, t.x, t.y) - a + Math.PI * 3) % TAU) - Math.PI); if (da < w) this.hurt(t, (10 + c.lvl * 3) * pw / (1 + c.lvl * 0.15), { el: 'fire', fx: { burn: 0.5 } }); }
          if (this.F) this.F.cone(c.x, c.y, a, w, 200, 'fire');
        }
      }
    }

    // ───── Projectiles du joueur ─────
    firePB(x, y, a, p, w) {
      const spd = p.spd || 400;
      const b = { x: x, y: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, spd: spd, r: p.r || 6, dmg: p.dmg, pierce: p.pierce || 1, life: p.dur || 1.5, p: p, w: w, hit: [], look: p.look, a: a, t: 0, bounce: p.bounce || 0, curve: p.curve || 0, tk: 0 };
      this.pb.push(b);
      return b;
    }
    updatePB(dt) {
      const S = this.S;
      for (const b of this.pb) {
        if (b.dead) continue;
        b.t += dt; b.life -= dt;
        if (b.life <= 0) { b.dead = true; if (b.p.explode && b.p.boomEnd) this.explodePB(b); continue; }
        const p = b.p;
        if (b.boom) { // boomerang
          b.bt += dt;
          const out = b.bt < b.half;
          if (out) { b.x += b.vx * dt * (1 - b.bt / b.half * 0.7); b.y += b.vy * dt * (1 - b.bt / b.half * 0.7); }
          else { const P = this.P; const a = B.angTo(b.x, b.y, P.x, P.y); b.x += Math.cos(a) * b.spd * 1.25 * dt; b.y += Math.sin(a) * b.spd * 1.25 * dt; if (B.dist2(b.x, b.y, P.x, P.y) < 400) { b.dead = true; continue; } }
          b.a += dt * 14;
        } else {
          if (p.home) {
            const e = this.nearest(b.x, b.y, 300);
            if (e) { const ta = B.angTo(b.x, b.y, e.x, e.y); let da = ((ta - b.a + Math.PI * 3) % TAU) - Math.PI; b.a += clamp(da, -p.home * dt, p.home * dt); b.vx = Math.cos(b.a) * b.spd; b.vy = Math.sin(b.a) * b.spd; }
          }
          if (b.curve) { b.a += b.curve * dt; b.vx = Math.cos(b.a) * b.spd; b.vy = Math.sin(b.a) * b.spd; }
          if (p.wander) { b.a += (Math.random() - 0.5) * 6 * dt; b.vx = Math.cos(b.a) * b.spd; b.vy = Math.sin(b.a) * b.spd; }
          b.x += b.vx * dt; b.y += b.vy * dt;
        }
        if (b.x < -50 || b.y < -50 || b.x > this.W + 50 || b.y > this.H + 50) { b.dead = true; continue; }
        // tornade / boomerang : touches répétées
        if (p.tick || b.boom) {
          b.tk -= dt;
          if (p.pull) for (const e of this.near(b.x, b.y, b.r + 70)) { if (e.boss) continue; const a = B.angTo(e.x, e.y, b.x, b.y); e.x += Math.cos(a) * p.pull * dt; e.y += Math.sin(a) * p.pull * dt; }
          if (b.tk <= 0) {
            b.tk = p.tick || 0.3;
            for (const e of this.near(b.x, b.y, b.r).slice()) this.hurt(e, b.dmg, { el: p.elems[0], fx: p.fx, crit: p.crit, base: p.dmg });
          }
          continue;
        }
        const list = this.near(b.x, b.y, b.r);
        for (const e of list) {
          if (b.hit.indexOf(e.uid) >= 0) continue;
          b.hit.push(e.uid);
          this.hurt(e, b.dmg, { el: p.elems && p.elems[0], fx: p.fx, crit: p.crit, kb: 40 * S.knock, ka: b.a, base: p.dmg });
          if (p.explode) this.explodePB(b);
          if (p.sporecloud) this.zones.push({ x: b.x, y: b.y, r: 40 * S.area, life: 2 * S.dur, max: 2, own: 'p', dmg: p.dmg * 0.4, tick: 0.4, tt: 0, look: 'poison', fx: { poison: 1 } });
          if (b.bounce > 0) {
            b.bounce--;
            const n = this.nearest(b.x, b.y, 260, b.hit);
            if (n) { b.a = B.angTo(b.x, b.y, n.x, n.y); b.vx = Math.cos(b.a) * b.spd; b.vy = Math.sin(b.a) * b.spd; b.life = Math.max(b.life, 0.8); continue; }
          }
          b.pierce--;
          if (b.pierce <= 0) { b.dead = true; break; }
        }
      }
    }
    explodePB(b) {
      const p = b.p, S = this.S;
      this.playerBoom(b.x, b.y, p.explode, p.dmg * 0.6, p.elems[0], p.fx);
      if (p.firepool) this.zones.push({ x: b.x, y: b.y, r: p.explode * 0.6, life: 2.5 * S.dur, max: 2.5, own: 'p', dmg: p.dmg * 0.25, tick: 0.4, tt: 0, look: 'fire', fx: { burn: 0.3 } });
    }

    // Éclair en chaîne
    chainFrom(e0, dmg, n, range, o, fork) {
      const hit = [e0.uid];
      const pts = [[e0.x, e0.y]];
      this.hurt(e0, dmg, o);
      let cur = e0;
      for (let i = 0; i < n; i++) {
        const nx = this.nearest(cur.x, cur.y, range, hit);
        if (!nx) break;
        hit.push(nx.uid); pts.push([nx.x, nx.y]);
        this.hurt(nx, dmg * 0.92, o);
        if (fork && i % 2 === 0) { const f = this.nearest(nx.x, nx.y, range * 0.8, hit); if (f) { hit.push(f.uid); this.hurt(f, dmg * 0.8, o); if (this.F) this.F.bolt([[nx.x, nx.y], [f.x, f.y]], '#bfe8ff'); } }
        cur = nx;
      }
      if (this.F) this.F.bolt(pts, '#ffe14d');
    }

    updateStrikes(dt) {
      for (const s of this.strikes) {
        if (s.dead) continue;
        s.t += dt;
        if (s.t < 0) continue;
        if (s.tgtRand && !s.placed) {
          s.placed = true;
          const e = this.randomEnemy(this.P.x, this.P.y, 330);
          if (e) { s.x = e.x; s.y = e.y; } else { s.x = this.P.x + (Math.random() - 0.5) * 300; s.y = this.P.y + (Math.random() - 0.5) * 300; }
          if (this.F) this.F.strikeStart(s);
        } else if (!s.placed) { s.placed = true; if (this.F) this.F.strikeStart(s); }
        if (s.t >= s.delay) {
          s.dead = true;
          for (const e of this.near(s.x, s.y, s.r).slice()) this.hurt(e, s.dmg, { el: s.el, fx: s.fx, crit: s.crit || 0 });
          if (this.F) this.F.strikeHit(s);
        }
      }
    }

    // ───── Serviteurs (feux follets, loups, âmes) ─────
    updateMins(dt) {
      const P = this.P;
      for (const m of this.mins) {
        if (m.dead) continue;
        if (m.life !== undefined) { m.life -= dt; if (m.life <= 0) { m.dead = true; continue; } }
        m.cd -= dt;
        if (!m.tgt || m.tgt.dead || m.tgt.untarget || B.dist2(m.tgt.x, m.tgt.y, P.x, P.y) > 420 * 420) m.tgt = this.nearest(m.x, m.y, 320);
        let gx, gy;
        if (m.tgt) { gx = m.tgt.x; gy = m.tgt.y; }
        else { const a = this.t * 1.5 + (m.idx || 0); gx = P.x + Math.cos(a) * 50; gy = P.y + Math.sin(a) * 50; }
        const d = Math.hypot(gx - m.x, gy - m.y);
        if (d > 2) { const sp = m.spd * (m.tgt ? 1 : 0.8); m.vx += ((gx - m.x) / d * sp - m.vx) * Math.min(1, dt * 6); m.vy += ((gy - m.y) / d * sp - m.vy) * Math.min(1, dt * 6); }
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.tgt && m.cd <= 0 && d < m.r + m.tgt.r + 6) {
          m.cd = m.acd || 0.7;
          this.hurt(m.tgt, m.dmg, { el: m.el, kb: 60, ka: Math.atan2(m.vy, m.vx), crit: m.crit || 0 });
          m.vx *= -0.6; m.vy *= -0.6;
          if (this.F) this.F.minHit(m);
        }
      }
    }

    // ───── Ennemis ─────
    updateEnemies(dt) {
      const P = this.P;
      for (const e of this.en) {
        if (e.dead) continue;
        e.ph += dt;
        if (e.flash > 0) e.flash -= dt;
        // états
        if (e.burnT > 0) { e.burnT -= dt; e.btk = (e.btk || 0) + dt; if (e.btk >= 0.5) { e.btk = 0; this.hurt(e, e.burn * 0.5, { el: 'fire', nocrit: 1 }); if (e.dead) continue; } }
        if (e.poisT > 0) { e.poisT -= dt; e.ptk = (e.ptk || 0) + dt; if (e.ptk >= 0.5) { e.ptk = 0; this.hurt(e, e.pois * e.poisD * 0.5, { el: 'poison', nocrit: 1 }); if (e.dead) continue; } } else e.pois = 0;
        if (e.slowT > 0) e.slowT -= dt; else e.slowF = 0;
        if (e.frzT > 0) { e.frzT -= dt; }
        if (e.stunT > 0) { e.stunT -= dt; }
        // recul
        if (e.vx || e.vy) { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= Math.pow(0.02, dt); e.vy *= Math.pow(0.02, dt); if (Math.abs(e.vx) + Math.abs(e.vy) < 3) e.vx = e.vy = 0; }
        if (e.frzT > 0 || e.stunT > 0) { this.contact(e); continue; }
        let sm = (1 - e.slowF) * (this.mods.enemySpd || 1);
        if (e.elite === 'berserk') sm *= 1 + (1 - e.hp / e.max) * 0.8;
        if (e.boss) this.bossAI(e, dt, sm); else this.mobAI(e, dt, sm);
        // éloignés : on les rapproche
        if (!e.boss && B.dist2(e.x, e.y, P.x, P.y) > 820 * 820 && this.kind !== 'mimic') { const [x, y] = this.spawnPos(); e.x = x; e.y = y; }
        e.x = clamp(e.x, 10, this.W - 10); e.y = clamp(e.y, 10, this.H - 10);
        if (e.elite === 'frozen' && B.dist2(e.x, e.y, P.x, P.y) < 120 * 120) { P.slowF = Math.max(P.slowF, 0.3); P.slowT = Math.max(P.slowT, 0.2); }
        if (e.elite === 'shielded') { e.shtk = (e.shtk || 0) + dt; if (e.shtk > 5) { e.shtk = 0; e.shield = Math.max(e.shield, e.max * 0.2); } }
        this.contact(e);
      }
      // séparation légère
      for (const e of this.en) {
        if (e.dead || e.untarget || e.boss) continue;
        const l = this.near(e.x, e.y, e.r);
        for (let i = 0; i < l.length && i < 6; i++) {
          const o = l[i]; if (o === e || o.boss) continue;
          const dx = e.x - o.x, dy = e.y - o.y; const d = Math.hypot(dx, dy) || 1; const ov = e.r + o.r - d;
          if (ov > 0) { const k = ov * 0.25 / d; e.x += dx * k; e.y += dy * k; o.x -= dx * k; o.y -= dy * k; }
        }
      }
    }
    contact(e) {
      if (e.untarget || e.z > 5) return;
      const P = this.P; const rr = e.r * 0.85 + P.r;
      if (B.dist2(e.x, e.y, P.x, P.y) < rr * rr) this.hitPlayer(e.dmg, e);
    }
    moveTo(e, tx, ty, spd, dt) {
      const dx = tx - e.x, dy = ty - e.y; const d = Math.hypot(dx, dy) || 1;
      e.x += dx / d * spd * dt; e.y += dy / d * spd * dt;
      if (Math.abs(dx) > 2) e.face = dx > 0 ? 1 : -1;
      return d;
    }
    shootE(x, y, a, spd, dmg, o) {
      const b = { x: x, y: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: (o && o.r) || 7, dmg: dmg, life: (o && o.life) || 4, look: (o && o.look) || 'orb', col: (o && o.col) || null, slow: o && o.slow, a: a, t: 0 };
      this.eb.push(b);
      return b;
    }
    mobAI(e, dt, sm) {
      const P = this.P, d = e.d, p = d.p || {};
      const dist = Math.hypot(P.x - e.x, P.y - e.y);
      const spd = e.spd * sm;
      const ang = Math.atan2(P.y - e.y, P.x - e.x);
      e.cd -= dt; e.t -= dt;
      const col = B.BIOMES[Math.max(0, d.b)] ? B.BIOMES[Math.max(0, d.b)].pal.acc : '#f55';
      switch (d.beh) {
        case 'chase': case 'tank': this.moveTo(e, P.x, P.y, spd, dt); break;
        case 'swarm': {
          const w = Math.sin(e.ph * 4 + e.uid) * 0.6;
          e.x += Math.cos(ang + w) * spd * dt; e.y += Math.sin(ang + w) * spd * dt; e.face = Math.cos(ang) > 0 ? 1 : -1;
          break;
        }
        case 'trail':
          this.moveTo(e, P.x, P.y, spd, dt);
          if (e.cd <= 0) { e.cd = 0.8; this.zones.push({ x: e.x, y: e.y, r: 24, life: 3.5, max: 3.5, own: 'e', dmg: e.dmg * 0.35, tick: 0.5, tt: 0, look: 'ooze' }); }
          break;
        case 'flyer': {
          if (e.st === 'dive') { e.x += Math.cos(e.a) * spd * 2.6 * dt; e.y += Math.sin(e.a) * spd * 2.6 * dt; if (e.t <= 0) { e.st = 'move'; e.cd = 2.5 + Math.random(); } }
          else {
            const w = Math.sin(e.ph * 2.2 + e.uid) * 0.9;
            e.x += Math.cos(ang + w) * spd * 0.8 * dt; e.y += Math.sin(ang + w) * spd * 0.8 * dt;
            if (e.cd <= 0 && dist < 260) { e.st = 'dive'; e.a = ang; e.t = 0.5; }
          }
          e.face = Math.cos(ang) > 0 ? 1 : -1;
          break;
        }
        case 'charge':
          if (e.st === 'move') { this.moveTo(e, P.x, P.y, spd, dt); if (e.cd <= 0 && dist < 250) { e.st = 'aim'; e.t = 0.75; e.a = ang; this.tele.push({ k: 'line', x: e.x, y: e.y, a: ang, len: 340, w: e.r * 1.6, t: 0, delay: 0.75, vis: 1, fake: 1, src: e }); } }
          else if (e.st === 'aim') { if (e.t <= 0) { e.st = 'dash'; e.t = 0.5; } }
          else if (e.st === 'dash') { e.x += Math.cos(e.a) * spd * 5.5 * dt; e.y += Math.sin(e.a) * spd * 5.5 * dt; if (e.t <= 0) { e.st = 'rest'; e.t = 0.5; } }
          else if (e.st === 'rest') { if (e.t <= 0) { e.st = 'move'; e.cd = 2.2 + Math.random() * 1.2; } }
          break;
        case 'shoot': {
          const R = p.range || 220;
          if (dist > R) this.moveTo(e, P.x, P.y, spd, dt);
          else if (dist < R * 0.6) this.moveTo(e, e.x * 2 - P.x, e.y * 2 - P.y, spd * 0.8, dt);
          else { e.x += Math.cos(ang + Math.PI / 2) * spd * 0.4 * dt * (e.uid % 2 ? 1 : -1); e.y += Math.sin(ang + Math.PI / 2) * spd * 0.4 * dt * (e.uid % 2 ? 1 : -1); }
          if (e.cd <= 0 && dist < R * 1.2) {
            e.cd = p.cd || 2.4;
            const n = p.n || 1, sp = p.spread || 0.2;
            for (let i = 0; i < n; i++) this.shootE(e.x, e.y, ang + (i - (n - 1) / 2) * sp, p.bspd || 200, e.dmg, { look: p.slow ? 'web' : (d.b === 3 ? 'ice' : 'orb'), slow: p.slow ? 0.45 : 0, col: col });
            if (this.F) this.F.sfx('eshoot');
          }
          e.face = Math.cos(ang) > 0 ? 1 : -1;
          break;
        }
        case 'radial':
          this.moveTo(e, P.x, P.y, spd, dt);
          if (e.cd <= 0 && dist < 380) {
            e.cd = p.cd || 3; const n = p.n || 8; e.a = (e.a || 0) + (p.spin ? 0.3 : 0.5);
            for (let i = 0; i < n; i++) this.shootE(e.x, e.y, e.a + i / n * TAU, p.bspd || 130, e.dmg, { look: d.b === 3 ? 'ice' : (d.b === 0 ? 'spore' : 'orb'), slow: p.slow ? 0.35 : 0, col: col });
          }
          break;
        case 'bomber':
          if (e.st === 'move') { this.moveTo(e, P.x, P.y, spd, dt); if (dist < e.r + P.r + 22) { e.st = 'fuse'; e.t = 0.55; this.tele.push({ k: 'circle', x: e.x, y: e.y, r: p.boom || 55, t: 0, delay: 0.55, vis: 1, fake: 1, src: e }); } }
          else if (e.st === 'fuse') { if (e.t <= 0) { this.enemyBoom(e.x, e.y, p.boom || 55, e.dmg, p.freeze); e.xp *= 0.5; this.kill(e); } }
          break;
        case 'split': this.moveTo(e, P.x, P.y, spd, dt); break;
        case 'summon': {
          const R = p.range || 250;
          if (dist > R) this.moveTo(e, P.x, P.y, spd, dt); else if (dist < R * 0.7) this.moveTo(e, e.x * 2 - P.x, e.y * 2 - P.y, spd * 0.7, dt);
          if (e.cd <= 0 && this.en.length < B.CFG.maxEnemies) { e.cd = p.cd || 6; for (let i = 0; i < (p.k || 3); i++) { const a = Math.random() * TAU; this.spawnMob(p.child, e.x + Math.cos(a) * 30, e.y + Math.sin(a) * 30); } if (this.F) this.F.puff(e.x, e.y, '#9aff4a'); }
          break;
        }
        case 'blink':
          if (e.st === 'move') { this.moveTo(e, P.x, P.y, spd, dt); if (e.cd <= 0 && dist > 90) { e.st = 'fade'; e.t = 0.35; } }
          else if (e.st === 'fade') { e.alpha = Math.max(0, e.t / 0.35); if (e.t <= 0) { const a = Math.random() * TAU, r = 120 + Math.random() * 70; e.x = clamp(P.x + Math.cos(a) * r, 20, this.W - 20); e.y = clamp(P.y + Math.sin(a) * r, 20, this.H - 20); e.st = 'appear'; e.t = 0.35; e.untarget = true; if (this.F) this.F.puff(e.x, e.y, '#c8b0ff'); } else e.untarget = e.t < 0.15; }
          else if (e.st === 'appear') { e.alpha = 1 - e.t / 0.35; e.untarget = e.t > 0.2; if (e.t <= 0) { e.st = 'move'; e.alpha = 1; e.untarget = false; e.cd = (p.cd || 3) + Math.random(); if (p.shoot) for (let i = -1; i <= 1; i++) this.shootE(e.x, e.y, ang + i * 0.25, 190, e.dmg, { col: col }); } }
          break;
        case 'burrow':
          if (e.st === 'under') { e.untarget = true; this.moveTo(e, P.x, P.y, spd * 1.35, dt); if (dist < 26) { e.st = 'emerge'; e.t = 0.6; this.tele.push({ k: 'circle', x: e.x, y: e.y, r: 42, t: 0, delay: 0.6, dmg: e.dmg, src: e, vis: 1 }); } }
          else if (e.st === 'emerge') { if (e.t <= 0) { e.st = 'up'; e.t = 2.6; e.untarget = false; if (this.F) this.F.puff(e.x, e.y, '#8a6a3a'); } }
          else if (e.st === 'up') { this.moveTo(e, P.x, P.y, spd * 0.6, dt); if (e.t <= 0) { e.st = 'under'; e.untarget = true; } }
          break;
        case 'healer': {
          const R = p.range || 180;
          if (dist > R + 40) this.moveTo(e, P.x, P.y, spd, dt); else if (dist < R) this.moveTo(e, e.x * 2 - P.x, e.y * 2 - P.y, spd * 0.8, dt);
          if (e.cd <= 0) { e.cd = p.cd || 4; for (const o of this.near(e.x, e.y, 170)) if (o !== e && !o.boss) { o.shield = Math.min(o.max * 0.6, o.shield + o.max * 0.3); } if (this.F) this.F.ring(e.x, e.y, 170, '#ffcf4a'); }
          break;
        }
        case 'leap':
          if (e.st === 'move') { this.moveTo(e, P.x, P.y, spd * 0.5, dt); if (e.cd <= 0 && dist < (p.range || 260)) { e.st = 'crouch'; e.t = 0.35; e.tx = P.x; e.ty = P.y; } }
          else if (e.st === 'crouch') { if (e.t <= 0) { e.st = 'air'; e.t = 0.7; e.sx = e.x; e.sy = e.y; this.tele.push({ k: 'circle', x: e.tx, y: e.ty, r: e.r * 2.6, t: 0, delay: 0.7, dmg: e.dmg, src: e, vis: 1 }); } }
          else if (e.st === 'air') { const k = 1 - e.t / 0.7; e.x = B.lerp(e.sx, e.tx, k); e.y = B.lerp(e.sy, e.ty, k); e.z = Math.sin(k * Math.PI) * 60; if (e.t <= 0) { e.z = 0; e.st = 'move'; e.cd = (p.cd || 3) + Math.random(); if (this.F) this.F.shake(3); } }
          break;
        default: this.moveTo(e, P.x, P.y, spd, dt);
      }
    }

    // ───── Boss ─────
    bossAI(e, dt, sm) {
      const P = this.P, d = e.d;
      const dist = Math.hypot(P.x - e.x, P.y - e.y);
      const hpk = e.hp / e.max;
      // phases
      const nph = d.ph3 ? (hpk < 0.33 ? 3 : hpk < 0.66 ? 2 : 1) : (hpk < 0.5 ? 2 : 1);
      if (nph !== e.phase) { e.phase = nph; e.cd = 1; if (this.F) { this.F.text(e.x, e.y - e.r - 20, B.t('enrage'), '#ff5a3c'); this.F.shake(8); this.F.sfx('roar'); } for (const o of this.en) if (!o.boss && !o.dead && B.dist2(o.x, o.y, e.x, e.y) < 200 * 200) o.vx += (o.x - e.x); }
      if (e.act) { this.bossAct(e, dt); return; }
      // déplacement de base
      const keep = d.spd === 0 ? 0 : 170;
      if (d.spd > 0) {
        if (dist > keep + 40) this.moveTo(e, P.x, P.y, e.spd * sm * (e.phase > 1 ? 1.2 : 1), dt);
        else if (dist < keep - 40) this.moveTo(e, e.x * 2 - P.x, e.y * 2 - P.y, e.spd * sm * 0.6, dt);
        else { const a = Math.atan2(P.y - e.y, P.x - e.x) + Math.PI / 2; e.x += Math.cos(a) * e.spd * 0.5 * dt; e.y += Math.sin(a) * e.spd * 0.5 * dt; }
      }
      e.face = P.x > e.x ? 1 : -1;
      e.cd -= dt * (this.mods.bossFast ? 1.25 : 1);
      if (e.cd <= 0) {
        const list = e.phase === 3 ? d.ph3 : e.phase === 2 ? d.ph2 : d.atk;
        const atk = this.rng.weighted(list, a => a.w * (e.lastAtk === a.t ? 0.35 : 1));
        e.lastAtk = atk.t;
        e.act = { a: atk, t: 0, i: 0, n: 0 };
        e.cd = (e.phase === 1 ? 2.0 : 1.5) - this.biome * 0.08;
        if (this.F) this.F.bossCast(e, atk.t);
      }
    }
    bossAct(e, dt) {
      const P = this.P, A = e.act, a = A.a;
      A.t += dt;
      const col = B.BIOMES[Math.max(0, e.d.b)].pal.acc;
      const ang = Math.atan2(P.y - e.y, P.x - e.x);
      const end = () => { e.act = null; e.st = 'idle'; e.untarget = false; e.alpha = 1; e.z = 0; };
      const bd = e.dmg * 0.8;
      switch (a.t) {
        case 'radial': {
          const rep = a.rep || 1;
          if (A.t >= A.i * 0.45 && A.i < rep) {
            const n = a.n, off = A.i * 0.5 * (TAU / n) + (A.off || (A.off = Math.random() * TAU));
            const gapA = a.gap ? Math.floor(Math.random() * n) : -10;
            for (let i = 0; i < n; i++) { if (a.gap && Math.abs(i - gapA) <= 1) continue; this.shootE(e.x, e.y, off + i / n * TAU, a.bspd, bd, { r: 8, col: col }); }
            A.i++; if (this.F) this.F.sfx('eshoot2');
          }
          if (A.i >= rep && A.t > rep * 0.45) end();
          break;
        }
        case 'aimed': {
          const rep = a.rep || 1;
          if (A.t >= A.i * 0.32 && A.i < rep) {
            const n = a.n || 1, sp = a.spread || 0.2;
            for (let i = 0; i < n; i++) this.shootE(e.x, e.y, ang + (i - (n - 1) / 2) * (n > 1 ? sp / (n - 1) * 2 : 0), a.bspd, a.big ? e.dmg : bd, { r: a.big ? 18 : a.wave ? 16 : 8, look: a.big ? 'boulder' : a.wave ? 'wave' : 'orb', col: col, life: 5 });
            A.i++; if (this.F) this.F.sfx('eshoot');
          }
          if (A.i >= rep && A.t > rep * 0.32 + 0.2) end();
          break;
        }
        case 'spiral': {
          A.acc = (A.acc || 0) + dt;
          while (A.acc >= a.rate) {
            A.acc -= a.rate; A.n++;
            const base = A.n * 0.23 * (e.uid % 2 ? 1 : -1);
            for (let i = 0; i < a.arms; i++) this.shootE(e.x, e.y, base + i / a.arms * TAU, a.bspd, bd * 0.8, { r: 7, col: col });
          }
          if (A.t >= a.dur) end();
          break;
        }
        case 'charge': {
          const n = a.n || 1;
          if (!A.ph) { A.ph = 'aim'; A.pt = 0; A.ang = ang; this.tele.push({ k: 'line', x: e.x, y: e.y, a: ang, len: 600, w: e.r * 1.8, t: 0, delay: 0.7, vis: 1, fake: 1, src: e }); }
          A.pt += dt;
          if (A.ph === 'aim' && A.pt > 0.7) { A.ph = 'dash'; A.pt = 0; }
          else if (A.ph === 'dash') { e.x += Math.cos(A.ang) * 720 * dt; e.y += Math.sin(A.ang) * 720 * dt; if (A.pt > 0.6 || e.x < 40 || e.y < 40 || e.x > this.W - 40 || e.y > this.H - 40) { A.ph = 'rest'; A.pt = 0; if (this.F) this.F.shake(5); } }
          else if (A.ph === 'rest' && A.pt > 0.35) { A.n++; if (A.n >= n) end(); else { A.ph = null; } }
          break;
        }
        case 'slam': {
          const n = a.n || 1;
          if (A.t >= A.i * 1.1 && A.i < n) { this.tele.push({ k: 'circle', x: e.x, y: e.y, r: a.r, t: 0, delay: 1.0, dmg: e.dmg * 1.2, vis: 1, shock: 1 }); A.i++; }
          if (A.t > n * 1.1 + 0.2) end();
          break;
        }
        case 'target': {
          const k = a.k || 4;
          if (A.t >= A.i * 0.28 && A.i < k) { this.tele.push({ k: 'circle', x: P.x + this.mx * 50, y: P.y + this.my * 50, r: a.r || 50, t: 0, delay: a.delay || 0.9, dmg: e.dmg, vis: 1, spike: e.d.b }); A.i++; }
          if (A.i >= k && A.t > k * 0.28 + 0.3) end();
          break;
        }
        case 'line': {
          const k = a.k || 3;
          if (!A.done) {
            A.done = 1;
            for (let i = 0; i < k; i++) { const off = (i - (k - 1) / 2) * (a.tongue ? 0 : 0.45); this.tele.push({ k: 'line', x: e.x, y: e.y, a: ang + off, len: a.tongue ? 380 : 900, w: a.tongue ? 30 : 36, t: 0, delay: a.tongue ? 0.55 : 1.0, dmg: e.dmg, vis: 1 }); }
          }
          if (A.t > 1.2) end();
          break;
        }
        case 'summon':
          if (!A.done) { A.done = 1; const k = Math.min(a.k, Math.max(0, B.CFG.maxEnemies - this.en.length)); for (let i = 0; i < k; i++) { const aa = i / a.k * TAU; this.spawnMob(a.m, clamp(e.x + Math.cos(aa) * 70, 20, this.W - 20), clamp(e.y + Math.sin(aa) * 70, 20, this.H - 20)); } if (this.F) this.F.puff(e.x, e.y, col); }
          if (A.t > 0.6) end();
          break;
        case 'leap': {
          const n = a.n || 1;
          if (!A.ph) { A.ph = 'crouch'; A.pt = 0; }
          A.pt += dt;
          if (A.ph === 'crouch' && A.pt > 0.3) { A.ph = 'air'; A.pt = 0; A.sx = e.x; A.sy = e.y; A.tx = P.x; A.ty = P.y; e.untarget = true; this.tele.push({ k: 'circle', x: P.x, y: P.y, r: e.r * 2.3, t: 0, delay: 0.85, dmg: e.dmg * 1.2, vis: 1, shock: 1 }); }
          else if (A.ph === 'air') { const k = Math.min(1, A.pt / 0.85); e.x = B.lerp(A.sx, A.tx, k); e.y = B.lerp(A.sy, A.ty, k); e.z = Math.sin(k * Math.PI) * 120; if (k >= 1) { e.z = 0; e.untarget = false; A.ph = 'land'; A.pt = 0; for (let i = 0; i < 10; i++) this.shootE(e.x, e.y, i / 10 * TAU, 150, bd * 0.7, { col: col }); } }
          else if (A.ph === 'land' && A.pt > 0.4) { A.n++; if (A.n >= n) end(); else A.ph = 'crouch', A.pt = 0; }
          break;
        }
        case 'cone': {
          if (!A.done) { A.done = 1; A.ang = ang; this.tele.push({ k: 'cone', x: e.x, y: e.y, a: ang, w: a.wide ? 0.75 : 0.5, len: 360, t: 0, delay: 0.9, dmg: e.dmg * 1.1, vis: 1, slow: a.ice ? 0.5 : 0, src: e }); }
          if (A.t > 0.9 && !A.sp) { A.sp = 1; for (let i = 0; i < 12; i++) this.shootE(e.x, e.y, A.ang + (Math.random() - 0.5) * (a.wide ? 1.5 : 1), 200 + Math.random() * 120, bd * 0.6, { look: a.ice ? 'ice' : 'orb', col: col, slow: a.ice ? 0.3 : 0 }); }
          if (A.t > 1.3) end();
          break;
        }
        case 'pools': {
          if (!A.done) { A.done = 1; for (let i = 0; i < (a.k || 5); i++) { const x = P.x + (Math.random() - 0.5) * 320, y = P.y + (Math.random() - 0.5) * 320; this.tele.push({ k: 'circle', x: clamp(x, 30, this.W - 30), y: clamp(y, 30, this.H - 30), r: 42, t: 0, delay: 0.8, dmg: e.dmg * 0.6, vis: 1, pool: 1 }); } }
          if (A.t > 1) end();
          break;
        }
        case 'teleport': {
          if (!A.ph) { A.ph = 'out'; e.untarget = true; }
          if (A.ph === 'out') { e.alpha = Math.max(0, 1 - A.t / 0.5); if (A.t > 0.5) { for (let i = 0; i < 10; i++) { const x = 80 + Math.random() * (this.W - 160), y = 80 + Math.random() * (this.H - 160); if (B.dist2(x, y, P.x, P.y) > 250 * 250 && B.dist2(x, y, P.x, P.y) < 420 * 420) { e.x = x; e.y = y; break; } } A.ph = 'in'; if (this.F) this.F.puff(e.x, e.y, col); } }
          else if (A.ph === 'in') { e.alpha = Math.min(1, (A.t - 0.5) / 0.4); if (A.t > 0.9) end(); }
          break;
        }
        case 'roar':
          if (!A.done) { A.done = 1; this.tele.push({ k: 'circle', x: e.x, y: e.y, r: 400, t: 0, delay: 0.8, vis: 1, roar: 1, dmg: 0 }); }
          if (A.t > 0.8 && !A.rr) { A.rr = 1; if (B.dist2(e.x, e.y, P.x, P.y) < 400 * 400) { P.slowF = 0.45; P.slowT = 2.5; } if (this.F) { this.F.shake(14); this.F.sfx('roar'); } }
          if (A.t > 1.1) end();
          break;
        case 'darken':
          if (!A.done) { A.done = 1; this.darkT = 6; if (this.F) this.F.text(P.x, P.y - 50, B.t('lumiere_faiblit'), '#ff8a6a'); }
          if (A.t > 0.5) end();
          break;
        default: end();
      }
    }

    // ───── Projectiles ennemis ─────
    updateEB(dt) {
      const P = this.P;
      for (const b of this.eb) {
        if (b.dead) continue;
        b.t += dt; b.life -= dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.life <= 0 || b.x < -40 || b.y < -40 || b.x > this.W + 40 || b.y > this.H + 40) { b.dead = true; continue; }
        const rr = b.r + P.r * 0.7;
        if (B.dist2(b.x, b.y, P.x, P.y) < rr * rr) {
          if (this.hitPlayer(b.dmg, null, b.slow ? { slow: b.slow, t: 1.5 } : null) || P.inv <= 0) b.dead = true;
          if (b.look === 'wave') b.dead = false;
        }
      }
    }
    updateZones(dt) {
      const P = this.P;
      for (const z of this.zones) {
        if (z.dead) continue;
        z.life -= dt; if (z.life <= 0) { z.dead = true; continue; }
        if (z.delay > 0) { z.delay -= dt; z.x = B.lerp(z.sx, z.tx, 1 - z.delay / z.d0); z.y = B.lerp(z.sy, z.ty, 1 - z.delay / z.d0); if (z.delay <= 0 && this.F) this.F.splash(z); continue; }
        if (z.follow) { z.x = P.x; z.y = P.y; }
        z.tt -= dt;
        if (z.tt > 0) continue;
        z.tt = z.tick;
        if (z.own === 'p') {
          for (const e of this.near(z.x, z.y, z.r).slice()) this.hurt(e, z.dmg * z.tick / 0.5, { el: z.el || (z.look === 'fire' ? 'fire' : z.look === 'poison' ? 'poison' : z.look === 'holy' ? 'light' : 'arcane'), fx: z.fx, nocrit: !z.crit, base: z.dmg });
          if (z.heal) P.hp = Math.min(this.S.hp, P.hp + this.S.hp * z.heal * this.S.healPow * z.tick / 0.5);
        } else if (B.dist2(z.x, z.y, P.x, P.y) < (z.r + P.r * 0.5) * (z.r + P.r * 0.5)) this.hitPlayer(z.dmg);
      }
    }
    updateTele(dt) {
      const P = this.P;
      for (const T of this.tele) {
        if (T.dead) continue;
        T.t += dt;
        if (T.src && T.fake && T.src.dead) { T.dead = true; continue; }
        if (T.k === 'line' && T.src && T.fake && T.t < T.delay) { T.x = T.src.x; T.y = T.src.y; }
        if (T.t < T.delay) continue;
        T.dead = true;
        if (T.fake) continue;
        let inside = false;
        if (T.k === 'circle') inside = B.dist2(T.x, T.y, P.x, P.y) < (T.r + P.r * 0.6) * (T.r + P.r * 0.6);
        else if (T.k === 'line') {
          const dx = P.x - T.x, dy = P.y - T.y; const c = Math.cos(T.a), s = Math.sin(T.a);
          const along = dx * c + dy * s, perp = Math.abs(-dx * s + dy * c);
          inside = along > -10 && along < T.len && perp < T.w / 2 + P.r * 0.5;
        } else if (T.k === 'cone') {
          const d = Math.hypot(P.x - T.x, P.y - T.y); const da = Math.abs(((Math.atan2(P.y - T.y, P.x - T.x) - T.a + Math.PI * 3) % TAU) - Math.PI);
          inside = d < T.len && da < T.w;
        }
        if (inside && T.dmg) this.hitPlayer(T.dmg, null, T.slow ? { slow: T.slow, t: 2 } : null);
        if (T.pool) this.zones.push({ x: T.x, y: T.y, r: T.r, life: 5, max: 5, own: 'e', dmg: T.dmg * 0.5, tick: 0.5, tt: 0, look: 'ooze' });
        if (this.F) this.F.teleHit(T);
      }
    }
    updatePicks(dt) {
      const P = this.P, S = this.S;
      const pr = S.pick * (this.outro > 0 ? 20 : 1);
      for (const p of this.picks) {
        if (p.dead) continue;
        p.t += dt;
        if (!p.mag) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.9; p.vy *= 0.9;
          if (p.type !== 'chest' && B.dist2(p.x, p.y, P.x, P.y) < pr * pr) p.mag = true;
          if (p.type === 'chest' && B.dist2(p.x, p.y, P.x, P.y) < 40 * 40) p.mag = true;
        } else {
          const a = B.angTo(p.x, p.y, P.x, P.y); p.sp = (p.sp || 120) + dt * 900;
          p.x += Math.cos(a) * p.sp * dt; p.y += Math.sin(a) * p.sp * dt;
          if (B.dist2(p.x, p.y, P.x, P.y) < 18 * 18) { p.dead = true; this.collect(p); }
        }
      }
    }
    collect(p) {
      const P = this.P, S = this.S, RH = this.RH;
      switch (p.type) {
        case 'xp': {
          RH.xp += p.v * S.xp;
          if (this.F) this.F.sfx('xp');
          let need = B.xpNeed(RH.lvl);
          while (RH.xp >= need) {
            RH.xp -= need; RH.lvl++; this.pendingLevels = (this.pendingLevels || 0) + 1;
            if (S.lvlHeal) P.hp = Math.min(S.hp, P.hp + S.lvlHeal * S.healPow);
            need = B.xpNeed(RH.lvl);
          }
          if (this.pendingLevels && this.o.onLevel && !this.over) { this.paused = true; this.o.onLevel(this); }
          break;
        }
        case 'gold': this.loot.gold += Math.round(p.v * S.gold); if (this.F) this.F.sfx('coin'); break;
        case 'heal': P.hp = Math.min(S.hp, P.hp + p.v * S.healPow * (1 + this.RH.lvl * 0.05)); if (this.F) { this.F.sfx('heal'); this.F.text(P.x, P.y - 30, '+' + Math.round(p.v), '#7aff8a'); } break;
        case 'magnet': for (const q of this.picks) if (q.type === 'xp' || q.type === 'gold') q.mag = true; if (this.F) this.F.sfx('magnet'); break;
        case 'herb': this.loot.herbe += 1; if (this.F) this.F.text(P.x, P.y - 30, '🌿', '#7aff8a'); break;
        case 'chest':
          this.chests = (this.chests || 0) + p.v;
          if (this.F) this.F.sfx('chest');
          if (this.o.onChest && !this.over) { this.paused = true; this.o.onChest(this, p.v); }
          break;
      }
    }
    cleanup() {
      const f = (a) => { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].dead) a[j++] = a[i]; a.length = j; };
      f(this.en); f(this.pb); f(this.eb); f(this.zones); f(this.tele); f(this.picks); f(this.mins); f(this.strikes); f(this.mines);
    }
    checkEnd(dt) {
      if (this.over) return;
      const P = this.P;
      if (this.survivor && !this.survivor.done) {
        const s = this.survivor;
        if (B.dist2(s.x, s.y, P.x, P.y) < s.r * s.r) { s.prog += dt / 5; if (s.prog >= 1) { s.done = true; if (this.F) { this.F.text(s.x, s.y - 40, B.t('sauve'), '#ffe08a'); this.F.sfx('rescue'); } } }
        else s.prog = Math.max(0, s.prog - dt * 0.05);
      }
      if (this.outro > 0) {
        this.outro -= dt;
        if (this.outro <= 0) { this.over = 'win'; this.finish(); }
        return;
      }
      let done = false;
      if (this.kind === 'fight' || this.kind === 'ambush' || this.kind === 'tutorial') done = this.t >= this.duration;
      else if (this.kind === 'survivor') done = this.t >= this.duration && this.survivor.done;
      else if (this.kind === 'elite') done = this.t >= 20 && !this.elitesAlive;
      else if (this.kind === 'guard' || this.kind === 'boss') done = !!this.bossKilled && !this.boss;
      else if (this.kind === 'mimic') done = this.mimicDead;
      if (done) {
        this.outro = 1.6;
        for (const e of this.en) if (!e.dead && !e.boss) { e.dead = true; if (this.F) this.F.death(e, true); }
        this.eb.length = 0; this.tele.length = 0;
        for (const p of this.picks) { if (p.type === 'chest') p.mag = true; else if (!p.dead) { p.dead = true; this.collect(p); } }
        if (this.F) this.F.clear();
      }
    }
    finish() {
      this.RH.hp = Math.max(0, this.P.hp);
      this.RH.spCharge = this.P.sp;
      if (this.o.onEnd) this.o.onEnd(this);
    }
    // Choix d'un pouvoir terminé → reprise
    resume() {
      if (this.pendingLevels > 0) this.pendingLevels--;
      if (this.pendingLevels > 0 && this.o.onLevel) { this.o.onLevel(this); return; }
      this.paused = false;
    }
  }
  B.Combat = Combat;
})(this.B || (this.B = {}));
