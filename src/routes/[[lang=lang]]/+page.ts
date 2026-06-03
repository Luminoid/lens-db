import type { EntryGenerator } from './$types';

// Prerender both the EN home (`/`) and the ZH home (`/zh/`).
export const entries: EntryGenerator = () => [{ lang: '' }, { lang: 'zh' }];
