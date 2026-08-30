// 2D label packing for the "tag" chart view: every visible lens becomes a readable chip, none
// hidden, none overlapping. ECharts can't do this natively (verified against its source): its
// `moveOverlap:'shiftY'` collapses everything into one vertical column and bails *into* overlap when
// cramped, and `hideOverlap` drops the overflow. So we lay the tags out ourselves in pixel space and
// render them through a full-bleed `custom` series whose synthetic 1:1 axes map our pixel
// coordinates straight to the canvas (see chartOption.ts `buildTagChartOption`). The canvas grows
// tall enough that the greedy pass always finds room, so nothing is ever hidden (the page scrolls).
//
// All functions here are pure (text is measured off-screen, no DOM mutation), so the option builder
// stays testable and this module is safe to import during SSR (measurement falls back to an estimate
// when there is no document).
import { AXES, type AxisKey } from './axes';
import { focalLabel, apertureLabel, type Lens } from '../data/types';
import type { TagDetail } from '../filters/types';

/** Axes offered as the optional extra spec on a tag (focal/aperture are already in the base text). */
export const TAG_DETAIL_KEYS: AxisKey[] = [
  'price',
  'year',
  'weight',
  'length',
  'diameter',
  'filter',
  'minFocus',
  'magnification',
  'elements',
  'blades',
];

export const isTagDetail = (v: string): v is TagDetail =>
  v === 'none' || (TAG_DETAIL_KEYS as string[]).includes(v);

/**
 * Standard f-stop ladder. In bucket mode each lens snaps (by nearest log distance) to one of these,
 * so every lens of a given max aperture (a prime OR the wide end of a zoom) shares one f-stop row.
 */
export const APERTURE_STOPS = [0.95, 1.2, 1.4, 1.8, 2, 2.5, 2.8, 3.5, 4, 4.5, 5.6, 6.3, 8, 11, 16];

/** "Important" focal lengths used as X reference-axis ticks (values outside the visible range drop). */
export const FOCAL_TICKS = [8, 12, 14, 16, 20, 24, 28, 35, 50, 70, 85, 105, 135, 200, 300, 400, 600, 800];

