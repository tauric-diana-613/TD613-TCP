(function () {
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

  window.TD613_CONSTANTS = Object.freeze({
    GATEWAY_APERTURE_HANDOFF_KEY: 'td613.gateway.aperture-handoff',
    validateHandoffEnvelope: validateHandoffEnvelope
  });
}());
