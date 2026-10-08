/**
 * The page list behind both sitemaps (`/sitemap.xml` and `/sitemap.txt`).
 *
 * Built from the SAME data the pages are built from — a hand-written list drifts
 * from the real addresses with the first added service.
 *
 * `lastmod` is the date of the FILE that produces the page, not "now".
 * The 404 page is deliberately absent.
 */
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { SERVICES } from '../data/services';
import { CATEGORIES } from '../data/categories';
import { ARTICLES } from '../data/articles';
import { EV_MODELS } from '../data/ev';
import marks from '../data/marks.json';
import { EN_LIVE } from '../config/site';
import { ROUTES } from '../i18n';

type Mark = { slug: string };
export type Page = { path: string; file: string; changefreq: string; priority: string };

/* Paths are relative to src/lib/. They are resolved from the project root, not
   from `import.meta.url`: after bundling that points into dist/, nothing is
   found, and every lastmod silently became the build date. */
const SRC_LIB = resolve(process.cwd(), 'src/lib');

/** датата на файла; ако го няма — днес, но това не бива да се случва */
export const modified = (file: string) => {
  try {
    return statSync(resolve(SRC_LIB, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export const pages: Page[] = [
  { path: '/', file: '../pages/index.astro', changefreq: 'weekly', priority: '1.0' },

  // услугите
  { path: '/uslugi/', file: '../pages/uslugi/index.astro', changefreq: 'monthly', priority: '0.9' },
  ...SERVICES.map((s) => ({
    path: `/uslugi/${s.slug}/`,
    file: '../data/services.ts',
    changefreq: 'monthly',
    priority: '0.8',
  })),

  // категориите — корен, защото /bg и /en отиват на стария сайт
  ...CATEGORIES.map((c) => ({
    path: `/${c.slug}/`,
    file: '../data/categories.ts',
    changefreq: 'monthly',
    priority: '0.9',
  })),

  // електрическите — /elektricheski/poracha/ и /elektricheski/blagodarim/ нарочно
  // ЛИПСВАТ: те са стъпки от поръчката, носят `noindex` и нямат работа в картата
  { path: '/elektricheski/', file: '../pages/elektricheski/index.astro', changefreq: 'weekly', priority: '0.9' },
  { path: '/pdk-flasher/', file: '../pages/pdk-flasher.astro', changefreq: 'monthly', priority: '0.8' },
  ...EV_MODELS.map((m) => ({
    path: m.href,
    file: '../data/ev.ts',
    changefreq: 'monthly',
    priority: '0.7',
  })),

  // каталогът
  { path: '/katalog/', file: '../pages/katalog/index.astro', changefreq: 'weekly', priority: '0.9' },
  ...(marks as Mark[]).map((m) => ({
    path: `/katalog/${m.slug}/`,
    file: '../data/brand-notes.ts',
    changefreq: 'monthly',
    priority: '0.6',
  })),

  // фирмените
  { path: '/tseni/', file: '../pages/tseni.astro', changefreq: 'monthly', priority: '0.8' },
  { path: '/kak-rabotim/', file: '../pages/kak-rabotim.astro', changefreq: 'yearly', priority: '0.7' },
  { path: '/za-nas/', file: '../pages/za-nas.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/vaprosi/', file: '../pages/vaprosi.astro', changefreq: 'monthly', priority: '0.7' },
  { path: '/mit-fakt/', file: '../pages/mit-fakt.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/kontakti/', file: '../pages/kontakti.astro', changefreq: 'yearly', priority: '0.8' },
  { path: '/za-dileri/', file: '../pages/za-dileri.astro', changefreq: 'yearly', priority: '0.6' },

  // статиите
  { path: '/blog/', file: '../pages/blog/index.astro', changefreq: 'monthly', priority: '0.7' },
  ...ARTICLES.map((a) => ({
    path: `/blog/${a.slug}/`,
    file: '../data/articles.ts',
    changefreq: 'yearly',
    priority: '0.6',
  })),

  // правните
  { path: '/privacy/', file: '../pages/privacy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms/', file: '../pages/terms.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/cookie-policy/', file: '../pages/cookie-policy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/otkaz-i-reklamacii/', file: '../pages/otkaz-i-reklamacii.astro', changefreq: 'yearly', priority: '0.3' },

  /* АНГЛИЙСКИТЕ. Влизат САМО когато `PUBLIC_EN=true` — дотогава страниците се
     изграждат, но носят `noindex` и картата не бива да ги обещава. `ROUTES`
     знае кои двойки съществуват и от двете страни, затова списъкът тук не се
     поддържа втори път на ръка. Каталогът на марките не е в него: неговите
     английски страници са на СТАРИЯ сайт и са в тяхната карта. */
  ...(EN_LIVE
    ? ROUTES.map((r) => ({
        path: r.en,
        file: '../i18n/index.ts',
        changefreq: r.en === '/en/' ? 'weekly' : 'monthly',
        priority: r.en === '/en/' ? '1.0' : '0.7',
      }))
    : []),
];

