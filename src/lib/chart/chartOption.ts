// Builds the ECharts option for the configurable scatter/segment chart.
//
// One custom series per color-group so the legend toggles groups and each gets its own color.
// renderItem draws a dot when a lens occupies a single point and a segment when its wide-end and
// tele-end points differ on the chosen axes (see axes.ts for the wide/tele model). The option is
// typed loosely on purpose: ECharts' option generics are very verbose and add no safety to a
// hand-built literal, and svelte-check stays clean.
import { focalLabel, apertureLabel, type Lens } from '../data/types';
import { lenses } from '../data/lenses';
import { AXES, COLOR_BY, groupOrder, type AxisKey, type ColorByKey } from './axes';
import { paletteMap } from './brandColors';
import type { ChartTheme } from './chartTheme';
import { layoutTags, APERTURE_STOPS, FOCAL_TICKS, TAG_FONT_SIZE, TAG_FONT_FAMILY, type PlacedTag } from './tagLayout';
import type { TagDetail } from '$lib/filters/types';
import { t, tFormat, tType, tBrand, groupLabel, type Locale } from '$lib/i18n/translations';

export interface ChartOpts {
  x: AxisKey;
  y: AxisKey;
  xLog: boolean;
  yLog: boolean;
  color: ColorByKey;
  /** Pinned lens ids; drawn as rings on top of their points. */
  pins?: Set<string>;
}

// Grid insets (px) for the dot chart. Exported so the touch-roam controller (touchRoam.ts) can map
// finger pixels to the plot rect without reaching into ECharts internals; the rect is
// [left, width-right] × [top, height-bottom].
export const DOTS_GRID = { top: 52, left: 70, right: 28, bottom: 56 };

// Accent ring drawn around pinned lenses. Value layout: [x, y]. The ring color is theme-dependent,
// so this is built as a closure over the active accent rather than a module-level constant.
function makeRenderPin(accent: string) {
  return (_params: unknown, api: any) => {
    const x = api.value(0);
    const y = api.value(1);
    if (x == null || y == null) return;
    const c = api.coord([x, y]);
    return { type: 'circle', shape: { cx: c[0], cy: c[1], r: 8 }, style: { fill: 'none', stroke: accent, lineWidth: 2 } };
  };
}

// Value layout per data point: [xWide, yWide, xTele, yTele, isSegment(0|1)]
function renderItem(_params: unknown, api: any) {
  const xw = api.value(0);
  const yw = api.value(1);
  if (xw == null || yw == null) return;
  const color = api.visual('color');
  const p1 = api.coord([xw, yw]);

  if (api.value(4) !== 1) {
    return { type: 'circle', shape: { cx: p1[0], cy: p1[1], r: 4 }, style: { fill: color, opacity: 0.85 } };
  }

  const p2 = api.coord([api.value(2), api.value(3)]);
  return {
    type: 'group',
    children: [
      { type: 'line', shape: { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] }, style: { stroke: color, lineWidth: 2.5, opacity: 0.85 } },
      { type: 'circle', shape: { cx: p1[0], cy: p1[1], r: 3 }, style: { fill: color } },
      { type: 'circle', shape: { cx: p2[0], cy: p2[1], r: 3 }, style: { fill: color } },
    ],
  };
}

