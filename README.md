# LensDB

Interactive camera-lens comparison chart for modern mirrorless systems: plot every lens on a
configurable 2-axis graph (focal length × aperture by default), filter by brand / mount / format,
and compare specs side by side.

Target domain **lens.luminoid.dev** · part of the Lumi workspace.

## Status

- [x] Data schema: [`data/schema.json`](data/schema.json)
- [x] Lens database: [`data/lenses.json`](data/lenses.json) · **680 lenses**, 20 brands
- [x] Validator + facets: [`scripts/validate.mjs`](scripts/validate.mjs), [`data/meta.json`](data/meta.json), [`data/sources.md`](data/sources.md)
- [x] MVP chart (SvelteKit 5 + Tailwind 4 + ECharts): focal×aperture, zoom-as-segment, brand legend, tooltip. `npm install && npm run dev`
- [x] Filters + axis pickers + shareable URL state: 12-spec X/Y axes (per-axis log/linear), color-by, faceted filters, compact round-tripping URLs
- [x] Compare + detail pages: click-to-pin tray, `/compare` (spec table, best-in-row, CSV, `?pin=` shareable), prerendered `/lens/[id]` (specs, locator chart, similar lenses)
- [x] EN/ZH i18n: `[[lang=lang]]` routing (EN at `/`, ZH at `/zh/`), prerendered per locale (680×2 lens pages), `t()` dictionary, locale-prefixed links, language switch that keeps filter state, per-locale `<html lang>` / hreflang / canonical / OG
- [x] Dark/light theme toggle: FOUC-free pre-paint resolver ([`static/theme-init.js`](static/theme-init.js)), runtime `[data-theme]` palette, themed ECharts that re-colors on switch ([`src/lib/chart/chartTheme.ts`](src/lib/chart/chartTheme.ts)), WCAG-AA light UI palette plus a per-theme categorical chart palette ([`src/lib/chart/brandColors.ts`](src/lib/chart/brandColors.ts)) whose light variant clears the 3:1 non-text-contrast bar, `prefers-reduced-motion` guard
- [x] Tags / Dots view toggle: tag view renders every lens as a labelled chip (none hidden, none overlapping) via a custom 2D de-overlap packer ([`src/lib/chart/tagLayout.ts`](src/lib/chart/tagLayout.ts)) on an arbitrarily tall scrollable SVG canvas, with standard focal-length ticks on X and discrete f-stop rows on Y (every lens bucketed by its max aperture); dynamic tag text (brand when multi-brand + focal/aperture + series badge + optional spec); URL-persisted (`?view=tags&tag=price`)
- [x] Launch polish: off-canvas mobile filter drawer (focus-managed, Escape/backdrop close); skip-to-content link + ARIA radiogroup keyboard nav; accessible chart data-table fallback (collapsed, reachable with no JS); themed 404 / error page; prerendered EN/ZH methodology page linked from a global footer; OG preview image + favicons (SVG + 16/32 + apple-touch); `robots.txt` + a prerendered `sitemap.xml` (one entry per page per locale, with `hreflang` alternates); tree-shaken ECharts ([`src/lib/chart/echarts.ts`](src/lib/chart/echarts.ts), only the series/components used); Cloudflare security headers ([`static/_headers`](static/_headers)) + a meta CSP in hash mode (script-src `'self'` + the bootstrap hash, no script `unsafe-inline`)
- [ ] Deploy to Cloudflare Pages at **lens.luminoid.dev** (manual, needs the account): connect the repo for PR previews, or `npx wrangler pages deploy build`

### Database at a glance (v0)

| | |
|---|---|
| Lenses | 680 |
| Brands | Sony 81 · Panasonic 66 · Canon 54 · Leica 50 · Fujifilm 48 · Nikon 47 · Sigma 47 · Samyang 35 · Voigtländer 30 · Laowa 29 · Olympus 29 · Viltrox 29 · Tamron 25 · 7Artisans 24 · TTArtisan 19 · Yongnuo 17 · Meike 15 · Zeiss 13 · OM System 12 · Tokina 10 |
| Formats | Full Frame 405 · APS-C 176 · MFT 99 |
| Types | Prime 444 · Zoom 236 (115 variable-aperture, 121 constant) |
| Focus | 553 autofocus · 127 manual-focus |
| Coverage | year/min-focus/aperture-tele 100% · weight 99% · elements/groups 99% · blades 96% · filter-thread 94% · price 93% · diameter 92% · max-magnification 82% (sparsest) |

Specs are machine-assembled (LLM fan-out), then web-verified per brand against manufacturer pages, B&H, and DPReview. A final human spot-check is still recommended before launch. Nulls mean "not reliably sourced," never a guess.

## Layout

