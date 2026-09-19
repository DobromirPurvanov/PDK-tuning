# ДОГОВОР: английското СЪДЪРЖАНИЕ на PDK Tuning (етап 3–5 от `ANGLIYSKI.md`)

Механиката вече е построена и работи. Този договор е само за текста.
Стратегията, обхватът и капаните са в `docs/ANGLIYSKI.md` — прочети го.

**Работна папка:** `/Users/dobromirpurvanov/dev/pdk-tuning/site`

## Какво вече съществува и НЕ се пипа

| файл | какво прави |
|---|---|
| `src/i18n/index.ts` | езикът от пътя, картата на двойките, английското меню |
| `src/i18n/ui.ts` | надписите от обвивката — вече преведени, пълни |
| `src/i18n/en/services/index.ts` | събира английските услуги в `SERVICES_EN` |
| `src/layouts/Base.astro`, `Page.astro`, `Text.astro` | обвивката; вече двуезични |
| `src/components/*.astro` | лента, футър, бисквитки, форма; вече двуезични |
| `src/pages/en/contact.astro` | **ОБРАЗЕЦЪТ.** Прочети го, преди да пишеш страница. |
| `src/data/**` | българското съдържание — **НЕ се пипа изобщо** |

**НЕ пипаме:** нищо българско, `public/_worker.js`, каталога, портала,
`src/config/site.ts`, стиловете. Ако нещо изглежда като дефект наоколо — не се
оправя тук, само се докладва.

## Пипаме

### А. Тринайсетте услуги — `src/i18n/en/services/<slug>.ts`

Един файл на услуга. Всеки експортира по един обект от тип `Service`:

```ts
import type { Service } from '../../../data/services';

export const chipTuning: Service = { … };
```

Английските слугове и източникът им:

| нов файл | експорт | източник (български) |
|---|---|---|
| `chip-tuning.ts` | `chipTuning` | `slug: 'chip-tuning'` |
| `stage-2.ts` | `stage2` | `slug: 'stage-2'` |
| `tcu-dsg.ts` | `tcuDsg` | `slug: 'tcu-dsg'` |
| `dpf-fap.ts` | `dpfFap` | `slug: 'dpf-fap'` |
| `egr.ts` | `egr` | `slug: 'egr'` |
| `adblue.ts` | `adblue` | `slug: 'adblue'` |
| `lambda-maf.ts` | `lambdaMaf` | `slug: 'lambda-maf'` |
| `dtc-errors.ts` | `dtcErrors` | `slug: 'dtc-greshki'` |
| `pops-bangs.ts` | `popsBangs` | `slug: 'pops-bangs'` |
| `vmax-off.ts` | `vmaxOff` | `slug: 'vmax-off'` |
| `diagnostics.ts` | `diagnostics` | `slug: 'diagnostika'` |
| `dyno.ts` | `dyno` | `slug: 'dyno-stend'` |
| `software-repair.ts` | `softwareRepair` | `slug: 'softueren-remont'` |

### Б. Четирите правни страници — `src/pages/en/<име>.astro`

| нов файл | адрес | източник |
|---|---|---|
| `privacy.astro` | `/en/privacy/` | `src/pages/privacy.astro` |
| `terms.astro` | `/en/terms/` | `src/pages/terms.astro` |
| `cookies.astro` | `/en/cookies/` | `src/pages/cookie-policy.astro` |
| `returns.astro` | `/en/returns/` | `src/pages/otkaz-i-reklamacii.astro` |

### В. Въпросите — `src/i18n/en/faq.ts`

Огледало на `src/data/faq.ts`: същите експорти, английско съдържание.

## Интерфейси

### Типът `Service` (от `src/data/services.ts`, НЕ се променя)

```ts
type Service = {
  slug: string;          // АНГЛИЙСКИЯТ слуг от таблицата горе
  name: string;          // името, което се вижда в меню, плочка, падащо поле
  kicker: string;        // микро-етикет над заглавието, 2–4 думи
  icon: IconKey;         // СЪЩАТА стойност като българската — иконите са рисунки
  priceKey: string | null;  // СЪЩАТА стойност — цените са общи и са в евро
  title: string;         // за търсачките, до 60 знака, завършва с „| PDK Tuning“
  description: string;   // за търсачките, 120–158 знака
  lead: string;          // едно изречение под H1
  short: string;         // краткият текст за плочката, едно изречение
  featured?: boolean;    // СЪЩАТА стойност като българската
  fits: string[];        // за кого е
  notFor?: string[];     // кога няма смисъл
  steps: { t: string; d: string }[];          // как минава при нас
  body: { h: string; p: string[]; tone?: 'warn' }[];   // същинският текст
  facts?: { k: string; v: string }[];         // сухите числа отстрани
  faq?: { q: string; a: string }[];           // въпроси само за тази услуга
  related: string[];     // съседни услуги — АНГЛИЙСКИ слугове
};
```