// The lens DB is build-time, schema-validated, and maintainer-controlled, so these strings are not
// an injection vector today; escaping anyway is cheap defense-in-depth, since the formatter returns
// raw HTML to ECharts and the data fields (model, mounts) could one day carry an `&`/`<`/`>`.
const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function makeTooltipFormatter(locale: Locale, theme: ChartTheme) {
  return (p: any): string => {
    const l: Lens | undefined = p?.data?.lens;
    if (!l) return '';
    const row = (label: string, val: string) =>
      `<div style="display:flex;justify-content:space-between;gap:16px"><span style="color:${theme.tooltipMuted}">${esc(label)}</span><span>${esc(val)}</span></div>`;
    const rows: string[] = [
      row(t(locale, 'filter.mount'), l.mounts.join(', ')),
      row(t(locale, 'filter.type'), `${tFormat(locale, l.format)} · ${tType(locale, l.lensType)}`),
    ];
    if (l.weight != null) rows.push(row(t(locale, 'axis.weight'), `${l.weight} g`));
    if (l.filterThread != null) rows.push(row(t(locale, 'axis.filter'), `${l.filterThread} mm`));
    if (l.priceUSD != null) rows.push(row(t(locale, 'axis.price'), `$${l.priceUSD.toLocaleString('en-US')}`));
    if (l.year != null) rows.push(row(t(locale, 'axis.year'), String(l.year)));
    return (
      `<div style="max-width:280px">` +
      `<div style="font-weight:600;margin-bottom:2px">${esc(`${tBrand(locale, l.brand)} ${l.model}`)}</div>` +
      `<div style="color:${theme.tooltipSecondary};margin-bottom:6px">${esc(`${focalLabel(l)} ${apertureLabel(l)}`)}</div>` +
      `<div style="display:flex;flex-direction:column;gap:2px;font-size:12px">${rows.join('')}</div>` +
      `</div>`
    );
  };
}

function axisConfig(def: (typeof AXES)[AxisKey], log: boolean, locale: Locale, theme: ChartTheme) {
  return {
    type: log ? ('log' as const) : ('value' as const),
    logBase: def.logBase,
    inverse: def.inverse,
    scale: !log,
    name: t(locale, def.titleKey),
    nameLocation: 'middle' as const,
    nameGap: 34,
    nameTextStyle: { color: theme.axisName },
    axisLabel: { color: theme.axisName, formatter: (v: number) => def.fmt(v) },
    axisLine: { lineStyle: { color: theme.axisLine } },
    splitLine: { lineStyle: { color: theme.splitLine } },
  };
}

/** A lens is plottable only if both axes have a non-null wide value. */
export function plottable(l: Lens, x: AxisKey, y: AxisKey): boolean {
  return AXES[x].wide(l) != null && AXES[y].wide(l) != null;
}

export function buildChartOption(data: Lens[], opts: ChartOpts, locale: Locale, theme: ChartTheme) {
  const xDef = AXES[opts.x];
  const yDef = AXES[opts.y];
  const colorDef = COLOR_BY[opts.color];

  // Color order/palette is derived from the FULL dataset so a group keeps its color while filtered.
  const order = groupOrder(colorDef, lenses);
  const colors = paletteMap(order, theme.palette);

  // Bucket the (filtered) data by color group; keep every group as a series in stable order so
  // index-aligned merges preserve legend toggles + zoom when only the filter changes.
  const byGroup = new Map<string, any[]>(order.map((g) => [g, []]));
  for (const l of data) {
    if (!plottable(l, opts.x, opts.y)) continue;
    const g = colorDef.group(l);
    const bucket = byGroup.get(g);
    if (!bucket) continue;
    const xw = xDef.wide(l)!;
    const yw = yDef.wide(l)!;
    const xt = xDef.tele(l) ?? xw;
    const yt = yDef.tele(l) ?? yw;
    bucket.push({ name: l.model, lens: l, value: [xw, yw, xt, yt, xw !== xt || yw !== yt ? 1 : 0] });
  }

  const series: any[] = order.map((g) => ({
    name: g,
    type: 'custom' as const,
    // Custom series default to clip:false; with filterMode:'none' dataZoom, off-window points would
    // otherwise paint over the axes/legend/margins when panned or zoomed. Clip to the grid rect.
    clip: true,
    renderItem,
    encode: { x: [0, 2], y: [1, 3] },
    itemStyle: { color: colors[g] ?? theme.fallback },
    emphasis: { focus: 'series' as const },
    data: byGroup.get(g) ?? [],
  }));

  // Pinned-ring overlay. Always appended last as a single fixed-identity series (kept OUT of
  // legend.data so it isn't toggleable) so a pin change only mutates its data and an index-aligned
  // merge stays correct. Only rings pins that are currently visible + plottable.
  const pins = opts.pins;
  const pinData =
    pins && pins.size
      ? data
          .filter((l) => pins.has(l.id) && plottable(l, opts.x, opts.y))
          .map((l) => ({ value: [xDef.wide(l)!, yDef.wide(l)!] }))
      : [];
  series.push({
    name: '__pinned__',
    type: 'custom',
    clip: true,
    silent: true,
    z: 5,
    renderItem: makeRenderPin(theme.accent),
    encode: { x: [0], y: [1] },
    tooltip: { show: false },
    data: pinData,
  });

  return {
    backgroundColor: 'transparent',
    animation: false,
    legend: {
      type: 'scroll',
      top: 8,
      left: 'center',
      textStyle: { color: theme.legendText },
      pageTextStyle: { color: theme.legendText },
      inactiveColor: theme.legendInactive,
      // Identity stays canonical (`order`); only the displayed text is localized so the palette
      // and toggle state keyed on canonical group names are unaffected.
      formatter: (name: string) => groupLabel(locale, opts.color, name),
      data: order,
    },
    grid: { ...DOTS_GRID },
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.tooltipText },
      formatter: makeTooltipFormatter(locale, theme),
    },
    xAxis: axisConfig(xDef, opts.xLog, locale, theme),
    yAxis: axisConfig(yDef, opts.yLog, locale, theme),
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      { type: 'inside', yAxisIndex: 0, filterMode: 'none' },
    ],
    series,
  };
}

