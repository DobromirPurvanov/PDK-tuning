# CONTRACT: what remains before pdktuning.com goes live

An audit of `new-pdk.pages.dev` along five directions, in parallel through three
other people's accounts. Zero against the Claude quota.

**The conclusion: the code is ready. What blocks the launch is not code.**

---

## What came out clean

Checked, not assumed:

| Direction | Result |
|---|---|
| SEO from the output | 183 pages · **0** duplicate titles · **0** duplicate descriptions · 0 outside 80–165 characters · exactly one H1 everywhere |
| Internal links | **0** targets without coverage (excluding those to the old site, which it serves) |
| Narrow screen (390px) | 17 pages · **0** horizontal overflows |
| Redirects | 3,474 old URLs · 117 redirected · 3,357 kept · **0 broken** |
| Accessibility | alt, field labels, heading order, `:focus-visible`, `aria` on icon buttons, `lang` — clean |
| Canonical URLs | 180 unique, all pointing to the stage's address |

## What was fixed immediately

- **Golos was not preloaded.** It is `--body`, that is every paragraph and every
  button on the site. It was downloaded only after the inline CSS was parsed,
  while the mono font for the small labels was pulled with priority — the most
  important text waited because of the secondary one. It was added in
  `Base.astro`, so on all 183 pages.

---

## What we touch

Nothing in the code. The remaining tasks are **data and access**, not
programming.

What we do NOT touch: `_worker.js`, the redirects, the templates, the styles. The
audit found no reason to.

---

## It is done when

### 1. The site is at its address

- [ ] **new-pdk → Custom domains → `new.pdktuning.com`** (Cloudflare dashboard)
- [ ] the `new` record becomes a CNAME to `new-pdk.pages.dev`, proxied
- [ ] `npm run postflight` passes with no blockers

The order matters: the domain is added in Pages **before** the DNS record,
otherwise Cloudflare returns 1014 and it looks as if the record is not working.

### 2. The client's data is filled in

Every empty field appears on the live site as a visible frame "попълва се"
("to be filled in"). `npm run preflight` lists them.

- [ ] EIK (company ID) and VAT number of БОЛИД АУТО ООД → `src/data/business.json`
- [ ] the address: **ул. Прилеп 96 or 164** (their site says 164, Google says 96)
- [ ] the opening hours (an assumption stands there now)
- [ ] the real email — `office@pdktuning.com` is **our assumption**
- [ ] confirmation of the prices in `src/data/prices.json` (they are from the plan now)
- [ ] the prices of the 33 electric models → `OURS` in `src/data/ev.ts`
      (right now **not one** has a price; all appear as „Цена по запитване“
      ("Price on request") and the checkout cannot work)
- [ ] the App Store and Google Play addresses of PDK Flasher

### 3. The form sends emails

- [ ] `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` in the Pages environment
- [ ] the domain is verified in Resend

Without them the form answers honestly "not connected, call us" — it does not
show a false success, but no enquiry gets through either.

### 4. Decisions waiting on a person

- [ ] the legal texts have not been reviewed by a lawyer
- [ ] `PUBLIC_GA_ID` — the client's GA4 tag
- [ ] what happens to the old Astro site, which today is at `new.pdktuning.com`

---

## Traps

- **`PUBLIC_INDEXABLE` is NOT set at stage 1.** `new` and `www` would show the
  same content under two names and would fight over the same words, and the
  stronger address is theirs.
- **The address is supplied at build time** (`PUBLIC_SITE_URL`). Hard-coded to
  `www` during stage 1, the canonical points to the OLD site.
- **An uploaded Pages secret does not take effect until a new deploy.**
- **An empty field is better than an invented one.** Trust figures without a
  source and a Google rating without visible reviews are against Google's rules.

---

## A note on the audit itself

Three of the five modules did not do their job, and this is a lesson for next
time:

- **SEO and speed (Codex)** — had no network. They honestly returned "the domain
  does not resolve". The speed module was still useful on the local code; SEO
  gave nothing.
- **Narrow screen (Kimi)** — got stuck, returned nothing.
- **Accessibility and content (OpenRouter)** — worked, because the dispatcher
  gives them **downloaded** content. The content module, however, received
  truncated HTML and half of its findings are artefacts of the truncation, not
  defects.

The conclusion: **every module must be given downloaded content, not an
address** — not only `or`. And the truncation must be more generous, otherwise
the model describes what is missing, not the site.

SEO and the narrow screen were checked by hand at the end — that is why the table
above is complete.
