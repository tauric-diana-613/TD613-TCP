import assert from 'node:assert/strict';

import { buildStage2AuthorshipMaturity } from '../app/safe-harbor/app/safe-harbor-gen3-authorship-maturity.js';
import {
  attachStage2ControlReport,
  auditEntrantSwapProfiles,
  buildControlledStage2AuthorshipMaturity,
  buildStage2ControlReceipt,
  controlledStage2ContainsRawText,
  STAGE2_CONTROL_POLICY,
  STAGE2_CONTROL_SCHEMA
} from '../app/safe-harbor/app/safe-harbor-gen3-stage2-controls.js';

function sentence(label, index, marker = 'However', punctuation = '.') {
  return `${marker} the ${label} lane carries source relations through bounded sentence ${index}, and the record returns with qualification, contrast, measured uncertainty, evidence order, and closure${punctuation}`;
}

function lane(label, marker = 'However', punctuation = '.') {
  return Array.from({ length: 34 }, (_, index) => sentence(label, index + 1, marker, punctuation)).join(' ');
}

const segments = {
  future_self: lane('future', 'However', '.'),
  past_self: lane('past', 'Although', '.'),
  higher_self: lane('higher', 'Therefore', '.')
};
const promptVocabularyByLane = {
  future_self: ['future'],
  past_self: ['past'],
  higher_self: ['higher']
};

const base = await buildStage2AuthorshipMaturity({}, { segments, promptVocabularyByLane });
const controlsA = await buildStage2ControlReceipt({}, base, {});
const controlsB = await buildStage2ControlReceipt({}, base, {});

