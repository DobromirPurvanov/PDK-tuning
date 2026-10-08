/**
 * Structured data — in one place, so it does not drift between pages.
 *
 * TWO RULES that are not to be broken:
 *  1. `FAQPage` applies ONLY when the answer is visible on the page. Schema
 *     with questions that are not in the text is grounds for a manual penalty.
 *  2. The Google rating is NOT marked up. Self-rating without visible reviews
 *     is against the rules — which is why `aggregateRating` does not exist here.
 */
import business from '../data/business.json';
import type { Lang } from '../i18n';

export const bizId = (site: string) => `${site}/#business`;

/**
 * The company address for the schema.
 *
 * The Latin form is NOT transliteration on the fly — it lives in `business.json`
 * as `streetEn` / `cityEn`, because "ул. „Прилеп“ 96" has exactly one correct
 * English form and it was decided once, by a human.
 */
const postal = (lang: Lang) => ({
  '@type': 'PostalAddress',
  streetAddress: lang === 'en' ? business.address.streetEn : business.address.street,
  addressLocality: lang === 'en' ? business.address.cityEn : business.address.city,
  postalCode: business.address.postalCode,
  addressCountry: business.address.country,
});

/**
 * Picks a description that fits in 120–158 characters.
 *
 * Needed because the make description templates embed the name: "BMW" and
 * "Mercedes-Benz Trucks" give the same text with a 20-character difference.
 * Google cuts at about 155–160 and a truncated sentence looks unfinished.
 *
 * Variants are passed FROM LONGEST TO SHORTEST. The first one that fits is
 * returned; if none fits, the last is returned — shorter text is the lesser
 * evil compared with truncated. No ellipsis shortening: it produces sentences
 * that no human wrote.
 */
export const pickDesc = (...variants: string[]): string => pick(158, variants);

/**
 * The same for the title, with a 60-character ceiling.
 *
 * Google cuts by PIXEL width (~600px), not by character count, but Cyrillic is
 * roughly as wide as Latin and 60 is a good working measure. The brand stays at
 * the end of every variant — it is what must survive truncation.
 */
export const pickTitle = (...variants: string[]): string => pick(60, variants);

const pick = (max: number, variants: string[]): string => {
  for (const v of variants) {
    const s = v.replace(/\s+/g, ' ').trim();
    if (s.length <= max) return s;
  }
  return variants[variants.length - 1].replace(/\s+/g, ' ').trim();
};

/** the trail as schema; `trail` is the same list that is also visible */
export const crumbSchema = (site: string, trail: { href: string; label: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: `${site}${c.href}`,
  })),
});

/** the questions — included ONLY if the same questions are in the page text */
export const faqSchema = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const serviceSchema = (
  site: string,
  s: { name: string; description: string; slug: string },
  price?: { from: number; currency: string },
  lang: Lang = 'bg',
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.name,
  description: s.description,
  url: lang === 'en' ? `${site}/en/services/${s.slug}/` : `${site}/uslugi/${s.slug}/`,
  serviceType: s.name,
  provider: { '@id': bizId(site) },
  areaServed: { '@type': 'City', name: lang === 'en' ? business.address.cityEn : business.address.city },
  ...(price
    ? {
        offers: {
          '@type': 'Offer',
          price: price.from,
          priceCurrency: price.currency,
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: price.from,
            priceCurrency: price.currency,
            valueAddedTaxIncluded: true,
          },
        },
      }
    : {}),
});

/**
 * The tuning package for a specific electric model.
 *
 * `Product`, not `Service`, because there is one model, one price and it is
 * bought with a button. `offers` is written ONLY when the price is announced —
 * Google rejects an offer without a price as invalid, and an invented price is
 * worse than a missing one.
 */
export const evPackageSchema = (
  site: string,
  p: { slug: string; name: string; description: string; brand: string },
  price?: { value: number; currency: string },
) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.description,
  url: `${site}/elektricheski/${p.slug}/`,
  category: 'Чип тунинг за електрически автомобили',
  brand: { '@type': 'Brand', name: business.name },
  isRelatedTo: { '@type': 'Vehicle', brand: { '@type': 'Brand', name: p.brand } },
  ...(price
    ? {
        offers: {
          '@type': 'Offer',
          price: price.value,
          priceCurrency: price.currency,
          availability: 'https://schema.org/InStock',
          url: `${site}/elektricheski/${p.slug}/`,
          seller: { '@id': bizId(site) },
        },
      }
    : {}),
});

export const articleSchema = (
  site: string,
  a: { slug: string; h1: string; description: string; date: string },
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.h1,
  description: a.description,
  url: `${site}/blog/${a.slug}/`,
  datePublished: a.date,
  dateModified: a.date,
  inLanguage: 'bg-BG',
  image: `${site}/img/pdk-hero.jpg`,
  author: { '@type': 'Organization', name: business.name, url: `${site}/` },
  publisher: { '@id': bizId(site) },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${site}/blog/${a.slug}/` },
});

/**
 * The short business card — sits on the inner pages so they point to the business.
 *
 * `@id` is ONE AND THE SAME in both languages (`<site>/#business`) and that is
 * deliberate: the company is one. The schema describes the shop, not the page —
 * two different identifiers would turn one shop into two for Google.
 */
export const bizRef = (site: string, lang: Lang = 'bg') => ({
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  '@id': bizId(site),
  name: business.name,
  legalName: business.legalName,
  url: `${site}/`,
  telephone: business.phoneIntl,
  email: business.email,
  // an empty identifier is NOT written — better missing than lying
  ...(business.eik ? { identifier: business.eik, taxID: business.eik } : {}),
  ...(business.vat ? { vatID: business.vat } : {}),
  address: postal(lang),
});
