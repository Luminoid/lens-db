// Custom two-finger touch roam for the dot chart.
//
// Why this exists: ECharts' inside dataZoom delegates touch to zrender's gesture manager, which reads
// ANY two-finger gesture as a pinch and maps it to zoom only. So a two-finger *parallel* move (a pan)
// produces no pan and, because finger spacing always wobbles, a jittery zoom instead, while also
// swallowing the page scroll. We keep the pinch-to-zoom gesture but fix the calculation: a controller
// that owns touch (and pen) gestures, separates the pinch (distance change) from the pan (centroid
// move) with a small zoom dead-zone, and recomputes the window from the gesture's start each frame so
// nothing drifts. Mouse and wheel are left untouched, so desktop drag-pan and wheel-zoom stay ECharts'.
//
// The math runs in pixel space against the plot rect (so it is uniform on screen for both linear and
// log axes), then maps the rect edges back to data values and dispatches a `dataZoom` action.

/** Linear/log interpolation from a pixel to a data value, given two known (pixel, value) anchors. */
function valueAt(px: number, p0: number, p1: number, v0: number, v1: number, log: boolean): number {
  if (p1 === p0) return v0;
  const t = (px - p0) / (p1 - p0); // may extrapolate beyond [0,1] when zooming/panning past the edges
  if (log && v0 > 0 && v1 > 0) return Math.exp(Math.log(v0) + t * (Math.log(v1) - Math.log(v0)));
  return v0 + t * (v1 - v0);
}

/**
 * New [min,max] data window for one axis. The two plot-rect edges (edge0/edge1, in px) end up showing
 * the values currently under the *source* pixels they map from after a zoom by `factor` about
 * `center` and a pan of `pan` px: source = center + (edge - center) / factor - pan. factor > 1 spreads
 * the fingers (zoom in); pan follows the fingers. Output is sorted so startValue <= endValue.
 */
function roamAxis(
  edge0: number,
  edge1: number,
  center: number,
  factor: number,
  pan: number,
  v0: number,
  v1: number,
  log: boolean,
): [number, number] {
  const s0 = center + (edge0 - center) / factor - pan;
  const s1 = center + (edge1 - center) / factor - pan;
  const a = valueAt(s0, edge0, edge1, v0, v1, log);
  const b = valueAt(s1, edge0, edge1, v0, v1, log);
  return a <= b ? [a, b] : [b, a];
}

