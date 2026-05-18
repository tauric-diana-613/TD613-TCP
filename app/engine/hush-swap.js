import { buildCadenceTransfer, extractCadenceProfile } from './stylometry.js';
import { buildEscapeVector } from './escape-vector.js';
import { buildIngestionFrictionAudit } from './ingestion-friction.js';
import { buildEscapeControllerDecision } from './escape-controller.js';
import { evaluateClaimCeiling } from './claim-ladder.js';
import { buildContextProfile } from './context-profile.js';
import { buildRecognitionField } from './recognition-field.js';
import { buildProfileMatch, summarizeProfileMatch } from './hush-profile-match.js';
import { buildResidualVector, summarizeResidualVector } from './hush-residual-vector.js';
import { buildProtectedLiteralLockbox, verifyProtectedLiteralLockbox, summarizeProtectedLiteralLockbox } from './hush-protected-literal-lockbox.js';
import { buildSteeringPlan, scoreCandidateWithSteering, summarizeSteeringPlan } from './hush-steering-plan.js';
import { buildMaskLifecycle, summarizeMaskLifecycle } from './hush-mask-lifecycle.js';
import { exportHushPolicyJson } from './hush-export-policy.js';

export const HUSH_SWAP_VERSION = 'phase-12';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? [...value] : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

function extractProtectedLiterals(text = '') {
  return [...new Set([
    ...(safeText(text).match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\/-]*\b/g) || []),
    ...(safeText(text).match(/\b\d{2,}(?:[\-/:.]\d+)*\b/g) || [])
  ])].slice(0, 32);
}

function literalScore(outputText = '', protectedLiterals = []) {
  const required = asArray(protectedLiterals).filter(Boolean);
  if (!required.length) return 1;
  const kept = required.filter((literal) => safeText(outputText).includes(literal)).length;
  return clamp(kept / required.length);
}

