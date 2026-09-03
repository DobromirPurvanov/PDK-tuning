// Формулите за заглавия и описания (план, стр. 21) и структурираните данни (стр. 30).
import type { Lang } from '@/i18n';
import { fmt, years, routes } from '@/i18n';
import business from '@/data/business.json';
import prices from '@/data/prices.json';
import { type Brand, type Model, type Generation, type Engine, hpGain, nmGain, avgGain, minMaxGain, enginesOfBrand, enginesOfModel, engineLabel, yearSpan, topGains } from './catalog';

export const SITE = 'https://www.pdktuning.com';
const hpU = (lang: Lang) => (lang === 'bg' ? 'к.с.' : 'hp');

// Описанието трябва да е между 80 и 165 знака. Взима се първият вариант, който се събира; никога празен слот.
export function fit(variants: string[], lang: Lang): string {
  const tail = lang === 'bg' ? ' Замерване на стенд във Варна.' : ' Measured on our dyno in Varna.';
  for (const v of variants) { if (v.length >= 80 && v.length <= 165) return v; }
  for (const v of variants) { const w = v + tail; if (w.length >= 80 && w.length <= 165) return w; }
  const v = variants[0] + tail;
  return v.length > 165 ? v.slice(0, 162).replace(/\s\S*$/, '') + '…' : v;
}

export const titles = {
  brand: (lang: Lang, b: Brand) => lang === 'bg' ? `Чип тунинг ${b.name} — всички модели | PDK Tuning Варна` : `Chip tuning ${b.name} — all models | PDK Tuning Varna`,
  model: (lang: Lang, b: Brand, m: Model) => lang === 'bg' ? `Чип тунинг ${b.name} ${m.name} — мощност и цена | PDK Tuning` : `Chip tuning ${b.name} ${m.name} — power and price | PDK Tuning`,
  gen: (lang: Lang, b: Brand, m: Model, g: Generation) => lang === 'bg' ? `Чип тунинг ${b.name} ${m.name} (${years(g.from, g.to, lang)}) | PDK Tuning` : `Chip tuning ${b.name} ${m.name} (${years(g.from, g.to, lang)}) | PDK Tuning`,
  engine: (lang: Lang, b: Brand, m: Model, g: Generation, e: Engine) => lang === 'bg'
    ? `Чип тунинг ${b.name} ${m.name} ${engineLabel(e)} ${e.hpStock} → ${e.hpTuned} к.с. (${years(g.from, g.to, lang)})`
    : `Chip tuning ${b.name} ${m.name} ${engineLabel(e)} ${e.hpStock} → ${e.hpTuned} hp (${years(g.from, g.to, lang)})`,
};

export const descriptions = {
  brand: (lang: Lang, b: Brand) => {
    const list = enginesOfBrand(b); const avg = avgGain(list);
    return fit(lang === 'bg'
      ? [`${b.name}: ${fmt(b.models.length)} модела, ${fmt(list.length)} двигателя. Среден ръст +${avg.hp} к.с. Замерване на стенд във Варна. Виж числата за твоята кола.`]
      : [`${b.name}: ${fmt(b.models.length)} models, ${fmt(list.length)} engines with stock and tuned figures. Average gain +${avg.hp} hp. Dyno-measured in Varna. See the numbers for your car.`], lang);
  },
  model: (lang: Lang, b: Brand, m: Model) => {
    const list = enginesOfModel(m); const mm = minMaxGain(list); const ys = yearSpan(m);
    return fit(lang === 'bg'
      ? [`${b.name} ${m.name}: ${m.generations.length} поколения, ${list.length} двигателя, ${years(ys.from, ys.to, lang)}. Ръст между +${mm.min} и +${mm.max} к.с. Замерване на стенд във Варна.`,
         `${b.name} ${m.name}: ${list.length} двигателя с числа преди и след чип тунинг, ${years(ys.from, ys.to, lang)}. Ръст до +${mm.max} к.с. Стенд във Варна.`]
      : [`${b.name} ${m.name}: ${m.generations.length} generations, ${list.length} engines, ${years(ys.from, ys.to, lang)}. Gains between +${mm.min} and +${mm.max} hp. Dyno-measured in Varna, file service for workshops.`,
         `${b.name} ${m.name}: ${list.length} engines with stock and tuned figures, ${years(ys.from, ys.to, lang)}. Gains up to +${mm.max} hp. Dyno in Varna.`], lang);
  },
  gen: (lang: Lang, b: Brand, m: Model, g: Generation) => {
    const best = topGains(g.engines, 1)[0];
    return fit(lang === 'bg'
      ? [`${b.name} ${m.name} ${years(g.from, g.to, lang)}: ${g.engines.length} двигателя с числа преди и след чип тунинг. Най-голям ръст: ${engineLabel(best)} +${hpGain(best)} к.с. Стенд във Варна.`]
      : [`${b.name} ${m.name} ${years(g.from, g.to, lang)}: ${g.engines.length} engines with stock and tuned figures. Biggest gain: ${engineLabel(best)} +${hpGain(best)} hp. Dyno in Varna, file service for workshops.`], lang);
  },
  engine: (lang: Lang, b: Brand, m: Model, g: Generation, e: Engine) => {
    const nm = nmGain(e); const nmPart = nm != null && nm > 0 ? (lang === 'bg' ? ` и +${nm} Nm` : ` and +${nm} Nm`) : '';
    return fit(lang === 'bg'
      ? [`+${hpGain(e)} к.с.${nmPart} за ${b.name} ${m.name} ${engineLabel(e)}: ${e.hpStock} → ${e.hpTuned} к.с. (${years(g.from, g.to, lang)}). Измерено на стенд във Варна. Цена, време и час.`,
         `${b.name} ${m.name} ${engineLabel(e)} (${years(g.from, g.to, lang)}): ${e.hpStock} → ${e.hpTuned} к.с., +${hpGain(e)} к.с.${nmPart}. Измерено на стенд във Варна.`]
      : [`+${hpGain(e)} hp${nmPart} for ${b.name} ${m.name} ${engineLabel(e)}: ${e.hpStock} → ${e.hpTuned} hp (${years(g.from, g.to, lang)}). Dyno-measured in Varna. Price, turnaround and file service.`,
         `${b.name} ${m.name} ${engineLabel(e)} (${years(g.from, g.to, lang)}): ${e.hpStock} → ${e.hpTuned} hp, +${hpGain(e)} hp${nmPart}. Dyno-measured in Varna, file service for workshops.`], lang);
  },
};

