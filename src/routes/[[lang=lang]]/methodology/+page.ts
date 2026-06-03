import type { EntryGenerator } from './$types';

// Prerender both the EN (`/methodology/`) and ZH (`/zh/methodology/`) pages. Static content, no
// params beyond the locale, so two explicit entries cover it (prerender is on via the root layout).
export const entries: EntryGenerator = () => [{ lang: '' }, { lang: 'zh' }];
