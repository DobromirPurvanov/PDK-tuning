import type { Service } from '../../../data/services';

export const lambdaMaf: Service = {
  slug: 'lambda-maf',
  name: 'Lambda Sensor and MAF',
  kicker: 'Sensors',
  icon: 'sensor',
  priceKey: 'lambda',
  title: 'Lambda Sensor and MAF Diagnosis | PDK Tuning',
  description:
    'Lambda-sensor and mass-air-flow faults diagnosed from live data. We check the circuit and intake leaks before replacing a sensor that may be working.',
  lead:
    'Two of the parts most often replaced in a workshop, and two of the parts most often replaced for no reason.',
  short: 'We establish whether the sensor is at fault before replacing it.',
  fits: [
    'A lambda-sensor or air-flow fault code',
    'Higher fuel consumption with no clear cause',
    'An uneven idle and sluggish response',
    'A car whose sensor was already replaced but the fault returned',
  ],
  steps: [
    {
      t: 'Live data',
      d: 'We look at what the sensor reports at different engine speeds and loads, not only at the fault code.',
    },
    {
      t: 'Circuit check',
      d: 'Supply, earth, oxidised connector. Half of the supposedly dead sensors are poor connections.',
    },
    {
      t: 'Looking upstream',
      d: 'Air drawn through a cracked hose often makes a sensor report incorrectly when the sensor itself is not damaged.',
    },
    {
      t: 'Decision',
      d: 'Replacement, cleaning or circuit repair, according to what we have found.',
    },
  ],
  body: [
    {
      h: 'Why a fault code is not a diagnosis',
      p: [
        'The code says which circuit the control unit saw outside its expected range. It does not say which part is at fault. “Lambda sensor, lean mixture” can result from a failed sensor, an intake leak or weak fuel delivery: three different repairs at three different costs.',
        'That is why we read live data with the engine running. A sensor that responds correctly but shows a deviation points to a cause before the sensor.',
      ],
    },
    {
      h: 'The mass air-flow sensor',
      p: [
        'A contaminated MAF reports less air than is really entering the engine. The control unit reduces fuelling, the car feels sluggish and consumption rises. Cleaning with the right product can sometimes solve it; the sensing wire is delicate and must not be touched with anything else.',
        'If the car uses an oiled filter, the contamination returns. We say so because there is no sense in paying twice.',
      ],
    },
  ],
  facts: [
    { k: 'First', v: 'live data, then diagnosis' },
    { k: 'Common real cause', v: 'intake leak or oxidised connector' },
  ],
  related: ['diagnostics', 'dtc-errors', 'dpf-fap'],
};
