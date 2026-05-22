import { buildHushSwap as buildPhase32HushSwap, HUSH_SWAP_PHASE32_VERSION } from './hush-swap-phase32.js';
import { buildExpressiveDiagnostics, detectExpressivePayload, expressiveCandidateScore, HUSH_EXPRESSIVE_PAYLOAD_VERSION } from './hush-expressive-payload.js';

export * from './hush-swap-phase32.js';
export const HUSH_SWAP_PHASE33_VERSION = 'phase-33-expressive-payload-preservation';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const safe = (value) => String(value ?? '');

function releaseEligible(candidate = {}) {
  if (!candidate?.text?.trim()) return false;
  if (candidate.releasePolicy?.hardBlocked) return false;
  if (candidate.releasePolicy && candidate.releasePolicy.mayPopulateOutput === false) return false;
  if (candidate.payloadIntegrity?.passed === false) return false;
  if (candidate.claimIntegrity?.passed === false) return false;
  return true;
}

function applyCandidate(result = {}, candidate = null, diagnostics = {}) {
  if (!candidate) return { ...result, phase33Diagnostics: diagnostics };
  return {
    ...result,
    version: `${result.version || HUSH_SWAP_PHASE32_VERSION}+${HUSH_SWAP_PHASE33_VERSION}`,
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
    phase33Diagnostics: diagnostics,
    warnings: [...new Set([...asArray(result.warnings), ...asArray(candidate.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
  };
}

function chooseExpressiveCandidate(result = {}, sourceText = '') {
  const expressive = detectExpressivePayload(sourceText);
  const candidates = asArray(result.candidates).filter(releaseEligible);
  const scored = candidates.map((candidate) => ({ candidate, expressive: expressiveCandidateScore(candidate, sourceText, expressive) }))
    .sort((left, right) => right.expressive.score - left.expressive.score);
  if (!expressive.active) return { selected: null, scored, expressive };
  const retaining = scored.find((entry) => entry.expressive.retention.retentionScore >= 0.64 && entry.expressive.wrapperFatigue < 0.24 && !entry.expressive.fallback);
  const fallbackRetaining = scored.find((entry) => entry.expressive.retention.retentionScore >= 0.72 && entry.expressive.wrapperFatigue < 0.18);
  return { selected: retaining?.candidate || fallbackRetaining?.candidate || scored[0]?.candidate || null, scored, expressive };
}

export function buildHushSwap(input = {}) {
  const result = buildPhase32HushSwap(input);
  const sourceText = safe(input.sourceText || input.messageDraftText || '');
  const { selected, scored, expressive } = chooseExpressiveCandidate(result, sourceText);
  const baseSelected = asArray(result.candidates).find((candidate) => candidate.id === result.selectedCandidateId) || null;
  const finalSelected = selected || baseSelected;
  const diagnostics = buildExpressiveDiagnostics(sourceText, finalSelected || {}, result);
  const selectedScored = scored.find((entry) => entry.candidate === finalSelected) || null;
  const selectedExpressive = selectedScored?.expressive || diagnostics.selected || expressiveCandidateScore(finalSelected || {}, sourceText, expressive);
  diagnostics.version = HUSH_SWAP_PHASE33_VERSION;
  diagnostics.expressiveVersion = HUSH_EXPRESSIVE_PAYLOAD_VERSION;
  diagnostics.baseSelectedCandidateId = result.selectedCandidateId || '';
  diagnostics.selectedCandidateId = finalSelected?.id || '';
  diagnostics.expressiveActive = expressive.active;
  diagnostics.expressiveScore = expressive.score;
  diagnostics.selectedRetentionScore = selectedExpressive.retention?.retentionScore ?? 0;
  diagnostics.selectedWrapperFatigue = selectedExpressive.wrapperFatigue ?? 0;
  diagnostics.selectedWasFallback = Boolean(selectedExpressive.fallback);
  diagnostics.selectorRows = scored.slice(0, 8).map((entry) => ({
    id: entry.candidate.id,
    source: entry.candidate.source,
    strategy: entry.candidate.strategy,
    expressiveScore: entry.expressive.score,
    retention: entry.expressive.retention.retentionScore,
    wrapperFatigue: entry.expressive.wrapperFatigue,
    fallback: entry.expressive.fallback,
    missing: entry.expressive.retention.missing
  }));
  diagnostics.phase33Score = round4(selectedExpressive.score || 0);
  diagnostics.warning = diagnostics.warning || (expressive.active && diagnostics.selectedRetentionScore < 0.55 ? 'expressive-payload-loss' : '');
  return applyCandidate(result, finalSelected, diagnostics);
}
