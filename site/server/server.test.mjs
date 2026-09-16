import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { makeApp, MemoryCache } from './server.mjs';

test('VPS serves the new build and preserves catalogue and dealer sessions', async t => {
  const root = await mkdtemp(join(tmpdir(), 'pdk-runtime-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'index.html'), '<h1>New PDK</h1><a href="/uslugi/">Services</a><a href="/katalog/">Catalogue</a>');
  await writeFile(join(root, '404.html'), 'Real 404');
  await writeFile(join(root, 'marks.json'), '[{"slug":"bmw"}]');
  await writeFile(join(root, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: default-src self\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n');
  await mkdir(join(root, 'fonts'));
  await writeFile(join(root, 'fonts', 'test.woff2'), 'font');
  let upstreamOrigin;
  const upstream = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    res.setHeader('content-type', 'text/html');
    res.setHeader('set-cookie', ['PHPSESSID=test; Domain=127.0.0.1; Path=/; HttpOnly', 'second=yes; Path=/']);
    if (req.url === '/en/') res.end('<a href="/en/bmw">BMW</a>');
    else res.end(`<link rel="canonical" href="http://127.0.0.1:9100/bg/login"><form action="${upstreamOrigin}/bg/login"></form><p>${req.method}:${Buffer.concat(chunks)}:${req.headers.cookie || ''}</p>`);
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => upstream.close(resolve)));
  upstreamOrigin = `http://127.0.0.1:${upstream.address().port}`;
  const options = { DIST_DIR: root, BASE_URL: 'https://preview.example', CATALOG_BASE_URL: upstreamOrigin, SITE_RELEASE: 'test-release' };
  const app = await makeApp(options);
  const get = path => app(new Request('https://preview.example' + path));
  const home = await get('/');
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('location'), null);
  assert.equal(home.headers.get('x-pdk-site'), 'new-pdk');
  assert.match(await home.text(), /New PDK/);
  assert.match((await get('/api/health')).headers.get('x-pdk-release'), /test-release/);
  assert.equal((await (await get('/api/health')).json()).site, 'new-pdk');
  assert.equal((await get('/missing')).status, 404);
  for (const path of ['/_worker.js', '/_headers', '/.env', '/%2e%2e%2fpackage.json']) assert.equal((await get(path)).status, 404);
  assert.equal((await get('/fonts/test.woff2')).headers.get('content-type'), 'font/woff2');
  assert.match((await get('/fonts/test.woff2')).headers.get('cache-control'), /immutable/);
  assert.equal((await get('/bg/')).headers.get('location'), 'https://preview.example/');
  assert.equal((await get('/bg/bmw')).headers.get('location'), 'https://preview.example/katalog/bmw/');
  const live = await (await get('/live/brands')).json();
  assert.deepEqual(live.data, [{ slug: 'bmw', label: 'BMW' }]);
  const portal = await app(new Request('https://preview.example/bg/login', {
    method: 'POST', body: 'test-body', headers: { cookie: 'PHPSESSID=incoming' },
  }));
  assert.equal(portal.status, 200);
  assert.equal(portal.headers.getSetCookie().length, 2);
  assert.ok(portal.headers.getSetCookie().every(cookie => !/domain=/i.test(cookie)));
  const html = await portal.text();
  assert.match(html, /action="\/bg\/login"/);
  assert.match(html, /href="https:\/\/preview.example\/bg\/login"/);
  assert.match(html, /POST:test-body:PHPSESSID=incoming/);
  assert.equal(portal.headers.get('content-security-policy'), null);
  const invalid = await app(new Request('https://preview.example/api/contact', { method: 'POST', body: '{}' }));
  assert.equal(invalid.status, 400);
  await writeFile(join(root, 'index.html'), '<h1>Old catalogue</h1>');
  await assert.rejects(makeApp(options), /Expected the new site build/);
});

test('cache enforces expiry and memory limits', async () => {
  const cache = new MemoryCache(1, 10);
  const a = new Request('https://example.com/a'), b = new Request('https://example.com/b');
  const response = text => new Response(text, { headers: { 'cache-control': 'max-age=10' } });
  await cache.put(a, response('one'));
  assert.equal(await (await cache.match(a)).text(), 'one');
  await cache.put(b, response('two'));
  assert.equal(await cache.match(a), undefined);
  cache.entries.get(b.url).expires = 0;
  assert.equal(await cache.match(b), undefined);
  assert.equal(cache.bytes, 0);
  await cache.put(a, response('too large for cache'));
  assert.equal(await cache.match(a), undefined);
});
