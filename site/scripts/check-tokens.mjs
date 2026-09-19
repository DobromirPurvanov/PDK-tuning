/**
 * Пази дизайн системата от разпадане.
 *
 * Преди `styles/tokens.css` в кода имаше 32 прозрачности на бялото, 15 на
 * зеленото, 9 почти-черни, 15 радиуса, 12 продължителности на прехода и 28
 * прага на media query — за едни и същи шест неща. Никой не го е решил така;
 * просто всеки нов файл е добавял по един нюанс, а нищо не е казвало „това вече
 * го има“.
 *
 * Този скрипт казва точно това. Пуска се с `npm run check:tokens` (и вътре в
 * `npm run check`); излиза с 1, ако намери.
 *
 * КОЕ Е ПОЗВОЛЕНО (и защо):
 *   - `styles/tokens.css` — той ДЕФИНИРА стойностите, там им е мястото;
 *   - коментари и документация — там стойността ОБЯСНЯВА, не боядисва;
 *   - `#000` и `#fff` вътре в `mask-image` / маскиращ градиент — маската не е
 *     цвят, а непрозрачност: там „черно“ значи „покажи“, а не оттенък;
 *   - `config/site.ts` и манифестът — те не са CSS; браузърът и Android четат
 *     `theme_color` като суров низ и `var()` там няма смисъл;
 *   - изброените поименно изключения долу.
 *
 * Изключенията СЕ ИЗБРОЯВАТ ПОИМЕННО. Общо правило („всичко в хирото е ок“)
 * би направило пазача декоративен още първия месец.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { proseLines } from './lib/prose.mjs';

const root = new URL('..', import.meta.url).pathname;
const SRC = join(root, 'src');
const SKIP_FILES = new Set(['tokens.css', 'site.ts']);
const EXT = /\.(astro|css)$/;

/** наборите — същите, които `tokens.css` дефинира */
const RADIUS = new Set(['var(--r-xs)', 'var(--r-s)', 'var(--r-m)', 'var(--r-pill)', '50%', '0']);
const TIME = new Set(['var(--t-fast)', 'var(--t)', 'var(--t-slow)']);
const BREAKPOINTS = new Set([419, 420, 559, 560, 619, 620, 700, 759, 760, 899, 900, 979, 980, 1060, 1179, 1180]);

/**
 * Поименните изключения: `файл: [причина за всяко]`.
 *
 * Композицията на хирото НЕ е системен цвят — тя е един кадър, нарисуван с CSS
 * върху видео, и стойностите ѝ значат „толкова тъмно на това място“, а не роля,
 * която се повтаря другаде.
 */
