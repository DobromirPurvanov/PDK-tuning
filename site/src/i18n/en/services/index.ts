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

export const OFFROAD_NOTE_EN =
  'Switching off an exhaust after-treatment system is done ONLY for machines that do not travel on public roads, such as race, agricultural and industrial equipment. For a car on the road we repair the system instead, because this is a legal requirement: a car with the system removed does not pass its roadworthiness test and is not legal on the road.';

/**
 * Услугите, които вече имат английски текст.
 *
 * Празен масив е работещо състояние: `/en/services/` показва толкова карти,
 * колкото има, `/en/services/<slug>/` изгражда толкова страници, колкото има, а
 * `ROUTES` дава `hreflang` само за двойките, които съществуват и от двете
 * страни. Услуга се появява навсякъде наведнъж в мига, в който файлът ѝ се
 * внесе тук.
 */
export const SERVICES_EN: Service[] = [];

/** шестте на английската начална; докато наборът е празен, е празен и този */
export const FEATURED_EN = SERVICES_EN.filter((s) => s.featured);

/** по английски слуг — същото, което `BY_SLUG` прави за българските */
export const BY_SLUG_EN = new Map(SERVICES_EN.map((s) => [s.slug, s]));
