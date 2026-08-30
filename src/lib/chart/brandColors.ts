// Categorical color palettes for a legend grouping (brand by default, but any color-by axis).
// Colors are handed out by the grouping's stable order (see groupOrder), so the busiest groups
// get the most distinct hues and a given key keeps its color as filters narrow the view.
//
// One palette per UI theme (selected via CHART_THEME in chartTheme.ts). The dark palette is tuned
// for the #0e1116 chart background. The light palette uses darker, saturated tones that each clear
// the WCAG 1.4.11 3:1 non-text-contrast bar against the #f6f8fa light chart background (verified at
// authoring time with relative-luminance math: every entry >= 4.3:1), so brand markers stay legible in light
// mode instead of washing out. Both palettes are interleaved by hue family so adjacent groups
// (which take adjacent slots) stay distinguishable; identity is also carried by the legend + tooltip.

export const PALETTE_DARK = [
  '#5b8ff9', '#61ddaa', '#f6bd16', '#7262fd', '#78d3f8',
  '#9661bc', '#f6903d', '#008685', '#f08bb4', '#ff5b5b',
  '#5ad8a6', '#5d7092', '#ff9d4d', '#269a99', '#6dc8ec',
  '#9270ca', '#ffc14d', '#4ecb73', '#e8684a', '#a0a7b4',
];

export const PALETTE_LIGHT = [
  '#1f6feb', '#1a7f37', '#bc4c00', '#8250df', '#0a7ea4',
  '#cf222e', '#0f766e', '#bf3989', '#9a6700', '#3a5ccc',
  '#2c7d3f', '#a0511f', '#0969da', '#9a3f9c', '#b45309',
  '#1b7c83', '#7048c8', '#57606a', '#be185d', '#4d7c0f',
];

export const FALLBACK_DARK = '#a0a7b4';
export const FALLBACK_LIGHT = '#59636e'; // ~5.7:1 on #f6f8fa

/** Maps each ordered group key to a color from `palette`, cycling if there are more groups than colors. */
export function paletteMap(orderedKeys: string[], palette: string[]): Record<string, string> {
  return Object.fromEntries(orderedKeys.map((k, i) => [k, palette[i % palette.length]]));
}
