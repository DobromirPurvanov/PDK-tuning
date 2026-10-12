/**
 * The services dropdown as a PANEL, not a list.
 *
 * Thirteen bare names one under another read like a list of blog posts. The
 * panel splits them into three groups and gives each one its icon and the
 * one-line `short` text, so the menu itself says what the workshop does.
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

export function serviceMenu(list: Service[], base: string, lang: 'bg' | 'en'): MenuGroup[] {
  const link = (s: Service): MenuLink => ({ href: `${base}${s.slug}/`, label: s.name, icon: s.icon, desc: firstSentence(s.short) });
  const known = new Set(GROUPS.flatMap((g) => g.icons));
  return GROUPS.map((g, i) => ({
    label: g[lang],
    items: list
      .filter((s) => g.icons.includes(s.icon) || (i === GROUPS.length - 1 && !known.has(s.icon)))
      .map(link),
  })).filter((g) => g.items.length);
}

/** The panel has room for one thought per service; a clipped second sentence reads worse than none. */
const firstSentence = (t: string) => t.split(/(?<=[.!?])\s+/)[0];
