import { detectForbiddenClaims, evaluateClaimCeiling, FORBIDDEN_CONCLUSION_DISCLAIMERS } from './claim-ladder.js';
import { hashLedgerText, summarizeIterationLedger } from './iteration-ledger.js';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clone = (value) => value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const score = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : null;
const safe = (value) => value == null ? '' : String(value);

function latestRow(ledger = {}) {
  return asArray(ledger.rows).at(-1) || {};
}

function reportHash(payload = {}) {
  return `report-${hashLedgerText(JSON.stringify(payload))}`;
}

export function summarizeFeatureMetrics(input = {}) {
  const vector = input.escapeVector || {};
  const row = latestRow(input.iterationLedger || {});
  const changedDimensions = unique(input.changedDimensions, vector.changedDimensions, row.changedDimensions);
  const notes = unique(vector.diagnostics?.warnings, vector.warnings, row.controller?.warnings);
  return { changedDimensions, notes };
}

export function summarizeSemanticPreservation(input = {}) {
  const vector = input.escapeVector || {};
  const ingestion = input.ingestionAudit || {};
  const warnings = [];
  const fidelity = score(vector, 'semanticFidelity');
  if (fidelity !== null && fidelity < 0.82) warnings.push('semantic-fidelity-below-review-band');
  const protectedLiteralStatus = ingestion.protectedLiterals?.status || ingestion.protectedLiteralStatus || ingestion.protectedLiteralsStatus || (warnings.length ? 'review' : 'not-evaluated');
  return { protectedLiteralStatus, semanticFidelity: fidelity, warnings };
}

export function summarizeMaskUse(input = {}) {
  const persona = input.personaSummary || {};
  const vector = input.escapeVector || {};
  const warnings = [];
  if (score(vector, 'maskLinkability') >= 0.72) warnings.push('mask-linkability-elevated');
  if (score(vector, 'maskDrift') >= 0.55) warnings.push('mask-drift-elevated');
  return {
    personaId: persona.personaId || '',
    label: persona.label || persona.displayName || '',
    acceptedCount: Number.isFinite(persona.acceptedCount) ? persona.acceptedCount : Number.isFinite(persona.entryCount) ? persona.entryCount : null,
    linkabilityStatus: persona.field?.linkabilityStatus || persona.linkabilityStatus || '',
    driftStatus: score(vector, 'maskDrift') >= 0.55 ? 'elevated' : 'reviewable',
    overuseWarnings: warnings
  };
}

export function summarizeAcceptedHistory(input = {}) {
  return summarizeIterationLedger(input.iterationLedger || {});
}

export function buildReportLimitations(input = {}) {
  const claim = input.claimCeiling || evaluateClaimCeiling(input);
  return unique(
    claim.limitations,
    [
      'Reports exclude private text by default.',
      'Report conclusions are bounded to local TD613-TCP metrics.',
      'The Claim Ladder is the ceiling on permitted language, not a confidence trophy.'
    ]
  );
}

function summarizeIngestionFriction(input = {}) {
  const ingestion = input.ingestionAudit || {};
  return {
    score: score(input.escapeVector || {}, 'ingestionFriction') ?? ingestion.ingestionFriction ?? null,
    unicodeLoad: ingestion.unicodeLoad ?? ingestion.unicodeSurface?.unicodeLoad ?? ingestion.counts?.unicodeLoad ?? null,
    normalizationDelta: ingestion.normalizationDelta ?? ingestion.normalization?.delta ?? ingestion.normalization?.deltaScore ?? null,
    glyphIntegrity: ingestion.glyphIntegrity || ingestion.glyphs?.status || ingestion.khonaLitPo?.status || '',
    warnings: asArray(ingestion.warnings)
  };
}

function summarizeMetrics(input = {}) {
  const vector = input.escapeVector || {};
  return {
    sourceResidualRisk: score(vector, 'sourceResidualRisk'),
    maskFit: score(vector, 'maskFit'),
    maskDeltaSafe: score(vector, 'maskDeltaSafe'),
    semanticFidelity: score(vector, 'semanticFidelity'),
    belongingWithoutCollapse: score(vector, 'belongingWithoutCollapse'),
    ingestionFriction: score(vector, 'ingestionFriction') ?? input.ingestionAudit?.ingestionFriction ?? null,
    apertureRecaptureRisk: score(vector, 'apertureRecaptureRisk'),
    maskLinkability: score(vector, 'maskLinkability'),
    maskDrift: score(vector, 'maskDrift')
  };
}

