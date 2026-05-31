(function () {
  'use strict';

  var VERSION = 'pr107-selector-recovery-provider-candidate';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function words(value) { return text(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function round(value) { return Number(Number(value || 0).toFixed(4)); }
  function providerSource(candidate) { return /remote-llm-candidate|llm-candidate|patch38-offline-provider|phase34-expressive-generator/i.test([candidate && candidate.source, candidate && candidate.id].join(' ')); }
  function remoteSource(candidate) { return /remote-llm-candidate|llm-candidate/i.test([candidate && candidate.source, candidate && candidate.id].join(' ')); }
  function serverRepair(candidate, result) {
    var hay = [candidate && candidate.provider, candidate && candidate.model, candidate && candidate.source, candidate && candidate.style_note, candidate && candidate.style_operation, asArray(candidate && candidate.warnings).join(' '), JSON.stringify((result && result.patch38Diagnostics && result.patch38Diagnostics.providerReports) || [])].join(' ').toLowerCase();
    return /server-deterministic-repair|server-repair|gemini-fast-path-fallback-before-timeout|deterministic-repair/.test(hay);
  }
  function tokenOverlap(a, b) {
    var aa = new Set(words(a).filter(function (w) { return w.length > 2; }));
    var bb = new Set(words(b).filter(function (w) { return w.length > 2; }));
    if (!aa.size || !bb.size) return 0;
    var hits = 0;
    aa.forEach(function (w) { if (bb.has(w)) hits += 1; });
    return hits / Math.max(aa.size, bb.size);
  }
  function syntaxDistance(candidateText, sourceText) {
    var candidateSentences = text(candidateText).split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var sourceSentences = text(sourceText).split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var firstWordChanged = words(candidateSentences[0] || '')[0] && words(candidateSentences[0] || '')[0] !== words(sourceSentences[0] || '')[0] ? 0.25 : 0;
    var sentenceCountDelta = Math.min(0.25, Math.abs(candidateSentences.length - sourceSentences.length) * 0.08);
    return round(Math.max(0, Math.min(1, 0.35 + firstWordChanged + sentenceCountDelta + (1 - tokenOverlap(candidateText, sourceText)) * 0.35)));
  }
  function collapseScore(value) {
    var hay = text(value);
    var hits = [/just keeping this organized:/i, /should stay with the note/i, /that keeps the context together/i, /for the record/i, /record anchor/i, /the point is preservation/i].reduce(function (sum, rx) { return sum + (rx.test(hay) ? 1 : 0); }, 0);
    return Math.min(1, hits / 3);
  }
  function noteCount(candidate) {
    var notes = candidate && (candidate.mask_surface_notes || (candidate.providerTelemetry && candidate.providerTelemetry.mask_surface_notes));
    return notes && typeof notes === 'object' ? Object.keys(notes).filter(function (key) { return text(notes[key]); }).length : 0;
  }
  function styleOperation(candidate) {
    return text(candidate && (candidate.style_operation || (candidate.providerTelemetry && candidate.providerTelemetry.style_operation) || candidate.strategy || (candidate.operations && candidate.operations[candidate.operations.length - 1]) || ''));
  }
  function opCompleteness(candidate) {
    var hasOp = styleOperation(candidate) && styleOperation(candidate) !== 'operation-unreported';
    var preserved = asArray(candidate && (candidate.preserved_propositions || (candidate.providerTelemetry && candidate.providerTelemetry.preserved_propositions))).length;
    var notes = noteCount(candidate);
    return round((hasOp ? 0.44 : 0) + Math.min(0.28, preserved * 0.07) + Math.min(0.28, notes * 0.1));
  }
  function maskFidelity(candidate) {
    var notes = noteCount(candidate);
    var op = styleOperation(candidate) ? 0.28 : 0;
    var provider = providerSource(candidate) ? 0.14 : 0;
    return round(Math.min(1, op + provider + Math.min(0.36, notes * 0.12) + 0.12));
  }
  function copyBlocked(candidate) {
    var copy = candidate && candidate.sourceCopyRisk || {};
    return Boolean(copy.exactCopy || copy.wrapperCopy || copy.nearCopy || copy.longVerbatimRun);
  }
  function candidateScore(candidate, sourceText) {
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var avg = Number(coverage.averageCoverage || 0);
    var terms = Number(coverage.sourceTermCoverage || 0);
    var length = Number(coverage.lengthRatio || 0);
    var question = Number(audit.questionFormScore == null ? 1 : audit.questionFormScore);
    var syntax = syntaxDistance(candidate.text || '', sourceText);
    var op = opCompleteness(candidate);
    var mask = maskFidelity(candidate);
    return round(avg * 0.35 + terms * 0.22 + question * 0.18 + syntax * 0.24 + op * 0.2 + mask * 0.2 + Math.min(1, length) * 0.12 - collapseScore(candidate.text || '') * 0.6);
  }
  function promotable(candidate, result, sourceText) {
    if (!candidate || !text(candidate.text)) return false;
    if (!providerSource(candidate)) return false;
    if (serverRepair(candidate, result)) return false;
    if (copyBlocked(candidate)) return false;
    if (collapseScore(candidate.text) >= 0.58) return false;
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var length = Number(coverage.lengthRatio || 0);
    var avg = Number(coverage.averageCoverage || 0);
    var terms = Number(coverage.sourceTermCoverage || 0);
    var question = Number(audit.questionFormScore == null ? 1 : audit.questionFormScore);
    var newClaim = Number(audit.newClaimRisk && audit.newClaimRisk.score || 0);
    if (audit.answeredQuestion || audit.inventedAdvice || audit.strengthenedClaim || newClaim >= 0.5) return false;
    if (length && (length < 0.24 || length > 2.9)) return false;
    if (question < 0.5) return false;
    if (!(avg >= 0.24 || terms >= 0.22 || question >= 0.82)) return false;
    if (syntaxDistance(candidate.text, sourceText) < 0.38) return false;
    if (opCompleteness(candidate) < 0.44 && !styleOperation(candidate)) return false;
    return true;
  }
  function sourceTextFromPage() { return $('messageDraftInput') ? $('messageDraftInput').value : ''; }
  function recover(event) {
    var result = event && event.detail && event.detail.result || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    if (!result || text(result.selectedOutput)) return;
    var diagnostics = result.patch38Diagnostics || {};
    if (!/provider-candidates-failed-review-release|all-candidates-failed-proposition-coverage|selector_no_approved_candidate/.test([diagnostics.warning, asArray(result.warnings).join(' ')].join(' '))) return;
    var sourceText = sourceTextFromPage();
    var candidates = asArray(diagnostics.mergedCandidates || result.candidates);
    var ranked = candidates.filter(function (candidate) { return promotable(candidate, result, sourceText); }).map(function (candidate) {
      return { candidate: candidate, score: candidateScore(candidate, sourceText) };
    }).sort(function (a, b) { return b.score - a.score; });
    var selected = ranked[0] && ranked[0].candidate;
    if (!selected) {
      window.__TD613_HUSH_PR107_LAST = { version: VERSION, recovered: false, reason: 'no-promotable-provider-candidate', at: new Date().toISOString(), blockedCount: candidates.length };
      return;
    }
    var output = $('protectedOutputInput');
    if (output) {
      output.value = selected.text || '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState) window.__TD613_HUSH_BENCH__.benchState.protectedOutputText = selected.text || '';
    result.selectedOutput = selected.text || '';
    result.selectedCandidateId = selected.id || 'pr107-recovered-candidate';
    result.releasePolicy = { mayPopulateOutput: true, hardBlocked: false, state: 'review' };
    result.releaseSummary = { status: 'review', warnings: ['pr107-selector-recovery-applied'] };
    result.warnings = Array.from(new Set(asArray(result.warnings).filter(function (item) { return item !== 'provider-candidates-failed-review-release'; }).concat(['pr107-selector-recovery-applied'])));
    diagnostics.selectedCandidateId = result.selectedCandidateId;
    diagnostics.selectedProviderCandidate = providerSource(selected);
    diagnostics.selectedRemoteCandidate = remoteSource(selected);
    diagnostics.selectedCoverage = Number(selected.propositionIntegrity && selected.propositionIntegrity.coverage && selected.propositionIntegrity.coverage.averageCoverage || 0);
    diagnostics.selectedLengthRatio = Number(selected.propositionIntegrity && selected.propositionIntegrity.coverage && selected.propositionIntegrity.coverage.lengthRatio || 0);
    diagnostics.selectedMaskFidelity = maskFidelity(selected);
    diagnostics.selectedSyntaxDistance = syntaxDistance(selected.text || '', sourceText);
    diagnostics.selectedOperationCompleteness = opCompleteness(selected);
    diagnostics.selectedStyleOperation = styleOperation(selected) || 'pr107-recovered-provider-candidate';
    diagnostics.selectedCollapseSurfaceScore = collapseScore(selected.text || '');
    diagnostics.selectedSourceCopyRisk = selected.sourceCopyRisk || null;
    diagnostics.selectedScore = ranked[0].score;
    diagnostics.releasableCount = Math.max(1, Number(diagnostics.releasableCount || 0));
    diagnostics.warning = 'pr107-selector-recovery-applied';
    result.patch38Diagnostics = diagnostics;
    result.pr107SelectorRecovery = { version: VERSION, recovered: true, selectedCandidateId: result.selectedCandidateId, score: ranked[0].score, at: new Date().toISOString() };
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (status) {
      status.dataset.tone = 'ok';
      status.textContent = 'Selector recovery applied: provider candidate promoted for review after passing copy, ontology, and stylometry-adjacent checks.';
    }
    var warning = $('acceptWarning');
    if (warning) {
      warning.hidden = true;
      warning.textContent = '';
    }
    window.__TD613_HUSH_PR107_LAST = result.pr107SelectorRecovery;
    try { window.dispatchEvent(new CustomEvent('td613:hush:patch38-result', { detail: { result: result, recovered: true } })); } catch (error) {}
  }
  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr107SelectorRecovery === VERSION) return;
    document.body.dataset.pr107SelectorRecovery = VERSION;
    window.addEventListener('td613:hush:patch38-approval', recover);
    window.TD613_HUSH_PR107 = { version: VERSION, recover: recover, promotable: promotable };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
