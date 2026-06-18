import assert from 'node:assert/strict';

import {
  buildV3Issuance,
  canIssueV3,
  stableCanonicalJson
} from '../app/safe-harbor/app/safe-harbor-stylometry-v3.js';

const laneRichProfile = (overrides = {}) => ({
  contentWordComplexity: 0.4119,
  modifierDensity: 0.0821,
  hedgeDensity: 0.0112,
  abstractionPosture: 0.5111,
  directness: 0.2444,
  latinatePreference: 0.1777,
  abbreviationDensity: 0.021,
  orthographicLooseness: 0.032,
  fragmentPressure: 0.091,
  conversationalPosture: 0.288,
  syntacticBranchingDepth: 0.211,
  structuralFriction: 0.377,
  lexicalEntropyScore: 0.7129,
  characterEntropyBits: 4.8123,
  tokenEntropyBits: 5.6621,
  transitionVariance: 0.1888,
  acousticWeight: 0.4333,
  registerMode: 'covenant-plain',
  surfaceMarkerProfile: { dash: 0.12, colon: 0.06, glyph: 0.02 },
  functionWordProfile: { the: 0.04214, and: 0.03121, of: 0.02222 },
  wordLengthProfile: { '1': 0.04, '2': 0.11, '3': 0.17, '4': 0.22, '5': 0.18, '6+': 0.28 },
  charTrigramProfile: { 'the': 0.0062, 'ing': 0.0051, 'ion': 0.0044 },
  ...overrides
});

function lane(key, richOverrides = {}) {
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: 450,
    word_count: 72,
    sentence_count: 5,
    avg_word_length: 5.5,
    avg_sentence_length: 14.4,
    punctuation_density: 0.021,
    line_break_density: 0.004,
    unique_ratio: 0.78,
    punctuation_mix: { comma: 0.4, dash: 0.2, colon: 0.2, semicolon: 0, exclamation: 0, question: 0.2 },
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.75,
    closure_class: 'anchored',
    frame_alignment: 'aligned',
    rich_profile_schema: 'td613.safe-harbor.lane-rich-profile/v1',
    rich_profile_source: 'native-safe-harbor-rich-stylometry',
    rich_profile: laneRichProfile(richOverrides)
  };
}

function packet(options = {}) {
  return {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_hash_sha256: 'sha256:packet-hash-placeholder',
    canon: {
      principal: 'tauric.diana.613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]'
    },
    analysis: {
      segment_cadence_signatures: {
        future_self: lane('future_self', options.future || {}),
        past_self: lane('past_self', options.past || {}),
        higher_self: lane('higher_self', options.higher || {})
      },
      rich_stylometry: options.bridgeRich === false ? undefined : {
        traceability_surface: { score: 0.81, band: 'high' },
        cross_lane_divergence: {
          cross_lane_stability: 0.7022,
          cross_lane_spread: 0.1999,
          strongest_pair: { pair: 'F-H', distance: 0.1222 },
          widest_pair: { pair: 'P-H', distance: 0.3222 }
        }
      },
      triad_resonance: 0.8222,
      cross_lane_stability: 0.7999,
      cross_lane_spread: 0.2001
    },
    issuance: {
      badge_number: 'TD613-SH-9B07D8B-1234ABCD',
      stylometric_fingerprint: 'future_self=legacy|past_self=legacy|higher_self=legacy',
      triad_word_counts: { future_self: 72, past_self: 72, higher_self: 72 },
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: {
        divergence_signature: { compact: 'legacy divergence' }
      }
    },
    rich_stylometry_hash_semantics: options.hashCovered === false ? {
      native_lane_rich_profile_hash_covered: false,
      bridge_rich_stylometry_hash_covered: false
    } : {
      native_lane_rich_profile_hash_covered: true,
      bridge_rich_stylometry_hash_covered: false,
      notes: 'Phase 3 derivation uses native lane rich_profile, not bridge-only export enrichment.'
    }
  };
}

const bridgeOnly = packet({ hashCovered: false });
const bridgeGate = canIssueV3(bridgeOnly);
assert.equal(bridgeGate.ready, false);
assert.ok(bridgeGate.blocking_reasons.some((reason) => reason.includes('bridge-only rich stylometry')));
const blocked = await buildV3Issuance(bridgeOnly);
assert.equal(blocked.status, 'blocked');
assert.equal(blocked.badge_number_v3, null);
assert.equal(blocked.stylometric_fingerprint_v3, null);
assert.equal(blocked.migration_attestation.mode, 'blocked');

const issuedPacket = packet();
const issued = await buildV3Issuance(issuedPacket);
assert.equal(issued.status, 'issued');
assert.match(issued.badge_number_v3, /^TD613-SH3-9B07D8B-[A-F0-9]{10}$/u);
assert.match(issued.stylometric_fingerprint_v3, /^sha256:[a-f0-9]{64}$/u);
assert.equal(issued.v2_v3_verification.v2.status, 'unchanged');
assert.equal(issued.v2_v3_verification.v3.role, 'forensic_secondary_credential');
assert.equal(issued.v2_v3_verification.promotion_status, 'v3-not-yet-recall-authoritative');
assert.equal(issued.migration_attestation.raw_text_included, false);

const reordered = {
  b: 2,
  a: { z: 1, a: 2 },
  lanes: {
    higher_self: { c: 3 },
    past_self: { b: 2 },
    future_self: { a: 1 }
  }
};
assert.equal(
  stableCanonicalJson(reordered),
  '{"a":{"a":2,"z":1},"b":2,"lanes":{"future_self":{"a":1},"past_self":{"b":2},"higher_self":{"c":3}}}'
);

const changed = await buildV3Issuance(packet({ future: { lexicalEntropyScore: 0.8129 } }));
assert.notEqual(changed.stylometric_fingerprint_v3, issued.stylometric_fingerprint_v3);

console.log('safe-harbor-stylometry-v3: ok');
