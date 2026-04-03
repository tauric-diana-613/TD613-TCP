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

assert.equal(matrix.fullMatrix.length, 104, 'full swap matrix should include the 100 ordered diagnostics pairings plus 4 review-facing flagship additions');
assert.equal(matrix.flagshipReports.length, 8, 'flagship matrix should include all 8 required ordered pairs');

for (const report of matrix.flagshipReports) {
  assert.equal(report.semanticAuditSummary.protectedAnchorIntegrityMin, 1, `${report.id}: flagship pair should preserve anchors`);
}

assert((matrix.summary.bilateralEngaged || 0) >= 4, 'diagnostics swap matrix should still keep some ordered pairs genuinely live');
assert((matrix.summary.bothRejected || 0) >= 20, 'diagnostics swap matrix should now reject a substantial set of underfit ordered pairs instead of admitting false passage');
assert((matrix.summary.oneSided || 0) >= 10, 'diagnostics swap matrix should still surface one-sided donor pressure where only one lane clears truthfully');
assert.equal(matrix.summary.flagshipCount, 8, 'flagship summary tracks the 8 strict browser-facing directions');
assert((matrix.summary.failureFamilyCounts['donor-underfit'] || 0) >= 20, 'diagnostics swap matrix should explicitly track donor-underfit failures once the truth gate is active');
assert.equal(matrix.summary.flagshipPassCount, 8, 'flagship summary should surface eight review-facing exemplar directions as live');
assert.equal(matrix.summary.flagshipAllPassed, true, 'flagship summary should mark all review-facing exemplar directions as live');

const literalRiskIds = new Set(
  DIAGNOSTIC_BATTERY.swapPairs
    .filter((caseSpec) => caseSpec.mode === 'swap-literal-risk')
    .map((caseSpec) => `${caseSpec.sourceId}__${caseSpec.donorId}`)
);
const protectedLiteralCases = matrix.fullMatrix.filter((report) => literalRiskIds.has(report.id));
assert.equal(protectedLiteralCases.length, 32, 'all literal-risk diagnostics cases are present');
assert(
  protectedLiteralCases.every((report) => report.semanticAuditSummary.protectedAnchorIntegrityMin === 1),
  'literal-risk diagnostics cases preserve protected anchors'
);

console.log('swap-cadence-matrix.test.mjs passed');
