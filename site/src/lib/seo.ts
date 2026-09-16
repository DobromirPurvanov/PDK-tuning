/**
 * Структурираните данни — на едно място, за да не се разминават между страниците.
 *
 * ДВЕ ПРАВИЛА, които не се нарушават:
 *  1. `FAQPage` важи САМО когато отговорът се вижда на страницата. Схема с
 *     въпроси, които ги няма в текста, е повод за ръчна санкция.
 *  2. Оценката от Google НЕ се маркира. Самооценка без видими отзиви е против
 *     правилата — затова `aggregateRating` не съществува тук.
 */
import business from '../data/business.json';

export const bizId = (site: string) => `${site}/#business`;

/**
 * Избира описание, което се побира в 120–158 знака.
 *
 * Нужно е, защото шаблонните описания на марките вграждат името: „BMW“ и
 * „Mercedes-Benz Trucks“ дават еднакъв текст с 20 знака разлика. Google реже
 * около 155–160 и отрязаното изречение изглежда като недовършена работа.
 *
 * Подават се вариантите ОТ НАЙ-ДЪЛГИЯ КЪМ НАЙ-КЪСИЯ. Връща се първият, който
 * се събира; ако нито един не се събира, се връща последният — по-къс текст е
 * по-малкото зло от отрязан. Няма съкращаване с многоточие: то произвежда
 * изречения, които не са написани от човек.
 */
export const pickDesc = (...variants: string[]): string => pick(158, variants);

/**
 * Същото за заглавието, но с таван 60 знака.
 *
 * Google реже по ПИКСЕЛНА ширина (~600px), не по брой знаци, но кирилицата е
 * приблизително колкото латиницата и 60 е добра работна мярка. Марката остава
 * в края на всеки вариант — тя е това, което трябва да оцелее при рязане.
 */
export const pickTitle = (...variants: string[]): string => pick(60, variants);

const pick = (max: number, variants: string[]): string => {
  for (const v of variants) {
    const s = v.replace(/\s+/g, ' ').trim();
    if (s.length <= max) return s;
  }
  return variants[variants.length - 1].replace(/\s+/g, ' ').trim();
};

/** пътеката като схема; `trail` е същият списък, който се и вижда */
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

/** въпросите — влиза САМО ако същите въпроси стоят в текста на страницата */
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
) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.name,
  description: s.description,
  url: `${site}/uslugi/${s.slug}/`,
  serviceType: s.name,
  provider: { '@id': bizId(site) },
  areaServed: { '@type': 'City', name: 'Варна' },
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
 * Тунинг пакетът за конкретен електрически модел.
 *
 * `Product`, а не `Service`, защото има един модел, една цена и се купува с
 * бутон. `offers` се изписва САМО когато цената е обявена — Google отсява
 * оферта без цена като невалидна, а измислена цена е по-лошо от липсваща.
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

/** кратката визитка — стои на вътрешните страници, за да сочат към бизнеса */
export const bizRef = (site: string) => ({
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  '@id': bizId(site),
  name: business.name,
  legalName: business.legalName,
  url: `${site}/`,
  telephone: business.phoneIntl,
  email: business.email,
  // празен идентификатор НЕ се изписва — по-добре липсва, отколкото да лъже
  ...(business.eik ? { identifier: business.eik, taxID: business.eik } : {}),
  ...(business.vat ? { vatID: business.vat } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    postalCode: business.address.postalCode,
    addressCountry: business.address.country,
  },
});
