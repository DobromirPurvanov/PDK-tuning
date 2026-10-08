/**
 * THE TWO LANGUAGES — the routes and which page is whose twin.
 *
 * Why at all: 5,585 of the 5,586 URLs in the old site's sitemap are under
 * `/en/`. All of the client's indexed traffic is English. The strategy is in
 * `docs/ENGLISH.md`; this is the mechanics.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE LANGUAGE IS READ FROM THE PATH, NOT PASSED THROUGH PROPS.
 *
 * The shell (bar, footer, cookies, the form) is rendered by `Base.astro` on
 * each of the 183 pages. If the language travelled as a prop, every page would
 * have to pass it — one hundred and eighty-three places where it gets
 * forgotten, and forgetting looks like a working build with a Bulgarian bar
 * above English text. `langOf(Astro.url.pathname)` cannot be forgotten: the
 * path is already correct.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { EN_LIVE } from '../config/site';
import { SERVICES_EN } from './en/services/index';

export type Lang = 'bg' | 'en';

export const LANGS: Lang[] = ['bg', 'en'];

/** `bg_BG` / `en_GB` for `og:locale`; British, because the shop is in the EU */
export const LOCALE: Record<Lang, string> = { bg: 'bg_BG', en: 'en_GB' };

/** The page language from its URL. Everything outside `/en/…` is Bulgarian. */
export function langOf(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'bg';
}

/**
 * THE ENGLISH SLUGS OF THE SERVICES.
 *
 * Most Bulgarian slugs are already Latin and read the same in both languages
 * (`chip-tuning`, `egr`, `adblue`) — they are left alone. Only the four that
 * are Bulgarian words in Latin letters are translated: "dtc-greshki" means
 * nothing to an English visitor, or to a search engine.
 *
 * `software-repair` was NOT chosen freely: `/en/tuning/software-repair` is in
 * the old site's sitemap, so it is indexed. The same name means stage 6
 * redirects the old address to ours with the same tail.
 */
const SERVICE_SLUG_EN: Record<string, string> = {
  'dtc-greshki': 'dtc-errors',
  diagnostika: 'diagnostics',
  'dyno-stend': 'dyno',
  'softueren-remont': 'software-repair',
};

/** Bulgarian service slug → its English slug */
export const serviceSlugEn = (slug: string) => SERVICE_SLUG_EN[slug] ?? slug;

/** English slug → the Bulgarian one (for the switcher's way back) */
export const serviceSlugBg = (slug: string) =>
  Object.entries(SERVICE_SLUG_EN).find(([, en]) => en === slug)?.[0] ?? slug;

/**
 * THE MAP OF TWINS. The only place that knows which Bulgarian address matches
 * which English one — read by the switcher, `hreflang`, the sitemap and the
 * stage 6 redirects.
 *
 * A page WITHOUT a twin is simply not listed here: the electric ones, the
 * articles, PDK Flasher, myth/fact and "for dealers" stay Bulgarian-only this
 * round. Then the switcher is not drawn — better a missing button than a
 * button to a 404.
 */
export const ROUTES: { bg: string; en: string }[] = [
  { bg: '/', en: '/en/' },
  { bg: '/uslugi/', en: '/en/services/' },
  { bg: '/tseni/', en: '/en/prices/' },
  { bg: '/kak-rabotim/', en: '/en/how-we-work/' },
  { bg: '/za-nas/', en: '/en/about/' },
  { bg: '/kontakti/', en: '/en/contact/' },
  { bg: '/vaprosi/', en: '/en/faq/' },
  { bg: '/privacy/', en: '/en/privacy/' },
  { bg: '/terms/', en: '/en/terms/' },
  { bg: '/cookie-policy/', en: '/en/cookies/' },
  { bg: '/otkaz-i-reklamacii/', en: '/en/returns/' },
  /* The services come from the ENGLISH set, not the Bulgarian one.
     Listed from the Bulgarian ones, the map would promise thirteen English
     pairs while `SERVICES_EN` is empty — that is, `hreflang` to pages the
     build does not generate, and a switcher to a 404. Each service appears on
     both sides the moment its English text is written. */
  ...SERVICES_EN.map((s) => ({
    bg: `/uslugi/${serviceSlugBg(s.slug)}/`,
    en: `/en/services/${s.slug}/`,
  })),
];

