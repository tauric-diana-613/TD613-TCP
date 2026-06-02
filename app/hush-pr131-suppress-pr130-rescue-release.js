(function () {
  'use strict';

  var VERSION = 'pr131-suppress-pr130-rescue-release/v1';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function isPr130RescueMessage(value) {
    return /Remote\s+.*output\s+released\s+.*PR130/i.test(text(value));
  }

  function suppress(label) {
    var warning = $('acceptWarning');
    if (!warning || !isPr130RescueMessage(warning.textContent)) return false;

    var output = $('protectedOutputInput');
    if (output) {
      output.value = '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }

    warning.hidden = false;
    warning.textContent = 'Output held: PR130 found a rescue candidate after selector rejection, but auto-release is suppressed. Review the receipt and edit source or mask before Transforming again.';

    var receipt = window.__TD613_HUSH_NO_FALLBACK_RECEIPT || {};
    receipt.status = 'held';
    receipt.reason = 'pr130_rescue_release_suppressed';
    receipt.message = 'PR130 found a rescue candidate after selector rejection, but release was suppressed so weak fallback-style output cannot be treated as success.';
    receipt.fallbackReleased = false;
    receipt.pr130AutoReleaseSuppressed = true;
    window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;

    var result = window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    if (result) {
      result.selectedOutput = '';
      result.selectedCandidateId = '';
      result.patch38Diagnostics = result.patch38Diagnostics || {};
      result.patch38Diagnostics.pr130AutoReleaseSuppressed = true;
      result.patch38Diagnostics.pr130SuppressedBy = VERSION;
      window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
    }

    window.__TD613_HUSH_PR131_LAST = {
      version: VERSION,
      suppressed: true,
      label: label || 'observer',
      at: new Date().toISOString()
    };
    return true;
  }

  function schedule(label) {
    [0, 40, 120, 260, 520].forEach(function (delay) {
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
    window.TD613_HUSH_PR131 = { version: VERSION, suppress: suppress };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());