// ---------- структурирани данни ----------
const addr = (lang: Lang) => ({ '@type': 'PostalAddress', streetAddress: lang === 'bg' ? business.address.street : business.address.streetEn, addressLocality: lang === 'bg' ? business.address.city : business.address.cityEn, postalCode: business.address.postalCode, addressCountry: business.address.country });
export const ldOrganization = (lang: Lang) => ({ '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE + '/#org', name: business.name, legalName: business.legalName, url: SITE + routes.home[lang], logo: SITE + '/pdk-logo.jpg', telephone: business.phone, address: addr(lang), sameAs: [business.social.facebook, business.social.instagram, business.social.youtube] });
export const ldLocalBusiness = (lang: Lang) => ({ '@context': 'https://schema.org', '@type': 'AutoRepair', '@id': SITE + '/#local', name: business.name, image: SITE + '/pdk-logo.jpg', url: SITE + routes.home[lang], telephone: business.phone, priceRange: '€€', address: addr(lang), geo: { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng }, openingHoursSpecification: business.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })), aggregateRating: { '@type': 'AggregateRating', ratingValue: business.rating.value, reviewCount: business.rating.count }, sameAs: [business.social.facebook, business.social.instagram, business.social.youtube, business.social.maps] });
export const ldWebSite = (lang: Lang) => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + routes.home[lang], name: business.name, inLanguage: lang, publisher: { '@id': SITE + '/#org' } });
export const ldService = (lang: Lang, name: string, description: string, path: string, priceFrom?: number) => ({ '@context': 'https://schema.org', '@type': 'Service', name, description, url: SITE + path, serviceType: name, areaServed: { '@type': 'City', name: lang === 'bg' ? 'Варна' : 'Varna' }, provider: { '@id': SITE + '/#local' }, ...(priceFrom ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: String(priceFrom), priceSpecification: { '@type': 'PriceSpecification', minPrice: priceFrom, priceCurrency: 'EUR' } } } : {}) });
export const ldBreadcrumb = (items: { name: string; path: string }[]) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE + it.path })) });
export const ldFaq = (qa: { q: string; a: string }[]) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qa.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });
export const ldCollection = (lang: Lang, name: string, path: string, count: number) => ({ '@context': 'https://schema.org', '@type': 'CollectionPage', name, url: SITE + path, inLanguage: lang, isPartOf: { '@id': SITE + '/#site' }, numberOfItems: count });
export const ldProduct = (lang: Lang, b: Brand, m: Model, g: Generation, e: Engine, path: string) => ({
  '@context': 'https://schema.org', '@type': 'Product', name: titles.engine(lang, b, m, g, e).replace(/ \(.*\)$/, ''), url: SITE + path, brand: { '@type': 'Brand', name: b.name }, category: lang === 'bg' ? 'Чип тунинг' : 'Chip tuning',
  description: descriptions.engine(lang, b, m, g, e),
  additionalProperty: [
    { '@type': 'PropertyValue', name: lang === 'bg' ? 'Мощност преди' : 'Power stock', value: `${e.hpStock} ${hpU(lang)}` },
    { '@type': 'PropertyValue', name: lang === 'bg' ? 'Мощност след' : 'Power tuned', value: `${e.hpTuned} ${hpU(lang)}` },
    ...(e.nmStock != null ? [{ '@type': 'PropertyValue', name: lang === 'bg' ? 'Момент преди' : 'Torque stock', value: `${e.nmStock} Nm` }] : []),
    ...(e.nmTuned != null ? [{ '@type': 'PropertyValue', name: lang === 'bg' ? 'Момент след' : 'Torque tuned', value: `${e.nmTuned} Nm` }] : []),
  ],
  offers: { '@type': 'Offer', priceCurrency: prices.currency, price: String(prices.items['chip-tuning'].from), availability: 'https://schema.org/InStock', url: SITE + path, seller: { '@id': SITE + '/#local' } },
});