assert.equal(controlsA.schema_version, STAGE2_CONTROL_SCHEMA);
assert.equal(controlsA.policy_version, STAGE2_CONTROL_POLICY);
assert.equal(controlsA.null_controls_digest, controlsB.null_controls_digest, 'control digest must be deterministic');
assert.match(controlsA.null_controls_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(controlsA.adverse_results_preserved, true);
assert.equal(controlsA.raw_text_included, false);
assert.equal(controlsA.psychological_inference_performed, false);
assert.equal(controlsA.demographic_inference_performed, false);
assert.equal(controlsA.external_identity_data_consumed, false);
assert.equal(controlsA.prompt_only_control.status, 'not-provided');
assert.equal(controlsA.entrant_swap_audit.status, 'not-provided');
assert.equal(controlsA.chronology_destruction.chronology_claimed, false);
assert.equal(controlsA.chronology_destruction.adverse_results_preserved, true);
assert.ok(['reduced', 'candidate-only', 'insufficient-evidence'].includes(controlsA.chronology_destruction.dynamic_signature_authority));
for (const laneId of ['future_self', 'past_self', 'higher_self']) {
  const chronology = controlsA.chronology_destruction.lanes[laneId];
  assert.equal(chronology.status, 'measured');
  assert.equal(chronology.local_window_count, 3);
  assert.ok(['chronology-sensitive-candidate', 'chronology-non-diagnostic'].includes(chronology.authority));
  assert.equal(chronology.raw_text_included, false);
}

const insufficientPromptControl = await buildStage2ControlReceipt({}, base, {
  promptControlSegments: {
    future_self: 'brief future prompt.',
    past_self: 'brief past prompt.',
    higher_self: 'brief higher prompt.'
  }
});
assert.equal(insufficientPromptControl.prompt_only_control.status, 'insufficient-control');
assert.equal(insufficientPromptControl.prompt_only_control.collision_state, 'not-assessed');
assert.match(insufficientPromptControl.prompt_only_control.control_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(insufficientPromptControl.prompt_only_control.adverse_results_preserved, true);

const collisionControlled = await buildControlledStage2AuthorshipMaturity({}, {
  segments,
  promptVocabularyByLane,
  promptControlSegments: segments,
  controlProfiles: {
    'topic-matched-human-synthetic': {
      control_class: 'topic-matched-human-synthetic',
      provenance: 'unmistakably synthetic test control',
      profile: base
    }
  },
  entrantSwapProfile: {
    provenance: 'unmistakably synthetic entrant-swap fixture',
    profile: base
  }
});

const collisionReceipt = collisionControlled.null_and_adversarial_posture.control_receipt;
assert.equal(collisionControlled.null_and_adversarial_posture.prompt_only_control_executed, true);
assert.equal(collisionControlled.null_and_adversarial_posture.chronology_destruction_executed, true);
assert.equal(collisionControlled.null_and_adversarial_posture.supplied_control_count, 1);
assert.equal(collisionControlled.null_and_adversarial_posture.adverse_results_preserved, true);
assert.equal(collisionReceipt.prompt_only_control.status, 'measured');
assert.equal(collisionReceipt.prompt_only_control.collision_state, 'prompt-only-collision');
assert.equal(collisionReceipt.supplied_controls['topic-matched-human-synthetic'].collision_state, 'collision-candidate');
assert.equal(collisionReceipt.entrant_swap_audit.status, 'collision');
assert.ok(collisionControlled.stability_receipt.control_blockers.includes('prompt-only-control-collision'));
assert.ok(collisionControlled.stability_receipt.control_blockers.includes('entrant-swap-collision'));
assert.ok(collisionControlled.stability_receipt.control_blockers.includes('declared-control-collision:topic-matched-human-synthetic'));
assert.ok(collisionControlled.bounded_interpretation.uncertainty.includes('prompt-only-control-collision'));
assert.match(collisionControlled.stability_receipt.pre_control_stability_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(collisionControlled.stability_receipt.null_controls_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(collisionControlled.stability_receipt.stability_digest, /^sha256:[0-9a-f]{64}$/u);
assert.notEqual(collisionControlled.stability_receipt.stability_digest, collisionControlled.stability_receipt.pre_control_stability_digest, 'executed controls must enter the Stage 2 stability receipt');
assert.equal(controlledStage2ContainsRawText(collisionControlled), false);
assert.equal(JSON.stringify(collisionControlled).includes(segments.future_self.slice(0, 100)), false);
assert.equal(JSON.stringify(collisionControlled).includes('civil identity proved'), false);

const sameControlledAgain = await buildControlledStage2AuthorshipMaturity({}, {
  segments,
  promptVocabularyByLane,
  promptControlSegments: {
    higher_self: segments.higher_self,
    future_self: segments.future_self,
    past_self: segments.past_self
  },
  controlProfiles: {
    'topic-matched-human-synthetic': {
      profile: base,
      provenance: 'unmistakably synthetic test control',
      control_class: 'topic-matched-human-synthetic'
    }
  },
  entrantSwapProfile: { profile: base, provenance: 'unmistakably synthetic entrant-swap fixture' }
});
assert.equal(collisionControlled.stability_receipt.stability_digest, sameControlledAgain.stability_receipt.stability_digest, 'control-inclusive stability receipt must survive option key reordering');
assert.equal(collisionControlled.null_and_adversarial_posture.control_receipt.null_controls_digest, sameControlledAgain.null_and_adversarial_posture.control_receipt.null_controls_digest);

const exactLaneSegments = {
  future_self: lane('shared'),
  past_self: lane('shared'),
  higher_self: lane('shared')
};
const exactLaneBase = await buildStage2AuthorshipMaturity({}, { segments: exactLaneSegments });
const exactLaneControls = await buildStage2ControlReceipt({}, exactLaneBase, {});
assert.equal(exactLaneControls.anti_sameness_audit.status, 'review-required');
assert.equal(exactLaneControls.anti_sameness_audit.exact_lane_feature_digest_duplicate, true);

const alternate = structuredClone(base);
for (const laneId of ['future_self', 'past_self', 'higher_self']) {
  for (const record of Object.values(alternate.within_lane_invariants[laneId].feature_families)) {
    record.score = 0;
    record.state = 'unstable';
  }
}
for (const record of Object.values(alternate.cross_lane_invariants.feature_families)) {
  record.score = 0;
  record.state = 'unstable';
}
const swapCollision = auditEntrantSwapProfiles(base, base);
const swapSeparated = auditEntrantSwapProfiles(base, alternate);
assert.equal(swapCollision.status, 'collision');
assert.equal(swapCollision.adverse_result_preserved, true);
assert.equal(swapSeparated.status, 'pass');
assert.ok(swapSeparated.comparison.normalized_distance > 0);

const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  authorship_evidence: { authorship_maturity: collisionControlled },
  forensic_authorship: {
    gen3_report_contract: {
      sections: {
        evidentiary_fractures: { status: 'measured', content: { fractures: [] } }
      },
      interpretation_provenance: {
        interpretation_version: 'stage2-authorship-maturity/v1',
        raw_text_consumed: false,
        external_identity_data_consumed: false
      }
    }
  }
};
const reported = attachStage2ControlReport(packet);
const report = reported.forensic_authorship.gen3_report_contract;
assert.ok(report.sections.evidentiary_fractures.content.fractures.includes('Prompt-only control collision is present.'));
assert.ok(report.sections.evidentiary_fractures.content.fractures.includes('Entrant-swap collision is present.'));
assert.equal(report.sections.evidentiary_fractures.content.stage2_control_receipt.adverse_results_preserved, true);
assert.equal(report.interpretation_provenance.null_controls_digest, collisionReceipt.null_controls_digest);
assert.equal(report.interpretation_provenance.adverse_results_preserved, true);
assert.equal(report.interpretation_provenance.raw_text_consumed, false);
assert.ok(['reduced', 'candidate-only', 'insufficient-evidence'].includes(report.interpretation_provenance.dynamic_signature_authority));
assert.equal(packet.forensic_authorship.gen3_report_contract.interpretation_provenance.null_controls_digest, undefined, 'report attachment must not mutate the source packet');

console.log('safe-harbor-gen3-stage2-controls: ok');
