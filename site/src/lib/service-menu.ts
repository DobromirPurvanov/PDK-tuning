/**
 * The services dropdown as a PANEL, not a list.
 *
 * Thirteen bare names one under another read like a list of blog posts. The
 * panel splits them into three groups and gives each one its icon and a plain
 * line saying what is done, so the menu itself says what the workshop does.
 *
 * The line is NOT the home page `short`: those are teasers ("The speed limit is
 * in the software.") and a column of teasers in a menu reads like a blog feed.
 * The menu says the work itself, in a few words.
 *
 * The grouping goes by `icon`, not by slug: the icon keys are the same in the
 * Bulgarian and the English set, the slugs are not. A service whose icon is not
 * listed here falls into the last group instead of disappearing from the menu.
 */
import type { IconKey, Service } from '../data/services';

export type MenuLink = { href: string; label: string; icon: IconKey; desc: string };
export type MenuGroup = { label: string; items: MenuLink[] };

const GROUPS: { bg: string; en: string; icons: IconKey[] }[] = [
  { bg: 'Мощност', en: 'Power', icons: ['chip', 'stage', 'gear', 'flame', 'speed'] },
  { bg: 'Газове и датчици', en: 'Exhaust and sensors', icons: ['dpf', 'egr', 'adblue', 'sensor', 'air'] },
  { bg: 'Диагностика и ремонт', en: 'Diagnostics and repair', icons: ['error', 'scan', 'dyno', 'rescue'] },
];

/** What is done, in a few words. Keyed by icon for the same reason as GROUPS. */
const DESC: Partial<Record<IconKey, { bg: string; en: string }>> = {
  chip: { bg: 'Настройка за конкретния двигател', en: 'Calibration for the specific engine' },
  stage: { bg: 'Настройка за коли с променен хардуер', en: 'Calibration for cars with modified hardware' },
  gear: { bg: 'Настройка на автоматичната скоростна кутия', en: 'Automatic gearbox calibration' },
  flame: { bg: 'Пукания от ауспуха при отпускане на газта', en: 'Exhaust crackles when you lift off' },
  speed: { bg: 'Махане на ограничителя на скоростта', en: 'Removing the top speed limiter' },
  dpf: { bg: 'Диагностика и решение за филтъра', en: 'Diagnosis and a fix for the filter' },
  egr: { bg: 'Почистване, смяна или софтуер', en: 'Cleaning, replacement or software' },
  adblue: { bg: 'За машини извън обществените пътища', en: 'For machines off public roads' },
  sensor: { bg: 'Проверка и смяна на датчиците', en: 'Checking and replacing the sensors' },
  error: { bg: 'Откриване на причината за грешката', en: 'Finding the cause of the fault code' },
  scan: { bg: 'Пълна проверка на автомобила', en: 'A full check of the car' },
  dyno: { bg: 'Мощност и въртящ момент преди и след', en: 'Power and torque before and after' },
  rescue: { bg: 'Възстановяване на блок след неуспешен запис', en: 'Recovering a unit after a failed write' },
};

export function serviceMenu(list: Service[], base: string, lang: 'bg' | 'en'): MenuGroup[] {
  const link = (s: Service): MenuLink => ({ href: `${base}${s.slug}/`, label: s.name, icon: s.icon, desc: DESC[s.icon]?.[lang] ?? firstSentence(s.short) });
  const known = new Set(GROUPS.flatMap((g) => g.icons));
  return GROUPS.map((g, i) => ({
    label: g[lang],
    items: list
      .filter((s) => g.icons.includes(s.icon) || (i === GROUPS.length - 1 && !known.has(s.icon)))
      .map(link),
  })).filter((g) => g.items.length);
}

/** Fallback for a service with no DESC line: a clipped second sentence reads worse than none. */
const firstSentence = (t: string) => t.split(/(?<=[.!?])\s+/)[0];
