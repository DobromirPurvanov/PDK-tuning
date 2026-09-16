// An HTTP 200 from the old site is not a successful deployment.
const origin = process.argv[2] || 'http://127.0.0.1:8000';
const home = await fetch(origin + '/', { redirect: 'manual' });
if (home.status !== 200 || home.headers.get('x-pdk-site') !== 'new-pdk') throw new Error('Not the new PDK homepage');
const html = await home.text();
if (!html.includes('/uslugi/') || !html.includes('/katalog/')) throw new Error('Wrong homepage content');
const health = await (await fetch(origin + '/api/health')).json();
if (health.site !== 'new-pdk') throw new Error('Wrong site runtime');
console.log(`New PDK homepage verified, release ${health.release}`);