`tone: 'warn'` изкарва раздела в оранжева плоча. Ползва се за правната граница
при DPF, EGR и AdBlue и **никъде другаде**. Английският ѝ текст е
`OFFROAD_NOTE_EN` в `src/i18n/en/services/index.ts` — цитира се оттам, не се
преписва.

### Страница под `/en/` (виж `src/pages/en/contact.astro`)

```astro
import Text from '../../layouts/Text.astro';        // правните
import { crumbSchema, bizRef } from '../../lib/seo';
```

- езикът НЕ се подава — обвивката го чете от адреса;
- схемите носят `inLanguage: 'en'` и `bizRef(site, 'en')`;
- вътрешните връзки сочат `/en/…`, никога български адрес;
- датата „в сила от“ (`updated`) е СЪЩАТА като българската страница.

## Как се пише

**Това не е превод.** Българските текстове са писани за конкретни хора; дословният
им превод звучи като инструкция за пералня. Английското се пише наново по
**същите факти**.

Едно и също на двата езика, без изключение:

- **цените** — в евро, не се превалутират, `priceKey` сочи същия ред;
- **числата** — проценти печалба, часове, обороти, срокове;
- **правната граница** — DPF/EGR/AdBlue само извън обществени пътища;
- **позицията на сервиза** — какво не правим и защо.

Тон: сух, конкретен, от първо лице множествено число („we“). Британски правопис
(`tyre`, `litre`, `optimise`), защото сервизът е в ЕС.

**ЗАБРАНЕНО:** „premium“, „cutting-edge“, „state-of-the-art“, „your trusted
partner“, „unlock the full potential“ като заглавие на раздел, възклицателни
знаци, измислени числа и проценти. Ако ти трябва факт, който го няма в
българския източник — **не го съчинявай**, остави `[TO CONFIRM]`.

## Готово е, когато

- [ ] `npx astro check` → **0 errors** (командата се пуска в `site/`)
- [ ] `npm run build` минава
- [ ] всеки нов `.ts` файл експортира точно един обект от тип `Service`
- [ ] `slug` и `related` носят **английските** слугове от таблицата
- [ ] `icon`, `priceKey`, `featured` съвпадат с българските
- [ ] нито едно `description` не съвпада с друго
- [ ] нито един български знак в новите файлове **извън коментарите**
- [ ] нито една връзка от английска страница към български адрес
- [ ] нито едно `[TO CONFIRM]`, останало без причина

## Капани

- **`/en/` е зает.** `LEGACY_PATHS` в `public/_worker.js` праща всичко под
  `/en/` на стария сайт. Нашите английски пътища се проверяват ПРЕДИ него —
  това е направено в `OUR_EN_PATHS`, не се пипа.
- **Каталогът НЕ се превежда.** `/en/bmw`, `/en/audi` и ~5 470 адреса под тях са
  индексирани от години на стария сайт. Английска страница за марка = дублирано
  съдържание срещу самите нас.
- **Правните на английски НЕ са юридически превод.** Българският остава водещ и
  **това трябва да пише на самите страници** — едно изречение в началото.
- **`display` бие `[hidden]`.** Авторско правило с `display` прави скрит елемент
  видим; затова в `Base.astro` стои `[hidden]{display:none !important}`. Не се
  добавят нови правила с `display` върху нещо, което може да е `hidden`.
- **Празният набор е работещо състояние.** Докато услуга не е внесена в
  `src/i18n/en/services/index.ts`, тя няма страница, няма ред в менюто и няма
  `hreflang`. Внасянето е ПОСЛЕДНАТА стъпка, след като `astro check` мине.
- **`PUBLIC_EN` е предпазителят.** Докато не е `true`, английските страници
  носят `noindex` и не се сочат отникъде. Не се вдига от този етаж.
