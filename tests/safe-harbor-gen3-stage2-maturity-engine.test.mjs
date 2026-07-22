import assert from 'node:assert/strict';

import {
  applyAuthorshipMaturityEvidence,
  auditEntrantSwap,
  buildAuthorshipMaturityEvidence,
  GEN3_MATURITY_ENGINE_VERSION,
  maturityEngineContainsForbiddenClaim,
  maturityEngineContainsRawText
} from '../app/safe-harbor/app/safe-harbor-gen3-maturity-engine.js';

function sentence(prefix, index, marker = 'however') {
  return `${marker} ${prefix} route ${index} carries evidence through a bounded chamber, and the record returns with source care, qualification, contrast, measured uncertainty, and operational closure.`;
}

function lane(prefix, marker, count = 30) {
  return Array.from({ length: count }, (_, index) => sentence(prefix, index + 1, marker)).join(' ');
}

const segments = {
  future_self: lane('future', 'however'),
  past_self: lane('past', 'although'),
  higher_self: lane('higher', 'therefore')
};
const promptTexts = {
  future_self: 'Describe a future route using the prompt-only token heliotrope.',
  past_self: 'Describe a past route using the prompt-only token heliotrope.',
  higher_self: 'Describe a higher route using the prompt-only token heliotrope.'
};

const first = await buildAuthorshipMaturityEvidence(segments, { promptTexts });
const second = await buildAuthorshipMaturityEvidence({
  higher_self: segments.higher_self,
  future_self: segments.future_self,
  past_self: segments.past_self
}, { promptTexts: {
  past_self: promptTexts.past_self,
  higher_self: promptTexts.higher_self,
  future_self: promptTexts.future_self
} });

assert.equal(first.engine_version, GEN3_MATURITY_ENGINE_VERSION);
assert.equal(first.evidence_digest, second.evidence_digest, 'object key order must not alter deterministic evidence');
assert.equal(first.stability_receipt.stability_digest, second.stability_receipt.stability_digest);
assert.equal(first.raw_text_included, false);
assert.equal(first.stability_receipt.raw_text_included, false);
assert.equal(first.stability_receipt.identity_probability, null);
assert.equal(maturityEngineContainsRawText(first), false);
assert.equal(JSON.stringify(first).includes(segments.future_self.slice(0, 80)), false);
assert.equal(JSON.stringify(first).includes('heliotrope'), false);
assert.equal(maturityEngineContainsForbiddenClaim(first), false);
assert.equal(first.window_policy.sentence_aware, true);
assert.deepEqual(first.window_policy.checkpoint_targets, [120, 240, 360]);
assert.equal(first.window_policy.required_local_windows_per_lane, 3);
assert.equal(first.window_policy.non_overlapping_local_windows, true);

for (const laneId of ['future_self', 'past_self', 'higher_self']) {
  const laneEvidence = first.lanes[laneId];
  assert.equal(laneEvidence.sufficiency_state, 'stability-eligible');
  assert.equal(laneEvidence.local_windows.length, 3);
  assert.ok(laneEvidence.checkpoint_snapshots['120'].observed_words >= 120);
  assert.ok(laneEvidence.checkpoint_snapshots['240'].observed_words >= 240);
  assert.ok(laneEvidence.checkpoint_snapshots['360'].observed_words >= 360);
  assert.equal(laneEvidence.checkpoint_snapshots['120'].start_unit, 0);
  assert.equal(laneEvidence.checkpoint_snapshots['240'].start_unit, 0);
  assert.equal(laneEvidence.checkpoint_snapshots['360'].start_unit, 0);
  assert.equal(laneEvidence.local_windows.every((window) => window.complete), true);
  assert.ok(laneEvidence.local_windows[1].start_unit >= laneEvidence.local_windows[0].end_unit_exclusive);
  assert.ok(laneEvidence.local_windows[2].start_unit >= laneEvidence.local_windows[1].end_unit_exclusive);
  assert.equal(new Set(laneEvidence.local_windows.map((window) => window.evidence_id)).size, 3);
  assert.match(laneEvidence.local_windows[0].evidence_digest, /^sha256:[0-9a-f]{64}$/u);
  assert.ok(['chronology-sensitive-candidate', 'chronology-non-diagnostic'].includes(laneEvidence.chronology_null.authority));
  for (const family of Object.values(laneEvidence.within_lane_recurrence)) {
    assert.equal(family.complete_windows, 3);
    assert.equal(family.status, 'measured');
    assert.ok(family.local_window_similarity >= 0 && family.local_window_similarity <= 1);
  }
}

for (const [familyId, family] of Object.entries(first.family_summaries)) {
  assert.ok(['rhythm', 'punctuation', 'function_words', 'discourse', 'lexical_shape'].includes(familyId));
  assert.ok(family.within_lane_similarity >= 0 && family.within_lane_similarity <= 1);
  assert.ok(family.cross_lane_similarity >= 0 && family.cross_lane_similarity <= 1);
  assert.ok(['recurrent-stable', 'context-responsive', 'unstable', 'prompt-dependent'].includes(family.status));
  assert.ok(['low', 'moderate', 'high'].includes(family.prompt_sensitivity));
}

