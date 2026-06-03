<script lang="ts">
  // Locale-group layout: a slim global header (wordmark home link + language switch) above every
  // page. `locale` comes from the layout load (params.lang), available during SSR/prerender, and
  // is passed down to each page via the merged `data` prop.
  import LangSwitch from '$lib/components/LangSwitch.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { localePath, t, type Locale } from '$lib/i18n/translations';

  let { data, children } = $props();
  const locale = $derived(data.locale as Locale);

  // Baked at prerender time (build year); the copyright line is about the site, not the data.
  const year = new Date().getFullYear();
</script>

<!-- Skip link: first focusable element, visible only when focused, jumps past the header to the
     page's <main id="main-content">. -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-[var(--color-border)] focus:bg-[var(--color-bg-elevated)] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-text)]"
>
  {t(locale, 'a11y.skipToContent')}
</a>

<header class="mx-auto flex max-w-7xl items-center justify-between px-4 pt-4">
  <nav aria-label={t(locale, 'a11y.siteNav')}>
    <a
      href={localePath(locale, '/')}
      class="text-sm font-semibold tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent)]"
    >
      LensDB
    </a>
  </nav>
  <div class="flex items-center gap-2">
    <ThemeToggle {locale} />
    <LangSwitch {locale} />
  </div>
</header>

{@render children()}

<footer class="mx-auto max-w-7xl px-4 pb-6 pt-4 text-xs text-[var(--color-text-muted)]">
  <div
    class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] pt-4"
  >
    <span>{t(locale, 'footer.copyright', { year })}</span>
    <span aria-hidden="true">·</span>
    <a
      href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:text-[var(--color-text)]">CC BY-NC-SA 4.0</a
    >
    <span aria-hidden="true">·</span>
    <a href={localePath(locale, '/methodology/')} class="hover:text-[var(--color-text)]"
      >{t(locale, 'footer.methodology')}</a
    >
  </div>
</footer>
