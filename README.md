# PDK Tuning

Един сайт: [`site/`](site/README.md). Старият frontend от корена е премахнат.

## Публикуване на VPS

Таг `v*` стартира `.github/workflows/deploy.yml`: строи новия сайт от `site/`,
проверява съдържанието на началната страница, прехвърля готовите образи и ги
активира на съществуващия сървър. На VPS не се строи код.

Началната страница и активите се обслужват **директно от образа**, без прокси
към Cloudflare Pages. `site/server/server.mjs` изпълнява същата логика за
живия каталог, дилърския портал и формите като `site/public/_worker.js`.
Базата остава на сървъра на клиента; тук няма копие от нея.

`BASE_URL` е публичният адрес (сега `https://new.pdktuning.com`).
`CATALOG_BASE_URL` е отделният сървър за каталога (сега `https://www.pdktuning.com`).
Преди IT да прехвърли основния домейн, трябва да настрои отделен работещ адрес
за каталога и портала и да обнови тези две стойности при билд и изпълнение.

Публичните стойности за билда са GitHub repository variables; стойностите за
изпълнение и тайните са `.env`/`.env.local` на VPS. Формата приема `CONTACT_TO`
и `CONTACT_FROM`, както и старите `MAIL_TO` и `MAIL_FROM`.

`/__alive` проверява процеса; `/api/health` показва `site: new-pdk`, идентификатора
на комита и дали пощата е настроена. `X-PDK-Site` и `X-PDK-Release` позволяват
да се различи действително каченият сайт от стар кеширан отговор.

## Местна работа

```sh
npm ci --prefix site
npm run build:etap1 --prefix site
BASE_URL=https://new.pdktuning.com CATALOG_BASE_URL=https://www.pdktuning.com PORT=8000 node site/server/server.mjs
node --test site/server/*.test.mjs
python3 -m unittest discover -s scripts/deploy -p 'test_*.py' -v
```

Алтернатива: `docker compose up -d --build`.

Cloudflare Pages остава възможен отделен начин за хостване чрез
`npm run deploy:etap1 --prefix site`, но VPS вече не зависи от него.

## Активиране

`scripts/deploy/activate.sh` проверява контролната сума, конфигурацията и новия
сайт, обновява само услугите `web` и `api`, и записва `.compose.active.yml` и
`.images.env`. Другите проекти на сървъра не се променят.
