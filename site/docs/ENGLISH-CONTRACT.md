# CONTRACT: the English CONTENT of PDK Tuning (stages 3–5 of `ENGLISH.md`)

The mechanics are already built and working. This contract is only about the text.
The strategy, the scope and the traps are in `docs/ENGLISH.md` — read it.

**Working folder:** `/Users/dobromirpurvanov/dev/pdk-tuning/site`

## What already exists and is NOT touched

| file | what it does |
|---|---|
| `src/i18n/index.ts` | the language from the path, the map of counterparts, the English menu |
| `src/i18n/ui.ts` | the labels of the shell — already translated, complete |
| `src/i18n/en/services/index.ts` | collects the English services into `SERVICES_EN` |
| `src/layouts/Base.astro`, `Page.astro`, `Text.astro` | the shell; already bilingual |
| `src/components/*.astro` | bar, footer, cookies, form; already bilingual |
| `src/pages/en/contact.astro` | **THE MODEL.** Read it before writing a page. |
| `src/data/**` | the Bulgarian content — **NOT touched at all** |

**We do NOT touch:** anything Bulgarian, `public/_worker.js`, the catalogue, the portal,
`src/config/site.ts`, the styles. If something nearby looks like a defect — it is
not fixed here, only reported.

## What we touch

### A. The thirteen services — `src/i18n/en/services/<slug>.ts`

One file per service. Each exports one object of type `Service`:

```ts
import type { Service } from '../../../data/services';

export const chipTuning: Service = { … };
```

The English slugs and their source:

| new file | export | source (Bulgarian) |
|---|---|---|
| `chip-tuning.ts` | `chipTuning` | `slug: 'chip-tuning'` |
| `stage-2.ts` | `stage2` | `slug: 'stage-2'` |
| `tcu-dsg.ts` | `tcuDsg` | `slug: 'tcu-dsg'` |
| `dpf-fap.ts` | `dpfFap` | `slug: 'dpf-fap'` |
| `egr.ts` | `egr` | `slug: 'egr'` |
| `adblue.ts` | `adblue` | `slug: 'adblue'` |
| `lambda-maf.ts` | `lambdaMaf` | `slug: 'lambda-maf'` |
| `dtc-errors.ts` | `dtcErrors` | `slug: 'dtc-greshki'` |
| `pops-bangs.ts` | `popsBangs` | `slug: 'pops-bangs'` |
| `vmax-off.ts` | `vmaxOff` | `slug: 'vmax-off'` |
| `diagnostics.ts` | `diagnostics` | `slug: 'diagnostika'` |
| `dyno.ts` | `dyno` | `slug: 'dyno-stend'` |
| `software-repair.ts` | `softwareRepair` | `slug: 'softueren-remont'` |

### B. The four legal pages — `src/pages/en/<name>.astro`

| new file | address | source |
|---|---|---|
| `privacy.astro` | `/en/privacy/` | `src/pages/privacy.astro` |
| `terms.astro` | `/en/terms/` | `src/pages/terms.astro` |
| `cookies.astro` | `/en/cookies/` | `src/pages/cookie-policy.astro` |
| `returns.astro` | `/en/returns/` | `src/pages/otkaz-i-reklamacii.astro` |

### C. The FAQ — `src/i18n/en/faq.ts`

A mirror of `src/data/faq.ts`: the same exports, English content.

## Interfaces

### The `Service` type (from `src/data/services.ts`, NOT changed)