interface GridInsets {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

interface Anchor {
  cx: number; // centroid of the active touch points, in chart pixels
  cy: number;
  dist: number; // pointer spread (0 for a single finger -> pan only)
  edgeL: number;
  edgeR: number;
  edgeT: number;
  edgeB: number;
  vx0: number; // data value at the left / right plot edges, captured at gesture start
  vx1: number;
  vy0: number; // data value at the top / bottom plot edges
  vy1: number;
  logX: boolean;
  logY: boolean;
}

// Zoom only engages once the finger spread changes by BOTH a fraction (ZOOM_DEADZONE) AND an absolute
// amount (ZOOM_MIN_PX) from the gesture start. The absolute floor is what makes a parallel two-finger
// move never jitter-zoom even when the fingers are close together (where a fraction alone is sub-pixel
// and would trip easily); an intentional pinch spreads well past both within the first few px.
const ZOOM_DEADZONE = 0.02;
const ZOOM_MIN_PX = 6;
const MIN_FACTOR = 0.05;
const MAX_FACTOR = 20;

/**
 * Attach the controller to the chart container. `getChart` returns the live ECharts instance (or
 * undefined). `grid` is the chart's grid insets (see DOTS_GRID). Returns a cleanup function.
 */
export function attachTouchRoam(
  el: HTMLElement,
  getChart: () => ReturnType<(typeof import('./echarts'))['default']['init']> | undefined,
  grid: GridInsets,
): () => void {
  const points = new Map<number, { x: number; y: number }>();
  let anchor: Anchor | null = null;
  let pending: { factor: number; panX: number; panY: number } | null = null;
  let raf = 0;

  const isTouch = (e: PointerEvent) => e.pointerType === 'touch' || e.pointerType === 'pen';

  // Re-anchor: snapshot the current window + finger geometry. Called whenever the active-pointer set
  // changes so adding or lifting a finger never jumps. Returns false if the chart isn't ready.
  function reanchor(): boolean {
    const chart = getChart();
    if (!chart || points.size === 0) {
      anchor = null;
      return false;
    }
    const rect = el.getBoundingClientRect();
    const w = chart.getWidth();
    const h = chart.getHeight();
    const edgeL = grid.left;
    const edgeR = w - grid.right;
    const edgeT = grid.top;
    const edgeB = h - grid.bottom;
    const tl = chart.convertFromPixel({ gridIndex: 0 }, [edgeL, edgeT]);
    const tr = chart.convertFromPixel({ gridIndex: 0 }, [edgeR, edgeT]);
    const bl = chart.convertFromPixel({ gridIndex: 0 }, [edgeL, edgeB]);
    if (!tl || !tr || !bl) return false;
    // getOption()'s ECharts type doesn't expose axis arrays; narrow to the two fields we read.
    const opt = chart.getOption() as { xAxis?: { type?: string }[]; yAxis?: { type?: string }[] };
    const logX = opt?.xAxis?.[0]?.type === 'log';
    const logY = opt?.yAxis?.[0]?.type === 'log';
    const c = centroidRel(rect);
    if ([tl[0], tr[0], tl[1], bl[1]].some((v) => !Number.isFinite(v))) return false;
    anchor = {
      cx: c.cx,
      cy: c.cy,
      dist: c.dist,
      edgeL,
      edgeR,
      edgeT,
      edgeB,
      vx0: tl[0],
      vx1: tr[0],
      vy0: tl[1],
      vy1: bl[1],
      logX,
      logY,
    };
    return true;
  }

  // Centroid in chart-local pixels (clientX/Y are viewport-relative; subtract the container origin).
  function centroidRel(rect: DOMRect): { cx: number; cy: number; dist: number } {
    const pts = [...points.values()];
    if (pts.length === 0) return { cx: 0, cy: 0, dist: 0 };
    const rel = pts.map((p) => ({ x: p.x - rect.left, y: p.y - rect.top }));
    if (rel.length === 1) return { cx: rel[0].x, cy: rel[0].y, dist: 0 };
    const dx = rel[0].x - rel[1].x;
    const dy = rel[0].y - rel[1].y;
    return { cx: (rel[0].x + rel[1].x) / 2, cy: (rel[0].y + rel[1].y) / 2, dist: Math.hypot(dx, dy) };
  }

  function apply() {
    raf = 0;
    const chart = getChart();
    if (!chart || !anchor || !pending) return;
    const { factor, panX, panY } = pending;
    const xr = roamAxis(anchor.edgeL, anchor.edgeR, anchor.cx, factor, panX, anchor.vx0, anchor.vx1, anchor.logX);
    const yr = roamAxis(anchor.edgeT, anchor.edgeB, anchor.cy, factor, panY, anchor.vy0, anchor.vy1, anchor.logY);
    if ([...xr, ...yr].some((v) => !Number.isFinite(v))) return;
    chart.dispatchAction({
      type: 'dataZoom',
      batch: [
        { xAxisIndex: 0, startValue: xr[0], endValue: xr[1] },
        { yAxisIndex: 0, startValue: yr[0], endValue: yr[1] },
      ],
    });
  }

  function onDown(e: PointerEvent) {
    if (!isTouch(e)) return; // leave mouse to ECharts (desktop drag-pan + wheel-zoom unchanged)
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    reanchor();
    // Once a touch gesture starts, own it: stop the event reaching zrender (no double pinch) and the
    // browser (no page scroll/zoom under the chart).
    e.stopPropagation();
    e.preventDefault();
  }

  function onMove(e: PointerEvent) {
    if (!isTouch(e) || !points.has(e.pointerId)) return;
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.stopPropagation();
    e.preventDefault();
    if (!anchor) return;
    const rect = el.getBoundingClientRect();
    const c = centroidRel(rect);
    let factor = anchor.dist > 0 && c.dist > 0 ? c.dist / anchor.dist : 1;
    // Parallel two-finger move -> pan, no zoom: suppress unless the spread changed by both a fraction
    // and an absolute pixel amount from the gesture start.
    const spreadDelta = c.dist - anchor.dist;
    if (Math.abs(factor - 1) < ZOOM_DEADZONE || Math.abs(spreadDelta) < ZOOM_MIN_PX) factor = 1;
    factor = Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, factor));
    pending = { factor, panX: c.cx - anchor.cx, panY: c.cy - anchor.cy };
    if (!raf) raf = requestAnimationFrame(apply);
  }

  function onUp(e: PointerEvent) {
    if (!isTouch(e) || !points.has(e.pointerId)) return;
    points.delete(e.pointerId);
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    e.stopPropagation();
    if (points.size >= 1) reanchor();
    else {
      anchor = null;
      pending = null;
    }
  }

  const opts = { capture: true } as const;
  el.addEventListener('pointerdown', onDown, opts);
  el.addEventListener('pointermove', onMove, opts);
  el.addEventListener('pointerup', onUp, opts);
  el.addEventListener('pointercancel', onUp, opts);
  const prevTouchAction = el.style.touchAction;
  el.style.touchAction = 'none';

  return () => {
    el.removeEventListener('pointerdown', onDown, opts);
    el.removeEventListener('pointermove', onMove, opts);
    el.removeEventListener('pointerup', onUp, opts);
    el.removeEventListener('pointercancel', onUp, opts);
    el.style.touchAction = prevTouchAction;
    if (raf) cancelAnimationFrame(raf);
    points.clear();
    anchor = null;
    pending = null;
  };
}
