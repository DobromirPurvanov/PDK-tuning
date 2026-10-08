# The PDK Tuning design system

Three files and one page:

| What | Where |
|---|---|
| Tokens — every colour, size, radius and duration | `src/styles/tokens.css` |
| Primitives — button, surface, label, table, accordion… | `src/styles/ui.css` |
| The guard — fails the build on any deviation | `scripts/check-tokens.mjs` |
| Everything live, to look at with your eyes | `/stil/` (noindex, not in the sitemap) |

There is one rule: **outside `tokens.css` there is no bare colour, no bare
radius, no bare transition time and no breakpoint outside the set.** If
something is missing, a token is added — a value is not written in place.

---

## Where this comes from

The source is **the client's brand board in Canva** — `docs/brand/p1.png` and
`p7.png`. The black, the acid green, the gradient between the two greens, the
tightly set capital letters of the headlines and the slogan „Всеки автомобил има
потенциал / **Ние знаем как да го отключим**“ (Every car has potential / **We
know how to unlock it**) all come from there.

This is not a proposal and is not up for a matter of taste. The live old site is
**red** — that is a mistake, not a brand.

The rest (the composition of the home page) is assembled from 21st.dev
components, rewritten in plain Astro and CSS: Crypto Hero (8759), Experience
Hero (9724), Pixel Logo Grid (12815), Feature Velocity (18901), Multi-Step Form
(8281).

---

## The tokens

### Surfaces — 4

`--bg` `#080808` the page · `--bg-bar` `#0A0A0A` the bar and the footer ·
`--surface` `#0C0C0C` everything raised · `--hair` `#1A1A1A` the diagonal hatching

There used to be nine. `--bg-bar` survives separately from `--surface` not for
the eye — the difference is 2/255 — but because "solid black, even at rest" was a
deliberate decision for the bar: a semi-transparent bar over a bright frame of
the video turns grey, and `backdrop-filter:blur` over video gives a milky grey.

### Text — 5 levels

`--white` headings · `--ink` `#E8E8E8` body text · `--ink-2` `.80` ·
`--ink-3` `.72` · `--ink-4` `.62` micro-labels · `--ink-5` `.45`

Body text is **not pure white**. `#FFF` on `#080808` gives 20:1 — the maximum
contrast. On a dark background light text that strong halates: the letters glow
and after a few paragraphs the eyes start to burn. The WCAG threshold is a lower
bound, not a target; for long text on a dark theme the ceiling is around 16:1.
`--ink` is 16.3:1.

**`--ink-5` is the floor.** Measured on `#0C0C0C`, below alpha 0.45 nothing
reaches 4.5:1. Anything paler than that is not text but a divider — it comes
from `--line-*`.

### Lines and underlays — 6

`--line` `#232323` the solid border · `--line-soft` `.16` button border ·
`--line-mid` `.30` decorative marks ("/", "·") · `--line-strong` `.45` border
on hover · `--tint-1` `.03` the row under the pointer · `--tint-2` `.06` field,
the box under an icon

### Accent — 6

`--lime` `#52FB09` the brand · `--green` `#05AD02` the other end of the gradient ·
`--lime-ink` `#041000` text **on** lime · `--lime-line` `.45` ·
`--lime-wash` `.14` · `--lime-dim` `.06`

Black on such a saturated green looks dirty — hence `--lime-ink`. It used to be
hard-coded in thirteen places.

### Signal — 5

`--warn` `#FF8E72` · `--warn-line` · `--warn-bg` · `--warn-ink` · `--ok-ink`

The only warm colour on the site. It is reserved for "when it makes no sense",
for the legal boundary and for a form error. **If it shows up anywhere else, it
stops meaning anything.**

### Darkening — 5

`--shade` · `--shade-hard` · `--tick` · `--shadow` · `--green-glow`

It lies **over** a frame; it does not form a box. `--shade-hard` is the shadow
under the text in the hero — it is the only thing that keeps the text legible
when a bright frame of the video passes beneath it.

### Fonts — 3, two weights

`--head` Oswald 700 · `--body` Golos Text 400 · `--mono` JetBrains Mono 400

Self-hosted, Cyrillic and Latin separately with `unicode-range` — Bulgarian text
does not wait for the Latin glyphs. **There is no 500 and no 600.** If somewhere
a semi-bold is needed, the answer is a different hierarchy, not a new file: each
weight is two files and about 30 KB.

### Sizes — 9 + 4 heading sizes

`--fz-lab` 10 · `--fz-btn` 11 · `--fz-2xs` 12 · `--fz-xs` 13 · `--fz-s` 15 ·
`--fz-body` 16 · `--fz-m` 17 · `--fz-l` lead · `--fz-h1` `--fz-h2` `--fz-h3`
`--fz-h4`

By **role**, not by number — "the label" is one size everywhere, instead of 9, 10
or 11 depending on who wrote it.

`--fz-s` (15) is for a card and a list, where the text is short and is scanned at
a glance. `--fz-body` (16) is for long text in a 70-character column, read
sentence by sentence. One pixel of difference is visible there: when the two were
merged, the legal pages shrank by 3 to 6%.

Headings above 18px keep their own `clamp()` formulas — they are the composition
of a specific screen, not steps on a scale.

