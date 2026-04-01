import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildCadenceTransfer,
  cadenceModFromProfile,
  extractCadenceProfile
} from '../app/engine/stylometry.js';
import {
  CANONICAL_TRANSFER_CASES,
  buildBorrowedShell
} from './canonical-transfer-cases.mjs';
import { DIAGNOSTIC_CORPUS_BY_ID } from '../app/data/diagnostics.js';

const __filename = fileURLToPath(import.meta.url);
const fixturesDir = path.join(path.dirname(__filename), 'fixtures', 'retrieval-lane');

function sortStrings(values = []) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function normalizeRelationInventory(value) {
  if (Array.isArray(value)) {
    return sortStrings(value);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${key}:${value[key]}`);
  }

  return [];
}

function buildSemanticContract(trace = {}) {
  const realization = trace.realizationSummary || {};
  const plan = trace.planSummary || {};
  const semanticAudit = trace.semanticAudit || {};
  const protectedAudit = trace.protectedAnchorAudit || {};

  return {
    transferClass: realization.transferClass || 'native',
    realizationTier: realization.realizationTier || 'none',
    changedDimensions: sortStrings(realization.changedDimensions || []),
    lexemeSwapFamilies: sortStrings((realization.lexemeSwaps || []).map((swap) => swap.family)),
    relationInventory: normalizeRelationInventory(plan.relationInventory),
    structuralOperations: sortStrings(plan.structuralOperationsSelected || []),
    lexicalOperations: sortStrings(plan.lexicalRegisterOperationsSelected || []),
    connectorStrategy: plan.connectorStrategy || 'balanced',
    contractionStrategy: plan.contractionStrategy || 'hold',
    propositionCoverage: semanticAudit.propositionCoverage ?? 1,
    actorCoverage: semanticAudit.actorCoverage ?? 1,
    actionCoverage: semanticAudit.actionCoverage ?? 1,
    objectCoverage: semanticAudit.objectCoverage ?? 1,
    polarityMismatches: semanticAudit.polarityMismatches ?? 0,
    tenseMismatches: semanticAudit.tenseMismatches ?? 0,
    protectedAnchorIntegrity: protectedAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1
  };
}

function readFixture(id) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, `${id}.json`), 'utf8'));
}

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const shell = buildBorrowedShell(extractCadenceProfile, testCase);
  const result = buildCadenceTransfer(testCase.sourceText, shell, { retrieval: true });
  const trace = result.retrievalTrace || {};
  const fixture = readFixture(testCase.id);
  const actualContract = buildSemanticContract(trace);

  assert.deepEqual(actualContract, fixture.semanticContract, `${testCase.id}: semantic contract matches fixture`);
  assert.deepEqual(trace.semanticAudit, fixture.retrievalTrace.semanticAudit, `${testCase.id}: semantic audit matches fixture`);
  assert.deepEqual(
    trace.protectedAnchorAudit,
    fixture.retrievalTrace.protectedAnchorAudit,
    `${testCase.id}: protected-anchor audit matches fixture`
  );
  assert.equal(trace.sourceText, fixture.retrievalTrace.sourceText, `${testCase.id}: source text carried into retrieval trace`);
}

for (const { sourceId, donorId } of [
  { sourceId: 'committee-budget-tangled-followup', donorId: 'committee-budget-formal-record' },
  { sourceId: 'customer-support-rushed-mobile', donorId: 'customer-support-formal-record' }
]) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[donorId];
  const donorProfile = extractCadenceProfile(donorSample.text);
  const result = buildCadenceTransfer(sourceSample.text, {
    mode: 'borrowed',
    label: `borrowed ${donorSample.name} cadence`,
    profile: donorProfile,
    mod: cadenceModFromProfile(donorProfile),
    source: 'swapped',
    fromSlot: 'B',
    strength: 0.82
  }, { retrieval: true });

  assert.notEqual(result.transferClass, 'rejected', `${sourceId} under ${donorId}: swap fallback should not collapse to native text`);
  assert.notEqual(result.text, sourceSample.text, `${sourceId} under ${donorId}: borrowed shell should produce visible output drift`);
  assert.equal(result.protectedAnchorAudit.protectedAnchorIntegrity, 1, `${sourceId} under ${donorId}: protected anchors stay intact`);
  assert.ok((result.semanticAudit.propositionCoverage ?? 1) >= 0.82, `${sourceId} under ${donorId}: proposition coverage stays retrieval-safe`);
  assert.ok((result.semanticAudit.actionCoverage ?? 1) >= 0.75, `${sourceId} under ${donorId}: action coverage stays retrieval-safe`);
  assert.ok((result.semanticAudit.polarityMismatches ?? 0) <= 1, `${sourceId} under ${donorId}: polarity drift stays bounded`);
}

console.log('retrieval-lane.test.mjs passed');
