/**
 * ГОТОВ ЛИ Е САЙТЪТ ЗА ПРЕВКЛЮЧВАНЕ.
 *
 * Минава през всичко, което трябва да е вярно, преди DNS-ът да се пипне, и
 * казва кое липсва. Нарочно НЕ поправя нищо — половината липсващи неща са
 * решения на клиента, а не дефекти в кода.
 *
 * Три степени:
 *   ✗ СПИРА      превключването се проваля или чупи нещо живо
 *   ! внимание   тръгва, но излиза празна рамка или изгубена настройка
 *   ✓            наред
 *
 * ПУСКАНЕТО Е НА ДВА ЕТАПА и проверките се различават:
 *
 *   етап 1  сайтът застава на `new.pdktuning.com`, `www` остава старият.
 *           Източникът е `www` — той още е техен. `catalog.pdktuning.com` НЕ трябва.
 *   етап 2  сайтът поема и `www`. Чак тогава старият сървър се нуждае от
 *           собствено име (`catalog.pdktuning.com`), иначе работникът пита сам себе си.
 *
 * Употреба:
 *   node scripts/migration/preflight.mjs                    # етап 1 (по подразбиране)
 *   node scripts/migration/preflight.mjs --etap2            # проверки за етап 2
 *   node scripts/migration/preflight.mjs --dns              # и DNS състоянието
 *   node scripts/migration/preflight.mjs --live https://new.pdktuning.com
 *
 * Проверката на живия сайт се пуска СЛЕД превключването — тогава същият
 * списък казва дали е минало.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve as dnsResolve } from 'node:dns/promises';

const root = (p) => fileURLToPath(new URL('../../' + p, import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valueOf = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };

const C = { ok: '\x1b[32m✓\x1b[0m', warn: '\x1b[33m!\x1b[0m', bad: '\x1b[31m✗\x1b[0m', dim: (s) => `\x1b[2m${s}\x1b[0m` };

/** кой етап се проверява — виж бележката горе */
const etap = flag('--etap2') ? 2 : 1;
const SITE = etap === 1 ? 'https://new.pdktuning.com' : 'https://www.pdktuning.com';
const ORIGIN = etap === 1 ? 'https://www.pdktuning.com' : 'https://catalog.pdktuning.com';

let stops = 0, warns = 0;
const ok = (m, d) => console.log(`  ${C.ok} ${m}${d ? '  ' + C.dim(d) : ''}`);
const warn = (m, d) => { warns++; console.log(`  ${C.warn} ${m}${d ? '  ' + C.dim(d) : ''}`); };
const stop = (m, d) => { stops++; console.log(`  ${C.bad} ${m}${d ? '  ' + C.dim(d) : ''}`); };
const head = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

/* ─────────────────────────────────────────────────────────── 1. домейнът */
head(`Домейн и канонични адреси  ${C.dim(`(етап ${etap} → ${SITE})`)}`);
{
  if (!existsSync(root('dist/index.html'))) {
    warn('няма билд', `пусни ${etap === 1 ? 'PUBLIC_SITE_URL=' + SITE + ' ' : ''}npm run build`);
  } else {
    const idx = readFileSync(root('dist/index.html'), 'utf8');
    const canon = idx.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (canon?.includes('pages.dev')) stop(`каноникълът сочи макета: ${canon}`, 'билдът е стар — пресгради');
    else if (!canon) stop('в изхода няма каноникъл');
    else if (!canon.startsWith(SITE)) {
      /* На етап 1 каноникъл към `www` е по-лош от грешен: `www` още е СТАРИЯТ
         сайт, тоест всяка наша страница би казвала „истинската съм аз, ама
         другаде“ — и сочи чуждо съдържание. */
      stop(`каноникълът е ${canon}, а етап ${etap} иска ${SITE}`,
        etap === 1 ? 'www още е старият сайт — билдни с PUBLIC_SITE_URL' : 'билдни без PUBLIC_SITE_URL');
    } else ok(`каноникълът е ${canon}`);

    if (existsSync(root('dist/sitemap.xml'))) {
      const sm = readFileSync(root('dist/sitemap.xml'), 'utf8');
      const n = (sm.match(/<loc>/g) || []).length;
      if (!sm.includes(SITE)) stop(`картата на сайта не сочи ${SITE}`);
      else ok(`картата на сайта: ${n} адреса`);
    } else warn('в изхода няма sitemap.xml');
  }
}

