import type { Service } from '../../../data/services';
import { OFFROAD_NOTE_EN } from './index';

export const dpfFap: Service = {
  slug: 'dpf-fap',
  name: 'DPF / FAP',
  kicker: 'Diesel',
  icon: 'dpf',
  priceKey: 'dpf-fap',
  featured: true,
  title: 'DPF and FAP Filter Repair in Varna | PDK Tuning',
  description:
    'A blocked particulate filter is rarely the root cause. We diagnose the pressure sensor, hoses and engine first; in about one third, it is a €40 sensor.',
  lead:
    'A blocked filter is almost never the root cause. Before discussing the filter itself, we find what blocked it.',
  short:
    'Diagnostics first: in around one third of cases, the fault is a €40 sensor rather than the filter.',
  fits: [
    'A particulate-filter warning that comes on more and more often',
    'Limp mode and power loss on a longer journey',
    'Regeneration every 100–150 km rather than every 500 km',
    'A burning smell and high temperature after city driving',
  ],
  steps: [
    {
      t: 'Live-data reading',
      d: 'Differential pressure, temperatures before and after the filter, soot loading, and the number of interrupted regenerations.',
    },
    {
      t: 'Sensor check',
      d: 'The pressure sensor and its hoses are the first suspects. A blocked or split hose can falsely report a full filter to the ECU.',
    },
    {
      t: 'Find the cause',
      d: 'A clogged EGR, poor injectors or a tired turbocharger: the filter blocks because of what comes before it.',
    },
    {
      t: 'The remedy',
      d: 'Sensor replacement, forced regeneration, filter cleaning or replacement. We tell you which one applies and why.',
    },
  ],
  body: [
    {
      h: 'How a filter actually becomes blocked',
      p: [
        'A particulate filter is designed to clean itself. Under the right conditions, the ECU raises exhaust-gas temperature and burns off the accumulated soot. The process takes several minutes and needs the car to be moving. Stop the engine halfway through a regeneration and it starts again from the beginning.',
        'A car used only for short urban trips never completes regeneration. Soot accumulates, the interval between attempts shrinks, and unfinished regenerations dilute the oil with fuel. That is why we check the oil level as well when a filter is blocked.',
      ],
    },
    {
      h: 'The pressure sensor',
      p: [
        'The ECU does not see the filter. It sees the pressure difference before and after it, measured by one sensor through two thin hoses. A hose blocked with carbon, a split connector or a failed sensor produces the same picture as a full filter: high pressure, limp mode and a warning light.',
        'The check takes minutes and costs little, so it comes first. In about one third of cars that arrive with a supposedly failed filter, the problem ends there.',
      ],
    },
    {
      h: 'The line we do not cross',
      tone: 'warn',
      p: [OFFROAD_NOTE_EN],
    },
  ],
  facts: [
    { k: 'First', v: 'diagnostics, not a quote for a filter' },
    { k: 'Common real cause', v: 'pressure sensor or hose' },
    { k: 'We also check', v: 'oil diluted by incomplete regenerations' },
    { k: 'For road cars', v: 'repair; removal is not offered' },
  ],
  faq: [
    {
      q: 'Can the filter simply be removed?',
      a: 'Not for a vehicle used on public roads. It will not pass its roadworthiness test and is not legal for the road. We only switch systems off for off-road machines: race, agricultural and industrial equipment.',
    },
    {
      q: 'How many times can a filter be cleaned?',
      a: 'It depends on the condition of the ceramic core. Chemical cleaning can restore a filter blocked with soot and ash, but it cannot repair a melted or cracked core. We inspect it before promising a result.',
    },
  ],
  related: ['egr', 'diagnostics', 'software-repair'],
};
