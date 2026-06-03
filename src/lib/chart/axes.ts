// Axis + color-by registries: the model behind the configurable chart.
//
// Every plottable spec is exposed as an "axis". A lens occupies a *wide-end* point and a
// *tele-end* point on the chosen X/Y axes; when they differ the lens draws as a segment, when
// they coincide it draws as a single dot. That one rule covers every case:
//   - prime              -> wide == tele on both axes        -> dot
//   - constant-aperture zoom on focal x aperture -> spans X only        -> horizontal segment
//   - variable-aperture zoom on focal x aperture -> spans X and Y       -> sloped segment
//   - any scalar axis (weight, price, ...)       -> wide == tele        -> dot
import type { Lens } from '../data/types';

export type AxisKey =
  | 'focal'
  | 'aperture'
  | 'weight'
  | 'length'
  | 'diameter'
  | 'filter'
  | 'minFocus'
  | 'magnification'
  | 'elements'
  | 'blades'
  | 'price'
  | 'year';

export interface AxisDef {
  key: AxisKey;
  /** i18n key for the bare label (axis picker, range slider, spec row). */
  labelKey: string;
  /** i18n key for the chart axis title (label + unit). */
  titleKey: string;
  defaultLog: boolean;
  logBase: number;
  /** Aperture reads "brighter is up", so its axis is inverted. */
  inverse: boolean;
  /** Value at the wide / short / single end. null = not plottable for this lens. */
  wide: (l: Lens) => number | null;
  /** Value at the tele / long end. Equals `wide` for scalar axes. */
  tele: (l: Lens) => number | null;
  /** Formats an axis tick / readout value. */
  fmt: (v: number) => string;
}

const scalar =
  (get: (l: Lens) => number | null) =>
  (l: Lens): number | null =>
    get(l);

export const AXES: Record<AxisKey, AxisDef> = {
  focal: {
    key: 'focal',
    labelKey: 'axis.focal',
    titleKey: 'axisTitle.focal',
    defaultLog: true,
    logBase: 10,
    inverse: false,
    wide: (l) => l.focalMin,
    tele: (l) => l.focalMax,
    fmt: (v) => `${v}`,
  },
  aperture: {
    key: 'aperture',
    labelKey: 'axis.aperture',
    titleKey: 'axisTitle.aperture',
    defaultLog: true,
    logBase: 2,
    inverse: true,
    wide: (l) => l.apertureMaxWide,
    tele: (l) => l.apertureMaxTele ?? l.apertureMaxWide,
    fmt: (v) => `f/${v}`,
  },
  weight: {
    key: 'weight',
    labelKey: 'axis.weight',
    titleKey: 'axisTitle.weight',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.weight),
    tele: scalar((l) => l.weight),
    fmt: (v) => `${v}`,
  },
  length: {
    key: 'length',
    labelKey: 'axis.length',
    titleKey: 'axisTitle.length',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.length),
    tele: scalar((l) => l.length),
    fmt: (v) => `${v}`,
  },
  diameter: {
    key: 'diameter',
    labelKey: 'axis.diameter',
    titleKey: 'axisTitle.diameter',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.diameter),
    tele: scalar((l) => l.diameter),
    fmt: (v) => `${v}`,
  },
  filter: {
    key: 'filter',
    labelKey: 'axis.filter',
    titleKey: 'axisTitle.filter',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.filterThread),
    tele: scalar((l) => l.filterThread),
    fmt: (v) => `${v}`,
  },
  minFocus: {
    key: 'minFocus',
    labelKey: 'axis.minFocus',
    titleKey: 'axisTitle.minFocus',
    defaultLog: true,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.minFocusDistance),
    tele: scalar((l) => l.minFocusDistance),
    fmt: (v) => `${v}`,
  },
  magnification: {
    key: 'magnification',
    labelKey: 'axis.magnification',
    titleKey: 'axisTitle.magnification',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.maxMagnification),
    tele: scalar((l) => l.maxMagnification),
    fmt: (v) => `${v}×`,
  },
  elements: {
    key: 'elements',
    labelKey: 'axis.elements',
    titleKey: 'axisTitle.elements',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.elements),
    tele: scalar((l) => l.elements),
    fmt: (v) => `${v}`,
  },
  blades: {
    key: 'blades',
    labelKey: 'axis.blades',
    titleKey: 'axisTitle.blades',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.apertureBlades),
    tele: scalar((l) => l.apertureBlades),
    fmt: (v) => `${v}`,
  },
  price: {
    key: 'price',
    labelKey: 'axis.price',
    titleKey: 'axisTitle.price',
    defaultLog: true,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.priceUSD),
    tele: scalar((l) => l.priceUSD),
    fmt: (v) => `$${v.toLocaleString('en-US')}`,
  },
  year: {
    key: 'year',
    labelKey: 'axis.year',
    titleKey: 'axisTitle.year',
    defaultLog: false,
    logBase: 10,
    inverse: false,
    wide: scalar((l) => l.year),
    tele: scalar((l) => l.year),
    fmt: (v) => `${v}`,
  },
};

export const AXIS_KEYS = Object.keys(AXES) as AxisKey[];

export const isAxisKey = (v: string): v is AxisKey => Object.prototype.hasOwnProperty.call(AXES, v);

// ---- Color-by groupings -------------------------------------------------------------------

export type ColorByKey = 'brand' | 'format' | 'lensType' | 'focus' | 'decade';

export interface ColorByDef {
  key: ColorByKey;
  /** i18n key for the color-by picker option. */
  labelKey: string;
  /** The canonical group a lens belongs to, used as both legend identity and color key. */
  group: (l: Lens) => string;
  /** Fixed legend order; omitted groupings derive order from the data. */
  order?: string[];
}

export const COLOR_BY: Record<ColorByKey, ColorByDef> = {
  brand: {
    key: 'brand',
    labelKey: 'colorBy.brand',
    group: (l) => l.brand,
  },
  format: {
    key: 'format',
    labelKey: 'colorBy.format',
    group: (l) => l.format,
    order: ['Full Frame', 'APS-C', 'MFT', 'Medium Format'],
  },
  lensType: {
    key: 'lensType',
    labelKey: 'colorBy.lensType',
    group: (l) => l.lensType,
    order: ['Prime', 'Zoom'],
  },
  focus: {
    key: 'focus',
    labelKey: 'colorBy.focus',
    group: (l) => (l.autofocus === true ? 'Autofocus' : l.autofocus === false ? 'Manual focus' : 'Unknown'),
    order: ['Autofocus', 'Manual focus', 'Unknown'],
  },
  decade: {
    key: 'decade',
    labelKey: 'colorBy.decade',
    group: (l) => (l.year == null ? 'Unknown' : `${Math.floor(l.year / 10) * 10}s`),
  },
};

export const COLOR_BY_KEYS = Object.keys(COLOR_BY) as ColorByKey[];

export const isColorByKey = (v: string): v is ColorByKey =>
  Object.prototype.hasOwnProperty.call(COLOR_BY, v);

/**
 * Stable legend order for a grouping, computed from the full dataset so colors don't shuffle
 * when filters narrow the visible set. Fixed-order groupings keep their declared order (only
 * groups that actually occur); free groupings sort by descending count, then label.
 */
export function groupOrder(def: ColorByDef, all: Lens[]): string[] {
  const counts = new Map<string, number>();
  for (const l of all) {
    const g = def.group(l);
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  if (def.order) return def.order.filter((g) => counts.has(g));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([g]) => g);
}
