/**
 * Collects the REFERENCE for the electric models from mapev.net → src/data/ev-source.json
 *
 * Why from there: mapev.net is the only public source that says which
 * electric models are factory-derated and by how much. We take from it ONLY
 * the facts about the car: name, years, factory power and torque, and how far
 * the block goes by their measurement.
 *
 * THESE ARE NOT OUR NUMBERS AND NOT OUR PRICE. MapEV sells a MODULE SWAP
 * (a new "plug and play" control unit, €2159–2599 excl. VAT, updated with
 * their MapEV Diag and an ENET cable from a computer). We sell OUR OWN
 * software through PDK Flasher over OBD-II. So the output here is used only as
 * a reference, and what is shown on the site lives in src/data/ev.ts and is
 * filled in by us.
 *
 * Run by hand, not on build: `node scripts/mapev.mjs`
 */
import { writeFile } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** Pages collected from the mapev.net start page (31 models, 4 brands). */
const PAGES = [
  'taycan-4', 'taycan-4s-pb', 'taycan-4s-pb-plus', 'taycan-pb', 'taycan-pb-plus',
  'taycan-gts', 'taycan-turbo', 'porsche-taycan-turbo-s',
  'taycan-4-pb-plus-fl', 'taycan-4s-pb-plus-fl', 'taycan-pb-fl', 'taycan-pb-plus-fl',
  'taycan-gts-fl', 'taycan-turbo-fl', 'taycan-turbo-s-fl', 'taycan-turbo-gt',
  'e-tron-gt', 'e-tron-gt-quattro', 'e-tron-gt-fl',
  'rs-e-tron-gt', 'rs-e-tron-gt-fl', 'rs-e-tron-gt-performance',
  'q4-e-tron-35', 'q4-e-tron-45',
  'id-3-pro', 'id3-pure-performance', 'id4-pro', 'id4-pure', 'id4-pure-performance', 'id5-pro',
  'enyaq-iv-50', 'enyaq-iv-60', 'enyaq-iv-80x',
];

/** The brand is read from the URL; on their pages it is nowhere a separate field. */
function brandOf(slug) {
  if (slug.includes('taycan')) return 'porsche';
  if (slug.includes('e-tron')) return 'audi';
  if (slug.startsWith('enyaq')) return 'skoda';
  return 'vw';
}

/** HTML → lines of plain text. The pages are Elementor: the meaning is in the order of the nodes. */
function lines(html) {
  const t = html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&rsquo;|&#8217;/g, "'")
    .replace(/&ndash;|&#8211;/g, '–').replace(/&euro;/g, '€');
  return t.split('\n').map((l) => l.trim()).filter(Boolean);
}

/**
 * The numbers sit as separate nodes in a strict order:
 *   name · years · description · US|$ N · EU|€ N · stockHP "Horsepower" · stockNm
 *   "Nm of torque" · "Order now" · normalPS · PS · afterPS · PS · Gain: · N PS
 *   · normNm · Nm · afterNm · Nm · Gain: · N Nm
 * So it is read by anchors, not by classes; Elementor classes change.
 */
function parse(slug, html) {
  const L = lines(html);
  const at = (re, from = 0) => L.findIndex((l, i) => i >= from && re.test(l));
  const num = (s) => Number(String(s).replace(/[^\d.]/g, '')) || null;

  const iHp = at(/^Horsepower$/i);
  const iNm = at(/^Nm of torque$/i);
  const iOrder = at(/^Order now$/i);

  // The title and years sit before the first number.
  const iYears = at(/^\d{4}\s*[–-]\s*(\d{4}|present|\.\.\.)?$/i);
  const name = iYears > 0 ? L[iYears - 1] : slug;
  const years = iYears > 0 ? L[iYears].replace(/\s*[–-]\s*/, '–') : null;

  const usd = num(L[at(/^\$\s*[\d,]+/)] ?? '');
  const eur = num(L[at(/^€\s*[\d,]+/)] ?? '');

  // The PS and Nm pairs after "Order now": [normal, after] and [normal, after].
  const tail = L.slice(iOrder + 1, iOrder + 40);
  const ps = [];
  const nm = [];
  for (let i = 0; i < tail.length - 1; i++) {
    if (/^PS$/i.test(tail[i + 1]) && /^[\d,]+$/.test(tail[i])) ps.push(num(tail[i]));
    if (/^Nm$/i.test(tail[i + 1]) && /^[\d,]+$/.test(tail[i])) nm.push(num(tail[i]));
  }

  const descr = iYears > 0 ? L[iYears + 1] : null;

  return {
    slug,
    brand: brandOf(slug),
    name,
    years,
    /** factory, as declared by the manufacturer */
    stock: { ps: num(L[iHp - 1]), nm: num(L[iNm - 1]) },
    /** in normal mode factory → after their intervention */
    normal: { ps: ps[0] ?? null, nm: nm[0] ?? null },
    mapev: { ps: ps[1] ?? null, nm: nm[1] ?? null },
    /** their price for the MODULE SWAP, excl. VAT and delivery, for orientation only */
    mapevPrice: { usd, eur, note: 'смяна на модула, без ДДС и доставка' },
    descr,
    src: `https://www.mapev.net/${slug}/`,
  };
}

const out = [];
for (const slug of PAGES) {
  const url = `https://www.mapev.net/${slug}/`;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) {
    console.error(`  ! ${slug} → ${res.status}`);
    continue;
  }
  const row = parse(slug, await res.text());
  out.push(row);
  console.log(
    `  ${row.brand.padEnd(8)} ${row.name.padEnd(26)} ${String(row.years).padEnd(12)} ` +
    `${row.normal.ps ?? '?'} → ${row.mapev.ps ?? '?'} PS`,
  );
  await new Promise((r) => setTimeout(r, 300));
}

out.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
await writeFile(
  new URL('../src/data/ev-source.json', import.meta.url),
  JSON.stringify({ harvested: new Date().toISOString().slice(0, 10), source: 'mapev.net', models: out }, null, 2) + '\n',
);
console.log(`\n${out.length} models → src/data/ev-source.json`);
