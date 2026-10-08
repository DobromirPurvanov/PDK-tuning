# Switching pdktuning.com to the new site

The launch happens in **two stages**. The old site keeps running through both —
it remains the guardian of the database, the catalogue and the dealer login.
Nothing is migrated.

| | address of the new site | `www.pdktuning.com` | catalogue source |
|---|---|---|---|
| **stage 1** | `new.pdktuning.com` | the old site | `www.pdktuning.com` |
| **stage 2** | `www.pdktuning.com` | the new site | `files.pdktuning.com` |

The difference in code is **only the value of one key** — `LEGACY_ORIGIN`. That
is why stage 1 is a real rehearsal of stage 2, not an approximation of it.

---

## Stage 1 — the site goes up at `new.pdktuning.com`

### What needs to be done

One DNS record in the `pdktuning.com` zone:

```
Name:     new
Type:     CNAME
Value:    new-pdk.pages.dev
Proxy:    on
```

The record **replaces** today's one, which points at the server with the old
Astro site.

In the `new-pdk` Pages project, `new.pdktuning.com` is added as a custom domain.

### Keys in the Pages environment

```
LEGACY_ORIGIN = https://www.pdktuning.com
```

This is all that switches on the catalogue and the portal. `www` is still their
site, so it is also the source — nothing is touched on their side.

**`PUBLIC_INDEXABLE` is NOT set at this stage.** The site stays `noindex`:
`new` and `www` would show the same content under two names and would compete
for the same words, and the stronger address is theirs.

`PUBLIC_GA_ID` and `PUBLIC_GSC_VERIFY` also stay empty here — there is nothing
to index and no traffic to measure. They are raised at stage 2, together with
`PUBLIC_INDEXABLE`. What must be arranged by then and by whom is in
[measurement.md](measurement.md).

### The build

```bash
npm run deploy:stage1
```

The address is passed at build time (`PUBLIC_SITE_URL`), because the canonicals
and the sitemap read it. Hard-wired to `www` during stage 1, they would point to
the OLD site — that is, every page of ours would say "the real one is me, but
elsewhere".

---

## Stage 2 — the site takes over `www`

Done separately, after stage 1 has stood for a while and been watched.

### New record `files.pdktuning.com`

Only now does the old server need a name of its own: once `www` is us, the
worker cannot read the catalogue from `www`, because it would be asking itself.

```
Name:     files
Type:     the same as today's record for www
Value:    the same as today's record for www
Proxy:    on
```

The proxy must be on — the direct origin has a self-signed certificate that
expired in 2021.

**The virtual host must also answer to `files.pdktuning.com`** — the forwarded
request reaches the origin with a `Host` equal to the new name. Verified.

### Check before touching `www`

```
curl -sSI https://files.pdktuning.com/bg/login
```

`200` is expected. If it fails, do not continue — otherwise the dealer login stops.

### Switching

```
www  CNAME  new-pdk.pages.dev   Proxy: on
@    CNAME  new-pdk.pages.dev   Proxy: on
```

The environment is changed to `LEGACY_ORIGIN=https://files.pdktuning.com` and
`PUBLIC_INDEXABLE=true`, `PUBLIC_GA_ID` (the client's tag) and
`PUBLIC_GSC_VERIFY` are added, if ownership is confirmed with a meta tag. The
build runs without `PUBLIC_SITE_URL` (the default is `www`).

The three go TOGETHER: a site that Google sees but that is not measured, or a
site that is measured but not seen, is half a switch. Which key comes from where
and what must be requested from the client beforehand — [measurement.md](measurement.md).

---

## What happens to the addresses

| Address | Who serves it |
|---|---|
| `/`, `/uslugi/`, `/tseni/`, `/katalog/`… | the new site |
| `/bg/`, `/en/` | 301 to the new home page |
| `/bg/about-us`, `/contact`, `/privacy-policy` | 301 to the new pages |
| `/bg/tuning` and its two subpages | 301 to the services |
| `/bg/bmw`, `/en/audi`… (110 brands) | 301 to the new catalogue |
| `/bg/bmw/3-series-51/…` (~5,500 addresses) | **the old site, unchanged** |
| `/bg/login`, `/bg/sign-up`, the upload | **the old site, unchanged** |
| `/images/`, `/js/`, `/css/`, `/vendor/`, `/uploads/`, `/storage/` | **the old site, unchanged** |

Requests to the old site are forwarded with their method, headers and body.
The session cookie passes without `Domain`, that is, it sticks to the new
address and the dealer login works as it does today. Verified: GET 200, POST
200, `PHPSESSID` in order.

---

## Rolling back

The records are returned to their previous values. The old site has not stopped
and takes over immediately. Cloudflare propagation takes about a minute.

---

## The checks

```bash
npm run preflight          # stage 1: is everything ready
npm run redirects          # the whole old sitemap through the new site
npm run postflight         # stage 1, after the switch — against the live address

npm run preflight:stage2    # the same for stage 2
npm run postflight:stage2
```

`preflight` exits with an error while anything blocking remains. It distinguishes
"blocking" from "will come out empty": an empty company ID (ЕИК) is not a reason
not to launch the site, a missing DNS record is.

`redirects` takes the old site's `sitemap.xml` and runs every address through
the new one. It looks at **content, not status** — the old site returns 200 and
its home page for a non-existent address. With `--all` all 5,586 addresses are
run, with `--csv` a file is produced.

Before the switch it is run against a local worker:

```bash
npx wrangler pages dev dist --port 8788 \
  --binding LEGACY_ORIGIN=https://www.pdktuning.com
npm run redirects
```

Last measured this way: **117 redirected, 3,357 kept at the old site,
0 broken.**
