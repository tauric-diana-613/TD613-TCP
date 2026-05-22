import { buildHushSwap as buildBaseHushSwap, HUSH_SWAP_VERSION as BASE_HUSH_SWAP_VERSION } from './hush-swap.js';

export * from './hush-swap.js';
export const HUSH_SWAP_PHASE32_VERSION = 'phase-32-mask-surface-separation';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safeText = (value) => String(value ?? '');
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;

const CUSTODY_BOILERPLATE = [
  /\brecord anchor\b/gi,
  /\bremains? attached\b/gi,
  /\battached to (?:this|the) record\b/gi,
  /\bshould remain attached\b/gi,
  /\bkeeping the claim narrow\b/gi,
  /\bfor the record\b/gi,
  /\brecord note\b/gi,
  /\bthe point is preservation\b/gi,
  /\bno broader conclusion is being added\b/gi,
  /\bpayload retained\b/gi
];

function custodyBoilerplateScore(text = '') {
  const value = safeText(text);
  if (!value.trim()) return 0;
  const hits = CUSTODY_BOILERPLATE.reduce((sum, pattern) => sum + ((value.match(pattern) || []).length), 0);
  const sentenceCount = Math.max(1, (value.match(/[.!?]+/g) || []).length);
  return clamp01((hits / sentenceCount) * 0.42);
}

function literalSafeFallback(candidate = {}) {
  const fields = [candidate.source, candidate.strategy, candidate.family, ...(candidate.operations || [])].map((value) => safeText(value).toLowerCase());
  return fields.some((value) => value.includes('literal-safe-fallback'));
}

function releaseEligible(candidate = {}) {
  if (!candidate?.text?.trim()) return false;
  if (candidate.releasePolicy?.hardBlocked) return false;
  if (candidate.releasePolicy && candidate.releasePolicy.mayPopulateOutput === false) return false;
  if (candidate.payloadIntegrity?.passed === false) return false;
  if (candidate.claimIntegrity?.passed === false) return false;
  return true;
}

function maskSurfaceScore(candidate = {}) {
  const finalScore = clamp01(candidate.finalScore || 0);
  const naturalness = clamp01(candidate.naturalness?.naturalnessScore ?? candidate.scoreBreakdown?.naturalness ?? 0);
  const syntax = clamp01(candidate.syntaxShiftScore?.syntaxShiftScore ?? candidate.scoreBreakdown?.syntaxShiftScore ?? 0);
  const match = clamp01(candidate.match?.matchScore ?? candidate.scoreBreakdown?.maskMatch ?? 0);
  const sourceResidue = clamp01(candidate.scoreBreakdown?.sourceResidueScore ?? 0);
  const fallbackPenalty = literalSafeFallback(candidate) ? 0.26 : 0;
  const boilerplatePenalty = custodyBoilerplateScore(candidate.text) * 0.52;
  const wrapperPenalty = asArray(candidate.syntaxShift?.warnings).includes('wrapper-only-transform') ? 0.12 : 0;
  const score = (finalScore * 0.48) + (naturalness * 0.18) + (syntax * 0.18) + (match * 0.10) + (sourceResidue * 0.06) - fallbackPenalty - boilerplatePenalty - wrapperPenalty;
  return round4(score);
}

