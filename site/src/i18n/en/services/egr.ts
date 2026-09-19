import type { Service } from '../../../data/services';
import { OFFROAD_NOTE_EN } from './index';

export const egr: Service = {
  slug: 'egr',
  name: 'EGR and Swirl Flaps',
  kicker: 'Diesel',
  icon: 'egr',
  priceKey: 'egr',
  featured: true,
  title: 'EGR Valve and Swirl Flap Repair in Varna | PDK Tuning',
  description:
    'Blocked EGR valves and failed swirl flaps: we diagnose the cause, clean or replace the parts, and do not offer removal for road cars.',
  lead:
    'The valve that returns exhaust gas to the engine blocks with carbon, but the fault often goes deeper than the valve itself.',
  short:
    'A blocked valve or failed swirl flaps: cleaning, replacement or a software solution for off-road machinery.',
  fits: [
    'Weak pull at low revs and black smoke',
    'A recurring EGR flow or position fault',
    'A rattle from the inlet manifold when the engine is switched off',
    'A blocked particulate filter with EGR as the underlying cause',
  ],
  steps: [
    {
      t: 'Diagnostics',
      d: 'We read valve position and flow, then compare the requested figures with what the system actually achieves.',
    },
    {
      t: 'Manifold inspection',
      d: 'We inspect the swirl flaps and their shafts, where carbon deposits jam the mechanism and break the linkages.',
    },
    {
      t: 'Cleaning or replacement',
      d: 'A valve that still moves can be cleaned. One with a worn shaft or failed motor needs replacing.',
    },
    {
      t: 'Post-repair check',
      d: 'We read the live data again, so we know the fault has gone rather than simply been cleared.',
    },
  ],
  body: [
    {
      h: 'Why the valve blocks',
      p: [
        'The system returns part of the exhaust gas to the inlet manifold to lower combustion temperature and, with it, nitrogen oxides. That gas carries soot and oil from the crankcase ventilation system. Together they form a sticky deposit that narrows the passage over time and eventually jams the valve.',
        'Urban driving speeds this up because lower temperatures do not burn the deposits away. A car that spends its time in traffic blocks its EGR sooner than the same car used on the motorway.',
      ],
    },
    {
      h: 'Swirl flaps',
      p: [
        'Many diesel inlet manifolds contain moving flaps that swirl the air at low revs. Their shafts sit in the same carbon deposits. When a shaft wears or a linkage breaks, a flap can drop into the inlet passage and then enter a cylinder. That is an engine repair, not a software problem.',
        'For that reason, when a manifold rattles we inspect the mechanical parts before changing anything in the control unit.',
      ],
    },
    {
      h: 'The line we do not cross',
      tone: 'warn',
      p: [OFFROAD_NOTE_EN],
    },
  ],
  facts: [
    { k: 'Common consequence', v: 'blocked particulate filter' },
    { k: 'The risk', v: 'a dropped swirl flap in a cylinder' },
    { k: 'For road cars', v: 'cleaning or replacement, not removal' },
  ],
  related: ['dpf-fap', 'diagnostics', 'adblue'],
};
