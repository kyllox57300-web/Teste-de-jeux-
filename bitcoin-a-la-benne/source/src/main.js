/* =========================================================
   PROGRAMME PRINCIPAL : démarrage, boucle, commandes, sauvegarde
   ========================================================= */
import * as C from './core.js';
import * as D from './data.js';
import * as A from './audio.js';
import * as RD from './render.js';
import * as U from './ui.js';
const {W} = C, {R} = RD, {UI} = U;
const $ = s => document.querySelector(s);
const SAVE_KEY = 'bitcoinBenne3d_save_v1';

/* ---------- Sauvegarde ---------- */
function save(){ if(!C.S || !UI.running) return; C.S.lastSave = Date.now(); try{ localStorage.setItem(SAVE_KEY, C.serialize()); }catch(e){} }
function loadSave(){ try{ const t = localStorage.getItem(SAVE_KEY); return t ? C.parseSave(t) : null; }catch(e){ return null; } }
function saveTitleSettings(){ const s = loadSave(); if(s){ s.meta.settings = UI.titleMeta.settings; try{ localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }catch(e){} }
  else try{ localStorage.setItem(SAVE_KEY + '_set', JSON.stringify(UI.titleMeta.settings)); }catch(e){} }

/* ---------- Démarrage d'une partie ---------- */
function startGame(isNew){
  $('#title').classList.add('hidden'); $('#hud').classList.remove('hidden');
  C.startWorld(); RD.buildWorld(); C.W.fx.length = 0;
  RD.setView(C.S.meta.settings.view || 'tps'); R.cam.yaw = Math.PI; R.cam.dist = 12; R.cam.tx = W.kevin.x; R.cam.tz = W.kevin.z;
  UI.running = true; A.musicUpdate();
  if(isNew) U.queue({type:'dialog', lines:D.INTRO, after:() => { U.chapterBanner(0); if(!C.S.meta.tuto){ C.S.meta.tuto = true; U.queue({type:'dialog', lines:D.TUTO}); } }});
  U.hud(); save();
}

