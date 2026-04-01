import { DIAGNOSTIC_BATTERY, DIAGNOSTIC_CORPUS_BY_ID } from '../app/data/diagnostics.js';

export const CANONICAL_TRANSFER_CASES = Object.freeze(
  DIAGNOSTIC_BATTERY.retrievalCases.map((testCase) => {
    const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[testCase.sourceId];
    const donorSample = DIAGNOSTIC_CORPUS_BY_ID[testCase.donorId];
    return Object.freeze({
      id: testCase.id,
      category: testCase.expectedPressure,
      familyId: testCase.familyId,
      sourceId: testCase.sourceId,
      donorId: testCase.donorId,
      sourceText: sourceSample.text,
      donorText: donorSample.text,
      strength: Number(testCase.strength || 0.88),
      notes: testCase.notes
    });
  })
);

export const CANONICAL_REFERENCE_VOICE = CANONICAL_TRANSFER_CASES[0]?.sourceText || '';
export const CANONICAL_PROBE_VOICE = CANONICAL_TRANSFER_CASES[0]?.donorText || '';
export const CANONICAL_REFLECTIVE_DONOR = CANONICAL_TRANSFER_CASES[1]?.donorText || '';
export const CANONICAL_OPERATIONAL_DONOR = CANONICAL_TRANSFER_CASES[2]?.donorText || '';

export function buildBorrowedShell(extractCadenceProfile, testCase) {
  return {
    mode: 'borrowed',
    profile: extractCadenceProfile(testCase.donorText),
    strength: testCase.strength
  };
}