### Letter-spacing — 5

`--ls-tight` −.026em h1 · `--ls-snug` −.02em h2 · `--ls-h3` −.008em ·
`--ls-lab` .24em micro-labels · `--ls-btn` .16em buttons

Negative for headings (Oswald at a large point size spreads apart), strongly
positive for mono labels. This is half of the brand's character.

### Spacing — 8 + 2

`--sp-1` 4 … `--sp-8` 64 · `--gut` 22/56 the side margin · `--sec-y` 44/64
the rhythm between sections

### Radii — 4

`--r-xs` 3 focus outline · `--r-s` 10 · `--r-m` 14 · `--r-pill` 999

There used to be fifteen, including `999px` and `99px` at the same time.

### Motion — 3

`--t-fast` .18s · `--t` .25s · `--t-slow` .5s

**The curve stays the browser's, on purpose.** A custom easing changes the feel
of every movement on the site at once, and the motion here is approved as it is.

The two long ones (`1.1s` and `1.7s`) are not responsiveness but the run-up of
the power bar — the number has to be followed by eye. They are listed by name in
the guard.

### Widths — 5 · Layers — 5

`--w-page` 1180 · `--w-panel` 1000 · `--w-text` 900 · `--w-prose` 70ch ·
`--w-read` 62ch

`--z-base` 2 · `--z-sticky` 10 · `--z-bar` 40 · `--z-modal` 60 · `--z-skip` 70

---

## The breakpoints

**420 · 560 · 620 · 700 · 760 · 900 · 980 · 1060 · 1180**

Breakpoints **cannot be tokens** — CSS does not accept `var()` in a media query.
So they are a contract that `scripts/check-tokens.mjs` enforces.

The convention: the ascending one is written with `min-width`; when `max-width`
is unavoidable, it is **breakpoint − 1**. Before this rule the code had both
`max-width:760px` and `min-width:760px` — one pixel where both applied. The same
at 980.

---

## The primitives

| Class | What it is | Replaces |
|---|---|---|
| `.btn` `.btn--go` `.btn--ghost` `.btn--pill` `.btn--sm` | the button | 11 separate copies with 3 heights and 3 radii |
| `.panel` `.panel--link` | the surface | 15 verbatim repetitions |
| `.lab` `.lab--lime` | the micro-label | dozens in place |
| `.crumbs` | the breadcrumbs | — |
| `.qa` | question and answer | 2 almost identical copies |
| `.tbl` | the table, reflowing below 620px | `.p-table` + `.doc-table` |
| `.warn` | the legal plate | repeated on 5 pages |
| `.fill` | "waiting for data from the client" | — |
| `.nas-dl` `.nas-hours` | address and opening hours | 2 copies under generic names |

The button sizes go through local variables (`--btn-h`, `--btn-py`,
`--btn-px`, `--btn-r`), so that a component can bend it without writing a new
rule. `--btn-r` accepts **only** a token from the set — the guard checks it.

`form.css` stays a separate file on purpose: a page without a form must not
download it.

---

## What is NOT done

- **A new hex, a new rgba, a new radius, a new duration.** A role is missing → a
  token is added in `tokens.css` with an explanation of why, not a value in place.
- **A new media-query breakpoint.** The set is above.
- **A new font weight.** There are two, and this is a decision about page weight.
- **A custom easing.**
- **A twelfth version of the button.** If the new case is not covered by the
  variants, that is a reason to extend `.btn`, not to write `.my-btn`.
- **A generic class name in global scope** — `bar`, `row`, `col`, `line`, `panel`.
  This has already cost two rounds of looking at the wrong element: the progress
  bar in the picker was a `<span class="bar">`, the same class as
  `<header class="bar">`, and it inherited `position:fixed;top:0;left:0;right:0`
  → it lay across the whole screen as a grey stripe. A name in global scope says
  whose it is.
- **`!important`** — except the two places where it already is and the reason is
  explained (`[hidden]` and the switching-off of motion).

---

## How it is checked

```bash
cd site
npm run check           # astro check + both guards
npm run check:tokens    # only the design system
npm run build
```

The guard fails on a bare colour, a radius outside the set, a duration outside
the set and a breakpoint outside the set. The exceptions are **listed by name
with a reason** in `ALLOW` — a general rule ("everything in the hero is fine")
would make the guard decorative within the first month.

Allowed are: `tokens.css` (it defines them), comments (there the value explains,
it does not paint), `#000`/`#fff` inside a masking gradient (there "black" means
"show", not a shade), and `config/site.ts` (`theme_color` is read as a raw string
by the browser and Android).

**A guard that has never stopped anything is untested.** Put `#123456` somewhere
and see that it fails.

---

## What is left

- Headings above 18px still have their own `clamp()` formulas. They are the
  composition of a specific screen and that is defensible, but if one day it turns
  out that six headings do the same thing, their place is here.
- `Picker.astro` and `EvPicker.astro` are parallel universes — the same panel
  shape, two entirely separate sets of classes. Merging them is a change to
  behaviour, not to the visuals, and is a separate task.
- The logo exists only as a raster (100×100 JPG, enlarged). There is no vector.
- Real photography from the test bench is missing; the hero is a frame made with AI.
