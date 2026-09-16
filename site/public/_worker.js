/**
 * Четенето на базата.
 *
 * Уговорката е базата да НЕ се мигрира и да НЕ се сваля — старият сайт продължава
 * да работи и си остава единственият ѝ пазител. Затова тук няма нито един запис от
 * каталога: всяко ниво се пита на живо от стария сайт в момента на заявката,
 * отговорът се разчита от HTML-а и се връща като JSON.
 *
 * Едно ниво = една заявка към стария сайт:
 *   /live/brands                                → марките от началната
 *   /live/models/<марка>                        → моделите
 *   /live/years/<марка>/<модел>                 → годините
 *   /live/engines/<марка>/<модел>/<години>      → двигателите
 *   /live/result/<марка>/<модел>/<години>/<a>/<b> → числата преди и след
 *
 * Отговорите се кешират на ръба, за да не удряме стария сайт при всяко зареждане.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * КОЙ Е „СТАРИЯТ САЙТ“ СЛЕД ПРЕХВЪРЛЯНЕТО
 *
 * Планът е този сайт да застане НА ТЕХНИЯ ДОМЕЙН. В мига, в който това стане,
 * `www.pdktuning.com` сме НИЕ — и ако източникът остане записан така, работникът
 * ще пита сам себе си и каталогът ще замълчи.
 *
 * Затова адресът на източника се чете от средата: `CATALOG_BASE_URL` (старото
 * име `LEGACY_ORIGIN` още се приема). Преди прехвърлянето сочи `www`, както
 * досега. В деня на смяната клиентът прави ЕДИН DNS запис към същия произход
 * (`catalog.pdktuning.com`, проксиран през Cloudflare, за да има валиден
 * сертификат) и ключът сочи към него. Код не се пипа — местно стойността
 * живее в `.env.local`, в Pages е в настройките на проекта.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ОТКЪДЕ СЕ ЧЕТЕ КАТАЛОГЪТ. Името на ключа е `CATALOG_BASE_URL`; `LEGACY_ORIGIN`
 * се приема заради вече качените среди и записките, но новото е водещото.
 *
 * ПРАЗНО НЕ Е ПОДРАЗБИРАНЕ. По-рано тук стоеше зашит `https://www.pdktuning.com`
 * и това мълчаливо работеше и при празен ключ — а мълчаливото работене е точно
 * начинът да се пусне деплой без настроена среда и никой да не забележи, докато
 * `www` не станем ние и работникът не почне да пита сам себе си. Сега липсващият
 * ключ казва честно, че липсва.
 */
const legacyOf = (env) =>
  String(env.CATALOG_BASE_URL || env.LEGACY_ORIGIN || '').replace(/\/+$/, '');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// колко държим отговора на ръба, по нива
const TTL = { brands: 86400, models: 86400, years: 86400, engines: 43200, result: 43200 };

// страници под /en/, които не са марки
const NAV = new Set(['about-us', 'contact', 'contacts', 'login', 'logout', 'tuning',
  'privacy-policy', 'upload', 'upload-file', 'register', 'sign-up']);

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—' };
const dec = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) =>
  e[0] === '#'
    ? String.fromCharCode(parseInt(e[1] === 'x' ? e.slice(2) : e.slice(1), e[1] === 'x' ? 16 : 10))
    : (ENT[e.toLowerCase()] ?? m));
// старият сайт кодира двойно (&amp;#039;), затова декодираме два пъти
const txt = (h) => dec(dec(String(h).replace(/<[^>]+>/g, ' '))).replace(/\s+/g, ' ').trim();
// „316D 116hp 116hp“ → „316D 116hp“: мощността се повтаря вдясно в реда
const dedupe = (s) => { const w = s.split(' '); return w.length > 1 && w.at(-1) === w.at(-2) ? w.slice(0, -1).join(' ') : s; };

/**
 * Излъскване на надписа от стария сайт.
 * Две неща се виждаха в готовия вид и нямаше как да останат:
 *  1. „1.4 Multi-Air - 140 hp (8GMK.Fx) 140hp“ — колоната с мощността се лепи в края
 *     БЕЗ интервал, затова `dedupe` не я хваща: маха се, ако същото число вече го има;
 *  2. „2017 -> ...“ — стрелката и многоточието са ASCII от базата.
 */
