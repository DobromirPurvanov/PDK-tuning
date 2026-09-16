import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';
import { HTMLRewriter } from '@worker-tools/html-rewriter/base64';
import worker from '../public/_worker.js';

globalThis.HTMLRewriter = HTMLRewriter;

// The same Worker handles the catalogue, portal and forms on Pages and the VPS.
// Keep the cache bounded on the VPS, where there is no Cloudflare Cache API.
export class MemoryCache {
  entries = new Map();
  bytes = 0;
  constructor(maxEntries = 2000, maxBytes = 32 * 1024 * 1024) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
  }
  remove(key) {
    const entry = this.entries.get(key);
    if (entry) this.bytes -= entry.body.byteLength;
    this.entries.delete(key);
  }
  async match(request) {
    const entry = this.entries.get(request.url);
    if (!entry) return;
    if (entry.expires <= Date.now()) { this.remove(request.url); return; }
    return new Response(entry.body.slice(), { status: entry.status, headers: entry.headers });
  }
  async put(request, response) {
    const ttl = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1]);
    if (!ttl || request.method !== 'GET') return;
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength > this.maxBytes) return;
    this.remove(request.url);
    for (const [key, entry] of this.entries) if (entry.expires <= Date.now()) this.remove(key);
    while (this.entries.size >= this.maxEntries || this.bytes + body.byteLength > this.maxBytes) {
      this.remove(this.entries.keys().next().value);
    }
    this.entries.set(request.url, { body, status: response.status,
      headers: [...response.headers], expires: Date.now() + ttl * 1000 });
    this.bytes += body.byteLength;
  }
}
globalThis.caches = { default: new MemoryCache() };

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json' };

export function headerRules(text) {
  const rules = [];
  let rule;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (line.startsWith('/')) {
      const pattern = line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
      rule = { pattern: new RegExp(`^${pattern}$`), headers: [] };
      rules.push(rule);
    } else if (rule) {
      const value = line.trim();
      if (value.startsWith('! ')) rule.headers.push([value.slice(2), null]);
      else {
        const split = value.indexOf(':');
        if (split > 0) rule.headers.push([value.slice(0, split), value.slice(split + 1).trim()]);
      }
    }
  }
  return rules;
}

export async function makeApp(options = {}) {
  const env = { ...process.env, ...options };
  const root = resolve(env.DIST_DIR || new URL('../dist', import.meta.url).pathname);
  const origin = new URL(env.BASE_URL).origin;
  const catalog = env.CATALOG_BASE_URL || env.LEGACY_ORIGIN;
  if (!catalog || new URL(catalog).origin === origin) throw new Error('A separate CATALOG_BASE_URL is required');
  const rules = headerRules(await readFile(resolve(root, '_headers'), 'utf8'));
  // Fail before activation if this is missing or is accidentally the old build.
  const homepage = await readFile(resolve(root, 'index.html'), 'utf8');
  if (!homepage.includes('/uslugi/') || !homepage.includes('/katalog/')) throw new Error('Expected the new site build');

  const assets = async (request) => {
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url).pathname); }
    catch { return new Response('Bad path', { status: 400 }); }
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(p => p.startsWith('.') || p === '_worker.js' || p === '_headers' || p === '_redirects')) {
      return new Response('Not found', { status: 404 });
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) return new Response('Not found', { status: 404 });
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      if (!(await stat(file)).isFile()) throw new Error('Not a file');
    } catch { file = resolve(root, '404.html'); status = 404; }
    const headers = new Headers({ 'content-type': MIME[extname(file)] || 'application/octet-stream',
      'cache-control': 'public, max-age=0, must-revalidate' });
    for (const rule of rules) if (rule.pattern.test(pathname)) {
      for (const [name, value] of rule.headers) value === null ? headers.delete(name) : headers.set(name, value);
    }
    return new Response(request.method === 'HEAD' ? null : await readFile(file), { status, headers });
  };
  const bindings = { ...env, CATALOG_BASE_URL: catalog, ASSETS: { fetch: assets },
    CONTACT_TO: env.CONTACT_TO || env.MAIL_TO, CONTACT_FROM: env.CONTACT_FROM || env.MAIL_FROM };
  return async (request) => {
    const path = new URL(request.url).pathname;
    let response;
    if (path === '/__alive') response = new Response('ok\n');
    // Old browsers may have cached the previous site's permanent / -> /bg/
    // redirect. Serve the new homepage here too, avoiding a /bg/ -> / loop.
    else if (path === '/bg' || path === '/bg/') response = await assets(new Request(new URL('/', request.url), request));
    else if (path === '/api/health') response = Response.json({ ok: true, site: 'new-pdk',
      release: env.SITE_RELEASE || 'local', version: env.SITE_VERSION || 'local', base_url: origin, catalog_base_url: catalog,
      mail: Boolean(bindings.RESEND_API_KEY && bindings.CONTACT_TO && bindings.CONTACT_FROM) });
    else response = await worker.fetch(request, bindings, { waitUntil(promise) { promise.catch(console.error); } });
    // Clone immutable redirect responses before adding diagnostic headers.
    response = new Response(response.body, response);
    response.headers.set('x-pdk-site', 'new-pdk');
    response.headers.set('x-pdk-release', env.SITE_RELEASE || 'local');
    response.headers.set('x-pdk-version', env.SITE_VERSION || 'local');
    if (env.PUBLIC_INDEXABLE !== 'true') response.headers.set('x-robots-tag', 'noindex, nofollow');
    return response;
  };
}

export async function startServer(options = {}) {
  const env = { ...process.env, ...options };
  const app = await makeApp(env);
  const origin = new URL(env.BASE_URL).origin;
  const server = createServer({ requestTimeout: 120000 }, async (req, res) => {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && !['host', 'connection', 'transfer-encoding'].includes(key)) headers.set(key, String(value));
      }
      // Use the configured public origin: the existing front proxy sends Host: localhost.
      if (!headers.has('cf-connecting-ip')) headers.set('cf-connecting-ip', req.socket.remoteAddress || 'unknown');
      const init = { method: req.method, headers };
      if (!['GET', 'HEAD'].includes(req.method)) { init.body = Readable.toWeb(req); init.duplex = 'half'; }
      const response = await app(new Request(origin + req.url, init));
      res.statusCode = response.status;
      for (const [key, value] of response.headers) if (!['set-cookie', 'content-length', 'content-encoding', 'transfer-encoding'].includes(key)) res.setHeader(key, value);
      const cookies = response.headers.getSetCookie();
      if (cookies.length) res.setHeader('set-cookie', cookies);
      if (req.method === 'HEAD' || !response.body) res.end();
      else await pipeline(Readable.fromWeb(response.body), res);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) { res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Service unavailable'); }
      else res.destroy();
    }
  });
  await new Promise(resolve => server.listen(Number(env.PORT || 80), env.HOST || '0.0.0.0', resolve));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Both origins come from the same public file used by the Astro build.
  const settings = parseEnv(await readFile(new URL('../.env.local', import.meta.url), 'utf8'));
  for (const key of ['BASE_URL', 'CATALOG_BASE_URL']) {
    if (!settings[key]) throw new Error(`Missing ${key} in .env.local`);
    process.env[key] = settings[key];
  }
  if (process.argv.includes('--check')) { await makeApp(); console.log('New site build and runtime configuration OK'); }
  else {
    const server = await startServer();
    console.log(`New PDK site listening on ${server.address().port}`);
    process.on('SIGTERM', () => server.close());
  }
}
