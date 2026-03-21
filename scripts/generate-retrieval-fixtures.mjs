import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';
import {
  CANONICAL_TRANSFER_CASES,
  buildBorrowedShell
} from '../tests/canonical-transfer-cases.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const fixturesDir = path.join(repoRoot, 'tests', 'fixtures', 'retrieval-lane');
const browserFixturesPath = path.join(repoRoot, 'app', 'retrieval-fixtures.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

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

function semanticContractFromFixture(traceFixture = {}) {
  const realization = traceFixture.realizationSummary || {};
  const plan = traceFixture.planSummary || {};
  const semanticAudit = traceFixture.semanticAudit || {};
  const protectedAudit = traceFixture.protectedAnchorAudit || {};

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

function buildFixturePayload(testCase) {
  const shell = buildBorrowedShell(extractCadenceProfile, testCase);
  const result = buildCadenceTransfer(testCase.sourceText, shell, { retrieval: true });
  const retrievalTrace = result.retrievalTrace || {};
  const donorProfile = extractCadenceProfile(testCase.donorText);
  const payload = {
    id: testCase.id,
    category: testCase.category,
    strength: testCase.strength,
    sourceText: testCase.sourceText,
    donorText: testCase.donorText,
    donorSummary: {
      mode: shell.mode,
      strength: shell.strength,
      profile: {
        avgSentenceLength: donorProfile.avgSentenceLength,
        sentenceCount: donorProfile.sentenceCount,
        contractionDensity: donorProfile.contractionDensity,
        punctuationDensity: donorProfile.punctuationDensity,
        contentWordComplexity: donorProfile.contentWordComplexity,
        modifierDensity: donorProfile.modifierDensity,
        directness: donorProfile.directness,
        abstractionPosture: donorProfile.abstractionPosture
      }
    },
    retrievalTrace,
    semanticContract: semanticContractFromFixture(retrievalTrace)
  };

  return payload;
}

ensureDir(fixturesDir);

const fixtureIndex = {
  generatedAt: new Date().toISOString(),
  cases: {}
};

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const payload = buildFixturePayload(testCase);
  fixtureIndex.cases[testCase.id] = payload;
  fs.writeFileSync(
    path.join(fixturesDir, `${testCase.id}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
    'utf8'
  );
}

const browserPayload = [
  '(function () {',
  `  window.TCP_RETRIEVAL_FIXTURES = ${JSON.stringify(fixtureIndex, null, 2)};`,
  '})();',
  ''
].join('\n');

fs.writeFileSync(browserFixturesPath, browserPayload, 'utf8');
console.log(`retrieval fixtures regenerated (${Object.keys(fixtureIndex.cases).length} cases)`);
