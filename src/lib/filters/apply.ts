// Pure filtering: given the full lens list and the current filter state, return the visible set.
// Range filters that sit at the full dataset extent are treated as "no constraint" so lenses with
// a null value on that field are NOT dropped until the user actually narrows the range.
import type { Lens, Mount } from '../data/types';
import type { FilterState, Range } from './types';
import { FULL, rangeNarrowed } from './store.svelte';

/** A range [min,max] overlaps the lens interval [lo,hi]; null bounds make the lens fail a narrowed range. */
function rangeOverlaps(r: Range, full: Range, lo: number | null, hi: number | null): boolean {
  if (!rangeNarrowed(r, full)) return true;
  if (lo == null || hi == null) return false;
  return hi >= r[0] && lo <= r[1];
}

/** A scalar value falls inside a narrowed range; null fails a narrowed range, passes the full one. */
function scalarInRange(r: Range, full: Range, v: number | null): boolean {
  if (!rangeNarrowed(r, full)) return true;
  if (v == null) return false;
  return v >= r[0] && v <= r[1];
}

export function applyFilters(lenses: Lens[], f: FilterState): Lens[] {
  const q = f.q.trim().toLowerCase();

  return lenses.filter((l) => {
    if (f.brands.length && !f.brands.includes(l.brand)) return false;
    if (f.formats.length && !f.formats.includes(l.format)) return false;
    if (f.types.length && !f.types.includes(l.lensType)) return false;
    if (f.mounts.length && !l.mounts.some((m: Mount) => f.mounts.includes(m))) return false;

    if (f.focus === 'af' && l.autofocus !== true) return false;
    if (f.focus === 'mf' && l.autofocus !== false) return false;
    if (f.stabilized && l.stabilization !== true) return false;
    if (f.weatherSealed && l.weatherSealed !== true) return false;

    if (!rangeOverlaps(f.focalR, FULL.focalR, l.focalMin, l.focalMax)) return false;
    if (!rangeOverlaps(f.apertureR, FULL.apertureR, l.apertureMaxWide, l.apertureMaxTele ?? l.apertureMaxWide)) {
      return false;
    }
    if (!scalarInRange(f.priceR, FULL.priceR, l.priceUSD)) return false;
    if (!scalarInRange(f.weightR, FULL.weightR, l.weight)) return false;
    if (!scalarInRange(f.yearR, FULL.yearR, l.year)) return false;

    if (q) {
      const hay = `${l.brand} ${l.model} ${l.series ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}