/* ---------- Actions des boutons (délégation) ---------- */
const ACTIONS = {
  newgame(){ const old = loadSave(); if(old && !confirm('Commencer une nouvelle partie ? La partie en cours sera remplacée (Karma, album et succès gardés).')) return;
    C.setS(C.newState(old ? old.meta : UI.titleMeta)); startGame(true); },
  continue(){ const s = loadSave(); if(!s) return; C.setS(s); const away = (Date.now() - s.lastSave) / 1000; startGame(false);
    const off = C.applyOffline(away);
    if(off) U.queue({type:'html', html:'<div style="text-align:center"><div style="font-size:52px">🌙</div><h2>Bon retour !</h2><p class="muted">Vous étiez absent ' + C.fmtTime(off.sec) + '.</p>' +
      '<p style="margin:10px 0;font-size:16px">Votre équipe a continué à fouiller et a gagné <b style="color:var(--acc)">' + C.eur(off.money) + '</b>.</p><p class="muted" style="font-size:12px">(Hors ligne, l\'équipe travaille à 50 %, 8 h maximum.)</p>' +
      '<button class="btn prim" style="width:100%" data-act="closemodal">Super !</button></div>'}); },
  settings(){ U.queue({type:'html', html:'<h2>⚙️ Paramètres</h2>' + U.settingsHTML(false) + '<button class="btn prim" style="width:100%;margin-top:10px" data-act="closemodal">Fermer</button>'}); },
  closemodal(){ U.closeModal(); },
  dlgnext(){ const m = UI.cur; if(m && m.lines && m.i < m.lines.length - 1){ m.i++; rerenderDialog(); } else U.closeModal(); },
  dlgskip(){ U.closeModal(); },
  evchoice(el){ const ev = UI.cur.ev, res = C.resolveEvent(ev, +el.dataset.i); for(const f of C.W.fx.splice(0)) dispatch(f);
    $('#mbox').innerHTML = '<h2>' + ev.e + ' ' + ev.t + '</h2><p style="font-size:16px;line-height:1.45;margin:8px 0 14px"></p><button class="btn prim" style="width:100%" data-act="closemodal">OK</button>'; $('#mbox p').textContent = res; },
  open(el){ U.openSheet(el.dataset.sheet, el.dataset.tab); },
  closesheet(){ U.closeSheet(); },
  tab(el){ U.openSheet(UI.sheet, el.dataset.tab); },
  sell(){ if(C.S.up.truck && W.truck.state !== 'home' && !W.kevin.carry){ U.toast('🚛 Le camion est déjà en route.'); return; } C.orderSell(); },
  tool(el){ C.setTool(el.dataset.t); const n = {shovel:'Pelle : touchez un tas pour creuser.', det:'Détecteur : suivez les bips, puis touchez le sol pour creuser à cet endroit.', vacuum:'Aspirateur : aspire les objets de loin.', crane:'Grue : touchez un gros objet n\'importe où.', digger:'Pelleteuse : touchez un tas, elle en vide 3 d\'un coup !'}[el.dataset.t]; if(n) U.toast(n); },
  magnet(){ C.useMagnet(); },
  quake(){ C.useQuake(); },
  view(el){ const m = el.dataset.v || (R.cam.mode === 'fps' ? 'tps' : 'fps'); RD.setView(m); C.S.meta.settings.view = m; if(m === 'fps') U.toast('👁️ Vue à la 1re personne' + (matchMedia('(pointer:fine)').matches ? ' — cliquez pour viser à la souris' : '')); if(UI.sheet) U.refreshSheet(true); },
  lv(el){ fb(C.buyLeveled(el.dataset.id)); }, sack(){ fb(C.buySack()); }, once(el){ fb(C.buyOnce(el.dataset.id)); }, hire(el){ fb(C.hire(el.dataset.id)); }, unlock(el){ fb(C.unlockQ(+el.dataset.id)); },
  mbuy(el){ const a = C.marketBuy(+el.dataset.f); if(a){ A.sfx('buy'); U.toast('₿ Achat : ' + C.eur(a)); } else A.sfx('error'); },
  msell(el){ const p = C.marketSell(+el.dataset.f); if(p === null){ A.sfx('error'); return; } A.sfx('coin'); U.toast((p >= 0 ? '📈 Profit : +' : '📉 Perte : ') + C.eur(p), p >= 0 ? 'good' : 'bad'); },
  repair(el){ U.queue({type:'repair', idx:+el.dataset.i}); },
  skills(){ U.openSkills(); }, skillclose(){ U.closeSkills(); }, skillsel(el){ U.selectSkill(el.dataset.id); }, learn(el){ U.learnSkill(el.dataset.id); for(const f of C.W.fx.splice(0)) dispatch(f); },
  prestige(){ if(!C.S.ended || !confirm('Faire le prestige ? Nouvelle décharge, compétences remises à zéro, +' + C.karmaGain() + ' Karma ♻️.')) return;
    C.doPrestige(); UI.MQ = []; UI.modalOpen = false; UI.cur = null; $('#modal').classList.add('hidden'); U.closeSheet(); RD.buildWorld(); C.W.fx.length = 0; save();
    U.queue({type:'dialog', lines:[['n','Quelques jours plus tard…'],['k','Pour fêter ça, j\'ai fait du ménage. J\'ai jeté un vieux disque dur et…'],['k','…OH NON. PAS ENCORE.'],
      ['j','Une nouvelle décharge t\'attend, mon grand. Cette fois, choisis bien tes compétences (♻️ Karma : tout vaut plus cher).']], after:() => U.chapterBanner(0)}); },
  setting(el){ const st = U.settings(), k = el.dataset.k; st[k] = !st[k]; if(!UI.running) saveTitleSettings(); A.musicUpdate(); el.classList.toggle('on', st[k]); el.textContent = st[k] ? 'Activé' : 'Coupé'; },
  quality(el){ const st = U.settings(); st.quality = el.dataset.v; RD.setQuality(st.quality); if(!UI.running) saveTitleSettings(); el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); },
  export(){ const ta = $('#saveTxt'); let txt = ''; if(UI.running) txt = C.serialize(); else { try{ txt = localStorage.getItem(SAVE_KEY) || ''; }catch(e){} }
    ta.value = txt ? btoa(unescape(encodeURIComponent(txt))) : ''; ta.focus(); ta.select(); if(!ta.value){ U.toast('Aucune sauvegarde à exporter.'); return; }
    try{ navigator.clipboard && navigator.clipboard.writeText(ta.value).then(() => U.toast('📋 Code copié !'), () => {}); }catch(e){} },
  import(){ const code = $('#saveTxt').value.trim(); if(!code){ U.toast('Collez d\'abord un code.'); return; }
    let st; try{ st = C.parseSave(decodeURIComponent(escape(atob(code)))); }catch(e){ U.toast('❌ Code de sauvegarde invalide.', 'bad'); A.sfx('error'); return; }
    st.lastSave = Date.now(); try{ localStorage.setItem(SAVE_KEY, JSON.stringify(st)); }catch(e){}
    C.setS(st); UI.MQ = []; U.closeModal(); U.closeSheet(); startGame(false); U.toast('✅ Sauvegarde importée !', 'good'); },
  wipe(){ if(!confirm('Effacer définitivement la sauvegarde (partie, Karma, album et succès) ?')) return; UI.running = false; try{ localStorage.removeItem(SAVE_KEY); }catch(e){} location.reload(); },
  tuto(){ U.closeSheet(); U.queue({type:'dialog', lines:D.TUTO}); },
  totitle(){ save(); UI.running = false; location.reload(); },
};
function rerenderDialog(){ const m = UI.cur, c = D.CHARS[m.lines[m.i][0]];
  $('#mbox').querySelector('.av').textContent = c.e; $('#mbox').querySelector('.nm').textContent = c.n; $('#mbox').querySelector('.tx').textContent = m.lines[m.i][1];
  $('#mbox').querySelector('.muted').textContent = (m.i + 1) + ' / ' + m.lines.length;
  if(m.i === m.lines.length - 1){ const sk = $('#mbox [data-act=dlgskip]'); if(sk) sk.remove(); $('#mbox [data-act=dlgnext]').textContent = 'OK'; } }
