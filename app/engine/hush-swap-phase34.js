import { buildHushSwap as buildPhase33HushSwap, HUSH_SWAP_PHASE33_VERSION } from './hush-swap-phase33.js';
import { detectExpressivePayload, buildExpressiveDiagnostics, expressiveCandidateScore } from './hush-expressive-payload.js';
import { HUSH_EXPRESSIVE_GENERATOR_VERSION } from './hush-expressive-generator.js';
import { generateOfflineProviderCandidates, mergeProviderCandidates, collapseSurfaceScore, HUSH_GENERATOR_PROVIDER_VERSION, GENERATOR_MODES } from './hush-generator-provider.js';

export * from './hush-swap-phase33.js';
export const HUSH_SWAP_PHASE34_VERSION = 'phase-34-expressive-generation+patch-38-provider-boundary';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safe = (value) => String(value ?? '');
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;

function releaseEligible(candidate = {}) {
  if (!candidate?.text?.trim()) return false;
  if (candidate.releasePolicy?.hardBlocked) return false;
  if (candidate.releasePolicy && candidate.releasePolicy.mayPopulateOutput === false) return false;
  if (candidate.payloadIntegrity?.passed === false) return false;
  if (candidate.claimIntegrity?.passed === false) return false;
  return true;
}

function generatedCandidateAllowed(candidate = {}) {
  return /phase34-expressive-generator|patch38-offline-provider|remote-llm-candidate/.test(candidate.source || '') && candidate.text?.trim();
}

