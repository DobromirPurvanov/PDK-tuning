/**
 * THE PRICE LIST FOR THE WORKER: slug to name and price in cents.
 *
 * WHY IT EXISTS. The checkout is done in public/_worker.js, which is plain
 * JavaScript in the Pages file system and cannot import `src/data/ev.ts`.
 * If the price came from the browser together with the order, everyone would pay whatever
 * they typed. So the build exports the prices here, the worker reads them through `ASSETS`
 * and takes ITS OWN price by slug. Only the model identity comes from the browser.
 *
 * It contains only the models with an announced price. For the rest there is nothing to
 * pay for: they take the "request a quote" path.
 *
 * A public address, but it holds nothing that is not already written on the pages.
 */
import type { APIRoute } from 'astro';
import { EV_MODELS, EV_CURRENCY } from '../data/ev';

export const GET: APIRoute = () => {
  const items: Record<string, { name: string; amount: number }> = {};
  for (const m of EV_MODELS) {
    if (m.price == null) continue;
    items[m.slug] = {
      name: `Тунинг пакет за ${m.full} ${m.years}`,
      // Stripe counts in the smallest unit of the currency
      amount: Math.round(m.price * 100),
    };
  }

  return new Response(JSON.stringify({ currency: EV_CURRENCY, items }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};
