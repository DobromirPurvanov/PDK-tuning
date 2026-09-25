export type Qa_EN = { q: string; a: string; group: string };

export const FAQ_EN: Qa_EN[] = [
  {
    group: 'Warranty and risk',
    q: 'Will I lose my vehicle warranty?',
    a: 'If the car is still under warranty, changing the factory software may give the dealer grounds to refuse warranty repairs to the engine and transmission. We ask about this at the outset: if the car is under warranty, we discuss whether changing it now makes sense at all. The factory file is kept and can be restored at any time.',
  },
  {
    group: 'Warranty and risk',
    q: 'Is chip tuning dangerous for the engine?',
    a: 'Not when it stays within the limits of the hardware. We work within the factory margins of the specific engine, assess its condition before writing a file, and do not alter a car with a failing turbocharger, injectors or clutch. If the engine is not ready, we say so instead of writing a file.',
  },
  {
    group: 'Warranty and risk',
    q: 'Can the factory software be restored?',
    a: 'Yes. We read and archive the original file before every change. Restoring it takes as long as writing the file and returns the software to its factory state.',
  },
  {
    group: 'Warranty and risk',
    q: 'Will it be apparent that the software has been changed?',
    a: 'Modern control units retain a write counter and checksum. An authorised workshop using factory diagnostics may see that the unit has been written to, including after the original file is restored. We do not promise invisibility; it is part of the initial discussion.',
  },
  {
    group: 'The result',
    q: 'How long does it take?',
    a: 'Stage 1 chip tuning usually takes 2–4 hours with the car at our workshop. Stage 2 and transmission work are planned in advance. A dyno measurement takes 30–45 minutes.',
  },
  {
    group: 'The result',
    q: 'What happens to fuel consumption?',
    a: 'With the same driving style, fuel consumption usually falls because the engine reaches the same speed at lower revs. Use the extra power and consumption rises; there is no way around physics.',
  },
  {
    group: 'The result',
    q: 'What is the difference between Stage 1 and Stage 2?',
    a: 'Stage 1 is software only, on factory hardware. Stage 2 assumes modified hardware, such as an intercooler, exhaust system or different turbocharger, and the file is written for that exact build after measurement.',
  },
  {
    group: 'The result',
    q: 'Is a dyno measurement essential?',
    a: "It isn't required, though it is the only proof. The dyno gives two curves, before and after, so you can see exactly what changed instead of relying on a feeling.",
  },
  {
    group: 'The result',
    q: 'Where do the figures in the website catalogue come from?',
    a: 'They come from our own database of measurements for specific engines, maintained by us. The figure is taken for the exact engine you select, not for the make in general. That is why two cars of the same model with different control units can have different values.',
  },
  {
    group: 'Exhaust emissions',
    q: 'Do you remove DPF, EGR and AdBlue systems from cars driven on public roads?',
    a: 'No, disabling exhaust-emissions systems is permitted only for machines used away from public roads, such as racing, agricultural and industrial equipment. For a road car, we work on the repair: diagnostics, cleaning, or replacing a sensor or filter. In about one third of cases, the fault is a sensor and the car needs nothing else.',
  },
  {
    group: 'Exhaust emissions',
    q: 'Why does my filter clog again after replacement?',
    a: 'Because the cause was upstream of the filter, not in it. A clogged EGR valve, worn injectors or a tired turbocharger produce more soot than the system can burn off. A new filter clogs on the same schedule if those three have not been checked.',
  },
  {
    group: 'Practical matters',
    q: 'Do I need to book in advance?',
    a: 'Usually, yes, for diagnostics and Stage 1, so we can make sure both the dyno and the technician are available. Stage 2, transmission work and agricultural equipment must be booked in advance.',
  },
  {
    group: 'Practical matters',
    q: 'Do you work with other workshops and dealers?',
    a: 'Yes. Partner workshops upload their files through the portal and receive the completed file there. The portal is separate from this website, and access is arranged individually.',
  },
  {
    group: 'Practical matters',
    q: 'Can I come in for a measurement only?',
    a: 'Yes. Dyno measurement is a standalone service. You receive the printout with the curves and keep it, whatever you decide afterwards.',
  },
];

export const FAQ_GROUPS_EN = ['Warranty and risk', 'The result', 'Exhaust emissions', 'Practical matters'];

export const FAQ_HOME_EN = FAQ_EN.filter((f) =>
  [
    'Will I lose my vehicle warranty?',
    'Is chip tuning dangerous for the engine?',
    'Can the factory software be restored?',
    'How long does it take?',
    'What happens to fuel consumption?',
    'Do you remove DPF, EGR and AdBlue systems from cars driven on public roads?',
    'What is the difference between Stage 1 and Stage 2?',
    'Is a dyno measurement essential?',
  ].includes(f.q),
);
