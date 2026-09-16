# The only frontend is site/. Build it locally into the VPS image.
FROM node:24-alpine AS build
WORKDIR /app
COPY site/package.json site/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY site/ ./
ARG BASE_URL=https://new.pdktuning.com
ARG CATALOG_BASE_URL=https://www.pdktuning.com
ARG PUBLIC_INDEXABLE=false
ARG PUBLIC_GA_ID=
ARG PUBLIC_GSC_VERIFY=
ENV BASE_URL=$BASE_URL CATALOG_BASE_URL=$CATALOG_BASE_URL PUBLIC_INDEXABLE=$PUBLIC_INDEXABLE PUBLIC_GA_ID=$PUBLIC_GA_ID PUBLIC_GSC_VERIFY=$PUBLIC_GSC_VERIFY
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY site/package.json site/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY site/public/_worker.js ./public/_worker.js
COPY site/server ./server
ARG SITE_RELEASE=local
ENV NODE_ENV=production PORT=80 SITE_RELEASE=$SITE_RELEASE
EXPOSE 80
USER node
CMD ["node", "server/server.mjs"]
