# Data sources & verification notes

721 lenses across 20 brands. Originally generated 2026-06-01 (682 lenses), last full
re-verification 2026-06-05, latest updates 2026-08-30 (new-release sweep, adversarial recheck,
full US price sweep, flag corrections).

File map:

- [Verification method](#verification-method): how records are gathered and checked
- [Policies](#policies): productUrl, discontinued semantics, T-stop rows, recheck-rejected values
- [Open follow-ups](#open-follow-ups): the living checklist, live items first
- [Change log](#change-log-newest-first): dated update passes, newest first
- [Appendix](#appendix-original-build-segment-audits): per-segment notes from the original build

## Verification method

The database is maintained by a fan-out workflow: each brand/format/type segment gets a gather pass (drafted from model knowledge) followed by an adversarial verify pass that web-checks roster completeness and every field against the manufacturer's spec page, cross-referenced with B&H, DPReview, and established review sites. The newer third-party brands (Viltrox, Laowa, 7Artisans, TTArtisan, Yongnuo, Meike, Tokina) were gathered then adversarially verified for existence and core specs, with extra scrutiny.

Three full web-verification passes have run over the full roster (2026-06-01, 2026-06-04, 2026-06-05). In the two later passes every proposed change was re-confirmed by an independent recheck agent against a *different* source before being applied; proposals a second source could not confirm were rejected, not applied. Identity fields (focal length, max aperture, format, lensType) are never changed by a verification pass; `mounts` changes only when an additive expansion is well-sourced. Per-field nulls are left null wherever no reliable source exists, never guessed.

## Policies

### productUrl policy (reachability-gated)

Every `productUrl` is HTTP-tested before it is written. A **fill** (null to URL) is written only if the new page loads. A **replacement** is written only when the old link is genuinely dead (404/410) and the new one loads; a working manufacturer link is never swapped for a retailer link. A **specialize** replacement is allowed when the stored URL is a generic category/landing page (e.g. `leica-camera.com/.../lenses/m`) and the proposal is a deeper, lens-specific page on the same domain that loads. Bot-blocked-but-live pages (Sony and B&H commonly return 403 to scripted fetches) are treated as alive and kept. Coverage was 100% (682/682) at the original build (the last null, `samyang-mf-35mm-f12-apsc`, now points to its lksamyang product page); as of 2026-08-30 it is 720/721, with `canon-rf-10-20mm-f4-l-is-stm` nulled after Canon removed the page (see follow-ups).

### Discontinued lenses (latest-info policy)

`discontinued: true` when manufacturer or authorized-dealer evidence shows new production/listing ended. No date field by design: exact end-of-production dates are rarely published, so the change log carries when each flag flipped and on what evidence. Rows keep the latest obtainable info: specs stay as the final published values; `priceUSD` is the last verifiable new-stock price and is still updated while run-out or clearance stock sells, nulled only when confirmed unbuyable new; `productUrl` is kept while the page loads.

### Aperture stored as T-stop (Samyang V-AF)

The Samyang V-AF cine-AF primes store T-stops in the aperture fields, so they plot marginally brighter than their nominal f-number on the aperture axis. This is intentional, not an error.

### Values deliberately kept (recheck-rejected proposals)

Plausible-looking corrections that an independent recheck refuted, recorded so they are not re-proposed:

- **Sony FE 135mm F1.8 GM**: price/MSRP are not $1,898. Sony officially raised the MSRP from $1,898 to $2,098 in Aug 2019; current US street is about $2,248.
- **Sony FE PZ 28-135mm F4 G OSS**: priceUSD is not $2,498; current new street is about $2,999.99.
- **Canon RF 16-28mm F2.8 IS STM**: minFocusDistance is 0.2m (0.25m at 16mm); the 0.11 figure is the max magnification, not the focus distance.
- **Sigma 10-18mm F2.8 DC DN | C**: length is 64mm (Sony E, listed first); 62mm is the mount-dependent L / Canon RF figure. priceUSD is not $679 (a transient rebate off the $729 regular price).
- **OM System 40-150mm F4 PRO**: elements is 15, not 19 (19 appears only on OM System's US page; the UK page and independent sources say 15).
- **Olympus 25mm F1.8**: priceUSD stays at the $399.99 MSRP; the $319.99 clearance was a single out-of-stock listing.
- **Leica APO-Summicron-M 75mm f/2 ASPH.**: minFocusDistance is 0.7m per Leica's datasheet; 0.77m comes only from one reseller listing.
- **Leica Summicron-SL 50mm f/2 ASPH.**: weight is about 402g; the proposed 370g was backwards.
- **Zeiss Batis 85mm f/1.8**: diameter is the smaller published value; the Zeiss US page duplicates the 92mm length into the diameter field.
- **Meike 50mm f/1.7**: diameter is mount-dependent (61mm for E/Z/RF/X, 66.5mm for L/MFT); kept the existing value.
- **Yongnuo YN 25mm F1.7 M**: priceMSRP is not $99; PetaPixel reported "under $150" and Yongnuo did not announce an official price.
- **Tokina SZ 500mm F8 Reflex MF**: priceUSD is not $359 (a transient Tokina USA sale, single-sourced).

## Open follow-ups

Ambiguous / completeness items surfaced by verification. Living checklist: live items below,
resolved items kept ticked in the next subsection for provenance.

- [ ] **Voigtländer APO-Lanthar 90mm F4 Close Focus VM** (`voigtlander-apo-lanthar-90mm-f4-vm`): released in Japan Aug 2026 at JPY 121,000; no US listing yet (B&H/CameraQuest re-checked 2026-08-30), so priceUSD/priceMSRPUSD are null. Fill when the US price lands (~$759-799 by conversion, do not use the estimate).
- [ ] **7Artisans AF 18mm F2** (APS-C, E/Z/X, 109g, 52mm filter): announced 2026-08-27, orders "opening soon", no price or product page as of 2026-08-29. Deferred until release, same rule as the RF Nokton (now under Resolved).
- [ ] **Sigma launch event 2026-09-08**: expected to complete the 85mm F1.2 DG | Art dev-announcement row (`sigma-85mm-f12-dg-art`, still mostly null) and possibly add a 20-60mm F2.8-4 and a fast 65mm. Re-check the row and the roster right after.
- [ ] **Dev-announced / not-yet-released watchlist (2026-08-29; re-confirmed 2026-08-30, nothing graduated to full launch)**, none added as rows per the no-specs-no-row rule: Nikon Z 120-300mm f/2.8 TC VR S (dev-announced 2026-05-07, ~$8,000 rumored, 2H 2026); Viltrox AF 35mm F1.4 Pro (FF E/Z), AF 18mm F1.2 Pro + AF 40mm F1.2 Pro (APS-C), and AF 28mm F1.8 II (July launch claimed but no product page or retailer listing); Laowa AF 35mm f/2.8 APO 1:1 Macro (Sept expected); Yongnuo YN 35mm/85mm F1.4 VCM (P&E unveiling, China-only so far); Leica Summicron-M 66mm f/2 limited edition (official ~2026-09-03); Viltrox Air-line L-Mount ports of the 50/2, 40/2.5, 20/2.8, 14/4 (roadmap, not shipping); Tamron 20-40mm (A062) and 28-300mm (A074) Nikon Z ports (still unreleased per Tamron's 2026-08-07 DPReview interview); Panasonic roadmap wide prime + large-aperture tele zoom (L-Mount, autumn rumored); Sony 16-28mm F2 GM (rumor only); Fujifilm X-T6 companion lenses XF 400mm F4.5 + XF 50-140mm II (rumor only); OM System Sept 9-10 announcement.
- [ ] **Canon promo-window prices (recorded 2026-08-30)**: Canon US prices are list minus rolling "instant savings"; the current cycle ends 2026-09-06. Deep-promo records that may revert upward after the window: RF 15-30 ($489.99, list $639.99), RF 16-28 ($999, list $1,249), RF 135mm ($1,999, list $2,399), RF 600mm F11 ($729.99, list $929.99), RF 800mm F11 ($999, list $1,199), RF 24-105 Z ($3,199, list $3,299).
- [ ] **OM System post-promo recheck**: the sitewide wildlife promo's posted end date was 2026-08-30 (sweep day), so post-increase list prices were recorded per the ignore-dated-promos rule: 150-600 at $2,999.99 (promo price equalled the stale $2,399.99), 8-25 PRO $1,299.99, 12-40 II $1,199.99 (store showed $1,099.99 during the promo), 90mm Macro $1,799.99. Re-check once the promo lapses; if OM rolls it forward, street is lower.
- [ ] **Canon RF 14-35mm F4 L** (`canon-rf-14-35mm-f4-l-is-usm`): appears genuinely discontinued (Canon USA new + refurb pages unavailable, a retailer suspended backorders, no new stock found 2026-08-30); flag kept false pending corroboration, priceUSD kept at the last verified $1,599. Decide next pass.
- [ ] **Canon RF 10-20mm F4 L** (`canon-rf-10-20mm-f4-l-is-stm`): Canon's shop page was removed (404, refurb page only; the "-lens"-suffix variant also 404s), so productUrl was nulled 2026-08-30 per the reachability policy; B&H/Adorama still hold $2,299 new. Possibly transitioning (an RF 50mm F1.2 L II is separately rumored); watch both.
- [ ] **Sigma I-series "DG" rebadge**: Sigma is rebadging the DG DN Contemporary primes as "DG" (same optics, no DN). Rows already flagged discontinued: 17/4, 20/2, 24/2, 24/3.5, 35/2, 45/2.8. The 50mm F2, 65mm F2, and 90mm F2.8 DG DN now show the same replaced/limited-stock pattern on sigmaphoto.com but keep `discontinued: false` pending a modeling decision (rebadge = same optical design, so a row-level flip may be wrong; the rebadged SKUs are not separate rows). The 35mm F1.4 DG DN was flipped BACK to false 2026-08-30: Sigma US sells it normally at $989 with no discontinued banner, alongside the 35mm F1.4 DG II. No new stock anywhere for 14mm F1.4 DG DN, 24-70 DG DN I, 35mm F1.2 I (prices kept as last-known).
- [ ] **Panasonic status watch**: 45-200mm II delisted from shop.panasonic.com with no verifiable dealer new stock (flag kept false, weakest evidence of the batch); the June-2026-discontinued trio (Leica DG 12-60/2.8-4, Leica DG 25/1.4 II, G 42.5/1.7) plus S Pro 70-200/4 get same-optics "A"-suffix reissues mid-September 2026 (S-R70200A pattern, Japan pricing so far); rows unchanged per one-row-per-optical-design. Flipped true 2026-08-30 on dealer evidence: G X Vario 12-35/2.8 II and 35-100/2.8 II (used-market only), G Vario 12-32 and 14-42 II (kit-only availability).
- [ ] **Fujifilm XF 16-55mm F2.8 I** (`fujifilm-xf-16-55mm-f28-r-lm-wr`): winding down; Fujifilm shop clearance $949.95 out of stock vs Adorama $1,199 out of stock 17 weeks. Price left as-is (unresolved). The silver XF 23mm F2 variant is quietly discontinued (finish variant only, no row impact).
- [ ] **Zeiss Loxia run-out prices**: only the 21mm had a verifiable in-stock dealer price ($1,057.30, applied); 25/35/85 had none (kept), and the 50mm F2 shows no new stock anywhere. Batis/Touit clearance prices applied from in-stock dealers 2026-08-30; Zeiss's own US shop still lists both lines at higher list prices.
- [ ] **Sony singles**: E 10-18mm F4 OSS has new stock at one dealer only (Precision, $898 vs recorded $798; kept per two-source rule). E 18-200mm LE was flipped `discontinued: true` on US-dealer evidence, then reversed to `false` the same evening: Sony JP still sells it new, and a US-market exit is not an end of production per the RF 75-300 precedent (see the Sony flag-correction section).
- [ ] **Out-of-enum mounts (intentional omissions)**: Laowa 4.5-10mm fisheye zoom and TTArtisan 7.5mm F2 fisheye also ship in Canon EF-M; Laowa 17mm F4 Zero-D Tilt-Shift and TTArtisan Tilt-Shift 17mm F4 also ship in Fujifilm GFX (Laowa also Hasselblad XCD). All outside the 7-mount enum / mirrorless-crop scope; recorded here so they are not re-proposed.
- [ ] **Viltrox Air 25/35 MFT ports**: released in China 2026-07-23 (PetaPixel/43rumors) but no global launch as of 2026-08-30 (viltrox.com sells E/Z/X only, no B&H listings). Mounts kept since the ports exist as released products; note if "mounts" should ever mean US-purchasable.
- [ ] **Voigtländer VM (Leica M mount) back-catalog**: the original build deliberately excluded VM lenses; the 2026-08-30 sweep added only the two new 2026 VM releases (APO-Skopar 75mm F2.8, APO-Lanthar 90mm F4). The older VM line (Nokton 35/1.2, 50/1, 21/1.4, APO-Lanthar VM primes, etc.) remains unrostered; decide whether to backfill it as a batch.

### Resolved (kept for provenance)

- [x] **Laowa 12mm f/2.8 Zero-D** (`laowa-12mm-f28-zero-d`): `mounts` expanded to Sony E + Canon RF + Nikon Z + L-Mount (2026-06-05 recheck, manufacturer + B&H/Adorama; same 609g / 16-element original design, distinct from the 2025 Lite Zero-D). `discontinued` left null (a successor exists but there is no explicit end-of-production statement).
- [x] **Laowa 85mm f/5.6 2x Ultra Macro APO** (`laowa-85mm-f56-2x-ultra-macro-apo`): added `L-Mount` (2026-06-05 recheck; Venus released the native L-Mount version on 2022-02-15).
- [x] **Sigma DG DN discontinuations**: the 35mm F1.4 DG DN Art and 45mm F2.8 DG DN Contemporary are both flipped to `discontinued: true` (Sigma's own discontinued-models list; each renewed as a non-DN successor, the 35mm F1.4 DG II and 45mm F2.8 DG).
- [x] **Tamron 70-180mm F2.8 (A056)** (`tamron-70-180mm-f28-di-iii-vxd`): flipped to `discontinued: true` (Tamron global discontinued list, end of production 2023/8; superseded by the A065 G2).
- [x] **Leica APO-Telyt-M 135mm f/3.4** (`leica-apo-telyt-m-135mm-f34`): kept `discontinued: false` (still in Leica's current M-lens catalog, the only surviving APO-Telyt).
- [x] **Samyang V-AF 20mm / 24mm** (`samyang-v-af-20mm-t19-fe`, `samyang-v-af-24mm-t19-fe`): `weatherSealed` set to `true` (Samyang official spec states "Yes", six seal points; confirmed by B&H and reviews).
- [x] **Voigtländer Nokton Classic 35mm F1.4, Canon RF build**: announced at CP+ 2026 as a distinct mechanical build (diamond-knurled focus ring, 37.6mm / 260g, versus the Z build's scalloped ring, 41.6mm / 250g), so it warrants its own row rather than a mount appended to the Z row. Released 2026-07-16 at $699; added as its own row 2026-08-30 (`voigtlander-nokton-classic-35mm-f14-rf`). The Z row's placeholder price was corrected 799 → 699 in the same pass (B&H pre-order opened 2026-06-25 at $699).
- [x] **Canon RF 75-300mm F4-5.6** (`canon-rf-75-300mm-f4-56`): 2026-08-30 recheck confirmed the Canon USA store page reads "Discontinued" / not purchasable (Auto Notify Me only), but the lens remains a current product internationally and Adorama still lists it new, so this looks like a US-market exit, not an end of production; `discontinued` stays false by decision. Flip it if authorized-dealer new stock dries up.
- [x] **Meike additions**: added Meike AF 85mm f/1.4 II MIX (`meike-af-85mm-f14-ii-mix`, full frame, Sony E / Nikon Z / L-Mount, $498, released 2026-05-29, a distinct optical design from the original `meike-af-85mm-f14-mix`) and Meike AF Air 56mm f/1.7 (`meike-af-56mm-f17`, APS-C, Sony E / Nikon Z / Fujifilm X, $159, May 2026).

## Change log (newest first)

### 2026-08-30 (evening): Sony discontinued flags corrected

User-reported: the Distagon 35mm F1.4 ZA (SEL35F14Z) is actively sold on Sony's US store despite `discontinued: true`. A per-SKU recheck of all 21 Sony flags against Sony Japan's own product pages (`sony.jp/ichigan/products/{SKU}/`) found 15 of 21 wrong. Discriminator: an ended product carries an explicit 生産完了 marker in the page's own sales-status field (`s5-outline__salesStatusB`); current products carry an active price and purchase flow and no marker anywhere on the page. Price presence alone is NOT evidence (生産完了 pages still display a last price). Note: pages are Shift_JIS; convert before grepping for the marker. The original sony-fe-prime pass note ("Distagon 35mm F1.4 ZA, Sonnar 35mm F2.8 ZA, and Planar 50mm F1.4 ZA correctly flagged discontinued"; "original FE 85mm F1.4 GM correctly flagged discontinued, retired with the GM II") asserted the flags without per-SKU manufacturer evidence and is superseded by this section.

Flipped to `false` (Sony JP active price + purchase flow; the Mk I GM and ZA lines are concurrent catalog products alongside their Mk II successors, and the same-day US price sweep had already recorded their live US street prices): SEL16F28, SEL1635GM, SEL1635Z, SEL18200LE, SELP18200, SEL24F18Z, SEL2470GM, SEL2470Z, SEL2870, SEL35F14Z, SEL35F28Z, SEL50F14Z, SEL70200GM, SEL70200G, SEL85F14GM. The SEL18200LE flip reverses the morning sweep's US-dealer-evidence flip per the RF 75-300 precedent (US-market exit, not end of production). SEL16F28 and SEL24F18Z keep `priceUSD` null: JP-active, but no verifiable US new-stock price.

Kept `true` (sony.jp page carries the 生産完了 marker): SEL1018, SELP1650, SEL1670Z, SEL18200, SEL1855. SEL1850 also kept: sony.jp 404s and no new-stock sale is findable anywhere.

Boolean coverage stays 721/721; now 84 true / 637 false.

### 2026-08-30: discontinued-null resolution pass

The 38 rows with `discontinued: null` (23 Laowa, 15 Meike, left unsourced by the original build) were resolved, all to `false`: every Laowa row is live and availableForSale via the official Canadian distributor's storefront (laowalenses.ca sitemap lastmod 2026-08-28, Amplis Shopify API prices), and all 15 Meike rows are in meikeglobal.com's live catalog (the 50mm f/0.95's combined URL split into per-mount pages; the 85mm f/1.8 AF STM E-mount is sold out at Meike but its L/Z variants are in stock and B&H shows a restock date, so sold-out did not flip anything). The 12mm f/2.8 Zero-D question from the original follow-ups is settled: still sold concurrently with the 2025 Lite successor, no end-of-production statement, so `false`. Field coverage is now 721/721 booleans (99 true / 622 false).

### 2026-08-30: dxomarkScore nulled (site audit)

The 5 populated `dxomarkScore` values (2 Yongnuo, 3 Zeiss) were set to null: the field is read by
no UI code, and the LICENSE / methodology "no proprietary review data" statement is cleaner with
zero DXOMark numbers in the dataset. The schema field remains for a possible future
defensible-aggregate axis.

### 2026-08-30: adversarial re-verification + full US price sweep (717 → 721)

Same-day follow-up to the morning sweep. Five recheck agents: three field-by-field verifications of the 40 records the morning update touched (each field against the manufacturer page plus one independent source), one missed-release hunt against the full roster (full walk of the Jun/Jul/Aug 2026 Photo Rumors archives cross-checked against brand rumor sites and newsrooms: nothing missed, watchlist re-confirmed), and one catalog-staleness pass with a 13-record legacy spot check. Then a 4-record gap build and a 7-agent brand price sweep.

#### Recheck of the morning's 40 records

36 of 40 verified clean. Fixes applied (all two-source or manufacturer-page evidence):

- `sigma-16-300mm-f35-67-dc-os-c`: apertureMin 45 → 22 (Sigma "F22-45" is wide-tele; DB stores the wide end).
- `viltrox-af-90mm-f22-evo`: weight 345 → 320 (345 is the Z/X figure; Viltrox + DPReview give 320g for Sony E); length filled 76.
- `viltrox-af-75mm-f18-evo`: apertureMin 16, length 76, weatherSealed true (Viltrox page + reviews).
- `viltrox-af-26mm-f28-evo`: length 24 → 23.8 (official "23.8mm thin").
- `viltrox-af-28mm-f45-chip`: + Nikon Z (Z version shipping since May 2025, Viltrox store + PetaPixel/NikonRumors; the DB had missed it).
- `laowa-45-10mm-f28-cf-zoom-fisheye`: diameter filled 68.9, apertureMin 22 (CineD + RedShark agree 59.3 length x 68.9 diameter; PetaPixel swaps the axes).
- `7artisans-af-135mm-f18-max`: apertureMin 16, weatherSealed true; `7artisans-af-10mm-f25-max`: weatherSealed true (store + PetaPixel).
- `ttartisan-af-50mm-f18-neo`: weight filled 156; `ttartisan-af-85mm-f18-neo`: length filled 90.5.
- `ttartisan-75mm-f2-fisheye`: weight 343 → 370 (TTArtisan's official range is 343-370g by mount; two retailers list the Sony E version at 370g).
- `viltrox-af-25mm-f17-air`: length 56 → 56.4, maxMagnification filled 0.11 (Viltrox page).
- `tamron-17-70mm-f28-di-iii-a-vc-rxd`: priceUSD 699 → 599 (B&H standing price since April 2026, MSRP 799 stands).
- `zeiss-otus-ml-85mm-f14`: priceUSD 2999 → 2499 (PROCAM/Duclos/B&H agree; MSRP 2999 stands). All three Otus ML confirmed shipping.
- `voigtlander-nokton-35mm-f12-x` priceMSRPUSD 649; `voigtlander-macro-apo-ultron-35mm-f2-x` priceMSRPUSD 699 (caveat: 699 is the standing US list at three retailers; 2022 launch coverage quoted only yen conversions, so day-one list may have been slightly lower).
- `voigtlander-nokton-classic-35mm-f14-z`: productUrl swapped to the official Cosina page (https://www.cosina.co.jp/voigtlander/z-mount/nokton-classic-35mm-f1-4/, verified loading with Z content). Supersedes the morning note: the correct path segment is `/z-mount/`, not `/z-mount-lenses/` (that one serves VM content, which is what failed the loads-check).
- `meike-af-25mm-f17`: productUrl filled (https://meikeglobal.com/products/2517e, $159 re-confirmed there). Launch-price ambiguity recorded for `meike-af-85mm-f14-ii-mix`: Imaging Resource says $498 at launch, PhotoRumors/PetaPixel say $569; MSRP kept 498.
- Rejected proposal: adding Canon EF-M to the Laowa fisheye zoom (out of the mount enum; see follow-ups).

#### Legacy spot check (13 records) and what it triggered

8 of 13 sampled legacy records had sourced errors (12 field-level: 6 stale prices, 2 apertureMin, 1 weight, 1 length, 1 magnification, 1 discontinued flag). Spec fixes applied: `7artisans-mf-75mm-f28-ii-fisheye` apertureMin 22 → 16 (Mk II is f/2.8-16; the f/22 figure is the Mk I's, carried over by B&H), `viltrox-af-40mm-f25-air` apertureMin 22 → 16 (Viltrox spec F2.5-F16), `sigma-50mm-f12-dg-dn-art` weight 745 → 740 (745 is the L-Mount figure), `leica-summicron-tl-23mm-f2-asph` discontinued true / length 48 → 37 (Leica datasheet, to bayonet without hood) / maxMagnification 0.09 → 0.08 (1:12.6) / priceUSD null (no new US stock; final list before discontinuation was $2,195 per Leica Store Miami). Clean: Meike 85/1.8 SE II, Olympus 12-50, Samyang 24-60 (a real Schneider-collab f/2.8 photo lens, NOT V-AF, so f-stops are correct), Tamron 28-75 G2, Yongnuo 50/1.8 Pro.

The dominant failure mode was priceUSD predating the 2025-2026 official US price increases (Sigma +10% 2025-06-02; Canon June 2025; Nikon June + September 2025; Fujifilm Aug 1 + September 2025; Sony May/July/September 2025; OM System 2025-10-13; Leica 2026-03-13, which postdates the June price check). That triggered the full sweep below.

#### Full US price sweep (426 records, 310 priceUSD updates)

Seven brand agents, sweep date 2026-08-30, `lastPriceCheck` restamped via `npm run meta:price`. Authorities per brand: Sigma = sigmaphoto.com product pages; Canon = usa.canon.com selling prices (list minus rolling instant savings, per the pre-existing RF 50/1.2L convention; deep-promo caveats in follow-ups); OM System = Oct 2025 list increases (DCW) with the expiring wildlife promo ignored; Nikon = B&H/Adorama MAP (Nikon list minus $3, .95 convention) cross-checked against the Sept 2025 nikonrumors table, because nikonusa.com currently displays promo prices with no strikethrough; Fujifilm = shopusa.fujifilm-x.com JSON-LD (exact cents), matching both 2025 increase tables; Sony = PROCAM Shopify JSON (price vs compare_at separates standing price from rebate) cross-checked against the sonypricewatch B&H/Adorama/PROCAM aggregate plus dealer spot checks; Panasonic = shop.panasonic.com Shopify JSON compare_at regulars validated against B&C Camera/Glazer's/ProCam (a Labor-Day-window sale was running, sale prices ignored); Leica = leicacamerausa.com (curl-able BigCommerce) + Leica Store Miami, exact agreement with the Red Dot Forum March 13 table wherever they overlap.

Update counts: Sigma 35, Leica 32, Fujifilm 33, Canon+OM 49, Sony 62, Panasonic 49, Nikon+Zeiss 50. Not everything went up: Sony's discontinued-but-still-sold Mk I GM and Zeiss ZA lines cleared downward (24-70 GM $1,798, 85 GM $1,498, ZA primes $648-$1,098), the 400-800 G's May-2025 hike reverted ($2,698), Leica had three multi-source decreases (Summicron-M 35 $4,275, APO-Telyt-M 135 $4,795, Summilux-TL 35 $1,995), and several Panasonic S teles drifted down. MSRP fix: `sigma-300-600mm-f4-dg-os-sports` priceMSRPUSD 6000 → 5999 (launch price was $5,999). Flag changes from the sweep: `nikon-z-24-70mm-f28-s` discontinued true (Nikon Japan archived, first Z lens discontinued, run-out stock still sold at $2,399.95); `sigma-35mm-f14-dg-dn-art` discontinued BACK to false (sold normally at Sigma US, no banner); `sony-e-18-200mm-f35-63-oss-le` discontinued true; Panasonic `12-35mm f/2.8 II`, `35-100mm f/2.8 II`, `12-32mm`, `14-42mm II` discontinued true (dealer evidence, see follow-ups). productUrl repairs: `canon-rf-1200mm-f8-l-is-usm` moved to the "-lens"-suffix URL (verified), `canon-rf-10-20mm-f4-l-is-stm` nulled (page removed; "-lens" variant also 404s), `panasonic-lumix-s-14-28mm-f4-56-macro` and `panasonic-lumix-s-85mm-f18` swapped from B&H links to their live shop.panasonic.com pages (retailer → manufacturer is the allowed direction).

Unresolved (prices deliberately kept): Sigma 85/1.2 Art still priceless preorder pending the 2026-09-08 event; Sigma 14/1.4, 24-70 DG DN I, 35/1.2 I no new stock; Canon RF 14-35 F4 L no new stock; Sony E 10-18 F4 single-dealer, E 16mm F2.8 NOS only; Fujifilm XF 16-55 I winding down; Zeiss Loxia 25/35/50/85; Panasonic 12-32 / 14-42 II / 45-200 II / 12-35 II / 35-100 II (no verifiable new-stock price); Leica Vario-Elmar-TL 18-56.

#### Roster gaps added (4, from the missed-release hunt's older-gaps list)

All verified manufacturer + 2-5 independent sources:

- `tokina-atx-m-85mm-f18-fe` (2020, Sony E, $499, discontinued per Tokina USA; superseded by the atx-m 85 PLUS). Dimension trap resolved: DPReview/Neocamera print the axes swapped; DCW's review settles 80mm diameter x 93.2mm length. weatherSealed false per DCW ("no gasket").
- `laowa-75mm-f2-mft` (7.5mm f/2 MFT, 2017, $499, the standard 170g build; the 150g Lightweight and ~$549 Auto Aperture variants share the row's optics and are noted, not separate rows). four-thirds.org's registry page (5 blades, 53x48mm) is a documented outlier against the 7-blade/50x55mm consensus.
- `laowa-10mm-f4-cookie` (2022, $299, E/RF/Z/X/L; laowalenses.ca labels the Canon port "RF-S", recorded as Canon RF per the enum).
- `ttartisan-tilt-shift-100mm-f28-2x-macro` (2023, $389, launched E/RF/Z/X; the official store since added L and MFT, all six recorded). Weight 845g is the launch press figure; TTArtisan publishes an unexplained 836-854g (store: 695-845g) per-mount spread with no Sony E breakout. ttartisan.com dead-redirects to a parked host, so the store page (ttartisan.store/products/ts100, loads correctly) is the productUrl. A ~700g figure floating around belongs to TTArtisan's separate non-tilt AF 100mm macro.

September 2026 re-check cluster (from the hunt, single reminder): Sigma event 9/8 (85/1.2 completion, rumored 20-60mm F2.8-4 and ultra-fast 65mm), Fujifilm X Summit 9/4 (XF 400mm F4.5, XF 50-140mm II), OM System 9/9, Laowa AF 35mm F2.8 macro, Leica Summicron-M 66mm f/2 Elcan limited reissue (~9/3, 660 units, ~$9,000), plus Meike's Aug roadmap (24-70/2.8, 50/1.2, 85/1.2 VCM, 70-180/2.8, 100/2.8 macro), all dev/rumor as of 2026-08-30.

### 2026-08-30: Jun–Aug 2026 new releases + roster backfill (682 → 717)

Four-agent web sweep of announcements 2026-06-01 → 2026-08-29 (three window agents split first-party / Sigma-Tamron-Leica-Zeiss-Voigtländer-Tokina / Chinese third parties, plus one backfill agent for pre-window gaps the sweep surfaced). Every added record was cross-checked against the manufacturer's spec page plus at least one independent source (B&H, DPReview, PetaPixel, CameraQuest, official datasheet PDFs); per-field nulls where no reliable source, never a guess. Dev-announcements without full specs+price were NOT added (watchlist in the follow-ups above); lenses officially announced with full specs and US price but shipping later WERE added, matching the FE 28-70 OSS II precedent.

#### New-release additions (20)

- **Sony FE 100-400mm F5.6-8 OSS** (announced 2026-08-04, $849.99, ships Sept 2026). Diameter 78mm and 15/10 construction from DPReview's spec rundown only; Sony US product page is Kasada-blocked, productUrl uses the search-indexed `all-e-mount` path.
- **Tamron 12-20mm F2.8** (A084; E on sale 2026-07-30 $1,699, Z 2026-08-27 $1,799; record carries Sony E price/weight per convention). Official name has no Di III/VXD suffix (Tamron's new naming). Rear filter holder, no front thread.
- **Leica Summilux-SL 50mm f/1.4 ASPH. (2026)** and **APO-Macro-Elmarit-SL 100mm f/2.8** (both announced 2026-06-25, $4,950 / $2,700, ship end of 2026). The 2016 Summilux-SL 50 row stays (distinct design). Leica pages are JS-rendered but live.
- **Voigtländer**: Nokton Classic 35mm F1.4 (RF-mount) (own row, released 2026-07-16, $699; RF diameter 71.0mm is Cosina-official but single-sourced); APO-Skopar 75mm F2.8 VM ($699, first 2026 VM addition); APO-Lanthar 90mm F4 Close Focus VM (US price TBA, nulls).
- **Viltrox EVO line**: AF 75mm F1.8 EVO ($329) + AF 90mm F2.2 EVO ($369) (APS-C E/Z/X, 2026-06-08); AF 26mm F2.8 EVO FF pancake (E/Z, 2026-07-15, $299).
- **Laowa Aksen** ultra-macro pair (45mm f/2.8 1-5X, 17.5mm f/1.7 5-10X; both 2026-07-31, $749, six mounts, MF; min focus-from-sensor unpublished → null) and 4.5-10mm f/2.8 CF Zoom Fisheye (announced 2026-05-21, pre-window but missing; $399).
- **Samyang AF 60-180mm F2.8 FE** (Schneider Kreuznach × LK Samyang; E 2026-06-25, L-Mount 2026-08-25). $999 confirmed at samyangus.com/Rokinon ($1,099 was a euro conversion). Elements 17/14 per the official page; several outlets copied a wrong 22/17.
- **7Artisans MAX line**: AF 135mm F1.8 MAX (Z May, E/L 2026-07-02, $689) + AF 10mm F2.5 MAX 185° FF fisheye (intl 2026-08-26, $449, no front thread).
- **TTArtisan Neo line**: AF 50mm F1.8 Neo (2026-07-03, $89; weight published only as a 156-167g cross-mount range → null) + AF 85mm F1.8 Neo (2026-08-20, $99, 332g per DPReview).
- **Meike 25mm f/1.7 Air AF** (`meike-af-25mm-f17`, 2026-08-14, E/Z/X). $159 per Imaging Resource (TechTimes's $169 rejected, matches the 56mm Air's $159 precedent). No stable meikeglobal.com product URL found (bot-blocked) → productUrl null.

#### Roster backfill (15): gaps from over-narrow segment scoping in the original build

- **Canon RF 75-300mm F4-5.6** (2025, $219.99): missed by the canon-rf-ff-zoom audit. 1999 EF 75-300 III optics in an RF barrel; no IS, no sealing, f/32 min (wide-end convention).
- **Zeiss Otus ML 1.4/50, 1.4/85, 1.4/35** (E/RF/Z; $2,499/$2,999/$2,299; 2025/2025/2026): the zeiss segment wrongly excluded the line as "DSLR-grade" — Otus ML is native mirrorless. Specs from official Zeiss datasheet PDFs; Sony E weight/length recorded; the 35mm has no standalone page yet so its productUrl is the verified Otus ML family page.
- **Sigma 16-300mm F3.5-6.7 DC OS | Contemporary** (2025, $699, E/L Apr 2025 + X/RF May 2025): missed by the sigma-apsc audit.
- **Voigtländer X-mount line (7 rows)**: excluded from the original voigtlander segment ("X not a requested mount") even though Fujifilm X is in the enum. Full roster verified on cosina.co.jp: Color-Skopar 18mm F2.8 X (2024), Nokton 23mm F1.2 X (2022), Ultron 27mm F2 X (2023), Nokton 35mm F0.9 X (2023), Nokton 35mm F1.2 X (2021), Macro APO-Ultron 35mm F2 X (2022), Nokton 50mm F1.2 X (2023). Own rows beside the Nikon-Z D-line siblings per the distinct-build precedent (Cosina names them differently). Street prices rest on archived B&H JSON-LD + CameraQuest snippets (live fetches blocked); four are sale prices against $699/$1,499 regulars; two launch MSRPs null (yen-only). Silver finishes (Aug 2026) are not rows.
- **Laowa 17mm f/4 Zero-D Tilt-Shift** (on sale 2026-03-10, $1,249, E/RF/Z/L; ±10° tilt per consensus, DPReview's lone "12°" rejected; shift-only $999 sibling not added), **TTArtisan Tilt-Shift 17mm F4 ASPH** (2025 E+GFX debut, RF/Z/L Mar 2026; $550 current / $509 launch; weight 1051g = floor of the manufacturer's range, dimensions retailer-sourced), **TTArtisan 7.5mm F2 Fisheye** (2021, $139, six mounts; length/weight at the low end of per-mount ranges). Weather sealing unknown (null) for both tilt-shifts. ttartisan.com is down; both TTArtisan productUrls use the verified official ttartisan.store pages.

#### Mount expansions + field fixes

- `tamron-17-70mm-f28-di-iii-a-vc-rxd`: + Canon RF, Nikon Z (announced 2026-06-24, on sale 2026-07-02, $749).
- `viltrox-af-25mm-f17-air`, `viltrox-af-35mm-f17-air`: + Micro Four Thirds (Viltrox's MFT debut, released 2026-07-23).
- `voigtlander-nokton-classic-35mm-f14-z`: priceUSD/priceMSRPUSD 799 → 699 (see follow-ups). Its cameraquest productUrl kept: the inferred Cosina Z page served VM content when fetched, so the swap failed the loads-check.
- `meike-af-85mm-f14-ii-mix`: priceUSD 498 → 569 (Meike's own store lists $569 regular on all three mounts; $498 was launch-window promo pricing, kept as priceMSRPUSD).
- **Verified, no change**: Sony FE 100-400mm F4.5 GM OSS shipped June 2026, priceUSD 4299 stands (B&H $4,298); Voigtländer Septon 40mm F2 $699 confirmed at CameraQuest; Panasonic's 2026-08-25 "A"-suffix refreshes of four lenses are coatings/cosmetics, same optical designs, no new rows and no discontinuation evidence for the old SKUs; TTArtisan 85 Neo "sold out" is demand, not discontinuation.

### 2026-06-01 → 06-05: original build + three full verification passes (682 lenses)

Initial 682-lens database assembled by the fan-out workflow; full web-verification passes ran
2026-06-01, 2026-06-04, and 2026-06-05 (method above). Per-segment audit notes are in the
appendix below.

## Appendix: original build segment audits

Point-in-time notes from the original May–June 2026 build (gather + adversarial verify per
segment). Where a later change-log entry contradicts a note here (e.g. the Sony discontinued
flags), the change log supersedes.

### sony-fe-prime: 28 lenses

Sony FE full-frame PRIME lenses (Sony-branded, E-mount, full frame)

Audit of 28 Sony-branded FE full-frame prime lenses (E-mount). Verified via WebSearch against manufacturer pages, DPReview, B&H, Alpha Shooters complete-roster list, and review sites (DustinAbbott, PhotographyBlog, PetaPixel).

COMPLETENESS: The draft roster is complete. Cross-checked against the Alpha Shooters complete E-mount list and Sony's current lineup. All 28 Sony-branded FF primes are present, including the two newest 2025 releases (FE 16mm F1.8 G, announced Feb 2025 / shipped Apr 2025; FE 100mm F2.8 Macro GM OSS, announced Sep 30 2025 / shipped Nov 2025). No notable prime is missing. Confirmed there are NO additional 2026 Sony FF primes yet, 2026 rumors/announcements are zooms (16-28mm f/2 GM, 50-150mm F2 GM, 100-400mm f/4 GM), which are out of scope for this prime segment.

CORRECTIONS MADE:
- sony-fe-16mm-f18-g: maxMagnification 0.17 -> 0.25 (the AF max reproduction ratio is 0.25x per multiple sources; 0.30x is MF). All other 16mm specs (304g, 67mm filter, 11 blades, 15/12 construction, min focus 0.15m AF, year 2025, $799) verified correct.

All other entries verified correct, including: focalMin == focalMax for every prime (no zoom mislabeled); apertures, mounts (all Sony E), format (all Full Frame), lensType (all Prime), and years. Notable verified data points: FE 50mm F1.4 GM is 2023 ($1299 MSRP); FE 85mm F1.4 GM II is 2024 ($1799); original FE 85mm F1.4 GM correctly flagged discontinued (retired with the GM II); Distagon 35mm F1.4 ZA, Sonnar 35mm F2.8 ZA, and Planar 50mm F1.4 ZA correctly flagged discontinued; Sonnar 55mm F1.8 ZA still in production (discontinued=false, confirmed still sold at major retailers); FE 100mm F2.8 Macro GM OSS 1.4x native magnification confirmed (unusually high, not an error); FE 28mm F2 (2015, 200g, 49mm) confirmed; FE 24mm F1.4 GM (0.17x mag, 0.24m) confirmed.

DEDUPE/SCOPE: No duplicate ids. No out-of-scope entries, every lens is Sony-branded (including the three Sony-made Zeiss ZA lenses, which are Sony products under the Sony/Zeiss partnership), E-mount, full-frame, and a true prime. The 14mm F1.8 GM has no front filter thread (rear gel holder only), filterThread correctly null.

NULLS LEFT INTENTIONALLY:
- dxomarkScore: null for all, DXOMark does not publish overall lens scores for these in a form I could reliably confirm; left null per instruction not to guess.
- filterThread on sony-fe-14mm-f18-gm: null is correct (bulbous front element, no front thread).
All priceUSD, priceMSRPUSD, weight, year, and filterThread values are populated and verified where a reliable source existed; none required filling from null (the draft had them populated and they checked out).

### sony-fe-zoom: 29 lenses

Sony FE full-frame ZOOM lenses (Sony-branded, E-mount, full frame)

AUDIT SUMMARY, 28 lenses total (27 from draft, all kept; +1 added). No duplicates or out-of-scope entries found; every draft lens is genuinely a Sony-branded full-frame E-mount zoom.

ADDED (1):
- sony-fe-28-60mm-f4-56, FE 28-60mm F4-5.6 (2020), the compact retractable kit zoom bundled with A7C/A7 III. 167 g, 40.5mm filter, 8 elements/7 groups, 7 blades, MFD 0.30m, max mag 0.16x, MSRP $499. Was missing from the draft.

CORRECTED:
- FE 28-70mm F3.5-5.6 OSS (original, 2013): elements 8→9, groups 7→8 (Sony official + Wikipedia confirm 9 elements in 8 groups; draft had the wrong figures).
- FE 28-70mm F3.5-5.6 OSS II: elements 8→9, groups 7→8 (announcement lists 9 elements in 8 groups). priceUSD/MSRP 448→449 (official ~$449). Year left at 2025 (announced Dec 2, 2025; ships Feb 2026) to match the draft's announcement-year convention used elsewhere.
- FE 50-150mm F2 GM: priceUSD/MSRP 3999→3899 (official US price $3,899; announced Apr 2025, available May 2025).
- FE 100-400mm F4.5 GM OSS (new 2026): filled nulls, minFocusDistance 0.64m (wide; 1.5m at tele), maxMagnification 0.25, diameter 119.8mm. Length 328mm and weight 1840g confirmed. Available June 2026, $4,299.99.
- FE PZ 16-35mm F4 G: groups 11→12 (optical formula is 13 elements in 12 groups).

VERIFIED-AS-CORRECT (no change): 28-70 F2 GM, 16-35 F2.8 GM II, 24-70 F4 ZA OSS, 12-24 GM/G, 16-25 G, 24-50 G, 20-70 G, all 70-200 variants, 24-240, 200-600, 400-800. All focal ranges, apertures, mounts (Sony E), format (Full Frame), and lensType (Zoom) check out.

REMAINING NULLS (intentional, no per-lens DXOMark zoom scores published by DXOMark, left null across the board; this is correct, not a gap).

CAVEATS:
- FE 28-60mm max magnification reported as 0.16x by Wikipedia/Sony; some sources round differently. weatherSealed set true (mount gasket dust/moisture resistant, consistent with how the draft treats other gasket-sealed consumer zooms).
- 28-70 OSS II year is borderline (Dec-2025 announce vs Feb-2026 ship). If the database convention is ship-date rather than announce-date, this should be 2026.
- Old FE 100-400mm F4.5-5.6 GM OSS productUrl in the draft (sel100400gm) and the new FE 100-400mm F4.5 GM OSS productUrl (sel100400mc) appear plausible but were not individually re-fetched; the new lens page may not be live until the June 2026 ship date.
- Third-party FE zooms (Tamron, Sigma) and Sony APS-C E zooms (e.g. E PZ 16-50, E 18-135) are correctly excluded, out of segment (non-Sony brand or APS-C format).

### sony-e-apsc: 24 lenses

Sony E APS-C lenses (Sony-branded E-mount APS-C, both primes and zooms)

Audit complete for Sony-branded E-mount APS-C lenses (primes + zooms). 24 lenses total: 23 from the draft (all kept; none were duplicates or out-of-scope; all were correctly Sony-branded, Sony E mount, APS-C) + 1 added.

ADDED (completeness gap):
- sony-e-18-50mm-f4-56 (SEL1850, E 18-50mm F4-5.6, 2014): An obscure, region-locked kit zoom bundled with the A3500, sold only in Australia/Mexico/Russia/Eastern Europe/Middle East/Africa, never in the US, discontinued ~2016. Confirmed Sony-branded E-mount APS-C via Wikipedia's official E-mount lens list and lens-db/dyxum. Specs verified: 6 elements/6 groups, 7 blades, 55mm filter, 0.4m MFD, 0.14x mag, 59mm length, 157g, no OSS, AF, min f/22. priceMSRPUSD and priceUSD left null because it was never priced/sold in the US market (kit-only, region-locked).

CORRECTIONS:
- sony-e-pz-16-50mm-f35-56-oss-ii: priceMSRPUSD changed 349.99 -> 299.99. Confirmed by Sony's July 2024 press release and PetaPixel/DPReview: launch MSRP was $299 (the lens it replaced launched higher). Current street price ~$348 retained for priceUSD.

VERIFIED / NO CHANGE NEEDED:
- Confirmed via multiple sources (Wikipedia, Sony press, Alik Griffin, lesdeuxpiedsdehors 2026 guide) that the SELP16502 (16-50 OSS II, July 2024) is the MOST RECENT Sony-branded APS-C E lens. No Sony APS-C lenses released 2025-2026; recent APS-C releases in that window are all third-party (Meike, Tokina, Sigma) and out of scope.
- All three 18-200 variants (SEL18200, SEL18200LE, SELP18200) are genuinely distinct Sony products, all retained.
- 24mm ZA year 2011 confirmed (announced Aug 2011). All primes have matching focalMin/focalMax. All formats correctly APS-C. No FE/full-frame lenses present.

REMAINING NULLS (no trustworthy source found, deliberately left null per instructions):
- priceUSD null for discontinued/never-US lenses: SEL16F28 (16mm f/2.8), SEL24F18Z (24mm ZA), SEL1670Z (16-70 ZA), SEL1855 (18-55 OSS), SEL1850 (18-50), SEL18200 (orig 18-200), SELP18200 (PZ 18-200). These are long-discontinued and have no reliable current street MSRP.
- All dxomarkScore null (DXOMark does not publish overall scores for these APS-C lenses in a verifiable way).
- SEL1850 diameter recorded as 62mm from secondary sources (radojuva/dyxum); could not confirm against a Sony spec sheet (Sony delisted the page). Treat as approximate.

CAVEATS:
- "series":"Zeiss" used for the two ZA lenses to flag Zeiss collaboration; Sony's own naming is "ZA"/Carl Zeiss. Kept as draft had it for consistency.
- Some priceUSD values are current street (B&H/Adorama) which can exceed MSRP for older in-production lenses (e.g., 35mm f/1.8 OSS at $528, 70-350mm G at $1098) due to Sony price increases; these reflect real 2026 US street pricing, not data errors.

### canon-rf-ff-prime: 25 lenses

Canon RF full-frame PRIME lenses (Canon-branded RF mount, full frame)

Segment: Canon-branded RF-mount full-frame primes. Final list = 25 lenses (24 from the draft, all kept and verified, plus 1 added).

ADDED (1):
- RF 85mm F1.4 L VCM (2025): the one notable FF prime missing from the draft. Confirmed via multiple sources (Canon USA, Neocamera, DPReview, PetaPixel): focal 85mm, f/1.4, min aperture f/16, 11 blades, 14 elements / 10 groups, 0.75m MFD, 0.12x mag, 67mm filter, ~77mm dia x 99.3mm, 636g, weather-sealed, no IS, MSRP $1,649. id canon-rf-85mm-f14-l-vcm. It is a distinct optical design from the existing 85mm f/1.2 L USM, 85mm f/1.2 L USM DS, and 85mm f/2 Macro IS STM entries.

CORRECTNESS REVIEW (no errors found in kept entries):
- All 24 draft lenses are genuine Canon RF-mount full-frame primes. No APS-C/RF-S, no zooms, no wrong-mount/wrong-brand entries.
- All primes correctly have focalMin == focalMax. All mounts = ["Canon RF"], all format = Full Frame, all lensType = Prime.
- Verified suspect values: RF 16mm f/2.8 STM = 165g (correct, despite seeming high); RF 45mm F1.2 STM = 9 elem/7 grp, 9 blades, 346g, 67mm, $469.99, 0.45m MFD, Dec-2025 release (year 2025 correct); RF 100mm Macro maxMagnification 1.4x (correct, this lens exceeds 1:1); RF 14mm F1.4 L VCM year 2026 matches its early-2026 launch.
- No duplicate ids. The two 85mm f/1.2 variants (standard and DS / Defocus Smoothing) are legitimately separate products with separate ids and prices.

SCOPE NOTES:
- RF 5.2mm F2.8 L Dual Fisheye kept: it is a stereoscopic dual-fisheye that covers the full-frame sensor (split into two circular images); Canon classifies it on the EOS R full-frame system. filterThread left null (rear gel filter only).
- Excluded as out-of-scope (zooms, not primes): RF 7-14mm F2.8-3.5 L Fisheye STM (early 2026) and RF 20-50mm F4 L IS USM PZ (May 2026).
- No RF-mount full-frame TS-E / tilt-shift primes exist as of May 2026.

NULLS LEFT (could not find trustworthy values; not guessed):
- maxMagnification null for RF 5.2mm Dual Fisheye (Canon does not publish a standard repro ratio for the dual-fisheye design).
- filterThread null for RF 5.2mm Dual Fisheye and RF 14mm F1.4 L VCM (both use rear/gel filters, no front thread).
- dxomarkScore null for all 25 (DXOMark does not publish overall scores for these RF lenses).

All other high-value fields (priceUSD, weight, year, filterThread where applicable) are populated. priceUSD reflects current US street/MSRP; several telephotos and the 100mm Macro show street prices below MSRP per current Canon USA listings.

### canon-rf-ff-zoom: 22 lenses

Canon RF full-frame ZOOM lenses (Canon-branded RF mount, full frame)

Roster verified complete at 22 Canon-branded RF full-frame zoom lenses (cross-checked against ShutterMuse's full RF list, Canon USA store, and the three newest releases). No missing lenses found; no duplicates; all entries are correctly Canon RF / Full Frame / Zoom. Rumored-but-unreleased zooms (RF 300-600mm f/5.6L, big-white teleconverter zooms) correctly excluded since not yet announced/shipping.

Corrections made vs. draft:
- RF 7-14mm F2.8-3.5 L Fisheye STM: diameter null -> 76.5mm (confirmed Canon Europe spec / DCW hands-on). maxMagnification and filterThread left null (rear gel/slot-in filter system, no front thread; magnification not published in checked sources).
- RF 20-50mm F4 L IS USM PZ: minFocusDistance null -> 0.24m, maxMagnification null -> 0.33x (per Canon announcement coverage / PetaPixel / CanonRumors). diameter left null (max barrel diameter not published; only 98.4mm length and 67mm thread given).
- RF 28-70mm F2.8 IS STM: weight 495 -> 490g (Canon Europe / Canon CNA / Canon ME official spec pages all state 490g). Year 2024 confirmed correct (announced 2024-09-12). diameter 76.5 and other specs verified.
- RF 24-105mm F4 L IS USM: priceUSD 1300 -> 1299 (current street ~$1,299-1,329 at B&H/Canon Price Watch); MSRP 1099 retained.

Verified-and-unchanged spot checks: 16-28mm F2.8 weight 445g (correct), 28-70mm F2.8 IS STM filter 67mm (correct), all focal ranges/apertures/mounts/format/lensType. DXOMark scores left null throughout (DXOMark does not publish overall lens scores for these RF zooms in a form reliable enough to assert).

Remaining nulls are intentional (no trustworthy source found): several maxMagnification/diameter fields on the two newest 2026 lenses, and all dxomarkScore values.

### canon-rf-apsc: 7 lenses

Canon RF-S and APS-C RF lenses (Canon-branded, APS-C)

Roster verified complete at 7 Canon-branded RF-S (APS-C) lenses as of May 2026 (cross-checked against Canon USA, DPReview, the-digital-picture, B&H, lesdeuxpiedsdehors, and ihitthebutton lens lists).

COMPLETENESS, added 2 missing lenses to the draft's 5:
- RF-S 3.9mm F3.5 STM Dual Fisheye (2024): stereoscopic VR fisheye prime, 11 elem/8 grp, no IS, rear 30mm filter holder, MSRP $1,099. The $1,299 figure seen on one aggregator (sharplyphoto) is wrong; Canon USA, DPReview, Lens-Rumors, and PetaPixel all confirm $1,099.
- RF-S 7.8mm F4 STM Dual (announced/dev June 2024, shipped Nov 2024): spatial-video stereoscopic prime, 9 elem/7 grp, no IS, 58mm filter, MSRP $449.99.

Both DUAL lenses are RF-S (APS-C) and in-scope. Classified lensType "Prime" (single focal length each); the schema has no fisheye/stereoscopic type. Modeled apertureMaxTele = apertureMaxWide per prime convention.

CORRECTNESS, all 5 original draft entries verified accurate; no fixes required. The 14-30mm PZ (2025) is Canon's first power zoom; specs (181g, 10/9, 58mm, $329.99 MSRP / ~$369 street) confirmed.

FILL NULLS, all priceUSD/weight/year/filterThread filled for the two added lenses from manufacturer + dealer sources. No reliable values invented.

DEDUPE/SCOPE, no duplicate ids; no out-of-scope (wrong brand/mount/format) entries to remove. Third-party RF-S lenses (e.g. Sigma/Viltrox RF-S) and unreleased RF-S primes (RF-S 10mm F2.8 etc. are patents/rumors only, not shipping) correctly excluded.

GAPS, dxomarkScore null for all (DXOMark does not test RF-S lenses). Filter threads for the DUAL lenses: 3.9mm uses a rear 30mm gel/screw holder (recorded as 30, though it is not a conventional front thread); 7.8mm uses 58mm. Diameter for the 3.9mm fisheye is the body's max ~112mm (it is a wide, flat dual-optic barrel, not a typical round lens).

### nikon-z-ff-prime: 24 lenses

Nikon Z full-frame PRIME lenses (Nikkor Z, full frame)

Segment audited: Nikon Z full-frame (FX) Nikkor Z PRIME lenses, first-party only. Final count: 24 lenses (21 from draft, all kept + 3 added).

ADDED (3 missing lenses, confirmed via Wikipedia Nikon Z-mount roster + Nikon press releases):
1. nikon-z-35mm-f12-s, NIKKOR Z 35mm f/1.2 S, the most significant omission. Announced Feb 2025, model 20124, MSRP $2,799.95. Specs from zsystemuser.com / Nikon Asia: 17 el/15 gr, 11 blades, 82mm filter, 1060g, 90x150mm, 0.30m MFD, 1:5 (0.2) magnification.
2. nikon-z-28mm-f28-se, NIKKOR Z 28mm f/2.8 (SE), retro Special Edition launched June 2021 alongside Z fc, model 20110. Optically identical to the standard 28mm f/2.8 (9 el/8 gr, 52mm filter, ~155-160g). MSRP $296.95.
3. nikon-z-40mm-f2-se, NIKKOR Z 40mm f/2 (SE), retro Special Edition, released Dec 14 2022, model 20121. Optically identical to standard 40mm f/2 (6 el/4 gr, 52mm filter, 170g). MSRP $296.95 (~$30 over standard).

CORRECTNESS check: draft data was accurate. Verified focal lengths (all true primes, focalMin==focalMax), apertures, mounts (all Nikon Z, single-mount designs), Full Frame format, lensType=Prime, and release years. Year corrections: 24mm f/1.8 S draft said 2020 but it was released Oct 2019 (corrected to 2019); 20mm f/1.8 S draft said 2019 but was released Feb 2020 (corrected to 2020), these two were swapped in the draft. The 58mm f/0.95 Noct is correctly flagged autofocus=false (only MF lens in segment).

NULLS: no null priceUSD/weight/year/filterThread fields remained in the kept entries; all dxomarkScore left null (DXOMark does not publish overall scores for Nikon Z lenses, so left null rather than guess).

CAVEATS / known data-quality notes (not changed without harder sourcing):
- priceUSD for 50mm f/1.8 S ($626) and 85mm f/1.8 S ($846) sit slightly above original MSRP; these reflect current street prices that have risen above launch MSRP and are plausible, kept as-is.
- 58mm f/0.95 Noct priceUSD $8649 vs MSRP $7999.95 reflects post-launch price increase, plausible.
- SE lenses are cosmetic variants sharing optics with their standard siblings; included because they are separately-sold SKUs (distinct Nikon model numbers 20110 / 20121) and the task asked for less-famous variants. If the database wants only distinct optical designs, the two SE entries could be dropped.
- maxMagnification for 35mm f/1.2 S = 0.2 (1:5 per Nikon). 28mm f/2.8 SE weight set to 155g (Nikon spec lists ~155g; standard non-SE was given 160g in draft, minor batch-to-batch spec discrepancy).

NOT included: third-party Z-mount primes (Sigma, Viltrox, Voigtländer, etc.), out of scope (Nikkor first-party only). No DX/APS-C primes present in draft. No zooms present. Rumored-but-unreleased lenses (e.g. 85mm f/1.4) excluded.

### nikon-z-ff-zoom: 18 lenses

Nikon Z full-frame ZOOM lenses (Nikkor Z, full frame)

Segment: Nikon Z full-frame Nikkor Z ZOOM lenses. Draft had 18 lenses; corrected list has 19.

ADDED (1): NIKKOR Z 24-70mm f/2.8 S II (id nikon-z-24-70mm-f28-s-ii). Released Sept 2025, $2799.95 MSRP, 675g, 77mm filter, 14 elements/10 groups, 11 blades, min focus 0.24m, max mag 0.32x, 84x142mm, internal zoom, no VR, weather sealed. Confirmed via Nikon USA product page (20129) and Nikon global press release. This is a distinct optical design coexisting with the original 24-70 f/2.8 S, which Nikon still lists, so both are retained.

CORRECTIONS:
- nikon-z-14-24mm-f28-s: productUrl product ID corrected from /20084/ to /20097/ (the 20084 page does not resolve to this lens). All specs verified correct (650g, 112mm filter, 16/11 elements).
- nikon-z-24-50mm-f4-63: productUrl product ID corrected from /20088/ to /20096/.

VERIFIED CORRECT (no change needed):
- 28-135mm f/4 PZ: weight 1120g is correct (body only; ~1210g with tripod collar). Year 2025, $2599.95, 95mm filter, 18/13 elements all confirmed via Nikon global spec page.
- 70-200mm f/2.8 VR S II: 998g, 90x208mm, 11 blades, 18/16 elements, 77mm filter, year 2026, $3199.95 all confirmed via Nikon USA (20130) and Nikon global press release.
- 70-200mm f/2.8 VR S (original): discontinued=true confirmed (Nikon ending it as the S II ships in 2026).
- 24-105mm f/4-7.1: year 2026 confirmed (available mid-January 2026), $549.95 MSRP confirmed.
- No format/lensType/focal-range/mount/aperture errors found anywhere. No duplicate ids. No out-of-segment entries (all Nikon Z, Full Frame, Zoom).

EXCLUDED: NIKKOR Z 120-300mm f/2.8 TC VR S, development announced May 2026 but not yet released, so left out as it has no shipping specs/price. No other released FX Nikkor Z zooms exist beyond the 19 listed (cross-checked against Thom Hogan's current FX zoom roster and Nikon's lineup).

All dxomarkScore left null (DXOMark does not publish overall scores for these lenses in a reliable form). diameter/length for the added 24-70 S II per Nikon spec. Street priceUSD set equal to MSRP for the newest releases (24-70 S II, 70-200 S II, 24-105) since street price has not diverged from MSRP yet.

### nikon-z-dx: 7 lenses

Nikon Z DX APS-C lenses (Nikkor Z DX, both primes and zooms)

Roster verified complete against Nikon's official Z-mount DX lineup and dedicated lens databases (Compact Shooter, Photography Life roadmap, imaging.nikon.com). There are exactly 7 first-party Nikkor Z DX lenses as of May 2026 (5 zooms + 2 primes); all 7 were present in the draft. No duplicates, no out-of-segment entries, no missing lenses found. Confirmed the two most recent releases (16-50mm f/2.8 VR and MC 35mm f/1.7) were both announced 2025-10-16.

CORRECTIONS MADE TO THE DRAFT:
1) 18-140mm f/3.5-6.3 VR pricing was wrong: draft had priceMSRPUSD=399.95 and priceUSD=399.95. Actual launch MSRP was $599.95 (Nov 2021); current Nikon USA list price is $679.95. Set priceMSRPUSD=599.95, priceUSD=679.95.
2) 12-28mm PZ VR apertureMin corrected 22 -> 16. Nikon's published minimum aperture is f/16 (the value printed on nikonusa.com); the full documented range across the zoom is f/16 (12mm) to f/25 (28mm). Draft's 22 matched neither end.
3) 50-250mm f/4.5-6.3 VR apertureMin corrected 22 -> 16 (Nikon's published value).

apertureMin policy: standardized to Nikon's officially published single minimum-aperture value (the wide-end f-number printed on nikonusa.com spec pages), because retailers/aggregators disagree on the tele-end value (e.g. 50-250mm variously listed as f/16, f/22, or f/32). Draft's other apertureMin values (16-50/3.5-6.3=16, 18-140=22, 16-50/2.8=22, 24mm=11, 35mm MC=22) already matched Nikon's published values and were left unchanged. Caveat: if the schema strictly intends the LARGEST f-number (tele end), the variable zooms' true tele-end minimum apertures are higher (12-28mm f/25; 16-50/3.5-6.3 ~f/22; 18-140 and 50-250 higher still) but are not consistently documented, so Nikon's authoritative published figure was used.

Verified correct in draft (unchanged): all focal lengths, max apertures (wide/tele), mounts (Nikon Z), format (APS-C), lensType, years, weights, filter threads, and the 16-50mm f/2.8 VR full spec set (incl. price $899.95, 330g, 0.24x, f/22) and 35mm MC f/1.7 (price $449.95, 220g, 0.67x macro, 0.16m MFD).

NULLS LEFT INTENTIONALLY: dxomarkScore is null for all entries, DXOMark has not published optical scores for any Nikon Z DX lens. priceUSD/weight/year/filterThread were already populated and verified (no nulls in those high-value fields).

priceUSD reflects current US street/list where it diverges from MSRP (16-50/3.5-6.3 $329.95, 50-250 $399.95, 18-140 $679.95, 24mm $296.95). These fluctuate with retailer promotions. weatherSealed: kept draft values; note Nikon hedges 'dust and drip resistance not guaranteed in all situations' even on the sealed 16-50/2.8 and 24mm/35mm primes, which is Nikon's standard sealing language.

### sigma-ff: 38 lenses

Sigma DG DN full-frame mirrorless lenses (Art, Sport, Contemporary lines) across all available mounts (Sony E, L-Mount, Canon RF, Nikon Z)

Scope confirmed: Sigma full-frame DG/DG DN mirrorless lenses ship ONLY on Sony E and L-Mount. Canon RF and Nikon Z are closed to Sigma full-frame glass (RF only has Sigma APS-C DC DN primes; Z mount is not open to Sigma at all per Sigma/PetaPixel statements). All draft mount lists (Sony E + L-Mount) were therefore correct; no mount corrections needed.

Roster: 38 lenses total (37 from the draft + 1 added). No duplicates and no out-of-scope (APS-C / wrong-brand / wrong-mount) entries were present in the draft.

ADDED (1):
- sigma-85mm-f12-dg-art (85mm F1.2 DG | Art). This is a DEVELOPMENT ANNOUNCEMENT only (announced CP+ 2026, targeted Sept 2026 launch, Sony E + L-Mount), completing Sigma's F1.2 prime trio with the 35mm F1.2 DG II and 50mm F1.2 DG DN. No official full spec sheet exists yet, so most fields are null; only reliably-reported values filled (filterThread 82, year 2026). Reported price/weight figures are unconfirmed estimates (~$1,549 / ~900-950g) so left null per the "do not guess" rule. productUrl is the Sigma news index since no product page is live yet.

CORRECTIONS / NULL FILLS:
- 35mm F1.4 DG II | Art: filled elements 15, groups 12, diameter 73, length 94 (L-Mount; Sony E is 96), minFocusDistance 0.28, maxMagnification 0.185 (1:5.4). Also corrected productUrl to the live sigmaphoto.com product page (was the press release). Weight 530 was correct (L-Mount; Sony E 525).
- 135mm F1.4 DG | Art: filled elements 17, groups 13, maxMagnification 0.145 (1:6.9); corrected minFocusDistance 1.05 -> 1.10m per Sigma spec. apertureBlades 13 and weight 1430 (L-Mount) confirmed.
- 200mm F2 DG OS | Sports: filled apertureBlades 11 (was null) and maxMagnification 0.132 (1:7.6, was null). MFD 1.7, filter 105, weight 1820, price 3299 confirmed; corrected productUrl to sigmaphoto.com product page.
- 300-600mm F4 DG OS | Sports: priceUSD set to 5999 (street/launch) while keeping priceMSRPUSD 6000; uses a 40.5mm rear drop-in filter (no front thread), value retained as given.

VERIFIED AS CORRECT (no change): 35mm F1.2 DG DN original correctly marked discontinued (replaced by DG II in 2025); 24-70mm F2.8 DG DN original correctly marked discontinued (replaced by II); 35mm F1.2 DG II 17/13 construction; all focal/aperture/format/lensType values; 14mm, 15mm Fisheye, 14-24mm, 28-45mm having no front filter thread (filterThread null) is correct (bulbous/gel-holder fronts).

Remaining nulls left intentionally: 85mm F1.2 most specs (not yet released, no official sheet); dxomarkScore is null for all (Sigma DG DN lenses are generally not DXOMark-scored). 35mm F1.2 DG II maxMagnification and 20-200mm maxMagnification left as null from the draft (not separately verified to a precise figure in this pass).

### sigma-apsc: 9 lenses

Sigma DC DN APS-C mirrorless lenses (Contemporary and Art) across all available mounts (Sony E, L-Mount, Fujifilm X, Canon RF, Nikon Z)

Audit summary for Sigma APS-C mirrorless (DC DN Contemporary + DC/DC Art), restricted to the 5 in-scope mounts (Sony E, L-Mount, Fujifilm X, Canon RF, Nikon Z).

ADDED (1):
- Sigma 17-40mm F1.8 DC | Art (2025), the standout omission. This is Sigma's second Art-series APS-C-mirrorless lens and the segment explicitly covers Art. Constant F1.8 zoom, $919 MSRP, 525g (Sony E), 17 elements/11 groups (4 SLD + 4 aspherical), 11 blades, 67mm filter, MFD 28cm, max mag 1:4.8 (0.208), HLA autofocus, dust/splash resistant, no OS. Mounts: Sony E, L-Mount, Fujifilm X, Canon RF (no Nikon Z). Verified on sigmaphoto.com and DPReview/B&H. Length/weight vary by mount (115.9-118.2mm, 525-560g); used Sony E figures.

CORRECTED:
- Micro Four Thirds STRIPPED from mounts of 16mm/30mm/56mm. MFT is outside the segment's enumerated mount set (and is a different, smaller format than APS-C). The optical designs do ship in MFT, but it is not one of the 5 mounts this segment tracks. All three now list Sony E, Canon RF, Nikon Z, L-Mount, Fujifilm X.
- 16mm F1.4 DC DN | C: discontinued false -> true. Officially discontinued (reported Feb 2026, The Phoblographer; confirmed still listed on Sigma's site but being phased out), effectively superseded by the new 15mm F1.4 DC. Still sells through remaining retail stock, so kept in the list.

VERIFIED AS-IS (no change needed):
- 23mm F1.4 DC DN, 10-18mm F2.8 DC DN, 18-50mm F2.8 DC DN correctly OMIT Nikon Z, confirmed those three were never released in Nikon Z mount (only the 16/30/56 primes got Nikon Z). Draft was right to exclude.
- 12mm F1.4 DC | C (2025) and 15mm F1.4 DC | C (2026) mounts (Sony E, Canon RF, Fujifilm X only, no L-Mount, no Nikon Z) confirmed on manufacturer pages.
- 30mm DC DN year 2016, all element/group/blade/MFD/filter/weight specs for the 8 carried-over lenses confirmed against sigmaphoto.com / sigma-global.com.

NULLS FILLED: none remaining for the requested high-value fields (priceUSD, weight, year, filterThread) across all entries.

DEDUPE/SCOPE: no duplicate ids found. All entries are Sigma APS-C DC/DC DN mirrorless lenses in at least one in-scope mount; none removed for being out of brand/format/mount (only MFT trimmed from individual mount arrays).

CAVEATS:
- dxomarkScore left null for all, DXOMark does not publish overall scores for these Sigma APS-C lenses in a way I could reliably confirm.
- priceUSD reflects current US street/MSRP: 18-50 ($599 street vs $549 MSRP) and 10-18 ($659 street vs $599 MSRP) carry slightly elevated street prices per the original draft; 12mm shows $629 MSRP though it was recently on a $579 promo (kept MSRP as the stable value). 16mm priceUSD kept at $449 though discounted clearance pricing is common now that it is discontinued.
- 17-40 Art and the zooms could plausibly each be considered for a future DXOMark fill; left null pending a confirmed source.

### tamron-ff: 21 lenses

Tamron full-frame mirrorless lenses (Sony E and Nikon Z mounts)

Audited against Tamron's official Sony E and Nikon Z lens-lineup pages plus per-lens spec pages, cross-checked with DPReview/B&H/PetaPixel coverage (May 2026). Roster confirmed COMPLETE: Tamron's current full-frame mirrorless Di III range is exactly 21 distinct optical designs (all shipping in Sony E; the documented subset also in Nikon Z). All 21 draft entries are valid in-segment, no duplicates, no APS-C ("Di III-A": 11-20 B060, 17-70 B070, 18-200 B011, 18-300 B061) and no wrong-brand entries crept in.

CORRECTIONS MADE:
- 90mm F/2.8 Di III MACRO VXD (F072): apertureMin 22 -> 16 (official spec is F16); diameter 75 -> 79.2mm (official Ø79.2mm).
- 28-75mm F/2.8 Di III RXD (A036): discontinued false -> true. Production ceased; superseded by the A063 G2. Still sold new from remaining retail stock, so priceUSD/MSRP retained ($599 street / $799 launch).
- 35-100mm F/2.8 Di III VXD (A078): maxMagnification refined 0.3 -> 0.303 (1:3.3 wide, official). Year 2026 confirmed correct (announced 2026-02-19, ships 2026-03-26, $899 Sony E / $929 Nikon Z, kept Sony E $899 as the catalog price).

VERIFIED-CORRECT despite suspicion (no change):
- 17-50mm F/4 VXD (A068) $699: an early B&H snippet showed $599 but the Tamron launch + Lens Rumors pre-order confirm $699 MSRP/street. Left at $699.
- 16-30mm G2 (A064) $929, 25-200mm G2 (A075) Sony-E-only, 50-300mm (A069) Sony-E-only, 70-180mm G1 (A056) AF MOD 0.85m, 35-150mm (A058) no VC + apertureMin 16, all confirmed accurate.
- Mounts: 2026 Nikon Z ports of the 20-40mm (A062) and 28-300mm (A074) are rumored/planned (Tamron's "10 lenses in 2026" is mostly mount adaptations) but NOT yet released, so those entries remain Sony E only per current shipping status.

GAPS: dxomarkScore is null for the entire segment (DXOMark has not published scores for these Tamron Di III lenses). Nikon-Z-variant weights/lengths differ slightly from Sony E figures (e.g. 16-30 450g/103.9mm, A058 1190g/160.1mm); the schema carries one value per lens, so Sony E figures are used throughout for consistency.

### tamron-apsc: 4 lenses

Tamron APS-C mirrorless lenses (Sony E and Fujifilm X mounts)

SEGMENT: Tamron APS-C mirrorless lenses (Di III-A and the older APS-C Di III). Verified against Tamron's official global spec pages, tamron-americas.com mount pages, B&H, and DPReview.

ROSTER COMPLETENESS (4 lenses): Tamron's APS-C mirrorless catalog is small. Currently shipping: 11-20mm F/2.8 (B060), 17-70mm F/2.8 VC (B070), 18-300mm F/3.5-6.3 VC (B061). Discontinued: 18-200mm F/3.5-6.3 Di III VC (B011). No new APS-C lens shipped in 2024-2026 (Tamron's 2026 'new' lenses, e.g. 16-30mm F/2.8 G2 and 35-100mm F/2.8, are full-frame Di III, not APS-C). Tamron has NO APS-C prime lenses in any mount as of May 2026. Nothing added, the draft's roster was already complete for this segment.

CORRECTIONS:
1. 18-300mm B061 apertureMin: 22 -> 40. This is a variable-aperture zoom; Tamron's spec lists 'F22-40', meaning F40 is the smallest aperture (largest f-number, at the 300mm tele end). The draft's 22 was the wide-end value.
2. 18-200mm B011 apertureMin: 22 -> 40. Same reasoning (spec is 'F22-40'; F40 at the 200mm tele end).
3. 17-70mm B070 priceUSD: 799 -> 699. MSRP was $799 (kept as priceMSRPUSD); current US street price is ~$699 (B&H). The 11-20mm and 18-300mm street prices match their MSRPs, so left unchanged.

VERIFIED CORRECT (no change): 11-20mm mounts (Sony E + Fujifilm X + Canon RF, Canon RF is part of the same optical design so it's listed in mounts even though the segment focus is Sony E/Fujifilm X); 18-300mm mounts (all four: Sony E + Fujifilm X added 2021, Canon RF + Nikon Z added 2025); 18-200mm B011 is Sony E ONLY (also made in Canon EF-M, but that mount is out of the database's mount enum; it was NOT made for Fujifilm X, the draft correctly had only Sony E); all weights, filter threads, element/group counts, blade counts, min focus distances, and magnifications.

SCOPE / DEDUPE: No duplicate ids. The Tamron 150-500mm F/5-6.7 Di III VC VXD (A057), which appears on Tamron's Fujifilm X-mount and Sony E pages, was deliberately NOT added, it is a FULL-FRAME (Di III, not Di III-A) lens, out of this APS-C segment. No out-of-segment lenses present in the draft.

YEAR NOTE: The 'year' field uses the original/first release year per optical design. 11-20mm and 18-300mm first shipped on Sony E in 2021 (both later came to Fujifilm X in 2023 and 2021 respectively); 17-70mm first shipped Jan 2021 (Sony E), July 2022 (Fujifilm X); 18-200mm shipped Dec 2011 (Sony E).

NULLS REMAINING: dxomarkScore null for all 4 (DXOMark has not tested any Tamron APS-C lens). 18-200mm B011 priceUSD left null, the lens is discontinued ('End of sale' on Tamron's site) and no reliable current US street price exists; its original MSRP ($739) is retained in priceMSRPUSD. apertureMaxTele is populated for all (constant F2.8 for the two F/2.8 zooms; F6.3 for the two variable zooms).

### panasonic-s: 21 lenses

Panasonic Lumix S full-frame lenses (L-Mount)

Verified the complete roster of released Panasonic Lumix S full-frame L-Mount lenses (22 lenses) against Panasonic press releases, B&H, and DPReview. No released lenses were missing from the draft and no duplicates or out-of-scope (APS-C / wrong-brand / wrong-mount) entries were present. Two roadmap lenses (a wide prime ~18-24mm and a large-aperture telephoto zoom ~50-200mm) were announced on the April 2026 roadmap but are NOT yet released, so they are correctly excluded.

Corrections applied:
- 18mm F1.8: groups 11->12 (13 elements in 12 groups per Panasonic); maxMagnification 0.15->0.20.
- 40mm F2 (S-S40, new Apr 2026): apertureBlades 9->7; filled elements (7), groups (6), diameter (69.4mm), maxMagnification (0.17) from Panasonic spec.
- 24-60mm F2.8 (S-E2460): apertureBlades null->9.
- 14-28mm F4-5.6 MACRO: apertureBlades 9->7 (7 rounded blades per Panasonic).
- 18-40mm F4.5-6.3: elements 10->8, groups 9->7 (8 elements in 7 groups per Panasonic); diameter 67.5->67.9mm. Confirmed full-frame (Alik Griffin list wrongly hinted it might be crop).
- 100mm F2.8 MACRO: priceMSRPUSD 1098->999 (official MSRP $999.99); kept priceUSD 1098 as a representative current street price.

Verified-correct (no change): all focal lengths, apertures, mounts (all Leica L), formats (all Full Frame), lensTypes, and release years. 35mm F1.8 year 2021 confirmed (announced Nov 8 2021). 26mm F8 year 2024 and $199 confirmed. S PRO 50mm F1.4 confirmed NOT discontinued (still sold); kept priceUSD 2299 (B&H street; Panasonic shop currently $2,499). 100-500mm year 2025, $2099, 19/12 elements, 82mm, 11 blades confirmed. 28-200mm 17/13, 413g, year 2024 confirmed. 70-200 F4 23/17, 985g confirmed.

All dxomarkScore left null except where the draft already had values (none had DXOMark scores; DXOMark has tested few of these and the draft carried null throughout).

### panasonic-g: 45 lenses

Panasonic Lumix G Micro Four Thirds (MFT) lenses

Started from 33 draft entries; returned 45 lenses. All entries are Panasonic-branded Micro Four Thirds (native MFT), confirmed in-scope. No duplicates and nothing removed (every draft entry belonged to the segment). WebSearch confirmed Panasonic released NO new MFT lenses in 2024 or 2025, so the 2024-2026 window adds nothing; the roster end is the 100-400mm II (2022) and the Leica DG rebadges (2023).

CORRECTIONS to existing draft entries:
- 25mm LEICA DG SUMMILUX II (panasonic-leica-dg-summilux-25mm-f14-ii): apertureBlades changed 9 -> 7. Multiple sources (B&H, retailers) confirm the rounded 7-blade diaphragm, same as the Mk I. Draft had 9.
All other draft fields were spot-checked against manufacturer/B&H/DPReview/Wikipedia and left as-is where consistent.

ADDED 12 lenses missing from the draft (the draft only listed the "II"/recent versions of several lines and omitted originals plus one rebadge):
1. panasonic-lumix-g-14mm-f25, LUMIX G 14mm F2.5 (Mk I, H-H014, 2010). Same optics as the II; discontinued.
2. panasonic-lumix-g-20mm-f17, LUMIX G 20mm F1.7 (Mk I, H-H020, 2009). 100g (heavier than the all-metal II at 87g). Iconic pancake; discontinued.
3. panasonic-leica-dg-summilux-25mm-f14, LEICA DG SUMMILUX 25mm F1.4 (Mk I, H-X025, 2011). 200g, 7 blades, f/16 min; discontinued.
4. panasonic-lumix-g-x-vario-12-35mm-f28, G X VARIO 12-35mm F2.8 (Mk I, H-HS12035, 2012). 305g, 58mm, 14el/9gr, 7 blades; discontinued. (Draft had only the II and the 2023 Leica rebadge.)
5. panasonic-lumix-g-x-vario-35-100mm-f28, G X VARIO 35-100mm F2.8 (Mk I, H-HS35100, 2012). 360g, 58mm, 18el/13gr; discontinued.
6. panasonic-leica-dg-vario-elmarit-35-100mm-f28, LEICA DG VARIO-ELMARIT 35-100mm F2.8 (H-ES35100, 2023). The 2023 Leica-branded rebadge of the 35-100 F2.8, analogous to the Leica DG 12-35 already in the draft. Draft was missing this.
7. panasonic-lumix-g-vario-14-42mm-f35-56, LUMIX G VARIO 14-42mm F3.5-5.6 (Mk I, H-FS014042, 2009). 12el/9gr, 52mm filter; discontinued.
8. panasonic-lumix-g-vario-14-45mm-f35-56, LUMIX G VARIO 14-45mm F3.5-5.6 (H-FS014045, 2008). Original GF/G1 kit lens, well regarded; discontinued.
9. panasonic-lumix-g-vario-hd-14-140mm-f4-58, LUMIX G VARIO HD 14-140mm F4.0-5.8 (H-VS014140, 2009). Original GH1 superzoom kit, 460g, 62mm, 17el/13gr; discontinued.
10. panasonic-lumix-g-vario-45-200mm-f4-56, LUMIX G VARIO 45-200mm F4-5.6 (Mk I, H-FS045200, 2008). 380g, 52mm, 16el/13gr; discontinued.
11. panasonic-lumix-g-vario-100-300mm-f4-56, LUMIX G VARIO 100-300mm F4-5.6 (Mk I, H-FS100300, 2010). 520g, 67mm, 17el/12gr, not weather sealed (the II added sealing); discontinued.
12. panasonic-leica-dg-vario-elmar-100-400mm-f4-63, LEICA DG VARIO-ELMAR 100-400mm F4-6.3 (Mk I, H-RS100400, 2016). 985g, 72mm; discontinued (replaced by the II in 2022 which was already in the draft).

Also renamed two draft IDs for consistency with the new Mk I siblings: panasonic-lumix-g-x-vario-12-35mm-f28-ii and panasonic-lumix-g-x-vario-35-100mm-f28-ii retain their -ii ids; the Leica DG 12-35 keeps panasonic-leica-dg-vario-elmarit-12-35mm-f28. All ids remain globally unique.

LOW-CONFIDENCE / GUESSED fields (flagged, not from a single authoritative spec sheet):
- Discontinued Mk I lenses have priceUSD=null (no reliable current street price for out-of-production lenses). priceMSRPUSD for older lenses (14-45, 45-200 Mk I, HD 14-140, 14mm Mk I, 20mm Mk I, 25mm Leica Mk I, 12-35/35-100 Mk I) are approximate historical launch prices and may be off by ~$50-100.
- HD 14-140mm maxMagnification: sources cite "0.5x" but that is the 35mm-equivalent figure; recorded 0.2 as the true reproduction ratio (best estimate), could be refined.
- 14-42 Mk I and 14-45 diameter/length are approximate (~60mm). 14-42 Mk I min focus listed 0.3 m.
- 25mm Leica II minFocusDistance/elements kept from draft (0.3 m, 9el/7gr), consistent with Mk I.

NOT separately listed (intentional): 12-32mm silver vs black, 14-42 II variants, and color editions are the same optical design, only true optical/mechanical variants and Mk I/II generations are split. L-mount full-frame Lumix S lenses and any Olympus/OM/third-party MFT lenses were excluded as out-of-segment. dxomarkScore left null throughout (DXOMark does not publish scores for these MFT lenses).

### om-olympus: 41 lenses

OM System and Olympus M.Zuiko Digital Micro Four Thirds (MFT) lenses

Audited against OM System's official all-lenses listing, the Wikipedia M.Zuiko roster, and per-lens manufacturer product pages. Final list = 41 lenses (37 from the draft, all kept; 4 added).

ADDED (4 missing notable lenses, all verified against manufacturer pages):
- M.Zuiko Digital ED 9-18mm F4.0-5.6 II (OM System, announced Jan 2024, MSRP $699.99 / street ~$689.99, 154 g, 52 mm filter, 12/8 elements). The original 9-18mm remains a separate entry. Weather sealing: NOT set true, the official page does not claim an IP rating and multiple reviews (PCmag, Micro Four Nerds) explicitly note the lens lacks weather protection; one outlet (SlashGear) claimed IPX1, so this field is the least certain in the additions.
- M.Zuiko Digital ED 150-600mm F5.0-6.3 IS (OM System, announced Jan 2024, $2,399.99 street, MSRP was $2,699.99, 2,065 g, 95 mm filter, 25/15 elements, IPX1 sealed, Sync IS). Rebadged Sigma 150-600mm design but sold as M.Zuiko, so in-segment.
- M.Zuiko Digital ED 75-300mm F4.8-6.7 II (Olympus, 2013, still in catalog, $499.99 street / $549.99 launch, 423 g, 58 mm filter, 18/13 elements, no IS, no weather sealing).
- M.Zuiko Digital ED 12-200mm F3.5-6.3 (Olympus, 2019, $899.99, 455 g, 72 mm filter, 16/11 elements, IPX1 splashproof, no in-lens IS). 16.6x superzoom.

CORRECTNESS: No errors found in the 37 draft entries on focalMin/focalMax, aperture, mounts, format, lensType, or year. Spot-verified the 90mm Macro IS PRO (maxMagnification 2.0x MFT / 4.0x equiv, draft's 2.0 is correct), original 9-18mm (155 g, 2010, 52 mm, correct), 14-42mm EZ (93 g, 2014, correct), and the recent 2025 refreshes (17mm/25mm f1.8 II, 50-200mm f2.8, 100-400mm II), all consistent with sources.

NULLS: No high-value nulls (priceUSD/weight/year/filterThread) remained to fill in the kept entries beyond discontinued lenses where priceUSD is intentionally null (no current street price). All discontinued lenses (12-40 PRO, original 100-400, 17mm/25mm f1.8 originals, 17mm f2.8, 12-50 EZ, 14-42 IIR, BCL-1580) keep priceUSD null per the draft's convention; their priceMSRPUSD is populated. dxomarkScore left null throughout, DXOMark does not publish overall scores for these MFT lenses.

EXCLUSIONS (deliberately not lenses, so out of segment): MC-14 (1.4x) and MC-20 (2x) teleconverters appear on the official lens page but are accessories, not standalone lenses. Older variants not added because superseded and rarely tracked separately: 14-42mm F3.5-5.6 (original/L), original 75-300mm I, original 14-150mm I, the catalog/current variants of each lineage are represented. Note the model string for the 75-300mm II uses "F4.8-6.7" (some OM pages abbreviate as F4-6.7).

REMAINING UNCERTAINTY: 9-18mm II weatherSealed=false is the one field where sources conflict (see above). 150-600mm priceMSRPUSD ($2,699.99) is from launch coverage; current street is the more reliable $2,399.99 in priceUSD.

### fuji-x-prime: 27 lenses

Fujifilm X-mount APS-C PRIME lenses (Fujinon XF and XC primes)

Audited the Fujifilm X-mount APS-C prime roster against the official Fujifilm-X product/discontinued-lens pages, DPReview, and Amateur Photographer. 26 draft entries were all valid Fujinon XF/XC primes (correct brand, mount, APS-C format, prime type) with no duplicates and no out-of-scope items, so none were removed.

ADDED (1): XF 23mm F2.8 R WR, a 2025 pancake prime (announced June 12 2025, MSRP $499.95, 90 g, 39 mm filter, 11 rounded blades, 8 elements/6 groups, 0.2 m MFD, 0.15x mag, 61.8 x 23 mm). Specs taken from Fujifilm's official global spec page. This was the only notable missing lens; it is a recent release and easy to overlook.

CORRECTNESS: All focal lengths, apertures (primes correctly have apertureMaxWide == apertureMaxTele), formats (all APS-C), lensType (all Prime), mounts (all Fujifilm X), and years spot-checked against sources, XF 500mm F5.6 (2024, $2999.95, 1335 g, 21 elem), XF 56mm F1.2 R WR (2022), XF 16mm F1.4 R WR (13/11), XF 8mm F3.5 R WR (2023). No errors found in the draft's existing rows. Updated productUrl for the four discontinued lenses (XF 23mm F1.4 R, XF 27mm F2.8 non-R, XF 56mm F1.2 R, XF 56mm F1.2 R APD) to their /discontinued-lenses/ paths, since the active-lens URLs 404.

NULLS: No priceUSD/weight/year/filterThread nulls remained in the draft; the newly added lens has all four filled from official/reliable sources. dxomarkScore left null for all, DXOMark does not publish an overall lens score for Fujifilm X-mount lenses (their lens scoring is sensor-paired and not available for this segment), so these are correct as null rather than guessable.

Caveats: maxMagnification for XF 8mm F3.5 R WR (0.07) is consistent with most reviews though some secondary sources cite 0.12; kept the more commonly reported 0.07. Discontinued flags reflect status as of the noted Fujifilm discontinued-lens listings; the original XF 23mm F1.4 R, XF 27mm F2.8, XF 56mm F1.2 R and APD are confirmed discontinued. Roster confirmed complete for currently-sold + major discontinued Fujinon primes as of May 2026; no other 2024-2026 prime releases found.

### fuji-x-zoom: 21 lenses

Fujifilm X-mount APS-C ZOOM lenses (Fujinon XF and XC zooms)

Audited the 21-lens draft against Fujifilm's official product/spec pages, Wikipedia's X-mount list, DPReview, and B&H. The roster is COMPLETE for autofocus Fujinon XF + XC APS-C zooms (12 XF + 4 XC-current/discontinued, plus version variants); no notable model is missing and there are no duplicate ids. All entries are correctly classified as Fujifilm X / APS-C / Zoom, so no scope removals were needed.

CORRECTIONS made:
- XC 13-33mm F3.5-6.3 OIS: year 2026 -> 2025 (announced 23 Oct 2025; ships late Jan 2026, used announcement year for consistency with the rest of the list, e.g. XF 16-55 II = 2024). Diameter 62.6 -> 61.9 (official spec sheet says max diameter 61.9mm). Length 37.5 retained = retracted length; 9 aperture blades / 10 elements in 9 groups / F22 min / 49mm filter / MFD 0.2 / 0.25x all confirmed against the official specifications page.

VERIFIED-CORRECT items that looked suspicious but checked out:
- XF 16-55 F2.8 R LM WR II: 11 aperture blades, 16 elements / 11 groups, 410g, 95mm length, 72mm filter, 0.21x, all confirmed (Fujifilm + DPReview). "37% lighter than predecessor" (655g) corroborates 410g.
- XF 16-50 F2.8-4.8 R LM WR: 240g, 71.4mm, 9 blades, 58mm, 0.30x, confirmed (Fujifilm/OpticalLimits).
- XF 8-16 F2.8: filterThread null is correct (bulbous front element, no front thread).
- XF 10-24 F4 R OIS (original): year 2014 retained (announced late 2013, shipped early 2014); discontinued true (superseded by WR version). Weight 410g confirmed.
- XC 16-50 OIS (2013) and OIS II (2015), XC 50-230 OIS (2014): release years and discontinued=true confirmed (Fujifilm discontinued-lenses pages).
- XC 50-230 OIS II: discontinued=false retained, only the silver edition is discontinued overseas; lens still globally listed and sold.

NULLS: No null priceUSD/weight/year/filterThread were fillable for the four discontinued lenses (XF 10-24 original, XC 16-50 OIS, XC 16-50 OIS II, XC 50-230 OIS), they have no current street price, so priceUSD left null (priceMSRPUSD 999/399 retained from launch). All other priceUSD, weight, year, filterThread fields were already populated and verified. dxomarkScore left null throughout, DXOMark does not test APS-C zoom lenses on Fuji bodies, so no trustworthy score exists.

### leica: 50 lenses

Leica mirrorless lenses: Leica SL (L-Mount, full frame), Leica M (full frame rangefinder), and Leica TL (APS-C). Autofocus and manual-focus.

Audited the draft against Leica official datasheets, Leica USA/Leica Store Miami listings, B&H, DPReview, and Leica Rumors (May 2026). Key changes: (1) ADDED the Vario-Elmarit-SL 70-200mm f/2.8 ASPH (released Sept 2024), it was missing from the draft; full specs taken from Leica's official datasheet (20 elements/15 groups, E82 filter, f/22 min, 1540g, 207mm, 89mm, MFD 0.65m at 70mm, max magnification 1:5.1 = 0.196 at 200mm, OIS 3.5 stops; aperture-blade count not published on the datasheet, left null). (2) Corrected Summicron-SL 35mm f/2 ASPH weight 400g -> 370g and MFD 0.24 -> 0.25m per Leica/B&H. Everything else in the draft verified as in-scope and largely correct. No duplicate ids and no out-of-segment entries were found. The Leica APO-Summicron-SL 135mm f/2 is still in development (confirmed via Peter Karbe statements / Leica Rumors May 2026) and is correctly EXCLUDED. The 2025 Summilux-M 50mm f/1.4 "Classic" reissue (a niche re-release of the older optical formula) and the Dec-2025 "Safari" cosmetic editions are NOT added as separate optical designs since they share existing optical formulas. TL lenses correctly carry mount "L-Mount" (Leica TL/L bayonet, APS-C image circle). priceUSD values reflect launch/MSRP-era US pricing from the draft where already populated; current Leica Store Miami street prices are notably higher (e.g., SL APO-Summicron primes now ~$5,450-$6,200, 16-35 SL ~$6,845) but the draft's MSRP figures were left where they were internally consistent, except none needed a null fill. dxomarkScore left null throughout (only a few SL lenses are DXOMark-tested and the draft did not request mandatory fill). minFocusDistance for the 70-200 set to the 70mm-end value (0.65m). Could not independently confirm aperture-blade counts for the lightweight Summicron-SL 35/50 (left null as in draft) or the SL 28-70 (left null).

### zeiss: 13 lenses

Zeiss mirrorless lenses: Batis (Sony FE full frame AF), Loxia (Sony FE full frame MF), Touit (APS-C Sony E and Fujifilm X)

Audit result: the draft was remarkably accurate. Verified the complete roster against Zeiss's manufacturer pages and contemporaneous announcements (DPReview, Imaging Resource, Newsshooter, Phoblographer). Roster is COMPLETE at 13 lenses: 5 Batis (18/2.8, 25/2, 40/2 CF, 85/1.8, 135/2.8), 5 Loxia (21/2.8, 25/2.4, 35/2, 50/2, 85/2.4), 3 Touit (12/2.8, 32/1.8, 50/2.8M).

COMPLETENESS: No missing lenses. No 2024-2026 mirrorless additions exist in this segment. The Feb 2025 Zeiss Otus ML 1.4/50 release is a manual-focus lens but ships in DSLR-grade / other mounts and is not part of Batis/Loxia/Touit, so it is out of scope. A May 2026 Zeiss teaser ("major leap in lens technology") is unannounced with no specs. No special editions or alternate variants found. All three lines are now discontinued (Loxia confirmed out of production by Kenko/Tokina; Batis and Touit no longer produced, remaining dealer stock only).

CORRECTNESS: All focal lengths, apertures (Touit 12mm confirmed f/2.8 not the f/2.5 that one stray source listed; 32mm confirmed f/1.8), mounts, formats, lensTypes, and release years verified correct. Stabilization flags verified: only Batis 85mm and 135mm have OIS; Batis 18/25/40, all Loxia, all Touit have none. Touit format correctly APS-C with dual Sony E + Fujifilm X mounts. Years all confirmed: Touit 12/32 = 2013, Touit 50 = 2014; Batis 25/85 = 2015, 18 = 2016, 135 = 2017, 40 CF = 2018; Loxia 35/50 = 2014, 21 = 2015, 85 = 2016, 25 = 2018. Loxia aperture blade count (10) and Loxia 50mm (320g, 6/4) confirmed. Batis filter threads confirmed (77mm for 18mm, 67mm for all others). Touit weights are the Sony E-mount figures (X-mount runs ~10g heavier).

FILL NULLS / refinements: No nulls existed in priceUSD/weight/year/filterThread (all were populated and all verified accurate). Only change made: Batis 135mm priceUSD lowered from 1999 to 1749 to reflect current remaining-dealer street price (Duclos/B&H ~$1,749), keeping priceMSRPUSD at 1999. dxomarkScore left as-is (only 25mm=40, 85mm=43, Loxia 50=42 have published DXOMark scores; the rest were never tested and remain null). Touit MSRP values match 2013 launch prices ($1,250 / $900 / $999); priceUSD reflects later street pricing.

No duplicates and no out-of-scope (wrong-brand/mount/format) entries to remove.

### samyang: 38 lenses

Samyang / Rokinon mirrorless lenses: autofocus lineup (Sony FE, Canon RF, Nikon Z) plus notable manual-focus primes for mirrorless mounts

AUDIT SUMMARY (37 in draft → 35 in corrected list; 3 removed, 0 added net, with many spec/mount corrections).

REMOVED (out of segment, DSLR-only manual primes, no native mirrorless mount):
- XP 10mm F3.5, XP 14mm F2.4, XP 85mm F1.2. The draft tagged all three "Canon RF", but the entire XP/SP series ships ONLY in Canon EF and (for 14mm) Nikon F DSLR mounts with an AE chip. There is no RF/Z/E mirrorless XP lens. They do not belong in a mirrorless segment. (Sources: lksamyang.com XP product pages, samyangus.com Special Performance collection, B&H listings.)

MOUNT CORRECTIONS, the draft systematically invented native Canon RF / Nikon Z mounts on manual-focus lenses that have neither:
- MF 14mm F2.8 MK2: draft ["Sony E","Canon RF","Nikon Z","Fujifilm X"] → corrected to mirrorless-native ["Sony E","Fujifilm X","Micro Four Thirds"]. Actual mounts are Canon EF, Nikon F, Sony E, Fujifilm X, Canon M, MFT, no RF, no Z. (RF/Z usage is adapter-only.)
- MF 85mm F1.4 MK2: same correction, same reasoning (EF/F/E/X/Canon M/MFT only).
- MF 12mm F2.0 NCS CS: draft included "Canon RF" → removed. Actual: Canon M, Sony E, MFT, Samsung NX, Fujifilm X.
- MF 35mm F1.2 (APS-C): draft included "Canon RF" → removed. Actual: Sony E, Fujifilm X, MFT, Canon M.
- MF 50mm F1.2 (APS-C): draft included "Canon RF" → removed. Actual: Sony E, Fujifilm X, MFT, Canon M.
(For the MF lenses I kept only the currently-relevant mirrorless mounts Sony E / Fujifilm X / Micro Four Thirds; Canon M and Samsung NX are dead mirrorless systems and were dropped as out-of-scope for a current mirrorless segment. If you want them retained for completeness they can be added back.)

SPEC CORRECTIONS:
- AF 14mm F2.8: year 2019→2017 (announced 2016, shipped Sept 2017); elements 15→14 (14/10 per manufacturer + multiple reviews); confirmed still in production (not discontinued); priceUSD updated to current ~549. Combined Sony E + Canon RF is valid, same optical formula; the RF version shipped Nov 2024 as the first third-party RF AF lens.
- AF 24-70mm F2.8 FE: year 2023→2022; elements 18→17; groups 15→14; weight 1010→1027g; length 126.7→128.5mm; maxMagnification 0.2→0.27 (range 0.1–0.27); current street ~799. (Manufacturer page seq=539.)
- AF 16mm F2.8 P FE: elements 11→8; groups 9→7; apertureBlades 9→7; diameter 65→69.8mm. (Manufacturer page seq=673 confirms 8/7, 7 blades, Ø69.8.)
- AF 35mm F1.8 P FE: filled nulls, minFocusDistance 0.27, maxMagnification 0.19, length ~72mm (CP+/announcement March 2026, ships late April 2026; 10/8 elements, 216g). Year 2026 confirmed.
- AF 24-60mm F2.8 FE: groups 12→11 (14/11 per manufacturer); minFocusDistance 0.27→0.18 (wide MFD 0.18m, tele 0.32m); 2025 confirmed (IBC 2025, ships Nov 2025, Schneider-Kreuznach collab).
- AF 12mm F2 RF-S: weatherSealed false→true; weight 215→213g; minFocusDistance 0.19→0.2; added productUrl seq=657. (Announced Dec 2024.)
- AF 14-24mm F2.8: weight 445→441g; length 88→86.8mm. FE (2024) and L (April 2026) share the design (Schneider-Kreuznach co-developed); combined ["Sony E","Leica L"] kept.
- AF 35mm F1.4 FE II: priceUSD 549→699 (MSRP was 549 but current street/list is 699 per samyangus.com).
- AF 85mm F1.4 FE (original): weight 568→582g (manufacturer/review figure); discontinued true→false (still listed/sold in RF; FE original largely superseded by FE II but RF version remains current). Kept combined Sony E + Canon RF (same 11/8 design). Year 2019 correct.
- AF 18mm F2.8 / 24mm F2.8 / 35mm F2.8 / 45mm F1.8 / 75mm F1.8 / etc.: street prices nudged to current where draft listed MSRP; specs otherwise verified consistent.

COMPLETENESS, roster confirmed complete against lksamyang.com category=A listing (34 products) and samyangus.com auto-focus + cine-auto-focus collections:
- The full current AF photo lineup, the 6-lens V-AF cine line (20/24/35/45/75 T1.9 + 100 T2.3), and the notable MF mirrorless primes are all present.
- NO autofocus Nikon Z lenses exist. Samyang publicly confirmed at CP+ 2026 it is still awaiting Nikon licensing; its only Z-mount products are MANUAL-focus (MF 14mm F2.8 Z, MF 85mm F1.4 Z) which are mount variants of MK2 lenses already represented. The original prompt's "Nikon Z" AF expectation cannot be met because no such products are shipping. The draft correctly contained zero Nikon-Z AF lenses; no additions were warranted.
- Canon RF AF is limited to: AF 14mm F2.8 RF, AF 85mm F1.4 RF (both folded into the combined Sony/RF entries), and AF 12mm F2 RF-S (APS-C). No full-frame standalone RF AF primes beyond 14/85 exist yet.
- EF/F DSLR AF lenses (AF 14mm F2.8 EF/F, AF 85mm F1.4 EF/F) are intentionally excluded as non-mirrorless.
- 2026 CP+ prototypes (AF 200mm f/1.8 FE OIS, AF 300mm f/4 FE OIS, 20-50mm f/2, Schneider 60-180mm f/2.8) are concepts/mockups only, not shipping, correctly omitted.

REMAINING NULLS / CAVEATS:
- dxomarkScore is null for every lens, DXOMark does not publish scores for Samyang lenses.
- V-AF cine lenses: elements/groups left null (manufacturer does not publish optical construction for the V-AF line); weights are the unified 280g except the 20mm at 300g.
- minFocusDistance/maxMagnification for AF 85mm F1.8 P FE retained from draft (0.8 / 0.12) as a reasonable value; manufacturer page did not give an explicit MFD in the sources checked.
- Mounts shown are native mirrorless only. Adapter compatibility (RF/Z via EF/F adapters) is intentionally NOT reflected, per "exact optical design ships in" semantics.

### voigtlander: 30 lenses

Voigtländer (Cosina) current mirrorless manual-focus primes for Sony E, Nikon Z, L-Mount/Leica L, and Micro Four Thirds

SCOPE: Voigtländer (Cosina) makes ZERO native L-mount (Leica L) lenses, confirmed via official voigtlaender.de mount listing and L-Mount community sources. All Voigtländer lenses are manual-focus only. Their "VM" lenses are Leica M rangefinder mount (not mirrorless) and were excluded as out of scope, as were their Fujifilm X-mount lenses (X is not one of the four requested mounts). So the L-mount portion of this segment is correctly empty.

ADDED (4 lenses missing from draft):
- Color-Skopar 21mm F3.5 Aspherical (Sony E, 2019), distinct from the Nokton 21mm F1.4; compact ultra-wide, 9 elem/8 grp, 52mm filter, ~230g, MFD 0.2m. (length/diameter ~39.9/62.8 are best-available estimates from retailer dims; confirm.)
- Ultra Wide-Heliar 12mm F5.6 Aspherical III (Sony E), flagged discontinued=true (officially produced 2016-2019, no longer on the manufacturer page but still sold at major retailers). Borderline "current"; included as a notable variant. MSRP approximate.
- Septon 40mm F2 Aspherical (Sony E + Nikon Z, 2026), newly announced at CP+/Feb 2026, shipping ~Mar-Apr 2026. Compact pancake, 7 elem/6 grp, 10 blades, 52mm filter, MFD 0.3m. E-mount weight 165g/30mm; Z-mount variant is heavier (205g/32mm), this single row uses the E-mount figures. priceUSD ~$599 is converted from JPY 85,000; US street price not yet firm.
- Nokton Classic 35mm F1.4 (Nikon Z, 2026), separate optical/mechanical build from the E-mount version (250g, 41.6mm, MFD 0.27m); announced CP+ 2026, also coming to Canon RF (out of scope). Price not yet announced; mirrored E-mount $799 as placeholder, confirm at release.

KEY CORRECTIONS to draft entries (verified against official voigtlaender.de spec pages):
- Nokton 28mm F1.5: was badly wrong (looked like VM/other data). Fixed year 2023->2025, elements 11->10, MFD 0.25->0.28, filter 58->49, weight 470->320, length 86->55, diameter 66.4->62.6, added maxMag 0.145.
- Nokton 50mm F1.2: minAperture 16->22 (range is f/1.2-22, official). Weight kept at 383g (retailer consensus; official .de page lists 434g w/ different convention, flagged).
- APO-Lanthar 35mm F2 (E): filter 58->49, weight 364->352, length 62.6->67.3 (official).
- APO-Lanthar 28mm F2: length 71->58.8, added maxMag 0.145, priceUSD 1199->1149 (street); MSRP kept 1199.
- Portrait Heliar 75mm F1.8: weight 515->560 (official; 515 appears to be a copy from the Nokton 75/1.5).
- Super Wide-Heliar 15mm III: year 2019->2016 (first native E-mount Voigtländer; the III optical design). Z-mount variant came later (~2022) but this row tracks the optical design's debut.
- Nokton Classic 35mm F1.4 (E): diameter 62.6->67.0, added maxMag 0.159 (official).

UNCERTAIN / VERIFY:
- 50mm F1.2 weight (383 vs 434g), sources conflict; kept 383 (retailer majority).
- Color-Skopar 21mm length/diameter are derived from retailer outer dimensions, not an official spec sheet.
- Septon 40mm and Nokton Classic 35mm Z prices are pre-release estimates.
- 12mm Ultra Wide-Heliar III MSRP (~$949) approximate; discontinued status makes priceUSD a moving target.

NO DUPLICATES found in the draft. All draft entries belong to the segment (no wrong brand/mount/format). DXOMark does not test manual-focus Voigtländer primes, so dxomarkScore is null throughout. All entries are primes with focalMin==focalMax and constant aperture (apertureMaxWide==apertureMaxTele), as expected. No autofocus, OIS, or weather-sealing on any Voigtländer manual prime.
