// Сваля каталога от сегашния сайт (план, част II, стр. 13).
// Никога повече от 3 нишки, пауза 300 ms между заявките на всяка нишка.
// Резултатът се пази на диск в .crawl/ (не влиза в хранилището) и не се тегли повторно.
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://www.pdktuning.com';
const OUT = new URL('../.crawl/', import.meta.url).pathname;
const UA = 'PDKTuning-rebuild-crawler/1.0 (workdobromirjustpablo@gmail.com; new site build)';
const THREADS = 3, PAUSE = 300, TIMEOUT = 40_000;

const exists = (p) => access(p).then(() => true, () => false);
const norm = (u) => {
  let p = new URL(u).pathname;
  if (p.length > 1 && p.endsWith('/') && !/^\/(en|bg)\/$/.test(p)) p = p.slice(0, -1);
  return p;
};
const fileFor = (p) => join(OUT, (p.endsWith('/') ? p + 'index' : p).replace(/^\//, '') + '.html');

async function fetchOne(path) {
  const f = fileFor(path);
  if (await exists(f)) return 'cached';
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(ORIGIN + path, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(TIMEOUT), redirect: 'manual' });
      if (r.status === 200) {
        const html = await r.text();
        await mkdir(dirname(f), { recursive: true });
        await writeFile(f, html);
        return 'ok';
      }
      if (r.status >= 300 && r.status < 400) return `redirect:${r.status}:${r.headers.get('location')}`;
      if (r.status === 404) return 'status:404';
      if (attempt === 4) return `status:${r.status}`;
    } catch (e) {
      if (attempt === 4) return `error:${e.message}`;
    }
    await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const smPath = join(OUT, 'sitemap.xml');
  if (!(await exists(smPath))) {
    const r = await fetch(ORIGIN + '/sitemap.xml', { headers: { 'user-agent': UA } });
    await writeFile(smPath, await r.text());
  }
  const sm = await readFile(smPath, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1]));
  const en = [...new Set(locs)];
  // Българските: марка + модел (имената се сверяват; поколенията и двигателите носят еднакви имена)
  const bg = en.filter((p) => /^\/en\/[^/]+(\/[^/]+)?$/.test(p) && !/^\/en\/(tuning|about-us|contact|privacy-policy)/.test(p)).map((p) => p.replace(/^\/en/, '/bg'));
  const extra = ['/bg/', '/bg/tuning/chip-tuning', '/bg/tuning/software-repair', '/bg/about-us', '/bg/contact', '/bg/privacy-policy',
    '/bg/tuning/chip-tuning/what-is-chiptuning', '/en/tuning/chip-tuning/what-is-chiptuning',
    '/bg/tuning/chip-tuning/prices', '/bg/tuning/chip-tuning/effect', '/bg/tuning/chip-tuning/chiptuning-types', '/bg/tuning/chip-tuning/installation', '/bg/tuning/chip-tuning/risks',
    '/bg/tuning/software-repair/dpf-and-fap', '/bg/tuning/software-repair/egr-off-and-swirl-flaps', '/bg/tuning/software-repair/dtc-off', '/bg/tuning/software-repair/v-max', '/bg/tuning/software-repair/o2-lambda-off', '/bg/tuning/software-repair/maf-off-flow-meter',
    '/en/tuning/software-repair/dpf-and-fap', '/en/tuning/software-repair/egr-off-and-swirl-flaps', '/en/tuning/software-repair/dtc-off', '/en/tuning/software-repair/v-max', '/en/tuning/software-repair/o2-lambda-off', '/en/tuning/software-repair/maf-off-flow-meter'];
  const queue = [...new Set([...en, ...bg, ...extra])];
  await writeFile(join(OUT, 'queue.txt'), queue.join('\n'));
  console.log(`queue: ${queue.length} (en ${en.length}, bg ${bg.length}, extra ${extra.length})`);
  const results = {}; let done = 0, i = 0; const t0 = Date.now();
  const worker = async () => {
    while (i < queue.length) {
      const p = queue[i++];
      const r = await fetchOne(p);
      results[p] = r; done++;
      if (r !== 'cached') await new Promise((res) => setTimeout(res, PAUSE));
      if (done % 100 === 0) console.log(`${done}/${queue.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  };
  await Promise.all(Array.from({ length: THREADS }, worker));
  const bad = Object.entries(results).filter(([, r]) => r !== 'ok' && r !== 'cached');
  await writeFile(join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`done ${done} in ${((Date.now() - t0) / 1000).toFixed(0)}s; not-ok: ${bad.length}`);
  for (const [p, r] of bad.slice(0, 50)) console.log('  ', p, r);
}
main().catch((e) => { console.error(e); process.exit(1); });
