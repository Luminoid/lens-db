<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import LensChart from '$lib/components/LensChart.svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import AxisControls from '$lib/components/AxisControls.svelte';
  import CompareTray from '$lib/components/CompareTray.svelte';
  import { buildChartOption, buildTagChartOption, plottable, DOTS_GRID } from '$lib/chart/chartOption';
  import { AXES } from '$lib/chart/axes';
  import { CHART_THEME } from '$lib/chart/chartTheme';
  import { lenses, meta } from '$lib/data/lenses';
  import { filters, togglePin, FULL, rangeNarrowed } from '$lib/filters/store.svelte';
  import { themeState } from '$lib/theme.svelte';
  import { applyFilters } from '$lib/filters/apply';
  import { filtersToSearch } from '$lib/filters/url';
  import { focalLabel, apertureLabel } from '$lib/data/types';
  import { t, tFormat, tType, tBrand, localePath, type Locale } from '$lib/i18n/translations';

  let { data } = $props();
  const locale = $derived(data.locale as Locale);

  const brandCount = Object.keys(meta.brands).length;

  const visible = $derived(applyFilters(lenses, filters));
  const hidden = $derived(visible.filter((l) => !plottable(l, filters.x, filters.y)).length);
  const shown = $derived(visible.length - hidden);

  // Tag view shows the brand word only when the visible set spans more than one brand.
  const multiBrand = $derived(new Set(visible.map((l) => l.brand)).size > 1);

  // The chart box's inner width = clientWidth minus the p-2 padding (16px). Feed the EXACT width to
  // the tag layout AND the synthetic x-axis so they map 1:1: any rounding/floor mismatch would let
  // ECharts horizontally scale the chips off their packed positions and could reintroduce overlap on
  // small screens. 800 is a transient fallback before the box is measured (tag mode is opt-in, so by
  // the time it is shown the width is already real).
  let chartBoxWidth = $state(0);
  const layoutWidth = $derived(chartBoxWidth > 0 ? chartBoxWidth - 16 : 800);

  // Build the active view. Dot view is the scatter/segment chart; tag view packs labelled chips and
  // returns its own (tall) canvas height for the page to scroll.
  const built = $derived.by(() => {
    const theme = CHART_THEME[themeState.value];
    if (filters.mode === 'tags') {
      return buildTagChartOption(
        visible,
        {
          x: filters.x,
          y: filters.y,
          xLog: filters.xLog,
          yLog: filters.yLog,
          color: filters.color,
          tagDetail: filters.tagDetail,
          multiBrand,
          width: layoutWidth,
          pins: new Set(filters.pins),
        },
        locale,
        theme,
      );
    }
    return {
      option: buildChartOption(
        visible,
        {
          x: filters.x,
          y: filters.y,
          xLog: filters.xLog,
          yLog: filters.yLog,
          color: filters.color,
          pins: new Set(filters.pins),
        },
        locale,
        theme,
      ),
      height: undefined as number | undefined,
    };
  });
  const option = $derived(built.option);
  const canvasHeight = $derived(built.height);

  // Chart shape: when this changes we replace rather than merge (see LensChart). In dot view, locale
  // and theme are included so a switch fully re-labels/re-colors. In tag view the whole layout
  // depends on the filter set + width, so we key on the full filter signature (there is no zoom state
  // to preserve, so a full replace each change is correct).
  const structureKey = $derived(
    filters.mode === 'tags'
      ? `tags|${locale}|${themeState.value}|${layoutWidth}|${filtersToSearch(filters)}`
      : `dots|${locale}|${themeState.value}|${filters.color}|${filters.x}|${filters.y}|${filters.xLog}|${filters.yLog}`,
  );

  // Axis labels for the coverage note. EN reads better lower-cased mid-sentence; ZH has no case.
  const axisLabel = (key: typeof filters.x): string => {
    const label = t(locale, AXES[key].labelKey);
    return locale === 'en' ? label.toLowerCase() : label;
  };
  const xLabel = $derived(axisLabel(filters.x));
  const yLabel = $derived(axisLabel(filters.y));

  // Mirror the live state into the URL (debounced so slider drags don't thrash history). The
  // pathname carries the locale prefix already, so we keep it and only rewrite the query.
  let syncTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (!browser) return;
    const search = filtersToSearch(filters);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const url = search ? `${location.pathname}?${search}` : location.pathname;
      history.replaceState(history.state, '', url);
    }, 250);
    return () => clearTimeout(syncTimer);
  });

  // Mobile filter drawer. On desktop (lg+) the sidebar is always shown via CSS; on small screens it
  // is an off-canvas panel toggled by a button, with a backdrop, Escape-to-close, and focus moved to
  // the close button on open / restored to the trigger on close. `isDesktop` defaults true so the
  // prerendered / no-JS HTML never marks the desktop sidebar `inert`; onMount corrects it.
  let drawerOpen = $state(false);
  let isDesktop = $state(true);
  let openBtn = $state<HTMLButtonElement | undefined>();
  let closeBtn = $state<HTMLButtonElement | undefined>();
  onMount(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      isDesktop = mq.matches;
      if (mq.matches) drawerOpen = false; // never leave a drawer "open" once we're at desktop width
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  });
  function closeDrawer() {
    drawerOpen = false;
    openBtn?.focus();
  }
  $effect(() => {
    if (drawerOpen) closeBtn?.focus();
  });

  // Count of active filter constraints, shown on the mobile drawer trigger.
  const activeCount = $derived(
    filters.brands.length +
      filters.mounts.length +
      filters.formats.length +
      filters.types.length +
      (filters.focus !== 'all' ? 1 : 0) +
      (filters.stabilized ? 1 : 0) +
      (filters.weatherSealed ? 1 : 0) +
      (filters.q.trim() ? 1 : 0) +
      (rangeNarrowed(filters.focalR, FULL.focalR) ? 1 : 0) +
      (rangeNarrowed(filters.apertureR, FULL.apertureR) ? 1 : 0) +
      (rangeNarrowed(filters.priceR, FULL.priceR) ? 1 : 0) +
      (rangeNarrowed(filters.weightR, FULL.weightR) ? 1 : 0) +
      (rangeNarrowed(filters.yearR, FULL.yearR) ? 1 : 0),
  );

  const enUrl = $derived(`${page.url.origin}/`);
  const zhUrl = $derived(`${page.url.origin}/zh/`);
  const canonicalUrl = $derived(locale === 'en' ? enUrl : zhUrl);
