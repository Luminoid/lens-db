# LensDB

Interactive camera-lens comparison chart for modern mirrorless systems. Plot every lens on a
configurable two-axis graph (focal length × aperture by default), filter by brand, mount, or format,
and compare specs side by side. **721 lenses across 20 brands.**

Built with SvelteKit 5, Tailwind 4, and ECharts; fully prerendered with `adapter-static`. Live at
**lens.luminoid.dev**.

## Features

- **Two chart views**: a *tag* view that packs every lens as a labelled chip (none hidden, none
  overlapping, on an arbitrarily tall page-scrolled canvas) and a *dots* view (scatter and segments
  with pan-zoom). Both share focal-length and f-stop gridlines; a zoom draws as a segment spanning
  its focal range, a prime as a point.
- **Configurable axes**: pick any two of 12 specs for X and Y, per-axis log or linear, color by
  brand or category.
- **Faceted filters and search**: brand, mount, format, type, focus, stabilization, weather-sealing,
  hide-discontinued, and range sliders. The full view state (filters, axes, color, pins) round-trips
  to the URL, so any view is a shareable link.
- **Compare and detail pages**: click-to-pin tray, a `/compare` spec table with best-in-row
  highlighting and CSV export, and a prerendered `/lens/[id]` page per lens (specs incl.
  production status, locator chart, similar lenses, `Product` + `BreadcrumbList` structured data).
- **EN/ZH bilingual**: `[[lang=lang]]` routing (EN at `/`, ZH at `/zh/`), every page prerendered per
  locale with its own `<html lang>`, hreflang, canonical, and Open Graph tags.
- **Dark / light theme**: flash-free pre-paint resolver, runtime palette swap, ECharts re-colors on
  switch, WCAG-AA light palette, `prefers-reduced-motion` honored.
- **Accessible and static**: skip link, keyboard navigation, a no-JS data-table fallback for the
  chart, a client-rendered themed 404 (the static shell carries a fallback `<title>` + `noindex`),
  `robots.txt`, and a prerendered `sitemap.xml`. No runtime server; ECharts is tree-shaken and
  loaded only in the browser.
- **Hardened headers**: Cloudflare `_headers` plus a meta CSP in hash mode (`script-src 'self'` and
  the bootstrap hash, no script `unsafe-inline`).

## Database at a glance

| | |
|---|---|
| Lenses | 721 |
| Brands (20) | Sony 82 · Panasonic 66 · Canon 55 · Leica 52 · Fujifilm 48 · Sigma 48 · Nikon 47 · Voigtländer 40 · Samyang 36 · Laowa 35 · Viltrox 33 · Olympus 29 · 7Artisans 26 · Tamron 26 · TTArtisan 24 · Meike 18 · Yongnuo 17 · Zeiss 16 · OM System 12 · Tokina 11 |
| Formats | Full Frame 430 · APS-C 191 · MFT 100 |
| Types | Prime 479 · Zoom 242 (118 variable-aperture, 124 constant) |
| Focus | 572 autofocus · 149 manual-focus |
| Coverage | focal / aperture / weight / year 100% · elements / groups / MSRP / min-focus 99% · blades / length 97% · diameter / price 95% · filter-thread / weather-sealing 94% · max-magnification 86% (sparsest) |

Specs are machine-assembled, then web-verified per brand against manufacturer pages, B&H, and
DPReview. Nulls mean "not reliably sourced," never a guess.

## Project layout

