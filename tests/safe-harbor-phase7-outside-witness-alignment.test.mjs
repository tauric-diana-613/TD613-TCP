import assert from 'node:assert/strict';

import { finalizeSafeHarborPacket } from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import {
  expectedV2BadgeNumber,
  verifySafeHarborPacketAuthority
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import {
  buildAuthorityConflictReport
} from '../app/safe-harbor/app/safe-harbor-phase5-replay-hardening.js';
import {
  buildCountersignatoryIntake,
  buildEoHookAuthority,
  buildOperatorReceipt,
  buildOutsideWitnessAlignment,
  buildRendererAuthorityV2,
  buildSignatureOverlayAuthority,
  buildStep1Countersignature,
  buildSvgAuthorityMetadata,
  buildTcpHookAuthority,
  verifyOutsideWitnessAlignment
} from '../app/safe-harbor/app/safe-harbor-outside-witness-alignment.js';

const laneText = (label) => [
  `${label} begins with a deliberate covenant sentence that carries enough language for the stylometric engine to read signal rather than noise.`,
  'The voice keeps faith with the triad while allowing syntax, rhythm, and register to show their own pressure.',
  'This passage avoids raw identity claims and focuses on packet-internal custody, replay, divergence, and authored topology.',
  'It gives the harbor sufficient words to measure structure, function words, character texture, and cross-lane difference without exposing sealed text later.'
].join(' ');

const segments = {
  future_self: laneText('Future self will carry route and projection'),
  past_self: laneText('Past self remembers residue and recovery'),
  higher_self: laneText('Higher self names pattern and witness')
};

function thinLane(key, text) {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: text.length,
    word_count: words.length,
    sentence_count: text.split(/[.!?]+/u).filter(Boolean).length,
    avg_word_length: 5.5,
    avg_sentence_length: 13,
    punctuation_density: 0.02,
    line_break_density: 0,
    unique_ratio: 0.72,
    punctuation_mix: { comma: 0.2, dash: 0.2, colon: 0.1, semicolon: 0, exclamation: 0, question: 0 },
    dominant_axes: ['signal', 'covenant'],
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.5,
    closure_class: 'closed',
    frame_alignment: 'aligned',
    frame_alignment_note: null
  };
}
function stableFingerprint(signatures) {
  return Object.keys(signatures).sort().map((key) => `${key}:${signatures[key].word_count}:${signatures[key].temporal_posture}`).join('|');
}
function basePacket() {
  const signatures = Object.fromEntries(Object.entries(segments).map(([key, value]) => [key, thinLane(key, value)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'SH-PHASE7-WITNESS-001',
    created_at: '2026-06-20T00:00:00Z',
    canon: { principal: 'tauric.diana.613', binding_fragment: '#9B07D8B', sac: 'SAC[X6ZNK5NO51]' },
    intake: { ts_utc: '2026-06-20T00:00:00Z', status: 'issued' },
    analysis: { segment_cadence_signatures: signatures, triad_resonance: 0.81, cross_lane_stability: 0.79, cross_lane_spread: 0.21 },
    issuance: {
      badge_number: null,
      stylometric_fingerprint: stableFingerprint(signatures),
      triad_word_counts: Object.fromEntries(Object.entries(signatures).map(([key, lane]) => [key, lane.word_count])),
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'legacy divergence' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [] } }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  return packet;
}
async function nativePacket() {
  return finalizeSafeHarborPacket(basePacket(), { mode: 'native', segments, includePhase5: true, includeTamperFixtures: false });
}
async function fullWitnesses(packet) {
  const renderer = buildRendererAuthorityV2(packet);
  const svg = buildSvgAuthorityMetadata(packet);
  const signature = await buildSignatureOverlayAuthority(packet, { renderer_authority_metadata: renderer, signature_status: 'attached' });
  const tcp = buildTcpHookAuthority(packet);
  const eo = buildEoHookAuthority(packet);
  const step1 = await buildStep1Countersignature(packet, { renderer_authority_metadata: renderer, tcp_hook_authority: tcp, eo_hook_authority: eo });
  const intake = await buildCountersignatoryIntake(packet, { signature_overlay_authority: signature, tcp_hook_authority: tcp, eo_hook_authority: eo });
  const receipt = buildOperatorReceipt(packet, { hash_replay: step1.hash_replay, step1_status: step1.can_countersign ? 'aligned' : 'refused', renderer_status: 'aligned', svg_status: 'aligned', signature_overlay_status: signature.signature_can_bind ? 'aligned' : 'refused', tcp_hook_status: tcp.status, eo_hook_status: eo.status });
  return { step1_envelope: step1, countersignatory_intake: intake, renderer_authority_metadata: renderer, svg_metadata: svg, signature_overlay_authority: signature, tcp_hook_authority: tcp, eo_hook_authority: eo, operator_receipt: receipt };
}
function assertNoRawText(value, label) {
  const body = JSON.stringify(value);
  assert.equal(body.includes(segments.future_self), false, `${label} leaked future lane`);
  assert.equal(body.includes(segments.past_self), false, `${label} leaked past lane`);
  assert.equal(body.includes(segments.higher_self), false, `${label} leaked higher lane`);
  assert.equal(body.includes('raw_text'), false, `${label} carried raw_text key`);
}

const packet = await nativePacket();
const witnesses = await fullWitnesses(packet);
const alignment = await buildOutsideWitnessAlignment(packet, witnesses);

assert.equal(packet.native_spine_purification.status, 'native');
assert.equal(alignment.status, 'aligned');
assert.equal(alignment.authority_grammar.public_default, 'v2');
assert.equal(alignment.authority_grammar.native_spine_status, 'native');
assert.equal(alignment.witnesses.step1_envelope, 'aligned');
assert.equal(alignment.witnesses.renderer_metadata, 'aligned');
assert.equal(alignment.witnesses.svg_metadata, 'aligned');
assert.equal(alignment.witnesses.signature_overlay, 'aligned');
assert.equal(alignment.witnesses.tcp_hook, 'aligned');
assert.equal(alignment.witnesses.eo_hook, 'aligned');

assert.equal(witnesses.step1_envelope.source_status, 'packet-observed rich stylometry present');
assert.equal(witnesses.step1_envelope.can_countersign, true);
assert.equal(witnesses.step1_envelope.public_default, 'v2');
assert.notEqual(witnesses.step1_envelope.v3_role, 'public-default');

const quarantined = JSON.parse(JSON.stringify(packet));
quarantined.phase5_replay_hardening.status = 'quarantine';
const quarantineStep1 = await buildStep1Countersignature(quarantined);
assert.equal(quarantineStep1.can_countersign, false);
assert.match(quarantineStep1.refusal_reasons.join(' | '), /Phase 5 status/u);
const quarantineSignature = await buildSignatureOverlayAuthority(quarantined);
assert.equal(quarantineSignature.signature_can_bind, false);

const badHash = JSON.parse(JSON.stringify(packet));
badHash.packet_hash_sha256 = 'sha256:' + 'f'.repeat(64);
const badHashStep1 = await buildStep1Countersignature(badHash);
assert.equal(badHashStep1.can_countersign, false);
assert.match(badHashStep1.refusal_reasons.join(' | '), /hash replay failed/u);

const staleV3 = JSON.parse(JSON.stringify(packet));
staleV3.issuance.v3.stylometric_fingerprint_v3 = 'sha256:' + '0'.repeat(64);
const staleV3Step1 = await buildStep1Countersignature(staleV3);
assert.equal(staleV3Step1.can_countersign, false);
assert.match(staleV3Step1.refusal_reasons.join(' | '), /v3 replay failed/u);

const rendererSecondary = buildRendererAuthorityV2({ ...packet, recall_governance: { ...packet.recall_governance, v3: { ...packet.recall_governance.v3, promotion_status: 'v3-not-yet-recall-authoritative' } } });
assert.equal(rendererSecondary.v3_role, 'forensic-secondary');
assert.equal(witnesses.renderer_authority_metadata.public_default_credential, 'v2');
assert.notEqual(witnesses.renderer_authority_metadata.v3_role, 'public-default');
assert.equal(witnesses.svg_metadata['data-td613-public-default'], witnesses.renderer_authority_metadata.public_default_credential);
assert.equal(witnesses.svg_metadata['data-td613-v3-role'], witnesses.renderer_authority_metadata.v3_role);
assert.equal(witnesses.svg_metadata['data-td613-packet-hash'], witnesses.renderer_authority_metadata.packet_hash_sha256);

assert.equal(witnesses.signature_overlay_authority.signature_can_bind, true);
assert.equal(witnesses.signature_overlay_authority.packet_hash_at_signature, packet.packet_hash_sha256);
assert.equal(witnesses.tcp_hook_authority.public_default, 'v2');
assert.equal(witnesses.eo_hook_authority.observed_public_default, 'v2');

const badTcp = { ...witnesses.tcp_hook_authority, public_default: 'dual' };
const tcpMismatch = await verifyOutsideWitnessAlignment(packet, { ...witnesses, tcp_hook_authority: badTcp });
assert.ok(['blocked', 'partial'].includes(tcpMismatch.status));
assert.ok(tcpMismatch.refusal_reasons.some((reason) => reason.includes('tcp_hook')));

const badEo = { ...witnesses.eo_hook_authority, observed_v3_role: 'public-default' };
const eoMismatch = await verifyOutsideWitnessAlignment(packet, { ...witnesses, eo_hook_authority: badEo });
assert.ok(['blocked', 'partial'].includes(eoMismatch.status));
assert.ok(eoMismatch.refusal_reasons.some((reason) => reason.includes('eo_hook')));

assert.equal(witnesses.operator_receipt.public_default, 'v2');
assert.equal(witnesses.operator_receipt.raw_text_exported, false);
for (const [label, value] of Object.entries(witnesses)) assertNoRawText(value, label);
assertNoRawText(alignment, 'outside_witness_alignment');

const legacyPacket = basePacket();
const legacyReplay = await verifySafeHarborPacketAuthority(legacyPacket);
const legacyStep1 = await buildStep1Countersignature(legacyPacket);
assert.equal(legacyReplay.v2_replay.status, 'pass');
assert.equal(legacyStep1.packet_lineage, 'legacy');
assert.equal(legacyStep1.source_status, 'packet exposes legacy thin stylometry only');
assert.notEqual(legacyStep1.packet_lineage, 'native');

const exportPacket = await finalizeSafeHarborPacket(basePacket(), { mode: 'export-normalized', segments, includePhase5: true, includeTamperFixtures: false });
const exportWitnesses = await fullWitnesses(exportPacket);
const exportAlignment = await buildOutsideWitnessAlignment(exportPacket, exportWitnesses);
assert.equal(exportPacket.native_spine_purification.status, 'export-hardened');
assert.equal(exportAlignment.authority_grammar.native_spine_status, 'export-hardened');
assert.notEqual(exportAlignment.authority_grammar.native_spine_status, 'native');

const fakeNative = JSON.parse(JSON.stringify(exportPacket));
fakeNative.native_spine_purification.status = 'native';
fakeNative.native_spine_purification.normalizer_role = 'export-hardening-fallback';
const fakeConflict = await buildAuthorityConflictReport(fakeNative);
assert.equal(fakeConflict.status, 'conflict');

const overclaim = JSON.parse(JSON.stringify(packet));
overclaim.public_default_policy.default_public_credential = 'dual';
overclaim.public_default_policy.v3_public_ready = true;
const overclaimStep1 = await buildStep1Countersignature(overclaim);
assert.equal(overclaimStep1.can_countersign, false);
assert.match(overclaimStep1.refusal_reasons.join(' | '), /public default/u);
const overclaimRenderer = buildRendererAuthorityV2(overclaim);
assert.equal(overclaimRenderer.public_default_credential, 'v2');

console.log('safe-harbor-phase7-outside-witness-alignment: ok');
