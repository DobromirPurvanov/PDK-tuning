// Проверките, които спират билда (план, стр. 21 и 28): уникални заглавия и описания,
// точно един H1, описание 80–165 знака, каноникъл със самореференция, hreflang,
// lang на документа, вътрешни връзки към съществуващи адреси, тегло на страниците.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://www.pdktuning.com';
const errors = [], warns = [];
async function* walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) yield* walk(p); else yield p; } }

const pages = [];
for await (const f of walk(DIST)) if (f.endsWith('.html')) pages.push(f);
const existing = new Set();
for await (const f of walk(DIST)) existing.add('/' + relative(DIST, f));
const toPath = (f) => { let p = '/' + relative(DIST, f); if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length); else if (p.endsWith('.html')) p = p.slice(0, -5); if (p.length > 4 && p.endsWith('/')) p = p.slice(0, -1); return p; };
const resolves = (href) => {
  let p = href.replace(/[#?].*$/, ''); if (!p) return true;
  if (!p.startsWith('/')) return true;
  if (p.startsWith('/api/')) return true;
  if (existing.has(p)) return true;
  if (p.endsWith('/') && existing.has(p + 'index.html')) return true;
  if (existing.has(p + '.html')) return true;
  if (existing.has(p + '/index.html')) return true;
  return false;
};
const titles = new Map(), descs = new Map();
let maxHtml = 0, maxPage = '';
for (const f of pages) {
  const html = await readFile(f, 'utf8'); const path = toPath(f);
  if (path === '/404' || path === '/bg/404' || path === '/en/404') continue;
  // страници с noindex не се индексират, значи не подлежат на SEO проверките
  // (макетите за одобрение живеят така, докато не бъдат разгледани)
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const lang = (html.match(/<html lang="([a-z]+)"/) || [])[1];
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const hreflang = (html.match(/hreflang="/g) || []).length;
  if (!title) errors.push(`${path}: няма заглавие`);
  else if (titles.has(title)) errors.push(`${path}: повторено заглавие с ${titles.get(title)} — „${title}“`); else titles.set(title, path);
  if (!desc) errors.push(`${path}: няма описание`);
  else { if (desc.length < 80 || desc.length > 165) errors.push(`${path}: описание ${desc.length} знака`); if (descs.has(desc)) errors.push(`${path}: повторено описание с ${descs.get(desc)}`); else descs.set(desc, path); }
  if (canon !== SITE + path) errors.push(`${path}: каноникъл ${canon}`);
  if (h1 !== 1) errors.push(`${path}: ${h1} H1`);
  if (hreflang < 2) errors.push(`${path}: hreflang ${hreflang}`);
  if (lang !== path.slice(1, 3)) errors.push(`${path}: lang="${lang}"`);
  if (/localhost|127\.0\.0\.1/.test(html)) errors.push(`${path}: localhost в HTML`);
  for (const m of html.matchAll(/(?:href|src)="([^"]*)"/g)) { const h = m[1]; if (h.startsWith('/') && !h.startsWith('//') && !resolves(h)) errors.push(`${path}: счупена връзка ${h}`); }
  const gz = gzipSync(html).length; if (gz > maxHtml) { maxHtml = gz; maxPage = path; }
  if (gz > 60 * 1024) warns.push(`${path}: ${(gz / 1024).toFixed(0)} KB gzip`);
}
console.log(`страници: ${pages.length}; уникални заглавия: ${titles.size}; най-тежката: ${maxPage} ${(maxHtml / 1024).toFixed(1)} KB gzip`);
for (const w of warns.slice(0, 20)) console.log('  ! ' + w);
if (warns.length > 20) console.log(`  ! …още ${warns.length - 20} предупреждения`);
if (errors.length) { console.error(`ГРЕШКИ: ${errors.length}`); for (const e of errors.slice(0, 60)) console.error('  ✗ ' + e); if (errors.length > 60) console.error(`  …още ${errors.length - 60}`); process.exit(1); }
console.log('проверките минават');
