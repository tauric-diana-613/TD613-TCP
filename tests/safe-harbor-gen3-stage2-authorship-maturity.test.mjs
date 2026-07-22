import assert from 'node:assert/strict';

import {
  applyGen3Stage2Prehash,
  attachStage2InterpretiveReport,
  buildStage2AuthorshipMaturity,
  stage2ContainsRawText
} from '../app/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js';

function sentence(label, index, punctuation = '.') {
  return `The ${label} lane carries a measured cadence and returns through sentence ${index} with declared limits, stable function words, and bounded evidence${punctuation}`;
}

function lane(label, punctuationPolicy = () => '.') {
  return Array.from({ length: 24 }, (_, index) => sentence(label, index + 1, punctuationPolicy(index))).join(' ');
}

function promptHeavyLane(label) {
  return Array.from({ length: 24 }, (_, index) => `Signal signal signal signal ${label} returns through declared signal prompt language at window ${index + 1}, while structure remains measured and bounded.`).join(' ');
}

const stableSegments = {
  future_self: lane('future'),
  past_self: lane('past'),
  higher_self: lane('higher')
};

const first = await buildStage2AuthorshipMaturity({}, {
  segments: stableSegments,
  promptVocabularyByLane: {
    future_self: ['future prompt'],
    past_self: ['past prompt'],
    higher_self: ['higher prompt']
  }
});

const second = await buildStage2AuthorshipMaturity({}, {
  segments: stableSegments,
  promptVocabularyByLane: {
    higher_self: ['higher prompt'],
    past_self: ['past prompt'],
    future_self: ['future prompt']
  }
});

assert.equal(first.schema_version, 'td613.safe-harbor.authorship-maturity/v1');
assert.equal(first.window_policy_version, 'td613.safe-harbor.sentence-aware-window-policy/v1');
assert.equal(first.stability_receipt.stability_digest, second.stability_receipt.stability_digest, 'stability digest must survive key reordering');
assert.equal(first.stability_receipt.anti_flattery_audit.status, 'pass');
assert.equal(first.raw_text_included, false);
assert.equal(first.null_and_adversarial_posture.prompt_vocabulary_ablation_applied, true);
assert.equal(first.null_and_adversarial_posture.lexical_content_ngram_features_excluded, true);
assert.equal(first.null_and_adversarial_posture.external_identity_data_consumed, false);
assert.equal(first.stability_receipt.identity_probability, null);
assert.equal(first.stability_receipt.psychological_inference_performed, false);
assert.equal(first.stability_receipt.demographic_inference_performed, false);
assert.ok(['mature', 'comparative-with-instability'].includes(first.stability_receipt.status));

for (const laneKey of ['future_self', 'past_self', 'higher_self']) {
  const analysis = first.lane_analyses[laneKey];
  assert.equal(analysis.local_window_count, 3);
  assert.equal(analysis.non_overlapping_local_windows, true);
  assert.deepEqual(analysis.checkpoints.map((checkpoint) => checkpoint.target_words), [120, 240, 360]);
  assert.ok(analysis.checkpoints[0].observed_words >= 120);
  assert.ok(analysis.checkpoints[1].observed_words >= 240);
  assert.ok(analysis.checkpoints[2].observed_words >= 360);
  const coveredWords = analysis.local_windows.reduce((sum, window) => sum + window.observed_words, 0);
  assert.ok(coveredWords >= 360, 'the three canonical local windows must cover the mature 360-word field');
  assert.ok(coveredWords <= analysis.observed_words, 'canonical local windows may leave surplus text outside the Stage 2 comparison field');
  assert.ok(Object.values(analysis.feature_families).every((record) => record.evidence_id.startsWith('AEW-')));
}

assert.ok(Object.values(first.cross_lane_invariants.feature_families).every((record) => record.evidence_id.startsWith('AEC-')));
assert.ok(first.stability_receipt.evidence_traceability.feature_evidence_ids.length >= 20);
assert.equal(JSON.stringify(first).includes(stableSegments.future_self), false, 'raw entrant text must not enter Stage 2 evidence');

