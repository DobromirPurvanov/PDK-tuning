import type { Service } from '../../../data/services';

export const tcuDsg: Service = {
  slug: 'tcu-dsg',
  name: 'TCU & DSG Tuning',
  kicker: 'Transmission',
  icon: 'gear',
  priceKey: 'tcu-dsg',
  title: 'DSG & Automatic Gearbox Tuning | PDK Tuning',
  description:
    'TCU software for DSG and automatic gearboxes: quicker shifts, revised torque limits and pedal response for DQ250, DQ200, DQ381 and more.',
  lead:
    'The engine is only half the equation. The standard gearbox often limits torque before the engine reaches its own limit.',
  short:
    'The gearbox can limit torque before the engine has reached its potential.',
  fits: [
    'VAG DSG gearboxes: DQ250, DQ200, DQ381 and DL501',
    'A chip-tuned car whose gearbox is cutting torque',
    'A conventional hydraulic automatic with slow, soft shifts',
    'Slow response when the accelerator is pressed fully',
  ],
  notFor: [
    'A gearbox with a mechanical fault: repair comes before software',
    'Worn clutches in a wet clutch pack. Software will only finish them off.',
  ],
  steps: [
    {
      t: 'Gearbox diagnostics',
      d: 'We read adaptations and faults in the transmission control unit. Wear in a gearbox shows up in the figures.',
    },
    {
      t: 'Read and archive',
      d: 'The original TCU file is read and stored separately from the engine file.',
    },
    {
      t: 'Calibration',
      d: 'Torque limits, clutch pressure, shift speed and points, plus manual-mode behaviour.',
    },
    {
      t: 'Road test',
      d: 'We drive the car and refine the calibration. Software that jerks while parking is not finished.',
    },
  ],
  body: [
    {
      h: 'Why the gearbox becomes the limit',
      p: [
        'The transmission controller has its own torque ceiling, usually lower than the engine\'s, because the manufacturer protects the clutches for the full warranty mileage. After chip tuning, the engine tries to deliver more and the gearbox quietly takes it away. The result is a file that seems to disappear through the mid-range.',
        'Raising that ceiling is TCU work, separate from the engine file. We do it within what the clutches genuinely hold, not without limit.',
      ],
    },
    {
      h: 'What changes behind the wheel',
      p: [
        'Shifts become shorter and more defined, especially at full load. The gearbox stops chasing the tallest gear at every opportunity and does not upshift immediately when you ease the accelerator. In manual mode, it holds the gear to the limiter instead of shifting for you.',
        'We do not deliberately make everyday driving worse: crawling in traffic and pulling away uphill remain smooth, because a gearbox that jerks at every stop is simply unfinished.',
      ],
    },
    {
      h: 'Wet clutch packs and wear',
      p: [
        'If the clutches are already worn, higher pressure will bring their end sooner. That is why we read the adaptations before starting. When the figures show a clutch pack is near the end of its life, we say so and recommend repair rather than software.',
      ],
    },
  ],
  facts: [
    { k: 'Gearboxes', v: 'DQ250, DQ200, DQ381, DL501 and conventional automatics' },
    { k: 'Best combined with', v: 'an engine calibration' },
    { k: 'Archive', v: 'the original TCU file is stored separately' },
  ],
  related: ['chip-tuning', 'stage-2', 'diagnostics'],
};
