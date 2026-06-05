// Module-level reactive filter state. A single shared $state survives client-side navigation
// (workspace lesson: navigation-surviving UI state belongs in a module store, not component
// $state). The URL is the persistence layer on top of this (see url.ts + the page).
import { lenses, meta } from '../data/lenses';
import { AXES } from '../chart/axes';
import type { FilterState, Range } from './types';

// Slider step per range. The aperture slider filters MAX aperture (apertureMaxWide..tele), whose
// real extent is ~[0.8, 14], NOT meta.apertureRange [0.8, 64], which also spans MIN aperture.
const apW = lenses.map((l) => l.apertureMaxWide);
const apT = lenses.map((l) => l.apertureMaxTele ?? l.apertureMaxWide);
const apertureMaxExtent: Range = [Math.min(...apW), Math.max(...apT)];

export const STEP = { focalR: 1, apertureR: 0.1, priceR: 5, weightR: 1, yearR: 1 } as const;
type RangeKey = keyof typeof STEP;

const decimals = (step: number): number => (String(step).split('.')[1] ?? '').length;

/**
 * Snap an extent outward to the slider's step grid so the min/max handles can land EXACTLY on the
 * bounds. Without this, when (hi - lo) isn't a whole number of steps the max handle stops one notch
 * short, the range never equals the full extent, and the filter stays silently "narrowed" (dropping
 * null-valued lenses and poisoning the shared URL). eps guards binary float dust (0.8/0.1 = 7.999…).
 */
function snap([lo, hi]: Range, step: number): Range {
  const p = 10 ** decimals(step);
  const eps = 1e-9;
  return [
    Math.round(Math.floor(lo / step + eps) * step * p) / p,
    Math.round(Math.ceil(hi / step - eps) * step * p) / p,
  ];
}

/** Full (step-snapped) range per field; a range equal to this means "no constraint". */
export const FULL: Record<RangeKey, Range> = {
  focalR: snap([...meta.focalRange] as Range, STEP.focalR),
  apertureR: snap(apertureMaxExtent, STEP.apertureR),
  priceR: snap([...meta.priceRange] as Range, STEP.priceR),
  weightR: snap([...meta.weightRange] as Range, STEP.weightR),
  yearR: snap([...meta.yearRange] as Range, STEP.yearR),
};

export function defaultFilters(): FilterState {
  return {
    brands: [],
    mounts: [],
    formats: [],
    types: [],
    focus: 'all',
    stabilized: false,
    weatherSealed: false,
    focalR: [...FULL.focalR] as Range,
    apertureR: [...FULL.apertureR] as Range,
    priceR: [...FULL.priceR] as Range,
    weightR: [...FULL.weightR] as Range,
    yearR: [...FULL.yearR] as Range,
    q: '',
    pins: [],
    x: 'focal',
    y: 'aperture',
    xLog: AXES.focal.defaultLog,
    yLog: AXES.aperture.defaultLog,
    color: 'brand',
    mode: 'tags',
    tagDetail: 'none',
  };
}

export const filters: FilterState = $state(defaultFilters());

/**
 * View chrome that should survive client-side navigation but is NOT part of the shareable filter
 * state (so it stays out of the URL). `filtersCollapsed` hides the desktop sidebar to give the
 * chart full width. `compareMode` switches what a chart click does: off (default) opens the lens
 * detail page, on adds the lens to the comparison set.
 */
export const ui: { filtersCollapsed: boolean; compareMode: boolean } = $state({
  filtersCollapsed: false,
  compareMode: false,
});

/** Max lenses pinnable into the comparison tray. */
export const MAX_PINS = 6;

/** Restore filters to defaults in place. Pins are a comparison set, not a filter, so they survive. */
export function resetFilters(): void {
  const keepPins = filters.pins;
  Object.assign(filters, defaultFilters());
  filters.pins = keepPins;
}

/** Pin/unpin a lens id (no-op when adding past MAX_PINS). */
export function togglePin(id: string): void {
  if (filters.pins.includes(id)) {
    filters.pins = filters.pins.filter((x) => x !== id);
  } else if (filters.pins.length < MAX_PINS) {
    filters.pins = [...filters.pins, id];
  }
}

export function clearPins(): void {
  filters.pins = [];
}

/** True when the user has narrowed anything from the default view. */
export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.brands.length > 0 ||
    f.mounts.length > 0 ||
    f.formats.length > 0 ||
    f.types.length > 0 ||
    f.focus !== 'all' ||
    f.stabilized ||
    f.weatherSealed ||
    f.q.trim() !== '' ||
    rangeNarrowed(f.focalR, FULL.focalR) ||
    rangeNarrowed(f.apertureR, FULL.apertureR) ||
    rangeNarrowed(f.priceR, FULL.priceR) ||
    rangeNarrowed(f.weightR, FULL.weightR) ||
    rangeNarrowed(f.yearR, FULL.yearR)
  );
}

export function rangeNarrowed(r: Range, full: Range): boolean {
  return r[0] > full[0] || r[1] < full[1];
}