const promptDominated = await buildStage2AuthorshipMaturity({}, {
  segments: {
    future_self: promptHeavyLane('future'),
    past_self: promptHeavyLane('past'),
    higher_self: promptHeavyLane('higher')
  },
  promptVocabularyByLane: {
    future_self: ['signal'],
    past_self: ['signal'],
    higher_self: ['signal']
  }
});
assert.ok(promptDominated.stability_receipt.prompt_conditioned_feature_families.some((item) => item.endsWith(':lexical_shape')));
assert.ok(promptDominated.stability_receipt.blockers.includes('prompt-conditioned-feature-family-present'));
assert.equal(promptDominated.prompt_conditioned_features.lanes.future_self.classification, 'prompt-exposure-elevated');

const short = await buildStage2AuthorshipMaturity({}, {
  segments: {
    future_self: sentence('future', 1),
    past_self: sentence('past', 1),
    higher_self: sentence('higher', 1)
  }
});
assert.equal(short.stability_receipt.status, 'insufficient');
assert.ok(short.stability_receipt.blockers.includes('one-or-more-lanes-below-120-words'));
assert.match(short.bounded_interpretation.statement, /not recurrence-based authorship maturity/u);

const adversarial = await buildStage2AuthorshipMaturity({}, {
  segments: {
    future_self: lane('future', (index) => index < 8 ? '.' : index < 16 ? '?!' : '!!!'),
    past_self: lane('past', (index) => index % 2 ? '?' : '.'),
    higher_self: lane('higher', (index) => index < 12 ? '.' : '?')
  }
});
const adversarialStates = [
  ...Object.values(adversarial.within_lane_invariants.future_self.feature_families).map((record) => record.state),
  ...Object.values(adversarial.cross_lane_invariants.feature_families).map((record) => record.state)
];
assert.ok(adversarialStates.includes('unstable') || adversarialStates.includes('context-responsive'), 'adversarial register change must not be laundered into universal stability');

const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  authorship_evidence: {
    schema_version: 'td613.safe-harbor.authorship-evidence/v1'
  }
};
const populated = await applyGen3Stage2Prehash(packet, { segments: stableSegments });
assert.equal(populated.authorship_evidence.authorship_maturity.schema_version, 'td613.safe-harbor.authorship-maturity/v1');
assert.equal(stage2ContainsRawText(populated), false);

const reportPacket = {
  ...populated,
  forensic_authorship: {
    gen3_report_contract: {
      report_version: 'stage1-constitution/v1',
      sections: {
        authorship_signature: { status: 'awaiting-stage2-recurrence', content: {} },
        temporal_lane_portraits: { status: 'awaiting-stage2-recurrence', content: {} },
        productive_contradictions: { status: 'awaiting-stage2-recurrence', content: {} },
        evidentiary_fractures: { status: 'constituted', content: { fractures: [] } },
        interpretive_salience: { status: 'constituted-with-null-findings', content: {} }
      },
      interpretation_provenance: {
        interpretation_version: 'stage1-constitution/v1',
        raw_text_consumed: false,
        external_identity_data_consumed: false
      }
    }
  }
};
const interpreted = attachStage2InterpretiveReport(reportPacket);
assert.equal(interpreted.forensic_authorship.gen3_report_contract.report_version, 'stage2-authorship-maturity/v1');
assert.equal(interpreted.forensic_authorship.gen3_report_contract.sections.authorship_signature.status, 'measured-with-bounds');
assert.ok(interpreted.forensic_authorship.gen3_report_contract.sections.authorship_signature.content.evidence_ids.length > 0);
assert.equal(interpreted.forensic_authorship.gen3_report_contract.interpretation_provenance.raw_text_consumed, false);
assert.equal(interpreted.forensic_authorship.gen3_report_contract.interpretation_provenance.external_identity_data_consumed, false);

const alternate = await buildStage2AuthorshipMaturity({}, {
  segments: {
    future_self: lane('alternate', () => '?'),
    past_self: lane('alternate', () => '!'),
    higher_self: lane('alternate', () => '?!')
  }
});
assert.notEqual(first.stability_receipt.anti_sameness_digest, alternate.stability_receipt.anti_sameness_digest, 'entrant-swap audit must distinguish materially different recurrence fields');

console.log('safe-harbor-gen3-stage2-authorship-maturity: ok');
