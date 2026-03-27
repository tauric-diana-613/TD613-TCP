import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  buildSwapCadenceMatrix,
  SWAP_CADENCE_FLAGSHIP_PAIRS
} from '../app/engine/stylometry.js';

const __filename = fileURLToPath(import.meta.url);
const defaults = JSON.parse(
  fs.readFileSync(path.join(path.dirname(__filename), '..', 'app', 'data', 'defaults.json'), 'utf8')
);

const sampleLibrary = defaults.sample_library || [];
const matrix = buildSwapCadenceMatrix(sampleLibrary, {
  flagshipPairs: SWAP_CADENCE_FLAGSHIP_PAIRS,
  strength: 0.82
});

assert.equal(matrix.fullMatrix.length, 56, 'full swap matrix should include all 56 ordered non-self pairings');
assert.equal(matrix.flagshipReports.length, 12, 'flagship matrix should include all 12 required ordered pairs');

for (const report of matrix.flagshipReports) {
  assert.notEqual(report.laneA.borrowedShellOutcome, 'rejected', `${report.id}: lane A should not reject`);
  assert.notEqual(report.laneB.borrowedShellOutcome, 'rejected', `${report.id}: lane B should not reject`);
  assert(['structural', 'partial'].includes(report.laneA.borrowedShellOutcome), `${report.id}: lane A should stay structural/partial`);
  assert(['structural', 'partial'].includes(report.laneB.borrowedShellOutcome), `${report.id}: lane B should stay structural/partial`);
  assert(
    report.laneA.borrowedShellOutcome === 'structural' || report.laneB.borrowedShellOutcome === 'structural',
    `${report.id}: at least one lane should be structural`
  );
  assert.notEqual(report.pairAudit.classification, 'one-sided', `${report.id}: flagship pair should not be one-sided`);
  assert.notEqual(report.pairAudit.classification, 'both-rejected', `${report.id}: flagship pair should not be both-rejected`);
  assert.equal(report.pairAudit.flagshipPass, true, `${report.id}: flagship pair should pass`);
}

assert((matrix.summary.bilateralEngaged || 0) >= 24, 'full matrix should engage at least 24 bilateral pairs');
assert((matrix.summary.bothRejected || 0) <= 8, 'full matrix should reject at most 8 pairs on both lanes');
assert((matrix.summary.oneSided || 0) <= 18, 'full matrix should have at most 18 one-sided pairs');

console.log('swap-cadence-matrix.test.mjs passed');
