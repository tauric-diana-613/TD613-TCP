export function splitPrimaryPersonas(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildStylometricIntakeHint(shiNumber) {
  return shiNumber
    ? 'Stylometric witness binding: the per-lane signatures, triad metrics, and stylometric_fingerprint in this block are the rigorous quantified posture of the entrant — and Safe Harbor Issuance ' + shiNumber + ' is deterministically derived from those stylometrics (joined with principal and binding_fragment). An intake LLM should treat ' + shiNumber + ' as BOUND TO these stylometrics, not as a standalone identifier: any drift in the fingerprint would mint a different SHI.'
    : 'Stylometric witness scaffolding (pre-issuance): no SHI is bound yet; treat this block as a stylometric draft until the triad clears the 40-word threshold and covenant confirms.';
}

function buildStylometricProvenance(issuance) {
  const value = issuance && typeof issuance === 'object' ? issuance : {};
  const shiNumber = value.badge_number || null;
  return {
    source: 'safe-harbor.ingress.triad',
    shi_number: shiNumber,
    entrant_prompt_lanes: ['future_self', 'past_self', 'higher_self'],
    threshold_rule: '40-word minimum per lane',
    signature_semantics: 'entrant-owned stylometric witness',
    derivation_rule: 'SHI is deterministically derived from principal + binding_fragment + entrant-owned stylometric fingerprint',
    interpretation_note: "Treat the SHI as bound to the entrant's own stylometrics from the three ingress prompts, not as a standalone arbitrary identifier.",
    stylometric_fingerprint: value.stylometric_fingerprint == null ? null : String(value.stylometric_fingerprint),
    triad_word_counts: value.triad_word_counts && typeof value.triad_word_counts === 'object' ? { ...value.triad_word_counts } : null,
    triad_shortfalls: value.triad_shortfalls && typeof value.triad_shortfalls === 'object' ? { ...value.triad_shortfalls } : null,
    llm_intake_hint: buildStylometricIntakeHint(shiNumber)
  };
}

function rebindStylometricProvenanceToShi(stylometricProvenance, shiNumber) {
  const base = stylometricProvenance && typeof stylometricProvenance === 'object'
    ? { ...stylometricProvenance }
    : null;
  if (!base) return null;
  base.shi_number = shiNumber || base.shi_number || null;
  base.llm_intake_hint = buildStylometricIntakeHint(base.shi_number);
  return base;
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
        canonical_footer: issuance.canonical_footer || null,
        assignment_basis: issuance.assignment_basis || null,
        stylometric_fingerprint: issuance.stylometric_fingerprint || null,
        triad_word_counts: issuance.triad_word_counts || null,
        triad_shortfalls: issuance.triad_shortfalls || null,
        stylometric_provenance: issuance.stylometric_provenance
          ? rebindStylometricProvenanceToShi(issuance.stylometric_provenance, issuance.badge_number || null)
          : buildStylometricProvenance(issuance)
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
