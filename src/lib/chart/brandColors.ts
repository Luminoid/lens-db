// Stable color assignment for a legend grouping (brand by default, but any color-by axis).
// Colors are handed out by the grouping's stable order (see groupOrder), so the busiest groups
// get the most distinct hues and a given key keeps its color as filters narrow the view.
//
// This palette is tuned for the dark chart background and is shared by both themes. On the light
// chart background (#f6f8fa) roughly 13 of these 20 hues fall below the WCAG 1.4.11 3:1 non-text
// bar (the pastels/yellows worst: #f6bd16, #ffc14d, #61ddaa, #78d3f8 all ~1.5-1.6:1), so small
// markers in the default color-by-brand light view read faint. Group identity is still carried by
// the (high-contrast) legend + hover tooltip, so this is a known LOW. A curated light-mode
// categorical palette (selected per theme, mirroring CHART_THEME) is a v1.1 item: deferred over a
// naive darken-each because preserving 20-way distinguishability needs design, not just math.
// Brand-signature colors (Canon red, Nikon yellow, ...) are part of that same later pass.

export const PALETTE = [
  '#5b8ff9', '#61ddaa', '#f6bd16', '#7262fd', '#78d3f8',
  '#9661bc', '#f6903d', '#008685', '#f08bb4', '#ff5b5b',
  '#5ad8a6', '#5d7092', '#ff9d4d', '#269a99', '#6dc8ec',
  '#9270ca', '#ffc14d', '#4ecb73', '#e8684a', '#a0a7b4',
];

export const FALLBACK_COLOR = '#a0a7b4';

/** Maps each ordered group key to a palette color, cycling if there are more groups than colors. */
export function paletteMap(orderedKeys: string[]): Record<string, string> {
  return Object.fromEntries(orderedKeys.map((k, i) => [k, PALETTE[i % PALETTE.length]]));
}