// ---- Tag view ------------------------------------------------------------------------------
//
// An alternate "every lens is a labelled chip" mode. The 2D de-overlap is computed in pixel space by
// tagLayout.ts; here we just render the placed chips through a full-bleed `custom` series whose
// synthetic 1:1 value axes map our pixel coordinates straight onto the canvas. There is no dataZoom
// (the canvas grows tall and the page scrolls instead), and zooms are single tags at their wide
// endpoint (largest aperture). Everything else (per-group color + legend toggle, tooltip,
// click-to-pin, theme, i18n) reuses the same pipeline as the dot chart.

/** hex (#rrggbb) → rgba string, so a chip can have a faint fill but a solid same-color border. */
function withAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function makeTagRenderItem(placed: PlacedTag[], theme: ChartTheme) {
  return (params: any, api: any) => {
    const tg = placed[params.dataIndex];
    if (!tg) return;
    const c = api.coord([tg.cx, tg.cy]);
    const halfW = tg.w / 2;
    const halfH = tg.h / 2;
    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          shape: { x: c[0] - halfW, y: c[1] - halfH, width: tg.w, height: tg.h, r: 4 },
          style: { fill: withAlpha(tg.color, 0.16), stroke: tg.pinned ? theme.accent : tg.color, lineWidth: tg.pinned ? 1.5 : 1 },
        },
        {
          type: 'text',
          style: {
            text: tg.text,
            x: c[0],
            y: c[1],
            align: 'center',
            verticalAlign: 'middle',
            fill: theme.tooltipText,
            font: `${tg.pinned ? '600 ' : ''}${TAG_FONT_SIZE}px ${TAG_FONT_FAMILY}`,
          },
        },
      ],
    };
  };
}

export interface TagChartOpts {
  x: AxisKey;
  y: AxisKey;
  xLog: boolean;
  yLog: boolean;
  color: ColorByKey;
  tagDetail: TagDetail;
  multiBrand: boolean;
  width: number;
  pins?: Set<string>;
}

// Grid margins for tag view: room for the reference axes (left/bottom) and the legend (top). The tag
// layout packs INSIDE the resulting content rect, so the synthetic 1:1 pixel axes still map straight
// to canvas pixels (content-rect px width == synthetic xAxis max, height likewise).
const TAG_GRID = { left: 56, right: 16, top: 44, bottom: 42 };

