# CONTRACT: audit of the new PDK site before www goes live

The site is live at https://new-pdk.pages.dev (stage 1, `noindex`). 183 pages,
Astro → Cloudflare Pages. The machine checks have already been run and pass
(zero duplicate titles/descriptions, zero missing H1/alt/canonical, zero
broken internal links) — **do not repeat them, they have already been measured.**

## What we touch
Nothing. This is an audit — it returns a LIST OF FINDINGS, not code and not fixes.
We do NOT touch: `public/_worker.js` (the redirects were checked against their
sitemap — 117 → 301, 0 broken), the catalogue layer, the legal texts.

## What is reviewed
Judgement only, not counting:
- **Content** — is it clear from the first screen what is sold and to whom;
  unfinished places; AI clichés; invented trust numbers.
- **Conversion** — where the call to action is, what stops a person from submitting a request.
- **Accessibility** — structure, labels, focus, aria.
- **Speed** — from the local code: weights, blocking resources, fonts.

## Done when
- [ ] every finding points to a SPECIFIC text or element in the supplied HTML
- [ ] nothing that is not visible in the supplied material is claimed (say
      "not verifiable from here", do not guess)
- [ ] findings are ordered by severity, not by reading order

## Traps
- You work on the SUPPLIED HTML. You have no browser and no network — do not
  pretend you opened the page.
- The site is deliberately `noindex` at this stage — this is NOT a defect.
- The empty places for company ID (ЕИК), address and working hours are deliberate frames
  waiting for the client — mention them once, do not count them as five defects.
- The price of the electric models is stated on only one line out of 33 — this is known.
- The site is in Bulgarian. Write in Bulgarian.
