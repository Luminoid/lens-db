<script lang="ts">
  // Dark/light toggle. The palette itself is swapped via the `data-theme` attribute (set by the
  // theme store, applied pre-paint by static/theme-init.js); this control just flips it and shows
  // the icon/label for the *target* theme (sun = "go light" while dark, moon = "go dark" while light).
  import { themeState, toggleTheme } from '$lib/theme.svelte';
  import { t, type Locale } from '$lib/i18n/translations';

  let { locale }: { locale: Locale } = $props();

  const goingToLight = $derived(themeState.value === 'dark');
  const label = $derived(t(locale, goingToLight ? 'theme.toLight' : 'theme.toDark'));
</script>

<button
  type="button"
  onclick={toggleTheme}
  aria-label={label}
  title={label}
  class="grid h-7 w-7 place-items-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
>
  {#if goingToLight}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  {/if}
</button>
