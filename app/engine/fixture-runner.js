import { evaluateFixtureExpectations, summarizeCalibrationResult } from './calibration.js';
import { buildEscapeControllerDecision } from './escape-controller.js';
import { buildEscapeVector } from './escape-vector.js';
import { buildIngestionFrictionAudit } from './ingestion-friction.js';
import { appendIterationRow, createIterationLedger, linkAcceptedOutputToIteration, summarizeIterationLedger } from './iteration-ledger.js';
import { appendAcceptedOutput, createPersonaMemory, derivePersonaField, summarizePersonaMemory } from './persona-memory.js';
import { evaluateClaimCeiling } from './claim-ladder.js';
import { buildReportPayload, exportReportJson } from './report-export.js';

const DEFAULT_CANONICAL_TOKENS = Object.freeze({ khonaLitPo: 'Khona\u200Clit-po', glyphs: ['𝌋', '⟐'], badgeStrings: [] });
const TOKEN_RE = /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b|\b\d{2,}(?:[\-/:.]\d+)*\b/gi;
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clone = (value) => value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];

function privateLiteralCandidates(text = '') {
  return [...String(text || '').matchAll(TOKEN_RE)].map((match) => match[0]);
}

function protectedLiteralsFor(fixture = {}) {
  return unique(fixture.protectedLiterals, privateLiteralCandidates(fixture.inputs?.messageDraft), privateLiteralCandidates(fixture.inputs?.protectedOutput)).slice(0, 24);
}

async function readJsonFile(path = '') {
  const fs = await import('node:fs/promises');
  const text = await fs.readFile(path, 'utf8');
  return JSON.parse(text);
}

function joinFixturePath(manifestPath = '', fixturePath = '') {
  if (/^(?:[a-z]+:)?\/\//i.test(fixturePath) || fixturePath.startsWith('/')) return fixturePath;
  const manifestDir = manifestPath.includes('/') ? manifestPath.slice(0, manifestPath.lastIndexOf('/')) : '.';
  return `${manifestDir}/${fixturePath.replace(/^\.\//, '')}`;
}

export async function loadFixtureManifest(path = './fixtures/stylometry/manifest.json') {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    const response = await window.fetch(path);
    if (!response.ok) throw new Error(`Unable to load fixture manifest: ${response.status}`);
    const manifest = await response.json();
    const fixtures = [];
    for (const entry of asArray(manifest.fixtures)) {
      const fixtureResponse = await window.fetch(joinFixturePath(path, entry.path));
      if (!fixtureResponse.ok) throw new Error(`Unable to load fixture ${entry.id}: ${fixtureResponse.status}`);
      fixtures.push(await fixtureResponse.json());
    }
    return { manifest, fixtures };
  }
  const manifest = await readJsonFile(path);
  const fixtures = [];
  for (const entry of asArray(manifest.fixtures)) fixtures.push(await readJsonFile(joinFixturePath(path, entry.path)));
  return { manifest, fixtures };
}

function buildPersonaMemoryFromFixture(fixture = {}) {
  const persona = fixture.persona || {};
  let memory = createPersonaMemory({
    personaId: persona.personaId || 'fixture-persona',
    label: persona.label || persona.personaId || 'Fixture Persona',
    displayName: persona.label || persona.personaId || 'Fixture Persona',
    ontology: { role: persona.mode || fixture.fixtureClass || 'calibration', targetContexts: [fixture.fixtureClass || 'calibration'] },
    ritualSurface: { optionalMarkers: ['𝌋', '⟐'], protectedLiterals: protectedLiteralsFor(fixture), glyphs: ['𝌋', '⟐'], khonaLitPoRequired: fixture.fixtureClass === 'zwnj-integrity' }
  });
  for (const item of asArray(persona.history)) {
    memory = appendAcceptedOutput(memory, {
      text: item.text || item.outputText || item.content || '',
      profile: item.profile,
      escapeVector: item.escapeVector || {},
      ingestionAudit: item.ingestionAudit || {},
      controllerDecision: item.controllerDecision || { state: 'seal' },
      acceptance: { acceptedBy: 'fixture', reason: 'fixture-history', stateAtAcceptance: 'seal' }
    });
  }
  return memory;
}