function textKey(text = '') {
  return safeText(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function differentiation(result = {}) {
  const candidates = asArray(result.candidates).slice(0, 12);
  const keys = new Set(candidates.map((candidate) => textKey(candidate.text)).filter(Boolean));
  const fallbackCount = candidates.filter(literalSafeFallback).length;
  const boilerplateMean = candidates.length ? candidates.reduce((sum, candidate) => sum + custodyBoilerplateScore(candidate.text), 0) / candidates.length : 0;
  return {
    candidateCount: candidates.length,
    uniqueSurfaceCount: keys.size,
    uniquenessRatio: candidates.length ? round4(keys.size / candidates.length) : 0,
    fallbackRatio: candidates.length ? round4(fallbackCount / candidates.length) : 0,
    boilerplateMean: round4(boilerplateMean),
    warning: candidates.length && (keys.size <= 2 || fallbackCount / candidates.length > 0.45 || boilerplateMean > 0.28) ? 'mask-surface-collapse-risk' : ''
  };
}

function applyCandidate(result = {}, candidate = null, diagnostics = {}) {
  if (!candidate) return result;
  return {
    ...result,
    version: `${BASE_HUSH_SWAP_VERSION}+${HUSH_SWAP_PHASE32_VERSION}`,
    selectedOutput: candidate.releasePolicy?.mayPopulateOutput === false ? '' : candidate.text || '',
    selectedCandidateId: candidate.id || result.selectedCandidateId || '',
    releasePolicy: candidate.releasePolicy || result.releasePolicy,
    releaseSummary: candidate.releaseSummary || result.releaseSummary,
    sourceResidue: candidate.sourceResidue || result.sourceResidue,
    sourceResidueSummary: candidate.sourceResidueSummary || result.sourceResidueSummary,
    sourceResidueScore: candidate.sourceResidueScore || result.sourceResidueScore,
    syntaxShift: candidate.syntaxShift || result.syntaxShift,
    syntaxShiftSummary: candidate.syntaxShiftSummary || result.syntaxShiftSummary,
    syntaxShiftScore: candidate.syntaxShiftScore || result.syntaxShiftScore,
    payloadIntegrity: candidate.payloadIntegrity || result.payloadIntegrity,
    payloadIntegritySummary: candidate.payloadIntegritySummary || result.payloadIntegritySummary,
    payloadRepair: candidate.payloadRepair || result.payloadRepair,
    payloadRepairSummary: candidate.payloadRepairSummary || result.payloadRepairSummary,
    claimIntegrity: candidate.claimIntegrity || result.claimIntegrity,
    claimIntegritySummary: candidate.claimIntegritySummary || result.claimIntegritySummary,
    literalPlacementSummary: candidate.literalPlacementSummary || result.literalPlacementSummary,
    match: candidate.match || result.match,
    matchSummary: candidate.matchSummary || result.matchSummary,
    naturalness: candidate.naturalness || result.naturalness,
    naturalnessSummary: candidate.naturalnessSummary || result.naturalnessSummary,
    residualVector: candidate.residualVector || result.residualVector,
    residualSummary: candidate.residualSummary || result.residualSummary,
    steeringPlan: candidate.steeringPlan || result.steeringPlan,
    steeringSummary: candidate.steeringSummary || result.steeringSummary,
    lockboxVerification: candidate.lockboxVerification || result.lockboxVerification,
    lockboxSummary: candidate.lockboxSummary || result.lockboxSummary,
    escapeVector: candidate.escapeVector || result.escapeVector,
    ingestionAudit: candidate.ingestionAudit || result.ingestionAudit,
    controllerDecision: candidate.controllerDecision || result.controllerDecision,
    recognitionField: candidate.recognitionField || result.recognitionField,
    phase32Diagnostics: diagnostics,
    warnings: [...new Set([...asArray(result.warnings), ...asArray(candidate.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
  };
}

export function buildHushSwap(input = {}) {
  const result = buildBaseHushSwap(input);
  const eligible = asArray(result.candidates).filter(releaseEligible);
  const scored = eligible.map((candidate) => ({ candidate, phase32Score: maskSurfaceScore(candidate), fallback: literalSafeFallback(candidate), boilerplate: custodyBoilerplateScore(candidate.text) }))
    .sort((left, right) => right.phase32Score - left.phase32Score);
  const baseSelected = asArray(result.candidates).find((candidate) => candidate.id === result.selectedCandidateId) || null;
  const baseScore = baseSelected ? maskSurfaceScore(baseSelected) : 0;
  const preferred = scored.find((entry) => !entry.fallback && entry.boilerplate < 0.34) || scored[0] || null;
  const selected = preferred?.candidate || baseSelected || eligible[0] || null;
  const diagnostics = {
    version: HUSH_SWAP_PHASE32_VERSION,
    baseVersion: BASE_HUSH_SWAP_VERSION,
    baseSelectedCandidateId: result.selectedCandidateId || '',
    baseSelectedWasFallback: baseSelected ? literalSafeFallback(baseSelected) : false,
    baseSelectedBoilerplateScore: baseSelected ? custodyBoilerplateScore(baseSelected.text) : 0,
    baseSelectedMaskSurfaceScore: baseScore,
    selectedCandidateId: selected?.id || '',
    selectedWasFallback: selected ? literalSafeFallback(selected) : false,
    selectedBoilerplateScore: selected ? custodyBoilerplateScore(selected.text) : 0,
    selectedMaskSurfaceScore: selected ? maskSurfaceScore(selected) : 0,
    candidateReport: scored.slice(0, 8).map((entry) => ({ id: entry.candidate.id, source: entry.candidate.source, strategy: entry.candidate.strategy, finalScore: entry.candidate.finalScore || 0, phase32Score: entry.phase32Score, fallback: entry.fallback, boilerplate: entry.boilerplate, release: entry.candidate.releaseSummary?.status || entry.candidate.releasePolicy?.state || 'unreported' })),
    differentiation: differentiation(result)
  };
  diagnostics.warning = diagnostics.differentiation.warning || (diagnostics.selectedWasFallback ? 'fallback-selected-last-resort' : '');
  return applyCandidate(result, selected, diagnostics);
}
