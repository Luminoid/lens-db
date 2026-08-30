<script lang="ts">
  // Shared <head> metadata: title/description, per-locale canonical + hreflang set, Open Graph,
  // Twitter card. One component so the four routes cannot drift apart (og:type vs JSON-LD type,
  // og:title vs <title>, missing tags). JSON-LD stays in each page — it is page-shaped data.
  import { page } from '$app/state';
  import type { Locale } from '$lib/i18n/translations';

  let {
    locale,
    title,
    description,
    path,
    ogType = 'website',
    ogTitle = title,
  }: {
    locale: Locale;
    /** Document title (may carry a suffix); also the og/twitter title unless ogTitle is given. */
    title: string;
    description: string;
    /** Locale-less path with leading and trailing slash, e.g. '/', '/compare/', `/lens/${id}/`. */
    path: string;
    ogType?: 'website' | 'article' | 'product';
    ogTitle?: string;
  } = $props();

  const enUrl = $derived(`${page.url.origin}${path}`);
  const zhUrl = $derived(`${page.url.origin}/zh${path}`);
  const canonicalUrl = $derived(locale === 'en' ? enUrl : zhUrl);
  const ogImage = $derived(`${page.url.origin}/og.png`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="zh-Hans" href={zhUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content={ogType} />
  <meta property="og:site_name" content="LensDB" />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={ogTitle} />
  <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
  <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={ogTitle} />
</svelte:head>
