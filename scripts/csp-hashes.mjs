/**
 * Маха `'unsafe-inline'` от `script-src` в CSP, като го заменя с ХЕШОВЕТЕ на
 * самите inline скриптове.
 *
 * `'unsafe-inline'` значи „изпълни всеки скрипт, който намериш в страницата“ —
 * тоест CSP-то пази от всичко, освен от това, срещу което съществува. Хешовете
 * са другият край: браузърът изпълнява САМО скриптовете, чието съдържание
 * съвпада знак по знак с обявеното. Вписан скрипт от чужда ръка не минава.
 *
 * Защо хешове, а не nonce: nonce иска нова случайна стойност при всяка заявка,
 * тоест динамичен сървър. Тук страниците са статични и nginx ги подава както
 * са — nonce нямаше да се сменя и щеше да е по-лош от нищо.
 *
 * Пуска се СЛЕД `astro build` и преди образът да се сглоби; чете `dist/`,
 * записва `docker/nginx/csp.inc`. Ако файлът не съществува, nginx не тръгва —
 * това е нарочно: по-добре ясен отказ, отколкото тих CSP без хешове.
 *
 * `style-src` остава с `'unsafe-inline'`. Astro пише `style="…"` атрибути, а
 * атрибутите НЯМАТ как да се хешират — за тях трябва `'unsafe-hashes'`, което
 * връща голяма част от риска обратно. Стойността на рисковете е различна:
 * вписан `<script>` изпълнява код, вписан стил — не.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const DIST = join(root, 'dist');
const OUT = join(root, 'docker/nginx/csp.inc');

/** `<script>` без `src` — и БЕЗ типовете, които браузърът не изпълнява.
 *  JSON-LD (`application/ld+json`) е данни: CSP не го проверява и хеш за него
 *  е излишен шум в заглавката, а тя влиза във всеки отговор. */
const INLINE = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const isData = (attrs) => /type\s*=\s*["']?(application\/(ld\+json|json)|text\/template)/i.test(attrs);

const hashes = new Set();
let files = 0;

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!name.endsWith('.html')) continue;
    files++;
    const html = readFileSync(p, 'utf8');
    for (const m of html.matchAll(INLINE)) {
      if (isData(m[1])) continue;
      const body = m[2];
      if (!body.trim()) continue;
      // хешира се ТОЧНО съдържанието между таговете, без подрязване — един
      // изгубен интервал прави хеша безполезен и скриптът спира да се пуска
      hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
    }
  }
})(DIST);

const list = [...hashes].sort();

const csp = [
  "default-src 'self'",
  `script-src 'self' ${list.join(' ')} https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src https://www.google.com https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

writeFileSync(OUT, `# ГЕНЕРИРАН ФАЙЛ — не се пипа на ръка.
# Прави се от scripts/csp-hashes.mjs след всеки билд: ${files} страници,
# ${list.length} уникални inline скрипта.
#
# script-src е БЕЗ 'unsafe-inline' — вместо него стоят хешовете на скриптовете,
# които наистина са в страниците. Промени ли се скрипт без нов билд, браузърът
# спира да го изпълнява; това е усещаемо и е по-доброто от тихо разрешение.
add_header Content-Security-Policy "${csp}" always;
`);

console.log(`✓ CSP: ${list.length} хеша от ${files} страници → docker/nginx/csp.inc`);
if (!list.length) {
  console.error('✗ нула хеша — или dist е празен, или изразът не хваща скриптовете');
  process.exit(1);
}
