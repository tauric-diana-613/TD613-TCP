// app/hush-pr123-strict-undefined-fallback.js
(function () {
  'use strict';

  var VERSION = 'pr123-strict-transform-bridge/v1-provider-only';
  var PATCH38_MODULE = './hush-patch38.js?v=202606162059';
  var patch38Promise = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message, tone) {
    var status = byId('hushGeneratorStatus') || byId('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
  }

  function loadPatch38() {
    if (!patch38Promise) {
      patch38Promise = import(PATCH38_MODULE).then(function (mod) {
        if (mod && typeof mod.initHushPatch38 === 'function') mod.initHushPatch38(document);
        return mod || {};
      });
    }
    return patch38Promise;
  }

  function run(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    if (event && typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

    setStatus('Strict provider transform starting…', 'info');
    return loadPatch38().then(function (mod) {
      if (mod && typeof mod.runPatch38Transform === 'function') return mod.runPatch38Transform(document);
      if (window.__TD613_HUSH_PATCH38__ && typeof window.__TD613_HUSH_PATCH38__.runPatch38Transform === 'function') {
        return window.__TD613_HUSH_PATCH38__.runPatch38Transform(document);
      }
      setStatus('Strict provider transform unavailable: Patch38 did not load.', 'error');
      return null;
    }).catch(function (error) {
      setStatus('Strict provider transform failed to start: ' + String(error && error.message || error), 'error');
      window.__TD613_HUSH_PR123_LAST_ERROR = String(error && error.stack || error);
      return null;
    });
  }

  function bind() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    var button = byId('generateMaskedOutputBtn');
    if (!button || button.dataset.pr123StrictBridge === VERSION) return;
    button.dataset.pr123StrictBridge = VERSION;
    button.addEventListener('click', run, true);
  }

  window.TD613_HUSH_PR123 = window.TD613_HUSH_PR123 || {};
  window.TD613_HUSH_PR123.version = VERSION;
  window.TD613_HUSH_PR123.run = run;
  window.TD613_HUSH_PR123.loadPatch38 = loadPatch38;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  window.setTimeout(bind, 240);
  window.setTimeout(bind, 720);
  window.setTimeout(bind, 1400);
}());
