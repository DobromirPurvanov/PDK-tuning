/**
 * THE SERVICES IN ENGLISH — one file per service.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY A FOLDER, WHEN THE BULGARIAN ONES ARE A SINGLE FILE.
 *
 * `src/data/services.ts` is 65 KB and that is fine: it was written in one go
 * and is read in one go. The English ones are written by several parties in
 * parallel (see `docs/ENGLISH-CONTRACT.md`) — thirteen people or modules in
 * one file means thirteen collisions. One file per service is the price of
 * parallel work, and it is paid only once.
 *
 * `slug` in THIS set is the ENGLISH one: the four Bulgarian slugs become
 * `dtc-errors`, `diagnostics`, `dyno`, `software-repair` (see `serviceSlugEn`
 * in `../../index.ts`). `related` points at English slugs — otherwise the links
 * at the bottom of the page lead to Bulgarian addresses.
 *
 * `icon` and `priceKey` stay the SAME as the Bulgarian ones: the icons are
 * drawings, and the prices are in euro and are not converted.
 *
 * THE ORDER HERE IS THE SITE ORDER — menu, hub, the dropdown in the form. It is
 * the same as the Bulgarian one, so the two sites do not read differently.
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
 * The services that already have English text.
 *
 * An empty array is a working state: `/en/services/` shows as many cards as
 * there are, `/en/services/<slug>/` builds as many pages as there are, and
 * `ROUTES` gives `hreflang` only for the pairs that exist on both sides. A
 * service appears everywhere at once the moment its file is imported here.
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

/** the six on the English home page; while the set is empty, this one is empty too */
export const FEATURED_EN = SERVICES_EN.filter((s) => s.featured);

/** by English slug — the same thing `BY_SLUG` does for the Bulgarian ones */
export const BY_SLUG_EN = new Map(SERVICES_EN.map((s) => [s.slug, s]));
