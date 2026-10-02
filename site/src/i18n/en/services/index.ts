/**
 * УСЛУГИТЕ НА АНГЛИЙСКИ — по един файл на услуга.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ЗАЩО ПАПКА, А БЪЛГАРСКИТЕ СА ЕДИН ФАЙЛ.
 *
 * `src/data/services.ts` е 65 KB и това е добре: той е написан наведнъж и се
 * чете наведнъж. Английските се пишат от няколко страни паралелно (вж.
 * `docs/ANGLIYSKI-DOGOVOR.md`) — тринайсет души или модула в един файл значи
 * тринайсет сблъсъка. По един файл на услуга е цената на паралелната работа и
 * се плаща само веднъж.
 *
 * `slug` в ТОЗИ набор е АНГЛИЙСКИЯТ: четирите български слуга стават
 * `dtc-errors`, `diagnostics`, `dyno`, `software-repair` (вж. `serviceSlugEn`
 * в `../../index.ts`). `related` сочи английски слугове — иначе връзките в
 * дъното на страницата водят към български адреси.
 *
 * `icon` и `priceKey` остават СЪЩИТЕ като българските: иконите са рисунки, а
 * цените са в евро и не се превалутират.
 *
 * РЕДЪТ ТУК Е РЕДЪТ НА САЙТА — меню, хъб, падащото поле във формата. Същият е
 * като българския, за да не се четат двата сайта различно.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { Service } from '../../../data/services';
import { chipTuning } from './chip-tuning';
import { stage2 } from './stage-2';
import { tcuDsg } from './tcu-dsg';
import { dpfFap } from './dpf-fap';
import { egr } from './egr';
import { adblue } from './adblue';
import { lambdaMaf } from './lambda-maf';
import { dtcErrors } from './dtc-errors';
import { popsBangs } from './pops-bangs';
import { vmaxOff } from './vmax-off';
import { diagnostics } from './diagnostics';
import { dyno } from './dyno';
import { softwareRepair } from './software-repair';

export { OFFROAD_NOTE_EN } from './offroad';

/**
 * Услугите, които вече имат английски текст.
 *
 * Празен масив е работещо състояние: `/en/services/` показва толкова карти,
 * колкото има, `/en/services/<slug>/` изгражда толкова страници, колкото има, а
 * `ROUTES` дава `hreflang` само за двойките, които съществуват и от двете
 * страни. Услуга се появява навсякъде наведнъж в мига, в който файлът ѝ се
 * внесе тук.
 */
export const SERVICES_EN: Service[] = [
  chipTuning,
  stage2,
  tcuDsg,
  dpfFap,
  egr,
  adblue,
  lambdaMaf,
  dtcErrors,
  popsBangs,
  vmaxOff,
  diagnostics,
  dyno,
  softwareRepair,
];

/** шестте на английската начална; докато наборът е празен, е празен и този */
export const FEATURED_EN = SERVICES_EN.filter((s) => s.featured);

/** по английски слуг — същото, което `BY_SLUG` прави за българските */
export const BY_SLUG_EN = new Map(SERVICES_EN.map((s) => [s.slug, s]));
