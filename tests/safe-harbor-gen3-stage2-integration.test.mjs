import assert from 'node:assert/strict';

import { expectedV2BadgeNumber } from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';
import { computePacketHash, finalizeSafeHarborPacket } from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import { finalizePacketThroughPipeline } from '../app/safe-harbor/app/safe-harbor-packet-pipeline.js';

function sentence(label, index) {
  return `The ${label} lane returns through measured sentence ${index}, carrying declared limits, recurrent function words, bounded punctuation, and traceable structure.`;
}

function text(label) {
  return Array.from({ length: 30 }, (_, index) => sentence(label, index + 1)).join(' ');
}

const segments = {
  future_self: text('future'),
  past_self: text('past'),
  higher_self: text('higher')
};

function thinLane(key, value) {
  const words = value.trim().split(/\s+/u);
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: value.length,
    word_count: words.length,
    sentence_count: 30,
    avg_word_length: 6,
    avg_sentence_length: 15,
    punctuation_density: 0.02,
    line_break_density: 0,
    unique_ratio: 0.6,
    punctuation_mix: { comma: 0.5, dash: 0, colon: 0, semicolon: 0, exclamation: 0, question: 0 },
    dominant_axes: ['bounded', 'recurrent'],
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.5,
    closure_class: 'closed',
    frame_alignment: 'aligned',
    frame_alignment_note: null
  };
}

function packetFixture() {
  const signatures = Object.fromEntries(Object.entries(segments).map(([key, value]) => [key, thinLane(key, value)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'GEN3-STAGE2-SYNTHETIC',
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
      triad_word_counts: Object.fromEntries(Object.entries(signatures).map(([key, lane]) => [key, lane.word_count])),
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'synthetic fixture' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [], scrub_passed: true } }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  return packet;
}

const baseline = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false
});

const staged = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  includeGen3Stage2: true,
  gen3Context: {
    promptSetVersion: 'temporal-triad/v2',
    promptVocabularyByLane: {
      future_self: ['future'],
      past_self: ['past'],
      higher_self: ['higher']
    }
  }
});

assert.equal(staged.issuance.stylometric_fingerprint_v3, baseline.issuance.stylometric_fingerprint_v3, 'Stage 2 must not migrate the SH3 fingerprint');
assert.equal(staged.issuance.badge_number_v3, baseline.issuance.badge_number_v3, 'Stage 2 must not migrate the SH3 credential');
assert.equal(staged.authorship_evidence.authorship_maturity.schema_version, 'td613.safe-harbor.authorship-maturity/v1');
assert.equal(staged.authorship_evidence.stability_receipt.stability_digest, staged.authorship_evidence.authorship_maturity.stability_receipt.stability_digest);
assert.equal(await computePacketHash(staged), staged.packet_hash_sha256, 'Stage 2 evidence must be covered by the declared native packet hash');
assert.equal(JSON.stringify(staged).includes(segments.future_self), false, 'raw entrant text must not enter the packet');

const pipeline = await finalizePacketThroughPipeline(packetFixture(), { ingress: { segments } }, {
  promptVocabularyByLane: {
    future_self: ['future'],
    past_self: ['past'],
    higher_self: ['higher']
  }
});
assert.equal(pipeline.authorship_evidence.authorship_maturity.schema_version, 'td613.safe-harbor.authorship-maturity/v1');
assert.equal(pipeline.forensic_authorship.gen3_report_contract.report_version, 'stage2-authorship-maturity/v1');
assert.ok(['measured-with-bounds', 'insufficient'].includes(pipeline.forensic_authorship.gen3_report_contract.sections.authorship_signature.status));
assert.equal(pipeline.forensic_authorship.gen3_report_contract.interpretation_provenance.raw_text_consumed, false);
assert.equal(pipeline.forensic_authorship.gen3_report_contract.interpretation_provenance.external_identity_data_consumed, false);
assert.equal(JSON.stringify(pipeline).includes(segments.past_self), false);

const replay = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  includeGen3Stage2: true,
  gen3Context: {
    promptSetVersion: 'temporal-triad/v2',
    promptVocabularyByLane: {
      higher_self: ['higher'],
      future_self: ['future'],
      past_self: ['past']
    }
  }
});
assert.equal(staged.packet_hash_sha256, replay.packet_hash_sha256, 'Stage 2 packet hashing must be deterministic under option key reordering');
assert.equal(staged.authorship_evidence.stability_receipt.stability_digest, replay.authorship_evidence.stability_receipt.stability_digest);

console.log('safe-harbor-gen3-stage2-integration: ok');
