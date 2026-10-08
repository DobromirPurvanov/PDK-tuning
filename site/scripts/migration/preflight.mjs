/**
 * IS THE SITE READY TO SWITCH OVER.
 *
 * Goes through everything that must be true before DNS is touched and says
 * what is missing. Deliberately does NOT fix anything: half of the missing
 * things are client decisions, not defects in the code.
 *
 * Three levels:
 *   ✗ STOP      the switch fails or breaks something live
 *   ! warning   it goes ahead, but an empty frame or a lost setting appears
 *   ✓           fine
 *
 * THE LAUNCH IS IN TWO STAGES and the checks differ:
 *
 *   stage 1  the site goes up at `new.pdktuning.com`, `www` stays the old one.
 *            The source is `www`, which is still theirs. `files.pdktuning.com` is NOT needed.
 *   stage 2  the site takes over `www` too. Only then does the old server need
 *            a name of its own (`files.pdktuning.com`), otherwise the worker asks itself.
 *
 * Usage:
 *   node scripts/migration/preflight.mjs                    # stage 1 (default)
 *   node scripts/migration/preflight.mjs --stage2            # stage 2 checks
 *   node scripts/migration/preflight.mjs --dns              # and the DNS state
 *   node scripts/migration/preflight.mjs --live https://new.pdktuning.com
 *
 * The live-site check is run AFTER the switch; then the same list says
 * whether it went through.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve as dnsResolve } from 'node:dns/promises';

const root = (p) => fileURLToPath(new URL('../../' + p, import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valueOf = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };

const C = { ok: '\x1b[32m✓\x1b[0m', warn: '\x1b[33m!\x1b[0m', bad: '\x1b[31m✗\x1b[0m', dim: (s) => `\x1b[2m${s}\x1b[0m` };

/** which stage is being checked, see the note above */
const stage = flag('--stage2') ? 2 : 1;
const SITE = stage === 1 ? 'https://new.pdktuning.com' : 'https://www.pdktuning.com';
const ORIGIN = stage === 1 ? 'https://www.pdktuning.com' : 'https://files.pdktuning.com';

let stops = 0, warns = 0;
const ok = (m, d) => console.log(`  ${C.ok} ${m}${d ? '  ' + C.dim(d) : ''}`);
const warn = (m, d) => { warns++; console.log(`  ${C.warn} ${m}${d ? '  ' + C.dim(d) : ''}`); };
const stop = (m, d) => { stops++; console.log(`  ${C.bad} ${m}${d ? '  ' + C.dim(d) : ''}`); };
const head = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

/* ─────────────────────────────────────────────────────────────────── 1. the domain */
head(`Domain and canonical URLs  ${C.dim(`(stage ${stage} → ${SITE})`)}`);
{
  if (!existsSync(root('dist/index.html'))) {
    warn('no build', `run ${stage === 1 ? 'PUBLIC_SITE_URL=' + SITE + ' ' : ''}npm run build`);
  } else {
    const idx = readFileSync(root('dist/index.html'), 'utf8');
    const canon = idx.match(/rel="canonical" href="([^"]+)"/)?.[1];
    if (canon?.includes('pages.dev')) stop(`canonical points at the mockup: ${canon}`, 'the build is stale — rebuild');
    else if (!canon) stop('no canonical in the output');
    else if (!canon.startsWith(SITE)) {
      /* At stage 1 a canonical pointing at `www` is worse than a wrong one: `www` is
         still the OLD site, so every page of ours would say "the real one is me, but
         elsewhere", and point at foreign content. */
      stop(`canonical is ${canon}, but stage ${stage} wants ${SITE}`,
        stage === 1 ? 'www is still the old site — build with PUBLIC_SITE_URL' : 'build without PUBLIC_SITE_URL');
    } else ok(`canonical is ${canon}`);

    if (existsSync(root('dist/sitemap.xml'))) {
      const sm = readFileSync(root('dist/sitemap.xml'), 'utf8');
      const n = (sm.match(/<loc>/g) || []).length;
      if (!sm.includes(SITE)) stop(`sitemap does not point at ${SITE}`);
      else ok(`sitemap: ${n} URLs`);
    } else warn('no sitemap.xml in the output');
  }
}

