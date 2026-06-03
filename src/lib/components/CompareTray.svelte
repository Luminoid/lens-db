<script lang="ts">
  // Shows the pinned lenses as removable chips with a link to the /compare table. Pins live in the
  // shared filter store; the Compare link carries ?pin= so it also works on a fresh load / new tab.
  import { filters, togglePin, clearPins, MAX_PINS } from '$lib/filters/store.svelte';
  import { lensById } from '$lib/data/lenses';
  import { t, tBrand, localePath, type Locale } from '$lib/i18n/translations';

  let { locale }: { locale: Locale } = $props();

  const pinned = $derived(filters.pins.map((id) => lensById.get(id)).filter((l) => l != null));
  const compareHref = $derived(`${localePath(locale, '/compare/')}?pin=${filters.pins.join(',')}`);
</script>

{#if pinned.length > 0}
  <div
    class="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3"
  >
    <span class="text-xs font-medium text-[var(--color-text-muted)]">
      {t(locale, 'tray.count', { n: pinned.length, max: MAX_PINS })}
    </span>
    <ul class="flex flex-wrap gap-1.5">
      {#each pinned as l (l.id)}
        <li
          class="flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/15 py-1 pr-1 pl-2.5 text-xs"
        >
          <span>{tBrand(locale, l.brand)} {l.model}</span>
          <button
            type="button"
            class="grid size-4 place-items-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            aria-label={t(locale, 'tray.remove', { name: `${tBrand(locale, l.brand)} ${l.model}` })}
            onclick={() => togglePin(l.id)}>×</button
          >
        </li>
      {/each}
    </ul>
    <div class="ml-auto flex items-center gap-3">
      <button type="button" class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]" onclick={clearPins}>
        {t(locale, 'tray.clear')}
      </button>
      <a
        href={compareHref}
        class="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]"
      >
        {t(locale, 'tray.compare')}
      </a>
    </div>
  </div>
{/if}
