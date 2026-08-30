// Single source of truth for the lens records. The DB is imported at build time via the
// $data alias (see svelte.config.js) and prerendered into the page, so there is no runtime
// fetch. Only chart/detail/compare code may import this module; layout-level code (filter store,
// URL codec) imports ./meta instead so the ~600 KB dataset chunk stays off dataset-free routes.
import lensesJson from '$data/lenses.json';
import type { Lens } from './types';

export const lenses: Lens[] = lensesJson as unknown as Lens[];

/** id -> lens, for detail-page and compare lookups. */
export const lensById: Map<string, Lens> = new Map(lenses.map((l) => [l.id, l]));
