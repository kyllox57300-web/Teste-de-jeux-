// Convertit des modèles gratuits (glTF texturés KayKit / Kenney, licence CC0) en un petit fichier binaire
// de géométries à couleurs de sommets (le style du jeu) : assets/props.bin
// Usage : node tools/props.mjs   (les dossiers des packs sont listés dans PACKS ci-dessous)
import {NodeIO} from '@gltf-transform/core';
import {PNG} from 'pngjs';
import fs from 'fs'; import path from 'path';
const KK = '/home/user/kaykit-game-assets';
const PACKS = {city:KK + '/KayKit-City-Builder-Bits-1.0', furn:KK + '/KayKit-Furniture-Bits-1.0', resto:KK + '/KayKit-Restaurant-Bits-1.0', hall:KK + '/KayKit-Halloween-Bits-1.0'};
// nom dans le jeu : [pack, fichier]
const LIST = JSON.parse(fs.readFileSync(new URL('./props-list.json', import.meta.url)));
const find = (dir, name) => { for(const e of fs.readdirSync(dir, {withFileTypes:true})){ const p = path.join(dir, e.name);
  if(e.isDirectory()){ if(/fbx|obj/i.test(e.name)) continue; const r = find(p, name); if(r) return r; } else if(e.name === name + '.gltf') return p; } return null; };
const io = new NodeIO(); const out = []; const index = {};
const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
const mul = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
for(const [key, [pack, file, simp]] of Object.entries(LIST)){
  const f = find(PACKS[pack], file); if(!f) throw new Error('introuvable ' + file);
  const doc = await io.read(f); const pos = [], col = [];
  const imgCache = new Map();
  for(const node of doc.getRoot().listNodes()){
    const mesh = node.getMesh(); if(!mesh) continue; const M = node.getWorldMatrix();
    for(const prim of mesh.listPrimitives()){
      const P = prim.getAttribute('POSITION'), UV = prim.getAttribute('TEXCOORD_0'), I = prim.getIndices(); const mat = prim.getMaterial();
      const tex = mat && mat.getBaseColorTexture(), fac = mat ? mat.getBaseColorFactor() : [1, 1, 1, 1];
      let png = null; if(tex){ if(!imgCache.has(tex)) imgCache.set(tex, PNG.sync.read(Buffer.from(tex.getImage()))); png = imgCache.get(tex); }
      const n = I ? I.getCount() : P.getCount(), idx = i => I ? I.getScalar(i) : i, a = [0, 0, 0], u = [0, 0];
      for(let t = 0; t < n; t += 3){
        let cr = fac[0], cg = fac[1], cb = fac[2];
        if(png && UV){ let su = 0, sv = 0; for(let k = 0; k < 3; k++){ UV.getElement(idx(t + k), u); su += u[0] / 3; sv += u[1] / 3; }
          const x = Math.min(png.width - 1, Math.max(0, Math.floor((su - Math.floor(su)) * png.width))), y = Math.min(png.height - 1, Math.max(0, Math.floor((sv - Math.floor(sv)) * png.height))), o = (y * png.width + x) * 4;
          cr *= lin(png.data[o]); cg *= lin(png.data[o + 1]); cb *= lin(png.data[o + 2]); }
        for(let k = 0; k < 3; k++){ P.getElement(idx(t + k), a); pos.push(...mul(M, a[0], a[1], a[2])); col.push(cr, cg, cb); }
      }
    }
  }
  // simplification optionnelle (regroupement des sommets proches sur une grille) : moins de triangles
  if(simp){ const mn0 = [1e9, 1e9, 1e9], mx0 = [-1e9, -1e9, -1e9]; for(let i = 0; i < pos.length; i++){ mn0[i % 3] = Math.min(mn0[i % 3], pos[i]); mx0[i % 3] = Math.max(mx0[i % 3], pos[i]); }
    const cell = simp * Math.max(...mx0.map((v, i) => v - mn0[i])), rep = new Map(), cl = [];
    for(let v = 0; v < pos.length / 3; v++){ const k = [0, 1, 2].map(a => Math.round((pos[v * 3 + a] - mn0[a]) / cell)).join(','); if(!rep.has(k)) rep.set(k, [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]]); cl.push(k); }
    const np = [], nc = [], before = pos.length / 9;
    for(let t = 0; t < cl.length; t += 3){ if(cl[t] === cl[t + 1] || cl[t + 1] === cl[t + 2] || cl[t] === cl[t + 2]) continue;
      for(let k = 0; k < 3; k++){ np.push(...rep.get(cl[t + k])); nc.push(col[(t + k) * 3], col[(t + k) * 3 + 1], col[(t + k) * 3 + 2]); } }
    pos.length = 0; pos.push(...np); col.length = 0; col.push(...nc); console.log('   simplifié', before, '→', pos.length / 9); }
  // boîte englobante → quantification des positions sur 16 bits
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for(let i = 0; i < pos.length; i++){ mn[i % 3] = Math.min(mn[i % 3], pos[i]); mx[i % 3] = Math.max(mx[i % 3], pos[i]); }
  // sommets identiques (même position, même couleur) partagés → fichier bien plus petit
  const map = new Map(), vq = [], vc = [], ind = [];
  for(let v = 0; v < pos.length / 3; v++){
    const qp = [0, 1, 2].map(k => Math.round((pos[v * 3 + k] - mn[k]) / ((mx[k] - mn[k]) || 1) * 65534 - 32767));
    const qc = [0, 1, 2].map(k => Math.round(Math.pow(Math.min(1, col[v * 3 + k]), 1 / 2.2) * 255));
    const key2 = qp.join(',') + '|' + qc.join(','); let id = map.get(key2);
    if(id === undefined){ id = vq.length / 3; map.set(key2, id); vq.push(...qp); vc.push(...qc); }
    ind.push(id);
  }
  const q = Int16Array.from(vq), c8 = Uint8Array.from(vc), ix = Uint16Array.from(ind);
  index[key] = {nv:vq.length / 3, ni:ind.length, min:mn, max:mx};
  const pad = n => Buffer.alloc((4 - n % 4) % 4);
  out.push(Buffer.from(q.buffer), pad(q.byteLength), Buffer.from(c8.buffer), pad(c8.byteLength), Buffer.from(ix.buffer), pad(ix.byteLength));
  console.log(key.padEnd(14), file.padEnd(24), pos.length / 9, 'triangles', mx.map((v, i) => (v - mn[i]).toFixed(2)).join(' x '));
}
const head = Buffer.from(JSON.stringify(index)); const hl = Buffer.alloc(4); hl.writeUInt32LE(head.length + (4 - head.length % 4) % 4);
const all = Buffer.concat([hl, head, Buffer.alloc((4 - head.length % 4) % 4, 32), ...out]);
fs.writeFileSync(new URL('../assets/props.bin', import.meta.url), all); console.log('props.bin', (all.length / 1024).toFixed(0), 'Ko');
