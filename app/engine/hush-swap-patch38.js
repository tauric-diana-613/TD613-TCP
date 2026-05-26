import { buildHushSwap as buildPhase34HushSwap } from './hush-swap-phase34.js';
import { generateOfflineProviderCandidates, mergeProviderCandidates, collapseSurfaceScore, GENERATOR_MODES, HUSH_GENERATOR_PROVIDER_VERSION } from './hush-generator-provider.js';
import { attachPropositionIntegrity } from './hush-proposition-integrity.js';

export * from './hush-swap-phase34.js';
export const HUSH_SWAP_PATCH38_VERSION = 'patch-38-hybrid-candidate-generator';
export const HUSH_SWAP_PATCH38_INTERNAL_VERSION = 'phase-37.1-source-copy-resistant-selector';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const safe = (value) => String(value ?? '');
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;
const genericQuestionActive = (text = '') => /\?/.test(text) && /tech job|prior experience|signal reading|skill asset|sector/i.test(text);
const remoteSource = (candidate = {}) => /remote-llm-candidate|llm-candidate/i.test(candidate.source || candidate.id || '');
const offlineSource = (candidate = {}) => /patch38-offline-provider|phase34-expressive-generator/i.test(candidate.source || candidate.id || '');
const providerSource = (candidate = {}) => remoteSource(candidate) || offlineSource(candidate);

