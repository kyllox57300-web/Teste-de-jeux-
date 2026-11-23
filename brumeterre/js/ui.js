// Brumeterre — outils d'interface (écrans, fenêtres, éléments communs)
(function (B) {
  'use strict';
  const U = B.UI = {};
  const $ = (s, r) => (r || document).querySelector(s);
  U.$ = $;
  U.esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ───── Écrans ─────
  U.cur = null;
  U.show = function (name, html, handlers, opts) {
    opts = opts || {};
    const root = $('#screens');
    const old = root.querySelectorAll('.scr');
    old.forEach(o => { o.classList.add('out'); setTimeout(() => o.remove(), 260); });
    const el = document.createElement('div');
    el.className = 'scr ' + (opts.cls || '') + (['village', 'title', 'loading', 'combat', 'map'].indexOf(name) < 0 ? ' dim' : '');
    el.dataset.name = name;
    el.innerHTML = html;
    root.appendChild(el);
    U.cur = name;
    if (handlers) U.bind(el, handlers);
    return el;
  };
  U.bind = function (el, handlers) {
    el.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-a]');
      if (!t || !el.contains(t)) return;
      const a = t.dataset.a;
      if (handlers[a]) { ev.stopPropagation(); if (!t.dataset.silent) B.Audio.sfx('click'); handlers[a](t, ev); }
    });
  };
  // ───── Fenêtres ─────
  U.modal = function (html, handlers, opts) {
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'modal ' + (opts.cls || '');
    el.innerHTML = '<div class="box">' + html + '</div>';
    $('#ov').appendChild(el);
    if (handlers) U.bind(el, handlers);
    if (opts.closeOnBg) el.addEventListener('click', (e) => { if (e.target === el) U.close(el); });
    B.Audio.sfx('open');
    return el;
  };
  U.close = function (el) {
    if (!el) { const all = $('#ov').querySelectorAll('.modal'); el = all[all.length - 1]; }
    if (!el) return;
    el.style.animation = 'fadeIn .18s ease reverse both';
    setTimeout(() => el.remove(), 170);
  };
  U.closeAll = function () { $('#ov').innerHTML = ''; };
  U.hasModal = () => !!$('#ov .modal');
  U.toast = function (msg, ms) {
    const t = document.createElement('div'); t.className = 'tst'; t.innerHTML = msg;
    if (ms) t.style.animationDuration = ms + 'ms';
    $('#toast').appendChild(t); setTimeout(() => t.remove(), ms || 3000);
  };
  U.confirm = function (txt, yes, yesLabel) {
    const m = U.modal('<div class="panel col center"><p style="font-size:16px;line-height:1.4">' + txt + '</p><div class="grid2"><button class="btn" data-a="no">Annuler</button><button class="btn red" data-a="yes">' + (yesLabel || 'Confirmer') + '</button></div></div>',
      { no: () => U.close(m), yes: () => { U.close(m); yes(); } }, { closeOnBg: true });
  };

  // ───── Éléments communs ─────
  U.res = function (k, v, need) {
    const R = B.Meta.RES[k];
    const ok = need === undefined || (B.P.res[k] || 0) >= need;
    return '<span class="res' + (ok ? '' : ' bad') + '">' + R.i + ' ' + B.fmt(v !== undefined ? v : (B.P.res[k] || 0)) + '</span>';
  };
  U.cost = function (cost) { if (!cost) return ''; return Object.keys(cost).map(k => U.res(k, cost[k], cost[k])).join(' '); };
  U.resBar = function (keys) {
    keys = keys || ['braise', 'bois', 'essence', 'herbe', 'aube'];
    return keys.map(k => '<span class="res" title="' + B.Meta.RES[k].n + '">' + B.Meta.RES[k].i + ' ' + B.fmt(B.P.res[k] || 0) + '</span>').join('');
  };
  U.top = function (title, extra) {
    return '<div class="top"><button class="back" data-a="back">‹</button><h2>' + title + '</h2>' + (extra || '') + '</div>';
  };
  U.elemTags = function (els) { return els.map(e => '<span class="tag" style="color:' + B.ELEM[e].c + '">' + B.ELEM[e].i + ' ' + B.elemName(e) + '</span>').join(''); };
  U.pwIcon = function (id, size) {
    const d = B.POWERS[id];
    const c = d.e.length ? B.ELEM[d.e[0]].c : '#c9c3b5';
    return '<span class="ico ' + (size || '') + '" style="border-color:' + c + ';box-shadow:inset 0 0 12px ' + c + '55">' + d.i + '</span>';
  };
  U.pwKind = (d) => d.kind === 'w' ? 'Arme' : d.kind === 'e' ? 'Évolution' : 'Passif';
  // texte d'un niveau d'arme
  U.lvText = function (d, lvl) {
    if (d.kind === 'p') { const k = Object.keys(d.st)[0]; return d.d; }
    if (!d.lv || lvl < 2) return d.d;
    const L = d.lv[lvl - 2];
    return Object.keys(L).map(k => {
      const v = L[k];
      if (k === 'cdm') return 'Recharge −' + Math.round((1 - v) * 100) + ' %';
      if (k === 'fxslow') return 'Ralentissement +' + Math.round(v * 100) + ' %';
      if (k === 'fxfreeze') return 'Gel +' + Math.round(v * 100) + ' %';
      if (k === 'fxstun') return 'Étourdissement +' + v + ' s';
      if (k === 'arc') return 'Angle +' + Math.round(v * 57) + '°';
      if (k === 'tick') return 'Cadence +' + Math.round(-v * 200) + ' %';
      if (k === 'spd' && d.type === 'orbit') return 'Rotation +' + Math.round(v * 30) + ' %';
      return (B.PARAM_LABEL[k] || k) + ' +' + (k === 'r' ? Math.round(v) : Math.round(v * 10) / 10);
    }).join(', ');
  };
  // Carte de pouvoir (choix de niveau)
  U.powerCard = function (card, run, i) {
    if (card.id === '_gold') return '<button class="pcard r0" data-a="pick" data-i="' + i + '"><span class="ico">🪙</span><div><div class="nm">Bourse</div><div class="ds">+25 pièces d\'or</div></div></button>';
    if (card.id === '_heal') return '<button class="pcard r0" data-a="pick" data-i="' + i + '"><span class="ico">🍖</span><div><div class="nm">Repas chaud</div><div class="ds">Soigne 30 % de la vie</div></div></button>';
    const d = B.POWERS[card.id];
    const syn = run.cardSynergy(card);
    let lvTxt, ds;
    if (card.evo) { lvTxt = '<span class="new">★ ÉVOLUTION LÉGENDAIRE</span>'; ds = d.d + '<br><span class="mut tiny">Remplace ' + B.POWERS[d.from].n + '</span>'; }
    else if (!card.from) { lvTxt = '<span class="new">NOUVEAU · ' + U.pwKind(d).toUpperCase() + (card.lv > 1 ? ' · NIV. ' + card.lv : '') + '</span>'; ds = d.d; }
    else { lvTxt = '<span class="mut tiny" style="font-weight:800">NIV. ' + card.from + ' → <span class="rt">' + card.lv + '</span></span>'; ds = d.kind === 'w' ? U.lvText(d, card.from + 1) + (card.lv - card.from > 1 ? ' <b class="rt">(+' + (card.lv - card.from) + ' niveaux)</b>' : '') : d.d + (card.lv - card.from > 1 ? ' <b class="rt">×' + (card.lv - card.from) + '</b>' : ''); }
    let tags = syn.elems.map(x => '<span class="tag' + (x.hot ? ' hot' : '') + '" style="color:' + B.ELEM[x.e].c + '">' + B.ELEM[x.e].i + ' ' + B.elemName(x.e) + ' ' + x.c + (x.hot ? ' · Synergie !' : '') + '</span>').join('');
    if (syn.evoWith && !card.evo) tags += '<span class="tag' + (syn.evoWith.has ? ' hot' : '') + '">⭐ Évolue avec ' + B.POWERS[syn.evoWith.p].i + ' ' + B.POWERS[syn.evoWith.p].n + '</span>';
    if (syn.evoFor) tags += '<span class="tag hot">⭐ Fait évoluer ' + B.POWERS[syn.evoFor.w].n + (syn.evoFor.lvl < 5 ? ' (niv. 5)' : '') + '</span>';
    return '<button class="pcard r' + card.rar + (card.evo ? ' evo' : '') + '" data-a="pick" data-i="' + i + '" style="animation-delay:' + (i * 0.07) + 's">' +
      U.pwIcon(card.id) + '<div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between;gap:6px"><span class="nm">' + d.n + '</span><span class="rt tiny">' + (card.evo ? 'Légendaire' : B.rarityName(card.rar)) + '</span></div>' + lvTxt +
      '<div class="ds">' + ds + '</div><div class="syn">' + tags + '</div></div></button>';
  };
  // Objet
  U.itemCard = function (it, opts) {
    opts = opts || {};
    const Me = B.Meta;
    const u = it.u ? B.UNIQUES.find(x => x.id === it.u) : null;
    return '<div class="card r' + it.rar + ' rb' + (opts.sel ? ' sel' : '') + '" ' + (opts.a ? 'data-a="' + opts.a + '" data-uid="' + it.uid + '"' : '') + ' style="cursor:pointer">' +
      '<div class="row"><span class="ico" style="border-color:var(--rc)">' + B.SLOT_ICON[it.slot] + '</span><div style="flex:1;min-width:0"><div class="rt" style="font-size:15px">' + Me.itemName(it) + (it.up ? ' +' + it.up : '') + '</div>' +
      '<div class="tiny mut">' + B.rarityName(it.rar) + ' · ' + B.SLOT_NAME[it.slot] + ' · puissance ' + Me.itemPower(it) + (opts.eq ? ' · <b class="gold">équipé</b>' : '') + '</div></div></div>' +
      '<div class="small" style="margin-top:6px;line-height:1.45">' + it.lines.map(l => '• ' + Me.lineText(it, l)).join('<br>') + (u ? '<br><b class="rt">★ ' + u.d + '</b>' : '') + '</div></div>';
  };
  U.bar = (k, cls) => '<div class="bar ' + (cls || '') + '"><i style="width:' + Math.round(B.clamp(k, 0, 1) * 100) + '%"></i></div>';
})(this.B || (this.B = {}));
