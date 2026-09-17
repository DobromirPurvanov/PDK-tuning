/**
 * robots.txt се ГЕНЕРИРА, а не се пише на ръка в public/.
 *
 * Старият файл сочеше картата на ДРУГ сайт (www.pdktuning.com) и забраняваше
 * пътища, които тук изобщо не съществуват — тоест лъжеше и в двете посоки.
 *
 * Докато `PUBLIC_INDEXABLE` не е `true`, обхождането е ЗАТВОРЕНО: макетът и
 * истинският сайт не бива да се бият за едни и същи думи.
 */
import type { APIRoute } from 'astro';
import { INDEXABLE } from '../config/site';

export const GET: APIRoute = ({ site }) => {
  const base = String(site).replace(/\/$/, '');

  const body = INDEXABLE
    ? `User-agent: *
Allow: /
# служебните адреси нямат работа в индекса
Disallow: /api/
Disallow: /api/live/

Sitemap: ${base}/sitemap.xml
`
    : `# Работен макет за одобрение — не се индексира.
# Отваря се с PUBLIC_INDEXABLE=true при пускането на истинския домейн.
User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
