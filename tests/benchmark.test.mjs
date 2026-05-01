import assert from 'assert';
import {
  buildCadenceTransfer,
  extractCadenceProfile,
  sentenceSplit
} from '../app/engine/stylometry.js';
import {
  CANONICAL_TRANSFER_CASES,
  buildBorrowedShell
} from './canonical-transfer-cases.mjs';

function hasBannedConnectors(text = '') {
  return /(though\s+if|honestly[,;]\s+and|but\s+because|and\s+though\s+if)/gi.test(text);
}

function hasOrphanFragments(text = '') {
  return sentenceSplit(text).some((sentence, index) => {
    const normalized = sentence.trim().toLowerCase();
    return index > 0 &&
      /^(?:and|but|so|then|because|since|when|while|though|although)\s+\w{1,3}\s*$/.test(normalized);
  });
}

let structuralCount = 0;
let engagedCount = 0;
let nonTrivialCount = 0;
let realizedOperatorCount = 0;

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  const changedDimensions = result.changedDimensions || [];
  const lexicalFamilies = (result.lexemeSwaps || []).map((entry) => entry.family).filter(Boolean);
  const operatorCount =
    (result.structuralOperations || []).length +
    (result.lexicalOperations || []).length +
    (result.lexemeSwaps || []).length;
  const apertureWarning = (result.rescuePasses || []).includes('semantic-final-warning') ||
    (result.notes || []).some((note) => /Aperture (?:raised|marked|warning pressure)/i.test(note));
  const propositionFloor = apertureWarning ? 0.75 : 0.85;
  const actorFloor = apertureWarning ? 0.58 : 0.75;
  const actionFloor = apertureWarning ? 0.7 : 0.75;
  const objectFloor = apertureWarning ? 0.6 : 0.65;
  const diagnosticPressure = result.holdStatus === 'held' ||
    result.generationDocket?.status === 'diagnostic-pressure';
  const polarityFloor = diagnosticPressure ? 3 : 1;

  assert(result.semanticAudit, `${testCase.id}: semantic audit should exist`);
  assert.equal(typeof result.semanticAudit.propositionCoverage, 'number', `${testCase.id}: propositionCoverage should be numeric`);
  assert.equal(typeof result.protectedAnchorAudit?.protectedAnchorIntegrity, 'number', `${testCase.id}: protectedAnchorIntegrity should be numeric`);
  assert((result.semanticAudit?.propositionCoverage || 0) >= propositionFloor, `${testCase.id}: proposition coverage holds`);
  assert((result.semanticAudit?.actorCoverage || 0) >= actorFloor, `${testCase.id}: actor coverage holds`);
  assert((result.semanticAudit?.actionCoverage || 0) >= actionFloor, `${testCase.id}: action coverage holds`);
  assert((result.semanticAudit?.objectCoverage || 0) >= objectFloor, `${testCase.id}: object coverage holds`);
  assert.ok((result.semanticAudit?.polarityMismatches || 0) <= polarityFloor, `${testCase.id}: polarity drift stays bounded`);
  assert.equal(result.protectedAnchorAudit?.protectedAnchorIntegrity || 0, 1, `${testCase.id}: protected anchors hold`);

  if (result.transferClass !== 'rejected') {
    engagedCount += 1;
    assert.notEqual(result.text, testCase.sourceText, `${testCase.id}: engaged canonical case should visibly move`);
    assert(!hasBannedConnectors(result.text), `${testCase.id}: no banned connector stacks`);
    assert(!hasOrphanFragments(result.text), `${testCase.id}: no orphan fragments`);
    assert(
      changedDimensions.length >= 1 || lexicalFamilies.length >= 1,
      `${testCase.id}: engaged canonical case should move at least one stylometric dimension`
    );
    if (operatorCount > 0) {
      realizedOperatorCount += 1;
    }
  }

  if (result.transferClass === 'structural') {
    structuralCount += 1;
  }
  if (result.nonTrivialShift) {
    nonTrivialCount += 1;
  }
}

assert(engagedCount >= 4, 'canonical suite should keep a small set of clearly engaged cases alive under the truth gate');
assert(structuralCount >= 4, 'canonical suite should still land a few structural transfers after donor-distance removal');
assert(nonTrivialCount >= 4, 'canonical suite should still land non-trivial visible shifts where donor realization is real');
assert(realizedOperatorCount >= 4, 'at least four engaged canonical cases should prove movement through realized operators');

console.log('benchmark.test.mjs passed');
