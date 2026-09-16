// @ts-check
import { defineConfig } from 'astro/config';

// Изцяло статичен изход. Динамичното е само _worker.js, който чете живата база
// от стария сайт (виж public/_worker.js). Нищо от каталога не се пази тук.
export default defineConfig({
  /**
   * АДРЕСЪТ, НА КОЙТО СТОИ САЙТЪТ. Канониклите, картата на сайта и схемите го
   * четат оттук, затова не бива да е зашит — пускането е на два етапа и адресът
   * се сменя точно веднъж помежду им:
   *
   *   етап 1  `new.pdktuning.com`   нашият сайт застава там, `www` остава стар
   *   етап 2  `www.pdktuning.com`   нашият сайт поема и главния адрес
   *
   * Зададен зашито на `www` през етап 1, каноникълът щеше да сочи СТАРИЯ сайт —
   * тоест всяка наша страница да казва „истинската съм аз, ама другаде“.
   *
   * По подразбиране е `www`, защото това е крайното състояние и каноничният им
   * адрес от години (`pdktuning.com` отговаря с 301 към `www`). За етап 1 се
   * подава `PUBLIC_SITE_URL=https://new.pdktuning.com` при билда.
   */
  site: process.env.PUBLIC_SITE_URL || 'https://www.pdktuning.com',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
