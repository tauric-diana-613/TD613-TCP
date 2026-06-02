(function () {
  'use strict';

  var VERSION = 'pr132-strict-endpoint-router/v1';

  function rewriteUrl(input) {
    var raw = typeof input === 'string' ? input : input && input.url ? input.url : '';
    if (!raw || !/\/api\/hush-generate-strict(?:[?#]|$)/.test(raw)) return null;
    if (/\/api\/hush-generate-strict-pr124(?:[?#]|$)/.test(raw)) return null;
    return raw.replace('/api/hush-generate-strict', '/api/hush-generate-strict-pr124');
  }

  function install() {
    if (window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION === VERSION) return false;
    var originalFetch = window.fetch;
    if (typeof originalFetch !== 'function') return false;
    window.fetch = function (input, init) {
      var rewritten = rewriteUrl(input);
      if (rewritten) {
        window.__TD613_HUSH_PR132_LAST = {
          version: VERSION,
          from: typeof input === 'string' ? input : input && input.url ? input.url : '',
          to: rewritten,
          at: new Date().toISOString()
        };
        if (typeof input === 'string') return originalFetch.call(this, rewritten, init);
        try {
          var request = new Request(input, init);
          var next = new Request(rewritten, request);
          return originalFetch.call(this, next);
        } catch (error) {
          return originalFetch.call(this, rewritten, init);
        }
      }
      return originalFetch.call(this, input, init);
    };
    window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION = VERSION;
    return true;
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    document.body.dataset.pr132StrictEndpointRouter = VERSION;
    install();
    window.TD613_HUSH_PR132 = { version: VERSION, install: install, rewriteUrl: rewriteUrl };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());