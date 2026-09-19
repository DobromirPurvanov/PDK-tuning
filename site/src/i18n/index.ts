/**
 * ДВАТА ЕЗИКА — маршрутите и кой на кого е двойник.
 *
 * Защо изобщо: 5 585 от 5 586 адреса в sitemap-а на стария сайт са на `/en/`.
 * Целият индексиран трафик на клиента е английски. Стратегията е в
 * `docs/ANGLIYSKI.md`; тук е механиката.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ЕЗИКЪТ СЕ ЧЕТЕ ОТ ПЪТЯ, НЕ СЕ ПОДАВА ПРЕЗ ПРОПОВЕ.
 *
 * Обвивката (лента, футър, бисквитки, формата) се рисува от `Base.astro` на
 * всяка от 183-те страници. Ако езикът пътуваше като проп, всяка страница
 * трябваше да го подаде — сто осемдесет и три места, на които се забравя, и
 * забравянето изглежда като работещ билд с българска лента над английски текст.
 * `langOf(Astro.url.pathname)` не може да се забрави: пътят вече е верен.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { EN_LIVE } from '../config/site';
import { SERVICES_EN } from './en/services/index';

export type Lang = 'bg' | 'en';

export const LANGS: Lang[] = ['bg', 'en'];

/** `bg_BG` / `en_GB` за `og:locale`; британски, защото сервизът е в ЕС */
export const LOCALE: Record<Lang, string> = { bg: 'bg_BG', en: 'en_GB' };

/** Езикът на страницата по нейния адрес. Всичко извън `/en/…` е българско. */
export function langOf(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'bg';
}

/**
 * АНГЛИЙСКИТЕ СЛУГОВЕ НА УСЛУГИТЕ.
 *
 * Повечето български слугове вече са латиница и се четат еднакво на двата
 * езика (`chip-tuning`, `egr`, `adblue`) — те не се пипат. Преведени са само
 * четирите, които са български думи с латински букви: „dtc-greshki“ не значи
 * нищо за английски посетител, а и за търсачка.
 *
 * `software-repair` НЕ е избран свободно: `/en/tuning/software-repair` е в
 * sitemap-а на стария сайт, тоест индексиран е. Същото име значи, че етап 6
 * пренасочва стария адрес към наш със същата опашка.
 */
const SERVICE_SLUG_EN: Record<string, string> = {
  'dtc-greshki': 'dtc-errors',
  diagnostika: 'diagnostics',
  'dyno-stend': 'dyno',
  'softueren-remont': 'software-repair',
};

/** български слуг на услуга → английския ѝ слуг */
export const serviceSlugEn = (slug: string) => SERVICE_SLUG_EN[slug] ?? slug;

/** английски слуг → българския (за обратния път на превключвателя) */
export const serviceSlugBg = (slug: string) =>
  Object.entries(SERVICE_SLUG_EN).find(([, en]) => en === slug)?.[0] ?? slug;

/**
 * КАРТАТА НА ДВОЙКИТЕ. Единственото място, което знае кой български адрес на
 * кой английски отговаря — четат го превключвателят, `hreflang`, картата на
 * сайта и пренасочванията от етап 6.
 *
 * Страница БЕЗ двойник просто не се изброява тук: електрическите, статиите,
 * PDK Flasher, мит/факт и „за дилъри“ остават само на български на този кръг.
 * Тогава превключвателят не се рисува — по-добре липсващо копче, отколкото
 * копче към 404.
 */
export const ROUTES: { bg: string; en: string }[] = [
  { bg: '/', en: '/en/' },
  { bg: '/uslugi/', en: '/en/services/' },
  { bg: '/tseni/', en: '/en/prices/' },
  { bg: '/kak-rabotim/', en: '/en/how-we-work/' },
  { bg: '/za-nas/', en: '/en/about/' },
  { bg: '/kontakti/', en: '/en/contact/' },
  { bg: '/vaprosi/', en: '/en/faq/' },
  { bg: '/privacy/', en: '/en/privacy/' },
  { bg: '/terms/', en: '/en/terms/' },
  { bg: '/cookie-policy/', en: '/en/cookies/' },
  { bg: '/otkaz-i-reklamacii/', en: '/en/returns/' },
  /* Услугите влизат от АНГЛИЙСКИЯ набор, не от българския.
     Изброени от българските, картата щеше да обещава тринайсет английски
     двойки, докато `SERVICES_EN` е празен — тоест `hreflang` към страници,
     които билдът не изгражда, и превключвател към 404. Всяка услуга се появява
     и от двете страни в мига, в който английският ѝ текст е написан. */
  ...SERVICES_EN.map((s) => ({
    bg: `/uslugi/${serviceSlugBg(s.slug)}/`,
    en: `/en/services/${s.slug}/`,
  })),
];

