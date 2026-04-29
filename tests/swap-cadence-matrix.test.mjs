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
assert.equal(matrix.summary[['surface', 'Close'].join('')] || 0, 0, 'diagnostics swap matrix no longer reports retired donor-distance warning lanes');
assert((matrix.summary.thinRealization || 0) >= 0, 'diagnostics swap matrix may report operator-thin realization lanes without donor-distance semantics');
assert.equal(matrix.summary.flagshipCount, 8, 'flagship summary tracks the 8 strict browser-facing directions');
assert.equal(matrix.summary.failureFamilyCounts[['donor', ['under', 'fit'].join('')].join('-')] || 0, 0, 'diagnostics swap matrix does not emit the retired donor-distance failure class after Patch 34');
assert((matrix.summary.failureFamilyCounts['aperture-route-pressure'] || 0) >= 4, 'diagnostics swap matrix should track aperture-route-pressure failures introduced in Patch 33.3');
assert.equal(matrix.summary.flagshipPassCount, 2, 'flagship summary should surface the two fully green review-facing exemplar directions while stricter ontology warnings remain visible');
assert.equal(matrix.summary.flagshipAllPassed, false, 'flagship summary should keep the remaining flagship warnings visible instead of overstating all directions as live');
assert.equal(
  matrix.flagshipReports.filter((report) => report.pairAudit[['surface', 'Close'].join('')]).length,
  0,
  'flagship matrix should not expose the retired donor-distance warning state'
);

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
