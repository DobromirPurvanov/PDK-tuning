# Stage 1: build the static site (Astro). The SEO checks now gate in CI
# (.github/workflows/build-check.yml, also on Linux), not here.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG PUBLIC_GTM_ID=
ARG PUBLIC_TURNSTILE_SITEKEY=
ENV PUBLIC_GTM_ID=$PUBLIC_GTM_ID PUBLIC_TURNSTILE_SITEKEY=$PUBLIC_TURNSTILE_SITEKEY NODE_OPTIONS=--max-old-space-size=4096
RUN npx astro build
# The checks still run here, but do NOT fail the image: new.pdktuning.com is
# noindexed, so an SEO defect there costs nothing while a 502 costs plenty.
# Errors stay visible in the build output. The gate that protects production is in CI.
RUN node scripts/verify-build.mjs || echo '!!! SEO CHECKS FAILED - see the list above; building the image anyway'

# Етап 2: nginx сервира готовите файлове. Perl модулът е само за правило R4 (главни букви → малки).
FROM nginx:1.27-alpine-perl
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/headers.inc /etc/nginx/headers.inc
COPY docker/nginx/redirects.map /etc/nginx/redirects.map
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV LEGACY_UPSTREAM=https://www.pdktuning.com
EXPOSE 80
