export const CLAIM_LEVELS = Object.freeze([
  { level: 1, id: 'no-reliable-signal', label: 'No reliable signal', allowedClaim: 'The available measurements do not support a reliable style claim.' },
  { level: 2, id: 'surface-resemblance', label: 'Surface resemblance', allowedClaim: 'The output shows limited surface resemblance to the target mask.' },
  { level: 3, id: 'style-contact', label: 'Style contact', allowedClaim: 'The output shows measurable style contact with the target mask.' },
  { level: 4, id: 'traceable-style-contact', label: 'Traceable style contact', allowedClaim: 'The output shows traceable style movement toward the target mask under local metrics.' },
  { level: 5, id: 'mask-fit-candidate', label: 'Mask-fit candidate', allowedClaim: 'The output qualifies as a local mask-fit candidate.' },
  { level: 6, id: 'reduced-source-linkage-candidate', label: 'Reduced source-linkage candidate', allowedClaim: 'The output qualifies as a local reduced source-linkage candidate.' },
  { level: 7, id: 'stable-pseudonymous-continuity-candidate', label: 'Stable pseudonymous continuity candidate', allowedClaim: 'The output may support local stable pseudonymous continuity under this Persona history.' },
  { level: 8, id: 'requires-external-corroboration', label: 'Requires external corroboration', allowedClaim: 'Any stronger authorship or platform claim requires external corroboration.' }
]);

const FORBIDDEN_PATTERNS = Object.freeze([
  /\banonymous\b/i,
  /\buntraceable\b/i,
  /\bplatform-proof\b/i,
  /\bguaranteed safe\b/i,
  /\bsame author\b/i,
  /\bnot same author\b/i,
  /\bidentity proven\b/i,
  /\bidentity disproven\b/i,
  /\bcannot be linked\b/i,
  /\bwill evade detection\b/i,
  /\bsafe to publish\b/i
]);

const DISCLAIMER_PATTERNS = Object.freeze([
  /does not claim\s+anonymous/i,
  /does not claim\s+anonymity/i,
  /does not claim\s+untraceability/i,
  /does not claim\s+platform-proof/i,
  /does not issue\s+same-author/i,
  /does not issue\s+same author/i,
  /does not issue\s+not-same-author/i,
  /does not issue\s+not same author/i,
  /does not prove\s+identity/i,
  /no\s+anonymity\s+conclusion/i,
  /no\s+untraceability\s+conclusion/i,
  /no\s+platform-proof\s+conclusion/i,
  /no\s+same-author/i,
  /no\s+not-same-author/i
]);

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const metric = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : null;
const stateOf = (decision = {}) => decision?.state || 'unknown';

export function normalizeClaimLevel(level) {
  if (typeof level === 'object' && level?.id) return CLAIM_LEVELS.find((entry) => entry.id === level.id) || CLAIM_LEVELS[0];
  if (typeof level === 'string') return CLAIM_LEVELS.find((entry) => entry.id === level || entry.label.toLowerCase() === level.toLowerCase()) || CLAIM_LEVELS[0];
  if (Number.isFinite(level)) return CLAIM_LEVELS.find((entry) => entry.level === Math.max(1, Math.min(8, Math.round(level)))) || CLAIM_LEVELS[0];
  return CLAIM_LEVELS[0];
}

export function describeClaimLevel(level) {
  const normalized = normalizeClaimLevel(level);
  return `${normalized.level}. ${normalized.label}: ${normalized.allowedClaim}`;
}

function disclaimerContext(text = '', index = 0) {
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + 120);
  return text.slice(start, end);
}

export function detectForbiddenClaims(text = '') {
  const value = String(text ?? '');
  const matches = [];
  for (const pattern of FORBIDDEN_PATTERNS) {
    const found = value.match(pattern);
    if (!found) continue;
    const context = disclaimerContext(value, found.index || 0);
    if (DISCLAIMER_PATTERNS.some((safe) => safe.test(context))) continue;
    matches.push(found[0]);
  }
  return { hasForbiddenClaim: matches.length > 0, matches: unique(matches.map((m) => m.toLowerCase())), severity: matches.length ? 'block' : 'clear' };
}

export function collectClaimLimitations(input = {}) {
  const vector = input.escapeVector || {};
  const decision = input.controllerDecision || {};
  const persona = input.personaSummary || {};
  const ledger = input.iterationLedger || {};
  const limitations = [
    'Local metrics are bounded to this TD613-TCP run and should not be read as platform outcomes.',
    'The report summarizes style pressure and movement, not author identity.',
    'Short samples, topic overlap, and entity overlap can distort stylometry signals.'
  ];
  if (!vector?.scores) limitations.push('Escape Vector metrics are missing or incomplete.');
  if (stateOf(decision) === 'hold') limitations.push('Controller state is hold; evidence remains insufficient or unstable.');
  if ((persona.entryCount || 0) < 3 && (persona.acceptedCount || 0) < 3) limitations.push('Persona memory is underfit for stable continuity claims.');
  if (!asArray(ledger.rows).length) limitations.push('Iteration ledger history is empty or unavailable.');
  if (metric(vector, 'ingestionFriction') >= 0.55) limitations.push('High ingestion friction may affect reproducibility and parser stability.');
  if (metric(vector, 'semanticFidelity') !== null && metric(vector, 'semanticFidelity') < 0.82) limitations.push('Semantic fidelity is below review threshold.');
  return unique(limitations);
}

