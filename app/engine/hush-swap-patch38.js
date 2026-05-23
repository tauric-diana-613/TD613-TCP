import { buildHushSwap as buildPhase34HushSwap } from './hush-swap-phase34.js';
import { generateOfflineProviderCandidates, mergeProviderCandidates, collapseSurfaceScore, GENERATOR_MODES, HUSH_GENERATOR_PROVIDER_VERSION } from './hush-generator-provider.js';

export * from './hush-swap-phase34.js';
export const HUSH_SWAP_PATCH38_VERSION = 'patch-38-hybrid-candidate-generator';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safe = (value) => String(value ?? '');
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const genericQuestionActive = (text = '') => /\?/.test(text) && /tech job|prior experience|signal reading|skill asset|sector/i.test(text);
const providerSource = (candidate = {}) => /patch38-offline-provider|llm-candidate|remote-llm-candidate/i.test(candidate.source || candidate.id || '');

function release(candidate = {}) {
  return candidate?.text?.trim() && candidate.payloadIntegrity?.passed !== false && candidate.claimIntegrity?.passed !== false && candidate.releasePolicy?.hardBlocked !== true;
}

function score(candidate = {}, sourceText = '') {
  const collapse = collapseSurfaceScore(candidate.text);
  const providerBonus = providerSource(candidate) ? 0.42 : 0;
  const questionBonus = genericQuestionActive(sourceText) && providerSource(candidate) ? 0.32 : 0;
  const base = Number(candidate.finalScore || 0.45);
  return round4(base + providerBonus + questionBonus - collapse * 0.9);
}

function normalize(candidate = {}) {
  return {
    ...candidate,
    releasePolicy: candidate.releasePolicy || { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' },
    releaseSummary: candidate.releaseSummary || { status: 'candidate', warnings: [] },
    payloadIntegrity: candidate.payloadIntegrity || { passed: true, warnings: [] },
    claimIntegrity: candidate.claimIntegrity || { passed: true, warnings: [] }
  };
}

function apply(result = {}, selected = null, diagnostics = {}) {
  if (!selected) return { ...result, patch38Diagnostics: diagnostics };
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
    patch38Diagnostics: diagnostics,
    warnings: [...new Set([...asArray(result.warnings), ...asArray(selected.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
  };
}

export function buildHushSwap(input = {}) {
  const result = buildPhase34HushSwap(input);
  const sourceText = safe(input.sourceText || input.messageDraftText || '');
  const mode = input.generatorMode || GENERATOR_MODES.OFFLINE_EXPRESSIVE;
  const offlineReport = generateOfflineProviderCandidates(input);
  const reports = mode === GENERATOR_MODES.REMOTE_LLM_PROXY ? asArray(input.providerReports) : mode === GENERATOR_MODES.HYBRID ? [offlineReport, ...asArray(input.providerReports)] : [offlineReport];
  const providerCandidates = mergeProviderCandidates(reports).map(normalize);
  const merged = mergeProviderCandidates([{ candidates: providerCandidates }, { candidates: asArray(result.candidates) }]).map(normalize);
  const ranked = merged.filter(release).map((candidate) => ({ candidate, score: score(candidate, sourceText), collapse: collapseSurfaceScore(candidate.text), provider: providerSource(candidate) })).sort((a, b) => b.score - a.score);
  const selected = ranked.find((row) => row.provider && row.collapse < 0.2)?.candidate || ranked[0]?.candidate || null;
  const diagnostics = {
    version: HUSH_SWAP_PATCH38_VERSION,
    providerVersion: HUSH_GENERATOR_PROVIDER_VERSION,
    providerMode: mode,
    providerReports: reports.map((report) => ({ provider: report.provider, model: report.model, candidateCount: asArray(report.candidates).length, warnings: report.warnings, requestReceipt: report.requestReceipt })),
    generatedCount: providerCandidates.length,
    mergedCount: merged.length,
    selectedCandidateId: selected?.id || '',
    selectedProviderCandidate: providerSource(selected || {}),
    selectedCollapseSurfaceScore: round4(collapseSurfaceScore(selected?.text || '')),
    selectedScore: ranked.find((row) => row.candidate === selected)?.score || 0,
    selectorRows: ranked.slice(0, 10).map((row) => ({ id: row.candidate.id, source: row.candidate.source, strategy: row.candidate.strategy, score: row.score, collapse: row.collapse, provider: row.provider })),
    mergedCandidates: merged,
    warning: collapseSurfaceScore(selected?.text || '') >= 0.34 ? 'patch38-custody-collapse-risk' : ''
  };
  return apply(result, selected, diagnostics);
}
