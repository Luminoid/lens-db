<script lang="ts">
  // Static "about the data" page: explains scope, sources, the nulls-over-guesses policy,
  // pricing, optical-performance stance, field coverage (from meta.json), and the data license.
  // Prerendered per locale; linked from the global footer.
  import { page } from '$app/state';
  import { meta } from '$lib/data/lenses';
  import { t, localePath, type Locale } from '$lib/i18n/translations';

  let { data } = $props();
  const locale = $derived(data.locale as Locale);

  const brandCount = Object.keys(meta.brands).length;

  // Coverage rows: map raw field keys onto their user-facing labels and sort sparsest-first so the
  // gaps (the honest part) lead. Fields populated for every lens (focal, aperture, focus) are
  // omitted as uninteresting; the curated set below is what varies.
  const COVERAGE_LABELS: { key: string; labelKey: string }[] = [
    { key: 'maxMagnification', labelKey: 'axis.magnification' },
    { key: 'diameter', labelKey: 'axis.diameter' },
    { key: 'priceUSD', labelKey: 'axis.price' },
    { key: 'length', labelKey: 'axis.length' },
    { key: 'filterThread', labelKey: 'axis.filter' },
    { key: 'apertureBlades', labelKey: 'axis.blades' },
    { key: 'weatherSealed', labelKey: 'spec.weatherSealed' },
    { key: 'priceMSRPUSD', labelKey: 'spec.msrp' },
    { key: 'elements', labelKey: 'axis.elements' },
    { key: 'groups', labelKey: 'spec.groups' },
    { key: 'weight', labelKey: 'axis.weight' },
    { key: 'year', labelKey: 'axis.year' },
  ];
  const coverage = $derived(
    COVERAGE_LABELS.map((c) => ({ label: t(locale, c.labelKey), pct: meta.fieldCoverage[c.key] ?? 0 })).sort(
      (a, b) => a.pct - b.pct,
    ),
  );

  const sections = $derived([
    { h: t(locale, 'method.h.scope'), body: t(locale, 'method.scope') },
    { h: t(locale, 'method.h.sourcing'), body: t(locale, 'method.sourcing') },
    { h: t(locale, 'method.h.nulls'), body: t(locale, 'method.nulls') },
    { h: t(locale, 'method.h.price'), body: t(locale, 'method.price') },
    { h: t(locale, 'method.h.performance'), body: t(locale, 'method.performance') },
  ]);

  const enUrl = $derived(`${page.url.origin}/methodology/`);
  const zhUrl = $derived(`${page.url.origin}/zh/methodology/`);
  const canonicalUrl = $derived(locale === 'en' ? enUrl : zhUrl);
</script>

<svelte:head>
  <title>{t(locale, 'method.title')}</title>
  <meta name="description" content={t(locale, 'method.metaDesc')} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="zh-Hans" href={zhUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="LensDB" />
  <meta property="og:title" content={t(locale, 'method.heading')} />
  <meta property="og:description" content={t(locale, 'method.metaDesc')} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content="{page.url.origin}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={t(locale, 'method.heading')} />
  <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
  <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t(locale, 'method.heading')} />
  <meta name="twitter:description" content={t(locale, 'method.metaDesc')} />
  <meta name="twitter:image" content="{page.url.origin}/og.png" />
</svelte:head>

<main id="main-content" tabindex="-1" class="mx-auto max-w-3xl px-4 py-6">
  <p class="mb-4 text-sm">
    <a href={localePath(locale, '/')} class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
      >{t(locale, 'compare.back')}</a
    >
  </p>

  <header class="mb-6">
    <h1 class="text-2xl font-semibold tracking-tight">{t(locale, 'method.heading')}</h1>
    <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
      {t(locale, 'method.lead', { count: meta.count })}
    </p>
  </header>

  <div class="flex flex-col gap-6">
    {#each sections as s (s.h)}
      <section>
        <h2 class="mb-1.5 text-sm font-semibold tracking-tight">{s.h}</h2>
        <p class="text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.body}</p>
      </section>
    {/each}

    <section>
      <h2 class="mb-1.5 text-sm font-semibold tracking-tight">{t(locale, 'method.h.coverage')}</h2>
      <p class="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t(locale, 'method.coverage')}</p>
      <table class="w-full max-w-sm text-sm">
        <caption class="sr-only">{t(locale, 'method.coverageCaption')}</caption>
        <thead>
          <tr class="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
            <th scope="col" class="py-1.5 font-medium">{t(locale, 'method.coverageField')}</th>
            <th scope="col" class="py-1.5 text-right font-medium">{t(locale, 'method.coveragePct')}</th>
          </tr>
        </thead>
        <tbody>
          {#each coverage as row (row.label)}
            <tr class="border-b border-[var(--color-border)]">
              <td class="py-1.5 text-[var(--color-text-secondary)]">{row.label}</td>
              <td class="py-1.5 text-right tabular-nums text-[var(--color-text-secondary)]">{row.pct}%</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    <section>
      <h2 class="mb-1.5 text-sm font-semibold tracking-tight">{t(locale, 'method.h.license')}</h2>
      <p class="text-sm leading-relaxed text-[var(--color-text-secondary)]">{t(locale, 'method.license')}</p>
    </section>

    <p class="mt-2 text-xs text-[var(--color-text-muted)]">
      {t(locale, 'method.updated', { date: meta.generatedAt, count: meta.count, brands: brandCount })}
    </p>
  </div>
</main>
