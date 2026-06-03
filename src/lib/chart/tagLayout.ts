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
export function snapStop(v: number, stops: number[]): number {
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
export function tagText(
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
export const TAG_FONT_FAMILY = "Inter, system-ui, -apple-system, sans-serif";
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
const PAD_X_EDGE = 8;
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

/** Map a value to a 0..1 fraction along an axis (log or linear). */
function frac(v: number, lo: number, hi: number, log: boolean): number {
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

  // Domain over the visible set's wide values.
  let xLo = Infinity;
  let xHi = -Infinity;
  let yLo = Infinity;
  let yHi = -Infinity;
  for (const it of items) {
    const xv = xDef.wide(it.lens)!;
    const yv = yDef.wide(it.lens)!;
    if (xv < xLo) xLo = xv;
    if (xv > xHi) xHi = xv;
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

  const placed: PlacedTag[] = [];
  const record = (tg: Tag, cx: number, cy: number) => {
    insert(rectFor(tg, cx, cy));
    placed.push({ lens: tg.lens, group: tg.group, color: tg.color, text: tg.text, cx, cy, w: tg.w, h: tg.h, pinned: tg.pinned });
  };

  // ---- Bucketed rows (aperture on Y): one discrete f-stop row per bucket ---------------------
  // Every lens with the same snapped max aperture shares a row, ordered left-to-right by the X spec
  // (focal). Rows stack brightest-first; within a row tags only ever move down/sideways, so a busy
  // row's band grows taller but never bleeds into the brighter row above. Nothing is hidden.
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
    let bandTop = PAD_TOP;
    for (const stop of stops) {
      const bucket = byStop.get(stop)!.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return xDef.wide(a.lens)! - xDef.wide(b.lens)! || (a.lens.id < b.lens.id ? -1 : 1);
      });
      let bandBottom = bandTop;
      for (const tg of bucket) {
        const halfW = tg.w / 2;
        const halfH = tg.h / 2;
        const sx = clampX(fracX(xDef.wide(tg.lens)!), halfW);
        const sy = bandTop + halfH;
        let cx = sx;
        let cy = sy;
        let ok = !collides(rectFor(tg, cx, cy));
        for (let ring = 1; ring <= MAX_RING && !ok; ring++) {
          const d = ring * STEP;
          const cands: [number, number][] = [
            [sx, sy + d],
            [sx - d, sy],
            [sx + d, sy],
            [sx - d, sy + d],
            [sx + d, sy + d],
          ];
          for (const [tx, ty] of cands) {
            const px = clampX(tx, halfW);
            const py = Math.max(sy, ty);
            if (!collides(rectFor(tg, px, py))) {
              cx = px;
              cy = py;
              ok = true;
              break;
            }
          }
        }
        if (!ok) {
          cx = sx;
          cy = bandBottom + halfH + GAP_Y;
        }
        record(tg, cx, cy);
        bandBottom = Math.max(bandBottom, cy + halfH);
      }
      yBuckets.push({ value: stop, centerCy: Math.round((bandTop + bandBottom) / 2) });
      bandTop = bandBottom + BUCKET_GAP;
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

  // ---- Continuous free 2D packing (default) -------------------------------------------------
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