/** "/privacy" → "/privacy/"; the build emits folders, so both compare the same */
const slash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/**
 * The twin of this address in the other language, or `null` if the page
 * exists in only one.
 */
export function twin(pathname: string): { lang: Lang; href: string } | null {
  /* With the English version switched off there are NO twins — so the language
     button, the sitemap and `hreflang` all go quiet at once, instead of each
     asking separately. */
  if (!EN_LIVE) return null;
  const path = slash(pathname);
  const here = langOf(path);
  const row = ROUTES.find((r) => r[here] === path);
  if (!row) return null;
  const other: Lang = here === 'bg' ? 'en' : 'bg';
  return { lang: other, href: row[other] };
}

/**
 * The two addresses of one page for `hreflang`. Returns an empty list for a page
 * without a twin — `hreflang` with ONLY one row means nothing and Google skips
 * it, but an alternate pointing at a non-existent address is a real error in
 * Search Console.
 */
export function alternates(pathname: string): { lang: Lang; href: string }[] {
  const t = twin(pathname);
  if (!t) return [];
  const here = langOf(pathname);
  return [{ lang: here, href: slash(pathname) }, t].sort((a, b) => (a.lang < b.lang ? -1 : 1));
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ENGLISH MENU

   The Bulgarian one is built in `config/site.ts` from the data — this is the
   same for `/en/`.

   THE CATALOGUE IS NOT IN IT and that is a decision, not an omission. The
   English pages of the 110 makes (`/en/bmw`, `/en/audi`, ~5,470 addresses
   under them) have been indexed for years and are still served by the old
   site — they are NOT translated. That left three options, and two of them
   are worse than a missing item:
     • "Catalogue" → `/katalog/` sends an English visitor to a Bulgarian page,
       exactly the defect that `docs/ENGLISH.md` exists to prevent;
     • "Catalogue" → `/en/bmw` sends them into the old design from our own menu.
   So cars are chosen from the LIVE PICKER on the English home page: it reads
   from the same database and returns the English engine names, not a list of
   make names.
   ══════════════════════════════════════════════════════════════════════════ */

export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

export const NAV_EN: NavItem[] = [
  {
    href: '/en/services/',
    label: 'Services',
    // empty set → no sub-list; see the note in `en/services.ts`
    ...(SERVICES_EN.length
      ? { children: SERVICES_EN.map((s) => ({ href: `/en/services/${s.slug}/`, label: s.name })) }
      : {}),
  },
  { href: '/en/prices/', label: 'Prices' },
  { href: '/en/how-we-work/', label: 'How we work' },
  { href: '/en/about/', label: 'About' },
  { href: '/en/contact/', label: 'Contact' },
];

/** the second row of links; five in Bulgarian, one in English for now */
export const MORE_EN = [{ href: '/en/faq/', label: 'Questions and answers' }] as const;

export const LEGAL_EN = [
  { href: '/en/privacy/', label: 'Privacy' },
  { href: '/en/terms/', label: 'Terms' },
  { href: '/en/cookies/', label: 'Cookie policy' },
  { href: '/en/returns/', label: 'Withdrawal and complaints' },
] as const;

/**
 * OUR English paths — for the worker.
 *
 * `LEGACY_PATHS` in `public/_worker.js` sends EVERYTHING under `/en/` to the old
 * site. After stage 2 (when www is us) that would steal our own pages too. So
 * the worker checks this list BEFORE it.
 *
 * It is also exported as `en-paths.json` in the build output — the worker
 * cannot import TypeScript, and two hand-maintained lists are two lists that
 * drift apart one day.
 */
export const OUR_EN_PATHS = ROUTES.map((r) => r.en).filter((p) => p.startsWith('/en/'));

/**
 * The working time from prices.json in English: "2–4 ч" → "2–4 h",
 * "30 мин" → "30 min". prices.json stays the single source; only the units
 * and the two worded values are rendered differently.
 */
export const timeEn = (t: string): string =>
  ({ 'по уговорка': 'by arrangement', 'по състояние': 'depends on condition' })[t] ??
  t.replace(/\s*мин$/, ' min').replace(/\s*ч$/, ' h');
