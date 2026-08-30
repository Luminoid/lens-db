// Dataset summary (facets, counts, ranges) WITHOUT the lens records themselves. The filter store
// and URL codec run in the root layout on every route, so they must import from here — importing
// anything from ./lenses would pull the full lenses.json chunk into every page's module graph.
import metaJson from '$data/meta.json';

export interface Meta {
  generatedAt: string;
  lastPriceCheck: string;
  count: number;
  scope: string;
  brands: Record<string, number>;
  mounts: Record<string, number>;
  formats: Record<string, number>;
  lensTypes: Record<string, number>;
  focusCount: { autofocus: number; manualFocus: number };
  apertureProfile: { variable: number; constant: number };
  series: Record<string, number>;
  focalRange: [number, number];
  apertureRange: [number, number];
  /** Extent of MAX aperture only (apertureMaxWide..Tele), the domain the aperture slider filters. */
  apertureMaxRange: [number, number];
  priceRange: [number, number];
  weightRange: [number, number];
  yearRange: [number, number];
  numericAxes: string[];
  fieldCoverage: Record<string, number>;
  sourcesNote: string;
}

export const meta: Meta = metaJson as unknown as Meta;

/** Brands sorted by lens count (descending), for a stable legend / color assignment. */
export const brandsByCount: string[] = Object.entries(meta.brands)
  .sort((a, b) => b[1] - a[1])
  .map(([brand]) => brand);
