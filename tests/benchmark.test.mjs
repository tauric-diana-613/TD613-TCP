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

const STRUCTURAL_DIMENSIONS = new Set([
  'sentence-mean',
  'sentence-count',
  'sentence-spread',
  'contraction-posture',
  'line-break-texture',
  'connector-stance'
]);

const LEXICAL_DIMENSIONS = new Set([
  'lexical-register',
  'content-word-complexity',
  'modifier-density',
  'directness',
  'abstraction-posture'
]);

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

function structuralDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => STRUCTURAL_DIMENSIONS.has(dimension));
}

function lexicalDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => LEXICAL_DIMENSIONS.has(dimension));
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

function contractionDirectionMatches(sourceText, outputText, donorProfile) {
  const sourceProfile = extractCadenceProfile(sourceText);
  const outputProfile = extractCadenceProfile(outputText);
  const sourceDensity = sourceProfile.contractionDensity || 0;
  const outputDensity = outputProfile.contractionDensity || 0;
  const donorDensity = donorProfile.contractionDensity || 0;

  if (donorDensity > sourceDensity + 0.006) {
    return outputDensity >= sourceDensity;
  }

  if (donorDensity < sourceDensity - 0.006) {
    return outputDensity <= sourceDensity;
  }

  return true;
}

function assertSemanticAuditPresent(id, result) {
  assert(result.semanticAudit, `${id}: semanticAudit should exist`);
  assert.equal(typeof result.semanticAudit.propositionCoverage, 'number', `${id}: propositionCoverage should be numeric`);
  assert.equal(typeof result.semanticAudit.actorCoverage, 'number', `${id}: actorCoverage should be numeric`);
  assert.equal(typeof result.semanticAudit.actionCoverage, 'number', `${id}: actionCoverage should be numeric`);
  assert.equal(typeof result.semanticAudit.objectCoverage, 'number', `${id}: objectCoverage should be numeric`);
  assert.equal(typeof result.semanticAudit.polarityMismatches, 'number', `${id}: polarityMismatches should be numeric`);
  assert.equal(typeof result.semanticAudit.tenseMismatches, 'number', `${id}: tenseMismatches should be numeric`);
  assert.equal(typeof result.protectedAnchorAudit?.protectedAnchorIntegrity, 'number', `${id}: protectedAnchorIntegrity should be numeric`);
}

function assertFlagshipTransfer(id, sourceText, donorText, result) {
  const donorProfile = extractCadenceProfile(donorText);
  const sourceDistance = donorDistance(sourceText, donorProfile);
  const outputDistance = donorDistance(result.text, donorProfile);

  assert.equal(result.transferClass, 'structural', `${id}: transferClass should be structural`);
  assert.equal(result.realizationTier, 'lexical-structural', `${id}: realizationTier should be lexical-structural`);
  assert.notEqual(result.text, sourceText, `${id}: output should visibly change`);
  assert(structuralDimensions(result.changedDimensions).length >= 1, `${id}: at least 1 structural dimension changed`);
  assert(
    lexicalDimensions(result.changedDimensions).length >= 1 || (result.lexemeSwaps || []).length >= 1,
    `${id}: at least 1 lexical/register shift landed`
  );
  assert(contractionDirectionMatches(sourceText, result.text, donorProfile), `${id}: contraction posture aligns to donor`);
  assert(!hasBannedConnectors(result.text), `${id}: no banned connector stacks`);
  assert(!hasOrphanFragments(result.text), `${id}: no orphan fragments`);
  assert(outputDistance < sourceDistance, `${id}: donor distance should improve`);
  assert((result.semanticAudit?.propositionCoverage || 0) >= 0.85, `${id}: proposition coverage holds`);
  assert((result.semanticAudit?.actorCoverage || 0) >= 0.75, `${id}: actor coverage holds`);
  assert((result.semanticAudit?.actionCoverage || 0) >= 0.85, `${id}: action coverage holds`);
  assert((result.semanticAudit?.objectCoverage || 0) >= 0.65, `${id}: object coverage holds`);
  assert.equal(result.semanticAudit?.polarityMismatches || 0, 0, `${id}: polarity should hold`);
  assert.equal(result.protectedAnchorAudit?.protectedAnchorIntegrity || 0, 1, `${id}: protected anchors hold`);
}

console.log('=== Patch 27 Benchmark Suite ===\n');

