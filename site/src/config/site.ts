/**
 * One place for everything that differs between the mockup and the real launch.
 *
 * When the site goes live on its own domain, TWO things change:
 *   1. `site` in astro.config.mjs → the real domain (canonicals and the sitemap read it from there);
 *   2. `PUBLIC_INDEXABLE=true` in the environment → removes `noindex` and robots.txt opens crawling.
 * Nothing else has to be hunted down across the pages.
 */
import business from '../data/business.json';
import { SERVICES } from '../data/services';
import { CATEGORIES } from '../data/categories';

/** Whether search engines are let in. The mockup stays CLOSED: the real domain gets indexed,
 *  not new-pdk.pages.dev — otherwise the two addresses compete for the same words. */
export const INDEXABLE = import.meta.env.PUBLIC_INDEXABLE === 'true';

/** The GA4 measurement ID comes from the environment and is EMPTY in the mockup: demo visits
 *  have no business in the client's property. Empty = nothing is loaded. */
export const GA_ID = import.meta.env.PUBLIC_GA_ID ?? '';

/**
 * WHETHER THE ENGLISH VERSION IS LIVE. Off by default.
 *
 * The English site is built in stages (`docs/ENGLISH.md`) and the intermediate
 * states are INCOMPLETE by design: the shell is ready, but not every page
 * has a counterpart. Released like that, it shows an "EN" button that leads to a working
 * page whose footer points to four legal pages that don't exist yet, i.e. a
 * visitor landing on a 404 from our own menu.
 *
 * One key controls the whole English part:
 *   empty   → `/en/…` is NOT built, there is no language button, `hreflang`
 *             stays silent, the sitemap promises no English addresses.
 *             The Bulgarian site is exactly as it was, ready to ship today.
 *   `true`  → everything English appears at once.
 *
 * This way the build proceeds on `main` without waiting for launch day, and without
 * endangering the launch. Raise it when `npm run check:en` reports zero missing
 * pages.
 */
export const EN_LIVE = import.meta.env.PUBLIC_EN === 'true';

/**
 * THE SEARCH CONSOLE VERIFICATION CODE.
 *
 * Google offers four ways to prove the site is yours: a DNS record, a file in
 * the root, an Analytics link and a meta tag. The first three don't work here:
 *   - DNS: the `pdktuning.com` zone is NOT in our account (16.09.2026) and our token
 *     has no `dns:write` — the record is made by the client's IT;
 *   - file in the root: Pages would serve it, but the name is random and changes on
 *     every re-verification, so it would go into the repo for nothing;
 *   - Analytics: the old site's property (`G-13T4ZTVM1W`) is not ours.
 * That leaves the meta tag — it is set as an environment key and needs nobody else.
 *
 * EMPTY = the tag is not written at all. The value is ONLY the contents of
 * `content`, without the wrapper: from `<meta name="google-site-verification"
 * content="abc123" />` you copy `abc123`.
 *
 * The tag is written on EVERY page, not just the home page — Google checks the
 * address it picks itself, and for domain ownership it doesn't apply anyway.
 */
export const GSC_VERIFY = import.meta.env.PUBLIC_GSC_VERIFY ?? '';

/**
 * WHETHER CHECKOUT IS LIVE. Off by default.
 *
 * The order page is static and cannot ask the worker whether there is a Stripe
 * key, and the text "payment isn't online yet" must disappear the moment
 * payment goes live. So one build-time flag controls the wording,
 * while the worker decides for itself by `STRIPE_SECRET_KEY`.
 *
 * At launch BOTH are raised: `PUBLIC_CHECKOUT=true` in the build and
 * `STRIPE_SECRET_KEY` in the Pages environment. Only one of them gives either a silent
 * page that promises payment, or the opposite.
 */
export const CHECKOUT_LIVE = import.meta.env.PUBLIC_CHECKOUT === 'true';

