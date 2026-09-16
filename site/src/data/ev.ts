/**
 * ЕЛЕКТРИЧЕСКИТЕ АВТОМОБИЛИ — нашата оферта.
 *
 * Разделението тук е важно и нарочно:
 *
 *   `ev-source.json`  ФАКТИТЕ ЗА КОЛАТА — име, години, фабрична мощност и
 *                     докъде стига управляващият блок. Събрани от mapev.net
 *                     с `node scripts/mapev.mjs`. Това НЕ са наши числа.
 *
 *   `OURS` (тук)      НАШАТА ОФЕРТА — цена, нашата мощност и момент след
 *                     записа. Попълва се на ръка. Празно поле значи „още не е
 *                     обявено“ и страницата го казва честно, вместо да покаже
 *                     чуждо число като свое.
 *
 * ЗАЩО ТАКА. MapEV продават СМЯНА НА МОДУЛА — ново управляващо тяло, което се
 * монтира вместо фабричното и се обновява с техен софтуер и ENET кабел. Ние
 * продаваме СВОЙ файл, записан през PDK Flasher по OBD-II. Двете неща не дават
 * едни и същи числа и не струват едни и същи пари. Затова тяхната цена стои
 * само в справката, за ориентир, и никъде не се показва на сайта.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * КАК СЕ ПОПЪЛВА (Добо)
 *
 *   'taycan-4': { price: 2400, ps: 640, nm: 660 },
 *
 *   price  цената за клиента В ЕВРО, с ДДС — както в prices.json, за да не
 *          стоят две валути на един сайт. Празно → „Цена по запитване“.
 *   ps     мощността в нормален режим СЛЕД нашия файл, к.с. Празно → показва
 *          се само фабричното число и таванът на блока.
 *   nm     въртящият момент след нашия файл, Nm. Празно → същото.
 *   off    `true` маха модела от сайта (още не го поемаме).
 *
 * Редът в коментара е „фабрично → таван на блока“ — таванът е фактът докъде
 * пуска блокът, а не обещание какво ще извадим ние.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import source from './ev-source.json';

export type Our = {
  /** евро с ДДС */
  price?: number;
  /** к.с. в нормален режим след нашия файл */
  ps?: number;
  /** Nm след нашия файл */
  nm?: number;
  /** не го поемаме още — не се показва никъде */
  off?: boolean;
};

export const OURS: Record<string, Our> = {
  // ── Porsche ──────────────────────────────────────────────────────────────
  'porsche-taycan-turbo-s':   {},    // Taycan Turbo S 2019–2024  ·  625 → 800 к.с.
  'taycan-turbo':             {},    // Taycan Turbo 2019–2024  ·  625 → 800 к.с.
  'taycan-pb-plus':           {},    // Taycan PB+ 2019–2024  ·  380 → 480 к.с.
  'taycan-pb':                {},    // Taycan PB 2019–2024  ·  326 → 480 к.с.
  'taycan-gts':               {},    // Taycan GTS 2019–2024  ·  510 → 800 к.с.
  'taycan-4s-pb-plus':        {},    // Taycan 4S PB+ 2019–2024  ·  489 → 730 к.с.
  'taycan-4s-pb':             {},    // Taycan 4S PB 2019–2024  ·  435 → 630 к.с.
  'taycan-4':                 {},    // Taycan 4 2019–2024  ·  380 → 730 к.с.
  'taycan-turbo-s-fl':        {},    // Taycan Turbo S 2024–  ·  775 → 1080 к.с.
  'taycan-turbo-gt':          {},    // Taycan Turbo GT 2024–  ·  789 → 1177 к.с.
  'taycan-turbo-fl':          {},    // Taycan Turbo 2024–  ·  707 → 940 к.с.
  'taycan-pb-plus-fl':        {},    // Taycan PB+ 2024–  ·  435 → 670 к.с.
  'taycan-pb-fl':             {},    // Taycan PB 2024–  ·  410 → 670 к.с.
  'taycan-gts-fl':            {},    // Taycan GTS 2024–  ·  605 → 940 к.с.
  'taycan-4s-pb-plus-fl':     {},    // Taycan 4S PB+ 2024–  ·  517 → 940 к.с.
  'taycan-4-pb-plus-fl':      {},    // Taycan 4 PB+ 2024–  ·  435 → 940 к.с.

  // ── Audi ─────────────────────────────────────────────────────────────────
  'rs-e-tron-gt':             {},    // RS e-tron GT 2020–2024  ·  598 → 800 к.с.
  'e-tron-gt':                {},    // e-tron GT 2020–2024  ·  476 → 730 к.с.
  'q4-e-tron-45':             {},    // Q4 e-tron 45 2021–2024  ·  265 → 300 к.с.
  'q4-e-tron-35':             {},    // Q4 e-tron 35 2021–2024  ·  170 → 204 к.с.
  'e-tron-gt-fl':             {},    // S e-tron GT 2024–  ·  591 → 940 к.с.
  'rs-e-tron-gt-performance': {},    // RS e-tron GT Performance 2024–  ·  748 → 1080 к.с.
  'rs-e-tron-gt-fl':          {},    // RS e-tron GT 2024–  ·  680 → 940 к.с.
  'e-tron-gt-quattro':        {},    // e-tron GT quattro 2025–  ·  503 → 940 к.с.

  // ── Volkswagen ───────────────────────────────────────────────────────────
  'id5-pro':                  {},    // ID.5 Pro 2021–2024  ·  174 → 204 к.с.
  'id4-pure-performance':     {},    // ID.4 Pure Performance 2021–2024  ·  170 → 204 к.с.
  'id4-pure':                 {},    // ID.4 Pure 2021–2024  ·  148 → 204 к.с.
  'id4-pro':                  {},    // ID.4 Pro 2021–2024  ·  174 → 204 к.с.
  'id3-pure-performance':     {},    // ID.3 Pure Performance 2021–2024  ·  150 → 204 к.с.
  'id-3-pro':                 {},    // ID.3 Pro 2021–2024  ·  145 → 204 к.с.

  // ── Škoda ────────────────────────────────────────────────────────────────
  'enyaq-iv-80x':             {},    // Enyaq iV 80x 2021–2024  ·  265 → 300 к.с.
  'enyaq-iv-60':              {},    // Enyaq iV 60 2021–2024  ·  180 → 204 к.с.
  'enyaq-iv-50':              {},    // Enyaq iV 50 2021–2024  ·  148 → 204 к.с.
};

