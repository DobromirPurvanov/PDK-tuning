import type { Service } from '../../../data/services';

export const softwareRepair: Service = {
  slug: 'software-repair',
  name: 'ECU Software Repair',
  kicker: 'ECU recovery',
  icon: 'rescue',
  priceKey: 'softueren-remont',
  title: 'ECU software repair and recovery | PDK Tuning',
  description:
    'ECU no longer responding after an interrupted write, failed update or damaged software? We restore the correct software for its exact hardware number.',
  lead:
    'An ECU that stopped responding after a failed write is the work other workshops send on to us.',
  short: 'We recover an ECU that no longer responds after a failed write.',
  fits: [
    'An interrupted write caused by low voltage or a disconnected cable',
    'An ECU left unusable after a failed workshop update',
    'A car that will not start after software work',
    'Original software that is damaged or missing',
  ],
  steps: [
    {
      t: 'Assessing the state',
      d: 'We establish whether the ECU responds at all, by which protocol and at what level.',
    },
    {
      t: 'Direct access',
      d: 'When the ECU cannot be reached through the diagnostic connector, we work directly on the circuit board.',
    },
    {
      t: 'Writing the software',
      d: 'We restore correct software for the exact hardware number, not an approximate match.',
    },
    {
      t: 'Adaptations',
      d: 'After writing, the ECU must learn the car again: immobiliser, injectors, throttle and keys.',
    },
  ],
  body: [
    {
      h: 'How software can stop an ECU',
      p: [
        'Writing the ECU memory takes minutes and needs stable voltage throughout. A flat battery midway through, a disconnected cable or a power cut leaves the software only half written. The ECU stops responding and the car will not start.',
        'This is almost never a hardware fault. The circuit board is sound; its contents are missing. That is why we do a correct write instead of fitting a replacement ECU, which can often cost ten times as much.',
      ],
    },
    {
      h: 'The hardware number matters',
      p: [
        'Software must match the exact hardware number on the circuit board, not merely the car model. Writing a similar file can produce an ECU that starts the car but works incorrectly, sometimes for months before the fault becomes clear.',
        'We therefore read the number from the circuit board itself rather than guessing it from the year and engine.',
      ],
    },
    {
      h: 'Adaptations after the write',
      p: [
        'A recovered ECU knows nothing about its particular car: it does not recognise the keys, injector corrections or the throttle zero point. Those settings are entered after the write. An ECU returned without adaptations works, but not properly.',
      ],
    },
  ],
  facts: [
    { k: 'Usual cause', v: 'an interrupted write with a weak battery' },
    { k: 'Almost never', v: 'a hardware fault on the circuit board' },
    { k: 'After the write', v: 'adaptations: keys, injectors, throttle' },
  ],
  related: ['diagnostics', 'dtc-errors', 'chip-tuning'],
};
