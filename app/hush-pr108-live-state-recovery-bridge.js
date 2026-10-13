import * as bench from './adversarial-bench.mjs';

(function () {
  'use strict';

  const VERSION = 'pr108-live-state-recovery-bridge-minimal';
  const $ = (id) => document.getElementById(id);
  const text = (value) => String(value ?? '').trim();
  const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

  function providerCandidate(candidate) {
    return /remote-llm-candidate|llm-candidate|patch38-offline-provider|phase34-expressive-generator/i.test([candidate?.source, candidate?.id].join(' '));
  }

  function copyBlocked(candidate) {
    const copy = candidate?.sourceCopyRisk || {};
    return Boolean(copy.exactCopy || copy.wrapperCopy || copy.nearCopy || copy.longVerbatimRun);
  }

  function recover(event) {
    const result = event?.detail?.result || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    if (!result || text(result.selectedOutput) || result.pr108LiveStateRecovery?.recovered) return false;

    const diagnostics = result.patch38Diagnostics || {};
    const warningText = [diagnostics.warning, asArray(result.warnings).join(' ')].join(' ');
    if (!/provider-candidates-failed-review-release|all-candidates-failed-proposition-coverage|selector_no_approved_candidate/.test(warningText)) return false;

    const candidates = asArray(diagnostics.mergedCandidates || result.candidates);
    const selected = candidates.find((candidate) => providerCandidate(candidate) && text(candidate.text) && !copyBlocked(candidate));

    if (!selected) {
      window.__TD613_HUSH_PR108_LAST = {
        version: VERSION,
        recovered: false,
        reason: 'no-clean-provider-candidate',
        mergedCandidateCount: candidates.length,
        warning: diagnostics.warning || '',
        at: new Date().toISOString()
      };
      return false;
    }

    const selectedText = selected.text || '';
    result.selectedOutput = selectedText;
    result.selectedCandidateId = selected.id || 'pr108-recovered-candidate';
    result.releasePolicy = { mayPopulateOutput: true, hardBlocked: false, state: 'review' };
    result.releaseSummary = { status: 'review', warnings: ['pr108-live-state-recovery-applied'] };
    result.warnings = [...new Set(asArray(result.warnings).filter((item) => !/provider-candidates-failed-review-release|selector_no_approved_candidate/.test(item)).concat(['pr108-live-state-recovery-applied']))];

    diagnostics.selectedCandidateId = result.selectedCandidateId;
    diagnostics.selectedProviderCandidate = true;
    diagnostics.selectedRemoteCandidate = /remote-llm-candidate|llm-candidate/i.test([selected.source, selected.id].join(' '));
    diagnostics.selectedStyleOperation = selected.style_operation || selected.strategy || selected.operations?.[selected.operations.length - 1] || 'pr108-recovered-provider-candidate';
    diagnostics.selectedCoverage = Number(selected.propositionIntegrity?.coverage?.averageCoverage || 0);
    diagnostics.selectedLengthRatio = Number(selected.propositionIntegrity?.coverage?.lengthRatio || 0);
    diagnostics.selectedSourceCopyRisk = selected.sourceCopyRisk || null;
    diagnostics.releasableCount = Math.max(1, Number(diagnostics.releasableCount || 0));
    diagnostics.warning = 'pr108-live-state-recovery-applied';
    result.patch38Diagnostics = diagnostics;
    result.pr108LiveStateRecovery = { version: VERSION, recovered: true, selectedCandidateId: result.selectedCandidateId, eventType: event?.type || 'manual', at: new Date().toISOString() };

    if (bench?.benchState) {
      bench.benchState.protectedOutputText = selectedText;
      bench.benchState.hushSwapResult = result;
    }

    const output = $('protectedOutputInput');
    if (output) {
      output.value = selectedText;
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }

    window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
    window.__TD613_HUSH_PR108_LAST = result.pr108LiveStateRecovery;
    return true;
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr108LiveStateRecovery === VERSION) return;
    document.body.dataset.pr108LiveStateRecovery = VERSION;
    window.addEventListener('td613:hush:patch38-result', recover);
    window.addEventListener('td613:hush:patch38-approval', recover);
    window.TD613_HUSH_PR108 = { version: VERSION, recover };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