const ALLOW = [
  { file: 'pages/index.astro', match: /#0A1206|#111B08/, why: 'градиентът под хирото — композиция на кадъра, не роля' },
  { file: 'pages/index.astro', match: /#52FB09|#080808/, why: 'бранд таблото, цитирано в коментара на файла' },
  // Лентата на мощността НЕ реагира на посочване — тя се НАВЪРТА веднъж при
  // зареждане, от стоковото число до нашето. Затова е секунди, а не милисекунди:
  // числото трябва да се проследи с око. Това е анимация, вкарана в `transition`,
  // и няма нищо общо с отзивчивостта на интерфейса.
  { file: 'pages/index.astro', match: /transition:width 1\.7s/, why: 'навъртането на лентата на мощността' },
  { file: 'components/Picker.astro', match: /transition:width 1\.1s/, why: 'навъртането на лентата в избирача' },
  // `/stil` РИСУВА набора, като го обхожда: `var(${r})` не е стойност, а
  // променлива на цикъла, чиито членове са точно жетоните от набора.
  { file: 'pages/stil.astro', match: /border-radius:var\(\$\{r\}\)/, why: 'страницата показва самия набор' },
  // Отвореният списък на `<select>` се рисува от операционната система, не от
  // страницата. `--tint-2` е rgba(255,255,255,.06): зададен фон надвива
  // `color-scheme:dark`, ОС-ът рисува списъка БЯЛ, върху него ляга белият
  // `--white` и от тринайсетте услуги се вижда само маркираната. Тук трябва
  // ПЛЪТЕН цвят, а плътен цвят за това място в набора няма и не бива да има —
  // той не е повърхност на сайта, а единственото, което ОС-ът приема.
  { file: 'styles/form.css', match: /\.fld select option\{/, why: 'списъкът на select се рисува от ОС-а и иска плътен цвят' },
];

const hits = [];
function report(rel, n, line, what) {
  hits.push({ where: `${rel}:${n + 1}`, what, line: line.trim().slice(0, 96) });
}

/** маскиращите градиенти рисуват непрозрачност, не цвят */
const inMask = (line) => /mask-image|mask:/.test(line);

const allowed = (rel, line) => ALLOW.some((a) => a.file === rel && a.match.test(line));

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (SKIP_FILES.has(name) || !EXT.test(name)) continue;
    const rel = relative(SRC, p);
    const text = readFileSync(p, 'utf8');
    const prose = proseLines(text);

    text.split('\n').forEach((line, n) => {
      if (prose.has(n) || allowed(rel, line)) return;

      // ── гол цвят ───────────────────────────────────────────────────────────
      for (const m of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
        if (inMask(line) && /^#(000|fff)$/i.test(m[0])) continue;
        report(rel, n, line, `гол цвят ${m[0]} — вземи жетон от tokens.css`);
      }
      if (/\brgba?\(\s*\d/.test(line) && !inMask(line)) {
        report(rel, n, line, 'гол rgb/rgba — вземи жетон от tokens.css');
      }

      // ── радиус извън набора ────────────────────────────────────────────────
      // `var(--btn-r, var(--r-s))` е ЕДНА стойност с резерва, не две — затова
      // първо се вадят жетоните, а после се гледа дали всички са от набора.
      for (const m of line.matchAll(/border-radius:\s*([^;}]+)/g)) {
        const val = m[1].trim();
        const tokens = [...val.matchAll(/var\(\s*(--[\w-]+)/g)].map((t) => `var(${t[1]})`);
        const parts = tokens.length ? tokens : val.split(/\s+/);
        for (const part of parts) {
          // Локалната променлива на примитив (`--btn-r`) е позволена: тя е начин
          // компонентът да избере ОТ набора, а не да го заобиколи. Че наистина
          // избира от него, се пази от проверката на присвояванията по-долу.
          if (/^var\(--[\w-]+-r\)$/.test(part)) continue;
          if (!RADIUS.has(part)) report(rel, n, line, `радиус ${part} — наборът е r-xs / r-s / r-m / r-pill`);
        }
      }

      // всяко присвояване на локална радиус-променлива идва от набора
      for (const m of line.matchAll(/(--[\w-]+-r):\s*([^;}]+)/g)) {
        const v = m[2].trim();
        if (!RADIUS.has(v)) report(rel, n, line, `${m[1]} приема ${v} — трябва жетон от набора`);
      }

      // ── време на преход извън набора ───────────────────────────────────────
      for (const m of line.matchAll(/transition[a-z-]*:\s*([^;}]+)/g)) {
        for (const t of m[1].matchAll(/(?<![\w-])(\d*\.?\d+)(m?s)(?![\w-])/g)) {
          // `prefers-reduced-motion` гаси движението с почти нула — това не е
          // избор на темпо, а изключване, и няма жетон за „нищо“
          const ms = t[2] === 'ms' ? Number(t[1]) : Number(t[1]) * 1000;
          if (ms <= 10) continue;
          if (!TIME.has(t[0])) report(rel, n, line, `време ${t[0]} — наборът е t-fast / t / t-slow`);
        }
      }

      // ── праг извън набора ──────────────────────────────────────────────────
      for (const m of line.matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)) {
        const px = Number(m[1]);
        if (!BREAKPOINTS.has(px)) {
          report(rel, n, line, `праг ${px}px — наборът е 420 · 560 · 620 · 700 · 760 · 900 · 980 · 1060 · 1180`);
        }
      }
    });
  }
})(SRC);

if (hits.length) {
  console.error(`\n✗ ${hits.length} отклонения от дизайн системата (виж docs/DIZAYN.md):\n`);
  for (const h of hits) console.error(`   ${h.where}\n      ${h.what}\n      ${h.line}\n`);
  process.exit(1);
}
console.log('✓ дизайн системата е цяла — няма гол цвят, радиус, време или праг');
