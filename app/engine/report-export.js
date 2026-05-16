import { detectForbiddenClaims, evaluateClaimCeiling } from './claim-ladder.js';
import { hashLedgerText, summarizeIterationLedger } from './iteration-ledger.js';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clone = (value) => value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
const score = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : null;

const FORBIDDEN_CONCLUSIONS = Object.freeze([
  'This report does not claim anonymity.',
  'This report does not claim untraceability.',
  'This report does not claim platform-proof behavior.',
  'This report does not issue same-author or not-same-author identity verdicts.'
]);

export function summarizeFeatureMetrics(input = {}) {
  const vector = input.escapeVector || {};
  const latestRow = asArray(input.iterationLedger?.rows).at(-1) || {};
  return { changedDimensions: asArray(input.changedDimensions || vector.changedDimensions || latestRow.changedDimensions), notes: asArray(vector.diagnostics?.warnings || vector.warnings) };
}

export function summarizeSemanticPreservation(input = {}) {
  const vector = input.escapeVector || {};
  const ingestion = input.ingestionAudit || {};
  const warnings = [];
  const fidelity = score(vector, 'semanticFidelity');
  if (fidelity !== null && fidelity < 0.82) warnings.push('semantic-fidelity-below-review-band');
  const protectedStatus = ingestion.protectedLiterals?.status || ingestion.protectedLiteralStatus || (warnings.length ? 'review' : 'not-evaluated');
  return { protectedLiteralStatus: protectedStatus, semanticFidelity: fidelity, warnings };
}

export function summarizeMaskUse(input = {}) {
  const persona = input.personaSummary || {};
  const vector = input.escapeVector || {};
  const warnings = [];
  if (score(vector, 'maskLinkability') >= 0.72) warnings.push('mask-linkability-elevated');
  if (score(vector, 'maskDrift') >= 0.55) warnings.push('mask-drift-elevated');
  return { personaId: persona.personaId || '', label: persona.label || '', acceptedCount: Number.isFinite(persona.acceptedCount) ? persona.acceptedCount : null, linkabilityStatus: persona.field?.linkabilityStatus || persona.linkabilityStatus || '', driftStatus: score(vector, 'maskDrift') >= 0.55 ? 'elevated' : 'reviewable', overuseWarnings: warnings };
}

export function summarizeAcceptedHistory(input = {}) { return summarizeIterationLedger(input.iterationLedger || {}); }

export function buildReportLimitations(input = {}) {
  const claim = input.claimCeiling || evaluateClaimCeiling(input);
  return [...new Set([...(claim.limitations || []), 'Reports exclude private text by default.', 'Report conclusions are bounded to local TD613-TCP metrics.'])];
}

function ingestionSummary(input = {}) {
  const ingestion = input.ingestionAudit || {};
  return { score: score(input.escapeVector || {}, 'ingestionFriction') ?? ingestion.ingestionFriction ?? null, unicodeLoad: ingestion.unicodeLoad ?? ingestion.unicodeSurface?.unicodeLoad ?? null, normalizationDelta: ingestion.normalizationDelta ?? ingestion.normalization?.delta ?? null, glyphIntegrity: ingestion.glyphIntegrity || ingestion.glyphs?.status || '', warnings: asArray(ingestion.warnings) };
}

function metrics(input = {}) {
  const vector = input.escapeVector || {};
  return { sourceResidualRisk: score(vector, 'sourceResidualRisk'), maskFit: score(vector, 'maskFit'), maskDeltaSafe: score(vector, 'maskDeltaSafe'), semanticFidelity: score(vector, 'semanticFidelity'), belongingWithoutCollapse: score(vector, 'belongingWithoutCollapse'), ingestionFriction: score(vector, 'ingestionFriction') ?? input.ingestionAudit?.ingestionFriction ?? null, apertureRecaptureRisk: score(vector, 'apertureRecaptureRisk'), maskLinkability: score(vector, 'maskLinkability'), maskDrift: score(vector, 'maskDrift') };
}

