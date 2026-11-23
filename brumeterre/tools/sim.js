// Brumeterre — simulation d'équilibrage : un robot joue avec le vrai moteur et progresse au village.
// Usage : node tools/sim.js [nombre_de_joueurs] [expéditions_max] [habileté 0.5..1.5]
const load = require('./load.js');
const B = load(['util.js', 'lang.js', 'data_powers.js', 'data_world.js', 'data_meta.js', 'engine.js', 'weapons.js', 'run.js', 'meta.js']);
const NP = +process.argv[2] || 3, MAXR = +process.argv[3] || 160, SKILL = +process.argv[4] || 1;
const DT = 1 / 30;

function bot(c, skill, mem) {
  const P = c.P; let fx = 0, fy = 0;
  const R = 200 * skill;
  for (const e of c.en) { if (e.dead || e.untarget) continue; const dx = P.x - e.x, dy = P.y - e.y; const d2 = dx * dx + dy * dy; if (d2 < R * R) { const w = e.boss ? 2.5 : e.elite ? 1.6 : 1; fx += dx / d2 * 3000 * w; fy += dy / d2 * 3000 * w; } }
  for (const b of c.eb) { const dx = P.x - b.x, dy = P.y - b.y; const d2 = dx * dx + dy * dy; if (d2 < 90 * 90 * skill) { fx += dx / d2 * 2200 * skill; fy += dy / d2 * 2200 * skill; } }
  for (const T of c.tele) {
    if (T.fake && T.k !== 'line') continue;
    if (Math.random() > 0.85 * skill) continue;
    if (T.k === 'circle') { const dx = P.x - T.x, dy = P.y - T.y, d = Math.hypot(dx, dy); if (d < T.r + 25) { fx += dx / (d + 1) * 6; fy += dy / (d + 1) * 6; } }
    else if (T.k === 'line') { const c2 = Math.cos(T.a), s2 = Math.sin(T.a); const dx = P.x - T.x, dy = P.y - T.y; const perp = -dx * s2 + dy * c2; const al = dx * c2 + dy * s2; if (al > -20 && al < T.len && Math.abs(perp) < T.w / 2 + 30) { const sg = perp >= 0 ? 1 : -1; fx += -s2 * sg * 6; fy += c2 * sg * 6; } }
    else if (T.k === 'cone') { const dx = P.x - T.x, dy = P.y - T.y; const d = Math.hypot(dx, dy); if (d < T.len + 30) { const a = Math.atan2(dy, dx) - T.a; fx += -Math.sin(T.a) * Math.sign(Math.sin(a) || 1) * 6; fy += Math.cos(T.a) * Math.sign(Math.sin(a) || 1) * 6; } }
  }
  // gemmes proches quand c'est calme
  let best = null, bd = 160 * 160;
  for (const p of c.picks) { if (p.type === 'chest') { bd = 0; best = p; break; } const d = (p.x - P.x) ** 2 + (p.y - P.y) ** 2; if (d < bd) { bd = d; best = p; } }
  if (best) { const d = Math.sqrt(bd) + 1; fx += (best.x - P.x) / d * 0.6; fy += (best.y - P.y) / d * 0.6; }
  if (c.survivor && !c.survivor.done) { fx += (c.survivor.x - P.x) * 0.012; fy += (c.survivor.y - P.y) * 0.012; }
  fx += (c.W / 2 - P.x) * 0.002; fy += (c.H / 2 - P.y) * 0.002;
  // erreur humaine
  mem.t = (mem.t || 0) - DT;
  if (mem.t <= 0) { mem.t = 0.3 + Math.random() * 0.4; mem.nx = (Math.random() - 0.5) * (1.5 - skill) * 2; mem.ny = (Math.random() - 0.5) * (1.5 - skill) * 2; }
  fx += mem.nx; fy += mem.ny;
  const m = Math.hypot(fx, fy); c.mx = m > 0.05 ? fx / m : 0; c.my = m > 0.05 ? fy / m : 0;
  if (P.sp >= 1 && c.en.length > 6) c.wantSpecial = true;
}

function pickCard(run, off) {
  let best = off.cards[0], bs = -1;
  for (const c of off.cards) {
    let s = 1 + c.rar;
    if (c.evo) s += 20;
    const d = B.POWERS[c.id];
    if (d) {
      if (d.kind === 'w') s += run.owned(c.id) ? 3 : 2.5;
      if (d.kind === 'p') { s += 1.5; if (['p_might', 'p_haste', 'p_vigor', 'p_area', 'p_multi'].includes(c.id)) s += 1.5; }
      const syn = run.cardSynergy(c); if (syn.evoFor) s += 3; if (syn.evoWith && syn.evoWith.has) s += 2; if (syn.elems.some(x => x.hot)) s += 1.5;
    }
    s += Math.random() * 1.5;
    if (s > bs) { bs = s; best = c; }
  }
  return best;
}

