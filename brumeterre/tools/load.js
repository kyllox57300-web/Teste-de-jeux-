// Charge les fichiers du jeu (sans DOM) dans Node
const fs = require('fs'), vm = require('vm'), path = require('path');
module.exports = function load(files) {
  const ctx = { console, Math, Date, JSON, Object, Array, Map, Set, setTimeout, clearTimeout };
  ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
  return ctx.B;
};