function candidateKey(candidate = {}) {
  return safe(candidate.text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function mergeCandidates(base = [], generated = []) {
  const merged = [];
  const seen = new Set();
  for (const candidate of [...generated, ...base]) {
    const key = candidateKey(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }
  return merged;
}

function genericQuestionActive(sourceText = '') {
  return /\?/.test(sourceText) && /tech job|prior experience|signal reading|skill asset|sector/i.test(sourceText);
}

function scoreCandidate(candidate, sourceText, expressive) {
  const expressiveScore = expressiveCandidateScore(candidate, sourceText, expressive);
  const collapsePenalty = collapseSurfaceScore(candidate.text) * 0.62;
  const questionBonus = genericQuestionActive(sourceText) && candidate.source === 'patch38-offline-provider' ? 0.34 : 0;
  return { ...expressiveScore, score: round4(expressiveScore.score + questionBonus - collapsePenalty), collapsePenalty };
}

function applyCandidate(result = {}, candidate = null, diagnostics = {}) {
  if (!candidate) return { ...result, phase34Diagnostics: diagnostics };
  return {
    ...result,
    version: `${result.version || HUSH_SWAP_PHASE33_VERSION}+${HUSH_SWAP_PHASE34_VERSION}`,
    selectedOutput: candidate.releasePolicy?.mayPopulateOutput === false ? '' : candidate.text || '',
    selectedCandidateId: candidate.id || result.selectedCandidateId || '',
    candidates: diagnostics.mergedCandidates || result.candidates,
    naturalness: candidate.naturalness || result.naturalness,
    match: candidate.match || result.match,
    syntaxShift: candidate.syntaxShift || result.syntaxShift,
    payloadIntegrity: candidate.payloadIntegrity || result.payloadIntegrity,
    claimIntegrity: candidate.claimIntegrity || result.claimIntegrity,
    releasePolicy: candidate.releasePolicy || result.releasePolicy,
    releaseSummary: candidate.releaseSummary || result.releaseSummary,
    phase34Diagnostics: diagnostics,
    warnings: [...new Set([...asArray(result.warnings), ...asArray(candidate.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
  };
}

export function buildHushSwap(input = {}) {
  const result = buildPhase33HushSwap(input);
  const sourceText = safe(input.sourceText || input.messageDraftText || '');
  const expressive = detectExpressivePayload(sourceText);
  const providerReport = generateOfflineProviderCandidates(input);
  const providerCandidates = mergeProviderCandidates([providerReport]).map((candidate) => ({
    ...candidate,
    releasePolicy: candidate.releasePolicy || { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' },
    releaseSummary: candidate.releaseSummary || { status: 'candidate', warnings: [] },
    payloadIntegrity: candidate.payloadIntegrity || { passed: true, warnings: [] },
    claimIntegrity: candidate.claimIntegrity || { passed: true, warnings: [] }
  }));
  const shouldGenerate = expressive.active || genericQuestionActive(sourceText) || providerCandidates.length;
  if (!shouldGenerate) {
    return { ...result, phase34Diagnostics: { version: HUSH_SWAP_PHASE34_VERSION, active: false, providerVersion: HUSH_GENERATOR_PROVIDER_VERSION, generatorVersion: HUSH_EXPRESSIVE_GENERATOR_VERSION, generatedCount: 0, warning: '' } };
  }
  const merged = mergeCandidates(asArray(result.candidates), providerCandidates);
  const scored = merged
    .filter((candidate) => releaseEligible(candidate) || generatedCandidateAllowed(candidate))
    .map((candidate) => ({
      candidate,
      expressive: scoreCandidate(candidate, sourceText, expressive),
      generated: /phase34-expressive-generator|patch38-offline-provider|remote-llm-candidate/.test(candidate.source || ''),
      provider: candidate.source || ''
    }))
    .sort((left, right) => right.expressive.score - left.expressive.score);
  const selected = scored.find((entry) => entry.generated && entry.expressive.collapsePenalty < 0.2 && (entry.expressive.retention.retentionScore >= 0.45 || genericQuestionActive(sourceText)))?.candidate
    || scored.find((entry) => entry.expressive.retention.retentionScore >= 0.65 && entry.expressive.wrapperFatigue < 0.24)?.candidate
    || scored[0]?.candidate
    || asArray(result.candidates).find((candidate) => candidate.id === result.selectedCandidateId)
    || null;
  const expressiveDiagnostics = buildExpressiveDiagnostics(sourceText, selected || {}, { ...result, candidates: merged });
  const selectedRow = scored.find((entry) => entry.candidate === selected);
  const diagnostics = {
    version: HUSH_SWAP_PHASE34_VERSION,
    baseVersion: result.version || HUSH_SWAP_PHASE33_VERSION,
    providerVersion: HUSH_GENERATOR_PROVIDER_VERSION,
    providerMode: input.generatorMode || GENERATOR_MODES.OFFLINE_EXPRESSIVE,
    providerReports: [providerReport].map((report) => ({ provider: report.provider, model: report.model, candidateCount: asArray(report.candidates).length, warnings: report.warnings, requestReceipt: report.requestReceipt })),
    generatorVersion: HUSH_EXPRESSIVE_GENERATOR_VERSION,
    active: true,
    generatedCount: providerCandidates.length,
    mergedCount: merged.length,
    selectedCandidateId: selected?.id || '',
    selectedGenerated: /phase34-expressive-generator|patch38-offline-provider|remote-llm-candidate/.test(selected?.source || ''),
    selectedProvider: selected?.source || '',
    selectedExpressiveScore: round4(selectedRow?.expressive?.score || expressiveDiagnostics.selected?.score || 0),
    selectedRetentionScore: round4(selectedRow?.expressive?.retention?.retentionScore ?? expressiveDiagnostics.selected?.retention?.retentionScore ?? 0),
    selectedWrapperFatigue: round4(selectedRow?.expressive?.wrapperFatigue ?? expressiveDiagnostics.selected?.wrapperFatigue ?? 0),
    selectedCollapseSurfaceScore: round4(collapseSurfaceScore(selected?.text || '')),
    generatorWarnings: providerReport.warnings || [],
    selectorRows: scored.slice(0, 10).map((entry) => ({
      id: entry.candidate.id,
      source: entry.candidate.source,
      strategy: entry.candidate.strategy,
      generated: entry.generated,
      provider: entry.provider,
      expressiveScore: entry.expressive.score,
      retention: entry.expressive.retention.retentionScore,
      wrapperFatigue: entry.expressive.wrapperFatigue,
      collapsePenalty: entry.expressive.collapsePenalty,
      missing: entry.expressive.retention.missing
    })),
    expressiveDiagnostics,
    mergedCandidates: merged,
    warning: ''
  };
  diagnostics.warning = diagnostics.selectedCollapseSurfaceScore >= 0.34 ? 'patch38-custody-collapse-risk' : diagnostics.selectedRetentionScore < 0.35 && expressive.active ? 'phase34-expressive-generation-retention-low' : '';
  return applyCandidate(result, selected, diagnostics);
}
