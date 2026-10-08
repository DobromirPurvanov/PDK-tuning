/**
 * THE SHELL LABELS — bar, footer, cookies, form, trail, 404.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY `{ bg, en }` LIVES HERE while the data are separate sets.
 *
 * `docs/ENGLISH.md` explicitly rejects bilingual fields in every object — for
 * the SERVICES and the articles. There the text is long, lives in `src/data/`
 * and is read by all 183 pages: a bilingual record would make every data read
 * bilingual for the sake of twenty pages.
 *
 * Template labels are a different thing: two or three words, read only by the
 * shell, and they ALWAYS come in pairs. Here adjacency is the advantage — a
 * missing translation is not a hidden file but a hole on one line. And the
 * type makes it impossible: `en` is declared as `Dict`, so `astro check` fails
 * if a key is missing or extra.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { Lang } from './index';

const bg = {
  /* ── shell ────────────────────────────────────────────────────────────── */
  skip: 'Към съдържанието',
  homeAria: 'PDK Tuning, начална страница',
  menuAria: 'Основно меню',
  menuLabel: 'Меню',
  upload: 'Качете файл',
  /** the language button's title — says WHERE it leads, not where we are */
  switchTo: 'Прочетете тази страница на английски',
  /** the same button when this page has NO English twin */
  switchHome: 'Тази страница я няма на английски, затова води към английската начална',
  switchLabel: 'EN',

  /* ── trail and closing action (Page.astro) ───────────────────────────── */
  home: 'Начало',
  trailAria: 'Пътека',
  ctaTitle: 'Запишете час за измерване',
  ctaText: 'Кажете ни марката, модела и двигателя на автомобила, както и какво искате да проверите. Ще ви обясним какво може да покаже измерването и дали е подходящо за вашия случай.',
  ctaWrite: 'Изпратете запитване',
  portal: 'Портал за партньори ↗',

  /* ── footer ──────────────────────────────────────────────────────────────── */
  eik: 'ЕИК',
  vat: 'ДДС',
  services: 'Услуги',
  allServices: 'Всички услуги →',
  catalog: 'Каталог',
  useful: 'Полезно',
  legalAria: 'Правно',
  socialAria: 'Социални мрежи',
  cookieSettings: 'Настройки за бисквитки',

  /* ── form ─────────────────────────────────────────────────────────────── */
  fName: 'Име',
  fPhone: 'Телефон',
  fEmail: 'Имейл',
  fService: 'Услуга',
  fChoose: '(изберете)',
  fOther: 'Друго',
  fCar: 'Автомобил',
  fCarPlaceholder: 'Марка, модел, година, двигател',
  fCarHint: 'Попълва се само̀, ако сте минали през избирача в каталога.',
  fMessage: 'Съобщение',
  fGdpr: 'Съгласен съм данните ми да бъдат обработени, за да получа отговор.',
  fGdprLink: 'Политика за поверителност',
  fTrap: 'Не попълвайте това поле',
  fSend: 'Изпратете запитване',
  fSending: 'Изпращане…',
  fRequired: 'Полетата със * са задължителни.',
  eName: 'Моля, напишете името си.',
  ePhone: 'Трябва ни телефон, за да отговорим.',
  eEmail: 'Проверете адреса. Липсва @ или домейн.',
  eGdpr: 'Без съгласие не можем да обработим запитването.',
  fOk: 'Благодарим, запитването ви е при нас. Ще се обадим в рамките на работния ден.',
  fNotConfigured: 'Формата още не е свързана с пощата на сервиза. ',
  fRate: 'Твърде много запитвания от този адрес. ',
  fFail: 'Нещо се обърка при изпращането. ',
  fCallUs: 'Обадете се на',
  fOrWrite: 'или пишете на',
  fOffline: 'Няма връзка със сървъра. Обадете се на',

  /* ── cookies ────────────────────────────────────────────────────────────── */
  ccTitle: 'Бисквитки',
  ccText:
    'Сайтът работи и без тях. Ако се съгласите, ще ползваме бисквитки само за анонимна ' +
    'статистика за това колко души идват и кои страници четат. Не се ползва за реклама. Подробно в',
  ccAnd: 'и в',
  ccPrivacy: 'Политиката за поверителност',
  ccLegend: 'Изберете по категория',
  ccCustom: 'Настройки',
  ccNo: 'Само необходимите',
  ccYes: 'Приемам всички',
  ccSave: 'Запазване на избора',
  ccAlways: 'винаги активни',
  ccUnused: 'не се ползва',
  ccNecessary: 'Строго необходими',
  ccNecessaryNote:
    'Помнят избора ви тук и пазят формата от автоматични злоупотреби. Без тях сайтът не може да свърши поисканото.',
  ccStats: 'Статистика',
  ccStatsNote:
    'Колко души идват и кои страници четат. Google Analytics с анонимизиран IP. Не се зарежда, докато не разрешите.',
  ccMarketing: 'Маркетинг',
  ccMarketingNote:
    'Не се ползва. На сайта няма рекламни пиксели и не изграждаме рекламни профили, затова няма какво да се разреши.',

  /* ── 404 ───────────────────────────────────────────────────────────────── */
  nfTitle: 'Страницата я няма (404) | PDK Tuning',
  nfDescription:
    'Адресът не съществува или страницата е преместена. Оттук се стига до услугите, каталога с 110 марки, цените и контактите на PDK Tuning във Варна.',
  nfHeading: 'Тази страница я няма.',
  nfLead:
    'Адресът е сгрешен или страницата е преместена. Каталогът и услугите са на един клик.',
  nfWhereAria: 'Накъде оттук',
  nfHome: 'Към началната страница',
  nfFind: 'Търсите марка?',
  nfSearch: 'Търсене в каталога',
  nfTel: 'Или се обадете на',
  nfTelTail: ', по телефона въпросите се решават най-бързо.',
} as const;

