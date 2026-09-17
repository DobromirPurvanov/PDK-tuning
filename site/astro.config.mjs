// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

/**
 * АДРЕСИТЕ СЕ ЧЕТАТ ОТ `.env.local`, НЕ СЕ ЗАШИВАТ.
 *
 * Два ключа управляват всичко:
 *
 *   BASE_URL           къде стои НАШИЯТ сайт — канониклите, картата и схемите
 *   CATALOG_BASE_URL   откъде се чете каталогът и къде живее порталът
 *
 * При превключването се сменя само файлът. В кода няма нито един зашит домейн;
 * ако някой се върне, `scripts/check-hardcoded.mjs` го хваща.
 *
 * `loadEnv` се вика ръчно, защото стойностите трябват на ТРИ места: тук (за
 * `site`), в `src/config/site.ts` при билда и в скриптовете за миграция.
 * Vite сам зарежда `.env*` само в `import.meta.env`, а `astro.config` и
 * скриптовете четат `process.env` — затова се прехвърля веднъж, изрично.
 *
 * ВНИМАНИЕ: `import.meta.env.BASE_URL` е ЗАПАЗЕНО име във Vite и значи базовия
 * ПЪТ на приложението („/“), не домейна. Затова стойността се чете САМО през
 * `process.env.BASE_URL`. Объркат ли се двете, каноникълът тихо става „/“.
 */
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
for (const [k, v] of Object.entries(env)) {
  // истинската среда бие файла: така Pages и еднократното
  // `BASE_URL=… npm run build` продължават да работят
  if (process.env[k] === undefined) process.env[k] = v;
}

// The two origins have one source for both the VPS image and the build.
const origins = parseEnv(readFileSync(new URL('./.env.local', import.meta.url), 'utf8'));
for (const key of ['BASE_URL', 'CATALOG_BASE_URL']) {
  if (!origins[key]) throw new Error(`Missing ${key} in .env.local`);
  process.env[key] = origins[key];
}

/**
 * Редът е: истинската среда → `.env.local` → старото име `PUBLIC_SITE_URL`
 * (пазено, защото `npm run build:etap1` и записките го ползват).
 *
 * НЯМА ПОДРАЗБИРАНЕ. Дотук тук стоеше зашито `https://www.pdktuning.com` и
 * билдът минаваше мълчаливо при празна среда — с каноникли, които сочат СТАРИЯ
 * сайт. Такъв билд изглежда успешен и е точно грешката, която се вижда чак
 * когато Google вече я е обходил. По-добре да не тръгне.
 */
const site = process.env.BASE_URL || process.env.PUBLIC_SITE_URL;
if (!site) {
  throw new Error(
    'Липсва BASE_URL.\n' +
    '  Адресът на сайта се чете от .env.local и НЕ е зашит в кода.\n' +
    '  Копирай .env.example като .env.local и попълни:\n' +
    '    BASE_URL=https://www.pdktuning.com          (етап 2)\n' +
    '    BASE_URL=https://new.pdktuning.com          (етап 1)\n' +
    '  В Cloudflare Pages същият ключ се задава в настройките на проекта.',
  );
}

export default defineConfig({
  // Изцяло статичен изход. Динамичното е само _worker.js, който чете живата база
  // от стария сайт (виж public/_worker.js). Нищо от каталога не се пази тук.
  site,
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    define: {
      // стойностите трябват и в кода на страниците; влизат при билда, не в браузъра
      'import.meta.env.PDK_BASE_URL': JSON.stringify(site),
      'import.meta.env.PDK_CATALOG_URL': JSON.stringify(
        process.env.CATALOG_BASE_URL || process.env.LEGACY_ORIGIN || '',
      ),
      // По избор: изрично пренаписва адреса на портала. Празно означава
      // CATALOG_BASE_URL/<lang>/login. Виж PORTAL в config/site.ts.
      'import.meta.env.PDK_PORTAL_URL': JSON.stringify(process.env.PORTAL_URL || ''),
    },
  },
});
