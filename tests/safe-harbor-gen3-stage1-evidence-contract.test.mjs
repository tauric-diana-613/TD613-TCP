import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  applyGen3Stage1Prehash,
  buildSamplingSufficiency,
  countersignEntrantAuthorshipBinding,
  evidenceContractContainsRawText,
  finalizeGen3Stage1Overlay,
  HISTORICAL_EXAMPLE,
  SYNTHETIC_SHI,
  validateGen3ShiExactMatch
} from '../app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js';
import {
  computePacketHash,
  finalizeSafeHarborPacket
} from '../app/safe-harbor/app/safe-harbor-native-finalizer.js';
import { expectedV2BadgeNumber } from '../app/safe-harbor/app/safe-harbor-authority-verifier.js';

const makeWords = (prefix, count) => Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`).join(' ');
const segments = {
  future_self: makeWords('future', 360),
  past_self: makeWords('past', 360),
  higher_self: makeWords('higher', 360)
};

function lane(key, text) {
  const wordCount = text.trim().split(/\s+/u).length;
  return {
    source: 'safe-harbor.local',
    lane: key,
    char_count: text.length,
    word_count: wordCount,
    sentence_count: 3,
    avg_word_length: 7,
    avg_sentence_length: 120,
    punctuation_density: 0.01,
    line_break_density: 0,
    unique_ratio: 1,
    punctuation_mix: { comma: 0, dash: 0, colon: 0, semicolon: 0, exclamation: 0, question: 0 },
    dominant_axes: ['synthetic', 'fixture'],
    temporal_posture: key === 'future_self' ? 'forward' : key === 'past_self' ? 'backward' : 'orthogonal',
    dominant_operator: 'F',
    governed_exposure_depth: 0.5,
    closure_class: 'closed',
    frame_alignment: 'aligned',
    frame_alignment_note: null
  };
}

function packetFixture() {
  const signatures = Object.fromEntries(Object.entries(segments).map(([key, text]) => [key, lane(key, text)]));
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v1',
    packet_id: 'GEN3-STAGE1-SYNTHETIC',
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
      stylometric_fingerprint: 'synthetic-stage1-fingerprint',
      triad_word_counts: { future_self: 360, past_self: 360, higher_self: 360 },
      triad_shortfalls: { future_self: 0, past_self: 0, higher_self: 0 },
      stylometric_provenance: { divergence_signature: { compact: 'synthetic fixture' } }
    },
    signature: { status: 'declared', sig: null, attached_at: null },
    bridge: { covenant_gate: { confirmed: true }, export_gate: { ready: true, state: 'harbor-eligible', blockers: [] } }
  };
  packet.issuance.badge_number = expectedV2BadgeNumber(packet);
  return packet;
}

const sufficiency = buildSamplingSufficiency(segments);
assert.equal(sufficiency.triad_state, 'stability-eligible');
assert.deepEqual(sufficiency.checkpoint_targets, [120, 240, 360]);
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 119), past_self: makeWords('b', 120), higher_self: makeWords('c', 240) }).lanes.future_self.state, 'insufficient');
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 119), past_self: makeWords('b', 120), higher_self: makeWords('c', 240) }).lanes.past_self.state, 'provisional');
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 119), past_self: makeWords('b', 120), higher_self: makeWords('c', 240) }).lanes.higher_self.state, 'comparative');
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.future_self.state, 'provisional');
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.past_self.state, 'comparative');
assert.equal(buildSamplingSufficiency({ future_self: makeWords('a', 239), past_self: makeWords('b', 359), higher_self: makeWords('c', 360) }).lanes.higher_self.state, 'stability-eligible');

const prehash = applyGen3Stage1Prehash(packetFixture(), { segments, promptSetVersion: 'temporal-triad/v2' });
assert.equal(prehash.canon.shi_number, prehash.issuance.badge_number);
assert.equal(prehash.authorship_evidence.schema_version, 'td613.safe-harbor.authorship-evidence/v1');
assert.equal(prehash.authorship_evidence.evidence_contract.historical_example, HISTORICAL_EXAMPLE);
assert.equal(prehash.authorship_evidence.evidence_contract.identity_or_ownership_adjudication, false);
assert.equal(prehash.authorship_evidence.elicitation_context.keystroke_telemetry_collected, false);
assert.equal(evidenceContractContainsRawText(prehash), false);
assert.equal(JSON.stringify(prehash.authorship_evidence).includes(segments.future_self), false);

const baselineFinalized = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false
});
const finalized = await finalizeSafeHarborPacket(packetFixture(), {
  mode: 'native',
  segments,
  includePhase5: true,
  includeTamperFixtures: false,
  includeGen3Stage1: true,
  gen3Context: { promptSetVersion: 'temporal-triad/v2' }
});
assert.equal(finalized.issuance.stylometric_fingerprint_v3, baselineFinalized.issuance.stylometric_fingerprint_v3, 'Stage 1 must not migrate the SH3 fingerprint preimage');
assert.equal(finalized.issuance.badge_number_v3, baselineFinalized.issuance.badge_number_v3, 'Stage 1 must not migrate the SH3 credential');
const overlaid = finalizeGen3Stage1Overlay(finalized);
assert.equal(overlaid.binding_provenance.entrant_authorship_binding.entrant_credential.packet_hash_sha256, finalized.packet_hash_sha256);
assert.equal(overlaid.binding_provenance.entrant_authorship_binding.entrant_credential.shi_number, finalized.issuance.badge_number);
assert.equal(validateGen3ShiExactMatch(overlaid).status, 'pass');
assert.equal(await computePacketHash(overlaid), overlaid.packet_hash_sha256, 'entrant binding overlay must remain outside native packet-hash preimage');

const mismatch = JSON.parse(JSON.stringify(overlaid));
mismatch.canon.shi_number = SYNTHETIC_SHI;
const heldMismatch = finalizeGen3Stage1Overlay(mismatch);
assert.equal(heldMismatch.bridge.export_gate.ready, false);
assert.ok(heldMismatch.bridge.export_gate.blockers.includes('gen3-shi-exact-match'));
assert.equal(heldMismatch.gen3_evidence_contract.shi_exact_match.reason, 'shi-mismatch');

const missing = JSON.parse(JSON.stringify(overlaid));
delete missing.canon.shi_number;
assert.equal(validateGen3ShiExactMatch(missing).reason, 'missing-shi');

const signedA = await countersignEntrantAuthorshipBinding(overlaid, {
  signatureType: 'synthetic-local-digest',
  signedAtUtc: '2026-07-22T01:02:03Z'
});
const signedB = await countersignEntrantAuthorshipBinding(overlaid, {
  signatureType: 'synthetic-local-digest',
  signedAtUtc: '2026-07-22T01:02:03Z'
});
assert.equal(signedA.binding_provenance.entrant_authorship_binding.countersignature.status, 'countersigned');
assert.equal(signedA.binding_provenance.entrant_authorship_binding.countersignature.signature_digest, signedB.binding_provenance.entrant_authorship_binding.countersignature.signature_digest);
assert.equal(signedA.temporal_lineage.root_binding_authority.recorded_ts_utc, '2025-08-11T03:58:39Z');
assert.equal(signedA.temporal_lineage.badge_protocol_history.historical_example, HISTORICAL_EXAMPLE);
assert.equal(signedA.temporal_lineage.entrant_countersignature_authority.recorded_ts_utc, '2026-07-22T01:02:03Z');

const footerHistory = readFileSync(new URL('../app/safe-harbor/app/footer-history-packet.js', import.meta.url), 'utf8');
assert.ok(footerHistory.includes(`const HISTORICAL_EXAMPLE = '${HISTORICAL_EXAMPLE}'`));
const docsIndex = readFileSync(new URL('../docs/safe-harbor/README.md', import.meta.url), 'utf8');
assert.ok(docsIndex.includes('Khona‌lit-po'), 'ZWNJ-sensitive covenant spelling must survive');

const governedFiles = [
  '../app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js',
  '../app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json',
  '../app/safe-harbor/schemas/td613-safe-harbor.entrant-authorship-binding.v1.schema.json',
  './safe-harbor-gen3-stage1-evidence-contract.test.mjs'
].map((relative) => readFileSync(new URL(relative, import.meta.url), 'utf8')).join('\n');
const concreteShis = governedFiles.match(/TD613-SH-9B07D8B-[0-9A-F]{8}/gu) || [];
assert.ok(concreteShis.every((value) => value === SYNTHETIC_SHI), `unexpected concrete SHI fixture: ${concreteShis.join(', ')}`);

console.log('safe-harbor-gen3-stage1-evidence-contract: ok');
