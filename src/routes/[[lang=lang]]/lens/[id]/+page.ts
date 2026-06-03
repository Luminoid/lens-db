import { error } from '@sveltejs/kit';
import { lenses, lensById } from '$lib/data/lenses';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Prerender one page per optical design, in both locales (EN at /lens/[id]/, ZH at /zh/lens/[id]/).
export const entries: EntryGenerator = () =>
  ['', 'zh'].flatMap((lang) => lenses.map((l) => ({ lang, id: l.id })));

export const load: PageLoad = ({ params }) => {
  const lens = lensById.get(params.id);
  if (!lens) error(404, 'Lens not found');
  return { lens };
};
