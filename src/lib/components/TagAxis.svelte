<script lang="ts">
  // The focal (X) reference axis for the tag view. The tag canvas grows tall and the page scrolls,
  // so this strip is rendered OUTSIDE ECharts and pinned (sticky) to the bottom of the chart box, so
  // the focal scale stays visible while scrolling. It reproduces the exact value->pixel mapping the
  // chips ride (synthetic [0, synthWidth] inside the ECharts content rect [gridLeft, width-gridRight])
  // so the ticks line up with the bars above.
  import { AXES } from '$lib/chart/axes';
  import { axisTicks, type TagAxisMeta } from '$lib/chart/chartOption';
  import { PAD_X_EDGE, frac } from '$lib/chart/tagLayout';
  import { t, type Locale } from '$lib/i18n/translations';

  let { axis, width, locale }: { axis: TagAxisMeta; width: number; locale: Locale } = $props();

  const HEIGHT = 44;

  const def = $derived(AXES[axis.xKey]);
  const contentPx = $derived(Math.max(1, width - axis.gridLeft - axis.gridRight));
  const scale = $derived(contentPx / Math.max(1, axis.synthWidth));

  // value -> pixel x within the strip (origin shared with the chart div above it).
  const px = (v: number): number => {
    const chipX = PAD_X_EDGE + frac(v, axis.domainX[0], axis.domainX[1], axis.xLog) * (axis.synthWidth - 2 * PAD_X_EDGE);
    return axis.gridLeft + chipX * scale;
  };

  const ticks = $derived(axisTicks(axis.xKey, axis.domainX, axis.xLog));

  // Tick marks for every tick; labels only where they won't crowd the previous one (~30px apart).
  const marks = $derived(ticks.map((v) => px(v)));
  const labels = $derived.by(() => {
    const out: { x: number; text: string }[] = [];
    let lastX = -Infinity;
    for (const v of ticks) {
      const x = px(v);
      if (x - lastX < 42) continue;
      out.push({ x, text: def.fmt(v) });
      lastX = x;
    }
    return out;
  });
</script>

<div
  class="sticky bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
  style="height:{HEIGHT}px"
  aria-hidden="true"
>
  <svg {width} height={HEIGHT} class="block" role="presentation">
    {#each marks as x (x)}
      <line x1={x} y1="0" x2={x} y2="6" stroke="var(--color-border)" stroke-width="1" />
    {/each}
    {#each labels as l (l.x)}
      <text x={l.x} y="22" text-anchor="middle" fill="var(--color-text-muted)" font-size="14">{l.text}</text>
    {/each}
    <text x={width / 2} y="39" text-anchor="middle" fill="var(--color-text-muted)" font-size="12">{t(locale, def.titleKey)}</text>
  </svg>
</div>
