/**
 * Guards the rule "no hardcoded domain in the code".
 *
 * Addresses come from `.env.local` (`BASE_URL`, `CATALOG_BASE_URL`). A
 * hardcoded `pdktuning.com` in the middle of the code survives exactly until
 * the day of the switch and then points at the wrong place, silently, because
 * the page still opens.
 *
 * Run with `npm run check:urls`; exits 1 if it finds one.
 *
 * WHAT IS ALLOWED (and why):
 *   - comments and documentation: there the address EXPLAINS, it is not used;
 *   - email addresses (`office@pdktuning.com`): they are not a site address;
 *   - `.env.example`: that is exactly what it is for;
 *   - the text in the privacy policy: a legal obligation to name where the
 *     data is read from.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { proseLines } from './lib/prose.mjs';

const root = new URL('..', import.meta.url).pathname;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.wrangler', '.git', '.kaskada']);
const SKIP_FILES = new Set(['.env.example', 'check-hardcoded.mjs']);
const EXT = /\.(astro|ts|tsx|js|mjs|json)$/;

/** An error message that SHOWS how to fill in the key; the address there is
 *  an example for the human, not a value the code uses. */
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
    // the legal pages name the source on purpose
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
  console.error(`\n✗ hardcoded domain in ${hits.length} place(s) — addresses come from .env.local:\n`);
  for (const h of hits) console.error('   ' + h);
  console.error('');
  process.exit(1);
}
console.log('✓ no hardcoded domain in the code — addresses come from .env.local');
