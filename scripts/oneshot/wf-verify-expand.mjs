export const meta = {
  name: 'lensdb-verify-expand',
  description: 'Web-verify every LensDB row per brand, and gather + verify missing third-party brands',
  phases: [
    { title: 'Audit', detail: 'web-verify the 13 existing brands against manufacturer specs' },
    { title: 'Gather', detail: 'collect current mirrorless lineups for 7 missing brands' },
    { title: 'Verify', detail: 'adversarially verify each gathered lens exists with correct specs' },
  ],
}

const ABS = '/Users/luminoid/Projects/lens-db'

const BRANDS = [
  ['Sony', 'Sony.json'], ['Panasonic', 'Panasonic.json'], ['Canon', 'Canon.json'],
  ['Leica', 'Leica.json'], ['Fujifilm', 'Fujifilm.json'], ['Nikon', 'Nikon.json'],
  ['Sigma', 'Sigma.json'], ['Samyang', 'Samyang.json'], ['Voigtlander', 'Voigtlander.json'],
  ['Olympus', 'Olympus.json'], ['Tamron', 'Tamron.json'], ['Zeiss', 'Zeiss.json'],
  ['OM System', 'OM_System.json'],
]

const NEW_BRANDS = ['Viltrox', 'TTArtisan', 'Laowa', '7Artisans', 'Tokina', 'Yongnuo', 'Meike']

const FIELDS = `id (kebab-case slug = brand+model, no mount, [a-z0-9-] only, e.g. 'viltrox-af-27mm-f12-pro'),
brand, model (full marketing name), series (line/grade or null),
mounts (array, every mount this exact optical design ships in: "Sony E","Canon RF","Nikon Z","Fujifilm X","L-Mount","Micro Four Thirds","Leica M","Leica L"),
format ("Full Frame" | "APS-C" | "MFT" | "Medium Format"), lensType ("Prime" | "Zoom"),
focalMin (mm), focalMax (mm; equals focalMin for primes),
apertureMaxWide (widest f-number at wide end), apertureMaxTele (widest at tele; equals wide for primes/constant zooms), apertureMin (smallest aperture / largest f-number, or null),
stabilization (bool|null), weatherSealed (bool|null), autofocus (bool|null; false = manual focus only),
weight (g|null), length (mm|null), diameter (mm|null), filterThread (mm|null), minFocusDistance (m|null), maxMagnification (decimal|null),
elements (int|null), groups (int|null), apertureBlades (int|null),
priceUSD (current US street price|null), priceMSRPUSD (launch MSRP|null), year (release year|null), discontinued (bool|null),
dxomarkScore (null), productUrl (manufacturer page|null)`

const LENS_RECORD = {
  type: 'object',
  required: ['id', 'brand', 'model', 'mounts', 'format', 'lensType', 'focalMin', 'focalMax', 'apertureMaxWide'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    brand: { type: 'string' }, model: { type: 'string' },
    series: { type: ['string', 'null'] },
    mounts: { type: 'array', items: { type: 'string' }, minItems: 1 },
    format: { type: 'string', enum: ['Full Frame', 'APS-C', 'MFT', 'Medium Format'] },
    lensType: { type: 'string', enum: ['Prime', 'Zoom'] },
    focalMin: { type: 'number' }, focalMax: { type: 'number' },
    apertureMaxWide: { type: 'number' },
    apertureMaxTele: { type: ['number', 'null'] }, apertureMin: { type: ['number', 'null'] },
    stabilization: { type: ['boolean', 'null'] }, weatherSealed: { type: ['boolean', 'null'] }, autofocus: { type: ['boolean', 'null'] },
    weight: { type: ['number', 'null'] }, length: { type: ['number', 'null'] }, diameter: { type: ['number', 'null'] },
    filterThread: { type: ['number', 'null'] }, minFocusDistance: { type: ['number', 'null'] }, maxMagnification: { type: ['number', 'null'] },
    elements: { type: ['integer', 'null'] }, groups: { type: ['integer', 'null'] }, apertureBlades: { type: ['integer', 'null'] },
    priceUSD: { type: ['number', 'null'] }, priceMSRPUSD: { type: ['number', 'null'] },
    year: { type: ['integer', 'null'] }, discontinued: { type: ['boolean', 'null'] },
    dxomarkScore: { type: ['number', 'null'] }, productUrl: { type: ['string', 'null'] },
  },
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['brand', 'checked', 'corrections', 'suspectRows', 'missing'],
  additionalProperties: false,
  properties: {
    brand: { type: 'string' },
    checked: { type: 'integer' },
    corrections: {
      type: 'array',
      items: {
        type: 'object', required: ['id', 'field', 'current', 'suggested', 'confidence', 'source'], additionalProperties: false,
        properties: {
          id: { type: 'string' }, field: { type: 'string' },
          current: {}, suggested: {},
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          source: { type: 'string' },
        },
      },
    },
    suspectRows: {
      type: 'array',
      items: { type: 'object', required: ['id', 'issue', 'recommendation'], additionalProperties: false,
        properties: { id: { type: 'string' }, issue: { type: 'string' }, recommendation: { type: 'string' } } },
    },
    missing: {
      type: 'array',
      items: { type: 'object', required: ['model', 'note'], additionalProperties: false,
        properties: { model: { type: 'string' }, note: { type: 'string' } } },
    },
  },
}

