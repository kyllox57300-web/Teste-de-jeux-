import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import sharp from 'sharp';
const [src, outDir, tag] = process.argv.slice(2);
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(src);
const r = doc.getRoot(); let i = 0;
for (const m of r.listMaterials()) {
  for (const [k, t] of [['base', m.getBaseColorTexture()], ['norm', m.getNormalTexture()], ['mr', m.getMetallicRoughnessTexture()]]) {
    if (!t) continue; const f = `${outDir}/${tag}-${m.getName().replace(/[^a-z0-9]+/gi, '_')}-${k}.png`;
    await sharp(Buffer.from(t.getImage())).resize(256, 256, { fit: 'inside' }).png().toFile(f); i++;
    console.log(f.split('/').pop(), t.getSize(), 'factor', m.getBaseColorFactor().map((v) => v.toFixed(2)).join(','));
  }
}
for (const s of r.listSkins()) console.log('skin joints', s.listJoints().length);
for (const n of r.listNodes()) if (n.getMesh()) console.log('mesh node', n.getName(), n.getSkin() ? 'skinned' : '', n.getTranslation(), n.getScale());
