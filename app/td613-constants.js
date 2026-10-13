(function () {
  var APERTURE_HUSH_HANDOFF_KEY = 'td613:aperture:hush-packet';
  var APERTURE_HUSH_LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';

  function validateHandoffEnvelope(envelope) {
    if (!envelope || typeof envelope !== 'object') {
      return { ok: false, reason: 'envelope is not an object' };
    }
    if (envelope.source !== 'td613-aperture') {
      return { ok: false, reason: 'unexpected source: ' + envelope.source };
    }
    if (envelope.mode !== 'gateway-embed') {
      return { ok: false, reason: 'unexpected mode: ' + envelope.mode };
    }
    if (!envelope.latestPacket || typeof envelope.latestPacket !== 'object') {
      return { ok: false, reason: 'latestPacket missing or not an object' };
    }
    return { ok: true, reason: 'valid' };
  }

  function validateApertureHushPacket(packet) {
    if (!packet || typeof packet !== 'object') return { ok: false, reason: 'packet is not an object' };
    if (packet.source !== 'td613-aperture') return { ok: false, reason: 'unexpected source: ' + packet.source };
    if (packet.target !== 'hush') return { ok: false, reason: 'unexpected target: ' + packet.target };
    if (!packet.source_text && !packet.source_trace) return { ok: false, reason: 'missing source text / source trace' };
    return { ok: true, reason: 'valid' };
  }

  function maybeLoadApertureHushBridge() {
    try {
      var path = window.location && window.location.pathname || '';
      var bodyRole = document.body && String(document.body.dataset.toolName || '');
      var metaName = document.querySelector('meta[name="tool-name"]')?.content || '';
      if (!/aperture/i.test(path + ' ' + bodyRole + ' ' + metaName)) return;
      if (document.querySelector('script[data-aperture-hush-bridge-loader="true"]')) return;
      var current = document.currentScript && document.currentScript.src || window.location.href;
      var src = new URL('./aperture/aperture-hush-bridge.js?v=202605281835', current).href;
      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.dataset.apertureHushBridgeLoader = 'true';
      document.head.appendChild(script);
    } catch (error) {
      window.__TD613_APERTURE_HUSH_BRIDGE_LOAD_ERROR = String(error && error.message || error);
    }
  }

  window.TD613_CONSTANTS = Object.freeze({
    GATEWAY_APERTURE_HANDOFF_KEY: 'td613.gateway.aperture-handoff',
    APERTURE_HUSH_HANDOFF_KEY: APERTURE_HUSH_HANDOFF_KEY,
    APERTURE_HUSH_LEGACY_KEY: APERTURE_HUSH_LEGACY_KEY,
    validateHandoffEnvelope: validateHandoffEnvelope,
    validateApertureHushPacket: validateApertureHushPacket
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeLoadApertureHushBridge, { once: true });
  else maybeLoadApertureHushBridge();
}());