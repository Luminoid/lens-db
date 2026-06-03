// Single source of truth for the lens data. The DB is imported at build time via the
// $data alias (see svelte.config.js) and prerendered into the page, so there is no runtime
// fetch. Code-splitting the data out into a runtime fetch is a later optimization.
import lensesJson from '$data/lenses.json';
import metaJson from '$data/meta.json';
import type { Lens } from './types';

export const lenses: Lens[] = lensesJson as unknown as Lens[];

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

/** id -> lens, for detail-page and compare lookups. */
export const lensById: Map<string, Lens> = new Map(lenses.map((l) => [l.id, l]));
