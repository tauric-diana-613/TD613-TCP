import { buildHushSwap as buildPhase34HushSwap } from './hush-swap-phase34.js';
import { generateOfflineProviderCandidates, mergeProviderCandidates, collapseSurfaceScore, GENERATOR_MODES, HUSH_GENERATOR_PROVIDER_VERSION } from './hush-generator-provider.js';
import { generateMaskSurfaceCandidates, HUSH_MASK_SURFACE_FLIGHT_VERSION } from './hush-mask-surface-flight.js';
import { attachPropositionIntegrity } from './hush-proposition-integrity.js';

export * from './hush-swap-phase34.js';
export const HUSH_SWAP_PATCH38_VERSION = 'patch-38-hybrid-candidate-generator';
export const HUSH_SWAP_PATCH38_INTERNAL_VERSION = 'phase-37.8-authorship-selector';

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

function longestSourceRun(candidateText = '', sourceText = '') {
  const candidate = words(candidateText);
  const source = words(sourceText);
  if (!candidate.length || !source.length) return 0;
  const sourcePositions = new Map();
  source.forEach((word, index) => {
    if (!sourcePositions.has(word)) sourcePositions.set(word, []);
    sourcePositions.get(word).push(index);
  });
  let best = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    const positions = sourcePositions.get(candidate[i]) || [];
    for (const start of positions) {
      let run = 0;
      while (candidate[i + run] && source[start + run] && candidate[i + run] === source[start + run]) run += 1;
      if (run > best) best = run;
    }
  }
  return best;
}

function sourceCopyRisk(candidateText = '', sourceText = '') {
  const candidateNorm = normalizedText(candidateText);
  const sourceNorm = normalizedText(sourceText);
  if (!candidateNorm || !sourceNorm) return { exactCopy: false, wrapperCopy: false, nearCopy: false, longVerbatimRun: false, tokenOverlap: 0, syntaxDistance: 1, lengthRatio: 1, longestRun: 0, score: 0 };
  const overlap = tokenOverlap(candidateText, sourceText);
  const syntax = syntaxDistance(candidateText, sourceText);
  const candidateWords = words(candidateText).length;
  const sourceWords = Math.max(1, words(sourceText).length);
  const lengthRatio = candidateWords / sourceWords;
  const longestRun = longestSourceRun(candidateText, sourceText);
  const exactCopy = candidateNorm === sourceNorm;
  const wrapperCopy = !exactCopy && sourceNorm.length >= 24 && candidateNorm.includes(sourceNorm);
  const longThreshold = Math.min(12, Math.max(8, Math.floor(sourceWords * 0.68)));
  const longVerbatimRun = longestRun >= longThreshold;
  const nearCopy = !exactCopy && !wrapperCopy && overlap >= 0.94 && syntax <= 0.42 && lengthRatio >= 0.9 && lengthRatio <= 1.16 && longestRun >= Math.min(8, Math.max(5, Math.floor(sourceWords * 0.38)));
  const score = exactCopy || wrapperCopy ? 1 : round4(Math.min(1, overlap * 0.46 + (1 - Math.min(1, syntax)) * 0.2 + Math.min(0.16, longestRun / Math.max(14, sourceWords))));
  return { exactCopy, wrapperCopy, nearCopy, longVerbatimRun, tokenOverlap: round4(overlap), syntaxDistance: syntax, lengthRatio: round4(lengthRatio), longestRun, score };
}

function styleOperation(candidate = {}) {
  return safe(candidate.style_operation || candidate.providerTelemetry?.style_operation || candidate.strategy || candidate.operations?.at?.(-1) || 'operation-unreported') || 'operation-unreported';
}

function operationCompleteness(candidate = {}) {
  const hasOp = styleOperation(candidate) !== 'operation-unreported';
  const preserved = asArray(candidate.preserved_propositions || candidate.providerTelemetry?.preserved_propositions).length;
  const notes = candidate.mask_surface_notes || candidate.providerTelemetry?.mask_surface_notes || {};
  const hasNotes = notes && typeof notes === 'object' && Object.keys(notes).length > 0;
  const authorMoves = asArray(candidate.authorship_moves || candidate.providerTelemetry?.authorship_moves).length;
  return round4((hasOp ? 0.36 : 0) + Math.min(0.32, preserved * 0.08) + (hasNotes ? 0.2 : 0) + Math.min(0.12, authorMoves * 0.06));
}