/**
 * `Record<keyof …, string>`, NOT `typeof bg`. The Bulgarian set is `as const`,
 * so the type of each field is the string itself ("Към съдържанието", not
 * `string`). `typeof bg` meant the English "Skip to content" did not match the
 * Bulgarian type — seventy-six errors, each claiming the translation is wrong
 * because it is not a verbatim copy. The keys stay mandatory: a missing or
 * extra key fails `astro check`, and that is the only thing the type needs to
 * guard here.
 */
export type Dict = Record<keyof typeof bg, string>;

/**
 * The English is NOT a word-for-word translation. Where the Bulgarian is
 * colloquial ("Да я погледнем."), the English is just as short and just as dry —
 * a literal translation of such sentences sounds like washing-machine
 * instructions.
 */
const en: Dict = {
  skip: 'Skip to content',
  homeAria: 'PDK Tuning, home page',
  menuAria: 'Main menu',
  menuLabel: 'Menu',
  upload: 'Upload a file',
  switchTo: 'Прочетете тази страница на български',
  switchHome: 'Прочетете сайта на български',
  switchLabel: 'BG',

  home: 'Home',
  trailAria: 'Breadcrumb',
  ctaTitle: 'Book a dyno session',
  ctaText: 'Tell us the make, model and engine of the car and what you want to check. We will explain what the measurement can show and whether it suits your case.',
  ctaWrite: 'Send an enquiry',
  portal: 'Partner portal ↗',

  eik: 'Company no.',
  vat: 'VAT no.',
  services: 'Services',
  allServices: 'All services →',
  catalog: 'Catalogue',
  useful: 'More',
  legalAria: 'Legal',
  socialAria: 'Social networks',
  cookieSettings: 'Cookie settings',

  fName: 'Name',
  fPhone: 'Phone',
  fEmail: 'Email',
  fService: 'Service',
  fChoose: '(choose)',
  fOther: 'Other',
  fCar: 'Vehicle',
  fCarPlaceholder: 'Make, model, year, engine',
  fCarHint: 'Filled in for you if you came through the catalogue picker.',
  fMessage: 'Message',
  fGdpr: 'I agree my details may be processed so that I can get an answer.',
  fGdprLink: 'Privacy policy',
  fTrap: 'Do not fill in this field',
  fSend: 'Send enquiry',
  fSending: 'Sending…',
  fRequired: 'Fields marked * are required.',
  eName: 'Please write your name.',
  ePhone: 'We need a phone number to get back to you.',
  eEmail: 'Check the address. The @ or the domain is missing.',
  eGdpr: 'Without your agreement we cannot process the enquiry.',
  fOk: 'Thank you, we have your enquiry. We will call within the working day.',
  fNotConfigured: 'The form is not yet connected to the workshop inbox. ',
  fRate: 'Too many enquiries from this address. ',
  fFail: 'Something went wrong while sending. ',
  fCallUs: 'Call',
  fOrWrite: 'or write to',
  fOffline: 'No connection to the server. Call',

  ccTitle: 'Cookies',
  ccText:
    'The site works without them. If you agree, we will use cookies only for anonymous ' +
    'statistics on how many people come and which pages they read. It is not used for advertising. In detail in',
  ccAnd: 'and in',
  ccPrivacy: 'the Privacy policy',
  ccLegend: 'Choose by category',
  ccCustom: 'Customise',
  ccNo: 'Necessary only',
  ccYes: 'Accept all',
  ccSave: 'Save choice',
  ccAlways: 'always on',
  ccUnused: 'not used',
  ccNecessary: 'Strictly necessary',
  ccNecessaryNote:
    'They remember your choice here and keep the form safe from automated abuse. Without them the site cannot do what you asked.',
  ccStats: 'Statistics',
  ccStatsNote:
    'How many people come and which pages they read. Google Analytics with anonymised IP. Nothing loads until you allow it.',
  ccMarketing: 'Marketing',
  ccMarketingNote:
    'Not used. There are no advertising pixels on this site and we build no advertising profiles, so there is nothing to allow.',

  nfTitle: 'Page not found (404) | PDK Tuning',
  nfDescription:
    'The address does not exist or the page has moved. From here you can reach the services, the catalogue of 110 makes, the prices and the contacts of PDK Tuning in Varna.',
  nfHeading: 'This page is not here.',
  nfLead:
    'The address is wrong or the page has moved. The catalogue and the services are one click away.',
  nfWhereAria: 'Where to from here',
  nfHome: 'To the home page',
  nfFind: 'Looking for a make?',
  nfSearch: 'Search the catalogue',
  nfTel: 'Or call',
  nfTelTail: ', most questions are settled fastest by phone.',
};

const DICTS: Record<Lang, Dict> = { bg, en };

/** The labels for this language. Used as `const t = dict(lang)`. */
export const dict = (lang: Lang): Dict => DICTS[lang];
