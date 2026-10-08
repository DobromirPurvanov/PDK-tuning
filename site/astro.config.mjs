// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import rocketLoaderOptOut from './scripts/rocket-loader.mjs';

/**
 * ADDRESSES ARE READ FROM `.env.local`, NOT HARDCODED.
 *
 * Two keys control everything:
 *
 *   BASE_URL           where OUR site lives - canonicals, the sitemap and the schemas
 *   CATALOG_BASE_URL   where the catalog is read from and where the portal lives
 *
 * On a switch only the file changes. There is not a single hardcoded domain in the code;
 * if one comes back, `scripts/check-hardcoded.mjs` catches it.
 *
 * `loadEnv` is called manually because the values are needed in THREE places: here (for
 * `site`), in `src/config/site.ts` at build time, and in the migration scripts.
 * Vite loads `.env*` on its own only into `import.meta.env`, while `astro.config` and
 * the scripts read `process.env` - so it is copied over once, explicitly.
 *
 * WARNING: `import.meta.env.BASE_URL` is a RESERVED name in Vite and means the app's base
 * PATH ("/"), not the domain. So the value is read ONLY via
 * `process.env.BASE_URL`. If the two get mixed up, the canonical silently becomes "/".
 */
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
for (const [k, v] of Object.entries(env)) {
  // the real environment beats the file: this way Pages and a one-off
  // `BASE_URL=... npm run build` keep working
  if (process.env[k] === undefined) process.env[k] = v;
}

// The two origins have one source for both the VPS image and the build.
const origins = parseEnv(readFileSync(new URL('./.env.local', import.meta.url), 'utf8'));
for (const key of ['BASE_URL', 'CATALOG_BASE_URL']) {
  if (!origins[key]) throw new Error(`Missing ${key} in .env.local`);
  process.env[key] = origins[key];
}

/**
 * The order is: the real environment -> `.env.local` -> the old name `PUBLIC_SITE_URL`
 * (kept because `npm run build:stage1` and the notes use it).
 *
 * NO DEFAULT. Until now `https://www.pdktuning.com` was hardcoded here and
 * the build passed silently with an empty environment - with canonicals pointing at the OLD
 * site. Such a build looks successful and is exactly the mistake you only see once
 * Google has already crawled it. Better that it does not start.
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
  integrations: [rocketLoaderOptOut()],
  // Fully static output. Only _worker.js is dynamic, and it reads the live database
  // from the old site (see public/_worker.js). Nothing from the catalog is stored here.
  site,
  build: { format: 'directory', inlineStylesheets: 'always', assets: 'assets' },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              entryFileNames: 'assets/script.[hash].js',
              chunkFileNames: 'assets/chunk.[hash].js',
              assetFileNames: 'assets/[hash][extname]',
            },
          },
        },
      },
    },
    define: {
      // the values are also needed in the page code; they go in at build time, not into the browser
      'import.meta.env.PDK_BASE_URL': JSON.stringify(site),
      'import.meta.env.PDK_CATALOG_URL': JSON.stringify(
        process.env.CATALOG_BASE_URL || process.env.LEGACY_ORIGIN || '',
      ),
      // Optional: explicitly overrides the portal address. Empty means
      // CATALOG_BASE_URL/<lang>/login. See PORTAL in config/site.ts.
      'import.meta.env.PDK_PORTAL_URL': JSON.stringify(process.env.PORTAL_URL || ''),
    },
  },
});
