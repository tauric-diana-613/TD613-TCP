(function () {
  'use strict';

  var VERSION = 'pr110-recovered-output-rehydrator';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }

  function hasRecovery(result) {
    var hay = [
      asArray(result && result.warnings).join(' '),
      asArray(result && result.releaseSummary && result.releaseSummary.warnings).join(' '),
      JSON.stringify(result && result.pr107SelectorRecovery || {}),
      JSON.stringify(result && result.pr108LiveStateRecovery || {})
    ].join(' ');
    return /pr107-selector-recovery-applied|pr108-live-state-recovery-applied|"recovered":true/.test(hay);
  }

  function vetoed(result) {
    var hay = [
      asArray(result && result.warnings).join(' '),
      asArray(result && result.releaseSummary && result.releaseSummary.warnings).join(' '),
      JSON.stringify(result && result.pr106ReleaseGuard || {})
    ].join(' ');
    return /pr106-stylometry-ontology-release-blocked|"blocked":true/.test(hay);
  }

  function recoveredText(result) {
    return text(result && result.selectedOutput) || text(result && result.pr107SelectorRecovery && result.pr107SelectorRecovery.selectedOutput) || text(result && result.pr108LiveStateRecovery && result.pr108LiveStateRecovery.selectedOutput);
  }

  function restore(result, label) {
    if (!result || !hasRecovery(result) || vetoed(result)) return false;
    var value = recoveredText(result);
    if (!value) return false;

    var output = $('protectedOutputInput');
    if (output) {
      output.value = value;
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }

    var warning = $('acceptWarning');
    if (warning && /patch38_no_approved_candidate|selector_no_approved_candidate|provider-candidates-failed-review-release|pr107-selector-recovery-applied/.test(warning.textContent || '')) {
      warning.hidden = true;
      warning.textContent = '';
    }

    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (status) {
      status.dataset.tone = 'ok';
      status.textContent = 'Recovered generator candidate restored after stale Patch38 approval gate. Review/edit before Accept.';
    }

    result.releasePolicy = { mayPopulateOutput: true, hardBlocked: false, state: 'review' };
    result.releaseSummary = { status: 'review', warnings: ['pr110-recovered-output-restored'] };
    result.warnings = [...new Set(asArray(result.warnings).filter(function (item) {
      return !/selector_no_approved_candidate|provider-candidates-failed-review-release/.test(item);
    }).concat(['pr110-recovered-output-restored']))];

    if (window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState) {
      window.__TD613_HUSH_BENCH__.benchState.protectedOutputText = value;
      window.__TD613_HUSH_BENCH__.benchState.hushSwapResult = result;
    }
    window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
    window.__TD613_HUSH_PR110_LAST = {
      version: VERSION,
      restored: true,
      label: label || 'restore',
      selectedCandidateId: result.selectedCandidateId || result.patch38Diagnostics?.selectedCandidateId || '',
      at: new Date().toISOString()
    };
    return true;
  }

  function scheduleRestore(event) {
    var result = event && event.detail && event.detail.result || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    [0, 60, 180, 420].forEach(function (delay) {
      window.setTimeout(function () { restore(result || window.__TD613_HUSH_PATCH38_LAST_RESULT, event && event.type); }, delay);
    });
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr110RecoveredOutputRehydrator === VERSION) return;
    document.body.dataset.pr110RecoveredOutputRehydrator = VERSION;
    window.addEventListener('td613:hush:patch38-result', scheduleRestore);
    window.addEventListener('td613:hush:patch38-approval', scheduleRestore);
    window.TD613_HUSH_PR110 = { version: VERSION, restore: restore };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());