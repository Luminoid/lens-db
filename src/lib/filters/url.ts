// FilterState <-> URL query string. Only non-default values are emitted, so a clean view yields a
// bare URL and `?x=weight&y=price&brand=sony,sigma` reproduces an exact view. Multi-select facets
// use a normalized ASCII token (lowercased, alphanumerics only) mapped back to the canonical value,
// so URLs stay readable and robust to unknown/legacy tokens (which are simply ignored).
// Imports ../data/meta, NOT ../data/lenses: this module runs in the root layout on every route,
// and the meta module keeps the full dataset chunk out of that graph. Pin ids are therefore only
// validated syntactically here; every consumer resolves them via lensById and drops unknowns.
import { meta } from '../data/meta';
import { AXES, isAxisKey, isColorByKey, type AxisKey } from '../chart/axes';
import { isTagDetail } from '../chart/tagLayout';
import { defaultFilters, FULL, rangeNarrowed, MAX_PINS } from './store.svelte';
import type { FilterState, FocusFilter, Range } from './types';

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function normMap(values: string[]): Map<string, string> {
  return new Map(values.map((v) => [norm(v), v]));
}

const BRANDS = normMap(Object.keys(meta.brands));
const MOUNTS = normMap(Object.keys(meta.mounts));
const FORMATS = normMap(Object.keys(meta.formats));
const TYPES = normMap(Object.keys(meta.lensTypes));

const encodeMulti = (values: string[]): string => values.map(norm).join(',');

function decodeMulti(token: string | null, map: Map<string, string>): string[] {
  if (!token) return [];
  const out: string[] = [];
  for (const t of token.split(',')) {
    const canonical = map.get(norm(t));
    if (canonical && !out.includes(canonical)) out.push(canonical);
  }
  return out;
}

function encodeRange(r: Range, full: Range): string | null {
  return rangeNarrowed(r, full) ? `${r[0]}-${r[1]}` : null;
}

function decodeRange(token: string | null, full: Range): Range {
  if (!token) return [...full] as Range;
  const m = token.match(/^(-?\d*\.?\d+)-(-?\d*\.?\d+)$/);
  if (!m) return [...full] as Range;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  if (Number.isNaN(a) || Number.isNaN(b)) return [...full] as Range;
  // Clamp each bound to the extent FIRST, then order. (Clamping after a swap can re-invert a range
  // that lies entirely outside the extent, e.g. "30000-40000" -> [30000,19999]; a stale/hostile URL
  // would then empty the chart and round-trip non-idempotently.) An out-of-extent range collapses to
  // a point at the nearest edge, which is harmless and stable across reloads.
  const lo = Math.min(Math.max(a, full[0]), full[1]);
  const hi = Math.min(Math.max(b, full[0]), full[1]);
  return [Math.min(lo, hi), Math.max(lo, hi)] as Range;
}

/** Serialize only the values that differ from defaults. */
export function filtersToSearch(f: FilterState): string {
  const p = new URLSearchParams();

  if (f.x !== 'focal') p.set('x', f.x);
  if (f.y !== 'aperture') p.set('y', f.y);
  if (f.xLog !== AXES[f.x].defaultLog) p.set('xs', f.xLog ? 'log' : 'lin');
  if (f.yLog !== AXES[f.y].defaultLog) p.set('ys', f.yLog ? 'log' : 'lin');
  if (f.color !== 'brand') p.set('color', f.color);

  // Tags is the default view, so a clean tags view stays a bare URL; dots is the explicit param.
  if (f.mode !== 'tags') p.set('view', f.mode);
  if (f.tagDetail !== 'none') p.set('tag', f.tagDetail);

  if (f.brands.length) p.set('brand', encodeMulti(f.brands));
  if (f.mounts.length) p.set('mount', encodeMulti(f.mounts));
  if (f.formats.length) p.set('format', encodeMulti(f.formats));
  if (f.types.length) p.set('type', encodeMulti(f.types));

  if (f.focus !== 'all') p.set('focus', f.focus);
  if (f.stabilized) p.set('stab', '1');
  if (f.weatherSealed) p.set('seal', '1');
  if (f.hideDiscontinued) p.set('nodisc', '1');

  const focal = encodeRange(f.focalR, FULL.focalR);
  if (focal) p.set('focal', focal);
  const ap = encodeRange(f.apertureR, FULL.apertureR);
  if (ap) p.set('ap', ap);
  const price = encodeRange(f.priceR, FULL.priceR);
  if (price) p.set('price', price);
  const weight = encodeRange(f.weightR, FULL.weightR);
  if (weight) p.set('weight', weight);
  const year = encodeRange(f.yearR, FULL.yearR);
  if (year) p.set('year', year);

  if (f.q.trim()) p.set('q', f.q.trim());

  if (f.pins.length) p.set('pin', f.pins.join(','));

  return p.toString();
}

/** Build a fresh FilterState from a query string (absent params fall back to defaults). */
function parseSearch(search: string): FilterState {
  const p = new URLSearchParams(search);
  const f = defaultFilters();

  const x = p.get('x');
  if (x && isAxisKey(x)) f.x = x;
  const y = p.get('y');
  if (y && isAxisKey(y)) f.y = y;

  // Scale defaults depend on the (possibly just-changed) axis.
  f.xLog = scale(p.get('xs'), f.x);
  f.yLog = scale(p.get('ys'), f.y);

  const color = p.get('color');
  if (color && isColorByKey(color)) f.color = color;

  // Default is tags; `view=dots` selects the scatter view. Legacy `view=tags` still loads tags.
  const view = p.get('view');
  if (view === 'dots') f.mode = 'dots';
  else if (view === 'tags') f.mode = 'tags';
  const tag = p.get('tag');
  if (tag && isTagDetail(tag)) f.tagDetail = tag;

  f.brands = decodeMulti(p.get('brand'), BRANDS);
  f.mounts = decodeMulti(p.get('mount'), MOUNTS);
  f.formats = decodeMulti(p.get('format'), FORMATS);
  f.types = decodeMulti(p.get('type'), TYPES);

  const focus = p.get('focus');
  if (focus === 'af' || focus === 'mf') f.focus = focus as FocusFilter;
  f.stabilized = p.get('stab') === '1';
  f.weatherSealed = p.get('seal') === '1';
  f.hideDiscontinued = p.get('nodisc') === '1';

  f.focalR = decodeRange(p.get('focal'), FULL.focalR);
  f.apertureR = decodeRange(p.get('ap'), FULL.apertureR);
  f.priceR = decodeRange(p.get('price'), FULL.priceR);
  f.weightR = decodeRange(p.get('weight'), FULL.weightR);
  f.yearR = decodeRange(p.get('year'), FULL.yearR);

  f.q = p.get('q')?.slice(0, 100) ?? '';

  const pin = p.get('pin');
  if (pin) {
    const seen = new Set<string>();
    for (const id of pin.split(',')) {
      if (/^[a-z0-9][a-z0-9._-]*$/.test(id) && !seen.has(id) && seen.size < MAX_PINS) seen.add(id);
    }
    f.pins = [...seen];
  }

  return f;
}

function scale(token: string | null, axis: AxisKey): boolean {
  if (token === 'log') return true;
  if (token === 'lin') return false;
  return AXES[axis].defaultLog;
}

/** Hydrate the live store object from a query string, in place. */
export function applyUrlToFilters(target: FilterState, search: string): void {
  Object.assign(target, parseSearch(search));
}