/** „/privacy“ → „/privacy/“; билдът вади папки, сравнява се едно и също */
const slash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/**
 * Двойникът на този адрес на другия език, или `null`, ако страницата
 * съществува само на един.
 */
export function twin(pathname: string): { lang: Lang; href: string } | null {
  /* Изключената английска версия НЯМА двойници — така копчето за език, картата
     на сайта и `hreflang` мълчат наведнъж, вместо всеки да пита поотделно. */
  if (!EN_LIVE) return null;
  const path = slash(pathname);
  const here = langOf(path);
  const row = ROUTES.find((r) => r[here] === path);
  if (!row) return null;
  const other: Lang = here === 'bg' ? 'en' : 'bg';
  return { lang: other, href: row[other] };
}

/**
 * Двата адреса на една страница за `hreflang`. Връща празен списък за страница
 * без двойник — `hreflang` със САМО един ред не значи нищо и Google го пропуска,
 * но алтернатива към несъществуващ адрес е истинска грешка в Search Console.
 */
export function alternates(pathname: string): { lang: Lang; href: string }[] {
  const t = twin(pathname);
  if (!t) return [];
  const here = langOf(pathname);
  return [{ lang: here, href: slash(pathname) }, t].sort((a, b) => (a.lang < b.lang ? -1 : 1));
}

/* ══════════════════════════════════════════════════════════════════════════
   АНГЛИЙСКОТО МЕНЮ

   Българското се строи в `config/site.ts` от данните — тук е същото за `/en/`.

   КАТАЛОГЪТ НЕ Е В НЕГО и това е решение, не пропуск. Английските страници на
   110-те марки (`/en/bmw`, `/en/audi`, ~5 470 адреса под тях) са индексирани от
   години и продължават да се обслужват от стария сайт — те НЕ се превеждат.
   Оставаха три възможности и две от тях са по-лоши от липсващата точка:
     • „Catalogue“ → `/katalog/` праща англичанин на българска страница, тоест
       точно дефекта, заради който изобщо съществува `docs/ANGLIYSKI.md`;
     • „Catalogue“ → `/en/bmw` праща го в стария дизайн от собственото ни меню.
   Затова колите се избират от ЖИВИЯ ИЗБИРАЧ на английската начална: той чете
   от същата база и връща английските имена на двигателите, а не списък от
   имена на марки.
   ══════════════════════════════════════════════════════════════════════════ */

export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

export const NAV_EN: NavItem[] = [
  {
    href: '/en/services/',
    label: 'Services',
    // празен набор → без подсписък; вж. бележката в `en/services.ts`
    ...(SERVICES_EN.length
      ? { children: SERVICES_EN.map((s) => ({ href: `/en/services/${s.slug}/`, label: s.name })) }
      : {}),
  },
  { href: '/en/prices/', label: 'Prices' },
  { href: '/en/how-we-work/', label: 'How we work' },
  { href: '/en/about/', label: 'About' },
  { href: '/en/contact/', label: 'Contact' },
];

/** вторият ред връзки; на български са пет, на английски засега е една */
export const MORE_EN = [{ href: '/en/faq/', label: 'Questions and answers' }] as const;

export const LEGAL_EN = [
  { href: '/en/privacy/', label: 'Privacy' },
  { href: '/en/terms/', label: 'Terms' },
  { href: '/en/cookies/', label: 'Cookie policy' },
  { href: '/en/returns/', label: 'Returns and complaints' },
] as const;

/**
 * НАШИТЕ английски пътища — за работника.
 *
 * `LEGACY_PATHS` в `public/_worker.js` праща ВСИЧКО под `/en/` на стария сайт.
 * След етап 2 (когато www сме ние) това би откраднало и собствените ни
 * страници. Затова работникът проверява този списък ПРЕДИ него.
 *
 * Изнесен е и като `en-paths.json` в изхода на билда — работникът не може да
 * внесе TypeScript, а два ръчно поддържани списъка са два списъка, които един
 * ден се разминават.
 */
export const OUR_EN_PATHS = ROUTES.map((r) => r.en).filter((p) => p.startsWith('/en/'));
