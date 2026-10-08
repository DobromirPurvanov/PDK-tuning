/**
 * robots.txt is GENERATED, not written by hand in public/.
 *
 * The old file pointed to the sitemap of ANOTHER site (www.pdktuning.com) and disallowed
 * paths that do not exist here at all, so it lied in both directions.
 *
 * Until `PUBLIC_INDEXABLE` is `true`, crawling is CLOSED: the mockup and the
 * real site must not fight over the same words.
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
Sitemap: ${base}/sitemap.txt
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
