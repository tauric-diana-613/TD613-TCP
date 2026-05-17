import assert from 'assert';
import { detectForbiddenClaims, evaluateClaimCeiling } from '../app/engine/claim-ladder.js';
import {
  buildReportLimitations,
  buildReportPayload,
  exportReportJson,
  exportReportMarkdown,
  summarizeAcceptedHistory,
  summarizeFeatureMetrics,
  summarizeMaskUse,
  summarizeSemanticPreservation
} from '../app/engine/report-export.js';

const confidentialBaseline = 'BASELINE_CONFIDENTIAL_TOKEN_613';
const confidentialDraft = 'DRAFT_CONFIDENTIAL_TOKEN_613';
const confidentialOutput = 'OUTPUT_CONFIDENTIAL_TOKEN_613';

const input = {
  escapeVector: {
    scores: {
      sourceResidualRisk: 0.31,
      maskFit: 0.73,
      maskDeltaSafe: 0.42,
      semanticFidelity: 0.91,
      belongingWithoutCollapse: 0.82,
      ingestionFriction: 0.23,
      apertureRecaptureRisk: 0.19,
      maskLinkability: 0.41,
      maskDrift: 0.22
    },
    diagnostics: { warnings: ['source-residual-reviewable'] }
  },
  ingestionAudit: {
    ingestionFriction: 0.23,
    unicodeLoad: 0.11,
    normalizationDelta: 0.04,
    glyphIntegrity: 'preserved',
    protectedLiterals: { status: 'intact' },
    warnings: []
  },
  controllerDecision: { state: 'seal', action: 'seal-output', confidence: 0.88 },
  personaSummary: { personaId: 'persona-operator', label: 'Operator', acceptedCount: 3, field: { linkabilityStatus: 'usable' } },
  iterationLedger: {
    version: 'phase-6',
    reproducibility: { hashAlgorithm: 'fnv1a-32-local' },
    accepted: { iterationIds: ['iter-1'], latestAcceptedIterationId: 'iter-1' },
    rows: [{
      id: 'iter-1',
      changedDimensions: ['punctuation-shift', 'sentence-rhythm'],
      controller: { state: 'seal' },
      hashes: { outputHash: 'abc123' },
      texts: { protectedBaseline: confidentialBaseline, messageDraft: confidentialDraft, protectedOutput: confidentialOutput },
      textIncluded: { protectedBaseline: true, messageDraft: true, protectedOutput: true }
    }]
  }
};

assert.equal(typeof buildReportPayload, 'function');
assert.equal(typeof exportReportJson, 'function');
assert.equal(typeof exportReportMarkdown, 'function');
assert.equal(typeof summarizeFeatureMetrics, 'function');
assert.equal(typeof summarizeSemanticPreservation, 'function');
assert.equal(typeof summarizeMaskUse, 'function');
assert.equal(typeof summarizeAcceptedHistory, 'function');
assert.equal(typeof buildReportLimitations, 'function');

const claimCeiling = evaluateClaimCeiling(input);
assert(claimCeiling.level >= 6);

const payload = buildReportPayload({ ...input, claimCeiling });
assert.equal(payload.version, 'phase-7');
assert(payload.reportId.startsWith('report-'));
assert(payload.claimCeiling);
assert.equal(payload.claimCeiling.id, claimCeiling.id);
assert.equal(payload.reportKind, 'local-stylometry-review');
assert.equal(payload.summary.permittedConclusion, claimCeiling.allowedClaim);
assert.equal(payload.metrics.sourceResidualRisk, 0.31);
assert.equal(payload.metrics.maskFit, 0.73);
assert.equal(payload.semanticPreservation.protectedLiteralStatus, 'intact');
assert.equal(payload.ingestionFriction.score, 0.23);
assert.equal(payload.ingestionFriction.glyphIntegrity, 'preserved');
assert.equal(payload.maskUse.personaId, 'persona-operator');
assert.equal(payload.maskUse.acceptedCount, 3);
assert.equal(payload.ledger.rowCount, 1);
assert.equal(payload.ledger.acceptedCount, 1);
assert.equal(payload.reproducibility.localOnly, true);
assert.equal(payload.reproducibility.sourceTextIncluded, false);
assert.equal(payload.reproducibility.outputTextIncluded, false);
assert(payload.limitations.length > 0);
assert(payload.forbiddenConclusions.some((line) => line.includes('does not claim')));

const json = exportReportJson(payload);
assert.equal(typeof json, 'string');
assert(json.includes('claimCeiling'));
assert(json.includes('sourceResidualRisk'));
assert(json.includes('semanticPreservation'));
assert(json.includes('ingestionFriction'));
assert(json.includes('maskUse'));
assert(json.includes('ledger'));
assert(json.includes('limitations'));
assert(!json.includes(confidentialBaseline));
assert(!json.includes(confidentialDraft));
assert(!json.includes(confidentialOutput));
assert.equal(detectForbiddenClaims(json).hasForbiddenClaim, false);
const parsed = JSON.parse(json);
assert.equal(parsed.version, 'phase-7');

const markdown = exportReportMarkdown(payload);
for (const heading of [
  '# TD613-TCP Local Stylometry Report',
  '## Claim Ceiling',
  '## Permitted Conclusion',
  '## Metrics Summary',
  '## Feature Movement',
  '## Semantic Preservation',
  '## Ingestion Friction',
  '## Persona / Mask Use',
  '## Iteration Ledger Summary',
  '## Limitations',
  '## Forbidden Conclusions'
]) assert(markdown.includes(heading), `missing heading ${heading}`);
assert(markdown.includes(payload.summary.permittedConclusion));
assert(markdown.includes('This report summarizes local authorship-recognition pressure under bounded assumptions.'));
assert(!markdown.includes(confidentialBaseline));
assert(!markdown.includes(confidentialDraft));
assert(!markdown.includes(confidentialOutput));
assert.equal(detectForbiddenClaims(markdown).hasForbiddenClaim, false);

const jsonAgain = exportReportJson(payload);
assert.equal(json, jsonAgain);

console.log('report-export tests passed');
