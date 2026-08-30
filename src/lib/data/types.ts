// Mirrors data/schema.json. Keep in sync with the schema (or generate via
// json-schema-to-typescript in a later milestone). One row per optical design.

export type Format = 'Full Frame' | 'APS-C' | 'MFT' | 'Medium Format';
export type LensType = 'Prime' | 'Zoom';
export type Mount =
  | 'Sony E'
  | 'Canon RF'
  | 'Nikon Z'
  | 'L-Mount'
  | 'Fujifilm X'
  | 'Micro Four Thirds'
  | 'Leica M';

export interface Lens {
  id: string;
  brand: string;
  model: string;
  series: string | null;
  mounts: Mount[];
  format: Format;
  lensType: LensType;

  focalMin: number;
  focalMax: number;
  apertureMaxWide: number;
  apertureMaxTele: number | null;
  apertureMin: number | null;

  stabilization: boolean | null;
  weatherSealed: boolean | null;
  autofocus: boolean | null;

  weight: number | null;
  length: number | null;
  diameter: number | null;
  filterThread: number | null;
  minFocusDistance: number | null;
  maxMagnification: number | null;
  elements: number | null;
  groups: number | null;
  apertureBlades: number | null;

  priceUSD: number | null;
  priceMSRPUSD: number | null;
  year: number | null;
  discontinued: boolean | null;

  dxomarkScore: number | null;
  productUrl: string | null;
}

const isPrime = (l: Lens): boolean => l.focalMin === l.focalMax;
const isVariableAperture = (l: Lens): boolean =>
  l.apertureMaxTele != null && l.apertureMaxWide !== l.apertureMaxTele;

/** "24mm" for a prime, "24-70mm" for a zoom. */
export const focalLabel = (l: Lens): string =>
  isPrime(l) ? `${l.focalMin}mm` : `${l.focalMin}-${l.focalMax}mm`;

/** "f/2.8" for constant, "f/2.8-4" for variable aperture. */
export const apertureLabel = (l: Lens): string =>
  isVariableAperture(l) ? `f/${l.apertureMaxWide}-${l.apertureMaxTele}` : `f/${l.apertureMaxWide}`;
