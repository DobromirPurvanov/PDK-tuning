import type { Service } from '../../../data/services';

export const dyno: Service = {
  slug: 'dyno',
  name: 'Dyno Testing',
  kicker: 'Measurement',
  icon: 'dyno',
  priceKey: 'dyno',
  featured: true,
  title: 'Dyno Power Measurement in Varna | PDK Tuning',
  description:
    'Two curves, before and after the file, on the same dyno on the same day. A dyno run is the only evidence of what actually changed in your car.',
  lead:
    'Numbers rather than impressions. The dyno is why we can make any claim about the result at all.',
  short: 'Two curves, before and after the file. The measurement is the evidence.',
  fits: [
    'Before and after chip tuning',
    'Developing a Stage 2 calibration over several sessions',
    'Checking whether a car produces its factory figures',
    'A disagreement with a previous tuner',
  ],
  steps: [
    {
      t: 'Preparation',
      d: 'We check the tyres, their pressure and the temperature. A cold engine produces different figures.',
    },
    {
      t: 'First run',
      d: 'Full load through the entire rev range. We record power and torque.',
    },
    {
      t: 'Repeat runs',
      d: 'Several runs show whether the figure is stable rather than a one-off.',
    },
    {
      t: 'Printout',
      d: 'You receive the curves. They remain yours, whatever you decide to do next.',
    },
  ],
  body: [
    {
      h: 'Why the curve matters more than the peak figure',
      p: [
        'Peak power is one point. The shape of the curve shows how the car drives: where torque arrives, how broad the plateau is, and whether there is a dip through the middle. A file that lifts the peak but cuts the mid-range is worse in daily driving than one with a more modest figure.',
        'That is why we put both curves on top of each other. The difference is visible; it does not require trust.',
      ],
    },
    {
      h: 'How to read dyno figures',
      p: [
        'Figures depend on the dyno, its atmospheric correction and the condition of the car that day. A comparison only means something when both measurements are made on the same dyno, close together in time. That is how we work here.',
        'Figures from different dynos are not comparable. If someone presents power from another dyno as evidence of what will happen to your car, that is advertising, not measurement.',
      ],
    },
  ],
  facts: [
    { k: 'Time', v: '30–45 minutes' },
    { k: 'You receive', v: 'a printout with both curves' },
    { k: 'A valid comparison needs', v: 'the same dyno' },
  ],
  related: ['chip-tuning', 'stage-2', 'diagnostics'],
};
