<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import LensChart from '$lib/components/LensChart.svelte';
  import { lenses } from '$lib/data/lenses';
  import { filters, togglePin } from '$lib/filters/store.svelte';
  import { SPEC_ROWS } from '$lib/data/specs';
  import { focalLabel, apertureLabel } from '$lib/data/types';
  import { CHART_THEME } from '$lib/chart/chartTheme';
  import { themeState } from '$lib/theme.svelte';
  import { t, tFormat, tType, tBrand, localePath, type Locale } from '$lib/i18n/translations';
  import type { PageData } from './$types';

  let { data }: { data: PageData & { locale: Locale } } = $props();
  const lens = $derived(data.lens);
  const locale = $derived(data.locale);
  const chartTheme = $derived(CHART_THEME[themeState.value]);

  const pinned = $derived(filters.pins.includes(lens.id));

  // Context-aware back link. If the user arrived from the compare table, "back" returns there (with
  // the current pins in the query so the table rebuilds on a reload); otherwise it goes to the chart.
  // afterNavigate only fires on client navigations, so a fresh / prerendered load defaults to the
  // chart. The locale prefix is preserved either way, so a language switch keeps the back link valid.
  let cameFromCompare = $state(false);
  afterNavigate((nav) => {
    cameFromCompare = /\/compare\/?$/.test(nav.from?.url.pathname ?? '');
  });
  const backHref = $derived(
    cameFromCompare
      ? filters.pins.length
        ? `${localePath(locale, '/compare/')}?pin=${filters.pins.join(',')}`
        : localePath(locale, '/compare/')
      : localePath(locale, '/'),
  );
  const backLabel = $derived(cameFromCompare ? t(locale, 'detail.backToCompare') : t(locale, 'detail.back'));

  // Spec rows that actually have a value (brand lives in the header).
  const rows = $derived(
    SPEC_ROWS.filter((r) => r.key !== 'brand')
      .map((r) => ({ label: t(locale, r.labelKey), value: r.value(lens, locale) }))
      .filter((r) => r.value != null),
  );

  // Similar = same format + type, nearest by focal range and max aperture (aperture weighted so a
  // stop of difference counts like ~20mm of focal).
  const similar = $derived(
    lenses
      .filter((o) => o.id !== lens.id && o.format === lens.format && o.lensType === lens.lensType)
      .map((o) => ({
        o,
        d: Math.abs(o.focalMin - lens.focalMin) + Math.abs(o.focalMax - lens.focalMax) + Math.abs(o.apertureMaxWide - lens.apertureMaxWide) * 20,
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 6)
      .map((x) => x.o),
  );

  // Mini focal x aperture locator: all lenses faint, this one accented.
  const miniOption = $derived({
    backgroundColor: 'transparent',
    animation: false,
    grid: { top: 12, left: 48, right: 14, bottom: 36 },
    tooltip: { show: false },
    xAxis: {
      type: 'log', logBase: 10, min: 3, max: 1400, name: t(locale, 'detail.miniFocal'), nameLocation: 'middle', nameGap: 22,
      nameTextStyle: { color: chartTheme.axisName }, axisLabel: { color: chartTheme.axisName },
      axisLine: { lineStyle: { color: chartTheme.axisLine } }, splitLine: { lineStyle: { color: chartTheme.splitLine } },
    },
    yAxis: {
      type: 'log', logBase: 2, inverse: true, min: 0.7, max: 32, name: t(locale, 'detail.miniAperture'), nameLocation: 'middle', nameGap: 30,
      nameTextStyle: { color: chartTheme.axisName }, axisLabel: { color: chartTheme.axisName, formatter: (v: number) => `f/${v}` },
      axisLine: { lineStyle: { color: chartTheme.axisLine } }, splitLine: { lineStyle: { color: chartTheme.splitLine } },
    },
    series: [
      { type: 'scatter', large: true, silent: true, symbolSize: 3, itemStyle: { color: chartTheme.faint }, data: lenses.map((l) => [l.focalMin, l.apertureMaxWide]) },
      { type: 'scatter', z: 5, symbolSize: 11, itemStyle: { color: chartTheme.accent }, data: [[lens.focalMin, lens.apertureMaxWide]] },
    ],
  });

  const description = $derived(
    t(locale, 'detail.metaDesc', {
      name: `${lens.brand} ${lens.model}`,
      focal: focalLabel(lens),
      aperture: apertureLabel(lens),
      type: tType(locale, lens.lensType).toLowerCase(),
      mounts: lens.mounts.join(', '),
      format: tFormat(locale, lens.format),
    }),
  );

  const enUrl = $derived(`${page.url.origin}/lens/${lens.id}/`);
  const zhUrl = $derived(`${page.url.origin}/zh/lens/${lens.id}/`);
  const canonicalUrl = $derived(locale === 'en' ? enUrl : zhUrl);
</script>

<svelte:head>
  <title>{lens.brand} {lens.model} · LensDB</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="zh-Hans" href={zhUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LensDB" />
  <meta property="og:title" content="{lens.brand} {lens.model} · LensDB" />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content="{page.url.origin}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{lens.brand} {lens.model} · LensDB" />
  <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
  <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{lens.brand} {lens.model} · LensDB" />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="{page.url.origin}/og.png" />
</svelte:head>

<main id="main-content" tabindex="-1" class="mx-auto max-w-5xl px-4 py-6">
  <p class="mb-4 text-sm">
    <a href={backHref} class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">{backLabel}</a>
  </p>

  <header class="mb-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">{tBrand(locale, lens.brand)} {lens.model}</h1>
        <p class="mt-1 text-sm text-[var(--color-text-muted)]">
          {focalLabel(lens)} {apertureLabel(lens)} · {tFormat(locale, lens.format)} · {tType(locale, lens.lensType)}{#if lens.series} · {lens.series}{/if}
        </p>
        <ul class="mt-2 flex flex-wrap gap-1.5">
          {#each lens.mounts as m (m)}
            <li class="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]">{m}</li>
          {/each}
        </ul>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-medium {pinned
            ? 'bg-[var(--color-accent)]/20 text-[var(--color-text)]'
            : 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]'}"
          aria-pressed={pinned}
          onclick={() => togglePin(lens.id)}>{pinned ? t(locale, 'detail.pinned') : t(locale, 'detail.pin')}</button
        >
        <a href={`${localePath(locale, '/compare/')}?pin=${[...new Set([...filters.pins, lens.id])].join(',')}`} class="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">{t(locale, 'tray.compare')}</a>
      </div>
    </div>
  </header>

  <div class="grid gap-6 md:grid-cols-[1fr_360px]">
    <section>
      <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">{t(locale, 'detail.specs')}</h2>
      <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        {#each rows as r (r.label)}
          <div class="flex justify-between gap-3 border-b border-[var(--color-border)] py-1.5">
            <dt class="text-[var(--color-text-muted)]">{r.label}</dt>
            <dd class="text-right text-[var(--color-text-secondary)]">{r.value}</dd>
          </div>
        {/each}
      </dl>
      {#if lens.productUrl}
        <p class="mt-4 text-sm">
          <a href={lens.productUrl} target="_blank" rel="noopener noreferrer" class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            {t(locale, 'detail.manufacturer')}
          </a>
        </p>
      {/if}
    </section>

    <section>
      <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">{t(locale, 'detail.whereItSits')}</h2>
      <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2">
        <LensChart option={miniOption} structureKey={`detail-mini-${locale}-${themeState.value}`} class="h-56 w-full" />
      </div>
    </section>
  </div>

  {#if similar.length > 0}
    <section class="mt-8">
      <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">{t(locale, 'detail.similar')}</h2>
      <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each similar as s (s.id)}
          <li>
            <a
              href={localePath(locale, `/lens/${s.id}/`)}
              class="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-sm hover:border-[var(--color-accent)]"
            >
              <span class="font-medium">{tBrand(locale, s.brand)} {s.model}</span>
              <span class="mt-0.5 block text-xs text-[var(--color-text-muted)]">{focalLabel(s)} {apertureLabel(s)}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>
