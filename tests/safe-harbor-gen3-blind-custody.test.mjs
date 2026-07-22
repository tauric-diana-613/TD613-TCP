import assert from 'node:assert/strict';

import {
  BLIND_CUSTODY_OUTCOMES,
  blindCustodyContainsRawText,
  buildNineWindowSource,
  replayBlindCustodyChallenge,
  REQUIRED_CANDIDATE_CLASSES,
  runBlindCustodyChallenge,
  selectDeterministicHoldout
} from '../app/safe-harbor/app/safe-harbor-gen3-blind-custody.js';

function sentence(label, index, marker = 'However', punctuation = '.') {
  return `${marker} the ${label} route ${index} carries source relations through a bounded chamber, and the record returns with qualification, contrast, evidence order, measured uncertainty, and closure${punctuation}`;
}

function lane(label, marker = 'However', punctuation = '.') {
  return Array.from({ length: 36 }, (_, index) => sentence(label, index + 1, marker, punctuation)).join(' ');
}

function controlText(label, marker = 'However', punctuation = '.') {
  return Array.from({ length: 12 }, (_, index) => sentence(label, index + 1, marker, punctuation)).join(' ');
}

const segments = {
  future_self: lane('future', 'However', '.'),
  past_self: lane('past', 'Although', '?'),
  higher_self: lane('higher', 'Therefore', '!')
};

function candidates(overrides = {}) {
  const base = [
    {
      candidate_id: 'genuine',
      control_class: 'genuine-holdout',
      provenance_class: 'sealed-entrant-holdout',
      text: 'placeholder replaced only after precommitment'
    },
    {
      candidate_id: 'topic-human',
      control_class: 'topic-matched-human-control',
      provenance_class: 'unmistakably-synthetic-topic-human-fixture',
      text: controlText('topic human', 'Meanwhile', '.')
    },
    {
      candidate_id: 'paraphrase',
      control_class: 'semantic-paraphrase-control',
      provenance_class: 'unmistakably-synthetic-semantic-paraphrase-fixture',
      text: controlText('semantic paraphrase', 'Instead', ';')
    },
    {
      candidate_id: 'imitation',
      control_class: 'llm-style-imitation-control',
      provenance_class: 'unmistakably-synthetic-llm-imitation-fixture',
      text: controlText('future', 'However', '.')
    },
    {
      candidate_id: 'register',
      control_class: 'register-shifted-entrant-control',
      provenance_class: 'unmistakably-synthetic-register-shift-fixture',
      text: controlText('register shifted', 'Yo', '!!!')
    },
    {
      candidate_id: 'different-author',
      control_class: 'different-author-same-prompt-control',
      provenance_class: 'unmistakably-synthetic-different-author-fixture',
      text: controlText('different author', 'Consequently', '?')
    },
    {
      candidate_id: 'prompt-only',
      control_class: 'prompt-only-synthetic-control',
      provenance_class: 'unmistakably-synthetic-prompt-only-fixture',
      text: Array.from({ length: 150 }, () => 'heliotrope').join(' ')
    },
    {
      candidate_id: 'lane-genre',
      control_class: 'lane-or-genre-shift-control',
      provenance_class: 'unmistakably-synthetic-lane-genre-fixture',
      text: controlText('genre shift', 'Thus', ':')
    }
  ];
  return base.map((candidate) => ({ ...candidate, ...(overrides[candidate.control_class] || {}) }));
}

