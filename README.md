# pdktuning.com — новият сайт

Статичен сайт (Astro 7) + nginx в Docker + малък API за формата. Строи се по „Пълен план за изпълнение“ от 25.08.2026 (Just Pablo).
Адресите на стария сайт се запазват 1:1; каталогът е извлечен от него и живее като JSON в хранилището.

## Пускане

```bash
cp .env.example .env          # ключовете (виж вътре); празен .env също работи
docker compose up -d --build  # → http://localhost:8000
```

Контейнерът `web` (nginx, порт 8000 на хоста) сервира сайта и проксира `/api/` към `api` (Node, формата)
и портала за файлове (`/bg/login`, `/en/login`, профил…) към `LEGACY_UPSTREAM`. На сървъра `new.pdktuning.com`
се проксира към порт 8000 на localhost.

## Деплой

Push към `main` и pull request пускат регресионните тестове, билд на двата имиджа
и проверки с реални контейнери на GitHub runner, без достъп до сървъра.
Таг `v*` стартира `.github/workflows/deploy.yml` в GitHub Actions (`ubuntu-latest`).
Runner-ът билдва двата имиджа за `linux/amd64`, проверява nginx и HTTP отговорите,
и прехвърля готовите образи с `docker save`/SCP по съществуващите SSH secrets.
Не е необходим registry. Сървърът изпълнява само `docker load` и
`docker compose up -d --no-build --pull never web api`.
Няма рестарт на Docker daemon, `compose down`, `--remove-orphans` или глобален prune.
Подменят се само `web` и `api` в съществуващия Compose проект.

`PUBLIC_GTM_ID` и `PUBLIC_TURNSTILE_SITEKEY` се прочитат преди билда от сървърните
`.env` и `.env.local` (вторият е с предимство). Само тези публични настройки
се връщат към runner-а; API тайните остават на сървъра.
SSH secrets остават `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SSH_PRIVATE_KEY`.
Сървърът трябва да е amd64, с Docker Compose v2, Bash, flock, sha256sum и curl.
Потребителят за SSH трябва да има достъп до Docker.

Архивът се проверява със SHA-256 преди зареждане и се изтрива след успешен деплой.
Деплоите са сериализирани; няма автоматично изтриване на имиджи на споделения хост.
При неуспешна HTTP проверка pipeline-ът се проваля и показва логовете;
няма автоматичен rollback. Предишните имиджи и release конфигурации остават налични.

За ръчно стартиране след успешен деплой, в `/home/pdk_new/website`:

```bash
docker compose --env-file .env --env-file .images.env up -d --no-build --pull never web api
# Ако има .env.local, добави --env-file .env.local преди --env-file .images.env.
```

Локалният `docker-compose.yml` остава за разработка с build.
На сървъра pipeline-ът записва `docker-compose.production.yml` като `docker-compose.yml`
без build секции. SEO проверките са отделна CI порта в `build-check.yml`;
в Dockerfile резултатът им е диагностичен и не спира образа.

## Памет на API-то

Ограничителят на формата пази до 10 000 IP адреса и до 5 заявки за всеки адрес
в плъзгащ прозорец от един час. Изтеклите записи се премахват при заявки и на
всеки 60 секунди, включително когато няма трафик. При запълване новите адреси
получават HTTP 429 до освобождаване на място; активните ограничения се запазват.
Това ограничава паметта на rate limiter-а, не общата памет на целия процес.
Тестовете се изпълняват с `npm test --prefix api` и в двата CI workflow-а.

## Команди

| команда | какво прави |
|---|---|
| `npm run crawl` | сваля стария сайт в `.crawl/` (3 нишки, 300 ms пауза; не се тегли повторно) — след него `node scripts/crawl-engines.mjs` за двигателите, които картата на сайта не показва |
| `npm run parse` | прави `src/data/catalog/*.json`, `catalog-index.json`, `lastmod.json`, `redirects-catalog.json`, логата в `public/logos/` и `.crawl/anomalies.csv` |
| `node scripts/build-redirects.mjs` | генерира `docker/nginx/redirects.map` (матрицата от плана + каталожни клонове без данни) |
| `npm run dev` | местен сървър (Astro) |
| `npm run build` | генерира `dist/` и пуска проверките |
| `npm run verify` | само проверките, върху готов `dist/` |

## Къде се сменя какво

- **Цена** — `src/data/prices.json`. Единственото място; влиза в таблиците, услугите, схемата и llms.txt.
- **Въпрос** — `src/data/faq.ts` (общите) или `faq` в `src/data/services.ts` (по услуга).
- **Адрес, телефон, работно време, координати** — `src/data/business.json`. Влиза в колонтитула, контактите, схемата.
- **Текст на услуга** — `src/data/services.ts` (двата езика в един запис).
- **Писани страници** — `src/content/*.astro` (един компонент, двата езика вътре), маршрутите са в `src/pages/{bg,en}/`.
- **Низове на интерфейса и адреси на страниците** — `src/i18n/index.ts`.
- **Каталог** — `src/data/catalog/{марка}.json`. Ръчна корекция на двигател = редакция там + `npm run build`.
- **Мерене** — `PUBLIC_GTM_ID` в `.env` (празно на new.pdktuning.com). Петте събития вървят през `dataLayer`: `tel_click`, `viber_click`, `form_submit`, `catalog_select`, `file_upload_click`.

## Какво чака потвърждение от възложителя

- Адресът: сайтът и политиката казват ул. „Прилеп“ 164, Google профилът — 96. В `business.json` е 96 (профилът), правното лице е с 164.
- Работното време и имейлът в `business.json` са предположения.
- Цените в `prices.json` са ориентировъчни („от“).
- Формулировките за емисионните системи (`legal` в `services.ts`) — преди публикуване на живия домейн.
- Снимки от сервиза и стенда — сайтът засега е без снимки по замисъл (числата са образът).
- Ключове: Resend (писмата от формата), Turnstile (спам), GTM (мерене) — в `.env` на сървъра.

## Структура

```
scripts/           crawl, crawl-engines, parse, build-redirects, verify-build
src/data/          catalog/*.json (източникът), business.json, prices.json, services.ts, faq.ts, pages.ts
src/content/       писаните страници (двуезични компоненти) + privacy.{bg,en}.html (пренесени)
src/pages/         маршрутите: bg/, en/, [lang]/… (каталогът), data/[brand].json, sitemap-*
src/components/    хедър, колонтитул, калкулатор, показания, крива, форма, ЧЗВ, трохи, плочки…
src/lib/           catalog.ts (данни и изчисления), seo.ts (формули и схема), text.ts (сглобени абзаци)
docker/nginx/      nginx.conf, default.conf.template, headers.inc, redirects.map
api/               формата: POST /api/contact, GET /api/health
```

## Пренасяне на живия домейн (когато дойде денят)

1. `LEGACY_UPSTREAM` в `.env` → адресът на стария сървър (портала), не `www.pdktuning.com`.
2. `PUBLIC_GTM_ID=GTM-5MKF4JB`, ключовете за Resend и Turnstile.
3. Правилата на зоната в Cloudflare: апекс и http → `https://www.pdktuning.com` (една стъпка).
4. Картите: `https://www.pdktuning.com/sitemap-index.xml` в Search Console — по вълни (план, стр. 44): първо `sitemap-*-pages`, `-brands`, `-models`.
5. Чеклистът от приложение Б (40 точки) и 30 стари адреса на живо.
