// app/hush-pr168-strict-transform-run-lock.js
(function () {
  'use strict';

  var VERSION = 'pr168-strict-transform-run-lock/v5-single-bridge-owner';
  var EXACT_ASSET_VERSION = '202606171650';
  var STATUS_PLATE_VERSION = '202606171720';

  function byId(id) {
    return document.getElementById(id);
  }

  function appendScriptOnce(id, src, type) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    if (type) script.type = type;
    script.src = src;
    (document.body || document.head || document.documentElement).appendChild(script);
  }

  function ensureExactArtifactScripts() {
    if (!document.body && !document.head) return false;
    appendScriptOnce('hushGeneratorStatusPlateLoader', './hush-generator-status-plate.js?v=' + STATUS_PLATE_VERSION, 'module');
    appendScriptOnce('hushPr123ExactCaptureLoader', './hush-pr123-exact-capture.js?v=' + EXACT_ASSET_VERSION, 'module');
    appendScriptOnce('hushCustodyExportWakeExactLoader', './hush-custody-export-wake.js?v=' + EXACT_ASSET_VERSION, 'module');
    return true;
  }

  function ensureStatusPlate(message, tone) {
    if (window.__TD613_HUSH_GENERATOR_STATUS_PLATE__ && typeof window.__TD613_HUSH_GENERATOR_STATUS_PLATE__.set === 'function') {
      return window.__TD613_HUSH_GENERATOR_STATUS_PLATE__.set(message || 'Strict provider bridge ready.', tone || 'info');
    }
    var plate = byId('hushGeneratorStatus') || byId('hushStrictProviderStatus');
    var gate = byId('hushGateStrip');
    if (!plate) {
      plate = document.createElement('div');
      plate.id = 'hushGeneratorStatus';
      plate.className = 'hush-warning-panel hush-generator-status hush-transmission-plate';
      plate.setAttribute('aria-live', 'polite');
      if (gate && gate.insertAdjacentElement) gate.insertAdjacentElement('beforebegin', plate);
    }
    if (plate) {
      plate.style.display = 'block';
      plate.textContent = message || plate.textContent || 'Strict provider bridge ready.';
      plate.dataset.tone = tone || 'info';
    }
    return plate;
  }

  function setStatus(message, tone) {
    var status = ensureStatusPlate(message, tone);
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
  }

  function setBusy(value) {
    var button = byId('generateMaskedOutputBtn');
    if (button) {
      button.disabled = Boolean(value);
      button.dataset.strictTransformRunning = value ? 'true' : 'false';
    }
    if (document.body) {
      document.body.dataset.strictTransformRunning = value ? 'true' : 'false';
    }
  }

  function heldReceiptExists() {
    var receipt = window.__TD613_HUSH_NO_FALLBACK_RECEIPT || window.__TD613_HUSH_PR123_LAST || null;
    return Boolean(receipt && (receipt.status === 'held' || receipt.fallbackReleased === false || receipt.reason));
  }

  function releaseRunLock(reason) {
    window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = false;
    setBusy(false);
    if (document.body) document.body.dataset.strictTransformLockRelease = reason || 'manual';
    return true;
  }

  function recoverHeldReceiptLock(reason) {
    var button = byId('generateMaskedOutputBtn');
    var bodyRunning = document.body && document.body.dataset.strictTransformRunning === 'true';
    var buttonRunning = button && button.dataset.strictTransformRunning === 'true';
    if (!heldReceiptExists()) return false;
    if (window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING || bodyRunning || buttonRunning || (button && button.disabled)) {
      return releaseRunLock(reason || 'held-receipt-recovery');
    }
    return false;
  }

  function installRecoveryListeners() {
    if (!document.body || document.body.dataset.pr168RecoveryListeners === VERSION) return;
    document.body.dataset.pr168RecoveryListeners = VERSION;
    ['messageDraftInput', 'maskFieldSelect', 'maskReferenceInput', 'protectedBaselineInput', 'hushBuiltInTabBtn', 'hushCustomizeTabBtn'].forEach(function (id) {
      var node = byId(id);
      if (!node) return;
      var type = node.tagName === 'SELECT' ? 'change' : 'input';
      if (/Btn$/.test(id)) type = 'click';
      node.addEventListener(type, function () {
        window.setTimeout(function () { recoverHeldReceiptLock('input-or-mask-change'); }, 0);
        window.setTimeout(function () { window.__TD613_HUSH_CUSTODY_EXPORT_WAKE__?.updateButtons?.(); }, 80);
        window.setTimeout(function () { ensureStatusPlate(); }, 120);
      }, true);
    });
  }

  function installIdleRecovery() {
    window.setTimeout(function () { recoverHeldReceiptLock('post-boot-idle'); ensureStatusPlate(); }, 1200);
    window.setTimeout(function () { recoverHeldReceiptLock('post-boot-idle-late'); ensureStatusPlate(); }, 3200);
  }

  function install() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;

    ensureExactArtifactScripts();
    ensureStatusPlate();
    installRecoveryListeners();
    installIdleRecovery();

    var api = window.TD613_HUSH_PR123;
    if (!api || typeof api.run !== 'function') return;

    if (!api.__td613Pr168BaseRun || !/exact-artifacts/.test(String(api.version || ''))) api.__td613Pr168BaseRun = api.run;
    if (api.__td613Pr168Version === VERSION) return;

    var baseRun = api.__td613Pr168BaseRun;

    api.run = function lockedStrictTransformRun() {
      var runThis = this;
      var runArgs = arguments;

      if (window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING) {
        if (recoverHeldReceiptLock('pre-run-held-receipt')) {
          return api.__td613Pr168BaseRun.apply(runThis, runArgs);
        }
        var maybeEvent = runArgs[0];
        if (maybeEvent && typeof maybeEvent.preventDefault === 'function') maybeEvent.preventDefault();
        if (maybeEvent && typeof maybeEvent.stopPropagation === 'function') maybeEvent.stopPropagation();
        if (maybeEvent && typeof maybeEvent.stopImmediatePropagation === 'function') maybeEvent.stopImmediatePropagation();
        setStatus('Strict provider transform already running… waiting for the active watchdog.', 'info');
        return Promise.resolve(null);
      }

      window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = true;
      setBusy(true);
      setStatus('Remote provider request preparing… strict packet route is active.', 'info');

      return Promise.resolve()
        .then(function () {
          return baseRun.apply(runThis, runArgs);
        })
        .finally(function () {
          releaseRunLock('run-finally');
          window.setTimeout(function () { recoverHeldReceiptLock('post-finally-held-receipt'); }, 80);
          window.setTimeout(function () { window.__TD613_HUSH_CUSTODY_EXPORT_WAKE__?.updateButtons?.(); }, 140);
          window.setTimeout(function () { ensureStatusPlate(); }, 160);
        });
    };

    api.__td613Pr168Version = VERSION;
    window.TD613_HUSH_PR168_RUN_LOCK = {
      version: VERSION,
      installedAt: new Date().toISOString(),
      exactAssetVersion: EXACT_ASSET_VERSION,
      statusPlateVersion: STATUS_PLATE_VERSION,
      release: releaseRunLock,
      recoverHeldReceiptLock: recoverHeldReceiptLock,
      ensureExactArtifactScripts: ensureExactArtifactScripts,
      ensureStatusPlate: ensureStatusPlate
    };
    window.__TD613_HUSH_PR168_RELEASE_RUN_LOCK = releaseRunLock;
  }

  function boot() {
    ensureExactArtifactScripts();
    ensureStatusPlate();
    install();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.setTimeout(boot, 2500);
}());