/** Guard an axis domain so a single distinct value (or an inverted pair) yields a valid, centred range. */
function safeAxisRange([lo, hi]: [number, number], log: boolean): [number, number] {
  if (hi > lo) return [lo, hi];
  if (log) {
    const v = lo > 0 ? lo : 1;
    return [v / 1.5, v * 1.5];
  }
  const pad = Math.abs(lo) * 0.5 || 1;
  return [lo - pad, hi + pad];
}

/**
 * A display-only reference axis (real data domain) for tag view; the series ride the synthetic axes.
 * `customValues` pins the ticks to meaningful values (standard focal lengths / f-stops) instead of
 * ECharts' auto ticks.
 */
function tagDisplayAxis(
  def: (typeof AXES)[AxisKey],
  log: boolean,
  domain: [number, number],
  locale: Locale,
  theme: ChartTheme,
  position: 'bottom' | 'left',
  customValues?: number[],
) {
  const [min, max] = safeAxisRange(domain, log);
  const cv = customValues ? { customValues } : {};
  return {
    type: log ? ('log' as const) : ('value' as const),
    logBase: def.logBase,
    min,
    max,
    inverse: def.inverse,
    position,
    name: t(locale, def.titleKey),
    nameLocation: 'middle' as const,
    nameGap: position === 'left' ? 42 : 26,
    nameTextStyle: { color: theme.axisName },
    axisLabel: { color: theme.axisName, formatter: (v: number) => def.fmt(v), hideOverlap: true, ...cv },
    axisLine: { lineStyle: { color: theme.axisLine } },
    axisTick: { lineStyle: { color: theme.axisLine }, ...cv },
    splitLine: { show: true, lineStyle: { color: theme.splitLine }, ...cv },
  };
}

/** Meaningful tick values for the focal / aperture reference axes (standard focals / f-stops). */
function meaningfulTicks(key: AxisKey, [lo, hi]: [number, number]): number[] | undefined {
  const src = key === 'focal' ? FOCAL_TICKS : key === 'aperture' ? APERTURE_STOPS : null;
  if (!src) return undefined;
  const within = src.filter((v) => v >= lo * 0.999 && v <= hi * 1.001);
  return within.length ? within : undefined;
}

