// Иконите са вградени SVG низове — без шрифт с икони, без външни заявки.
const svg = (d: string, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" ${extra}>${d}</svg>`;
export const icons = {
  phone: svg('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>'),
  viber: svg('<path d="M12 3C7 3 4 6 4 10.5c0 2.6 1.2 4.6 3 5.8V21l3.2-2.4c.6.1 1.2.2 1.8.2 5 0 8-3 8-7.5S17 3 12 3z"/><path d="M9.5 9.5c.3 2 1.6 3.6 3.5 4.3l1-1.2 2 1"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  close: svg('<path d="M5 5l14 14M19 5L5 19"/>'),
  upload: svg('<path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16"/>'),
  arrow: svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
  pin: svg('<path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  check: svg('<path d="M4 12l5 5L20 6"/>'),
  gauge: svg('<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-6"/><path d="M3 20h18"/>'),
};
