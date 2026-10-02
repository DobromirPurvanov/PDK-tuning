import type { Service } from '../../../data/services';

export const popsBangs: Service = {
  slug: 'pops-bangs',
  name: 'POPS & BANGS',
  kicker: 'Sound',
  icon: 'flame',
  priceKey: 'pops-bangs',
  title: 'Exhaust Pops and Bangs Software Tuning | PDK Tuning',
  description:
    'Software-controlled pops and bangs when you lift off the throttle. We do it only for cars used off public roads and explain first what it costs the hardware.',
  lead:
    'The effect comes from the software, and the hardware pays for it. We explain both before we write anything.',
  short: 'The effect comes from the software and the exhaust pays for it. We explain both.',
  fits: [
    'Race and track cars',
    'A turbocharged petrol engine with a sports exhaust system',
    'A vehicle that is not driven on public roads',
  ],
  notFor: [
    'A car with a catalytic converter the owner wants to keep',
    'A diesel, where the effect is different and more likely to do harm',
    'A car used for everyday driving in town',
  ],
  steps: [
    {
      t: 'Talking through the consequences',
      d: 'We start with the cost: catalytic converter, turbocharger, valves. If that is not acceptable, we stop there.',
    },
    {
      t: 'Hardware check',
      d: 'We inspect the exhaust system and the condition of the engine.',
    },
    {
      t: 'The file',
      d: 'We set the strength and range of the effect, from barely audible to loud, usually in sport mode only.',
    },
    {
      t: 'Road test',
      d: 'You listen to it and decide whether you want more or less.',
    },
  ],
  body: [
    {
      h: 'What actually happens',
      p: [
        'When you lift off the accelerator, the ECU lets unburnt fuel reach the exhaust manifold and ignites it there with retarded ignition timing. The sound comes from combustion outside the cylinder, in a pipe where nothing was designed to burn.',
        'So the effect has a cost. The catalytic converter is overloaded first, followed by the manifold and the hot side of the turbocharger. If the car has a catalytic converter that needs to stay intact, pops and bangs are not for it.',
      ],
    },
    {
      h: 'Our position',
      tone: 'warn',
      p: [
        'We do it when the owner knows what they are taking on, and we never add it quietly as a bonus to another service. For a car on a public road, the noise is a matter for the law and for the neighbours. The decision belongs to the owner, and we give them the facts.',
      ],
    },
  ],
  related: ['stage-2', 'vmax-off', 'chip-tuning'],
};
