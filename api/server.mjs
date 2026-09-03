// Формата (план, стр. 32): писмо до вас + копие до втори адрес, Turnstile, 5 изпращания на час от адрес.
// Без ключ за Resend заявката се записва в лога и връща 503 — формата показва телефона.
import http from 'node:http';

const PORT = Number(process.env.PORT || 3000);
const RESEND = process.env.RESEND_API_KEY || '';
const TO = (process.env.MAIL_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
const CC = (process.env.MAIL_CC || '').split(',').map((s) => s.trim()).filter(Boolean);
const FROM = process.env.MAIL_FROM || 'PDK Tuning <noreply@pdktuning.com>';
const TURNSTILE = process.env.TURNSTILE_SECRET || '';
const hits = new Map(); // ip → [timestamps]
const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clean = (s, n) => String(s ?? '').replace(/[\x00-\x09\x0b-\x1f\x7f]+/g, ' ').trim().slice(0, n);

function rateLimited(ip) {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (arr.length >= 5) return true; arr.push(now); hits.set(ip, arr); return false;
}
async function verifyTurnstile(token, ip) {
  if (!TURNSTILE) return true;
  if (!token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret: TURNSTILE, response: token, remoteip: ip }) });
  const j = await r.json().catch(() => ({})); return !!j.success;
}
async function send(subject, html, replyTo) {
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${RESEND}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: FROM, to: TO, cc: CC.length ? CC : undefined, reply_to: replyTo || undefined, subject, html }) });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
}

const server = http.createServer(async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, mail: !!RESEND && TO.length > 0, turnstile: !!TURNSTILE });
  if (req.method !== 'POST' || req.url !== '/api/contact') return json(res, 404, { ok: false });
  let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 20_000) { return json(res, 413, { ok: false }); } }
  let b; try { b = JSON.parse(raw || '{}'); } catch { return json(res, 400, { ok: false, error: 'json' }); }
  const name = clean(b.name, 120), phone = clean(b.phone, 40), email = clean(b.email, 160), car = clean(b.car, 160), service = clean(b.service, 40), message = clean(b.message, 2000), page = clean(b.page, 200), lang = /^\/en/.test(page) ? 'en' : 'bg';
  if (!name || !phone || b.consent !== 'yes') return json(res, 422, { ok: false, error: 'fields' });
  if (rateLimited(ip)) return json(res, 429, { ok: false, error: 'rate' });
  if (!(await verifyTurnstile(b['cf-turnstile-response'], ip))) return json(res, 403, { ok: false, error: 'turnstile' });
  const subject = `Заявка · ${[car, service].filter(Boolean).join(' · ') || name}`;
  const html = `<h2>${esc(subject)}</h2><table cellpadding="6" style="font:14px system-ui"><tr><td><b>Име</b></td><td>${esc(name)}</td></tr><tr><td><b>Телефон</b></td><td><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr><tr><td><b>Имейл</b></td><td>${esc(email) || '—'}</td></tr><tr><td><b>Кола</b></td><td>${esc(car) || '—'}</td></tr><tr><td><b>Услуга</b></td><td>${esc(service) || '—'}</td></tr><tr><td><b>Съобщение</b></td><td>${esc(message).replace(/\n/g, '<br>') || '—'}</td></tr><tr><td><b>Страница</b></td><td>https://www.pdktuning.com${esc(page)}</td></tr><tr><td><b>Език</b></td><td>${lang}</td></tr><tr><td><b>IP</b></td><td>${esc(ip)}</td></tr></table>`;
  console.log(JSON.stringify({ t: new Date().toISOString(), ip, name, phone, email, car, service, page, message: message.slice(0, 200) }));
  if (!RESEND || TO.length === 0) return json(res, 503, { ok: false, error: 'not-configured' });
  try { await send(subject, html, email || undefined); return json(res, 200, { ok: true }); }
  catch (e) { console.error(e.message); return json(res, 502, { ok: false, error: 'mail' }); }
});
server.listen(PORT, () => console.log(`pdktuning api on :${PORT} (mail ${RESEND && TO.length ? 'on' : 'OFF'}, turnstile ${TURNSTILE ? 'on' : 'off'})`));
