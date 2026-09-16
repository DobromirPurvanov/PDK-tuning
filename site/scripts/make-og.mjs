/**
 * Прави картинката за споделяне в КАНОНИЧНИЯ размер 1200×630.
 *
 * Защо изобщо: `public/img/pdk-hero.jpg` е 1280×704 — кадър от видеото, с
 * съотношение 1,82. Facebook, LinkedIn, X и Slack режат към 1,91 (1200×630).
 * При 1,82 всяка платформа реже сама и по различен начин, а композицията с
 * празното черно поле вляво е точно това, което не бива да се реже.
 *
 * Затова кадърът се реже ВЕДНЪЖ тук, съзнателно и в наша полза: взима се
 * пълната ширина и се маха от височината, като изрезката се вдига нагоре
 * (`position: top`), защото колата стои в долната част на кадъра.
 *
 * ПУСКА СЕ НА РЪКА, не при всеки билд: `node scripts/make-og.mjs`.
 * Изходът се комитва. Билдът не зависи от `sharp` и не му трябва.
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
    // колата е в долната половина; изрязваме отгоре, не по средата
    position: 'attention',
  })
  .jpeg({ quality: 82, mozjpeg: true, progressive: true })
  .toBuffer();

writeFileSync(OUT, buf);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`вход:  ${meta.width}×${meta.height}  ${kb(readFileSync(IN).length)}`);
console.log(`изход: ${W}×${H}  ${kb(buf.length)}  →  public/img/og-pdk.jpg`);