/** Build the tag-view option. Returns the option plus the computed canvas height (the page scrolls). */
export function buildTagChartOption(
  data: Lens[],
  opts: TagChartOpts,
  locale: Locale,
  theme: ChartTheme,
): { option: Record<string, unknown>; height: number } {
  const colorDef = COLOR_BY[opts.color];
  const order = groupOrder(colorDef, lenses);
  const colors = paletteMap(order, theme.palette);
  const xDef = AXES[opts.x];
  const yDef = AXES[opts.y];

  const inputs = data
    .filter((l) => plottable(l, opts.x, opts.y))
    .map((l) => ({ lens: l, group: colorDef.group(l), color: colors[colorDef.group(l)] ?? theme.fallback }));

  // Pack inside the content rect (canvas width minus the axis/legend margins) so the synthetic axes
  // map 1:1 to the grid's content rect, and the canvas total height = content height + margins.
  const contentWidth = Math.max(120, opts.width - TAG_GRID.left - TAG_GRID.right);
  // Aperture on Y becomes discrete f-stop rows (buckets); every other Y stays continuous.
  const bucketY = opts.y === 'aperture';
  const layout = layoutTags(inputs, {
    width: contentWidth,
    x: opts.x,
    y: opts.y,
    xLog: opts.xLog,
    yLog: opts.yLog,
    multiBrand: opts.multiBrand,
    detail: opts.tagDetail,
    brandLabel: (b) => tBrand(locale, b),
    pins: opts.pins ?? new Set(),
    bucketY,
  });
  const canvasHeight = layout.height + TAG_GRID.top + TAG_GRID.bottom;

  // Use a log reference axis only when the layout's seeding also used log (frac() falls back to linear
  // unless the whole domain is positive). This keeps the ticks aligned with the chips and avoids a
  // log axis with min<=0 when a log-toggled spec has a zero/negative value in the visible set.
  const xLogEff = opts.xLog && layout.domainX[0] > 0 && layout.domainX[1] > 0;
  const yLogEff = opts.yLog && layout.domainY[0] > 0 && layout.domainY[1] > 0;

  // X: synthetic (hidden, series ride it) + a real focal/aperture reference with meaningful ticks.
  const xAxis: Record<string, unknown>[] = [
    { type: 'value', min: 0, max: layout.width, show: false, position: 'top' },
    tagDisplayAxis(xDef, xLogEff, layout.domainX, locale, theme, 'bottom', meaningfulTicks(opts.x, layout.domainX)),
  ];

  // Y: in bucket mode the chips ride a single VISIBLE pixel axis labelled per f-stop row (ticks at the
  // row band centres). Otherwise it mirrors X: hidden synthetic + a real reference with nice ticks.
  let yAxis: Record<string, unknown>[];
  if (layout.yBuckets && layout.yBuckets.length) {
    const buckets = layout.yBuckets;
    const centers = buckets.map((b) => b.centerCy);
    const labelByCenter = new Map(buckets.map((b) => [b.centerCy, yDef.fmt(b.value)]));
    const boundaries = buckets.slice(1).map((b, i) => Math.round((buckets[i].centerCy + b.centerCy) / 2));
    yAxis = [
      {
        type: 'value',
        min: 0,
        max: layout.height,
        inverse: true,
        position: 'left',
        name: t(locale, yDef.titleKey),
        nameLocation: 'middle',
        nameGap: 44,
        nameTextStyle: { color: theme.axisName },
        axisLabel: { color: theme.axisName, customValues: centers, formatter: (cy: number) => labelByCenter.get(Math.round(cy)) ?? '', hideOverlap: true },
        axisTick: { customValues: centers, lineStyle: { color: theme.axisLine } },
        axisLine: { lineStyle: { color: theme.axisLine } },
        splitLine: { show: boundaries.length > 0, customValues: boundaries, lineStyle: { color: theme.splitLine } },
      },
    ];
  } else {
    yAxis = [
      { type: 'value', min: 0, max: layout.height, inverse: true, show: false, position: 'right' },
      tagDisplayAxis(yDef, yLogEff, layout.domainY, locale, theme, 'left', meaningfulTicks(opts.y, layout.domainY)),
    ];
  }

  // One custom series per color group (legend toggles a whole group; colors stay stable per group).
  const byGroup = new Map<string, PlacedTag[]>(order.map((g) => [g, []]));
  for (const pt of layout.placed) byGroup.get(pt.group)?.push(pt);

  const series = order.map((g) => {
    const bucket = byGroup.get(g) ?? [];
    return {
      name: g,
      type: 'custom' as const,
      // The chips ride the synthetic (hidden) pixel axes; the reference axes are display-only.
      xAxisIndex: 0,
      yAxisIndex: 0,
      renderItem: makeTagRenderItem(bucket, theme),
      encode: { x: 0, y: 1 },
      data: bucket.map((pt) => ({ name: pt.lens.model, lens: pt.lens, value: [pt.cx, pt.cy] })),
    };
  });

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    legend: {
      type: 'scroll',
      top: 8,
      left: 'center',
      textStyle: { color: theme.legendText },
      pageTextStyle: { color: theme.legendText },
      inactiveColor: theme.legendInactive,
      formatter: (name: string) => groupLabel(locale, opts.color, name),
      data: order,
    },
    grid: { left: TAG_GRID.left, right: TAG_GRID.right, top: TAG_GRID.top, bottom: TAG_GRID.bottom, containLabel: false },
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.tooltipText },
      formatter: makeTooltipFormatter(locale, theme),
    },
    xAxis,
    yAxis,
    series,
  };

  return { option, height: canvasHeight };
}