export function buildReportPayload(input = {}) {
  const claimCeiling = input.claimCeiling || evaluateClaimCeiling(input);
  const ledgerSummary = summarizeAcceptedHistory(input);
  const controller = input.controllerDecision || {};
  const payload = {
    version: 'phase-7',
    reportId: '',
    createdAt: input.createdAt ?? null,
    reportKind: 'local-stylometry-review',
    claimCeiling,
    summary: { permittedConclusion: claimCeiling.allowedClaim, controllerState: controller.state || 'unknown', controllerAction: controller.action || '', sealStatus: controller.state === 'seal' ? 'locally-sealable' : 'not-sealed', acceptedIterationId: ledgerSummary.latestAcceptedIterationId },
    metrics: metrics(input),
    featureMovement: summarizeFeatureMetrics(input),
    semanticPreservation: summarizeSemanticPreservation(input),
    ingestionFriction: ingestionSummary(input),
    maskUse: summarizeMaskUse(input),
    ledger: ledgerSummary,
    reproducibility: { localOnly: true, hashAlgorithm: input.iterationLedger?.reproducibility?.hashAlgorithm || 'fnv1a-32-local', sourceTextIncluded: false, outputTextIncluded: false, reportTextIncluded: false },
    limitations: buildReportLimitations({ ...input, claimCeiling }),
    forbiddenConclusions: [...FORBIDDEN_CONCLUSIONS]
  };
  payload.reportId = `report-${hashLedgerText(JSON.stringify({ claim: claimCeiling.id, metrics: payload.metrics, ledger: payload.ledger }))}`;
  return payload;
}

export function exportReportJson(payload = {}, options = {}) {
  const report = payload.version === 'phase-7' ? clone(payload) : buildReportPayload(payload);
  report.reproducibility = { ...(report.reproducibility || {}), reportTextIncluded: Boolean(options.includePrivateText), sourceTextIncluded: false, outputTextIncluded: false };
  const json = JSON.stringify(report, null, options.pretty === false ? 0 : 2);
  const check = detectForbiddenClaims(json);
  if (check.hasForbiddenClaim) throw new Error(`Forbidden report claim: ${check.matches.join(', ')}`);
  return json;
}

export function exportReportMarkdown(payload = {}, options = {}) {
  const report = payload.version === 'phase-7' ? payload : buildReportPayload(payload);
  const lines = [
    '# TD613-TCP Local Stylometry Report', '',
    'This report summarizes local authorship-recognition pressure under bounded assumptions. It does not prove identity, anonymity, platform outcome, or publication safety.', '',
    '## Claim Ceiling', `${report.claimCeiling.level}. ${report.claimCeiling.label}`, '',
    '## Permitted Conclusion', report.summary.permittedConclusion, '',
    '## Metrics Summary', ...Object.entries(report.metrics).map(([k, v]) => `- ${k}: ${v ?? 'unavailable'}`), '',
    '## Feature Movement', report.featureMovement.changedDimensions.length ? report.featureMovement.changedDimensions.map((d) => `- ${d}`).join('\n') : 'No changed dimensions recorded.', '',
    '## Semantic Preservation', `Protected literal status: ${report.semanticPreservation.protectedLiteralStatus || 'unavailable'}\nSemantic fidelity: ${report.semanticPreservation.semanticFidelity ?? 'unavailable'}`, '',
    '## Ingestion Friction', `Score: ${report.ingestionFriction.score ?? 'unavailable'}\nGlyph integrity: ${report.ingestionFriction.glyphIntegrity || 'unavailable'}`, '',
    '## Persona / Mask Use', `Persona: ${report.maskUse.label || 'unavailable'}\nAccepted count: ${report.maskUse.acceptedCount ?? 'unavailable'}\nLinkability: ${report.maskUse.linkabilityStatus || 'unavailable'}`, '',
    '## Iteration Ledger Summary', `Rows: ${report.ledger.rowCount}\nAccepted rows: ${report.ledger.acceptedCount}\nLatest state: ${report.ledger.latestState}\nLatest output hash: ${report.ledger.latestOutputHash || 'unavailable'}`, '',
    '## Limitations', ...report.limitations.map((item) => `- ${item}`), '',
    '## Forbidden Conclusions', ...report.forbiddenConclusions.map((item) => `- ${item}`)
  ];
  const markdown = lines.join('\n');
  const check = detectForbiddenClaims(markdown);
  if (check.hasForbiddenClaim) throw new Error(`Forbidden report claim: ${check.matches.join(', ')}`);
  return markdown;
}