```
data/
  schema.json   # lens record contract (JSON Schema 2020-12)
  lenses.json   # the database (array of lens records)
  meta.json     # facets, counts, generatedAt, lastPriceCheck, sources
  sources.md    # per-brand source URLs + verification notes
scripts/
  validate.mjs  # schema + sanity checks (CI gate); build-meta.mjs; oneshot/ (archived)
src/
  lib/data/        # typed loader + Lens type (mirrors schema.json) + shared spec rows
  lib/chart/       # axis registry, ECharts option builder, per-theme palettes (chartTheme.ts + brandColors.ts), tag-view 2D packing (tagLayout.ts), tree-shaken ECharts entry (echarts.ts)
  lib/filters/     # reactive filter store (incl. pins), pure filtering, URL <-> state
  lib/i18n/        # EN/ZH dictionary + t() + locale path helpers
  lib/theme.svelte.ts  # reactive dark/light theme store (persists to localStorage + data-theme)
  lib/components/   # LensChart, FilterPanel, AxisControls, RangeSlider, CompareTray, LangSwitch, ThemeToggle
  params/lang.ts   # [[lang=lang]] route matcher (zh only)
  hooks.server.ts  # per-locale <html lang> at prerender time
  routes/[[lang=lang]]/  # / + /zh: chart, /compare, /lens/[id], /methodology; all prerendered per locale
  routes/+error.svelte   # themed 404 / error boundary (also the static fallback)
  routes/sitemap.xml/    # prerendered sitemap endpoint (all pages, both locales, hreflang)
static/
  theme-init.js   # pre-paint theme resolver (localStorage / OS preference) so there's no flash
  _headers        # Cloudflare security + cache headers (script/style CSP is a meta tag; see svelte.config.js)
  robots.txt      # allow-all + Sitemap: pointer
  favicon.svg     # + favicon-16.png / favicon-32.png / apple-touch-icon.png
  og.png          # 1200x630 social preview card
```

## Data model

One row per **optical design**, not per mount: a lens sold in several mounts lists them all in
`mounts[]`. Numeric fields are `null` when a value can't be reliably sourced (never a guess).
See [`data/schema.json`](data/schema.json) for the full field list, [`data/sources.md`](data/sources.md)
for per-brand provenance, and the in-app methodology page (`/methodology`) for the sourcing and
accuracy policy.

## Scope (v1)

Mirrorless, current + recent (~2014→), plus iconic rangefinder and classic primes adaptable to
mirrorless. First-party: Sony, Canon, Nikon, Fujifilm, Panasonic, OM System/Olympus, Leica.
Third-party: Sigma, Tamron, Zeiss, Samyang, Voigtländer, Viltrox, Laowa, 7Artisans, TTArtisan,
Yongnuo, Meike, Tokina. Across Full Frame, APS-C, and MFT.

L-Mount is treated as one physical mount across the whole Leica/Panasonic/Sigma alliance (Leica's
own SL/TL bodies included), so a single `L-Mount` value covers every alliance lens.

## Running locally

```
npm install
npm run dev        # vite dev server, http://localhost:5173
npm run build      # static prerender into build/ (adapter-static, Cloudflare Pages)
npm run preview    # serve the production build
npm run check      # svelte-check (types)
```

The chart loads `data/lenses.json` at build time through the `$data` alias (see
[`svelte.config.js`](svelte.config.js)) and prerenders, so there is no runtime server. ECharts is
imported only in the browser. Source lives in [`src/`](src/): `lib/data` (typed loader),
`lib/chart` (axis registry + ECharts option builder + colors), `lib/filters` (reactive filter store,
pure filtering, URL serialization), `lib/components` (chart wrapper, filter panel, axis controls,
range slider). The whole interactive state (filters + axis choice + color-by) round-trips to the URL,
so any view is a shareable link.

## Data tooling

Dependency-free Node scripts (also runnable without the app install):

```
npm run validate   # node scripts/validate.mjs:  schema + sanity checks (CI gate)
npm run meta       # node scripts/build-meta.mjs: regenerate data/meta.json facets
npm run meta:price # same, but stamp a fresh lastPriceCheck date
```

`validate.mjs` reads `data/schema.json` directly (required fields, enums, numeric fields, allowed
keys, and the mount set), so the validator and the contract can't drift. Spent seed scripts live in
[`scripts/oneshot/`](scripts/oneshot/) and are not part of the maintenance loop.

## Deploy & maintenance

Hosting is **Cloudflare Pages** on the custom domain `lens.luminoid.dev`. Build with `npm run build`
(static prerender into `build/`); connect the repo for automatic PR previews, or push a one-off with
`npx wrangler pages deploy build`. Security headers ship in [`static/_headers`](static/_headers); the
script/style content-security policy is delivered as a `<meta>` tag with build-time hashes (hash mode,
configured in [`svelte.config.js`](svelte.config.js)), so it stays correct without a server.

Wire `npm run validate` into CI so a malformed database fails the build. To update the data: append
new lenses to `data/lenses.json`, run `npm run meta` to regenerate facets, then `npm run meta:price`
to stamp a fresh price-check date.

## Roadmap (v1.1 ideas)

Optical-performance axis (a defensible review aggregate, kept sparse until then), brand-signature
chart colors (Canon red, Nikon yellow, ...), lens thumbnails, and more brands plus DSLR /
medium-format coverage.

## License

Code and this curated compilation: **CC BY-NC-SA 4.0** (see [`LICENSE`](LICENSE)). The lens specs
are factual data from public manufacturer pages, B&H, and DPReview (provenance in
[`data/sources.md`](data/sources.md)); no paywalled review data is reproduced, and unsourced values
are left null, never guessed.
