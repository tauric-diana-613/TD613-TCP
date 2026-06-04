(function () {
  'use strict';

  var VERSION = 'pr153-strict-direct-watchdog/v1';
  var STRICT_TIMEOUT_MS = 15000;

  function rawUrl(input) {
    return typeof input === 'string' ? input : input && input.url ? input.url : '';
  }

  function rewriteUrl(input) {
    var raw = rawUrl(input);
    if (!raw || !/\/api\/hush-generate-strict(?:-pr124)?(?:[?#]|$)/.test(raw)) return null;
    return raw.replace('/api/hush-generate-strict-pr124', '/api/hush-generate-strict');
  }

  function setStatus(message, tone) {
    var status = document.getElementById('hushGeneratorStatus') || document.getElementById('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
  }

  function timeoutError(url) {
    var error = new Error('Strict provider client watchdog timed out before the page could freeze.');
    error.name = 'AbortError';
    error.td613StrictWatchdog = true;
    error.td613StrictUrl = url;
    return error;
  }

  function install() {
    if (window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION === VERSION) return false;
    var originalFetch = window.fetch;
    if (typeof originalFetch !== 'function') return false;
    window.fetch = function (input, init) {
      var originalUrl = rawUrl(input);
      var rewritten = rewriteUrl(input);
      var target = rewritten || originalUrl;
      if (!rewritten) return originalFetch.call(this, input, init);

      window.__TD613_HUSH_PR132_LAST = {
        version: VERSION,
        from: originalUrl,
        to: rewritten,
        timeoutMs: STRICT_TIMEOUT_MS,
        at: new Date().toISOString()
      };
      setStatus('Strict provider transform: calling direct provider lane with watchdog…', 'info');

      var fetchPromise;
      try {
        if (typeof input === 'string') fetchPromise = originalFetch.call(this, target, init);
        else {
          var request = new Request(input, init);
          var next = new Request(target, request);
          fetchPromise = originalFetch.call(this, next);
        }
      } catch (error) {
        fetchPromise = originalFetch.call(this, target, init);
      }

      return Promise.race([
        fetchPromise,
        new Promise(function (_, reject) {
          window.setTimeout(function () {
            window.__TD613_HUSH_PR132_TIMEOUT = {
              version: VERSION,
              url: target,
              at: new Date().toISOString(),
              note: 'Client-side watchdog released the UI from a long strict provider call.'
            };
            reject(timeoutError(target));
          }, STRICT_TIMEOUT_MS);
        })
      ]);
    };
    window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION = VERSION;
    return true;
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    document.body.dataset.pr132StrictEndpointRouter = VERSION;
    install();
    window.TD613_HUSH_PR132 = { version: VERSION, install: install, rewriteUrl: rewriteUrl, timeoutMs: STRICT_TIMEOUT_MS };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());