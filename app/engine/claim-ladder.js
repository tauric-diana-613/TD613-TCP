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

export const FORBIDDEN_CONCLUSION_PHRASES = Object.freeze([
  'anonymous',
  'untraceable',
  'platform-proof',
  'guaranteed safe',
  'same author',
  'not same author',
  'identity proven',
  'identity disproven',
  'cannot be linked',
  'will evade detection',
  'safe to publish'
]);

export const FORBIDDEN_CONCLUSION_DISCLAIMERS = Object.freeze([
  'This report does not claim anonymity.',
  'This report does not claim untraceability.',
  'This report does not claim platform-proof behavior.',
  'This report does not issue same-author or not-same-author identity verdicts.'
]);

const FORBIDDEN_PATTERNS = Object.freeze([
  { label: 'anonymous', pattern: /\banonymous\b/i },
  { label: 'untraceable', pattern: /\buntraceable\b/i },
  { label: 'platform-proof', pattern: /\bplatform[-\s]proof\b/i },
  { label: 'guaranteed safe', pattern: /\bguaranteed\s+safe\b/i },
  { label: 'same author', pattern: /\bsame\s+author\b/i },
  { label: 'not same author', pattern: /\bnot\s+same\s+author\b/i },
  { label: 'identity proven', pattern: /\bidentity\s+proven\b/i },
  { label: 'identity disproven', pattern: /\bidentity\s+disproven\b/i },
  { label: 'cannot be linked', pattern: /\bcannot\s+be\s+linked\b/i },
  { label: 'will evade detection', pattern: /\bwill\s+evade\s+detection\b/i },
  { label: 'safe to publish', pattern: /\bsafe\s+to\s+publish\b/i }
]);

const DISCLAIMER_PATTERNS = Object.freeze([
  /does\s+not\s+claim\s+(?:anonymous|anonymity|untraceability|platform[-\s]proof)/i,
  /does\s+not\s+issue\s+(?:same[-\s]author|not[-\s]same[-\s]author|same\s+author|not\s+same\s+author)/i,
  /does\s+not\s+prove\s+(?:identity|anonymity|platform\s+outcome|publication\s+safety)/i,
  /no\s+(?:anonymity|untraceability|platform[-\s]proof|same[-\s]author|not[-\s]same[-\s]author)\s+(?:conclusion|claim|verdict)/i,
  /not\s+an\s+(?:anonymity|untraceability|platform[-\s]proof|identity)\s+(?:claim|verdict|guarantee)/i,
  /refuses?\s+(?:identity|platform|anonymity|untraceability)\s+(?:verdicts?|guarantees?|claims?)/i
]);

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
const metric = (vector = {}, key) => Number.isFinite(vector?.scores?.[key]) ? vector.scores[key] : null;
const stateOf = (decision = {}) => decision?.state || 'unknown';

function wordsInIntent(intent = '') {
  return String(intent || '').toLowerCase();
}

function hasMetrics(vector = {}) {
  return Boolean(vector && typeof vector === 'object' && vector.scores && Object.keys(vector.scores).length > 0);
}

function latestLedgerRow(ledger = {}) {
  return asArray(ledger.rows).at(-1) || null;
}

function ledgerRowCount(ledger = {}) {
  return asArray(ledger.rows).length;
}

function acceptedLedgerCount(ledger = {}) {
  return asArray(ledger.accepted?.iterationIds).length || asArray(ledger.rows).filter((row) => row?.status?.accepted).length;
}

function changedDimensionCount(input = {}) {
  const vector = input.escapeVector || {};
  const latest = latestLedgerRow(input.iterationLedger || {}) || {};
  return unique(input.changedDimensions, vector.changedDimensions, latest.changedDimensions).length;
}

function personaAcceptedCount(personaSummary = {}, iterationLedger = {}) {
  const direct = personaSummary.acceptedCount ?? personaSummary.entryCount ?? personaSummary.memory?.acceptedCount;
  if (Number.isFinite(direct)) return direct;
  return acceptedLedgerCount(iterationLedger);
}

function personaLinkabilityStatus(personaSummary = {}) {
  return String(personaSummary.field?.linkabilityStatus || personaSummary.linkabilityStatus || personaSummary.status || '').toLowerCase();
}

function disclaimerContext(text = '', index = 0) {
  const start = Math.max(0, index - 120);
  const end = Math.min(text.length, index + 160);
  return text.slice(start, end);
}

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

