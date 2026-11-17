import sharp from 'sharp';
const [src, dst, x, y, w, h] = process.argv.slice(2);
const m = await sharp(src).metadata();
await sharp(src).extract({ left: Math.round(+x * m.width), top: Math.round(+y * m.height), width: Math.round(+w * m.width), height: Math.round(+h * m.height) }).resize({ width: 1100, kernel: 'lanczos3' }).png().toFile(dst);
