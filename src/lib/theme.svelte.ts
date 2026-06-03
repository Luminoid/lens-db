// Module-level reactive theme state, mirroring the filter store pattern: a single shared $state that
// survives client-side navigation. The persistence layer is localStorage + the `data-theme`
// attribute on <html> (the latter drives the CSS palette in app.css and is set pre-paint by
// static/theme-init.js so there's no flash). This store only exists on the client; during SSR the
// value is the document default ('dark') and the chart it feeds is never painted server-side anyway.
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lensdb-theme';

function initialTheme(): Theme {
  if (!browser) return 'dark';
  // theme-init.js already resolved and applied the theme before hydration; trust the attribute.
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export const themeState = $state<{ value: Theme }>({ value: initialTheme() });

export function setTheme(theme: Theme): void {
  themeState.value = theme;
  if (!browser) return;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage blocked (private mode / disabled): the in-memory value still drives the UI */
  }
}

export function toggleTheme(): void {
  setTheme(themeState.value === 'dark' ? 'light' : 'dark');
}
