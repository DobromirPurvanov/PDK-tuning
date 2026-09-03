// Вади каталога от свалените страници (план, част II, стр. 12–13) и записва:
//   src/data/catalog/{марка}.json   — източникът на истината, по една марка
//   src/data/catalog-index.json     — списък на марките с бройки (за началната и калкулатора)
//   src/data/lastmod.json           — дата на последна промяна по адрес (пази се между билдовете)
//   src/data/redirects-catalog.json — клонове без данни → родителя им (301)
//   public/logos/{марка}.png        — логата, извадени от base64
//   .crawl/anomalies.csv            — всичко, което не минава проверките (преглежда се от човек)
import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CRAWL = new URL('../.crawl/', import.meta.url).pathname;
const DATA = new URL('../src/data/', import.meta.url).pathname;
const LOGOS = new URL('../public/logos/', import.meta.url).pathname;
const exists = (p) => access(p).then(() => true, () => false);
// старият сайт кодира двойно (&amp;#039;) → декодира се на два пъти, включително числовите entity-та
const dec1 = (s) => s.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&gt;/g, '>').replace(/&lt;/g, '<');
const dec = (s) => dec1(dec1(s)).replace(/\s+/g, ' ').trim();
// белите полета се свиват: в живия HTML атрибутите често са на нови редове
const read = async (p) => (await exists(p)) ? (await readFile(p, 'utf8')).replace(/\s+/g, ' ') : null;

// Гориво: изведено от името (план, стр. 12); ръчен списък за изключенията.
const DIESEL_RE = /\b(\d+\s?)?(d|td|tdi|tddi|cdi|cdti|crdi|crd|hdi|dci|jtd|jtdm|mjt|mjet|multijet|ddis|did|d-4d|d4d|dtec|i-dtec|dtd|tdci|tdv6|tdv8|sdv6|sdv8|sd4|td4|td5|td6|ed4|dt|tdv|bluehdi|blue\s?hdi|bluetec|tdi-cr|xdrive\s?\d+d|sdrive\s?\d+d|diesel|дизел|ecoblue|dw10|dv6|d-cat|d\d{2,3})\b/i;
const PETROL_HINT = /\b(tsi|tfsi|fsi|gti|gdi|t-gdi|tgdi|mpi|vti|thp|ecoboost|turbo|v6|v8|v10|v12|hybrid|phev|hev|ev|electric|електр|бензин|petrol|gasoline|cng|lpg|i|is|ia)\b/i;
const CAPS = { bmw: 'BMW', daf: 'DAF', ds: 'DS', gmc: 'GMC', gwm: 'GWM', mg: 'MG', jac: 'JAC', byd: 'BYD', kia: 'Kia', man: 'MAN', vw: 'VW', seat: 'SEAT', jcb: 'JCB', ktm: 'KTM', 'mc-cormick': 'McCormick', 'mercedes-benz': 'Mercedes-Benz', 'mercedes-benz-trucks': 'Mercedes-Benz Trucks', 'rolls-royce': 'Rolls-Royce', 'opel-vauxhall': 'Opel / Vauxhall' };
const titleCase = (slug) => CAPS[slug] || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const FUEL_OVERRIDES = {}; // path → 'diesel' | 'petrol' — попълва се на ръка при преглед на аномалиите
function fuelOf(name, path) {
  if (FUEL_OVERRIDES[path]) return FUEL_OVERRIDES[path];
  const n = name.replace(/hp$/i, '');
  if (/\b(electric|ev|e-tron|eq[a-z]?\b)/i.test(n) && !/diesel/i.test(n)) return 'electric';
  if (DIESEL_RE.test(n)) return 'diesel';
  return 'petrol';
}

