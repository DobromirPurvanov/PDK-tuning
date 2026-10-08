/**
 * Makes the share image at the CANONICAL size 1200×630.
 *
 * Why at all: `public/img/pdk-hero.jpg` is 1280×704, a frame from the video,
 * with a ratio of 1.82. Facebook, LinkedIn, X and Slack crop to 1.91
 * (1200×630). At 1.82 every platform crops on its own and differently, and
 * the composition with the empty black field on the left is exactly what must
 * not be cropped.
 *
 * So the frame is cropped ONCE here, deliberately and in our favour: the full
 * width is taken and height is removed, with the crop shifted up
 * (`position: top`), because the car sits in the lower part of the frame.
 *
 * RUN BY HAND, not on every build: `node scripts/make-og.mjs`.
 * The output is committed. The build does not depend on `sharp` and does not
 * need it.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const IN = fileURLToPath(new URL('../public/img/pdk-hero.jpg', import.meta.url));
const OUT = fileURLToPath(new URL('../public/img/og-pdk.jpg', import.meta.url));

const W = 1200, H = 630;

const src = sharp(readFileSync(IN));
const meta = await src.metadata();

const buf = await src
  .resize(W, H, {
    fit: 'cover',
    // the car is in the lower half; crop from the top, not the middle
    position: 'attention',
  })
  .jpeg({ quality: 82, mozjpeg: true, progressive: true })
  .toBuffer();

writeFileSync(OUT, buf);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`in:  ${meta.width}×${meta.height}  ${kb(readFileSync(IN).length)}`);
console.log(`out: ${W}×${H}  ${kb(buf.length)}  →  public/img/og-pdk.jpg`);
