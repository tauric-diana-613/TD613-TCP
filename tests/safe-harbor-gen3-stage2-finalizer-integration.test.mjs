import assert from 'node:assert/strict';

import {
  computePacketHash,
  finalizeSafeHarborPacket
} from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import { expectedV2BadgeNumber } from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import { finalizeGen3Stage1Overlay } from '../app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js';

function laneText(prefix, marker) {
  return Array.from({ length: 34 }, (_, index) => (
    `${marker} ${prefix} route ${index + 1} carries evidence through a bounded chamber, and the record returns with source care, qualification, contrast, uncertainty, and closure.`
  )).join(' ');
}

const segments = {
  future_self: laneText('future', 'however'),
  past_self: laneText('past', 'although'),
  higher_self: laneText('higher', 'therefore')
};

function signature(key, text) {
  const wordCount = text.trim().split(/\s+/u).length;
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: text.length,
    word_count: wordCount,
    sentence_count: 34,
    avg_word_length: 7,
    avg_sentence_length: wordCount / 34,
    punctuation_density: 0.01,
    line_break_density: 0,
    unique_ratio: 0.5,
    punctuation_mix: { comma: 1, dash: 0, colon: 0, semicolon: 0, exclamation: 0, question: 0 },
    dominant_axes: ['synthetic', 'stage2'],
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.5,
    closure_class: 'closed',
    frame_alignment: 'aligned',
    frame_alignment_note: null
  };
}

function packetFixture() {
  const signatures = Object.fromEntries(Object.entries(segments).map(([key, text]) => [key, signature(key, text)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'GEN3-STAGE2-FINALIZER-SYNTHETIC',
    created_at: '2026-07-22T00:00:00Z',
    canon: {
      principal: 'tauric.diana.613',
      badge_id: 'bdg_glyph_U10D613',
      claimed_pua: 'U+10D613',
      canonical_phrase: 'Tauric Diana - Crimean heritage custodianship',
      display_phrase: 'Covenant: Blood Rite 613',
      binding_fragment: '#9B07D8B',
      sac: 'SAC[X6ZNK5NO51]',
      footer_mode: 'legacy-compat'
    },
    binding_provenance: {
      schema_version: 'td613.safe-harbor.binding-provenance/v1',
      principal: 'tauric.diana.613',
      claim: {},
      canonical_declaration: {},
      binding_event: { recorded_ts_utc: '2025-08-11T03:58:39Z' },
      legacy_corpus_root: {},
      symbol_roles: {},
      evidence_status: {},
      claim_ceiling: 'Synthetic fixture; packet-internal custody only.'
    },
    intake: { ts_utc: '2026-07-22T00:00:00Z', status: 'issued' },
    analysis: {
      segment_cadence_signatures: signatures,
      triad_resonance: 0.8,
      cross_lane_stability: 0.75,
      cross_lane_spread: 0.25
    },
    issuance: {
      badge_number: null,
      stylometric_fingerprint: 'synthetic-stage2-fingerprint',
      triad_word_counts: Object.fromEntries(Object.entries(segments).map(([key, text]) => [key, text.trim().split(/\s+/u).length])),
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'synthetic fixture' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [] } }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  return packet;
}

const stage1 = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  includeGen3Stage2: false,
  gen3Context: { promptSetVersion: 'temporal-triad/v2' }
});

const stage2 = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  includeGen3Stage2: true,
  gen3Context: { promptSetVersion: 'temporal-triad/v2' },
  stage2Context: {
    promptTexts: {
      future_self: 'Write toward the future.',
      past_self: 'Write toward the past.',
      higher_self: 'Write toward a higher relation.'
    }
  }
});

assert.equal(stage2.issuance.stylometric_fingerprint_v3, stage1.issuance.stylometric_fingerprint_v3, 'Stage 2 must not migrate the SH3 fingerprint');
assert.equal(stage2.issuance.badge_number_v3, stage1.issuance.badge_number_v3, 'Stage 2 must not migrate the SH3 credential');
assert.notEqual(stage2.packet_hash_sha256, stage1.packet_hash_sha256, 'hash-covered Stage 2 evidence must alter the native packet hash');
assert.equal(await computePacketHash(stage2), stage2.packet_hash_sha256, 'Stage 2 packet hash must replay');
assert.equal(stage2.authorship_evidence.authorship_maturity.schema_version, 'td613.safe-harbor.authorship-maturity-evidence/v1');
assert.match(stage2.authorship_evidence.authorship_maturity.evidence_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(stage2.authorship_evidence.stability_receipt.stability_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(stage2.authorship_evidence.stability_receipt.identity_probability, null);
assert.equal(stage2.authorship_evidence.authorship_maturity.raw_text_included, false);
assert.equal(JSON.stringify(stage2.authorship_evidence).includes(segments.future_self.slice(0, 80)), false);
assert.equal(stage2.authorship_evidence.authorship_maturity.local_window_evidence_index.future_self.length, 3);
assert.equal(stage2.authorship_evidence.authorship_maturity.lane_sufficiency.future_self, 'stability-eligible');
assert.equal(stage2.authorship_evidence.prompt_conditioned_features.vocabulary_ablation_applied, true);
assert.equal(stage2.authorship_evidence.prompt_conditioned_features.prompt_text_exported, false);

const overlaid = finalizeGen3Stage1Overlay(stage2);
assert.equal(overlaid.binding_provenance.entrant_authorship_binding.entrant_credential.stability_digest, stage2.authorship_evidence.stability_receipt.stability_digest);
assert.equal(await computePacketHash(overlaid), overlaid.packet_hash_sha256, 'post-hash entrant binding must preserve Stage 2 native hash replay');
assert.equal(overlaid.gen3_evidence_contract.shi_exact_match.status, 'pass');

const changedSegments = { ...segments, higher_self: `${segments.higher_self} However one additional bounded sentence returns.` };
const changed = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments: changedSegments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  includeGen3Stage2: true
});
assert.notEqual(changed.authorship_evidence.authorship_maturity.evidence_digest, stage2.authorship_evidence.authorship_maturity.evidence_digest, 'observable source change must alter maturity evidence digest');
assert.notEqual(changed.authorship_evidence.stability_receipt.stability_digest, stage2.authorship_evidence.stability_receipt.stability_digest, 'observable source change must alter stability digest');

console.log('safe-harbor-gen3-stage2-finalizer-integration: ok');
