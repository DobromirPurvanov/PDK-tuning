import type { APIRoute } from 'astro';
import { LANGS, type Lang } from '@/i18n';
import { allCatalogPaths } from '@/lib/catalog';
import { PAGES } from '@/data/pages';
import { SITE } from '@/lib/seo';
import { CHUNK } from './sitemap-index.xml';
type Entry = { path: string; lastmod: string };
function entries(lang: Lang, level: string): Entry[] {
  const c = allCatalogPaths(lang);
  if (level === 'pages') return PAGES.map((p) => ({ path: p.path[lang], lastmod: p.updated }));
  if (level === 'brands') return c.brands; if (level === 'models') return c.models; if (level === 'generations') return c.generations;
  const m = level.match(/^engines-(\d+)$/); if (m) { const i = Number(m[1]) - 1; return c.engines.slice(i * CHUNK, (i + 1) * CHUNK); }
  return [];
}
export function getStaticPaths() {
  return LANGS.flatMap((lang) => { const c = allCatalogPaths(lang); const levels = ['pages', 'brands', 'models', 'generations', ...Array.from({ length: Math.ceil(c.engines.length / CHUNK) }, (_, i) => `engines-${i + 1}`)]; return levels.map((level) => ({ params: { lang, level } })); });
}
export const GET: APIRoute = ({ params }) => {
  const list = entries(params.lang as Lang, params.level as string);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map((e) => `<url><loc>${SITE}${e.path}</loc><lastmod>${e.lastmod}</lastmod></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
