import { buildCadenceTransfer, extractCadenceProfile } from './stylometry.js';
import { buildEscapeVector } from './escape-vector.js';
import { buildIngestionFrictionAudit } from './ingestion-friction.js';
import { buildEscapeControllerDecision } from './escape-controller.js';
import { evaluateClaimCeiling } from './claim-ladder.js';
import { buildContextProfile } from './context-profile.js';
import { buildRecognitionField } from './recognition-field.js';
import { buildProfileMatch, summarizeProfileMatch } from './hush-profile-match.js';

export const HUSH_SWAP_VERSION = 'phase-11';

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

function mutateCandidate(text = '', index = 0, mask = {}) {
  const value = safeText(text).trim();
  if (!value) return '';
  const hint = mask?.transformHints || {};
  if (index === 0) return value;
  if (index === 1) return value.replace(/\s+/g, ' ').replace(/,\s+/g, '. ');
  if (index === 2) return value.replace(/\bplease\b/gi, hint.warmth === 'high' ? 'please' : '').replace(/\s+/g, ' ').trim();
  if (index === 3) return value.replace(/\bI\s+am\b/g, "I'm").replace(/\bdo not\b/gi, "don't").replace(/\bdoes not\b/gi, "doesn't");
  if (index === 4) return value.replace(/\bI'm\b/gi, 'I am').replace(/\bdon't\b/gi, 'do not').replace(/\bdoesn't\b/gi, 'does not');
  return value;
}

export function generateHushSwapCandidate(input = {}) {
  const sourceText = safeText(input.sourceText);
  const mask = input.mask || {};
  const maskProfile = input.maskProfile || mask.profile || {};
  const index = Number(input.index || 0);
  let candidateText = sourceText;
  if (index === 0) {
    try {
      const transfer = buildCadenceTransfer(sourceText, { mode: 'persona', profile: maskProfile, personaId: mask.id || 'hush-mask', label: mask.label || 'Hush Mask', strength: mask.strength || 0.9, mod: mask.mod || null });
      candidateText = transfer?.text || candidateText;
    } catch {
      candidateText = sourceText;
    }
  } else {
    candidateText = mutateCandidate(sourceText, index, mask);
    try {
      const transfer = buildCadenceTransfer(candidateText, { mode: 'persona', profile: maskProfile, personaId: mask.id || 'hush-mask', label: mask.label || 'Hush Mask', strength: Math.max(0.72, (mask.strength || 0.86) - (index * 0.04)), mod: mask.mod || null });
      candidateText = transfer?.text || candidateText;
    } catch {
      // keep mutated candidate
    }
  }
  return {
    id: `candidate-${index + 1}`,
    text: candidateText,
    profile: extractCadenceProfile(candidateText)
  };
}

export function scoreHushSwapCandidate(input = {}) {
  const candidate = input.candidate || {};
  const outputText = safeText(candidate.text);
  const sourceText = safeText(input.sourceText);
  const maskProfile = input.maskProfile || input.mask?.profile || {};
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
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
  const match = buildProfileMatch({
    sourceText,
    outputText,
    maskProfile,
    sourceProfile: extractCadenceProfile(sourceText),
    outputProfile,
    protectedLiterals,
    escapeVector,
    ingestionAudit,
    recognitionField
  });
  const scores = escapeVector.scores || {};
  const maskMatch = match.matchScore || 0;
  const semanticFidelity = scores.semanticFidelity ?? 0;
  const protectedLiteralScore = literalScore(outputText, protectedLiterals);
  const sourceReductionScore = clamp(1 - (scores.sourceResidualRisk ?? 1));
  const contextSafetyScore = clamp(1 - (recognitionField.summary?.recognitionPressure ?? 0));
  let finalScore = (0.30 * maskMatch) + (0.25 * semanticFidelity) + (0.20 * protectedLiteralScore) + (0.15 * sourceReductionScore) + (0.10 * contextSafetyScore);
  const warnings = [];
  if (protectedLiteralScore < 1) { finalScore *= 0.35; warnings.push('protected-literal-drop'); }
  if (semanticFidelity < 0.55) { finalScore *= 0.45; warnings.push('meaning-drift'); }
  if ((recognitionField.summary?.recognitionPressure ?? 0) >= 0.68) warnings.push('context-pressure-hot');
  if ((scores.sourceResidualRisk ?? 0) > 0.58) warnings.push('source-residual-high');
  return {
    ...candidate,
    finalScore: round(finalScore),
    scoreBreakdown: { maskMatch: round(maskMatch), semanticFidelity: round(semanticFidelity), protectedLiteralScore: round(protectedLiteralScore), sourceReductionScore: round(sourceReductionScore), contextSafetyScore: round(contextSafetyScore) },
    match,
    escapeVector,
    ingestionAudit,
    controllerDecision,
    contextProfile,
    recognitionField,
    warnings: [...new Set([...asArray(match.warnings), ...warnings])]
  };
}

export function chooseBestHushSwapCandidate(candidates = [], options = {}) {
  const scored = candidates.filter(Boolean).sort((left, right) => (right.finalScore || 0) - (left.finalScore || 0));
  return scored[0] || null;
}

export function buildHushSwap(input = {}) {
  const sourceText = safeText(input.sourceText);
  const protectedLiterals = asArray(input.protectedLiterals).length ? asArray(input.protectedLiterals) : extractProtectedLiterals(sourceText);
  const count = Math.max(1, Math.min(8, Number(input.options?.candidateCount || input.candidateCount || 5)));
  const rawCandidates = Array.from({ length: count }, (_, index) => generateHushSwapCandidate({ ...input, protectedLiterals, index }));
  const candidates = rawCandidates.map((candidate) => scoreHushSwapCandidate({ ...input, protectedLiterals, candidate }));
  const selected = chooseBestHushSwapCandidate(candidates) || candidates[0] || null;
  const claimCeiling = selected ? evaluateClaimCeiling({ escapeVector: selected.escapeVector, ingestionAudit: selected.ingestionAudit, controllerDecision: selected.controllerDecision, personaSummary: input.personaSummary || {}, iterationLedger: input.iterationLedger || {}, reportIntent: 'local-review' }) : null;
  return {
    version: HUSH_SWAP_VERSION,
    selectedOutput: selected?.text || '',
    candidates,
    selectedCandidateId: selected?.id || '',
    match: selected?.match || null,
    matchSummary: selected?.match ? summarizeProfileMatch(selected.match) : null,
    escapeVector: selected?.escapeVector || null,
    ingestionAudit: selected?.ingestionAudit || null,
    controllerDecision: selected?.controllerDecision || null,
    claimCeiling,
    recognitionField: selected?.recognitionField || null,
    warnings: [...new Set(candidates.flatMap((candidate) => asArray(candidate.warnings)))],
    limitations: [
      'Hush swap is a local candidate selection workflow, not an external recognition outcome.',
      'Preserve the claim before chasing the mask.'
    ]
  };
}

export function exportHushSwapJson(result = {}, options = {}) {
  const payload = { ...result, reproducibility: { privateTextIncluded: Boolean(options.includePrivateText) } };
  if (!options.includePrivateText) {
    payload.candidates = asArray(payload.candidates).map((candidate) => ({
      id: candidate.id,
      finalScore: candidate.finalScore,
      scoreBreakdown: candidate.scoreBreakdown,
      match: candidate.match,
      warnings: candidate.warnings
    }));
    delete payload.selectedOutput;
  }
  return JSON.stringify(payload, null, options.pretty === false ? 0 : 2);
}