/** Nearest standard f-stop to a value, by log distance (f-stops are geometric). */
function snapStop(v: number, stops: number[]): number {
  let best = stops[0];
  let bd = Infinity;
  for (const s of stops) {
    const d = Math.abs(Math.log(v) - Math.log(s));
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}

// ---- Tag text ------------------------------------------------------------------------------

/** Compact value + unit for the optional extra spec suffix. null when the lens has no value. */
function detailText(l: Lens, key: AxisKey): string | null {
  const v = AXES[key].wide(l);
  if (v == null) return null;
  switch (key) {
    case 'price':
      return `$${v.toLocaleString('en-US')}`;
    case 'weight':
      return `${v}g`;
    case 'length':
    case 'diameter':
    case 'filter':
      return `${v}mm`;
    case 'minFocus':
      return `${v}m`;
    case 'magnification':
      return `${v}×`;
    default:
      return `${v}`; // year, elements, blades
  }
}

/**
 * The chip label. Brand is shown only when the visible set spans more than one brand (otherwise it
 * is redundant given the color/legend). The line designation (G, GM, RF L, Art, ...) from `series`
 * is always shown when present. The full focal/aperture range lives here and in the tooltip. Brand is
 * localized for display via `brandLabel` (identity by default); model/series stay canonical.
 */
function tagText(
  l: Lens,
  opts: { multiBrand: boolean; detail: TagDetail; brandLabel?: (b: string) => string },
): string {
  const base = `${focalLabel(l)} ${apertureLabel(l)}`;
  const brand = opts.brandLabel ? opts.brandLabel(l.brand) : l.brand;
  let s = opts.multiBrand ? `${brand} ${base}` : base;
  if (l.series) s += ` ${l.series}`;
  if (opts.detail !== 'none') {
    const d = detailText(l, opts.detail);
    if (d) s += ` · ${d}`;
  }
  return s;
}

// ---- Text measurement (cached; SSR-safe) ---------------------------------------------------

export const TAG_FONT_SIZE = 11;
// Matches app.css --font-sans (no web font is shipped, so naming one here would render
// chart chips in a face the rest of the page never uses on machines that have it installed).
export const TAG_FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const TAG_FONT = `${TAG_FONT_SIZE}px ${TAG_FONT_FAMILY}`;
const PAD_X = 6;
const PAD_Y = 3;
const TAG_HEIGHT = TAG_FONT_SIZE + 2 * PAD_Y; // 17
// Breathing room added around each tag's rect during collision tests (not drawn).
const GAP_X = 6;
const GAP_Y = 4;

let measureCtx: CanvasRenderingContext2D | null | undefined;
const widthCache = new Map<string, number>();

function textWidth(text: string): number {
  const hit = widthCache.get(text);
  if (hit != null) return hit;
  if (measureCtx === undefined) {
    measureCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    if (measureCtx) measureCtx.font = TAG_FONT;
  }
  const w = measureCtx ? measureCtx.measureText(text).width : text.length * TAG_FONT_SIZE * 0.6;
  widthCache.set(text, w);
  return w;
}

// ---- Layout --------------------------------------------------------------------------------

export interface TagInput {
  lens: Lens;
  group: string;
  color: string;
}

export interface PlacedTag {
  lens: Lens;
  group: string;
  color: string;
  text: string;
  cx: number; // pixel centre, in [0, width] × [0, height]
  cy: number;
  w: number; // drawn chip box (no gap)
  h: number;
  pinned: boolean;
}

export interface TagLayout {
  placed: PlacedTag[];
  width: number;
  height: number;
  /** Data domains [min,max] of the visible set on the active X / Y axes, for the reference axes. */
  domainX: [number, number];
  domainY: [number, number];
  /** In bucket mode (aperture on Y): the f-stop rows + their band-centre cy, for the Y axis labels. */
  yBuckets?: { value: number; centerCy: number }[];
}

// The tag chart renders with the SVG renderer (see LensChart), which has no canvas pixel cap, so the
// canvas can grow as tall as the packing needs and the page scrolls. This guard only prevents an
// absurd runaway; realistic layouts are a few thousand px (a few hundred even when filtered).
const MAX_HEIGHT = 100000;
const MIN_HEIGHT = 360;
// Small inset within the content rect so tags don't touch the reference-axis lines. The legend and
// the axes themselves live in the grid margins (set in chartOption), not inside this packing area.
const PAD_TOP = 8;
/** Horizontal inset of the packed chips within the content rect; exported so the floating axis aligns. */
export const PAD_X_EDGE = 8;
const BUCKET_GAP = 10; // vertical gap between f-stop rows in bucket mode
const STEP = TAG_HEIGHT + GAP_Y; // ~21px vertical granularity for the relief search
const MAX_RING = 100;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
} // top-left + size (incl. gap)

const intersects = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Map a value to a 0..1 fraction along an axis (log or linear). Exported for the floating axis. */
export function frac(v: number, lo: number, hi: number, log: boolean): number {
  if (hi <= lo) return 0.5;
  if (log && lo > 0 && hi > 0) return (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));
  return (v - lo) / (hi - lo);
}

/**
 * Greedy 2D de-overlap. Each tag is seeded at its true (x, y) position, then nudged into the nearest
 * free slot by an expanding-ring search (down/up/right/left + diagonals): "stack horizontally or
 * vertically, whichever has room". Higher-priority tags (pinned first, then by the active Y value)
 * are placed first and keep their spot. If a tag can't fit within the search radius it drops below
 * everything placed so far, growing the canvas, so placement never fails and nothing is hidden.
 */
