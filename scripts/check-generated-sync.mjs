import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import defaults from '../app/data/defaults.js';
import { DIAGNOSTIC_BATTERY, DIAGNOSTIC_CORPUS } from '../app/data/diagnostics.js';
import personas from '../app/data/personas.js';
import {
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';
import { buildAnnexDiagnostics } from './lib/annex-diagnostics.mjs';
import {
  CANONICAL_TRANSFER_CASES,
  buildBorrowedShell
} from '../tests/canonical-transfer-cases.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const ENGINE_SOURCES = [
  'app/engine/corpus-hydration.js',
  'app/engine/td613-aperture.js',
  'app/engine/stylometry.js',
  'app/engine/vernacular-ontology.js',
  'app/engine/au-forged-ontology.js',
  'app/engine/generator-v2.js',
  'app/engine/formulas.js',
  'app/engine/harbor.js'
];

function transformModule(source = '') {
  return source
    .replace(/^\s*import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];\s*$/gm, '')
    .replace(/^\s*import\s+.+?;\s*$/gm, '')
    .replace(/^export\s+/gm, '')
    .trim();
}

function expectedBrowserEngine() {
  return [
    '(function () {',
    '// GENERATED FROM TCP ENGINE MODULES BY scripts/generate-browser-engine.mjs',
    ...ENGINE_SOURCES.map((relativePath) => {
      const absolutePath = path.join(repoRoot, relativePath);
      const moduleSource = fs.readFileSync(absolutePath, 'utf8');
      return `// SOURCE: ${relativePath}\n${transformModule(moduleSource)}`;
    }),
    '',
    'window.TCP_ENGINE = Object.assign(window.TCP_ENGINE || {}, {',
    '  deepFreeze,',
    '  hydrateCorpus,',
    '  TD613_APERTURE_PROTOCOL,',
    '  TD613_APERTURE_ENFORCEMENT_TERMS,',
    '  buildTD613GovernedExposureSchema,',
    '  buildTD613ApertureContext,',
    '  selectTD613ApertureDecision,',
    '  selectTD613ApertureHarbor,',
    '  reviewTD613ApertureTransfer,',
    '  solveQuadratic,',
    '  cadenceCoherence,',
    '  cadenceResonance,',
    '  branchDynamics,',
    '  routePressure,',
    '  computeRoutePressure,',
    '  fieldPotential,',
    '  waveStats,',
    '  custodyThreshold,',
    '  criticalityIndex,',
    '  providerDecision,',
    '  HARBOR_LIBRARY,',
    '  chooseHarbor,',
    '  buildLedgerRow,',
    '  computeReuseGain,',
    '  estimateWitnessLoad,',
    '  AU_FORGED_ONTOLOGY,',
    '  summarizeAUForgedOntology,',
    '  normalizeText,',
    '  extractCadenceProfile,',
    '  inferRegisterLaneFromText,',
    '  compareTexts,',
    '  buildCadenceTransfer,',
    '  buildCadenceTransferLegacy,',
    '  buildCadenceTransferTrace,',
    '  buildCadenceTransferTraceLegacy,',
    '  buildCadenceSignature,',
    '  applyCadenceShell,',
    '  applyCadenceToText,',
    '  applyCadenceToTextLegacy,',
    '  transformText,',
    '  functionWordProfile,',
    '  charTrigramProfile,',
    '  StylometricDeepMetrics,',
    '  syntacticBranchingDepth,',
    '  lexicalEntropyScore,',
    '  transitionVariance,',
    '  recurrencePressure,',
    '  sentenceSplit,',
    '  segmentTextToIR,',
    '  buildOpportunityProfileFromIR,',
    '  buildTransferPlanFromIR,',
    '  beamSearchTransfer,',
    '  buildSwapCadenceMatrix,',
    '  cadenceModFromProfile,',
    '  SWAP_CADENCE_FLAGSHIP_PAIRS',
    '});',
    '})();',
    ''
  ].join('\n');
}

function expectedPersonasJson() {
  return `${JSON.stringify(personas, null, 2)}\n`;
}

function expectedDefaultsJson() {
  return `${JSON.stringify(defaults, null, 2)}\n`;
}