function maskFidelity(candidate = {}, input = {}) {
  const value = safe(candidate.text).toLowerCase();
  const mask = input.mask || {};
  const vector = input.phase37Telemetry?.flightPacket?.mask_style_vector || {};
  const diversity = mask.diversity || {};
  const profileTargets = mask.profileTargets?.diversityAxisTargets || mask.profileTargets || {};
  const hints = [
    ...asArray(mask.dictionHints),
    ...asArray(mask.transitionBank),
    ...asArray(mask.transformHints?.desiredMoves),
    ...asArray(mask.diversity?.openingMoves),
    ...asArray(mask.diversity?.lexicalSignature),
    ...asArray(mask.diversity?.requiredMoves),
    ...asArray(vector.diction_hints),
    ...asArray(vector.transition_bank),
    ...asArray(vector.desired_moves)
  ].map((item) => Array.isArray(item) ? safe(item[1] || item[0]) : safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 36);
  const hintScore = hints.length ? hints.filter((hint) => value.includes(hint)).length / hints.length : 0.35;
  const notes = candidate.mask_surface_notes || candidate.providerTelemetry?.mask_surface_notes || {};
  const notesScore = notes && typeof notes === 'object' ? Math.min(0.22, Object.keys(notes).length * 0.055) : 0;
  const styleText = safe(`${diversity.sentenceArchitecture || ''} ${diversity.punctuationSignature || ''} ${JSON.stringify(profileTargets)}`).toLowerCase();
  const explicitTargetScore = styleText && styleOperation(candidate) !== 'operation-unreported' ? 0.12 : 0;
  const surfaceFlightScore = candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION) ? 0.18 : 0;
  return round4(Math.min(1, hintScore * 0.38 + operationCompleteness(candidate) * 0.28 + notesScore + explicitTargetScore + surfaceFlightScore + 0.1));
}

function kernelFromInput(input = {}) {
  const kernel = input.authorshipKernel || input.phase37Telemetry?.authorshipKernel || input.phase37Telemetry?.flightPacket?.authorship_kernel || input.phase37Telemetry?.flightPacket?.mask_style_vector?.authorship_kernel || {};
  const mask = input.mask || {};
  const diversity = mask.diversity || {};
  return {
    maskId: kernel.mask_id || mask.id || '',
    displayName: kernel.display_name || mask.label || mask.name || '',
    lexicalSignature: [
      ...asArray(kernel.lexical_signature),
      ...asArray(diversity.lexicalSignature),
      ...asArray(mask.dictionHints).map((item) => Array.isArray(item) ? item[1] || item[0] : item)
    ].map((item) => safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 28),
    openingMoves: [...asArray(kernel.opening_moves), ...asArray(diversity.openingMoves), ...asArray(mask.transitionBank)].map((item) => safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 16),
    signatureMoves: [...asArray(kernel.signature_moves), ...asArray(diversity.requiredMoves), ...asArray(mask.transformHints?.desiredMoves)].map((item) => safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 18),
    genericAvoid: [...asArray(kernel.generic_avoid), ...asArray(kernel.banned_generic_moves), ...asArray(mask.avoidList), 'here is', 'in summary', 'to clarify', 'this version', 'this rewrite', 'the message is', 'the point is'].map((item) => safe(item).toLowerCase()).filter((item) => item.length > 2).slice(0, 28),
    sentenceArchitecture: safe(kernel.sentence_architecture || kernel.rhythmic_law || diversity.sentenceArchitecture || mask.writingTraits?.clauseShape || ''),
    dictionWeather: safe(kernel.diction_weather || mask.writingTraits?.diction || mask.family || '')
  };
}