function fb(ok){ A.sfx(ok ? 'buy' : 'error'); if(ok){ UI.sig = ''; U.hud(); for(const f of C.W.fx.splice(0)) dispatch(f); } }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el || el.disabled) return;
  A.audioInit(); const a = el.dataset.act;
  if(['newgame','continue','settings','closemodal','dlgnext','dlgskip','open','closesheet','tab','tuto','export','setting','quality','view'].includes(a)) A.sfx('click');
  if(ACTIONS[a]) ACTIONS[a](el);
});

/* =========================================================
   COMMANDES DANS LE MONDE : toucher, glisser, pincer, souris, clavier
   ========================================================= */
const cv = $('#world'), ptrs = new Map(); let drag = null, pinch = null, locked = false;
cv.addEventListener('pointerdown', e => { A.audioInit(); if(!UI.running || UI.modalOpen) return;
  if(UI.sheet){ U.closeSheet(); return; }
  if(R.cam.mode === 'fps' && e.pointerType === 'mouse' && !locked){ cv.requestPointerLock && cv.requestPointerLock(); return; }
  cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if(ptrs.size === 1) drag = {x:e.clientX, y:e.clientY, lx:e.clientX, ly:e.clientY, moved:false, t:performance.now()};
  if(ptrs.size === 2){ const [a, b] = [...ptrs.values()]; pinch = {d:Math.hypot(a.x - b.x, a.y - b.y) || 1}; drag = null; } });
cv.addEventListener('pointermove', e => {
  if(locked){ RD.camInput(e.movementX * .0025, -e.movementY * .0025); return; }
  if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if(pinch && ptrs.size === 2){ const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1; RD.camZoom(pinch.d / d); pinch.d = d; return; }
  if(drag){ const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if(Math.hypot(dx, dy) > 10) drag.moved = true;
    if(drag.moved){ RD.camInput((e.clientX - drag.lx) * .006, (e.clientY - drag.ly) * (R.cam.mode === 'fps' ? -.005 : .005)); } drag.lx = e.clientX; drag.ly = e.clientY; } });
function endPtr(e){ if(!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if(drag && !drag.moved && ptrs.size === 0) onTap(e.clientX, e.clientY);
  if(ptrs.size < 2) pinch = null; if(ptrs.size === 0) drag = null; }
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); drag = null; pinch = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); if(UI.running) RD.camZoom(e.deltaY > 0 ? 1.1 : 0.9); }, {passive:false});
cv.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === cv; });
document.addEventListener('mousedown', e => { if(locked && e.button === 0) onTap(innerWidth / 2, innerHeight / 2); });

