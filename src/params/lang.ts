import type { ParamMatcher } from '@sveltejs/kit';

// Optional `[[lang=lang]]` route param: only `zh` is a real prefix; an empty value means EN at the
// bare path. Anything else (e.g. `/lens/...` where `lens` would otherwise be read as a lang) is
// rejected so it falls through to the correct route.
export const match: ParamMatcher = (param) => param === 'zh';
