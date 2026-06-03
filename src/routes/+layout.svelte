<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { filters } from '$lib/filters/store.svelte';
  import { applyUrlToFilters } from '$lib/filters/url';

  // Hydrate the shared store from the URL once on the client, so a shared link reproduces its view
  // regardless of entry route (the chart or /compare). No-op during prerender. Filters live in the
  // query string, independent of the locale path prefix, so this is locale-agnostic.
  if (browser) applyUrlToFilters(filters, location.search);

  let { children } = $props();

  // The prerendered HTML gets its `lang` from hooks.server.ts; this keeps it correct across
  // client-side language switches, which swap the route without reloading the document.
  $effect(() => {
    const locale = page.data?.locale;
    if (locale) document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : 'en';
  });
</script>

{@render children()}