</script>

<svelte:head>
  <title>{t(locale, 'home.title')}</title>
  <meta name="description" content={t(locale, 'home.metaDesc')} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="zh-Hans" href={zhUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LensDB" />
  <meta property="og:title" content={t(locale, 'home.title')} />
  <meta property="og:description" content={t(locale, 'home.metaDesc')} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content="{page.url.origin}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={t(locale, 'home.title')} />
  <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
  <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t(locale, 'home.title')} />
  <meta name="twitter:description" content={t(locale, 'home.metaDesc')} />
  <meta name="twitter:image" content="{page.url.origin}/og.png" />
</svelte:head>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  }}
/>

<main class="mx-auto max-w-7xl px-4 py-6">
  <header class="mb-4">
    <h1 class="text-2xl font-semibold tracking-tight">LensDB</h1>
    <p class="mt-1 max-w-3xl text-sm text-[var(--color-text-muted)]">
      {t(locale, 'home.intro', { count: meta.count, brands: brandCount })}
    </p>
  </header>

  <div class="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
    <AxisControls {locale} />
  </div>

  <!-- Mobile-only trigger for the filter drawer (the sidebar is always visible at lg+). -->
  <button
    bind:this={openBtn}
    type="button"
    class="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm font-medium lg:hidden"
    aria-expanded={drawerOpen}
    aria-controls="filter-drawer"
    onclick={() => (drawerOpen = true)}
  >
    {t(locale, 'filter.open')}
    {#if activeCount > 0}
      <span class="rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-semibold text-[var(--color-bg)]"
        >{activeCount}</span
      >
    {/if}
  </button>

  <div class="flex flex-col gap-4 lg:flex-row">
    <!-- Backdrop: mobile only; dismisses the drawer on click. -->
    {#if drawerOpen}
      <button
        type="button"
        class="fixed inset-0 z-30 cursor-default bg-black/50 lg:hidden"
        tabindex="-1"
        aria-hidden="true"
        onclick={closeDrawer}
      ></button>
    {/if}

    <aside
      id="filter-drawer"
      inert={(!isDesktop && !drawerOpen) || undefined}
      aria-label={t(locale, 'filter.title')}
      class="fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] transform overflow-y-auto bg-[var(--color-bg)] p-4 transition-transform lg:static lg:z-auto lg:w-72 lg:max-w-none lg:transform-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:shrink-0 {drawerOpen
        ? 'translate-x-0'
        : '-translate-x-full lg:translate-x-0'}"
    >
      <div class="mb-3 flex items-center justify-between lg:hidden">
        <span class="text-sm font-semibold">{t(locale, 'filter.title')}</span>
        <button
          bind:this={closeBtn}
          type="button"
          class="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          aria-label={t(locale, 'filter.close')}
          onclick={closeDrawer}
        >
          <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
        <FilterPanel {locale} />
      </div>
    </aside>

    <section class="min-w-0 flex-1">
      <div
        bind:clientWidth={chartBoxWidth}
        class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2"
      >
        <LensChart
          {option}
          {structureKey}
          heightPx={canvasHeight}
          renderer={filters.mode === 'tags' ? 'svg' : 'canvas'}
          touchRoam={filters.mode === 'tags' ? undefined : DOTS_GRID}
          onPick={togglePin}
          ariaLabel={filters.mode === 'tags'
            ? t(locale, 'chart.ariaTags', { count: shown })
            : t(locale, 'chart.aria', { count: shown, x: xLabel, y: yLabel })}
        />
      </div>

      <!-- Accessible text equivalent of the chart: the visible set as a real, navigable table.
           Collapsed by default but kept in the DOM, so screen readers and find-in-page reach it and
           it works with no JavaScript. -->
      <details class="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <summary class="cursor-pointer px-3 py-2 text-sm text-[var(--color-text-secondary)]"
          >{t(locale, 'table.toggle')}</summary
        >
        <div class="max-h-[70vh] overflow-auto border-t border-[var(--color-border)] px-3 pb-3">
          <table class="w-full text-left text-xs">
            <caption class="sr-only">{t(locale, 'table.caption', { shown: visible.length, count: meta.count })}</caption>
            <thead class="sticky top-0 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
              <tr>
                <th scope="col" class="py-1.5 pr-3 font-medium">{t(locale, 'table.colLens')}</th>
                <th scope="col" class="py-1.5 pr-3 font-medium">{t(locale, 'axis.focal')}</th>
                <th scope="col" class="py-1.5 pr-3 font-medium">{t(locale, 'axis.aperture')}</th>
                <th scope="col" class="py-1.5 pr-3 font-medium">{t(locale, 'filter.format')}</th>
                <th scope="col" class="py-1.5 pr-3 font-medium">{t(locale, 'filter.type')}</th>
                <th scope="col" class="py-1.5 pr-3 text-right font-medium">{t(locale, 'axis.weight')}</th>
                <th scope="col" class="py-1.5 pr-3 text-right font-medium">{t(locale, 'axis.price')}</th>
                <th scope="col" class="py-1.5 text-right font-medium">{t(locale, 'axis.year')}</th>
              </tr>
            </thead>
            <tbody>
              {#each visible as l (l.id)}
                <tr class="border-t border-[var(--color-border)]">
                  <th scope="row" class="py-1.5 pr-3 font-normal">
                    <a
                      href={localePath(locale, `/lens/${l.id}/`)}
                      class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">{tBrand(locale, l.brand)} {l.model}</a
                    >
                  </th>
                  <td class="py-1.5 pr-3 tabular-nums">{focalLabel(l)}</td>
                  <td class="py-1.5 pr-3 tabular-nums">{apertureLabel(l)}</td>
                  <td class="py-1.5 pr-3">{tFormat(locale, l.format)}</td>
                  <td class="py-1.5 pr-3">{tType(locale, l.lensType)}</td>
                  <td class="py-1.5 pr-3 text-right tabular-nums">{l.weight != null ? `${l.weight} g` : '—'}</td>
                  <td class="py-1.5 pr-3 text-right tabular-nums"
                    >{l.priceUSD != null ? `$${l.priceUSD.toLocaleString('en-US')}` : '—'}</td
                  >
                  <td class="py-1.5 text-right tabular-nums">{l.year ?? '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </details>

      <CompareTray {locale} />
    </section>
  </div>

  <div class="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
    <span>
      {#if hidden > 0}
        {t(locale, 'home.coverageHidden', { shown, count: meta.count, hidden, x: xLabel, y: yLabel })}
      {:else}
        {t(locale, 'home.coverage', { shown, count: meta.count })}
      {/if}
    </span>
    <span>{t(locale, 'home.priceNote', { date: meta.lastPriceCheck })}</span>
  </div>
</main>
