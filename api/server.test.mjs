import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Run the actual HTTP server with external services explicitly disabled.
test('HTTP contact requests are limited while health and invalid forms remain independent', { timeout: 15_000 }, async (t) => {
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('.', import.meta.url),
    env: { ...process.env, PORT: '0', RESEND_API_KEY: '', MAIL_TO: '', MAIL_CC: '', TURNSTILE_SECRET: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  });
  const port = await new Promise((resolve, reject) => {
    let output = '';
    child.once('error', reject);
    child.once('exit', (code) => reject(new Error(`API exited before startup: ${code}`)));
    child.stdout.on('data', (chunk) => {
      output += chunk;
      const match = output.match(/pdktuning api on :(\d+)/);
      if (match) resolve(Number(match[1]));
    });
    child.stderr.on('data', () => {});
  });
  const origin = `http://127.0.0.1:${port}`;
  async function post(ip, body = { name: 'Test', phone: '000', consent: 'yes' }) {
    const response = await fetch(`${origin}/api/contact`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }
  for (let i = 0; i < 6; i++) {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    assert.equal((await post('192.0.2.1', {})).status, 422);
  }
  for (let i = 0; i < 5; i++) {
    assert.deepEqual(await post('192.0.2.1'), { status: 503, body: { ok: false, error: 'not-configured' } });
  }
  assert.deepEqual(await post('192.0.2.1'), { status: 429, body: { ok: false, error: 'rate' } });
  assert.equal((await post('192.0.2.2')).status, 503);
  assert.equal((await post('not-an-ip')).status, 429);
});
