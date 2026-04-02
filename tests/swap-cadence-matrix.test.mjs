import assert from 'assert';

import {
  buildSwapCadenceMatrix,
  SWAP_CADENCE_FLAGSHIP_PAIRS
} from '../app/engine/stylometry.js';
import {
  DIAGNOSTIC_BATTERY,
  DIAGNOSTIC_SAMPLE_LIBRARY
} from '../app/data/diagnostics.js';

const matrix = buildSwapCadenceMatrix(DIAGNOSTIC_SAMPLE_LIBRARY, {
  orderedPairs: DIAGNOSTIC_BATTERY.swapPairs,
  flagshipPairs: SWAP_CADENCE_FLAGSHIP_PAIRS,
  strength: 0.82
});

assert.equal(matrix.fullMatrix.length, 72, 'full swap matrix should include the 72 ordered diagnostics pairings');
assert.equal(matrix.flagshipReports.length, 8, 'flagship matrix should include all 8 required ordered pairs');

for (const report of matrix.flagshipReports) {
  assert.notEqual(report.laneA.borrowedShellOutcome, 'partial', `${report.id}: flagship lane A should never use partial fallback`);
  assert.notEqual(report.laneB.borrowedShellOutcome, 'partial', `${report.id}: flagship lane B should never use partial fallback`);
  assert.equal(report.semanticAuditSummary.protectedAnchorIntegrityMin, 1, `${report.id}: flagship pair should preserve anchors`);
}

assert((matrix.summary.bilateralEngaged || 0) >= 8, 'diagnostics swap matrix should still engage at least 8 bilateral pairs under strict rejection tuning');
assert((matrix.summary.bothRejected || 0) <= 20, 'diagnostics swap matrix should reject at most 20 pairs on both lanes under strict rejection tuning');
assert((matrix.summary.oneSided || 0) <= 50, 'diagnostics swap matrix should keep one-sided results below 50 cases');
assert.equal(matrix.summary.flagshipCount, 8, 'flagship summary tracks the 8 strict browser-facing directions');

const literalRiskIds = new Set(
  DIAGNOSTIC_BATTERY.swapPairs
    .filter((caseSpec) => caseSpec.mode === 'swap-literal-risk')
    .map((caseSpec) => `${caseSpec.sourceId}__${caseSpec.donorId}`)
);
const protectedLiteralCases = matrix.fullMatrix.filter((report) => literalRiskIds.has(report.id));
assert.equal(protectedLiteralCases.length, 24, 'all literal-risk diagnostics cases are present');
assert(
  protectedLiteralCases.every((report) => report.semanticAuditSummary.protectedAnchorIntegrityMin === 1),
  'literal-risk diagnostics cases preserve protected anchors'
);

console.log('swap-cadence-matrix.test.mjs passed');
