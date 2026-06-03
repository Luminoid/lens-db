import type { Handle } from '@sveltejs/kit';

// Set the document `<html lang>` per locale at prerender/SSR time so the static ZH pages actually
// report `zh-Hans` (and EN reports `en`) to crawlers and screen readers. The app.html template
// ships `lang="en"`; this rewrites it for `/zh` paths. Client-side language switches are handled
// separately by an $effect in the root +layout.svelte.
export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const lang = pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh-Hans' : 'en';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en"', `<html lang="${lang}"`),
  });
};
