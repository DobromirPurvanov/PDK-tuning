/**
 * THE WHOLE OLD SITEMAP, RUN THROUGH THE NEW SITE.
 *
 * It answers one question: after the switch, how many of the already indexed
 * addresses will break. Not "they should work": how many.
 *
 * It takes the old site's `sitemap.xml` (5 586 addresses), runs each through a
 * given base address and sorts them into four piles:
 *
 *   redirected  301/302 to our address that answers 200
 *   kept        200 from the old site through the proxy (catalogue, portal)
 *   BROKEN      404, 5xx, or a redirect that leads nowhere
 *   empty       200, but the content is their "home page instead of 404"
 *
 * Run THREE times:
 *   1. before the switch, against `wrangler pages dev`: this is when it gets fixed
 *   2. right after the switch, against the live domain: this is when it shows
 *   3. a week later, to catch what was forgotten
 *
 * Usage:
 *   node scripts/migration/redirects.mjs                      # against 127.0.0.1:8788
 *   node scripts/migration/redirects.mjs https://www.pdktuning.com
 *   node scripts/migration/redirects.mjs --all                # no sampling, all 5 586
 *   node scripts/migration/redirects.mjs --csv report.csv     # the full list in a file
 *
 * THE SAMPLE IS THE DEFAULT. All non-catalogue addresses are always included:
 * they are few and each one matters. From the deep catalogue 25 per level are
 * taken: 5 500 requests to the old server for a check is a load we have not
 * agreed to put on it.
 */

const SITEMAP = 'https://www.pdktuning.com/sitemap.xml';
const DEFAULT_BASE = 'http://127.0.0.1:8788';
const SAMPLE_PER_DEPTH = 25;

/* The old site returns 200 and the HOME PAGE for a nonexistent address. It is
   ~700 KB, while its real pages are 30–70 KB. So "200" alone means
   nothing and the size is checked. */
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
  if (!r.ok) throw new Error(`their sitemap returned ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter((p) => p.startsWith('/'));
}

/** depth = number of slashes, not counting the trailing one */
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
    // up to 4 levels are pages and brands: all of them are included
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
    return { path, kind: 'BROKEN', status: 0, note: String(e.message || e) };
  }

  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location') || '';
    const target = new URL(loc, url);
    // does the redirect lead somewhere
    let t;
    try {
      t = await fetch(target, { redirect: 'follow', headers: { 'user-agent': 'pdk-migration-check' } });
    } catch (e) {
      return { path, kind: 'BROKEN', status: r.status, to: target.pathname, note: 'target does not respond' };
    }
    if (!t.ok) return { path, kind: 'BROKEN', status: r.status, to: target.pathname, note: `target returns ${t.status}` };
    return { path, kind: 'redirected', status: r.status, to: target.pathname };
  }

  if (!r.ok) return { path, kind: 'BROKEN', status: r.status };

  const body = await r.arrayBuffer();
  if (body.byteLength > EMPTY_PAGE_BYTES) {
    return { path, kind: 'empty', status: r.status, note: `${Math.round(body.byteLength / 1024)} KB — their home page instead of the page` };
  }
  return { path, kind: 'kept', status: r.status, bytes: body.byteLength };
}

/** several at once, but not so many that we overload the old server */
async function inBatches(items, size, fn) {
  // progress is erased with `\r`, which only works on a terminal: in a pipe or
  // a file every line stays and drowns the report
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

console.log(`\nOld sitemap: ${all.length} URLs`);
console.log(`Checking: ${paths.length}${flag('--all') ? '' : ' (sample — use --all for every URL)'}`);
console.log(`Against: ${base}\n`);

const results = await inBatches(paths, 8, probe);

const by = (k) => results.filter((r) => r.kind === k);
const broken = by('BROKEN');
const empty = by('empty');

console.log(`  ${c.ok('redirected')}  ${by('redirected').length.toString().padStart(5)}   old URL → new page that responds`);
console.log(`  ${c.dim('kept')}     ${by('kept').length.toString().padStart(5)}   served by the old site, as agreed`);
console.log(`  ${empty.length ? c.warn('empty') : c.dim('empty')}      ${empty.length.toString().padStart(5)}   200, but it is their home page instead of the page`);
console.log(`  ${broken.length ? c.bad('BROKEN') : c.ok('broken')}      ${broken.length.toString().padStart(5)}   404, 5xx or a redirect to nowhere\n`);

if (broken.length) {
  console.log(c.bad('BROKEN:'));
  for (const r of broken.slice(0, 40)) {
    console.log(`  ${r.path}  → ${r.status}${r.to ? ' ' + r.to : ''}${r.note ? '  ' + c.dim(r.note) : ''}`);
  }
  if (broken.length > 40) console.log(c.dim(`  … and ${broken.length - 40} more`));
  console.log();
}

if (empty.length) {
  console.log(c.warn('EMPTY (their old defect — 200 instead of 404):'));
  for (const r of empty.slice(0, 10)) console.log(`  ${r.path}  ${c.dim(r.note)}`);
  if (empty.length > 10) console.log(c.dim(`  … and ${empty.length - 10} more`));
  console.log();
}

// where the redirects lead, collected by kind
const targets = new Map();
for (const r of by('redirected')) {
  const key = r.to.replace(/^\/katalog\/[a-z0-9-]+\/$/, '/katalog/<brand>/');
  targets.set(key, (targets.get(key) || 0) + 1);
}
if (targets.size) {
  console.log('Where the redirects lead:');
  for (const [t, n] of [...targets].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)} → ${t}`);
  }
  console.log();
}

const csv = valueOf('--csv');
if (csv) {
  const { writeFileSync } = await import('node:fs');
  const rows = [['url', 'kind', 'status', 'target', 'note'].join(',')];
  for (const r of results) rows.push([r.path, r.kind, r.status, r.to || '', (r.note || '').replace(/,/g, ';')].join(','));
  writeFileSync(csv, rows.join('\n'), 'utf8');
  console.log(c.dim(`full list: ${csv}\n`));
}

if (broken.length) {
  console.log(c.bad('There are broken URLs — no cutover until they are zero.\n'));
  process.exit(1);
}
console.log(c.ok('Not a single indexed URL breaks.\n'));
