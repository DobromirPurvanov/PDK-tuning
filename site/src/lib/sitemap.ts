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

/** the file's date; if it is missing — today, but that should not happen */
export const modified = (file: string) => {
  try {
    return statSync(resolve(SRC_LIB, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export const pages: Page[] = [
  { path: '/', file: '../pages/index.astro', changefreq: 'weekly', priority: '1.0' },

  // the services
  { path: '/uslugi/', file: '../pages/uslugi/index.astro', changefreq: 'monthly', priority: '0.9' },
  ...SERVICES.map((s) => ({
    path: `/uslugi/${s.slug}/`,
    file: '../data/services.ts',
    changefreq: 'monthly',
    priority: '0.8',
  })),

  // the categories — at the root, because /bg and /en go to the old site
  ...CATEGORIES.map((c) => ({
    path: `/${c.slug}/`,
    file: '../data/categories.ts',
    changefreq: 'monthly',
    priority: '0.9',
  })),

  // the electric ones — /elektricheski/poracha/ and /elektricheski/blagodarim/ are
  // MISSING on purpose: they are order steps, carry `noindex` and have no place in the sitemap
  { path: '/elektricheski/', file: '../pages/elektricheski/index.astro', changefreq: 'weekly', priority: '0.9' },
  { path: '/pdk-flasher/', file: '../pages/pdk-flasher.astro', changefreq: 'monthly', priority: '0.8' },
  ...EV_MODELS.map((m) => ({
    path: m.href,
    file: '../data/ev.ts',
    changefreq: 'monthly',
    priority: '0.7',
  })),

  // the catalogue
  { path: '/katalog/', file: '../pages/katalog/index.astro', changefreq: 'weekly', priority: '0.9' },
  ...(marks as Mark[]).map((m) => ({
    path: `/katalog/${m.slug}/`,
    file: '../data/brand-notes.ts',
    changefreq: 'monthly',
    priority: '0.6',
  })),

  // the company pages
  { path: '/tseni/', file: '../pages/tseni.astro', changefreq: 'monthly', priority: '0.8' },
  { path: '/kak-rabotim/', file: '../pages/kak-rabotim.astro', changefreq: 'yearly', priority: '0.7' },
  { path: '/za-nas/', file: '../pages/za-nas.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/vaprosi/', file: '../pages/vaprosi.astro', changefreq: 'monthly', priority: '0.7' },
  { path: '/mit-fakt/', file: '../pages/mit-fakt.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/kontakti/', file: '../pages/kontakti.astro', changefreq: 'yearly', priority: '0.8' },
  { path: '/za-dileri/', file: '../pages/za-dileri.astro', changefreq: 'yearly', priority: '0.6' },

  // the articles
  { path: '/blog/', file: '../pages/blog/index.astro', changefreq: 'monthly', priority: '0.7' },
  ...ARTICLES.map((a) => ({
    path: `/blog/${a.slug}/`,
    file: '../data/articles.ts',
    changefreq: 'yearly',
    priority: '0.6',
  })),

  // the legal pages
  { path: '/privacy/', file: '../pages/privacy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms/', file: '../pages/terms.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/cookie-policy/', file: '../pages/cookie-policy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/otkaz-i-reklamacii/', file: '../pages/otkaz-i-reklamacii.astro', changefreq: 'yearly', priority: '0.3' },

  /* THE ENGLISH ONES. Included ONLY when `PUBLIC_EN=true` — until then the pages
     are built but carry `noindex` and the sitemap must not promise them. `ROUTES`
     knows which pairs exist on both sides, so the list here is not maintained a
     second time by hand. The makes catalogue is not in it: its English pages are
     on the OLD site and are in its sitemap. */
  ...(EN_LIVE
    ? ROUTES.map((r) => ({
        path: r.en,
        file: '../i18n/index.ts',
        changefreq: r.en === '/en/' ? 'weekly' : 'monthly',
        priority: r.en === '/en/' ? '1.0' : '0.7',
      }))
    : []),
];