function mutateCandidate(text = '', index = 0, mask = {}, steeringPlan = null) {
  const value = safeText(text).trim();
  if (!value) return '';
  const hot = asArray(steeringPlan?.targetDimensions).map((dim) => dim.key);
  if (index === 1 || hot.includes('avgSentenceLength')) return value.replace(/\s+/g, ' ').replace(/,\s+/g, '. ');
  if (index === 2 || hot.includes('recurrencePressure')) return value.replace(/\b(please|actually|really|just)\b/gi, '').replace(/\s+/g, ' ').trim();
  if (index === 3 || hot.includes('contractionDensity')) return value.replace(/\bI\s+am\b/g, "I'm").replace(/\bdo not\b/gi, "don't").replace(/\bdoes not\b/gi, "doesn't");
  if (index === 4 || hot.includes('lexicalDensity')) return value.replace(/\bI'm\b/gi, 'I am').replace(/\bdon't\b/gi, 'do not').replace(/\bdoesn't\b/gi, 'does not');
  return value;
}

export function generateHushSwapCandidate(input = {}) {
  const sourceText = safeText(input.sourceText);
  const mask = input.mask || {};
  const maskProfile = input.maskProfile || mask.profile || {};
  const index = Number(input.index || 0);
  let candidateText = index === 0 ? sourceText : mutateCandidate(sourceText, index, mask, input.steeringPlan);
  try {
    const transfer = buildCadenceTransfer(candidateText, {
      mode: 'persona',
      profile: maskProfile,
      personaId: mask.id || 'hush-mask',
      label: mask.label || 'Hush Mask',
      strength: Math.max(0.70, (mask.strength || 0.9) - (index * 0.035)),
      mod: mask.mod || null
    });
    candidateText = transfer?.text || candidateText;
  } catch {
    // keep candidate text
  }
  return { id: `candidate-${index + 1}`, text: candidateText, profile: extractCadenceProfile(candidateText) };
}

export function scoreHushSwapCandidate(input = {}) {
  const candidate = input.candidate || {};
  const outputText = safeText(candidate.text);
  const sourceText = safeText(input.sourceText);
  const maskProfile = input.maskProfile || input.mask?.profile || {};
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const lockbox = input.lockbox || buildProtectedLiteralLockbox({ sourceText, baselineText: input.protectedBaselineText, maskReferenceText: input.maskReferenceText, manualLiterals: protectedLiterals });
  const lockboxVerification = verifyProtectedLiteralLockbox(lockbox, outputText);
  const ingestionAudit = buildIngestionFrictionAudit({ text: outputText, protectedLiterals });
  const outputProfile = candidate.profile || extractCadenceProfile(outputText);
  const escapeVector = buildEscapeVector({
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskText: input.maskReferenceText || input.mask?.sampleSeed || input.mask?.description || '',
    maskProfile,
    maskHistory: input.maskHistory || [],
    draftText: sourceText,
    outputText,
    outputProfile,
    protectedLiterals,
    ingestionAudit,
    options: { mode: input.operatorMode || 'neutralize', thresholds: { minWords: 5 } }
  });
  const contextProfile = buildContextProfile({
    contextType: input.contextType || 'group-chat',
    intendedMode: input.operatorMode || 'neutralize',
    exposureDuration: input.exposureDuration || 'single-use',
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskReferenceText: input.maskReferenceText || input.mask?.sampleSeed || '',
    messageDraftText: sourceText,
    protectedOutputText: outputText,
    protectedLiterals
  });
  const controllerDecision = buildEscapeControllerDecision({ vector: escapeVector, mode: input.operatorMode || 'neutralize', operatorIntent: { priority: 'source-reduction', targetContext: 'TD613 Hush' } });
  const recognitionField = buildRecognitionField({
    protectedBaselineText: input.protectedBaselineText || sourceText,
    maskReferenceText: input.maskReferenceText || input.mask?.sampleSeed || '',
    messageDraftText: sourceText,
    protectedOutputText: outputText,
    protectedLiterals,
    escapeVector,
    ingestionAudit,
    controllerDecision,
    personaSummary: input.personaSummary || {},
    iterationLedger: input.iterationLedger || {},
    contextProfile,
    options: { contextType: input.contextType || 'group-chat', intendedMode: input.operatorMode || 'neutralize', exposureDuration: input.exposureDuration || 'single-use' }
  });
  const match = buildProfileMatch({ sourceText, outputText, maskProfile, sourceProfile: extractCadenceProfile(sourceText), outputProfile, protectedLiterals, escapeVector, ingestionAudit, recognitionField });
  const residualVector = buildResidualVector({ sourceText, outputText, maskProfile, outputProfile });
  const steeringPlan = buildSteeringPlan({ sourceText, outputText, maskProfile, outputProfile, residualVector, lockbox });
  const scores = escapeVector.scores || {};
  const protectedLiteralScore = Math.min(literalScore(outputText, protectedLiterals), lockboxVerification.preservationScore ?? 1);
  const steeringScore = scoreCandidateWithSteering({
    operatorMode: input.operatorMode || 'neutralize',
    contextType: input.contextType || 'group-chat',
    maskMatch: match.matchScore || 0,
    semanticFidelity: scores.semanticFidelity ?? 0,
    protectedLiteralScore,
    sourceReductionScore: clamp(1 - (scores.sourceResidualRisk ?? 1)),
    contextSafetyScore: clamp(1 - (recognitionField.summary?.recognitionPressure ?? 0)),
    residualVector
  });
  const warnings = [...asArray(match.warnings), ...asArray(steeringPlan.warnings), ...asArray(lockboxVerification.warnings), ...asArray(steeringScore.vetoes)];
  return {
    ...candidate,
    finalScore: steeringScore.finalScore,
    scoreBreakdown: steeringScore.scoreBreakdown,
    weightProfile: steeringScore.weightProfile,
    vetoes: steeringScore.vetoes,
    match,
    matchSummary: summarizeProfileMatch(match),
    residualVector,
    residualSummary: summarizeResidualVector(residualVector),
    lockbox,
    lockboxVerification,
    lockboxSummary: summarizeProtectedLiteralLockbox(lockbox, lockboxVerification),
    steeringPlan,
    steeringSummary: summarizeSteeringPlan(steeringPlan),
    escapeVector,
    ingestionAudit,
    controllerDecision,
    contextProfile,
    recognitionField,
    warnings: [...new Set(warnings)]
  };
}

export function chooseBestHushSwapCandidate(candidates = [], options = {}) {
  const threshold = Number(options.minFinalScore ?? 0.42);
  const scored = candidates.filter(Boolean).sort((left, right) => (right.finalScore || 0) - (left.finalScore || 0));
  const best = scored[0] || null;
  if (!best) return null;
  return { ...best, belowViabilityThreshold: (best.finalScore || 0) < threshold };
}

export function buildHushSwap(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const lockbox = input.lockbox || buildProtectedLiteralLockbox({ sourceText, baselineText: input.protectedBaselineText, maskReferenceText: input.maskReferenceText, manualLiterals: protectedLiterals });
  const seedPlan = buildSteeringPlan({ sourceText, outputText: sourceText, maskProfile: input.maskProfile || input.mask?.profile || {}, lockbox });
  const count = Math.max(1, Math.min(8, Number(input.options?.candidateCount || input.candidateCount || 6)));
  const rawCandidates = Array.from({ length: count }, (_, index) => generateHushSwapCandidate({ ...input, protectedLiterals, lockbox, steeringPlan: seedPlan, index }));
  const candidates = rawCandidates.map((candidate) => scoreHushSwapCandidate({ ...input, protectedLiterals, lockbox, candidate }));
  const selected = chooseBestHushSwapCandidate(candidates, { minFinalScore: input.options?.minFinalScore ?? 0.42 }) || candidates[0] || null;
  const allCandidatesFailed = Boolean(!selected || selected.belowViabilityThreshold || asArray(selected.vetoes).length);
  const claimCeiling = selected ? evaluateClaimCeiling({ escapeVector: selected.escapeVector, ingestionAudit: selected.ingestionAudit, controllerDecision: selected.controllerDecision, personaSummary: input.personaSummary || {}, iterationLedger: input.iterationLedger || {}, reportIntent: 'local-review' }) : null;
  const maskLifecycle = buildMaskLifecycle({ mask: input.mask, personaSummary: input.personaSummary, recognitionField: selected?.recognitionField, escapeVector: selected?.escapeVector, missingLiteralPressure: selected?.lockboxVerification?.missingCount || 0 });
  return {
    version: HUSH_SWAP_VERSION,
    selectedOutput: allCandidatesFailed ? '' : selected?.text || '',
    candidates,
    selectedCandidateId: selected?.id || '',
    allCandidatesFailed,
    failureReason: allCandidatesFailed ? 'Every candidate remained below viability or triggered a veto. Do not select the prettiest failed candidate.' : '',
    match: selected?.match || null,
    matchSummary: selected?.matchSummary || null,
    residualVector: selected?.residualVector || null,
    residualSummary: selected?.residualSummary || null,
    steeringPlan: selected?.steeringPlan || null,
    steeringSummary: selected?.steeringSummary || null,
    lockbox,
    lockboxVerification: selected?.lockboxVerification || null,
    lockboxSummary: selected?.lockboxSummary || summarizeProtectedLiteralLockbox(lockbox),
    maskLifecycle,
    maskLifecycleSummary: summarizeMaskLifecycle(maskLifecycle),
    escapeVector: selected?.escapeVector || null,
    ingestionAudit: selected?.ingestionAudit || null,
    controllerDecision: selected?.controllerDecision || null,
    claimCeiling,
    recognitionField: selected?.recognitionField || null,
    warnings: [...new Set([...candidates.flatMap((candidate) => asArray(candidate.warnings)), ...(allCandidatesFailed ? ['all-candidates-failed'] : [])])],
    limitations: ['Hush swap is a local candidate selection workflow, not an external recognition outcome.', 'Preserve the claim before chasing the mask.']
  };
}

export function exportHushSwapJson(result = {}, options = {}) {
  return exportHushPolicyJson(result, { mode: options.mode || (options.includePrivateText ? 'private-full-export' : 'share-export'), pretty: options.pretty, includePrivateText: options.includePrivateText });
}
