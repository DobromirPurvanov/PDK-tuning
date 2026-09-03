// Каталогът: 1 източник (src/data/catalog/*.json), изчисляваните стойности се смятат тук при билда.
import type { Lang } from '@/i18n';
import indexJson from '@/data/catalog-index.json';

export type Fuel = 'diesel' | 'petrol' | 'electric';
export interface Engine { path: string; name: string; fuel: Fuel; hpStock: number; hpTuned: number; nmStock: number | null; nmTuned: number | null; lastmod: string }
export interface Generation { slug: string; from: number; to: number | null; engines: Engine[] }
export interface Model { slug: string; name: string; generations: Generation[] }
export interface Brand { slug: string; name: string; logo: string | null; models: Model[] }
export interface BrandIndex { slug: string; name: string; logo: string | null; models: number; engines: number }

const files = import.meta.glob<Brand>('../data/catalog/*.json', { eager: true, import: 'default' });
export const brands: Brand[] = Object.values(files).sort((a, b) => a.name.localeCompare(b.name, 'en'));
export const brandIndex: BrandIndex[] = (indexJson as BrandIndex[]).slice().sort((a, b) => a.name.localeCompare(b.name, 'en'));
const bySlug = new Map(brands.map((b) => [b.slug, b]));
export const brandBySlug = (slug: string) => bySlug.get(slug);

export const enginesOfModel = (m: Model) => m.generations.flatMap((g) => g.engines);
export const enginesOfBrand = (b: Brand) => b.models.flatMap(enginesOfModel);
export const stats = (() => {
  let models = 0, generations = 0, engines = 0;
  for (const b of brands) { models += b.models.length; for (const m of b.models) { generations += m.generations.length; for (const g of m.generations) engines += g.engines.length; } }
  return { brands: brands.length, models, generations, engines };
})();

export const hpGain = (e: Engine) => e.hpTuned - e.hpStock;
export const nmGain = (e: Engine) => (e.nmStock != null && e.nmTuned != null ? e.nmTuned - e.nmStock : null);
export const hpPct = (e: Engine) => Math.round((hpGain(e) / e.hpStock) * 100);
export const avgGain = (list: Engine[]) => {
  if (!list.length) return { hp: 0, nm: 0 };
  const hp = Math.round(list.reduce((a, e) => a + hpGain(e), 0) / list.length);
  const withNm = list.filter((e) => nmGain(e) != null);
  const nm = withNm.length ? Math.round(withNm.reduce((a, e) => a + (nmGain(e) as number), 0) / withNm.length) : 0;
  return { hp, nm };
};
export const minMaxGain = (list: Engine[]) => ({ min: Math.min(...list.map(hpGain)), max: Math.max(...list.map(hpGain)) });
export const topGains = (list: Engine[], n = 5) => list.slice().sort((a, b) => hpGain(b) - hpGain(a)).slice(0, n);
export const dominantFuel = (list: Engine[]): Fuel => {
  const c: Record<string, number> = {}; for (const e of list) c[e.fuel] = (c[e.fuel] || 0) + 1;
  return (Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] as Fuel) || 'diesel';
};
export const yearSpan = (m: Model) => {
  const from = Math.min(...m.generations.map((g) => g.from).filter((y) => y > 0));
  const tos = m.generations.map((g) => g.to);
  const to = tos.some((t) => t == null) ? null : Math.max(...(tos as number[]));
  return { from: Number.isFinite(from) ? from : 0, to };
};
// Името на двигателя без „204hp“ накрая — мощността се показва отделно, с мерна единица на езика
export const engineLabel = (e: Engine) => e.name.replace(/\s*\d+\s*hp\s*$/i, '').replace(/[\s-]+$/, '').replace(/\s+-\s+/g, ' · ').trim() || e.name;

export const brandPath = (lang: Lang, b: Pick<Brand, 'slug'>) => `/${lang}/${b.slug}`;
export const modelPath = (lang: Lang, b: Pick<Brand, 'slug'>, m: Pick<Model, 'slug'>) => `/${lang}/${b.slug}/${m.slug}`;
export const genPath = (lang: Lang, b: Pick<Brand, 'slug'>, m: Pick<Model, 'slug'>, g: Pick<Generation, 'slug'>) => `/${lang}/${b.slug}/${m.slug}/${g.slug}`;
export const enginePath = (lang: Lang, b: Pick<Brand, 'slug'>, m: Pick<Model, 'slug'>, g: Pick<Generation, 'slug'>, e: Pick<Engine, 'path'>) => `/${lang}/${b.slug}/${m.slug}/${g.slug}/${e.path}`;

// Правило 02 от стр. 11: дизел → DPF, EGR, AdBlue; бензин → Lambda, V-MAX, DTC. Автоматично, не ръчно.
export const servicesForFuel = (fuel: Fuel): string[] => (fuel === 'diesel' ? ['dpf-fap', 'egr', 'adblue'] : fuel === 'petrol' ? ['lambda', 'v-max', 'dtc'] : ['dtc', 'v-max', 'maf']);

// Всички генерирани адреси на един език — за картите на сайта и за проверките
export function allCatalogPaths(lang: Lang) {
  const out = { brands: [] as { path: string; lastmod: string }[], models: [] as { path: string; lastmod: string }[], generations: [] as { path: string; lastmod: string }[], engines: [] as { path: string; lastmod: string }[] };
  const max = (list: Engine[]) => list.reduce((a, e) => (e.lastmod > a ? e.lastmod : a), '1970-01-01');
  for (const b of brands) {
    out.brands.push({ path: brandPath(lang, b), lastmod: max(enginesOfBrand(b)) });
    for (const m of b.models) {
      out.models.push({ path: modelPath(lang, b, m), lastmod: max(enginesOfModel(m)) });
      for (const g of m.generations) {
        out.generations.push({ path: genPath(lang, b, m, g), lastmod: max(g.engines) });
        for (const e of g.engines) out.engines.push({ path: enginePath(lang, b, m, g, e), lastmod: e.lastmod });
      }
    }
  }
  return out;
}
