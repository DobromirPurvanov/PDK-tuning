#!/usr/bin/env node
/**
 * Writes the picker's fallback catalogue to public/catalog/<brand>.json.
 *
 * The picker reads the old site live (/api/live/* in public/_worker.js). When
 * that read fails, the worker answers from these files instead, so the brand,
 * model, year and engine columns never come up empty.
 *
 * Source: the parsed catalogue kept in git (src/data/catalog/*.json on the
 * branch below, harvested 2026-09-01). Slugs are the old site's own, so a
 * fallback answer and a live answer are interchangeable for the browser.
 *
 *   node scripts/catalog-snapshot.mjs [git-ref]
 *
 * File shape (kept short; 110 files are shipped with every build):
 *   { "m": [[modelSlug, modelName, [[genSlug, from, to, [[path, name, hp0, hp1, nm0, nm1], …]], …]], …] }
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ref = process.argv[2] || 'origin/feat/first-web-version';
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(site, 'public/catalog');
const marks = JSON.parse(readFileSync(resolve(site, 'src/data/marks.json'), 'utf8'));

const show = (path) => execFileSync('git', ['show', `${ref}:${path}`], { cwd: site, maxBuffer: 64 << 20 }).toString();

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let engines = 0, bytes = 0;
const missing = [];
for (const { slug } of marks) {
  let brand;
  try { brand = JSON.parse(show(`src/data/catalog/${slug}.json`)); }
  catch { missing.push(slug); continue; }
  const m = brand.models.map((model) => [model.slug, model.name, model.generations.map((g) => [
    g.slug, g.from, g.to,
    g.engines.map((e) => { engines++; return [e.path, e.name, e.hpStock, e.hpTuned, e.nmStock, e.nmTuned]; }),
  ])]);
  const body = JSON.stringify({ m });
  bytes += body.length;
  writeFileSync(resolve(out, `${slug}.json`), body);
}

console.log(`${marks.length - missing.length} brands, ${engines} engines, ${(bytes / 1024).toFixed(0)} KB → public/catalog/`);
if (missing.length) {
  console.error(`No snapshot for: ${missing.join(', ')}`);
  process.exit(1);
}
