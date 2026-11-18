// Robot joueur : simule des parties complètes avec le vrai moteur du jeu (sans affichage), en accéléré.
import * as C from '../src/core.js';
import * as D from '../src/data.js';
const TAPS = +(process.argv[2] || 2), RUNS = +(process.argv[3] || 1), KARMA = +(process.argv[4] || 0), TRACE = process.env.TRACE;
// ordre d'achat des compétences du robot (un « build » raisonnable)
const BUILDS = [['F1','F2','F3','M1','C1','F4','B1','M2','C2','F5','F6','FU','M3','B2','C3','M5','C4','M6','MU'],
                ['M1','C1','M2','F1','M3','C2','B1','M4','M5','C3','M6','MU','F2','F3','C4','B2','B3']];
for(let run = 0; run < RUNS; run++){
  C.init(true);
  const S0 = C.newState(); S0.meta.karma = KARMA; S0.meta.tuto = true; C.setS(S0); C.startWorld();
  const S = C.S, W = C.W, build = BUILDS[run % BUILDS.length];
  const log = [], gates = [], trace = [];
  let lastCh = 0, tapAcc = 0, t = 0;
  const dt = 0.25;
  const chooseTarget = () => {
    const k = W.kevin, {list} = C.reachableHeaps(k); if(!list.length) return;
    const tg = (!S.story.found && S.unlocked[2]) ? S.story : (!S.disk.found && S.unlocked[6]) ? S.disk : null;
    let best;
    if(tg && S.up.det) best = list.reduce((a, h) => Math.hypot(h.c - tg.c, h.r - tg.r) < Math.hypot(a.c - tg.c, a.r - tg.r) ? h : a);
    else { const mq = Math.max(...list.map(h => h.q)); best = list.filter(h => h.q === mq).reduce((a, h) => h.d < a.d ? h : a); }
    C.orderDig(best.c, best.r, true);
  };
  for(; t < 4 * 3600; t += dt){
    C.update(dt);
    // file d'événements : dialogues ignorés, événements → choix au hasard, coffre-fort → réussi
    for(const f of W.fx.splice(0)){
      if(f.t === 'event') C.resolveEvent(f.ev, Math.floor(Math.random() * f.ev.ch.length));
      if(f.t === 'safeGame') C.safeResult(f.id, true);
    }
    const k = W.kevin;
    tapAcc += TAPS * dt * (t < 900 ? 1 : t < 2700 ? 0.7 : 0.5); while(tapAcc >= 1){ tapAcc--; C.tapHit(); }
    const tick = Math.round(t * 4);
    // réparer les objets cassés du sac (mini-jeu réussi)
    if(tick % 40 === 0) S.bag.forEach((it, i) => { if(it[3]) C.repairItem(i); });
    if(!S.up.truck && (S.bag.length >= C.bagCap() || k.carry) && !k.path.length) C.orderSell();
    if(S.up.truck && k.carry && !k.path.length) C.orderSell();
    // gros objets et contenants proches : on s'en occupe
    if(tick % 8 === 0 && !k.path.length && !k.job && !k.carry && !k.push){
      const cont = W.conts.find(o => !o.open && Math.hypot(o.x - k.x, o.z - k.z) < 10);
      const big = W.bigs.find(o => o.state === 'ground' && Math.hypot(o.x - k.x, o.z - k.z) < 10);
      if(cont) C.orderCont(cont.id);
      else if(big && S.up.crane){ C.setTool('crane'); C.orderBig(big.id); C.setTool('shovel'); }
      else if(big) C.orderBig(big.id);
      else if(!k.target && S.bag.length < C.bagCap()) chooseTarget();
    }
    if(tick % 80 === 0 && !k.path.length && !k.carry && !k.push){ const tg = (!S.story.found && S.unlocked[2]) || (!S.disk.found && S.unlocked[6]); if(tg){ k.target = null; chooseTarget(); } }
    if(tick % 48 === 0 && S.up.magnet) C.useMagnet();
    if(tick % 20 === 0 && C.has('FU')) C.useQuake();
    // compétences
    for(const id of build) if(C.canLearn(id)) C.learn(id);
    // achats
    if(tick % 4 === 0){
      for(let g = 0; g < 30; g++){
        const nq = S.unlocked.indexOf(false);
        if(nq > 0 && S.money >= D.QUARTERS[nq].cost){ C.unlockQ(nq); gates.push(t); k.target = null; chooseTarget(); continue; }
        const gate = nq > 0 ? D.QUARTERS[nq].cost : Infinity, cand = [];
        for(const u of D.LEVELED){ if(u.z > C.deepestOpen() || S.up[u.id] >= u.max) continue; if(u.id === 'boots' && S.up.boots >= 6) continue; if(u.need && !S.up[u.need]) continue;
          if(u.id === 'team' && !W.workers.length) continue; cand.push([C.costLv(u.base, S.up[u.id]), () => C.buyLeveled(u.id)]); }
        if(C.sackCost() !== null) cand.push([C.sackCost(), () => C.buySack()]);
        for(const o of D.ONCE) if(o.z <= C.deepestOpen() && !S.up[o.id]) cand.push([['det','drone'].includes(o.id) ? 1 : C.onceCost(o.id), () => C.buyOnce(o.id), C.onceCost(o.id)]);
        for(const e of D.EMPS) if(e.z <= C.deepestOpen() && S.emps[e.id] < D.EMP_MAX) cand.push([C.empCost(e.id), () => C.hire(e.id)]);
        cand.sort((a, b) => a[0] - b[0]);
        const c = cand[0]; if(!c) break; const real = c[2] || c[0];
        if(real > S.money) break; if(real > gate * 0.15 && !c[2]) break;
        c[1]();
      }
    }
    if(TRACE && tick % (4 * 120) === 0) trace.push(Math.round(t / 60) + 'min $' + C.fmt(S.money) + ' tas' + C.clearedCount() + ' lv' + S.lvl + ' sp' + S.sp + ' sac' + S.bag.length + '/' + C.bagCap() + ' K(' + k.c + ',' + k.r + ')' + (k.target ? 'T' : '') + (k.path.length ? 'P' : '') + (k.carry ? 'C' : '') + (k.push ? 'U' : '') + (k.job ? 'J' : '') + ' loot' + W.loot.length + ' bigs' + W.bigs.length + ' emps' + W.workers.length + ' outil' + S.up.tool);
    if(S.chapter !== lastCh){ log.push('ch' + (lastCh + 1) + '@' + (t / 60).toFixed(1)); lastCh = S.chapter; }
    if(S.ended){ log.push('FIN@' + (t / 60).toFixed(1)); break; }
  }
  console.log('RUN', run + 1, S.ended ? 'FIN en ' + (S.endTime / 60).toFixed(1) + ' min' : 'PAS FINI (quartiers ' + S.unlocked.filter(x => x).length + ')');
  console.log('  ' + log.join(' ') + ' | portails ' + gates.map(x => (x / 60).toFixed(1)).join(' '));
  console.log('  tas vidés', C.clearedCount(), '(' + Math.round(C.clearedCount() / C.TOTAL_HEAPS * 100) + ' %) niveau', S.lvl, 'compétences', Object.keys(S.skills).join(','), 'pts restants', S.sp);
  console.log('  gros objets', S.st.bigs, 'contenants', S.st.opened, 'coffres', S.st.safes, 'trésors', S.st.treasures, 'réparés', S.st.repaired, 'gagné', C.fmt(S.st.earned), 'karma+', C.karmaGain(), 'quête', S.quest, '/', C.QUESTS.length);
  if(TRACE) console.log(trace.join('\n'));
  // la sauvegarde se relit correctement ?
  const txt = C.serialize(); const S2 = C.parseSave(txt); C.setS(S2); C.startWorld();
  if(C.clearedCount() !== (txt.match(/"L":"([0-9]+)"/)[1].split('').filter(x => x === '0').length)) console.log('  ⚠️ sauvegarde : tas différents');
}
