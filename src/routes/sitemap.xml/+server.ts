// Prerendered sitemap covering every page in both locales (EN at `/...`, ZH under `/zh/...`):
// home, compare, methodology, and one page per lens. Each <url> declares its EN / ZH / x-default
// hreflang alternates (matching the per-page <link rel="alternate"> in <head>) so search engines
// index the right language per region. adapter-static writes this to build/sitemap.xml.
import { lenses } from '$lib/data/lenses';
import { meta } from '$lib/data/meta';
import type { RequestHandler } from './$types';

export const prerender = true;

const ORIGIN = 'https://lens.luminoid.dev';

// EN-rooted, trailing-slashed base paths (trailingSlash: 'always'). ZH is the same under /zh.
const STATIC_PATHS = ['/', '/compare/', '/methodology/'];

export const GET: RequestHandler = () => {
  const lastmod = meta.generatedAt; // YYYY-MM-DD, a valid W3C sitemap date
  const paths = [...STATIC_PATHS, ...lenses.map((l) => `/lens/${l.id}/`)];

  const entries = paths
    .flatMap((path) => {
      const en = `${ORIGIN}${path}`;
      const zh = `${ORIGIN}/zh${path}`;
      const alternates =
        `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>` +
        `<xhtml:link rel="alternate" hreflang="zh-Hans" href="${zh}"/>` +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`;
      return [
        `<url><loc>${en}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`,
        `<url><loc>${zh}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`,
      ];
    })
    .join('');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
    entries +
    `</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
