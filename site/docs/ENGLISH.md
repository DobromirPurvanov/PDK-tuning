# STRATEGY: the English version

## Why at all

**5,585 of the 5,586 addresses in the old site's sitemap are under `/en/`.** All
the indexed traffic the client has today is English. The Bulgarian site is the
new part; the English one is how people find them.

And right now the new site sends every English visitor to a Bulgarian page:

```
/en/about-us  →  /za-nas/       Bulgarian
/en/tuning    →  /uslugi/       Bulgarian
/en/bmw       →  /katalog/bmw/  Bulgarian
```

This defect exists AS OF TODAY — it was introduced with the redirects. It is
fixed at stage 0, before any translating.

## Scope (decided)

**The main pages, around twenty.** The brand catalogue is NOT translated: its
English pages have been indexed for years and keep working on the old site.
Nothing indexed is lost and nothing is duplicated.

| address | who serves it afterwards |
|---|---|
| `/en/` | **our** English home page |
| `/en/services/` + 13 services | **ours** |
| `/en/prices/`, `/en/how-we-work/`, `/en/about/`, `/en/contact/`, `/en/faq/` | **ours** |
| `/en/privacy/`, `/en/terms/`, `/en/cookies/`, `/en/returns/` | **ours** |
| `/en/bmw`, `/en/audi`… (110 brands) | **the old site** |
| `/en/bmw/3-series-51/…` (~5,470) | **the old site** |
| `/en/login`, `/en/sign-up` | **the old site** |

The electric models, the articles, PDK Flasher, myth/fact and the dealers page
stay Bulgarian-only in this round. If they are needed, they are added by the
same mechanism.

---

## The design

### What makes it easy

The text lives in **data, not in templates** — 139,000 characters in `src/data/`
against 22,000 in `.astro` files. The types already exist (`type Service = {…}`).
So templates are not rewritten: a second implementation of the same types is made.

### How

```
src/data/          →  stays Bulgarian (not touched in this round)
src/i18n/
  en/services.ts      the same Service type, English content
  en/ui.ts            the labels from the templates (22k characters)
  index.ts            dict(lang) → returns the right set
src/pages/en/       mirrored structure, the SAME components
```

Templates take the language as input and read from `dict(lang)`. One component,
two sets of content — not two components.

### Why not `{ bg, en }` fields in every object

It looks compact, but it makes every data read bilingual and touches all 183
pages for the sake of 20. Separate sets keep the Bulgarian intact.

---

## The stages

Each stage delivers something that **works and can be seen**. The next one is
not started before the previous one passes its check.

### Stage 0 — the fix, no translation

The English visitor stops landing on a Bulgarian page.

- `/en/<anything>` is NO LONGER redirected to Bulgarian pages
- everything under `/en/` is passed on to the old site, as before
- the `/bg/` redirects stay as they are

**Done when:** `/en/about-us`, `/en/tuning`, `/en/bmw` return 200 from the old
site, not a 301 to a Bulgarian page. `npm run redirects` stays at zero broken.

### Stage 1 — the routes and the switcher

A skeleton without content: two or three pages with placeholder text.

- `src/i18n/` with `dict(lang)`
- `src/pages/en/index.astro` and two more
- "BG / EN" becomes a real link that knows where the page's counterpart is
- `hreflang` between the two languages + `x-default`
- `lang="en"` on the English pages

**Done when:** `/en/` opens an English home page; the switcher leads from
`/uslugi/` to `/en/services/` and back; `astro check` passes.

### Stage 2 — the shell

Everything visible on every page: menu, footer, cookies, the form, the error
messages, 404.

**Done when:** an English page has not a single Bulgarian word outside the
content; the form returns English responses.

### Stage 3 — the main pages

Home, about, contact, how we work, prices, FAQ.

**Done when:** the six pages pass `verify-build` (unique title and description,
80–165 characters, one H1 each).

### Stage 4 — the services

The thirteen. The bulkiest (66,000 characters) and the most repetitive — this is
where the work is distributed among the cheap models via the cascade.

**Done when:** the thirteen English pages are complete and different from one
another; no description matches another.

### Stage 5 — the legal pages

Privacy, terms and conditions, cookies, withdrawal and complaints.

**Done when:** the four are translated and it is **explicitly noted** that they
have not been reviewed by a lawyer in English.

### Stage 6 — the redirects and the map

Only now are the old English addresses redirected to the new, OURS:

```
/en/about-us            →  /en/about/
/en/contact             →  /en/contact/
/en/tuning              →  /en/services/
/en/tuning/chip-tuning  →  /en/services/chip-tuning/
/en/privacy-policy      →  /en/privacy/
```

`/en/<brand>` and everything below it stay with the old site.

**Done when:** `npm run redirects` reports zero broken and zero English
addresses that lead to a Bulgarian page.

---

## Traps

- **`/en/` is taken.** `LEGACY_PATHS` sends everything under `/en/` to the old
  site. The list of OUR English paths must be checked BEFORE it, otherwise our
  own pages go to them.
- **Never machine translation over the service descriptions.** The texts were
  written for specific people; a literal translation sounds like washing-machine
  instructions. The English is written anew from the same facts.
- **The two catalogues do not clash** just because ours is in Bulgarian and
  theirs in English. If the brands are ever translated, this decision is
  revisited.
- **`verify-build` skips `noindex`** — the English pages will go through the
  gate only once indexing is opened.
- **The legal texts in English are not a legal translation.** Bulgarian stays
  the authoritative version; this must be stated on the pages themselves.
- **Prices are in euro in both languages** — they are not converted.

---

## What we do NOT touch

`public/_worker.js` beyond the redirects · the Bulgarian pages · `src/data/` ·
the catalogue · the portal · nothing on the old site.
