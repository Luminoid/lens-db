<script lang="ts">
  // A two-handle range as two labeled native range inputs (min + max). Native inputs are fully
  // keyboard-operable and screen-reader friendly; an overlaid dual-thumb track is a polish item.
  //
  // The inputs step on integer indices (0..steps) and map to/from real values, so the handles can
  // always land EXACTLY on min and max regardless of step. A native `<input type=range>` with a
  // fractional step (e.g. 0.1) or an unaligned max otherwise stops a notch short of the extent.
  import type { Range } from '$lib/filters/types';
  import { t, type Locale } from '$lib/i18n/translations';

  let {
    label,
    locale,
    min,
    max,
    step = 1,
    value = $bindable(),
    fmt = (v: number) => `${v}`,
  }: {
    label: string;
    locale: Locale;
    min: number;
    max: number;
    step?: number;
    value: Range;
    fmt?: (v: number) => string;
  } = $props();

  const p = $derived(10 ** (String(step).split('.')[1] ?? '').length);
  const steps = $derived(Math.round((max - min) / step));
  const toValue = (i: number) => Math.round((min + i * step) * p) / p;
  const toIndex = (v: number) => Math.round((v - min) / step);

  const loIdx = $derived(toIndex(value[0]));
  const hiIdx = $derived(toIndex(value[1]));

  function setLo(i: number) {
    value = [toValue(Math.min(i, hiIdx)), value[1]];
  }
  function setHi(i: number) {
    value = [value[0], toValue(Math.max(i, loIdx))];
  }
</script>

<fieldset class="space-y-1.5">
  <legend class="flex w-full items-baseline justify-between text-xs font-medium text-[var(--color-text-secondary)]">
    <span>{label}</span>
    <span class="font-mono text-[var(--color-text-muted)]">{fmt(value[0])} – {fmt(value[1])}</span>
  </legend>

  <label class="flex items-center gap-2">
    <span class="w-7 shrink-0 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{t(locale, 'range.min')}</span>
    <input
      type="range"
      class="w-full accent-[var(--color-accent)]"
      min="0"
      max={steps}
      step="1"
      aria-label={t(locale, 'range.minAria', { label })}
      value={loIdx}
      oninput={(e) => setLo(+e.currentTarget.value)}
    />
  </label>
  <label class="flex items-center gap-2">
    <span class="w-7 shrink-0 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{t(locale, 'range.max')}</span>
    <input
      type="range"
      class="w-full accent-[var(--color-accent)]"
      min="0"
      max={steps}
      step="1"
      aria-label={t(locale, 'range.maxAria', { label })}
      value={hiIdx}
      oninput={(e) => setHi(+e.currentTarget.value)}
    />
  </label>
</fieldset>
