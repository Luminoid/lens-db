<script lang="ts">
  // Faceted filter controls bound to the shared filter store. Multi-selects are toggle chips,
  // booleans are checkboxes, numeric facets are RangeSliders. Everything mutates `filters` in
  // place; the page serializes that to the URL.
  import { meta, brandsByCount } from '$lib/data/meta';
  import { filters, resetFilters, hasActiveFilters, FULL, STEP } from '$lib/filters/store.svelte';
  import { t, tFormat, tType, tBrand, type Locale } from '$lib/i18n/translations';
  import RangeSlider from './RangeSlider.svelte';

  let { locale }: { locale: Locale } = $props();

  // Facet value lists (canonical), ordered by lens count where it matters.
  const brands = brandsByCount;
  const mounts = Object.keys(meta.mounts);
  const formats = Object.keys(meta.formats);
  const types = Object.keys(meta.lensTypes);

  // Toggle a value in/out of one of the multi-select arrays (reassign so the store reacts).
  function toggle(key: 'brands' | 'mounts' | 'formats' | 'types', v: string) {
    const cur = filters[key];
    filters[key] = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  }

  // Focus AF/MF is an ARIA radiogroup: a single tab stop (the checked radio) with arrow keys moving
  // selection, per the WAI-ARIA radio pattern. Roving tabindex + element refs implement that.
  const FOCUS_VALUES = ['all', 'af', 'mf'] as const;
  let focusRadios = $state<HTMLButtonElement[]>([]);
  function onFocusKeydown(e: KeyboardEvent) {
    const cur = FOCUS_VALUES.indexOf(filters.focus);
    let next = cur;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (cur + 1) % FOCUS_VALUES.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (cur - 1 + FOCUS_VALUES.length) % FOCUS_VALUES.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = FOCUS_VALUES.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    filters.focus = FOCUS_VALUES[next];
    focusRadios[next]?.focus();
  }

  // Debounce free-text search: each keystroke re-runs the full filter + tag-packing pipeline, so
  // commit q to the store only after a short pause. The input shows its own DOM value while the
  // timer is pending; `value={filters.q}` still resets it when Reset clears the store.
  let qTimer: ReturnType<typeof setTimeout> | undefined;
  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    const v = e.currentTarget.value;
    clearTimeout(qTimer);
    qTimer = setTimeout(() => (filters.q = v), 150);
  }
  $effect(() => () => clearTimeout(qTimer));

  const chipBase =
    'rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:border-[var(--color-accent)]';
  const chipOn = 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text)]';
  const chipOff =
    'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]';

  const active = $derived(hasActiveFilters(filters));
</script>

