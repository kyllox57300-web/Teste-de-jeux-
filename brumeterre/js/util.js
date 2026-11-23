// Brumeterre — outils communs (sans DOM : utilisable dans le navigateur et dans Node)
(function (B) {
  'use strict';
  B.VERSION = '1.0.0';

  // Générateur pseudo-aléatoire à graine (mulberry32)
  B.rng = function (seed) {
    let a = (seed >>> 0) || 1;
    const r = function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.state = () => a;
    r.shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
    r.weighted = (items, wf) => {
      let tot = 0; for (const it of items) tot += Math.max(0, wf(it));
      let x = r() * tot;
      for (const it of items) { x -= Math.max(0, wf(it)); if (x <= 0) return it; }
      return items[items.length - 1];
    };
    return r;
  };
  B.hashStr = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  B.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  B.lerp = (a, b, t) => a + (b - a) * t;
  B.dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
  B.angTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
  B.rand = (a, b) => a + Math.random() * (b - a);
  B.randi = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  B.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  B.fmt = function (n) {
    n = Math.floor(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + '\u202fM';
    if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace('.', ',') + '\u202fk';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  };
  B.fmtTime = function (s) {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    if (h) return h + ' h ' + String(m).padStart(2, '0');
    return m + ':' + String(x).padStart(2, '0');
  };
  B.pct = (v) => Math.round(v * 100) + ' %';
  B.dayKey = function (d) { d = d || new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  B.weekKey = function (d) {
    d = d || new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() * 100 + Math.ceil(((t - y0) / 86400000 + 1) / 7);
  };

  // Traduction : B.t('clé') ; textes FR par défaut, EN dans lang.js
  B.lang = 'fr';
  B.STR = { fr: {}, en: {} };
  B.t = function (k, vars) {
    let s = (B.STR[B.lang] && B.STR[B.lang][k]) || B.STR.fr[k] || k;
    if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  };
  // Texte d'un contenu (nom / description) avec traduction éventuelle
  B.tx = function (obj, field) {
    if (!obj) return '';
    if (B.lang !== 'fr' && obj.en && obj.en[field]) return obj.en[field];
    return obj[field] || '';
  };

  B.RARITY = [
    { id: 'common', n: 'Commun', en: 'Common', c: '#c9c3b5', w: 60 },
    { id: 'rare', n: 'Rare', en: 'Rare', c: '#5fb4ff', w: 28 },
    { id: 'epic', n: 'Épique', en: 'Epic', c: '#c178ff', w: 10 },
    { id: 'legendary', n: 'Légendaire', en: 'Legendary', c: '#ffb43c', w: 2 },
    { id: 'mythic', n: 'Mythique', en: 'Mythic', c: '#ff4f7a', w: 0 }
  ];
  B.rarityName = (i) => (B.lang === 'en' ? B.RARITY[i].en : B.RARITY[i].n);

  B.ELEM = {
    fire: { n: 'Feu', en: 'Fire', c: '#ff7a2f', i: '🔥' },
    ice: { n: 'Glace', en: 'Ice', c: '#7fd8ff', i: '❄️' },
    bolt: { n: 'Foudre', en: 'Lightning', c: '#ffe14d', i: '⚡' },
    poison: { n: 'Poison', en: 'Poison', c: '#8ee04a', i: '☠️' },
    light: { n: 'Lumière', en: 'Light', c: '#fff1b0', i: '✨' },
    shadow: { n: 'Ombre', en: 'Shadow', c: '#a77bff', i: '🌑' },
    nature: { n: 'Nature', en: 'Nature', c: '#5bd17a', i: '🌿' },
    arcane: { n: 'Arcane', en: 'Arcane', c: '#ff7ad9', i: '🔮' }
  };
  B.elemName = (e) => (B.lang === 'en' ? B.ELEM[e].en : B.ELEM[e].n);
})(this.B || (this.B = {}));
