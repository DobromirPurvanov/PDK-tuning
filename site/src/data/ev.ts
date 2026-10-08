/**
 * THE ELECTRIC CARS — our offer.
 *
 * The split here is important and deliberate:
 *
 *   `ev-source.json`  THE FACTS ABOUT THE CAR — name, years, factory power and
 *                     how far the control unit goes. Collected from mapev.net
 *                     with `node scripts/mapev.mjs`. These are NOT our numbers.
 *
 *   `OURS` (here)     OUR OFFER — price, our power and torque after
 *                     the write. Filled in by hand. An empty field means "not yet
 *                     announced" and the page says so honestly, instead of showing
 *                     someone else's number as its own.
 *
 * WHY THIS WAY. MapEV sell a MODULE SWAP — a new control unit that is
 * installed instead of the factory one and updated with their software and an ENET cable. We
 * sell OUR OWN file, written through PDK Flasher over OBD-II. The two things don't give
 * the same numbers and don't cost the same money. That is why their price sits
 * only in the reference, as a guide, and is never shown on the site.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW TO FILL IT IN (Dobo)
 *
 *   'taycan-4': { price: 2400, ps: 640, nm: 660 },
 *
 *   price  the customer price IN EUROS, incl. VAT — as in prices.json, so that
 *          two currencies don't sit on one site. Empty → "Price on request".
 *   ps     power in normal mode AFTER our file, hp. Empty → only
 *          the factory number and the unit's ceiling are shown.
 *   nm     torque after our file, Nm. Empty → same.
 *   off    `true` removes the model from the site (we don't take it on yet).
 *
 * The order in the comment is "factory → unit ceiling" — the ceiling is the fact of how far
 * the unit allows, not a promise of what we will deliver.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import source from './ev-source.json';

export type Our = {
  /** euro incl. VAT */
  price?: number;
  /** hp in normal mode after our file */
  ps?: number;
  /** Nm after our file */
  nm?: number;
  /** we don't take it on yet — not shown anywhere */
  off?: boolean;
};

export const OURS: Record<string, Our> = {
  // ── Porsche ──────────────────────────────────────────────────────────────
  'porsche-taycan-turbo-s':   {},    // Taycan Turbo S 2019–2024  ·  625 → 800 hp
  'taycan-turbo':             {},    // Taycan Turbo 2019–2024  ·  625 → 800 hp
  'taycan-pb-plus':           {},    // Taycan PB+ 2019–2024  ·  380 → 480 hp
  'taycan-pb':                {},    // Taycan PB 2019–2024  ·  326 → 480 hp
  'taycan-gts':               {},    // Taycan GTS 2019–2024  ·  510 → 800 hp
  'taycan-4s-pb-plus':        {},    // Taycan 4S PB+ 2019–2024  ·  489 → 730 hp
  'taycan-4s-pb':             {},    // Taycan 4S PB 2019–2024  ·  435 → 630 hp
  'taycan-4':                 {},    // Taycan 4 2019–2024  ·  380 → 730 hp
  'taycan-turbo-s-fl':        {},    // Taycan Turbo S 2024–  ·  775 → 1080 hp
  'taycan-turbo-gt':          {},    // Taycan Turbo GT 2024–  ·  789 → 1177 hp
  'taycan-turbo-fl':          {},    // Taycan Turbo 2024–  ·  707 → 940 hp
  'taycan-pb-plus-fl':        {},    // Taycan PB+ 2024–  ·  435 → 670 hp
  'taycan-pb-fl':             {},    // Taycan PB 2024–  ·  410 → 670 hp
  'taycan-gts-fl':            {},    // Taycan GTS 2024–  ·  605 → 940 hp
  'taycan-4s-pb-plus-fl':     {},    // Taycan 4S PB+ 2024–  ·  517 → 940 hp
  'taycan-4-pb-plus-fl':      {},    // Taycan 4 PB+ 2024–  ·  435 → 940 hp

  // ── Audi ─────────────────────────────────────────────────────────────────
  'rs-e-tron-gt':             {},    // RS e-tron GT 2020–2024  ·  598 → 800 hp
  'e-tron-gt':                {},    // e-tron GT 2020–2024  ·  476 → 730 hp
  'q4-e-tron-45':             {},    // Q4 e-tron 45 2021–2024  ·  265 → 300 hp
  'q4-e-tron-35':             {},    // Q4 e-tron 35 2021–2024  ·  170 → 204 hp
  'e-tron-gt-fl':             {},    // S e-tron GT 2024–  ·  591 → 940 hp
  'rs-e-tron-gt-performance': {},    // RS e-tron GT Performance 2024–  ·  748 → 1080 hp
  'rs-e-tron-gt-fl':          {},    // RS e-tron GT 2024–  ·  680 → 940 hp
  'e-tron-gt-quattro':        {},    // e-tron GT quattro 2025–  ·  503 → 940 hp

  // ── Volkswagen ───────────────────────────────────────────────────────────
  'id5-pro':                  {},    // ID.5 Pro 2021–2024  ·  174 → 204 hp
  'id4-pure-performance':     {},    // ID.4 Pure Performance 2021–2024  ·  170 → 204 hp
  'id4-pure':                 {},    // ID.4 Pure 2021–2024  ·  148 → 204 hp
  'id4-pro':                  {},    // ID.4 Pro 2021–2024  ·  174 → 204 hp
  'id3-pure-performance':     {},    // ID.3 Pure Performance 2021–2024  ·  150 → 204 hp
  'id-3-pro':                 {},    // ID.3 Pro 2021–2024  ·  145 → 204 hp

  // ── Škoda ────────────────────────────────────────────────────────────────
  'enyaq-iv-80x':             {},    // Enyaq iV 80x 2021–2024  ·  265 → 300 hp
  'enyaq-iv-60':              {},    // Enyaq iV 60 2021–2024  ·  180 → 204 hp
  'enyaq-iv-50':              {},    // Enyaq iV 50 2021–2024  ·  148 → 204 hp
};

