import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  finalizeSafeHarborPacket,
  computePacketHash,
  classifyNativeFinalizationMode
} from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import {
  expectedV2BadgeNumber,
  verifySafeHarborPacketAuthority
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import {
  buildAuthorityConflictReport,
  buildHashReplayBattery
} from '../app/safe-harbor/app/safe-harbor-phase5-replay-hardening.js';

const laneText = (label) => [
  `${label} begins with a deliberate covenant sentence that carries enough language for the stylometric engine to read signal rather than noise.`,
  `The voice keeps faith with the triad while allowing syntax, rhythm, and register to show their own pressure.`,
  `This passage avoids raw identity claims and focuses on packet-internal custody, replay, divergence, and authored topology.`,
  `It gives the harbor sufficient words to measure structure, function words, character texture, and cross-lane difference without exposing sealed text later.`
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
    packet_id: 'SH-PHASE6-NATIVE-001',
    created_at: '2026-06-20T00:00:00Z',
    canon: {
      principal: 'tauric.diana.613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]'
    },
    intake: { ts_utc: '2026-06-20T00:00:00Z', status: 'issued' },
    analysis: {
      segment_cadence_signatures: signatures,
      triad_resonance: 0.81,
      cross_lane_stability: 0.79,
      cross_lane_spread: 0.21
    },
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

const nativePacket = await finalizeSafeHarborPacket(basePacket(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false
});

assert.equal(nativePacket.native_spine_purification.status, 'native');
assert.equal(nativePacket.native_spine_purification.rich_profile_birthplace, 'native');
assert.equal(nativePacket.native_spine_purification.v3_issuance_birthplace, 'native');
assert.equal(nativePacket.native_spine_purification.normalizer_role, 'verification-only');
assert.equal(nativePacket.packet_authority_surface.rich_profile_promotion, 'native');
assert.equal(nativePacket.packet_authority_surface.v3_issuance, 'native');
assert.equal(nativePacket.packet_authority_surface.packet_hash_recomputed_after_native_finalization, true);
assert.equal(nativePacket.issuance.v3.status, 'issued');
assert.ok(nativePacket.issuance.badge_number_v3.startsWith('TD613-SH3-9B07D8B-'));
assert.equal(nativePacket.hash_topology.schema_version, 'td613.safe-harbor.hash-topology/v1');
assert.equal(nativePacket.hash_topology.final_packet_hash_sha256, nativePacket.packet_hash_sha256);
assert.equal(nativePacket.phase5_hash_semantics.phase5_replay_hardening_hash_excluded, true);
assert.equal(classifyNativeFinalizationMode(nativePacket), 'native');
assert.equal(nativePacket.packet_capabilities.rich_stylometry_profile, true);
assert.equal(nativePacket.packet_capabilities.rich_stylometry_schema, 'td613.safe-harbor.rich-stylometry/v3');
assert.equal(nativePacket.packet_capabilities.native_rich_profile_birthplace, true);
assert.equal(nativePacket.packet_capabilities.preferred_authorship_surface, 'rich_stylometry');
assert.equal(nativePacket.analysis.segment_cadence_signatures.future_self.legacy_profile_source, 'safe-harbor.local');
assert.equal(nativePacket.analysis.segment_cadence_signatures.future_self.legacy_profile_schema, 'td613.safe-harbor.legacy-lane-profile/v1');
assert.equal(nativePacket.analysis.segment_cadence_signatures.future_self.rich_profile_source, 'app/engine/stylometry.extractCadenceProfile + StylometricDeepMetrics.analyze');
assert.equal(nativePacket.analysis.segment_cadence_signatures.future_self.rich_profile.surfaceMarkerSummary.zero_marker_count >= 0, true);
assert.equal(nativePacket.forensic_authorship.authorship_metrics.preferred_authorship_surface, 'rich_stylometry');
assert.ok(nativePacket.forensic_authorship.authorship_metrics.rich_lane_summary.future_self);
assert.ok(nativePacket.forensic_authorship.authorship_metrics.rich_cross_lane_summary.primary_divergence_axes);
assert.equal(nativePacket.forensic_authorship.authorship_metrics.authorship_traceability_summary.basis, 'packet-internal rich stylometry only');

const replay = await verifySafeHarborPacketAuthority(nativePacket);
assert.equal(replay.v2_replay.status, 'pass');
assert.equal(replay.v3_replay.status, 'pass');
assert.equal(replay.hash_replay.status, 'pass');
assert.equal(replay.authority_surface.status, 'native');
assert.equal(replay.public_default_policy.default_public_credential, 'v2');
assert.equal(nativePacket.phase5_replay_hardening.status, 'pass');
assert.equal(JSON.stringify(nativePacket).includes(segments.future_self), false);
assert.equal(JSON.stringify(nativePacket).includes(segments.past_self), false);
assert.equal(JSON.stringify(nativePacket).includes(segments.higher_self), false);

const battery = await buildHashReplayBattery(nativePacket);
assert.equal(battery.native_spine, 'pass');
assert.equal(battery.hash_topology, 'pass');
assert.equal(battery.finalizer_lineage, 'native');

const recomputed = await computePacketHash(nativePacket);
assert.equal(recomputed, nativePacket.packet_hash_sha256);

const exportPacket = await finalizeSafeHarborPacket(basePacket(), {
  mode: 'export-normalized',
  segments,
  includePhase5: true,
  includeTamperFixtures: false
});
assert.equal(exportPacket.native_spine_purification.status, 'export-hardened');
assert.equal(exportPacket.packet_authority_surface.rich_profile_promotion, 'export-normalized');
assert.equal(exportPacket.packet_authority_surface.v3_issuance, 'export-normalized');
assert.equal(exportPacket.packet_capabilities.rich_stylometry_profile, true);
assert.equal(exportPacket.packet_capabilities.native_rich_profile_birthplace, false);
const exportBattery = await buildHashReplayBattery(exportPacket);
assert.equal(exportBattery.finalizer_lineage, 'export-normalized');
assert.equal(exportBattery.native_spine, 'pass');

const legacyPacket = basePacket();
const legacyReplay = await verifySafeHarborPacketAuthority(legacyPacket);
assert.equal(legacyReplay.v2_replay.status, 'pass');
assert.notEqual(classifyNativeFinalizationMode(legacyPacket), 'native');
assert.equal(legacyPacket.native_spine_purification, undefined);

const fakeNative = JSON.parse(JSON.stringify(exportPacket));
fakeNative.native_spine_purification.status = 'native';
fakeNative.native_spine_purification.normalizer_role = 'export-hardening-fallback';
const fakeConflict = await buildAuthorityConflictReport(fakeNative);
assert.equal(fakeConflict.status, 'conflict');
assert.ok(fakeConflict.conflicts.some((item) => String(item.recommended_action || '').includes('fake-native-lineage')));

const mislabeledLegacy = basePacket();
mislabeledLegacy.packet_authority_surface = { rich_profile_promotion: 'native', v3_issuance: 'native' };
const legacyConflict = await buildAuthorityConflictReport(mislabeledLegacy);
assert.equal(legacyConflict.status, 'conflict');

const pr169 = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-pr169-packet-vault-direct.js', import.meta.url), 'utf8');
assert.ok(pr169.includes('v16-phase9-1b-wire-ui-surfaces'));
assert.ok(pr169.includes('phase6_native_callsite'));
assert.ok(pr169.includes('phase6_compose_purity'));
assert.ok(pr169.includes("mode: 'native'"));
assert.ok(pr169.includes("hasRawSegments(saved) ? 'native' : 'export-normalized'"));
assert.ok(pr169.includes('nativeBorn(packet)'));
assert.ok(pr169.includes('export-normalized'));

console.log('safe-harbor-phase6-native-spine: ok');