```ts
type Service = {
  slug: string;          // the ENGLISH slug from the table above
  name: string;          // the name shown in the menu, tile, dropdown
  kicker: string;        // micro-label above the heading, 2–4 words
  icon: IconKey;         // the SAME value as the Bulgarian — icons are drawings
  priceKey: string | null;  // the SAME value — prices are shared and are in euro
  title: string;         // for search engines, up to 60 characters, ends with "| PDK Tuning"
  description: string;   // for search engines, 120–158 characters
  lead: string;          // one sentence under the H1
  short: string;         // the short text for the tile, one sentence
  featured?: boolean;    // the SAME value as the Bulgarian
  fits: string[];        // who it is for
  notFor?: string[];     // when it makes no sense
  steps: { t: string; d: string }[];          // how it goes with us
  body: { h: string; p: string[]; tone?: 'warn' }[];   // the main text
  facts?: { k: string; v: string }[];         // the dry numbers at the side
  faq?: { q: string; a: string }[];           // questions for this service only
  related: string[];     // neighbouring services — ENGLISH slugs
};
```

`tone: 'warn'` renders the section as an orange panel. It is used for the legal
boundary on DPF, EGR and AdBlue and **nowhere else**. Its English text is
`OFFROAD_NOTE_EN` in `src/i18n/en/services/index.ts` — it is imported from there,
not copied.

### A page under `/en/` (see `src/pages/en/contact.astro`)

```astro
import Text from '../../layouts/Text.astro';        // the legal ones
import { crumbSchema, bizRef } from '../../lib/seo';
```

- the language is NOT passed in — the shell reads it from the address;
- the schemas carry `inLanguage: 'en'` and `bizRef(site, 'en')`;
- internal links point to `/en/…`, never to a Bulgarian address;
- the "in force from" date (`updated`) is the SAME as on the Bulgarian page.

## How it is written

**This is not a translation.** The Bulgarian texts were written for specific people; a
word-for-word translation sounds like washing-machine instructions. The English is
written anew from the **same facts**.

The same in both languages, without exception:

- **the prices** — in euro, not converted, `priceKey` points to the same row;
- **the numbers** — percentage gains, hours, revs, deadlines;
- **the legal boundary** — DPF/EGR/AdBlue only off public roads;
- **the workshop's position** — what we do not do and why.

Tone: dry, concrete, in the first person plural ("we"). British spelling
(`tyre`, `litre`, `optimise`), because the workshop is in the EU.

**FORBIDDEN:** "premium", "cutting-edge", "state-of-the-art", "your trusted
partner", "unlock the full potential" as a section heading, exclamation
marks, invented numbers and percentages. If you need a fact that is not in
the Bulgarian source — **do not make it up**, leave `[TO CONFIRM]`.

## Done when

- [ ] `npx astro check` → **0 errors** (the command is run in `site/`)
- [ ] `npm run build` passes
- [ ] every new `.ts` file exports exactly one object of type `Service`
- [ ] `slug` and `related` carry the **English** slugs from the table
- [ ] `icon`, `priceKey`, `featured` match the Bulgarian ones
- [ ] no `description` matches another
- [ ] not a single Bulgarian character in the new files **outside comments**
- [ ] not a single link from an English page to a Bulgarian address
- [ ] no `[TO CONFIRM]` left without a reason

## Traps

- **`/en/` is taken.** `LEGACY_PATHS` in `public/_worker.js` sends everything under
  `/en/` to the old site. Our English paths are checked BEFORE it —
  this is done in `OUR_EN_PATHS`, do not touch it.
- **The catalogue is NOT translated.** `/en/bmw`, `/en/audi` and ~5,470 addresses below
  them have been indexed for years on the old site. An English page for a brand =
  duplicated content competing against ourselves.
- **The legal pages in English are NOT a legal translation.** Bulgarian stays the
  authoritative version and **this must be stated on the pages themselves** — one sentence at the start.
- **`display` beats `[hidden]`.** An author rule with `display` makes a hidden element
  visible; that is why `Base.astro` has `[hidden]{display:none !important}`. No new
  rules with `display` are added on anything that may be `hidden`.
- **The empty set is a working state.** Until a service is imported into
  `src/i18n/en/services/index.ts`, it has no page, no menu row and no
  `hreflang`. Importing is the LAST step, after `astro check` passes.
- **`PUBLIC_EN` is the safeguard.** Until it is `true`, the English pages
  carry `noindex` and are not linked from anywhere. It is not raised from this tier.
