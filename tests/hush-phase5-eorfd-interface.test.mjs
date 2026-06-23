import assert from 'node:assert/strict';
import {
  PHASE5_SIGNAL_SCHEMA,
  PHASE5_CLAIM_CEILING,
  validatePhase5EorfdInterfaceSignal,
  buildPhase5RefusalReceipt,
  attachPhase5Signal,
  openPacketWithPhase5Compatibility,
  buildSafeHarborPhase5CustodyHandoff,
  buildPhase5ConstantsBridge,
  buildPhase5RegisterLayerTranslation
} from '../app/engine/hush-phase5-eorfd-interface.js';

function signal(overrides = {}) {
  return {
    schema: PHASE5_SIGNAL_SCHEMA,
    phase: 'PHASE_5_EO_RFD_INTERFACE_LAYER',
    source_family: 'EO-RFD',
    source_name: 'fixture',
    runtime_loaded: false,
    runtime_executed: false,
    signal_class: 'rupture',
    foundation_lane: 'rupture',
    recent_receipt_class: 'receipt',
    authority_boundary: 'signal-source-only',
    constants_namespace: { declared: true, namespace: 'aperture-canonical', requires_translation: true, zc_meaning: 'sqrt3-over-2', tau_meaning: 'aperture-canonical', gap_meaning: 'aperture-canonical' },
    register_translation: { required: true, source_layer: 'fixture-layer', target_layer: 'rupture', status: 'translated' },
    receipt: { deterministic_receipt_present: true, sealed_signal_receipt_present: true, hash_replay_status: 'passed', section_replay_status: 'passed' },
    claim_ceiling: { ...PHASE5_CLAIM_CEILING },
    allowed_effects: ['warn', 'route_pressure', 'witness_note', 'adapter_preflight', 'audit_priority'],
    forbidden_effects: ['release', 'validate', 'prove', 'identify', 'authorize', 'override', 'publish'],
    payload_ref: 'sha256:' + 'a'.repeat(64),
    raw_payload_included: false,
    ...overrides
  };
}

const valid = validatePhase5EorfdInterfaceSignal(signal());
assert.equal(valid.status, 'pass');
assert.equal(valid.release_allowed, false);
assert.ok(valid.allowed_effects.includes('route_pressure'));
assert.equal(valid.register_layer_translation.may_route, true);

const unresolved = validatePhase5EorfdInterfaceSignal(signal({ foundation_lane: 'unresolved', register_translation: { required: true, source_layer: 'fixture-layer', target_layer: null, status: 'pending' } }));
assert.equal(unresolved.status, 'warn');
assert.deepEqual(unresolved.allowed_effects, ['witness_note']);

const badEffect = validatePhase5EorfdInterfaceSignal(signal({ allowed_effects: ['release'] }));
assert.equal(badEffect.status, 'block');

const ambiguous = signal({ constants_namespace: { declared: true, namespace: 'firmware-local', requires_translation: true, zc_meaning: 'ambiguous-zc', tau_meaning: 'firmware-local', gap_meaning: 'firmware-local' } });
assert.equal(buildPhase5ConstantsBridge(ambiguous).translation_status, 'failed');
assert.equal(validatePhase5EorfdInterfaceSignal(ambiguous).status, 'block');

const replayFailure = validatePhase5EorfdInterfaceSignal(signal({ receipt: { deterministic_receipt_present: true, sealed_signal_receipt_present: true, hash_replay_status: 'failed', section_replay_status: 'passed' } }));
assert.equal(replayFailure.status, 'block');

const runtimeImport = validatePhase5EorfdInterfaceSignal(signal({ runtime_import_attempted: true }));
assert.equal(runtimeImport.status, 'block');

const legacyPacket = { schema_version: 'td613.hush.old-v2/v2', packet_id: 'OLD-V2-PACKET-1', packet_hash_sha256: 'sha256:' + 'b'.repeat(64), payload: { sealed: true } };
const compatibility = openPacketWithPhase5Compatibility(legacyPacket, { createdAt: '2026-06-20T00:00:00Z' });
assert.equal(compatibility.legacy_mode, true);
assert.equal(compatibility.phase5_absent_not_dirty, true);
assert.equal(compatibility.original_hash_preserved, true);
assert.deepEqual(compatibility.packet, legacyPacket);

const refusalReceipt = await buildPhase5RefusalReceipt(signal(), ['fixture refusal'], { createdAt: '2026-06-20T00:00:00Z' });
assert.equal(refusalReceipt.raw_private_text_included, false);
assert.equal(refusalReceipt.release_allowed, false);
assert.equal(refusalReceipt.payload_ref_hash_sha256.startsWith('sha256:'), true);

const refusedAttachment = await attachPhase5Signal({ packet_id: 'packet-1', packet_hash_sha256: 'sha256:' + 'c'.repeat(64) }, signal({ allowed_effects: ['release'] }), null, { createdAt: '2026-06-20T00:00:00Z' });
assert.equal(refusedAttachment.status, 'refused');
assert.equal(refusedAttachment.original_packet_preserved, true);
assert.equal(refusedAttachment.sidecar.phase5.refusalReceipts.length, 1);

const handoff = buildSafeHarborPhase5CustodyHandoff(valid, signal());
assert.equal(handoff.custody_only, true);
assert.equal(handoff.release_authorized, false);
assert.equal(handoff.runtime_loaded, false);
assert.equal(JSON.stringify(handoff).includes('payload_ref'), false);

const translation = buildPhase5RegisterLayerTranslation(signal({ register_translation: { source_layer: 'encoding-bus', source_register_label: 'U+10D613', target_layer: 'naming', status: 'translated' }, foundation_lane: 'naming' }));
assert.equal(translation.target_td613_lane, 'naming');
assert.equal(translation.may_route, true);

console.log('hush-phase5-eorfd-interface: ok');
