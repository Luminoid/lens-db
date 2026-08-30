// The full interactive state: what the user filters/searches, plus the chart configuration.
// This single object round-trips to the URL (see url.ts) so any view is shareable.
import type { AxisKey, ColorByKey } from '../chart/axes';

export type Range = [number, number];

export type FocusFilter = 'all' | 'af' | 'mf';

/** Chart rendering mode: the scatter of dots/segments, or the packed labelled-tag view. */
export type ViewMode = 'dots' | 'tags';

/** Extra spec appended to each tag in tag view; 'none' = focal/aperture (+ series badge) only. */
export type TagDetail = 'none' | AxisKey;

export interface FilterState {
  // Multi-select facets. Empty array = no constraint (show all).
  brands: string[];
  mounts: string[];
  formats: string[];
  types: string[]; // lensType values: 'Prime' | 'Zoom'

  // Toggles.
  focus: FocusFilter;
  stabilized: boolean; // true = only stabilized
  weatherSealed: boolean; // true = only weather-sealed
  hideDiscontinued: boolean; // true = drop discontinued lenses (null status passes)

  // Numeric ranges [min, max]. Equal to the full dataset range = no constraint.
  focalR: Range;
  apertureR: Range;
  priceR: Range;
  weightR: Range;
  yearR: Range;

  // Free-text search over brand / model / series.
  q: string;

  // Pinned lens ids for side-by-side comparison (order preserved, capped at MAX_PINS).
  pins: string[];

  // Chart configuration.
  x: AxisKey;
  y: AxisKey;
  xLog: boolean;
  yLog: boolean;
  color: ColorByKey;

  // View mode + the optional extra spec shown on each tag (tag view only).
  mode: ViewMode;
  tagDetail: TagDetail;
}
