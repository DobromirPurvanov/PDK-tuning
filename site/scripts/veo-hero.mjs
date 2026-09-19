/**
 * ГЕНЕРИРА КАДЪР ЗА ХИРОТО С VEO 3.1.
 *
 * Пуска се на ръка и ХАРЧИ ПАРИ от сметката на Google зад `GEMINI_API_KEY` —
 * затова не е вързан за никоя команда от package.json и иска изрично
 * потвърждение с `--da`.
 *
 *   node scripts/veo-hero.mjs --da                 # един опит, „fast“ модел
 *   node scripts/veo-hero.mjs --da --model veo-3.1-generate-preview
 *   node scripts/veo-hero.mjs --da --prompt "…"    # свой текст
 *
 * Изходът пада в `public/img/veo/<печат>.mp4` и НЕ влиза в сайта сам — гледа се
 * пръв, после се пуска през веригата в `docs/HIRO-VIDEO.md`.
 *
 * Звукът е ИЗКЛЮЧЕН нарочно: видеото в хирото е `muted`, а генерирането на звук
 * се плаща отделно.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('няма GEMINI_API_KEY'); process.exit(1); }

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
if (!args.includes('--da')) {
  console.error('Това извикване се плаща. Пусни го с --da, ако наистина го искаш.');
  process.exit(1);
}

const MODEL = flag('model', 'veo-3.1-fast-generate-preview');
const PROMPT = flag('prompt', [
  'Cinematic automotive commercial shot inside a dark tuning workshop at night.',
  'A modern black performance sedan sits on a chassis dynamometer, strapped down.',
  'Its rear wheels are spinning fast on the dyno rollers, tyre smoke drifting low across the concrete floor.',
  'Low camera angle near the floor, slow steady push-in, shallow depth of field.',
  'Moody darkness with a single cold key light on the car body and faint acid-green accent light from the side.',
  'Wet concrete floor with reflections, steel ramps, industrial background out of focus.',
  'Photorealistic, high detail, anamorphic lens, 24fps film look.',
  'No people, no text, no logos, no on-screen graphics.',
].join(' '));

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const outDir = path.join(root, 'public/img/veo');
await fs.mkdir(outDir, { recursive: true });

const base = 'https://generativelanguage.googleapis.com/v1beta';
const post = async (url, body) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  if (!r.ok) { console.error('HTTP', r.status, JSON.stringify(j).slice(0, 600)); process.exit(1); }
  return j;
};

console.log('модел:', MODEL);
console.log('текст:', PROMPT.slice(0, 120) + '…');

const op = await post(`${base}/models/${MODEL}:predictLongRunning`, {
  instances: [{ prompt: PROMPT }],
  parameters: {
    aspectRatio: '16:9',
    resolution: '1080p',
    generateAudio: false,
    personGeneration: 'dont_allow',
    sampleCount: 1,
  },
});
console.log('пуснато:', op.name);

let done = null;
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  const r = await fetch(`${base}/${op.name}`, { headers: { 'x-goog-api-key': KEY } });
  const j = await r.json();
  if (j.error) { console.error('грешка:', JSON.stringify(j.error).slice(0, 500)); process.exit(1); }
  if (j.done) { done = j; break; }
  process.stdout.write('.');
}
console.log('');
if (!done) { console.error('не се дочака'); process.exit(1); }

const res = done.response || {};
const vids = res.generatedVideos || res.generateVideoResponse?.generatedSamples || [];
if (!vids.length) { console.error('няма видео в отговора:', JSON.stringify(res).slice(0, 800)); process.exit(1); }

const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
let n = 0;
for (const v of vids) {
  const uri = v.video?.uri || v.video?.fileUri || v.uri;
  const b64 = v.video?.bytesBase64Encoded;
  const file = path.join(outDir, `veo-${stamp}-${++n}.mp4`);
  if (b64) await fs.writeFile(file, Buffer.from(b64, 'base64'));
  else {
    const r = await fetch(uri, { headers: { 'x-goog-api-key': KEY } });
    await fs.writeFile(file, Buffer.from(await r.arrayBuffer()));
  }
  const { size } = await fs.stat(file);
  console.log('записано:', file, Math.round(size / 1024) + ' KB');
}