function playCombat(run, kind, stat) {
  const o = run.combatOpts(kind);
  let lv = 0;
  o.onLevel = (c) => { while (c.pendingLevels > 0) { const off = run.makeOffer({}); run.applyCard(pickCard(run, off)); c.pendingLevels--; lv++; } c.recompute(); c.paused = false; };
  o.onChest = (c, v) => { const off = run.makeOffer({ chest: true, minRar: v > 1 ? 1 : 0 }); run.applyCard(pickCard(run, off)); run.d.gold += 8 * v; c.recompute(); c.paused = false; };
  o.onEnd = () => { };
  const c = new B.Combat(o);
  const mem = {};
  let steps = 0;
  while (!c.over && steps < 60 * 400) { bot(c, SKILL, mem); c.step(DT); steps++; if (c.paused) c.paused = false; }
  stat.combatTime += c.t; stat.levelups += lv;
  if (c.kind === 'guard' || c.kind === 'boss') { (stat.bt = stat.bt || []).push(c.kind[0] + run.d.biome + ':' + Math.round(c.t) + (c.over === 'win' ? '' : '✗')); }
  return c;
}

function processQueue(run, stat) {
  while (run.d.queue.length) {
    const q = run.d.queue.shift();
    if (q.k === 'offer') { const off = run.makeOffer(q.o); run.applyCard(pickCard(run, off)); }
    if (q.k === 'fight') { const c = playCombat(run, q.kind, stat); const r = run.afterCombat(c); if (r.lost) return false; }
  }
  return true;
}

function playRun(P, opts, stat) {
  const run = B.Run.create(opts);
  const fin = (w) => { const r = run.finish(w); r.row = run.d.pos.r; return r; };
  if (!processQueue(run, stat)) return fin(false);
  while (true) {
    const nx = run.nextNodes();
    if (!nx.length) break;
    const st = B.computeStats(run.RH); const hpk = run.RH.hp / st.hp;
    const rows = run.d.map.rows[run.d.pos.r + 1];
    // choix du chemin
    let bi = nx[0], bs = -1e9;
    for (const i of nx) { const n = rows[i]; let s = Math.random();
      if (n.t === 'camp') s += hpk < 0.6 ? 4 : 0.5; if (n.t === 'survivor') s += 3; if (n.t === 'elite') s += hpk > 0.7 ? 1.5 : -3; if (n.t === 'shop') s += run.d.gold > 40 ? 2 : -1; if (n.t === 'treasure') s += 2; if (n.t === 'event') s += 1; if (n.t === 'fight') s += hpk > 0.5 ? 1 : 0;
      if (s > bs) { bs = s; bi = i; } }
    const n = run.goTo(bi);
    if (['fight', 'elite', 'survivor', 'guard', 'boss'].includes(n.t)) {
      const c = playCombat(run, null, stat);
      const r = run.afterCombat(c);
      if (r.lost) return fin(false);
      if (n.t === 'boss') return fin(true);
    } else if (n.t === 'event') {
      stat.other += 20;
      const ev = run.pickEvent();
      const ok = ev.o.filter(o => !o.need || run.d.gold >= (o.need.gold || 0));
      const o = ok[Math.floor(Math.random() * ok.length)];
      o.f(run.api());
    } else if (n.t === 'shop') {
      stat.other += 20;
      const stock = run.shopStock();
      stock.forEach((s, i) => { if ((s.k === 'card' || (s.k === 'heal' && hpk < 0.6)) && run.d.gold >= s.price) run.buy(i); });
    } else if (n.t === 'camp') { stat.other += 10; if (hpk < 0.75) run.campHeal(); else run.d.queue.push({ k: 'offer', o: { upgradeOnly: true } }); }
    else if (n.t === 'treasure') { stat.other += 10; run.openTreasure(); }
    n.done = 1;
    if (!processQueue(run, stat)) return fin(false);
  }
  return fin(true);
}

