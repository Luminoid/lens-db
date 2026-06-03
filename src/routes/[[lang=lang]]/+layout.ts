import { getLocale, type Locale } from '$lib/i18n/translations';
import type { LayoutLoad } from './$types';

// Resolve the locale from the optional `[[lang=lang]]` path segment and expose it to every page
// and component under this group via `data.locale`. Runs during prerender too, so each EN/ZH page
// is server-rendered in its own language.
export const load: LayoutLoad = ({ params }) => {
  const locale: Locale = getLocale(params.lang);
  return { locale };
};
