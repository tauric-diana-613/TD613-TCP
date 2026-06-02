(function () {
  'use strict';

  var VERSION = 'pr131-suppress-pr130-rescue-release/v2-selector-hold-failure-mode';
  var FAILURE_REASON = 'selector_hold_rescue_suppressed';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }

  function isPr130RescueMessage(value) {
    var message = text(value);
    return /Remote\s+.*output\s+released\s+.*PR130/i.test(message)
      || /PR130\s+found\s+a\s+rescue\s+candidate/i.test(message)
      || /rescue\s+candidate\s+after\s+selector\s+rejection/i.test(message);
  }

  function diagnosticsFromResult(result) {
    var d = result && result.patch38Diagnostics || {};
    return {
      version: d.version || '',
      packetTier: d.packetTier || '',
      strictRemoteOnly: Boolean(d.strictRemoteOnly),
      remoteCandidateCount: Number(d.remoteCandidateCount || 0),
      releasableCount: Number(d.releasableCount || 0),
      blockedCount: Number(d.blockedCount || 0),
      blockedCopyCount: Number(d.blockedCopyCount || 0),
      warning: d.warning || '',
      pr130AutoReleaseSuppressed: true,
      pr130SuppressedBy: VERSION,
      pr130SuppressedCandidateId: d.pr130SuppressedCandidateId || d.pr130SelectedCandidateId || d.selectedCandidateId || '',
      blockedRows: asArray(d.blockedRows).slice(0, 6),
      selectorRows: asArray(d.selectorRows).slice(0, 5)
    };
  }

  function buildFailureReceipt(existing, result) {
    var diagnostics = diagnosticsFromResult(result);
    return {
      ...existing,
      version: existing.version || 'pr123-stable-transform-8-pr140-quota-diagnostics',
      status: 'held',
      reason: FAILURE_REASON,
      message: 'Output held. Remote candidates returned, but none passed selector review. A PR130 rescue candidate was detected and suppressed so weak fallback-style output could not slip through as success.',
      fallbackReleased: false,
      outputReleased: false,
      debugPacketAvailable: true,
      suppressedRescueCandidate: true,
      suppressedBy: VERSION,
      nextAction: 'retry_with_revised_source_or_mask_or_inspect_receipt',
      pr130AutoReleaseSuppressed: true,
      selectorDiagnostics: {
        ...(existing.selectorDiagnostics || {}),
        ...diagnostics,
        failureMode: FAILURE_REASON
      }
    };
  }

  function suppress(label) {
    var warning = $('acceptWarning');
    if (!warning || !isPr130RescueMessage(warning.textContent)) return false;

    var result = window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    var receipt = buildFailureReceipt(window.__TD613_HUSH_NO_FALLBACK_RECEIPT || {}, result);

    var output = $('protectedOutputInput');
    if (output) {
      output.value = '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }

    warning.hidden = false;
    warning.textContent = 'Output held: remote candidates returned, but none passed selector review. A PR130 rescue candidate was suppressed so weak fallback-style output could not be treated as success. Receipt ready.';

    window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;

    if (result) {
      result.selectedOutput = '';
      result.selectedCandidateId = '';
      result.releasePolicy = { mayPopulateOutput: false, hardBlocked: true, state: 'held' };
      result.releaseSummary = { status: 'held', warnings: [FAILURE_REASON] };
      result.warnings = [...new Set(asArray(result.warnings).concat([FAILURE_REASON]))];
      result.patch38Diagnostics = result.patch38Diagnostics || {};
      result.patch38Diagnostics.failureMode = FAILURE_REASON;
      result.patch38Diagnostics.pr130AutoReleaseSuppressed = true;
      result.patch38Diagnostics.pr130SuppressedBy = VERSION;
      result.patch38Diagnostics.outputReleased = false;
      window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
    }

    window.__TD613_HUSH_PR131_LAST = {
      version: VERSION,
      suppressed: true,
      reason: FAILURE_REASON,
      label: label || 'observer',
      at: new Date().toISOString()
    };
    return true;
  }

  function schedule(label) {
    [0, 40, 120, 260, 520, 900].forEach(function (delay) {
      window.setTimeout(function () { suppress(label); }, delay);
    });
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr131SuppressPr130RescueRelease === VERSION) return;
    document.body.dataset.pr131SuppressPr130RescueRelease = VERSION;
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn')) schedule('transform-click');
    }, true);
    if (window.MutationObserver) {
      var warning = $('acceptWarning');
      if (warning) {
        new MutationObserver(function () { suppress('warning-mutation'); }).observe(warning, { childList: true, characterData: true, subtree: true });
      }
    }
    window.TD613_HUSH_PR131 = { version: VERSION, suppress: suppress, failureReason: FAILURE_REASON };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());