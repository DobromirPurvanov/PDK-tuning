import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from './rate-limiter.mjs';

function fixture(options = {}) {
  let time = 0;
  const limiter = createRateLimiter({ ...options, now: () => time });
  return { limiter, at(value) { time = value; } };
}

const ip = (n) => `10.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;

test('allows five attempts per address, then rejects the sixth', () => {
  const { limiter } = fixture();
  for (let i = 0; i < 5; i++) assert.equal(limiter.isLimited(ip(1)), false);
  assert.equal(limiter.isLimited(ip(1)), true);
  assert.equal(limiter.isLimited(ip(2)), false);
});

test('uses a sliding window and releases capacity exactly at expiration', () => {
  const { limiter, at } = fixture();
  limiter.isLimited(ip(1));
  at(1_000);
  for (let i = 0; i < 4; i++) limiter.isLimited(ip(1));
  at(3_599_999);
  assert.equal(limiter.isLimited(ip(1)), true);
  at(3_600_000);
  assert.equal(limiter.isLimited(ip(1)), false);
  assert.equal(limiter.isLimited(ip(1)), true);
  at(3_601_000);
  for (let i = 0; i < 4; i++) assert.equal(limiter.isLimited(ip(1)), false);
  assert.equal(limiter.isLimited(ip(1)), true);
});

test('sweep reclaims all expired addresses without new requests', () => {
  const { limiter, at } = fixture();
  for (let i = 0; i < 1_000; i++) limiter.isLimited(ip(i));
  at(3_600_000);
  limiter.sweep();
  assert.equal(limiter.size, 0);
});

test('refreshing one address does not prevent another from expiring', () => {
  const { limiter, at } = fixture();
  limiter.isLimited(ip(1));
  limiter.isLimited(ip(2));
  at(1_000);
  limiter.isLimited(ip(1));
  at(3_600_000);
  limiter.sweep();
  assert.equal(limiter.size, 1);
  at(3_601_000);
  limiter.sweep();
  assert.equal(limiter.size, 0);
});

test('rejected attempts do not keep an address alive', () => {
  const { limiter, at } = fixture();
  for (let i = 0; i < 5; i++) limiter.isLimited(ip(1));
  at(3_599_999);
  assert.equal(limiter.isLimited(ip(1)), true);
  at(3_600_000);
  limiter.sweep();
  assert.equal(limiter.size, 0);
});

test('100,000 different addresses cannot exceed the 10,000 entry cap', () => {
  const { limiter } = fixture();
  for (let i = 0; i < 100_000; i++) {
    assert.equal(limiter.isLimited(ip(i)), i >= 10_000);
  }
  assert.equal(limiter.size, 10_000);
});

test('a full map preserves active limits and recovers after expiration', () => {
  const { limiter, at } = fixture({ maxEntries: 2 });
  for (let i = 0; i < 5; i++) limiter.isLimited(ip(1));
  limiter.isLimited(ip(2));
  assert.equal(limiter.isLimited(ip(3)), true);
  assert.equal(limiter.isLimited(ip(1)), true);
  assert.equal(limiter.isLimited(ip(2)), false);
  at(3_600_000);
  assert.equal(limiter.isLimited(ip(3)), false);
  assert.equal(limiter.size, 1);
});

test('rejects arbitrary header keys while allowing IPv4 and IPv6', () => {
  const { limiter } = fixture();
  for (const key of ['', 'forged-address', 'x'.repeat(16_000), 'fe80::1%' + 'x'.repeat(16_000), null, 123]) {
    assert.equal(limiter.isLimited(key), true);
  }
  assert.equal(limiter.size, 0);
  for (const key of ['192.0.2.1', '2001:db8::1', '::ffff:192.0.2.1']) {
    assert.equal(limiter.isLimited(key), false);
  }
  assert.equal(limiter.size, 3);
});
