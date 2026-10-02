import type { Service } from '../../../data/services';

export const vmaxOff: Service = {
  slug: 'vmax-off',
  name: 'VMAX OFF',
  kicker: 'Limiters',
  icon: 'speed',
  priceKey: 'v-max',
  title: 'Top Speed Limiter Removal (VMAX OFF) | PDK Tuning',
  description:
    'Removal of the factory top-speed limiter, for machines used away from public roads only and after we have checked the tyres, brakes and suspension.',
  lead:
    'The factory top-speed limit is a software setting. The tyres, brakes and suspension underneath it cannot be rewritten.',
  short: 'The speed limit is in the software. The tyres and brakes beneath it cannot be rewritten.',
  fits: [
    'Track and competition use',
    'Agricultural and industrial machinery with a factory speed limit',
    'A vehicle used away from public roads',
  ],
  notFor: [
    'A car whose tyres have a speed rating below the speed you are after',
    'A car driven on public roads, where the limit is also a legal one',
  ],
  steps: [
    {
      t: 'Tyre check',
      d: 'The tyre speed rating is the hard limit. If the tyres are rated below the target speed, we change nothing.',
    },
    {
      t: 'Brakes and suspension',
      d: 'Stopping from a higher speed asks more of the brakes than accelerating to it asks of the engine.',
    },
    {
      t: 'The file',
      d: 'We raise or remove the limiter, depending on what the hardware allows.',
    },
  ],
  body: [
    {
      h: 'Where the limit comes from',
      p: [
        'Most speed limiters are set for commercial or insurance reasons rather than technical ones, and the engine itself would cope with more. The rest of the car, however, was chosen for the factory limit: tyres, brakes, aerodynamics, even the wheel bearings.',
        'That is why we start with the tyres before we look at the ECU. A tyre with an H rating is made for 210 km/h and stays a 210 km/h tyre, whatever the software says.',
      ],
    },
    {
      h: 'The line we do not cross',
      tone: 'warn',
      p: [
        'For a vehicle driven on public roads, the maximum permitted speed is also limited by law, and removing the limiter does not change that. We do this work for off-road machinery and for track use.',
      ],
    },
  ],
  related: ['chip-tuning', 'stage-2', 'pops-bangs'],
};
