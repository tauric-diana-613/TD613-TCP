import { buildHushSwap as buildPhase34HushSwap } from './hush-swap-phase34.js';
import { generateOfflineProviderCandidates, mergeProviderCandidates, collapseSurfaceScore, GENERATOR_MODES, HUSH_GENERATOR_PROVIDER_VERSION } from './hush-generator-provider.js';
import { attachPropositionIntegrity } from './hush-proposition-integrity.js?v=202605250309';

export * from './hush-swap-phase34.js';
export const HUSH_SWAP_PATCH38_VERSION = 'patch-39-coverage-gated-candidate-generator';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safe = (value) => String(value ?? '');
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const genericQuestionActive = (text = '') => /\?/.test(text) && /tech job|prior experience|signal reading|skill asset|sector/i.test(text);
const remoteSource = (candidate = {}) => /remote-llm-candidate|llm-candidate/i.test(candidate.source || candidate.id || '');
const offlineSource = (candidate = {}) => /patch38-offline-provider|phase34-expressive-generator/i.test(candidate.source || candidate.id || '');
const providerSource = (candidate = {}) => remoteSource(candidate) || offlineSource(candidate);

function release(candidate = {}) {
  return candidate?.text?.trim() && candidate.payloadIntegrity?.passed !== false && candidate.claimIntegrity?.passed !== false && candidate.releasePolicy?.hardBlocked !== true && candidate.propositionIntegrity?.passed !== false;
}

function score(candidate = {}, sourceText = '', mode = GENERATOR_MODES.OFFLINE_EXPRESSIVE) {
  const collapse = collapseSurfaceScore(candidate.text);
  const remote = remoteSource(candidate);
  const offline = offlineSource(candidate);
  const providerBonus = providerSource(candidate) ? 0.42 : 0;
  const remoteModeBonus = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && remote ? 0.6 : 0;
  const hybridRemoteBonus = mode === GENERATOR_MODES.HYBRID && remote ? 0.18 : 0;
  const offlinePenaltyInRemote = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && offline ? 0.45 : 0;
  const questionBonus = genericQuestionActive(sourceText) && providerSource(candidate) ? 0.32 : 0;
  const coverageBonus = Number(candidate.propositionIntegrity?.coverage?.averageCoverage || 0) * 0.38;
  const lengthBonus = Math.min(1, Number(candidate.propositionIntegrity?.coverage?.lengthRatio || 0)) * 0.18;
  const warningPenalty = asArray(candidate.propositionIntegrity?.warnings).length * 0.08;
  const base = Number(candidate.finalScore || 0.45);
  return round4(base + providerBonus + remoteModeBonus + hybridRemoteBonus + questionBonus + coverageBonus + lengthBonus - offlinePenaltyInRemote - collapse * 0.9 - warningPenalty);
}

