// @ts-check
import { defineConfig } from 'astro/config';

// Сайтът е изцяло статичен. Адресите са без наклонена черта в края (правило R3),
// освен началните /bg/ и /en/. Форматът „директория“ прави /bg/bmw → dist/bg/bmw/index.html,
// което nginx сервира през try_files $uri $uri/index.html (виж docker/nginx/default.conf.template).
export default defineConfig({
  site: 'https://www.pdktuning.com',
  trailingSlash: 'ignore', // пренасочванията за наклонената черта са в nginx; 'never' кара dev/preview да връщат 404 за /bg/
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