const source = await buildNineWindowSource(segments);
assert.equal(source.windows.length, 9);
assert.equal(source.failures.length, 0);
assert.equal(source.window_policy.required_window_count, 9);
assert.equal(source.window_policy.windows_per_lane, 3);
assert.equal(source.window_policy.non_overlapping_within_lane, true);
for (const window of source.windows) {
  assert.equal(window.complete, true);
  assert.ok(window.observed_words >= 120);
  assert.match(window.source_checksum, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(window.raw_text_included, false);
}

const selectionA = await selectDeterministicHoldout(source, {
  selectionNonce: 'synthetic-selection-nonce',
  packetHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
});
const selectionB = await selectDeterministicHoldout(source, {
  packetHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  selectionNonce: 'synthetic-selection-nonce'
});
assert.equal(selectionA.selected_window_id, selectionB.selected_window_id);
assert.equal(selectionA.selection_material_digest, selectionB.selection_material_digest);
assert.equal(selectionA.holdout_checksum, selectionB.holdout_checksum);
assert.equal(selectionA.selected_before_profile_construction, true);
assert.equal(selectionA.eligible_window_count, 9);

const options = {
  researchMode: true,
  explicitConsent: true,
  selectionNonce: 'synthetic-selection-nonce',
  packetHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  createdAtUtc: '2026-07-22T21:00:00Z',
  promptTextsByLane: {
    future_self: 'Write toward the future.',
    past_self: 'Write toward the past.',
    higher_self: 'Write toward a higher relation.'
  }
};

const challengeA = await runBlindCustodyChallenge({ segments, candidates: candidates() }, options);
const challengeB = await runBlindCustodyChallenge({ candidates: candidates(), segments }, {
  createdAtUtc: '2026-07-22T21:00:00Z',
  packetHash: options.packetHash,
  selectionNonce: options.selectionNonce,
  explicitConsent: true,
  researchMode: true,
  promptTextsByLane: {
    higher_self: options.promptTextsByLane.higher_self,
    future_self: options.promptTextsByLane.future_self,
    past_self: options.promptTextsByLane.past_self
  }
});

assert.equal(challengeA.schema_version, 'td613.safe-harbor.blind-custody-challenge/v1');
assert.equal(challengeA.result_digest, challengeB.result_digest, 'challenge must survive input key reordering');
assert.equal(challengeA.protocol.research_mode, true);
assert.equal(challengeA.protocol.baseline_intake_mandatory, false);
assert.equal(challengeA.protocol.holdout_selected_before_profile, true);
assert.equal(challengeA.protocol.profile_frozen_before_reveal, true);
assert.equal(challengeA.protocol.candidate_order_blinded, true);
assert.equal(challengeA.protocol.adverse_results_preserved, true);
assert.equal(challengeA.protocol.raw_text_exported, false);
assert.equal(challengeA.protocol.keystroke_telemetry_collected, false);
assert.equal(challengeA.protocol.pause_timing_collected, false);
assert.equal(challengeA.protocol.external_identity_data_consumed, false);
assert.equal(challengeA.precommitment.profile_frozen_before_reveal, true);
assert.equal(challengeA.precommitment.post_reveal_profile_mutation_forbidden, true);
assert.match(challengeA.precommitment.precommitment_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(challengeA.frozen_profile.frozen_profile_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(challengeA.frozen_profile.feature_policy_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(challengeA.frozen_profile.weights_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(challengeA.frozen_profile.thresholds_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(challengeA.frozen_profile.distance_policy_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(challengeA.blinded_candidates.length, 8);
assert.deepEqual(
  challengeA.blinded_candidates.map((candidate) => candidate.control_class).sort(),
  REQUIRED_CANDIDATE_CLASSES.slice().sort()
);
assert.equal(new Set(challengeA.blinded_candidates.map((candidate) => candidate.blinded_candidate_id)).size, 8);
assert.equal(new Set(challengeA.blinded_candidates.map((candidate) => candidate.rank)).size, 8);
for (const candidate of challengeA.blinded_candidates) {
  assert.match(candidate.feature_digest, /^sha256:[0-9a-f]{64}$/u);
  assert.ok(candidate.distance >= 0 && candidate.distance <= 1);
  assert.equal(candidate.raw_text_included, false);
}
assert.ok(BLIND_CUSTODY_OUTCOMES.includes(challengeA.results.outcome));
assert.deepEqual(challengeA.results.all_outcomes_permitted, BLIND_CUSTODY_OUTCOMES);
assert.equal(challengeA.presentation_authority.renderer_may_suppress_adverse_result, false);
assert.equal(challengeA.raw_text_included, false);
assert.equal(blindCustodyContainsRawText(challengeA), false);
assert.equal(JSON.stringify(challengeA).includes(segments.future_self.slice(0, 100)), false);
assert.equal(JSON.stringify(challengeA).includes('civil identity proved'), false);

const replay = await replayBlindCustodyChallenge(challengeA, { segments, candidates: candidates() }, options);
assert.equal(replay.status, 'pass');
assert.equal(replay.checks.selection_material_digest, true);
assert.equal(replay.checks.selected_window_id, true);
assert.equal(replay.checks.holdout_checksum, true);
assert.equal(replay.checks.precommitment_digest, true);
assert.equal(replay.checks.frozen_profile_digest, true);
assert.equal(replay.checks.result_digest, true);
assert.equal(replay.replayed_outcome, challengeA.results.outcome);

const closedGate = await runBlindCustodyChallenge({ segments, candidates: candidates() }, {
  ...options,
  researchMode: false
});
assert.equal(closedGate.results.outcome, 'CONTAMINATED');
assert.ok(closedGate.failure_registry.some((failure) => failure.code === 'RESEARCH-GATE-CLOSED'));
assert.equal(closedGate.presentation_authority.authority_reduced, true);
assert.equal(closedGate.presentation_authority.reduction_reason, 'CHALLENGE CONTAMINATION: PRESENT');

const mutatedProfile = await runBlindCustodyChallenge({ segments, candidates: candidates() }, {
  ...options,
  postFreezeProfileDigest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
});
assert.equal(mutatedProfile.results.outcome, 'CONTAMINATED');
assert.ok(mutatedProfile.results.contamination_reasons.includes('post-freeze-profile-mutation'));
assert.ok(mutatedProfile.failure_registry.some((failure) => failure.reason === 'post-freeze-profile-mutation'));

const missingClassCandidates = candidates().slice(0, 7);
const missingClass = await runBlindCustodyChallenge({ segments, candidates: missingClassCandidates }, options);
assert.equal(missingClass.results.outcome, 'CONTAMINATED');
assert.ok(missingClass.failure_registry.some((failure) => failure.code === 'CANDIDATE-COUNT'));
assert.ok(missingClass.failure_registry.some((failure) => failure.code === 'CANDIDATE-CONTROL-CLASSES'));

const promptDominatedText = Array.from({ length: 180 }, () => 'heliotrope').join(' ');
const promptDominated = await runBlindCustodyChallenge({
  segments,
  candidates: candidates({
    'topic-matched-human-control': { text: promptDominatedText },
    'semantic-paraphrase-control': { text: promptDominatedText },
    'llm-style-imitation-control': { text: promptDominatedText },
    'register-shifted-entrant-control': { text: promptDominatedText },
    'different-author-same-prompt-control': { text: promptDominatedText },
    'prompt-only-synthetic-control': { text: promptDominatedText },
    'lane-or-genre-shift-control': { text: promptDominatedText }
  })
}, {
  ...options,
  promptTextsByClass: Object.fromEntries(REQUIRED_CANDIDATE_CLASSES.map((controlClass) => [controlClass, 'heliotrope']))
});
assert.equal(promptDominated.results.outcome, 'PROMPT-DOMINATED');
assert.ok(promptDominated.results.prompt_and_topic_leakage_rate >= promptDominated.frozen_profile.thresholds.prompt_leakage_rate);
assert.equal(promptDominated.presentation_authority.reduction_reason, 'PROMPT DOMINANCE: PRESENT');

const imitationCollision = await runBlindCustodyChallenge({
  segments,
  candidates: candidates({
    'llm-style-imitation-control': { text: lane('future', 'However', '.') }
  })
}, {
  ...options,
  thresholds: { imitation_collision_margin: 1 }
});
assert.equal(imitationCollision.results.outcome, 'IMITATION-COLLISION');
assert.equal(imitationCollision.results.imitation_collision, true);
assert.equal(imitationCollision.presentation_authority.authority_reduced, true);
assert.equal(imitationCollision.presentation_authority.reduction_reason, 'AI IMITATION COLLISION: PRESENT');

const shortSource = await runBlindCustodyChallenge({
  segments: {
    future_self: 'brief future sentence.',
    past_self: 'brief past sentence.',
    higher_self: 'brief higher sentence.'
  },
  candidates: candidates()
}, options);
assert.equal(shortSource.results.outcome, 'CONTAMINATED');
assert.ok(shortSource.failure_registry.some((failure) => failure.code === 'SOURCE-WINDOW-INCOMPLETE'));
assert.ok(shortSource.failure_registry.some((failure) => failure.code === 'NO-ELIGIBLE-HOLDOUT'));

console.log('safe-harbor-gen3-blind-custody: ok');
