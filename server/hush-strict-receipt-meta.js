export const HUSH_STRICT_RECEIPT_META_VERSION = 'pr124-strict-receipt-meta/v1';

const safe = (value) => String(value ?? '').trim();

export function strictReceiptMeta(contract = {}, startedAt = Date.now()) {
  const packet = contract.flightPacket || {};
  const evidence = packet.mask_evidence || {};
  return {
    strict: true,
    noFallback: true,
    elapsedMs: Date.now() - startedAt,
    packetTier: safe(contract.packetTier || packet.packet_tier),
    maskEvidenceState: safe(contract.maskEvidenceState || evidence.maskEvidenceState),
    packetRouterVersion: safe(packet.packet_router_version),
    flightPacketVersion: safe(packet.packet_version || contract.flightPacketVersion),
    endpointMetaVersion: HUSH_STRICT_RECEIPT_META_VERSION
  };
}

export function attachStrictReceiptMeta(payload = {}, contract = {}, startedAt = Date.now()) {
  return {
    ...payload,
    packetTier: safe(payload.packetTier || contract.packetTier || contract.flightPacket?.packet_tier),
    maskEvidenceState: safe(payload.maskEvidenceState || contract.maskEvidenceState || contract.flightPacket?.mask_evidence?.maskEvidenceState),
    requestReceipt: {
      ...(payload.requestReceipt || {}),
      ...strictReceiptMeta(contract, startedAt),
      ...(payload.requestReceipt || {})
    }
  };
}
