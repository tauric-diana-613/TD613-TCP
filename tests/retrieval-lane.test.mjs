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
      .filter((key) => !['sourceRegisterLane', 'sourceRegisterLaneInference', 'sourceRegisterLaneFallback'].includes(key))
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
  const normalizeCoverage = (value) => {
    const numeric = Number(value ?? 1);
    return numeric >= 0.98 ? 1 : numeric;
  };

  return {
    transferClass: realization.transferClass || 'native',
    realizationTier: realization.realizationTier || 'none',
    changedDimensions: sortStrings(realization.changedDimensions || []),
    lexemeSwapFamilies: sortStrings((realization.lexemeSwaps || []).map((swap) => swap.family).filter((family) => family !== 'lane')),
    relationInventory: normalizeRelationInventory(plan.relationInventory),
    structuralOperations: sortStrings((plan.structuralOperationsSelected || []).filter((entry) => !String(entry || '').startsWith('lane:'))),
    lexicalOperations: sortStrings((plan.lexicalRegisterOperationsSelected || []).filter((entry) => !String(entry || '').startsWith('lane:'))),
    connectorStrategy: plan.connectorStrategy || 'balanced',
    contractionStrategy: plan.contractionStrategy || 'hold',
    propositionCoverage: normalizeCoverage(semanticAudit.propositionCoverage),
    actorCoverage: normalizeCoverage(semanticAudit.actorCoverage),
    actionCoverage: normalizeCoverage(semanticAudit.actionCoverage),
    objectCoverage: normalizeCoverage(semanticAudit.objectCoverage),
    polarityMismatches: semanticAudit.polarityMismatches ?? 0,
    tenseMismatches: semanticAudit.tenseMismatches ?? 0,
    protectedAnchorIntegrity: protectedAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1
  };
}

function normalizeSemanticAuditSummary(audit = {}) {
  const normalizeCoverage = (value) => {
    const numeric = Number(value ?? 1);
    return numeric >= 0.98 ? 1 : numeric;
  };
  return {
    propositionCoverage: normalizeCoverage(audit.propositionCoverage),
    actorCoverage: normalizeCoverage(audit.actorCoverage),
    actionCoverage: normalizeCoverage(audit.actionCoverage),
    objectCoverage: normalizeCoverage(audit.objectCoverage),
    polarityMismatches: Number(audit.polarityMismatches ?? 0),
    tenseMismatches: Number(audit.tenseMismatches ?? 0),
    protectedAnchorIntegrity: Number(audit.protectedAnchorIntegrity ?? 1),
    sourceClauseCount: Number(audit.sourceClauseCount ?? 0),
    outputClauseCount: Number(audit.outputClauseCount ?? 0)
  };
}

function readFixture(id) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, `${id}.json`), 'utf8'));
}

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const shell = buildBorrowedShell(extractCadenceProfile, testCase);
  const result = buildCadenceTransfer(testCase.sourceText, shell, {
    retrieval: true,
    sourceRegisterLane: testCase.sourceVariant || undefined
  });
  const trace = result.retrievalTrace || {};
  const fixture = readFixture(testCase.id);
  const actualContract = buildSemanticContract(trace);

  assert.deepEqual(actualContract, fixture.semanticContract, `${testCase.id}: semantic contract matches fixture`);
  assert.deepEqual(
    normalizeSemanticAuditSummary(trace.semanticAudit),
    normalizeSemanticAuditSummary(fixture.retrievalTrace.semanticAudit),
    `${testCase.id}: semantic audit summary matches fixture`
  );
  assert.deepEqual(
    trace.protectedAnchorAudit,
    fixture.retrievalTrace.protectedAnchorAudit,
    `${testCase.id}: protected-anchor audit matches fixture`
  );
  assert.equal(trace.sourceText, fixture.retrievalTrace.sourceText, `${testCase.id}: source text carried into retrieval trace`);
  assert.equal(trace.sourceRegisterLane, testCase.sourceVariant, `${testCase.id}: retrieval trace carries source register lane`);
  assert.equal(trace.planSummary?.relationInventory?.sourceRegisterLane, testCase.sourceVariant, `${testCase.id}: relation inventory carries source register lane`);
  assert.equal(result.sourceRegisterLane, testCase.sourceVariant, `${testCase.id}: result carries source register lane`);
  assert.ok((result.candidateLedger || []).every((entry) => entry.sourceRegisterLane === testCase.sourceVariant), `${testCase.id}: candidate ledger carries source register lane`);
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

  if (result.transferClass === 'rejected') {
    assert.equal(result.text, sourceSample.text, `${sourceId} under ${donorId}: explicit rejection should fall back to source text`);
  } else {
    assert.notEqual(result.text, sourceSample.text, `${sourceId} under ${donorId}: accepted borrowed shell should produce visible output drift`);
  }
  assert.notEqual(result.borrowedShellOutcome, 'rejected', `${sourceId} under ${donorId}: strict swap lane should land a visible borrowed shell unless a catastrophic fault forces rejection`);
  assert.equal(result.protectedAnchorAudit.protectedAnchorIntegrity, 1, `${sourceId} under ${donorId}: protected anchors stay intact`);
  assert.ok((result.semanticAudit.propositionCoverage ?? 1) >= 0.82, `${sourceId} under ${donorId}: proposition coverage stays retrieval-safe`);
  assert.ok((result.semanticAudit.actionCoverage ?? 1) >= 0.75, `${sourceId} under ${donorId}: action coverage stays retrieval-safe`);
  assert.ok((result.semanticAudit.polarityMismatches ?? 0) <= 1, `${sourceId} under ${donorId}: polarity drift stays bounded`);
}

console.log('retrieval-lane.test.mjs passed');
