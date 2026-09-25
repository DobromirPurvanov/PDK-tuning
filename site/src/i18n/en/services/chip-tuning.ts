import type { Service } from '../../../data/services';

export const chipTuning: Service = {
  slug: 'chip-tuning',
  name: 'Chip Tuning',
  kicker: 'Power and economy',
  icon: 'chip',
  priceKey: 'chip-tuning',
  featured: true,
  title: 'Chip Tuning in Varna, Stage 1 on the Dyno | PDK Tuning',
  description:
    'A custom file for the engine in front of us, never a download by engine code. Dyno runs before and after, and the original software stays archived.',
  lead:
    'We build a file for the specific ECU after reading its original software, not a generic download matched only to an engine code.',
  short: 'A custom file for the specific ECU, measured on the dyno before and after.',
  fits: [
    'Turbocharged diesel and petrol engines, where the usable reserve is greatest',
    'A car with sound hardware: turbocharger, injectors and clutch in good order',
    'Drivers who want easier overtaking without a downshift',
    'A car outside warranty, or an owner who understands the trade-off',
  ],
  notFor: [
    'An engine with an existing fault: repair it before changing the software',
    'A car under warranty when the owner does not want to risk an engine claim being refused',
    'A naturally aspirated petrol engine, where the gain rarely justifies the cost',
  ],
  steps: [
    {
      t: 'Conversation',
      d: 'We establish what you want from the car and what the engine can deliver. If those do not match, we say so before any file is written.',
    },
    {
      t: 'Diagnostics',
      d: 'We read fault codes and live data. A car with a failing turbocharger, clogged injectors or a slipping clutch does not come in for a file.',
    },
    {
      t: 'Baseline run',
      d: 'The first dyno curve is the starting point and the record of what the car produced before we touched it.',
    },
    {
      t: 'Read and archive',
      d: 'We read and archive the original file. From then on, returning to standard is a matter of minutes.',
    },
    {
      t: 'Calibration',
      d: 'We tune the specific ECU: boost pressure, injection, ignition timing and limiters, all within the hardware limits.',
    },
    {
      t: 'Write and second run',
      d: 'We write the file, measure again and compare both curves. You see the difference rather than taking our word for it.',
    },
  ],
  body: [
    {
      h: 'Why standard software leaves room',
      p: [
        'A manufacturer writes one calibration for the world. It has to run on fuel of varying quality, at −30 and +45 degrees, with missed servicing and drivers who ignore temperatures. There is also product planning: the same engine is sold at three output levels so there is a reason to pay more.',
        'That leaves a margin between the standard calibration and the hardware\'s physical limit. Chip tuning works within that margin. It does not invent power. It brings the safeguards closer to what this particular engine can actually support.',
      ],
    },
    {
      h: 'What we change in the ECU',
      p: [
        'We work with turbocharger pressure, injection quantity and timing, ignition timing on petrol engines, gear-based torque limiters and pedal mapping. On diesels, most of the gain comes from injection and boost. On direct-injection petrol engines, timing and boost work together.',
        'We leave every protection that prevents the engine damaging itself in place: temperature protection, lean-mixture protection and limp modes remain active. A file that removes them trades ten horsepower for an engine.',
      ],
    },
    {
      h: 'Fuel consumption',
      p: [
        'With the same driving style, consumption will usually fall because the engine reaches the same speed at lower revs and with less throttle. The difference shows most clearly on longer trips with a loaded car or a trailer.',
        'Use the extra power and consumption rises. Physics does not bend: more power means more fuel burnt. We do not promise an extra 30 horsepower and two litres less fuel with the same driving.',
      ],
    },
    {
      h: 'Returning to standard',
      p: [
        'We read and retain the original file before any change. Restoring it takes no longer than writing the modified file and leaves no trace in the ECU. If you sell the car, visit a main dealer or simply do not like the result, we return it to standard.',
      ],
    },
  ],
  facts: [
    { k: 'Time', v: '2–4 hours with the car in our workshop' },
    { k: 'Typical diesel gain', v: '+15 to +25% power' },
    { k: 'Typical turbo petrol gain', v: '+15 to +30% power' },
    { k: 'Evidence', v: 'two dyno curves, before and after' },
    { k: 'Return to standard', v: 'any time, using the archived original file' },
  ],
  faq: [
    {
      q: 'What will my engine gain exactly?',
      a: 'Choose the make, model, year and engine in the catalogue. The before-and-after figures come from our database for that specific engine code. They are results we have achieved on that engine, not average percentages.',
    },
    {
      q: 'Will it be possible to tell that the software was changed?',
      a: 'Modern ECUs retain a write counter and checksum. A main dealer using factory diagnostics may see that the ECU has been written to. That is why we ask about warranty at the start. We do not promise invisibility.',
    },
  ],
  related: ['stage-2', 'dyno', 'diagnostics'],
};
