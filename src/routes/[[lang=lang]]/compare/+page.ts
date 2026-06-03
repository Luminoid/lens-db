import type { EntryGenerator } from './$types';

// Prerender both the EN (`/compare/`) and ZH (`/zh/compare/`) compare pages. The pinned set is
// read from the URL / shared store on the client, so the prerendered HTML is the base shell.
export const entries: EntryGenerator = () => [{ lang: '' }, { lang: 'zh' }];
