# The new PDK Tuning site

This is the only frontend in the repository. The old site in the root has been removed.
A `v*` tag builds this directory and uploads it directly to the VPS. The home page
is not forwarded to Cloudflare Pages. See the [main README](../README.md).

`server/server.mjs` adds a Node.js environment for the existing Worker: local assets,
a size-limited cache, HTMLRewriter and HTTP serving. The catalog and the portal
stay on the separate server set through `CATALOG_BASE_URL`.

Cloudflare Pages is an additional hosting option with the same Worker.

---

## What this site does

183 pages: home, services, prices, a catalog of 110 brands, electric
cars, articles, legal pages. Plus a dynamic layer in `public/_worker.js`
(a Cloudflare Worker) that does four things:

1. **Reads the catalog live** from the old site (`/live/*`). The database is NOT migrated and
   NOT copied; the old site remains its only keeper.
2. **Proxies their paths**: `/bg`, `/en`, the dealer portal,
   static files. With the same method, headers and body, so that the ~5,500
   indexed addresses and the partners' login do not break.
3. **Redirects 117 old addresses** to their new successors.
4. **The form and the checkout**: Resend and Stripe.

On the VPS `server/server.mjs` provides the compatible environment for the same worker,
without duplicating the logic for the catalog, the portal and the forms.

---

## One file for the addresses

`.env.local` contains only the public configuration:

```dotenv
CATALOG_BASE_URL=https://files.pdktuning.com
BASE_URL=https://www.pdktuning.com
```

Astro and the VPS runtime read exactly this file. It goes into the image and is versioned
together with the code. Secrets stay in the server environment, not in this file.

```sh
npm ci
npm run check
npm run build
PORT=8000 node server/server.mjs
```

A `v*` tag from the root publishes the same build to the VPS. `build:stage1` is kept only
as a compatible alias of `build` and no longer replaces the addresses with other values.

### Status (16.09.2026)

The VPS already builds and serves this site directly. The DNS changes for the main
domain are left to the client's IT. Before the switch, they must provide a working
separate HTTPS origin for the catalog and the portal.

## Keys in the Pages environment

```
BASE_URL           the site address (see above)
CATALOG_BASE_URL   the source (the old name LEGACY_ORIGIN is still accepted)
PUBLIC_INDEXABLE   NOT set in stage 1, otherwise new and www fight over the same
                   words, and the stronger address is theirs
PUBLIC_GA_ID       the client's GA4 tag (G-13T4ZTVM1W), see docs/measurement.md
PUBLIC_GSC_VERIFY  the Search Console code, only the contents of `content`
PORTAL_URL         optional: rewrites CATALOG_BASE_URL/<lang>/login
RESEND_API_KEY / CONTACT_TO / CONTACT_FROM    without them the form returns 503
STRIPE_SECRET_KEY + PUBLIC_CHECKOUT=true      raised TOGETHER
```

**An uploaded key does not take effect until a new deploy is run.** Pages reads the environment
at build time, not at request time; 1010 in the response is not a 401.

## Commands

| command | what it does |
|---|---|
| `npm run dev` | local server (Astro) |
| `npm run build` | `dist/` |
| `npm run check` | `astro check` + the guard for hardcoded addresses |
| `npm run check:urls` | only the guard |
| `npm run deploy:stage1` | build with the stage 1 addresses + upload to Pages |
| `npm run preflight` | is everything ready before DNS; `--live` = after the switch |
| `npm run redirects` | their whole sitemap through the new site; checks CONTENT, not status |

The dynamic part is tested with `npx wrangler pages dev dist --binding KEY=value`.
**`--env-file` is silently swallowed** by `wrangler pages dev`: the key never
reaches the worker and it looks as if the code does not work.

## What is waiting on the client

Company ID (EIK) and VAT number, confirmation of the address and working hours, confirmation of the prices,
the real email, the links to PDK Flasher in both stores and the prices of the
33 electric models.

**Empty fields are no longer shown**: the row is simply not drawn and
appears on its own once the value enters `src/data/business.json`. The "pending"
frames were removed on 16.09.2026, because to a visitor they read as an unfinished
site. The consequence is that **the site itself cannot remind anyone**: the only
reminders are `npm run preflight` and the underscore notes inside `business.json`
itself.

## The documents

| file | what it is for |
|---|---|
| [`docs/cutover.md`](docs/cutover.md) | the two stages, the DNS order, the checks, rollback |
| [`docs/letter-to-it.md`](docs/letter-to-it.md) | ready-made messages to the client's IT and to the client |
| [`docs/measurement.md`](docs/measurement.md) | Search Console and Analytics: what exists, what is missing, who can do it |
| [`docs/ENGLISH.md`](docs/ENGLISH.md) | the English version: the stages and why `/en/` still stays with them |
| [`docs/AUDIT.md`](docs/AUDIT.md) | the pre-launch audit |
