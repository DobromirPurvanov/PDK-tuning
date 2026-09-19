/**
 * Картата на сайта.
 *
 * Строи се от СЪЩИТЕ данни, от които се строят и страниците — списък, писан на
 * ръка, се разминава с истинските адреси още при първата добавена услуга.
 *
 * `lastmod` е датата на ФАЙЛА, който поражда страницата, а не „сега“. На стария
 * сайт картата се генерираше в момента на заявката и всеки обход твърдеше, че
 * целите 5 586 адреса са сменени току-що — така Google престава да ѝ вярва.
 *
 * 404 нарочно не е тук.
 */
import type { APIRoute } from 'astro';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SERVICES } from '../data/services';
import { CATEGORIES } from '../data/categories';
import { ARTICLES } from '../data/articles';
import { EV_MODELS } from '../data/ev';
import marks from '../data/marks.json';
import { EN_LIVE } from '../config/site';
import { ROUTES } from '../i18n';

type Mark = { slug: string };
type Page = { path: string; file: string; changefreq: string; priority: string };

/** датата на файла; ако го няма — днес, но това не бива да се случва */
const modified = (file: string) => {
  try {
    return statSync(fileURLToPath(new URL(file, import.meta.url))).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const pages: Page[] = [
  { path: '/', file: 'index.astro', changefreq: 'weekly', priority: '1.0' },

  // услугите
  { path: '/uslugi/', file: 'uslugi/index.astro', changefreq: 'monthly', priority: '0.9' },
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
  { path: '/elektricheski/', file: 'elektricheski/index.astro', changefreq: 'weekly', priority: '0.9' },
  { path: '/pdk-flasher/', file: 'pdk-flasher.astro', changefreq: 'monthly', priority: '0.8' },
  ...EV_MODELS.map((m) => ({
    path: m.href,
    file: '../data/ev.ts',
    changefreq: 'monthly',
    priority: '0.7',
  })),

  // каталогът
  { path: '/katalog/', file: 'katalog/index.astro', changefreq: 'weekly', priority: '0.9' },
  ...(marks as Mark[]).map((m) => ({
    path: `/katalog/${m.slug}/`,
    file: '../data/brand-notes.ts',
    changefreq: 'monthly',
    priority: '0.6',
  })),

  // фирмените
  { path: '/tseni/', file: 'tseni.astro', changefreq: 'monthly', priority: '0.8' },
  { path: '/kak-rabotim/', file: 'kak-rabotim.astro', changefreq: 'yearly', priority: '0.7' },
  { path: '/za-nas/', file: 'za-nas.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/vaprosi/', file: 'vaprosi.astro', changefreq: 'monthly', priority: '0.7' },
  { path: '/mit-fakt/', file: 'mit-fakt.astro', changefreq: 'yearly', priority: '0.6' },
  { path: '/kontakti/', file: 'kontakti.astro', changefreq: 'yearly', priority: '0.8' },
  { path: '/za-dileri/', file: 'za-dileri.astro', changefreq: 'yearly', priority: '0.6' },

  // статиите
  { path: '/blog/', file: 'blog/index.astro', changefreq: 'monthly', priority: '0.7' },
  ...ARTICLES.map((a) => ({
    path: `/blog/${a.slug}/`,
    file: '../data/articles.ts',
    changefreq: 'yearly',
    priority: '0.6',
  })),

  // правните
  { path: '/privacy/', file: 'privacy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms/', file: 'terms.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/cookie-policy/', file: 'cookie-policy.astro', changefreq: 'yearly', priority: '0.3' },
  { path: '/otkaz-i-reklamacii/', file: 'otkaz-i-reklamacii.astro', changefreq: 'yearly', priority: '0.3' },

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

export const GET: APIRoute = ({ site }) => {
  const base = String(site).replace(/\/$/, '');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url>
    <loc>${base}${p.path}</loc>
    <lastmod>${modified(p.file)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
