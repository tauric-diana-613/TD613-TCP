(function () {
  'use strict';

  var VERSION = 'pr155-strict-watchdog-held-response/v1';
  var STRICT_TIMEOUT_MS = 11000;

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

  function syntheticHeldResponse(url, startedAt, note) {
    var body = {
      ok: false,
      provider: 'gemini-strict',
      model: 'client-watchdog',
      strict: true,
      noFallback: true,
      error: 'strict_client_watchdog_timeout',
      candidates: [],
      warnings: ['strict-client-watchdog-timeout', 'ui-released-before-page-freeze', 'retry-with-shorter-source-or-lighter-mask'],
      message: 'Strict provider call was stopped by the client watchdog before the page could freeze.',
      triedEndpoints: [url + ':client-watchdog'],
      requestReceipt: {
        strict: true,
        noFallback: true,
        providerVersion: VERSION,
        endpointMetaVersion: 'pr155-client-watchdog-held-response/v1',
        elapsedMs: Date.now() - startedAt,
        clientWatchdog: true,
        clientWatchdogMs: STRICT_TIMEOUT_MS,
        note: note || 'Client-side watchdog returned a held receipt instead of allowing another endpoint loop.'
      }
    };
    return new Response(JSON.stringify(body), { status: 504, headers: { 'content-type': 'application/json' } });
  }

  function mergeSignals(init, controller) {
    var prior = init && init.signal;
    if (prior && typeof prior.addEventListener === 'function') {
      if (prior.aborted) controller.abort();
      else prior.addEventListener('abort', function () { controller.abort(); }, { once: true });
    }
    return controller.signal;
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

      var startedAt = Date.now();
      var controller = new AbortController();
      var nextInit = Object.assign({}, init || {}, { signal: mergeSignals(init || {}, controller) });
      var settled = false;

      window.__TD613_HUSH_PR132_LAST = { version: VERSION, from: originalUrl, to: rewritten, timeoutMs: STRICT_TIMEOUT_MS, at: new Date().toISOString() };
      setStatus('Strict provider transform: calling direct provider lane with page watchdog…', 'info');

      var fetchPromise;
      try {
        if (typeof input === 'string') fetchPromise = originalFetch.call(this, target, nextInit);
        else {
          var request = new Request(input, nextInit);
          var next = new Request(target, request);
          fetchPromise = originalFetch.call(this, next);
        }
      } catch (error) {
        fetchPromise = originalFetch.call(this, target, nextInit);
      }

      fetchPromise = fetchPromise.then(function (response) {
        settled = true;
        return response;
      }).catch(function (error) {
        if (error && error.name === 'AbortError' && window.__TD613_HUSH_PR132_TIMEOUT) {
          return syntheticHeldResponse(target, startedAt, 'Underlying strict fetch aborted by client watchdog.');
        }
        throw error;
      });

      var timeoutPromise = new Promise(function (resolve) {
        window.setTimeout(function () {
          if (settled) return;
          window.__TD613_HUSH_PR132_TIMEOUT = { version: VERSION, url: target, at: new Date().toISOString(), note: 'Client-side watchdog returned a held response and aborted the long strict provider call.' };
          try { controller.abort(); } catch (error) {}
          setStatus('Strict provider transform held by watchdog; receipt ready instead of page freeze.', 'error');
          resolve(syntheticHeldResponse(target, startedAt));
        }, STRICT_TIMEOUT_MS);
      });

      return Promise.race([fetchPromise, timeoutPromise]);
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