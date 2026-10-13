(function () {
  'use strict';

  var VERSION = 'pr131-suppress-pr130-rescue-release/v3-popup-backed-failure-mode';
  var FAILURE_REASON = 'selector_hold_rescue_suppressed';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }

  function isPr130RescueMessage(value) {
    var message = text(value);
    return /Remote\s+.*output\s+released\s+.*PR130/i.test(message)
      || /PR130\s+found\s+a\s+rescue\s+candidate/i.test(message)
      || /rescue\s+candidate\s+after\s+selector\s+rejection/i.test(message)
      || /A\s+PR130\s+rescue\s+candidate\s+was\s+suppressed/i.test(message);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    var t = document.createElement('textarea');
    t.value = value;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
    return Promise.resolve();
  }

  function ensurePopupCss() {
    if ($('hushPr131PopupStyle')) return;
    var s = document.createElement('style');
    s.id = 'hushPr131PopupStyle';
    s.textContent = '.hush-receipt-pop{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;max-height:42vh;border:1px solid rgba(184,255,122,.55);border-radius:18px;background:rgba(4,15,16,.96);box-shadow:0 18px 54px rgba(0,0,0,.48);color:#f6fff6;overflow:hidden}.hush-receipt-pop-head{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.72rem .82rem;border-bottom:1px solid rgba(255,255,255,.10)}.hush-receipt-pop-title{font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:.72rem}.hush-receipt-pop-actions{display:flex;gap:.45rem;flex-wrap:wrap}.hush-receipt-pop-btn{border:1px solid rgba(184,255,122,.58);border-radius:999px;padding:.42rem .68rem;background:rgba(184,255,122,.14);color:#fff;font-weight:850;font-size:.72rem}.hush-receipt-pop-body{max-height:28vh;overflow:auto;-webkit-overflow-scrolling:touch;padding:.78rem .85rem}.hush-receipt-pop-body pre{margin:0;white-space:pre-wrap;font-size:.72rem;line-height:1.35}.hush-receipt-pop-note{padding:.55rem .85rem;border-top:1px solid rgba(255,255,255,.08);font-size:.72rem;color:rgba(245,255,246,.78)}';
    document.head.appendChild(s);
  }

  function renderPopup(receipt) {
    ensurePopupCss();
    var old = $('hushReceiptPopup');
    if (old) old.remove();
    var box = document.createElement('section');
    box.id = 'hushReceiptPopup';
    box.className = 'hush-receipt-pop';
    box.innerHTML = '<div class="hush-receipt-pop-head"><div class="hush-receipt-pop-title">Selector hold receipt</div><div class="hush-receipt-pop-actions"><button id="hushPr131Copy" class="hush-receipt-pop-btn" type="button">Copy</button><button id="hushPr131Full" class="hush-receipt-pop-btn" type="button">Full</button><button id="hushPr131Close" class="hush-receipt-pop-btn" type="button">Close</button></div></div><div class="hush-receipt-pop-body"><pre></pre></div><div class="hush-receipt-pop-note">Failure mode: selector_hold_rescue_suppressed. Full debug stays at window.__TD613_HUSH_FULL_DEBUG_PACKET.</div>';
    box.querySelector('pre').textContent = JSON.stringify(receipt, null, 2);
    document.body.appendChild(box);
    $('hushPr131Copy').onclick = function () { copyText(JSON.stringify(window.__TD613_HUSH_NO_FALLBACK_RECEIPT || receipt || {}, null, 2)); };
    $('hushPr131Full').onclick = function () { copyText(JSON.stringify(window.__TD613_HUSH_FULL_DEBUG_PACKET || window.__TD613_HUSH_NO_FALLBACK_RECEIPT || receipt || {}, null, 2)); };
    $('hushPr131Close').onclick = function () { box.remove(); };
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
      version: existing.version || 'pr123-stable-transform-9-pr140-model-quota-diagnostics',
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

  function setStatus(message) {
    var s = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (s) {
      s.dataset.tone = 'error';
      s.textContent = message;
    }
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

    var uiMessage = 'Output held: remote candidates returned, but none passed selector review. A PR130 rescue candidate was suppressed so weak fallback-style output could not be treated as success. Receipt ready.';
    warning.hidden = false;
    warning.textContent = uiMessage;
    setStatus(uiMessage);

    window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;
    window.__TD613_HUSH_FULL_DEBUG_PACKET = window.__TD613_HUSH_FULL_DEBUG_PACKET || { result: result, receipt: receipt };

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

    renderPopup(receipt);

    window.__TD613_HUSH_PR131_LAST = {
      version: VERSION,
      suppressed: true,
      popupRendered: Boolean($('hushReceiptPopup')),
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
    window.TD613_HUSH_PR131 = { version: VERSION, suppress: suppress, failureReason: FAILURE_REASON, renderPopup: renderPopup };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());