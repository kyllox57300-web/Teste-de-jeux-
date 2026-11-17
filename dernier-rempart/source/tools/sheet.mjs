import sharp from 'sharp';
const [dst, ...src] = process.argv.slice(2); const W = 640, H = 360;
const comps = await Promise.all(src.map(async (f, i) => ({ input: await sharp(f).resize(W, H).png().toBuffer(), left: (i % 2) * W, top: Math.floor(i / 2) * H })));
await sharp({ create: { width: W * 2, height: H * Math.ceil(src.length / 2), channels: 3, background: '#000' } }).composite(comps).png().toFile(dst);
