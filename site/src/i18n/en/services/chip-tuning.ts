import type { Service } from '../../../data/services';

export const chipTuning: Service = {
  slug: 'chip-tuning',
  name: 'Chip Tuning',
  kicker: 'Power and torque',
  icon: 'chip',
  priceKey: 'chip-tuning',
  featured: true,
  title: 'Stage 1 Chip Tuning in Varna, Dyno-Tested | PDK Tuning',
  description:
    'Software calibrated for the specific engine and its management system. We read and keep the original file and measure the result on the dyno before and after.',
  lead:
    'We calibrate the software for the specific car. First we read and keep the original file, then we prepare the calibration for its engine and engine management.',
  short: 'A calibration for the specific engine, measured before and after.',
  fits: [],
  stepsTitle: 'How chip tuning works with us',
  steps: [
    {
      t: 'Conversation',
      d: 'We agree what you would like to improve and what result is realistic for your car.',
    },
    {
      t: 'Diagnostics',
      d: 'We check for fault codes and follow the engine’s operating parameters. If we find a problem with the turbocharger, fuel system or clutch, we first discuss what needs to be put right.',
    },
    {
      t: 'First measurement',
      d: 'We measure the car on the dyno so that we have a reference point for the comparison.',
    },
    {
      t: 'Read and archive',
      d: 'We read and keep the original software before making any changes.',
    },
    {
      t: 'Calibration',
      d: 'We prepare the software for the specific engine, its management system and the technical condition of the car.',
    },
    {
      t: 'Write and check',
      d: 'We write the calibration, check how the car runs and measure it on the dyno again. Finally we compare the results and go through them with you.',
    },
  ],
  body: [
    {
      h: 'Where chip tuning has potential',
      p: [
        'Some engines have a margin between the factory calibration and what the car can achieve with its existing hardware. The most noticeable change is usually possible on turbocharged diesel and turbocharged petrol engines. Naturally aspirated petrol engines have less to give.',
        'How much margin a particular car has depends on its engine and technical condition. We therefore check it before we propose a calibration or give an indication of the result.',
      ],
    },
    {
      h: 'What we change in the calibration',
      p: [
        'Depending on the engine, we adjust parameters such as boost pressure, injection, ignition and torque limits. Not every car allows the same changes, so we work to the specific engine management and the condition of the engine.',
        'We keep the protective functions that guard the engine at high temperatures or when it runs outside permitted values. We do not switch them off to gain more power.',
      ],
    },
    {
      h: 'How it affects fuel consumption',
      p: [
        'Fuel consumption may change after chip tuning, but we cannot promise a specific reduction. It depends on your routes, how heavily the car is loaded and how you drive.',
        'If you use the extra power more often, consumption may rise. For that reason we present chip tuning as a way to improve how the car drives, and we do not promise fuel savings.',
      ],
    },
    {
      h: 'Returning to the original software',
      p: [
        'Before calibrating, we read and keep the car’s original software. If you wish, we can write it back, for example before a sale or if you prefer the factory settings.',
        'Restoring the original software does not guarantee that the earlier change will go undetected if the car is checked at a main dealer.',
      ],
    },
  ],
  cta: {
    title: 'Tell us about your car',
    text: 'Send us the make, model, year and engine, and what you would like to improve. We will talk through what result is realistic and whether diagnostics are needed before the calibration.',
  },
  related: ['stage-2', 'dyno', 'diagnostics'],
};