function authorshipSignal(candidate = {}, input = {}) {
  const kernel = kernelFromInput(input);
  const text = safe(candidate.text).toLowerCase();
  const authorMoves = asArray(candidate.authorship_moves || candidate.providerTelemetry?.authorship_moves).map((move) => safe(move).toLowerCase()).filter(Boolean);
  const noteText = safe(JSON.stringify(candidate.mask_surface_notes || candidate.providerTelemetry?.mask_surface_notes || {})).toLowerCase();
  const lexicalHits = [...new Set(kernel.lexicalSignature.filter((hint) => text.includes(hint)))].slice(0, 8);
  const openingHits = [...new Set(kernel.openingMoves.filter((hint) => text.slice(0, 140).includes(hint)))].slice(0, 4);
  const signatureHits = [...new Set(kernel.signatureMoves.filter((hint) => noteText.includes(hint) || authorMoves.some((move) => move.includes(hint) || hint.includes(move))))].slice(0, 6);
  const genericHits = [...new Set(kernel.genericAvoid.filter((hint) => text.includes(hint)))].slice(0, 6);
  const authorMoveScore = Math.min(0.22, authorMoves.length * 0.08);
  const lexicalScore = kernel.lexicalSignature.length ? Math.min(0.28, lexicalHits.length / Math.max(4, kernel.lexicalSignature.length) * 0.56) : 0.1;
  const openingScore = openingHits.length ? 0.12 : 0;
  const signatureScore = signatureHits.length ? Math.min(0.18, signatureHits.length * 0.07) : 0;
  const notesScore = noteText.length > 8 ? 0.08 : 0;
  const architectureScore = kernel.sentenceArchitecture && styleOperation(candidate) !== 'operation-unreported' ? 0.08 : 0;
  const genericPenalty = Math.min(0.42, genericHits.length * 0.14);
  const score = round4(Math.max(0, Math.min(1, lexicalScore + openingScore + signatureScore + authorMoveScore + notesScore + architectureScore - genericPenalty)));
  const warnings = [];
  if (score < 0.24) warnings.push('authorship-signal-low');
  if (genericHits.length) warnings.push('authorship-generic-surface-hit');
  if (!authorMoves.length && providerSource(candidate)) warnings.push('authorship-moves-missing');
  if (!lexicalHits.length && kernel.lexicalSignature.length >= 3) warnings.push('authorship-lexical-signature-missing');
  return { score, lexicalHits, openingHits, signatureHits, genericHits, authorMoves, warnings, kernelId: kernel.maskId, kernelName: kernel.displayName };
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

function hardCopyBlocked(candidate = {}, sourceText = '') {
  const copy = candidate.sourceCopyRisk || sourceCopyRisk(candidate.text || '', sourceText);
  return Boolean(copy.exactCopy || copy.wrapperCopy || (copy.longVerbatimRun && !providerSource(candidate)) || (copy.nearCopy && !providerSource(candidate)));
}

function isSourceCopy(candidate = {}, sourceText = '') {
  return hardCopyBlocked(candidate, sourceText);
}

function questionFallbackEligible(candidate = {}, sourceText = '') {
  const output = safe(candidate.text || '');
  return genericQuestionActive(sourceText)
    && providerSource(candidate)
    && /\?/.test(output)
    && /tech/i.test(output)
    && /signal[- ]reading|signal/i.test(output)
    && collapseSurfaceScore(output) < 0.48
    && !isSourceCopy(candidate, sourceText);
}

function reviewReleaseEligible(candidate = {}, sourceText = '') {
  if (!providerSource(candidate) || !safe(candidate.text)) return false;
  const copy = candidate.sourceCopyRisk || sourceCopyRisk(candidate.text || '', sourceText);
  if (copy.exactCopy || copy.wrapperCopy) return false;
  const audit = candidate.propositionIntegrity || {};
  const coverage = audit.coverage || {};
  const newClaimRisk = Number(audit.newClaimRisk?.score ?? 0);
  const averageCoverage = Number(coverage.averageCoverage ?? 0);
  const sourceTermCoverage = Number(coverage.sourceTermCoverage ?? 0);
  const lengthRatio = Number(coverage.lengthRatio ?? 1);
  const questionOk = Number(audit.questionFormScore ?? 1) >= 0.5;
  const claimOk = !audit.answeredQuestion && !audit.inventedAdvice && !audit.strengthenedClaim && newClaimRisk < 0.48;
  const meaningOk = averageCoverage >= 0.36 || sourceTermCoverage >= 0.32 || candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION);
  const shapeOk = lengthRatio >= 0.24 && lengthRatio <= 2.8 && collapseSurfaceScore(candidate.text || '') < 0.72;
  return questionOk && claimOk && meaningOk && shapeOk && operationCompleteness(candidate) >= 0.42;
}