export function buildReportPayload(input = {}) {
  const options = { includeTexts: false, includeLedger: true, includePrivateText: false, format: 'json', ...(input.options || {}) };
  const claimCeiling = input.claimCeiling || evaluateClaimCeiling(input);
  const ledgerSummary = summarizeAcceptedHistory(input);
  const controller = input.controllerDecision || {};
  const payload = {
    version: 'phase-7',
    reportId: '',
    createdAt: input.createdAt ?? null,
    reportKind: 'local-stylometry-review',
    claimCeiling,
    summary: {
      permittedConclusion: claimCeiling.allowedClaim,
      controllerState: controller.state || 'unknown',
      controllerAction: controller.action || '',
      sealStatus: controller.state === 'seal' ? 'locally-sealable' : 'not-sealed',
      acceptedIterationId: ledgerSummary.latestAcceptedIterationId || null
    },
    metrics: summarizeMetrics(input),
    featureMovement: summarizeFeatureMetrics(input),
    semanticPreservation: summarizeSemanticPreservation(input),
    ingestionFriction: summarizeIngestionFriction(input),
    maskUse: summarizeMaskUse(input),
    ledger: options.includeLedger === false ? { rowCount: 0, acceptedCount: 0, latestState: '', latestOutputHash: '', latestAcceptedIterationId: null } : {
      rowCount: ledgerSummary.rowCount || 0,
      acceptedCount: ledgerSummary.acceptedCount || 0,
      latestState: ledgerSummary.latestState || '',
      latestOutputHash: ledgerSummary.latestOutputHash || '',
      latestAcceptedIterationId: ledgerSummary.latestAcceptedIterationId || null
    },
    reproducibility: {
      localOnly: true,
      hashAlgorithm: input.iterationLedger?.reproducibility?.hashAlgorithm || 'fnv1a-32-local',
      sourceTextIncluded: false,
      outputTextIncluded: false,
      reportTextIncluded: Boolean(options.includePrivateText)
    },
    limitations: buildReportLimitations({ ...input, claimCeiling }),
    forbiddenConclusions: [...FORBIDDEN_CONCLUSION_DISCLAIMERS]
  };
  payload.reportId = reportHash({ claim: claimCeiling.id, metrics: payload.metrics, ledger: payload.ledger, createdAt: payload.createdAt });
  return payload;
}

function assertReportLanguage(text = '') {
  const detection = detectForbiddenClaims(text);
  if (detection.hasForbiddenClaim) throw new Error(`Forbidden report claim: ${detection.matches.join(', ')}`);
}

export function exportReportJson(payload = {}, options = {}) {
  const report = payload.version === 'phase-7' ? clone(payload) : buildReportPayload({ ...payload, options });
  report.reproducibility = {
    ...(report.reproducibility || {}),
    reportTextIncluded: Boolean(options.includePrivateText),
    sourceTextIncluded: false,
    outputTextIncluded: false
  };
  const json = JSON.stringify(report, null, options.pretty === false ? 0 : 2);
  assertReportLanguage(json);
  return json;
}

export function exportReportMarkdown(payload = {}, options = {}) {
  const report = payload.version === 'phase-7' ? payload : buildReportPayload({ ...payload, options });
  const metricLines = Object.entries(report.metrics).map(([key, value]) => `- ${key}: ${value ?? 'unavailable'}`);
  const movementLines = report.featureMovement.changedDimensions.length
    ? report.featureMovement.changedDimensions.map((item) => `- ${item}`)
    : ['No changed dimensions recorded.'];
  const limitationLines = report.limitations.length ? report.limitations.map((item) => `- ${item}`) : ['- No additional limitations recorded.'];
  const forbiddenLines = report.forbiddenConclusions.map((item) => `- ${item}`);
  const markdown = [
    '# TD613-TCP Local Stylometry Report',
    '',
    'This report summarizes local authorship-recognition pressure under bounded assumptions. It does not prove identity, anonymity, platform outcome, or publication safety.',
    '',
    '## Claim Ceiling',
    `${report.claimCeiling.level}. ${report.claimCeiling.label}`,
    '',
    '## Permitted Conclusion',
    report.summary.permittedConclusion,
    '',
    '## Metrics Summary',
    ...metricLines,
    '',
    '## Feature Movement',
    ...movementLines,
    '',
    '## Semantic Preservation',
    `Protected literal status: ${report.semanticPreservation.protectedLiteralStatus || 'unavailable'}`,
    `Semantic fidelity: ${report.semanticPreservation.semanticFidelity ?? 'unavailable'}`,
    ...(report.semanticPreservation.warnings || []).map((item) => `- warning: ${item}`),
    '',
    '## Ingestion Friction',
    `Score: ${report.ingestionFriction.score ?? 'unavailable'}`,
    `Unicode load: ${report.ingestionFriction.unicodeLoad ?? 'unavailable'}`,
    `Normalization delta: ${report.ingestionFriction.normalizationDelta ?? 'unavailable'}`,
    `Glyph integrity: ${report.ingestionFriction.glyphIntegrity || 'unavailable'}`,
    '',
    '## Persona / Mask Use',
    `Persona: ${report.maskUse.label || 'unavailable'}`,
    `Accepted count: ${report.maskUse.acceptedCount ?? 'unavailable'}`,
    `Linkability: ${report.maskUse.linkabilityStatus || 'unavailable'}`,
    `Drift: ${report.maskUse.driftStatus || 'unavailable'}`,
    '',
    '## Iteration Ledger Summary',
    `Rows: ${report.ledger.rowCount}`,
    `Accepted rows: ${report.ledger.acceptedCount}`,
    `Latest state: ${report.ledger.latestState || 'unavailable'}`,
    `Latest output hash: ${report.ledger.latestOutputHash || 'unavailable'}`,
    '',
    '## Limitations',
    ...limitationLines,
    '',
    '## Forbidden Conclusions',
    ...forbiddenLines
  ].join('\n');
  assertReportLanguage(markdown);
  return markdown;
}