/* ────────────────────────────────────────────── 2. пренасочванията ги има */
head('Картата на пренасочванията');
{
  const w = readFileSync(root('public/_worker.js'), 'utf8');
  const need = [
    ['LEGACY_PAGES', 'таблицата със страниците'],
    ['PORTAL_PATHS', 'изключението за портала на дилърите'],
    ['legacyTarget', 'самото пренасочване'],
  ];
  for (const [what, why] of need) {
    if (w.includes(what)) ok(`${why} е на място`);
    else stop(`липсва \`${what}\` — ${why}`);
  }

  /* Порталът НЕ бива да е в таблицата за пренасочване. Гледа се ТОЧНО блокът
     на `LEGACY_PAGES` — първият опит броеше 900 знака напред и хващаше
     `PORTAL_PATHS` три реда по-долу, тоест вдигаше тревога за правилен код. */
  const pagesBlock = w.match(/const LEGACY_PAGES[^[]*\[([\s\S]*?)^\]\);/m)?.[1] ?? '';
  const leaked = pagesBlock.match(/'(login|logout|sign-up|register|upload|upload-file)'/)?.[1];
  if (leaked) stop(`\`${leaked}\` е в LEGACY_PAGES`, 'входът на дилърите ще се пренасочи и ще се счупи');
  else if (!pagesBlock) warn('блокът LEGACY_PAGES не се разчита', 'проверката за портала е пропусната');
  else ok('порталът на дилърите не се пренасочва');

  if (existsSync(root('dist/marks.json'))) {
    const marks = JSON.parse(readFileSync(root('dist/marks.json'), 'utf8'));
    ok(`слуговете на марките се изнасят: ${marks.length} марки`);
  } else warn('в изхода няма marks.json', 'марките няма да се пренасочват — пресгради');
}