function expectedBrowserDiagnostics() {
  const payload = {
    diagnostic_corpus: DIAGNOSTIC_CORPUS,
    diagnostic_battery: DIAGNOSTIC_BATTERY,
    diagnostic_annexes: buildAnnexDiagnostics(repoRoot)
  };

  return [
    '(function () {',
    '  window.TCP_DATA = window.TCP_DATA || {};',
    `  Object.assign(window.TCP_DATA, ${JSON.stringify(payload, null, 2)});`,
    '})();',
    ''
  ].join('\n');
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
      .filter((key) => !['sourceRegisterLane', 'sourceRegisterLaneInference', 'sourceRegisterLaneFallback', 'discourseOntology'].includes(key))
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

function buildFixturePayload(testCase) {
  const shell = buildBorrowedShell(extractCadenceProfile, testCase);
  const result = buildCadenceTransfer(testCase.sourceText, shell, {
    retrieval: true,
    sourceRegisterLane: testCase.sourceVariant || undefined
  });
  const retrievalTrace = result.retrievalTrace || {};
  const donorProfile = extractCadenceProfile(testCase.donorText);
  return {
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
}

function expectedRetrievalFixtureIndex() {
  const cases = {};
  for (const testCase of CANONICAL_TRANSFER_CASES) {
    cases[testCase.id] = buildFixturePayload(testCase);
  }
  return { generatedAt: '__IGNORED__', cases };
}

function normalizeRetrievalFixturesPayload(raw = '') {
  const content = String(raw || '').trim();
  const match = content.match(/window\.TCP_RETRIEVAL_FIXTURES = ([\s\S]*);\s*\}\)\(\);?$/);
  if (!match) {
    throw new Error('app/retrieval-fixtures.js does not match the expected wrapper');
  }
  const parsed = JSON.parse(match[1]);
  parsed.generatedAt = '__IGNORED__';
  return parsed;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function normalizeGeneratedText(value = '') {
  return String(value).replace(/\r\n/g, '\n');
}

function checkTextFile(relativePath, expectedFactory, remediation) {
  const absolutePath = path.join(repoRoot, relativePath);
  const expected = normalizeGeneratedText(expectedFactory());
  const actual = normalizeGeneratedText(fs.readFileSync(absolutePath, 'utf8'));
  if (expected !== actual) {
    fail(`DRIFT: ${relativePath} is out of sync. ${remediation}`);
  }
}

function checkJsonFile(relativePath, expectedObject, remediation) {
  const absolutePath = path.join(repoRoot, relativePath);
  const actual = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  if (JSON.stringify(actual) !== JSON.stringify(expectedObject)) {
    fail(`DRIFT: ${relativePath} is out of sync. ${remediation}`);
  }
}

checkTextFile(
  'app/browser-engine.js',
  expectedBrowserEngine,
  'Run: npm run sync:browser-engine'
);

checkTextFile(
  'app/data/personas.json',
  expectedPersonasJson,
  'Run: npm run sync:personas-json'
);

checkTextFile(
  'app/data/defaults.json',
  expectedDefaultsJson,
  'Run: npm run sync:defaults-json'
);

checkTextFile(
  'app/browser-diagnostics.js',
  expectedBrowserDiagnostics,
  'Run: npm run sync:browser-diagnostics'
);

const expectedRetrievalIndex = expectedRetrievalFixtureIndex();
const actualRetrievalIndex = normalizeRetrievalFixturesPayload(
  fs.readFileSync(path.join(repoRoot, 'app', 'retrieval-fixtures.js'), 'utf8')
);
if (JSON.stringify(actualRetrievalIndex) !== JSON.stringify(expectedRetrievalIndex)) {
  fail('DRIFT: app/retrieval-fixtures.js is out of sync. Run: npm run sync:retrieval-fixtures');
}

for (const testCase of CANONICAL_TRANSFER_CASES) {
  checkJsonFile(
    path.join('tests', 'fixtures', 'retrieval-lane', `${testCase.id}.json`),
    buildFixturePayload(testCase),
    'Run: npm run sync:retrieval-fixtures'
  );
}

if (process.exitCode) {
  console.error('\nGenerated artifacts have drifted. Run: npm run sync:generated');
  process.exit(process.exitCode);
}

console.log('check-generated-sync.mjs passed');