/** The brands with electric models. `mark` is the file in public/marks. */
export const EV_BRANDS = [
  { key: 'porsche', mark: 'porsche', name: 'Porsche' },
  { key: 'audi', mark: 'audi', name: 'Audi' },
  { key: 'vw', mark: 'volkswagen', name: 'Volkswagen' },
  { key: 'skoda', mark: 'skoda', name: 'Škoda' },
] as const;

/** The key is a string on purpose: `brand` in ev-source.json is plain text, not a
 *  union of our four keys. An unknown brand is shown as it is written. */
export const BRAND_NAME = new Map<string, string>(EV_BRANDS.map((b) => [b.key, b.name]));

type Row = (typeof source.models)[number];

export type EvModel = {
  slug: string;
  brand: string;
  brandName: string;
  /** "Porsche Taycan 4" — for headings and for the "Car" field in the enquiry */
  full: string;
  name: string;
  years: string;
  /** factory, normal mode */
  stockPs: number;
  stockNm: number;
  /** how far the unit allows — a fact about the car, not our promise */
  ceilingPs: number;
  ceilingNm: number;
  our: Our;
  /** do we have announced numbers for this model */
  hasOurs: boolean;
  /** what we show as "after": ours, if we have it */
  ps: number | null;
  nm: number | null;
  /** the gain over factory, when we have our numbers */
  gainPs: number | null;
  gainNm: number | null;
  price: number | null;
  href: string;
};

function build(r: Row): EvModel {
  const our = OURS[r.slug] ?? {};
  const brandName = BRAND_NAME.get(r.brand) ?? r.brand;
  const ps = our.ps ?? null;
  const nm = our.nm ?? null;
  return {
    slug: r.slug,
    brand: r.brand,
    brandName,
    full: `${brandName} ${r.name}`,
    name: r.name,
    years: r.years!,
    stockPs: r.normal.ps!,
    stockNm: r.normal.nm!,
    ceilingPs: r.mapev.ps!,
    ceilingNm: r.mapev.nm!,
    our,
    hasOurs: ps != null,
    ps,
    nm,
    gainPs: ps != null ? ps - r.normal.ps! : null,
    gainNm: nm != null ? nm - r.normal.nm! : null,
    price: our.price ?? null,
    href: `/elektricheski/${r.slug}/`,
  };
}

/** All the models we take on, ordered by brand and by year. */
export const EV_MODELS: EvModel[] = source.models
  .filter((r) => !(OURS[r.slug]?.off))
  .map(build)
  .sort(
    (a, b) =>
      EV_BRANDS.findIndex((x) => x.key === a.brand) - EV_BRANDS.findIndex((x) => x.key === b.brand) ||
      a.years.localeCompare(b.years) ||
      a.name.localeCompare(b.name),
  );

export const EV_BY_SLUG = new Map(EV_MODELS.map((m) => [m.slug, m]));

/** Grouped for the picker: brand → its models. */
export const EV_BY_BRAND = EV_BRANDS.map((b) => ({
  ...b,
  models: EV_MODELS.filter((m) => m.brand === b.key),
})).filter((b) => b.models.length > 0);

/** The biggest difference between factory and ceiling — the number in the advert. */
export const EV_BEST = EV_MODELS.reduce(
  (best, m) => (m.ceilingPs - m.stockPs > best.ceilingPs - best.stockPs ? m : best),
  EV_MODELS[0],
);

export const EV_COUNT = EV_MODELS.length;

export const EV_CURRENCY = 'EUR';

/** The price in readable form. An empty price is NOT invented. */
export const money = (eur: number | null) =>
  eur == null ? 'Цена по запитване' : `${eur.toLocaleString('bg-BG')} €`;