<div class="flex flex-col gap-5">
  <div class="flex items-center justify-between">
    <h2 class="text-sm font-semibold tracking-tight">{t(locale, 'filter.title')}</h2>
    {#if active}
      <!-- Negative margins keep the visual footprint small while the padded hit target
           clears the 24px minimum (WCAG 2.5.8). -->
      <button
        type="button"
        class="-mx-2 -my-1.5 rounded px-2 py-1.5 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        onclick={resetFilters}>{t(locale, 'filter.reset')}</button
      >
    {/if}
  </div>

  <!-- Search -->
  <div class="flex flex-col gap-1.5">
    <label for="f-search" class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.search')}</label>
    <input
      id="f-search"
      type="search"
      placeholder={t(locale, 'filter.searchPlaceholder')}
      value={filters.q}
      oninput={onSearchInput}
      class="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm focus-visible:border-[var(--color-accent)]"
    />
  </div>

  <!-- Brand -->
  <fieldset class="flex flex-col gap-2">
    <legend class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.brand')}</legend>
    <div class="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
      {#each brands as b (b)}
        <button
          type="button"
          class="{chipBase} {filters.brands.includes(b) ? chipOn : chipOff}"
          aria-pressed={filters.brands.includes(b)}
          onclick={() => toggle('brands', b)}>{tBrand(locale, b)}</button
        >
      {/each}
    </div>
  </fieldset>

  <!-- Mount -->
  <fieldset class="flex flex-col gap-2">
    <legend class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.mount')}</legend>
    <div class="flex flex-wrap gap-1.5">
      {#each mounts as m (m)}
        <button
          type="button"
          class="{chipBase} {filters.mounts.includes(m) ? chipOn : chipOff}"
          aria-pressed={filters.mounts.includes(m)}
          onclick={() => toggle('mounts', m)}>{m}</button
        >
      {/each}
    </div>
  </fieldset>

  <!-- Format + Type -->
  <div class="flex flex-wrap gap-x-6 gap-y-4">
    <fieldset class="flex flex-col gap-2">
      <legend class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.format')}</legend>
      <div class="flex flex-wrap gap-1.5">
        {#each formats as fmt (fmt)}
          <button
            type="button"
            class="{chipBase} {filters.formats.includes(fmt) ? chipOn : chipOff}"
            aria-pressed={filters.formats.includes(fmt)}
            onclick={() => toggle('formats', fmt)}>{tFormat(locale, fmt)}</button
          >
        {/each}
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <legend class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.type')}</legend>
      <div class="flex flex-wrap gap-1.5">
        {#each types as lt (lt)}
          <button
            type="button"
            class="{chipBase} {filters.types.includes(lt) ? chipOn : chipOff}"
            aria-pressed={filters.types.includes(lt)}
            onclick={() => toggle('types', lt)}>{tType(locale, lt)}</button
          >
        {/each}
      </div>
    </fieldset>
  </div>

  <!-- Focus + boolean toggles -->
  <fieldset class="flex flex-col gap-2">
    <legend class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'filter.focusFeatures')}</legend>
    <div
      role="radiogroup"
      aria-label={t(locale, 'colorBy.focus')}
      tabindex="-1"
      class="inline-flex w-fit overflow-hidden rounded-md border border-[var(--color-border-strong)] text-xs"
      onkeydown={onFocusKeydown}
    >
      {#each FOCUS_VALUES as val, i (val)}
        <button
          bind:this={focusRadios[i]}
          type="button"
          role="radio"
          tabindex={filters.focus === val ? 0 : -1}
          class="px-3 py-1.5 {filters.focus === val
            ? 'bg-[var(--color-accent)]/20 text-[var(--color-text)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
          aria-checked={filters.focus === val}
          onclick={() => (filters.focus = val)}>{val === 'all' ? t(locale, 'filter.focusAll') : val.toUpperCase()}</button
        >
      {/each}
    </div>
    <label class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <input type="checkbox" class="accent-[var(--color-accent)]" bind:checked={filters.stabilized} />
      {t(locale, 'filter.stabilized')}
    </label>
    <label class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <input type="checkbox" class="accent-[var(--color-accent)]" bind:checked={filters.weatherSealed} />
      {t(locale, 'filter.weatherSealed')}
    </label>
    <label class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <input type="checkbox" class="accent-[var(--color-accent)]" bind:checked={filters.hideDiscontinued} />
      {t(locale, 'filter.hideDiscontinued')}
    </label>
  </fieldset>

  <!-- Numeric ranges -->
  <div class="flex flex-col gap-4">
    <RangeSlider
      label={t(locale, 'axis.focal')}
      {locale}
      min={FULL.focalR[0]}
      max={FULL.focalR[1]}
      step={STEP.focalR}
      bind:value={filters.focalR}
      fmt={(v) => `${v}mm`}
    />
    <RangeSlider
      label={t(locale, 'axis.aperture')}
      {locale}
      min={FULL.apertureR[0]}
      max={FULL.apertureR[1]}
      step={STEP.apertureR}
      bind:value={filters.apertureR}
      fmt={(v) => `f/${v}`}
    />
    <RangeSlider
      label={t(locale, 'axis.price')}
      {locale}
      min={FULL.priceR[0]}
      max={FULL.priceR[1]}
      step={STEP.priceR}
      bind:value={filters.priceR}
      fmt={(v) => `$${v.toLocaleString('en-US')}`}
    />
    <RangeSlider
      label={t(locale, 'axis.weight')}
      {locale}
      min={FULL.weightR[0]}
      max={FULL.weightR[1]}
      step={STEP.weightR}
      bind:value={filters.weightR}
      fmt={(v) => `${v}g`}
    />
    <RangeSlider
      label={t(locale, 'axis.year')}
      {locale}
      min={FULL.yearR[0]}
      max={FULL.yearR[1]}
      step={STEP.yearR}
      bind:value={filters.yearR}
      fmt={(v) => `${v}`}
    />
  </div>
</div>
