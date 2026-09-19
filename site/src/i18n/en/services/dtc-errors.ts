import type { Service } from '../../../data/services';

export const dtcErrors: Service = {
  slug: 'dtc-errors',
  name: 'DTC Errors',
  kicker: 'Diagnostics',
  icon: 'error',
  priceKey: 'dtc',
  title: 'Persistent DTC Errors in the ECU | PDK Tuning',
  description:
    'A fault that returns after every clear needs diagnosing, not another reset. We use freeze frames and live data to find the cause before the next start.',
  lead:
    'A fault that returns after being cleared is not a memory problem. It is a symptom that is still there.',
  short:
    'A fault that returns after being cleared cannot be fixed by clearing it again.',
  fits: [
    'A warning light that returns after several starts',
    'Several faults at once that appear unrelated',
    'A car that has visited several workshops without a result',
    'Limp mode with no obvious trigger',
  ],
  steps: [
    {
      t: 'Full scan',
      d: 'Every control unit, not only the engine. A fault in the comfort system can affect the engine.',
    },
    {
      t: 'Freeze-frame data',
      d: 'The conditions when the fault occurred: engine speed, temperature and load. This tells us when it happens.',
    },
    {
      t: 'Checks on the car',
      d: 'Mechanical and electrical. A code points to a direction, not to a replacement part.',
    },
    {
      t: 'Repair and confirmation',
      d: 'After the repair, we drive the car until the triggering conditions occur again, without the fault returning.',
    },
  ],
  body: [
    {
      h: 'Why clearing a fault is not a repair',
      p: [
        'Clearing removes the record, not the cause. If the condition occurs again, the control unit logs the fault again, usually after a few starts. Clearing is useful only to establish whether the fault is active now or left over from an earlier repair.',
        'It can also lose useful evidence. Clearing the record removes its freeze frame: the conditions in which the fault occurred. That is the most useful information in the memory, so we clear faults only after reading it.',
      ],
    },
    {
      h: 'Faults that lead to one another',
      p: [
        'One poor earth connection can generate ten codes across five different control units. Chasing each one separately wastes time and money. We first establish which occurred first; freeze frames and start counters show the order.',
      ],
    },
  ],
  related: ['diagnostics', 'lambda-maf', 'software-repair'],
};
