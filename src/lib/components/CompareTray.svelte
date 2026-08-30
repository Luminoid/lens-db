<script lang="ts">
  // The compare entry bar: pinned lenses as removable chips plus the persistent link into the
  // /compare table. Always rendered (even with nothing pinned) so it is a stable entry point that
  // sits above the chart. Pins live in the shared filter store; the Compare link carries ?pin= so
  // it also works on a fresh load / new tab.
  import { filters, togglePin, clearPins, MAX_PINS } from '$lib/filters/store.svelte';
  import { lensById } from '$lib/data/lenses';
  import { t, tBrand, localePath, type Locale } from '$lib/i18n/translations';

  let { locale }: { locale: Locale } = $props();

  const pinned = $derived(filters.pins.map((id) => lensById.get(id)).filter((l) => l != null));
  const compareHref = $derived(
    filters.pins.length
      ? `${localePath(locale, '/compare/')}?pin=${filters.pins.join(',')}`
      : localePath(locale, '/compare/'),
  );
</script>

<div
  class="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3"
>
  {#if pinned.length > 0}
    <span class="text-xs font-medium text-[var(--color-text-muted)]">
      {t(locale, 'tray.count', { n: pinned.length, max: MAX_PINS })}
    </span>
    <ul class="flex flex-wrap gap-1.5">
      {#each pinned as l (l.id)}
        <li
          class="flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/15 py-1 pr-1 pl-2.5 text-xs"
        >
          <span>{tBrand(locale, l.brand)} {l.model}</span>
          <!-- size-6 with negative vertical margin: a >=24px hit target (WCAG 2.5.8) that doesn't
               inflate the chip's visual height. -->
          <button
            type="button"
            class="-my-1 grid size-6 place-items-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
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
  {:else}
    <span class="text-xs font-medium text-[var(--color-text-muted)]">{t(locale, 'tray.heading')}</span>
    <span class="text-xs text-[var(--color-text-muted)]">{t(locale, 'tray.empty')}</span>
    <a
      href={compareHref}
      class="ml-auto rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
    >
      {t(locale, 'tray.compare')}
    </a>
  {/if}
</div>
