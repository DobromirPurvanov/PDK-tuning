/**
 * THE BRAND SLUGS: for the worker, not for people.
 *
 * WHY IT EXISTS. `public/_worker.js` redirects `/bg/<brand>` to
 * `/katalog/<brand>/` and for that it must know which are our 110 brands. It is
 * plain JavaScript in the Pages file system and cannot import
 * `src/data/marks.json`. The second option, a list copied into the worker, would
 * drift from the data at the first added brand and nobody would
 * notice, because the drift looks like "it just does not redirect".
 *
 * The same approach as `ev-prices.json.ts`: the build exports, the worker reads through
 * `ASSETS`. One source.
 *
 * It is not in the sitemap and carries nothing that cannot be seen at
 * `/katalog/`.
 */
import type { APIRoute } from 'astro';
import marks from '../data/marks.json';

type Mark = { slug: string; name: string };

export const GET: APIRoute = () =>
  new Response(JSON.stringify((marks as Mark[]).map((m) => ({ slug: m.slug, name: m.name }))), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
