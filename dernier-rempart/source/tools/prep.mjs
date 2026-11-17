import { NodeIO } from '@gltf-transform/core';
import sharp from 'sharp';
import fs from 'fs';
const io = new NodeIO();
const doc = await io.read('assets/raw/Soldier.glb');
const r = doc.getRoot();
for (const t of r.listTextures()) {
  const name = t.getName().includes('diffuse') ? 'soldier_diff' : 'soldier_norm';
  await sharp(Buffer.from(t.getImage())).jpeg({ quality: 82 }).toFile(`assets/${name}.jpg`);
}
for (const m of r.listMaterials()) { m.setBaseColorTexture(null); m.setNormalTexture(null); }
for (const t of r.listTextures()) t.dispose();
// drop TPose animation
for (const a of r.listAnimations()) if (a.getName() === 'TPose') { for (const c of a.listChannels()) c.dispose(); for (const s of a.listSamplers()) s.dispose(); a.dispose(); }
const { prune, dedup, resample, quantize } = await import('@gltf-transform/functions');
await doc.transform(resample(), prune({ keepAttributes: true }), dedup());
await io.write('assets/soldier.glb', doc);
const J = async (src, dst, size, q = 78, grey = false) => { let s = sharp('assets/raw/' + src).resize(size, size, { fit: 'fill' }); if (grey) s = s.greyscale(); await s.jpeg({ quality: q }).toFile('assets/' + dst); };
await J('brick_diffuse.jpg', 'brick_diff.jpg', 1024);
await J('brick_bump.jpg', 'brick_bump.jpg', 1024, 75, true);
await J('hardwood2_diffuse.jpg', 'wood_diff.jpg', 1024);
await J('hardwood2_bump.jpg', 'wood_bump.jpg', 1024, 75, true);
await J('hardwood2_roughness.jpg', 'wood_rough.jpg', 512, 75, true);
await J('grasslight-big.jpg', 'grass.jpg', 1024, 72);
await sharp('assets/raw/decal-diffuse.png').resize(256, 256).png().toFile('assets/splat.png');
for (const f of fs.readdirSync('assets')) if (fs.statSync('assets/' + f).isFile()) console.log(f, fs.statSync('assets/' + f).size);
// contact sheet
const tiles = ['soldier_diff.jpg','soldier_norm.jpg','brick_diff.jpg','brick_bump.jpg','wood_diff.jpg','wood_bump.jpg','wood_rough.jpg','grass.jpg','splat.png'];
const comps = await Promise.all(tiles.map(async (f, i) => ({ input: await sharp('assets/' + f).resize(320, 320).flatten({background:'#888'}).png().toBuffer(), left: (i % 5) * 320, top: Math.floor(i / 5) * 320 })));
await sharp({ create: { width: 1600, height: 640, channels: 3, background: '#000' } }).composite(comps).png().toFile('assets/raw/sheet.png');