/** Марките с електрически модели. `mark` е файлът в public/marks. */
export const EV_BRANDS = [
  { key: 'porsche', mark: 'porsche', name: 'Porsche' },
  { key: 'audi', mark: 'audi', name: 'Audi' },
  { key: 'vw', mark: 'volkswagen', name: 'Volkswagen' },
  { key: 'skoda', mark: 'skoda', name: 'Škoda' },
] as const;

/** Ключът е низ нарочно: `brand` в ev-source.json е обикновен текст, а не
 *  съюз от четирите наши ключа. Непозната марка се показва както е записана. */
export const BRAND_NAME = new Map<string, string>(EV_BRANDS.map((b) => [b.key, b.name]));

type Row = (typeof source.models)[number];

export type EvModel = {
  slug: string;
  brand: string;
  brandName: string;
  /** „Porsche Taycan 4“ — за заглавия и за полето „Автомобил“ в запитването */
  full: string;
  name: string;
  years: string;
  /** фабрично, нормален режим */
  stockPs: number;
  stockNm: number;
  /** докъдето пуска блокът — факт за колата, не наше обещание */
  ceilingPs: number;
  ceilingNm: number;
  our: Our;
  /** имаме ли обявени числа за този модел */
  hasOurs: boolean;
  /** какво показваме като „след“: нашето, ако го има */
  ps: number | null;
  nm: number | null;
  /** печалбата спрямо фабричното, когато има наши числа */
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

/** Всички модели, които поемаме, подредени по марка и по година. */
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

/** Групирани за избирача: марка → моделите ѝ. */
export const EV_BY_BRAND = EV_BRANDS.map((b) => ({
  ...b,
  models: EV_MODELS.filter((m) => m.brand === b.key),
})).filter((b) => b.models.length > 0);

/** Най-голямата разлика между фабрично и таван — числото в рекламата. */
export const EV_BEST = EV_MODELS.reduce(
  (best, m) => (m.ceilingPs - m.stockPs > best.ceilingPs - best.stockPs ? m : best),
  EV_MODELS[0],
);

export const EV_COUNT = EV_MODELS.length;

export const EV_CURRENCY = 'EUR';

/** Цената в четим вид. Празна цена НЕ се измисля. */
export const money = (eur: number | null) =>
  eur == null ? 'Цена по запитване' : `${eur.toLocaleString('bg-BG')} €`;
