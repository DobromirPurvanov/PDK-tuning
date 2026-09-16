/**
 * ЦЕНОРАЗПИСЪТ ЗА РАБОТНИКА — slug → име и цена в стотинки.
 *
 * ЗАЩО СЪЩЕСТВУВА. Чекаутът се прави в public/_worker.js, а той е обикновен
 * JavaScript във файловата система на Pages — не може да внесе `src/data/ev.ts`.
 * Ако цената идваше от браузъра заедно с поръчката, всеки щеше да плати колкото
 * си напише. Затова билдът изнася цените тук, работникът ги чете през `ASSETS`
 * и взима СВОЯТА цена по slug. От браузъра идва само кой е моделът.
 *
 * Съдържа единствено моделите с обявена цена. За останалите няма какво да се
 * плаща — те минават по пътя „заяви оферта“.
 *
 * Публичен адрес, но в него няма нищо, което вече да не пише на страниците.
 */
import type { APIRoute } from 'astro';
import { EV_MODELS, EV_CURRENCY } from '../data/ev';

export const GET: APIRoute = () => {
  const items: Record<string, { name: string; amount: number }> = {};
  for (const m of EV_MODELS) {
    if (m.price == null) continue;
    items[m.slug] = {
      name: `Тунинг пакет за ${m.full} ${m.years}`,
      // Stripe брои в най-малката единица на валутата
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
