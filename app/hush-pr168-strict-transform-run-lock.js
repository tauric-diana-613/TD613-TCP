// app/hush-pr168-strict-transform-run-lock.js
(function () {
  'use strict';

  var VERSION = 'pr179-strict-transform-click-gate/v1';

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

  function stopEvent(event) {
    if (!event) return;
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }

  function installButtonGate(api, baseRun) {
    if (!document.body || document.body.dataset.pr179StrictTransformClickGate === VERSION) return;
    document.body.dataset.pr179StrictTransformClickGate = VERSION;
    document.addEventListener('click', function strictTransformClickGate(event) {
      var target = event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn');
      if (!target) return;
      stopEvent(event);
      if (window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING) {
        setStatus('Strict provider transform already running… waiting for the active watchdog.', 'info');
        return;
      }
      window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = true;
      setBusy(true);
      Promise.resolve()
        .then(function () {
          return baseRun.call(api, event);
        })
        .finally(function () {
          window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING = false;
          setBusy(false);
        });
    }, true);
  }

  function install() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;

    var api = window.TD613_HUSH_PR123;
    if (!api || typeof api.run !== 'function') return;

    if (!api.__td613Pr168BaseRun) api.__td613Pr168BaseRun = api.run;
    var baseRun = api.__td613Pr168BaseRun;

    installButtonGate(api, baseRun);

    if (api.__td613Pr168Version === VERSION) return;

    api.run = function lockedStrictTransformRun() {
      var runThis = this;
      var runArgs = arguments;

      if (window.__TD613_HUSH_STRICT_TRANSFORM_RUNNING) {
        var maybeEvent = runArgs[0];
        stopEvent(maybeEvent);
        setStatus('Strict provider transform already running… waiting for the active watchdog.', 'info');
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
      clickGate: true,
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
