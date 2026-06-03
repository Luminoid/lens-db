<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { attachTouchRoam } from '$lib/chart/touchRoam';

  // ECharts is imported dynamically inside onMount so it never runs during prerender (it needs the DOM).
  //
  // `structureKey` encodes the chart's *shape* (axes, scales, color grouping). When it is unchanged
  // we merge (notMerge: false) so the user's zoom/pan and legend toggles survive a filter change;
  // when it changes we replace (notMerge: true) because the series identity or axis type changed and
  // a stale merge would be wrong.
  let {
    option,
    structureKey,
    onPick,
    ariaLabel,
    heightPx,
    renderer = 'canvas',
    touchRoam,
    class: className = 'h-[72vh] min-h-[420px] w-full',
  }: {
    option: Record<string, unknown>;
    structureKey: string;
    onPick?: (id: string) => void;
    // When set, exposes the chart to assistive tech as an image with this text alternative (the
    // canvas/SVG is opaque to screen readers). A full data-table fallback is a later item.
    ariaLabel?: string;
    // Tag view computes a tall height (the page scrolls); when set it overrides the fixed class
    // height so the chart can grow beyond the viewport.
    heightPx?: number;
    // Tag view uses 'svg' (no canvas pixel cap, so the packed chart can be arbitrarily tall); the dot
    // chart uses 'canvas' (better for dataZoom over hundreds of custom items). Changing it re-inits.
    renderer?: 'canvas' | 'svg';
    // When set (dot chart only), enables the custom two-finger touch pan/zoom controller against these
    // grid insets. Read untracked at init, so the literal's changing identity never re-inits the chart.
    touchRoam?: { top: number; left: number; right: number; bottom: number };
    class?: string;
  } = $props();

  let el: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let echartsMod: any = $state(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chart: any = $state(undefined);
  let observer: ResizeObserver | undefined;
  let roamDetach: (() => void) | undefined;
  let lastStructureKey: string | undefined;

  // ECharts is imported dynamically so it never runs during prerender (it needs the DOM). The
  // import is the tree-shaken `$lib/chart/echarts` build (only the series/components we use), not
  // the full `echarts` package, which roughly halves the chart bundle.
  onMount(() => {
    let disposed = false;
    import('$lib/chart/echarts').then((m) => {
      if (!disposed) echartsMod = m.default;
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      roamDetach?.();
      roamDetach = undefined;
      chart?.dispose();
      chart = undefined;
    };
  });

  // (Re)create the chart instance whenever the module loads or the renderer changes. A renderer
  // switch (dots <-> tags) requires a fresh init, so dispose the old instance first.
  $effect(() => {
    const m = echartsMod;
    const r = renderer;
    if (!m || !el) return;
    // Read the previous instance non-reactively: making `chart` a tracked dependency here would let
    // this effect (which also writes `chart`) self-invalidate into effect_update_depth_exceeded.
    const prev = untrack(() => chart);
    // Tear down the prior touch controller (listeners + pending RAF) before disposing its chart.
    roamDetach?.();
    roamDetach = undefined;
    if (prev) prev.dispose();
    const c = m.init(el, null, { renderer: r });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    c.on('click', (p: any) => {
      const id = p?.data?.lens?.id;
      if (id && onPick) onPick(id);
    });
    observer?.disconnect();
    observer = new ResizeObserver(() => chart?.resize());
    observer.observe(el);
    // Custom touch pan/zoom for the dot chart (see touchRoam.ts). The prior controller was already
    // torn down above. Read untracked: the prop is a const grid literal whose identity changes each
    // parent render, and tracking it would re-init the chart.
    const tr = untrack(() => touchRoam);
    if (tr) roamDetach = attachTouchRoam(el, () => chart, tr);
    lastStructureKey = undefined; // force a full setOption on the fresh instance
    chart = c;
  });

  // `structureKey` encodes the chart's *shape*. When unchanged we merge (notMerge:false) so zoom/pan
  // and legend toggles survive a filter change; when it changes we replace (notMerge:true) because
  // the series identity or axis type changed and a stale merge would be wrong.
  $effect(() => {
    if (!chart) return;
    const replace = structureKey !== lastStructureKey;
    chart.setOption(option, { notMerge: replace });
    lastStructureKey = structureKey;
  });
</script>

<div
  bind:this={el}
  class={heightPx ? 'w-full' : className}
  style={heightPx ? `height:${heightPx}px` : undefined}
  role={ariaLabel ? 'img' : undefined}
  aria-label={ariaLabel}
></div>
