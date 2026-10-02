import type { Service } from '../../../data/services';

export const softwareRepair: Service = {
  slug: 'software-repair',
  name: 'ECU Software Repair',
  kicker: 'Recovery',
  icon: 'rescue',
  priceKey: 'softueren-remont',
  title: 'ECU Software Repair and Recovery | PDK Tuning',
  description:
    'A control unit that stopped responding after an interrupted or failed software write. We find the cause and check whether the unit can be recovered.',
  heading: 'Control Unit Software Repair',
  lead:
    'If a control unit has stopped responding after an interrupted or failed software write, we can check the cause and whether it can be recovered. Send us details of the car, the control unit and what happened during the write.',
  short: 'A control unit that stopped responding after a failed write. We check whether it can be recovered.',
  fits: [],
  steps: [],
  body: [
    {
      h: 'Why a control unit can stop responding after a write',
      p: [
        'Writing software needs a stable power supply and an uninterrupted connection to the control unit. If the process is interrupted, for example by a voltage drop or a lost connection, the software may be left only partly written. The unit can then stop responding and the car may not start.',
        'The cause is established through diagnostics. In some cases the unit can be recovered by writing the software again; in others it needs further repair. We therefore check the unit first, before telling you whether it can be recovered and what it will cost.',
      ],
    },
  ],
  related: ['diagnostics', 'dtc-errors', 'chip-tuning'],
};
