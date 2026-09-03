// Писаните страници (план, стр. 9). Датата е кога съдържанието е пипано за последно — влиза в картата.
import { routes, servicePath, type Lang } from '@/i18n';
import { SERVICES } from './services';
export interface PageDef { key: string; path: Record<Lang, string>; updated: string }
export const PAGES: PageDef[] = [
  { key: 'home', path: routes.home, updated: '2026-09-01' },
  { key: 'chipTuningVarna', path: routes.chipTuningVarna, updated: '2026-09-01' },
  { key: 'chipTuning', path: routes.chipTuning, updated: '2026-09-01' },
  { key: 'services', path: routes.services, updated: '2026-09-01' },
  ...SERVICES.map((s) => ({ key: `service:${s.slug}`, path: { bg: servicePath('bg', s.slug), en: servicePath('en', s.slug) }, updated: '2026-09-01' })),
  { key: 'dyno', path: routes.dyno, updated: '2026-09-01' },
  { key: 'prices', path: routes.prices, updated: '2026-09-01' },
  { key: 'faq', path: routes.faq, updated: '2026-09-01' },
  { key: 'about', path: routes.about, updated: '2026-09-01' },
  { key: 'contact', path: routes.contact, updated: '2026-09-01' },
  { key: 'privacy', path: routes.privacy, updated: '2021-12-30' },
];
