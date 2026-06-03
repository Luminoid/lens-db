// Tree-shaken ECharts entry point.
//
// Importing the full `echarts` package pulls in every chart type and component (~1 MB / ~337 KB
// gzip). LensDB only ever uses the custom + scatter series, the grid / tooltip / legend / inside
// dataZoom components, and both renderers (canvas for the dot chart, svg for the tall tag chart),
// so we register exactly those via `echarts/core` and re-export the namespace. LensChart.svelte
// dynamic-imports this module (browser-only) instead of `echarts`, roughly halving the chart payload.
//
// If a new option key is introduced (a markLine, visualMap, a category axis on a different chart,
// etc.), its component must be added to the `use([...])` list below or it will silently no-op at
// runtime (ECharts does not throw for an unregistered component).
import * as echarts from 'echarts/core';
import { CustomChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomInsideComponent,
} from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

echarts.use([
  CustomChart, // dot/segment chart + tag chips
  ScatterChart, // lens-detail "where it sits" locator
  GridComponent, // cartesian value + log axes
  TooltipComponent,
  LegendComponent, // includes the scrollable legend (type: 'scroll')
  DataZoomInsideComponent, // inside dataZoom (touch/wheel roam on the dot chart)
  CanvasRenderer,
  SVGRenderer,
]);

export default echarts;
