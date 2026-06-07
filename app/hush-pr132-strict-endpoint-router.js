(function () {
  'use strict';

  var VERSION = 'pr164-strict-watchdog-lifecycle-fix/v1';
  var SHORT_TIMEOUT_MS = 12000;
  var MEDIUM_TIMEOUT_MS = 18000;
  var LONG_TIMEOUT_MS = 29000;

  function rawUrl(input) {
    return typeof input === 'string' ? input : input && input.url ? input.url : '';
  }

  function rewriteUrl(input) {
    var raw = rawUrl(input);
    if (!raw || !/\/api\/hush-generate-strict(?:-pr124)?(?:[?#]|$)/.test(raw)) return null;
    try {
      var url = new URL(raw, window.location.origin);
      url.pathname = '/api/hush-generate-strict';
      return raw.charAt(0) === '/' ? url.pathname + url.search + url.hash : url.href;
    } catch (error) {
      return raw.replace(/\/api\/hush-generate-strict-pr124(?=[$?#]|$)/, '/api/hush-generate-strict').replace('/api/hush-generate-strict-pr124', '/api/hush-generate-strict');
    }
  }

  function wordCount(value) {
    return String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)?.length || 0;
  }

  function requestComplexity(init) {
    try {
      var payload = JSON.parse(String(init && init.body || '{}'));
      var contract = payload.contract || payload || {};
      var source = contract.sourceText || contract.messageDraftText || '';
      var words = wordCount(source);
      var packetTier = contract.packetTier || contract.flightPacket?.packet_tier || '';
      var maskEvidenceState = contract.maskEvidenceState || contract.flightPacket?.mask_evidence?.maskEvidenceState || '';
      var candidateCount = Number(contract.candidateCount || contract.flightPacket?.flight_controls?.candidate_count || 0);
      var hard = words > 220 || candidateCount >= 4 || /chat_cadence|theory|long|rich/i.test(packetTier + ' ' + maskEvidenceState);
      var medium = words > 90 || candidateCount >= 3;
      return { words: words, packetTier: packetTier, maskEvidenceState: maskEvidenceState, candidateCount: candidateCount, hard: hard, medium: medium };
    } catch (error) {
      return { words: 0, packetTier: '', maskEvidenceState: '', candidateCount: 0, hard: false, medium: false };
    }
  }

  function timeoutFor(init) {
    var complexity = requestComplexity(init || {});
    return { timeoutMs: complexity.hard ? LONG_TIMEOUT_MS : complexity.medium ? MEDIUM_TIMEOUT_MS : SHORT_TIMEOUT_MS, complexity: complexity };
  }

  function setStatus(message, tone) {
    var nextTone = tone || 'info';
    var status = document.getElementById('hushGeneratorStatus') || document.getElementById('hushOutputStatusText');
    if (!status) return;
    if (status.textContent === message && status.dataset.tone === nextTone) return;
    if (setStatus._pendingMessage === message && setStatus._pendingTone === nextTone) return;

    setStatus._pendingMessage = message;
    setStatus._pendingTone = nextTone;
    (window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 0); })(function () {
      var liveStatus = document.getElementById('hushGeneratorStatus') || document.getElementById('hushOutputStatusText');
      if (!liveStatus) return;
      if (liveStatus.textContent === message && liveStatus.dataset.tone === nextTone) return;
      liveStatus.dataset.tone = nextTone;
      liveStatus.textContent = message;
    });
  }

  function syntheticHeldResponse(url, startedAt, meta, note) {
    var body = {
      ok: false,
      provider: 'gemini-strict',
      model: 'client-watchdog',
      strict: true,
      noFallback: true,
      error: 'strict_client_watchdog_timeout',
      candidates: [],
      warnings: ['strict-client-watchdog-timeout', 'ui-released-before-page-freeze', meta.complexity && meta.complexity.hard ? 'difficult-transform-watchdog-limit' : 'retry-with-shorter-source-or-lighter-mask'],
      message: 'Strict provider call was stopped by the extended adaptive client watchdog before the page could freeze.',
      triedEndpoints: [url + ':client-watchdog'],
      requestReceipt: {
        strict: true,
        noFallback: true,
        providerVersion: VERSION,
        endpointMetaVersion: 'pr158-extended-adaptive-client-watchdog/v1',
        elapsedMs: Date.now() - startedAt,
        clientWatchdog: true,
        clientWatchdogMs: meta.timeoutMs,
        originalEndpoint: meta.originalUrl || '',
        directEndpoint: url,
        rewrittenFromLegacyPr124: /hush-generate-strict-pr124/.test(meta.originalUrl || ''),
        requestComplexity: meta.complexity || {},
        note: note || 'Extended adaptive watchdog returned a held receipt instead of allowing another endpoint loop.'
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

  function getBaseFetch() {
    var currentFetch = window.fetch;
    if (currentFetch && currentFetch.__td613HushPr132BaseFetch) return currentFetch.__td613HushPr132BaseFetch;
    if (window.__TD613_HUSH_PR132_BASE_FETCH) return window.__TD613_HUSH_PR132_BASE_FETCH;
    if (typeof currentFetch !== 'function') return null;
    window.__TD613_HUSH_PR132_BASE_FETCH = currentFetch;
    return currentFetch;
  }

  function install() {
    var baseFetch = getBaseFetch();
    if (typeof baseFetch !== 'function') return false;
    if (window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION === VERSION && window.fetch && window.fetch.__td613HushPr132RouterVersion === VERSION) return false;

    function strictEndpointRouterFetch(input, init) {
      var originalUrl = rawUrl(input);
      var rewritten = rewriteUrl(input);
      var target = rewritten || originalUrl;
      if (!rewritten) return baseFetch.call(this, input, init);

      var startedAt = Date.now();
      var watch = timeoutFor(init || {});
      var controller = new AbortController();
      var nextInit = Object.assign({}, init || {}, { signal: mergeSignals(init || {}, controller) });
      var settled = false;
      var timedOut = false;
      var heartbeat = null;
      var timeoutId = null;
      var meta = { version: VERSION, originalUrl: originalUrl, timeoutMs: watch.timeoutMs, complexity: watch.complexity };

      function clearTimers() {
        if (heartbeat) window.clearInterval(heartbeat);
        if (timeoutId) window.clearTimeout(timeoutId);
        heartbeat = null;
        timeoutId = null;
      }

      window.__TD613_HUSH_PR132_LAST = { version: VERSION, from: originalUrl, to: rewritten, timeoutMs: watch.timeoutMs, complexity: watch.complexity, at: new Date().toISOString() };
      setStatus(watch.complexity.hard ? 'Strict provider transform: difficult packet, direct lane has extended watchdog…' : 'Strict provider transform: calling direct provider lane with extended watchdog…', 'info');
      heartbeat = window.setInterval(function () {
        if (settled) return;
        var elapsed = Date.now() - startedAt;
        setStatus('Strict provider transform still working… ' + Math.round(elapsed / 1000) + 's / ' + Math.round(watch.timeoutMs / 1000) + 's watchdog', 'info');
      }, 4200);

      var fetchPromise;
      try {
        if (typeof input === 'string') fetchPromise = baseFetch.call(this, target, nextInit);
        else {
          var request = new Request(input, nextInit);
          var next = new Request(target, request);
          fetchPromise = baseFetch.call(this, next);
        }
      } catch (error) {
        fetchPromise = baseFetch.call(this, target, nextInit);
      }

      fetchPromise = fetchPromise.then(function (response) {
        settled = true;
        clearTimers();
        return response;
      }).catch(function (error) {
        settled = true;
        clearTimers();
        if (error && error.name === 'AbortError' && timedOut) {
          return syntheticHeldResponse(target, startedAt, meta, 'Underlying strict fetch aborted by extended adaptive client watchdog.');
        }
        throw error;
      });

      var timeoutPromise = new Promise(function (resolve) {
        timeoutId = window.setTimeout(function () {
          if (settled) return;
          settled = true;
          timedOut = true;
          window.__TD613_HUSH_PR132_TIMEOUT = { version: VERSION, url: target, originalUrl: originalUrl, timeoutMs: watch.timeoutMs, complexity: watch.complexity, at: new Date().toISOString(), note: 'Extended adaptive watchdog returned a held response and aborted the long strict provider call.' };
          try { controller.abort(); } catch (error) {}
          clearTimers();
          setStatus('Strict provider transform held by extended watchdog; receipt ready instead of page freeze.', 'error');
          resolve(syntheticHeldResponse(target, startedAt, meta));
        }, watch.timeoutMs);
      });

      return Promise.race([fetchPromise, timeoutPromise]);
    }

    strictEndpointRouterFetch.__td613HushPr132BaseFetch = baseFetch;
    strictEndpointRouterFetch.__td613HushPr132RouterVersion = VERSION;
    window.__TD613_HUSH_PR132_BASE_FETCH = baseFetch;
    window.fetch = strictEndpointRouterFetch;
    window.__TD613_HUSH_PR132_FETCH_ROUTER_VERSION = VERSION;
    return true;
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    document.body.dataset.pr132StrictEndpointRouter = VERSION;
    install();
    window.TD613_HUSH_PR132 = { version: VERSION, install: install, rewriteUrl: rewriteUrl, timeoutFor: timeoutFor, timeouts: { short: SHORT_TIMEOUT_MS, medium: MEDIUM_TIMEOUT_MS, long: LONG_TIMEOUT_MS } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
