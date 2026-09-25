import type { Service } from '../../../data/services';

export const stage2: Service = {
  slug: 'stage-2',
  name: 'Stage 2',
  kicker: 'Hardware and software',
  icon: 'stage',
  priceKey: 'stage-2',
  featured: true,
  title: 'Stage 2 Custom Tuning in Varna | PDK Tuning',
  description:
    'Calibration for a specific build with an intercooler, exhaust or different turbocharger. Developed from dyno measurements, never selected from a catalogue.',
  lead:
    'Once the hardware is no longer standard, the software cannot be standard either. We develop Stage 2 for the build in front of us, after measuring it.',
  short: 'For cars with modified hardware: intercooler, exhaust system or turbocharger.',
  fits: [
    'An upgraded intercooler or charge-air system',
    'An exhaust system with lower restriction',
    'A different turbocharger or hybrid turbo',
    'An uprated clutch able to handle the torque',
  ],
  notFor: [
    'A car with standard hardware: Stage 1 delivers the same outcome for less',
    'A build with unknown parts, or parts that have not been fitted correctly',
  ],
  steps: [
    {
      t: 'Inspecting the build',
      d: 'We establish exactly what has changed, what each part is and how it was fitted. Without that list, there is no basis for a calibration.',
    },
    {
      t: 'Measurement',
      d: 'The dyno shows what the car does with its new hardware and existing software. That is where we begin.',
    },
    {
      t: 'First file',
      d: 'We write it carefully and leave margin. The first calibration is meant to be safe, not a record attempt.',
    },
    {
      t: 'Calibration over several writes',
      d: 'We measure, adjust the calibration and measure again, keeping mixture and temperatures within the limits of the parts actually fitted.',
    },
    {
      t: 'Final curve',
      d: 'The final measurement is also the handover. You receive a printout of both curves.',
    },
  ],
  body: [
    {
      h: 'How it differs from Stage 1',
      p: [
        'Stage 1 is software on standard hardware. The margin is the one left by the manufacturer, so the limit is known in advance. Stage 2 assumes the hardware has changed. The limit moves, and it has to be found rather than guessed.',
        'That is why Stage 2 is not a file downloaded and written to the ECU. It is a calibration developed over several passes, with the dyno between them. Anyone offering Stage 2 for a particular car without seeing its parts is selling Stage 1 under a more expensive name.',
      ],
    },
    {
      h: 'What must be ready before the software',
      p: [
        'The clutch is the first component to give way as torque rises. With manual gearboxes, it is the most common issue after Stage 2. Cooling comes next: a more powerful engine creates more heat, and the standard intercooler quickly becomes restrictive.',
        'We also check fuel delivery. At higher pressures, the standard fuel pump and injectors may already be at their limit. If they are, we say so before writing a file, not after the mixture runs lean.',
      ],
    },
    {
      h: 'Being honest about the figures',
      p: [
        'A Stage 2 gain depends entirely on the build. The same engine with a different turbocharger produces a different result, and the difference can be twofold. We therefore do not give a figure before measuring the car. After seeing it, we give a range.',
      ],
    },
  ],
  facts: [
    { k: 'Time', v: 'by arrangement, usually several days' },
    { k: 'Required', v: 'dyno measurements before and after' },
    { k: 'Writes', v: 'several, with adjustment between them' },
    { k: 'Needs', v: 'a suitable clutch and cooling system' },
  ],
  related: ['chip-tuning', 'dyno', 'pops-bangs'],
};
