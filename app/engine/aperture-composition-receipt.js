import {
  APERTURE_COMPOSITION_DOMAINS,
  APERTURE_COMPOSITION_RECEIPT_SCHEMA,
  rejectCompositionAuthorityClaims,
  verifyCompositionRecord
} from './aperture-composition-common.js';
import { inspectApertureComposition } from './aperture-composition-inspect.js';
import { compileApertureCompositionRecord } from './aperture-composition-record.js';

export async function compileApertureCompositionReceipt(input = {}, options = {}) {
  rejectCompositionAuthorityClaims(input);
  const inspection = await inspectApertureComposition(input, options);
  return compileApertureCompositionRecord(input, inspection, options);
}

export const verifyApertureCompositionReceipt = (value, options = {}) => verifyCompositionRecord(
  APERTURE_COMPOSITION_DOMAINS.receipt,
  value,
  'receipt_digest',
  APERTURE_COMPOSITION_RECEIPT_SCHEMA,
  options
);
