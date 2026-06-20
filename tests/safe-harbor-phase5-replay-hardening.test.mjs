import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { buildV3Issuance } from '../app/safe-harbor/app/safe-harbor-stylometry-v3.js';
import {
  attachPhase4Authority,
  expectedV2BadgeNumber,
  verifySafeHarborPacketAuthority
} from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import {
  buildAuthorityConflictReport,
  buildConvergenceReport,
  buildPhase5ReplayHardening,
  buildTamperReport,
  detectStaleV3,
  shouldAllowPublicExport
} from '../app/safe-harbor/app/safe-harbor-phase5-replay-hardening.js';

function profile(delta = 0) {
  return {
    contentWordComplexity: 0.41 + delta,
    modifierDensity: 0.08,
    hedgeDensity: 0.01,
    abstractionPosture: 0.51,
    directness: 0.24,
    latinatePreference: 0.17,
    abbreviationDensity: 0.02,
    orthographicLooseness: 0.03,
    fragmentPressure: 0.09,
    conversationalPosture: 0.28,
    syntacticBranchingDepth: 0.21,
    structuralFriction: 0.37,
    lexicalEntropyScore: 0.71,
    characterEntropyBits: 4.81,
    tokenEntropyBits: 5.66,
    transitionVariance: 0.18,
    acousticWeight: 0.43,
    registerMode: 'covenant-plain',
    surfaceMarkerProfile: { dash: 0.12, colon: 0.06, glyph: 0.02 },
    functionWordProfile: { the: 0.0421, and: 0.0312, of: 0.0222 },
    wordLengthProfile: { '1': 0.04, '2': 0.11, '3': 0.17, '4': 0.22, '5': 0.18, '6+': 0.28 },
    charTrigramProfile: { the: 0.0062, ing: 0.0051, ion: 0.0044 }
  };
}

function stable(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((item) => stable(item)).join(',') + ']';
  return '{' + Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
}

function hashMaterial(packet) {
  const material = JSON.parse(JSON.stringify(packet));
  delete material.packet_hash_sha256;
  delete material.phase5_replay_hardening;
  delete material.export_quarantine;
  if (material.renderer_authority_metadata) material.renderer_authority_metadata.packet_hash_sha256 = null;
  return material;
}

function hashPacket(packet) {
  return 'sha256:' + crypto.createHash('sha256').update(stable(hashMaterial(packet))).digest('hex');
}

async function packetFixture() {
  const packet = {
    packet_hash_sha256: 'sha256:phase5-v3-preimage-hash',
    canon: { principal: 'tauric.diana.613', binding_fragment: '#9B07D8B', sac: 'SAC[X6ZNK5NO51]' },
    analysis: {
      segment_cadence_signatures: {
        future_self: { rich_profile_schema: 'td613.safe-harbor.lane-rich-profile/v1', rich_profile: profile(0) },
        past_self: { rich_profile_schema: 'td613.safe-harbor.lane-rich-profile/v1', rich_profile: profile(0.01) },
        higher_self: { rich_profile_schema: 'td613.safe-harbor.lane-rich-profile/v1', rich_profile: profile(0.02) }
      },
      rich_stylometry: {
        traceability_surface: { score: 0.82, band: 'high' },
        cross_lane_divergence: { cross_lane_stability: 0.79, cross_lane_spread: 0.21 }
      },
      triad_resonance: 0.81,
      cross_lane_stability: 0.79,
      cross_lane_spread: 0.21
    },
    issuance: {
      badge_number: null,
      stylometric_fingerprint: 'future_self=legacy|past_self=legacy|higher_self=legacy',
      triad_word_counts: { future_self: 44, past_self: 44, higher_self: 44 },
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'legacy divergence' } }
    },
    rich_stylometry_hash_semantics: {
      native_lane_rich_profile_hash_covered: true,
      bridge_rich_stylometry_hash_covered: true,
      v3_preimage_packet_hash_sha256: 'sha256:phase5-v3-preimage-hash'
    },
    phase5_hash_semantics: {
      phase5_replay_hardening_hash_covered: false,
      phase5_replay_hardening_hash_excluded: true
    }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  packet.issuance.v3 = await buildV3Issuance(packet);
  packet.issuance.badge_number_v3 = packet.issuance.v3.badge_number_v3;
  packet.issuance.stylometric_fingerprint_v3 = packet.issuance.v3.stylometric_fingerprint_v3;
  let governed = await attachPhase4Authority(packet, { mode: 'export-normalized', packetHashRecomputed: true });
  governed.packet_hash_sha256 = hashPacket(governed);
  governed = await attachPhase4Authority(governed, { mode: 'export-normalized', packetHashRecomputed: true });
  return governed;
}

const packet = await packetFixture();
const replay = await verifySafeHarborPacketAuthority(packet);
assert.equal(replay.v2_replay.status, 'pass');
assert.equal(replay.v3_replay.status, 'pass');
assert.equal(replay.hash_replay.status, 'pass');
assert.equal(replay.public_default_policy.default_public_credential, 'v2');

const convergence = await buildConvergenceReport(async (value) => value, packet);
assert.equal(convergence.status, 'pass');
assert.equal(convergence.stable_after_iteration, 2);

const fixtures = await buildTamperReport(packet);
assert.equal(fixtures.status, 'pass');
assert.equal(fixtures.fixtures.length, 12);

const hardening = await buildPhase5ReplayHardening(packet, { includeTamperFixtures: false });
assert.equal(hardening.status, 'pass');
assert.equal(hardening.replay_battery.v2_badge, 'pass');
assert.equal(hardening.replay_battery.v3_badge, 'pass');
assert.equal(hardening.replay_battery.packet_hash, 'pass');

const stale = JSON.parse(JSON.stringify(packet));
stale.analysis.segment_cadence_signatures.future_self.rich_profile.lexicalEntropyScore += 0.25;
const stalePolicy = await detectStaleV3(stale);
assert.equal(stalePolicy.status, 'stale-detected');
assert.equal(stalePolicy.silent_rebuild_allowed, false);

const overclaim = JSON.parse(JSON.stringify(packet));
overclaim.public_default_policy.default_public_credential = 'dual';
overclaim.public_default_policy.v3_public_ready = true;
const conflict = await buildAuthorityConflictReport(overclaim);
assert.equal(conflict.status, 'conflict');

const blocked = JSON.parse(JSON.stringify(packet));
blocked.phase5_replay_hardening = await buildPhase5ReplayHardening(stale, { includeTamperFixtures: false });
const gate = await shouldAllowPublicExport(blocked);
assert.equal(gate.allowed, false);

console.log('safe-harbor-phase5-replay-hardening: ok');
