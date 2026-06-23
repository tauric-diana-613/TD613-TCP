import assert from 'node:assert/strict';
import {
  HUSH_UNIFIED_AUDIT_SCHEMA,
  HUSH_UNIFIED_AUDIT_PHASE,
  buildHushUnifiedAuditPacket,
  buildPhase7MaskRegistryAuditSummary,
  buildPhase6SafeHarborHandoff
} from '../app/engine/hush-unified-audit-packet.js';

const H = 'sha256:' + 'a'.repeat(64);
const H2 = 'sha256:' + 'b'.repeat(64);
const H3 = 'sha256:' + 'c'.repeat(64);

function contract(overrides = {}) {
  return {
    contract_id: 'TD613-HUSH-CONTRACT-20260620-ABCDEF12',
    contract_hash_sha256: H,
    task: 'generation',
    intended_output_type: 'draft',
    release_status: 'private',
    expected_sections: ['summary'],
    user_intent_summary: 'bounded request',
    ...overrides
  };
}

function providerLog(overrides = {}) {
  return {
    provider_log_id: 'TD613-HUSH-PROVIDER-20260620-ABCDEF12',
    provider_log_hash_sha256: H2,
    provider: 'local',
    model: 'local-test',
    response_ref: H2,
    raw_response_included: false,
    response_summary: 'bounded response summary',
    observed_sections: ['summary'],
    ...overrides
  };
}

function stylometry(overrides = {}) {
  return {
    stylometry_audit_packet_id: 'TD613-HUSH-STYLO-20260620-ABCDEF12',
    packet_hash_sha256: H3,
    audit_input_profile: { audit_mode: 'feature-vector' },
    linked_customizer_profile: { stylometry_profile_id: 'TD613-HUSH-STYLO-PROFILE-20260620-ABCDEF12' },
    cadence_alignment: { overall_alignment_score: 0.8 },
    flattening_detection: { flattening_band: 'low' },
    risk_profile: { overfit_risk: 'low', private_cadence_exposure_risk: 'low' },
    release_recommendation: { release_class: 'release-safe' },
    claim_limits: { not_identity_proof: true, not_authorship_ownership_proof: true },
    ...overrides
  };
}

function phase5(overrides = {}) {
  return {
    phase5_result_id: 'phase5-fixture-1',
    status: 'pass',
    source_family: 'EO-RFD',
    signal_class: 'rupture',
    foundation_lane: 'rupture',
    constants_bridge: { translation_status: 'passed' },
    register_layer_translation: { translation_confidence: 'bounded' },
    allowed_effects: ['warn', 'route_pressure'],
    blocked_effects: ['release'],
    authority_ceiling_held: true,
    ...overrides
  };
}

const clean = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog(),
  stylometryAudit: stylometry(),
  context: { stableId: true, createdAt: '2026-06-20T00:00:00Z' }
});
assert.equal(clean.schema, HUSH_UNIFIED_AUDIT_SCHEMA);
assert.equal(clean.phase, HUSH_UNIFIED_AUDIT_PHASE);
assert.ok(clean.packet_id.startsWith('hush-audit-20260620-'));
assert.equal(clean.packet_status, 'clean');
assert.equal(clean.phase5_interface.phase5_validation_status, 'not_present');
assert.equal(clean.decision.release_allowed, false);
assert.equal(clean.safe_harbor_handoff.custody_facts_only, true);
assert.equal(clean.safe_harbor_handoff.release_allowed, false);
assert.equal(clean.hash_replay.status, 'passed');
assert.equal(clean.hash_replay.packet_hashes_agree, true);
assert.equal(clean.hash_replay.hash_only_packet_blocked, true);
assert.equal(clean.hash_replay.packet_hash_sha256, clean.packet_hash_sha256);
assert.equal(clean.hash_replay.hash_topology_packet_hash_sha256, clean.packet_hash_sha256);

const cleanWithPhase5 = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog(),
  stylometryAudit: stylometry(),
  phase5InterfaceResult: phase5(),
  context: { stableId: true, createdAt: '2026-06-20T00:01:00Z' }
});
assert.equal(cleanWithPhase5.packet_status, 'clean');
assert.equal(cleanWithPhase5.phase5_interface.phase5_validation_status, 'pass');
assert.equal(cleanWithPhase5.decision.release_allowed, false);

const blockedPhase5AsAuthority = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog(),
  stylometryAudit: stylometry(),
  phase5InterfaceResult: phase5({ status: 'block', allowed_effects: ['route_pressure'], refusal_receipt_ref: 'refusal-1' }),
  context: { stableId: true, createdAt: '2026-06-20T00:02:00Z' }
});
assert.equal(blockedPhase5AsAuthority.packet_status, 'blocked');
assert.equal(blockedPhase5AsAuthority.phase5_interface.refusal_receipt_ref, 'refusal-1');
assert.equal(blockedPhase5AsAuthority.decision.release_allowed, false);

const mismatch = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog({ privacy_risks: ['boundary-review'] }),
  stylometryAudit: stylometry(),
  context: { stableId: true, createdAt: '2026-06-20T00:03:00Z' }
});
assert.equal(mismatch.packet_status, 'repair_required');
assert.equal(mismatch.decision.repair_required, true);

const leaked = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog({ raw_response_included: true }),
  stylometryAudit: stylometry(),
  context: { stableId: true, createdAt: '2026-06-20T00:04:00Z' }
});
assert.equal(leaked.packet_status, 'quarantine');
assert.equal(leaked.decision.quarantine_required, true);
assert.equal(leaked.decision.release_allowed, false);

const legacy = await buildHushUnifiedAuditPacket({
  outboundContract: contract(),
  providerLog: providerLog(),
  stylometryAudit: stylometry(),
  context: { stableId: true, createdAt: '2026-06-20T00:05:00Z', legacy_reopen_mode: true }
});
assert.equal(legacy.hash_replay.legacy_reopen_mode, true);

const handoff = buildPhase6SafeHarborHandoff(cleanWithPhase5);
assert.equal(handoff.schema, 'td613.safeharbor.phase6-custody-handoff/v1');
assert.equal(handoff.custody_facts_only, true);
assert.equal(handoff.forbidden_claims_excluded, true);
assert.equal(handoff.release_allowed, false);

const beforeSummary = JSON.stringify(cleanWithPhase5);
const summary = buildPhase7MaskRegistryAuditSummary(cleanWithPhase5);
assert.equal(summary.raw_phase5_signal_authority_included, false);
assert.equal(summary.gallery_update_allowed, true);
assert.equal(JSON.stringify(cleanWithPhase5), beforeSummary);

console.log('hush-phase6-unified-audit-packet: ok');
