export function splitPrimaryPersonas(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildSealedBatchArtifact({
  batch,
  registryEntry,
  batchId,
  packet,
  signature,
  sealedAt
}) {
  const base = batch && typeof batch === 'object' ? batch : {};
  const packetValue = packet && typeof packet === 'object' ? packet : {};
  const issuance = packetValue.issuance && typeof packetValue.issuance === 'object' ? packetValue.issuance : {};
  const route = packetValue.analysis && packetValue.analysis.route && typeof packetValue.analysis.route === 'object'
    ? packetValue.analysis.route
    : {};
  const personas = splitPrimaryPersonas(registryEntry && registryEntry.primary_persona);
  const signatureValue = signature && typeof signature === 'object' ? signature : {};
  const detachedSignature = signatureValue.sig == null ? null : String(signatureValue.sig);

  return {
    ...base,
    route_status: 'provenance.seal',
    verification_status: 'Provenance Seal',
    safe_harbor: {
      source: 'td613.safe-harbor.localhost',
      selected_batch_id: batchId || null,
      sealed_at: sealedAt || null,
      route: {
        status: 'provenance.seal',
        state: route.state || 'harbor-eligible',
        recommended_harbor: route.recommended_harbor || 'provenance.seal',
        membrane_note: route.membrane_note || null
      },
      personas: personas.map((name) => ({
        name,
        route_status: 'provenance.seal'
      })),
      issuance: {
        badge_number: issuance.badge_number || null,
        canonical_header: issuance.canonical_header || null,
        extended_footer: issuance.extended_footer || null,
        assignment_basis: issuance.assignment_basis || null,
        stylometric_fingerprint: issuance.stylometric_fingerprint || null
      },
      signature: {
        sig_type: signatureValue.sig_type || 'PGP-detached',
        alg: signatureValue.alg || 'OpenPGP',
        sig: detachedSignature
      },
      packet: {
        packet_id: packetValue.packet_id || null,
        receipt_id: packetValue.receipt && packetValue.receipt.receipt_id ? packetValue.receipt.receipt_id : null,
        packet_hash_sha256: packetValue.packet_hash_sha256 || null,
        created_at: packetValue.created_at || null
      }
    }
  };
}
