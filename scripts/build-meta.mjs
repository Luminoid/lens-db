#!/usr/bin/env node
// Regenerates data/meta.json (facets, counts, ranges, coverage) from data/lenses.json.
// Dependency-free. Usage: node scripts/build-meta.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lenses = JSON.parse(readFileSync(join(root, "data/lenses.json"), "utf8"));
const n = lenses.length;

const tally = (key, mapFn = (l) => l[key]) => {
  const m = {};
  for (const l of lenses) {
    const v = mapFn(l);
    if (Array.isArray(v)) v.forEach((x) => (m[x] = (m[x] || 0) + 1));
    else if (v !== undefined && v !== null) m[v] = (m[v] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]));
};
const range = (key) => {
  const vals = lenses.map((l) => l[key]).filter((v) => typeof v === "number");
  return vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
};

const NUMERIC_AXES = ["focalMin", "focalMax", "apertureMaxWide", "apertureMaxTele", "apertureMin",
  "weight", "length", "diameter", "filterThread", "minFocusDistance", "maxMagnification",
  "elements", "groups", "apertureBlades", "priceUSD", "priceMSRPUSD", "year"];
const coverage = {};
for (const k of [...NUMERIC_AXES, "stabilization", "weatherSealed", "autofocus"])
  coverage[k] = Math.round((lenses.filter((l) => l[k] !== undefined && l[k] !== null).length / n) * 100);

// Preserve the prior lastPriceCheck unless this run is explicitly a price refresh.
let lastPriceCheck = new Date().toISOString().slice(0, 10);
try {
  const prev = JSON.parse(readFileSync(join(root, "data/meta.json"), "utf8"));
  if (prev.lastPriceCheck && !process.argv.includes("--price-check")) lastPriceCheck = prev.lastPriceCheck;
} catch { /* first run */ }

const meta = {
  generatedAt: new Date().toISOString().slice(0, 10),
  lastPriceCheck,
  count: n,
  scope: "Mirrorless, current + recent (~2014 onward), plus iconic rangefinder and classic primes adaptable to mirrorless. First- and third-party. Full Frame, APS-C, MFT.",
  brands: tally("brand"),
  mounts: tally("mounts"),
  formats: tally("format"),
  lensTypes: tally("lensType"),
  focusCount: {
    autofocus: lenses.filter((l) => l.autofocus === true).length,
    manualFocus: lenses.filter((l) => l.autofocus === false).length,
  },
  apertureProfile: {
    variable: lenses.filter((l) => l.lensType === "Zoom" && l.apertureMaxTele != null && l.apertureMaxWide !== l.apertureMaxTele).length,
    constant: lenses.filter((l) => l.lensType === "Zoom").length
      - lenses.filter((l) => l.lensType === "Zoom" && l.apertureMaxTele != null && l.apertureMaxWide !== l.apertureMaxTele).length,
  },
  series: tally("series"),
  focalRange: range("focalMin"),
  apertureRange: [Math.min(...lenses.map((l) => l.apertureMaxWide).filter(Number.isFinite)),
    Math.max(...lenses.map((l) => l.apertureMin ?? l.apertureMaxTele ?? l.apertureMaxWide).filter(Number.isFinite))],
  // Extent of MAX aperture only (the aperture slider's domain); precomputed so the filter store
  // doesn't need the lens array at runtime.
  apertureMaxRange: [Math.min(...lenses.map((l) => l.apertureMaxWide).filter(Number.isFinite)),
    Math.max(...lenses.map((l) => l.apertureMaxTele ?? l.apertureMaxWide).filter(Number.isFinite))],
  priceRange: range("priceUSD"),
  weightRange: range("weight"),
  yearRange: range("year"),
  numericAxes: NUMERIC_AXES,
  fieldCoverage: coverage,
  sourcesNote: "Per-segment provenance and verification notes in sources.md. Specs machine-assembled, then web-verified per brand against manufacturer pages, B&H, and DPReview. Per-field nulls mean not reliably sourced, never a guess. Samyang V-AF entries store T-stops in the aperture fields (cine lenses), so they read marginally brighter than their f-number on the aperture axis.",
};
writeFileSync(join(root, "data/meta.json"), JSON.stringify(meta, null, 2) + "\n");
console.log(`Wrote data/meta.json: ${n} lenses, ${Object.keys(meta.brands).length} brands.`);
console.log("Brands: " + Object.entries(meta.brands).map(([b, c]) => `${b} ${c}`).join(" · "));