function words(text = '') {
  return safe(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
}

function normalizedText(text = '') {
  return words(text).join(' ');
}

function tokenOverlap(a = '', b = '') {
  const aa = new Set(words(a).filter((word) => word.length > 2));
  const bb = new Set(words(b).filter((word) => word.length > 2));
  if (!aa.size || !bb.size) return 0;
  let hits = 0;
  for (const word of aa) if (bb.has(word)) hits += 1;
  return hits / Math.max(aa.size, bb.size);
}

function syntaxDistance(candidateText = '', sourceText = '') {
  const candidateSentences = safe(candidateText).split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const sourceSentences = safe(sourceText).split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const firstWordChanged = words(candidateSentences[0] || '')[0] && words(candidateSentences[0] || '')[0] !== words(sourceSentences[0] || '')[0] ? 0.25 : 0;
  const sentenceCountDelta = Math.min(0.25, Math.abs(candidateSentences.length - sourceSentences.length) * 0.08);
  return round4(Math.max(0, Math.min(1, 0.35 + firstWordChanged + sentenceCountDelta + (1 - tokenOverlap(candidateText, sourceText)) * 0.35)));
}

function sourceCopyRisk(candidateText = '', sourceText = '') {
  const candidateNorm = normalizedText(candidateText);
  const sourceNorm = normalizedText(sourceText);
  if (!candidateNorm || !sourceNorm) return { exactCopy: false, nearCopy: false, tokenOverlap: 0, syntaxDistance: 1, lengthRatio: 1, score: 0 };
  const overlap = tokenOverlap(candidateText, sourceText);
  const syntax = syntaxDistance(candidateText, sourceText);
  const candidateWords = words(candidateText).length;
  const sourceWords = Math.max(1, words(sourceText).length);
  const lengthRatio = candidateWords / sourceWords;
  const exactCopy = candidateNorm === sourceNorm;
  const nearCopy = !exactCopy && overlap >= 0.94 && syntax <= 0.43 && lengthRatio >= 0.92 && lengthRatio <= 1.12;
  const score = exactCopy ? 1 : round4(Math.min(1, overlap * 0.65 + (1 - Math.min(1, syntax)) * 0.25 + (Math.abs(1 - lengthRatio) < 0.12 ? 0.1 : 0)));
  return { exactCopy, nearCopy, tokenOverlap: round4(overlap), syntaxDistance: syntax, lengthRatio: round4(lengthRatio), score };
}

function styleOperation(candidate = {}) {
  return safe(candidate.style_operation || candidate.providerTelemetry?.style_operation || candidate.strategy || candidate.operations?.at?.(-1) || 'operation-unreported') || 'operation-unreported';
}

function operationCompleteness(candidate = {}) {
  const hasOp = styleOperation(candidate) !== 'operation-unreported';
  const preserved = asArray(candidate.preserved_propositions || candidate.providerTelemetry?.preserved_propositions).length;
  const notes = candidate.mask_surface_notes || candidate.providerTelemetry?.mask_surface_notes || {};
  const hasNotes = notes && typeof notes === 'object' && Object.keys(notes).length > 0;
  return round4((hasOp ? 0.42 : 0) + Math.min(0.34, preserved * 0.08) + (hasNotes ? 0.24 : 0));
}

function maskFidelity(candidate = {}, input = {}) {
  const value = safe(candidate.text).toLowerCase();
  const mask = input.mask || {};
  const vector = input.phase37Telemetry?.flightPacket?.mask_style_vector || {};
  const hints = [
    ...asArray(mask.dictionHints),
    ...asArray(mask.transitionBank),
    ...asArray(mask.transformHints?.desiredMoves),
    ...asArray(vector.diction_hints),
    ...asArray(vector.transition_bank),
    ...asArray(vector.desired_moves)
  ].map((item) => safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 24);
  const hintScore = hints.length ? hints.filter((hint) => value.includes(hint)).length / hints.length : 0.35;
  const notes = candidate.mask_surface_notes || candidate.providerTelemetry?.mask_surface_notes || {};
  const notesScore = notes && typeof notes === 'object' ? Math.min(0.22, Object.keys(notes).length * 0.055) : 0;
  return round4(Math.min(1, hintScore * 0.32 + operationCompleteness(candidate) * 0.34 + notesScore + 0.12));
}

function humanTexture(candidate = {}) {
  const value = safe(candidate.text);
  const sentenceCount = Math.max(1, value.split(/[.!?]+/).filter((s) => s.trim()).length);
  const punctuation = ((value.match(/[,;:—-]/g) || []).length / Math.max(8, sentenceCount * 8));
  const contraction = ((value.match(/\b(?:I'm|you're|it's|that's|don't|can't|won't|we're|I've|they're)\b/gi) || []).length / 8);
  const genericPenalty = /^(Here is|I can help|This version|In summary|To clarify)\b/i.test(value) ? 0.35 : 0;
  return round4(Math.max(0, Math.min(1, 0.5 + Math.min(0.28, punctuation) + Math.min(0.22, contraction) - genericPenalty)));
}

function providerPenalty(candidate = {}) {
  const added = asArray(candidate.new_claims || candidate.providerTelemetry?.new_claims).length;
  const dropped = asArray(candidate.dropped_propositions || candidate.providerTelemetry?.dropped_propositions).length;
  const changed = asArray(candidate.changed_questions || candidate.providerTelemetry?.changed_questions).length;
  return Math.min(0.9, added * 0.18 + dropped * 0.14 + changed * 0.14);
}

function release(candidate = {}, sourceText = '') {
  if (!candidate?.text?.trim()) return false;
  if (candidate.payloadIntegrity?.passed === false) return false;
  if (candidate.claimIntegrity?.passed === false) return false;
  if (candidate.releasePolicy?.hardBlocked === true) return false;
  if (candidate.propositionIntegrity?.passed === false) return false;
  const copy = sourceCopyRisk(candidate.text, sourceText);
  if (copy.exactCopy || copy.nearCopy) return false;
  return true;
}

function operationSpread(rows = []) {
  return [...new Set(rows.map((row) => row.operation).filter(Boolean))];
}

function score(candidate = {}, sourceText = '', mode = GENERATOR_MODES.OFFLINE_EXPRESSIVE, input = {}) {
  const collapse = collapseSurfaceScore(candidate.text);
  const remote = remoteSource(candidate);
  const offline = offlineSource(candidate);
  const providerBonus = providerSource(candidate) ? 0.3 : 0;
  const remoteModeBonus = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && remote ? 0.46 : 0;
  const hybridRemoteBonus = mode === GENERATOR_MODES.HYBRID && remote ? 0.16 : 0;
  const offlinePenaltyInRemote = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && offline ? 0.45 : 0;
  const questionBonus = genericQuestionActive(sourceText) && providerSource(candidate) ? 0.18 : 0;
  const coverage = Number(candidate.propositionIntegrity?.coverage?.averageCoverage || 0);
  const length = Math.min(1.15, Number(candidate.propositionIntegrity?.coverage?.lengthRatio || 0));
  const warningPenalty = asArray(candidate.propositionIntegrity?.warnings).length * 0.055;
  const copy = sourceCopyRisk(candidate.text, sourceText);
  const copyPenalty = copy.exactCopy ? 4 : copy.nearCopy ? 2.2 : copy.score > 0.92 ? 0.7 : 0;
  const base = Number(candidate.finalScore || 0.45);
  return round4(base + providerBonus + remoteModeBonus + hybridRemoteBonus + questionBonus + coverage * 0.5 + length * 0.18 + operationCompleteness(candidate) * 0.34 + maskFidelity(candidate, input) * 0.32 + syntaxDistance(candidate.text, sourceText) * 0.22 + humanTexture(candidate) * 0.16 - offlinePenaltyInRemote - collapse * 1.05 - warningPenalty - providerPenalty(candidate) - copyPenalty);
}

function auditFallback(candidate = {}, error = null) {
  return {
    ...candidate,
    propositionIntegrity: {
      version: 'patch-40-audit-fallback',
      passed: false,
      questionFormScore: 0,
      coverage: { passed: false, averageCoverage: 0, sourceTermCoverage: 0, lengthRatio: 0, missingUnitCount: 1, missingUnits: [] },
      warnings: ['proposition-audit-runtime-failed', error?.message ? String(error.message).slice(0, 180) : 'unknown-audit-error']
    },
    payloadIntegrity: { passed: false, warnings: [...new Set([...(candidate.payloadIntegrity?.warnings || []), 'proposition-audit-runtime-failed'])] },
    releasePolicy: { mayPopulateOutput: false, hardBlocked: true, state: 'hold' },
    warnings: [...new Set([...(candidate.warnings || []), 'proposition-audit-runtime-failed'])]
  };
}

function normalize(candidate = {}, sourceText = '') {
  const prepared = {
    ...candidate,
    releasePolicy: candidate.releasePolicy || { mayPopulateOutput: true, hardBlocked: false, state: 'candidate' },
    releaseSummary: candidate.releaseSummary || { status: 'candidate', warnings: [] },
    payloadIntegrity: candidate.payloadIntegrity || { passed: true, warnings: [] },
    claimIntegrity: candidate.claimIntegrity || { passed: true, warnings: [] }
  };
  try {
    const audited = attachPropositionIntegrity(prepared, sourceText);
    const copy = sourceCopyRisk(audited.text || '', sourceText);
    if (copy.exactCopy || copy.nearCopy) {
      const warnings = [...new Set([...(audited.warnings || []), 'source-copy-output'])];
      return {
        ...audited,
        sourceCopyRisk: copy,
        payloadIntegrity: { passed: false, warnings: [...new Set([...(audited.payloadIntegrity?.warnings || []), 'source-copy-output'])] },
        releasePolicy: { mayPopulateOutput: false, hardBlocked: true, state: 'hold' },
        warnings
      };
    }
    return { ...audited, sourceCopyRisk: copy };
  } catch (error) {
    return auditFallback(prepared, error);
  }
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
  const releasable = merged.filter((candidate) => release(candidate, sourceText));
  const ranked = releasable.map((candidate) => {
    const operation = styleOperation(candidate);
    const copy = sourceCopyRisk(candidate.text, sourceText);
    return {
      candidate,
      operation,
      sourceCopyRisk: copy,
      score: score(candidate, sourceText, mode, input),
      collapse: collapseSurfaceScore(candidate.text),
      coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
      lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
      maskFidelity: maskFidelity(candidate, input),
      syntaxDistance: syntaxDistance(candidate.text, sourceText),
      humanTexture: humanTexture(candidate),
      operationCompleteness: operationCompleteness(candidate),
      provider: providerSource(candidate),
      remote: remoteSource(candidate),
      offline: offlineSource(candidate)
    };
  }).sort((a, b) => b.score - a.score);

  const selected = mode === GENERATOR_MODES.REMOTE_LLM_PROXY
    ? (ranked.find((row) => row.remote && row.collapse < 0.34 && row.maskFidelity >= 0.32)?.candidate || ranked.find((row) => row.remote)?.candidate || null)
    : mode === GENERATOR_MODES.HYBRID
      ? (ranked.find((row) => row.remote && row.collapse < 0.24)?.candidate || ranked.find((row) => row.provider && row.collapse < 0.24)?.candidate || ranked[0]?.candidate || null)
      : (ranked.find((row) => row.offline && row.collapse < 0.24)?.candidate || ranked[0]?.candidate || null);

  const blockedRows = merged.filter((candidate) => !release(candidate, sourceText)).slice(0, 10).map((candidate) => ({
    id: candidate.id,
    source: candidate.source,
    operation: styleOperation(candidate),
    warnings: candidate.propositionIntegrity?.warnings || candidate.warnings || [],
    coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    missingUnitCount: candidate.propositionIntegrity?.coverage?.missingUnitCount ?? 0,
    sourceCopyRisk: candidate.sourceCopyRisk || sourceCopyRisk(candidate.text || '', sourceText)
  }));

  const selectedRow = ranked.find((row) => row.candidate === selected) || null;
  const spread = operationSpread(ranked);
  const blockedCopyCount = blockedRows.filter((row) => row.sourceCopyRisk?.exactCopy || row.sourceCopyRisk?.nearCopy).length;
  const diagnostics = {
    version: HUSH_SWAP_PATCH38_VERSION,
    internalVersion: HUSH_SWAP_PATCH38_INTERNAL_VERSION,
    providerVersion: HUSH_GENERATOR_PROVIDER_VERSION,
    providerMode: mode,
    flightPacketVersion: input.phase37Telemetry?.flightPacketVersion || input.phase37Telemetry?.flightPacket?.packet_version || '',
    phase37Version: input.phase37Telemetry?.version || '',
    providerReports: reports.map((report) => ({ provider: report.provider, model: report.model, promptVersion: report.promptVersion, flightPacketVersion: report.flightPacketVersion, candidateCount: asArray(report.candidates).length, warnings: report.warnings, requestReceipt: report.requestReceipt })),
    remoteCandidateCount: providerCandidates.filter(remoteSource).length,
    offlineCandidateCount: providerCandidates.filter(offlineSource).length,
    generatedCount: providerCandidates.length,
    mergedCount: merged.length,
    releasableCount: releasable.length,
    blockedCount: merged.length - releasable.length,
    blockedCopyCount,
    operationSpread: spread,
    operationSpreadCount: spread.length,
    blockedRows,
    selectedCandidateId: selected?.id || '',
    selectedStyleOperation: selected ? styleOperation(selected) : '',
    selectedProviderCandidate: providerSource(selected || {}),
    selectedRemoteCandidate: remoteSource(selected || {}),
    selectedOfflineCandidate: offlineSource(selected || {}),
    selectedCoverage: selected?.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    selectedLengthRatio: selected?.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    selectedMaskFidelity: selectedRow?.maskFidelity ?? 0,
    selectedSyntaxDistance: selectedRow?.syntaxDistance ?? 0,
    selectedHumanTexture: selectedRow?.humanTexture ?? 0,
    selectedOperationCompleteness: selectedRow?.operationCompleteness ?? 0,
    selectedSourceCopyRisk: selectedRow?.sourceCopyRisk || null,
    selectedCollapseSurfaceScore: round4(collapseSurfaceScore(selected?.text || '')),
    selectedScore: selectedRow?.score || 0,
    selectorRows: ranked.slice(0, 10).map((row) => ({ id: row.candidate.id, source: row.candidate.source, strategy: row.candidate.strategy, operation: row.operation, score: row.score, collapse: row.collapse, coverage: row.coverage, lengthRatio: row.lengthRatio, maskFidelity: row.maskFidelity, syntaxDistance: row.syntaxDistance, humanTexture: row.humanTexture, operationCompleteness: row.operationCompleteness, sourceCopyRisk: row.sourceCopyRisk, provider: row.provider, remote: row.remote, offline: row.offline })),
    mergedCandidates: merged,
    warning: blockedCopyCount && !selected
      ? 'all-candidates-copied-source'
      : blockedCopyCount ? 'source-copy-candidates-blocked'
        : mode === GENERATOR_MODES.REMOTE_LLM_PROXY && !providerCandidates.some(remoteSource)
          ? 'remote-mode-produced-no-remote-candidates'
          : !selected && blockedRows.length ? 'all-candidates-failed-proposition-coverage'
            : spread.length <= 1 && providerCandidates.length > 1 ? 'phase37-operation-diversity-low'
              : collapseSurfaceScore(selected?.text || '') >= 0.34 ? 'patch38-custody-collapse-risk' : ''
  };
  return apply(result, selected, diagnostics);
}