const caseById = Object.fromEntries(CANONICAL_TRANSFER_CASES.map((testCase) => [testCase.id, testCase]));

console.log('SECTION A: Flagship Screenshot Transfers\n');
{
  const testCase = caseById.screenshot_reference_under_probe;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('A1 reference->probe', result);
  assertFlagshipTransfer('A1 reference->probe', testCase.sourceText, testCase.donorText, result);
  console.log(`  OK A1 ${result.realizationTier} / ${result.transferClass}`);
}
{
  const testCase = caseById.screenshot_probe_under_reference;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('A2 probe->reference', result);
  assertFlagshipTransfer('A2 probe->reference', testCase.sourceText, testCase.donorText, result);
  console.log(`  OK A2 ${result.realizationTier} / ${result.transferClass}\n`);
}

console.log('SECTION B: Structural + Register Contrast\n');
{
  const testCase = caseById.operational_under_reflective;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('B1 operational->reflective', result);
  assertFlagshipTransfer('B1 operational->reflective', testCase.sourceText, testCase.donorText, result);
  console.log(`  OK B1 ${result.text}`);
}
{
  const testCase = caseById.reflective_under_operational;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('B2 reflective->operational', result);
  assertFlagshipTransfer('B2 reflective->operational', testCase.sourceText, testCase.donorText, result);
  console.log(`  OK B2 ${result.text}\n`);
}

console.log('SECTION C: Contraction Posture\n');
{
  const testCase = caseById.contraction_heavy;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('C1 contraction-heavy', result);
  assertFlagshipTransfer('C1 contraction-heavy', testCase.sourceText, testCase.donorText, result);
  assert(result.text.includes("I'm") || result.text.includes("I'll"), 'C1: contractions should surface');
  console.log(`  OK C1 ${result.text}`);
}
{
  const testCase = caseById.contraction_light;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('C2 contraction-light', result);
  assertFlagshipTransfer('C2 contraction-light', testCase.sourceText, testCase.donorText, result);
  assert(result.text.includes('I am') || result.text.includes('I will'), 'C2: contractions should expand');
  console.log(`  OK C2 ${result.text}\n`);
}

console.log('SECTION D: Literal Safety and Low Opportunity\n');
{
  const testCase = caseById.low_opportunity_visible_shift;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('D1 low-opportunity', result);
  assert(['weak', 'rejected'].includes(result.transferClass), 'D1: low-opportunity transfer should stay weak/rejected');
  assert.notEqual(result.text, testCase.sourceText, 'D1: non-literal low-opportunity text should still attempt visible movement');
  assert((result.lexemeSwaps || []).length >= 1 || lexicalDimensions(result.changedDimensions).length >= 1, 'D1: lexical movement should land for non-literal low-opportunity text');
  assert(!hasBannedConnectors(result.text), 'D1: no banned connectors');
  console.log(`  OK D1 ${result.transferClass} -> ${result.text}`);
}
{
  const testCase = caseById.protected_literal_survival;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('D2 protected-literal', result);
  assert(['weak', 'rejected'].includes(result.transferClass), 'D2: protected-literal case should stay weak/rejected');
  assert(result.text.includes('9:30'), 'D2: timestamp survives');
  assert(result.text.includes('ZX-17'), 'D2: ID survives');
  assert(result.semanticRisk <= 0.35, 'D2: semantic risk stays bounded');
  assert.equal(result.protectedAnchorAudit?.protectedAnchorIntegrity || 0, 1, 'D2: protected anchors hold');
  console.log(`  OK D2 literals held: ${result.text}\n`);
}

console.log('SECTION E: Pathology Blocking\n');
{
  const testCase = caseById.pathology_additive_collapse_blocked;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('E1 additive collapse', result);
  assert(!hasBannedConnectors(result.text), 'E1: no banned connectors');
  assert(!hasOrphanFragments(result.text), 'E1: no orphan fragments');
  console.log('  OK E1 pathology-safe output');
}
{
  const testCase = caseById.pathology_connector_stack_blocked;
  const result = buildCadenceTransfer(testCase.sourceText, buildBorrowedShell(extractCadenceProfile, testCase), { retrieval: true });
  assertSemanticAuditPresent('E2 connector stack', result);
  assert(
    result.transferClass === 'rejected' || !hasBannedConnectors(result.text),
    'E2: banned connector stacks are blocked or rejected'
  );
  console.log(`  OK E2 ${result.transferClass}\n`);
}

console.log('benchmark.test.mjs passed');