/* ───────────────────────────────────────────────── 3. данните на клиента */
head('Данни, които чакат клиента');
{
  const b = JSON.parse(readFileSync(root('src/data/business.json'), 'utf8'));
  const empty = [];
  if (!b.eik) empty.push('ЕИК');
  if (!b.vat) empty.push('ДДС номер');
  if (!b.apps?.ios) empty.push('PDK Flasher за iOS');
  if (!b.apps?.android) empty.push('PDK Flasher за Android');
  if (empty.length) warn(`празни полета: ${empty.join(', ')}`, 'излизат като видима рамка „попълва се“');
  else ok('данните на фирмата са пълни');

  if (b._todo) warn('адресът и работното време още не са потвърдени', 'ул. Прилеп 96 срещу 164');
  if (b.email) ok(`имейл: ${b.email}`, b.email.includes('office@') ? 'потвърден ли е от клиента?' : '');

  const p = JSON.parse(readFileSync(root('src/data/prices.json'), 'utf8'));
  if (p._todo) warn('цените в prices.json са ориентировъчни', 'потвърждават се от клиента');

  /* Цените живеят в таблицата `OURS`, а моделите идват от `ev-source.json`.
     Гледа се ТОЧНО блокът на OURS: горе в същия файл има закоментиран пример
     с `price: 2400`, който иначе минава за обявена цена. */
  const ev = readFileSync(root('src/data/ev.ts'), 'utf8');
  const oursBlock = ev.match(/export const OURS[^{]*\{([\s\S]*?)^\};/m)?.[1] ?? '';
  const withPrice = (oursBlock.match(/price:\s*\d+/g) || []).length;
  const models = JSON.parse(readFileSync(root('src/data/ev-source.json'), 'utf8')).models.length;
  if (withPrice === 0) warn(`нито един от ${models} електрически модела няма цена`, 'всички излизат „Цена по запитване“, чекаутът не може да работи');
  else if (withPrice < models) warn(`${withPrice} от ${models} електрически модела имат цена`);
  else ok(`всички ${models} електрически модела имат цена`);
}

/* ────────────────────────────────────────────── 4. ключовете за средата */
head('Ключове за средата на Pages');
{
  /* На етап 1 индексирането остава ЗАТВОРЕНО. `new` и `www` биха показвали
     едно и също съдържание под две имена и биха се били за едни и същи думи,
     а по-силният адрес е техният. Отваря се чак на етап 2. */
  const needed = [
    ['PUBLIC_INDEXABLE', etap === 1 ? 'НЕ се задава' : 'true',
      etap === 1 ? 'на етап 1 сайтът остава noindex — иначе се бие с www' : 'без него сайтът тръгва с noindex'],
    ['LEGACY_ORIGIN', ORIGIN, 'без него каталогът и входът не се препредават'],
    ['PUBLIC_GA_ID', 'G-…', 'без него няма статистика'],
    ['RESEND_API_KEY', '', 'без него формата връща 503'],
    ['CONTACT_TO', '', 'получателят на запитванията'],
    ['CONTACT_FROM', 'потвърден домейн в Resend', 'подателят'],
  ];
  console.log(C.dim('  (задават се в таблото на Cloudflare — оттук не се виждат)'));
  for (const [k, v, why] of needed) console.log(`    ${k}${v ? ' = ' + v : ''}  ${C.dim(why)}`);

  const ex = readFileSync(root('.env.example'), 'utf8');
  const missing = needed.map(([k]) => k).filter((k) => !ex.includes(k));
  if (missing.length) warn(`в .env.example липсват: ${missing.join(', ')}`);
  else ok('.env.example описва всички ключове');
}

/* ───────────────────────────────────────────────────────────── 5. DNS */
if (flag('--dns')) {
  head(`DNS състояние  ${C.dim(`(етап ${etap})`)}`);
  const look = async (name) => { try { return await dnsResolve(name, 'A'); } catch { return null; } };

  /* Източникът е различен на двата етапа: на етап 1 www още е ТЕХЕН и служи за
     източник; на етап 2 www сме ние и старият сървър му трябва свое име. */
  const originHost = new URL(ORIGIN).host;
  const originIps = await look(originHost);
  if (!originIps) stop(`${originHost} не съществува`, 'източникът на каталога и портала — виж docs/prevklyuchvane.md');
  else {
    ok(`${originHost} отговаря  ${originIps.join(', ')}`);
    try {
      const r = await fetch(`${ORIGIN}/bg/login`, { redirect: 'manual' });
      if (r.ok) ok(`${originHost}/bg/login дава 200`, 'старият сайт е достижим като източник');
      else stop(`${originHost}/bg/login дава ${r.status}`, 'входът на дилърите ще се счупи');
    } catch (e) {
      stop(`${originHost} не се отваря по https`, String(e.message || e));
    }
  }

  // адресът, на който трябва да застане нашият сайт
  const siteHost = new URL(SITE).host;
  const siteIps = await look(siteHost);
  if (!siteIps) stop(`${siteHost} не съществува`);
  else ok(`${siteHost}  ${siteIps.join(', ')}`, 'проксирано през Cloudflare');

  if (etap === 1) {
    /* Докато `new` сочи VPS-а на стария Astro сайт, нашият Pages проект не го
       обслужва. Различава се по съдържанието, не по адреса — и двата са зад
       Cloudflare и дават едни и същи IP-та. */
    try {
      const r = await fetch(`${SITE}/`, { redirect: 'follow' });
      const html = await r.text();
      if (html.includes('ОТКЛЮЧИМ')) ok(`${siteHost} вече обслужва новия сайт`);
      else warn(`${siteHost} още не е нашият сайт`, 'CNAME към new-pdk.pages.dev не е направен');
    } catch { warn(`${siteHost} не отговаря`); }
  }

  try {
    const mx = await dnsResolve('pdktuning.com', 'MX');
    ok(`MX записите са на място: ${mx.map((m) => m.exchange).join(', ')}`, 'пощата не се пипа');
  } catch { warn('MX записите не се четат'); }
}

/* ──────────────────────────────────────────── 6. живият сайт (след смяна) */
const live = valueOf('--live');
if (live) {
  head(`Живият сайт: ${live}`);
  const get = async (p, init) => { try { return await fetch(live.replace(/\/+$/, '') + p, init); } catch (e) { return { error: e }; } };

  const home = await get('/', { redirect: 'manual' });
  if (home.error) stop('началната не отговаря', String(home.error.message));
  else if (home.ok) {
    const html = await home.text();
    if (html.includes('ОТКЛЮЧИМ')) ok('началната е НОВИЯТ сайт');
    else warn('началната отговаря, но не прилича на новия сайт');
    if (/name="robots" content="[^"]*noindex/.test(html)) stop('страницата още носи noindex', 'вдигни PUBLIC_INDEXABLE=true');
    else ok('noindex е махнат');
  } else stop(`началната дава ${home.status}`);

  const robots = await get('/robots.txt');
  if (!robots.error && robots.ok) {
    const t = await robots.text();
    if (/Disallow:\s*\/\s*$/m.test(t)) stop('robots.txt още забранява всичко', 'вдигни PUBLIC_INDEXABLE=true');
    else ok('robots.txt пуска обхождането');
  }

  const login = await get('/bg/login', { redirect: 'manual' });
  if (login.error) stop('/bg/login не отговаря', 'входът на дилърите е счупен');
  else if (login.status === 200) ok('/bg/login работи през новия сайт');
  else if (login.status >= 300 && login.status < 400) stop(`/bg/login се ПРЕНАСОЧВА към ${login.headers.get('location')}`, 'трябва да остане на стария сайт');
  else stop(`/bg/login дава ${login.status}`);

  for (const [from, to] of [['/bg/about-us', '/za-nas/'], ['/bg/bmw', '/katalog/bmw/'], ['/bg/tuning', '/uslugi/']]) {
    const r = await get(from, { redirect: 'manual' });
    if (r.error) { stop(`${from} не отговаря`); continue; }
    const loc = r.headers?.get?.('location') || '';
    if (r.status === 301 && loc.endsWith(to)) ok(`${from} → ${to}`);
    else stop(`${from} дава ${r.status} ${loc}`, `очаква се 301 към ${to}`);
  }
}

/* ────────────────────────────────────────────────────────────── изводът */
console.log();
if (stops) {
  console.log(`\x1b[31m${stops === 1 ? '1 нещо спира' : stops + ' неща спират'} превключването\x1b[0m`
    + (warns ? `, ${warns === 1 ? 'още 1 е' : 'още ' + warns + ' са'} за внимание` : ''));
  process.exit(1);
}
if (warns) {
  console.log(`\x1b[33mНищо не спира превключването. ${warns === 1 ? '1 нещо ще излезе празно' : warns + ' неща ще излязат празни'} или изгубени.\x1b[0m`);
  process.exit(0);
}
console.log('\x1b[32mГотово за превключване.\x1b[0m');