/* ────────────────────────────────────────────────────────────── 2. the redirects exist */
head('Redirect map');
{
  const w = readFileSync(root('public/_worker.js'), 'utf8');
  const need = [
    ['LEGACY_PAGES', 'the page table'],
    ['PORTAL_PATHS', 'the dealer portal exception'],
    ['legacyTarget', 'the redirect itself'],
  ];
  for (const [what, why] of need) {
    if (w.includes(what)) ok(`${why} is in place`);
    else stop(`missing \`${what}\` — ${why}`);
  }

  /* The portal must NOT be in the redirect table. It looks at EXACTLY the block
     of `LEGACY_PAGES`: the first attempt counted 900 characters ahead and caught
     `PORTAL_PATHS` three lines further down, i.e. raised an alarm for correct code. */
  const pagesBlock = w.match(/const LEGACY_PAGES[^[]*\[([\s\S]*?)^\]\);/m)?.[1] ?? '';
  const leaked = pagesBlock.match(/'(login|logout|sign-up|register|upload|upload-file)'/)?.[1];
  if (leaked) stop(`\`${leaked}\` is in LEGACY_PAGES`, 'the dealer login would be redirected and break');
  else if (!pagesBlock) warn('the LEGACY_PAGES block cannot be parsed', 'portal check skipped');
  else ok('the dealer portal is not redirected');

  if (existsSync(root('dist/marks.json'))) {
    const marks = JSON.parse(readFileSync(root('dist/marks.json'), 'utf8'));
    ok(`brand slugs are exported: ${marks.length} brands`);
  } else warn('no marks.json in the output', 'brands will not be redirected — rebuild');
}