const GATHER_SCHEMA = {
  type: 'object', required: ['brand', 'lenses'], additionalProperties: false,
  properties: { brand: { type: 'string' }, lenses: { type: 'array', items: LENS_RECORD } },
}

const VERIFY_SCHEMA = {
  type: 'object', required: ['brand', 'lenses', 'removed'], additionalProperties: false,
  properties: {
    brand: { type: 'string' }, lenses: { type: 'array', items: LENS_RECORD },
    removed: { type: 'array', items: { type: 'object', required: ['id', 'reason'], additionalProperties: false,
      properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  },
}

const FIELD_NAMES = 'focalMin, focalMax, apertureMaxWide, apertureMaxTele, apertureMin, weight, length, diameter, filterThread, minFocusDistance, maxMagnification, elements, groups, apertureBlades, priceUSD, priceMSRPUSD, year, stabilization, weatherSealed, autofocus, mounts, format'

const auditPrompt = (brand, file) => `You are auditing the LensDB records for brand "${brand}" against authoritative web sources.

Read the file at ${ABS}/data/_audit/${file} (a JSON array of this brand's current lens records). If WebSearch / WebFetch are not already available to you, load them first with ToolSearch query "select:WebSearch,WebFetch".

For EACH record, verify against the manufacturer's own spec page first, then B&H, DPReview, or official press: focal range, max aperture at wide and tele, mounts, format, weight (g), length & diameter (mm), filter thread (mm), release year, elements/groups, aperture blades, min focus distance (m), max magnification, current US street price and launch MSRP.

Report ONLY discrepancies you can back with a source. Rules:
- Within-tolerance values are NOT corrections: weight +/-5 g, length/diameter +/-0.5 mm, price +/-5 percent.
- Aperture, focal length, year, mount list, format, and element/group/blade COUNTS must match exactly; flag any mismatch.
- suspectRows = a row for a lens that does not exist, duplicates another row, or claims a mount/format the lens was never sold in.
- missing = genuinely notable current/recent mirrorless lenses for this brand absent from the file. Keep short and high-signal (<= 8).
- Never guess. If you cannot verify a field from a source, do not report it.

Use these exact schema field names in "field": ${FIELD_NAMES}.
Return: brand, checked (number of rows reviewed), corrections[] (each: id, field, current value in file, suggested verified value, confidence, source URL/publication), suspectRows[], missing[].`

const gatherPrompt = (brand) => `Build the list of ${brand}'s current and recent mirrorless camera lenses for the LensDB comparison database.

Scope: lenses for mirrorless mounts (Sony E, Canon RF/RF-S, Nikon Z, Fujifilm X, L-Mount, Micro Four Thirds), formats Full Frame / APS-C / MFT, roughly 2014 onward. Include autofocus lenses AND well-known manual-focus models. EXCLUDE DSLR-era (EF, F, A-mount, K-mount) lenses, PL cine-only lenses, and obscure region-locked variants.

If WebSearch / WebFetch are not available, load them with ToolSearch "select:WebSearch,WebFetch". Use the manufacturer site + B&H + DPReview for specs. Do NOT invent lenses or specifications.

ONE row per optical design: if the same lens ships in several mounts, list them all in "mounts" and emit a SINGLE record. Use null for any value you cannot verify, NEVER a guess.

Field contract (use these exact keys):
${FIELDS}

Return { brand, lenses: [...] }. Aim for completeness on real current/recent models; quality over padding.`

const verifyPrompt = (brand, gathered) => `Adversarially verify this proposed set of ${brand} lens records before they enter LensDB. Assume some may be phantoms or have wrong specs.

Records:
${JSON.stringify(gathered.lenses, null, 1)}

For each record: confirm the lens REALLY EXISTS (manufacturer page or major retailer listing) and that focal length, max aperture, mounts, format, and year are correct. Use WebSearch / WebFetch (load via ToolSearch if needed). Fix any wrong spec to the verified value, or null if unverifiable. REMOVE a record if it is a phantom (no evidence it exists), a duplicate, a DSLR-era lens, or out of scope. Default to REMOVING when you cannot find evidence the lens is real.

Keep ids kebab-case ([a-z0-9-]) and unique. Return { brand, lenses: [verified/corrected records], removed: [{id, reason}] }.`

// ---- run ----
phase('Audit')
const audits = await parallel(
  BRANDS.map(([b, f]) => () =>
    agent(auditPrompt(b, f), { label: `audit:${b}`, phase: 'Audit', schema: AUDIT_SCHEMA, agentType: 'general-purpose' })),
)

phase('Gather')
const gathered = await pipeline(
  NEW_BRANDS,
  (b) => agent(gatherPrompt(b), { label: `gather:${b}`, phase: 'Gather', schema: GATHER_SCHEMA, agentType: 'general-purpose' }),
  (g, b) => {
    if (!g || !Array.isArray(g.lenses) || g.lenses.length === 0) return null
    return agent(verifyPrompt(b, g), { label: `verify:${b}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'general-purpose' })
  },
)

const auditOut = audits.filter(Boolean)
const newOut = gathered.filter(Boolean)
log(`Audits: ${auditOut.length}/${BRANDS.length} brands. New-brand verified sets: ${newOut.length}/${NEW_BRANDS.length}.`)
log(`Corrections found: ${auditOut.reduce((s, a) => s + (a.corrections?.length || 0), 0)}. New lenses: ${newOut.reduce((s, a) => s + (a.lenses?.length || 0), 0)}.`)

return { audits: auditOut, newBrands: newOut }
