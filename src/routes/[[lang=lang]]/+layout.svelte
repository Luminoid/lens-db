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

<header class="mx-auto flex max-w-7xl items-center justify-between px-4 pt-4 print:hidden">
  <nav aria-label={t(locale, 'a11y.siteNav')}>
    <a
      href={localePath(locale, '/')}
      class="text-sm font-semibold tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent)]"
    >
      LensDB
    </a>
  </nav>
  <div class="flex items-center gap-2">
    <a
      href="https://github.com/Luminoid/lens-db"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(locale, 'footer.github')}
      title={t(locale, 'footer.github')}
      class="grid h-7 w-7 place-items-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.81 0-1.28.47-2.33 1.24-3.15-.12-.3-.54-1.5.12-3.13 0 0 1.01-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.29-1.52 3.3-1.2 3.3-1.2.66 1.63.24 2.83.12 3.13.77.82 1.24 1.87 1.24 3.15 0 4.51-2.81 5.51-5.49 5.8.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.22.68.83.56C20.56 21.92 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z"
        />
      </svg>
    </a>
    <ThemeToggle {locale} />
    <LangSwitch {locale} />
  </div>
</header>

{@render children()}

<footer class="mx-auto max-w-7xl px-4 pb-6 pt-4 text-xs text-[var(--color-text-muted)] print:hidden">
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
