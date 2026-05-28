(function () {
  'use strict';

  var VERSION = 'pr98.1-aperture-hush-intake';
  var STORAGE_KEY = 'td613:aperture:hush-packet';
  var LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }
  function parseJson(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }

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

  function ensureStatus(packet) {
    var host = $('hushGeneratorStatus') || $('hushGateStrip') || $('messageDraftInput');
    if (!host) return;
    var panel = $('hushApertureIntakePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'hushApertureIntakePanel';
      panel.className = 'hush-warning-panel hush-aperture-intake-panel';
      if (host.insertAdjacentElement) host.insertAdjacentElement(host.id === 'messageDraftInput' ? 'afterend' : 'afterend', panel);
    }
    var route = packet.route_intent || 'hush-mask-review';
    var state = packet.aperture_metrics && packet.aperture_metrics.route_state || '—';
    panel.innerHTML = '<strong>Aperture → Hush intake active</strong><span>Route: <code>' + route + '</code></span><span>Aperture state: <code>' + state + '</code></span><span>Packet: <code>' + (packet.packet_version || 'aperture-hush-handoff/v1') + '</code></span>';
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

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr98ApertureIntake === 'true') return;
    document.body.dataset.pr98ApertureIntake = 'true';
    var packet = readPacket();
    if (packet) applyPacket(packet);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 600);
    window.setTimeout(function () { var later = readPacket(); if (later) applyPacket(later); }, 1400);
    window.TD613_HUSH_PR98 = { version: VERSION, storageKey: STORAGE_KEY, readPacket: readPacket, applyPacket: applyPacket };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
