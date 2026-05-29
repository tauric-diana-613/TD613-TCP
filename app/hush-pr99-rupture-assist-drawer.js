(function () {
  'use strict';

  var VERSION = 'pr99.2-event-driven-route-assist-drawer';
  var STORAGE_KEY = 'td613:aperture:hush-packet';
  var LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';
  var lastEvent = null;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }
  function esc(value) { return text(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
  function parseJson(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
  function arr(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function num(value) { var parsed = Number(String(value == null ? '' : value).replace(/[^0-9.-]/g, '')); return Number.isFinite(parsed) ? parsed : 0; }
  function uniq(values) { return Array.from(new Set((values || []).filter(Boolean))); }

  function readPacket() {
    var runtime = window.__TD613_HUSH_APERTURE_HANDOFF || null;
    if (runtime && runtime.target === 'hush') return runtime;
    try {
      var packet = parseJson(localStorage.getItem(STORAGE_KEY)) || parseJson(localStorage.getItem(LEGACY_KEY));
      if (packet && packet.source === 'td613-aperture' && packet.target === 'hush') return packet;
    } catch (error) {
      window.__TD613_HUSH_PR99_ERROR = String(error && error.message || error);
    }
    return null;
  }

  function routeProfile(packet) {
    var metrics = packet && packet.aperture_metrics || {};
    var trace = packet && packet.source_trace || {};
    var state = clean(metrics.route_state || packet.route_intent || '').toLowerCase();
    var labels = [];
    var sigma = num(metrics.sigma_r);
    var detector = num(metrics.detector_confidence);
    var harbor = num(metrics.harbor_eligibility);
    if (sigma >= 0.66 || /rupture|harbor/.test(state)) labels.push('route_pressure');
    if (detector >= 0.55) labels.push('compression_review');
    if (harbor >= 0.72) labels.push('operator_close');
    if (arr(trace.occlusion_markers).length > arr(trace.trace_fragments).length) labels.push('boundary_review');
    if (!labels.length) labels.push('ordinary_review');
    var table = { route_pressure: ['route_visibility'], compression_review: ['relation_restore'], boundary_review: ['boundary_reassert'], operator_close: ['operator_close'], ordinary_review: ['mask_fidelity_review'] };
    return { labels: uniq(labels), repair: uniq(labels.flatMap(function (label) { return table[label] || []; })), closeRequired: labels.indexOf('operator_close') >= 0 || labels.indexOf('boundary_review') >= 0, scores: { sigma: sigma, detector: detector, harbor: harbor } };
  }

  function lastCandidatePassport() {
    var remote = window.__TD613_HUSH_APERTURE_LAST_REMOTE_CONTRACT || null;
    var approval = window.__TD613_HUSH_PATCH38_APPROVAL__ || null;
    var watchdog = window.__TD613_HUSH_GENERATOR_WATCHDOG__ || null;
    var result = window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    return { remote: remote, approval: approval, watchdog: watchdog, result: result };
  }

  function ensureDrawer() {
    var panel = $('hushRuptureAssistDrawer');
    if (panel) return panel;
    var host = $('hushLabDrawer') ? $('hushLabDrawer').querySelector('.hush-drawer-body') : null;
    if (!host) host = $('hushSwapWarningsPanel') || $('hushApertureIntakePanel') || ($('protectedOutputInput') && $('protectedOutputInput').parentElement) || document.body;
    panel = document.createElement('section');
    panel.id = 'hushRuptureAssistDrawer';
    panel.className = 'hush-lab-panel telemetry-panel hush-lab-wide hush-rupture-assist-drawer';
    panel.setAttribute('aria-labelledby', 'hushRuptureAssistHeading');
    panel.innerHTML = '<div class="hush-kicker">Aperture</div><h3 id="hushRuptureAssistHeading">Route Assist</h3><div id="hushRuptureAssistBody" class="persona-memory-summary">No Aperture packet loaded.</div>';
    host.appendChild(panel);
    return panel;
  }

  function selectedRow(result) {
    var diagnostics = result && result.patch38Diagnostics || {};
    var id = diagnostics.selectedCandidateId || result && result.selectedCandidateId || '';
    var rows = arr(diagnostics.selectorRows);
    return rows.find(function (row) { return row.id === id; }) || rows[0] || null;
  }

  function render() {
    var panel = ensureDrawer();
    var body = $('hushRuptureAssistBody');
    if (!panel || !body) return;
    var packet = readPacket();
    if (!packet) {
      body.innerHTML = 'No Aperture packet loaded. Stage from Aperture or open Hush with <code>from=aperture</code>.';
      return;
    }
    var profile = routeProfile(packet);
    var passport = lastCandidatePassport();
    var contractBridge = passport.remote && passport.remote.flightPacket && passport.remote.flightPacket.aperture_bridge;
    var row = selectedRow(passport.result);
    var candidateTier = row ? (row.reviewRelease ? 'reviewable' : 'repair/check') : 'awaiting candidate';
    body.innerHTML = [
      '<div><strong>Bridge</strong> <code>' + esc(packet.packet_version || 'aperture-hush-handoff/v1') + '</code></div>',
      '<div>Route intent: <code>' + esc(packet.route_intent || 'hush-mask-review') + '</code></div>',
      '<div>Route state: <code>' + esc(packet.aperture_metrics && packet.aperture_metrics.route_state || '—') + '</code></div>',
      '<div>Route labels: <code>' + esc(profile.labels.join(', ')) + '</code></div>',
      '<div>Repair path: <code>' + esc(profile.repair.join(', ')) + '</code></div>',
      '<div>Operator close: <code>' + esc(profile.closeRequired ? 'required' : 'not required') + '</code></div>',
      '<div>Scores: <code>Σ ' + esc(profile.scores.sigma) + ' · det ' + esc(profile.scores.detector) + ' · H_E ' + esc(profile.scores.harbor) + '</code></div>',
      contractBridge ? '<div>Remote contract: <code>aperture_bridge injected</code></div>' : '<div>Remote contract: <code>awaiting transform</code></div>',
      row ? '<div>Candidate: <code>' + esc(row.id || 'selected') + ' · ' + esc(row.operation || 'op?') + ' · ' + esc(candidateTier) + '</code></div>' : '',
      row ? '<div>Candidate metrics: <code>score ' + esc(row.score) + ' · mask ' + esc(row.maskFidelity) + ' · syntax ' + esc(row.syntaxDistance) + ' · coverage ' + esc(row.coverage) + '</code></div>' : '',
      passport.approval ? '<div>Last approval: <code>' + esc(passport.approval.approvalStatus || 'pending') + '</code></div>' : '',
      passport.watchdog ? '<div>Watchdog: <code>' + esc(passport.watchdog.status || 'observed') + '</code></div>' : '',
      lastEvent ? '<div>Last event: <code>' + esc(lastEvent) + '</code></div>' : ''
    ].filter(Boolean).join('');
  }

  function installStyle() {
    if ($('hushPr99RuptureAssistStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr99RuptureAssistStyle';
    style.textContent = '.hush-rupture-assist-drawer code{white-space:normal!important;overflow-wrap:anywhere!important}.hush-rupture-assist-drawer .persona-memory-summary{display:grid!important;gap:.35rem!important}';
    document.head.appendChild(style);
  }

  function scheduleRender(label, delay) {
    lastEvent = label || lastEvent;
    window.setTimeout(render, delay == null ? 40 : delay);
  }

  function bindEvents() {
    ['td613:hush:aperture-packet-applied','td613:hush:aperture-contract-injected','td613:hush:remote-response-observed','td613:hush:patch38-result','td613:hush:patch38-approval'].forEach(function (name) {
      window.addEventListener(name, function () { scheduleRender(name.replace('td613:hush:', ''), 40); });
    });
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr99RuptureAssist === 'true') return;
    document.body.dataset.pr99RuptureAssist = 'true';
    installStyle();
    bindEvents();
    render();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#analyzeOutputBtn,#generateMaskedOutputBtn,#openHushReviewBtn')) scheduleRender('button-click', 500);
    }, true);
    [800, 1800, 3500, 6500, 12000].forEach(function (delay) { window.setTimeout(render, delay); });
    window.TD613_HUSH_PR99 = { version: VERSION, render: render, readPacket: readPacket, routeProfile: routeProfile };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