export function detectForbiddenClaims(text = '') {
  const value = String(text ?? '');
  const matches = [];
  for (const item of FORBIDDEN_PATTERNS) {
    const found = value.match(item.pattern);
    if (!found) continue;
    const context = disclaimerContext(value, found.index || 0);
    if (DISCLAIMER_PATTERNS.some((safe) => safe.test(context))) continue;
    matches.push(item.label);
  }
  return {
    hasForbiddenClaim: matches.length > 0,
    matches: unique(matches),
    severity: matches.length ? 'block' : 'clear'
  };
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
  if (!hasMetrics(vector)) limitations.push('Escape Vector metrics are missing or incomplete.');
  if (stateOf(decision) === 'hold') limitations.push('Controller state is hold; evidence remains insufficient or unstable.');
  if (metric(vector, 'semanticFidelity') === null) limitations.push('Semantic fidelity is unavailable.');
  if (metric(vector, 'ingestionFriction') === null && !input.ingestionAudit) limitations.push('Ingestion Friction is unavailable or not supplied.');
  if (metric(vector, 'apertureRecaptureRisk') === null) limitations.push('Aperture recapture risk is unavailable or not supplied.');
  if (personaAcceptedCount(persona, ledger) < 3) limitations.push('Persona memory is underfit for stable continuity claims.');
  if (!ledgerRowCount(ledger)) limitations.push('Iteration ledger history is empty or unavailable.');
  if (metric(vector, 'ingestionFriction') >= 0.55) limitations.push('High ingestion friction may affect reproducibility and parser stability.');
  if (metric(vector, 'semanticFidelity') !== null && metric(vector, 'semanticFidelity') < 0.82) limitations.push('Semantic fidelity is below review threshold.');
  if (metric(vector, 'apertureRecaptureRisk') >= 0.55) limitations.push('Aperture recapture risk is elevated.');
  return unique(limitations);
}

export function evaluateClaimCeiling({
  escapeVector = {},
  ingestionAudit = {},
  controllerDecision = {},
  personaSummary = {},
  iterationLedger = {},
  reportIntent = 'local-review',
  changedDimensions = []
} = {}) {
  const vector = escapeVector || {};
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
  const ingestion = metric(vector, 'ingestionFriction') ?? (Number.isFinite(ingestionAudit.ingestionFriction) ? ingestionAudit.ingestionFriction : null);
  const controllerState = stateOf(controllerDecision);
  const dimensionsMoved = changedDimensionCount({ escapeVector: vector, iterationLedger, changedDimensions });
  const intent = wordsInIntent(reportIntent);

  if (/identity|same\s*author|not\s*same\s*author|platform|proof|publish|anonymous|untraceable|evade/i.test(intent)) {
    level = 8;
    reasons.push('Requested claim exceeds local TD613-TCP measurement authority.');
  } else if (!hasMetrics(vector) || !Number.isFinite(maskFit) || !Number.isFinite(semantic)) {
    level = 1;
    reasons.push('Required metrics are missing or unavailable.');
  } else if (controllerState === 'hold') {
    level = 1;
    reasons.push('Controller is holding for review.');
  } else {
    if (semantic >= 0.70 && maskFit >= 0.20) {
      level = 2;
      reasons.push('Output shows limited surface resemblance to the target mask.');
    }
    if (semantic >= 0.76 && maskFit >= 0.34) {
      level = 3;
      reasons.push('Output shows measurable style contact with the target mask.');
    }
    if (semantic >= 0.80 && maskFit >= 0.44 && dimensionsMoved >= 2 && controllerState !== 'hold') {
      level = 4;
      reasons.push('Feature movement is traceable under local metrics.');
    }
    if (semantic >= 0.84 && maskFit >= 0.58 && ['continue', 'seal'].includes(controllerState)) {
      level = 5;
      reasons.push('Mask fit and semantic preservation support local mask-fit candidacy.');
    }
    if (
      semantic >= 0.84 &&
      Number.isFinite(sourceResidual) && sourceResidual <= 0.45 &&
      Number.isFinite(delta) && delta > 0 &&
      ['continue', 'seal'].includes(controllerState) &&
      (!Number.isFinite(recapture) || recapture < 0.55)
    ) {
      level = 6;
      reasons.push('Source residual is reduced with positive safe delta and reviewable recapture risk.');
    }
    const acceptedCount = personaAcceptedCount(personaSummary, iterationLedger);
    const linkStatus = personaLinkabilityStatus(personaSummary);
    const stableIntent = ['stable-pseudonym', 'stable pseudonym', 'continuity'].some((token) => intent.includes(token));
    if (
      level >= 6 &&
      stableIntent &&
      acceptedCount >= 3 &&
      !['overfit-risk', 'quarantine'].includes(linkStatus) &&
      (!Number.isFinite(linkability) || linkability < 0.72) &&
      (!Number.isFinite(drift) || drift < 0.55)
    ) {
      level = 7;
      reasons.push('Persona history supports local stable pseudonymous continuity candidacy.');
    }
  }

  if (level === 8) warnings.push('external-corroboration-required');
  if (semantic !== null && semantic < 0.82) warnings.push('semantic-fidelity-below-review-band');
  if (Number.isFinite(recapture) && recapture >= 0.55) warnings.push('aperture-recapture-elevated');
  if (Number.isFinite(linkability) && linkability >= 0.72) warnings.push('mask-linkability-elevated');
  if (Number.isFinite(ingestion) && ingestion >= 0.55) warnings.push('ingestion-friction-elevated');

  const claim = normalizeClaimLevel(level);
  const inputForLimits = { escapeVector: vector, ingestionAudit, controllerDecision, personaSummary, iterationLedger };
  return {
    ...claim,
    reasons: unique(reasons),
    limitations: collectClaimLimitations(inputForLimits),
    forbiddenConclusions: [...FORBIDDEN_CONCLUSION_DISCLAIMERS],
    warnings: unique(warnings)
  };
}

export function enforceClaimLanguage(input = {}) {
  const text = String(input.text || input.allowedClaim || '');
  const detection = detectForbiddenClaims(text);
  return { allowed: !detection.hasForbiddenClaim, detection, text };
}