export function evaluateClaimCeiling(input = {}) {
  const vector = input.escapeVector || {};
  const scores = vector.scores || {};
  const decision = input.controllerDecision || {};
  const persona = input.personaSummary || {};
  const ledger = input.iterationLedger || {};
  const reportIntent = String(input.reportIntent || 'local-review').toLowerCase();
  const reasons = [];
  const warnings = [];
  let level = 1;

  const maskFit = metric(vector, 'maskFit');
  const sourceResidual = metric(vector, 'sourceResidualRisk');
  const delta = metric(vector, 'maskDeltaSafe');
  const semantic = metric(vector, 'semanticFidelity');
  const recapture = metric(vector, 'apertureRecaptureRisk');
  const linkability = metric(vector, 'maskLinkability');
  const drift = metric(vector, 'maskDrift');
  const controllerState = stateOf(decision);
  const lastRow = asArray(ledger.rows).at(-1) || {};
  const changed = asArray(input.changedDimensions || vector.changedDimensions || lastRow.changedDimensions);

  if (reportIntent.includes('identity') || reportIntent.includes('platform') || reportIntent.includes('proof') || reportIntent.includes('publish')) {
    level = 8;
    reasons.push('Requested claim exceeds local TD613-TCP measurement authority.');
  } else if (!scores || Object.keys(scores).length === 0 || !Number.isFinite(maskFit) || !Number.isFinite(semantic)) {
    level = 1;
    reasons.push('Required metrics are missing or unavailable.');
  } else if (controllerState === 'hold') {
    level = 1;
    reasons.push('Controller is holding for review.');
  } else {
    if (semantic >= 0.72 && maskFit >= 0.22) { level = 2; reasons.push('Output shows limited surface resemblance to the mask.'); }
    if (semantic >= 0.78 && maskFit >= 0.35) { level = 3; reasons.push('Output shows measurable style contact with the mask.'); }
    if (semantic >= 0.82 && maskFit >= 0.45 && changed.length >= 2 && controllerState !== 'hold') { level = 4; reasons.push('Feature movement is traceable under local metrics.'); }
    if (semantic >= 0.86 && maskFit >= 0.58 && ['continue', 'seal'].includes(controllerState)) { level = 5; reasons.push('Mask fit and semantic preservation support local mask-fit candidacy.'); }
    if (semantic >= 0.86 && Number.isFinite(sourceResidual) && sourceResidual <= 0.45 && Number.isFinite(delta) && delta > 0 && ['continue', 'seal'].includes(controllerState) && (!Number.isFinite(recapture) || recapture < 0.55)) { level = 6; reasons.push('Source residual is reduced with positive safe delta and reviewable recapture risk.'); }
    const acceptedCount = persona.acceptedCount ?? persona.entryCount ?? ledger.accepted?.iterationIds?.length ?? 0;
    const linkStatus = persona.field?.linkabilityStatus || persona.linkabilityStatus || '';
    if (level >= 6 && acceptedCount >= 3 && linkStatus !== 'overfit-risk' && linkStatus !== 'quarantine' && (!Number.isFinite(linkability) || linkability < 0.72) && (!Number.isFinite(drift) || drift < 0.55)) {
      level = 7;
      reasons.push('Persona history is sufficient for local stable pseudonymous continuity candidacy.');
    }
  }

  if (level === 8) warnings.push('External corroboration required for stronger claims.');
  if (semantic !== null && semantic < 0.82) warnings.push('semantic-fidelity-below-review-band');
  if (Number.isFinite(recapture) && recapture >= 0.55) warnings.push('aperture-recapture-elevated');
  if (Number.isFinite(linkability) && linkability >= 0.72) warnings.push('mask-linkability-elevated');

  const claim = normalizeClaimLevel(level);
  return { ...claim, reasons: unique(reasons), limitations: collectClaimLimitations(input), forbiddenConclusions: [
    'This report does not claim anonymity.',
    'This report does not claim untraceability.',
    'This report does not claim platform-proof behavior.',
    'This report does not issue same-author or not-same-author identity verdicts.'
  ], warnings: unique(warnings) };
}

export function enforceClaimLanguage(input = {}) {
  const text = String(input.text || input.allowedClaim || '');
  const detection = detectForbiddenClaims(text);
  return { allowed: !detection.hasForbiddenClaim, detection, text };
}
