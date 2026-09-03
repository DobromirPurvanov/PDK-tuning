// Пас 2: картата на сайта дава по един двигател на поколение. Истинският списък
// е в страниците на поколенията — оттам се събират всички двигатели и се свалят липсващите.
import { readFile, writeFile, readdir, stat, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const ORIGIN = 'https://www.pdktuning.com';
const OUT = new URL('../.crawl/', import.meta.url).pathname;
const UA = 'PDKTuning-rebuild-crawler/1.0 (workdobromirjustpablo@gmail.com; new site build)';
const THREADS = 3, PAUSE = 300, TIMEOUT = 40_000;
const exists = (p) => access(p).then(() => true, () => false);
const fileFor = (p) => join(OUT, p.replace(/^\//, '') + '.html');

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}
async function fetchOne(path) {
  const f = fileFor(path);
  if (await exists(f)) return 'cached';
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(ORIGIN + path, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(TIMEOUT), redirect: 'manual' });
      if (r.status === 200) { await mkdir(dirname(f), { recursive: true }); await writeFile(f, await r.text()); return 'ok'; }
      if (r.status >= 300 && r.status < 400) return `redirect:${r.status}:${r.headers.get('location')}`;
      if (r.status === 404) return 'status:404';
      if (attempt === 4) return `status:${r.status}`;
    } catch (e) { if (attempt === 4) return `error:${e.message}`; }
    await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
}
async function main() {
  const engines = new Set();
  for await (const f of walk(join(OUT, 'en'))) {
    // страници на поколения: en/{brand}/{model}/{years}.html
    const rel = f.slice(OUT.length);
    if (!/^en\/[^/]+\/[^/]+\/\d+-\d+\.html$/.test(rel)) continue;
    const html = await readFile(f, 'utf8');
    for (const m of html.matchAll(/href="https:\/\/www\.pdktuning\.com(\/en\/[^"/]+\/[^"/]+\/\d+-\d+\/\d+\/\d+)"/g)) engines.add(m[1]);
  }
  const queue = [...engines];
  await writeFile(join(OUT, 'queue-engines.txt'), queue.join('\n'));
  console.log(`engines found in generation pages: ${queue.length}`);
  const results = {}; let done = 0, i = 0; const t0 = Date.now();
  const worker = async () => {
    while (i < queue.length) {
      const p = queue[i++]; const r = await fetchOne(p); results[p] = r; done++;
      if (r !== 'cached') await new Promise((res) => setTimeout(res, PAUSE));
      if (done % 250 === 0) console.log(`${done}/${queue.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  };
  await Promise.all(Array.from({ length: THREADS }, worker));
  const bad = Object.entries(results).filter(([, r]) => r !== 'ok' && r !== 'cached');
  await writeFile(join(OUT, 'results-engines.json'), JSON.stringify(results, null, 1));
  console.log(`done ${done} in ${((Date.now() - t0) / 1000).toFixed(0)}s; not-ok: ${bad.length}`);
  for (const [p, r] of bad.slice(0, 50)) console.log('  ', p, r);
}
main().catch((e) => { console.error(e); process.exit(1); });
