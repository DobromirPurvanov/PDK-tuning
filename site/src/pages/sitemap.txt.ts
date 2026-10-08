/**
 * The same sitemap as plain text — one absolute URL per line, as Google accepts.
 *
 * Exists because the client's Cloudflare zone challenges `.xml` requests coming
 * from Google's network ("Just a moment…", 403), while `.txt` passes. Until their
 * IT lifts the challenge, this is the copy Google can actually read. Both files
 * come from the same list in `lib/sitemap`, so they cannot drift apart.
 */
import type { APIRoute } from 'astro';
import { pages } from '../lib/sitemap';

export const GET: APIRoute = ({ site }) => {
  const base = String(site).replace(/\/$/, '');
  return new Response(pages.map((p) => `${base}${p.path}`).join('\n') + '\n', {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