export const SITE = {
  name: 'PDK Tuning',
  locale: 'bg_BG',
  lang: 'bg',
  /**
   * The share image; made absolute against the domain in Head.astro.
   *
   * A SEPARATE FILE, not the hero frame. Facebook, LinkedIn, X and Slack crop to
   * 1.91 (1200×630); the hero is 1280×704 = 1.82 and each platform crops it itself
   * and differently. This one is cropped once, deliberately —
   * `node scripts/make-og.mjs`.
   */
  ogImage: '/img/og-pdk.jpg',
  ogImageW: 1200,
  ogImageH: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: 'Тъмно купе на стенда на PDK Tuning във Варна, осветено в зелено',
  themeColor: '#080808',
  /**
   * The brand has NO profile on X. `twitter:site` and `twitter:creator` are
   * deliberately ABSENT — an invented handle points to someone else's profile, and an empty attribute is invalid.
   * `twitter:card` works without them.
   */
  twitterHandle: '' as string,
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADDRESSES LIVE AT THE ROOT, IN LATIN LETTERS — and this is NOT a style decision.
 *
 * After the transfer this site sits on pdktuning.com while the old one stays
 * underneath: `/bg`, `/en`, `/images`, `/vendor`, `/js`, `/css`, `/uploads`,
 * `/storage` are PASSED THROUGH to it (see `passThrough` in public/_worker.js) so
 * that ~9,000 indexed addresses and the dealers' login don't break.
 *
 * So none of our pages may live under `/bg/` — it simply would not
 * reach us. Every new address is added here and checked so it doesn't overlap with the list
 * in the worker.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The sections ON THE HOME PAGE — anchors, not pages. */
export const SECTIONS = [
  { id: 'picker', label: 'Изберете автомобил' },
  { id: 'services', label: 'Услуги' },
  { id: 'faq', label: 'Въпроси' },
  { id: 'contact', label: 'Контакти' },
] as const;

export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

/** The main menu. The two dropdown groups are read from the data, so that
 *  there is no link to a service or category that doesn't exist. */
export const NAV: NavItem[] = [
  {
    href: '/uslugi/',
    label: 'Услуги',
    children: SERVICES.map((s) => ({ href: `/uslugi/${s.slug}/`, label: s.name })),
  },
  {
    href: '/katalog/',
    label: 'Каталог',
    children: [
      ...CATEGORIES.map((c) => ({ href: `/${c.slug}/`, label: c.name })),
      { href: '/elektricheski/', label: 'Електрически автомобили' },
      { href: '/katalog/', label: 'Всички марки' },
    ],
  },
  // Own entry in the bar, not only in the dropdown: this is the new
  // direction and the home page advert leads exactly here.
  { href: '/elektricheski/', label: 'Електрически автомобили' },
  { href: '/tseni/', label: 'Цени' },
  { href: '/kak-rabotim/', label: 'Как работим' },
  { href: '/za-nas/', label: 'За нас' },
  { href: '/kontakti/', label: 'Контакти' },
];

/** Second row of links — they sit in the bottom row, not in the bar. */
export const MORE = [
  { href: '/pdk-flasher/', label: 'Устройството PDK Flasher' },
  { href: '/vaprosi/', label: 'Въпроси и отговори' },
  { href: '/mit-fakt/', label: 'Мит и факт' },
  { href: '/blog/', label: 'Статии' },
  { href: '/za-dileri/', label: 'За дилъри и сервизи' },
] as const;

/** The legal pages: one place from which both the footer and the sitemap take them. */
export const LEGAL = [
  { href: '/privacy/', label: 'Поверителност' },
  { href: '/terms/', label: 'Общи условия' },
  { href: '/cookie-policy/', label: 'Политика за бисквитки' },
  { href: '/otkaz-i-reklamacii/', label: 'Отказ и рекламации' },
] as const;

/**
 * The company data. `legalAddress` is BUILT, not read from the file — see
 * `_legalAddress_todo` in business.json: a separate field meant legal pages
 * with the old address (ul. "Prilep" 164) — the client confirmed 96 and the field was dropped.
 */
export const BUSINESS = {
  ...business,
  legalAddress: `${business.address.street}, ${business.address.city} ${business.address.postalCode}`,
};

/**
 * ADDRESSES COME FROM `.env.local`, THEY ARE NOT HARDCODED. See the note in astro.config.mjs.
 *
 * `PDK_BASE_URL` / `PDK_CATALOG_URL` are baked in at build time by `vite.define` —
 * they are not `PUBLIC_`, so they do NOT reach the browser as variables, only as
 * the finished text of the links.
 */
export const BASE_URL = (import.meta.env.PDK_BASE_URL ?? '').replace(/\/+$/, '');
export const CATALOG_URL = (import.meta.env.PDK_CATALOG_URL ?? '').replace(/\/+$/, '');

/**
 * THE DEALER PORTAL — "Login", "Upload file", "Partner portal".
 *
 * The links go directly to the separate catalog address and keep the language in the path:
 * `files.pdktuning.com/<lang>/login`. This way login doesn't depend on the main site's
 * proxy, and the English version can use the same builder with `en`.
 *
 * `PORTAL_URL` remains as an explicit override for a temporary or other environment.
 */
export type PortalLanguage = 'bg' | 'en';

export const portalUrl = (lang: PortalLanguage) =>
  import.meta.env.PDK_PORTAL_URL || `${CATALOG_URL}/${lang}/login`;

export const PORTAL = portalUrl('bg');
