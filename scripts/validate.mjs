#!/usr/bin/env node
// Validates data/lenses.json against the LensDB contract (data/schema.json) + sanity rules.
// Dependency-free: the schema's structural facts (required fields, enums, numeric fields,
// allowed keys, mount set) are read straight from schema.json so the two can't drift.
// Usage: node scripts/validate.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lenses = JSON.parse(readFileSync(join(root, "data/lenses.json"), "utf8"));
const schema = JSON.parse(readFileSync(join(root, "data/schema.json"), "utf8"));
const CURRENT_YEAR = new Date().getFullYear();

// ---- derive the contract from schema.json (single source of truth) ----
const props = schema.properties;
const REQUIRED = schema.required;
const ALLOWED_KEYS = new Set(Object.keys(props));
const FORMATS = props.format.enum;
const TYPES = props.lensType.enum;
const MOUNTS = new Set(props.mounts.items.enum);
const typesOf = (p) => (Array.isArray(p.type) ? p.type : [p.type]);
const NUM = Object.entries(props)
  .filter(([, p]) => typesOf(p).some((t) => t === "number" || t === "integer"))
  .map(([k]) => k);

const errors = [];
const warns = [];
const seen = new Set();
const err = (id, m) => errors.push(`✗ ${id}: ${m}`);
const warn = (id, m) => warns.push(`! ${id}: ${m}`);

if (!Array.isArray(lenses)) {
  console.error("lenses.json must be an array");
  process.exit(1);
}

for (const l of lenses) {
  const id = l?.id ?? "(no id)";
  for (const k of REQUIRED) if (l[k] === undefined || l[k] === null) err(id, `missing required field "${k}"`);
  for (const k of Object.keys(l)) if (!ALLOWED_KEYS.has(k)) err(id, `unknown field "${k}" (not in schema)`);
  if (l.id) {
    if (seen.has(l.id)) err(id, "duplicate id");
    seen.add(l.id);
    if (!/^[a-z0-9-]+$/.test(l.id)) err(id, "id is not kebab-case");
  }
  if (l.format && !FORMATS.includes(l.format)) err(id, `bad format "${l.format}"`);
  if (l.lensType && !TYPES.includes(l.lensType)) err(id, `bad lensType "${l.lensType}"`);
  if (!Array.isArray(l.mounts) || l.mounts.length === 0) err(id, "mounts must be a non-empty array");
  else for (const m of l.mounts) if (!MOUNTS.has(m)) err(id, `unknown mount "${m}" (not in schema enum)`);
  for (const k of NUM) if (l[k] !== undefined && l[k] !== null && typeof l[k] !== "number") err(id, `${k} must be number|null`);

  if (typeof l.focalMin === "number" && typeof l.focalMax === "number") {
    if (l.focalMin > l.focalMax) err(id, `focalMin(${l.focalMin}) > focalMax(${l.focalMax})`);
    if (l.lensType === "Prime" && l.focalMin !== l.focalMax) err(id, "Prime with focalMin != focalMax");
    if (l.lensType === "Zoom" && l.focalMin === l.focalMax) warn(id, "Zoom with equal focal ends");
  }
  if (typeof l.apertureMaxWide === "number" && typeof l.apertureMaxTele === "number" && l.apertureMaxWide > l.apertureMaxTele)
    err(id, `apertureMaxWide(${l.apertureMaxWide}) > apertureMaxTele(${l.apertureMaxTele})`);
  if (typeof l.apertureMaxWide === "number" && typeof l.apertureMin === "number" && l.apertureMaxWide > l.apertureMin)
    err(id, `apertureMaxWide(${l.apertureMaxWide}) > apertureMin(${l.apertureMin})`);
  // MFT-format lens must list the Micro Four Thirds mount. (The reverse does NOT hold:
  // an APS-C/FF design legitimately over-covers MFT and may also ship in an MFT mount.)
  if (l.format === "MFT" && Array.isArray(l.mounts) && !l.mounts.includes("Micro Four Thirds"))
    warn(id, "MFT format but no 'Micro Four Thirds' mount");
  if (typeof l.year === "number" && (l.year < 1950 || l.year > CURRENT_YEAR + 1)) warn(id, `suspicious year ${l.year}`);
}

// Coverage report
const n = lenses.length;
const cov = (k) => `${Math.round((lenses.filter((l) => l[k] !== undefined && l[k] !== null).length / n) * 100)}%`;
const byBrand = {};
for (const l of lenses) byBrand[l.brand] = (byBrand[l.brand] || 0) + 1;

console.log(`\nLensDB: ${n} lenses`);
console.log("Coverage: " + ["priceUSD", "weight", "year", "filterThread", "minFocusDistance", "apertureBlades"].map((k) => `${k} ${cov(k)}`).join(" · "));
console.log("By brand: " + Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([b, c]) => `${b} ${c}`).join(" · "));
if (warns.length) console.log(`\n${warns.length} warnings:\n` + warns.slice(0, 40).join("\n") + (warns.length > 40 ? `\n…(+${warns.length - 40})` : ""));
if (errors.length) {
  console.error(`\n${errors.length} ERRORS:\n` + errors.join("\n"));
  process.exit(1);
}
console.log("\n✓ valid\n");