function fixtureMode(fixture = {}, options = {}) {
  return options.mode || fixture.persona?.mode || fixture.mode || 'neutralize';
}

export function runStylometryFixture(fixture = {}, options = {}) {
  if (!fixture || !fixture.id || !fixture.inputs) {
    return {
      fixtureId: fixture?.id || 'unknown',
      status: 'invalid',
      score: 0,
      checks: [{ path: 'fixture.schema', status: 'invalid', message: 'fixture is missing id or inputs' }],
      warnings: [],
      failures: ['fixture is missing id or inputs']
    };
  }
  const mode = fixtureMode(fixture, options);
  const inputs = fixture.inputs || {};
  const protectedLiterals = protectedLiteralsFor(fixture);
  const personaMemory = buildPersonaMemoryFromFixture(fixture);
  const personaField = derivePersonaField(personaMemory);
  const maskHistory = asArray(personaField.maskHistory).length ? personaField.maskHistory : asArray(fixture.persona?.history);
  const maskText = inputs.maskReference || fixture.persona?.history?.map((entry) => entry.text || entry.outputText || '').join('\n') || '';
  const ingestionAudit = buildIngestionFrictionAudit({
    text: inputs.protectedOutput || '',
    protectedLiterals,
    canonicalTokens: DEFAULT_CANONICAL_TOKENS
  });
  const escapeVector = buildEscapeVector({
    protectedBaselineText: inputs.protectedBaseline || '',
    maskText,
    draftText: inputs.messageDraft || '',
    outputText: inputs.protectedOutput || '',
    maskHistory,
    protectedLiterals,
    ingestionAudit,
    apertureAudit: fixture.apertureAudit || {},
    options: {
      mode,
      targetContext: fixture.targetContext || fixture.fixtureClass || 'fixture-calibration',
      canonicalTokens: DEFAULT_CANONICAL_TOKENS,
      thresholds: { minWords: fixture.thresholds?.minWords ?? 8, ...(fixture.thresholds || {}) }
    }
  });
  const controllerDecision = buildEscapeControllerDecision({
    vector: escapeVector,
    mode,
    operatorIntent: { priority: fixture.fixtureClass, targetContext: fixture.targetContext || fixture.fixtureClass, allowHighFriction: Boolean(fixture.allowHighFriction) },
    iterationContext: { iteration: 0, maxIterations: 6 }
  });
  let ledger = createIterationLedger({ context: { benchVersion: 'phase-8', mode, selectedPersonaId: personaField.personaId, selectedPersonaLabel: personaField.label, targetContext: fixture.targetContext || fixture.fixtureClass } });
  ledger = appendIterationRow(ledger, {
    protectedBaselineText: inputs.protectedBaseline || '',
    maskReferenceText: maskText,
    messageDraftText: inputs.messageDraft || '',
    protectedOutputText: inputs.protectedOutput || '',
    personaField,
    personaSummary: summarizePersonaMemory(personaMemory),
    escapeVector,
    ingestionAudit,
    controllerDecision,
    includeTexts: false
  });
  if (fixture.expectations?.ledger?.accepted === true || controllerDecision.state === 'seal') ledger = linkAcceptedOutputToIteration(ledger, { iterationId: ledger.rows.at(-1)?.id, personaMemoryEntryId: personaMemory.memory?.entries?.at(-1)?.id || null });
  const claimCeiling = evaluateClaimCeiling({
    escapeVector,
    ingestionAudit,
    controllerDecision,
    personaSummary: summarizePersonaMemory(personaMemory),
    iterationLedger: ledger,
    reportIntent: fixture.reportIntent || 'local-review'
  });
  const reportPayload = buildReportPayload({
    escapeVector,
    ingestionAudit,
    controllerDecision,
    personaSummary: summarizePersonaMemory(personaMemory),
    iterationLedger: ledger,
    claimCeiling,
    protectedLiterals,
    options: { includeTexts: false, includeLedger: true, includePrivateText: false }
  });
  const calibration = evaluateFixtureExpectations({ fixture, escapeVector, ingestionAudit, controllerDecision, claimCeiling, reportPayload });
  return {
    ...calibration,
    fixture,
    escapeVector,
    ingestionAudit,
    controllerDecision,
    personaSummary: summarizePersonaMemory(personaMemory),
    iterationLedger: ledger,
    ledgerSummary: summarizeIterationLedger(ledger),
    claimCeiling,
    reportPayload
  };
}