/** Un toucher dans le monde : selon ce qui est touché et l'outil choisi */
function onTap(sx, sy){
  if(!UI.running || UI.modalOpen) return;
  const h = RD.pickAt(sx, sy); if(!h) return;
  const S = C.S, k = W.kevin;
  if(h.kind === 'gate'){ if(C.unlockQ(h.q)) return; U.toast('🔒 ' + D.QUARTERS[h.q].n + ' : il faut ' + C.eur(D.QUARTERS[h.q].cost) + '.', 'bad'); A.sfx('error'); return; }
  if(h.kind === 'hut'){ ACTIONS.sell(); return; }
  if(h.kind === 'loot'){ C.orderPickLoot(h.id); RD.markSel(h.point.x, h.point.z); return; }
  if(h.kind === 'big'){ if(S.tool === 'crane' && !S.up.crane) C.setTool('shovel'); C.orderBig(h.id); const o = W.bigs.find(b => b.id === h.id); if(o) RD.markSel(o.x, o.z); return; }
  if(h.kind === 'cont'){ C.orderCont(h.id); const o = W.conts.find(b => b.id === h.id); if(o) RD.markSel(o.x, o.z); return; }
  if(h.kind === 'heap'){
    if(k.target && k.target.c === h.c && k.target.r === h.r && !k.path.length){ if(!C.tapHit() && S.bag.length >= C.bagCap()) C.say(k, 'Sac plein !', 1.5); return; }
    if(C.orderDig(h.c, h.r)){ A.sfx('click'); RD.markSel(C.cx(h.c), C.cz(h.r)); } return; }
  if(h.kind === 'ground'){
    if(S.tool === 'det' && S.up.det){ if(C.orderDetectDig(h.point.x, h.point.z)) RD.markSel(h.point.x, h.point.z); return; }
    if(C.orderMove(h.point.x, h.point.z)) RD.markSel(h.point.x, h.point.z);
  }
}
const keys = new Set();
addEventListener('keydown', e => {
  if(!UI.running || e.target.tagName === 'TEXTAREA') return;
  if(UI.modalOpen){ if(e.code === 'Enter' || e.code === 'Space'){ const b = $('#mbox [data-act=dlgnext]'); if(b){ b.click(); e.preventDefault(); } } return; }
  keys.add(e.code);
  if(e.code === 'KeyV') ACTIONS.view({dataset:{}});
  if(e.code === 'KeyF') C.useMagnet();
  if(e.code === 'KeyR') C.useQuake();
  if(e.code === 'KeyE') interactNearest();
  if(e.code === 'Space'){ e.preventDefault(); if(!C.tapHit()) digFront(); }
  if(e.code === 'Escape'){ if($('#skillTree').classList.contains('open')) U.closeSkills(); else U.closeSheet(); }
  if(e.code === 'KeyK') U.openSkills();
  const tools = ['shovel', 'det', 'vacuum', 'crane', 'digger'], n = +e.key;
  if(n >= 1 && n <= 5){ const t = tools[n - 1]; if(t === 'shovel' || C.S.up[t]) C.setTool(t); }
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
function interactNearest(){
  const k = W.kevin; let best = null, bd = 3;
  for(const o of W.loot) if(o.landed){ const d = Math.hypot(o.x - k.x, o.z - k.z); if(d < bd){ bd = d; best = ['loot', o.id]; } }
  for(const o of W.conts) if(!o.open){ const d = Math.hypot(o.x - k.x, o.z - k.z); if(d < bd){ bd = d; best = ['cont', o.id]; } }
  for(const o of W.bigs) if(o.state === 'ground'){ const d = Math.hypot(o.x - k.x, o.z - k.z); if(d < bd){ bd = d; best = ['big', o.id]; } }
  if(!best){ const sp = C.sellPos(); if(Math.hypot(sp.x - k.x, sp.z - k.z) < 4) C.orderSell(); return; }
  if(best[0] === 'loot') C.orderPickLoot(best[1]); else if(best[0] === 'cont') C.orderCont(best[1]); else C.orderBig(best[1]);
}
function digFront(){ const k = W.kevin; const c = C.colOf(k.x + Math.sin(k.ang) * D.CELL * .8), r = C.rowOf(k.z + Math.cos(k.ang) * D.CELL * .8);
  let best = null, bd = 9; for(const [dc, dr] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){ const t = C.tile(c + dc, r + dr); if(t && t.L && C.adjacentOK(k.c, k.r, c + dc, r + dr)){ const d = Math.hypot(C.cx(c + dc) - k.x - Math.sin(k.ang), C.cz(r + dr) - k.z - Math.cos(k.ang)); if(d < bd){ bd = d; best = [c + dc, r + dr]; } } }
  if(best) C.orderDig(best[0], best[1]); }
function keyMove(dt){
  let fx = 0, fz = 0;
  if(keys.has('KeyW') || keys.has('KeyZ') || keys.has('ArrowUp')) fz += 1;
  if(keys.has('KeyS') || keys.has('ArrowDown')) fz -= 1;
  if(keys.has('KeyA') || keys.has('KeyQ') || keys.has('ArrowLeft')) fx += 1;
  if(keys.has('KeyD') || keys.has('ArrowRight')) fx -= 1;
  if(!fx && !fz) return;
  const f = RD.camForward(), n = Math.hypot(fx, fz);
  // avant = direction de la caméra, côté = perpendiculaire
  const dx = (f.x * fz + f.z * fx) / n, dz = (f.z * fz - f.x * fx) / n;
  C.moveFree(dx, dz, dt);
}

/* =========================================================
   BOUCLE PRINCIPALE
   ========================================================= */
function dispatch(f){ RD.onFx(f); U.onFx(f); }
let last = performance.now(), hudAcc = 0, saveAcc = 0, fpsAcc = 0, fpsN = 0, lowFpsT = 0;
function frame(now){
  let dt = (now - last) / 1000; last = now;
  if(UI.running && C.S){
    if(dt > 60){ const off = C.applyOffline(dt); if(off) U.toast('🌙 Pendant votre absence : +' + C.eur(off.money), 'good'); dt = 0.05; }
    dt = Math.min(dt, 0.1);
    keyMove(dt);
    C.update(dt);
    for(const f of C.W.fx.splice(0)) dispatch(f);
    hudAcc += dt; saveAcc += dt;
    if(hudAcc > 0.2){ hudAcc = 0; U.hud(); }
    if(saveAcc > 10){ saveAcc = 0; save(); }
    // qualité automatique : si le jeu rame, on baisse la qualité
    fpsAcc += dt; fpsN++;
    if(fpsAcc > 3){ const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
      if(C.S.meta.settings.quality === 'auto' && fps < 32 && R.quality !== 'low'){ lowFpsT++; if(lowFpsT >= 2){ RD.setQuality(R.quality === 'high' ? 'med' : 'low'); U.toast('🖼️ Qualité graphique baissée pour plus de fluidité.'); lowFpsT = 0; } } else lowFpsT = 0; }
  } else if(C.S && W.kevin){
    // écran titre : la caméra tourne lentement autour de la décharge
    C.S.dayT = 0.3 + Math.sin(now / 20000) * 0.05; R.cam.yaw = Math.PI + Math.sin(now / 9000) * 0.5; R.cam.pitch = 0.42; R.cam.dist = 24; R.cam.userT = 1;
  }
  if(C.S && W.kevin){ RD.frame(Math.min(dt, 0.1), now / 1000); U.uiFrame(Math.min(dt, 0.1)); }
  A.ambience(UI.running ? R.wx.rain : 0, UI.running ? R.wx.wind : 0);
  requestAnimationFrame(frame);
}
addEventListener('visibilitychange', () => { if(document.hidden) save(); else A.resume(); });
addEventListener('pagehide', save);

/* ---------- Initialisation ---------- */
(function init(){
  C.init(false);
  const s = loadSave(); $('#btnContinue').disabled = !s;
  UI.titleMeta = s ? s.meta : C.defaultMeta();
  if(!s){ try{ const st = JSON.parse(localStorage.getItem(SAVE_KEY + '_set') || 'null'); if(st) UI.titleMeta.settings = {...UI.titleMeta.settings, ...st}; }catch(e){} }
  A.setSettings(U.settings);
  RD.initRender(cv, UI.titleMeta.settings.quality);
  // une décharge de démonstration derrière l'écran titre (jamais sauvegardée)
  C.setS(C.newState(UI.titleMeta)); C.startWorld(); RD.buildWorld(); C.W.fx.length = 0;
  W.kevin.x = C.cx(D.GATE); W.kevin.z = C.cz(D.NQ * D.QROWS + 1); R.cam.tx = W.kevin.x; R.cam.tz = W.kevin.z;
  requestAnimationFrame(frame);
})();
/* accès pour les tests automatiques */
window.GAME = {C, D, RD, U, UI, W, get S(){ return C.S; }, save, loadSave, startGame, ACTIONS, onTap, dispatch};
