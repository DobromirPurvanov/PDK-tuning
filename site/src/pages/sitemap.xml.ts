/**
 * The sitemap.
 *
 * Built from the SAME data the pages are built from: a hand-written list drifts
 * from the real addresses at the first added service.
 *
 * `lastmod` is the date of the FILE that produces the page, not "now". On the old
 * site the map was generated at request time and every crawl claimed that
 * all 5,586 addresses had just changed, which is how Google stops trusting it.
 *
 * 404 is deliberately not here.
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
