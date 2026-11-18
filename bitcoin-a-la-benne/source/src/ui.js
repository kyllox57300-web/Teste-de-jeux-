/* =========================================================
   INTERFACE HTML : HUD, barre d'outils, panneaux, arbre de compétences, mini-jeux
   ========================================================= */
import * as C from './core.js';
import * as D from './data.js';
import * as A from './audio.js';
import {R, toScreen, setView, setQuality, markSel} from './render.js';
const {W, eur, fmt, fmtTime, has} = C;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const UI = {MQ:[], modalOpen:false, cur:null, sheet:null, tab:null, sig:'', running:false, onPrestige:null, onStart:null};

/* ---------- Notifications ---------- */
export function toast(msg, cls){
  if(!UI.running) return; const box = $('#toasts'); while(box.children.length >= 3) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.textContent = msg; box.appendChild(d);
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, 2800);
}
/* ---------- Textes flottants dans le monde (« +12 € », bulles) ---------- */
const floats = [];
export function floatText(x, y, z, txt, col, big){
  const el = document.createElement('div'); el.className = 'float' + (big ? ' big' : ''); el.textContent = txt; el.style.color = col || '#fff';
  // décalage pour que plusieurs textes en même temps ne se chevauchent pas
  const recent = floats.filter(f => f.t < 0.4).length;
  $('#floats').appendChild(el); floats.push({el, x:x + (recent ? (Math.random() - .5) * 1.2 : 0), y:y + recent * 0.45, z, t:0, life:big ? 1.8 : 1.3});
}
const bubbleEls = new Map();
function updateFloats(dt){
  for(let i = floats.length - 1; i >= 0; i--){ const f = floats[i]; f.t += dt; const p = toScreen(f.x, f.y + f.t * 1.2, f.z);
    if(!p || f.t >= f.life){ f.el.remove(); floats.splice(i, 1); continue; }
    f.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-50%)'; f.el.style.opacity = f.t > f.life - .4 ? (f.life - f.t) / .4 : 1; }
  // bulles de dialogue au-dessus des personnages
  const ents = [W.kevin, ...W.workers].filter(e => e && e.bubble && e.bubbleT > 0);
  for(const [e, el] of bubbleEls) if(!ents.includes(e)){ el.remove(); bubbleEls.delete(e); }
  for(const e of ents){ let el = bubbleEls.get(e); if(!el){ el = document.createElement('div'); el.className = 'bubble'; $('#floats').appendChild(el); bubbleEls.set(e, el); }
    el.textContent = e.bubble; const p = toScreen(e.x, e === W.kevin && C.S.tool === 'digger' ? 3.6 : 2.6, e.z);
    if(!p || (e === W.kevin && R.cam.mode === 'fps')){ el.style.display = 'none'; continue; } el.style.display = ''; el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-100%)'; }
}

/* ---------- Fenêtres en file d'attente ---------- */
export function queue(m){ UI.MQ.push(m); if(!UI.modalOpen) nextModal(); }
export const busy = () => UI.MQ.length > 0 || UI.modalOpen;
function nextModal(){
  const m = UI.MQ.shift();
  if(!m){ UI.modalOpen = false; UI.cur = null; $('#modal').classList.add('hidden'); return; }
  UI.modalOpen = true; UI.cur = m; $('#modal').classList.remove('hidden');
  if(m.type === 'dialog'){ m.i = 0; renderDialog(); }
  else if(m.type === 'event'){ A.sfx('event'); renderEvent(); }
  else if(m.type === 'end') renderEnd();
  else if(m.type === 'html') $('#mbox').innerHTML = m.html;
  else if(m.type === 'safe') startSafeGame(m);
  else if(m.type === 'repair') startRepairGame(m);
}
export function closeModal(){ const m = UI.cur; UI.cur = null; if(m && m.after) m.after(); nextModal(); }
function renderDialog(){ const m = UI.cur, [k, txt] = m.lines[m.i], c = D.CHARS[k];
  $('#mbox').innerHTML = '<div class="who"><div class="av">' + c.e + '</div><div class="grow"><div class="nm">' + esc(c.n) + '</div><div class="tx">' + esc(txt) + '</div></div></div>' +
    '<div class="row" style="margin-top:10px"><span class="muted grow" style="font-size:12px">' + (m.i + 1) + ' / ' + m.lines.length + '</span>' +
    (m.i < m.lines.length - 1 ? '<button class="btn" data-act="dlgskip">Passer</button>' : '') +
    '<button class="btn prim" data-act="dlgnext">' + (m.i < m.lines.length - 1 ? 'Suite ▶' : 'OK') + '</button></div>'; }
function renderEvent(){ const ev = UI.cur.ev;
  $('#mbox').innerHTML = '<h2>' + ev.e + ' ' + esc(ev.t) + '</h2><p class="muted">' + esc(ev.d) + '</p><div class="choices">' +
    ev.ch.map((c, i) => '<button class="btn" data-act="evchoice" data-i="' + i + '">' + esc(c[0]) + '</button>').join('') + '</div>'; }
function renderEnd(){
  $('#mbox').innerHTML = '<div style="text-align:center"><div style="font-size:66px">💽</div><h2>Disque dur retrouvé !</h2><p class="muted">Félicitations, vous avez fouillé la décharge jusqu\'au fond.</p></div>' +
    '<table class="st">' + statRows() + '</table>' +
    '<p class="muted" style="margin:10px 0;font-size:12.5px">Le <b>prestige</b> recommence avec une nouvelle décharge, des compétences à choisir autrement, et <b>+' + C.karmaGain() + ' Karma ♻️</b> (+10 % de valeur chacun, pour toujours). L\'album est gardé.</p>' +
    '<div class="choices"><button class="btn prim" data-act="prestige">♻️ Prestige (+' + C.karmaGain() + ' Karma)</button><button class="btn" data-act="closemodal">Continuer à fouiller</button></div>';
}
export function chapterBanner(i){ A.sfx('chapter'); const el = $('#chapter'); el.classList.remove('hidden');
  el.innerHTML = '<div><small>Chapitre ' + (i + 1) + '</small><b>' + esc(D.CHAPTERS[i].t) + '</b></div>'; setTimeout(() => el.classList.add('hidden'), 2700); }