const tidy = (s) => {
  let out = dedupe(s);
  // `\b` беше твърде строго: в „116D 116hp (1995cc) 116hp“ границата след 116
  // липсва и в „116D“, и в „116hp“ (следва буква), затова повторението
  // оставаше и излизаше „116D 116hp (1995cc)   116 к.с.“ — три пъти едно число.
  // Търси се ЧИСЛОТО, а не думата: без цифра преди и след него.
  out = out.replace(/\s*(\d+)\s*hp\s*$/i, (m, n) =>
    new RegExp(`(?:^|\\D)${n}(?!\\d)`).test(out.slice(0, out.length - m.length)) ? '' : m);
  return out.replace(/\s*->\s*/g, ' → ').replace(/\.\.\./g, '…').replace(/\s+/g, ' ').trim();
};

async function fetchPage(src, path) {
  const r = await fetch(src + path, { headers: { 'user-agent': UA, 'accept-language': 'en' } });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.text();
}

/** връзките точно `depth` сегмента под `base` */
function children(html, base, depth) {
  const seen = new Map();
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    // Махаме КОЙТО И ДА Е произход, не само този, от който сме теглили: страниците
    // на стария сайт носят връзки, зашити като `https://www.pdktuning.com/…`, а
    // след прехвърлянето ще ги четем от друго име (catalog.pdktuning.com).
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
   ЗАПИТВАНЕТО ОТ ФОРМАТА
   Проверява се ВТОРИ път тук: проверката в браузъра пази човека от грешка,
   тази пази сървъра от робот. Писмото тръгва през Resend и се праща само ако
   средата е настроена — иначе казваме честно, че формата не е свързана, вместо
   да покажем „изпратено“ и да изгубим запитването.

   В средата на Pages се слагат: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM.
   ══════════════════════════════════════════════════════════════════════════ */

const LIMIT = { count: 5, window: 3600 };   // 5 запитвания на час от един адрес
const MAX_BODY = 8 * 1024;

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** брояч на ръба: ключът е измислен адрес, стойността — броят за текущия час */
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
 * Пазачите, общи за формата и за поръчката.
 *
 * Извадени в едно място, когато се появи вторият вход: две копия на едни и
 * същи проверки е начинът един ден едното да пропусне това, което другото
 * лови. Връща или `{ bad }` — готов отговор, който се връща както е — или
 * разчетеното тяло.
 */
async function guard(request, ctx) {
  if (request.method === 'OPTIONS') return { bad: new Response(null, { status: 204 }) };
  if (request.method !== 'POST') return { bad: reply({ ok: false, code: 'method' }, 405) };

  // заявка от чужда страница не се приема
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return { bad: reply({ ok: false, code: 'origin' }, 403) };
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return { bad: reply({ ok: false, code: 'size' }, 413) };

  let d;
  try { d = JSON.parse(raw); } catch { return { bad: reply({ ok: false, code: 'json' }, 400) }; }

  // примамката и прекалено бързото попълване издават робот
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

/** Писмото през Resend. Без ключовете в средата казваме честно, че не сме свързани. */
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
    // от коя страница е дошло — сайтът вече не е един екран и това е полезно
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
   ПОРЪЧКАТА ЗА ЕЛЕКТРИЧЕСКИ

   Два пътя, а не два вида код:

   1. БЕЗ `STRIPE_SECRET_KEY` в средата — поръчката пристига като писмо и
      плащането се уговаря по телефона. Така работи, докато няма сметка.
   2. СЪС `STRIPE_SECRET_KEY` — прави се сесия в Stripe Checkout и на
      страницата се връща `{ ok: true, redirect }`. Писмото пак тръгва, за да
      има следа от поръчката дори ако човекът се откаже на екрана за плащане.

   ЦЕНАТА НЕ ИДВА ОТ БРАУЗЪРА. От него идва само `slug`; сумата се вади от
   `/ev-prices.json`, което билдът изнася от src/data/ev.ts. Иначе всеки щеше
   да плати колкото си напише в конзолата.

   КАРТА И PAYPAL. Нарочно НЕ подаваме `payment_method_types`: така Stripe
   показва методите, включени в таблото на сметката. PayPal се вдига оттам с
   един ключ, без деплой. Ако беше изброен тук, изключен PayPal щеше да чупи
   цялата сесия с грешка, вместо просто да не се показва.
   ══════════════════════════════════════════════════════════════════════════ */

/** Ценоразписът, изнесен от билда. Чете се през ASSETS, не по мрежата. */
async function evPrices(env, request) {
  try {
    const url = new URL('/ev-prices.json', request.url);
    const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** Stripe иска `application/x-www-form-urlencoded` с квадратни скоби за вложеното. */
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
    // каквото ще трябва на човека, който изпълнява поръчката, се вижда в Stripe
    metadata: {
      slug,
      kupuvach: name,
      telefon: phone,
      predpochetano_plashtane: pay || '',
      // дали е дал съгласие файлът да се подготви веднага (чл. 57, т. 13 ЗЗП)
      saglasie_vednaga: now ? 'да' : 'не',
    },
  });

  // Паднал Stripe не бива да става 500 на нашия сайт: връщаме `null` и поръчката
  // тръгва по пътя „уговаряме плащането“, вместо страницата да се срине.
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
  // изричното съгласие по чл. 57, т. 13 ЗЗП — отметка, която НЕ е сложена предварително
  const now = d.now === 'on' || d.now === true;

  // Сумата се решава тук, по slug. Каквото е дошло като цена от браузъра, се
  // ползва САМО в писмото, и то с етикет, че е видяното на екрана.
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

  // Ако сесията за плащане е готова, човекът тръгва натам дори когато пощата
  // не е настроена — иначе платена поръчка би се сринала на „не-configured“.
  if (redirect) return reply({ ok: true, redirect });
  return sent;
}

/* ══════════════════════════════════════════════════════════════════════════
   ПРЕМИНАВАНЕТО КЪМ СТАРИЯ САЙТ

   Новият сайт стъпва ВЪРХУ техния домейн, а не до него. Той обаче е шест
   страници, докато на стария живеят ~9 000 адреса на каталога и порталът за
   дилъри. Ако домейнът просто смени посоката си, всичко останало изчезва:
   индексираните страници стават 404, а отметките на партньорските сервизи
   към входа — също.

   Затова адресите, които са ТЕХНИ, се подават на стария сайт както са:
   заявката се препредава с метода, заглавките и тялото ѝ (входът е POST,
   качването на файл — също), отговорът се връща непокътнат. Нищо не се
   мигрира и нищо не се дублира — старият сайт продължава да си работи, само
   че вече отдолу.

   Списъкът е нарочно ЗАТВОРЕН, а не „всичко непознато“: старият сайт връща
   200 и началната страница за измислен адрес (стар дефект), тоест ако му
   подавахме всичко, нашата 404 никога нямаше да се вижда.

   ЕДИН КЛЮЧ, ТРИ СЪСТОЯНИЯ. `LEGACY_ORIGIN` казва едновременно откъде се чете
   каталогът и дали техните пътища се препредават:

     празно                       макет на `pdk-mockup.pages.dev`
                                  каталогът се чете от www, но нищо не се
                                  препредава — `/bg/…` е нашата 404

     `https://www.pdktuning.com`  етап 1: стоим на `new.pdktuning.com`
                                  www е ОЩЕ СТАРИЯТ САЙТ, значи е и източникът,
                                  и целта на препредаването. Каталогът и входът
                                  работят през нас, без нищо да се пипа при тях

     `https://catalog.pdktuning.com`  етап 2: поели сме и www
                                  www вече сме НИЕ, затова старият сървър се
                                  нуждае от собствено име, иначе работникът пита
                                  сам себе си (има предпазител, който го спира)

   Разликата между етапите е САМО стойността на ключа. Кодът е един и същ и през
   трите, затова етап 1 е истинска проба на етап 2, а не негово подобие.
   ══════════════════════════════════════════════════════════════════════════ */

/** какво остава на стария сайт: двата езика, порталът под тях и техните файлове */
const LEGACY_PATHS = /^\/(bg|en|images|vendor|js|css|uploads|storage)(\/|$)|^\/manifest\.json$/i;

/* ══════════════════════════════════════════════════════════════════════════
   ПРЕНАСОЧВАНИЯТА ОТ СТАРИТЕ АДРЕСИ

   Старият сайт има шест истински страници извън каталога на всеки език и
   всяка от тях има наследник тук. Оставени на passThrough, те биха се
   обслужвали в стария си вид от нашия домейн — тоест два адреса за едно и
   също нещо, и точно те са индексираните.

   Кое СЕ пренасочва и кое НЕ:
   • Шестте страници и нивото на марката → при нас. За марките имаме свой
     текст на всяка от 110-те (`brand-notes.ts`) плюс жив избирач — slug-овете
     съвпадат едно към едно, сверено срещу свалянето на стария сайт.
   • Порталът на дилърите (`login`, `sign-up`, `logout`, качването на файлове)
     НЕ се пренасочва. Той остава да работи на стария сървър — нямаме негов
     наследник и входът на дилърите не бива да се чупи.
   • Дълбокият каталог (`/bg/bmw/3-series/…`, ~12 500 адреса) НЕ се пренасочва.
     Нашият каталог свършва на ниво марка; отдолу нямаме какво да предложим и
     301 към родителя би изял точно съдържанието, с което сайтът се намира.

   Работят ВИНАГИ, не само след трансфера: пренасочването е чиста функция от
   пътя, не пита стария сайт за нищо, и така се проверява дни преди деня на
   смяната. Днес `/bg/about-us` е нашата 404 — 301 към `/za-nas/` е по-добре
   и от 404, и от чакането.
   ══════════════════════════════════════════════════════════════════════════ */

/** страниците извън каталога → наследниците им при нас */
const LEGACY_PAGES = new Map([
  ['', '/'],                        // /bg/ и /en/ → началната
  ['about-us', '/za-nas/'],
  ['contact', '/kontakti/'],
  ['contacts', '/kontakti/'],
  ['privacy-policy', '/privacy/'],
  ['tuning', '/uslugi/'],
  /* Двете подстраници на `tuning` са в ТЕХНИЯ sitemap, тоест индексирани са.
     В свалянето на сайта ги нямаше — намерени са чак от картата им.
     Останалите имена под `/tuning/` не са реални страници: `/tuning/dpf`,
     `/tuning/egr` и дори `/tuning/измислено` връщат същото като `chip-tuning`.
     Затова не се изброяват — всичко непознато под `tuning` отива в индекса на
     услугите. */
  ['tuning/chip-tuning', '/uslugi/chip-tuning/'],
  ['tuning/software-repair', '/uslugi/softueren-remont/'],
]);

/** порталът на дилърите — стои на стария сървър, не се пренасочва */
const PORTAL_PATHS = new Set(['login', 'logout', 'sign-up', 'register', 'upload', 'upload-file']);

/** нашите 110 марки; пълни се при първото извикване от `marks.json` в изхода */
let MARK_SLUGS = null;

async function markSlugs(env, origin) {
  if (MARK_SLUGS) return MARK_SLUGS;
  try {
    const r = await env.ASSETS.fetch(new Request(origin + '/marks.json'));
    if (r.ok) MARK_SLUGS = new Set((await r.json()).map((m) => m.slug));
  } catch { /* при съмнение марките не се пренасочват — по-добре стария сайт, отколкото 404 */ }
  return MARK_SLUGS ?? new Set();
}

/**
 * Кой нов адрес отговаря на стария. `null` значи „няма наследник, остави го
 * на стария сайт“.
 */
async function legacyTarget(pathname, env, origin) {
  const m = pathname.match(/^\/(bg|en)(?:\/(.*))?$/i);
  if (!m) return null;

  /* ПРЕНАСОЧВАТ СЕ САМО БЪЛГАРСКИТЕ АДРЕСИ.

     Първият вариант пращаше и `/en/about-us` → `/za-nas/`, тоест посетител,
     дошъл от английска страница в Google, попадаше на български текст. И това
     не е рядък случай: **5 585 от 5 586 адреса в техния sitemap са на `/en/`** —
     целият индексиран трафик на клиента е английски.

     Докато нашият сайт е само на български, английските адреси си остават при
     стария сайт, където имат английски отговор. Пренасочването им се връща на
     етап 6 от `docs/ANGLIYSKI.md` — тогава ще водят към НАШИ английски
     страници, не към български. */
  if (m[1].toLowerCase() === 'en') return null;

  // режем крайната наклонена черта и опашката, за да сравняваме едно и също
  const rest = (m[2] || '').replace(/\/+$/, '');

  const page = LEGACY_PAGES.get(rest.toLowerCase());
  if (page) return page;

  /* Непознато име под `/tuning/` — на стария сайт то мълчаливо показва
     чиптунинга, вместо да върне 404. Индексът на услугите е по-честният
     наследник от това да отгатваме коя услуга е имал предвид. */
  if (/^tuning\//i.test(rest)) return '/uslugi/';

  // само ПЪРВОТО ниво е марка; има ли втора черта, това е модел или по-надолу
  if (!rest || rest.includes('/')) return null;

  const slug = rest.toLowerCase();
  if (PORTAL_PATHS.has(slug)) return null;

  const slugs = await markSlugs(env, origin);
  if (slugs.has(slug)) return `/katalog/${slug}/`;

  /* `alpine` и `westfield` съществуват като техни страници, но не са свързани
     от началната им и ги няма в нашите 110 — пращаме ги в индекса на каталога,
     вместо да ги оставим на страница, до която никой не стига. */
  if (slug === 'alpine' || slug === 'westfield') return '/katalog/';

  return null;
}

/** заглавки, които нямат работа в препредадената заявка */
const HOP = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

async function passThrough(request, url, src, indexable) {
  const target = new URL(url.pathname + url.search, src);

  // предпазител: ако източникът сочи към самите нас, заявката щеше да се върти в кръг
  if (target.host === url.host) {
    return new Response(
      'LEGACY_ORIGIN сочи към този същия домейн — старият сайт трябва да е на свое име.',
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const forwarded = new Request(target, request);
  // The upstream must receive its own Host and Cloudflare metadata. Forwarding
  // the VPS client's CF headers can make Cloudflare reject a loopback IP (1000).
  for (const name of ['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-worker',
    'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for']) forwarded.headers.delete(name);
  const r = await fetch(forwarded, { redirect: 'manual' });
  const headers = new Headers(r.headers);
  for (const h of HOP) headers.delete(h);

  // пренасочване към стария адрес се връща към нашия домейн
  const loc = headers.get('location');
  if (loc) headers.set('location', loc.replace(/^https?:\/\/[^/]+/i, url.origin));

  // бисквитките на входа са закачени за стария домейн; без „Domain“ стават наши
  const cookies = r.headers.getSetCookie ? r.headers.getSetCookie()
    : r.headers.getAll ? r.headers.getAll('set-cookie') : [];
  if (cookies.length) {
    headers.delete('set-cookie');
    for (const c of cookies) headers.append('set-cookie', c.replace(/;\s*domain=[^;]*/i, ''));
  }

  // докато сме на макетния адрес, чуждото съдържание не бива да влиза в индекса
  if (!indexable) headers.set('x-robots-tag', 'noindex, nofollow');

  const type = headers.get('content-type') || '';
  const out = new Response(r.body, { status: r.status, statusText: r.statusText, headers });
  if (!type.includes('text/html')) return out;

  // Връзките в техния HTML са зашити като `https://www.pdktuning.com/…`. След
  // прехвърлянето това сме ние и всичко съвпада, но докато преглеждаме отвън
  // (или ако източникът е под друго име) те водят навън. Правим ги относителни.
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
  // HTMLRewriter приема ЕДИН избирач на извикване — списък с запетаи не се поддържа
  let rw = new HTMLRewriter();
  for (const tag of ['a', 'link', 'script', 'img', 'form', 'iframe', 'source']) rw = rw.on(tag, relative);

  /* Каноникълът на техните страници сочи `http://127.0.0.1:9100/<същия път>` —
     адресът от машината на разработчика е останал в продукционния билд и стои
     така на всичките ~9 000 страници (главната находка от одита, непоправена).
     Докато сайтът е техен, това си е техен проблем. В мига, в който минем на
     техния домейн, страниците се обслужват от НАС и проблемът става наш —
     затова каноникълът се пренаписва тук, на нашия истински адрес. */
  return rw
    .on('link[rel="canonical"]', {
      element(el) { el.setAttribute('href', url.origin + url.pathname); },
    })
    .transform(out);
}

/** адресът сочи ли към стария сайт — сравнява се със СЕГАШНИЯ източник, какъвто
 *  е в средата; зашито име тук би остаряло в деня на превключването */
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

    // преминаването се включва САМО когато стоим на тяхно място (виж бележката горе)
    const takenOver = Boolean(src);

    if (!url.pathname.startsWith('/live/')) {
      /* Пренасочванията вървят ПРЕДИ преминаването: адрес с наследник при нас
         не бива да се обслужва от стария сайт, иначе едно и също нещо живее на
         два адреса и индексираният е старият. */
      const to = await legacyTarget(url.pathname, env, url.origin);
      if (to) {
        return Response.redirect(url.origin + to + url.search, 301);
      }

      return takenOver && LEGACY_PATHS.test(url.pathname)
        ? passThrough(request, url, src, env.PUBLIC_INDEXABLE === 'true')
        : env.ASSETS.fetch(request);
    }

    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return hit;

    const [kind, ...parts] = url.pathname.slice('/live/'.length).split('/').filter(Boolean);
    const read = readers[kind];
    if (!read) return json({ error: 'непознато ниво' }, 404, 0);

    try {
      const data = await read(src, parts);
      const res = json({ source: src, kind, data }, 200, TTL[kind] ?? 3600);
      ctx.waitUntil(cache.put(request, res.clone()));
      return res;
    } catch (e) {
      // старият сайт е единственият източник — ако мълчи, го казваме честно
      return json({ error: 'старият сайт не отговаря', detail: String(e.message || e) }, 502, 0);
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