function release(candidate = {}, sourceText = '') {
  if (!candidate?.text?.trim()) return false;
  if (isSourceCopy(candidate, sourceText)) return false;
  if (questionFallbackEligible(candidate, sourceText)) return true;
  if (reviewReleaseEligible(candidate, sourceText)) return true;
  if (candidate.payloadIntegrity?.passed === false) return false;
  if (candidate.claimIntegrity?.passed === false) return false;
  if (candidate.releasePolicy?.hardBlocked === true) return false;
  if (candidate.propositionIntegrity?.passed === false) return false;
  return true;
}

function operationSpread(rows = []) {
  return [...new Set(rows.map((row) => row.operation).filter(Boolean))];
}

function score(candidate = {}, sourceText = '', mode = GENERATOR_MODES.OFFLINE_EXPRESSIVE, input = {}) {
  const collapse = collapseSurfaceScore(candidate.text);
  const remote = remoteSource(candidate);
  const offline = offlineSource(candidate);
  const surfaceFlight = candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION);
  const providerBonus = providerSource(candidate) ? 0.3 : 0;
  const remoteModeBonus = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && remote ? 0.56 : 0;
  const hybridRemoteBonus = mode === GENERATOR_MODES.HYBRID && remote ? 0.22 : 0;
  const offlinePenaltyInRemote = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && offline && !surfaceFlight ? 0.65 : 0.28;
  const questionBonus = genericQuestionActive(sourceText) && providerSource(candidate) ? 0.18 : 0;
  const surfaceBonus = surfaceFlight ? 0.5 : 0;
  const coverage = Number(candidate.propositionIntegrity?.coverage?.averageCoverage || 0);
  const length = Math.min(1.15, Number(candidate.propositionIntegrity?.coverage?.lengthRatio || 0));
  const warningPenalty = reviewReleaseEligible(candidate, sourceText) ? asArray(candidate.propositionIntegrity?.warnings).length * 0.025 : asArray(candidate.propositionIntegrity?.warnings).length * 0.055;
  const copy = sourceCopyRisk(candidate.text, sourceText);
  const copyPenalty = copy.exactCopy || copy.wrapperCopy ? 4 : !providerSource(candidate) && (copy.nearCopy || copy.longVerbatimRun) ? 2.2 : copy.score > 0.94 ? 0.35 : 0;
  const authorship = authorshipSignal(candidate, input);
  const base = Number(candidate.finalScore || 0.45);
  return round4(base + providerBonus + remoteModeBonus + hybridRemoteBonus + questionBonus + surfaceBonus + coverage * 0.5 + length * 0.18 + operationCompleteness(candidate) * 0.3 + maskFidelity(candidate, input) * 0.32 + authorship.score * 0.58 + syntaxDistance(candidate.text, sourceText) * 0.2 + humanTexture(candidate) * 0.14 - offlinePenaltyInRemote - collapse * 0.72 - warningPenalty - providerPenalty(candidate) - copyPenalty - Math.min(0.18, authorship.genericHits.length * 0.06));
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
    if (copy.exactCopy || copy.wrapperCopy || ((copy.nearCopy || copy.longVerbatimRun) && !providerSource(audited))) {
      const warnings = [...new Set([...(audited.warnings || []), copy.wrapperCopy ? 'source-wrapper-copy-output' : copy.longVerbatimRun ? 'source-verbatim-run-output' : 'source-copy-output'])];
      return {
        ...audited,
        sourceCopyRisk: copy,
        payloadIntegrity: { passed: false, warnings: [...new Set([...(audited.payloadIntegrity?.warnings || []), ...warnings])] },
        releasePolicy: { mayPopulateOutput: false, hardBlocked: true, state: 'hold' },
        warnings
      };
    }
    if (providerSource(audited) && (copy.nearCopy || copy.longVerbatimRun)) {
      const warnings = [...new Set([...(audited.warnings || []), copy.longVerbatimRun ? 'provider-source-run-review' : 'provider-near-source-review'])];
      return { ...audited, sourceCopyRisk: copy, warnings, releaseSummary: { status: 'review', warnings }, releasePolicy: { mayPopulateOutput: true, hardBlocked: false, state: 'review' } };
    }
    return { ...audited, sourceCopyRisk: copy };
  } catch (error) {
    return auditFallback(prepared, error);
  }
}

