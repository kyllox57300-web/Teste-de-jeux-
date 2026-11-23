// Brumeterre — armes du joueur (s'ajoute au moteur de combat)
(function (B) {
  'use strict';
  const TAU = Math.PI * 2;
  const C = B.Combat.prototype;

  C.updateWeapons = function (dt) {
    const S = this.S, P = this.P;
    const rate = 1 + (S.focus && this.stillT > 0.3 ? S.focus : 0);
    for (const w of this.weap) {
      const p = w.p;
      switch (w.type) {
        case 'orbit': this.wOrbit(w, dt); break;
        case 'aura': this.wAura(w, dt); break;
        case 'summon': this.wSummon(w, dt); break;
        default:
          w.t -= dt * rate;
          if (w.t <= 0) { if (this.fire(w)) w.t += p.cd; else w.t = 0.1; }
      }
    }
    // pièges
    for (const m of this.mines) {
      if (m.dead) continue;
      m.arm -= dt;
      if (m.arm > 0) continue;
      const l = this.near(m.x, m.y, 20);
      if (l.length) { m.dead = true; this.playerBoom(m.x, m.y, m.area, m.dmg, 'fire', m.fx); if (this.F) this.F.sfx('boom'); }
    }
  };

  C.aimAt = function (p, w) {
    const P = this.P;
    let e = null;
    if (p.aim === 'near') e = this.nearest(P.x, P.y, 520);
    else if (p.aim === 'rand') e = this.randomEnemy(P.x, P.y, 420);
    if (e) return Math.atan2(e.y - P.y, e.x - P.x);
    return null;
  };

  C.fire = function (w) {
    const P = this.P, S = this.S, p = w.p, F = this.F;
    const el = p.elems[0];
    switch (w.type) {
      case 'proj': {
        const n = Math.max(1, Math.round(p.n));
        if (p.aim === 'spinface' || p.aim === 'spiral2') {
          const base = this.t * (p.aim === 'spinface' ? 7 : 4.2);
          for (let i = 0; i < n; i++) { const b = this.firePB(P.x, P.y, base + i / n * TAU, p, w); if (p.aim === 'spiral2') b.curve = 1.2; }
          if (F) F.sfx(p.look === 'ice' ? 'ice' : 'throw', 0.4);
          return true;
        }
        if (p.aim === 'spiral') {
          w.st += 0.6;
          for (let i = 0; i < n; i++) { const b = this.firePB(P.x, P.y, w.st + i / n * TAU, p, w); b.curve = 2.4; }
          if (F) F.sfx('throw');
          return true;
        }
        if (p.aim === 'radial') {
          w.st += 0.35;
          for (let i = 0; i < n; i++) this.firePB(P.x, P.y, w.st + i / n * TAU, p, w);
          if (F) F.sfx('ice');
          return true;
        }
        if (p.aim === 'rand') {
          let any = false;
          for (let i = 0; i < n; i++) {
            const e = this.randomEnemy(P.x, P.y, 420);
            if (!e && !any) return false;
            const a = e ? Math.atan2(e.y - P.y, e.x - P.x) : Math.random() * TAU;
            this.firePB(P.x, P.y, a, p, w); any = true;
          }
          if (F) F.sfx(p.look === 'spore' ? 'spore' : 'throw');
          return true;
        }
        let a = this.aimAt(p, w);
        if (a === null) { if (p.aim === 'near') return false; a = P.face; }
        const sp = p.spread || 0.15;
        for (let i = 0; i < n; i++) this.firePB(P.x, P.y, a + (i - (n - 1) / 2) * sp, p, w);
        if (F) F.sfx(p.look === 'arrow' ? 'bow' : p.look === 'fireball' ? 'fire' : p.look === 'dagger' ? 'throw' : p.look === 'lance' ? 'ice' : 'shoot', 0.6);
        return true;
      }
      case 'arc': {
        const e = this.nearest(P.x, P.y, p.area * 1.6);
        if (!e) return false;
        const a = Math.atan2(e.y - P.y, e.x - P.x);
        const dirs = p.both === 2 ? [a, a + Math.PI / 2, a + Math.PI, a - Math.PI / 2] : p.both ? [a, a + Math.PI] : [a];
        for (const d of dirs) {
          for (const t of this.near(P.x, P.y, p.area).slice()) {
            const da = Math.abs(((Math.atan2(t.y - P.y, t.x - P.x) - d + Math.PI * 3) % TAU) - Math.PI);
            if (da < p.arc / 2 + 0.15) this.hurt(t, p.dmg, { el: el, fx: p.fx, kb: p.knock, ka: Math.atan2(t.y - P.y, t.x - P.x), crit: p.crit });
          }
          if (F) F.swing(P.x, P.y, d, p.arc, p.area, p.look);
        }
        if (p.quake && F) F.shake(3);
        if (F) F.sfx(p.look === 'vine' ? 'whip' : 'swing');
        return true;
      }
      case 'pool': {
        const n = Math.max(1, Math.round(p.n));
        if (p.self) {
          this.zones.push({ x: P.x, y: P.y, r: p.area, life: p.dur, max: p.dur, own: 'p', dmg: p.dmg, tick: p.tick, tt: 0, look: p.look, fx: p.fx, el: el });
          if (F) F.sfx('rune');
          return true;
        }
        let any = false;
        for (let i = 0; i < n; i++) {
          const e = this.randomEnemy(P.x, P.y, 330);
          if (!e && !any) return false;
          any = true;
          const tx = e ? e.x : P.x + (Math.random() - 0.5) * 250, ty = e ? e.y : P.y + (Math.random() - 0.5) * 250;
          this.zones.push({ sx: P.x, sy: P.y, tx: tx, ty: ty, x: P.x, y: P.y, delay: 0.35, d0: 0.35, r: p.area, life: p.dur + 0.35, max: p.dur, own: 'p', dmg: p.dmg, tick: p.tick, tt: 0, look: p.look, fx: p.fx, el: el });
        }
        if (F) F.sfx('throw');
        return true;
      }
      case 'strike': {
        const n = Math.max(1, Math.round(p.n));
        let targets = [];
        if (p.aim === 'strong') {
          targets = this.en.filter(e => !e.dead && !e.untarget && B.dist2(e.x, e.y, P.x, P.y) < 400 * 400).sort((a, b) => b.hp - a.hp).slice(0, n);
        } else if (p.aim === 'near') {
          const ex = [];
          for (let i = 0; i < n; i++) { const e = this.nearest(P.x, P.y, 400, ex); if (!e) break; ex.push(e.uid); targets.push(e); }
        } else {
          for (let i = 0; i < n; i++) { const e = this.randomEnemy(P.x, P.y, 380); if (e) targets.push(e); }
        }
        if (!targets.length) return false;
        targets.forEach((e, i) => this.strikes.push({ x: e.x, y: e.y, t: -i * 0.07, delay: p.delay, r: p.area, dmg: p.dmg, look: p.look, el: el, fx: p.fx, crit: p.crit }));
        return true;
      }
      case 'chain': {
        const e = this.nearest(P.x, P.y, p.range + 60);
        if (!e) return false;
        const pts0 = [P.x, P.y];
        this.chainFrom(e, p.dmg, Math.round(p.n), p.range, { el: 'bolt', fx: p.fx, crit: p.crit }, p.fork);
        if (F) { F.bolt([pts0, [e.x, e.y]], '#fff6a0'); F.sfx('zap'); }
        return true;
      }
      case 'boomerang': {
        const n = Math.max(1, Math.round(p.n));
        let a = this.aimAt({ aim: 'near' }, w);
        if (a === null) return false;
        for (let i = 0; i < n; i++) {
          const b = this.firePB(P.x, P.y, a + (i - (n - 1) / 2) * (n > 3 ? TAU / n : 0.5), Object.assign({}, p, { dur: 6 }), w);
          b.boom = true; b.bt = 0; b.half = p.range / p.spd; b.pierce = 999;
        }
        if (F) F.sfx('whoosh');
        return true;
      }
      case 'beam': {
        const e = this.nearest(P.x, P.y, p.range);
        if (!e) return false;
        const a0 = Math.atan2(e.y - P.y, e.x - P.x);
        const n = Math.max(1, Math.round(p.n));
        const fan = p.fan || 0.16;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i - (n - 1) / 2) * fan;
          const c = Math.cos(a), s = Math.sin(a);
          for (const t of this.en) {
            if (t.dead || t.untarget) continue;
            const dx = t.x - P.x, dy = t.y - P.y; const al = dx * c + dy * s;
            if (al < 0 || al > p.range) continue;
            if (Math.abs(-dx * s + dy * c) < p.r + t.r) this.hurt(t, p.dmg, { el: el, fx: p.fx, crit: p.crit });
          }
          if (F) F.beam(P.x, P.y, a, p.range, p.r, p.look);
        }
        if (F) F.sfx('beam');
        return true;
      }
      case 'nova': {
        if (!this.nearest(P.x, P.y, p.area)) return false;
        for (const t of this.near(P.x, P.y, p.area).slice()) this.hurt(t, p.dmg, { el: el, fx: p.fx, kb: p.knock, ka: Math.atan2(t.y - P.y, t.x - P.x), crit: p.crit });
        if (F) { F.nova(P.x, P.y, p.area, p.look); F.sfx(p.look === 'bell' ? 'bell' : 'nova'); }
        return true;
      }
      case 'mine': {
        const mine = { x: P.x, y: P.y, arm: 0.5, area: p.area, dmg: p.dmg, fx: p.fx, w: w };
        this.mines.push(mine);
        const mine_ = this.mines.filter(m => m.w === w && !m.dead);
        if (mine_.length > Math.round(p.n)) mine_[0].dead = true;
        if (F) F.sfx('place');
        return true;
      }
    }
    return false;
  };

  C.wOrbit = function (w, dt) {
    const P = this.P, p = w.p, S = this.S;
    const n = Math.max(1, Math.round(p.n));
    w.st += dt * p.spd;
    if (!w.orbs) w.orbs = [];
    w.orbs.length = n;
    for (let i = 0; i < n; i++) {
      const a = w.st + i / n * TAU;
      const ox = P.x + Math.cos(a) * p.area, oy = P.y + Math.sin(a) * p.area;
      w.orbs[i] = w.orbs[i] || { x: 0, y: 0 };
      w.orbs[i].x = ox; w.orbs[i].y = oy;
      for (const e of this.near(ox, oy, p.r).slice()) {
        if (!e.ticks) e.ticks = {};
        if ((e.ticks[w.id] || 0) > this.t) continue;
        e.ticks[w.id] = this.t + p.tick;
        this.hurt(e, p.dmg, { el: p.elems[0], fx: p.fx, kb: 90 * S.knock, ka: Math.atan2(e.y - P.y, e.x - P.x), crit: p.crit });
        if (p.heal) P.hp = Math.min(S.hp, P.hp + p.heal * S.healPow);
        if (this.F) this.F.sfx('orbhit', 0.3);
      }
    }
  };

  C.wAura = function (w, dt) {
    const P = this.P, p = w.p;
    w.t -= dt;
    w.R = p.lightAura ? this.lightR() * 0.92 : p.area;
    if (w.t > 0) return;
    w.t = Math.max(0.15, p.tick);
    for (const e of this.near(P.x, P.y, w.R).slice()) this.hurt(e, p.dmg * w.t / 0.5, { el: p.elems[0], fx: p.fx, nocrit: 1, base: p.dmg });
  };

  C.wSummon = function (w, dt) {
    const P = this.P, p = w.p;
    if (w.extra) w.extra = Math.max(0, w.extra - dt * 0.08);
    const want = Math.max(1, Math.round(p.n)) + Math.floor(w.extra || 0);
    w.mins = w.mins.filter(m => !m.dead);
    while (w.mins.length < want) {
      const m = { x: P.x + (Math.random() - 0.5) * 30, y: P.y + (Math.random() - 0.5) * 30, vx: 0, vy: 0, r: p.r, cd: 0, dmg: p.dmg, spd: p.spd, acd: p.cd, look: p.look, tgt: null, w: w, idx: w.mins.length * 1.3, el: p.elems[0] };
      w.mins.push(m); this.mins.push(m);
    }
    while (w.mins.length > want) { const m = w.mins.pop(); m.dead = true; }
    for (const m of w.mins) { m.dmg = p.dmg; m.spd = p.spd; m.acd = p.cd; m.r = p.r; m.crit = p.crit; }
  };
})(this.B || (this.B = {}));
