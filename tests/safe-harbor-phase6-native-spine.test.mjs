import assert from 'node:assert/strict';

import {
  finalizeSafeHarborPacket,
  computePacketHash,
  classifyNativeFinalizationMode
} from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import {
  expectedV2BadgeNumber,
  verifySafeHarborPacketAuthority
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';

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
  const chars = text.length;
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: chars,
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
    intake: {
      ts_utc: '2026-06-20T00:00:00Z',
      status: 'issued'
    },
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
      stylometric_provenance: {
        divergence_signature: { compact: 'legacy divergence' }
      }
    },
    signature: {
      status: 'declared',
      sig: null,
      attached_at: null
    },
    bridge: {
      covenant_gate: { confirmed: true },
      export_gate: { ready: true, state: 'harbor-eligible', blockers: [] }
    }
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
assert.equal(nativePacket.packet_authority_surface.rich_profile_promotion, 'native');
assert.equal(nativePacket.packet_authority_surface.v3_issuance, 'native');
assert.equal(nativePacket.packet_authority_surface.packet_hash_recomputed_after_native_finalization, true);
assert.equal(nativePacket.issuance.v3.status, 'issued');
assert.ok(nativePacket.issuance.badge_number_v3.startsWith('TD613-SH3-9B07D8B-'));
assert.equal(nativePacket.hash_topology.schema_version, 'td613.safe-harbor.hash-topology/v1');
assert.equal(nativePacket.hash_topology.final_packet_hash_sha256, nativePacket.packet_hash_sha256);
assert.equal(nativePacket.phase5_hash_semantics.phase5_replay_hardening_hash_excluded, true);
assert.equal(classifyNativeFinalizationMode(nativePacket), 'native');

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

console.log('safe-harbor-phase6-native-spine: ok');
