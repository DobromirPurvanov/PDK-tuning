// Езикът се определя само от адреса (план, стр. 8). Тук са само низовете на интерфейса.
// Съдържанието на писаните страници е в src/content/. Каталожните шаблони са в src/lib/seo.ts.
export type Lang = 'bg' | 'en';
export const LANGS: Lang[] = ['bg', 'en'];

export const routes = {
  home: { bg: '/bg/', en: '/en/' },
  chipTuningVarna: { bg: '/bg/chip-tuning-varna', en: '/en/chip-tuning-varna' },
  chipTuning: { bg: '/bg/tuning/chip-tuning', en: '/en/tuning/chip-tuning' },
  services: { bg: '/bg/uslugi', en: '/en/services' },
  dyno: { bg: '/bg/dino-stend', en: '/en/dyno' },
  prices: { bg: '/bg/tseni', en: '/en/prices' },
  faq: { bg: '/bg/chesti-vaprosi', en: '/en/faq' },
  about: { bg: '/bg/about-us', en: '/en/about-us' },
  contact: { bg: '/bg/contact', en: '/en/contact' },
  privacy: { bg: '/bg/privacy-policy', en: '/en/privacy-policy' },
} as const;
export type RouteKey = keyof typeof routes;
export const servicePath = (lang: Lang, slug: string) => `${routes.services[lang]}/${slug}`;

