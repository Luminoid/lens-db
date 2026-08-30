<script lang="ts">
  // Chart configuration toolbar: X / Y axis pickers (each with a log/linear toggle) + color-by.
  import { filters } from '$lib/filters/store.svelte';
  import { AXES, AXIS_KEYS, COLOR_BY, COLOR_BY_KEYS, isAxisKey, isColorByKey } from '$lib/chart/axes';
  import { TAG_DETAIL_KEYS, isTagDetail } from '$lib/chart/tagLayout';
  import { t, type Locale } from '$lib/i18n/translations';

  let { locale }: { locale: Locale } = $props();

  function setTagDetail(key: string) {
    if (isTagDetail(key)) filters.tagDetail = key;
  }

  // Picking a new axis resets its scale to that axis's natural default (focal/price log, etc.).
  function setX(key: string) {
    if (isAxisKey(key)) {
      filters.x = key;
      filters.xLog = AXES[key].defaultLog;
    }
  }
  function setY(key: string) {
    if (isAxisKey(key)) {
      filters.y = key;
      filters.yLog = AXES[key].defaultLog;
    }
  }
  function setColor(key: string) {
    if (isColorByKey(key)) filters.color = key;
  }

  const selectClass =
    'rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-2 py-1.5 text-sm text-[var(--color-text)] focus-visible:border-[var(--color-accent)]';
</script>

<div class="flex flex-wrap items-end gap-x-4 gap-y-3">
  <div class="flex flex-col gap-1">
    <label for="axis-x" class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'axis.x')}</label>
    <div class="flex items-center gap-1.5">
      <select id="axis-x" class={selectClass} value={filters.x} onchange={(e) => setX(e.currentTarget.value)}>
        {#each AXIS_KEYS as key (key)}
          <option value={key}>{t(locale, AXES[key].labelKey)}</option>
        {/each}
      </select>
      <button
        type="button"
        class="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
        aria-pressed={filters.xLog}
        aria-label={t(locale, 'axis.toggleTitleX')}
        title={t(locale, 'axis.toggleTitleX')}
        onclick={() => (filters.xLog = !filters.xLog)}
      >
        {filters.xLog ? t(locale, 'axis.scaleLog') : t(locale, 'axis.scaleLin')}
      </button>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <label for="axis-y" class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'axis.y')}</label>
    <div class="flex items-center gap-1.5">
      <select id="axis-y" class={selectClass} value={filters.y} onchange={(e) => setY(e.currentTarget.value)}>
        {#each AXIS_KEYS as key (key)}
          <option value={key}>{t(locale, AXES[key].labelKey)}</option>
        {/each}
      </select>
      <button
        type="button"
        class="rounded-md border border-[var(--color-border)] px-2 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
        aria-pressed={filters.yLog}
        aria-label={t(locale, 'axis.toggleTitleY')}
        title={t(locale, 'axis.toggleTitleY')}
        onclick={() => (filters.yLog = !filters.yLog)}
      >
        {filters.yLog ? t(locale, 'axis.scaleLog') : t(locale, 'axis.scaleLin')}
      </button>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <label for="axis-color" class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'axis.colorBy')}</label>
    <select id="axis-color" class={selectClass} value={filters.color} onchange={(e) => setColor(e.currentTarget.value)}>
      {#each COLOR_BY_KEYS as key (key)}
        <option value={key}>{t(locale, COLOR_BY[key].labelKey)}</option>
      {/each}
    </select>
  </div>

  <div class="flex flex-col gap-1">
    <span class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'view.label')}</span>
    <div class="flex overflow-hidden rounded-md border border-[var(--color-border-strong)]" role="group" aria-label={t(locale, 'view.label')}>
      <button
        type="button"
        class="px-2.5 py-1.5 text-sm {filters.mode === 'dots' ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}"
        aria-pressed={filters.mode === 'dots'}
        onclick={() => (filters.mode = 'dots')}>{t(locale, 'view.dots')}</button
      >
      <button
        type="button"
        class="border-l border-[var(--color-border)] px-2.5 py-1.5 text-sm {filters.mode === 'tags' ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}"
        aria-pressed={filters.mode === 'tags'}
        onclick={() => (filters.mode = 'tags')}>{t(locale, 'view.tags')}</button
      >
    </div>
  </div>

  {#if filters.mode === 'tags'}
    <div class="flex flex-col gap-1">
      <label for="tag-detail" class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'tag.detail')}</label>
      <select id="tag-detail" class={selectClass} value={filters.tagDetail} onchange={(e) => setTagDetail(e.currentTarget.value)}>
        <option value="none">{t(locale, 'tag.detailNone')}</option>
        {#each TAG_DETAIL_KEYS as key (key)}
          <option value={key}>{t(locale, AXES[key].labelKey)}</option>
        {/each}
      </select>
    </div>
  {/if}
</div>
