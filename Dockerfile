# Етап 1: билд на статичния сайт (Astro). SEO проверките вече пазят в CI
# (.github/workflows/build-check.yml, също на Linux), не тук.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG PUBLIC_GTM_ID=
ARG PUBLIC_TURNSTILE_SITEKEY=
ENV PUBLIC_GTM_ID=$PUBLIC_GTM_ID PUBLIC_TURNSTILE_SITEKEY=$PUBLIC_TURNSTILE_SITEKEY NODE_OPTIONS=--max-old-space-size=4096
RUN npx astro build
# Проверките се пускат и тук, но НЕ спират образа: сайтът на new.pdktuning.com е
# с noindex, значи SEO дефект там не струва нищо, а 502 струва. Грешките остават
# видими в изхода на билда. Портата, която пази живото, е в CI.
RUN node scripts/verify-build.mjs || echo '!!! ПРОВЕРКИТЕ ПАДАТ — виж списъка отгоре; образът се вдига въпреки това'

# Етап 2: nginx сервира готовите файлове. Perl модулът е само за правило R4 (главни букви → малки).
FROM nginx:1.27-alpine-perl
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/headers.inc /etc/nginx/headers.inc
COPY docker/nginx/redirects.map /etc/nginx/redirects.map
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV LEGACY_UPSTREAM=https://www.pdktuning.com
EXPOSE 80