export function runFixtureSuite(fixtures = [], options = {}) {
  const selected = filterFixtures(fixtures, options.filter || {});
  const results = selected.map((fixture) => runStylometryFixture(fixture, options));
  return { version: 'phase-8', results, summary: summarizeCalibrationResult(results) };
}

export function buildFixtureReport(results = [], options = {}) {
  const rows = asArray(results).map((result) => ({
    fixtureId: result.fixtureId,
    fixtureClass: result.fixtureClass || result.fixture?.fixtureClass || '',
    status: result.status,
    score: result.score,
    claimLevel: result.claimCeiling?.level ?? null,
    controllerState: result.controllerDecision?.state || '',
    failures: asArray(result.failures),
    warnings: asArray(result.warnings)
  }));
  const payload = { version: 'phase-8', generatedAt: options.generatedAt ?? null, summary: summarizeCalibrationResult(results), rows };
  const json = JSON.stringify(payload, null, options.pretty === false ? 0 : 2);
  return { payload, json };
}

export function filterFixtures(fixtures = [], criteria = {}) {
  const list = asArray(fixtures);
  if (!criteria || !Object.keys(criteria).length) return list;
  return list.filter((fixture) => {
    if (criteria.id && fixture.id !== criteria.id) return false;
    if (criteria.fixtureClass && fixture.fixtureClass !== criteria.fixtureClass) return false;
    if (criteria.priority && fixture.priority !== criteria.priority) return false;
    if (criteria.riskMode && fixture.riskMode !== criteria.riskMode) return false;
    return true;
  });
}

export function exportFixtureResultReport(results = [], options = {}) {
  const report = buildFixtureReport(results, options);
  return exportReportJson({
    version: 'phase-7',
    reportId: `fixture-report-${report.payload.summary.total}`,
    createdAt: options.generatedAt ?? null,
    reportKind: 'fixture-calibration-review',
    claimCeiling: { level: 1, id: 'no-reliable-signal', label: 'Fixture suite summary', allowedClaim: 'Fixture results summarize local metric behavior and do not support identity claims.', reasons: [], limitations: [], warnings: [] },
    summary: { permittedConclusion: 'Fixture results summarize local metric behavior and do not support identity claims.', controllerState: 'suite', controllerAction: 'calibrate', sealStatus: 'not-sealed', acceptedIterationId: null },
    metrics: {},
    featureMovement: { changedDimensions: [], notes: [] },
    semanticPreservation: { protectedLiteralStatus: '', semanticFidelity: null, warnings: [] },
    ingestionFriction: { score: null, unicodeLoad: null, normalizationDelta: null, glyphIntegrity: '', warnings: [] },
    maskUse: { personaId: '', label: '', acceptedCount: null, linkabilityStatus: '', driftStatus: '', overuseWarnings: [] },
    ledger: { rowCount: 0, acceptedCount: 0, latestState: '', latestOutputHash: '', latestAcceptedIterationId: null },
    reproducibility: { localOnly: true, hashAlgorithm: 'fnv1a-32-local', sourceTextIncluded: false, outputTextIncluded: false, reportTextIncluded: false },
    limitations: ['Fixtures are controlled pressure tests for local metric behavior, not identity truth tables.'],
    forbiddenConclusions: ['This report does not claim anonymity.', 'This report does not issue same-author or not-same-author identity verdicts.'],
    fixtureSummary: report.payload
  }, { pretty: true });
}
