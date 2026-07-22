import assert from 'node:assert/strict';
import {
  BLIND_CUSTODY_SCHEMA,
  createBlindPrecommitment,
  runBlindCustodyChallenge,
  replayBlindCustodyChallenge,
  blindChallengeContainsRawText
} from '../app/safe-harbor/research/safe-harbor-blind-custody-challenge.js';

function features(seed, punctuation = seed % 4) {
  return {
    micro: { sentence_length: 18 + seed, punctuation_density: punctuation / 10, function_word_density: 0.31 + seed / 1000 },
    meso: { qualification_rate: 0.2 + seed / 100, operational_closure_rate: 0.4 + seed / 100 },
    macro: { recursive_return_rate: 0.3 + seed / 100, evidence_ordering: 0.55 + seed / 100 }
  };
}
const ids = ['F1','F2','F3','P1','P2','P3','H1','H2','H3'];
const windows = ids.map((window_id, index) => ({ window_id, lane: window_id[0], observed_words: 120 + (index % 3), features: features(index + 1) }));
const packetHash = `sha256:${'a'.repeat(64)}`;
const preA = await createBlindPrecommitment({ windows, packet_hash_sha256: packetHash, selection_nonce: 'synthetic-nonce', sequestered_at_utc: '2026-07-22T00:00:00Z' });
const preB = await createBlindPrecommitment({ windows: [...windows].reverse(), packet_hash_sha256: packetHash, selection_nonce: 'synthetic-nonce', sequestered_at_utc: '2026-07-22T00:00:00Z' });
assert.equal(preA.status, 'PRECOMMITTED');
assert.equal(preA.precommitment.precommitment_digest, preB.precommitment.precommitment_digest);
assert.equal(preA.profile_construction.included_window_ids.length, 8);
assert.ok(!preA.profile_construction.included_window_ids.includes(preA.sealed_state.holdout_window_id));
assert.equal(preA.precommitment.holdout_window_id, 'sealed');
assert.equal(preA.precommitment.raw_text_included, false);
const mutated = structuredClone(preA);
mutated.profile_construction.thresholds.minimum_separation_margin = 0.9;

function control(candidate_id, control_class, seed, provenance = 'unmistakably synthetic fixture') {
  return { candidate_id, control_class, provenance, features: features(seed) };
}
const controls = [
  control('human-a','topic_matched_human',25), control('human-b','topic_matched_human',28),
  control('para-a','semantic_paraphrase',20), control('para-b','semantic_paraphrase',23),
  control('llm-a','llm_style_imitation',1), control('llm-b','llm_style_imitation',30),
  control('register','entrant_register_shift',10)
];
const result = await runBlindCustodyChallenge({ precommitment_bundle: preA, controls, ranking_nonce: 'rank-nonce', calibration_triads_completed: 3 });
assert.equal(result.schema_version, BLIND_CUSTODY_SCHEMA);
assert.equal(result.challenge_set.candidate_labels_blinded_during_ranking, true);
assert.equal(result.challenge_set.genuine_holdout_count, 1);
assert.equal(result.results.complete_blinded_rank_order.length, 8);
assert.ok(['IMITATION-COLLISION','SUPPORTED','INCONCLUSIVE','FAILED'].includes(result.results.challenge_result));
assert.equal(result.research_gate.status, 'research-only-unpromoted');
assert.equal(result.research_gate.baseline_intake_authorized, false);
assert.ok(result.research_gate.promotion_blockers.includes('twelve-distinct-triads-not-complete'));
assert.equal(blindChallengeContainsRawText(result), false);
assert.equal(result.psychological_inference_performed, false);
assert.equal(result.demographic_inference_performed, false);
assert.match(result.result_digest, /^sha256:[0-9a-f]{64}$/u);
const replay = await replayBlindCustodyChallenge({ precommitment_bundle: preA, controls, ranking_nonce: 'rank-nonce', calibration_triads_completed: 3 }, result);
assert.equal(replay.status, 'pass');
const contaminated = await runBlindCustodyChallenge({ precommitment_bundle: mutated, controls, ranking_nonce: 'rank-nonce' });
assert.equal(contaminated.results.challenge_result, 'CONTAMINATED');
assert.ok(contaminated.failure_registry.some((entry) => entry.code === 'post-freeze-policy-mutation'));
const rawPre = await createBlindPrecommitment({ windows: windows.map((window, index) => index === 0 ? { ...window, raw_text: 'forbidden' } : window), packet_hash_sha256: packetHash, selection_nonce: 'x' });
assert.equal(rawPre.status, 'CONTAMINATED');
assert.ok(rawPre.errors.includes('raw-text-present'));
const changedPolicy = await createBlindPrecommitment({ windows, packet_hash_sha256: packetHash, selection_nonce: 'synthetic-nonce', profile_policy: { minimum_separation_margin: 0.2 } });
assert.notEqual(changedPolicy.precommitment.precommitment_digest, preA.precommitment.precommitment_digest);
console.log('blind custody: ok');
