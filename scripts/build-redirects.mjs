// Генерира docker/nginx/redirects.map: правилата от плана (стр. 14) + каталожните клонове без данни.
import { readFile, writeFile } from 'node:fs/promises';
const fixed = {
  '/bg/tuning': '/bg/tuning/chip-tuning', '/en/tuning': '/en/tuning/chip-tuning',
  '/bg/tuning/chip-tuning/what-is-chiptuning': '/bg/tuning/chip-tuning#kakvo-e', '/en/tuning/chip-tuning/what-is-chiptuning': '/en/tuning/chip-tuning#what-is',
  '/bg/tuning/chip-tuning/chiptuning-types': '/bg/tuning/chip-tuning#vidove', '/en/tuning/chip-tuning/chiptuning-types': '/en/tuning/chip-tuning#types',
  '/bg/tuning/chip-tuning/installation': '/bg/tuning/chip-tuning#montaj', '/en/tuning/chip-tuning/installation': '/en/tuning/chip-tuning#how',
  '/bg/tuning/chip-tuning/effect': '/bg/tuning/chip-tuning#efekt', '/en/tuning/chip-tuning/effect': '/en/tuning/chip-tuning#effect',
  '/bg/tuning/chip-tuning/risks': '/bg/tuning/chip-tuning#riskove', '/en/tuning/chip-tuning/risks': '/en/tuning/chip-tuning#risks',
  '/bg/tuning/chip-tuning/prices': '/bg/tseni', '/en/tuning/chip-tuning/prices': '/en/prices',
  '/bg/tuning/software-repair': '/bg/uslugi', '/en/tuning/software-repair': '/en/services',
  '/bg/tuning/software-repair/dpf-and-fap': '/bg/uslugi/dpf-fap', '/en/tuning/software-repair/dpf-and-fap': '/en/services/dpf-fap',
  '/bg/tuning/software-repair/egr-off-and-swirl-flaps': '/bg/uslugi/egr', '/en/tuning/software-repair/egr-off-and-swirl-flaps': '/en/services/egr',
  '/bg/tuning/software-repair/dtc-off': '/bg/uslugi/dtc', '/en/tuning/software-repair/dtc-off': '/en/services/dtc',
  '/bg/tuning/software-repair/v-max': '/bg/uslugi/v-max', '/en/tuning/software-repair/v-max': '/en/services/v-max',
  '/bg/tuning/software-repair/o2-lambda-off': '/bg/uslugi/lambda', '/en/tuning/software-repair/o2-lambda-off': '/en/services/lambda',
  '/bg/tuning/software-repair/maf-off-flow-meter': '/bg/uslugi/maf', '/en/tuning/software-repair/maf-off-flow-meter': '/en/services/maf',
};
const catalog = JSON.parse(await readFile(new URL('../src/data/redirects-catalog.json', import.meta.url), 'utf8'));
const lines = [];
for (const [from, to] of Object.entries(fixed)) lines.push(`"${from}" "${to}";`);
for (const [from, to] of Object.entries(catalog)) for (const l of ['bg', 'en']) lines.push(`"/${l}${from}" "/${l}${to === '/' ? '/' : to}";`);
await writeFile(new URL('../docker/nginx/redirects.map', import.meta.url), `# генерирано от scripts/build-redirects.mjs — не се пипа на ръка\n${lines.join('\n')}\n`);
console.log(`redirects: ${lines.length} (${Object.keys(fixed).length} fixed + ${Object.keys(catalog).length}×2 catalog)`);
