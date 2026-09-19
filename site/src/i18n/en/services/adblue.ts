import type { Service } from '../../../data/services';
import { OFFROAD_NOTE_EN } from './index';

export const adblue: Service = {
  slug: 'adblue',
  name: 'AdBlue & SCR',
  kicker: 'Diesel · SCR',
  icon: 'adblue',
  priceKey: 'adblue',
  featured: true,
  title: 'AdBlue & SCR Diagnostics and Repair | PDK Tuning',
  description:
    'AdBlue and SCR faults, countdowns that prevent starting, failed NOx sensors and pumps. We diagnose the system and repair the actual fault before reset.',
  lead:
    'The system that injects urea into the exhaust. When it fails, the car begins counting down to a no-start condition.',
  short:
    'For machines used away from public roads only. We explain when switching the system off makes no sense.',
  fits: [
    'A message counting down to “starting impossible after N km”',
    'Faults for an NOx sensor or urea quality',
    'A crystallised injector or a frozen pump',
    'Lorries and agricultural machinery fitted with SCR',
  ],
  steps: [
    {
      t: 'Read the system',
      d: 'NOx sensors before and after the catalyst, temperature sensor, pump, injector, and the tank level and quality.',
    },
    {
      t: 'Locate the fault',
      d: 'Crystallisation, a broken heater circuit or a failed sensor: each leaves a different pattern in the data.',
    },
    {
      t: 'Quote before work',
      d: 'NOx sensors are expensive. We give the price before starting, not afterwards.',
    },
    {
      t: 'Repair and reset',
      d: 'Once repaired, the counter is reset through the proper procedure, not hidden.',
    },
  ],
  body: [
    {
      h: 'How it works, and where it fails',
      p: [
        'Urea is injected into the hot exhaust before the SCR catalyst, where it turns nitrogen oxides into nitrogen and water. The system includes a pump, heated line, injector and at least two NOx sensors. Every part is exposed to heat and to a fluid that crystallises when it sits.',
        'The common failures are a crystallised injector after a long lay-up, a broken line heater after winter, and a failed NOx sensor. A tank filled with something other than urea is a separate, more expensive problem.',
      ],
    },
    {
      h: 'The countdown',
      p: [
        'The law requires the car not to keep running indefinitely with a failed system. That is why, when a fault remains, the controller starts a countdown: first it limits power, then it prevents the engine from starting. The counter is a requirement, not a manufacturer being difficult.',
        'It is reset after the cause has been repaired. Resetting without a repair means being back in the same position after a few thousand kilometres, with another paid visit in between.',
      ],
    },
    {
      h: 'The line we do not cross',
      tone: 'warn',
      p: [OFFROAD_NOTE_EN],
    },
  ],
  facts: [
    { k: 'The costly part', v: 'NOx sensors' },
    { k: 'After repair', v: 'the counter is reset through the proper procedure' },
    { k: 'For road cars', v: 'repair; switching off is not offered' },
  ],
  related: ['dpf-fap', 'egr', 'diagnostics'],
};