const dict = {
  bg: {
    siteName: 'PDK Tuning',
    tagline: 'Чип тунинг и софтуерни ремонти във Варна',
    nav: { chipTuning: 'Чип тунинг', services: 'Услуги', catalog: 'Каталог', dyno: 'Дино стенд', prices: 'Цени', about: 'За нас', contact: 'Контакти', faq: 'Въпроси', upload: 'Качи файл', login: 'Вход', menu: 'Меню', call: 'Обади се', viber: 'Viber', phone: 'Телефон' },
    otherLang: { label: 'EN', title: 'English version' },
    skip: 'Към съдържанието',
    calc: {
      title: 'Провери своята кола', state: { empty: 'избери марка', loading: 'зареждане…', ready: 'избери модел', pick: 'избери двигател', done: 'резултат', none: 'няма данни' },
      brand: 'Марка', model: 'Модел', engine: 'Двигател', choose: '— избери —',
      power: 'Мощност', torque: 'Момент', hp: 'к.с.', nm: 'Nm', full: 'Виж пълните данни', book: 'Запази час', nojs: 'Без скрипт: отвори марката директно —', all: 'всички марки',
    },
    readout: { power: 'Мощност', torque: 'Въртящ момент', stock: 'фабрично', tuned: 'след файла', gain: 'ръст' },
    crumbs: { catalog: 'Каталог', home: 'Начало' },
    units: { hp: 'к.с.', nm: 'Nm', eur: '€', hours: 'ч' },
    cta: { book: 'Запази час във Варна', upload: 'Качи файл', call: 'Обади се', form: 'Изпрати запитване', prices: 'Всички цени', catalog: 'Провери своята кола', more: 'Виж повече' },
    form: {
      title: 'Запитване', name: 'Име', phone: 'Телефон', email: 'Имейл', car: 'Кола', service: 'Услуга', message: 'Съобщение', consent: 'Съгласен съм данните ми да бъдат използвани само за отговор на това запитване.', privacy: 'Политика за поверителност',
      submit: 'Изпрати', sending: 'Изпраща се…', ok: 'Получихме запитването. Ще се обадим в работно време. Ако бързате:', fail: 'Не се изпрати. Обадете се на', required: 'задължително', errName: 'Напишете име.', errPhone: 'Напишете телефон, на който да върнем обаждане.', errConsent: 'Без съгласие не можем да ви отговорим.', optional: 'по избор', noService: '— не е избрана —',
      note: 'Отговаряме по телефон. Формата е за тези, които пишат вечер.',
    },
    footer: { legal: 'Правни страници', services: 'Услуги', hours: 'Работно време', contact: 'Контакти', catalog: 'Каталог', partners: 'За сервизи партньори', portal: 'Вход в портала за файлове', rights: 'Всички права запазени', days: { mon: 'Понеделник', tue: 'Вторник', wed: 'Сряда', thu: 'Четвъртък', fri: 'Петък', sat: 'Събота', sun: 'Неделя' }, closed: 'почивен ден', weekdays: 'Пон – Пет', sat: 'Събота', sun: 'Неделя' },
    catalog: {
      brandH1: (b: string) => `Чип тунинг за ${b}`,
      modelH1: (b: string, m: string) => `Чип тунинг за ${b} ${m}`,
      genH1: (b: string, m: string, y: string) => `Чип тунинг за ${b} ${m} (${y})`,
      engineH1: (b: string, m: string, e: string, hp: number) => `Чип тунинг за ${b} ${m} ${e} ${hp} к.с.`,
      models: 'Модели', engines: 'Двигатели', generations: 'Поколения', years: 'Години', engine: 'Двигател', fuel: 'Гориво', diesel: 'дизел', petrol: 'бензин', electric: 'електрически',
      topGains: (b: string) => `Най-голям ръст при ${b}`, allEngines: 'Всички двигатели', otherGens: 'Другите поколения', neighbors: 'Съседни двигатели от същото поколение', otherModels: (b: string) => `Други модели ${b}`,
      before: 'преди', after: 'след', gain: 'ръст', pct: '%', engineCount: (n: number) => `${n} ${n === 1 ? 'двигател' : 'двигателя'}`, modelCount: (n: number) => `${n} ${n === 1 ? 'модел' : 'модела'}`, genCount: (n: number) => `${n} ${n === 1 ? 'поколение' : 'поколения'}`,
      suitable: 'Подходящи услуги за този двигател', whatChanges: 'Какво се променя', timeAndPrice: 'Време и цена', questions: 'Въпроси за този двигател', bestInGen: 'Най-печелившият в поколението',
      fromYear: (y: number) => `от ${y}`, toNow: 'до днес',
      brandsAll: 'Всички марки в базата', showAll: 'Покажи всички марки',
    },
    misc: { readMore: 'Още', ourWorkshop: 'Сервизът във Варна', rated: (v: number, n: number) => `${String(v).replace('.', ',')} от 5 при ${n} отзива в Google`, since: 'от', partnersOnly: 'за сервизи партньори' },
  },
  en: {
    siteName: 'PDK Tuning',
    tagline: 'Chip tuning and ECU software repair in Varna',
    nav: { chipTuning: 'Chip tuning', services: 'Services', catalog: 'Catalog', dyno: 'Dyno', prices: 'Prices', about: 'About', contact: 'Contact', faq: 'FAQ', upload: 'Upload file', login: 'Login', menu: 'Menu', call: 'Call', viber: 'Viber', phone: 'Phone' },
    otherLang: { label: 'BG', title: 'Българска версия' },
    skip: 'Skip to content',
    calc: {
      title: 'Check your car', state: { empty: 'pick a brand', loading: 'loading…', ready: 'pick a model', pick: 'pick an engine', done: 'result', none: 'no data' },
      brand: 'Brand', model: 'Model', engine: 'Engine', choose: '— select —',
      power: 'Power', torque: 'Torque', hp: 'hp', nm: 'Nm', full: 'See full data', book: 'Book a slot', nojs: 'No script: open the brand directly —', all: 'all brands',
    },
    readout: { power: 'Power', torque: 'Torque', stock: 'stock', tuned: 'after file', gain: 'gain' },
    crumbs: { catalog: 'Catalog', home: 'Home' },
    units: { hp: 'hp', nm: 'Nm', eur: '€', hours: 'h' },
    cta: { book: 'Book a slot in Varna', upload: 'Upload file', call: 'Call', form: 'Send an enquiry', prices: 'All prices', catalog: 'Check your car', more: 'Read more' },
    form: {
      title: 'Enquiry', name: 'Name', phone: 'Phone', email: 'Email', car: 'Car', service: 'Service', message: 'Message', consent: 'I agree that my details are used only to answer this enquiry.', privacy: 'Privacy policy',
      submit: 'Send', sending: 'Sending…', ok: 'Received. We call back during working hours. In a hurry:', fail: 'Not sent. Call', required: 'required', errName: 'Enter a name.', errPhone: 'Enter a phone number we can call back.', errConsent: 'We cannot answer without consent.', optional: 'optional', noService: '— none —',
      note: 'We answer by phone. The form is for those who write in the evening.',
    },
    footer: { legal: 'Legal', services: 'Services', hours: 'Opening hours', contact: 'Contact', catalog: 'Catalog', partners: 'For partner workshops', portal: 'File portal login', rights: 'All rights reserved', days: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }, closed: 'closed', weekdays: 'Mon – Fri', sat: 'Saturday', sun: 'Sunday' },
    catalog: {
      brandH1: (b: string) => `Chip tuning for ${b}`,
      modelH1: (b: string, m: string) => `Chip tuning for ${b} ${m}`,
      genH1: (b: string, m: string, y: string) => `Chip tuning for ${b} ${m} (${y})`,
      engineH1: (b: string, m: string, e: string, hp: number) => `Chip tuning for ${b} ${m} ${e} ${hp} hp`,
      models: 'Models', engines: 'Engines', generations: 'Generations', years: 'Years', engine: 'Engine', fuel: 'Fuel', diesel: 'diesel', petrol: 'petrol', electric: 'electric',
      topGains: (b: string) => `Biggest gains for ${b}`, allEngines: 'All engines', otherGens: 'Other generations', neighbors: 'Neighbouring engines in this generation', otherModels: (b: string) => `Other ${b} models`,
      before: 'stock', after: 'tuned', gain: 'gain', pct: '%', engineCount: (n: number) => `${n} engine${n === 1 ? '' : 's'}`, modelCount: (n: number) => `${n} model${n === 1 ? '' : 's'}`, genCount: (n: number) => `${n} generation${n === 1 ? '' : 's'}`,
      suitable: 'Suitable services for this engine', whatChanges: 'What changes', timeAndPrice: 'Time and price', questions: 'Questions about this engine', bestInGen: 'Best gain in this generation',
      fromYear: (y: number) => `from ${y}`, toNow: 'to date',
      brandsAll: 'All brands in the database', showAll: 'Show all brands',
    },
    misc: { readMore: 'More', ourWorkshop: 'The workshop in Varna', rated: (v: number, n: number) => `${v} of 5 from ${n} Google reviews`, since: 'since', partnersOnly: 'for partner workshops' },
  },
};
export type Dict = typeof dict.bg;
export const t = (lang: Lang): Dict => dict[lang] as Dict;
export const otherLang = (lang: Lang): Lang => (lang === 'bg' ? 'en' : 'bg');
// Числата с интервал: „1 500“, не „1500“ (план, стр. 21)
export const fmt = (n: number) => new Intl.NumberFormat('bg-BG').format(n).replace(/ /g, ' ');
export const years = (from: number, to: number | null, lang: Lang = 'bg') => (!from ? (to ? (lang === 'en' ? `up to ${to}` : `до ${to}`) : (lang === 'en' ? 'all years' : 'всички години')) : to ? `${from}–${to}` : `${from}–…`);
