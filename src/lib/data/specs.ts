// Canonical spec-row list, shared by the compare table and the lens detail page so they never
// drift. Each row carries an i18n `labelKey` and a locale-aware `value` formatter; `num` is the
// raw comparable value and `better` the favorable extreme used for best-in-row highlighting. Rows
// without `better` are never highlighted (no defensible "best", e.g. focal length, element count).
import type { Lens } from './types';
import { focalLabel, apertureLabel } from './types';
import { t, tFormat, tType, type Locale } from '$lib/i18n/translations';

export interface SpecRow {
  key: string;
  labelKey: string;
  value: (l: Lens, locale: Locale) => string | null;
  num?: (l: Lens) => number | null;
  better?: 'low' | 'high';
}

const boolLabel = (b: boolean | null, locale: Locale): string | null =>
  b == null ? null : t(locale, b ? 'term.yes' : 'term.no');

export const SPEC_ROWS: SpecRow[] = [
  { key: 'brand', labelKey: 'filter.brand', value: (l) => l.brand },
  { key: 'mounts', labelKey: 'filter.mount', value: (l) => l.mounts.join(', ') },
  { key: 'format', labelKey: 'filter.format', value: (l, loc) => tFormat(loc, l.format) },
  { key: 'type', labelKey: 'filter.type', value: (l, loc) => tType(loc, l.lensType) },
  { key: 'focal', labelKey: 'axis.focal', value: (l) => focalLabel(l) },
  {
    key: 'aperture',
    labelKey: 'axis.aperture',
    value: (l) => apertureLabel(l),
    num: (l) => l.apertureMaxWide,
    better: 'low', // smaller f-number = wider = brighter
  },
  { key: 'apertureMin', labelKey: 'spec.apertureMin', value: (l) => (l.apertureMin != null ? `f/${l.apertureMin}` : null) },
  { key: 'stabilization', labelKey: 'spec.stabilization', value: (l, loc) => boolLabel(l.stabilization, loc) },
  { key: 'weatherSealed', labelKey: 'spec.weatherSealed', value: (l, loc) => boolLabel(l.weatherSealed, loc) },
  {
    key: 'focus',
    labelKey: 'colorBy.focus',
    value: (l, loc) =>
      l.autofocus == null ? null : t(loc, l.autofocus ? 'term.autofocus' : 'term.manualFocus'),
  },
  { key: 'weight', labelKey: 'axis.weight', value: (l) => (l.weight != null ? `${l.weight} g` : null), num: (l) => l.weight, better: 'low' },
  { key: 'length', labelKey: 'axis.length', value: (l) => (l.length != null ? `${l.length} mm` : null), num: (l) => l.length, better: 'low' },
  { key: 'diameter', labelKey: 'axis.diameter', value: (l) => (l.diameter != null ? `${l.diameter} mm` : null), num: (l) => l.diameter, better: 'low' },
  { key: 'filterThread', labelKey: 'axis.filter', value: (l) => (l.filterThread != null ? `${l.filterThread} mm` : null) },
  {
    key: 'minFocus',
    labelKey: 'axis.minFocus',
    value: (l) => (l.minFocusDistance != null ? `${l.minFocusDistance} m` : null),
    num: (l) => l.minFocusDistance,
    better: 'low',
  },
  {
    key: 'magnification',
    labelKey: 'axis.magnification',
    value: (l) => (l.maxMagnification != null ? `${l.maxMagnification}×` : null),
    num: (l) => l.maxMagnification,
    better: 'high',
  },
  { key: 'elements', labelKey: 'axis.elements', value: (l) => (l.elements != null ? `${l.elements}` : null) },
  { key: 'groups', labelKey: 'spec.groups', value: (l) => (l.groups != null ? `${l.groups}` : null) },
  {
    key: 'blades',
    labelKey: 'axis.blades',
    value: (l) => (l.apertureBlades != null ? `${l.apertureBlades}` : null),
    num: (l) => l.apertureBlades,
    better: 'high',
  },
  {
    key: 'price',
    labelKey: 'spec.price',
    // On discontinued lenses priceUSD is the last verifiable new-stock price, not a live one.
    value: (l, loc) =>
      l.priceUSD != null
        ? `$${l.priceUSD.toLocaleString('en-US')}${l.discontinued === true ? t(loc, 'spec.lastKnownSuffix') : ''}`
        : null,
    num: (l) => l.priceUSD,
    better: 'low',
  },
  { key: 'msrp', labelKey: 'spec.msrp', value: (l) => (l.priceMSRPUSD != null ? `$${l.priceMSRPUSD.toLocaleString('en-US')}` : null) },
  { key: 'year', labelKey: 'axis.year', value: (l) => (l.year != null ? `${l.year}` : null), num: (l) => l.year, better: 'high' },
  {
    key: 'status',
    labelKey: 'spec.status',
    value: (l, loc) => (l.discontinued == null ? null : t(loc, l.discontinued ? 'term.discontinued' : 'term.inProduction')),
  },
];