async function main() {
  await mkdir(join(DATA, 'catalog'), { recursive: true });
  await mkdir(LOGOS, { recursive: true });
  const anomalies = [];
  const anomaly = (path, rule, detail) => anomalies.push({ path, rule, detail });
  const lastmodOld = JSON.parse((await read(join(DATA, 'lastmod.json'))) || '{}');
  const hashesOld = JSON.parse((await read(join(CRAWL, 'hashes.json'))) || '{}');
  const lastmod = {}, hashes = {};
  const today = new Date().toISOString().slice(0, 10);
  const stamp = (path, payload) => {
    const h = createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
    hashes[path] = h;
    lastmod[path] = hashesOld[path] === h && lastmodOld[path] ? lastmodOld[path] : today;
    return lastmod[path];
  };

  // 1. Марки: от началната страница (EN + BG за имената) + всички en/{brand}.html
  const homeEn = await read(join(CRAWL, 'en/index.html'));
  const homeBg = await read(join(CRAWL, 'bg/index.html'));
  const brandNames = {}; // slug → {en, bg}
  for (const [lang, html] of [['en', homeEn], ['bg', homeBg]]) {
    if (!html) continue;
    for (const m of html.matchAll(/<a href="https:\/\/www\.pdktuning\.com\/(?:en|bg)\/([a-z0-9-]+)"[^>]*class="catalog__brand"[^>]*>([\s\S]*?)<\/a>/g)) {
      const slug = m[1]; const inner = m[2];
      // alt-ът на логото е slug-ът; истинското име е видимият текст на връзката
      const name = dec(inner.replace(/<[^>]+>/g, '')) || titleCase(slug);
      brandNames[slug] ??= {}; brandNames[slug][lang] = name;
    }
  }
  const files = (await readdir(join(CRAWL, 'en'))).filter((f) => f.endsWith('.html') && f !== 'index.html');
  const skip = new Set(['about-us.html', 'contact.html', 'privacy-policy.html', 'tuning.html']);
  const brandSlugs = [...new Set([...Object.keys(brandNames), ...files.filter((f) => !skip.has(f)).map((f) => f.slice(0, -5))])].sort();

  const index = []; const redirects = {}; const report = { brands: 0, models: 0, generations: 0, engines: 0, enginesSkipped: 0, emptyBranches: 0 };
  for (const slug of brandSlugs) {
    const html = await read(join(CRAWL, `en/${slug}.html`));
    if (!html) { anomaly(`/en/${slug}`, 'brand-page-missing', 'няма свалена страница'); continue; }
    const bgHtml = await read(join(CRAWL, `bg/${slug}.html`));
    // име и лого от трохите
    const crumb = html.match(/<h1 class="page__title">([\s\S]*?)<\/h1>/)?.[1] || '';
    const logo = crumb.match(/src="data:image\/(png|jpeg|svg\+xml|webp);base64,([A-Za-z0-9+/=]+)"/);
    const name = brandNames[slug]?.en || titleCase(slug);
    const nameBg = brandNames[slug]?.bg || name;
    if (nameBg !== name) anomaly(`/bg/${slug}`, 'brand-name-differs', `${name} / ${nameBg}`);
    let logoFile = null;
    if (logo) {
      const ext = { png: 'png', jpeg: 'jpg', 'svg+xml': 'svg', webp: 'webp' }[logo[1]];
      logoFile = `${slug}.${ext}`;
      await writeFile(join(LOGOS, logoFile), Buffer.from(logo[2], 'base64'));
    } else anomaly(`/en/${slug}`, 'logo-missing', '');
    // модели
    const modelLinks = [...html.matchAll(/<a href="https:\/\/www\.pdktuning\.com\/en\/([a-z0-9-]+)\/([^"/]+)" class="catalog__model">([^<]*)<\/a>/g)].filter((m) => m[1] === slug);
    const bgModelNames = {};
    if (bgHtml) for (const m of bgHtml.matchAll(/<a href="https:\/\/www\.pdktuning\.com\/bg\/[a-z0-9-]+\/([^"/]+)" class="catalog__model">([^<]*)<\/a>/g)) bgModelNames[m[1]] = dec(m[2]);
    const models = [];
    for (const [, , mslug, mname] of modelLinks) {
      const mHtml = await read(join(CRAWL, `en/${slug}/${mslug}.html`));
      if (!mHtml) { anomaly(`/en/${slug}/${mslug}`, 'model-page-missing', ''); continue; }
      const modelName = dec(mname);
      if (bgModelNames[mslug] && bgModelNames[mslug] !== modelName) anomaly(`/bg/${slug}/${mslug}`, 'model-name-differs', `${modelName} / ${bgModelNames[mslug]}`);
      const genLinks = [...new Set([...mHtml.matchAll(new RegExp(`href="https://www\\.pdktuning\\.com/en/${slug}/${mslug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(\\d+-\\d+)"`, 'g'))].map((m) => m[1]))];
      const generations = [];
      for (const gslug of genLinks) {
        const gHtml = await read(join(CRAWL, `en/${slug}/${mslug}/${gslug}.html`));
        if (!gHtml) { anomaly(`/en/${slug}/${mslug}/${gslug}`, 'generation-page-missing', ''); continue; }
        const [from, to] = gslug.split('-').map(Number);
        const engLinks = [...gHtml.matchAll(/<li><a href="https:\/\/www\.pdktuning\.com\/en\/[^"]+?\/(\d+\/\d+)">\s*<span class="pull-left">([^<]*)<\/span>\s*<span class="pull-right">([^<]*)<\/span>/g)];
        const engines = [];
        for (const [, path, ename] of engLinks) {
          const eHtml = await read(join(CRAWL, `en/${slug}/${mslug}/${gslug}/${path}.html`));
          const url = `/en/${slug}/${mslug}/${gslug}/${path}`;
          if (!eHtml) { anomaly(url, 'engine-page-missing', ''); redirects[`/${slug}/${mslug}/${gslug}/${path}`] = `/${slug}/${mslug}/${gslug}`; continue; }
          const row = (label) => {
            const m = eHtml.match(new RegExp(`<th>${label}[^<]*</th>\\s*<td>([^<]*)</td>\\s*<td>([^<]*)</td>`));
            return m ? [m[1], m[2]].map((v) => { const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10); return Number.isFinite(n) ? n : null; }) : [null, null];
          };
          const [hpStock, hpTuned] = row('Maximum power');
          const [nmStock, nmTuned] = row('Torque');
          const engName = dec(ename);
          const infoName = dec((eHtml.match(/<li><strong>Engine:<\/strong>\s*([^<]*)<\/li>/) || [])[1] || '');
          if (infoName && infoName !== engName) anomaly(url, 'engine-name-differs', `${engName} / ${infoName}`);
          // проверките от стр. 13
          // без мощност след тунинг (или ≤ фабричната) страницата няма за какво да съществува → 301 към поколението
          const skipTo = `/${slug}/${mslug}/${gslug}`;
          if (hpTuned == null || hpTuned <= 0) { anomaly(url, 'no-tuned-power', `${hpStock}→${hpTuned}`); report.enginesSkipped++; redirects[`${skipTo}/${path}`] = skipTo; continue; }
          if (hpStock == null || hpStock < 30 || hpStock > 1500) { anomaly(url, 'hp-stock-range', String(hpStock)); report.enginesSkipped++; redirects[`${skipTo}/${path}`] = skipTo; continue; }
          if (hpTuned <= (hpStock ?? 0)) { anomaly(url, 'tuned-not-greater', `${hpStock}→${hpTuned}`); report.enginesSkipped++; redirects[`${skipTo}/${path}`] = skipTo; continue; }
          if (nmStock != null && (nmStock < 50 || nmStock > 3500)) anomaly(url, 'nm-stock-range', String(nmStock));
          if (nmStock != null && nmTuned != null && nmTuned < nmStock) anomaly(url, 'nm-tuned-lower', `${nmStock}→${nmTuned}`);
          if (hpStock && (hpTuned - hpStock) / hpStock > 0.8) anomaly(url, 'gain-over-80pct', `${hpStock}→${hpTuned}`);
          // двоен запис = същото име и същите мощности в едно поколение (моментът в базата им често се разминава с 10–20 Nm)
          const dupKey = `${engName.toLowerCase().replace(/\s*\d+\s*hp\s*$/, '').replace(/[\s-]+/g, ' ').trim()}|${hpStock}|${hpTuned}`;
          const dup = engines.find((x) => x._key === dupKey);
          if (dup) {
            if (dup.nmStock == null && nmStock != null) { dup.nmStock = nmStock; dup.nmTuned = nmTuned; }
            anomaly(url, 'duplicate-engine', `→ ${dup.path}`); redirects[`/${slug}/${mslug}/${gslug}/${path}`] = `/${slug}/${mslug}/${gslug}/${dup.path}`; report.duplicates = (report.duplicates || 0) + 1; continue;
          }
          const engine = { path, name: engName, fuel: fuelOf(engName, path), hpStock, hpTuned, nmStock, nmTuned };
          engine.lastmod = stamp(url, [engName, hpStock, hpTuned, nmStock, nmTuned]);
          Object.defineProperty(engine, '_key', { value: dupKey, enumerable: false });
          engines.push(engine);
        }
        if (engines.length === 0) { redirects[`/${slug}/${mslug}/${gslug}`] = `/${slug}/${mslug}`; report.emptyBranches++; continue; }
        generations.push({ slug: gslug, from, to: to || null, engines });
        report.engines += engines.length;
      }
      if (generations.length === 0) { redirects[`/${slug}/${mslug}`] = `/${slug}`; report.emptyBranches++; continue; }
      models.push({ slug: mslug, name: modelName, generations });
    }
    if (models.length === 0) { redirects[`/${slug}`] = `/`; report.emptyBranches++; anomaly(`/en/${slug}`, 'brand-without-models', ''); continue; }
    const brand = { slug, name, logo: logoFile, models };
    // уникален path в марката — дублиран идентификатор спира билда
    const seen = new Set();
    for (const m of models) for (const g of m.generations) for (const e of g.engines) { const k = `${m.slug}/${g.slug}/${e.path}`; if (seen.has(k)) throw new Error(`Дублиран двигател: ${slug}/${k}`); seen.add(k); }
    await writeFile(join(DATA, 'catalog', `${slug}.json`), JSON.stringify(brand, null, 1));
    const engineCount = models.reduce((a, m) => a + m.generations.reduce((b, g) => b + g.engines.length, 0), 0);
    index.push({ slug, name, logo: logoFile, models: models.length, engines: engineCount });
    report.brands++; report.models += models.length; report.generations += models.reduce((a, m) => a + m.generations.length, 0);
  }
  await writeFile(join(DATA, 'catalog-index.json'), JSON.stringify(index, null, 1));
  await writeFile(join(DATA, 'lastmod.json'), JSON.stringify(lastmod, null, 0));
  await writeFile(join(CRAWL, 'hashes.json'), JSON.stringify(hashes));
  await writeFile(join(DATA, 'redirects-catalog.json'), JSON.stringify(redirects, null, 1));
  await writeFile(join(CRAWL, 'anomalies.csv'), 'path,rule,detail\n' + anomalies.map((a) => `${a.path},${a.rule},"${a.detail.replace(/"/g, "'")}"`).join('\n'));
  const byRule = {}; for (const a of anomalies) byRule[a.rule] = (byRule[a.rule] || 0) + 1;
  console.log(JSON.stringify({ ...report, anomalies: byRule, redirects: Object.keys(redirects).length }, null, 1));
}
main().catch((e) => { console.error(e); process.exit(1); });
