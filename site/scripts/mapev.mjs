/**
 * Събира СПРАВКАТА за електрическите модели от mapev.net → src/data/ev-source.json
 *
 * Защо оттам: mapev.net е единственият публичен източник, който казва кои
 * електрически модели са фабрично занижени и с колко. Взимаме от него САМО
 * фактите за автомобила — име, години, фабрична мощност и въртящ момент, и
 * докъде стига блокът по тяхно измерване.
 *
 * ТОВА НЕ СА НАШИТЕ ЧИСЛА И НЕ Е НАШАТА ЦЕНА. MapEV продава СМЯНА НА МОДУЛА
 * (ново „plug and play“ управляващо тяло, €2159–2599 без ДДС, обновява се с
 * техния MapEV Diag и ENET кабел от компютър). Ние продаваме СВОЙ софтуер през
 * PDK Flasher по OBD-II. Затова изходът тук се използва само като справка, а
 * това, което се показва на сайта, живее в src/data/ev.ts и се попълва от нас.
 *
 * Пуска се ръчно, не при билд: `node scripts/mapev.mjs`
 */
import { writeFile } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** Страниците, събрани от началната на mapev.net (31 модела, 4 марки). */
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

/** Марката се чете от адреса — на техните страници тя никъде не е отделно поле. */
function brandOf(slug) {
  if (slug.includes('taycan')) return 'porsche';
  if (slug.includes('e-tron')) return 'audi';
  if (slug.startsWith('enyaq')) return 'skoda';
  return 'vw';
}

/** HTML → редове чист текст. Страниците са Elementor: смисълът е в реда на възлите. */
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
 * Числата стоят като отделни възли в строг ред:
 *   име · години · описание · US|$ N · EU|€ N · стокHP „Horsepower“ · стокNm
 *   „Nm of torque“ · „Order now“ · нормалнаPS · PS · следPS · PS · Gain: · N PS
 *   · нормNm · Nm · следNm · Nm · Gain: · N Nm
 * Затова се чете по котви, а не по класове — класовете на Elementor се менят.
 */
function parse(slug, html) {
  const L = lines(html);
  const at = (re, from = 0) => L.findIndex((l, i) => i >= from && re.test(l));
  const num = (s) => Number(String(s).replace(/[^\d.]/g, '')) || null;

  const iHp = at(/^Horsepower$/i);
  const iNm = at(/^Nm of torque$/i);
  const iOrder = at(/^Order now$/i);

  // Заглавието и годините стоят преди първото число.
  const iYears = at(/^\d{4}\s*[–-]\s*(\d{4}|present|\.\.\.)?$/i);
  const name = iYears > 0 ? L[iYears - 1] : slug;
  const years = iYears > 0 ? L[iYears].replace(/\s*[–-]\s*/, '–') : null;

  const usd = num(L[at(/^\$\s*[\d,]+/)] ?? '');
  const eur = num(L[at(/^€\s*[\d,]+/)] ?? '');

  // Двойките PS и Nm след „Order now“: [нормална, след] и [нормален, след].
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
    /** фабрично, както го обявява производителят */
    stock: { ps: num(L[iHp - 1]), nm: num(L[iNm - 1]) },
    /** в нормален режим фабрично → след тяхната намеса */
    normal: { ps: ps[0] ?? null, nm: nm[0] ?? null },
    mapev: { ps: ps[1] ?? null, nm: nm[1] ?? null },
    /** тяхната цена за СМЯНА НА МОДУЛА, без ДДС и без доставка — само за ориентир */
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
console.log(`\n${out.length} модела → src/data/ev-source.json`);
