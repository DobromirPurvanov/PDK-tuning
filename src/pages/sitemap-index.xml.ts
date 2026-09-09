// Картите са разделени по език и по ниво нарочно (план, стр. 29): така Search Console показва кое ниво спъва.
import type { APIRoute } from 'astro';
import { LANGS } from '@/i18n';
import { allCatalogPaths } from '@/lib/catalog';
import { SITE } from '@/lib/seo';
export const CHUNK = 5000;
export function sitemapFiles() {
  const files: string[] = [];
  for (const lang of LANGS) {
    const c = allCatalogPaths(lang);
    // Двигателите НЕ се подават: 24 096 почти еднакви страници (76% съвпадение
    // помежду им) само разреждат обхождането. Те са noindex и данните им живеят
    // в страницата на поколението. Индексира се до ниво модел/поколение.
    files.push(`sitemap-${lang}-pages.xml`, `sitemap-${lang}-brands.xml`, `sitemap-${lang}-models.xml`, `sitemap-${lang}-generations.xml`);
  }
  return files;
}
export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapFiles().map((f) => `<sitemap><loc>${SITE}/${f}</loc></sitemap>`).join('\n')}\n</sitemapindex>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
