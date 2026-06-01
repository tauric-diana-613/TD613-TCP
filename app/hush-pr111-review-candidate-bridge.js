(function () {
  'use strict';

  var VERSION = 'pr111-review-candidate-bridge';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function number(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function hay(candidate, result) {
    return [
      candidate && candidate.provider,
      candidate && candidate.model,
      candidate && candidate.source,
      candidate && candidate.id,
      candidate && candidate.style_note,
      candidate && candidate.style_operation,
      asArray(candidate && candidate.warnings).join(' '),
      JSON.stringify(result && result.patch38Diagnostics && result.patch38Diagnostics.providerReports || [])
    ].join(' ').toLowerCase();
  }

  function providerOrSurface(candidate) {
    return /remote-llm-candidate|llm-candidate|patch38-offline-provider|phase34-expressive-generator|mask-surface-flight/i.test([
      candidate && candidate.source,
      candidate && candidate.id,
      asArray(candidate && candidate.operations).join(' ')
    ].join(' '));
  }

  function remoteCandidate(candidate) {
    return /remote-llm-candidate|llm-candidate/i.test([candidate && candidate.source, candidate && candidate.id].join(' '));
  }

  function offlineCandidate(candidate) {
    return /patch38-offline-provider|phase34-expressive-generator/i.test([candidate && candidate.source, candidate && candidate.id].join(' '));
  }

  function sourceCopyBlocked(candidate) {
    var copy = candidate && candidate.sourceCopyRisk || {};
    return Boolean(copy.exactCopy || copy.wrapperCopy || copy.nearCopy || copy.longVerbatimRun);
  }

  function collapseScore(value) {
    var source = text(value);
    var hits = [/just keeping this organized:/i, /should stay with the note/i, /that keeps the context together/i, /for the record/i, /record anchor/i, /the point is preservation/i].reduce(function (sum, rx) {
      return sum + (rx.test(source) ? 1 : 0);
    }, 0);
    return Math.min(1, hits / 3);
  }

  function noteCount(candidate) {
    var notes = candidate && (candidate.mask_surface_notes || candidate.providerTelemetry && candidate.providerTelemetry.mask_surface_notes) || {};
    return notes && typeof notes === 'object' ? Object.keys(notes).filter(function (key) { return text(notes[key]); }).length : 0;
  }

  function styleOperation(candidate) {
    return text(candidate && (candidate.style_operation || candidate.providerTelemetry && candidate.providerTelemetry.style_operation || candidate.strategy || asArray(candidate.operations).slice(-1)[0] || ''));
  }

  function operationCompleteness(candidate) {
    var hasOp = styleOperation(candidate) && styleOperation(candidate) !== 'operation-unreported';
    var preserved = asArray(candidate && (candidate.preserved_propositions || candidate.providerTelemetry && candidate.providerTelemetry.preserved_propositions)).length;
    var notes = noteCount(candidate);
    return Number(Math.min(1, (hasOp ? 0.44 : 0) + Math.min(0.28, preserved * 0.07) + Math.min(0.32, notes * 0.12)).toFixed(4));
  }

  function maskFidelity(candidate) {
    var notes = noteCount(candidate);
    var op = styleOperation(candidate) ? 0.3 : 0;
    var provider = providerOrSurface(candidate) ? 0.14 : 0;
    var surface = asArray(candidate && candidate.operations).some(function (opName) { return /mask-surface-flight/i.test(opName); }) ? 0.18 : 0;
    return Number(Math.min(1, op + provider + surface + Math.min(0.34, notes * 0.12)).toFixed(4));
  }

  function syntaxDistance(candidate) {
    var copy = candidate && candidate.sourceCopyRisk || {};
    var value = number(copy.syntaxDistance == null ? candidate && candidate.syntaxDistance : copy.syntaxDistance, 0);
    return value > 0 ? value : 0;
  }

  function pr106Vetoed(result) {
    var last = window.__TD613_HUSH_PR106_LAST || {};
    var haystack = [
      JSON.stringify(result && result.pr106ReleaseGuard || {}),
      JSON.stringify(last || {}),
      asArray(result && result.warnings).join(' '),
      asArray(result && result.releaseSummary && result.releaseSummary.warnings).join(' ')
    ].join(' ');
    return /pr106-stylometry-ontology-release-blocked|"blocked":true/.test(haystack);
  }

  function eligible(candidate, result) {
    if (!candidate || !text(candidate.text)) return false;
    if (!providerOrSurface(candidate)) return false;
    if (/server-deterministic-repair|server-repair|gemini-fast-path-fallback-before-timeout|deterministic-repair/.test(hay(candidate, result))) return false;
    if (sourceCopyBlocked(candidate)) return false;

    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var averageCoverage = number(coverage.averageCoverage, 0);
    var sourceTermCoverage = number(coverage.sourceTermCoverage, 0);
    var lengthRatio = number(coverage.lengthRatio, 0);
    var questionScore = number(audit.questionFormScore == null ? 1 : audit.questionFormScore, 1);
    var newClaimRisk = number(audit.newClaimRisk && audit.newClaimRisk.score, 0);
    var syntax = syntaxDistance(candidate);

    if (audit.answeredQuestion || audit.inventedAdvice || audit.strengthenedClaim) return false;
    if (newClaimRisk >= 0.48) return false;
    if (questionScore < 0.5) return false;
    if (averageCoverage < 0.38 && sourceTermCoverage < 0.38) return false;
    if (lengthRatio && (lengthRatio < 0.28 || lengthRatio > 2.9)) return false;
    if (collapseScore(candidate.text) >= 0.48) return false;
    if (syntax && syntax < 0.42) return false;
    if (operationCompleteness(candidate) < 0.58) return false;
    if (maskFidelity(candidate) < 0.3) return false;
    if (remoteCandidate(candidate) && noteCount(candidate) < 2) return false;
    if (remoteCandidate(candidate) && !styleOperation(candidate)) return false;
    return true;
  }

  function score(candidate) {
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var averageCoverage = number(coverage.averageCoverage, 0);
    var sourceTermCoverage = number(coverage.sourceTermCoverage, 0);
    var lengthRatio = Math.min(1.15, number(coverage.lengthRatio, 0));
    var questionScore = number(audit.questionFormScore == null ? 1 : audit.questionFormScore, 1);
    return Number((averageCoverage * 0.38 + sourceTermCoverage * 0.24 + questionScore * 0.16 + syntaxDistance(candidate) * 0.22 + operationCompleteness(candidate) * 0.28 + maskFidelity(candidate) * 0.26 + lengthRatio * 0.12 - collapseScore(candidate.text) * 0.5).toFixed(4));
  }

  function candidates(result) {
    var diagnostics = result && result.patch38Diagnostics || {};
    return asArray(diagnostics.mergedCandidates || result && result.candidates);
  }

  function find(result) {
    return candidates(result)
      .filter(function (candidate) { return eligible(candidate, result); })
      .map(function (candidate) { return { candidate: candidate, score: score(candidate) }; })
      .sort(function (a, b) { return b.score - a.score; })[0] || null;
  }

  function setStatus(message, tone) {
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'warning';
    status.textContent = message;
  }

  function promote(result, ranked, label) {
    if (!result || pr106Vetoed(result) || text(result.selectedOutput)) return false;
    var selected = ranked && ranked.candidate;
    if (!selected) return false;
    var diagnostics = result.patch38Diagnostics || {};
    var selectedText = selected.text || '';
    var merged = candidates(result);

    result.candidates = [selected].concat(merged.filter(function (candidate) { return candidate !== selected && (!selected.id || candidate.id !== selected.id); }));
    result.selectedOutput = selectedText;
    result.selectedCandidateId = selected.id || 'pr111-review-candidate';
    result.releasePolicy = { mayPopulateOutput: true, hardBlocked: false, state: 'review' };
    result.releaseSummary = { status: 'review', warnings: ['pr111-review-candidate-human-reclosure-required'] };
    result.warnings = Array.from(new Set(asArray(result.warnings).filter(function (item) { return !/selector_no_approved_candidate|provider-candidates-failed-review-release/.test(item); }).concat(['pr111-review-candidate-human-reclosure-required'])));

    diagnostics.selectedCandidateId = result.selectedCandidateId;
    diagnostics.selectedProviderCandidate = providerOrSurface(selected);
    diagnostics.selectedRemoteCandidate = remoteCandidate(selected);
    diagnostics.selectedOfflineCandidate = offlineCandidate(selected);
    diagnostics.selectedMaskSurfaceFlight = asArray(selected.operations).some(function (opName) { return /mask-surface-flight/i.test(opName); });
    diagnostics.selectedStyleOperation = styleOperation(selected) || 'pr111-review-candidate';
    diagnostics.selectedCoverage = number(selected.propositionIntegrity && selected.propositionIntegrity.coverage && (selected.propositionIntegrity.coverage.averageCoverage || selected.propositionIntegrity.coverage.sourceTermCoverage), 0);
    diagnostics.selectedLengthRatio = number(selected.propositionIntegrity && selected.propositionIntegrity.coverage && selected.propositionIntegrity.coverage.lengthRatio, 0);
    diagnostics.selectedMaskFidelity = maskFidelity(selected);
    diagnostics.selectedSyntaxDistance = syntaxDistance(selected) || 0.42;
    diagnostics.selectedHumanTexture = number(selected.humanTexture || selected.naturalness && selected.naturalness.naturalnessScore, 0.72);
    diagnostics.selectedOperationCompleteness = operationCompleteness(selected);
    diagnostics.selectedReviewRelease = true;
    diagnostics.selectedSourceCopyRisk = selected.sourceCopyRisk || null;
    diagnostics.selectedCollapseSurfaceScore = Number(collapseScore(selectedText).toFixed(4));
    diagnostics.selectedScore = ranked.score;
    diagnostics.releasableCount = Math.max(1, number(diagnostics.releasableCount, 0));
    diagnostics.warning = 'pr111-review-candidate-human-reclosure-required';
    diagnostics.reviewCandidateBridge = { version: VERSION, applied: true, selectedCandidateId: result.selectedCandidateId, score: ranked.score };
    result.patch38Diagnostics = diagnostics;
    result.pr111ReviewCandidateBridge = { version: VERSION, recovered: true, selectedCandidateId: result.selectedCandidateId, score: ranked.score, label: label || 'promote', at: new Date().toISOString(), humanReclosureRequired: true };

    var output = $('protectedOutputInput');
    if (output) {
      output.value = selectedText;
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState) {
      window.__TD613_HUSH_BENCH__.benchState.protectedOutputText = selectedText;
      window.__TD613_HUSH_BENCH__.benchState.hushSwapResult = result;
    }
    window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
    window.__TD613_HUSH_PR111_LAST = result.pr111ReviewCandidateBridge;
    setStatus('Review candidate populated. Human reclosure required before Accept; PR106 release guard remains active.', 'warning');
    try { window.dispatchEvent(new CustomEvent('td613:hush:patch38-result', { detail: { result: result, pr111ReviewCandidate: true } })); } catch (error) {}
    return true;
  }

  function clearStaleApprovalForReview(result, label) {
    if (!result || pr106Vetoed(result) || !text(result.selectedOutput)) return false;
    if (!(result.pr111ReviewCandidateBridge || result.patch38ReviewCandidateBridge || result.releasePolicy && result.releasePolicy.state === 'review')) return false;
    var warning = $('acceptWarning');
    if (warning && /Candidate approval blocked|patch38_no_approved_candidate|selector_no_approved_candidate/.test(warning.textContent || '')) {
      warning.hidden = true;
      warning.textContent = '';
    }
    window.__TD613_HUSH_PR111_LAST = {
      version: VERSION,
      recovered: Boolean(result.pr111ReviewCandidateBridge && result.pr111ReviewCandidateBridge.recovered || result.patch38ReviewCandidateBridge && result.patch38ReviewCandidateBridge.applied),
      clearedStaleApproval: true,
      selectedCandidateId: result.selectedCandidateId || result.patch38Diagnostics && result.patch38Diagnostics.selectedCandidateId || '',
      label: label || 'clear',
      at: new Date().toISOString()
    };
    return true;
  }

  function remedy(event) {
    var result = event && event.detail && event.detail.result || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    if (!result || pr106Vetoed(result)) return false;
    if (text(result.selectedOutput)) return clearStaleApprovalForReview(result, event && event.type);
    var ranked = find(result);
    if (!ranked) {
      window.__TD613_HUSH_PR111_LAST = { version: VERSION, recovered: false, reason: 'no-review-eligible-candidate', mergedCandidateCount: candidates(result).length, at: new Date().toISOString(), eventType: event && event.type || 'manual' };
      return false;
    }
    return promote(result, ranked, event && event.type);
  }

  function inspect() {
    var result = window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    return {
      version: VERSION,
      pr106Vetoed: pr106Vetoed(result),
      selectedOutputPresent: Boolean(text(result && result.selectedOutput)),
      candidateCount: candidates(result).length,
      eligibleCount: candidates(result).filter(function (candidate) { return eligible(candidate, result); }).length,
      best: find(result),
      last: window.__TD613_HUSH_PR111_LAST || null
    };
  }

  function clearRemoteCache() {
    if (window.__TD613_HUSH_PATCH38__ && typeof window.__TD613_HUSH_PATCH38__.clearRemoteCache === 'function') {
      window.__TD613_HUSH_PATCH38__.clearRemoteCache();
    }
    window.__TD613_HUSH_PR111_LAST = { version: VERSION, clearedRemoteCache: true, at: new Date().toISOString() };
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr111ReviewCandidateBridge === VERSION) return;
    document.body.dataset.pr111ReviewCandidateBridge = VERSION;
    window.addEventListener('td613:hush:patch38-result', remedy);
    window.addEventListener('td613:hush:patch38-approval', remedy);
    window.TD613_HUSH_PR111 = { version: VERSION, remedy: remedy, inspect: inspect, find: find, clearRemoteCache: clearRemoteCache };
    [0, 80, 220, 520].forEach(function (delay) { window.setTimeout(function () { remedy({ type: 'boot-sweep', detail: { result: window.__TD613_HUSH_PATCH38_LAST_RESULT || null } }); }, delay); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
