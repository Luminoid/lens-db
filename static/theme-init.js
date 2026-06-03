// Runs synchronously in <head> before first paint to set the theme, so there is no flash of the
// wrong palette. External (not inline) so a strict `script-src 'self'` CSP needs no hash. Resolution
// order: an explicit saved choice, else the OS preference, else dark (the document default).
(function () {
  try {
    var saved = localStorage.getItem('lensdb-theme');
    var theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    /* localStorage/matchMedia unavailable: keep the document's default data-theme="dark". */
  }
})();
