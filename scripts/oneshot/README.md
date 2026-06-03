# One-shot scripts (archived)

Scripts here ran **once** to seed the database and are kept only for provenance. They are not
part of the maintenance loop and must not be re-run against the current `data/lenses.json`.

## `wf-verify-expand.mjs`

The fan-out workflow that web-verified the original 13 brands and gathered the 7 third-party
brands added later (Viltrox, TTArtisan, Laowa, 7Artisans, Tokina, Yongnuo, Meike). Run via the
Workflow tool, not Node directly.

**Do not re-run as-is.** It expects per-brand audit inputs at `data/_audit/<brand>.json` (scratch
files that were removed after the run), and the live database has since been hand-corrected beyond
what this workflow produces (147 spec corrections + manual merges). A fresh release-refresh should
start from a new audit export, not from this script's old inputs. See the main
[README](../../README.md) (Deploy & maintenance) for the update flow.

The durable maintenance scripts are one level up: `scripts/validate.mjs` and `scripts/build-meta.mjs`.
