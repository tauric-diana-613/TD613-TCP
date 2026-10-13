export const HUSH_EXPORT_POLICY_VERSION = 'phase-12';

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const safeText = (value) => String(value ?? '');

export const HUSH_EXPORT_MODES = Object.freeze({
  'share-export': {
    includePrivateText: false,
    includeFullCandidates: false,
    includeFullVectors: false,
    includeMaskProfile: false,
    includeLiteralValues: false,
    description: 'Low-detail summary for sharing review posture without exposing text or fine-grained fingerprints.'
  },
  'review-export': {
    includePrivateText: false,
    includeFullCandidates: true,
    includeFullVectors: true,
    includeMaskProfile: true,
    includeLiteralValues: false,
    description: 'Local review export with detailed metrics but no raw private text.'
  },
  'legal-export': {
    includePrivateText: false,
    includeFullCandidates: false,
    includeFullVectors: true,
    includeMaskProfile: false,
    includeLiteralValues: false,
    description: 'Evidence-preserving summary with custody checks, claim ceiling, and literal hashes.'
  },
  'private-full-export': {
    includePrivateText: true,
    includeFullCandidates: true,
    includeFullVectors: true,
    includeMaskProfile: true,
    includeLiteralValues: true,
    description: 'Explicit private export for local custody only.'
  }
});

export function normalizeHushExportMode(mode = 'share-export') {
  return HUSH_EXPORT_MODES[mode] ? mode : 'share-export';
}

export function getHushExportPolicy(mode = 'share-export', overrides = {}) {
  const normalized = normalizeHushExportMode(mode);
  return { version: HUSH_EXPORT_POLICY_VERSION, mode: normalized, ...HUSH_EXPORT_MODES[normalized], ...overrides };
}

function summarizeCandidate(candidate = {}) {
  return {
    id: candidate.id,
    finalScore: candidate.finalScore,
    scoreBreakdown: candidate.scoreBreakdown,
    matchSummary: candidate.matchSummary || (candidate.match ? {
      matchScore: candidate.match.matchScore,
      toleranceStatus: candidate.match.toleranceStatus,
      protectedLiteralStatus: candidate.match.protectedLiteralStatus,
      semanticFidelity: candidate.match.semanticFidelity,
      sourceResidualRisk: candidate.match.sourceResidualRisk,
      warnings: asArray(candidate.match.warnings)
    } : null),
    residualSummary: candidate.residualSummary || null,
    steeringSummary: candidate.steeringSummary || null,
    warnings: asArray(candidate.warnings)
  };
}

function stripLiteralValues(lockbox = {}, includeLiteralValues = false) {
  if (!lockbox || typeof lockbox !== 'object') return null;
  return {
    ...lockbox,
    literals: asArray(lockbox.literals).map((item) => ({ ...item, literal: includeLiteralValues ? item.literal : null })),
    checks: asArray(lockbox.checks).map((item) => ({ ...item, literal: includeLiteralValues ? item.literal : null })),
    missing: asArray(lockbox.missing).map((item) => ({ ...item, literal: includeLiteralValues ? item.literal : null }))
  };
}

export function buildHushExportPayload(result = {}, options = {}) {
  const policy = getHushExportPolicy(options.mode || 'share-export', options);
  const payload = {
    version: result.version || 'phase-12',
    exportPolicy: policy,
    selectedCandidateId: result.selectedCandidateId || '',
    selectedOutput: policy.includePrivateText ? result.selectedOutput || '' : undefined,
    candidates: policy.includeFullCandidates ? asArray(result.candidates).map((candidate) => ({
      ...candidate,
      text: policy.includePrivateText ? candidate.text : undefined,
      profile: policy.includeMaskProfile ? candidate.profile : undefined
    })) : asArray(result.candidates).map(summarizeCandidate),
    matchSummary: result.matchSummary || null,
    residualSummary: result.residualSummary || result.residualVector?.summary || null,
    steeringSummary: result.steeringSummary || null,
    lockboxSummary: result.lockboxSummary || null,
    lockbox: stripLiteralValues(result.lockbox, policy.includeLiteralValues),
    lockboxVerification: stripLiteralValues(result.lockboxVerification, policy.includeLiteralValues),
    maskLifecycle: result.maskLifecycle || null,
    claimCeiling: result.claimCeiling ? {
      level: result.claimCeiling.level ?? null,
      id: result.claimCeiling.id || '',
      label: result.claimCeiling.label || '',
      warnings: asArray(result.claimCeiling.warnings)
    } : null,
    escapeVector: policy.includeFullVectors ? result.escapeVector || null : null,
    ingestionAudit: policy.includeFullVectors ? result.ingestionAudit || null : null,
    controllerDecision: policy.includeFullVectors ? result.controllerDecision || null : null,
    recognitionField: policy.includeFullVectors ? result.recognitionField || null : null,
    warnings: asArray(result.warnings),
    limitations: asArray(result.limitations),
    reproducibility: { privateTextIncluded: Boolean(policy.includePrivateText), exportMode: policy.mode }
  };
  return JSON.parse(JSON.stringify(payload, (key, value) => value === undefined ? undefined : value));
}

export function exportHushPolicyJson(result = {}, options = {}) {
  return JSON.stringify(buildHushExportPayload(result, options), null, options.pretty === false ? 0 : 2);
}

export function detectExportOverDisclosure(payload = {}) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return {
    hasRawTextField: /"(?:text|selectedOutput|sourceText|outputText|messageDraftText)"\s*:\s*".{8,}"/.test(text),
    hasLiteralValue: /"literal"\s*:\s*".{3,}"/.test(text),
    warnings: [
      ...(/"(?:text|selectedOutput|sourceText|outputText|messageDraftText)"\s*:\s*".{8,}"/.test(text) ? ['raw-text-field-present'] : []),
      ...(/"literal"\s*:\s*".{3,}"/.test(text) ? ['literal-value-present'] : [])
    ]
  };
}