/* ───────────────────────────────────────────────────────────────── 3. the client's data */
head('Data waiting on the client');
{
  const b = JSON.parse(readFileSync(root('src/data/business.json'), 'utf8'));
  const empty = [];
  if (!b.eik) empty.push('company ID (EIK)');
  if (!b.vat) empty.push('VAT number');
  if (!b.apps?.ios) empty.push('PDK Flasher for iOS');
  if (!b.apps?.android) empty.push('PDK Flasher for Android');
  // Since 16.09.2026 an empty field is NOT drawn: the "pending" frames were removed at
  // Dobo's request. So there is nothing on screen to remind anyone; this line is
  // the only reminder and that is why it is stricter than it looks.
  if (empty.length) warn(`empty fields: ${empty.join(', ')}`, 'the row is simply not shown — nothing on the site will remind anyone');
  else ok('company data is complete');

  if (b._todo) warn('address and opening hours are not confirmed yet', 'Prilep St. 96 vs 164');
  if (b.email) ok(`email: ${b.email}`, b.email.includes('office@') ? 'confirmed by the client?' : '');

  const p = JSON.parse(readFileSync(root('src/data/prices.json'), 'utf8'));
  if (p._todo) warn('prices in prices.json are indicative', 'to be confirmed by the client');

  /* Prices live in the `OURS` table, and the models come from `ev-source.json`.
     It looks at EXACTLY the OURS block: higher up in the same file there is a
     commented-out example with `price: 2400`, which would otherwise pass for a declared price. */
  const ev = readFileSync(root('src/data/ev.ts'), 'utf8');
  const oursBlock = ev.match(/export const OURS[^{]*\{([\s\S]*?)^\};/m)?.[1] ?? '';
  const withPrice = (oursBlock.match(/price:\s*\d+/g) || []).length;
  const models = JSON.parse(readFileSync(root('src/data/ev-source.json'), 'utf8')).models.length;
  if (withPrice === 0) warn(`none of the ${models} electric models has a price`, 'all show „Цена по запитване“, checkout cannot work');
  else if (withPrice < models) warn(`${withPrice} of ${models} electric models have a price`);
  else ok(`all ${models} electric models have a price`);
}

/* ─────────────────────────────────────────────────────────────── 4. the environment keys */
head('Pages environment keys');
{
  /* At stage 1 indexing stays CLOSED. `new` and `www` would show the same
     content under two names and would fight over the same words, and the
     stronger address is theirs. It opens only at stage 2. */
  const needed = [
    ['PUBLIC_INDEXABLE', stage === 1 ? 'do NOT set' : 'true',
      stage === 1 ? 'at stage 1 the site stays noindex — otherwise it fights with www' : 'without it the site starts as noindex'],
    ['LEGACY_ORIGIN', ORIGIN, 'without it the catalog and login are not proxied'],
    ['PUBLIC_GA_ID', 'G-…', 'without it there are no analytics'],
    ['RESEND_API_KEY', '', 'without it the form returns 503'],
    ['CONTACT_TO', '', 'recipient of the inquiries'],
    ['CONTACT_FROM', 'verified domain in Resend', 'the sender'],
  ];
  console.log(C.dim('  (set in the Cloudflare dashboard — not visible from here)'));
  for (const [k, v, why] of needed) console.log(`    ${k}${v ? ' = ' + v : ''}  ${C.dim(why)}`);

  const ex = readFileSync(root('.env.example'), 'utf8');
  const missing = needed.map(([k]) => k).filter((k) => !ex.includes(k));
  if (missing.length) warn(`missing from .env.example: ${missing.join(', ')}`);
  else ok('.env.example documents all keys');
}

/* ───────────────────────────────────────────────────────────── 5. DNS */
if (flag('--dns')) {
  head(`DNS state  ${C.dim(`(stage ${stage})`)}`);
  const look = async (name) => { try { return await dnsResolve(name, 'A'); } catch { return null; } };

  /* The source differs between the two stages: at stage 1 www is still THEIRS and serves as
   the source; at stage 2 www is us and the old server needs its own name. */
  const originHost = new URL(ORIGIN).host;
  const originIps = await look(originHost);
  if (!originIps) stop(`${originHost} does not exist`, 'source of the catalog and portal — see docs/cutover.md');
  else {
    ok(`${originHost} responds  ${originIps.join(', ')}`);
    try {
      const r = await fetch(`${ORIGIN}/bg/login`, { redirect: 'manual' });
      if (r.ok) ok(`${originHost}/bg/login returns 200`, 'the old site is reachable as the origin');
      else stop(`${originHost}/bg/login returns ${r.status}`, 'the dealer login will break');
    } catch (e) {
      stop(`${originHost} does not open over https`, String(e.message || e));
    }
  }

  // the address where our site should end up
  const siteHost = new URL(SITE).host;
  const siteIps = await look(siteHost);
  if (!siteIps) stop(`${siteHost} does not exist`);
  else ok(`${siteHost}  ${siteIps.join(', ')}`, 'proxied through Cloudflare');

  if (stage === 1) {
    /* While `new` points at the VPS of the old Astro site, our Pages project does not
       serve it. It is told apart by content, not by address: both are behind
       Cloudflare and give the same IPs. */
    try {
      const r = await fetch(`${SITE}/`, { redirect: 'follow' });
      const html = await r.text();
      if (html.includes('ОТКЛЮЧИМ')) ok(`${siteHost} already serves the new site`);
      else warn(`${siteHost} is not our site yet`, 'CNAME to new-pdk.pages.dev not set up');
    } catch { warn(`${siteHost} does not respond`); }
  }

  try {
    const mx = await dnsResolve('pdktuning.com', 'MX');
    ok(`MX records in place: ${mx.map((m) => m.exchange).join(', ')}`, 'mail is left alone');
  } catch { warn('MX records cannot be read'); }
}

/* ────────────────────────────────────────────────────────────── 6. the live site (after the switch) */
const live = valueOf('--live');
if (live) {
  head(`Live site: ${live}`);
  const get = async (p, init) => { try { return await fetch(live.replace(/\/+$/, '') + p, init); } catch (e) { return { error: e }; } };

  const home = await get('/', { redirect: 'manual' });
  if (home.error) stop('home page does not respond', String(home.error.message));
  else if (home.ok) {
    const html = await home.text();
    if (html.includes('ОТКЛЮЧИМ')) ok('home page is the NEW site');
    else warn('home page responds, but does not look like the new site');
    if (/name="robots" content="[^"]*noindex/.test(html)) stop('the page still carries noindex', 'set PUBLIC_INDEXABLE=true');
    else ok('noindex is gone');
  } else stop(`home page returns ${home.status}`);

  const robots = await get('/robots.txt');
  if (!robots.error && robots.ok) {
    const t = await robots.text();
    if (/Disallow:\s*\/\s*$/m.test(t)) stop('robots.txt still disallows everything', 'set PUBLIC_INDEXABLE=true');
    else ok('robots.txt allows crawling');
  }

  const login = await get('/bg/login', { redirect: 'manual' });
  if (login.error) stop('/bg/login does not respond', 'the dealer login is broken');
  else if (login.status === 200) ok('/bg/login works through the new site');
  else if (login.status >= 300 && login.status < 400) stop(`/bg/login REDIRECTS to ${login.headers.get('location')}`, 'it must stay on the old site');
  else stop(`/bg/login returns ${login.status}`);

  for (const [from, to] of [['/bg/about-us', '/za-nas/'], ['/bg/bmw', '/katalog/bmw/'], ['/bg/tuning', '/uslugi/']]) {
    const r = await get(from, { redirect: 'manual' });
    if (r.error) { stop(`${from} does not respond`); continue; }
    const loc = r.headers?.get?.('location') || '';
    if (r.status === 301 && loc.endsWith(to)) ok(`${from} → ${to}`);
    else stop(`${from} returns ${r.status} ${loc}`, `expected 301 to ${to}`);
  }
}

/* ────────────────────────────────────────────────────────────────────────── the outcome */
console.log();
if (stops) {
  console.log(`\x1b[31m${stops === 1 ? '1 item blocks' : stops + ' items block'} the switch\x1b[0m`
    + (warns ? `, ${warns === 1 ? '1 more needs' : warns + ' more need'} attention` : ''));
  process.exit(1);
}
if (warns) {
  console.log(`\x1b[33mNothing blocks the switch. ${warns === 1 ? '1 item will come out empty' : warns + ' items will come out empty'} or lost.\x1b[0m`);
  process.exit(0);
}
console.log('\x1b[32mReady to switch.\x1b[0m');
