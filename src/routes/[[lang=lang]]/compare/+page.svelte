<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { filters, togglePin, clearPins } from '$lib/filters/store.svelte';
  import { filtersToSearch } from '$lib/filters/url';
  import { lensById } from '$lib/data/lenses';
  import { SPEC_ROWS, type SpecRow } from '$lib/data/specs';
  import { t, tBrand, localePath, type Locale } from '$lib/i18n/translations';
  import type { Lens } from '$lib/data/types';

  let { data } = $props();
  const locale = $derived(data.locale as Locale);

  const pinned = $derived(
    filters.pins.map((id) => lensById.get(id)).filter((l): l is Lens => l != null),
  );

  // Mirror the full shared state (pins + any axis/color/filter config carried in via a deep link)
  // back into the URL, so the /compare address bar stays a faithful, shareable round-trip. The
  // pathname already carries the locale prefix; only the query is rewritten.
  $effect(() => {
    if (!browser) return;
    const search = filtersToSearch(filters);
    const url = search ? `${location.pathname}?${search}` : location.pathname;
    history.replaceState(history.state, '', url);
  });

  // Best-in-row: for rows with a favorable direction and a real spread, the winning numeric value.
  function bestValue(row: SpecRow): number | null {
    if (!row.num || !row.better || pinned.length < 2) return null;
    const nums = pinned.map(row.num).filter((v): v is number => v != null);
    if (nums.length < 2) return null;
    const best = row.better === 'low' ? Math.min(...nums) : Math.max(...nums);
    return nums.some((v) => v !== best) ? best : null;
  }
  const bests = $derived(Object.fromEntries(SPEC_ROWS.map((r) => [r.key, bestValue(r)])));
  const isBest = (row: SpecRow, l: Lens): boolean => bests[row.key] != null && row.num?.(l) === bests[row.key];

  function exportCsv() {
    if (!browser) return;
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    // CSV is a portable data export, not an on-screen surface: keep the canonical Latin brand.
    const header = [t(locale, 'compare.specCol'), ...pinned.map((l) => `${l.brand} ${l.model}`)];
    const rows = SPEC_ROWS.map((r) => [t(locale, r.labelKey), ...pinned.map((l) => r.value(l, locale) ?? '')]);
    // Lead with a UTF-8 BOM so spreadsheet apps read the Chinese (and any non-ASCII) cells correctly.
    const csv = '﻿' + [header, ...rows].map((row) => row.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lensdb-compare.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const enUrl = $derived(`${page.url.origin}/compare/`);
  const zhUrl = $derived(`${page.url.origin}/zh/compare/`);
  const canonicalUrl = $derived(locale === 'en' ? enUrl : zhUrl);
</script>

<svelte:head>
  <title>{t(locale, 'compare.title')}</title>
  <meta name="description" content={t(locale, 'compare.metaDesc')} />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href={enUrl} />
  <link rel="alternate" hreflang="zh-Hans" href={zhUrl} />
  <link rel="alternate" hreflang="x-default" href={enUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LensDB" />
  <meta property="og:title" content={t(locale, 'compare.title')} />
  <meta property="og:description" content={t(locale, 'compare.metaDesc')} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content="{page.url.origin}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={t(locale, 'compare.title')} />
  <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
  <meta property="og:locale:alternate" content={locale === 'zh' ? 'en_US' : 'zh_CN'} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t(locale, 'compare.title')} />
  <meta name="twitter:description" content={t(locale, 'compare.metaDesc')} />
  <meta name="twitter:image" content="{page.url.origin}/og.png" />
</svelte:head>

<main id="main-content" tabindex="-1" class="mx-auto max-w-7xl px-4 py-6">
  <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">{t(locale, 'compare.heading')}</h1>
      <p class="mt-1 text-sm text-[var(--color-text-muted)]">
        <a href={localePath(locale, '/')} class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">{t(locale, 'compare.back')}</a>
      </p>
    </div>
    {#if pinned.length > 0}
      <div class="flex items-center gap-3 text-xs">
        <button type="button" class="text-[var(--color-text-muted)] hover:text-[var(--color-text)]" onclick={clearPins}>{t(locale, 'compare.clearAll')}</button>
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-3 py-1.5 font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
          onclick={exportCsv}>{t(locale, 'compare.exportCsv')}</button
        >
      </div>
    {/if}
  </header>

  {#if pinned.length === 0}
    <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center text-sm text-[var(--color-text-muted)]">
      {t(locale, 'compare.emptyBefore')}<a href={localePath(locale, '/')} class="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">{t(locale, 'compare.emptyLink')}</a>{t(locale, 'compare.emptyAfter')}
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <th class="sticky left-0 z-10 bg-[var(--color-bg-elevated)] p-3 text-left font-medium text-[var(--color-text-muted)]">{t(locale, 'compare.specCol')}</th>
            {#each pinned as l (l.id)}
              <th class="min-w-44 p-3 text-left align-top">
                <a href={localePath(locale, `/lens/${l.id}/`)} class="font-semibold hover:text-[var(--color-accent)]">{tBrand(locale, l.brand)} {l.model}</a>
                <button
                  type="button"
                  class="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label={t(locale, 'compare.remove', { name: `${tBrand(locale, l.brand)} ${l.model}` })}
                  onclick={() => togglePin(l.id)}>×</button
                >
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each SPEC_ROWS as row (row.key)}
            <tr class="border-b border-[var(--color-border)] last:border-0">
              <th class="sticky left-0 z-10 bg-[var(--color-bg)] p-3 text-left font-normal text-[var(--color-text-muted)]">{t(locale, row.labelKey)}</th>
              {#each pinned as l (l.id)}
                <td class="p-3 {isBest(row, l) ? 'font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}">
                  {row.value(l, locale) ?? '—'}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-xs text-[var(--color-text-muted)]">
      {t(locale, 'compare.note')}
    </p>
  {/if}
</main>
