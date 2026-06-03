<script lang="ts">
  // Toggles EN <-> ZH by swapping the `/zh` path prefix while preserving the rest of the path AND
  // the query string (so the chart's filter/axis state survives a language switch). Uses
  // `replaceState` so the back button returns to the previous page, not the other-language twin.
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { t, switchLocalePath, type Locale } from '$lib/i18n/translations';

  let { locale }: { locale: Locale } = $props();

  // href is path-only: `page.url.search` is not readable during prerender, and a prerendered page's
  // query is not part of its identity anyway. The live query (the chart's filter state) is appended
  // at click time from `location.search`, which is always available on the client.
  const target = $derived(switchLocalePath(page.url.pathname));

  function switchLang(e: MouseEvent) {
    e.preventDefault();
    goto(switchLocalePath(location.pathname) + location.search, { replaceState: true });
  }
</script>

<a
  href={target}
  onclick={switchLang}
  aria-label={t(locale, 'lang.aria')}
  class="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
>
  {t(locale, 'lang.switch')}
</a>
