import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import brickDiff from '../assets/brick_diff.jpg';
import brickBump from '../assets/brick_bump.jpg';
import woodDiff from '../assets/wood_diff.jpg';
import woodBump from '../assets/wood_bump.jpg';
import woodRough from '../assets/wood_rough.jpg';
import grass from '../assets/grass.jpg';
import splat from '../assets/splat.png';
import soldierDiff from '../assets/soldier_diff.jpg';
import soldierNorm from '../assets/soldier_norm.jpg';
import soldierGlb from '../assets/soldier.glb';
import zombieMGlb from '../assets/zombie_m.glb';
import zombieFGlb from '../assets/zombie_f.glb';
import { G } from './ctx.js';

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image')); i.src = src; });

export async function loadAssets(onProgress) {
  const list = { brickDiff, brickBump, woodDiff, woodBump, woodRough, grass, splat, soldierDiff, soldierNorm };
  const keys = Object.keys(list);
  let done = 0;
  await Promise.all(keys.map(async (k) => { G.img[k] = await loadImg(list[k]); onProgress(++done / (keys.length + 1)); }));
  const parse = (bin) => new Promise((res, rej) => new GLTFLoader().parse(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength), '', res, rej));
  [G.gltf, G.gltfM, G.gltfF] = await Promise.all([parse(soldierGlb), parse(zombieMGlb), parse(zombieFGlb)]);
  onProgress(1);
}