// Dépenses au village (stratégie raisonnable)
function spend(P) {
  const Me = B.Meta;
  let changed = true, guard = 0;
  while (changed && guard++ < 200) {
    changed = false;
    // bâtiments (priorité)
    const order = ['forge', 'academy', 'tavern', 'fanal', 'altar', 'garden', 'stable', 'observatory'];
    for (const id of order) { const b = B.BUILDINGS.find(x => x.id === id); if (Me.bldState(b) === 'ok' && Me.can(Me.bldCost(b))) { if (id !== 'fanal' || P.bld.fanal <= Math.max(...order.filter(o => o !== 'fanal').map(o => P.bld[o]))) { Me.build(b); changed = true; } } }
    // talents (le moins cher d'abord)
    const ts = B.TALENTS.filter(t => Me.talentState(t) === 'ok').sort((a, b) => B.talentCost(a, Me.tRank(a.id)) - B.talentCost(b, Me.tRank(b.id)));
    if (ts.length && Me.buyTalent(ts[0])) changed = true;
    // héros
    for (const h of B.HEROES) if (Me.heroState(h) === 'ok' && Me.can(h.unlock.cost) && P.res.braise > h.unlock.cost.braise * 1.5) { Me.hireHero(h); changed = true; }
    // améliorer l'équipement porté
    for (const s in P.equip) { const it = P.items.find(x => x.uid === P.equip[s]); if (it && it.up < Me.upMax() && Me.can(Me.upCost(it)) && P.res.braise > Me.upCost(it).braise * 2) { Me.pay(Me.upCost(it)); it.up++; P.st.upgrades++; changed = true; } }
  }
  // équiper le meilleur
  for (const s of ['weapon', 'armor', 'jewel']) { const best = P.items.filter(i => i.slot === s).sort((a, b) => Me.itemPower(b) - Me.itemPower(a))[0]; if (best) P.equip[s] = best.uid; }
  // recycler le surplus
  if (P.bld.forge) for (const it of P.items.slice()) if (Object.values(P.equip).indexOf(it.uid) < 0 && it.rar < 3) Me.salvage(it);
  // compagnons
  if (P.bld.stable) for (const c of B.COMPANIONS) if (!P.comps[c.id] && Me.can(c.cost) && P.res.braise > c.cost.braise * 2) { Me.buyComp(c); P.comp = c.id; }
  // bénédictions
  const bm = [0, 1, 1, 2, 2, 3][P.bld.altar] + Me.flagSum('blessSlot');
  P.bless = ['bl_str', 'bl_vig', 'bl_iron'].slice(0, bm);
  // potions
  if (P.bld.garden) { const p = B.POTIONS[0]; if (Me.can(p.cost)) { Me.pay(p.cost); P.potions[p.id] = (P.potions[p.id] || 0) + 1; } P.potSel = P.potions.po_heal ? ['po_heal'] : []; }
  // héros : le meilleur niveau
  const owned = Object.keys(P.heroes).sort((a, b) => P.heroes[b].lvl - P.heroes[a].lvl + (Math.random() - 0.5) * 0.5); P.hero = Math.random() < 0.7 ? owned[0] : owned[Math.floor(Math.random() * owned.length)];
  Me.checkAch();
}

const all = [];
for (let pl = 0; pl < NP; pl++) {
  const P = B.Meta.newProfile(); B.P = P; B.settings = P.settings;
  const stat = { combatTime: 0, other: 0, levelups: 0 };
  const firstClear = {}; let t = 0;
  const log = [];
  // tutoriel
  playRun(P, { mode: 'tutorial', hero: 'aldric', biome: 0 }, stat); P.tuto = 2;
  for (let r = 0; r < MAXR; r++) {
    const biome = P.biome;
    const ct0 = stat.combatTime + stat.other;
    const res = playRun(P, { mode: 'normal', hero: P.hero, biome: biome, deep: 0 }, stat);
    const dt = stat.combatTime + stat.other - ct0 + 60; // +1 min de village / menus
    t += dt;
    if (res.won && firstClear[biome] === undefined) firstClear[biome] = { run: r + 1, h: +(t / 3600).toFixed(1), tal: P.st.talentRanks, fan: P.bld.fanal, ess: Math.round(P.st.braiseTotal / 1000) + 'k' };
    log.push((res.won ? 'W' : 'L') + biome + (res.won ? '' : 'r' + (res.row !== undefined ? res.row : '?')) + '·' + res.lvl + '·' + Math.round(dt / 60) + 'm');
    spend(P);
    if (P.cleared[4]) break;
  }
  all.push({ firstClear, runs: log.length, hours: +(t / 3600).toFixed(1), heroes: Object.keys(P.heroes).length, surv: Object.keys(P.survivors).length, talents: P.st.talentRanks, fanal: P.bld.fanal, bld: P.bld, ach: Object.keys(P.ach).length, res: P.res, log: log.join(' ') });
  console.log('Joueur ' + (pl + 1) + ' :', JSON.stringify(firstClear), 'expéditions', log.length, 'heures', (t / 3600).toFixed(1), 'talents', P.st.talentRanks, 'fanal', P.bld.fanal, 'survivants', Object.keys(P.survivors).length, 'succès', Object.keys(P.ach).length);
  console.log('   ', log.join(' '));
  console.log('    boss:', (stat.bt || []).join(' '));
}
