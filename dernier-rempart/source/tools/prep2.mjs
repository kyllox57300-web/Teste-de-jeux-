// Shrinks the two human models: JPEG textures at sensible sizes, no dance clips.
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup } from '@gltf-transform/functions';
import sharp from 'sharp';
const io = new NodeIO();
async function prep(src, dst, sizes) {
  const doc = await io.read(src), r = doc.getRoot();
  for (const a of r.listAnimations()) { for (const c of a.listChannels()) c.dispose(); for (const s of a.listSamplers()) s.dispose(); a.dispose(); }
  for (const m of r.listMaterials()) { m.setMetallicFactor(0); m.setMetallicRoughnessTexture(null); }
  for (const t of r.listTextures()) {
    const [w] = t.getSize(); if (w <= 4) continue;
    const name = t.getName() || '', isN = /(_N|Normal|-N)/.test(name) || r.listMaterials().some((m) => m.getNormalTexture() === t);
    const size = Math.min(w, isN ? sizes.normal : sizes.base);
    const img = await sharp(Buffer.from(t.getImage())).resize(size, size, { fit: 'fill' }).flatten({ background: isN ? '#8080ff' : '#808080' }).jpeg({ quality: isN ? 88 : 86 }).toBuffer();
    t.setImage(img); t.setMimeType('image/jpeg');
  }
  await doc.transform(prune({ keepAttributes: true }), dedup());
  await io.write(dst, doc);
}
await prep('assets/raw/readyplayer.me.glb', 'assets/zombie_m.glb', { base: 1024, normal: 512 });
await prep('assets/raw/Michelle.glb', 'assets/zombie_f.glb', { base: 512, normal: 512 });
import fs from 'fs'; for (const f of ['zombie_m.glb', 'zombie_f.glb']) console.log(f, fs.statSync('assets/' + f).size);

// Michelle: halve the triangle count (skinned meshes are supported by the simplifier)
{
  const { weld, simplify } = await import('@gltf-transform/functions');
  const { MeshoptSimplifier } = await import('meshoptimizer');
  await MeshoptSimplifier.ready;
  const doc = await io.read('assets/zombie_f.glb');
  await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.002 }));
  await io.write('assets/zombie_f.glb', doc);
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) console.log('michelle tris', p.getIndices().getCount() / 3);
  console.log('zombie_f.glb', fs.statSync('assets/zombie_f.glb').size);
}
