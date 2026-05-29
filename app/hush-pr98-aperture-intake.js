(function () {
  'use strict';

  var VERSION = 'pr98.2-aperture-hush-intake-flight-injection';
  var STORAGE_KEY = 'td613:aperture:hush-packet';
  var LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';
  var fetchPatched = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }
  function parseJson(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }

  function readPacket() {
    var memory = window.__TD613_HUSH_APERTURE_HANDOFF || null;
    if (memory && memory.target === 'hush') return memory;
    var packet = null;
    try {
      packet = parseJson(localStorage.getItem(STORAGE_KEY)) || parseJson(localStorage.getItem(LEGACY_KEY));
    } catch (error) {
      window.__TD613_HUSH_APERTURE_INTAKE_ERROR = String(error && error.message || error);
    }
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

  function compactApertureBridge(packet) {
    if (!packet) return null;
    var metrics = packet.aperture_metrics || {};
    var trace = packet.source_trace || {};
    return {
      bridge_version: VERSION,
      packet_version: packet.packet_version || 'aperture-hush-handoff/v1',
      created_at: packet.created_at || '',
      route_intent: packet.route_intent || 'hush-mask-review',
      source_context: packet.approval_transparency && packet.approval_transparency.source_context || 'aperture_v2_3_1_tcp_hook',
      aperture_metrics: {
        route_state: metrics.route_state || '',
        routing_recommendation: metrics.routing_recommendation || '',
        harbor_eligibility: metrics.harbor_eligibility || '',
        sigma_r: metrics.sigma_r || '',
        detector_confidence: metrics.detector_confidence || '',
        dominant_loss: metrics.aperture_state && metrics.aperture_state.dominant_loss || ''
      },
      trace_summary: {
        recognition_mark_present: Boolean(trace.recognition_mark),
        observed_provenance: trace.observed_provenance || '',
        trace_fragment_count: asArray(trace.trace_fragments).length,
        occlusion_marker_count: asArray(trace.occlusion_markers).length,
        temporal_trace_present: Boolean(trace.temporal_trace && Object.values(trace.temporal_trace).some(Boolean))
      },
      generator_directives: [
        'Treat Aperture as counter-tool audit context, not as a mask voice.',
        'Use Aperture route_state and routing_recommendation to tune caution, not to enforce silence.',
        'Preserve the source_text propositions while using Hush masks/stylometry for transformation.',
        'Do not leak private ledger, mask memory, or Safe Harbor packet contents.'
      ],
      privacy_boundary: packet.privacy_boundary || {
        sends_private_ledger: false,
        sends_mask_memory: false,
        sends_persona_memory: false,
        sends_safe_harbor_packet: false,
        sends_aperture_countertool_trace: true
      }
    };
  }

  function ensureStatus(packet) {
    var host = $('hushGeneratorStatus') || $('hushGateStrip') || $('messageDraftInput');
    if (!host) return;
    var panel = $('hushApertureIntakePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'hushApertureIntakePanel';
      panel.className = 'hush-warning-panel hush-aperture-intake-panel';
      if (host.insertAdjacentElement) host.insertAdjacentElement('afterend', panel);
    }
    var route = packet.route_intent || 'hush-mask-review';
    var state = packet.aperture_metrics && packet.aperture_metrics.route_state || '—';
    panel.innerHTML = '<strong>Aperture → Hush intake active</strong><span>Route: <code>' + route + '</code></span><span>Aperture state: <code>' + state + '</code></span><span>Packet: <code>' + (packet.packet_version || 'aperture-hush-handoff/v1') + '</code></span><span>Flight injection: <code>on</code></span>';
  }

  function applyPacket(packet) {
    if (!packet) return false;
    var input = $('messageDraftInput');
    var sourceText = clean(packet.source_text || '');
    if (input && sourceText && !clean(input.value)) setValue('messageDraftInput', sourceText);
    var baseline = $('protectedBaselineInput');
    if (baseline && packet.source_trace && !clean(baseline.value)) {
      baseline.value = JSON.stringify(packet.source_trace, null, 2);
      baseline.dispatchEvent(new Event('input', { bubbles: true }));
    }
    ensureStatus(packet);
    document.body.dataset.hushApertureIntake = 'true';
    return true;
  }

  function bodyString(init) {
    if (!init || typeof init.body !== 'string') return '';
    return init.body;
  }

  function patchFetch() {
    if (fetchPatched || typeof window.fetch !== 'function') return;
    fetchPatched = true;
    var originalFetch = window.fetch.bind(window);
    window.fetch = function (resource, init) {
      var url = typeof resource === 'string' ? resource : (resource && resource.url) || '';
      var body = bodyString(init);
      if (/hush-generate/i.test(url) && body) {
        var packet = readPacket();
        var bridge = compactApertureBridge(packet);
        if (bridge) {
          var parsed = parseJson(body);
          if (parsed && parsed.contract) {
            parsed.contract.apertureHandoff = bridge;
            parsed.contract.flightPacket = parsed.contract.flightPacket || {};
            parsed.contract.flightPacket.aperture_bridge = bridge;
            parsed.contract.flightPacket.flight_controls = parsed.contract.flightPacket.flight_controls || {};
            parsed.contract.flightPacket.flight_controls.aperture_bridge_active = true;
            parsed.contract.flightPacket.flight_controls.aperture_route_intent = bridge.route_intent;
            init = Object.assign({}, init, { body: JSON.stringify(parsed) });
            window.__TD613_HUSH_APERTURE_LAST_REMOTE_CONTRACT = parsed.contract;
          }
        }
      }
      return originalFetch(resource, init);
    };
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr98ApertureIntake === 'true') return;
    document.body.dataset.pr98ApertureIntake = 'true';
    patchFetch();
    var packet = readPacket();
    if (packet) applyPacket(packet);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 600);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 1400);
    window.TD613_HUSH_PR98 = { version: VERSION, storageKey: STORAGE_KEY, readPacket: readPacket, applyPacket: applyPacket, compactApertureBridge: compactApertureBridge };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());