assert.ok([
  'mature-recurrent',
  'mature-context-responsive',
  'unstable-evidence',
  'prompt-dominated'
].includes(first.stability_receipt.maturity_state));
assert.match(first.stability_receipt.stability_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(first.stability_receipt.uncertainty.model_dependent, false);
assert.ok(first.stability_receipt.uncertainty.statement.includes('do not adjudicate identity'));
assert.equal(first.null_models.prompt_only.authority, 'measured');
assert.equal(Object.keys(first.null_models.chronology_destruction).length, 3);
assert.equal(first.forbidden_inference_audit.status, 'pass');
assert.ok(first.anti_sameness_audit.rule.includes('calibration concern'));

const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  authorship_evidence: {
    schema_version: 'td613.safe-harbor.authorship-evidence/v1',
    checkpoint_snapshots: {},
    within_lane_invariants: {},
    cross_lane_invariants: {},
    prompt_conditioned_features: {},
    stability_receipt: { status: 'pending-stage2-measurement' }
  }
};
const applied = applyAuthorshipMaturityEvidence(packet, first);
assert.equal(applied.authorship_evidence.stability_receipt.stability_digest, first.stability_receipt.stability_digest);
assert.equal(applied.authorship_evidence.authorship_maturity.raw_text_included, false);
assert.equal(applied.authorship_evidence.authorship_maturity.evidence_digest, first.evidence_digest);
assert.equal(packet.authorship_evidence.stability_receipt.status, 'pending-stage2-measurement', 'application must not mutate source packet');

const shortEvidence = await buildAuthorshipMaturityEvidence({
  future_self: 'brief future sentence.',
  past_self: 'brief past sentence.',
  higher_self: 'brief higher sentence.'
});
assert.equal(shortEvidence.stability_receipt.maturity_state, 'insufficient');
assert.equal(shortEvidence.stability_receipt.status, 'bounded-with-blockers');
assert.ok(shortEvidence.stability_receipt.blockers.includes('future_self:insufficient'));
assert.ok(shortEvidence.stability_receipt.blockers.includes('past_self:local-window-shortfall'));
assert.equal(shortEvidence.lanes.future_self.local_windows[1].complete, false);

const promptDominatedText = Array.from({ length: 400 }, () => 'heliotrope').join(' ');
const promptDominated = await buildAuthorshipMaturityEvidence({
  future_self: promptDominatedText,
  past_self: promptDominatedText,
  higher_self: promptDominatedText
}, { promptTexts: {
  future_self: 'heliotrope',
  past_self: 'heliotrope',
  higher_self: 'heliotrope'
} });
assert.equal(promptDominated.prompt_conditioned_features.prompt_dominated, true);
assert.equal(promptDominated.stability_receipt.maturity_state, 'prompt-dominated');
assert.ok(promptDominated.stability_receipt.blockers.includes('prompt-dominated'));
assert.equal(promptDominated.family_summaries.lexical_shape.status, 'prompt-dependent');

const identical = await buildAuthorshipMaturityEvidence({
  future_self: segments.future_self,
  past_self: segments.future_self,
  higher_self: segments.future_self
});
assert.equal(identical.anti_sameness_audit.status, 'review-required');
assert.equal(identical.anti_sameness_audit.exact_cross_lane_vector_duplicate, true);

const controlVector = first.lanes.future_self.checkpoint_snapshots['360'].feature_vector;
const controlled = await buildAuthorshipMaturityEvidence(segments, {
  promptTexts,
  controlProfiles: {
    'topic-matched-human-synthetic': {
      control_class: 'topic-matched-human-synthetic',
      feature_vector: controlVector
    }
  }
});
assert.equal(controlled.null_models.supplied_controls['topic-matched-human-synthetic'].status, 'measured');
assert.ok(controlled.null_models.supplied_controls['topic-matched-human-synthetic'].mean_similarity >= 0);

const reportA = {
  sections: { authorship_signature: { content: { claim: 'same generic signature' } } },
  evidence_links: { E1: { path: 'same' } }
};
const reportB = JSON.parse(JSON.stringify(reportA));
assert.equal(auditEntrantSwap(reportA, reportB).status, 'review-required');
const reportC = {
  sections: { authorship_signature: { content: { claim: 'materially different evidence-linked signature' } } },
  evidence_links: { E2: { path: 'different' } }
};
assert.equal(auditEntrantSwap(reportA, reportC).status, 'pass');

assert.equal(maturityEngineContainsForbiddenClaim({ claim: 'This proves personality and intelligence.' }), true);

console.log('safe-harbor-gen3-stage2-maturity-engine: ok');
