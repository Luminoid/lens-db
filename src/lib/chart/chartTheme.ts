// ECharts color palette per UI theme. ECharts paints to a canvas, so its colors can't come from CSS
// custom properties (the canvas doesn't inherit the cascade); they're resolved here from the active
// theme and threaded into the option builder. Values mirror the semantic palette in app.css so the
// chart chrome matches the surrounding page in both themes. Categorical brand colors (brandColors.ts)
// are theme-independent for now; refining them for light-mode contrast is a v1.1 item.
import type { Theme } from '$lib/theme.svelte';

export interface ChartTheme {
  axisName: string; // axis title + tick label text (muted)
  axisLine: string;
  splitLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string; // tooltip row labels
  tooltipSecondary: string; // tooltip focal/aperture subtitle
  legendText: string;
  legendInactive: string; // toggled-off legend item
  accent: string; // pin ring + detail locator accent point
  faint: string; // detail locator "all other lenses" dots
}

const dark: ChartTheme = {
  axisName: '#8b949e',
  axisLine: '#2a313c',
  splitLine: '#1a2029',
  tooltipBg: '#161b22',
  tooltipBorder: '#2a313c',
  tooltipText: '#e6edf3',
  tooltipMuted: '#8b949e',
  tooltipSecondary: '#b8c0c9',
  legendText: '#b8c0c9',
  legendInactive: '#3a414c',
  accent: '#4dd0c4',
  faint: '#3a414c',
};

const light: ChartTheme = {
  axisName: '#656d76',
  axisLine: '#d0d7de',
  splitLine: '#eaeef2',
  tooltipBg: '#ffffff',
  tooltipBorder: '#d0d7de',
  tooltipText: '#1f2328',
  tooltipMuted: '#656d76',
  tooltipSecondary: '#424a53',
  legendText: '#424a53',
  legendInactive: '#b0b8c0',
  accent: '#0f766e',
  faint: '#c4ccd4',
};

export const CHART_THEME: Record<Theme, ChartTheme> = { dark, light };