function normalize(candidate = {}, sourceText = '') {
  return attachPropositionIntegrity({
    ...candidate,
    releasePolicy: candidate.releasePolicy || { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' },
    releaseSummary: candidate.releaseSummary || { status: 'candidate', warnings: [] },
    payloadIntegrity: candidate.payloadIntegrity || { passed: true, warnings: [] },
    claimIntegrity: candidate.claimIntegrity || { passed: true, warnings: [] }
  }, sourceText);
}

function apply(result = {}, selected = null, diagnostics = {}) {
  if (!selected) return { ...result, selectedOutput: '', selectedCandidateId: '', patch38Diagnostics: diagnostics, warnings: [...new Set([...asArray(result.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])] };
  return {
    ...result,
    version: `${result.version || 'hush'}+${HUSH_SWAP_PATCH38_VERSION}`,
    selectedOutput: selected.text || '',
    selectedCandidateId: selected.id || result.selectedCandidateId || '',
    candidates: diagnostics.mergedCandidates || result.candidates,
    releasePolicy: selected.releasePolicy || result.releasePolicy,
    releaseSummary: selected.releaseSummary || result.releaseSummary,
    payloadIntegrity: selected.payloadIntegrity || result.payloadIntegrity,
    claimIntegrity: selected.claimIntegrity || result.claimIntegrity,
    propositionIntegrity: selected.propositionIntegrity || result.propositionIntegrity,
    patch38Diagnostics: diagnostics,
    warnings: [...new Set([...asArray(result.warnings), ...asArray(selected.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
  };
}

export function buildHushSwap(input = {}) {
  const result = buildPhase34HushSwap(input);
  const sourceText = safe(input.sourceText || input.messageDraftText || '');
  const mode = input.generatorMode || GENERATOR_MODES.OFFLINE_EXPRESSIVE;
  const offlineReport = generateOfflineProviderCandidates(input);
  const remoteReports = asArray(input.providerReports);
  const reports = mode === GENERATOR_MODES.REMOTE_LLM_PROXY ? remoteReports : mode === GENERATOR_MODES.HYBRID ? [...remoteReports, offlineReport] : [offlineReport];
  const providerCandidates = mergeProviderCandidates(reports).map((candidate) => normalize(candidate, sourceText));
  const merged = mergeProviderCandidates([{ candidates: providerCandidates }, { candidates: asArray(result.candidates) }]).map((candidate) => normalize(candidate, sourceText));
  const releasable = merged.filter(release);
  const ranked = releasable.map((candidate) => ({
    candidate,
    score: score(candidate, sourceText, mode),
    collapse: collapseSurfaceScore(candidate.text),
    coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    provider: providerSource(candidate),
    remote: remoteSource(candidate),
    offline: offlineSource(candidate)
  })).sort((a, b) => b.score - a.score);

  const selected = mode === GENERATOR_MODES.REMOTE_LLM_PROXY
    ? (ranked.find((row) => row.remote && row.collapse < 0.34)?.candidate || ranked.find((row) => row.remote)?.candidate || null)
    : mode === GENERATOR_MODES.HYBRID
      ? (ranked.find((row) => row.remote && row.collapse < 0.2)?.candidate || ranked.find((row) => row.provider && row.collapse < 0.2)?.candidate || ranked[0]?.candidate || null)
      : (ranked.find((row) => row.offline && row.collapse < 0.2)?.candidate || ranked[0]?.candidate || null);

  const blockedRows = merged.filter((candidate) => !release(candidate)).slice(0, 10).map((candidate) => ({
    id: candidate.id,
    source: candidate.source,
    warnings: candidate.propositionIntegrity?.warnings || candidate.warnings || [],
    coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    missingUnitCount: candidate.propositionIntegrity?.coverage?.missingUnitCount ?? 0
  }));

  const diagnostics = {
    version: HUSH_SWAP_PATCH38_VERSION,
    providerVersion: HUSH_GENERATOR_PROVIDER_VERSION,
    providerMode: mode,
    providerReports: reports.map((report) => ({ provider: report.provider, model: report.model, candidateCount: asArray(report.candidates).length, warnings: report.warnings, requestReceipt: report.requestReceipt })),
    remoteCandidateCount: providerCandidates.filter(remoteSource).length,
    offlineCandidateCount: providerCandidates.filter(offlineSource).length,
    generatedCount: providerCandidates.length,
    mergedCount: merged.length,
    releasableCount: releasable.length,
    blockedCount: merged.length - releasable.length,
    blockedRows,
    selectedCandidateId: selected?.id || '',
    selectedProviderCandidate: providerSource(selected || {}),
    selectedRemoteCandidate: remoteSource(selected || {}),
    selectedOfflineCandidate: offlineSource(selected || {}),
    selectedCoverage: selected?.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    selectedLengthRatio: selected?.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    selectedCollapseSurfaceScore: round4(collapseSurfaceScore(selected?.text || '')),
    selectedScore: ranked.find((row) => row.candidate === selected)?.score || 0,
    selectorRows: ranked.slice(0, 10).map((row) => ({ id: row.candidate.id, source: row.candidate.source, strategy: row.candidate.strategy, score: row.score, collapse: row.collapse, coverage: row.coverage, lengthRatio: row.lengthRatio, provider: row.provider, remote: row.remote, offline: row.offline })),
    mergedCandidates: merged,
    warning: mode === GENERATOR_MODES.REMOTE_LLM_PROXY && !providerCandidates.some(remoteSource)
      ? 'remote-mode-produced-no-remote-candidates'
      : !selected && blockedRows.length ? 'all-candidates-failed-proposition-coverage'
      : collapseSurfaceScore(selected?.text || '') >= 0.34 ? 'patch38-custody-collapse-risk' : ''
  };
  return apply(result, selected, diagnostics);
}