import assert from 'assert';
import {
  buildCadenceTransfer,
  compareTexts,
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

function donorDistance(text, donorProfile) {
  const profile = typeof text === 'string' ? extractCadenceProfile(text) : text;
  const fit = compareTexts('', '', {
    profileA: profile,
    profileB: donorProfile
  });
  return Number((
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0)
  ).toFixed(3));
}

let structuralCount = 0;
let engagedCount = 0;
let nonTrivialCount = 0;
let improvedDistanceCount = 0;

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  const donorProfile = extractCadenceProfile(testCase.donorText);
  const sourceDistance = donorDistance(testCase.sourceText, donorProfile);
  const outputDistance = donorDistance(result.text, donorProfile);
  const changedDimensions = result.changedDimensions || [];
  const lexicalFamilies = (result.lexemeSwaps || []).map((entry) => entry.family).filter(Boolean);

  assert(result.semanticAudit, `${testCase.id}: semantic audit should exist`);
  assert.equal(typeof result.semanticAudit.propositionCoverage, 'number', `${testCase.id}: propositionCoverage should be numeric`);
  assert.equal(typeof result.protectedAnchorAudit?.protectedAnchorIntegrity, 'number', `${testCase.id}: protectedAnchorIntegrity should be numeric`);
  assert((result.semanticAudit?.propositionCoverage || 0) >= 0.85, `${testCase.id}: proposition coverage holds`);
  assert((result.semanticAudit?.actorCoverage || 0) >= 0.75, `${testCase.id}: actor coverage holds`);
  assert((result.semanticAudit?.actionCoverage || 0) >= 0.75, `${testCase.id}: action coverage holds`);
  assert((result.semanticAudit?.objectCoverage || 0) >= 0.65, `${testCase.id}: object coverage holds`);
  assert.ok((result.semanticAudit?.polarityMismatches || 0) <= 1, `${testCase.id}: polarity drift stays bounded`);
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
    if (outputDistance <= sourceDistance) {
      improvedDistanceCount += 1;
    }
  }

  if (result.transferClass === 'structural') {
    structuralCount += 1;
  }
  if (result.nonTrivialShift) {
    nonTrivialCount += 1;
  }
}

assert(engagedCount >= 10, 'canonical suite should keep at least 10 cases engaged under current tuning');
assert(structuralCount >= 8, 'canonical suite should land at least 8 structural transfers');
assert(nonTrivialCount >= 10, 'canonical suite should land at least 10 non-trivial visible shifts');
assert(improvedDistanceCount >= 4, 'at least four engaged canonical cases should improve donor distance under strict rejection tuning');

console.log('benchmark.test.mjs passed');
