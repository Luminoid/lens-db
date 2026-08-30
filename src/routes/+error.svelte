<script lang="ts">
  // Root error boundary, also reached by the static 404.html fallback for any unknown path. Styled
  // to match the site (the root layout imports app.css). Locale isn't in `data` here, so it's derived
  // from the path: `/zh` or `/zh/...` is ZH, everything else EN.
  import { page } from '$app/state';
  import { t, localePath, type Locale } from '$lib/i18n/translations';

  const locale = $derived<Locale>(
    page.url.pathname === '/zh' || page.url.pathname.startsWith('/zh/') ? 'zh' : 'en',
  );
  const is404 = $derived(page.status === 404);
  const title = $derived(t(locale, is404 ? 'error.title404' : 'error.titleGeneric'));
  const heading = $derived(t(locale, is404 ? 'error.heading404' : 'error.headingGeneric'));
  const lead = $derived(t(locale, is404 ? 'error.lead404' : 'error.leadGeneric'));

  // Keep <html lang> correct for the client-rendered error/404 (the static shell ships lang="en").
  $effect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- This boundary renders under the ROOT layout (no site chrome), so it carries its own minimal
     landmarks: a banner with the wordmark home link and a labeled main. -->
<header class="mx-auto flex max-w-7xl items-center justify-between px-4 pt-4">
  <nav aria-label={t(locale, 'a11y.siteNav')}>
    <a
      href={localePath(locale, '/')}
      class="text-sm font-semibold tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent)]"
    >
      LensDB
    </a>
  </nav>
</header>

<main
  id="main-content"
  tabindex="-1"
  class="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center"
>
  <p class="font-mono text-5xl font-semibold text-[var(--color-accent)]">{page.status}</p>
  <h1 class="mt-4 text-2xl font-semibold tracking-tight">{heading}</h1>
  <p class="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">{lead}</p>
  <a
    href={localePath(locale, '/')}
    class="mt-6 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]"
  >
    {t(locale, 'compare.back')}
  </a>
</main>
