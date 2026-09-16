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

## Един файл за адресите

[`site/.env.local`](site/.env.local) е единственият източник за билда и VPS:

```dotenv
CATALOG_BASE_URL=https://catalog.pdktuning.com
BASE_URL=https://www.pdktuning.com
```

Файлът съдържа само публични адреси и влиза в образа. Смяна на адрес се прави
тук, след което се публикува нов таг. Docker, CI и runtime не поддържат
отделни копия или подразбиращи се стойности за тези два ключа.

DNS и работещият HTTPS на `catalog.pdktuning.com` се настройват от IT на клиента.
Формата чете тайните от средата на сървъра: `RESEND_API_KEY`, `CONTACT_TO` и
`CONTACT_FROM` (приемат се и старите `MAIL_TO` и `MAIL_FROM`). Тайни не се
записват в публичния `site/.env.local`.

`/__alive` проверява процеса; `/api/health` показва `site: new-pdk`, идентификатора
на комита и дали пощата е настроена. `X-PDK-Site` и `X-PDK-Release` позволяват
да се различи действително каченият сайт от стар кеширан отговор.

## Местна работа

```sh
npm ci --prefix site
npm run build --prefix site
PORT=8000 node site/server/server.mjs
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

Кодът се доставя с Docker образите, не с `git checkout`. За да не чете никой
стара версия при нов дизайн, деплоят накрая изравнява и работното дърво на
сървъра с пуснатия таг и записва `ACTIVE-VERSION` в `/home/pdk_new/website`:

```
cat /home/pdk_new/website/ACTIVE-VERSION   # таг, комит, час на деплоя
git -C /home/pdk_new/website describe --tags
curl -sI https://new.pdktuning.com/ | grep -i x-pdk-version
```

Трите трябва да съвпадат. Ако дървото изостане (сървърът не е стигнал до
`origin`), меродавни са `ACTIVE-VERSION` и заглавката `X-PDK-Version` —
`version` в `/api/health` показва същото, а `release` е точният комит.
