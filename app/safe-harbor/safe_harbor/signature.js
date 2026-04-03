(function (root) {
  'use strict';

  const core = root.TD613SafeHarborCore = root.TD613SafeHarborCore || {};

  const SUPPORTED_LANES = [
    {
      id: 'JWS-detached',
      purpose: 'runtime request sealing'
    },
    {
      id: 'detached-ed25519',
      purpose: 'durable archive and zone sealing'
    }
  ];

  function signatureBlueprint(packetHash) {
    return {
      status: 'awaiting-wrapper',
      sig: null,
      sig_type: null,
      kid: null,
      attachment_mode: 'wrapper-only',
      supported_lanes: SUPPORTED_LANES.map((lane) => lane.id),
      packet_hash_sha256: packetHash || null,
      canonical_json_spec: 'td613.safe-harbor.c14n/v1',
      explanation: 'Cadence signature is stylometric. Cryptographic signature is a detached seal over canonical JSON.'
    };
  }

  function signatureAttachment(packet, detail) {
    const normalized = detail || {};
    return {
      packet_id: packet && packet.packet_id ? packet.packet_id : normalized.packet_id || null,
      packet_hash_sha256: packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : normalized.packet_hash_sha256 || null,
      sig: normalized.sig || normalized.detached_sig || null,
      sig_type: normalized.sig_type || normalized.lane || null,
      kid: normalized.kid || (packet && packet.canon ? packet.canon.principal : null),
      status: normalized.status || ((normalized.sig || normalized.detached_sig) ? 'attached' : 'awaiting-wrapper'),
      detached: true,
      lane_ref: normalized.detached_ref || null,
      attached_at: normalized.attached_at || null
    };
  }

  core.signature_supported_lanes = SUPPORTED_LANES;
  core.signature_blueprint = signatureBlueprint;
  core.signature_attachment = signatureAttachment;
})(window);
