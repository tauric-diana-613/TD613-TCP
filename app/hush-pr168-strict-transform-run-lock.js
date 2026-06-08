// app/hush-pr168-strict-transform-run-lock.js
(function () {
  'use strict';

  var VERSION = 'pr168-strict-transform-run-lock/v1';

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message, tone) {
    var status = byId('hushGeneratorStatus') || byId('hushOutputStatusText');
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

  function install() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;

    var api = window.TD613_HUSH_PR123;
    if (!api || typeof api.run !== 'function') return;

    if (!api.__td613Pr168BaseRun) api.__td613Pr168BaseRun = api.run;
    if (api.__td613Pr168Version === VERSION) return;

    var baseRun = api.__td613Pr168BaseRun;

    api.run = function lockedStrictTransformRun() {
      var runThis = this;
      var runArgs = arguments;

      if (window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING) {
        var maybeEvent = runArgs[0];
        if (maybeEvent && typeof maybeEvent.preventDefault === 'function') maybeEvent.preventDefault();
        if (maybeEvent && typeof maybeEvent.stopPropagation === 'function') maybeEvent.stopPropagation();
        if (maybeEvent && typeof maybeEvent.stopImmediatePropagation === 'function') maybeEvent.stopImmediatePropagation();
        setStatus('Strict provider transform already running… waiting for the active 29s watchdog.', 'info');
        return Promise.resolve(null);
      }

      window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = true;
      setBusy(true);

      return Promise.resolve()
        .then(function () {
          return baseRun.apply(runThis, runArgs);
        })
        .finally(function () {
          window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = false;
          setBusy(false);
        });
    };

    api.__td613Pr168Version = VERSION;
    window.TD613_HUSH_PR168_RUN_LOCK = {
      version: VERSION,
      installedAt: new Date().toISOString()
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  window.setTimeout(install, 250);
  window.setTimeout(install, 1000);
  window.setTimeout(install, 2500);
}());
