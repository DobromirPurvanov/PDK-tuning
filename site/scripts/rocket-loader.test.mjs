import assert from 'node:assert/strict';
import test from 'node:test';
import { protectScripts } from './rocket-loader.mjs';

test('protects compiled modules without changing script contents or unrelated HTML', async () => {
  const body = 'const example = "<script src=example>";';
  const html = '<!doctype html><p data-label="<script>">Тунинг</p>'
    + '<script src="/picker.js?a=1&amp;b=2" type="module" crossorigin></script>'
    + `<script>${body}</script>`
    + '<script type="application/ld+json">{"name":"PDK"}</script>';
  const result = await protectScripts(html);
  assert.ok(result.startsWith('<!doctype html><p data-label="<script>">Тунинг</p>'));
  assert.match(result, /<script type="module" crossorigin data-cfasync="false" src="\/picker\.js\?a=1&amp;b=2"><\/script>/);
  assert.ok(result.includes(`<script data-cfasync="false">${body}</script>`));
  assert.ok(result.includes('<script type="application/ld+json" data-cfasync="false">{"name":"PDK"}</script>'));
  assert.equal(await protectScripts(result), result);
});
