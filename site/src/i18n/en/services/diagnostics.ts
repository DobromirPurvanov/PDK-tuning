import type { Service } from '../../../data/services';

export const diagnostics: Service = {
  slug: 'diagnostics',
  name: 'Diagnostics',
  kicker: 'The starting point',
  icon: 'scan',
  priceKey: 'diagnostics',
  title: 'Computer Diagnostics in Varna | PDK Tuning',
  description:
    'A full scan of every control unit, live data and freeze frames. Diagnostics comes before any other work when a warning light or fault is present.',
  lead:
    'Everything else on this list starts here. Writing a file to a faulty car is an expensive mistake.',
  short:
    'Every other job starts here. Writing a file to a faulty car is an expensive mistake.',
  fits: [
    'A warning light or limp mode',
    'A check before chip tuning',
    'An inspection before buying a used car',
    'A second opinion after another workshop',
  ],
  steps: [
    {
      t: 'Every control unit',
      d: 'Not just the engine: gearbox, ABS, comfort systems and airbags. Faults can lead from one system to another.',
    },
    {
      t: 'Live data',
      d: 'Pressures, temperatures, injector corrections and turbocharger readings under load.',
    },
    {
      t: 'Freeze frames',
      d: 'The conditions recorded with each fault. This shows whether it is old or currently active.',
    },
    {
      t: 'Conversation',
      d: 'We explain what we found and what it will cost. If the car is not ready for a file, we say so here.',
    },
  ],
  body: [
    {
      h: 'Why it comes first',
      p: [
        'A file written to an engine with a weak turbocharger, worn injectors or a slipping clutch improves nothing. It only hastens the failure of the faulty part. The file then gets blamed, although the cause was already there.',
        'That is why diagnostics is a condition of the work, not an optional extra. If the figures show that the engine is not ready, we say so instead of writing a file and taking the money.',
      ],
    },
    {
      h: 'What you receive',
      p: [
        'We read every control unit, explain the faults in plain language, and give our view on what is urgent, what can wait and what is not a problem. If you choose to repair the car elsewhere, the diagnostic reading remains yours.',
      ],
    },
  ],
  facts: [
    { k: 'Time', v: 'around 30 minutes' },
    { k: 'Scope', v: 'every control unit, not just the engine' },
    { k: 'Before tuning', v: 'required' },
  ],
  related: ['chip-tuning', 'dtc-errors', 'dpf-fap'],
};
