/**
 * ЦЕЛИЯТ СТАР SITEMAP, ПУСНАТ ПРЕЗ НОВИЯ САЙТ.
 *
 * Въпросът, на който отговаря, е един: след превключването колко от вече
 * индексираните адреси ще се счупят. Не „би трябвало да работят“ — колко.
 *
 * Взима `sitemap.xml` на стария сайт (5 586 адреса), пуска всеки през даден
 * базов адрес и ги подрежда в четири купчини:
 *
 *   пренасочен  301/302 към наш адрес, който отговаря с 200
 *   запазен     200 от стария сайт през препредаването (каталог, портал)
 *   СЧУПЕН      404, 5xx, или пренасочване, което води до нищо
 *   празен      200, но съдържанието е тяхната „начална вместо 404“
 *
 * Пуска се ТРИ пъти:
 *   1. преди превключването, срещу `wrangler pages dev` — тогава се поправя
 *   2. веднага след превключването, срещу живия домейн — тогава се вижда
 *   3. седмица по-късно, за да се хване какво е забравено
 *
 * Употреба:
 *   node scripts/migration/redirects.mjs                      # срещу 127.0.0.1:8788
 *   node scripts/migration/redirects.mjs https://www.pdktuning.com
 *   node scripts/migration/redirects.mjs --all                # без извадка, всичките 5 586
 *   node scripts/migration/redirects.mjs --csv report.csv     # пълният списък във файл
 *
 * ИЗВАДКАТА Е ПО ПОДРАЗБИРАНЕ. Всички не-каталожни адреси влизат винаги —
 * те са малко и всеки от тях има значение. От дълбокия каталог се взимат по
 * 25 на ниво: 5 500 заявки към стария сървър заради проверка е товар, който
 * не сме се разбрали да му създаваме.
 */

const SITEMAP = 'https://www.pdktuning.com/sitemap.xml';
const DEFAULT_BASE = 'http://127.0.0.1:8788';
const SAMPLE_PER_DEPTH = 25;

/* Старият сайт връща 200 и НАЧАЛНАТА СТРАНИЦА за несъществуващ адрес. Тя е
   ~700 KB, докато истинските му страници са 30–70 KB. Затова „200“ само по
   себе си не значи нищо и размерът се гледа. */
