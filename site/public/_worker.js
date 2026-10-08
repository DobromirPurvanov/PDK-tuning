/**
 * Reading the database.
 *
 * The agreement is that the database is NOT migrated and NOT downloaded - the old site keeps
 * running and remains its only custodian. So there is not a single catalog record here:
 * every level is asked live from the old site at the moment of the request,
 * the answer is parsed out of the HTML and returned as JSON.
 *
 * One level = one request to the old site:
 *   /api/live/brands                                -> the brands from the home page
 *   /api/live/models/<brand>                        -> the models
 *   /api/live/years/<brand>/<model>                 -> the years
 *   /api/live/engines/<brand>/<model>/<years>       -> the engines
 *   /api/live/result/<brand>/<model>/<years>/<a>/<b> -> the numbers before and after
 *
 * Responses are cached at the edge so we do not hit the old site on every load.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHO IS "THE OLD SITE" AFTER THE TRANSFER
 *
 * The plan is for this site to take over THEIR DOMAIN. The moment that happens,
 * `www.pdktuning.com` is US - and if the origin stays recorded that way, the worker
 * will ask itself and the catalog will go silent.
 *
 * So the origin address is read from the environment: `CATALOG_BASE_URL` (the old
 * name `LEGACY_ORIGIN` is still accepted). Before the transfer it points to `www`, as
 * before. On switch day the client makes ONE DNS record to the same origin
 * (`files.pdktuning.com`, proxied through Cloudflare so there is a valid
 * certificate) and the key points to it. No code is touched - locally the value
 * lives in `.env.local`, in Pages it is in the project settings.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * WHERE THE CATALOG IS READ FROM. The key is named `CATALOG_BASE_URL`; `LEGACY_ORIGIN`
 * is accepted for environments already uploaded and for the notes, but the new one leads.
 *
 * EMPTY IS NOT A DEFAULT. Earlier `https://www.pdktuning.com` was hardcoded here
 * and that silently worked even with an empty key - and silent working is exactly
 * how a deploy ships with no environment configured and nobody notices until
 * we become `www` and the worker starts asking itself. Now a missing
 * key says honestly that it is missing.
 */
const legacyOf = (env) =>
  String(env.CATALOG_BASE_URL || env.LEGACY_ORIGIN || '').replace(/\/+$/, '');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// how long we keep the response at the edge, per level
const TTL = { brands: 86400, models: 86400, years: 86400, engines: 43200, result: 43200 };

// pages under /en/ that are not brands
const NAV = new Set(['about-us', 'contact', 'contacts', 'login', 'logout', 'tuning',
  'privacy-policy', 'upload', 'upload-file', 'register', 'sign-up']);

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—' };
const dec = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) =>
  e[0] === '#'
    ? String.fromCharCode(parseInt(e[1] === 'x' ? e.slice(2) : e.slice(1), e[1] === 'x' ? 16 : 10))
    : (ENT[e.toLowerCase()] ?? m));
// the old site encodes twice (&amp;#039;), so we decode twice
const txt = (h) => dec(dec(String(h).replace(/<[^>]+>/g, ' '))).replace(/\s+/g, ' ').trim();
// "316D 116hp 116hp" -> "316D 116hp": the power is repeated on the right in the row
const dedupe = (s) => { const w = s.split(' '); return w.length > 1 && w.at(-1) === w.at(-2) ? w.slice(0, -1).join(' ') : s; };

/**
 * Polishing the label from the old site.
 * Two things were visible in the finished result and could not stay:
 *  1. "1.4 Multi-Air - 140 hp (8GMK.Fx) 140hp" - the power column is glued to the end
 *     WITHOUT a space, so `dedupe` does not catch it: it is removed if the same number is already there;
 *  2. "2017 -> ..." - the arrow and the ellipsis are ASCII from the database.
 */
const tidy = (s) => {
  let out = dedupe(s);
  // `\b` was too strict: in "116D 116hp (1995cc) 116hp" the boundary after 116
  // is missing in both "116D" and "116hp" (a letter follows), so the repetition
  // stayed and it came out as "116D 116hp (1995cc)   116 к.с." - the same number three times.
  // The NUMBER is searched for, not the word: with no digit before or after it.
  out = out.replace(/\s*(\d+)\s*hp\s*$/i, (m, n) =>
    new RegExp(`(?:^|\\D)${n}(?!\\d)`).test(out.slice(0, out.length - m.length)) ? '' : m);
  return out.replace(/\s*->\s*/g, ' → ').replace(/\.\.\./g, '…').replace(/\s+/g, ' ').trim();
};

