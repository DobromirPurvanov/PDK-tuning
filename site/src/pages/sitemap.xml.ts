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
import { pages, modified } from '../lib/sitemap';

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
