/**
 * Keeps the design system from falling apart.
 *
 * Before `styles/tokens.css` the code had 32 white opacities, 15 green ones, 9
 * near-blacks, 15 radii, 12 transition durations and 28 media query
 * breakpoints, for the same six things. Nobody decided it that way; every new
 * file just added one more shade, and nothing said "this already exists".
 *
 * This script says exactly that. Run with `npm run check:tokens` (and inside
 * `npm run check`); exits 1 if it finds one.
 *
 * WHAT IS ALLOWED (and why):
 *   - `styles/tokens.css`: it DEFINES the values, that is where they belong;
 *   - comments and documentation: there the value EXPLAINS, it does not paint;
 *   - `#000` and `#fff` inside `mask-image` / a masking gradient: a mask is not
 *     a colour but an opacity: there "black" means "show", not a shade;
 *   - `config/site.ts` and the manifest: they are not CSS; the browser and
 *     Android read `theme_color` as a raw string and `var()` makes no sense
 *     there;
 *   - the exceptions listed by name below.
 *
 * Exceptions ARE LISTED BY NAME. A general rule ("everything in the hero is
 * fine") would make the guard decorative within the first month.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { proseLines } from './lib/prose.mjs';

const root = new URL('..', import.meta.url).pathname;
const SRC = join(root, 'src');
const SKIP_FILES = new Set(['tokens.css', 'site.ts']);
const EXT = /\.(astro|css)$/;

/** the sets, the same ones `tokens.css` defines */
const RADIUS = new Set(['var(--r-xs)', 'var(--r-s)', 'var(--r-m)', 'var(--r-pill)', '50%', '0']);
const TIME = new Set(['var(--t-fast)', 'var(--t)', 'var(--t-slow)']);
const BREAKPOINTS = new Set([419, 420, 559, 560, 619, 620, 700, 759, 760, 899, 900, 979, 980, 1060, 1179, 1180]);

/**
 * Named exceptions: `file: [reason for each]`.
 *
 * The hero composition is NOT a system colour. It is a single frame, painted
 * with CSS over a video, and its values mean "this dark at this spot", not a
 * role that repeats elsewhere.
 */
const ALLOW = [
  { file: 'components/HomeShell.astro', match: /#0A1206|#111B08/, why: 'the gradient under the hero — frame composition, not a role' },
  { file: 'pages/index.astro', match: /#52FB09|#080808/, why: 'the brand board, quoted in the file comment' },
  // The power bar does NOT react to hover. It RUNS UP once on load, from the
  // stock number to ours. That is why it is seconds, not milliseconds: the
  // number has to be followed by eye. This is an animation put into `transition`,
  // and has nothing to do with the responsiveness of the interface.
  { file: 'components/HomeShell.astro', match: /transition:width 1\.7s/, why: 'the power bar fill animation' },
  { file: 'components/Picker.astro', match: /transition:width 1\.1s/, why: 'the bar fill animation in the picker' },
  // `/stil` DRAWS the set by walking it: `var(${r})` is not a value but a
  // loop variable whose members are exactly the tokens of the set.
  { file: 'pages/stil.astro', match: /border-radius:var\(\$\{r\}\)/, why: 'the page displays the scale itself' },
  // The open `<select>` list is drawn by the operating system, not by the page.
  // `--tint-2` is rgba(255,255,255,.06): a set background beats
  // `color-scheme:dark`, the OS draws the list WHITE, the white `--white` lands on
  // it and of the thirteen services only the highlighted one is visible. A
  // SOLID colour is needed here, and there is no solid colour for this spot in the set and there should not be:
  // it is not a surface of the site but the only thing the OS accepts.
  { file: 'styles/form.css', match: /\.fld select option\{/, why: 'the select dropdown is drawn by the OS and needs a solid color' },
];

const hits = [];
function report(rel, n, line, what) {
  hits.push({ where: `${rel}:${n + 1}`, what, line: line.trim().slice(0, 96) });
}

/** masking gradients paint opacity, not colour */
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

      // ── bare colour ───────────────────────────────────────────────────────
      for (const m of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
        if (inMask(line) && /^#(000|fff)$/i.test(m[0])) continue;
        report(rel, n, line, `bare color ${m[0]} — use a token from tokens.css`);
      }
      if (/\brgba?\(\s*\d/.test(line) && !inMask(line)) {
        report(rel, n, line, 'bare rgb/rgba — use a token from tokens.css');
      }

      // ── radius outside the set ─────────────────────────────────────────────
      // `var(--btn-r, var(--r-s))` is ONE value with a fallback, not two, so
      // the tokens are extracted first and then it checks whether all are from the set.
      for (const m of line.matchAll(/border-radius:\s*([^;}]+)/g)) {
        const val = m[1].trim();
        const tokens = [...val.matchAll(/var\(\s*(--[\w-]+)/g)].map((t) => `var(${t[1]})`);
        const parts = tokens.length ? tokens : val.split(/\s+/);
        for (const part of parts) {
          // A primitive's local variable (`--btn-r`) is allowed: it is a way for the
          // component to choose FROM the set, not to bypass it. That it really
          // chooses from it is guarded by the assignment check below.
          if (/^var\(--[\w-]+-r\)$/.test(part)) continue;
          if (!RADIUS.has(part)) report(rel, n, line, `radius ${part} — the scale is r-xs / r-s / r-m / r-pill`);
        }
      }

      // every assignment of a local radius variable comes from the set
      for (const m of line.matchAll(/(--[\w-]+-r):\s*([^;}]+)/g)) {
        const v = m[2].trim();
        if (!RADIUS.has(v)) report(rel, n, line, `${m[1]} gets ${v} — needs a token from the scale`);
      }

      // ── transition time outside the set ────────────────────────────────────
      for (const m of line.matchAll(/transition[a-z-]*:\s*([^;}]+)/g)) {
        for (const t of m[1].matchAll(/(?<![\w-])(\d*\.?\d+)(m?s)(?![\w-])/g)) {
          // `prefers-reduced-motion` switches motion off with almost zero. That is not
          // a choice of tempo but a shutdown, and there is no token for "nothing"
          const ms = t[2] === 'ms' ? Number(t[1]) : Number(t[1]) * 1000;
          if (ms <= 10) continue;
          if (!TIME.has(t[0])) report(rel, n, line, `duration ${t[0]} — the scale is t-fast / t / t-slow`);
        }
      }

      // ── breakpoint outside the set ─────────────────────────────────────────
      for (const m of line.matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)) {
        const px = Number(m[1]);
        if (!BREAKPOINTS.has(px)) {
          report(rel, n, line, `breakpoint ${px}px — the scale is 420 · 560 · 620 · 700 · 760 · 900 · 980 · 1060 · 1180`);
        }
      }
    });
  }
})(SRC);

if (hits.length) {
  console.error(`\n✗ ${hits.length} deviation(s) from the design system (see docs/DESIGN.md):\n`);
  for (const h of hits) console.error(`   ${h.where}\n      ${h.what}\n      ${h.line}\n`);
  process.exit(1);
}
console.log('✓ design system intact — no bare color, radius, duration or breakpoint');
