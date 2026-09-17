/**
 * Пази правилото „в кода няма зашит домейн“.
 *
 * Адресите идват от `.env.local` (`BASE_URL`, `CATALOG_BASE_URL`). Зашит
 * `pdktuning.com` насред кода оцелява точно до деня на превключването и после
 * сочи грешното място — тихо, защото страницата пак се отваря.
 *
 * Пуска се с `npm run check:urls`; излиза с 1, ако намери.
 *
 * КОЕ Е ПОЗВОЛЕНО (и защо):
 *   - коментари и документация — там адресът ОБЯСНЯВА, не се ползва;
 *   - имейл адресите (`office@pdktuning.com`) — те не са адрес на сайт;
 *   - `.env.example` — той е точно за това;
 *   - текстът в политиката за поверителност — правно задължение да се назове
 *     откъде се четат данните.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { proseLines } from './lib/prose.mjs';

const root = new URL('..', import.meta.url).pathname;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.wrangler', '.git', '.kaskada']);
const SKIP_FILES = new Set(['.env.example', 'check-hardcoded.mjs']);
const EXT = /\.(astro|ts|tsx|js|mjs|json)$/;

/** Съобщение за грешка, което ПОКАЗВА как се попълва ключът — адресът там е
 *  пример за човека, не стойност, която кодът ползва. */
const isHelpText = (line) => /^\s*'\s*(BASE_URL|CATALOG_BASE_URL|PORTAL_URL)=/.test(line);

const isEmail = (line, i) => /[\w.+-]+@[\w.-]*pdktuning\.com/.test(line.slice(Math.max(0, i - 40), i + 20));

const hits = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || SKIP_FILES.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.test(name)) continue;
    const rel = relative(root, p);
    // правните страници назовават източника нарочно
    if (rel.includes('privacy.astro')) continue;
    const text = readFileSync(p, 'utf8');
    const prose = proseLines(text);
    text.split('\n').forEach((line, n) => {
      const i = line.indexOf('pdktuning.com');
      if (i < 0 || prose.has(n) || isEmail(line, i) || isHelpText(line)) return;
      hits.push(`${rel}:${n + 1}  ${line.trim().slice(0, 100)}`);
    });
  }
})(join(root, 'src'));
for (const f of ['public/_worker.js', 'astro.config.mjs']) {
  const text = readFileSync(join(root, f), 'utf8');
  const prose = proseLines(text);
  text.split('\n').forEach((line, n) => {
    const i = line.indexOf('pdktuning.com');
    if (i < 0 || prose.has(n) || isEmail(line, i) || isHelpText(line)) return;
    hits.push(`${f}:${n + 1}  ${line.trim().slice(0, 100)}`);
  });
}

if (hits.length) {
  console.error(`\n✗ зашит домейн на ${hits.length} място(а) — адресите идват от .env.local:\n`);
  for (const h of hits) console.error('   ' + h);
  console.error('');
  process.exit(1);
}
console.log('✓ в кода няма зашит домейн — адресите идват от .env.local');