function withPatch38Version(version = '') {
  const current = safe(version || 'hush');
  return current.includes(HUSH_SWAP_PATCH38_VERSION) ? current : `${current}+${HUSH_SWAP_PATCH38_VERSION}`;
}

function apply(result = {}, selected = null, diagnostics = {}) {
  if (!selected) {
    return {
      ...result,
      version: withPatch38Version(result.version),
      selectedOutput: '',
      selectedCandidateId: '',
      patch38Diagnostics: diagnostics,
      warnings: [...new Set([...asArray(result.warnings), ...(diagnostics.warning ? [diagnostics.warning] : [])])]
    };
  }
  return {
    ...result,
    version: withPatch38Version(result.version),
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
  const strictRemoteOnly = Boolean(input.options?.strictRemoteOnly);
  const offlineReport = strictRemoteOnly ? { provider: 'strict-remote-only', candidates: [], warnings: ['offline-disabled-by-strict-remote-only'] } : generateOfflineProviderCandidates(input);
  const maskSurfaceReport = strictRemoteOnly ? { provider: 'strict-remote-only', candidates: [], warnings: ['mask-surface-disabled-by-strict-remote-only'] } : generateMaskSurfaceCandidates(input);
  const remoteReports = asArray(input.providerReports);
  const reports = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && strictRemoteOnly
    ? remoteReports
    : mode === GENERATOR_MODES.REMOTE_LLM_PROXY
      ? [...remoteReports, maskSurfaceReport]
      : mode === GENERATOR_MODES.HYBRID
        ? [...remoteReports, maskSurfaceReport, offlineReport]
        : [maskSurfaceReport, offlineReport];
  const providerCandidates = mergeProviderCandidates(reports).map((candidate) => normalize(candidate, sourceText));
  const merged = strictRemoteOnly
    ? providerCandidates
    : mergeProviderCandidates([{ candidates: providerCandidates }, { candidates: asArray(result.candidates) }]).map((candidate) => normalize(candidate, sourceText));
  const releasable = merged.filter((candidate) => release(candidate, sourceText));
  const ranked = releasable.map((candidate) => {
    const operation = styleOperation(candidate);
    const copy = sourceCopyRisk(candidate.text, sourceText);
    const author = authorshipSignal(candidate, input);
    const fidelity = maskFidelity(candidate, input);
    return {
      candidate,
      operation,
      sourceCopyRisk: copy,
      authorship: author,
      authorshipScore: author.score,
      score: score(candidate, sourceText, mode, input),
      collapse: collapseSurfaceScore(candidate.text),
      coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
      lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
      maskFidelity: fidelity,
      syntaxDistance: syntaxDistance(candidate.text, sourceText),
      humanTexture: humanTexture(candidate),
      operationCompleteness: operationCompleteness(candidate),
      reviewRelease: reviewReleaseEligible(candidate, sourceText),
      provider: providerSource(candidate),
      remote: remoteSource(candidate),
      offline: offlineSource(candidate)
    };
  }).sort((a, b) => b.score - a.score);

  let selected = mode === GENERATOR_MODES.REMOTE_LLM_PROXY && strictRemoteOnly
    ? (ranked.find((row) => row.remote && row.authorshipScore >= 0.22 && row.maskFidelity >= 0.16)?.candidate || ranked.find((row) => row.remote && row.maskFidelity >= 0.18)?.candidate || ranked.find((row) => row.remote)?.candidate || null)
    : mode === GENERATOR_MODES.REMOTE_LLM_PROXY
      ? (ranked.find((row) => row.remote && row.authorshipScore >= 0.24 && row.maskFidelity >= 0.24)?.candidate || ranked.find((row) => row.remote && row.maskFidelity >= 0.28)?.candidate || ranked.find((row) => row.candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION) && row.maskFidelity >= 0.34)?.candidate || ranked.find((row) => row.remote)?.candidate || null)
      : mode === GENERATOR_MODES.HYBRID
        ? (ranked.find((row) => row.remote && row.authorshipScore >= 0.22 && row.maskFidelity >= 0.2)?.candidate || ranked.find((row) => row.remote && row.maskFidelity >= 0.24)?.candidate || ranked.find((row) => row.candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION))?.candidate || ranked.find((row) => row.provider)?.candidate || ranked[0]?.candidate || null)
        : (ranked.find((row) => row.candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION) && row.maskFidelity >= 0.28)?.candidate || ranked.find((row) => row.offline && row.collapse < 0.42)?.candidate || ranked[0]?.candidate || null);
  if (strictRemoteOnly && selected && !remoteSource(selected)) selected = null;

  const blockedRows = merged.filter((candidate) => !release(candidate, sourceText)).slice(0, 10).map((candidate) => {
    const author = authorshipSignal(candidate, input);
    return {
      id: candidate.id,
      source: candidate.source,
      operation: styleOperation(candidate),
      warnings: [...new Set([...(candidate.propositionIntegrity?.warnings || candidate.warnings || []), ...author.warnings])],
      coverage: candidate.propositionIntegrity?.coverage?.averageCoverage ?? 0,
      lengthRatio: candidate.propositionIntegrity?.coverage?.lengthRatio ?? 0,
      missingUnitCount: candidate.propositionIntegrity?.coverage?.missingUnitCount ?? 0,
      authorshipScore: author.score,
      authorshipWarnings: author.warnings,
      authorMoves: author.authorMoves,
      sourceCopyRisk: candidate.sourceCopyRisk || sourceCopyRisk(candidate.text || '', sourceText)
    };
  });

  const selectedRow = ranked.find((row) => row.candidate === selected) || null;
  const spread = operationSpread(ranked);
  const blockedCopyCount = blockedRows.filter((row) => row.sourceCopyRisk?.exactCopy || row.sourceCopyRisk?.wrapperCopy || row.sourceCopyRisk?.nearCopy || row.sourceCopyRisk?.longVerbatimRun).length;
  const providerBlockedCount = blockedRows.filter((row) => /remote-llm-candidate|patch38-offline-provider|phase34-expressive-generator/i.test(row.source || row.id || '')).length;
  const authorshipScores = ranked.map((row) => row.authorshipScore).filter((value) => Number.isFinite(Number(value)));
  const diagnostics = {
    version: HUSH_SWAP_PATCH38_VERSION,
    internalVersion: HUSH_SWAP_PATCH38_INTERNAL_VERSION,
    providerVersion: HUSH_GENERATOR_PROVIDER_VERSION,
    providerMode: mode,
    strictRemoteOnly,
    fallbackReleased: !strictRemoteOnly,
    maskSurfaceFlightVersion: HUSH_MASK_SURFACE_FLIGHT_VERSION,
    flightPacketVersion: input.phase37Telemetry?.flightPacketVersion || input.phase37Telemetry?.flightPacket?.packet_version || '',
    phase37Version: input.phase37Telemetry?.version || '',
    packetTier: input.phase37Telemetry?.packetTier || input.phase37Telemetry?.flightPacket?.packet_tier || '',
    maskEvidenceState: input.phase37Telemetry?.maskEvidence?.maskEvidenceState || input.phase37Telemetry?.flightPacket?.mask_evidence?.maskEvidenceState || '',
    providerReports: reports.map((report) => ({ provider: report.provider, model: report.model, promptVersion: report.promptVersion, flightPacketVersion: report.flightPacketVersion, candidateCount: asArray(report.candidates).length, warnings: report.warnings, requestReceipt: report.requestReceipt })),
    remoteCandidateCount: providerCandidates.filter(remoteSource).length,
    offlineCandidateCount: providerCandidates.filter(offlineSource).length,
    maskSurfaceCandidateCount: providerCandidates.filter((candidate) => candidate.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION)).length,
    generatedCount: providerCandidates.length,
    mergedCount: merged.length,
    releasableCount: releasable.length,
    blockedCount: merged.length - releasable.length,
    blockedCopyCount,
    operationSpread: spread,
    operationSpreadCount: spread.length,
    authorshipSelectorVersion: HUSH_SWAP_PATCH38_INTERNAL_VERSION,
    authorshipKernelId: kernelFromInput(input).maskId,
    authorshipScoreRange: authorshipScores.length ? { min: round4(Math.min(...authorshipScores)), max: round4(Math.max(...authorshipScores)), average: round4(authorshipScores.reduce((sum, value) => sum + value, 0) / authorshipScores.length) } : { min: 0, max: 0, average: 0 },
    blockedRows,
    selectedCandidateId: selected?.id || '',
    selectedStyleOperation: selected ? styleOperation(selected) : '',
    selectedProviderCandidate: providerSource(selected || {}),
    selectedRemoteCandidate: remoteSource(selected || {}),
    selectedOfflineCandidate: offlineSource(selected || {}),
    selectedMaskSurfaceFlight: selected?.operations?.includes?.(HUSH_MASK_SURFACE_FLIGHT_VERSION) || false,
    selectedCoverage: selected?.propositionIntegrity?.coverage?.averageCoverage ?? 0,
    selectedLengthRatio: selected?.propositionIntegrity?.coverage?.lengthRatio ?? 0,
    selectedMaskFidelity: selectedRow?.maskFidelity ?? 0,
    selectedAuthorshipScore: selectedRow?.authorshipScore ?? 0,
    selectedAuthorship: selectedRow?.authorship || null,
    selectedSyntaxDistance: selectedRow?.syntaxDistance ?? 0,
    selectedHumanTexture: selectedRow?.humanTexture ?? 0,
    selectedOperationCompleteness: selectedRow?.operationCompleteness ?? 0,
    selectedReviewRelease: selectedRow?.reviewRelease ?? false,
    selectedSourceCopyRisk: selectedRow?.sourceCopyRisk || null,
    selectedCollapseSurfaceScore: round4(collapseSurfaceScore(selected?.text || '')),
    selectedScore: selectedRow?.score || 0,
    selectorRows: ranked.slice(0, 10).map((row) => ({ id: row.candidate.id, source: row.candidate.source, strategy: row.candidate.strategy, operation: row.operation, score: row.score, collapse: row.collapse, coverage: row.coverage, lengthRatio: row.lengthRatio, maskFidelity: row.maskFidelity, authorshipScore: row.authorshipScore, authorshipWarnings: row.authorship?.warnings || [], authorMoves: row.authorship?.authorMoves || [], syntaxDistance: row.syntaxDistance, humanTexture: row.humanTexture, operationCompleteness: row.operationCompleteness, reviewRelease: row.reviewRelease, sourceCopyRisk: row.sourceCopyRisk, provider: row.provider, remote: row.remote, offline: row.offline })),
    mergedCandidates: merged,
    warning: strictRemoteOnly && !selected && providerCandidates.filter(remoteSource).length === 0
      ? 'strict-remote-only-no-approved-remote-candidate'
      : strictRemoteOnly && !selected
        ? 'strict-remote-only-remote-candidates-failed-review-release'
        : !selected && mode === GENERATOR_MODES.REMOTE_LLM_PROXY && providerCandidates.filter(remoteSource).length === 0
          ? 'remote-mode-produced-no-remote-candidates'
          : !selected && providerBlockedCount
            ? 'provider-candidates-failed-review-release'
            : !selected && blockedCopyCount
              ? 'all-candidates-copied-source'
              : blockedCopyCount ? 'source-copy-candidates-blocked'
                : !selected && blockedRows.length ? 'all-candidates-failed-proposition-coverage'
                  : spread.length <= 1 && providerCandidates.length > 1 ? 'phase37-operation-diversity-low'
                    : authorshipScores.length && Math.max(...authorshipScores) < 0.22 ? 'authorship-signal-low-across-candidates'
                      : collapseSurfaceScore(selected?.text || '') >= 0.48 ? 'patch38-custody-collapse-risk' : ''
  };
  return apply(result, selected, diagnostics);
}