export function layoutTags(
  items: TagInput[],
  opts: {
    width: number;
    x: AxisKey;
    y: AxisKey;
    xLog: boolean;
    yLog: boolean;
    multiBrand: boolean;
    detail: TagDetail;
    /** Localizes the brand word in a chip (identity by default); model/series stay canonical. */
    brandLabel?: (b: string) => string;
    pins: Set<string>;
    /** When true (aperture on Y), reorganize tags into one discrete row per f-stop bucket. */
    bucketY?: boolean;
  },
): TagLayout {
  // Pack at the caller's exact pixel width so it matches the canvas 1:1 (the synthetic x-axis max is
  // this width). The low floor only guards absurd/zero widths; it stays below any real canvas width
  // so it never inflates the packing width above what is actually rendered.
  const W = Math.max(160, Math.floor(opts.width) || 800);
  const xDef = AXES[opts.x];
  const yDef = AXES[opts.y];

  if (items.length === 0) return { placed: [], width: W, height: MIN_HEIGHT, domainX: [0, 1], domainY: [0, 1] };

  // "Ranged" X (focal/aperture): some lens has tele != wide, so its tag draws as a bar spanning
  // [wide, tele] on X (e.g. a zoom's start..end focal). Scalar X has no span -> point chips.
  const spanX = items.some((it) => {
    const w = xDef.wide(it.lens);
    const tl = xDef.tele(it.lens);
    return w != null && tl != null && tl !== w;
  });
  const xWideOf = (l: Lens): number => xDef.wide(l)!;
  const xTeleOf = (l: Lens): number => (spanX ? (xDef.tele(l) ?? xDef.wide(l)!) : xDef.wide(l)!);

  // Domain over the visible set; for ranged X it must cover tele ends too so the longest bar fits.
  let xLo = Infinity;
  let xHi = -Infinity;
  let yLo = Infinity;
  let yHi = -Infinity;
  for (const it of items) {
    const xw = xWideOf(it.lens);
    const xt = xTeleOf(it.lens);
    const yv = yDef.wide(it.lens)!;
    if (Math.min(xw, xt) < xLo) xLo = Math.min(xw, xt);
    if (Math.max(xw, xt) > xHi) xHi = Math.max(xw, xt);
    if (yv < yLo) yLo = yv;
    if (yv > yHi) yHi = yv;
  }

  const innerW = Math.max(40, W - 2 * PAD_X_EDGE);

  // Measure each input; the priority sort differs per layout path below.
  const measured = items.map((it) => {
    const text = tagText(it.lens, { multiBrand: opts.multiBrand, detail: opts.detail, brandLabel: opts.brandLabel });
    return { ...it, text, w: Math.ceil(textWidth(text)) + 2 * PAD_X, h: TAG_HEIGHT, pinned: opts.pins.has(it.lens.id) };
  });
  type Tag = (typeof measured)[number];

  // Shared spatial hash + geometry helpers.
  const CELL = 64;
  const grid = new Map<string, Rect[]>();
  const insert = (r: Rect) => {
    const c0 = Math.floor(r.x / CELL);
    const c1 = Math.floor((r.x + r.w) / CELL);
    const r0 = Math.floor(r.y / CELL);
    const r1 = Math.floor((r.y + r.h) / CELL);
    for (let c = c0; c <= c1; c++)
      for (let rr = r0; rr <= r1; rr++) {
        const k = `${c},${rr}`;
        const arr = grid.get(k);
        if (arr) arr.push(r);
        else grid.set(k, [r]);
      }
  };
  const collides = (r: Rect): boolean => {
    const c0 = Math.floor(r.x / CELL);
    const c1 = Math.floor((r.x + r.w) / CELL);
    const r0 = Math.floor(r.y / CELL);
    const r1 = Math.floor((r.y + r.h) / CELL);
    for (let c = c0; c <= c1; c++)
      for (let rr = r0; rr <= r1; rr++) {
        const arr = grid.get(`${c},${rr}`);
        if (!arr) continue;
        for (const o of arr) if (intersects(r, o)) return true;
      }
    return false;
  };
  const clampX = (cx: number, halfW: number) => Math.min(W - halfW - 2, Math.max(halfW + 2, cx));
  const rectFor = (tg: { w: number; h: number }, cx: number, cy: number): Rect => ({
    x: cx - tg.w / 2 - GAP_X / 2,
    y: cy - tg.h / 2 - GAP_Y / 2,
    w: tg.w + GAP_X,
    h: tg.h + GAP_Y,
  });
  const fracX = (v: number) => PAD_X_EDGE + frac(v, xLo, xHi, opts.xLog) * innerW;

  // Bar geometry on X: the chip spans [wide, tele] in pixels, widened to fit its label. When the
  // label is wider than the span it stays centred on the span midpoint (still covering the range).
  // `left`/`right` are the DRAWN box edges (clamped, label-widened), which is what collides.
  const spanGeom = (tg: Tag): { left: number; right: number; w: number; cx: number } => {
    const a = fracX(xWideOf(tg.lens));
    const b = fracX(xTeleOf(tg.lens));
    const w = Math.max(tg.w, Math.abs(b - a));
    const cx = clampX((a + b) / 2, w / 2);
    return { left: cx - w / 2, right: cx + w / 2, w, cx };
  };

  const placed: PlacedTag[] = [];
  const record = (tg: Tag, cx: number, cy: number, w: number = tg.w) => {
    insert(rectFor({ w, h: tg.h }, cx, cy));
    placed.push({ lens: tg.lens, group: tg.group, color: tg.color, text: tg.text, cx, cy, w, h: tg.h, pinned: tg.pinned });
  };

  // ---- Bucketed rows (aperture on Y): one discrete f-stop row per bucket ---------------------
  // Every lens with the same snapped max aperture shares a row. Each tag is a bar spanning its X
  // range (a zoom's start..end focal; a prime is a short box). Within a row, bars are lane-packed:
  // sorted by left edge, each drops into the topmost lane it doesn't horizontally overlap (interval-
  // graph greedy -> minimal lanes, no overlap, X stays exact). Busy rows grow taller; nothing hides.
  if (opts.bucketY) {
    const byStop = new Map<number, Tag[]>();
    for (const tg of measured) {
      const stop = snapStop(yDef.wide(tg.lens)!, APERTURE_STOPS);
      const arr = byStop.get(stop);
      if (arr) arr.push(tg);
      else byStop.set(stop, [tg]);
    }
    const stops = [...byStop.keys()].sort((a, b) => a - b); // ascending f-number -> brightest at top
    const yBuckets: { value: number; centerCy: number }[] = [];
    const laneH = TAG_HEIGHT + GAP_Y;
    let bandTop = PAD_TOP;
    for (const stop of stops) {
      const bars = byStop
        .get(stop)!
        .map((tg) => ({ tg, ...spanGeom(tg) }))
        .sort((a, b) => a.left - b.left || (a.tg.lens.id < b.tg.lens.id ? -1 : 1));
      const laneRight: number[] = []; // rightmost occupied x (incl. gap) per lane
      for (const bar of bars) {
        let lane = 0;
        while (lane < laneRight.length && bar.left < laneRight[lane]) lane++;
        if (lane === laneRight.length) laneRight.push(bar.right + GAP_X);
        else laneRight[lane] = bar.right + GAP_X;
        record(bar.tg, bar.cx, bandTop + lane * laneH + TAG_HEIGHT / 2, bar.w);
      }
      const laneCount = Math.max(1, laneRight.length);
      const firstCenter = bandTop + TAG_HEIGHT / 2;
      const lastCenter = bandTop + (laneCount - 1) * laneH + TAG_HEIGHT / 2;
      yBuckets.push({ value: stop, centerCy: Math.round((firstCenter + lastCenter) / 2) });
      bandTop = lastCenter + TAG_HEIGHT / 2 + BUCKET_GAP;
    }
    return {
      placed,
      width: W,
      height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, bandTop + 8)),
      domainX: [xLo, xHi],
      domainY: [yLo, yHi],
      yBuckets,
    };
  }

  // ---- Continuous, ranged X (focal/aperture): bars at their true X, stacked vertically ----------
  // X encodes the lens's range, so a tag never moves horizontally; a collision pushes it straight
  // down (then up) to the nearest free slot, and otherwise below everything placed so far. The
  // canvas grows downward, so placement never fails and nothing is hidden.
  if (spanX) {
    const bars = [...measured].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const ay = yDef.wide(a.lens)!;
      const by = yDef.wide(b.lens)!;
      if (ay !== by) return by - ay;
      return a.lens.id < b.lens.id ? -1 : 1;
    });
    const estRows = Math.ceil(bars.length / Math.max(1, Math.floor(W / 120)));
    let H = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(estRows * STEP * 1.6) + PAD_TOP));
    const innerH = Math.max(40, H - PAD_TOP - 16);
    let maxBottom = PAD_TOP;
    for (const tg of bars) {
      const halfH = tg.h / 2;
      const { cx, w } = spanGeom(tg);
      const fyRaw = frac(yDef.wide(tg.lens)!, yLo, yHi, opts.yLog);
      const fy = yDef.inverse ? fyRaw : 1 - fyRaw; // small cy = top of canvas
      const idealY = PAD_TOP + fy * innerH;
      let cy = Math.max(halfH + PAD_TOP, idealY);
      let ok = !collides(rectFor({ w, h: tg.h }, cx, cy));
      for (let ring = 1; ring <= MAX_RING && !ok; ring++) {
        const d = ring * STEP;
        for (const ty of [idealY + d, idealY - d]) {
          const py = Math.max(halfH + PAD_TOP, ty);
          if (!collides(rectFor({ w, h: tg.h }, cx, py))) {
            cy = py;
            ok = true;
            break;
          }
        }
      }
      if (!ok) cy = maxBottom + halfH + GAP_Y;
      record(tg, cx, cy, w);
      maxBottom = Math.max(maxBottom, cy + halfH);
      if (cy + halfH + 16 > H) H = cy + halfH + 16;
    }
    return {
      placed,
      width: W,
      height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, maxBottom + 16)),
      domainX: [xLo, xHi],
      domainY: [yLo, yHi],
    };
  }

  // ---- Continuous free 2D packing (scalar X) ------------------------------------------------
  const tags = [...measured].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const ay = yDef.wide(a.lens)!;
    const by = yDef.wide(b.lens)!;
    if (ay !== by) return by - ay;
    return a.lens.id < b.lens.id ? -1 : 1;
  });

  // Initial height: rough grid packing, generously slacked so the relief search has vertical room.
  const avgW = tags.reduce((s, t) => s + t.w + GAP_X, 0) / tags.length;
  const cols = Math.max(1, Math.floor(W / Math.max(40, avgW)));
  const rows = Math.ceil(tags.length / cols);
  let H = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(rows * STEP * 1.6) + PAD_TOP));
  const innerH = Math.max(40, H - PAD_TOP - 16);

  const overflow: Tag[] = [];
  let maxBottom = PAD_TOP;

  // Pass 1: place each tag at (or near) its true position via the expanding-ring relief search;
  // collect the ones with no free slot nearby for the dense pass below.
  for (const tg of tags) {
    const halfW = tg.w / 2;
    const halfH = tg.h / 2;
    const fx = frac(xDef.wide(tg.lens)!, xLo, xHi, opts.xLog);
    const fyRaw = frac(yDef.wide(tg.lens)!, yLo, yHi, opts.yLog);
    const fy = yDef.inverse ? fyRaw : 1 - fyRaw; // small cy = top of canvas
    const idealX = PAD_X_EDGE + fx * innerW;
    const idealY = PAD_TOP + fy * innerH;

    let cx = clampX(idealX, halfW);
    let cy = Math.max(halfH + PAD_TOP, idealY);
    let ok = !collides(rectFor(tg, cx, cy));
    for (let ring = 1; ring <= MAX_RING && !ok; ring++) {
      const d = ring * STEP;
      const cands: [number, number][] = [
        [idealX, idealY + d],
        [idealX, idealY - d],
        [idealX + d, idealY],
        [idealX - d, idealY],
        [idealX + d, idealY + d],
        [idealX - d, idealY + d],
        [idealX + d, idealY - d],
        [idealX - d, idealY - d],
      ];
      for (const [tx, ty] of cands) {
        const px = clampX(tx, halfW);
        const py = Math.max(halfH + PAD_TOP, ty);
        if (!collides(rectFor(tg, px, py))) {
          cx = px;
          cy = py;
          ok = true;
          break;
        }
      }
    }
    if (!ok) {
      overflow.push(tg);
      continue;
    }
    record(tg, cx, cy);
    maxBottom = Math.max(maxBottom, cy + halfH);
    if (cy + halfH + 16 > H) H = cy + halfH + 16;
  }

  // Pass 2: row-pack the overflow densely below the placed band. It sits entirely below maxBottom
  // (so it cannot collide with band tags) and is laid out left-to-right wrapping by row (so it cannot
  // overlap itself). Nothing is ever dropped.
  if (overflow.length) {
    let fx = PAD_X_EDGE;
    let fy = maxBottom + GAP_Y + 8;
    let rowH = 0;
    for (const tg of overflow) {
      if (fx > PAD_X_EDGE && fx + tg.w > W - PAD_X_EDGE) {
        fx = PAD_X_EDGE;
        fy += rowH + GAP_Y;
        rowH = 0;
      }
      const cx = clampX(fx + tg.w / 2, tg.w / 2);
      const cy = fy + tg.h / 2;
      record(tg, cx, cy);
      fx += tg.w + GAP_X;
      rowH = Math.max(rowH, tg.h);
      maxBottom = Math.max(maxBottom, cy + tg.h / 2);
    }
  }

  return {
    placed,
    width: W,
    height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, maxBottom + 16)),
    domainX: [xLo, xHi],
    domainY: [yLo, yHi],
  };
}