/* =========================================================
   MINI-JEUX
   ========================================================= */
/** Coffre-fort : une aiguille tourne, il faut toucher STOP quand elle est dans la zone verte */
function startSafeGame(m){
  const steps = m.steps; let step = 0, ang = 0, speed = 2.2, zone = randZone(), fails = 0, raf = 0, last = performance.now();
  function randZone(){ return {a:Math.random() * Math.PI * 2, w:0.55}; }
  $('#mbox').innerHTML = '<h2>🔐 Coffre-fort</h2><p class="muted">Touchez <b>STOP</b> quand l\'aiguille est dans la zone verte. Étape <b id="sgStep">1</b> / ' + steps + '</p>' +
    '<svg id="sgDial" viewBox="-110 -110 220 220" style="width:220px;height:220px;display:block;margin:6px auto"><circle r="100" fill="#2a3440" stroke="#c0a040" stroke-width="8"/>' +
    '<path id="sgZone" fill="none" stroke="#3ee08f" stroke-width="18"/><g id="sgTicks"></g><line id="sgNeedle" x1="0" y1="0" x2="0" y2="-82" stroke="#ff5d6c" stroke-width="6" stroke-linecap="round"/><circle r="12" fill="#c0a040"/></svg>' +
    '<button class="btn prim" style="width:100%;min-height:60px;font-size:20px" id="sgStop">STOP</button><button class="btn" style="width:100%;margin-top:6px" id="sgQuit">Abandonner</button>';
  const ticks = []; for(let i = 0; i < 24; i++){ const a = i / 24 * Math.PI * 2; ticks.push('<line x1="' + Math.sin(a) * 88 + '" y1="' + -Math.cos(a) * 88 + '" x2="' + Math.sin(a) * 96 + '" y2="' + -Math.cos(a) * 96 + '" stroke="#8090a0" stroke-width="3"/>'); }
  $('#sgTicks').innerHTML = ticks.join('');
  const drawZone = () => { const r = 82, a0 = zone.a - zone.w / 2, a1 = zone.a + zone.w / 2;
    $('#sgZone').setAttribute('d', 'M ' + Math.sin(a0) * r + ' ' + -Math.cos(a0) * r + ' A ' + r + ' ' + r + ' 0 0 1 ' + Math.sin(a1) * r + ' ' + -Math.cos(a1) * r); };
  drawZone();
  const loop = now => { const dt = (now - last) / 1000; last = now; ang = (ang + speed * dt) % (Math.PI * 2); const n = $('#sgNeedle'); if(!n){ cancelAnimationFrame(raf); return; }
    n.setAttribute('transform', 'rotate(' + ang * 180 / Math.PI + ')'); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  $('#sgStop').onclick = () => {
    let d = Math.abs(((ang - zone.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if(d < zone.w / 2 + 0.05){ step++; A.sfx('click2'); if(step >= steps){ cancelAnimationFrame(raf); C.safeResult(m.id, true); closeModal(); return; }
      $('#sgStep').textContent = step + 1; zone = randZone(); speed *= 1.35; drawZone(); }
    else { fails++; A.sfx('error'); $('#sgDial').animate([{transform:'translateX(-6px)'}, {transform:'translateX(6px)'}, {transform:'translateX(0)'}], {duration:200}); zone = randZone(); drawZone(); }
  };
  $('#sgQuit').onclick = () => { cancelAnimationFrame(raf); closeModal(); };
}
/** Réparation : un curseur va et vient, il faut toucher quand il est dans la zone verte (3 fois) */
function startRepairGame(m){
  let hits = 0, pos = 0, dir = 1, raf = 0, last = performance.now(); const zoneW = has('B1') ? 0.34 : 0.17; let z0 = 0.3 + Math.random() * 0.4;
  const it = C.S.bag[m.idx]; if(!it){ closeModal(); return; } const L = C.itemOf(it);
  $('#mbox').innerHTML = '<h2>🔧 Réparer : ' + L[0] + ' ' + esc(L[1]) + '</h2><p class="muted">Touchez quand le curseur est dans la zone verte. Réussites : <b id="rpN">0</b> / 3. Valeur réparée : <b>' + eur(C.itemValue([it[0], it[1], it[2], 0, 1])) + '</b> (cassé : ' + eur(C.itemValue(it)) + ')</p>' +
    '<div id="rpBar" style="position:relative;height:46px;border-radius:12px;background:#17130e;border:1px solid var(--line);margin:12px 0;overflow:hidden"><div id="rpZone" style="position:absolute;top:0;bottom:0;background:#2fa86a"></div><div id="rpCur" style="position:absolute;top:0;bottom:0;width:6px;background:#ffd84f;box-shadow:0 0 10px #ffd84f"></div></div>' +
    '<button class="btn prim" style="width:100%;min-height:60px;font-size:20px" id="rpHit">🔨 TAPER</button><button class="btn" style="width:100%;margin-top:6px" id="rpQuit">Plus tard</button>';
  const drawZ = () => { const z = $('#rpZone'); z.style.left = z0 * 100 + '%'; z.style.width = zoneW * 100 + '%'; }; drawZ();
  const loop = now => { const dt = (now - last) / 1000; last = now; pos += dir * dt * (0.9 + hits * 0.35); if(pos > 1){ pos = 1; dir = -1; } if(pos < 0){ pos = 0; dir = 1; }
    const c = $('#rpCur'); if(!c){ cancelAnimationFrame(raf); return; } c.style.left = 'calc(' + pos * 100 + '% - 3px)'; raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  $('#rpHit').onclick = () => {
    if(pos >= z0 && pos <= z0 + zoneW){ hits++; A.sfx('repair'); $('#rpN').textContent = hits; if(hits >= 3){ cancelAnimationFrame(raf); C.repairItem(m.idx); toast('🔧 Réparé ! ' + L[0] + ' ' + L[1] + ' vaut maintenant ' + eur(C.itemValue(C.S.bag[m.idx] || it)), 'good'); closeModal(); if(UI.sheet) refreshSheet(true); return; }
      z0 = 0.05 + Math.random() * (0.9 - zoneW); drawZ(); }
    else { A.sfx('error'); $('#rpBar').animate([{transform:'translateX(-6px)'}, {transform:'translateX(6px)'}, {transform:'translateX(0)'}], {duration:200}); }
  };
  $('#rpQuit').onclick = () => { cancelAnimationFrame(raf); closeModal(); };
}

/* =========================================================
   HUD
   ========================================================= */
const TOOLS = [
  {id:'shovel', ic:'⛏️', n:'Pelle', need:null},
  {id:'det',    ic:'📡', n:'Détecteur', need:'det'},
  {id:'vacuum', ic:'🌀', n:'Aspirateur', need:'vacuum'},
  {id:'crane',  ic:'🏗️', n:'Grue', need:'crane'},
  {id:'digger', ic:'🚜', n:'Pelleteuse', need:'digger'},
];
let lastToolSig = '';
export function hud(){
  if(!UI.running || !C.S || !W.kevin) return;
  const S = C.S;
  $('#mVal').textContent = eur(S.money);
  const inc = C.teamIncome();
  $('#mSub').textContent = 'Décharge vidée : ' + (C.clearedCount() / C.TOTAL_HEAPS * 100).toFixed(1).replace('.', ',') + ' %' + (inc > 0 ? ' · équipe ' + eur(inc) + '/s' : '');
  const cap = C.bagCap(), n = S.bag.length;
  $('#bagTxt').textContent = n + '/' + cap; const bar = $('#bagBar'); bar.style.width = Math.min(100, n / cap * 100) + '%'; bar.classList.toggle('full', n >= cap);
  $('#lvTxt').textContent = 'Niv. ' + S.lvl; $('#xpBar').style.width = Math.min(100, S.xp / C.xpNeed(S.lvl) * 100) + '%';
  $('#spDot').classList.toggle('hidden', !S.sp); $('#spDot').textContent = S.sp;
  const truckBusy = S.up.truck && W.truck.state !== 'home';
  $('#bSell').classList.toggle('pulse', (n >= cap || !!W.kevin.carry) && !truckBusy);
  $('#bSell').innerHTML = '<span class="i">' + (W.kevin.carry && has('CU') ? '🦸' : S.up.truck ? '🚛' : '🏠') + '</span>' + (W.kevin.carry && has('CU') ? 'Lancer' : truckBusy ? 'Camion…' : 'Vendre');
  if(S.ended){ $('#gCh').textContent = 'Partie terminée 🎉'; $('#gObj').textContent = 'Disque retrouvé ! Prestige dans Menu › Stats.'; $('#gBar').style.width = '100%'; }
  else { const o = C.CHAPTER_GOALS[S.chapter].obj(); $('#gCh').textContent = 'Chapitre ' + (S.chapter + 1) + ' — ' + D.CHAPTERS[S.chapter].t;
    $('#gObj').textContent = '🎯 ' + o.txt; $('#gBar').style.width = (C.clamp(o.pct, 0, 1) * 100).toFixed(1) + '%'; }
  const q = C.QUESTS[S.quest]; let ql = q ? '📜 <b>' + esc(q.t) + '</b>' : '📜 Toutes les quêtes sont faites !';
  if(S.order){ const L = D.LOOT[S.order.q][S.order.i]; ql += ' &nbsp;·&nbsp; 📦 ' + L[0] + ' ' + S.order.got + '/' + S.order.n; }
  $('#gQuest').innerHTML = ql;
  // barre d'outils (seulement les outils possédés)
  const sig = TOOLS.filter(t => !t.need || S.up[t.need]).map(t => t.id).join() + S.tool;
  if(sig !== lastToolSig){ lastToolSig = sig;
    $('#tools').innerHTML = TOOLS.filter(t => !t.need || S.up[t.need]).map(t => '<button class="tool' + (S.tool === t.id ? ' on' : '') + '" data-act="tool" data-t="' + t.id + '"><span>' + t.ic + '</span>' + t.n + '</button>').join(''); }
  // boutons d'action (aimant, séisme, lancer)
  const mg = $('#bMagnet'); mg.classList.toggle('hidden', !S.up.magnet); if(S.up.magnet){ const cd = S.cds.magnet || 0; mg.querySelector('i').style.height = (cd / (10 / C.gadgetMul()) * 100) + '%'; }
  const qk = $('#bQuake'); qk.classList.toggle('hidden', !has('FU')); if(has('FU')) qk.querySelector('i').style.height = ((S.cds.quake || 0) / 40 * 100) + '%';
  $('#bView').textContent = R.cam.mode === 'fps' ? '🎥' : '👁️';
  // détecteur
  const det = $('#det'), showDet = S.up.det && (S.tool === 'det' || C.detTargets().some(t => t.story));
  det.classList.toggle('hidden', !showDet);
  if(showDet){ const lv = Math.ceil(C.DET.strength * 5);
    $('#detBars').innerHTML = [0,1,2,3,4].map(i => '<i style="height:' + (5 + i * 4) + 'px;background:' + (i < lv ? (lv >= 4 ? '#ff5d6c' : lv >= 2 ? '#ffd84f' : '#7bd88f') : '#0006') + '"></i>').join('');
    $('#detTxt').textContent = !C.DET.target ? 'Rien à proximité' : (C.DET.target.story ? '💽 ' : '💰 ') + ['Rien…', 'Très faible', 'Faible', 'Moyen', 'Fort', 'TRÈS FORT !'][lv]; }
  $('#buffs').innerHTML = (S.combo >= 2 ? '<span class="buff">🔥 Combo x' + S.combo + '</span>' : '') + (C.isNight() ? '<span class="buff">🌙 Nuit : chance +30 %</span>' : '') +
    S.buffs.map(b => '<span class="buff ' + (b.neg ? 'neg' : '') + '">' + esc(b.label) + ' ' + Math.ceil(b.until - S.st.time) + ' s</span>').join('');
  const top = 54 + $('#goal').offsetHeight + 6;
  for(const id of ['#det', '#buffs', '#toasts']) $(id).style.top = 'calc(' + top + 'px + env(safe-area-inset-top))';
  if(UI.sheet) refreshSheet();
  if($('#skillTree').classList.contains('open')) skillTreeUpdate();
}
export function uiFrame(dt){ updateFloats(dt); }

/* =========================================================
   PANNEAUX : Boutique, Marché, Sac, Album, Menu
   ========================================================= */
const SHEETS = {
  shop:{title:'🛠️ Boutique', tabs:[['gear','Outils'], ['up','Améliorations'], ['team','Équipe'], ['zones','Portails']]},
  market:{title:'📈 Marché du Bitcoin', tabs:[]},
  bag:{title:'🎒 Sac & Album', tabs:[['bag','Sac'], ['album','Album']]},
  menu:{title:'☰ Menu', tabs:[['quests','Quêtes'], ['ach','Succès'], ['stats','Stats'], ['settings','Réglages']]},
};
export function openSheet(id, tab){
  UI.sheet = id; const sh = SHEETS[id]; UI.tab = tab || (sh.tabs[0] && sh.tabs[0][0]) || 'market';
  $('#sheetTitle').textContent = sh.title;
  $('#sheetTabs').innerHTML = sh.tabs.map(([k, n]) => '<button data-act="tab" data-tab="' + k + '" class="' + (k === UI.tab ? 'on' : '') + '">' + n + '</button>').join('');
  $('#sheetTabs').classList.toggle('hidden', !sh.tabs.length);
  $('#sheet').classList.add('open'); UI.sig = ''; refreshSheet(true); $('#sheetBody').scrollTop = 0;
}
export function closeSheet(){ $('#sheet').classList.remove('open'); UI.sheet = null; }
export function refreshSheet(force){
  const v = VIEWS[UI.sheet === 'market' ? 'market' : UI.tab]; if(!v) return;
  const sig = v.sig ? v.sig() : 'x';
  if(force || sig !== UI.sig){ UI.sig = sig; const sc = $('#sheetBody').scrollTop; $('#sheetBody').innerHTML = v.build(); $('#sheetBody').scrollTop = sc; }
  $('#sheetBody').querySelectorAll('[data-cost]').forEach(b => { b.disabled = C.S.money < +b.dataset.cost; });
  if(v.upd) v.upd();
}
function statRows(){
  const S = C.S, st = S.st;
  return [['⏱️ Temps de jeu', fmtTime(S.ended ? S.endTime : st.time)], ['🗑️ Tas vidés', fmt(st.heaps) + ' (' + (C.clearedCount() / C.TOTAL_HEAPS * 100).toFixed(0) + ' %)'], ['🔎 Objets trouvés', fmt(st.finds)],
    ['💶 Argent total gagné', eur(st.earned)], ['📦 Gros objets vendus', fmt(st.bigs)], ['🧳 Contenants fouillés', fmt(st.opened)], ['🔐 Coffres-forts', fmt(st.safes)], ['💰 Trésors déterrés', fmt(st.treasures)],
    ['🔧 Objets réparés', fmt(st.repaired)], ['⭐ Niveau', S.lvl], ['📈 Meilleur profit au marché', eur(st.bestTrade)], ['🏆 Légendaires trouvés', fmt(st.legs)], ['🎲 Événements vécus', fmt(st.events)]]
    .map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('');
}
const buyBtn = (act, id, cost, label) => cost === null ? '<button class="buy" disabled>' + (label || '✔') + '</button>' :
  '<button class="buy" data-act="' + act + '" data-id="' + id + '" data-cost="' + cost + '"' + (C.S.money < cost ? ' disabled' : '') + '>' + (label || 'Acheter') + '<small>' + eur(cost) + '</small></button>';
const lockCard = (n, z) => '<div class="card lock"><div class="ic">🔒</div><div class="grow"><div class="t">' + n + '</div><div class="d">Avec le portail « ' + D.QUARTERS[z].n + ' ».</div></div></div>';
const LV_DESC = {
  tool:() => 'Force +10 % par niveau (x' + fmt(C.toolPow()) + '). L\'outil change aux niveaux 10, 25 et 45.',
  luck:() => '+5 % de chance d\'objets rares par niveau (x' + C.luck().toFixed(2).replace('.', ',') + ').',
  boots:() => '+8 % de vitesse de marche par niveau.',
  team:() => 'Employés +5 % de force par niveau (x' + fmt(C.teamPow()) + ').',
  detR:() => 'Le détecteur capte de plus loin (portée ' + Math.round(C.detRange()) + ' m).',
};
function lvCard(u){ const S = C.S, lv = S.up[u.id], max = lv >= u.max;
  return '<div class="card"><div class="ic">' + u.ic + '</div><div class="grow"><div class="t">' + (u.id === 'tool' ? D.TOOL_TIERS[C.toolTier()].n : u.n) + ' <span class="tag">niv. ' + lv + '</span></div><div class="d">' + LV_DESC[u.id]() + '</div></div>' +
    buyBtn('lv', u.id, max ? null : C.costLv(u.base, lv), max ? 'MAX' : 'Améliorer') + '</div>'; }
const VIEWS = {
  gear:{ sig:()=>JSON.stringify([C.S.up, C.S.unlocked, C.S.skills]),
    build(){ const S = C.S; let h = '<p class="muted" style="font-size:12.5px;margin-bottom:8px">Les outils apparaissent dans la barre en bas de l\'écran : chacun change votre façon de fouiller.</p>';
      for(const o of D.ONCE){ if(o.z > C.deepestOpen()){ if(o.z === C.deepestOpen() + 1) h += lockCard(o.n, o.z); continue; }
        h += '<div class="card"><div class="ic">' + o.ic + '</div><div class="grow"><div class="t">' + o.n + '</div><div class="d">' + o.d + '</div></div>' + buyBtn('once', o.id, S.up[o.id] ? null : C.onceCost(o.id)) + '</div>'; }
      return h; }},
  up:{ sig:()=>JSON.stringify([C.S.up, C.S.unlocked, C.S.skills]),
    build(){ const S = C.S; let h = lvCard(D.LEVELED[0]);
      const sc = C.sackCost(), nx = D.SACKS[S.up.sac + 1];
      h += '<div class="card"><div class="ic">🎒</div><div class="grow"><div class="t">Sac plus grand <span class="tag">' + D.SACKS[S.up.sac].cap + ' places</span></div><div class="d">' +
        (nx ? 'Capacité ' + D.SACKS[S.up.sac].cap + ' → ' + nx.cap + '. Le sac grossit sur le dos de Kévin.' : 'Plus grand sac atteint.') + '</div></div>' + buyBtn('sack', 'sack', sc, nx ? 'Acheter' : 'MAX') + '</div>';
      for(const u of D.LEVELED.slice(1)){ if(u.id === 'team') continue; if(u.z > C.deepestOpen() || (u.need && !S.up[u.need])) continue; h += lvCard(u); }
      return h; }},
  team:{ sig:()=>JSON.stringify([C.S.emps, C.S.unlocked, C.S.up.team, C.S.skills]),
    build(){ const S = C.S; let h = '<p class="muted" style="font-size:12.5px;margin-bottom:8px">Les employés marchent jusqu\'aux tas (le quartier ouvert le plus profond) et les vident tout seuls, même quand vous ne jouez pas. Ils revendent eux-mêmes ce qu\'ils trouvent. Maximum ' + D.EMP_MAX + ' de chaque.</p>';
      for(const e of D.EMPS){ if(e.z > C.deepestOpen()){ h += lockCard(e.n, e.z); continue; }
        const n = S.emps[e.id];
        h += '<div class="card"><div class="ic">' + e.e + '</div><div class="grow"><div class="t">' + e.n + ' <span class="tag">' + n + '/' + D.EMP_MAX + '</span></div><div class="d">' + e.d + '</div></div>' +
          buyBtn('hire', e.id, n >= D.EMP_MAX ? null : C.empCost(e.id), n >= D.EMP_MAX ? 'MAX' : 'Embaucher') + '</div>'; }
      const u = D.LEVELED.find(x => x.id === 'team'); if(u.z <= C.deepestOpen()) h += lvCard(u);
      return h; }},
  zones:{ sig:()=>JSON.stringify(C.S.unlocked),
    build(){ const S = C.S; return '<p class="muted" style="font-size:12.5px;margin-bottom:8px">Chaque portail ouvre un quartier plus profond : tas plus gros et plus durs, objets bien plus chers. Après l\'ouverture, creusez à travers le portail (au centre).</p>' +
      D.QUARTERS.map((Q, q) => { const pct = Math.round(C.qClearedPct(q) * 100), avail = q > 0 && !S.unlocked[q] && S.unlocked[q - 1];
        return '<div class="card' + (S.unlocked[q] || avail ? '' : ' lock') + '"><div class="ic">' + Q.e + '</div><div class="grow"><div class="t">' + Q.n + '</div><div class="d">' +
          (S.unlocked[q] ? 'Ouvert · vidé à ' + pct + ' % · objets x' + fmt(Q.v) : 'Tas de ' + Q.L[0] + ' à ' + Q.L[1] + ' couches · objets x' + fmt(Q.v)) + '</div></div>' +
          (avail ? buyBtn('unlock', q, Q.cost, 'Ouvrir') : '') + '</div>'; }).join(''); }},
  market:{ sig:()=>'m' + has('M4'),
    build(){ return '<div class="row"><div class="grow"><div class="muted" style="font-size:12px">Cours actuel (1 ₿)</div><div class="price" id="mP"></div></div><b id="mC"></b></div>' +
      (has('M4') ? '<div class="card" style="margin:6px 0"><div class="ic">📈</div><div class="grow"><div class="t">Tuyau d\'initié</div><div class="d" id="mTip"></div></div></div>' : '') +
      '<canvas id="chart"></canvas><div class="row" style="font-size:13px"><div class="grow">Vous avez<br><b id="mH"></b></div><div class="grow">Valeur<br><b id="mV"></b></div><div class="grow">Gain / perte<br><b id="mPL"></b></div></div>' +
      '<h3>Acheter avec vos euros</h3><div class="mgrid"><button class="btn ok" data-act="mbuy" data-f="0.1">10 %</button><button class="btn ok" data-act="mbuy" data-f="0.5">50 %</button><button class="btn ok" data-act="mbuy" data-f="1">Tout</button></div>' +
      '<h3>Revendre vos bitcoins</h3><div class="mgrid"><button class="btn bad" data-act="msell" data-f="0.1">10 %</button><button class="btn bad" data-act="msell" data-f="0.5">50 %</button><button class="btn bad" data-act="msell" data-f="1">Tout</button></div>' +
      '<p class="muted" style="font-size:12px;margin-top:10px">Frais : ' + (has('M4') ? 'aucun (compétence Initié)' : '1 % à l\'achat et à la vente') + '. Le cours bouge chaque seconde. Meilleur profit : <b id="mBest"></b></p>'; },
    upd(){ const S = C.S, m = S.market, h = m.hist, prev = h[Math.max(0, h.length - 31)], ch = (m.p / prev - 1) * 100;
      $('#mP').textContent = eur(m.p); $('#mC').textContent = (ch >= 0 ? '▲ +' : '▼ ') + ch.toFixed(1).replace('.', ',') + ' %'; $('#mC').style.color = ch >= 0 ? 'var(--ok)' : 'var(--bad)';
      const val = S.btc * m.p * (1 - C.FEE()), pl = val - S.btcCost;
      $('#mH').textContent = (S.btc >= 1 ? S.btc.toFixed(4) : S.btc.toFixed(6)).replace('.', ',') + ' ₿'; $('#mV').textContent = eur(val); $('#mPL').textContent = (pl >= 0 ? '+' : '') + eur(pl); $('#mPL').style.color = pl >= 0 ? 'var(--ok)' : 'var(--bad)';
      $('#mBest').textContent = eur(S.st.bestTrade);
      if($('#mTip')){ const tr = C.marketTrend(); $('#mTip').innerHTML = 'Dans 10 s : <b style="color:' + (tr >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' + (tr >= 0 ? '▲ hausse' : '▼ baisse') + ' de ' + Math.abs(tr * 100).toFixed(1).replace('.', ',') + ' %</b>'; }
      drawChart(); }},
  bag:{ sig:()=>JSON.stringify(C.S.bag.map(it => it[0] + '_' + it[1] + '_' + it[3])),
    build(){ const S = C.S; if(!S.bag.length) return '<p class="muted">Votre sac est vide. Allez fouiller !</p>';
      let tot = 0; S.bag.forEach(it => tot += C.itemValue(it));
      let h = '<div class="card"><div class="ic">🎒</div><div class="grow"><div class="t">' + S.bag.length + ' / ' + C.bagCap() + ' objets</div><div class="d">Valeur chez Josiane : environ <b>' + eur(tot) + '</b>. Les objets cassés 🔧 valent ' + (has('B4') ? 'le prix plein (Pièces détachées)' : '30 % du prix') + ' : réparez-les !</div></div></div>';
      const order = {l:0, e:1, r:2, c:3};
      const list = S.bag.map((it, i) => [it, i]).sort((a, b) => order[C.itemOf(a[0])[2]] - order[C.itemOf(b[0])[2]] || b[0][3] - a[0][3]);
      for(const [it, i] of list){ const L = C.itemOf(it);
        h += '<div class="inv" style="border-left-color:' + D.RAR[L[2]].col + '"><div class="ic">' + L[0] + '</div><div class="grow"><div class="nm" style="color:' + D.RAR[L[2]].col + '">' + esc(L[1]) + (it[3] ? ' <span class="tag" style="background:#6a2020">cassé</span>' : it[4] ? ' <span class="tag" style="background:#1f5a3c">réparé</span>' : '') + '</div><div class="d">' + D.RAR[L[2]].n + ' · ' + eur(C.itemValue(it)) + '</div></div>' +
          (it[3] ? '<button class="btn sm" data-act="repair" data-i="' + i + '">🔧 Réparer</button>' : '') + '</div>'; }
      return h; }},
  album:{ sig:()=>JSON.stringify(C.S.meta.album),
    build(){ const S = C.S, A_ = S.meta.album;
      let h = '<p class="muted" style="font-size:12.5px;margin-bottom:6px">Trouvez les 8 objets d\'un quartier pour compléter sa série : ses objets valent alors +25 % (+50 % avec Collectionneur). L\'album est gardé après un prestige.</p>';
      D.LOOT.forEach((list, q) => { const done = C.seriesDone(q), n = list.filter((_, i) => A_[q + '_' + i]).length;
        h += '<h3>' + D.QUARTERS[q].e + ' ' + D.QUARTERS[q].n + ' <span class="tag"' + (done ? ' style="background:#7a5a10;color:#ffe08a"' : '') + '>' + n + '/8' + (done ? ' ✔ +' + Math.round((C.seriesBonus(q) - 1) * 100) + ' %' : '') + '</span></h3><div class="colgrid">';
        list.forEach((it, i) => { const k = q + '_' + i, c = A_[k] || 0;
          h += '<div class="' + (c ? '' : 'no') + '"><span class="e">' + (c ? it[0] : '❔') + '</span><span style="color:' + D.RAR[it[2]].col + '">' + (c ? esc(it[1]) : D.RAR[it[2]].n) + '</span>' + (c ? '<br>x' + fmt(c) : '') + '</div>'; });
        h += '</div>'; });
      const nb = D.BIG.filter(b => A_['B_' + b.id]).length;
      h += '<h3>📦 Gros objets <span class="tag">' + nb + '/' + D.BIG.length + (C.bigSeriesDone() ? ' ✔ tous les prix +15 %' : '') + '</span></h3><div class="colgrid">' +
        D.BIG.map(b => '<div class="' + (A_['B_' + b.id] ? '' : 'no') + '"><span class="e">' + (A_['B_' + b.id] ? b.e : '❔') + '</span>' + (A_['B_' + b.id] ? esc(b.n) + '<br>x' + A_['B_' + b.id] : 'Poids ' + b.w) + '</div>').join('') + '</div>';
      return h; }},
  quests:{ sig:()=>C.S.quest + '/' + C.S.chapter + C.S.ended + C.S.story.found,
    build(){ const S = C.S; let h = '<h3 style="margin-top:0">Histoire</h3>';
      D.CHAPTERS.forEach((c, i) => { const done = i < S.chapter || S.ended, cur = i === S.chapter && !S.ended;
        h += '<div class="q ' + (done ? 'done' : cur ? 'cur' : '') + '"><span style="font-size:18px">' + (done ? '✅' : cur ? '▶️' : '🔒') + '</span><div class="grow"><b>Chapitre ' + (i + 1) + ' — ' + esc(c.t) + '</b>' +
          (cur ? '<div class="muted" style="font-size:12px">' + esc(C.CHAPTER_GOALS[i].obj().txt) + '</div>' : done && S.chapterTimes[i] ? '<div class="muted" style="font-size:11.5px">Terminé à ' + fmtTime(S.chapterTimes[i]) + '</div>' : '') + '</div></div>'; });
      h += '<h3>Quêtes</h3>';
      C.QUESTS.forEach((q, i) => { if(i > S.quest + 2) return; const done = i < S.quest, cur = i === S.quest;
        h += '<div class="q ' + (done ? 'done' : cur ? 'cur' : '') + '"><span>' + (done ? '✅' : cur ? '👉' : '⬜') + '</span><div class="grow">' + esc(q.t) + '</div>' + (q.r[1] ? '<span class="muted" style="font-size:11px">🎁 ≥ ' + eur(q.r[1]) + '</span>' : '') + '</div>'; });
      if(S.order){ const L = D.LOOT[S.order.q][S.order.i]; h += '<h3>Commande de Josiane</h3><div class="q cur"><span>📦</span><div class="grow">Apporter ' + S.order.n + ' × ' + L[0] + ' ' + esc(L[1]) + ' (payés x4) — ' + S.order.got + '/' + S.order.n + '<br><span class="muted" style="font-size:11.5px">Prime à la fin : ' + eur(S.order.reward) + ' · reste ' + fmtTime(Math.max(0, S.order.until - S.st.time)) + '</span></div></div>'; }
      return h; }},
  ach:{ sig:()=>String(Object.keys(C.S.meta.ach).length),
    build(){ const S = C.S, n = C.ACHS.filter(a => S.meta.ach[a.id]).length;
      return '<h3 style="margin-top:0">' + n + ' / ' + C.ACHS.length + ' succès</h3><div class="ach">' + C.ACHS.map(a => '<div class="' + (S.meta.ach[a.id] ? '' : 'lock') + '"><span class="e">' + a.e + '</span><b>' + esc(a.n) + '</b>' + esc(a.d) + '</div>').join('') + '</div>'; }},
  stats:{ sig:()=>String(C.S.ended) + C.S.meta.karma + Math.floor(C.S.st.time / 5),
    build(){ const S = C.S, L = S.meta.life;
      let h = '<h3 style="margin-top:0">Cette partie</h3><table class="st">' + statRows() + '</table><h3>Depuis toujours</h3><table class="st">' +
        [['⏱️ Temps de jeu', fmtTime(L.time)], ['🗑️ Tas vidés', fmt(L.heaps)], ['🔎 Objets trouvés', fmt(L.finds)], ['💶 Argent gagné', eur(L.earned)], ['📈 Meilleur profit', eur(L.bestTrade)],
         ['💽 Parties terminées', S.meta.finishes], ['⚡ Meilleur temps', S.meta.bestTime ? fmtTime(S.meta.bestTime) : '—'], ['♻️ Karma', S.meta.karma + ' (+' + S.meta.karma * 10 + ' %)']]
        .map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</table><h3>♻️ Prestige</h3>';
      h += S.ended ? '<p style="font-size:13px;margin-bottom:8px">Nouvelle décharge, nouvelles compétences à choisir, avec <b>+' + C.karmaGain() + ' Karma</b> (+10 % de valeur chacun, pour toujours). Album et succès gardés.</p><button class="btn prim" style="width:100%" data-act="prestige">♻️ Faire le prestige</button>'
        : '<p class="muted" style="font-size:13px">Disponible quand vous aurez retrouvé le disque dur.</p>';
      return h; }},
  settings:{ sig:()=>JSON.stringify(settings()), build:()=>settingsHTML(true) },
};
export const settings = () => (C.S ? C.S.meta : UI.titleMeta).settings;
export function settingsHTML(inGame){
  const st = settings(), sw = (k, on) => '<button class="tg ' + (on ? 'on' : '') + '" data-act="setting" data-k="' + k + '">' + (on ? 'Activé' : 'Coupé') + '</button>';
  return '<div class="set"><span>🔊 Sons</span>' + sw('sound', st.sound) + '</div><div class="set"><span>🎵 Musique</span>' + sw('music', st.music) + '</div>' +
    '<div class="set" style="flex-wrap:wrap"><span>🖼️ Qualité graphique' + (st.quality === 'auto' ? ' (auto : ' + ({low:'basse', med:'moyenne', high:'haute'})[R.quality] + ')' : '') + '</span><div class="seg" style="width:100%">' +
    [['auto','Auto'],['low','Basse'],['med','Moyenne'],['high','Haute']].map(([v, n]) => '<button data-act="quality" data-v="' + v + '" class="' + (st.quality === v ? 'on' : '') + '">' + n + '</button>').join('') + '</div></div>' +
    '<div class="set"><span>👁️ Vue</span><div class="seg"><button data-act="view" data-v="tps" class="' + (R.cam.mode === 'tps' ? 'on' : '') + '">3e personne</button><button data-act="view" data-v="fps" class="' + (R.cam.mode === 'fps' ? 'on' : '') + '">1re personne</button></div></div>' +
    '<p class="muted" style="font-size:12px;margin:8px 0">Ordinateur : ZQSD (ou WASD / flèches) pour marcher, souris pour regarder (clic maintenu), clic pour agir, molette pour zoomer, V pour changer de vue, E pour ramasser, 1 à 5 pour les outils, F aimant, R séisme.</p>' +
    '<h3>Sauvegarde</h3><p class="muted" style="font-size:12px;margin-bottom:6px">Sauvegarde automatique toutes les 10 s sur cet appareil. Pour la transférer : Exporter, copiez le code, puis collez-le et Importer sur l\'autre appareil.</p>' +
    '<textarea id="saveTxt" placeholder="Code de sauvegarde…"></textarea><div class="row" style="margin-top:6px"><button class="btn grow" data-act="export">📤 Exporter</button><button class="btn grow" data-act="import">📥 Importer</button></div>' +
    (inGame ? '<div class="row" style="margin-top:6px"><button class="btn grow" data-act="tuto">❓ Tutoriel</button><button class="btn grow" data-act="totitle">🏠 Écran titre</button></div>' : '') +
    '<button class="btn bad" style="width:100%;margin-top:6px" data-act="wipe">🗑️ Effacer la sauvegarde</button>';
}
function drawChart(){
  const c = $('#chart'); if(!c) return;
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight; if(!w) return;
  if(c.width !== Math.round(w * dpr)){ c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d'), S = C.S; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const d = S.market.hist; let mn = Math.min(...d), mx = Math.max(...d); const pad = (mx - mn) * 0.1 || mx * 0.01; mn -= pad; mx += pad;
  const X = i => i / (d.length - 1) * w, Y = v => h - (v - mn) / (mx - mn) * h, col = d[d.length - 1] >= d[0] ? '#3ee08f' : '#ff5d6c';
  g.strokeStyle = '#ffffff12'; g.lineWidth = 1; for(let i = 1; i < 4; i++){ g.beginPath(); g.moveTo(0, h * i / 4); g.lineTo(w, h * i / 4); g.stroke(); }
  g.beginPath(); d.forEach((v, i) => i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v))); g.strokeStyle = col; g.lineWidth = 2; g.stroke();
  g.lineTo(w, h); g.lineTo(0, h); g.closePath(); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, col + '55'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fill();
  if(S.btc > 0){ const avg = S.btcCost / S.btc / (1 - C.FEE()); if(avg > mn && avg < mx){ g.setLineDash([5, 4]); g.strokeStyle = '#ffcf3a'; g.beginPath(); g.moveTo(0, Y(avg)); g.lineTo(w, Y(avg)); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ffcf3a'; g.font = '11px system-ui'; g.fillText('votre prix moyen', 6, Y(avg) - 4); } }
  g.fillStyle = '#d8ccb6'; g.font = '11px system-ui'; g.fillText(eur(mx), 6, 13); g.fillText(eur(mn), 6, h - 5);
}

/* =========================================================
   ARBRE DE COMPÉTENCES (écran plein, branches reliées)
   ========================================================= */
let selSkill = null;
const NODE_POS = {1:[.5, .1], 2:[.25, .3], 3:[.75, .3], 4:[.25, .52], 5:[.75, .52], 6:[.5, .72], U:[.5, .9]};
export function openSkills(){ $('#skillTree').classList.add('open'); selSkill = null; skillTreeBuild(); A.sfx('click'); }
export function closeSkills(){ $('#skillTree').classList.remove('open'); }
function skillTreeBuild(){
  const S = C.S;
  let h = '<div class="stHead"><div><b>⭐ Compétences de Kévin</b><div class="muted" style="font-size:12px">Niveau ' + S.lvl + ' · <span id="stSp"></span></div></div><button class="x" data-act="skillclose">✕</button></div>';
  h += '<div class="stBranches">';
  for(const b of D.BRANCHES){
    h += '<div class="branch" style="--bc:' + b.col + '"><div class="bname">' + b.ic + ' ' + b.n + '</div><div class="bbody"><svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none">';
    for(const s of D.SKILLS.filter(s => s.b === b.id)) for(const r of s.req){ const p1 = NODE_POS[r.slice(1)], p2 = NODE_POS[s.id.slice(1)];
      h += '<line data-l="' + r + '-' + s.id + '" x1="' + p1[0] * 100 + '" y1="' + p1[1] * 100 + '" x2="' + p2[0] * 100 + '" y2="' + p2[1] * 100 + '"/>'; }
    h += '</svg>';
    for(const s of D.SKILLS.filter(s => s.b === b.id)){ const p = NODE_POS[s.id.slice(1)];
      h += '<button class="node' + (s.ult ? ' ult' : '') + '" data-act="skillsel" data-id="' + s.id + '" id="nd_' + s.id + '" style="left:' + p[0] * 100 + '%;top:' + p[1] * 100 + '%"><span>' + s.ic + '</span></button>'; }
    h += '</div></div>';
  }
  h += '</div><div class="stInfo" id="stInfo"></div>';
  $('#skillTree').innerHTML = h; skillTreeUpdate();
}
function skillTreeUpdate(){
  const S = C.S; if(!$('#stSp')) return;
  $('#stSp').innerHTML = '<b style="color:var(--acc)">' + S.sp + '</b> point' + (S.sp > 1 ? 's' : '') + ' à dépenser · prochain niveau dans ' + fmt(C.xpNeed(S.lvl) - S.xp) + ' XP';
  for(const s of D.SKILLS){ const el = $('#nd_' + s.id); if(!el) continue;
    el.classList.toggle('own', has(s.id)); el.classList.toggle('can', C.canLearn(s.id)); el.classList.toggle('sel', selSkill === s.id);
    const reqOk = !s.req.length || (s.any ? s.req.some(has) : s.req.every(has)); el.classList.toggle('locked', !has(s.id) && !reqOk); }
  document.querySelectorAll('#skillTree line').forEach(l => { const [a, b] = l.dataset.l.split('-'); l.classList.toggle('on', has(a) && has(b)); l.classList.toggle('half', has(a) && !has(b)); });
  const s = selSkill && D.SKILL_BY_ID[selSkill], info = $('#stInfo');
  if(!s){ info.innerHTML = '<div class="muted" style="text-align:center;padding:8px">Touchez une compétence pour voir ce qu\'elle fait. Chaque niveau donne 1 point. Vous ne pourrez pas tout prendre : choisissez une spécialité ! Le prestige permet de recommencer avec d\'autres choix.</div>'; return; }
  const br = D.BRANCHES.find(b => b.id === s.b), reqTxt = s.req.length ? 'Nécessite : ' + s.req.map(r => D.SKILL_BY_ID[r].n).join(s.any ? ' ou ' : ' et ') : '';
  info.innerHTML = '<div class="row"><div style="font-size:34px">' + s.ic + '</div><div class="grow"><b style="color:' + br.col + '">' + esc(s.n) + '</b> <span class="tag">' + br.n + '</span><div style="font-size:13.5px;margin-top:3px">' + esc(s.d) + '</div><div class="muted" style="font-size:11.5px;margin-top:3px">' + reqTxt + '</div></div>' +
    (has(s.id) ? '<button class="buy" disabled>✔ Acquise</button>' : '<button class="buy" data-act="learn" data-id="' + s.id + '"' + (C.canLearn(s.id) ? '' : ' disabled') + '>Débloquer<small>' + s.cost + ' pt' + (s.cost > 1 ? 's' : '') + '</small></button>') + '</div>';
}
export function selectSkill(id){ selSkill = id; skillTreeUpdate(); A.sfx('click'); }
export function learnSkill(id){ if(C.learn(id)){ toast((D.SKILL_BY_ID[id].ult ? '🌟 ULTIME : ' : '⭐ Compétence : ') + D.SKILL_BY_ID[id].n, 'gold'); skillTreeUpdate(); hud(); return true; } A.sfx('error'); return false; }

/* ---------- File d'événements du moteur → interface ---------- */
export function onFx(f){
  switch(f.t){
    case 'toast': toast(f.msg, f.cls); break;
    case 'sfx': A.sfx(f.n, f.x); break;
    case 'dialog': queue({type:'dialog', lines:f.lines, after:f.end ? () => queue({type:'end'}) : f.chapter ? () => chapterBanner(f.chapter) : null}); break;
    case 'event': if(!busy()) queue({type:'event', ev:f.ev}); break;
    case 'safeGame': queue({type:'safe', id:f.id, steps:f.steps}); break;
    case 'pick': { const L = C.itemOf(f.it); if(L[2] !== 'c') floatText(f.x, 1.2, f.z, L[0] + ' ' + L[1], D.RAR[L[2]].col, L[2] === 'l'); else floatText(f.x, 1.0, f.z, L[0], '#fff'); break; }
    case 'sell': { const sp = C.sellPos(); floatText(sp.x, 2.2, sp.z - .5, '+' + eur(f.v), '#ffd84f', true); break; }
    case 'sellBig': { const sp = C.sellPos(); floatText(sp.x, 2.6, sp.z - 1, '+' + eur(f.v), '#ffd84f', true); break; }
    case 'workerFind': if(Math.random() < .5) floatText(f.x, 2.2, f.z, '+' + eur(f.v), '#ffd84f'); break;
    case 'level': floatText(W.kevin.x, 2.8, W.kevin.z, '⭐ NIVEAU ' + f.lv, '#80d0ff', true); break;
    case 'albumNew': break;
  }
}
