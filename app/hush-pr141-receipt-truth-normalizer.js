(function () {
  'use strict';

  var VERSION = 'pr141-receipt-truth-normalizer/v3-preserve-upstream-retry-diagnostics';
  var TRUE_REASON = 'strict_anti_compression_held';
  var DIAGNOSTIC_KEYS = [
    'upstreamProvider',
    'upstreamModel',
    'upstreamProviderVersion',
    'upstreamRotationVersion',
    'upstreamAttemptCount',
    'upstreamAttemptStages',
    'upstreamAttemptModels',
    'upstreamTimedOutCount',
    'remoteRepairRetry',
    'hardPacketRemoteRepairRetry',
    'quotaAwareRepairRetry',
    'quotaBlockedModels',
    'quotaRows',
    'fullModelSweep',
    'stageCount',
    'attemptLimit',
    'configuredModelCount',
    'envConfiguredModelCount',
    'modelOrder',
    'upstreamElapsedMs'
  ];

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function uniq(values) { return Array.from(new Set(asArray(values).map(text).filter(Boolean))); }
  function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }

  function providerModel(value) {
    var s = text(value);
    return /^gemini-/i.test(s) || /^models\/gemini-/i.test(s);
  }

  function hasAntiCompressionHold(receipt) {
    var warnings = asArray(receipt && receipt.warnings).join(' ');
    var hay = [warnings, receipt && receipt.message, receipt && receipt.nextStep, receipt && receipt.providerQuota && receipt.providerQuota.messagePreview, receipt && receipt.quotaDiagnosticReason].map(text).join(' ');
    return /strict[_-]anti[_-]compression[_-]held|server-deterministic-repair-used|no-server-repair|server-repair|anti-compression/i.test(hay);
  }

  function needsNormalization(receipt) {
    if (!receipt || receipt.status !== 'held') return false;
    if (!hasAntiCompressionHold(receipt)) return false;
    return /quota/i.test(text(receipt.reason))
      || Number(receipt.httpStatus || 0) === 429
      || Boolean(receipt.providerError)
      || Number(receipt.retryAfterSeconds || 0) > 0
      || text(receipt.model) === text(receipt.providerQuota && receipt.providerQuota.model);
  }

  function normalizeProviderQuota(providerQuota) {
    if (!providerQuota || typeof providerQuota !== 'object') return providerQuota;
    var attempted = uniq(providerQuota.attemptedModels).filter(providerModel);
    var quotaModels = uniq(providerQuota.quotaModels).filter(providerModel);
    if (providerQuota.model && providerModel(providerQuota.model) && quotaModels.indexOf(providerQuota.model) < 0) quotaModels.push(providerQuota.model);
    return {
      ...providerQuota,
      quotaScope: quotaModels.length > 1 && attempted.length > 1 && attempted.every(function (model) { return quotaModels.indexOf(model) >= 0; }) ? 'provider' : 'model-diagnostic',
      attemptedModels: attempted,
      quotaModels: quotaModels,
      diagnosticOnly: true,
      normalizedBy: VERSION
    };
  }

  function pickDiagnostics(receipt) {
    var requestReceipt = receipt && receipt.requestReceipt && typeof receipt.requestReceipt === 'object' ? receipt.requestReceipt : {};
    var diagnostic = {};
    DIAGNOSTIC_KEYS.forEach(function (key) {
      var value = hasValue(receipt && receipt[key]) ? receipt[key] : requestReceipt[key];
      if (hasValue(value)) diagnostic[key] = value;
    });
    return diagnostic;
  }

  function normalizeReceipt(receipt) {
    if (!needsNormalization(receipt)) return receipt;
    var quota = normalizeProviderQuota(receipt.providerQuota || {});
    var diagnostic = receipt.providerError || null;
    var upstream = pickDiagnostics(receipt);
    return {
      ...receipt,
      ...upstream,
      status: 'held',
      reason: TRUE_REASON,
      quotaDiagnosticReason: /quota/i.test(text(receipt.reason)) ? receipt.reason : (receipt.quotaDiagnosticReason || ''),
      provider: receipt.provider || 'gemini-strict',
      model: 'strict-anti-compression-review',
      httpStatus: 504,
      retryAfterSeconds: null,
      message: 'Output held. Strict anti-compression review found no acceptable remote candidate; server-repair fallback was suppressed, so no weak fallback could be released.',
      nextStep: 'Inspect the receipt, revise source or mask pressure, then Transform again. Any embedded quota entry is diagnostic only unless all configured provider models show quota failure.',
      fallbackReleased: false,
      outputReleased: false,
      providerQuota: quota,
      providerError: null,
      providerQuotaDiagnosticError: diagnostic,
      requestReceipt: {
        ...(receipt.requestReceipt || {}),
        ...upstream,
        truthNormalizedBy: VERSION
      },
      warnings: uniq(asArray(receipt.warnings).concat([TRUE_REASON, 'quota-diagnostic-not-headline', 'quota-status-demoted-from-top-level', 'upstream-retry-diagnostics-preserved'])),
      truthNormalizedBy: VERSION
    };
  }

  function renderPopup(receipt) {
    var popup = $('hushReceiptPopup');
    if (!popup) return false;
    var pre = popup.querySelector && popup.querySelector('pre');
    if (pre) pre.textContent = JSON.stringify(receipt, null, 2);
    var title = popup.querySelector && popup.querySelector('.hush-receipt-pop-title');
    if (title) title.textContent = 'Strict anti-compression receipt';
    return true;
  }

  function normalize(label) {
    var current = window.__TD613_HUSH_NO_FALLBACK_RECEIPT || window.__TD613_HUSH_PR123_LAST || null;
    if (!needsNormalization(current)) return false;
    var receipt = normalizeReceipt(current);
    window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;
    window.__TD613_HUSH_PR123_LAST = receipt;

    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (status) {
      status.dataset.tone = 'error';
      status.textContent = receipt.message + ' Receipt ready.';
    }
    var warning = $('acceptWarning');
    if (warning) {
      warning.hidden = false;
      warning.textContent = receipt.message;
    }
    renderPopup(receipt);
    window.__TD613_HUSH_PR141_LAST = {
      version: VERSION,
      normalized: true,
      reason: TRUE_REASON,
      previousReason: current.reason,
      previousHttpStatus: current.httpStatus,
      previousModel: current.model,
      preservedDiagnosticKeys: Object.keys(pickDiagnostics(receipt)),
      label: label || 'normalize',
      popupRendered: Boolean($('hushReceiptPopup')),
      at: new Date().toISOString()
    };
    return true;
  }

  function schedule(label) {
    [0, 50, 150, 350, 700, 1200].forEach(function (delay) {
      window.setTimeout(function () { normalize(label); }, delay);
    });
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr141ReceiptTruthNormalizer === VERSION) return;
    document.body.dataset.pr141ReceiptTruthNormalizer = VERSION;
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn')) schedule('transform-click');
    }, true);
    if (window.MutationObserver) {
      var target = document.body;
      new MutationObserver(function () { normalize('dom-mutation'); }).observe(target, { childList: true, subtree: true, characterData: true });
    }
    window.TD613_HUSH_PR141 = { version: VERSION, normalize: normalize, normalizeReceipt: normalizeReceipt, pickDiagnostics: pickDiagnostics };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