async function fetchPage(src, path) {
  // A hanging old site must not hold the picker: after the timeout the
  // answer comes from our own copy (see `snapshot` below).
  const r = await fetch(src + path, {
    headers: { 'user-agent': UA, 'accept-language': 'en' },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.text();
}

/** the links exactly `depth` segments under `base` */
function children(html, base, depth) {
  const seen = new Map();
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    // We strip WHATEVER origin, not only the one we fetched from: the old site's pages
    // carry links hardcoded as `https://www.pdktuning.com/...`, and
    // after the transfer we will read them from another name (files.pdktuning.com).
    const href = m[1].replace(/^https?:\/\/[^/]+/i, '').replace(/[?#].*$/, '');
    if (!href.startsWith(base + '/')) continue;
    const rest = href.slice(base.length + 1).replace(/\/$/, '');
    if (!rest || rest.split('/').length !== depth) continue;
    const label = tidy(txt(m[2]));
    if (label && !seen.has(rest)) seen.set(rest, label);
  }
  return [...seen].map(([slug, label]) => ({ slug, label }));
}

const readers = {
  async brands(src) {
    const list = children(await fetchPage(src, '/en/'), '/en', 1);
    return list.filter((x) => !NAV.has(x.slug) && !x.slug.includes('.'));
  },
  async models(src, [b]) {
    return children(await fetchPage(src, `/en/${b}`), `/en/${b}`, 1);
  },
  async years(src, [b, m]) {
    return children(await fetchPage(src, `/en/${b}/${m}`), `/en/${b}/${m}`, 1);
  },
  async engines(src, [b, m, y]) {
    const base = `/en/${b}/${m}/${y}`;
    return children(await fetchPage(src, base), base, 2);
  },
  async result(src, parts) {
    const html = await fetchPage(src, '/en/' + parts.join('/'));
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map((r) => [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => txt(c[1])))
      .filter((c) => c.length >= 3);
    const pair = (re) => {
      const row = rows.find((r) => re.test(r[0]));
      if (!row) return null;
      const a = parseInt(row[1], 10), b = parseInt(row[2], 10);
      return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null;
    };
    const info = {};
    for (const m of html.matchAll(/<strong>\s*([^<:]+):\s*<\/strong>\s*([^<]*)/gi)) info[txt(m[1])] = txt(m[2]);
    return { hp: pair(/power/i), nm: pair(/torque/i), info };
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   FALLBACK CATALOGUE
   The same five answers, read from our own copy in /catalog/<brand>.json
   (written by scripts/catalog-snapshot.mjs). Used ONLY when the live read
   fails, so a dead or blocked old site no longer empties the picker. The
   slugs are the old site's own, so the browser cannot tell the two apart.
   ══════════════════════════════════════════════════════════════════════════ */

const yearLabel = (from, to) => (from ? `${from} → ${to || '…'}` : 'All');

async function snapshotBrand(env, origin, slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) throw new Error('bad brand');
  const r = await env.ASSETS.fetch(new Request(`${origin}/catalog/${slug}.json`));
  if (!r.ok) throw new Error(`no snapshot for ${slug}`);
  return (await r.json()).m;
}

const find = (list, slug, what) => {
  const hit = list.find((x) => x[0] === slug);
  if (!hit) throw new Error(`unknown ${what}`);
  return hit;
};

/** slug → our display name, from marks.json; empty when it cannot be read */
async function markNames(env, origin) {
  try {
    const r = await env.ASSETS.fetch(new Request(origin + '/marks.json'));
    if (!r.ok) return new Map();
    return new Map((await r.json()).filter((m) => m.name).map((m) => [m.slug, m.name]));
  } catch { return new Map(); }
}

const snapshot = {
  async brands(env, origin) {
    const names = await markNames(env, origin);
    if (!names.size) throw new Error('marks.json missing');
    return [...names].map(([slug, label]) => ({ slug, label }));
  },
  async models(env, origin, [b]) {
    return (await snapshotBrand(env, origin, b)).map(([slug, label]) => ({ slug, label }));
  },
  async years(env, origin, [b, m]) {
    const [, , gens] = find(await snapshotBrand(env, origin, b), m, 'model');
    return gens.map(([slug, from, to]) => ({ slug, label: yearLabel(from, to) }));
  },
  async engines(env, origin, [b, m, y]) {
    const [, , gens] = find(await snapshotBrand(env, origin, b), m, 'model');
    return find(gens, y, 'years')[3].map(([slug, name]) => ({ slug, label: tidy(name) }));
  },
  async result(env, origin, [b, m, y, ...path]) {
    const models = await snapshotBrand(env, origin, b);
    const [, model, gens] = find(models, m, 'model');
    const [, from, to, list] = find(gens, y, 'years');
    const [, name, hp0, hp1, nm0, nm1] = find(list, path.join('/'), 'engine');
    const brand = (await markNames(env, origin)).get(b) ?? b;
    return {
      hp: [hp0, hp1],
      nm: [nm0, nm1],
      info: { Brand: brand, Model: model, Years: yearLabel(from, to), Engine: tidy(name) },
    };
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   THE FORM SUBMISSION
   It is checked a SECOND time here: the browser check protects the person from a mistake,
   this one protects the server from a robot. The letter goes out through Resend and is sent only if
   the environment is configured - otherwise we say honestly that the form is not connected, instead of
   showing "sent" and losing the inquiry.

   In the Pages environment set: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM.
   ══════════════════════════════════════════════════════════════════════════ */

const LIMIT = { count: 5, window: 3600 };   // 5 inquiries per hour from one address
const MAX_BODY = 8 * 1024;

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** counter at the edge: the key is a made-up address, the value is the count for the current hour */
async function tooMany(ip, ctx) {
  if (!ip) return false;
  const key = new Request(`https://pdk.local/rate/${encodeURIComponent(ip)}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  const n = hit ? Number(await hit.text()) || 0 : 0;
  if (n >= LIMIT.count) return true;
  ctx.waitUntil(cache.put(key, new Response(String(n + 1), {
    headers: { 'cache-control': `public, max-age=${LIMIT.window}` },
  })));
  return false;
}

const s = (v, max) => String(v ?? '').trim().slice(0, max);

/**
 * The guards shared by the form and the order.
 *
 * Pulled into one place when the second entry point appeared: two copies of the same
 * checks are how one day one misses what the other
 * catches. Returns either `{ bad }` - a ready response that is returned as-is - or
 * the parsed body.
 */
async function guard(request, ctx) {
  if (request.method === 'OPTIONS') return { bad: new Response(null, { status: 204 }) };
  if (request.method !== 'POST') return { bad: reply({ ok: false, code: 'method' }, 405) };

  // a request from a foreign page is not accepted
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return { bad: reply({ ok: false, code: 'origin' }, 403) };
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return { bad: reply({ ok: false, code: 'size' }, 413) };

  let d;
  try { d = JSON.parse(raw); } catch { return { bad: reply({ ok: false, code: 'json' }, 400) }; }

  // the decoy field and filling in too fast give away a robot
  if (String(d.pdk_extra || '').trim() || Number(d.elapsed) < 2000) {
    return { bad: reply({ ok: false, code: 'spam' }, 400) };
  }

  const name = s(d.name, 80);
  const phone = s(d.phone, 30);
  const email = s(d.email, 120);

  if (name.length < 2) return { bad: reply({ ok: false, code: 'name' }, 400) };
  if (phone.replace(/[^\d+]/g, '').length < 6) return { bad: reply({ ok: false, code: 'phone' }, 400) };
  if (email && !/^[^@\s]+@[^@\s.]+\.[a-z]{2,}$/i.test(email)) return { bad: reply({ ok: false, code: 'email' }, 400) };
  if (d.gdpr !== 'on' && d.gdpr !== true) return { bad: reply({ ok: false, code: 'gdpr' }, 400) };

  if (await tooMany(request.headers.get('cf-connecting-ip'), ctx)) {
    return { bad: reply({ ok: false, code: 'rate' }, 429) };
  }
  return { d, name, phone, email };
}

/** The letter through Resend. Without the keys in the environment we say honestly that we are not connected. */
async function send(env, { subject, text, replyTo }) {
  const to = env.CONTACT_TO, from = env.CONTACT_FROM, key = env.RESEND_API_KEY;
  if (!to || !from || !key) return reply({ ok: false, code: 'not-configured' }, 503);

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  return r.ok ? reply({ ok: true }) : reply({ ok: false, code: 'send' }, 502);
}

async function contact(request, env, ctx) {
  const g = await guard(request, ctx);
  if (g.bad) return g.bad;
  const { d, name, phone, email } = g;

  const lines = [
    `Име: ${name}`,
    `Телефон: ${phone}`,
    email ? `Имейл: ${email}` : null,
    s(d.service, 60) ? `Услуга: ${s(d.service, 60)}` : null,
    s(d.car, 120) ? `Автомобил: ${s(d.car, 120)}` : null,
    // which page it came from - the site is no longer a single screen and this is useful
    s(d.page, 120) ? `Страница: ${s(d.page, 120)}` : null,
    '',
    s(d.message, 1500) || '(без съобщение)',
  ].filter((x) => x !== null).join('\n');

  return send(env, {
    subject: `Запитване от сайта — ${name}`,
    text: lines,
    replyTo: email,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ORDER FOR ELECTRIC

   Two paths, not two kinds of code:

   1. WITHOUT `STRIPE_SECRET_KEY` in the environment - the order arrives as a letter and
      payment is arranged by phone. That is how it works while there is no account.
   2. WITH `STRIPE_SECRET_KEY` - a session is created in Stripe Checkout and
      `{ ok: true, redirect }` is returned to the page. The letter still goes out, so that
      there is a trace of the order even if the person abandons the payment screen.

   THE PRICE DOES NOT COME FROM THE BROWSER. Only `slug` comes from it; the amount is taken from
   `/ev-prices.json`, which the build exports from src/data/ev.ts. Otherwise everyone would
   pay whatever they typed in the console.

   CARD AND PAYPAL. We deliberately do NOT pass `payment_method_types`: this way Stripe
   shows the methods enabled in the account dashboard. PayPal is turned on from there with
   one switch, without a deploy. If it were listed here, a disabled PayPal would break
   the whole session with an error instead of just not being shown.
   ══════════════════════════════════════════════════════════════════════════ */

/** The price list exported from the build. Read through ASSETS, not over the network. */
async function evPrices(env, request) {
  try {
    const url = new URL('/ev-prices.json', request.url);
    const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** Stripe wants `application/x-www-form-urlencoded` with square brackets for nested values. */
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function checkout(env, request, { slug, item, currency, name, email, phone, pay, now }) {
  const origin = new URL(request.url).origin;
  const body = form({
    mode: 'payment',
    success_url: `${origin}/elektricheski/blagodarim/`,
    cancel_url: `${origin}/elektricheski/poracha/?m=${encodeURIComponent(slug)}`,
    locale: 'bg',
    customer_email: email || undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: String(currency).toLowerCase(),
        unit_amount: item.amount,
        product_data: { name: item.name },
      },
    }],
    // whatever the person fulfilling the order will need is visible in Stripe
    metadata: {
      slug,
      buyer: name,
      phone,
      preferred_payment: pay || '',
      // whether they consented to the file being prepared immediately (art. 57, item 13 of the Consumer Protection Act)
      immediate_consent: now ? 'yes' : 'no',
    },
  });

  // A failed Stripe must not become a 500 on our site: we return `null` and the order
  // goes down the "we arrange payment" path instead of the page collapsing.
  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const j = await r.json().catch(() => null);
    return r.ok && j?.url ? j.url : null;
  } catch {
    return null;
  }
}

async function order(request, env, ctx) {
  const g = await guard(request, ctx);
  if (g.bad) return g.bad;
  const { d, name, phone, email } = g;

  const model = s(d.model, 120);
  if (!model) return reply({ ok: false, code: 'model' }, 400);

  const slug = s(d.slug, 80);
  const pay = s(d.pay, 20);
  // explicit consent under art. 57, item 13 of the Consumer Protection Act - a checkbox that is NOT pre-ticked
  const now = d.now === 'on' || d.now === true;

  // The amount is decided here, by slug. Whatever came as a price from the browser is
  // used ONLY in the letter, and labelled as what was seen on screen.
  const table = slug ? await evPrices(env, request) : null;
  const item = table?.items?.[slug] ?? null;

  let redirect = null;
  if (item && env.STRIPE_SECRET_KEY) {
    redirect = await checkout(env, request, {
      slug, item, currency: table.currency, name, email, phone, pay, now,
    });
    if (!redirect) return reply({ ok: false, code: 'checkout' }, 502);
  }

  const lines = [
    `МОДЕЛ: ${model}`,
    slug ? `Код: ${slug}` : null,
    item
      ? `Цена: ${(item.amount / 100).toFixed(2)} ${table.currency} (от ценоразписа)`
      : 'Цена: няма обявена (заявка за оферта)',
    `Начин на плащане: ${pay || 'не е избран'}`,
    redirect ? 'Плащане: изпратен към Stripe Checkout' : 'Плащане: уговаря се по телефона',
    `Файлът да се подготви веднага (чл. 57, т. 13 ЗЗП): ${now ? 'ДА, съгласен' : 'не — чака се 14-дневният срок'}`,
    '',
    `Име: ${name}`,
    `Телефон: ${phone}`,
    email ? `Имейл: ${email}` : null,
    s(d.vin, 24) ? `VIN: ${s(d.vin, 24)}` : null,
    s(d.address, 200) ? `Доставка: ${s(d.address, 200)}` : null,
    '',
    s(d.message, 1500) || '(без бележка)',
  ].filter((x) => x !== null).join('\n');

  const sent = await send(env, {
    subject: `ПОРЪЧКА (електрически) — ${model} — ${name}`,
    text: lines,
    replyTo: email,
  });

  // If the payment session is ready, the person goes there even when the mail
  // is not configured - otherwise a paid order would collapse into "not-configured".
  if (redirect) return reply({ ok: true, redirect });
  return sent;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PASS-THROUGH TO THE OLD SITE

   The new site stands ON TOP of their domain, not next to it. But it is six
   pages, while the old one holds ~9,000 catalog addresses and the dealer
   portal. If the domain simply switches direction, everything else disappears:
   indexed pages become 404, and the partner garages' bookmarks
   to the login do too.

   So the addresses that are THEIRS are handed to the old site as they are:
   the request is forwarded with its method, headers and body (login is POST,
   file upload too), and the response is returned untouched. Nothing is
   migrated and nothing is duplicated - the old site keeps running, only
   now underneath.

   The list is deliberately CLOSED, not "everything unknown": the old site returns
   200 and the home page for a made-up address (an old defect), so if we
   passed it everything, our 404 would never be seen.

   ONE KEY, THREE STATES. `LEGACY_ORIGIN` says both where the catalog is read from
   and whether their paths are forwarded:

     empty                        mockup on `pdk-mockup.pages.dev`
                                  the catalog is read from www, but nothing is
                                  forwarded - `/bg/...` is our 404

     `https://www.pdktuning.com`  stage 1: we stand on `new.pdktuning.com`
                                  www is STILL THE OLD SITE, so it is both the source
                                  and the forwarding target. The catalog and login
                                  work through us, with nothing touched on their side

     `https://files.pdktuning.com`  stage 2: we have taken over www too
                                  www is now US, so the old server
                                  needs its own name, otherwise the worker asks
                                  itself (there is a guard that stops it)

   The difference between stages is ONLY the value of the key. The code is the same in all
   three, so stage 1 is a real rehearsal of stage 2, not an approximation of it.
   ══════════════════════════════════════════════════════════════════════════ */

/** what stays with the old site: the two languages, the portal under them and their files */
const LEGACY_PATHS = /^\/(bg|en|images|vendor|js|css|uploads|storage)(\/|$)|^\/manifest\.json$/i;

/* ══════════════════════════════════════════════════════════════════════════
   REDIRECTS FROM THE OLD ADDRESSES

   The old site has six real pages outside the catalog in each language and
   each of them has a successor here. Left to passThrough, they would be
   served in their old form from our domain - that is, two addresses for the one
   same thing, and they are exactly the indexed ones.

   What IS redirected and what is NOT:
   * The six pages and the brand level -> to us. For brands we have our own
     text for each of the 110 (`brand-notes.ts`) plus a live selector - the slugs
     match one to one, checked against the old site's download.
   * The dealer portal (`login`, `sign-up`, `logout`, file uploads)
     is NOT redirected. It keeps working on the old server - we have no successor for it
     and the dealers' login must not break.
   * The deep catalog (`/bg/bmw/3-series/...`, ~12,500 addresses) is NOT redirected.
     Our catalog ends at brand level; below that we have nothing to offer and
     a 301 to the parent would eat exactly the content the site is found by.

   They work ALWAYS, not only after the transfer: the redirect is a pure function of
   the path, asks the old site for nothing, and so can be checked days before the
   switch day. Today `/bg/about-us` is our 404 - a 301 to `/za-nas/` is better
   than both a 404 and waiting.
   ══════════════════════════════════════════════════════════════════════════ */

/** pages outside the catalog -> their successors here */
const LEGACY_PAGES = new Map([
  ['', '/'],                        // /bg/ and /en/ -> the home page
  ['about-us', '/za-nas/'],
  ['contact', '/kontakti/'],
  ['contacts', '/kontakti/'],
  ['privacy-policy', '/privacy/'],
  ['tuning', '/uslugi/'],
  /* The two subpages of `tuning` are in THEIR sitemap, so they are indexed.
     They were not in the site download - they were found only from their sitemap.
     The other names under `/tuning/` are not real pages: `/tuning/dpf`,
     `/tuning/egr` and even `/tuning/madeup` return the same as `chip-tuning`.
     So they are not listed - anything unknown under `tuning` goes to the services
     index. */
  ['tuning/chip-tuning', '/uslugi/chip-tuning/'],
  ['tuning/software-repair', '/uslugi/softueren-remont/'],
]);

/** the old site's English pages → ours; `''` (/en/) is not here, our /en/ is served directly */
const LEGACY_PAGES_EN = new Map([
  ['about-us', '/en/about/'],
  ['contact', '/en/contact/'],
  ['contacts', '/en/contact/'],
  ['privacy-policy', '/en/privacy/'],
  ['tuning', '/en/services/'],
  ['tuning/chip-tuning', '/en/services/chip-tuning/'],
  ['tuning/software-repair', '/en/services/software-repair/'],
]);

/** the dealer portal - stays on the old server, is not redirected */
const PORTAL_PATHS = new Set(['login', 'logout', 'sign-up', 'register', 'upload', 'upload-file']);

/** our 110 brands; filled on the first call from `marks.json` in the output */
let MARK_SLUGS = null;

async function markSlugs(env, origin) {
  if (MARK_SLUGS) return MARK_SLUGS;
  try {
    const r = await env.ASSETS.fetch(new Request(origin + '/marks.json'));
    if (r.ok) MARK_SLUGS = new Set((await r.json()).map((m) => m.slug));
  } catch { /* when in doubt, brands are not redirected - better the old site than a 404 */ }
  return MARK_SLUGS ?? new Set();
}

/**
 * Which new address corresponds to the old one. `null` means "no successor, leave it
 * to the old site".
 */
async function legacyTarget(pathname, env, origin) {
  const m = pathname.match(/^\/(bg|en)(?:\/(.*))?$/i);
  if (!m) return null;

  /* ONLY THE BULGARIAN ADDRESSES ARE REDIRECTED.

     The first version also sent `/en/about-us` -> `/za-nas/`, so a visitor
     arriving from an English page in Google landed on Bulgarian text. And that
     is not a rare case: **5,585 of the 5,586 addresses in their sitemap are under `/en/`** -
     all of the client's indexed traffic is English.

     While our site is Bulgarian only, the English addresses stay with
     the old site, where they have an English response. Redirecting them returns in
     stage 6 of `docs/ENGLISH.md` - then they will lead to OUR English
     pages, not to Bulgarian ones. */
  // we cut the trailing slash and the tail so we compare like with like
  const rest = (m[2] || '').replace(/\/+$/, '');

  /* English: the old site's own English pages now have English successors of
     ours (stage 6 of docs/ENGLISH.md). Everything else under /en/ (the 110
     makes, the deep catalogue, the dealer portal) stays with the old site. */
  if (m[1].toLowerCase() === 'en') {
    const key = rest.toLowerCase();
    const page = LEGACY_PAGES_EN.get(key);
    // /en/contact (theirs) and /en/contact/ (ours) differ only by the slash:
    // never send a page to itself
    if (page && page !== pathname) return page;
    if (/^tuning\//.test(key)) return '/en/services/';
    return null;
  }

  const page = LEGACY_PAGES.get(rest.toLowerCase());
  if (page) return page;

  /* An unknown name under `/tuning/` - on the old site it silently shows
     chip tuning instead of returning a 404. The services index is a more honest
     successor than guessing which service the person meant. */
  if (/^tuning\//i.test(rest)) return '/uslugi/';

  // only the FIRST level is a brand; if there is a second slash, it is a model or deeper
  if (!rest || rest.includes('/')) return null;

  const slug = rest.toLowerCase();
  if (PORTAL_PATHS.has(slug)) return null;

  const slugs = await markSlugs(env, origin);
  if (slugs.has(slug)) return `/katalog/${slug}/`;

  /* `alpine` and `westfield` exist as their pages, but are not linked
     from their home page and are not among our 110 - we send them to the catalog index,
     instead of leaving them on a page nobody reaches. */
  if (slug === 'alpine' || slug === 'westfield') return '/katalog/';

  return null;
}

/** headers that have no business in the forwarded request */
const HOP = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

async function passThrough(request, url, src, indexable) {
  const target = new URL(url.pathname + url.search, src);

  // guard: if the origin points at ourselves, the request would loop forever
  if (target.host === url.host) {
    return new Response(
      'LEGACY_ORIGIN points at this same domain — the old site must live on its own hostname.',
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const forwarded = new Request(target, request);
  // The upstream must receive its own Host and Cloudflare metadata. Forwarding
  // the VPS client's CF headers can make Cloudflare reject a loopback IP (1000).
  for (const name of ['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-worker',
    'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for']) forwarded.headers.delete(name);
  const r = await fetch(forwarded, { redirect: 'manual' });

  /* The client's Cloudflare zone challenges requests from the VPS. Its
     "Just a moment…" page is bound to the old host and cannot be solved on
     ours, so the visitor got a blank page. Send the browser to the old host
     itself, where a real browser passes the check. Temporary (302) until
     their zone lets our server through. */
  if (r.headers.get('cf-mitigated') === 'challenge' && ['GET', 'HEAD'].includes(request.method)) {
    console.error(`old site challenged ${url.pathname}; sending the visitor to ${target.host}`);
    return new Response(null, {
      status: 302,
      headers: { location: target.href, 'cache-control': 'no-store' },
    });
  }

  const headers = new Headers(r.headers);
  for (const h of HOP) headers.delete(h);

  // a redirect to the old address is turned back to our domain
  const loc = headers.get('location');
  if (loc) headers.set('location', loc.replace(/^https?:\/\/[^/]+/i, url.origin));

  // the login cookies are attached to the old domain; without "Domain" they become ours
  const cookies = r.headers.getSetCookie ? r.headers.getSetCookie()
    : r.headers.getAll ? r.headers.getAll('set-cookie') : [];
  if (cookies.length) {
    headers.delete('set-cookie');
    for (const c of cookies) headers.append('set-cookie', c.replace(/;\s*domain=[^;]*/i, ''));
  }

  // while we are on the mockup address, foreign content must not get into the index
  if (!indexable) headers.set('x-robots-tag', 'noindex, nofollow');

  const type = headers.get('content-type') || '';
  const out = new Response(r.body, { status: r.status, statusText: r.statusText, headers });
  if (!type.includes('text/html')) return out;

  // The links in their HTML are hardcoded as `https://www.pdktuning.com/...`. After
  // the transfer that is us and everything matches, but while we browse from outside
  // (or if the origin has another name) they lead out. We make them relative.
  const relative = {
    element(el) {
      for (const attr of ['href', 'src', 'action']) {
        const v = el.getAttribute(attr);
        if (v && /^https?:\/\//i.test(v) && isLegacyHost(v, src)) {
          el.setAttribute(attr, v.replace(/^https?:\/\/[^/]+/i, '') || '/');
        }
      }
    },
  };
  // HTMLRewriter accepts ONE selector per call - a comma-separated list is not supported
  let rw = new HTMLRewriter();
  for (const tag of ['a', 'link', 'script', 'img', 'form', 'iframe', 'source']) rw = rw.on(tag, relative);

  /* The canonical of their pages points to `http://127.0.0.1:9100/<same path>` -
     a developer-machine address was left in the production build and sits
     like that on all ~9,000 pages (the main audit finding, unfixed).
     While the site is theirs, that is their problem. The moment we move to
     their domain, the pages are served by US and the problem becomes ours -
     so the canonical is rewritten here, to our real address. */
  return rw
    .on('link[rel="canonical"]', {
      element(el) { el.setAttribute('href', url.origin + url.pathname); },
    })
    .transform(out);
}

/** does the address point to the old site - compared with the CURRENT origin, as it
 *  is in the environment; a hardcoded name here would go stale on switch day */
function isLegacyHost(value, src) {
  try {
    if (!src) return false;
    const h = new URL(value).host.replace(/^www\./i, '');
    return h === new URL(src).host.replace(/^www\./i, '');
  } catch { return false; }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const src = legacyOf(env);

    if (url.pathname === '/api/contact') return contact(request, env, ctx);
    if (url.pathname === '/api/order') return order(request, env, ctx);

    // pass-through is turned on ONLY when we stand in their place (see the note above)
    const takenOver = Boolean(src);

    if (!url.pathname.startsWith('/api/live/')) {
      /* Redirects run BEFORE the pass-through: an address with a successor here
         must not be served by the old site, otherwise the same thing lives at
         two addresses and the indexed one is the old one. */
      const to = await legacyTarget(url.pathname, env, url.origin);
      if (to) {
        // Relative on purpose: on the VPS `url.origin` is the configured BASE_URL
        // (www), not the host the visitor is on, and www is still the old site.
        return new Response(null, { status: 301, headers: { location: to + url.search } });
      }

      /* Our own English pages (/en/, /en/services/, /en/about/…) live under the
         same /en/ prefix as the old site's English catalogue. Whatever the build
         has is ours and is served first; only what we do not have (/en/bmw/…,
         /en/login) goes on to the old site. */
      if (takenOver && /^\/en(\/|$)/i.test(url.pathname) && ['GET', 'HEAD'].includes(request.method)) {
        const own = await env.ASSETS.fetch(request);
        if (own.status < 400) return own;
      }

      return takenOver && LEGACY_PATHS.test(url.pathname)
        ? passThrough(request, url, src, env.PUBLIC_INDEXABLE === 'true')
        : env.ASSETS.fetch(request);
    }

    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return hit;

    const [kind, ...parts] = url.pathname.slice('/api/live/'.length).split('/').filter(Boolean);
    const read = readers[kind];
    if (!read) return json({ error: 'unknown level' }, 404, 0);

    try {
      let data = await read(src, parts);
      // Brand names are ours (marks.json), not the old site's spelling
      // („Mc Cormick“, „Renault truck“), so the picker matches the catalogue pages.
      if (kind === 'brands') {
        const ours = await markNames(env, url.origin);
        data = data.map((b) => ({ ...b, label: ours.get(b.slug) ?? b.label }));
      }
      const res = json({ source: src, kind, data }, 200, TTL[kind] ?? 3600);
      ctx.waitUntil(cache.put(request, res.clone()));
      return res;
    } catch (e) {
      // The old site is down or blocked: answer from our own copy. Cached only
      // briefly, so the live data takes over again as soon as it is back.
      console.error(`live catalogue failed (${kind}/${parts.join('/')}): ${e.message || e}`);
      try {
        const data = await snapshot[kind](env, url.origin, parts);
        const res = json({ source: 'snapshot', kind, data }, 200, 300);
        ctx.waitUntil(cache.put(request, res.clone()));
        return res;
      } catch (e2) {
        return json({ error: 'catalogue unavailable', detail: String(e.message || e) }, 502, 0);
      }
    }
  },
};

function json(body, status, ttl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': ttl ? `public, max-age=${ttl}` : 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}
