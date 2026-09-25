/**
 * НАДПИСИТЕ ОТ ОБВИВКАТА — лента, футър, бисквитки, форма, пътека, 404.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ЗАЩО ТУК Е `{ bg, en }`, а данните са отделни набори.
 *
 * `docs/ANGLIYSKI.md` изрично отказва двуезични полета във всеки обект — за
 * УСЛУГИТЕ и статиите. Там текстът е дълъг, живее в `src/data/` и се чете от
 * всичките 183 страници: двуезичен запис щеше да направи всяко четене на данни
 * двуезично заради двайсет страници.
 *
 * Надписите от шаблоните са другото нещо: по две-три думи, четат се само от
 * обвивката и ВИНАГИ вървят по двойки. Тук съседството е предимството —
 * липсващ превод не е скрит файл, а дупка на един ред. А типът го прави
 * невъзможен: `en` е обявен като `Dict`, тоест `astro check` пада, ако ключ
 * липсва или е излишен.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { Lang } from './index';

const bg = {
  /* ── обвивка ───────────────────────────────────────────────────────────── */
  skip: 'Към съдържанието',
  homeAria: 'PDK Tuning, начална страница',
  menuAria: 'Основно меню',
  menuLabel: 'Меню',
  upload: 'Качете файл',
  /** заглавието на копчето за език — казва КЪДЕ води, не къде сме */
  switchTo: 'Прочетете тази страница на английски',
  /** същото копче, когато тази страница НЯМА английски двойник */
  switchHome: 'Тази страница я няма на английски, затова води към английската начална',
  switchLabel: 'EN',

  /* ── пътека и заключително действие (Page.astro) ───────────────────────── */
  home: 'Начало',
  trailAria: 'Пътека',
  ctaTitle: 'Да го измерим.',
  ctaText: 'Кажете ни колата и какво искате от нея. Ако не си струва, ще го чуете от нас.',
  ctaWrite: 'Изпратете запитване',
  portal: 'Портал за партньори ↗',

  /* ── футър ─────────────────────────────────────────────────────────────── */
  eik: 'ЕИК',
  vat: 'ДДС',
  services: 'Услуги',
  allServices: 'Всички услуги →',
  catalog: 'Каталог',
  useful: 'Полезно',
  legalAria: 'Правно',
  socialAria: 'Социални мрежи',
  cookieSettings: 'Настройки за бисквитки',

  /* ── формата ───────────────────────────────────────────────────────────── */
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

  /* ── бисквитки ─────────────────────────────────────────────────────────── */
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
 * `Record<keyof …, string>`, а НЕ `typeof bg`. Българският набор е `as const`,
 * тоест типът на всяко поле е самият низ („Към съдържанието“, не `string`).
 * `typeof bg` значеше, че английското „Skip to content“ не съвпада с типа на
 * българското — седемдесет и шест грешки, всяка от които твърди, че преводът е
 * грешен, защото не е дословно копие. Ключовете остават задължителни: липсващ
 * или излишен ключ пада при `astro check`, а това е единственото, което типът
 * тук трябва да пази.
 */
export type Dict = Record<keyof typeof bg, string>;

/**
 * Английското НЕ е превод дума по дума. Там, където българското е разговорно
 * („Да го измерим.“), английското е също толкова късо и също толкова сухо —
 * буквалният превод на такива изречения звучи като инструкция за пералня.
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
  ctaTitle: 'Let us measure it.',
  ctaText: 'Tell us the car and what you want from it. If it is not worth doing, you will hear that from us.',
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

/** Надписите на този език. Ползва се като `const t = dict(lang)`. */
export const dict = (lang: Lang): Dict => DICTS[lang];
