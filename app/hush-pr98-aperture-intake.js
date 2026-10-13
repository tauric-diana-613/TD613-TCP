(function () {
  'use strict';

  var VERSION = 'pr98.5-aperture-bridge-events';
  var STORAGE_KEY = 'td613:aperture:hush-packet';
  var LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';
  var fetchPatched = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }
  function parseJson(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function numeric(value) { var parsed = Number(String(value == null ? '' : value).replace(/[^0-9.-]/g, '')); return Number.isFinite(parsed) ? parsed : 0; }
  function unique(values) { return Array.from(new Set((values || []).filter(Boolean))); }
  function emit(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); }
    catch (error) { window.__TD613_HUSH_APERTURE_EVENT_ERROR = String(error && error.message || error); }
  }

  function readPacket() {
    var memory = window.__TD613_HUSH_APERTURE_HANDOFF || null;
    if (memory && memory.target === 'hush') return memory;
    var packet = null;
    try { packet = parseJson(localStorage.getItem(STORAGE_KEY)) || parseJson(localStorage.getItem(LEGACY_KEY)); }
    catch (error) { window.__TD613_HUSH_APERTURE_INTAKE_ERROR = String(error && error.message || error); }
    if (!packet || packet.source !== 'td613-aperture' || packet.target !== 'hush') return null;
    window.__TD613_HUSH_APERTURE_HANDOFF = packet;
    return packet;
  }

  function setValue(id, value) {
    var node = $(id);
    if (!node || value == null) return false;
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function routeProfile(packet) {
    var metrics = packet && packet.aperture_metrics || {};
    var trace = packet && packet.source_trace || {};
    var state = clean(metrics.route_state || packet.route_intent || '').toLowerCase();
    var labels = [];
    var sigma = numeric(metrics.sigma_r);
    var detector = numeric(metrics.detector_confidence);
    var harbor = numeric(metrics.harbor_eligibility);
    if (sigma >= 0.66 || /rupture|harbor/.test(state)) labels.push('route_pressure');
    if (detector >= 0.55) labels.push('compression_review');
    if (harbor >= 0.72) labels.push('operator_close');
    if (asArray(trace.occlusion_markers).length > asArray(trace.trace_fragments).length) labels.push('boundary_review');
    if (!labels.length) labels.push('ordinary_review');
    return { labels: unique(labels), route_state: metrics.route_state || '', route_intent: packet.route_intent || 'hush-mask-review', close_required: labels.indexOf('operator_close') >= 0 || labels.indexOf('boundary_review') >= 0, scores: { sigma_r: sigma, detector_confidence: detector, harbor_eligibility: harbor } };
  }

  function repairOps(profile) {
    var table = { route_pressure: ['route_visibility'], compression_review: ['relation_restore'], boundary_review: ['boundary_reassert'], operator_close: ['operator_close'], ordinary_review: ['mask_fidelity_review'] };
    return unique((profile.labels || []).flatMap(function (label) { return table[label] || []; }));
  }

  function compactApertureBridge(packet) {
    if (!packet) return null;
    var metrics = packet.aperture_metrics || {};
    var trace = packet.source_trace || {};
    var profile = routeProfile(packet);
    return {
      bridge_version: VERSION,
      packet_version: packet.packet_version || 'aperture-hush-handoff/v1',
      created_at: packet.created_at || '',
      route_intent: packet.route_intent || 'hush-mask-review',
      source_context: packet.approval_transparency && packet.approval_transparency.source_context || 'aperture_v2_3_1_tcp_hook',
      aperture_metrics: { route_state: metrics.route_state || '', routing_recommendation: metrics.routing_recommendation || '', harbor_eligibility: metrics.harbor_eligibility || '', sigma_r: metrics.sigma_r || '', detector_confidence: metrics.detector_confidence || '', dominant_loss: metrics.aperture_state && metrics.aperture_state.dominant_loss || '' },
      route_profile: profile,
      repair_controls: { aperture_bridge_active: true, aperture_route_labels: profile.labels, aperture_repair_operations: repairOps(profile), operator_close_required: profile.close_required, fallback_requires_visible_provenance: true, repair_before_fallback: true },
      trace_summary: { recognition_mark_present: Boolean(trace.recognition_mark), observed_provenance: trace.observed_provenance || '', trace_fragment_count: asArray(trace.trace_fragments).length, occlusion_marker_count: asArray(trace.occlusion_markers).length, temporal_trace_present: Boolean(trace.temporal_trace && Object.values(trace.temporal_trace).some(Boolean)) },
      generator_directives: ['Use Aperture as route context, not as mask voice.', 'Repair before fallback.', 'Keep mask and stylometry as the transformation surface.'],
      privacy_boundary: packet.privacy_boundary || { sends_private_ledger: false, sends_mask_memory: false, sends_persona_memory: false, sends_safe_harbor_packet: false, sends_aperture_countertool_trace: true }
    };
  }

  function ensureStatus(packet) {
    var host = $('hushGeneratorStatus') || $('hushGateStrip') || $('messageDraftInput');
    if (!host) return;
    var panel = $('hushApertureIntakePanel');
    if (!panel) { panel = document.createElement('div'); panel.id = 'hushApertureIntakePanel'; panel.className = 'hush-warning-panel hush-aperture-intake-panel'; if (host.insertAdjacentElement) host.insertAdjacentElement('afterend', panel); }
    var bridge = compactApertureBridge(packet);
    panel.innerHTML = '<strong>Aperture → Hush intake active</strong><span>Route: <code>' + bridge.route_intent + '</code></span><span>Aperture state: <code>' + (bridge.aperture_metrics.route_state || '—') + '</code></span><span>Route labels: <code>' + bridge.route_profile.labels.join(', ') + '</code></span><span>Repair ops: <code>' + bridge.repair_controls.aperture_repair_operations.join(', ') + '</code></span>';
  }

  function applyPacket(packet) {
    if (!packet) return false;
    var input = $('messageDraftInput');
    var sourceText = clean(packet.source_text || '');
    if (input && sourceText && !clean(input.value)) setValue('messageDraftInput', sourceText);
    var baseline = $('protectedBaselineInput');
    if (baseline && packet.source_trace && !clean(baseline.value)) { baseline.value = JSON.stringify(packet.source_trace, null, 2); baseline.dispatchEvent(new Event('input', { bubbles: true })); }
    ensureStatus(packet);
    document.body.dataset.hushApertureIntake = 'true';
    emit('td613:hush:aperture-packet-applied', { packet: packet, bridge: compactApertureBridge(packet), version: VERSION });
    return true;
  }

  function loadDrawer() {
    if (document.querySelector('script[data-pr99-route-assist="true"]')) return;
    var script = document.createElement('script');
    script.src = './hush-pr99-rupture-assist-drawer.js?v=202605281855';
    script.dataset.pr99RouteAssist = 'true';
    document.head.appendChild(script);
  }

  function patchFetch() {
    if (fetchPatched || typeof window.fetch !== 'function') return;
    fetchPatched = true;
    var originalFetch = window.fetch.bind(window);
    window.fetch = function (resource, init) {
      var url = typeof resource === 'string' ? resource : resource && resource.url || '';
      var body = init && typeof init.body === 'string' ? init.body : '';
      if (/hush-generate/i.test(url) && body) {
        var packet = readPacket();
        var bridge = compactApertureBridge(packet);
        var parsed = parseJson(body);
        if (bridge && parsed && parsed.contract) {
          parsed.contract.apertureHandoff = bridge;
          parsed.contract.flightPacket = parsed.contract.flightPacket || {};
          parsed.contract.flightPacket.aperture_bridge = bridge;
          parsed.contract.flightPacket.repair_controls = Object.assign({}, parsed.contract.flightPacket.repair_controls || {}, bridge.repair_controls);
          parsed.contract.flightPacket.flight_controls = Object.assign({}, parsed.contract.flightPacket.flight_controls || {}, bridge.repair_controls);
          init = Object.assign({}, init, { body: JSON.stringify(parsed) });
          window.__TD613_HUSH_APERTURE_LAST_REMOTE_CONTRACT = parsed.contract;
          emit('td613:hush:aperture-contract-injected', { contract: parsed.contract, bridge: bridge, packet: packet, version: VERSION });
        }
      }
      return originalFetch(resource, init).then(function (response) {
        if (/hush-generate/i.test(url)) emit('td613:hush:remote-response-observed', { status: response.status, ok: response.ok, version: VERSION });
        return response;
      });
    };
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr98ApertureIntake === 'true') return;
    document.body.dataset.pr98ApertureIntake = 'true';
    patchFetch();
    loadDrawer();
    var packet = readPacket();
    if (packet) applyPacket(packet);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 600);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 1400);
    window.TD613_HUSH_PR98 = { version: VERSION, storageKey: STORAGE_KEY, readPacket: readPacket, applyPacket: applyPacket, compactApertureBridge: compactApertureBridge };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
}());
