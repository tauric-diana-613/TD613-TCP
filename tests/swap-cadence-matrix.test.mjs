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

assert((matrix.summary.bilateralEngaged || 0) >= 20, 'diagnostics swap matrix should keep a substantial set of ordered pairs genuinely live under warning-first exposure');
assert((matrix.summary.bothRejected || 0) <= 15, 'diagnostics swap matrix should reserve outright rejection for a bounded catastrophic subset');
assert((matrix.summary.oneSided || 0) >= 6, 'diagnostics swap matrix should still surface one-sided donor pressure where only one lane clears truthfully');
assert((matrix.summary.surfaceClose || 0) >= 30, 'diagnostics swap matrix should now expose many underfit pairings as surface-close warning lanes instead of rejecting them outright');
assert.equal(matrix.summary.flagshipCount, 8, 'flagship summary tracks the 8 strict browser-facing directions');
assert((matrix.summary.failureFamilyCounts['donor-underfit'] || 0) >= 16, 'diagnostics swap matrix should explicitly track donor-underfit pressure once the warning ledger is active');
assert.equal(matrix.summary.flagshipPassCount, 8, 'flagship summary should surface eight review-facing exemplar directions as live');
assert.equal(matrix.summary.flagshipAllPassed, true, 'flagship summary should mark all review-facing exemplar directions as live');

const flagshipOnlyMatrix = buildSwapCadenceMatrix(DIAGNOSTIC_SAMPLE_LIBRARY, {
  orderedPairs: [],
  flagshipPairs: SWAP_CADENCE_FLAGSHIP_PAIRS,
  strength: 0.82
});
assert.equal(flagshipOnlyMatrix.fullMatrix.length, 8, 'explicit empty orderedPairs should preserve a flagship-only matrix instead of expanding to the full corpus cartesian');
assert.equal(flagshipOnlyMatrix.summary.caseCount, 8, 'flagship-only matrix summary should report only the requested flagship cases');

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
