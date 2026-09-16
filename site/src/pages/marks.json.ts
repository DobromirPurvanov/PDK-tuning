/**
 * СЛУГОВЕТЕ НА МАРКИТЕ — за работника, не за хора.
 *
 * ЗАЩО СЪЩЕСТВУВА. `public/_worker.js` пренасочва `/bg/<марка>` към
 * `/katalog/<марка>/` и за това трябва да знае кои са нашите 110 марки. Той е
 * обикновен JavaScript във файловата система на Pages и не може да внесе
 * `src/data/marks.json`. Вторият вариант — списък, преписан в работника — щеше
 * да се разминава с данните при първата добавена марка и никой нямаше да
 * забележи, защото разминаването изглежда като „просто не пренасочва“.
 *
 * Същият похват като `ev-prices.json.ts`: билдът изнася, работникът чете през
 * `ASSETS`. Един източник.
 *
 * Не влиза в картата на сайта и не носи нищо, което да не се вижда на
 * `/katalog/`.
 */
import type { APIRoute } from 'astro';
import marks from '../data/marks.json';

type Mark = { slug: string };

export const GET: APIRoute = () =>
  new Response(JSON.stringify((marks as Mark[]).map((m) => ({ slug: m.slug }))), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