```
data/
  schema.json   # lens record contract (JSON Schema 2020-12)
  lenses.json   # the database (array of lens records)
  meta.json     # facets, counts, generatedAt, lastPriceCheck, sources
  sources.md    # per-brand source URLs + verification notes
scripts/
  validate.mjs  # schema + sanity checks (CI gate); build-meta.mjs; oneshot/ (archived)
src/
  lib/data/        # typed loaders (lenses + dataset-free meta) + Lens type (mirrors schema.json) + shared spec rows
  lib/chart/       # axis registry, ECharts option builder, per-theme palettes, tag-view 2D packing, tree-shaken ECharts entry
  lib/filters/     # reactive filter store (incl. pins), pure filtering, URL <-> state
  lib/i18n/        # EN/ZH dictionary + t() + locale path helpers
  lib/theme.svelte.ts  # reactive dark/light theme store (persists to localStorage + data-theme;
                       #   the pre-paint resolver is a hashed inline script in app.html)
  lib/components/   # LensChart, FilterPanel, AxisControls, RangeSlider, CompareTray, LangSwitch, ThemeToggle, TagAxis
  params/lang.ts   # [[lang=lang]] route matcher (zh only)
  hooks.server.ts  # per-locale <html lang> + 404-shell <title>/noindex at prerender time
  routes/[[lang=lang]]/  # / + /zh: chart, /compare, /lens/[id], /methodology; all prerendered per locale
  routes/+error.svelte   # themed 404 / error boundary (also the static fallback)
  routes/sitemap.xml/    # prerendered sitemap endpoint (all pages, both locales, hreflang)
static/
  _headers        # Cloudflare security + cache headers (script/style CSP is a meta tag; see svelte.config.js)
  robots.txt      # allow-all + Sitemap: pointer
  favicon.svg     # + favicon-16.png / favicon-32.png / apple-touch-icon.png
  og.png          # 1200x630 social preview card
```

## Data model

One row per **optical design**, not per mount: a lens sold in several mounts lists them all in
`mounts[]`. Numeric fields are `null` when a value can't be reliably sourced (never a guess). See
[`data/schema.json`](data/schema.json) for the full field list, [`data/sources.md`](data/sources.md)
for per-brand provenance, and the in-app `/methodology` page for the sourcing and accuracy policy.

## Scope

Mirrorless, current and recent (~2014 onward), plus iconic rangefinder and classic primes adaptable
to mirrorless. First-party: Sony, Canon, Nikon, Fujifilm, Panasonic, OM System/Olympus, Leica.
Third-party: Sigma, Tamron, Zeiss, Samyang, Voigtländer, Viltrox, Laowa, 7Artisans, TTArtisan,
Yongnuo, Meike, Tokina. Across Full Frame, APS-C, and MFT.

L-Mount is treated as one physical mount across the whole Leica/Panasonic/Sigma alliance (Leica's own
SL/TL bodies included), so a single `L-Mount` value covers every alliance lens.

## Getting started

```
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # static prerender into build/
npm run preview    # serve the production build
npm run check      # svelte-check (types + a11y)
```

The chart loads `data/lenses.json` at build time through the `$data` alias (see
[`svelte.config.js`](svelte.config.js)) and prerenders, so there is no runtime server; ECharts is
imported only in the browser.

### Data tooling

Dependency-free Node scripts (also runnable without the app install):

```
npm run validate   # schema + sanity checks (CI gate)
npm run meta       # regenerate data/meta.json facets
npm run meta:price # same, plus stamp a fresh lastPriceCheck date
```

`validate.mjs` reads `data/schema.json` directly (required fields, enums, numeric ranges, allowed
keys, the mount set), so the validator and the contract can't drift. Spent seed scripts live in
[`scripts/oneshot/`](scripts/oneshot/) and aren't part of the maintenance loop.

To update the data: append new lenses to `data/lenses.json`, run `npm run meta` to regenerate facets,
then `npm run meta:price` to stamp a fresh price-check date.

## Deploy

Hosting is **Cloudflare Pages** on `lens.luminoid.dev`. Build with `npm run build` (static prerender
into `build/`); connect the repo for automatic PR previews, or push a one-off with
`npx wrangler pages deploy build`. Security headers ship in [`static/_headers`](static/_headers); the
script/style content-security policy is delivered as a `<meta>` tag with build-time hashes (hash mode,
configured in [`svelte.config.js`](svelte.config.js)), so it stays correct without a server. A GitHub Actions
workflow ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `validate` + `check` + `build`
on every push, so a malformed database fails CI before it can deploy.

## Roadmap

Optical-performance axis (a defensible review aggregate, kept sparse until then), brand-signature
chart colors (Canon red, Nikon yellow, ...), lens thumbnails, and more brands plus DSLR and
medium-format coverage.

## License

Code and this curated compilation: **CC BY-NC-SA 4.0** (see [`LICENSE`](LICENSE)). The lens specs are
factual data from public manufacturer pages, B&H, and DPReview (provenance in
[`data/sources.md`](data/sources.md)); no paywalled review data is reproduced, and unsourced values
are left null, never guessed.
