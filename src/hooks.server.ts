import type { Handle } from '@sveltejs/kit';

// Set the document `<html lang>` per locale at prerender/SSR time so the static ZH pages actually
// report `zh-Hans` (and EN reports `en`) to crawlers and screen readers. The app.html template
// ships `lang="en"`; this rewrites it for `/zh` paths (regex-matched so a template reformat cannot
// silently ship ZH pages as `lang="en"` — the throw fails the prerender instead). Client-side
// language switches are handled separately by an $effect in the root +layout.svelte.
//
// The same transform gives the SPA fallback shell (build/404.html) a static <title> and a robots
// noindex: the shell is the only page rendered with an empty head, and without this a no-JS 404
// is a titleless blank document (WCAG 2.4.2). Prerendered pages all carry their own <title>, so
// the guard never fires for them.
export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const lang = pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh-Hans' : 'en';
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      let out = html;
      if (lang !== 'en' && /<html[^>]*\blang="en"/.test(out)) {
        out = out.replace(/(<html[^>]*\blang=")en(")/, `$1${lang}$2`);
        if (!out.includes(`lang="${lang}"`)) {
          throw new Error('hooks.server.ts: <html lang> rewrite failed; check src/app.html');
        }
      }
      if (out.includes('<head>') && out.includes('</head>') && !out.includes('<title')) {
        out = out.replace(
          '</head>',
          '<title>LensDB</title>\n\t\t<meta name="robots" content="noindex" />\n\t</head>',
        );
      }
      return out;
    },
  });
};
