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
    'We measure power and torque before and after the calibration, then compare both runs on one graph, recorded on the same dyno. Book a dyno session in Varna.',
  heading: 'Dyno Power Measurement',
  lead:
    'We measure power and torque before and after the calibration. That lets us compare the results and show you what has changed on your car.',
  short: 'We measure power and torque before and after the calibration.',
  fits: [],
  steps: [],
  body: [
    {
      h: 'Why we look at the whole curve',
      p: [
        'Peak power is only part of the result. The graph also shows how power and torque change across the rev range, for example whether the car accelerates better in the range you use every day.',
        'That is why we put the measurements from before and after the calibration on one graph. You can see the final figures and exactly where in the rev range the change happened.',
      ],
    },
    {
      h: 'How to read dyno results',
      p: [
        'Readings can vary with the dyno, the atmospheric conditions and the condition of the car at the time of the run. The most useful comparison is therefore your own car before and after the calibration, measured on the same dyno in conditions as close as possible.',
        'A figure from another car or another dyno can serve as a rough guide, but it does not show what result your car will achieve.',
      ],
    },
  ],
  cta: {
    title: 'Book a dyno session',
    text: 'Tell us the make, model and engine of your car and what you would like to check. We will explain what the measurement can show and whether it suits your case.',
  },
  related: ['chip-tuning', 'stage-2', 'diagnostics'],
};