const EMPTY_PAGE_BYTES = 400_000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
const base = (args.find((a) => /^https?:\/\//.test(a)) || DEFAULT_BASE).replace(/\/+$/, '');

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  bad: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

async function oldSitemap() {
  const r = await fetch(SITEMAP);
  if (!r.ok) throw new Error(`техният sitemap отговори ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter((p) => p.startsWith('/'));
}

/** дълбочина = брой наклонени черти, без крайната */
const depthOf = (p) => p.replace(/\/+$/, '').split('/').length - 1;

function sample(paths) {
  if (flag('--all')) return paths;
  const byDepth = new Map();
  for (const p of paths) {
    const d = depthOf(p);
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d).push(p);
  }
  const out = [];
  for (const [d, list] of [...byDepth].sort((a, b) => a[0] - b[0])) {
    // до 4 нива са страниците и марките — влизат всичките
    out.push(...(d <= 4 ? list : list.slice(0, SAMPLE_PER_DEPTH)));
  }
  return [...new Set(out)];
}

async function probe(path) {
  const url = base + path;
  let r;
  try {
    r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'pdk-migration-check' } });
  } catch (e) {
    return { path, kind: 'СЧУПЕН', status: 0, note: String(e.message || e) };
  }

  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location') || '';
    const target = new URL(loc, url);
    // води ли пренасочването донякъде
    let t;
    try {
      t = await fetch(target, { redirect: 'follow', headers: { 'user-agent': 'pdk-migration-check' } });
    } catch (e) {
      return { path, kind: 'СЧУПЕН', status: r.status, to: target.pathname, note: 'целта не отговаря' };
    }
    if (!t.ok) return { path, kind: 'СЧУПЕН', status: r.status, to: target.pathname, note: `целта дава ${t.status}` };
    return { path, kind: 'пренасочен', status: r.status, to: target.pathname };
  }

  if (!r.ok) return { path, kind: 'СЧУПЕН', status: r.status };

  const body = await r.arrayBuffer();
  if (body.byteLength > EMPTY_PAGE_BYTES) {
    return { path, kind: 'празен', status: r.status, note: `${Math.round(body.byteLength / 1024)} KB — тяхната начална вместо страница` };
  }
  return { path, kind: 'запазен', status: r.status, bytes: body.byteLength };
}

/** по няколко наведнъж, но не толкова, че да натоварим стария сървър */
async function inBatches(items, size, fn) {
  // напредъкът се трие с `\r`, а той работи само на терминал — в тръба или
  // файл всеки ред остава и удавя отчета
  const live = process.stderr.isTTY;
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...await Promise.all(items.slice(i, i + size).map(fn)));
    if (live) process.stderr.write(`\r  ${Math.min(i + size, items.length)} / ${items.length}   `);
  }
  if (live) process.stderr.write('\r' + ' '.repeat(40) + '\r');
  return out;
}

const all = await oldSitemap();
const paths = sample(all);

console.log(`\nСтарият sitemap: ${all.length} адреса`);
console.log(`Проверявам: ${paths.length}${flag('--all') ? '' : ' (извадка — с --all всичките)'}`);
console.log(`Срещу: ${base}\n`);

const results = await inBatches(paths, 8, probe);

const by = (k) => results.filter((r) => r.kind === k);
const broken = by('СЧУПЕН');
const empty = by('празен');

console.log(`  ${c.ok('пренасочен')}  ${by('пренасочен').length.toString().padStart(5)}   стар адрес → нова страница, която отговаря`);
console.log(`  ${c.dim('запазен')}     ${by('запазен').length.toString().padStart(5)}   обслужен от стария сайт, както е уговорено`);
console.log(`  ${empty.length ? c.warn('празен') : c.dim('празен')}      ${empty.length.toString().padStart(5)}   200, но е тяхната начална вместо страница`);
console.log(`  ${broken.length ? c.bad('СЧУПЕН') : c.ok('счупен')}      ${broken.length.toString().padStart(5)}   404, 5xx или пренасочване в нищото\n`);

if (broken.length) {
  console.log(c.bad('СЧУПЕНИТЕ:'));
  for (const r of broken.slice(0, 40)) {
    console.log(`  ${r.path}  → ${r.status}${r.to ? ' ' + r.to : ''}${r.note ? '  ' + c.dim(r.note) : ''}`);
  }
  if (broken.length > 40) console.log(c.dim(`  … и още ${broken.length - 40}`));
  console.log();
}

if (empty.length) {
  console.log(c.warn('ПРАЗНИ (техният стар дефект — 200 вместо 404):'));
  for (const r of empty.slice(0, 10)) console.log(`  ${r.path}  ${c.dim(r.note)}`);
  if (empty.length > 10) console.log(c.dim(`  … и още ${empty.length - 10}`));
  console.log();
}

// накъде водят пренасочванията, събрано по вид
const targets = new Map();
for (const r of by('пренасочен')) {
  const key = r.to.replace(/^\/katalog\/[a-z0-9-]+\/$/, '/katalog/<марка>/');
  targets.set(key, (targets.get(key) || 0) + 1);
}
if (targets.size) {
  console.log('Накъде водят пренасочванията:');
  for (const [t, n] of [...targets].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)} → ${t}`);
  }
  console.log();
}

const csv = valueOf('--csv');
if (csv) {
  const { writeFileSync } = await import('node:fs');
  const rows = [['адрес', 'вид', 'статус', 'цел', 'бележка'].join(',')];
  for (const r of results) rows.push([r.path, r.kind, r.status, r.to || '', (r.note || '').replace(/,/g, ';')].join(','));
  writeFileSync(csv, rows.join('\n'), 'utf8');
  console.log(c.dim(`пълният списък: ${csv}\n`));
}

if (broken.length) {
  console.log(c.bad('Има счупени адреси — не се превключва, докато не станат нула.\n'));
  process.exit(1);
}
console.log(c.ok('Нито един индексиран адрес не се чупи.\n'));
